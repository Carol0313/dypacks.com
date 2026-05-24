#!/bin/bash
# =============================================================================
# 一键更新脚本 for www.dypacks.com
# 当代码有更新时，执行此脚本自动重新构建并重启
# =============================================================================

set -e

PROJECT_DIR="/www/wwwroot/new_dypacks"
PM2_NAME="dypacks"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

cd "${PROJECT_DIR}"

echo "========================================"
echo "  dypacks.com 一键更新"
echo "========================================"
echo ""

# 拉取最新代码（如果是 git 仓库）
if [ -d ".git" ]; then
    log_info "拉取最新代码..."
    git pull
fi

# 安装依赖（防止 package.json 有更新）
log_info "安装/更新依赖..."
pnpm install

# 重新构建
log_info "重新构建项目..."
pnpm build

# 数据库迁移（如果有 schema 变更）
log_info "执行数据库迁移..."
pnpm db:push || log_warn "数据库迁移可能已是最新"

# 重启服务
log_info "重启 PM2 服务..."
pm2 restart "${PM2_NAME}"

# 健康检查
sleep 2
if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 | grep -q "200\|302"; then
    log_info "✅ 更新成功，服务运行正常！"
else
    log_error "❌ 服务未响应，请检查: pm2 logs ${PM2_NAME}"
    exit 1
fi

echo ""
echo "========================================"
echo "  更新完成！"
echo "  访问: https://www.dypacks.com"
echo "========================================"
