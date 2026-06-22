# 部署清单 — 关键词布局 + 博客图片修复

> 生成时间：2026-06-21
> 目标服务器：`/www/wwwroot/new_dypacks/`
> 目标域名：https://www.dypacks.com

---

## 一、本次更新的文件

### 新增
- `client/src/lib/seo.ts` — SEO Hook 与关键词配置中心
- `SEO-KEYWORD-MAPPING.md` — 关键词布局策略文档
- `DEPLOY-CHECKLIST.md` — 本文件

### 修改
- `client/index.html` — 默认 title/description/og/twitter/hreflang
- `client/src/pages/Home.tsx` — 首页 SEO、面包屑、关键词内容区
- `client/src/pages/Products.tsx` — 分类页动态 title/description/H1、产品列表 SEO 内容区
- `client/src/pages/ProductDetail.tsx` — 产品页 SEO 改用 usePageSEO、FAQ schema、图片 alt 优化
- `client/src/pages/Blog.tsx` — 博客列表 SEO、CollectionPage schema
- `client/src/pages/BlogPost.tsx` — 博客详情 SEO、BlogPosting schema
- `client/src/pages/About.tsx` — About 页 SEO、面包屑
- `client/src/pages/Contact.tsx` — Contact 页 SEO、面包屑
- `client/src/i18n/locales/{en,es,ru,tr}.json` — 新增 SEO 内容翻译键
- `AGENTS.md` — 补充 SEO 相关说明

---

## 二、部署命令

在服务器项目目录执行：

```bash
# 1. 进入项目目录
cd /www/wwwroot/new_dypacks

# 2. 拉取/同步代码（根据你的实际情况选择 git pull 或手动上传）
git pull origin main

# 3. 安装依赖
pnpm install

# 4. 修复博客图片 URL（若 Blogs/ 目录在服务器上存在）
npx tsx scripts/fix-blog-image-urls.ts

# 5. 构建前端 + 后端
pnpm build

# 6. 数据库迁移（如 schema 无变更可跳过）
pnpm db:push

# 7. 重启 PM2
pm2 restart dypacks

# 8. 健康检查
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000
```

---

## 三、验证清单

部署后请检查：

- [ ] 首页标题为：`Custom Packaging Manufacturer | Premium Boxes by DY Packs`
- [ ] 首页 description 包含 "custom packaging manufacturer in China"
- [ ] `/api/sitemap.xml` 可正常访问
- [ ] 分类页 `/products?category=gift-boxes` 标题为：`Custom Gift Boxes & Luxury Rigid Boxes Wholesale | DY Packs`
- [ ] 产品详情页标题格式：`{Product Name} | Custom Packaging | DY Packs`
- [ ] 博客详情页包含 `BlogPosting` JSON-LD
- [ ] 博客正文图片不再 404（检查浏览器 Network 面板）
- [ ] PM2 进程状态正常：`pm2 list`
- [ ] 网站可正常访问：https://www.dypacks.com

---

## 四、回滚（如需要）

```bash
cd /www/wwwroot/new_dypacks
git reset --hard HEAD~1   # 或指定上一个稳定 commit
pnpm build
pm2 restart dypacks
```

---

## 五、后续建议

1. **Google Search Console**：提交 sitemap `https://www.dypacks.com/api/sitemap.xml`
2. **核心网页指标**：用 PageSpeed Insights 测试移动端 LCP
3. **内容更新**：按 `SEO-KEYWORD-MAPPING.md` 的 90 天计划每周发布博客
4. **外链建设**：注册 ThomasNet、Kompass、Made-in-China、LinkedIn Company Page
