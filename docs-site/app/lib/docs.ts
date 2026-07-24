import type { ComponentType } from "react";

/** 文档元信息：每个 .mdx 文件顶部 `export const meta` 提供这些字段 */
export type DocMeta = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  updatedAt: string;
  order?: number;
};

export type Category = { id: string; name: string; icon: string };

/** 文档分类（与主站 src/data/docs.js 保持一致，并新增「项目文档」） */
export const CATEGORIES: Category[] = [
  { id: "start", name: "快速开始", icon: "◇" },
  { id: "install", name: "应用接入", icon: "⌘" },
  { id: "api", name: "API 参考", icon: "◐" },
  { id: "billing", name: "订阅与授权", icon: "▣" },
  { id: "vending", name: "发卡系统", icon: "✦" },
  { id: "faq", name: "常见问题", icon: "?" },
  { id: "project", name: "项目文档", icon: "❖" },
];

type DocModule = { default: ComponentType; meta: DocMeta };

// 构建期通过 import.meta.glob 聚合所有 .mdx：每个模块含 default 组件与 meta 导出
const modules = import.meta.glob<DocModule>("../content/*.mdx", { eager: true });

function slugOf(path: string): string {
  return path.split("/").pop()!.replace(/\.mdx$/, "");
}

/** 全部文档元信息，按 order → title 排序 */
export const allDocs: DocMeta[] = Object.entries(modules)
  .map(([path, mod]) => ({ ...mod.meta, slug: mod.meta.slug ?? slugOf(path) }))
  .sort(
    (a, b) =>
      (a.order ?? 99) - (b.order ?? 99) || a.title.localeCompare(b.title, "zh"),
  );

/** 某分类下的文档 */
export function docsByCategory(catId: string): DocMeta[] {
  return allDocs.filter((d) => d.category === catId);
}

/** 按 slug 取文档：返回元信息与组件 */
export function getDoc(
  slug: string,
): { meta: DocMeta; Component: ComponentType } | null {
  const entry = Object.entries(modules).find(([path]) => slugOf(path) === slug);
  if (!entry) return null;
  return { meta: entry[1].meta, Component: entry[1].default };
}

/** 取上一篇 / 下一篇（基于全局排序） */
export function getAdjacent(
  slug: string,
): { prev?: DocMeta; next?: DocMeta } {
  const i = allDocs.findIndex((d) => d.slug === slug);
  return { prev: i > 0 ? allDocs[i - 1] : undefined, next: allDocs[i + 1] };
}

export function categoryName(catId: string): string {
  return CATEGORIES.find((c) => c.id === catId)?.name ?? catId;
}
