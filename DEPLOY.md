# PromptHub 部署指南

## 部署架构

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   GitHub    │────▶│   Vercel    │────▶│   Neon DB   │
│  (代码托管)  │     │  (自动部署)  │     │ (PostgreSQL)│
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │  Cloudflare │
                    │ (域名解析)   │
                    └─────────────┘
```

## 1. GitHub 代码托管

### 创建仓库
1. 登录 GitHub，创建新仓库（如 `prompthub`）
2. 设置为 Public 或 Private
3. 初始化 README（可选）

### 推送代码
```bash
# 初始化本地仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yourusername/prompthub.git

# 提交代码
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 分支保护（推荐）
- 设置 `main` 分支保护规则
- 要求 Pull Request 才能合并
- 开启状态检查

## 2. Neon PostgreSQL 配置

### 创建 Neon 账户和数据库

1. 访问 [Neon](https://neon.tech) 并注册账户
2. 创建新项目
3. 创建数据库（或使用默认的 `neondb`）
4. 在 Dashboard 中获取连接字符串

## 3. Vercel 自动部署

### 导入项目
1. 登录 [Vercel](https://vercel.com)
2. 点击 "Add New Project"
3. 导入 GitHub 仓库
4. 选择 `prompthub` 仓库

### 配置环境变量

在 Vercel 项目设置 → Environment Variables 中，添加：

```
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-random-secret-key-here
```

**注意**：
- `DATABASE_URL` 从 Neon Dashboard 复制
- `NEXTAUTH_SECRET` 使用随机字符串，可以通过 `openssl rand -base64 32` 生成
- `NEXTAUTH_URL` 使用你的自定义域名

### 自动部署
- 每次推送到 `main` 分支，Vercel 自动构建部署
- 每次 Pull Request 会生成预览链接

## 4. Cloudflare 域名解析

### 添加域名到 Cloudflare
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 点击 "Add a Site"
3. 输入你的域名（如 `promt.newsunenglish.com`）
4. 选择免费计划

### 配置 DNS 记录

添加 CNAME 记录指向 Vercel：

| Type | Name | Target | TTL |
|------|------|--------|-----|
| CNAME | @ | cname.vercel-dns.com | Auto |
| CNAME | www | cname.vercel-dns.com | Auto |

或者使用 A 记录：

| Type | Name | Target | TTL |
|------|------|--------|-----|
| A | @ | 76.76.21.21 | Auto |

### 配置 SSL/TLS
1. 进入 SSL/TLS 设置
2. 选择 "Full (strict)" 模式
3. 开启 "Always Use HTTPS"

### 更新域名服务器
1. 在域名注册商处，将 NS 记录改为 Cloudflare 提供的名称服务器
2. 等待 DNS 传播（通常几分钟到几小时）

### Vercel 自定义域名配置
1. 在 Vercel 项目设置 → Domains
2. 添加你的自定义域名
3. Vercel 会自动验证 DNS 配置

## 5. 数据库迁移

首次部署后，如果数据库表未自动创建，可以在本地运行：

```bash
# 设置生产环境数据库 URL
export DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# 推送 schema 到数据库
npx prisma db push
```

## 6. 验证部署

访问你的域名验证：
- 页面是否正常加载
- 提示词列表是否显示
- 登录功能是否正常
- 上传提示词是否正常
- SSL 证书是否正常（HTTPS）

## 故障排查

### 页面加载后显示错误

1. 检查 Vercel Functions 日志
2. 确认 `DATABASE_URL` 环境变量已正确设置
3. 确认数据库表已创建

### 数据库连接错误

1. 确认 Neon 数据库允许所有 IP 访问（或配置 Vercel IP 白名单）
2. 检查连接字符串是否正确
3. 确认 SSL 模式设置为 `require`

### 认证问题

1. 确认 `NEXTAUTH_SECRET` 已设置
2. 确认 `NEXTAUTH_URL` 与生产域名一致
3. 确认 Cloudflare SSL 模式为 "Full (strict)"

### 域名解析问题

1. 检查 Cloudflare DNS 记录是否正确指向 Vercel
2. 确认域名服务器已改为 Cloudflare 的 NS
3. 等待 DNS 传播完成（可能需要几分钟到几小时）
4. 在 Vercel 中确认域名已验证

### SSL/HTTPS 问题

1. 确认 Cloudflare SSL/TLS 设置为 "Full (strict)"
2. 检查 Vercel 是否已自动配置 SSL 证书
3. 确认 "Always Use HTTPS" 已开启

## 更新记录

### 2026-03-28

1. **数据库切换**: SQLite → PostgreSQL (Neon)
2. **添加 GitHub + Cloudflare + Vercel 完整部署流程**
3. **修复页面崩溃问题**
4. **配置自定义域名和 SSL**
