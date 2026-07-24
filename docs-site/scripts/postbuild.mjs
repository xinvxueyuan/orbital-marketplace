// React Router v8 SSG 把预渲染 HTML 写到 build/client/<basename>/... 下，
// 而 Vite 资源落在 build/client/assets/。GitHub Pages 的产物根映射到
// /orbital-marketplace/，直接上传 build/client 会让 doc 路径出现双重前缀。
// 此脚本把 <basename>/ 下的预渲染 HTML 提升到产物根，并补齐 assets/ 与
// SPA 兜底页 404.html，组装出可直接上传的 build/deploy。
import { cp, rm, mkdir, copyFile } from "node:fs/promises";
import { join } from "node:path";

const clientDir = join(process.cwd(), "build", "client");
const deployDir = join(process.cwd(), "build", "deploy");
const basenameDir = join(clientDir, "orbital-marketplace");

// 1. 清理并重建产物根
await rm(deployDir, { recursive: true, force: true });
await mkdir(deployDir, { recursive: true });

// 2. 预渲染 HTML（首页 index.html + docs/<slug>/index.html）提升到产物根，
//    去掉多余的 /orbital-marketplace/ 路径段
await cp(basenameDir, deployDir, { recursive: true });

// 3. 资源：HTML 以绝对路径 /orbital-marketplace/assets/... 引用，需置于产物根
await cp(join(clientDir, "assets"), join(deployDir, "assets"), {
  recursive: true,
});

// 4. SPA 兜底：未预渲染的路径回退到客户端路由（React Router basename 已配置）
await copyFile(join(clientDir, "index.html"), join(deployDir, "404.html"));

console.log("✓ deploy directory assembled at build/deploy");
