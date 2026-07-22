// Dựng tài liệu HTML hoàn chỉnh từ 3 mã nguồn (đã ở dạng CHUẨN) để đưa vào iframe xem
// trước, hoặc xuất ra file tải xuống. Khi `kemBatLoiConsole` bật, tiêm thêm 1 đoạn script
// nhỏ để bắt console.log/warn/error và lỗi runtime, gửi về cửa sổ cha qua postMessage.

export function taoTaiLieuXemTruoc(maHtml: string, maCss: string, maJs: string, kemBatLoiConsole: boolean): string {
  const scriptBatLoiConsole = kemBatLoiConsole
    ? `
    <script>
      const gocLog = console.log, gocError = console.error, gocWarn = console.warn;
      function guiVeCha(loai, cacDoiSo) {
        try {
          const noiDung = Array.from(cacDoiSo).map((muc) => {
            if (typeof muc === 'object') { try { return JSON.stringify(muc); } catch (e) { return String(muc); } }
            return String(muc);
          }).join(' ');
          window.parent.postMessage({ nguon: 'vnweb-console', loai, noiDung }, '*');
        } catch (loi) {}
      }
      console.log = function (...doiSo) { guiVeCha('thuong', doiSo); gocLog.apply(console, doiSo); };
      console.error = function (...doiSo) { guiVeCha('loi', doiSo); gocError.apply(console, doiSo); };
      console.warn = function (...doiSo) { guiVeCha('canh-bao', doiSo); gocWarn.apply(console, doiSo); };
      window.onerror = function (thongDiep) { guiVeCha('loi', [thongDiep]); };
    <\/script>
  `
    : '';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
${scriptBatLoiConsole}
<style>${maCss}</style>
</head>
<body>
${maHtml}
<script>${maJs}<\/script>
</body>
</html>`;
}
