// Đăng ký gợi ý gõ mã (IntelliSense) tiếng Việt cho Monaco Editor.
//
// Nguyên tắc: Monaco đã có sẵn gợi ý CHUẨN (tag/attr HTML, property/value CSS, API JS...)
// nhờ các dịch vụ ngôn ngữ đã import ở monacoSetup.ts. Provider dưới đây CHỈ BỔ SUNG THÊM
// các gợi ý tiếng Việt song song — không thay thế — nên gõ tiếng Anh vẫn có gợi ý như cũ.
//
// Ngữ cảnh được xác định thủ công (không dùng model.getWordUntilPosition của Monaco) vì
// wordPattern mặc định của Monaco KHÔNG coi dấu gạch ngang là ký tự thuộc "từ", trong khi
// tên thẻ tiếng Việt của chúng ta bắt buộc dùng gạch ngang (xem ghi chú trong tuDien.ts).

import type * as monacoNs from 'monaco-editor';
import {
  bienTheChinh,
  bienTheChinhTenThe,
  dsTheHtml,
  dsThuocTinhHtml,
  dsThuocTinhCss,
  dsGiaTriCss,
  dsTuKhoaJs,
  dsBuiltinJs,
  type KhaiNiem,
} from './tuDien';

function layTuHienTai(dong: string): string {
  const khop = dong.match(/[A-Za-zÀ-ỹ0-9_-]*$/);
  return khop ? khop[0] : '';
}

export interface NguCanhGoiY {
  danhSach: KhaiNiem[];
  tuHienTai: string;
  laTenThe: boolean;
}

/**
 * Xác định đang gõ TÊN THẺ hay TÊN THUỘC TÍNH trong HTML, dựa vào nội dung dòng hiện tại
 * tính đến vị trí con trỏ. Tách thành hàm thuần (không đụng Monaco) để dễ kiểm thử độc lập.
 */
export function xacDinhNguCanhHtml(dong: string): NguCanhGoiY | null {
  const viTriMo = dong.lastIndexOf('<');
  const viTriDong = dong.lastIndexOf('>');
  if (viTriMo <= viTriDong) return null; // không ở trong 1 thẻ

  const trongThe = dong.slice(viTriMo);
  const sauMo = trongThe.startsWith('</') ? trongThe.slice(2) : trongThe.slice(1);

  if (!/\s/.test(sauMo)) {
    return { danhSach: dsTheHtml, tuHienTai: sauMo, laTenThe: true };
  }
  const phanCuoi = sauMo.split(/\s+/).pop() ?? '';
  if (phanCuoi.includes('=') || phanCuoi.includes('"') || phanCuoi.includes("'")) return null;
  return { danhSach: dsThuocTinhHtml, tuHienTai: phanCuoi, laTenThe: false };
}

/**
 * Xác định đang gõ TÊN THẺ (bộ chọn, ngoài khối {}), TÊN THUỘC TÍNH hay GIÁ TRỊ trong CSS.
 * `vanBanTruoc` = toàn bộ văn bản từ đầu tài liệu đến vị trí con trỏ (để đếm { } chính xác
 * qua nhiều dòng); `dong` = riêng nội dung dòng hiện tại đến vị trí con trỏ.
 */
export function xacDinhNguCanhCss(vanBanTruoc: string, dong: string): NguCanhGoiY {
  const soMo = (vanBanTruoc.match(/\{/g) ?? []).length;
  const soDong = (vanBanTruoc.match(/\}/g) ?? []).length;
  const dangTrongKhoi = soMo > soDong;
  const tuHienTai = layTuHienTai(dong);

  if (!dangTrongKhoi) {
    return { danhSach: dsTheHtml, tuHienTai, laTenThe: true };
  }
  const viTri2Cham = dong.lastIndexOf(':');
  const viTriCPhay = dong.lastIndexOf(';');
  const dangGoGiaTri = viTri2Cham > viTriCPhay;
  return { danhSach: dangGoGiaTri ? dsGiaTriCss : dsThuocTinhCss, tuHienTai, laTenThe: false };
}

