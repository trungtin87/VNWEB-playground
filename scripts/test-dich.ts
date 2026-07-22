import { datDuongDanGoc } from '../src/engine/treeSitterEngine.ts';
import { dichMa } from '../src/engine/dich.ts';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const thuMucPublic = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public') + path.sep;
datDuongDanGoc(thuMucPublic);

const mauHtmlVi = `<tieu-de-1>Xin chào, VNWEB!</tieu-de-1>
<doan-van>Học <in-dam>HTML</in-dam>.</doan-van>
<nut dinh_danh="nut-thu">Bấm vào đây</nut>`;

const mauCssVi = `than-trang {
  phong_chu: sans-serif;
  mau_chu: #2b2b2b;
}
#nut-thu {
  nen: #3c9c8f;
  con_tro: con_tro_tay;
  noi_dung: "auto";
}`;

const mauJsVi = `hang_so a = tai_lieu.lay_theo_id('nut-thu-nghiem');
// ghi chu co chua tu thu va nen, khong duoc dich
neu (a) {
  in_ra_console('Xin chao', a);
}`;

async function kiemTraHtml() {
  console.log('=========== HTML: Việt -> Chuẩn ===========');
  const std = await dichMa('html', mauHtmlVi, 'vi2std');
  console.log(std);

  console.log('\n=========== HTML: Chuẩn -> Việt (dịch ngược lại) ===========');
  const vi = await dichMa('html', std, 'std2vi');
  console.log(vi);
}

async function kiemTraCss() {
  console.log('\n=========== CSS: Việt -> Chuẩn ===========');
  const std = await dichMa('css', mauCssVi, 'vi2std');
  console.log(std);
  console.log('   (kỳ vọng: noi_dung: "auto"  ->  content: "auto"  — chuỗi "auto" KHÔNG bị dịch)');

  console.log('\n=========== CSS: Chuẩn -> Việt ===========');
  const vi = await dichMa('css', std, 'std2vi');
  console.log(vi);
}

async function kiemTraJs() {
  console.log('\n=========== JS: Việt -> Chuẩn ===========');
  const std = await dichMa('js', mauJsVi, 'vi2std');
  console.log(std);
  console.log("   (kỳ vọng: chuỗi 'nut-thu-nghiem' và ghi chú KHÔNG bị đụng vào dù chứa 'thu'/'nen')");

  console.log('\n=========== JS: Chuẩn -> Việt (kiểm tra ghép console.log) ===========');
  const vi = await dichMa('js', std, 'std2vi');
  console.log(vi);

  console.log('\n=========== JS: Roundtrip Việt -> Chuẩn -> Việt -> Chuẩn ===========');
  const std2 = await dichMa('js', vi, 'vi2std');
  console.log(std2);
  console.log(std2.trim() === std.trim() ? '✅ Roundtrip khớp tuyệt đối' : '❌ Roundtrip LỆCH!');
}

await kiemTraHtml();
await kiemTraCss();
await kiemTraJs();
