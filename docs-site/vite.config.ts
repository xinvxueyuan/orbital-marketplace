import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@mdx-js/rollup";
import { defineConfig } from "vite";

// GitHub Pages 部署在 /orbital-marketplace/ 子路径下，资源与路由都需要对应前缀
export default defineConfig({
  base: "/orbital-marketplace/",
  // Vite 8 原生支持 tsconfig paths 解析，无需 vite-tsconfig-paths 插件
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    // @mdx-js/rollup：把 .mdx 编译为 React 组件，支持在文件内 export const meta
    mdx(),
    reactRouter(),
  ],
});
