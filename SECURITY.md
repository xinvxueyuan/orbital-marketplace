# 安全策略

## 支持版本

Orbital 处于活跃开发中。安全修复仅针对最新发布版本提供。

| 版本   | 是否支持安全修复 |
|--------|------------------|
| 1.0.x  | ✅               |
| < 1.0  | ❌               |

## 报告漏洞

我们非常重视 Orbital 的安全问题。如果你发现安全漏洞，请**不要**通过公开 issue 报告，而是按以下流程私下披露：

1. 优先使用 GitHub 私密漏洞报告：
   前往 <https://github.com/xinvxueyuan/orbital-marketplace/security/advisories/new> 提交。
2. 如无法使用上述方式，发送邮件至维护者：在 commit 历史或个人资料中联系 [@xinvxueyuan](https://github.com/xinvxueyuan)。

报告时请尽量包含：

- 受影响的版本（commit SHA 或 tag）
- 复现步骤与最小可复现示例
- 影响范围与可能的攻击场景
- 建议的修复方向（如有）

## 响应 SLA

- 收到报告后会在 **3 个工作日内**确认收到。
- 初步评估会在 **7 个工作日内**给出，并告知是否接受为安全问题。
- 修复发布后会在发布说明中致谢（除非报告者要求匿名）。

## 披露政策

我们采用**负责任披露**：在修复发布并给用户合理升级时间后，可公开讨论该漏洞细节。请在修复发布前不要公开披露。

## 范围

**在范围内：**

- 后端 FastAPI 服务中的注入、越权、状态机绕过（如发卡兑换/作废）等问题
- 前端 SPA 中的 XSS、敏感数据泄露等问题
- CI/CD、依赖供应链相关问题

**不在范围内：**

- 本仓库为演示项目，单用户演示模式下的「资料库」多账户隔离问题（已知为演示限制）
- 对未启用认证的演示部署进行的常规扫描报告
- 社会工程学攻击

## 已知告警说明

以下 Dependabot 告警经评估为**不适用**于本仓库，已在 GitHub UI 中标注（如 token 权限允许则自动 dismiss）：

| 告警 | 受影响范围 | 不适用原因 |
|------|-----------|-----------|
| [GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2) — React Router RSC Mode CSRF Bypass | `react-router@7.12.0 - 8.2.0` | 本仓库使用 `BrowserRouter`（客户端 SPA 模式），未启用 RSC（React Server Components）。该 CSRF 仅在 RSC 模式下可被利用。修复需升级到 `react-router@8.3+`（要求 React 19 + Node 22+），留待后续 React 19 迁移。 |

## 联系方式

- 维护者：[@xinvxueyuan](https://github.com/xinvxueyuan)
- 组织：xinvStar.inc
