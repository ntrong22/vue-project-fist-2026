# PROJECT_FLOW - Tổng hợp full luồng project

Tài liệu này phân tích project hiện tại theo code thực tế trong thư mục `G:\VUEJS-NEW\pro-vue-01`.

# Mở đầu: Luồng truy cập web sau khi dọn project

Mục tiêu đọc nhanh: Project hiện tại chạy bằng Nuxt 3 SSR/SSG. Khi người dùng hoặc Googlebot mở một URL, request đi qua lớp Nuxt ở root trước, sau đó mới vào các view nghiệp vụ trong `src/pages`. Các thư mục đã dọn như `.nuxt`, `.output`, `dist`, `127.0.0.1` đều là cache/output hoặc legacy output, không phải nơi sửa logic hằng ngày.

## Đường đi khi người dùng mở URL

```text
Browser hoặc Googlebot mở URL
Ví dụ: /tin-tuc/[slug], /danh-muc/[slug], /tim-kiem?q=...
↓
Môi trường chạy
- Dev: npm run dev → Nuxt dev server
- Production SSR/preview: npm run build → .output
- Production static: npm run generate → .output/public + public/web.config fallback cho IIS
↓
nuxt.config.js
- Bật ssr=true
- Đăng ký @pinia/nuxt, Tailwind/PostCSS, CSS global
- Cấu hình alias @ trỏ vào src
- Cấu hình app head mặc định, routeRules, Nitro prerender routes
↓
plugins/
- plugins/i18n.js: đăng ký i18n, đọc locale từ query/cookie
- plugins/directives.client.js: đăng ký directive chỉ chạy phía client
↓
middleware/route-sanitizer.global.js
- Sanitize page query, q query, slug bài viết/danh mục
- Redirect về URL sạch hoặc /404 nếu slug không hợp lệ
↓
app.vue
- Bọc toàn bộ app bằng src/layouts/MainLayout.vue
- NuxtPage là vị trí Nuxt gắn page theo URL
↓
pages/ ở root
- Nuxt file-based routing chọn wrapper theo URL
- Wrapper rất mỏng, chỉ import view thật từ src/pages
↓
src/pages/*View.vue
- View nghiệp vụ: HomeView, NewsListView, NewsDetailView, CategoryView, SearchView...
- onServerPrefetch nạp data trước khi Nuxt render HTML SSR/SSG
- useSeoHead/useStructuredDataHead ghi title/meta/canonical/schema vào HTML
↓
src/stores/
- Pinia giữ state/loading/error/cache
- View chỉ gọi action store, không gọi API trực tiếp
↓
src/services/ + src/api/
- service chuẩn hóa nghiệp vụ, cache/fallback, mapper
- nếu VITE_USE_MOCK_API=true: đọc src/data/news.js và src/data/categories.js
- nếu VITE_USE_MOCK_API=false: đi qua src/api/httpClient.js để gọi backend
↓
src/components/ + src/layouts/ + src/styles/
- Render giao diện, layout, header/footer, card, pagination, rich content
↓
HTML trả về cho browser/crawler
- Có nội dung, meta SEO, canonical, hreflang, JSON-LD trước khi client hydrate
```

## Bảng route, thư mục và file đi qua

| URL người dùng mở | Root `pages/` của Nuxt | View nghiệp vụ trong `src/pages` | Store/action chính | Service/data chính |
| ----------------- | ---------------------- | -------------------------------- | ------------------ | ------------------ |
| `/` | `pages/index.vue` | `src/pages/HomeView.vue` | `useNewsStore.fetchHomeNews()` | `newsService.getHomeNewsData()` → mock data hoặc API |
| `/tin-tuc` | `pages/tin-tuc/index.vue` | `src/pages/NewsListView.vue` | `useNewsStore.fetchNewsList()` | `newsService.getNewsList()` → danh sách tin + phân trang |
| `/tin-tuc/[slug]` | `pages/tin-tuc/[slug].vue` | `src/pages/NewsDetailView.vue` | `useNewsStore.fetchNewsDetail(slug)` | `newsService.getNewsDetailBySlug()` + `getRelatedNews()` |
| `/danh-muc/[slug]` | `pages/danh-muc/[slug].vue` | `src/pages/CategoryView.vue` | `useNewsStore.fetchCategoryNews()` | `newsService.getNewsByCategorySlug()` + category mapper |
| `/tim-kiem?q=...` | `pages/tim-kiem.vue` | `src/pages/SearchView.vue` | `useNewsStore.searchNews()` | `newsService.searchNews()`; query được sanitize trước |
| `/gioi-thieu` | `pages/gioi-thieu.vue` | `src/pages/AboutView.vue` | Không cần store chính | Nội dung tĩnh + SEO theo view |
| `/lien-he` | `pages/lien-he.vue` | `src/pages/ContactView.vue` | Không cần store chính | Nội dung tĩnh + SEO theo view |
| `/404` hoặc route sai | `pages/404.vue`, `pages/[...pathMatch].vue` | `src/pages/NotFoundView.vue` | Không cần store chính | SEO `noindex` |

## Ví dụ chi tiết khi mở bài viết

```text
/tin-tuc/mot-bai-viet
↓
middleware/route-sanitizer.global.js
- normalize slug: mot-bai-viet
- nếu slug bẩn hoặc rỗng thì redirect URL sạch hoặc /404
↓
pages/tin-tuc/[slug].vue
- wrapper Nuxt rất mỏng
- import src/pages/NewsDetailView.vue
↓
src/pages/NewsDetailView.vue
- đọc route.params.slug
- onServerPrefetch(loadNewsDetail) để SSR có data trước
- onMounted(loadNewsDetail) để client refresh khi cần
- watch slug/locale để đổi bài hoặc đổi ngôn ngữ
↓
useNewsStore.fetchNewsDetail(slug)
- set loading/error
- gọi newsService.getNewsDetailBySlug(slug)
- gọi newsService.getRelatedNews(newsDetail)
↓
src/services/newsService.js
- nếu mock: lấy từ src/data/news.js, src/data/categories.js
- nếu API thật: gọi src/api/httpClient.js đến backend
- normalize bằng newsMapper/categoryMapper
- fallback mock nếu API lỗi hoặc payload sai shape
↓
src/pages/NewsDetailView.vue render
- Breadcrumb, title, thumbnail, rich content, related news
- sanitizeHtml trước khi v-html nội dung bài viết
- useSeoHead ghi title, description, canonical, OG/Twitter
- useStructuredDataHead ghi BreadcrumbList + NewsArticle JSON-LD
↓
Nuxt trả HTML đã có nội dung + SEO
↓
Browser hydrate để NuxtLink, i18n, interaction chạy phía client
```

## Sau này muốn đổi thì sửa ở đâu

| Nhu cầu thay đổi | Sửa chính ở đâu | Lưu ý để không phá luồng |
| ---------------- | --------------- | ------------------------ |
| Đổi giao diện trang | `src/pages/*View.vue`, `src/components/`, `src/styles/main.css` | Không cần sửa root `pages/` nếu URL không đổi. |
| Đổi layout/header/footer/menu | `src/layouts/MainLayout.vue`, `src/components/layout/`, `src/data/categories.js` nếu menu theo danh mục | `app.vue` chỉ nên sửa khi đổi shell toàn app. |
| Thêm URL/trang mới | Tạo wrapper trong root `pages/`, tạo hoặc tái dùng view trong `src/pages` | Nếu muốn SSG/SEO mạnh, bổ sung routeRules/prerender trong `nuxt.config.js` khi cần. |
| Đổi API backend | `.env`, `src/config/apiConfig.js`, `src/api/httpClient.js`, `src/services/*Service.js` | Giữ page → store → service → api, không gọi API trực tiếp từ component. |
| Đổi dữ liệu mock | `src/data/news.js`, `src/data/categories.js` | Nhớ kiểm slug vì sitemap/prerender đọc data này. |
| Đổi SEO từng trang | `src/utils/seoHelper.js` và phần `useSeoHead` trong từng `*View.vue` | Default SEO nằm trong `nuxt.config.js`; dynamic SEO nằm trong view. |
| Đổi sitemap/robots | `scripts/generate-sitemap.mjs`, `public/robots.txt`, `public/news-sitemap.xml`, `public/sitemap.xml` | `npm run build` và `npm run generate` đều chạy script sitemap trước. |
| Đổi bảo vệ route/query | `middleware/route-sanitizer.global.js`, `src/utils/sanitizeHtml.js`, `src/utils/slugHelper.js` | Cẩn thận vì middleware chạy trước hầu hết page. |

## Trạng thái thư mục sau khi dọn

| Nhóm | File/thư mục | Trạng thái hiện tại | Ghi chú |
| ---- | ------------ | ------------------- | ------- |
| Core Nuxt runtime | `app.vue`, `pages/`, `middleware/`, `plugins/`, `nuxt.config.js` | Giữ | Đây là lớp request đi qua trước. |
| Nghiệp vụ app | `src/pages/`, `src/stores/`, `src/services/`, `src/api/`, `src/components/`, `src/utils/` | Giữ | Đây là nơi sửa tính năng hằng ngày. |
| Public/deploy | `public/`, `scripts/` | Giữ | Public assets, sitemap/robots, web.config và script build. |
| Generated/cache | `.nuxt/`, `.output/`, `dist/`, `127.0.0.1/` | Đã xóa, có thể sinh lại | `.nuxt`/`.output` do Nuxt sinh; `dist` là output cũ; `127.0.0.1` là cache lạc chỗ. |
| Dependency | `node_modules/` | Giữ local, ẩn trong VS Code | Xóa được nhưng phải chạy `npm install` lại. |
| Local config | `.env` | Giữ local, không commit | `.env.example` là mẫu nên vẫn giữ trong repo. |
| Legacy/tài liệu | `index.html`, `git-command-tabs.html`, `PROJECT_FLOW.md` | Giữ hoặc ẩn | `index.html` là entry SPA cũ; runtime Nuxt không đi qua file này. |

---

Lưu ý quan trọng:

