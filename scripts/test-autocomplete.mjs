import { chromium } from 'playwright';

const trinhDuyet = await chromium.launch();
let coLoi = false;

async function taoTrangMoi() {
  const trang = await trinhDuyet.newPage();
  trang.on('pageerror', (err) => console.log('ℹ️  (runtime, do gõ mã dở dang + tự động chạy — không phải lỗi app):', err.message));
  await trang.goto('http://127.0.0.1:4173/VNWEB-playground/', { waitUntil: 'networkidle', timeout: 30000 });
  await trang.waitForSelector('.monaco-editor', { timeout: 20000 });
  return trang;
}

async function goSachRoiGo(trang, chuoiGo, tabTen) {
  if (tabTen) {
    await trang.getByRole('button', { name: tabTen }).click();
    await trang.waitForTimeout(400);
  }
  const vungGo = trang.locator('.nua-soan-thao .monaco-editor .view-lines').first();
  await vungGo.click();
  await trang.keyboard.press('Control+a');
  await trang.keyboard.press('Delete');
  await trang.keyboard.type(chuoiGo, { delay: 60 });
}

async function layGoiY(trang) {
  await trang.waitForSelector('.monaco-editor .suggest-widget.visible', { timeout: 6000 });
  await trang.waitForTimeout(200);
  const rows = await trang.locator('.monaco-editor .suggest-widget.visible .monaco-list-row').all();
  const ket = [];
  for (const r of rows) ket.push((await r.getAttribute('aria-label')) ?? '');
  return ket;
}

function kiemTra(dieuKien, moTa) {
  console.log((dieuKien ? '✅ ' : '❌ ') + moTa);
  if (!dieuKien) coLoi = true;
}

{
  console.log('\n=== Test 1: HTML — gõ "<nu" ===');
  const trang = await taoTrangMoi();
  await goSachRoiGo(trang, '<nu');
  const goiY = await layGoiY(trang);
  console.log('Gợi ý:', goiY);
  kiemTra(goiY.some((g) => g.includes('nut') && g.includes('button')), 'Có gợi ý "nut → button"');
  await trang.close();
}

{
  console.log('\n=== Test 2: HTML — gõ "<button di" (vị trí thuộc tính) ===');
  const trang = await taoTrangMoi();
  await goSachRoiGo(trang, '<button di');
  const goiY = await layGoiY(trang);
  console.log('Gợi ý:', goiY);
  kiemTra(goiY.some((g) => g.includes('dinh_danh') && g.includes(' id')), 'Có gợi ý "dinh_danh → id"');
  await trang.close();
}

{
  console.log('\n=== Test 3: CSS — gõ ".x { ne" ===');
  const trang = await taoTrangMoi();
  await goSachRoiGo(trang, '.x { ne', 'style.css');
  const goiY = await layGoiY(trang);
  console.log('Gợi ý:', goiY);
  kiemTra(goiY.some((g) => g.includes('nen') && g.includes('background')), 'Có gợi ý "nen → background"');
  await trang.close();
}

{
  console.log('\n=== Test 4: CSS — gõ "than-" (vị trí bộ chọn, ngoài khối) ===');
  const trang = await taoTrangMoi();
  await goSachRoiGo(trang, 'than-', 'style.css');
  const goiY = await layGoiY(trang);
  console.log('Gợi ý:', goiY);
  kiemTra(goiY.some((g) => g.includes('than-trang') && g.includes('body')), 'Có gợi ý "than-trang → body" ở vị trí bộ chọn');
  await trang.close();
}

{
  console.log('\n=== Test 5: JS — gõ "in_ra" ===');
  const trang = await taoTrangMoi();
  await goSachRoiGo(trang, 'in_ra', 'script.js');
  const goiY = await layGoiY(trang);
  console.log('Gợi ý:', goiY);
  kiemTra(goiY.some((g) => g.includes('in_ra_console') && g.includes('console.log')), 'Có gợi ý "in_ra_console → console.log"');
  await trang.close();
}

{
  console.log('\n=== Test 6: JS — gõ "cons" vẫn có gợi ý "const" chuẩn của Monaco ===');
  const trang = await taoTrangMoi();
  await goSachRoiGo(trang, 'cons', 'script.js');
  const goiY = await layGoiY(trang);
  console.log('Gợi ý:', goiY);
  kiemTra(goiY.some((g) => g.includes('const')), 'Vẫn có gợi ý chuẩn "const" từ Monaco (không bị mất do provider tiếng Việt)');
  await trang.close();
}

console.log('\n============================');
console.log(coLoi ? '❌ CÓ TEST THẤT BẠI' : '✅ TẤT CẢ TEST ĐỀU ĐẠT');
if (coLoi) process.exitCode = 1;

await trinhDuyet.close();
