# VietNews 24h - Vue 3 News Platform

Project tin tức dùng Vue 3 + Vite + Pinia + Vue Router + Tailwind CSS, tối ưu cho:

- kiến trúc dễ mở rộng
- SEO web tin tức
- bảo mật frontend
- đa ngôn ngữ VI/EN
- tách UI và logic rõ ràng

## 1. Yêu cầu môi trường

- Node.js 20+
- npm 10+

## 2. Cài đặt và chạy

```bash
npm install
npm run dev
```

Build production:

```bash
npm run build
npm run preview
```

## 3. Cấu trúc thư mục

```text
src/
├── api/            # HTTP client, interceptor
├── assets/         # ảnh tĩnh
├── components/     # UI component tái sử dụng
├── composables/    # logic dùng lại (locale, debounce...)
├── config/         # cấu hình app/api/auth
├── constants/      # hằng số toàn cục
├── data/           # dữ liệu mock
├── directives/     # directive dùng chung
├── layouts/        # layout khung trang
├── locales/        # i18n vi/en
├── pages/          # route pages (không gọi API trực tiếp)
├── plugins/        # plugin i18n, directives
├── router/         # cấu hình route + guard
├── services/       # gọi API + mapping dữ liệu
├── stores/         # state/loading/error/cache
├── styles/         # style global
└── utils/          # SEO, sanitize, slug, date, error...
```

## 4. Luồng gọi API chuẩn

`Page/Component -> Store -> Service -> API (.NET) -> Store -> UI`

- `pages`: chỉ orchestration UI + gọi action store
- `stores`: quản lý state, loading/error, cache key
- `services`: gọi API, chuẩn hóa dữ liệu, fallback an toàn
- `components`: chỉ render, hạn chế business logic

## 5. SEO đã tích hợp

- Dynamic `title`, `description`, `keywords`
- Canonical URL theo route + query quan trọng
- `og:*`, `twitter:*`
- `hreflang` `vi-VN` / `en-US` + `x-default`
- JSON-LD: `WebSite`, `CollectionPage`, `BreadcrumbList`, `NewsArticle`
- `robots.txt`, `sitemap.xml`, `news-sitemap.xml` (build-time)
- URL slug thân thiện SEO
- Heading H1/H2/H3 rõ ràng theo trang
- Ảnh có `alt`, `loading="lazy"`
- Trang `404` có meta `noindex`

Lưu ý: Nếu cần SEO social preview rất mạnh cho link chi tiết (Facebook/Zalo) nên dùng SSR/Prerender ở tầng deploy.

## 6. Bảo mật frontend

- Sanitize HTML bằng `DOMPurify` trước `v-html`
- Chặn tag/attr nguy hiểm (`script`, `iframe`, `style`, `srcset`...)
- Chặn URL không an toàn trong `href/src`
- Chuẩn hóa input tìm kiếm để giảm nguy cơ XSS/query bẩn
- Axios interceptor chuẩn hóa lỗi, xử lý `401`
- Token session lưu in-memory (không hard-code secret trong code)

## 7. Đa ngôn ngữ VI/EN

- Dùng `vue-i18n`
- File ngôn ngữ:
  - `src/locales/vi.json`
  - `src/locales/en.json`
- Nút chuyển ngôn ngữ: `components/ui/LanguageSwitcher.vue`
- Lưu locale đã chọn vào `localStorage` (`vietnews_locale`)
- Đổi ngôn ngữ không làm mất route hiện tại
- SEO meta/hreflang đổi theo locale
- Dữ liệu API hỗ trợ song ngữ thì lấy theo locale qua `getLocalizedContent()`, nếu không có thì fallback dữ liệu hiện tại

## 8. Biến môi trường

Xem `.env.example`:

```env
VITE_APP_NAME=VietNews 24h
VITE_APP_URL=https://example.com
VITE_API_BASE_URL=http://localhost:5000/api
VITE_USE_MOCK_API=false
VITE_API_ALLOW_MOCK_FALLBACK=false
VITE_API_TIMEOUT=12000
VITE_API_WITH_CREDENTIALS=false
VITE_API_CSRF_ENABLED=false
VITE_API_CSRF_COOKIE_NAME=XSRF-TOKEN
VITE_API_CSRF_HEADER_NAME=X-CSRF-TOKEN
VITE_API_CSRF_META_NAME=csrf-token
VITE_NEWS_CACHE_TTL_MS=60000
VITE_AUTH_TOKEN_TYPE=Bearer
VITE_AUTH_LOGIN_ENDPOINT=/auth/login
VITE_AUTH_REFRESH_ENDPOINT=/auth/refresh
VITE_AUTH_LOGOUT_ENDPOINT=/auth/logout
VITE_AUTH_LOGIN_PATH=/
VITE_AUTH_REFRESH_BEFORE_EXPIRES_MS=60000
VITE_AUTH_REFRESH_USES_COOKIE=false
```

## 9. Kết nối backend .NET Framework 4

1. Giữ `VITE_USE_MOCK_API=false` để gọi backend thật. Chỉ bật `true` khi cần demo/mock offline.
2. Giữ `VITE_API_ALLOW_MOCK_FALLBACK=false` ở production để API lỗi không âm thầm hiện dữ liệu demo.
3. Cập nhật `VITE_API_BASE_URL`
4. Đồng bộ payload API với mapper trong:
   - `src/services/newsMapper.js`
   - `src/services/categoryMapper.js`
4. Kiểm tra auth endpoints trong `.env`

## 10. Luồng SEO và deploy IIS

Project hiện tại là Vue SPA dùng `createWebHistory()`. Luồng chạy:

```text
Browser -> IIS static files -> dist/index.html -> dist/assets/*.js -> Vue Router -> Store -> Service/API -> UI + SEO meta
```

Khi build production:

```bash
npm run build
```

Vite tạo thư mục `dist/`. Chỉ copy nội dung trong `dist/` lên IIS. Không copy `node_modules`, `src`, `.env`.

File `public/web.config` sẽ được copy vào `dist/web.config` khi build. File này giúp các URL như `/tin-tuc/slug-bai-viet` refresh trực tiếp không bị IIS trả 404.

SEO hiện có:

- `index.html` có meta mặc định, canonical, Open Graph, Twitter Card.
- `src/utils/seoHelper.js` cập nhật `title`, `description`, canonical, hreflang theo route.
- Trang chủ, danh mục, danh sách tin, chi tiết tin có JSON-LD.
- `npm run build` chạy `scripts/generate-sitemap.mjs` để sinh `sitemap.xml`, `news-sitemap.xml`, `robots.txt`.

Muốn SEO mạnh hơn cho web tin tức:

- Đổi `VITE_APP_URL` thành domain thật trước khi build.
- Đổi `VITE_USE_MOCK_API=false` và trỏ `VITE_API_BASE_URL` về API production.
- Sitemap nên lấy danh mục/tin từ backend thật, không chỉ từ `src/data`.
- Nếu cần Google, Facebook, Zalo đọc nội dung bài viết chắc hơn, dùng prerender hoặc chuyển sang SSR/Nuxt.
- Ảnh OG nên dùng ảnh PNG/JPG kích thước khoảng `1200x630`, không nên chỉ dùng SVG mặc định.

## 11. Đưa project lên GitHub

Repo đích:

```text
https://github.com/ntrong22/vue-project-fist-2026
```

Chạy trong thư mục project:

```bash
git init
git branch -M main
git add .
git commit -m "Initial Vue news project"
git remote add origin https://github.com/ntrong22/vue-project-fist-2026.git
git push -u origin main
```

Nếu repo đã có commit sẵn trên GitHub:

```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

Trước khi push nên kiểm tra:

```bash
git status
git check-ignore -v node_modules dist .env
```

Các file nên push: `src`, `public`, `scripts`, `index.html`, `package.json`, `package-lock.json`, config Vite/Tailwind/PostCSS, `README.md`, `.env.example`.

Các file không nên push: `node_modules`, `dist`, `.env`.
