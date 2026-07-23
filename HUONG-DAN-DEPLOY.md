# VNWEB Playground v2 — Hướng dẫn build & deploy

## 1. Cài đặt lần đầu

```bash
npm install
```

## 2. Chạy thử trên máy (không bắt buộc, nhưng nên làm trước khi deploy)

```bash
npm run dev
```
Mở trình duyệt theo địa chỉ hiện ra (thường là http://localhost:5173/VNWEB-playground/).

## 3. Build bản production

```bash
npm run build
```

Kết quả nằm trong thư mục `dist/`. Đây là toàn bộ nội dung cần đưa lên GitHub Pages —
không cần `node_modules`, không cần mã nguồn `.ts/.tsx`.

Có thể kiểm tra lại bản build bằng:
```bash
npm run preview
```

## 4. Deploy lên GitHub Pages

Repo của bạn: `trungtin87/VNWEB-playground`, địa chỉ đích:
`https://trungtin87.github.io/VNWEB-playground/`

`base: '/VNWEB-playground/'` đã được cấu hình sẵn trong `vite.config.ts` khớp đúng tên
repo — **nếu sau này đổi tên repo, phải sửa lại giá trị này rồi build lại.**

Cách deploy (chọn 1 trong 2 tuỳ bạn đang cấu hình GitHub Pages theo kiểu nào):

**Cách A — dùng nhánh `gh-pages` riêng (khuyên dùng, tách biệt code và bản build):**
```bash
npm run deploy
```
(Script này đã có sẵn trong `package.json`: tự build rồi đẩy nội dung `dist/` lên nhánh
`gh-pages`. Gói `gh-pages` đã được thêm sẵn vào `devDependencies`, không cần cài thêm gì.)

Sau đó vào Settings → Pages → Source: chọn nhánh `gh-pages`, thư mục `/ (root)`.

**Cách B — copy thủ công vào nhánh đang deploy:**
```bash
npm run build
# copy toàn bộ nội dung trong dist/ vào đúng nhánh/thư mục mà GitHub Pages
# đang đọc (vd nhánh main, thư mục /docs, hoặc nhánh gh-pages) rồi commit + push
```

## 5. Lưu ý khi test cục bộ

Vì `base` được đặt là `/VNWEB-playground/`, khi chạy `npm run dev` hoặc `npm run preview`,
trang sẽ KHÔNG hiện ở địa chỉ gốc `/` — phải vào đúng `/VNWEB-playground/` mới thấy.
Đây là hành vi đúng, mô phỏng chính xác cách GitHub Pages sẽ phục vụ trang.

## 6. Các file quan trọng nếu muốn tuỳ chỉnh thêm

- `src/dic/html.json`, `css.json`, `js.json` — từ điển 1:1, thêm/sửa tự do (chỉ cần
  `"mã_chuẩn": "cụm từ tiếng Việt có dấu"`, chương trình tự sinh các cách gõ khác).
- `src/data/mauCode.ts` — mã mẫu ban đầu (cả bản tiếng Việt lẫn chuẩn).
- `src/engine/dich.ts` — bộ máy dịch dựa trên AST (tree-sitter).
- `src/engine/autocomplete.ts` — logic gợi ý IntelliSense tiếng Việt.
- `vite.config.ts` — cấu hình `base` path và PWA (tên app, icon, màu sắc...).

## 7. Bộ test đi kèm (không bắt buộc chạy, nhưng hữu ích nếu chỉnh sửa code)

```bash
npx tsx scripts/test-dich.ts              # test engine dịch (thuần, không cần trình duyệt)
npx tsx scripts/test-ngu-canh-goi-y.ts    # test logic autocomplete (thuần)

# 2 test dưới đây cần Playwright + server đang chạy ở cổng 4173:
npx playwright install chromium   # (chỉ cần 1 lần, nếu máy bạn chưa có)
npm run build && npm run preview &
npx playwright test    # hoặc: node scripts/test-giai-doan-4.mjs / test-autocomplete.mjs
```
