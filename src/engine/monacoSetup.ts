// Cấu hình để Monaco Editor chạy HOÀN TOÀN CỤC BỘ (không tải từ CDN như mặc định của
// @monaco-editor/react), phù hợp tinh thần "tự chứa" của dự án khi build tĩnh và deploy
// thủ công. Các worker (html/css/js/editor lõi) được Vite tự đóng gói thành chunk riêng.

// Cấu hình để Monaco Editor chạy HOÀN TOÀN CỤC BỘ (không tải từ CDN như mặc định của
// @monaco-editor/react), phù hợp tinh thần "tự chứa" của dự án khi build tĩnh và deploy
// thủ công. Các worker (html/css/js/editor lõi) được Vite tự đóng gói thành chunk riêng.
//
// LƯU Ý: chỉ import lõi editor + 3 dịch vụ ngôn ngữ cần dùng (json/css/html/typescript,
// typescript phục vụ luôn cho javascript) thay vì import cả gói `monaco-editor` (sẽ kéo
// theo ~40 ngôn ngữ không dùng tới như Cobol, Julia, Perl... làm phình bundle không cần thiết).

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/basic-languages/html/html.contribution';
import 'monaco-editor/esm/vs/basic-languages/css/css.contribution';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';
import 'monaco-editor/esm/vs/language/css/monaco.contribution';
import 'monaco-editor/esm/vs/language/html/monaco.contribution';
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution';

import { loader } from '@monaco-editor/react';
import { dangKyGoiYTiengViet } from './autocomplete';

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

self.MonacoEnvironment = {
  getWorker(_moduleId: string, label: string) {
    if (label === 'json') return new JsonWorker();
    if (label === 'css' || label === 'scss' || label === 'less') return new CssWorker();
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new HtmlWorker();
    if (label === 'typescript' || label === 'javascript') return new TsWorker();
    return new EditorWorker();
  },
};

// Cho @monaco-editor/react dùng gói monaco-editor đã cài cục bộ thay vì tải CDN
loader.config({ monaco });

dangKyGoiYTiengViet(monaco);

export { monaco };
