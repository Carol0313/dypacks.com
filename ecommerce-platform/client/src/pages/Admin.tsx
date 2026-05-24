import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  Package, ClipboardList, Users, BookOpen, Plus, Pencil, Trash2,
  ArrowLeft, LayoutDashboard, Settings,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

// ─── Product Form ────────────────────────────────────────
function ProductForm({ onSuccess, initial }: { onSuccess: () => void; initial?: any }) {
  const categoriesQuery = trpc.category.list.useQuery();
  const categories = categoriesQuery.data ?? [];
  const createMutation = trpc.product.create.useMutation({ onSuccess: () => { toast.success("Product saved"); onSuccess(); } });
  const updateMutation = trpc.product.update.useMutation({ onSuccess: () => { toast.success("Product updated"); onSuccess(); } });

  const [form, setForm] = useState({
    name: initial?.name || "",
    slug: initial?.slug || "",
    shortDescription: initial?.shortDescription || "",
    description: initial?.description || "",
    price: initial?.price || "",
    compareAtPrice: "",
    categoryId: initial?.categoryId?.toString() || "",
    images: initial?.images || "[]",
    featured: initial?.featured || false,
    status: initial?.status || "draft",
    stock: initial?.stock?.toString() || "0",
    minOrderQty: initial?.minOrderQty?.toString() || "1",
    metaTitle: initial?.metaTitle || "",
    metaDescription: initial?.metaDescription || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      categoryId: Number(form.categoryId),
      stock: Number(form.stock),
      minOrderQty: Number(form.minOrderQty),
      compareAtPrice: undefined,
      status: form.status as "active" | "draft" | "archived",
    };
    if (initial?.id) {
      updateMutation.mutate({ id: initial.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const generateSlug = () => {
    setForm({ ...form, slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Product Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} onBlur={() => !form.slug && generateSlug()} required /></div>
        <div><Label>Slug *</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></div>
      </div>
      <div><Label>Short Description</Label><Input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} /></div>
      <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Reference Price *</Label><Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="e.g. 8.50" required /></div>
        <div>
          <Label>Category *</Label>
          <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div><Label>Image URLs (JSON array)</Label><Textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} rows={2} placeholder='["https://..."]' /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>MOQ (Min Order Qty)</Label><Input type="number" value={form.minOrderQty} onChange={(e) => setForm({ ...form, minOrderQty: e.target.value })} /></div>
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox checked={form.featured} onCheckedChange={(c) => setForm({ ...form, featured: !!c })} />
        <Label>Featured Product</Label>
      </div>
      <Separator />
      <div><Label>Meta Title (SEO)</Label><Input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} /></div>
      <div><Label>Meta Description (SEO)</Label><Textarea value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} rows={2} /></div>
      <Button type="submit" className="w-full bg-gold text-charcoal-dark hover:bg-gold-dark">
        {initial?.id ? "Update Product" : "Create Product"}
      </Button>
    </form>
  );
}

// ─── Category Form ───────────────────────────────────────
function CategoryForm({ onSuccess, initial }: { onSuccess: () => void; initial?: any }) {
  const createMutation = trpc.category.create.useMutation({ onSuccess: () => { toast.success("Category saved"); onSuccess(); } });
  const updateMutation = trpc.category.update.useMutation({ onSuccess: () => { toast.success("Category updated"); onSuccess(); } });
  const [form, setForm] = useState({
    name: initial?.name || "", slug: initial?.slug || "", description: initial?.description || "", sortOrder: initial?.sortOrder?.toString() || "0",
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, sortOrder: Number(form.sortOrder) };
    if (initial?.id) updateMutation.mutate({ id: initial.id, ...data });
    else createMutation.mutate(data);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
      <div><Label>Slug *</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></div>
      <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
      <div><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} /></div>
      <Button type="submit" className="w-full bg-gold text-charcoal-dark hover:bg-gold-dark">
        {initial?.id ? "Update" : "Create"}
      </Button>
    </form>
  );
}

// ─── Blog Form ───────────────────────────────────────────
function BlogForm({ onSuccess, initial }: { onSuccess: () => void; initial?: any }) {
  const createMutation = trpc.blog.create.useMutation({ onSuccess: () => { toast.success("Post saved"); onSuccess(); } });
  const updateMutation = trpc.blog.update.useMutation({ onSuccess: () => { toast.success("Post updated"); onSuccess(); } });
  const [form, setForm] = useState({
    title: initial?.title || "", slug: initial?.slug || "", excerpt: initial?.excerpt || "",
    content: initial?.content || "", coverImage: initial?.coverImage || "",
    status: initial?.status || "draft", metaTitle: initial?.metaTitle || "", metaDescription: initial?.metaDescription || "",
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, status: form.status as "published" | "draft" };
    if (initial?.id) updateMutation.mutate({ id: initial.id, ...data });
    else createMutation.mutate(data);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
      <div><Label>Slug *</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></div>
      <div><Label>Excerpt</Label><Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} /></div>
      <div><Label>Content (Markdown) *</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} required /></div>
      <div><Label>Cover Image URL</Label><Input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} /></div>
      <div>
        <Label>Status</Label>
        <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div><Label>Meta Title (SEO)</Label><Input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} /></div>
      <div><Label>Meta Description (SEO)</Label><Textarea value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} rows={2} /></div>
      <Button type="submit" className="w-full bg-gold text-charcoal-dark hover:bg-gold-dark">
        {initial?.id ? "Update Post" : "Create Post"}
      </Button>
    </form>
  );
}

