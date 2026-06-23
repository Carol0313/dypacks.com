import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import { useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { usePageSEO } from "@/lib/seo";

export default function Addresses() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();
  const addressQuery = trpc.address.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const addresses = addressQuery.data ?? [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    address: "",
    zipCode: "",
    isDefault: false,
  });

  const createMutation = trpc.address.create.useMutation({
    onSuccess: () => {
      utils.address.list.invalidate();
      setDialogOpen(false);
      toast.success(t("addresses.addressSaved"));
      resetForm();
    },
  });
  const updateMutation = trpc.address.update.useMutation({
    onSuccess: () => {
      utils.address.list.invalidate();
      setDialogOpen(false);
      toast.success(t("addresses.addressUpdated"));
      resetForm();
    },
  });
  const deleteMutation = trpc.address.delete.useMutation({
    onSuccess: () => {
      utils.address.list.invalidate();
      toast.success(t("addresses.addressDeleted"));
    },
  });

  const resetForm = () => {
    setEditId(null);
    setForm({
      fullName: "",
      phone: "",
      country: "",
      state: "",
      city: "",
      address: "",
      zipCode: "",
      isDefault: false,
    });
  };

  const openEdit = (addr: any) => {
    setEditId(addr.id);
    setForm({
      fullName: addr.fullName,
      phone: addr.phone,
      country: addr.country,
      state: addr.state,
      city: addr.city,
      address: addr.address,
      zipCode: addr.zipCode,
      isDefault: addr.isDefault,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) updateMutation.mutate({ id: editId, ...form });
    else createMutation.mutate(form);
  };

  usePageSEO({
    title: t("addresses.myAddresses") + " | DY Packs",
    canonicalPath: "/addresses",
    noIndex: true,
  });

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-8 flex-1 max-w-3xl mx-auto">
        <Link
          href="/account"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("addresses.backToAccount")}
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1
            className="text-2xl md:text-3xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t("addresses.myAddresses")}
          </h1>
          <Dialog
            open={dialogOpen}
            onOpenChange={open => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-gold text-charcoal-dark hover:bg-gold-dark"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                {t("addresses.addAddress")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editId
                    ? t("addresses.editAddress")
                    : t("addresses.addNewAddress")}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t("addresses.fullName")}</Label>
                    <Input
                      value={form.fullName}
                      onChange={e =>
                        setForm({ ...form, fullName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>{t("addresses.phone")}</Label>
                    <Input
                      value={form.phone}
                      onChange={e =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>{t("addresses.country")}</Label>
                    <Input
                      value={form.country}
                      onChange={e =>
                        setForm({ ...form, country: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>{t("addresses.stateProvince")}</Label>
                    <Input
                      value={form.state}
                      onChange={e =>
                        setForm({ ...form, state: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>{t("addresses.city")}</Label>
                    <Input
                      value={form.city}
                      onChange={e => setForm({ ...form, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>{t("addresses.zipCode")}</Label>
                    <Input
                      value={form.zipCode}
                      onChange={e =>
                        setForm({ ...form, zipCode: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>{t("addresses.streetAddress")}</Label>
                  <Input
                    value={form.address}
                    onChange={e =>
                      setForm({ ...form, address: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={form.isDefault}
                    onCheckedChange={v =>
                      setForm({ ...form, isDefault: v === true })
                    }
                  />
                  <Label className="text-sm font-normal">
                    {t("addresses.setAsDefault")}
                  </Label>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gold text-charcoal-dark hover:bg-gold-dark"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {editId
                    ? t("addresses.updateAddress")
                    : t("addresses.saveAddress")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">
              {t("addresses.noAddressesSaved")}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {t("addresses.addShippingAddress")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr: any) => (
              <Card key={addr.id} className="border-border/50">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">
                          {addr.fullName}
                        </span>
                        {addr.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            {t("addresses.default")}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {addr.address}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {addr.city}, {addr.state} {addr.zipCode}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {addr.country}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("addresses.phoneLabel")} {addr.phone}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(addr)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => deleteMutation.mutate({ id: addr.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
