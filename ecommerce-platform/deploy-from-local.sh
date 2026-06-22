#!/bin/bash
# =============================================================================
# DY Packs 一键部署脚本（在服务器 SSH 中运行）
# 作用：拉取最新代码、修复博客图片、构建、重启服务
# =============================================================================
set -e

PROJECT_DIR="/www/wwwroot/new_dypacks"
PM2_NAME="dypacks"

echo "========================================"
echo "  DY Packs 部署脚本"
echo "========================================"

# 1. 进入项目目录
cd "${PROJECT_DIR}"
echo "[1/7] 进入项目目录: ${PROJECT_DIR}"

# 2. 拉取最新代码（请根据你的实际情况修改分支）
echo "[2/7] 拉取最新代码..."
if [ -d .git ]; then
  git pull
else
  echo "⚠️  未检测到 git 仓库，请手动上传代码后跳过此步骤"
fi

# 3. 安装依赖
echo "[3/7] 安装依赖..."
pnpm install

# 4. 修复博客图片 URL
echo "[4/7] 修复博客图片 URL..."
npx tsx scripts/fix-blog-image-urls.ts

# 5. 构建项目
echo "[5/7] 构建项目..."
pnpm build

# 6. 数据库迁移（如 schema 无变更可安全执行）
echo "[6/7] 数据库迁移..."
pnpm db:push

# 7. 重启 PM2
echo "[7/7] 重启 PM2 服务..."
if pm2 describe "${PM2_NAME}" > /dev/null 2>&1; then
  pm2 restart "${PM2_NAME}"
else
  pm2 start dist/index.js --name "${PM2_NAME}"
fi
pm2 save

echo ""
echo "========================================"
echo "  部署完成！"
echo "========================================"
echo ""
sleep 2

# 健康检查
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ]; then
  echo "✅ 本地服务运行正常 (HTTP $HTTP_CODE)"
else
  echo "⚠️  本地服务未响应 (HTTP $HTTP_CODE)，请检查 PM2 日志: pm2 logs ${PM2_NAME}"
fi

echo ""
echo "请验证以下页面："
echo "  - 首页: https://www.dypacks.com/"
echo "  - 站点地图: https://www.dypacks.com/api/sitemap.xml"
echo "  - 博客: https://www.dypacks.com/blog"
