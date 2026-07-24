import type { Config } from "@react-router/dev/config";
import { readdirSync } from "node:fs";
import { join } from "node:path";

// 文档内容目录：构建期枚举所有 .mdx slug，供 SSG 预渲染动态路由 docs/:slug
const contentDir = join(process.cwd(), "app", "content");

function getDocSlugs(): string[] {
  try {
    return readdirSync(contentDir)
      .filter((f: string) => f.endsWith(".mdx"))
      .map((f: string) => f.replace(/\.mdx$/, ""));
  } catch {
    return [];
  }
}

export default {
  ssr: false,
  // basename 必须以 Vite base（"/orbital-marketplace/"）开头，否则 SSG 预览服务器
  // 启动时会因 basename/base 校验失败而静默挂起，导致无法生成 HTML。
  basename: "/orbital-marketplace/",
  // docs/:slug 是动态路由，prerender: true 无法预渲染；改用 prerender() 显式枚举。
  async prerender() {
    const slugs = getDocSlugs();
    return ["/", ...slugs.map((s) => `/docs/${s}`)];
  },
} satisfies Config;
