#!/bin/bash
# 宝塔终端更新 www.dypacks.com
# 在服务器执行: bash /www/wwwroot/new_dypacks/ecommerce-platform/update.sh

set -euo pipefail

ROOT="/www/wwwroot/new_dypacks"
APP="${ROOT}/ecommerce-platform"
PM2_NAME="dypacks"
ASSETS_OLD="${ROOT}/dist/public/assets/"
ASSETS_NEW="${APP}/dist/public/assets/"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

if ! command -v node >/dev/null 2>&1 || ! command -v git >/dev/null 2>&1; then
  if [ -f /etc/profile ]; then
    # 宝塔终端有时没带上 Node 的 PATH
    # shellcheck disable=SC1091
    source /etc/profile
  fi
fi

cd "${ROOT}"
log_info "拉取 GitHub main..."
if ! git remote get-url github >/dev/null 2>&1; then
  git remote add github https://github.com/Carol0313/dypacks.com.git
fi
GIT_TERMINAL_PROMPT=0 git fetch github main

# 服务器上另有未跟踪文件时，Git 会拒绝切换。先移走和目标版本重名的文件。
git ls-tree -r --name-only github/main | sort > /tmp/dypacks-target.txt
git ls-files --others --exclude-standard | sort > /tmp/dypacks-untracked.txt
mkdir -p /root/dypacks-blocked
while IFS= read -r f; do
  [ -z "${f}" ] && continue
  mkdir -p "/root/dypacks-blocked/$(dirname "${f}")"
  mv "${f}" "/root/dypacks-blocked/${f}"
  log_warn "已移走未跟踪文件: ${f}"
done < <(comm -12 /tmp/dypacks-target.txt /tmp/dypacks-untracked.txt)

git checkout -B deploy github/main
log_info "当前版本: $(git rev-parse --short HEAD) $(git log -1 --format=%s)"

cd "${APP}"
if [ ! -f .env ] && [ -f "${ROOT}/.env" ]; then
  cp "${ROOT}/.env" "${APP}/.env"
  log_info "已把根目录 .env 复制到 ecommerce-platform/.env"
fi
if [ ! -f .env ]; then
  log_error "缺少 ${APP}/.env，请先放好 DATABASE_URL 和 JWT_SECRET"
  exit 1
fi

if command -v corepack >/dev/null 2>&1; then
  corepack enable
  corepack prepare pnpm@10.4.1 --activate
fi
if ! command -v pnpm >/dev/null 2>&1; then
  log_error "未找到 pnpm。在宝塔软件商店确认 Node.js 已安装，然后执行: npm install -g pnpm@10.4.1"
  exit 1
fi

log_info "安装依赖..."
pnpm install --frozen-lockfile --ignore-workspace

log_info "执行数据库迁移..."
set -a
# shellcheck disable=SC1091
source .env
set +a
pnpm exec drizzle-kit migrate

log_info "构建..."
pnpm build

log_info "重启 PM2（工作目录改为 ecommerce-platform）..."
if pm2 describe "${PM2_NAME}" >/dev/null 2>&1; then
  pm2 delete "${PM2_NAME}"
fi
NODE_ENV=production pm2 start dist/index.js --name "${PM2_NAME}" --cwd "${APP}"
pm2 save

updated_nginx=0
if compgen -G "/www/server/panel/vhost/nginx/*.conf" >/dev/null; then
  for conf in /www/server/panel/vhost/nginx/*.conf; do
    if grep -q "${ASSETS_OLD}" "${conf}"; then
      cp "${conf}" "${conf}.bak.$(date +%Y%m%d%H%M%S)"
      sed -i "s#${ASSETS_OLD}#${ASSETS_NEW}#g" "${conf}"
      log_info "已更新 Nginx 静态目录: ${conf}"
      updated_nginx=1
    fi
  done
fi
if [ "${updated_nginx}" -eq 1 ] && [ -x /www/server/nginx/sbin/nginx ]; then
  /www/server/nginx/sbin/nginx -t
  /www/server/nginx/sbin/nginx -s reload
  log_info "Nginx 已重载"
fi

sleep 2
HTTP_CODE="$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/order || true)"
if [ "${HTTP_CODE}" = "200" ] || [ "${HTTP_CODE}" = "302" ]; then
  log_info "更新成功，/order 返回 HTTP ${HTTP_CODE}"
else
  log_error "服务未响应 (HTTP ${HTTP_CODE})，请执行: pm2 logs ${PM2_NAME} --lines 80"
  exit 1
fi

echo ""
echo "========================================"
echo "  更新完成: https://www.dypacks.com/order"
echo "========================================"
