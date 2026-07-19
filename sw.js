// Service worker của VNWEB Playground
// Mục đích: giúp trình duyệt (đặc biệt Android/Chrome) nhận trang là "có thể cài đặt",
// đồng thời lưu tạm trang chính để mở lại nhanh hơn / khi mất mạng.

const TEN_BO_NHO_DEM = 'vnweb-playground-v1';
const CAC_TEP_CAN_LUU = ['./', './index.html'];

self.addEventListener('install', (su_kien) => {
  self.skipWaiting();
  su_kien.waitUntil(
    caches.open(TEN_BO_NHO_DEM).then((bo_nho_dem) => bo_nho_dem.addAll(CAC_TEP_CAN_LUU))
  );
});

self.addEventListener('activate', (su_kien) => {
  su_kien.waitUntil(
    caches.keys().then((danh_sach) =>
      Promise.all(
        danh_sach
          .filter((ten) => ten !== TEN_BO_NHO_DEM)
          .map((ten) => caches.delete(ten))
      )
    )
  );
  self.clients.claim();
});

// Chiến lược: ưu tiên mạng, nếu mất mạng thì lấy từ bộ nhớ đệm (chỉ áp dụng cho tệp cùng nguồn gốc)
self.addEventListener('fetch', (su_kien) => {
  if (su_kien.request.method !== 'GET') return;
  if (new URL(su_kien.request.url).origin !== self.location.origin) return;

  su_kien.respondWith(
    fetch(su_kien.request)
      .then((phan_hoi) => {
        const ban_sao = phan_hoi.clone();
        caches.open(TEN_BO_NHO_DEM).then((bo_nho_dem) => bo_nho_dem.put(su_kien.request, ban_sao));
        return phan_hoi;
      })
      .catch(() => caches.match(su_kien.request))
  );
});
