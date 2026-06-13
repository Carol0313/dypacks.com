import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Building2,
  Phone,
  Mail,
  PackageCheck,
  Globe2,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "请输入用户名"),
  password: z.string().min(1, "请输入密码"),
});

const inquirySchema = z.object({
  companyName: z.string().min(1, "请输入公司名称"),
  contactName: z.string().min(1, "请输入联系人"),
  phone: z.string().min(1, "请输入联系电话"),
  email: z.string().email("请输入有效邮箱").optional().or(z.literal("")),
  product: z.string().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;
type InquiryValues = z.infer<typeof inquirySchema>;

const highlights = [
  {
    icon: PackageCheck,
    title: "定制包装解决方案",
    desc: "纸袋、纸盒、无纺布袋、精装礼盒，一站式定制",
  },
  {
    icon: Globe2,
    title: "出口欧美经验",
    desc: "服务全球 B2B 客户，熟悉欧美包装标准",
  },
  {
    icon: ShieldCheck,
    title: "品质认证保障",
    desc: "FSC、ISO 等认证，支持验厂与样品确认",
  },
  {
    icon: Clock,
    title: "快速报价响应",
    desc: "24 小时内提供精准报价与生产周期",
  },
];

export default function BaiduPromotionLoginPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"inquiry" | "login">("inquiry");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "DY Packs 定制包装 - 百度推广专享 | 上海逗悦实业";

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", "DY Packs 百度推广专属通道，专业定制纸袋、纸盒、无纺布袋、精装礼盒。24 小时内快速报价，助力品牌出海。");
    setMeta("robots", "noindex, nofollow");

    return () => {
      document.title = previousTitle;
      setMeta("robots", "index, follow");
    };
  }, []);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const inquiryForm = useForm<InquiryValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { companyName: "", contactName: "", phone: "", email: "", product: "" },
  });

  const submitInquiry = trpc.inquiry.submitAnonymous.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      inquiryForm.reset();
      toast.success("提交成功，我们会尽快与您联系！");
    },
    onError: (err) => {
      toast.error(err.message || "提交失败，请稍后重试");
    },
  });

  const onLoginSubmit = async (values: LoginValues) => {
    try {
      const res = await fetch("/api/auth/local-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("登录成功");
        setLocation(data.redirect || "/admin");
      } else {
        toast.error(data.error || "登录失败");
      }
    } catch {
      toast.error("网络错误，请重试");
    }
  };

  const onInquirySubmit = (values: InquiryValues) => {
    submitInquiry.mutate({
      contactName: values.contactName,
      companyName: values.companyName,
      email: values.email || "no-email@placeholder.com",
      phone: values.phone,
      product: values.product || "百度推广落地页咨询",
      details: `来源：百度推广落地页。感兴趣产品：${values.product || "未填写"}`,
      source: "baidu_promotion_login",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      {/* Header */}
      <header className="w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[oklch(0.42_0.02_75)] text-[oklch(0.98_0_0)]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-[oklch(0.22_0.02_75)]">
                DY Packs
              </h1>
              <p className="text-xs text-muted-foreground">上海逗悦实业有限公司</p>
            </div>
          </div>
          <div className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
            <span className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              400-xxx-xxxx
            </span>
            <span className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              carolni@dypacks.com
            </span>
          </div>
        </div>
      </header>

      {/* Hero + Form */}
      <main className="container mx-auto px-4 py-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Left: Value Prop */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-block rounded-full bg-[oklch(0.95_0.03_85)] px-3 py-1 text-xs font-medium text-[oklch(0.32_0.02_75)]">
                百度推广专属通道
              </span>
              <h2 className="font-heading text-3xl font-bold leading-tight text-[oklch(0.22_0.02_75)] sm:text-4xl lg:text-5xl">
                专业定制包装
                <br />
                助力品牌出海
              </h2>
              <p className="max-w-lg text-base text-muted-foreground sm:text-lg">
                DY Packs 专注于 B2B 包装定制，为全球客户提供高品质、可持续的包装解决方案。
                留下您的需求，我们将在 24 小时内联系您。
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <item.icon className="mb-2 h-6 w-6 text-[oklch(0.72_0.16_85)]" />
                  <h3 className="font-semibold text-[oklch(0.22_0.02_75)]">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form Card */}
          <div className="mx-auto w-full max-w-md lg:mx-0 lg:ml-auto">
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex rounded-lg bg-muted p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("inquiry")}
                    className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                      activeTab === "inquiry"
                        ? "bg-white text-[oklch(0.22_0.02_75)] shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    立即询价
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                      activeTab === "login"
                        ? "bg-white text-[oklch(0.22_0.02_75)] shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    管理员登录
                  </button>
                </div>
                <CardTitle className="mt-4 text-center text-xl">
                  {activeTab === "inquiry" ? "免费获取包装报价" : "管理员登录"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeTab === "inquiry" ? (
                  submitted ? (
                    <div className="py-8 text-center">
                      <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-[oklch(0.72_0.16_85)]" />
                      <h3 className="text-xl font-semibold text-[oklch(0.22_0.02_75)]">
                        提交成功
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        我们的团队将在 24 小时内与您联系，请保持电话畅通。
                      </p>
                      <Button
                        variant="outline"
                        className="mt-6"
                        onClick={() => setSubmitted(false)}
                      >
                        再次提交
                      </Button>
                    </div>
                  ) : (
                    <Form {...inquiryForm}>
                      <form
                        onSubmit={inquiryForm.handleSubmit(onInquirySubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={inquiryForm.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>公司名称</FormLabel>
                              <FormControl>
                                <Input placeholder="请输入公司名称" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={inquiryForm.control}
                            name="contactName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>联系人</FormLabel>
                                <FormControl>
                                  <Input placeholder="姓名" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={inquiryForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>联系电话</FormLabel>
                                <FormControl>
                                  <Input placeholder="手机号" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={inquiryForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>邮箱（选填）</FormLabel>
                              <FormControl>
                                <Input placeholder="example@company.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={inquiryForm.control}
                          name="product"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>感兴趣的产品（选填）</FormLabel>
                              <FormControl>
                                <Input placeholder="纸袋 / 纸盒 / 礼盒 / 其他" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          className="w-full btn-gold"
                          disabled={submitInquiry.isPending}
                        >
                          {submitInquiry.isPending ? (
                            "提交中..."
                          ) : (
                            <span className="flex items-center justify-center gap-1">
                              立即获取报价 <ArrowRight className="h-4 w-4" />
                            </span>
                          )}
                        </Button>
                      </form>
                    </Form>
                  )
                ) : (
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>用户名</FormLabel>
                            <FormControl>
                              <Input placeholder="请输入用户名" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>密码</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="请输入密码" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginForm.formState.isSubmitting}
                      >
                        {loginForm.formState.isSubmitting ? "登录中..." : "登录"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Trust bar */}
      <section className="border-t bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground sm:gap-10">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-[oklch(0.72_0.16_85)]" />
              十年包装定制经验
            </span>
            <span className="flex items-center gap-1">
              <Globe2 className="h-4 w-4 text-[oklch(0.72_0.16_85)]" />
              服务欧美、中东、东南亚市场
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-[oklch(0.72_0.16_85)]" />
              24 小时快速响应
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[oklch(0.22_0.02_75)] py-6 text-center text-sm text-white/70">
        <p>© {new Date().getFullYear()} DY Packs. 上海逗悦实业有限公司 版权所有</p>
      </footer>
    </div>
  );
}
