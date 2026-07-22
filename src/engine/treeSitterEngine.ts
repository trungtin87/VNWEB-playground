// Module khởi tạo runtime tree-sitter và nạp 3 văn phạm (grammar) html/css/javascript.
// Các file .wasm được đặt trong thư mục `public/` nên khi build Vite sẽ nằm ở gốc site.

import Parser from 'web-tree-sitter';

export type TenNgonNguParser = 'html' | 'css' | 'javascript';

const TEN_FILE_WASM: Record<TenNgonNguParser, string> = {
  html: 'tree-sitter-html.wasm',
  css: 'tree-sitter-css.wasm',
  javascript: 'tree-sitter-javascript.wasm',
};

let dangKhoiTao: Promise<void> | null = null;
const boNhoNgonNgu = new Map<TenNgonNguParser, Parser.Language>();

/** Đường dẫn gốc để tìm file .wasm — cho phép ghi đè khi cần (vd. test bằng Node). */
// Mặc định lấy theo BASE_URL mà Vite cấu hình (vd "/VNWEB-playground/" khi deploy GitHub
// Pages dưới 1 thư mục con) — nếu không dùng Vite (vd script test bằng Node) thì giữ "/"
// và có thể ghi đè thủ công bằng datDuongDanGoc().
let duongDanGoc: string =
  typeof import.meta !== 'undefined' && (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL
    ? (import.meta as unknown as { env: { BASE_URL: string } }).env.BASE_URL
    : '/';

export function datDuongDanGoc(duongDan: string) {
  duongDanGoc = duongDan.endsWith('/') ? duongDan : duongDan + '/';
}

export async function khoiTaoTreeSitter(): Promise<void> {
  if (!dangKhoiTao) {
    dangKhoiTao = Parser.init({
      locateFile: (tenTep: string) => duongDanGoc + tenTep,
    });
  }
  await dangKhoiTao;
}

export async function layNgonNgu(ten: TenNgonNguParser): Promise<Parser.Language> {
  await khoiTaoTreeSitter();
  const daCo = boNhoNgonNgu.get(ten);
  if (daCo) return daCo;
  const ngonNgu = await Parser.Language.load(duongDanGoc + TEN_FILE_WASM[ten]);
  boNhoNgonNgu.set(ten, ngonNgu);
  return ngonNgu;
}

export async function taoParser(ten: TenNgonNguParser): Promise<Parser> {
  const ngonNgu = await layNgonNgu(ten);
  const parser = new Parser();
  parser.setLanguage(ngonNgu);
  return parser;
}
