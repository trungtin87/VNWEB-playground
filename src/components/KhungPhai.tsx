import { useEffect, useRef, useState } from 'react';

interface DongConsole {
  loai: 'thuong' | 'canh-bao' | 'loi';
  noiDung: string;
}

interface Props {
  taiLieuHtml: string;
}

export default function KhungPhai({ taiLieuHtml }: Props) {
  const [cacDong, setCacDong] = useState<DongConsole[]>([]);
  const [thuGon, setThuGon] = useState(false);
  const [chieuCaoConsole, setChieuCaoConsole] = useState(150);
  const dangKeoRef = useRef(false);
  const khungPhaiRef = useRef<HTMLDivElement>(null);

  // Xoá console mỗi khi chạy lại (tài liệu preview thay đổi)
  useEffect(() => {
    setCacDong([]);
  }, [taiLieuHtml]);

  useEffect(() => {
    function xuLy(suKien: MessageEvent) {
      const duLieu = suKien.data;
      if (!duLieu || duLieu.nguon !== 'vnweb-console') return;
      setCacDong((truoc) => [...truoc, { loai: duLieu.loai, noiDung: duLieu.noiDung }]);
    }
    window.addEventListener('message', xuLy);
    return () => window.removeEventListener('message', xuLy);
  }, []);

  const batDauKeo = (e: React.PointerEvent) => {
    dangKeoRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const ketThucKeo = () => {
    dangKeoRef.current = false;
  };
  const dangKeo = (e: React.PointerEvent) => {
    if (!dangKeoRef.current || !khungPhaiRef.current) return;
    e.preventDefault();
    const hcn = khungPhaiRef.current.getBoundingClientRect();
    let caoMoi = hcn.bottom - e.clientY;
    caoMoi = Math.max(32, Math.min(caoMoi, hcn.height - 100));
    setChieuCaoConsole(caoMoi);
    if (thuGon) setThuGon(false);
  };

  return (
    <div className="khung-phai" ref={khungPhaiRef}>
      <div className="thanh-xem-truoc">
        <div className="cham-trinh-duyet"><span /><span /><span /></div>
        <span>Xem trước trực tiếp</span>
        <span />
      </div>
      <iframe title="xem-truoc" className="khung-xem-truoc" srcDoc={taiLieuHtml} sandbox="allow-scripts allow-modals" />

      <div
        className="tay-keo-ngang"
        onPointerDown={batDauKeo}
        onPointerUp={ketThucKeo}
        onPointerMove={dangKeo}
      />

      <div className="bang-console" style={{ height: thuGon ? 32 : chieuCaoConsole }}>
        <div className="tieu-de-console" onClick={() => setThuGon((t) => !t)}>
          <span>{thuGon ? '▸' : '▾'} BẢNG ĐIỀU KHIỂN (console.log)</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCacDong([]);
            }}
          >
            Xoá
          </button>
        </div>
        {!thuGon && (
          <div className="noi-dung-console">
            {cacDong.map((d, i) => (
              <div key={i} className={'dong-console ' + (d.loai === 'loi' ? 'loi' : d.loai === 'canh-bao' ? 'canh-bao' : 'thuong')}>
                <span className="nhan">›</span>
                {d.noiDung}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