- Project hiện tại đã chuyển sang **Nuxt 3 SSR/SSG** để tăng SEO, crawler có thể nhận HTML đã có content/title/meta/canonical/schema.
- Các file SPA cũ như `src/main.js`, `src/App.vue`, `src/router/index.js`, `index.html` chỉ còn là tham chiếu legacy, không còn là entry runtime chính khi chạy `npm run dev`, `npm run build` hoặc `npm run generate`.
- Cấu hình Vite/PostCSS root cũ đã được nhập vào `nuxt.config.js` để tránh warning external config của Nuxt.
- Không thấy backend, database, controller hoặc migration trong repo này.
- Database/stored procedure nếu có sẽ nằm ở backend ngoài project này. Cần kiểm tra thêm repo/API backend.
- Luồng nghiệp vụ chính vẫn giữ nguyên: view gọi store, store gọi service, service lấy mock data hoặc API thật theo cấu hình.

---

# 0. Cập nhật Nuxt SSR/SSG SEO

Runtime chính là Nuxt 3. Mục tiêu của lớp Nuxt là render HTML server/static cho SEO, còn cấu trúc nghiệp vụ trong `src/pages`, `src/stores`, `src/services`, `src/api` vẫn được giữ để không phá luồng chính.

## 0.1. Luồng runtime Nuxt hiện tại

```text
Request từ user hoặc Googlebot
↓
Nuxt/Nitro SSR hoặc HTML đã prerender
↓
app.vue
↓
src/layouts/MainLayout.vue
↓
pages/* wrapper theo file-based routing của Nuxt
↓
src/pages/*View.vue giữ màn hình cũ
↓
Pinia store
↓
service
↓
mock data hoặc API thật
↓
src/utils/seoHelper.js dùng useHead để ghi title/meta/canonical/hreflang/schema vào HTML server
↓
Hydration phía client
```

## 0.2. Luồng SSG/prerender

```text
npm run generate
↓
scripts/generate-sitemap.mjs sinh sitemap.xml, news-sitemap.xml, robots.txt
↓
nuxt generate
↓
nuxt.config.js đọc src/data/categories.js và src/data/news.js
↓
Nitro prerender routes: /, /tin-tuc, /danh-muc/[slug], /tin-tuc/[slug], /gioi-thieu, /lien-he
↓
.output/public chứa HTML tĩnh để deploy CDN/IIS/static hosting
```

## 0.3. File mới và vai trò

| File/thư mục | Vai trò hiện tại | Ghi chú SEO |
| ------------ | ---------------- | ----------- |
| `nuxt.config.js` | Bật SSR, cấu hình Pinia, Tailwind, head mặc định, routeRules, Nitro prerender routes. | Nơi kiểm soát SSG route theo category/news data. |
| `app.vue` | Root Nuxt app, bọc `NuxtPage` bằng layout chính. | Entry runtime mới thay cho SPA entry cũ. |
| `pages/` | Wrapper file-based routing của Nuxt cho các URL chính. | Giữ URL SEO cũ: `/tin-tuc/[slug]`, `/danh-muc/[slug]`,... |
| `plugins/i18n.js` | Đăng ký i18n cho Nuxt, đọc `lang` query hoặc cookie locale. | Giúp SSR render đúng ngôn ngữ ban đầu. |
| `plugins/directives.client.js` | Đăng ký directive chỉ chạy client. | Tránh lỗi DOM directive khi SSR. |
| `middleware/route-sanitizer.global.js` | Sanitize slug/query trên route Nuxt. | Giữ lớp bảo vệ URL từ router cũ. |
| `src/utils/seoHelper.js` | Build canonical, alternate locale, meta, JSON-LD; thêm helper reactive `useSeoHead`, `useStructuredDataHead`. | Đây là điểm chính đưa SEO vào HTML server. |
| `src/utils/sanitizeHtml.js` | Sanitize HTML bài viết bằng DOMPurify chạy được cả server/client. | Cho phép nội dung bài viết SSR an toàn. |
| `.output/public` | Output sau `npm run generate`. | Deploy thư mục này nếu muốn static SSG. |

## 0.4. Ghi chú giữ luồng chính

- Luồng màn hình không bị đổi: `HomeView`, `NewsListView`, `NewsDetailView`, `CategoryView`, `SearchView`, `AboutView`, `ContactView`, `NotFoundView` vẫn nằm trong `src/pages`.
- Luồng data không bị đổi: page gọi Pinia store, store gọi service, service gọi API/mock data.
- Luồng SEO đã đổi từ cập nhật DOM sau khi app chạy sang `useHead` reactive trong setup để Nuxt ghi title/meta/canonical/schema ngay vào HTML SSR/SSG.
- Trước khi build production cần đổi `VITE_APP_URL` từ `https://example.com` sang domain thật để canonical, sitemap, robots và JSON-LD đúng domain.
- `/tim-kiem` vẫn để `noindex, follow`; các trang bài viết/danh mục/trang chủ dùng `index, follow, max-image-preview:large`.

---

# 1. Tổng quan project

## 1.1. Project dùng công nghệ gì

Project là website tin tức chạy Nuxt 3 SSR/SSG, bên trong vẫn dùng Vue 3 component và Pinia store.

Công nghệ chính:

| Nhóm | Công nghệ | Vai trò |
| ---- | --------- | ------- |
| Frontend framework | Nuxt 3 + Vue 3 | SSR/SSG và xây dựng UI theo component |
| Build tool | Nuxt/Nitro/Vite | Dev server, build production, prerender static |
| Routing | Nuxt file-based routing | Quản lý route `/`, `/tin-tuc`, `/danh-muc/[slug]`, ... |
| State management | Pinia | Lưu state tin tức, danh mục, trạng thái app |
| HTTP client | Axios | Gọi API backend khi tắt mock |
| i18n | vue-i18n | Đa ngôn ngữ VI/EN |
| CSS | Tailwind CSS | Style utility class |
| HTML sanitize | isomorphic DOMPurify | Làm sạch HTML trước khi render bằng `v-html` trên server/client |
| SEO helper | Custom `src/utils/seoHelper.js` | Ghi title, meta, canonical, Open Graph, Twitter, JSON-LD bằng Nuxt `useHead` |
| Sitemap | `scripts/generate-sitemap.mjs` | Sinh `sitemap.xml`, `news-sitemap.xml`, `robots.txt` khi build |
| Deploy IIS/static | `public/web.config`, `.output/public` | Rewrite/serve route static Nuxt khi deploy SSG |

## 1.2. Mục đích chính của project

Project là một nền tảng tin tức tên `VietNews 24h`, có các chức năng:

- Hiển thị trang chủ tin tức.
- Hiển thị danh sách tin mới.
- Hiển thị tin theo danh mục.
- Hiển thị chi tiết bài viết.
- Tìm kiếm tin tức.
- Có trang giới thiệu, liên hệ, 404.
- Hỗ trợ tiếng Việt và tiếng Anh.
- Tối ưu SEO frontend: title, description, canonical, Open Graph, Twitter card, JSON-LD, robots, sitemap.
- Có chế độ mock data để chạy không cần backend.
- Có chế độ gọi API thật qua biến môi trường.

## 1.3. Cấu trúc tổng thể

Luồng kiến trúc chính:

```text
app.vue
↓
pages/*
↓
src/layouts/MainLayout.vue
↓
src/pages/*.vue
↓
src/stores/*.js
↓
src/services/*.js
↓
src/api/httpClient.js hoặc src/data/*.js
↓
src/components/*.vue
↓
Nuxt render HTML SSR/SSG + hydrate UI + ghi SEO head/schema
```

## 1.4. Luồng chạy chính từ lúc mở web/app đến khi xử lý dữ liệu

1. Browser hoặc crawler request URL như `/`, `/tin-tuc/:slug`, `/danh-muc/:slug`.
2. Nuxt/Nitro xử lý SSR hoặc trả HTML đã prerender trong `.output/public`.
3. `nuxt.config.js` áp dụng SSR, routeRules, Nitro prerender, CSS, Pinia và head mặc định.
4. `app.vue` render `MainLayout.vue` và `NuxtPage`.
5. Nuxt file-based routing chọn wrapper trong root `pages/`.
6. Wrapper gọi lại view chính trong `src/pages/*View.vue` để giữ luồng UI/nghiệp vụ cũ.
7. `plugins/i18n.js` đăng ký i18n server/client; `plugins/directives.client.js` chỉ đăng ký directive trên client.
8. `middleware/route-sanitizer.global.js` sanitize slug/query trước khi vào page.
9. Page con như `HomeView.vue`, `NewsListView.vue`, `CategoryView.vue`, `NewsDetailView.vue` gọi Pinia store bằng `onServerPrefetch` + client hydrate.
10. Store gọi service.
11. Service lấy dữ liệu từ:
    - `src/data/news.js`, `src/data/categories.js` nếu `VITE_USE_MOCK_API=true`.
    - API thật nếu `VITE_USE_MOCK_API=false`.
12. Service chuẩn hóa dữ liệu bằng mapper.
13. Store lưu dữ liệu, loading, error, pagination.
14. Page truyền dữ liệu xuống component để render.
15. Page ghi SEO bằng `useSeoHead()` và JSON-LD bằng `useStructuredDataHead()` để title/meta/canonical/schema có trong HTML SSR/SSG.

---

# 2. Cây thư mục project

## 2.1. Thư mục cấp root