// ─── Main Admin Page ─────────────────────────────────────
export default function Admin() {
  const { user, isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();

  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<any>(null);
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);
  const [editBlog, setEditBlog] = useState<any>(null);

  const productsQuery = trpc.product.list.useQuery({ limit: 100 });
  const categoriesQuery = trpc.category.list.useQuery();
  const ordersQuery = trpc.order.listAll.useQuery({});
  const usersQuery = trpc.adminUser.list.useQuery();
  const blogsQuery = trpc.blog.listAll.useQuery({});

  const deleteProductMutation = trpc.product.delete.useMutation({
    onSuccess: () => { utils.product.list.invalidate(); toast.success("Product deleted"); },
  });
  const deleteCategoryMutation = trpc.category.delete.useMutation({
    onSuccess: () => { utils.category.list.invalidate(); toast.success("Category deleted"); },
  });
  const updateOrderMutation = trpc.order.updateStatus.useMutation({
    onSuccess: () => { utils.order.listAll.invalidate(); toast.success("Order updated"); },
  });
  const updateRoleMutation = trpc.adminUser.updateRole.useMutation({
    onSuccess: () => { utils.adminUser.list.invalidate(); toast.success("Role updated"); },
  });
  const deleteBlogMutation = trpc.blog.delete.useMutation({
    onSuccess: () => { utils.blog.listAll.invalidate(); toast.success("Post deleted"); },
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-20 text-center flex-1">
          <Settings className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
          <p className="text-sm text-muted-foreground mb-6">You need admin privileges to access this page.</p>
          <Link href="/"><Button>Go Home</Button></Link>
        </div>
      </div>
    );
  }

  const products = productsQuery.data?.items ?? [];
  const categories = categoriesQuery.data ?? [];
  const orders = ordersQuery.data?.items ?? [];
  const users_list = usersQuery.data ?? [];
  const blogs = blogsQuery.data?.items ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container py-8 flex-1">
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="h-6 w-6 text-gold-dark" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Admin Dashboard
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Products", value: productsQuery.data?.total ?? 0, icon: Package },
            { label: "Categories", value: categories.length, icon: Package },
            { label: "Orders", value: ordersQuery.data?.total ?? 0, icon: ClipboardList },
            { label: "Users", value: users_list.length, icon: Users },
            { label: "Blog Posts", value: blogsQuery.data?.total ?? 0, icon: BookOpen },
          ].map((stat, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-4 text-center">
                <stat.icon className="h-5 w-5 mx-auto text-gold-dark mb-1" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Products</h2>
              <Dialog open={productDialogOpen} onOpenChange={(o) => { setProductDialogOpen(o); if (!o) setEditProduct(null); }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gold text-charcoal-dark hover:bg-gold-dark"><Plus className="mr-1.5 h-4 w-4" />Add Product</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle>{editProduct ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
                  <ProductForm initial={editProduct} onSuccess={() => { setProductDialogOpen(false); setEditProduct(null); utils.product.list.invalidate(); }} />
                </DialogContent>
              </Dialog>
            </div>
            <Card className="border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-sm">{p.name}</TableCell>
                      <TableCell>${Number(p.price).toFixed(2)}</TableCell>
                      <TableCell>{p.stock}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{p.status}</Badge></TableCell>
                      <TableCell>{p.featured ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => { setEditProduct(p); setProductDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this product?")) deleteProductMutation.mutate({ id: p.id }); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {products.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No products yet</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Categories</h2>
              <Dialog open={categoryDialogOpen} onOpenChange={(o) => { setCategoryDialogOpen(o); if (!o) setEditCategory(null); }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gold text-charcoal-dark hover:bg-gold-dark"><Plus className="mr-1.5 h-4 w-4" />Add Category</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editCategory ? "Edit Category" : "Add Category"}</DialogTitle></DialogHeader>
                  <CategoryForm initial={editCategory} onSuccess={() => { setCategoryDialogOpen(false); setEditCategory(null); utils.category.list.invalidate(); }} />
                </DialogContent>
              </Dialog>
            </div>
            <Card className="border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Sort Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                      <TableCell>{c.sortOrder}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => { setEditCategory(c); setCategoryDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete?")) deleteCategoryMutation.mutate({ id: c.id }); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {categories.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No categories yet</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <h2 className="text-lg font-semibold mb-4">Orders</h2>
            <Card className="border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium text-sm">{o.orderNumber}</TableCell>
                      <TableCell>${Number(o.total).toFixed(2)}</TableCell>
                      <TableCell>{o.paymentMethod}</TableCell>
                      <TableCell>
                        <Select value={o.status} onValueChange={(v) => updateOrderMutation.mutate({ id: o.id, status: v as any })}>
                          <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["pending", "paid", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/order-confirmation/${o.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No orders yet</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <h2 className="text-lg font-semibold mb-4">Users</h2>
            <Card className="border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users_list.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email || "—"}</TableCell>
                      <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Select value={u.role} onValueChange={(v) => updateRoleMutation.mutate({ userId: u.id, role: v as any })}>
                          <SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">user</SelectItem>
                            <SelectItem value="admin">admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Blog Posts</h2>
              <Dialog open={blogDialogOpen} onOpenChange={(o) => { setBlogDialogOpen(o); if (!o) setEditBlog(null); }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gold text-charcoal-dark hover:bg-gold-dark"><Plus className="mr-1.5 h-4 w-4" />New Post</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle>{editBlog ? "Edit Post" : "New Blog Post"}</DialogTitle></DialogHeader>
                  <BlogForm initial={editBlog} onSuccess={() => { setBlogDialogOpen(false); setEditBlog(null); utils.blog.listAll.invalidate(); }} />
                </DialogContent>
              </Dialog>
            </div>
            <Card className="border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogs.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium text-sm">{b.title}</TableCell>
                      <TableCell><Badge variant="outline">{b.status}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => { setEditBlog(b); setBlogDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete?")) deleteBlogMutation.mutate({ id: b.id }); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {blogs.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No blog posts yet</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
