export const mauVi = {
  html: `<tieu-de-1>Xin chào, VNWEB!</tieu-de-1>
<doan-van>Đây là sân chơi để bạn học <in-dam>HTML</in-dam>, <in-dam>CSS</in-dam> và <in-dam>JavaScript</in-dam> bằng <in-dam>tiếng Việt</in-dam>.</doan-van>
<nut dinh_danh="nut-thu">Bấm vào đây</nut>
<doan-van dinh_danh="ket-qua">Số lần bấm: 0</doan-van>`,

  css: `than-trang {
  phong_chu: sans-serif;
  khoang_cach_trong: 24px;
  mau_chu: #2b2b2b;
}

tieu-de-1 {
  mau_chu: #c1440e;
}

#nut-thu {
  khoang_cach_trong: 8px 16px;
  vien: none;
  bo_goc: 6px;
  nen: #3c9c8f;
  mau_chu: trang;
  do_dam_chu: dam;
  con_tro: con_tro_tay;
}`,

  js: `bien so_lan_bam = 0;
hang_so nut_thu = tai_lieu.lay_theo_id('nut-thu');
hang_so ket_qua = tai_lieu.lay_theo_id('ket-qua');

nut_thu.khi_su_kien('click', ham () {
  so_lan_bam = so_lan_bam + 1;
  ket_qua.noi_dung_chu = 'Số lần bấm: ' + so_lan_bam;
  in_ra_console('Đã bấm nút, tổng số lần:', so_lan_bam);
});`,
};

export const mauChuan = {
  html: `<h1>Xin chào, VNWEB!</h1>
<p>Đây là sân chơi để bạn học <strong>HTML</strong>, <strong>CSS</strong> và <strong>JavaScript</strong> bằng <strong>tiếng Việt</strong>.</p>
<button id="nut-thu">Bấm vào đây</button>
<p id="ket-qua">Số lần bấm: 0</p>`,

  css: `body {
  font-family: sans-serif;
  padding: 24px;
  color: #2b2b2b;
}

h1 {
  color: #c1440e;
}

#nut-thu {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #3c9c8f;
  color: white;
  font-weight: bold;
  cursor: pointer;
}`,

  js: `let soLanBam = 0;
const nutThu = document.getElementById('nut-thu');
const ketQua = document.getElementById('ket-qua');

nutThu.addEventListener('click', function () {
  soLanBam = soLanBam + 1;
  ketQua.textContent = 'Số lần bấm: ' + soLanBam;
  console.log('Đã bấm nút, tổng số lần:', soLanBam);
});`,
};