| Đường dẫn | Nhiệm vụ |
| --------- | -------- |
| `.git/` | Dữ liệu Git local. Không sửa thủ công. |
| `.nuxt/` | Cache/runtime build tạm của Nuxt. Generated, không sửa trực tiếp. |
| `.output/` | Output production của Nuxt/Nitro; `.output/public` là static SSG deploy được. Generated, không sửa trực tiếp. |
| `node_modules/` | Thư viện npm đã cài. Generated, không sửa, không push. |
| `public/` | File tĩnh copy vào output Nuxt khi build: `robots.txt`, `sitemap.xml`, `web.config`, ảnh public. |
| `scripts/` | Script Node hỗ trợ build, hiện có script generate sitemap. |
| `src/` | Toàn bộ source Vue app. Đây là phần phát triển chính. |
| `app.vue` | Root Nuxt app, render layout chính và `NuxtPage`. |
| `pages/` | Wrapper route theo file-based routing của Nuxt. |
| `plugins/` | Plugin Nuxt cấp root: i18n và directive client-only. |
| `middleware/` | Middleware Nuxt toàn cục sanitize route/query. |
| `.env` | Biến môi trường local. Không nên commit. |
| `.env.example` | Mẫu biến môi trường để người khác tạo `.env`. Nên commit. |
| `.gitignore` | Danh sách file/thư mục Git bỏ qua. |
| `git-command-tabs.html` | File HTML tài liệu lệnh Git/NPM, độc lập với app runtime. |
| `index.html` | Legacy entry của SPA cũ, không còn là entry chính khi chạy Nuxt. |
| `nuxt.config.js` | Cấu hình SSR/SSG, routeRules, Nitro prerender, Pinia, Tailwind, head mặc định. |
| `package.json` | Khai báo scripts và dependency trực tiếp. |
| `package-lock.json` | Khóa phiên bản dependency. Nên commit, hạn chế sửa thủ công. |
| `README.md` | Tài liệu giới thiệu, chạy project, SEO/deploy/Git. |
| `tailwind.config.js` | Cấu hình Tailwind theme, content scan. |
| `PROJECT_FLOW.md` | File tài liệu phân tích full luồng project này. |

## 2.2. Thư mục trong `src`

| Đường dẫn | Nhiệm vụ |
| --------- | -------- |
| `src/api/` | HTTP client Axios và interceptor request/response. |
| `src/assets/` | Asset import trong source. Hiện có ảnh fallback. |
| `src/components/` | Component UI tái sử dụng. Chia thành layout, common, news, ui. |
| `src/composables/` | Logic Vue dùng lại: locale, debounce. |
| `src/config/` | Cấu hình app/API/auth lấy từ `import.meta.env`. |
| `src/constants/` | Hằng số toàn cục, hiện có locale constants. |
| `src/data/` | Dữ liệu mock categories/news. |
| `src/directives/` | Custom directive, hiện có lazy image directive. |
| `src/layouts/` | Layout khung trang. Hiện có `MainLayout.vue`. |
| `src/locales/` | File ngôn ngữ `vi.json`, `en.json`. |
| `src/pages/` | Các view/page nghiệp vụ được root `pages/` của Nuxt gọi lại. |
| `src/plugins/` | Plugin legacy/shared như i18n/directives; Nuxt root plugin sẽ đăng ký runtime. |
| `src/router/` | Router SPA cũ, hiện chỉ còn tham chiếu legacy; runtime chính dùng Nuxt file-based routing. |
| `src/services/` | Service gọi API/mock, normalize dữ liệu, session auth. |
| `src/stores/` | Pinia stores quản lý state app/news/category. |
| `src/styles/` | CSS global và Tailwind layer. |
| `src/utils/` | Helper SEO, sanitize, slug, date, localized content, error. |

## 2.3. Thư mục không có trong project

Các thư mục sau không thấy trong project hiện tại:

- `/Controllers`: không có, vì đây không phải backend ASP.NET/MVC.
- `/Views`: không có theo nghĩa MVC, thay bằng `src/pages` và `src/components`.
- `/Models`: không có model class riêng, dữ liệu được chuẩn hóa trong mapper service.
- `/wwwroot`: không có, tương đương frontend là `public`.
- `/database`, `/sql`, `/migrations`: không có. Cần kiểm tra thêm backend nếu có database.

---

# 3. Giải thích từng file quan trọng

