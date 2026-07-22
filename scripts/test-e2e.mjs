import { chromium } from 'playwright';

const trinhDuyet = await chromium.launch();
const trang = await trinhDuyet.newPage();

const loiConsole = [];
trang.on('console', (msg) => {
  if (msg.type() === 'error') loiConsole.push(msg.text());
});
trang.on('pageerror', (err) => loiConsole.push('PAGE ERROR: ' + err.message));

console.log('Đang mở trang...');
await trang.goto('http://127.0.0.1:4173/VNWEB-playground/', { waitUntil: 'networkidle', timeout: 30000 });

// Chờ Monaco Editor render xong (đợi xuất hiện lớp .monaco-editor)
await trang.waitForSelector('.monaco-editor', { timeout: 20000 });
console.log('✅ Monaco Editor đã render');

// Chờ khung gương (readonly) có nội dung được dịch (không còn rỗng) — xác nhận pipeline dịch chạy được
await trang.waitForFunction(
  () => {
    const cacKhoi = document.querySelectorAll('.nua-guong .view-lines');
    return cacKhoi.length > 0 && cacKhoi[0].textContent.trim().length > 0;
  },
  { timeout: 15000 },
);
console.log('✅ Khung gương đã có nội dung dịch tự động');

const noiDungGuong = await trang.locator('.nua-guong .view-lines').first().innerText();
console.log('--- Nội dung khung gương (mã chuẩn, tab HTML) ---');
console.log(noiDungGuong);

if (!noiDungGuong.includes('h1') && !noiDungGuong.includes('button')) {
  console.log('❌ Nội dung dịch KHÔNG như mong đợi (thiếu h1/button)');
  process.exitCode = 1;
} else {
  console.log('✅ Nội dung dịch đúng như mong đợi (có h1/button)');
}

// Thử chuyển sang tab CSS và kiểm tra
await trang.getByRole('button', { name: 'style.css' }).click();
await trang.waitForTimeout(600);
const guongCss = await trang.locator('.nua-guong .view-lines').first().innerText();
console.log('\n--- Nội dung khung gương (mã chuẩn, tab CSS) ---');
console.log(guongCss);
if (guongCss.includes('body') && guongCss.includes('background')) {
  console.log('✅ CSS dịch đúng (có body, background)');
} else {
  console.log('❌ CSS dịch sai hoặc thiếu');
  process.exitCode = 1;
}

// Thử đổi công tắc sang Tiếng Anh
await trang.getByRole('button', { name: '🇬🇧 Tiếng Anh' }).click();
await trang.waitForTimeout(1000);
const soanThaoSauKhiDoi = await trang.locator('.nua-soan-thao .view-lines').first().innerText();
console.log('\n--- Ô soạn thảo (tab CSS) SAU khi đổi sang Tiếng Anh ---');
console.log(soanThaoSauKhiDoi);
if (soanThaoSauKhiDoi.includes('background') || soanThaoSauKhiDoi.includes('body')) {
  console.log('✅ Đổi công tắc dịch lại mã hiện có thành công (không vỡ cú pháp)');
} else {
  console.log('❌ Đổi công tắc KHÔNG dịch lại đúng');
  process.exitCode = 1;
}

console.log('\n--- Lỗi console trong quá trình chạy ---');
if (loiConsole.length === 0) {
  console.log('✅ Không có lỗi console nào');
} else {
  console.log('❌ Có lỗi:');
  loiConsole.forEach((l) => console.log('  ' + l));
  process.exitCode = 1;
}

await trinhDuyet.close();
