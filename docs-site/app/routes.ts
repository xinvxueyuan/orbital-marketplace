import { type RouteConfig, index, route } from "@react-router/dev/routes";

// 显式路由：首页 + 文档详情页（动态 slug）
// 文档内容来自 app/content/*.mdx，由 app/lib/docs.ts 通过 import.meta.glob 聚合
export default [
  index("routes/index.tsx"),
  route("docs/:slug", "routes/docs.$slug.tsx"),
] satisfies RouteConfig;
