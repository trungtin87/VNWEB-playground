// Module xây dựng từ điển 2 chiều (Việt <-> Chuẩn) từ 3 file JSON tách riêng.
// Mỗi khái niệm chỉ khai báo 1 lần trong file .json (chuẩn -> "cụm từ có dấu"),
// từ đó module này TỰ SINH 4 cách gõ được chấp nhận:
//   cụm_gạch_dưới_có_dấu / cum_gach_duoi_khong_dau / cụmdínhliềncódấu / cumdinhlienkhongdau

import bangHtml from '../dic/html.json';
import bangCss from '../dic/css.json';
import bangJs from '../dic/js.json';

export function boDau(chuoi: string): string {
  return chuoi
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Biến thể "chính" dùng để hiển thị gợi ý / autocomplete — gạch dưới, không dấu, viết thường.
 * Dùng cho MỌI thứ trừ tên thẻ HTML.
 */
export function bienTheChinh(cumCoDau: string): string {
  return boDau(cumCoDau.trim().replace(/\s+/g, '_')).toLowerCase();
}

/**
 * Biến thể "chính" dành RIÊNG cho tên thẻ HTML — dùng gạch ngang, không dấu, viết thường.
 *
 * QUAN TRỌNG: token `tag_name` trong văn phạm tree-sitter-html chỉ chấp nhận chữ/số/gạch
 * ngang (giống quy tắc đặt tên custom element chuẩn HTML: <my-tag>), KHÔNG chấp nhận gạch
 * dưới. Nếu dùng gạch dưới, ví dụ <tieu_de_1>, trình phân tích sẽ tách nhầm thành
 * tag_name "tieu" + attribute_name "_de_1" — làm dịch sai hoàn toàn. Đã kiểm chứng thực
 * nghiệm (xem scripts/debug2.mjs). Vì vậy tên thẻ tiếng Việt BẮT BUỘC dùng gạch ngang.
 */
export function bienTheChinhTenThe(cumCoDau: string): string {
  return boDau(cumCoDau.trim().replace(/\s+/g, '-')).toLowerCase();
}

export interface KhaiNiem {
  chuan: string;
  cumCoDau: string;
}

function taoDanhSachKhaiNiem(bang: Record<string, string>): KhaiNiem[] {
  return Object.entries(bang).map(([chuan, cumCoDau]) => ({ chuan, cumCoDau }));
}

function taoBienThe(cumCoDau: string): string[] {
  const coDau = cumCoDau.trim();
  const gachDuoiCoDau = coDau.replace(/\s+/g, '_');
  const gachNgangCoDau = coDau.replace(/\s+/g, '-');
  const dinhLienCoDau = coDau.replace(/\s+/g, '');
  const tatCa = new Set<string>();
  for (const s of [gachDuoiCoDau, gachNgangCoDau, dinhLienCoDau]) {
    tatCa.add(s.toLowerCase());
    tatCa.add(boDau(s).toLowerCase());
  }
  return [...tatCa];
}

export interface TuDien2Chieu {
  /** biến thể tiếng Việt (viết thường) -> mã chuẩn (giữ nguyên hoa/thường gốc) */
  viSangChuan: Map<string, string>;
  /** mã chuẩn (viết thường, không chứa dấu chấm) -> biến thể chính tiếng Việt */
  chuanSangVi: Map<string, string>;
  /** (chỉ dùng cho JS) "object.property" viết thường -> từ Việt ghép, dùng khi dịch Chuẩn -> Việt */
  ghepNganChuan: Map<string, string>;
  /** Toàn bộ khái niệm gốc, dùng cho bảng tra cứu / autocomplete ở các giai đoạn sau */
  khaiNiemGoc: KhaiNiem[];
}

interface NguonTuDien {
  danhSach: KhaiNiem[];
  /** true = đây là danh sách TÊN THẺ HTML -> dùng gạch ngang làm dạng chuẩn hiển thị */
  laTenThe?: boolean;
}

function ghepTuDien(nguon: NguonTuDien[]): TuDien2Chieu {
  const viSangChuan = new Map<string, string>();
  const chuanSangVi = new Map<string, string>();
  const ghepNganChuan = new Map<string, string>();
  const khaiNiemGoc: KhaiNiem[] = [];

  for (const { danhSach, laTenThe } of nguon) {
    for (const khaiNiem of danhSach) {
      const { chuan, cumCoDau } = khaiNiem;
      khaiNiemGoc.push(khaiNiem);
      const vi = laTenThe ? bienTheChinhTenThe(cumCoDau) : bienTheChinh(cumCoDau);

      for (const bienThe of taoBienThe(cumCoDau)) {
        if (!viSangChuan.has(bienThe)) viSangChuan.set(bienThe, chuan);
      }

      if (chuan.includes('.')) {
        // Khái niệm ghép kiểu "console.log" -> chỉ cần cho chiều Chuẩn -> Việt
        // (chiều Việt -> Chuẩn đã được xử lý ở trên vì "in_ra_console" là 1 token duy nhất)
        ghepNganChuan.set(chuan.toLowerCase(), vi);
      } else if (!chuanSangVi.has(chuan.toLowerCase())) {
        chuanSangVi.set(chuan.toLowerCase(), vi);
      }
    }
  }

  return { viSangChuan, chuanSangVi, ghepNganChuan, khaiNiemGoc };
}

export const tuDienHtml = ghepTuDien([
  { danhSach: taoDanhSachKhaiNiem(bangHtml.tags), laTenThe: true },
  { danhSach: taoDanhSachKhaiNiem(bangHtml.attrs) },
]);

export const tuDienCss = ghepTuDien([
  { danhSach: taoDanhSachKhaiNiem(bangCss.properties) },
  { danhSach: taoDanhSachKhaiNiem(bangCss.values) },
  // Để dịch tag_name trong bộ chọn CSS (vd: than-trang { -> body {) — dùng CHUNG quy ước
  // gạch ngang với tên thẻ HTML để 1 khái niệm có đúng 1 dạng chuẩn dù gõ ở đâu.
  { danhSach: taoDanhSachKhaiNiem(bangHtml.tags), laTenThe: true },
]);

export const tuDienJs = ghepTuDien([
  { danhSach: taoDanhSachKhaiNiem(bangJs.keywords) },
  { danhSach: taoDanhSachKhaiNiem(bangJs.builtins) },
]);

// ===== Danh sách theo từng nhóm riêng — dùng cho autocomplete (Giai đoạn 3) và bảng từ điển =====
// (autocomplete cần biết đang ở ngữ cảnh nào — tên thẻ hay thuộc tính hay giá trị — để gợi ý đúng)
export const dsTheHtml = taoDanhSachKhaiNiem(bangHtml.tags);
export const dsThuocTinhHtml = taoDanhSachKhaiNiem(bangHtml.attrs);
export const dsThuocTinhCss = taoDanhSachKhaiNiem(bangCss.properties);
export const dsGiaTriCss = taoDanhSachKhaiNiem(bangCss.values);
export const dsTuKhoaJs = taoDanhSachKhaiNiem(bangJs.keywords);
export const dsBuiltinJs = taoDanhSachKhaiNiem(bangJs.builtins);
