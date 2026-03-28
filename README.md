# PromptHub - AI 提示词共享平台

一个面向 AI 用户的提示词共享平台，支持上传、浏览、收藏和复用各类 AI 提示词。

## 技术架构

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

## 技术栈

- **前端**: Next.js 14 + React + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL (Neon)
- **ORM**: Prisma
- **认证**: NextAuth.js
- **代码托管**: GitHub
- **部署**: Vercel
- **域名**: Cloudflare

## 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 添加必要的环境变量

# 运行开发服务器
npm run dev
```

访问 http://localhost:3000

## 部署

详见 [DEPLOY.md](./DEPLOY.md)

## 功能特性

- ✅ 用户登录/注册（邮箱登录）
- ✅ 提示词上传（标题、分类、标签、描述、内容）
- ✅ 提示词浏览（列表、筛选、搜索、分页）
- ✅ 提示词详情查看
- ✅ 一键复制提示词
- ✅ 点赞功能
- ✅ 收藏功能
- ✅ 用户个人中心

## 项目文档

- [设计文档](../Design.md) - 项目架构和设计规范
- [部署指南](./DEPLOY.md) - 完整的部署流程
