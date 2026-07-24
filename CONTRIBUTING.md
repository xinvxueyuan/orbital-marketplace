# 贡献指南

感谢你对 Orbital 项目的关注！项目欢迎代码、测试、文档、Bug 报告与功能建议。提交时请保持改动小而清晰，以便维护者快速理解意图、影响与验证结果。

在开始之前，请先阅读 [README.md](README.md)、[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) 与 [SECURITY.md](SECURITY.md)。

## 开发环境

### 前置依赖

- Node.js 20+（前端）
- Python 3.11+（后端）
- git

### 步骤

1. 克隆仓库并进入目录：

   ```bash
   git clone https://github.com/xinvxueyuan/orbital-marketplace.git
   cd orbital
   ```

2. 安装前端依赖：

   ```bash
   npm install
   ```

3. 安装后端依赖（建议在虚拟环境中）：

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r backend/requirements.txt
   ```

4. 写入种子数据并启动后端：

   ```bash
   python -m backend.seed
   uvicorn backend.app.main:app --reload
   ```

5. 另开一个终端启动前端：

   ```bash
   npm run dev
   ```

   前端运行在 `http://localhost:5173`，会代理 `/api` 到 `http://localhost:8000`。

## 分支策略

- `main`：稳定主干，始终可构建、可部署。所有发布从 `main` 打 tag。
- 功能开发：`feature/<short-description>`
- 修复：`fix/<short-description>`
- 热修复：`hotfix/<short-description>`

请从最新的 `main` 切出分支，完成后向 `main` 发起 Pull Request。

## 提交规范

本项目使用 **gitmoji + Conventional Commits** 组合格式：

```
<emoji> <type>(<scope>): <subject>
```

示例：

```
✨ feat(vending): 支持批量作废卡密
🐛 fix(cards): 修复兑换后状态未持久化
📝 docs(readme): 补充 API 概览表
♻️ refactor(crud): 抽取卡密状态校验
✅ test(cards): 覆盖 available→sold→redeemed 流转
🔧 chore(deps): 升级 sqlalchemy 到 2.0.36
```

常用 type：`feat`、`fix`、`docs`、`style`、`refactor`、`test`、`chore`、`perf`、`ci`、`build`。常用 emoji 见 [gitmoji.dev](https://gitmoji.dev/)。

提交要求：

- 一个提交只做一件事，subject 用祈使句、首字母小写（中文不强制）、不超过 72 字符。
- 不要在提交里夹带无关的格式化或重构。
- 不要提交 `backend/orbital.db`、`dist/`、`node_modules/`、`.env` 等生成物与密钥。

## Pull Request 流程

1. 确认你的分支基于最新 `main`，必要时 `git rebase`。
2. 本地验证：
   - 前端：`npm run build` 通过
   - 后端：`python -m backend.seed` 无报错，`uvicorn` 能正常启动
3. 按 [PR 模板](.github/PULL_REQUEST_TEMPLATE.md) 填写摘要、动机、变更类型与检查清单，并关联相关 issue。
4. 维护者会在 CI 通过后进行 review，请响应评论并按需追加提交（不要 force-push 已被 review 的提交，除非要求 rebase）。
5. 合并后由维护者打 tag 触发 release 工作流。

## 代码风格

### 前端

- 使用项目已有的 ESLint / Prettier 思路（2 空格缩进、单引号、尾逗号）。`.editorconfig` 已配置。
- 组件用 JSX，遵循现有 `src/components`、`src/pages` 的命名与目录约定。
- 新增依赖前在 PR 描述中说明理由；优先复用现有依赖。

### 后端

- 使用 **ruff** 进行 lint/format，行宽 100（见 `pyproject.toml`）。
- 类型注解遵循现有代码风格，路由层用 Pydantic v2 schema 做校验。
- 数据访问放在 `backend/app/crud/`，路由只做参数解析与调用。

## 测试要求

- 新增/修改 CRUD 逻辑或发卡状态机时，需在 `backend/tests/` 下补充测试，并用 `pytest` 通过。
- CI 会运行 `npm run build`（前端）与 `python -m backend.seed` + 冒烟检查（后端），请确保本地通过后再提交。

## 行为准则

参与本项目即代表你同意遵守 [Contributor Covenant 2.1](CODE_OF_CONDUCT.md)。请保持尊重与建设性。
