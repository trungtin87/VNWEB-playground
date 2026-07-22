// Engine dịch mã 2 chiều (Việt <-> Chuẩn) dựa trên cây cú pháp (AST) của tree-sitter.
//
// Nguyên lý cốt lõi:
//   - Với MỌI nút thuộc loại "văn bản/chuỗi/ghi chú" (string, comment, attribute_value...)
//     -> KHÔNG BAO GIỜ đụng vào, dù nội dung bên trong có trùng từ khoá.
//   - Với các nút còn lại, nếu là nút lá (không có con) và văn bản của nó khớp 1 mục
//     trong từ điển tương ứng theo chiều đang dịch -> thay thế.
//   - Mã tiếng Việt CHƯA dịch không phải cú pháp hợp lệ của HTML/CSS/JS chuẩn, nên cây
//     có thể chứa các nút ERROR — điều này không sao, vì tree-sitter vẫn nhận diện đúng
//     ranh giới chuỗi/ghi chú ngay cả trong cây có lỗi (đã kiểm chứng thực nghiệm).

import type Parser from 'web-tree-sitter';
import { taoParser } from './treeSitterEngine';
import { tuDienHtml, tuDienCss, tuDienJs } from './tuDien';

export type NgonNguDich = 'html' | 'css' | 'js';
export type HuongDich = 'vi2std' | 'std2vi';

const TEN_PARSER: Record<NgonNguDich, 'html' | 'css' | 'javascript'> = {
  html: 'html',
  css: 'css',
  js: 'javascript',
};

// Các loại nút KHÔNG BAO GIỜ được dịch (giữ nguyên 100% nội dung bên trong)
const BO_QUA: Record<NgonNguDich, Set<string>> = {
  html: new Set(['comment', 'text', 'attribute_value', 'quoted_attribute_value', 'raw_text']),
  css: new Set(['comment', 'string_value']),
  js: new Set(['comment', 'string', 'template_string', 'regex']),
};

function laDinhDangTu(vanBan: string): boolean {
  return /^[A-Za-zÀ-ỹ_$][A-Za-zÀ-ỹ0-9_$-]*$/.test(vanBan);
}

interface ThayThe {
  batDau: number;
  ketThuc: number;
  vanBanMoi: string;
}

function layTuDien(ngonNgu: NgonNguDich) {
  if (ngonNgu === 'html') return tuDienHtml;
  if (ngonNgu === 'css') return tuDienCss;
  return tuDienJs;
}

export async function dichMa(ngonNgu: NgonNguDich, maNguon: string, huong: HuongDich): Promise<string> {
  if (!maNguon.trim()) return maNguon;

  const parser = await taoParser(TEN_PARSER[ngonNgu]);
  const cay = parser.parse(maNguon);
  if (!cay) return maNguon;

  const boQua = BO_QUA[ngonNgu];
  const tuDien = layTuDien(ngonNgu);
  const banDo = huong === 'vi2std' ? tuDien.viSangChuan : tuDien.chuanSangVi;

  const danhSachThayThe: ThayThe[] = [];

  function duyet(node: Parser.SyntaxNode) {
    if (boQua.has(node.type)) return;

    // Trường hợp đặc biệt (chỉ JS, chỉ chiều Chuẩn -> Việt): ghép "object.property"
    // thành 1 từ Việt duy nhất, ví dụ console.log -> in_ra_console
    if (ngonNgu === 'js' && huong === 'std2vi' && node.type === 'member_expression') {
      const doiTuong = node.childForFieldName('object');
      const thuocTinh = node.childForFieldName('property');
      if (doiTuong && thuocTinh && doiTuong.childCount === 0) {
        const ghep = `${doiTuong.text}.${thuocTinh.text}`.toLowerCase();
        const viGhep = tuDienJs.ghepNganChuan.get(ghep);
        if (viGhep) {
          danhSachThayThe.push({ batDau: doiTuong.startIndex, ketThuc: thuocTinh.endIndex, vanBanMoi: viGhep });
          return; // đã xử lý xong nhánh này, không cần duyệt sâu thêm
        }
      }
    }

    if (node.childCount === 0) {
      if (laDinhDangTu(node.text)) {
        const tim = banDo.get(node.text.toLowerCase());
        if (tim) danhSachThayThe.push({ batDau: node.startIndex, ketThuc: node.endIndex, vanBanMoi: tim });
      }
      return;
    }
    for (let i = 0; i < node.childCount; i++) {
      const con = node.child(i);
      if (con) duyet(con);
    }
  }

  duyet(cay.rootNode);

  if (!danhSachThayThe.length) return maNguon;

  danhSachThayThe.sort((a, b) => b.batDau - a.batDau);
  let ketQua = maNguon;
  for (const tt of danhSachThayThe) {
    ketQua = ketQua.slice(0, tt.batDau) + tt.vanBanMoi + ketQua.slice(tt.ketThuc);
  }
  return ketQua;
}
