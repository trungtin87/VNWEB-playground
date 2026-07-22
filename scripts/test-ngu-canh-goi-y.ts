import { xacDinhNguCanhHtml, xacDinhNguCanhCss, xacDinhNguCanhJs } from '../src/engine/autocomplete.ts';
import { bienTheChinh, bienTheChinhTenThe } from '../src/engine/tuDien.ts';

let coLoi = false;
function kiemTra(dieuKien: boolean, moTa: string) {
  console.log((dieuKien ? '✅ ' : '❌ ') + moTa);
  if (!dieuKien) coLoi = true;
}

function coKhaiNiem(danhSach: { chuan: string; cumCoDau: string }[], chuanCanTim: string, laTenThe = false) {
  return danhSach.some(({ chuan, cumCoDau }) => {
    const vi = laTenThe ? bienTheChinhTenThe(cumCoDau) : bienTheChinh(cumCoDau);
    return chuan === chuanCanTim && vi.length > 0;
  });
}

// ===== HTML =====
console.log('=== HTML ===');
{
  const nc = xacDinhNguCanhHtml('<nu');
  kiemTra(nc !== null && nc.laTenThe && nc.tuHienTai === 'nu', 'Đang gõ "<nu" -> ngữ cảnh TÊN THẺ, tiền tố "nu"');
  kiemTra(!!nc && coKhaiNiem(nc.danhSach, 'button', true), 'Danh sách tên thẻ có chứa "button" (nut)');
}
{
  const nc = xacDinhNguCanhHtml('<button di');
  kiemTra(nc !== null && !nc.laTenThe && nc.tuHienTai === 'di', 'Đang gõ "<button di" -> ngữ cảnh THUỘC TÍNH, tiền tố "di"');
  kiemTra(!!nc && coKhaiNiem(nc.danhSach, 'id'), 'Danh sách thuộc tính có chứa "id" (dinh_danh)');
}
{
  const nc = xacDinhNguCanhHtml('<button class="foo" ');
  kiemTra(nc !== null && !nc.laTenThe && nc.tuHienTai === '', 'Sau khi đã có 1 thuộc tính + dấu cách -> vẫn đúng ngữ cảnh THUỘC TÍNH, tiền tố rỗng');
}
{
  const nc = xacDinhNguCanhHtml('Đây là văn bản thường, không trong thẻ nào');
  kiemTra(nc === null, 'Đang gõ văn bản thường (ngoài thẻ) -> không gợi ý gì (null)');
}
{
  const nc = xacDinhNguCanhHtml('<button id="nu');
  kiemTra(nc === null, 'Đang gõ TRONG dấu ngoặc kép của thuộc tính -> không gợi ý (tránh phá giá trị)');
}
{
  const nc = xacDinhNguCanhHtml('</bu');
  kiemTra(nc !== null && nc.laTenThe && nc.tuHienTai === 'bu', 'Thẻ đóng "</bu" -> vẫn đúng ngữ cảnh TÊN THẺ');
}

// ===== CSS =====
console.log('\n=== CSS ===');
{
  const nc = xacDinhNguCanhCss('.x { ne', '.x { ne');
  kiemTra(!nc.laTenThe && nc.tuHienTai === 'ne', 'Trong khối {} gõ "ne" -> ngữ cảnh THUỘC TÍNH, tiền tố "ne"');
  kiemTra(coKhaiNiem(nc.danhSach, 'background'), 'Danh sách thuộc tính CSS có chứa "background" (nen)');
}
{
  const nc = xacDinhNguCanhCss('body { color: r', 'body { color: r');
  kiemTra(!nc.laTenThe && nc.tuHienTai === 'r', 'Sau dấu ":" -> ngữ cảnh GIÁ TRỊ, tiền tố "r"');
  kiemTra(coKhaiNiem(nc.danhSach, 'red'), 'Danh sách giá trị CSS có chứa "red" (do)');
}
{
  const nc = xacDinhNguCanhCss('than-', 'than-');
  kiemTra(nc.laTenThe && nc.tuHienTai === 'than-', 'Ngoài khối {} (đầu tài liệu) -> ngữ cảnh BỘ CHỌN (tên thẻ)');
  kiemTra(coKhaiNiem(nc.danhSach, 'body', true), 'Danh sách bộ chọn có chứa "body" (than-trang)');
}
{
  // Nhiều dòng: đã đóng 1 khối trước đó, giờ đang ở ngoài khối tiếp theo
  const vanBanTruoc = 'body { color: red; }\nh1-';
  const nc = xacDinhNguCanhCss(vanBanTruoc, 'h1-');
  kiemTra(nc.laTenThe, 'Sau khi đã đóng 1 khối {} ở dòng trước, dòng mới vẫn đúng là ngữ cảnh BỘ CHỌN (không bị tính nhầm là còn trong khối cũ)');
}
{
  // Đang gõ dở giá trị nhiều dòng (chưa đóng dấu ; hay })
  const vanBanTruoc = 'body {\n  color: r';
  const nc = xacDinhNguCanhCss(vanBanTruoc, '  color: r');
  kiemTra(!nc.laTenThe && nc.tuHienTai === 'r', 'Khối {} trải nhiều dòng vẫn tính đúng là đang TRONG khối (đếm { } toàn văn bản, không chỉ dòng hiện tại)');
}

// ===== JS =====
console.log('\n=== JS ===');
{
  const nc = xacDinhNguCanhJs('in_ra');
  kiemTra(nc.tuHienTai === 'in_ra', 'Gõ "in_ra" -> tiền tố đúng');
  kiemTra(coKhaiNiem(nc.danhSach, 'console.log'), 'Danh sách JS có chứa "console.log" (in_ra_console)');
  kiemTra(coKhaiNiem(nc.danhSach, 'if'), 'Danh sách JS có chứa từ khoá "if" (neu)');
}

console.log('\n============================');
console.log(coLoi ? '❌ CÓ TEST THẤT BẠI' : '✅ TẤT CẢ TEST ĐỀU ĐẠT');
if (coLoi) process.exitCode = 1;