| File | Nhiệm vụ | Được gọi từ đâu | Liên kết đến đâu | Động/Tĩnh | Có nên sửa? | Ghi chú |
| ---- | -------- | --------------- | ---------------- | --------- | ----------- | ------- |
| `package.json` | Khai báo tên project, scripts, dependencies | npm CLI | Nuxt, Vue, Pinia, Tailwind | Cấu hình | Có, khi đổi script/thư viện | Scripts chính là `nuxt dev`, `nuxt build`, `nuxt generate` |
| `package-lock.json` | Khóa phiên bản dependency đã cài | `npm install`, `npm ci` | `node_modules` | Generated/cố định | Hạn chế sửa thủ công | Nên commit để team cài giống nhau |
| `nuxt.config.js` | Cấu hình SSR/SSG, Pinia, Tailwind/PostCSS, head mặc định, routeRules, Nitro prerender | Nuxt CLI | root `pages/`, `src/data`, public assets, env | Core cấu hình | Có cẩn thận | Điểm chính điều khiển SEO SSR/SSG |
| `app.vue` | Root Nuxt app, bọc `NuxtPage` bằng `MainLayout` | Nuxt runtime | `src/layouts/MainLayout.vue`, `NuxtPage` | Core runtime | Hạn chế sửa | Entry chính thay SPA entry cũ |
| `pages/` | Wrapper route theo file-based routing Nuxt | Nuxt runtime | `src/pages/*View.vue` | Core route | Có khi đổi URL | Giữ URL chính nhưng render lại view cũ |
| `plugins/i18n.js` | Đăng ký i18n cho Nuxt SSR/client | Nuxt runtime | `src/plugins/i18n.js`, locale files | Core plugin | Ít sửa | Đọc locale từ query/cookie để SSR đúng ngôn ngữ |
| `plugins/directives.client.js` | Đăng ký directive chỉ ở client | Nuxt client runtime | `src/plugins/directives.js` | Plugin client | Ít sửa | Tránh lỗi directive DOM trong SSR |
| `middleware/route-sanitizer.global.js` | Sanitize route/query toàn cục | Nuxt middleware | `src/utils/sanitizeHtml.js`, `src/utils/slugHelper.js` | Core route guard | Có cẩn thận | Thay lớp guard quan trọng của router SPA cũ |
| `index.html` | Legacy entry HTML của SPA cũ | Không còn là entry Nuxt chính | `/src/main.js` | Legacy | Hạn chế sửa | Meta chính hiện nằm trong `nuxt.config.js` và `seoHelper.js` |
| `tailwind.config.js` | Cấu hình Tailwind content/theme | Nuxt/PostCSS build | `app.vue`, root `pages/`, `src/**/*.{vue,js}` | Cấu hình | Ít sửa | Sai content có thể mất CSS |
| `.env.example` | Mẫu biến môi trường | Dev đọc thủ công, README | `src/config/*.js`, script sitemap | Cấu hình mẫu | Có, khi thêm biến env | Không chứa secret thật |
| `.env` | Env local thật | Vite, script sitemap | API URL, app URL, mock flag | Cấu hình local | Có, theo máy | Không commit |
| `.gitignore` | Chặn file không cần commit | Git | `.env`, `node_modules`, `dist` | Cấu hình Git | Ít sửa | Sửa sai dễ push file nhạy cảm |
| `README.md` | Tài liệu chạy/deploy/Git/SEO | Người phát triển | Không gọi runtime | Tĩnh | Có | Tài liệu onboarding |
| `git-command-tabs.html` | Cheatsheet Git/NPM dạng HTML | Mở trực tiếp bằng browser | Không liên kết app runtime | Tĩnh | Có | Không ảnh hưởng app Vue |
| `scripts/generate-sitemap.mjs` | Sinh sitemap/news sitemap/robots khi build | `npm run sitemap`, `npm run build` | `src/data/news.js`, `src/data/categories.js`, `.env`, `public/*.xml/txt` | Build script | Có, khi đổi SEO/build sitemap | Hiện sitemap lấy từ mock data, chưa lấy API thật |
| `public/web.config` | IIS rewrite cho Nuxt static SSG | IIS sau deploy | `.output/public/index.html` | Cấu hình deploy | Ít sửa | Thiếu file này refresh route con dễ 404 |
| `public/robots.txt` | Rule crawler và sitemap URL | Bot/crawler | Sitemap | Generated/tĩnh | Không sửa thủ công nếu build ghi đè | Được script generate lại |
| `public/sitemap.xml` | Sitemap URL chính | Bot/crawler | Routes, categories, news | Generated | Không sửa thủ công | Được script generate lại |
| `public/news-sitemap.xml` | News sitemap cho bài mới | Bot/crawler | `src/data/news.js` | Generated | Không sửa thủ công | Chỉ lấy bài trong khoảng thời gian script lọc |
| `src/main.js` | Entry SPA cũ | Legacy | `App.vue`, router, stores, i18n, SEO helper | Legacy | Không sửa nếu không phục hồi SPA | Nuxt runtime không đi qua file này |
| `src/App.vue` | Root component SPA cũ, render RouterView | Legacy `main.js` | RouterView | Legacy | Hạn chế sửa | Không còn root runtime chính |
| `src/router/index.js` | Route/guard SPA cũ | Legacy `main.js` | `MainLayout`, pages, authSession, sanitize/slug helper | Legacy tham chiếu | Chỉ sửa nếu còn cần SPA fallback | Runtime chính dùng root `pages/` + middleware Nuxt |
| `src/layouts/MainLayout.vue` | Layout chính: auth expired banner, header, main slot, footer, schema WebSite | `app.vue` | `AppHeader`, `AppFooter`, authSession, appStore, seoHelper | Động | Có khi đổi layout chung | Ảnh hưởng toàn trang |
| `src/pages/HomeView.vue` | Trang chủ, lấy tin home, render featured/latest/popular/hot/category sections | `pages/index.vue` | newsStore, categoryStore, news components, seoHelper | Động SSR/SSG | Có khi đổi home page | Có schema `CollectionPage` trong HTML |
| `src/pages/NewsListView.vue` | Trang danh sách tin mới có pagination | `pages/tin-tuc/index.vue` | newsStore, NewsCard, SidebarNews, Pagination, seoHelper | Động SSR/SSG | Có | Có canonical theo `page` |
| `src/pages/NewsDetailView.vue` | Trang chi tiết bài viết, sanitize content, tags, related news, SEO article | `pages/tin-tuc/[slug].vue` | newsStore, NewsCard, sanitizeHtml, seoHelper | Động SSR/SSG | Có, cẩn thận | Chứa `v-html`, phải giữ sanitize |
| `src/pages/CategoryView.vue` | Trang danh mục theo slug, pagination, sidebar | `pages/danh-muc/[slug].vue` | newsStore, NewsCard, Pagination, seoHelper | Động SSR/SSG | Có | Nếu category không có thì noindex |
| `src/pages/SearchView.vue` | Trang tìm kiếm, debounce input, query `q`, pagination | `pages/tim-kiem.vue` | newsStore, SearchBox, useDebounce, sanitizeHtml, seoHelper | Động SSR, noindex | Có | Route noindex, không prerender HTML |
| `src/pages/AboutView.vue` | Trang giới thiệu | `pages/gioi-thieu.vue` | Breadcrumb, i18n, seoHelper | Tĩnh theo i18n | Có | Nội dung lấy từ locale |
| `src/pages/ContactView.vue` | Trang liên hệ, form giao diện | `pages/lien-he.vue` | Breadcrumb, i18n, seoHelper | Tĩnh theo i18n | Có | Form hiện chưa thấy gọi API submit |
| `src/pages/NotFoundView.vue` | Trang 404 noindex | `pages/404.vue` và `pages/[...pathMatch].vue` | NuxtLink, seoHelper | Tĩnh theo i18n | Ít sửa | Robots `noindex, nofollow` |
| `src/components/layout/AppHeader.vue` | Header, search, language switcher, desktop menu, mobile menu | MainLayout | appStore, categoryStore, SearchBox, MobileMenu | Động | Có khi đổi header/menu | Danh mục menu lấy từ store |
| `src/components/layout/AppFooter.vue` | Footer, danh mục, contact info | MainLayout | categoryStore, i18n | Động/tĩnh | Có khi đổi footer | Danh mục footer lấy từ store |
| `src/components/layout/MobileMenu.vue` | Menu mobile dạng drawer | AppHeader | LanguageSwitcher, locale helper | Động | Có | Nhận categories qua props |
| `src/components/ui/LanguageSwitcher.vue` | Nút đổi VI/EN | Header/MobileMenu | useLocale | Động | Có | Lưu locale vào localStorage qua plugin i18n |
| `src/components/common/SearchBox.vue` | Form search reusable | Header/SearchView | normalizeSearchInput | Động | Có | Chặn input bẩn |
| `src/components/common/Breadcrumb.vue` | Breadcrumb reusable | Nhiều page | RouterLink, i18n | Động | Có | Nhận items qua props |
| `src/components/common/Pagination.vue` | Phân trang reusable | NewsList/Category/Search | Emits `change` | Động | Có | Không gọi API trực tiếp |
| `src/components/common/EmptyState.vue` | Trạng thái rỗng/lỗi | Nhiều page | i18n | Tĩnh/động props | Có | UI reuse |
| `src/components/common/LoadingSkeleton.vue` | Loading placeholder | Nhiều page | Không gọi service | Tĩnh/động props | Có | UI reuse |
| `src/components/news/NewsCard.vue` | Card tin tức reusable | Nhiều page/component | slugHelper, dateHelper, localizedContent | Động | Có | Ảnh lazy + fallback |
| `src/components/news/FeaturedNews.vue` | Khu tin nổi bật trang chủ | HomeView | NewsCard, slugHelper | Động | Có | Ảnh lớn featured |
| `src/components/news/LatestNews.vue` | Khu tin mới nhất | HomeView | NewsCard | Động | Có | Link sang `/tin-tuc` |
| `src/components/news/PopularNews.vue` | Danh sách tin đọc nhiều | HomeView | slugHelper, localizedContent | Động | Có | Sắp xếp đã xử lý ở service |
| `src/components/news/CategorySection.vue` | Section tin theo từng danh mục | HomeView | NewsCard | Động | Có | Render nhiều lần theo categories |
| `src/components/news/SidebarNews.vue` | Tin sidebar | Home/List/Category | slugHelper, fallback image | Động | Có | Reusable |
| `src/stores/useAppStore.js` | State app: appName, locale, mobile menu, auth expired, auth state | Components/layout | appConfig, locale constants | Động | Có cẩn thận | State global UI |
| `src/stores/useNewsStore.js` | State tin tức: home, list, category, detail, search, loading/error/cache | Pages | newsService | Động | Có cẩn thận | Store quan trọng nhất cho dữ liệu tin |
| `src/stores/useCategoryStore.js` | State danh mục, currentCategory, cache | Header/Footer/Home | categoryService | Động | Có cẩn thận | Menu phụ thuộc file này |
| `src/services/newsService.js` | Logic lấy, cache, phân trang, lọc tin, search, fallback mock/API | useNewsStore | apiClient, categoryService, mock data, mappers | Động | Có cẩn thận | Logic nghiệp vụ chính |
| `src/services/categoryService.js` | Lấy danh mục từ mock/API, fallback | useCategoryStore, newsService | apiClient, mock categories, mapper | Động | Có | Endpoint `/categories` |
| `src/services/authService.js` | Login/refresh/logout | Chưa thấy page gọi trực tiếp | apiClient, authSession, authTokenRefresh | Động | Cần kiểm tra thêm | Có service nhưng chưa thấy UI login |
| `src/services/authSession.js` | Lưu token in-memory phía browser, auth header, refresh threshold, unauthorized listener | apiClient, router, MainLayout, authService | authConfig | Động | Ít sửa | Không lưu token localStorage và không lưu token trong SSR module state |
| `src/services/authTokenRefresh.js` | Gọi refresh token bằng Axios riêng, tránh vòng lặp interceptor chính | httpClient, authService | apiConfig, authConfig, authSession | Core auth | Ít sửa | Dùng chung cho auto refresh trước hạn và retry 401 |
| `src/services/authPayload.js` | Normalize payload auth từ nhiều kiểu field backend | authService, authTokenRefresh | Không | Utility auth | Ít sửa | Hỗ trợ `access_token`, `refresh_token`, `expires_in`, `exp` |
| `src/services/apiClient.js` | Re-export `src/api/httpClient.js` cho import cũ | Chưa thấy import trực tiếp ngoài file này | httpClient | Cố định | Hạn chế sửa | Tương thích ngược |
| `src/api/httpClient.js` | Axios instance, auth header, auto refresh token, retry 401 một lần, CSRF header, xử lý lỗi | Services | apiConfig, authSession, authTokenRefresh, errorHandler | Core API | Hạn chế sửa | Sửa sai ảnh hưởng toàn bộ API |
| `src/services/newsMapper.js` | Normalize news item/list, sanitize field cơ bản, image fallback | newsService | appConfig, slugHelper | Động | Có cẩn thận | Chốt shape dữ liệu tin |
| `src/services/categoryMapper.js` | Normalize category item/list | categoryService/newsService | slugHelper | Động | Có | Chốt shape dữ liệu danh mục |
| `src/data/news.js` | 32 bài viết mock, tự sinh slug/content/thumbnail/SEO fields | newsService, sitemap script | Không gọi API | Tĩnh/mock | Có khi đổi dữ liệu demo | Không phải database |
| `src/data/categories.js` | 9 danh mục mock | categoryService, newsService, sitemap script | Không gọi API | Tĩnh/mock | Có khi đổi danh mục mock | Menu mock phụ thuộc file này |
| `src/config/appConfig.js` | App name, app URL, mock flag, page size, cache TTL, fallback image | Stores/services/SEO | `.env` | Cấu hình động | Có khi đổi behavior app | Ảnh hưởng nhiều nơi |
| `src/config/apiConfig.js` | Base URL, timeout, credentials, CSRF config cho API | httpClient | `.env` | Cấu hình động | Có khi đổi API | Không hard-code production trong code |
| `src/config/authConfig.js` | Endpoint auth, token type, login path, refresh threshold/cookie mode | authService/authSession | `.env` | Cấu hình động | Có khi đổi auth API | Auth chưa có UI rõ ràng |
| `src/plugins/i18n.js` | Tạo i18n, đọc/lưu locale localStorage/cookie | root `plugins/i18n.js`, useLocale, errorHandler | locales, locale constants | Core plugin | Ít sửa | Sai locale làm lỗi text toàn app |
| `src/plugins/directives.js` | Đăng ký directive global | root `plugins/directives.client.js` | lazyImage directive | Core plugin client | Ít sửa | Hiện chỉ có `v-lazy-image` |
| `src/directives/lazyImage.js` | Lazy load image/background bằng IntersectionObserver | plugins/directives | DOM/browser API | Động | Có | Chưa thấy nơi dùng `v-lazy-image` trực tiếp |
| `src/utils/seoHelper.js` | Helper SEO meta/canonical/hreflang/JSON-LD | main/layout/pages | appConfig, locale constants | Core SEO | Có cẩn thận | Sửa sai ảnh hưởng SEO toàn site |
| `src/utils/sanitizeHtml.js` | Sanitize HTML content và search input | SearchBox, SearchView, NewsDetail, router, newsService | DOMPurify | Core bảo mật | Hạn chế sửa | Đặc biệt quan trọng vì có `v-html` |
| `src/utils/slugHelper.js` | Sinh/normalize slug và path news/category | Router, components, services, pages | Không | Core URL | Hạn chế sửa | Sửa có thể đổi URL SEO |
| `src/utils/dateHelper.js` | Format ngày, sort tin mới | Components/services | Intl DateTimeFormat | Utility | Có | Ít rủi ro |
| `src/utils/errorHandler.js` | Normalize lỗi API/UI theo i18n | apiClient, stores, services | i18n | Core lỗi | Có cẩn thận | Dùng trong interceptor/store |
| `src/utils/localizedContent.js` | Lấy field theo locale từ nhiều kiểu key | Pages/components | Không | Utility | Có | Quan trọng cho dữ liệu song ngữ |
| `src/locales/vi.json` | Text tiếng Việt và SEO text | i18n/pages/components | i18n | Tĩnh/dynamic content | Có | Sửa nội dung UI/SEO tiếng Việt |
| `src/locales/en.json` | Text tiếng Anh và SEO text | i18n/pages/components | i18n | Tĩnh/dynamic content | Có | Sửa nội dung UI/SEO tiếng Anh |
| `src/styles/main.css` | Tailwind base + class global: `container-wide`, `card-surface`, rich content | `nuxt.config.js` CSS entry | Tailwind | Style global | Có cẩn thận | Ảnh hưởng giao diện toàn app |

