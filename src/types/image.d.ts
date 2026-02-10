// src/types/image.d.ts
declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.jpg' {
  const src: string;
  export default src;
}
declare module '*.jpeg' {
  const src: string;
  export default src;
}
declare module '*.gif' {
  const src: string;
  export default src;
}
declare module '*.svg' {
  const src: string;
  export default src;
}
declare module '*.webp' {
  const src: string;
  export default src;
}
declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
declare module '*.js' {
  // 覆盖所有具名导出（如 export function/const xxx）
  const exports: {
    [key: string]: any;
  };
  // 同时兼容默认导出
  export default exports;
  // 关键：支持 import { xxx } from '*.js' 语法
  export = exports;
}
