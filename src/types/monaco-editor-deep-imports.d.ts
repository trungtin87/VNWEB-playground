// monaco-editor chỉ khai báo "." trong package.json "exports", nên TypeScript (chế độ
// moduleResolution: "bundler") sẽ báo lỗi khi import các đường dẫn con — dù Vite/Rollup
// vẫn phân giải được bình thường lúc build/dev vì đọc thẳng theo hệ thống tệp.
// Khai báo ambient dưới đây chỉ để TypeScript im lặng, không ảnh hưởng lúc chạy thật.

declare module 'monaco-editor/esm/vs/editor/editor.api' {
  export * from 'monaco-editor';
}
declare module 'monaco-editor/esm/vs/basic-languages/html/html.contribution';
declare module 'monaco-editor/esm/vs/basic-languages/css/css.contribution';
declare module 'monaco-editor/esm/vs/language/json/monaco.contribution';
declare module 'monaco-editor/esm/vs/language/css/monaco.contribution';
declare module 'monaco-editor/esm/vs/language/html/monaco.contribution';
declare module 'monaco-editor/esm/vs/language/typescript/monaco.contribution';
declare module 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';

declare module 'monaco-editor/esm/vs/editor/editor.worker?worker' {
  const ThoDay: new () => Worker;
  export default ThoDay;
}
declare module 'monaco-editor/esm/vs/language/json/json.worker?worker' {
  const ThoDay: new () => Worker;
  export default ThoDay;
}
declare module 'monaco-editor/esm/vs/language/css/css.worker?worker' {
  const ThoDay: new () => Worker;
  export default ThoDay;
}
declare module 'monaco-editor/esm/vs/language/html/html.worker?worker' {
  const ThoDay: new () => Worker;
  export default ThoDay;
}
declare module 'monaco-editor/esm/vs/language/typescript/ts.worker?worker' {
  const ThoDay: new () => Worker;
  export default ThoDay;
}
