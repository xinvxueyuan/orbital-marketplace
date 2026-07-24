import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "react-router";
import { Header } from "~/components/Header";
import "./app.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="dark" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="hairline border-t border-white/5 py-8 text-center text-sm text-ink-400">
            <div className="container-x">
              Orbital Marketplace · 文档基于 React Router v8 (SSG) 构建 · MIT OR
              Apache-2.0
            </div>
          </footer>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const message =
    isRouteErrorResponse(error) && error.data
      ? String(error.data)
      : error instanceof Error
        ? error.message
        : "未知错误";

  return (
    <div className="container-x py-28 text-center">
      <p className="font-display text-6xl font-bold text-accent-soft">
        {status}
      </p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink-50">
        {status === 404 ? "文档不存在" : "出错了"}
      </h1>
      <p className="mt-3 text-ink-300">{message}</p>
      <a
        href="/orbital-marketplace/"
        className="mt-8 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-deep"
      >
        返回首页
      </a>
    </div>
  );
}
