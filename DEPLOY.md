# PromptHub 部署指南

## 部署方案

使用 **Vercel** 进行部署（推荐，免费且简单）

---

## 步骤 1: 准备代码

### 1.1 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 创建新仓库，命名为 `prompthub`
3. 选择 "Public" 或 "Private"

### 1.2 推送代码到 GitHub

在项目目录下执行：

```bash
cd /Users/newsunlee/WorkBuddy/20260328132036/prompthub

# 初始化 git（如果还没初始化）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit - PromptHub v1.0"

# 添加远程仓库（替换为你的用户名）
git remote add origin https://github.com/你的用户名/prompthub.git

# 推送
git push -u origin main
```

---

## 步骤 2: 部署到 Vercel

### 2.1 注册/登录 Vercel

1. 访问 https://vercel.com
2. 用 GitHub 账号登录

### 2.2 导入项目

1. 点击 "Add New Project"
2. 选择你的 `prompthub` 仓库
3. 配置项目：
   - **Framework Preset**: Next.js
   - **Build Command**: `prisma generate && next build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 2.3 配置环境变量

在 Vercel 项目设置中添加：

| 变量名 | 值 |
|--------|-----|
| `DATABASE_URL` | `file:./dev.db` |
| `NEXTAUTH_SECRET` | 随机字符串（用于加密） |
| `NEXTAUTH_URL` | `https://www.newsunenglish.com` |

生成随机密钥：
```bash
openssl rand -base64 32
```

### 2.4 部署

点击 "Deploy" 按钮，等待部署完成。

---

## 步骤 3: 配置自定义域名

### 3.1 在 Vercel 中添加域名

1. 进入 Vercel 项目 → Settings → Domains
2. 输入 `www.newsunenglish.com`
3. 点击 "Add"

### 3.2 在域名服务商处配置 DNS

登录你的域名服务商（如阿里云、腾讯云、GoDaddy 等），添加以下 DNS 记录：

**方案 A: CNAME 记录（推荐）**

| 类型 | 主机记录 | 记录值 |
|------|----------|--------|
| CNAME | www | cname.vercel-dns.com |

**方案 B: A 记录**

| 类型 | 主机记录 | 记录值 |
|------|----------|--------|
| A | www | 76.76.21.21 |

> 注意：Vercel 会自动提供 SSL 证书（HTTPS）

### 3.3 等待 DNS 生效

通常需要 5-30 分钟，最长 48 小时。

---

## 步骤 4: 验证部署

1. 访问 `https://www.newsunenglish.com`
2. 测试各项功能：
   - 登录/注册
   - 上传提示词
   - 浏览/搜索
   - 点赞/收藏

---

## 重要说明

### 关于数据库

当前使用 **SQLite** 文件数据库：
- ✅ 优点：简单，无需额外配置
- ⚠️ 限制：Vercel 是无服务器架构，SQLite 文件在每次部署后会重置

**解决方案：**

#### 方案 1: 使用 Vercel Postgres（推荐）

1. 在 Vercel 项目中添加 Postgres 数据库
2. 更新 `DATABASE_URL` 环境变量
3. 重新部署

#### 方案 2: 使用 Neon/Supabase（免费）

1. 注册 https://neon.tech 或 https://supabase.com
2. 创建 PostgreSQL 数据库
3. 获取连接字符串
4. 更新 `.env` 和 Vercel 环境变量
5. 修改 `prisma/schema.prisma`：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

6. 重新生成迁移并部署

---

## 备选部署方案

如果不想用 Vercel，还可以选择：

### 方案 B: 阿里云/腾讯云服务器

1. 购买云服务器（ECS/CVM）
2. 安装 Node.js、PM2
3. 使用 Nginx 反向代理
4. 配置 SSL 证书

### 方案 C: Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 故障排查

### 问题 1: 数据库数据丢失
**原因**: Vercel 无服务器架构，SQLite 文件不持久化
**解决**: 迁移到 PostgreSQL

### 问题 2: 构建失败
**检查**:
- 环境变量是否正确设置
- `prisma/schema.prisma` 配置是否正确
- 构建命令是否为 `prisma generate && next build`

### 问题 3: 域名无法访问
**检查**:
- DNS 记录是否正确添加
- 等待 DNS 传播（最长 48 小时）
- 在 Vercel 中检查域名状态

---

## 联系方式

如有问题，请查看：
- Vercel 文档: https://vercel.com/docs
- Next.js 部署: https://nextjs.org/docs/deployment
