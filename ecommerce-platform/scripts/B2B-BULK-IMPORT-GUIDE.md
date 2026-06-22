# B2B 定制包装产品批量导入指南

> 本网站是**定制包装 B2B 平台**，不是零售电商。
> 每个"产品"实际上是一款**可定制的包装方案/案例**，用来展示工厂的能力和款式。

---

## 一、先整理你的图片（最关键的一步）

你提到图片很分散，建议先按这个结构整理好：

### 本地文件夹结构

```
📁 产品图片/
├── 📁 01-礼盒类/
│   ├── 磁吸翻盖礼盒-哑光黑/
│   │   ├── 01-主图.jpg
│   │   ├── 02-打开状态.jpg
│   │   ├── 03-细节-磁吸扣.jpg
│   │   └── 04-应用场景.jpg
│   ├── 抽屉式礼盒-烫金/
│   │   ├── 01-主图.jpg
│   │   └── ...
│   └── ...
├── 📁 02-化妆品包装/
│   ├── 口红管纸盒-银卡纸/
│   │   ├── 01-主图.jpg
│   │   └── ...
│   └── ...
├── 📁 03-食品包装/
├── 📁 04-珠宝盒/
└── 📁 05-奢侈品包装/
```

### 命名规范建议

| 文件名        | 用途                         |
| ------------- | ---------------------------- |
| `01-主图`     | 列表页和详情首图，最重要     |
| `02-打开状态` | 展示内部结构                 |
| `03-细节-*`   | 工艺细节（烫金、UV、凹凸等） |
| `04-应用场景` | 装产品后的效果图             |
| `05-尺寸图`   | 带标注的平面图（可选）       |

> 💡 **建议**：每个产品**3-5张图**就够了，不要太多。主图一定要高清、白底或场景图。

---

## 二、批量上传到阿里云 OSS

### 方式 1：阿里云 OSS 控制台（适合少量）

登录 [阿里云 OSS 控制台](https://oss.console.aliyun.com/) → 进入你的 Bucket → 新建文件夹 → 上传。

### 方式 2：ossutil 命令行（适合大量，推荐）

1. 下载安装 ossutil：

   ```bash
   wget http://gosspublic.alicdn.com/ossutil/1.7.19/ossutil64
   chmod 755 ossutil64
   ./ossutil64 config
   # 按提示输入 AccessKeyID、AccessKeySecret、Endpoint
   ```

2. 批量上传：

   ```bash
   # 把整个"产品图片"文件夹上传到 OSS 的 products/ 目录
   ./ossutil64 cp -r ./产品图片/ oss://你的bucket名称/products/
   ```

3. 上传后的 OSS 地址格式：
   ```
   https://你的bucket.oss-cn-shanghai.aliyuncs.com/products/01-礼盒类/磁吸翻盖礼盒-哑光黑/01-主图.jpg
   ```

> ⚠️ **注意**：上传后建议开启 OSS 图片处理，URL 后面加 `?x-oss-process=image/resize,w_1200/quality,q_85/format,webp` 可以自动压缩。

---

## 三、准备产品数据（JSON 格式）

复制 `scripts/products-example.json`，为每个产品填写信息。

### B2B 定制包装的产品描述模板

**shortDescription**（一句话卖点，显示在产品卡片上）：

```
支持定制尺寸、Logo烫金、内衬颜色 | MOQ 500pcs
```

**description**（详情页长描述，建议按下面模板写）：

```markdown
【产品概述】
这是一款高端磁吸翻盖礼盒，采用1200g灰板裱糊，表面覆触感膜，...

【定制选项】

- 尺寸：完全按客户需求定制（长×宽×高 mm）
- 材质：灰板/白卡/瓦楞可选，克重800g-1800g
- 表面处理：覆膜（哑膜/亮膜/触感膜）、UV、烫金/烫银、凹凸压印
- 印刷：CMYK四色印刷 / 潘通专色
- 内衬：EVA植绒 / 海绵 / 纸卡插格
- 配件：磁吸扣、丝带、手提袋

【适用场景】
化妆品套装、高端食品礼盒、珠宝首饰盒、企业商务礼品

【打样周期】
3-5个工作日

【大货周期】
15-25个工作日（视数量而定）
```

### 价格填写建议

既然是定制产品，`price` 不是最终售价，而是**参考起价**（比如基础款500个的单价）：

```json
{
  "price": "2.50",
  "minOrderQty": 500
}
```

产品卡片会显示 **"From $2.50 · MOQ: 500 pcs"**，客户就知道大概价位和起订量。

---

## 四、执行批量导入

### 前置检查

```bash
# 登录服务器
cd /www/wwwroot/new_dypacks

# 确认数据库里的分类 ID
npx tsx -e "
import { getDb } from './server/db';
import { categories } from './drizzle/schema';
const db = await getDb();
const cats = await db.select().from(categories);
console.log(cats.map(c => ({ id: c.id, name: c.name, slug: c.slug })));
"
```

### 执行导入

```bash
npx tsx scripts/bulk-import-products.ts scripts/my-products.json
```

---

## 五、导入后检查清单

- [ ] 访问 `/products` 确认产品显示正常
- [ ] 点进产品详情页，确认图片、描述、MOQ 都正确
- [ ] 在 `/admin` 后台把重点产品标记为 `featured`（首页展示）
- [ ] 确认 `metaTitle` 和 `metaDescription` 已填写（SEO 用）
- [ ] 重新构建部署：`pnpm build && pm2 restart dypacks`

---

## 六、效率技巧

### 用 Excel 管理产品数据，再转 JSON

如果你习惯用 Excel，可以这样：

1. Excel 表格列：名称、slug、分类ID、参考价、MOQ、短描述、长描述、图片URL1、图片URL2...
2. 填完后另存为 CSV
3. 用在线工具把 CSV 转成 JSON 数组
4. 微调 JSON 格式后导入

### 快速生成 slug

slug 就是 URL 里的英文标识，建议规则：

```
产品中文名：磁吸翻盖礼盒-哑光黑
slug：magnetic-rigid-box-matte-black

产品中文名：口红管银卡纸盒
slug：lipstick-silver-card-paper-box
```

全小写，用连字符 `-` 连接，不要有特殊字符。

---

## 七、产品数量建议

| 分类       | 建议产品数 | 说明                       |
| ---------- | ---------- | -------------------------- |
| 礼盒类     | 6-10 款    | 翻盖、抽屉、书型、手提等   |
| 化妆品包装 | 6-10 款    | 面霜盒、口红管、套装礼盒等 |
| 食品包装   | 4-6 款     | 月饼盒、茶叶罐、巧克力盒等 |
| 珠宝盒     | 4-6 款     | 戒指盒、项链盒、手表盒等   |
| 奢侈品包装 | 4-6 款     | 高端磁吸盒、木盒、皮盒等   |

**总计 25-40 款产品**就能撑起一个专业的 B2B 包装网站。

不要贪多，每款产品图片精、描述到位，比100款粗糙产品更有说服力。
