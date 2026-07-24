# 更新日志

本项目所有重要变更均会记录在本文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 计划中

- CRUD 与发卡状态机的自动化测试套件
- `/apps` 分页与全文搜索
- 认证与多租户组织
- `order.completed` / `card.issued` / `card.redeemed` 的 Webhook 投递
- 生产部署指南（反向代理 + 容器编排）

## [1.0.0] - 2025-07-24

### 新增

- 发卡（vending）机制：卡密库存、批量生成、购买时自动发卡、兑换、作废，基于 `available → sold → redeemed → void` 状态机
- 文档站：6 个分类、15 篇分节文章（快速开始、应用接入、API 参考、订阅与授权、发卡系统、常见问题）
- FastAPI 后端：`/api/v1` 下覆盖 health、apps、docs、cards、orders、library 的 RESTful 接口
- 幂等种子脚本 `python -m backend.seed`，从 `src/data` 抄录数据并复刻前端 LCG 卡密码生成
- 全局 `OrbitalError` 异常处理器，统一返回 `{ "error", "message" }`
- 多阶段 Dockerfile 与 docker-compose，单服务交付前后端
- 仓库设施：双许可（MIT OR Apache-2.0）、CONTRIBUTING、SECURITY、CODE_OF_CONDUCT、CHANGELOG
- GitHub Actions 工作流：CI 构建、前端 CI、Python CI、release、stale、issue triage、workflow 清理、docs

### 变更

- 前端路由迁移至 React Router v7（库模式 SPA）
- 使用 Framer Motion 实现路由过渡动画
- 前端开发服务器（Vite）代理 `/api` → 后端 `:8000`

[Unreleased]: https://github.com/xinvxueyuan/orbital/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/xinvxueyuan/orbital/releases/tag/v1.0.0
