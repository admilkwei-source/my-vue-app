// 必须放在最顶端，在所有应用代码（如 import）执行之前运行

declare global {
  interface Window {
    __POWERED_BY_QIANKUN__?: boolean;
    __INJECTED_PUBLIC_PATH_BY_QIANKUN__?: string;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let __webpack_public_path__: any;

if (window.__POWERED_BY_QIANKUN__) {
  // 使用 qiankun 提供的全局变量来动态设置 webpack 的 publicPath
  // __INJECTED_PUBLIC_PATH_BY_QIANKUN__ 是主应用注入的子应用公共路径
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}