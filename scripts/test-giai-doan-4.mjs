import { chromium } from 'playwright';

const trinhDuyet = await chromium.launch();
const trang = await trinhDuyet.newPage();
let coLoi = false;
const loiConsolePageChinh = [];

trang.on('console', (msg) => { if (msg.type() === 'error') loiConsolePageChinh.push(msg.text()); });
trang.on('pageerror', (err) => loiConsolePageChinh.push('PAGE ERROR: ' + err.message));

function kiemTra(dieuKien, moTa) {
  console.log((dieuKien ? '✅ ' : '❌ ') + moTa);
  if (!dieuKien) coLoi = true;
}

console.log('Đang mở trang...');
await trang.goto('http://127.0.0.1:4173/VNWEB-playground/', { waitUntil: 'networkidle', timeout: 30000 });
await trang.waitForSelector('.monaco-editor', { timeout: 20000 });

// ---------- Test 1: iframe render nội dung đã dịch đúng ----------
console.log('\n=== Test 1: iframe hiển thị đúng nội dung đã dịch (chờ auto-run 450ms) ===');
await trang.waitForTimeout(1200);
const khungTruoc = trang.frameLocator('.khung-xem-truoc');
const tieuDe = await khungTruoc.locator('h1').innerText();
console.log('Tiêu đề trong iframe:', tieuDe);
kiemTra(tieuDe.includes('Xin chào, VNWEB'), 'iframe hiển thị đúng tiêu đề đã dịch từ tiếng Việt');

// ---------- Test 2: bấm nút trong iframe -> console bắt được log ----------
console.log('\n=== Test 2: Bấm nút trong iframe, kiểm tra console panel bắt được log ===');
await khungTruoc.locator('button').click();
await trang.waitForTimeout(300);
const dongConsole = await trang.locator('.dong-console').first().innerText();
console.log('Dòng console:', dongConsole);
kiemTra(dongConsole.includes('Đã bấm nút'), 'Console panel bắt đúng log từ iframe khi bấm nút');

const soLanBamTrongIframe = await khungTruoc.locator('#ket-qua, [id="ket-qua"]').innerText().catch(() => '');
console.log('Nội dung "Số lần bấm" trong iframe:', soLanBamTrongIframe);
kiemTra(soLanBamTrongIframe.includes('1'), 'Số lần bấm trong iframe cập nhật đúng (JS chạy thật)');

// ---------- Test 3: Xem song song ----------
console.log('\n=== Test 3: Bật "Xem song song" ===');
await trang.getByText('Xem song song').click();
await trang.waitForTimeout(300);
const soKhungSoanThao = await trang.locator('.monaco-editor').count();
console.log('Số khung Monaco đang hiển thị:', soKhungSoanThao);
kiemTra(soKhungSoanThao >= 2, 'Khi bật song song, có ít nhất 2 khung Monaco (đang gõ + gương)');
await trang.getByText('Xem song song').click(); // tắt lại

// ---------- Test 4: Trang trống ----------
console.log('\n=== Test 4: Bấm "Trang trống" ===');
trang.once('dialog', (d) => d.accept());
await trang.getByRole('button', { name: '📄 Trang trống' }).click();
await trang.waitForTimeout(1200);
const noiDungIframeSauKhiXoa = await khungTruoc.locator('body').innerText().catch(() => '');
console.log('Nội dung iframe sau khi xoá:', JSON.stringify(noiDungIframeSauKhiXoa));
kiemTra(noiDungIframeSauKhiXoa.trim() === '', 'iframe trống hoàn toàn sau khi bấm "Trang trống"');

// ---------- Test 5: Đặt lại ----------
console.log('\n=== Test 5: Bấm "Đặt lại" ===');
trang.once('dialog', (d) => d.accept());
await trang.getByRole('button', { name: '↺ Đặt lại' }).click();
await trang.waitForTimeout(1200);
const tieuDeSauDatLai = await khungTruoc.locator('h1').innerText();
kiemTra(tieuDeSauDatLai.includes('Xin chào, VNWEB'), 'Sau "Đặt lại", iframe hiển thị lại đúng mẫu ban đầu');

// ---------- Test 6: Đổi ngôn ngữ rồi kiểm tra iframe vẫn đúng ----------
console.log('\n=== Test 6: Đổi sang Tiếng Anh, kiểm tra iframe vẫn render đúng (không vỡ) ===');
await trang.getByRole('button', { name: '🇬🇧 Tiếng Anh' }).click();
await trang.waitForTimeout(1500);
const tieuDeSauDoiNgonNgu = await khungTruoc.locator('h1').innerText();
kiemTra(tieuDeSauDoiNgonNgu.includes('Xin chào, VNWEB'), 'Sau khi đổi sang Tiếng Anh, iframe vẫn hiển thị đúng (không vỡ cú pháp)');

// ---------- Test 7: Tải xuống ----------
console.log('\n=== Test 7: Bấm "Tải xuống" ===');
const [taiXuong] = await Promise.all([
  trang.waitForEvent('download', { timeout: 8000 }),
  trang.getByRole('button', { name: '⇩ Tải xuống' }).click(),
]);
console.log('Tên file tải xuống:', taiXuong.suggestedFilename());
kiemTra(taiXuong.suggestedFilename() === 'vnweb-playground.html', 'Tải xuống đúng tên file');

// ---------- Test 8: kéo giãn khung console ----------
console.log('\n=== Test 8: Kéo giãn khung console ===');
const tayKeoNgang = trang.locator('.tay-keo-ngang');
const hcnTruoc = await trang.locator('.bang-console').boundingBox();
const hopTayKeo = await tayKeoNgang.boundingBox();
await trang.mouse.move(hopTayKeo.x + hopTayKeo.width / 2, hopTayKeo.y + hopTayKeo.height / 2);
await trang.mouse.down();
await trang.mouse.move(hopTayKeo.x + hopTayKeo.width / 2, hopTayKeo.y - 100);
await trang.mouse.up();
await trang.waitForTimeout(200);
const hcnSau = await trang.locator('.bang-console').boundingBox();
console.log('Chiều cao console trước/sau:', hcnTruoc.height, '->', hcnSau.height);
kiemTra(hcnSau.height > hcnTruoc.height + 50, 'Kéo tay kéo lên làm console cao hơn rõ rệt');

console.log('\n--- Lỗi console trang chính ---');
if (loiConsolePageChinh.length === 0) {
  console.log('✅ Không có lỗi console nào');
} else {
  console.log('❌ Có lỗi:');
  loiConsolePageChinh.forEach((l) => console.log('  ' + l));
  coLoi = true;
}

console.log('\n============================');
console.log(coLoi ? '❌ CÓ TEST THẤT BẠI' : '✅ TẤT CẢ TEST ĐỀU ĐẠT');
if (coLoi) process.exitCode = 1;

await trinhDuyet.close();