---

# 4. Luồng dữ liệu

## 4.1. Luồng dữ liệu tổng quát

```text
Page/View
↓ gọi action
Pinia Store
↓ gọi service
Service
↓ nếu mock
src/data/*.js
↓ normalize bằng mapper
Store state
↓ computed trong page
Component render UI
```

Khi dùng API thật:

```text
Page/View
↓
Pinia Store
↓
Service
↓
src/api/httpClient.js
↓
Backend API: VITE_API_BASE_URL
↓
Response JSON
↓
Mapper normalize
↓
Store state
↓
Component render UI
```

## 4.2. Module trang chủ

| Bước | File | Chi tiết |
| ---- | ---- | -------- |
| Route | `pages/index.vue` | Route `/` theo Nuxt file-based routing |
| Page | `src/pages/HomeView.vue` | Gọi `categoryStore.fetchCategories()` nếu chưa có danh mục, sau đó gọi `newsStore.fetchHomeNews()` |
| Store | `src/stores/useNewsStore.js` | Action `fetchHomeNews()` |
| Service | `src/services/newsService.js` | Method `getHomeNewsData()` |
| Dữ liệu | `src/data/news.js` hoặc API `/news` | Nếu mock thì lấy 32 bài trong data; nếu API thật thì gọi `/news` |
| Xử lý | `newsService` | Chia dữ liệu thành `featured`, `latest`, `popular`, `hot`, `categorySections`, `sidebar` |
| UI | `FeaturedNews`, `LatestNews`, `PopularNews`, `CategorySection`, `SidebarNews`, `NewsCard` | Render các block trang chủ |
| SEO | `HomeView.vue` + `seoHelper.js` | Set title/description/canonical/hreflang và schema `CollectionPage` |

## 4.3. Module danh sách tin mới

| Bước | File | Chi tiết |
| ---- | ---- | -------- |
| Route | `pages/tin-tuc/index.vue` | Route `/tin-tuc` theo Nuxt file-based routing |
| Page | `src/pages/NewsListView.vue` | Đọc `route.query.page`, watch page + locale |
| Store | `src/stores/useNewsStore.js` | Action `fetchNewsList(page)` |
| Service | `src/services/newsService.js` | Method `getNewsList(page, pageSize)` |
| Dữ liệu | Mock hoặc API `/news` | Dữ liệu được phân trang bằng helper `paginate()` |
| UI | `NewsCard`, `SidebarNews`, `Pagination`, `LoadingSkeleton`, `EmptyState` | Render grid tin và sidebar |
| SEO | `NewsListView.vue` | Canonical `/tin-tuc`, thêm `?page=n` nếu page > 1, schema `CollectionPage` + `BreadcrumbList` |

## 4.4. Module chi tiết bài viết

| Bước | File | Chi tiết |
| ---- | ---- | -------- |
| Route | `pages/tin-tuc/[slug].vue` | Route `/tin-tuc/:slug` theo Nuxt file-based routing |
| Guard | `middleware/route-sanitizer.global.js` | Normalize slug/query, nếu slug rỗng không hợp lệ thì đưa về 404 |
| Page | `src/pages/NewsDetailView.vue` | Watch `route.params.slug` và `locale` |
| Store | `src/stores/useNewsStore.js` | Action `fetchNewsDetail(slug)` |
| Service | `src/services/newsService.js` | Method `getNewsDetailBySlug(slug)`, `getRelatedNews(newsItem)` |
| Dữ liệu | Mock hoặc API `/news` | Không thấy endpoint `/news/:slug`; service hiện lấy toàn bộ `/news`, sau đó tìm slug ở frontend |
| Bảo mật | `src/utils/sanitizeHtml.js` | Content được sanitize trước khi render bằng `v-html` |
| UI | `Breadcrumb`, `NewsCard`, `LoadingSkeleton`, `EmptyState` | Render bài viết, ảnh, tags, related news |
| SEO | `NewsDetailView.vue` | Title/description theo bài, OG image theo thumbnail, canonical theo slug, schema `NewsArticle` |
| Cần kiểm tra thêm | Backend API | Nếu dữ liệu lớn nên có endpoint chi tiết `/news/:slug` hoặc `/news/{slug}` ở backend |

## 4.5. Module danh mục

| Bước | File | Chi tiết |
| ---- | ---- | -------- |
| Route | `pages/danh-muc/[slug].vue` | Route `/danh-muc/:slug` theo Nuxt file-based routing |
| Page | `src/pages/CategoryView.vue` | Đọc slug + query page |
| Store | `src/stores/useNewsStore.js` | Action `fetchCategoryNews(slug, page)` |
| Service | `src/services/newsService.js` | Method `getNewsByCategorySlug(slug, page, pageSize)` |
| Dữ liệu | `categoryCache.items` và all news | Lọc tin theo `categoryId` |
| UI | `NewsCard`, `SidebarNews`, `Pagination` | Render danh sách tin theo danh mục |
| SEO | `CategoryView.vue` | Title/description theo category, canonical `/danh-muc/:slug`, schema `CollectionPage` |
| Cần chú ý | `newsService.getCategoryBySlug()` | Lấy category từ `categoryCache.items`; khi mock có sẵn categories, khi API thật cache danh mục lấy từ `categoryService` |

## 4.6. Module tìm kiếm

| Bước | File | Chi tiết |
| ---- | ---- | -------- |
| Route | `pages/tim-kiem.vue` | Route `/tim-kiem`, SEO `noindex, follow` trong page |
| Guard | `middleware/route-sanitizer.global.js` | Sanitize query `q`, sanitize `page` |
| Page | `src/pages/SearchView.vue` | Dùng `SearchBox`, debounce 450ms |
| Store | `src/stores/useNewsStore.js` | Action `searchNews(query, page)` |
| Service | `src/services/newsService.js` | Method `searchNews(query, page, pageSize)` |
| Dữ liệu | All news | Search theo `title`, `summary`, `tags` ở frontend |
| UI | `NewsCard`, `Pagination`, `EmptyState` | Render kết quả search |
| SEO | `SearchView.vue` | `robots: noindex, follow`, canonical `/tim-kiem` |
| Cần kiểm tra thêm | Backend search | Chưa thấy endpoint search riêng; nếu dữ liệu lớn nên chuyển search sang backend |

## 4.7. Module danh mục/menu

| Bước | File | Chi tiết |
| ---- | ---- | -------- |
| Component | `AppHeader.vue`, `AppFooter.vue` | On mounted gọi `categoryStore.fetchCategories()` nếu chưa có |
| Store | `src/stores/useCategoryStore.js` | State `categories`, `currentCategory` |
| Service | `src/services/categoryService.js` | `getCategories()`, `getCategoryBySlug(slug)` |
| API | `/categories`, `/categories/:slug` | Chỉ gọi khi `VITE_USE_MOCK_API=false` |
| Mock | `src/data/categories.js` | 9 danh mục |
| UI | Desktop menu, mobile menu, footer categories | Menu danh mục là động theo store |

## 4.8. Module auth

| Bước | File | Chi tiết |
| ---- | ---- | -------- |
| Service | `src/services/authService.js` | Có login/refresh/logout |
| Session | `src/services/authSession.js` | Token lưu in-memory, không localStorage |
| API client | `src/api/httpClient.js` | Gắn Authorization header nếu token hợp lệ |
| Router/middleware | `middleware/route-sanitizer.global.js` + authSession | Hiện runtime Nuxt chỉ dùng sanitize route/query; auth route riêng chưa thấy khai báo |
| Layout | `MainLayout.vue` | Lắng nghe unauthorized để bật banner auth expired |
| Cần kiểm tra thêm | UI login/admin | Chưa thấy page login/admin trong project hiện tại |

## 4.9. Database/table/stored procedure

Không thấy database, SQL script, migration, stored procedure trong repo frontend này.

Nếu `VITE_USE_MOCK_API=false`, frontend dự kiến gọi backend tại:

- `GET /news`
- `GET /categories`
- `GET /categories/:slug`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

Database/table/stored procedure phía sau các API này: Cần kiểm tra thêm ở project backend.

Nếu API lỗi hoặc payload sai shape, service chỉ fallback về mock khi `VITE_API_ALLOW_MOCK_FALLBACK=true`; production nên giữ `false` để không âm thầm hiện dữ liệu demo.

---

# 5. Luồng giao diện

## 5.1. Trang chính và trang con

| Route | Page | Vai trò |
| ----- | ---- | ------- |
| `/` | `HomeView.vue` | Trang chủ tin tức |
| `/tin-tuc` | `NewsListView.vue` | Danh sách tin mới |
| `/tin-tuc/:slug` | `NewsDetailView.vue` | Chi tiết bài viết |
| `/danh-muc/:slug` | `CategoryView.vue` | Tin theo danh mục |
| `/tim-kiem` | `SearchView.vue` | Tìm kiếm tin |
| `/gioi-thieu` | `AboutView.vue` | Giới thiệu |
| `/lien-he` | `ContactView.vue` | Liên hệ |
| `/404` | `NotFoundView.vue` | Trang 404 chuẩn |
| `/:pathMatch(.*)*` | `NotFoundView.vue` trong `MainLayout` | Catch-all 404 |

## 5.2. Layout/header/footer/sidebar nằm ở đâu

| Thành phần | File | Ghi chú |
| ---------- | ---- | ------- |
| Layout chính | `src/layouts/MainLayout.vue` | Dùng cho tất cả route public hiện tại |
| Header | `src/components/layout/AppHeader.vue` | Logo, search, menu desktop, language switcher, mobile menu trigger |
| Footer | `src/components/layout/AppFooter.vue` | Mô tả app, danh mục, thông tin liên hệ |
| Mobile menu | `src/components/layout/MobileMenu.vue` | Drawer mobile, nhận categories từ header |
| Sidebar tin | `src/components/news/SidebarNews.vue` | Dùng ở Home/List/Category |