export function xacDinhNguCanhJs(dong: string): NguCanhGoiY {
  return { danhSach: [...dsTuKhoaJs, ...dsBuiltinJs], tuHienTai: layTuHienTai(dong), laTenThe: false };
}

function taoGoiY(
  monaco: typeof monacoNs,
  danhSach: KhaiNiem[],
  tienTo: string,
  range: monacoNs.IRange,
  laTenThe: boolean,
): monacoNs.languages.CompletionItem[] {
  const ketQua: monacoNs.languages.CompletionItem[] = [];
  const tienToThuong = tienTo.toLowerCase();

  for (const { chuan, cumCoDau } of danhSach) {
    const vi = laTenThe ? bienTheChinhTenThe(cumCoDau) : bienTheChinh(cumCoDau);

    if (tienToThuong === '' || vi.startsWith(tienToThuong)) {
      ketQua.push({
        label: { label: vi, description: `tiếng Việt → ${chuan}` },
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: vi,
        detail: `→ ${chuan}`,
        documentation: `Gõ tiếng Việt cho "${chuan}" (${cumCoDau}). Khi chạy sẽ tự dịch sang mã chuẩn.`,
        range,
        sortText: '0_' + vi,
      });
    }
    if (tienToThuong !== '' && chuan.toLowerCase().startsWith(tienToThuong) && chuan.toLowerCase() !== tienToThuong) {
      ketQua.push({
        label: { label: chuan, description: `= ${vi}` },
        kind: monaco.languages.CompletionItemKind.Property,
        insertText: chuan,
        detail: `Tiếng Việt: ${vi}`,
        range,
        sortText: '1_' + chuan,
      });
    }
  }
  return ketQua;
}

function dangKyHtml(monaco: typeof monacoNs) {
  monaco.languages.registerCompletionItemProvider('html', {
    triggerCharacters: ['<', '/', ' ', '-', '_'],
    provideCompletionItems(model, position) {
      const dong = model.getLineContent(position.lineNumber).slice(0, position.column - 1);
      const nguCanh = xacDinhNguCanhHtml(dong);
      if (!nguCanh) return { suggestions: [] };

      const batDauCot = position.column - nguCanh.tuHienTai.length;
      const range = new monaco.Range(position.lineNumber, batDauCot, position.lineNumber, position.column);
      return { suggestions: taoGoiY(monaco, nguCanh.danhSach, nguCanh.tuHienTai, range, nguCanh.laTenThe) };
    },
  });
}

function dangKyCss(monaco: typeof monacoNs) {
  monaco.languages.registerCompletionItemProvider('css', {
    triggerCharacters: [':', ';', '{', ' ', '-', '_'],
    provideCompletionItems(model, position) {
      const dong = model.getLineContent(position.lineNumber).slice(0, position.column - 1);
      const vanBanTruoc = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });
      const nguCanh = xacDinhNguCanhCss(vanBanTruoc, dong);

      const batDauCot = position.column - nguCanh.tuHienTai.length;
      const range = new monaco.Range(position.lineNumber, batDauCot, position.lineNumber, position.column);
      return { suggestions: taoGoiY(monaco, nguCanh.danhSach, nguCanh.tuHienTai, range, nguCanh.laTenThe) };
    },
  });
}

function dangKyJs(monaco: typeof monacoNs) {
  monaco.languages.registerCompletionItemProvider('javascript', {
    triggerCharacters: ['_', '-'],
    provideCompletionItems(model, position) {
      const dong = model.getLineContent(position.lineNumber).slice(0, position.column - 1);
      const nguCanh = xacDinhNguCanhJs(dong);
      if (!nguCanh.tuHienTai) return { suggestions: [] };

      const batDauCot = position.column - nguCanh.tuHienTai.length;
      const range = new monaco.Range(position.lineNumber, batDauCot, position.lineNumber, position.column);
      return { suggestions: taoGoiY(monaco, nguCanh.danhSach, nguCanh.tuHienTai, range, false) };
    },
  });
}

let daDangKy = false;

export function dangKyGoiYTiengViet(monaco: typeof monacoNs) {
  if (daDangKy) return;
  daDangKy = true;
  dangKyHtml(monaco);
  dangKyCss(monaco);
  dangKyJs(monaco);
}
