#!/bin/bash
# =============================================================================
# 一键部署脚本 for www.dypacks.com
# 适用环境：宝塔面板 + 阿里云服务器 + Ubuntu/CentOS
# =============================================================================

set -e  # 遇到错误立即退出

# --------------------------- 配置区（按需修改） ---------------------------
DOMAIN="www.dypacks.com"
PROJECT_DIR="/www/wwwroot/new_dypacks"
DB_NAME="new_dypacks_db"
DB_USER="new_dypacks_user"
DB_PASSWORD="rdJrRmhNkssEBm6m"          # ← 数据库密码
JWT_SECRET="RxBRqBw8SwqSjpWP4InH3EveStII9ToX/PqZNV1o9fbyalrit5e/34VWIqj49qLww3vLRy5JO9Ds9tBZ1qDSsQ=="           # ← 随机密钥
NODE_VERSION="20"
PM2_NAME="dypacks"
# --------------------------------------------------------------------------

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必填变量
check_config() {
    if [ -z "$DB_PASSWORD" ]; then
        log_error "请先在脚本中填写 DB_PASSWORD（数据库密码）"
        exit 1
    fi
    if [ -z "$JWT_SECRET" ]; then
        log_error "请先在脚本中填写 JWT_SECRET（随机密钥）"
        exit 1
    fi
}

# 检查命令是否存在
check_command() {
    if ! command -v "$1" &> /dev/null; then
        return 1
    fi
    return 0
}

# 安装 Node.js
install_node() {
    log_info "检查 Node.js 版本..."
    if check_command node; then
        CURRENT_NODE=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$CURRENT_NODE" -ge "${NODE_VERSION%%.*}" ]; then
            log_info "Node.js 已安装: $(node -v)"
            return
        fi
    fi

    log_warn "Node.js 未安装或版本过低，正在安装 Node.js ${NODE_VERSION}..."
    if check_command apt; then
        # Ubuntu/Debian
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
        apt-get install -y nodejs
    elif check_command yum; then
        # CentOS/RHEL
        curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | bash -
        yum install -y nodejs
    else
        log_error "不支持的操作系统，请手动安装 Node.js ${NODE_VERSION}"
        exit 1
    fi
    log_info "Node.js 安装完成: $(node -v)"
}

# 安装 pnpm
install_pnpm() {
    log_info "检查 pnpm..."
    if ! check_command pnpm; then
        log_warn "pnpm 未安装，正在安装..."
        npm install -g pnpm
    fi
    log_info "pnpm 版本: $(pnpm -v)"
}

# 安装 PM2
install_pm2() {
    log_info "检查 PM2..."
    if ! check_command pm2; then
        log_warn "PM2 未安装，正在安装..."
        npm install -g pm2
    fi
    log_info "PM2 版本: $(pm2 -v)"
}

# 创建数据库（如果通过宝塔已创建，此步骤可跳过）
setup_database() {
    log_info "检查 MySQL 数据库..."
    if ! check_command mysql; then
        log_warn "未检测到 mysql 命令，请确保已在宝塔中创建数据库：${DB_NAME}"
        return
    fi

    # 尝试连接数据库（需要 root 密码，这里仅作提示）
    log_info "数据库配置："
    log_info "  数据库名: ${DB_NAME}"
    log_info "  用户名: ${DB_USER}"
    log_info "  连接地址: localhost:3306"
    log_warn "请确保已在宝塔面板中创建数据库！"
}

# 写入环境变量
setup_env() {
    log_info "配置环境变量..."
    cd "${PROJECT_DIR}"

    cat > .env << EOF
NODE_ENV=production
DATABASE_URL=mysql://${DB_USER}:${DB_PASSWORD}@localhost:3306/${DB_NAME}
JWT_SECRET=${JWT_SECRET}
VITE_APP_URL=https://${DOMAIN}
VITE_APP_ID=dypacks_ecommerce
EOF

    log_info ".env 文件已生成"
}

# 安装依赖
install_deps() {
    log_info "安装项目依赖..."
    cd "${PROJECT_DIR}"
    pnpm install
}

# 构建项目
build_project() {
    log_info "开始构建项目..."
    cd "${PROJECT_DIR}"
    pnpm build
    log_info "构建完成！"
}

# 数据库迁移
db_migrate() {
    log_info "执行数据库迁移..."
    cd "${PROJECT_DIR}"
    pnpm db:push
}

# 启动/重启 PM2
start_pm2() {
    log_info "启动/重启 PM2 服务..."
    cd "${PROJECT_DIR}"

    if pm2 describe "${PM2_NAME}" > /dev/null 2>&1; then
        log_info "检测到已有进程，执行重启..."
        pm2 restart "${PM2_NAME}"
    else
        log_info "首次启动..."
        pm2 start dist/index.js --name "${PM2_NAME}"
    fi

    pm2 save
    log_info "PM2 进程状态:"
    pm2 list
}

# 生成 Nginx 配置
setup_nginx() {
    log_info "生成 Nginx 配置参考..."

    NGINX_CONF="/www/server/panel/vhost/nginx/${DOMAIN}.conf"
    
    if [ -f "$NGINX_CONF" ]; then
        log_warn "Nginx 配置文件已存在，备份到 ${NGINX_CONF}.bak"
        cp "$NGINX_CONF" "${NGINX_CONF}.bak.$(date +%Y%m%d%H%M%S)"
    fi

    log_info "请在宝塔面板 → 网站 → ${DOMAIN} → 配置文件中添加以下内容："
    echo ""
    echo "===== Nginx 配置 ====="
    cat << 'EOF'

    # 静态资源缓存
    location /assets/ {
        alias /www/wwwroot/new_dypacks/dist/public/assets/;
        expires 30d;
        access_log off;
    }

    # 反向代理到 Node.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

EOF
    echo "===== 配置结束 ====="
    echo ""
    log_warn "请手动将上述配置粘贴到宝塔对应站点的 Nginx 配置中"
}

# 最终检查
health_check() {
    log_info "进行健康检查..."
    sleep 2

    if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 | grep -q "200\|302"; then
        log_info "✅ 本地服务运行正常 (http://127.0.0.1:3000)"
    else
        log_error "❌ 本地服务未响应，请检查 PM2 日志: pm2 logs ${PM2_NAME}"
    fi

    echo ""
    log_info "========================================"
    log_info "部署流程执行完毕！"
    log_info "网站地址: https://${DOMAIN}"
    log_info "========================================"
    echo ""
    log_warn "后续操作清单："
    echo "  1. 在宝塔面板中配置 Nginx（见上方配置）"
    echo "  2. 申请 SSL 证书（宝塔 → SSL → Let's Encrypt）"
    echo "  3. 确保阿里云安全组放行 80/443 端口"
    echo ""
}

# =============================================================================
# 主流程
# =============================================================================
main() {
    echo "========================================"
    echo "  dypacks.com 一键部署脚本"
    echo "========================================"
    echo ""

    check_config
    install_node
    install_pnpm
    install_pm2
    setup_database
    setup_env
    install_deps
    build_project
    db_migrate
    start_pm2
    setup_nginx
    health_check
}

# 执行
main