## 5.3. Component dùng lại nhiều nơi

| Component | Dùng ở đâu | Vai trò |
| --------- | ---------- | ------- |
| `NewsCard.vue` | Home, NewsList, Category, Search, Related News | Card bài viết chính |
| `SidebarNews.vue` | Home, NewsList, Category | Danh sách tin nhỏ bên cạnh |
| `Breadcrumb.vue` | NewsList, NewsDetail, Category, Search, About, Contact | Điều hướng breadcrumb |
| `Pagination.vue` | NewsList, Category, Search | Phân trang |
| `EmptyState.vue` | Home, NewsList, NewsDetail, Category, Search | UI lỗi/rỗng |
| `LoadingSkeleton.vue` | Home, NewsList, NewsDetail, Category, Search | Loading placeholder |
| `SearchBox.vue` | Header, Search page | Input tìm kiếm |
| `LanguageSwitcher.vue` | Header, MobileMenu | Đổi ngôn ngữ |

## 5.4. Menu lấy dữ liệu tĩnh hay động

Menu gồm 2 phần:

- Link tĩnh: Home, Tin mới, Giới thiệu, Liên hệ, Search mobile.
- Link danh mục động: lấy từ `useCategoryStore()`, nguồn là `categoryService.getCategories()`.

Khi mock:

- Danh mục lấy từ `src/data/categories.js`.

Khi API thật:

- Danh mục lấy từ `GET /categories`.

## 5.5. Nội dung lấy từ API, database hay hard-code

| Nội dung | Nguồn hiện tại | Ghi chú |
| -------- | -------------- | ------- |
| Tin tức | `src/data/news.js` khi bật mock, hoặc API `/news` khi tắt mock | `.env.example` hiện mặc định gọi API thật; fallback mock chỉ bật khi `VITE_API_ALLOW_MOCK_FALLBACK=true` |
| Danh mục | `src/data/categories.js` khi bật mock, hoặc API `/categories` | Menu phụ thuộc dữ liệu này |
| Text giao diện | `src/locales/vi.json`, `src/locales/en.json` | i18n |
| About/Contact content | Locale files | Không gọi API |
| Contact form submit | Chưa thấy API submit | Form hiện chỉ `@submit.prevent`, chưa có logic gửi |
| SEO default | `nuxt.config.js`, `src/utils/seoHelper.js`, locale files | SSR/SSG dynamic theo page |
| Sitemap | `scripts/generate-sitemap.mjs` + `src/data` | Build-time |

---

# 6. Phân loại file động và file tĩnh

| Nhóm | File/Thư mục | Loại | Ghi chú |
| ---- | ------------ | ---- | ------- |
| Giao diện | `src/pages/*.vue` | Động/Tĩnh tùy page | Page tin tức động, About/Contact tĩnh theo i18n |
| Giao diện | `src/components/news/*.vue` | Động | Nhận dữ liệu tin qua props |
| Giao diện | `src/components/common/*.vue` | Reusable | Chủ yếu nhận props/emits |
| Giao diện | `src/components/layout/*.vue` | Động | Header/footer lấy category store |
| Giao diện | `src/styles/main.css` | Cố định/style global | Ảnh hưởng toàn UI |
| Cấu hình | `nuxt.config.js` | Cố định/core | SSR/SSG, alias, head, Pinia, routeRules, Nitro prerender |
| Cấu hình | `tailwind.config.js` | Cố định | Theme Tailwind |
| Cấu hình | `.env.example` | Mẫu cấu hình | Dùng để tạo `.env` |
| Cấu hình | `.env` | Local động | Không commit |
| Cấu hình | `src/config/*.js` | Động theo env | App/API/auth config |
| API | `src/api/httpClient.js` | Động/core | Axios, auth header, error handling |
| API | `src/services/newsService.js` | Động | Mock/API, cache, pagination, search |
| API | `src/services/categoryService.js` | Động | Mock/API danh mục |
| API | `src/services/authService.js` | Động | Login/refresh/logout, chưa thấy UI gọi |
| Store | `src/stores/*.js` | Động | Pinia state/loading/error/cache |
| Mock data | `src/data/news.js` | Tĩnh/mock | 32 bài demo |
| Mock data | `src/data/categories.js` | Tĩnh/mock | 9 danh mục demo |
| Asset | `public/favicon.svg` | Tĩnh | Favicon |
| Asset | `public/images/*.svg` | Tĩnh | OG/fallback public |
| Asset | `src/assets/images/*.svg` | Tĩnh | Asset import trong source |
| SEO | `src/utils/seoHelper.js` | Động/core | Update meta/JSON-LD runtime |
| SEO | `scripts/generate-sitemap.mjs` | Build-time | Sinh sitemap/robots |
| Deploy | `public/web.config` | Cố định | IIS Nuxt static fallback |
| Build output | `.output/` | Generated | Không sửa trực tiếp |
| Build cache | `.nuxt/` | Generated | Không sửa trực tiếp |
| Dependency | `node_modules/` | Generated | Không sửa, không commit |
| Database | Không có trong repo | Cần kiểm tra thêm | Frontend không chứa DB |

---

# 7. Những file nên sửa khi phát triển

## 7.1. Khi đổi giao diện

Nên sửa:

- `src/pages/*.vue`: đổi layout riêng từng trang.
- `src/components/news/*.vue`: đổi giao diện card/list/section tin tức.
- `src/components/common/*.vue`: đổi component dùng chung.
- `src/components/layout/AppHeader.vue`: đổi header/menu/search.
- `src/components/layout/AppFooter.vue`: đổi footer.
- `src/styles/main.css`: đổi class global như `container-wide`, `card-surface`, `rich-content`.
- `tailwind.config.js`: đổi màu brand, font, shadow theme.

## 7.2. Khi đổi API

Nên sửa:

- `.env`: đổi `VITE_API_BASE_URL`, `VITE_USE_MOCK_API`, `VITE_API_ALLOW_MOCK_FALLBACK`.
- `.env.example`: cập nhật biến mẫu nếu thêm biến mới.
- `src/config/apiConfig.js`: đổi cách đọc cấu hình API.
- `src/services/newsService.js`: đổi endpoint/tầng xử lý tin.
- `src/services/categoryService.js`: đổi endpoint/tầng xử lý danh mục.
- `src/services/newsMapper.js`: đổi mapping payload tin tức.
- `src/services/categoryMapper.js`: đổi mapping payload danh mục.
- `src/api/httpClient.js`: chỉ sửa nếu đổi auth header/interceptor/global error.

## 7.3. Khi đổi route

Nên sửa:

- Root `pages/`: thêm/sửa/xóa route theo file-based routing Nuxt.
- `middleware/route-sanitizer.global.js`: cập nhật sanitize/redirect nếu route có param/query mới.
- `src/utils/slugHelper.js`: nếu đổi format URL slug/path.
- `src/components/layout/AppHeader.vue`: nếu route xuất hiện trên menu.
- `src/components/layout/MobileMenu.vue`: nếu route xuất hiện trên mobile menu.
- `src/components/layout/AppFooter.vue`: nếu footer cần link mới.
- `scripts/generate-sitemap.mjs`: nếu route mới cần index SEO.
- Các page liên quan trong `src/pages/`.

## 7.4. Khi đổi menu

Nên sửa:

- `src/components/layout/AppHeader.vue`: menu desktop + search.
- `src/components/layout/MobileMenu.vue`: menu mobile.
- `src/components/layout/AppFooter.vue`: danh mục/footer links.
- `src/data/categories.js`: nếu đang dùng mock category.
- Backend `/categories`: nếu dùng API thật.
- `src/services/categoryMapper.js`: nếu shape category từ API thay đổi.

## 7.5. Khi đổi SEO

Nên sửa:

- `nuxt.config.js`: head mặc định, routeRules, prerender routes.
- `src/utils/seoHelper.js`: logic update meta/canonical/hreflang/JSON-LD.
- Từng page trong `src/pages/*.vue`: title/description/canonical/schema theo page.
- Root `pages/`: thêm wrapper nếu URL mới cần SSR/SSG.
- `scripts/generate-sitemap.mjs`: sitemap/robots/news sitemap.
- `.env`: `VITE_APP_NAME`, `VITE_APP_URL`.
- `public/images/og-default.svg`: ảnh OG mặc định.

## 7.6. Khi đổi cấu hình database

Trong repo này không có cấu hình database.

Cần kiểm tra thêm backend. Frontend chỉ biết API qua:

- `VITE_API_BASE_URL`
- `src/services/*.js`
- `src/api/httpClient.js`

## 7.7. Khi đổi logic nghiệp vụ

Nên sửa:

- `src/services/newsService.js`: chia dữ liệu home, list, category, detail, related, search.
- `src/services/categoryService.js`: cách lấy danh mục.
- `src/stores/useNewsStore.js`: cache, loading, error, state.
- `src/stores/useCategoryStore.js`: cache category/current category.
- `src/services/newsMapper.js`, `src/services/categoryMapper.js`: chuẩn hóa payload.
- `src/utils/sanitizeHtml.js`: rules bảo mật nội dung HTML/search.

---

# 8. Những file không nên sửa nếu không cần

