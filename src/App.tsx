import { useCallback, useEffect, useRef, useState } from 'react';
import TrinhSoanThao, { type NgonNguMonaco } from './components/TrinhSoanThao';
import KhungPhai from './components/KhungPhai';
import { dichMa, type HuongDich, type NgonNguDich } from './engine/dich';
import { taoTaiLieuXemTruoc } from './engine/xayDungTaiLieu';
import { mauVi, mauChuan } from './data/mauCode';
import './App.css';

type TenTab = 'html' | 'css' | 'js';
type CheDo = 'vi' | 'en';

const NGON_NGU_MONACO: Record<TenTab, NgonNguMonaco> = {
  html: 'html',
  css: 'css',
  js: 'javascript',
};

const TEN_HIEN_THI: Record<TenTab, string> = {
  html: 'index.html',
  css: 'style.css',
  js: 'script.js',
};

export default function App() {
  const [cheDoNgonNgu, setCheDoNgonNgu] = useState<CheDo>('vi');
  const [tabHienTai, setTabHienTai] = useState<TenTab>('html');
  const [maNguon, setMaNguon] = useState<Record<TenTab, string>>({ ...mauVi });
  const [maGuong, setMaGuong] = useState<Record<TenTab, string>>({ html: '', css: '', js: '' });
  const [dangDoiCheDo, setDangDoiCheDo] = useState(false);
  const [xemSongSong, setXemSongSong] = useState(false);
  const [tuDongChay, setTuDongChay] = useState(true);
  const [taiLieuPreview, setTaiLieuPreview] = useState('');
  const [chieuRongTrai, setChieuRongTrai] = useState(46);

  const bomDemGuong = useRef<Record<TenTab, ReturnType<typeof setTimeout> | null>>({
    html: null,
    css: null,
    js: null,
  });
  const bomDemChay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dangKeoChiaRef = useRef(false);
  const khungChinhRef = useRef<HTMLDivElement>(null);

  // ===== Dịch mã hiện tại (theo chiều hiện tại) sang mã CHUẨN — dùng chung cho preview & tải xuống =====
  const layMaChuan = useCallback(
    async (nguon: Record<TenTab, string>, cheDo: CheDo) => {
      if (cheDo === 'en') return nguon; // đã là chuẩn sẵn, không cần dịch
      const [html, css, js] = await Promise.all([
        dichMa('html', nguon.html, 'vi2std'),
        dichMa('css', nguon.css, 'vi2std'),
        dichMa('js', nguon.js, 'vi2std'),
      ]);
      return { html, css, js };
    },
    [],
  );

  const chayLai = useCallback(async () => {
    const chuan = await layMaChuan(maNguon, cheDoNgonNgu);
    setTaiLieuPreview(taoTaiLieuXemTruoc(chuan.html, chuan.css, chuan.js, true));
  }, [maNguon, cheDoNgonNgu, layMaChuan]);

  // Tự động chạy lại (có trễ) mỗi khi mã nguồn hoặc chế độ thay đổi
  useEffect(() => {
    if (!tuDongChay) return;
    if (bomDemChay.current) clearTimeout(bomDemChay.current);
    bomDemChay.current = setTimeout(() => { chayLai(); }, 450);
    return () => { if (bomDemChay.current) clearTimeout(bomDemChay.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maNguon, cheDoNgonNgu, tuDongChay]);

  // Chạy lần đầu khi tải trang
  useEffect(() => { chayLai(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cập nhật khung gương (chế độ song song) — có trễ nhẹ, riêng cho từng tab
  const capNhatMotGuong = useCallback(async (tab: TenTab, noiDung: string, cheDo: CheDo) => {
    const huong: HuongDich = cheDo === 'vi' ? 'vi2std' : 'std2vi';
    const ketQua = await dichMa(tab as NgonNguDich, noiDung, huong);
    setMaGuong((truoc) => ({ ...truoc, [tab]: ketQua }));
  }, []);

  useEffect(() => {
    if (!xemSongSong) return;
    (['html', 'css', 'js'] as TenTab[]).forEach((tab) => {
      if (bomDemGuong.current[tab]) clearTimeout(bomDemGuong.current[tab]!);
      bomDemGuong.current[tab] = setTimeout(() => capNhatMotGuong(tab, maNguon[tab], cheDoNgonNgu), 200);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maNguon, cheDoNgonNgu, xemSongSong]);

  const suaMaNguon = (tab: TenTab, giaTri: string) => {
    setMaNguon((truoc) => ({ ...truoc, [tab]: giaTri }));
  };

  const doiCheDo = async (cheDoMoi: CheDo) => {
    if (cheDoMoi === cheDoNgonNgu || dangDoiCheDo) return;
    setDangDoiCheDo(true);
    try {
      const huong: HuongDich = cheDoMoi === 'en' ? 'vi2std' : 'std2vi';
      const [html, css, js] = await Promise.all([
        dichMa('html', maNguon.html, huong),
        dichMa('css', maNguon.css, huong),
        dichMa('js', maNguon.js, huong),
      ]);
      setMaNguon({ html, css, js });
      setCheDoNgonNgu(cheDoMoi);
    } finally {
      setDangDoiCheDo(false);
    }
  };

  const datLai = () => {
    if (!confirm('Đặt lại về mã mẫu ban đầu? Mọi thay đổi hiện tại sẽ mất.')) return;
    setMaNguon({ ...(cheDoNgonNgu === 'vi' ? mauVi : mauChuan) });
  };

  const trangTrong = () => {
    if (!confirm('Xoá sạch cả 3 ô (HTML, CSS, JS) để bắt đầu từ trang trống? Mọi thay đổi hiện tại sẽ mất.')) return;
    setMaNguon({ html: '', css: '', js: '' });
  };

  const taiXuong = async () => {
    const chuan = await layMaChuan(maNguon, cheDoNgonNgu);
    const noiDung = taoTaiLieuXemTruoc(chuan.html, chuan.css, chuan.js, false);
    const blob = new Blob([noiDung], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vnweb-playground.html';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // ===== Kéo giãn khung trái/phải =====
  const batDauKeoChia = (e: React.PointerEvent) => {
    dangKeoChiaRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const ketThucKeoChia = () => { dangKeoChiaRef.current = false; };
  const dangKeoChia = (e: React.PointerEvent) => {
    if (!dangKeoChiaRef.current) return;
    e.preventDefault();
    const phanTram = (e.clientX / window.innerWidth) * 100;
    if (phanTram > 20 && phanTram < 80) setChieuRongTrai(phanTram);
  };

  return (
    <div className="ung-dung">
      <header className="thanh-tieu-de">
        <div className="logo">
          <strong>VNWEB Playground</strong>
          <span className="the-version">v2 · Monaco + tree-sitter</span>
        </div>
        <div className="thanh-cong-cu">
          <div className="chon-che-do">
            <button className={cheDoNgonNgu === 'vi' ? 'dang-chon' : ''} onClick={() => doiCheDo('vi')} disabled={dangDoiCheDo}>
              🇻🇳 Tiếng Việt
            </button>
            <button className={cheDoNgonNgu === 'en' ? 'dang-chon' : ''} onClick={() => doiCheDo('en')} disabled={dangDoiCheDo}>
              🇬🇧 Tiếng Anh
            </button>
          </div>
          <label className="cong-tac">
            <input type="checkbox" checked={xemSongSong} onChange={(e) => setXemSongSong(e.target.checked)} />
            Xem song song
          </label>
          <label className="cong-tac">
            <input type="checkbox" checked={tuDongChay} onChange={(e) => setTuDongChay(e.target.checked)} />
            Tự động chạy
          </label>
          <button onClick={chayLai}>▶ Chạy</button>
          <button onClick={trangTrong}>📄 Trang trống</button>
          <button onClick={datLai}>↺ Đặt lại</button>
          <button className="nut-chinh" onClick={taiXuong}>⇩ Tải xuống</button>
          {dangDoiCheDo && <span className="dang-xu-ly">Đang dịch lại mã…</span>}
        </div>
      </header>

      <div className="day-tab">
        {(['html', 'css', 'js'] as TenTab[]).map((tab) => (
          <button key={tab} className={'the-tab' + (tabHienTai === tab ? ' dang-chon' : '')} onClick={() => setTabHienTai(tab)}>
            {TEN_HIEN_THI[tab]}
          </button>
        ))}
      </div>

      <main className="khung-chinh" ref={khungChinhRef}>
        <div className="khung-trai" style={{ width: chieuRongTrai + '%' }}>
          <div className="nua nua-soan-thao">
            {xemSongSong && <div className="nhan-nua">✏️ Đang gõ ({cheDoNgonNgu === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'})</div>}
            <TrinhSoanThao
              ngonNgu={NGON_NGU_MONACO[tabHienTai]}
              giaTri={maNguon[tabHienTai]}
              onThayDoi={(v) => suaMaNguon(tabHienTai, v)}
            />
          </div>
          {xemSongSong && (
            <div className="nua nua-guong">
              <div className="nhan-nua">🔒 Mã {cheDoNgonNgu === 'vi' ? 'chuẩn' : 'tiếng Việt'} (tự động dịch, chỉ đọc)</div>
              <TrinhSoanThao ngonNgu={NGON_NGU_MONACO[tabHienTai]} giaTri={maGuong[tabHienTai]} chiDoc />
            </div>
          )}
        </div>

        <div className="tay-keo" onPointerDown={batDauKeoChia} onPointerUp={ketThucKeoChia} onPointerMove={dangKeoChia} />

        <KhungPhai taiLieuHtml={taiLieuPreview} />
      </main>
    </div>
  );
}
