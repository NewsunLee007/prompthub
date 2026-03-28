# PromptHub 部署指南

## Neon PostgreSQL 配置

### 1. 创建 Neon 账户和数据库

1. 访问 [Neon](https://neon.tech) 并注册账户
2. 创建新项目
3. 创建数据库（或使用默认的 `neondb`）
4. 在 Dashboard 中获取连接字符串

### 2. 配置 Vercel 环境变量

在 Vercel 项目设置中，添加以下环境变量：

```
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
NEXTAUTH_URL=https://promt.newsunenglish.com
NEXTAUTH_SECRET=your-random-secret-key-here
```

**注意**：
- `DATABASE_URL` 从 Neon Dashboard 复制
- `NEXTAUTH_SECRET` 使用随机字符串，可以通过 `openssl rand -base64 32` 生成

### 3. 部署步骤

#### 本地准备

1. 安装依赖：
```bash
npm install
```

2. 生成 Prisma 客户端：
```bash
npx prisma generate
```

3. 推送到 GitHub：
```bash
git add .
git commit -m "配置 Neon PostgreSQL"
git push
```

#### Vercel 部署

1. Vercel 会自动检测到 GitHub 推送并重新部署
2. 首次部署时，Prisma 会自动创建数据库表

### 4. 数据库迁移（如需要）

如果数据库表未自动创建，可以在本地运行：

```bash
# 设置生产环境数据库 URL
export DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# 推送 schema 到数据库
npx prisma db push
```

### 5. 验证部署

访问 https://promt.newsunenglish.com 验证：
- 页面是否正常加载
- 提示词列表是否显示
- 登录功能是否正常
- 上传提示词是否正常

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

## 本次修复内容

### 2026-03-28

1. **数据库切换**: SQLite → PostgreSQL (Neon)
   - 修改 `prisma/schema.prisma` 中的 datasource provider
   - 更新 `.env` 配置说明

2. **修复页面崩溃问题**:
   - 修复 `SessionProvider.tsx` - 移除错误的 mounted 检查
   - 修复 `app/page.tsx` - 添加 API 错误处理
   - 修复 `app/api/likes/route.ts` - 使用 findFirst 替代 findUnique
   - 修复 `app/api/favorites/route.ts` - 使用 findFirst 替代 findUnique