| File/Thư mục | Lý do |
| ------------ | ----- |
| `node_modules/` | Thư viện cài bằng npm, generated. |
| `.output/` | Output build/generate Nuxt, có thể bị ghi đè khi `npm run build` hoặc `npm run generate`. |
| `.nuxt/` | Cache/runtime tạm của Nuxt, có thể bị ghi đè khi dev/build. |
| `package-lock.json` | Không sửa tay, để npm cập nhật. |
| `public/sitemap.xml` | Generated bởi `scripts/generate-sitemap.mjs`. |
| `public/news-sitemap.xml` | Generated bởi `scripts/generate-sitemap.mjs`. |
| `public/robots.txt` | Generated bởi `scripts/generate-sitemap.mjs`. |
| `.env` | Chỉ sửa local, không commit. |
| `.git/` | Dữ liệu Git nội bộ, không sửa thủ công. |
| `src/api/httpClient.js` | Core API/interceptor, sửa sai ảnh hưởng mọi service. |
| `pages/` | Core route Nuxt, sửa sai ảnh hưởng navigation/SEO. |
| `middleware/route-sanitizer.global.js` | Core route guard Nuxt, sửa sai ảnh hưởng slug/query. |
| `src/utils/sanitizeHtml.js` | Core bảo mật XSS, sửa sai dễ tạo lỗ hổng. |
| `src/utils/seoHelper.js` | Core SEO toàn site, sửa sai dễ trùng meta/canonical/schema. |
| `src/utils/slugHelper.js` | Core URL SEO, sửa có thể đổi URL bài viết/danh mục. |
| `src/plugins/i18n.js` | Core ngôn ngữ toàn app. |
| `app.vue` | Entry app Nuxt toàn hệ thống. |
| `nuxt.config.js` | Cấu hình build/runtime toàn hệ thống. |

---

# 9. Các liên kết quan trọng trong project

## 9.1. Component gọi store/service

| Nơi gọi | Gọi đến | Mục đích |
| ------- | ------- | -------- |
| `HomeView.vue` | `useNewsStore.fetchHomeNews()` | Lấy dữ liệu home |
| `HomeView.vue` | `useCategoryStore.fetchCategories()` | Đảm bảo có danh mục |
| `NewsListView.vue` | `useNewsStore.fetchNewsList(page)` | Lấy danh sách tin |
| `NewsDetailView.vue` | `useNewsStore.fetchNewsDetail(slug)` | Lấy chi tiết bài |
| `CategoryView.vue` | `useNewsStore.fetchCategoryNews(slug, page)` | Lấy tin theo danh mục |
| `SearchView.vue` | `useNewsStore.searchNews(q, page)` | Tìm kiếm tin |
| `AppHeader.vue` | `useCategoryStore.fetchCategories()` | Render menu danh mục |
| `AppFooter.vue` | `useCategoryStore.fetchCategories()` | Render danh mục footer |
| `MainLayout.vue` | `useAppStore`, `authSession` | Banner hết hạn auth, schema WebSite |

## 9.2. Store gọi service

| Store | Service | Method |
| ----- | ------- | ------ |
| `useNewsStore.js` | `newsService.js` | `getHomeNewsData()` |
| `useNewsStore.js` | `newsService.js` | `getNewsList()` |
| `useNewsStore.js` | `newsService.js` | `getNewsByCategorySlug()` |
| `useNewsStore.js` | `newsService.js` | `getNewsDetailBySlug()` |
| `useNewsStore.js` | `newsService.js` | `getRelatedNews()` |
| `useNewsStore.js` | `newsService.js` | `searchNews()` |
| `useCategoryStore.js` | `categoryService.js` | `getCategories()` |
| `useCategoryStore.js` | `categoryService.js` | `getCategoryBySlug()` |

## 9.3. Service gọi API

| Service | API endpoint | Khi nào gọi |
| ------- | ------------ | ----------- |
| `newsService.js` | `GET /news` | Khi `VITE_USE_MOCK_API=false` |
| `categoryService.js` | `GET /categories` | Khi `VITE_USE_MOCK_API=false` |
| `categoryService.js` | `GET /categories/:slug` | Khi lấy danh mục theo slug và tắt mock |
| `authService.js` | `POST /auth/login` hoặc env `VITE_AUTH_LOGIN_ENDPOINT` | Khi có UI gọi login |
| `authTokenRefresh.js` / `authService.js` | `POST /auth/refresh` hoặc env `VITE_AUTH_REFRESH_ENDPOINT` | Tự refresh trước khi token hết hạn hoặc retry một lần sau 401 |
| `authService.js` | `POST /auth/logout` hoặc env `VITE_AUTH_LOGOUT_ENDPOINT` | Khi logout |

## 9.4. API gọi database nào

Không xác định trong repo này.

Frontend chỉ gọi API. Backend/database nằm ngoài repo nên:

- API `/news` gọi table nào: Cần kiểm tra thêm.
- API `/categories` gọi table nào: Cần kiểm tra thêm.
- Auth endpoints gọi bảng user/token nào: Cần kiểm tra thêm.

## 9.5. Trang dùng layout nào

Tất cả route hiện tại đều nằm dưới `MainLayout.vue`.

```text
MainLayout.vue
├── AppHeader.vue
├── RouterView page con
└── AppFooter.vue
```

## 9.6. File cấu hình ảnh hưởng toàn project

| File | Ảnh hưởng |
| ---- | --------- |
| `.env` | App URL, API URL, mock/API mode, port, timeout, CSRF, auth endpoints |
| `src/config/appConfig.js` | Tên app, domain canonical, mock mode, mock fallback mode, page size, cache TTL |
| `src/config/apiConfig.js` | Base URL, timeout, credentials và CSRF toàn bộ API |
| `src/config/authConfig.js` | Token type, auth endpoint, login path, refresh threshold/cookie mode |
| `pages/` | Toàn bộ navigation route Nuxt |
| `middleware/route-sanitizer.global.js` | Sanitize route/query |
| `src/utils/seoHelper.js` | SEO toàn site |
| `src/utils/sanitizeHtml.js` | Bảo mật content/search |
| `tailwind.config.js` | Theme style toàn project |
| `src/styles/main.css` | Class global toàn project |

---

# 10. Ghi chú rủi ro

## 10.1. File sửa dễ lỗi toàn hệ thống

| File | Rủi ro |
| ---- | ------ |
| `app.vue` | App Nuxt không render layout/page nếu sửa sai |
| `nuxt.config.js` | SSR/SSG, alias, CSS, prerender hoặc head mặc định có thể lỗi |
| `pages/` | Route sai, 404 sai, wrapper page sai |
| `middleware/route-sanitizer.global.js` | Query/slug sanitize sai |
| `src/api/httpClient.js` | Tất cả API bị ảnh hưởng, auth header/lỗi 401 sai |
| `src/services/newsService.js` | Dữ liệu tin tức toàn site sai |
| `src/stores/useNewsStore.js` | Loading/error/cache tin tức sai |
| `src/utils/sanitizeHtml.js` | Có thể tạo lỗi hiển thị hoặc rủi ro XSS |
| `src/utils/seoHelper.js` | Meta/canonical/schema có thể sai toàn site |
| `src/utils/slugHelper.js` | URL bài viết/danh mục có thể đổi, ảnh hưởng SEO |
| `src/styles/main.css` | Giao diện toàn site thay đổi |

## 10.2. File đang chứa logic quan trọng

- `src/services/newsService.js`: phân trang, lọc danh mục, search, related news, cache, fallback API/mock.
- `src/stores/useNewsStore.js`: state trung tâm cho hầu hết page tin tức.
- `middleware/route-sanitizer.global.js`: sanitize query page/search, normalize slug.
- Root `pages/`: wrapper route Nuxt cho URL chính.
- `src/utils/seoHelper.js`: SEO runtime.
- `src/utils/sanitizeHtml.js`: bảo mật HTML và search input.
- `scripts/generate-sitemap.mjs`: SEO build-time.

## 10.3. File có dấu hiệu hard-code

| File | Hard-code hiện tại | Gợi ý |
| ---- | ------------------ | ----- |
| `src/data/news.js` | 32 bài mock, thumbnail `picsum.photos` | Chỉ dùng demo; production nên lấy API |
| `src/data/categories.js` | 9 danh mục mock | Production nên lấy API |
| `src/pages/NewsDetailView.vue` | Publisher name `VietNews 24h` trong schema | Nên lấy từ `appConfig.appName` |
| `scripts/generate-sitemap.mjs` | Static routes, noindex paths, robots disallow paths | Có thể đưa một phần sang config |
| `src/config/appConfig.js` | `defaultPageSize=6`, `relatedNewsLimit=4` | Có thể chuyển sang env/config nếu cần linh hoạt |
| `src/pages/ContactView.vue` | Form chưa có endpoint submit | Cần backend/contact service nếu muốn gửi thật |

## 10.4. File có thể bị lặp code

- Nhiều page còn tự dựng meta/schema riêng. Hiện đã có `useSeoHead()` và `useStructuredDataHead()`, có thể tách composable cấp page nếu code tăng.
- Header, mobile menu, footer đều dựng link menu tương tự nhau. Có thể gom cấu hình menu tĩnh.
- Nhiều component xử lý fallback image riêng bằng `onImageError`. Có thể tách helper hoặc component image chung.

## 10.5. File nên tách nhỏ

- `src/services/newsService.js`: file khá lớn, chứa cache, mock/API, pagination, home transform, category filter, detail, related, search. Có thể tách:
  - `newsRepository.js`: lấy dữ liệu API/mock.
  - `newsTransformService.js`: chia home/list/category/search.
  - `paginationHelper.js`: helper phân trang.
- `scripts/generate-sitemap.mjs`: có thể tách env loader, route builder, XML writer nếu sitemap phức tạp hơn.
- `src/utils/seoHelper.js`: có thể tách `metaHelper`, `canonicalHelper`, `schemaHelper` nếu SEO tăng.

## 10.6. File nên gom lại

- `src/services/apiClient.js` chỉ re-export `src/api/httpClient.js` để tương thích import cũ. Nếu không còn import cũ, có thể cân nhắc bỏ sau khi kiểm tra toàn source.
- Logic fallback image đang lặp ở `NewsCard`, `FeaturedNews`, `SidebarNews`, `NewsDetailView`. Có thể gom vào component `AppImage.vue`.

## 10.7. File nên chuyển sang config/env

- Publisher name trong schema bài viết.
- Page size, related limit nếu cần chỉnh theo môi trường.
- Robots disallow paths nếu có admin/login/test/draft thật.
- API endpoint news/category nếu backend không dùng chuẩn `/news`, `/categories`.

---

# 11. Đề xuất cải thiện

Các đề xuất dưới đây chỉ ghi tài liệu, chưa sửa code.

## 11.1. Cấu trúc thư mục nên cải thiện

