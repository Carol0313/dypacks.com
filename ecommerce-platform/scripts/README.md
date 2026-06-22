# DY Packs 批量操作脚本

## 1. 批量导入产品 (bulk-import-products.ts)

### 前置条件

- 确保项目根目录的 `.env` 文件中有正确的 `DATABASE_URL`
- 确保已安装依赖：`pnpm install` (或 npm/yarn)

### 步骤

1. **准备产品数据**

   复制 `products-example.json`，按格式填写你的产品信息：

   ```bash
   cp scripts/products-example.json scripts/my-products.json
   ```

   关键字段说明：
   - `name` / `slug` / `price` / `categoryId`：**必填**
   - `slug`：URL-friendly 的唯一标识，如 `premium-matte-black-gift-box`
   - `images`：图片 URL 数组，脚本会自动转为 JSON 字符串存入数据库
   - `status`：`active`（上架）/ `draft`（草稿）/ `archived`（归档）
   - `featured`：`true` 会出现在首页 Featured Products 区块
   - `metaTitle` / `metaDescription`：SEO 用，建议每个产品都写

2. **确认 categoryId**

   先查看数据库里的分类 ID，确保 `categoryId` 正确：

   ```bash
   # 在 MySQL 客户端中执行
   SELECT id, name, slug FROM categories;
   ```

3. **执行导入**

   ```bash
   cd /www/wwwroot/new_dypacks
   npx tsx scripts/bulk-import-products.ts scripts/my-products.json
   ```

   脚本会自动：
   - 检查必填字段
   - 检查分类 ID 是否存在
   - 检查 slug 是否重复（重复的会跳过）
   - 输出导入结果统计

### 图片处理建议

批量导入时，图片建议先上传到阿里云 OSS（见下方第 3 节），然后将 URL 填入 `images` 数组。

---

## 2. 阿里云 OSS 图片迁移 (migrate-images-to-oss.ts)

当你建好阿里云 OSS Bucket 后，运行此脚本将现有图片从旧 CDN 迁移到 OSS。

### 前置条件

在 `.env` 文件中添加 OSS 配置：

```bash
# 阿里云 OSS（S3 兼容）
OSS_BUCKET=your-bucket-name
OSS_REGION=oss-cn-shanghai
OSS_ENDPOINT=https://oss-cn-shanghai.aliyuncs.com
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_ACCESS_KEY_SECRET=your-access-key-secret
OSS_PUBLIC_URL=https://your-bucket.oss-cn-shanghai.aliyuncs.com
```

> 💡 如果绑定了 CDN 加速域名（如 `https://images.dypacks.com`），`OSS_PUBLIC_URL` 填加速域名。

> 🔒 安全提示：AccessKey 不要写死在代码里！生产环境建议使用阿里云 [RAM 子账号](https://ram.console.aliyun.com/)，只给 OSS 读写权限。

### 执行迁移

```bash
cd /www/wwwroot/new_dypacks
npx tsx scripts/migrate-images-to-oss.ts
```

脚本会：

1. 扫描数据库中 `products.images` 和 `blog_posts.coverImage` 里的旧 CDN 图片
2. 自动下载并上传到阿里云 OSS
3. 更新数据库字段为新 URL
4. 输出 URL 映射表（用于手动替换 `client/src/lib/constants.ts` 中的 Banner 图片）

### 手动替换 Banner 图片

迁移脚本不会自动修改 `constants.ts`，你需要手动替换。脚本输出的映射表会告诉你新 URL 是什么。

```typescript
// client/src/lib/constants.ts
export const HERO_IMAGE =
  "https://your-bucket.oss-cn-shanghai.aliyuncs.com/banners/hero.jpg";
```

修改后重新构建：

```bash
pnpm build && pm2 restart dypacks
```

---

## 3. 阿里云 OSS 作为默认图床

接入完成后，Admin 后台上传图片会自动传到阿里云 OSS，而不是旧的 Manus CDN。

代码逻辑：`server/routers.ts` 中的 `uploadImage` 接口会优先检测 `OSS_ENABLED`，如果配置了 OSS 就上传到 OSS，否则回退到旧存储。

---

## 4. 批量更新/导出产品（待扩展）

如需批量更新价格、库存等，可以：

- 直接操作 MySQL：`UPDATE products SET price = '9.99' WHERE categoryId = 1;`
- 或基于本脚本改造，写 `bulk-update-products.ts`