Hiện cấu trúc đã khá rõ. Nếu project lớn hơn, có thể cân nhắc:

```text
src/
├── modules/
│   ├── news/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── stores/
│   ├── category/
│   └── auth/
```

Lý do: Module news đang chiếm nhiều file ở pages/stores/services/components.

## 11.2. File nên tách service/component

| File hiện tại | Đề xuất |
| ------------- | ------- |
| `src/services/newsService.js` | Tách repository, transform, search/filter, cache |
| `src/utils/seoHelper.js` | Tách schema helper nếu JSON-LD tăng |
| `scripts/generate-sitemap.mjs` | Tách XML builder và route source |
| `NewsCard.vue` + `SidebarNews.vue` + `FeaturedNews.vue` | Tách `AppImage.vue` để gom fallback/lazy/alt |
| `ContactView.vue` | Nếu form gửi thật, tách `contactService.js` và validate form |

## 11.3. File nên đổi tên cho dễ hiểu

| File | Gợi ý |
| ---- | ----- |
| `src/services/apiClient.js` | Có thể bỏ hoặc đổi chú thích rõ hơn vì chỉ re-export |
| `src/data/news.js` | `mockNews.js` nếu muốn phân biệt dữ liệu mock |
| `src/data/categories.js` | `mockCategories.js` nếu muốn phân biệt dữ liệu mock |
| `git-command-tabs.html` | Có thể đổi thành `git-npm-cheatsheet.html` nếu muốn tên rõ hơn |

## 11.4. File nên thêm comment

- `src/services/newsService.js`: comment ngắn cho cache và fallback API/mock.
- `middleware/route-sanitizer.global.js`: comment cho sanitize query/slug.
- `src/utils/sanitizeHtml.js`: comment về whitelist HTML.
- `scripts/generate-sitemap.mjs`: comment phần `NOINDEX_PATH_PATTERNS` và news sitemap 2 ngày.

## 11.5. File nên gom logic

- Fallback image nên gom vào component/helper.
- Menu item tĩnh nên gom thành config nếu header/mobile/footer tăng thêm link.
- SEO page có thể dùng composable `usePageSeo()` nếu các page tăng nhiều.

## 11.6. File cần bảo mật hơn

| File | Gợi ý bảo mật |
| ---- | ------------- |
| `src/utils/sanitizeHtml.js` | Giữ whitelist chặt, không mở `iframe/script/style` nếu không thật sự cần |
| `src/api/httpClient.js` | Đã có auto refresh trước hạn, retry 401 một lần, CSRF header khi bật env; vẫn cần backend CORS/CSRF đúng |
| `src/services/authSession.js` | Token chỉ lưu in-memory phía browser, không localStorage và tránh lưu token trong SSR module state; reload vẫn mất token nếu không dùng cookie/httpOnly |
| `src/services/authTokenRefresh.js` | Refresh token dùng Axios riêng để tránh vòng lặp interceptor; nếu backend dùng cookie refresh thì bật `VITE_AUTH_REFRESH_USES_COOKIE=true` |
| `.env.example` | Không đưa secret/key thật vào |
| `ContactView.vue` | Nếu gửi form thật cần validate, rate limit phía backend, chống spam |

## 11.7. SEO nên cải thiện thêm

- SSR/SSG đã được bật bằng Nuxt; bước tiếp theo là thay `VITE_APP_URL=https://example.com` bằng domain thật trước khi build production.
- `scripts/generate-sitemap.mjs` hiện lấy `src/data`; production nên lấy từ API/backend.
- OG image hiện mặc định SVG; social preview thường nên dùng PNG/JPG 1200x630.
- Có thể thêm `Article`/`NewsArticle` đầy đủ hơn nếu backend có author image, publisher logo thật.

---

# 12. Sơ đồ luồng project

## 12.1. Luồng tổng quát

```text
User
↓
Browser/crawler request URL
↓
Nuxt/Nitro SSR hoặc trả HTML đã prerender
↓
nuxt.config.js áp dụng routeRules/head/prerender config
↓
app.vue render MainLayout + NuxtPage
↓
Root pages/ chọn wrapper theo URL
↓
MainLayout.vue
↓
Page/View trong src/pages
↓
Pinia Store trong src/stores
↓
Service trong src/services
↓
Mock Data trong src/data hoặc API qua src/api/httpClient.js
↓
Mapper normalize dữ liệu
↓
Store cập nhật state
↓
Component render UI
↓
seoHelper ghi title/meta/canonical/schema vào SSR/SSG head
↓
User nhìn thấy giao diện
```

## 12.2. Luồng bài viết chi tiết

```text
User vào /tin-tuc/:slug
↓
middleware/route-sanitizer.global.js normalize slug
↓
pages/tin-tuc/[slug].vue
↓
NewsDetailView.vue
↓
newsStore.fetchNewsDetail(slug)
↓
newsService.getNewsDetailBySlug(slug)
↓
getAllNews()
↓
Nếu mock: src/data/news.js
Nếu API thật: GET /news
↓
newsMapper.normalizeNewsList()
↓
Tìm item theo slug
↓
newsStore.newsDetail + relatedNews
↓
NewsDetailView render title/content/tags/related
↓
sanitizeHtml xử lý content trước v-html
↓
seoHelper set NewsArticle JSON-LD + meta
```

## 12.3. Luồng danh mục

```text
User vào /danh-muc/:slug
↓
middleware/route-sanitizer.global.js normalize slug
↓
pages/danh-muc/[slug].vue
↓
CategoryView.vue
↓
newsStore.fetchCategoryNews(slug, page)
↓
newsService.getNewsByCategorySlug()
↓
getAllNews() + category cache
↓
Filter news theo categoryId
↓
Pagination
↓
NewsCard + SidebarNews render UI
↓
seoHelper set category meta + CollectionPage schema
```

## 12.4. Luồng tìm kiếm

```text
User nhập từ khóa
↓
SearchBox normalize input
↓
SearchView debounce hoặc submit
↓
Router cập nhật /tim-kiem?q=...
↓
middleware/route-sanitizer.global.js sanitize query q/page
↓
newsStore.searchNews(q, page)
↓
newsService.searchNews()
↓
Lọc title/summary/tags trong all news
↓
Pagination
↓
NewsCard render kết quả
↓
seoHelper set robots noindex
```

## 12.5. Luồng API thật

```text
User
↓
Page/View
↓
Store
↓
Service
↓
src/api/httpClient.js
↓
Gắn Authorization header, CSRF header nếu bật, auto refresh token/retry 401 một lần
↓
Axios request đến VITE_API_BASE_URL
↓
Backend API
↓
Database
↓
Backend response JSON
↓
Mapper normalize
↓
Store
↓
Render UI
```

Database trong sơ đồ trên là giả định ở backend. Repo frontend hiện tại chưa có database.

---

# 13. Ghi chú kiểm tra theo yêu cầu kỹ thuật

## 13.1. Không xóa code hiện tại

File tài liệu này không yêu cầu xóa code.

## 13.2. Không sửa logic project

Không cần sửa logic runtime. Tài liệu chỉ phân tích.

## 13.3. Chỉ tạo/cập nhật file `PROJECT_FLOW.md`

File tài liệu được tạo ở root project:

```text
PROJECT_FLOW.md
```

## 13.4. Nội dung viết bằng tiếng Việt

Toàn bộ tài liệu chính viết bằng tiếng Việt, giữ tên file/code/path đúng thực tế.

## 13.5. Chỗ chưa chắc

Các phần cần kiểm tra thêm:

- Backend API thực tế có đúng endpoint `/news`, `/categories`, `/categories/:slug` không.
- Database/table/stored procedure phía backend.
- UI login/admin có tồn tại ở repo khác không, vì frontend hiện có auth service nhưng chưa thấy route login/admin.
- Nếu dùng cookie auth/CSRF thật, backend cần CORS credentials, CSRF token/header, SameSite/Secure cookie đúng môi trường production.
- Contact form có cần gửi API thật không, vì hiện form chưa thấy service submit.
- Production sitemap có nên lấy dữ liệu từ backend thật thay vì `src/data`.

## 13.6. File chưa thấy nơi gọi trực tiếp

| File | Ghi chú |
| ---- | ------- |
| `src/services/apiClient.js` | Chưa thấy nơi gọi trực tiếp; hiện chỉ re-export `src/api/httpClient.js` cho import cũ |
| `src/services/authService.js` | Chưa thấy page/component gọi trực tiếp |
| `src/directives/lazyImage.js` | Được register global qua plugin, nhưng chưa thấy template dùng `v-lazy-image` trực tiếp |
| `src/stores/useAppStore.js` field `globalLoading` | Chưa thấy nơi dùng rõ trong các file đã kiểm tra |
| `src/stores/useAppStore.js` field `isAuthenticated` | Có set khi 401, nhưng chưa thấy UI login/auth route sử dụng đầy đủ |

---

# Tóm tắt nhanh cho người mới vào project

Đây là Nuxt 3 SSR/SSG cho website tin tức. Khi mở web, app đi từ `app.vue` vào `MainLayout`, Nuxt chọn wrapper trong `pages/`, rồi render lại view cũ trong `src/pages/*View.vue`. Dữ liệu tin tức vẫn nằm ở Pinia store, store gọi service, service lấy mock data hoặc API thật tùy `VITE_USE_MOCK_API`; fallback mock khi API lỗi chỉ chạy nếu bật `VITE_API_ALLOW_MOCK_FALLBACK=true`. SEO được ghi vào HTML server/static bằng `seoHelper.js` + `useHead`, còn sitemap/robots được sinh trước build bằng `scripts/generate-sitemap.mjs`.

File nên nắm đầu tiên:

1. `nuxt.config.js`
2. `app.vue`
3. `pages/`
4. `src/layouts/MainLayout.vue`
5. `src/pages/HomeView.vue`
6. `src/pages/NewsDetailView.vue`
7. `src/stores/useNewsStore.js`
8. `src/services/newsService.js`
9. `src/api/httpClient.js`
10. `src/utils/seoHelper.js`
11. `.env.example`
12. `scripts/generate-sitemap.mjs`
