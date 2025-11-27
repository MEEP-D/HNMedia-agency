# HN Media Agency Website

Website tĩnh cho HN Media Agency với Decap CMS để quản lý nội dung.

## Tính năng

- Website tĩnh hiện đại, responsive
- Decap CMS để quản lý nội dung
- Hỗ trợ đa ngôn ngữ (Tiếng Việt & Tiếng Anh)
- Tối ưu SEO
- Deploy dễ dàng với Vercel

## Cấu trúc thư mục

```
├── content/          # File JSON chứa nội dung
├── css/              # File CSS
├── images/           # Hình ảnh
├── js/               # JavaScript
├── public/admin/     # Decap CMS
├── api/              # API cho GitHub authentication
└── vercel.json       # Cấu hình Vercel
```

## Cài đặt local

1. Clone repository
2. Cài đặt dependencies:
   ```bash
   npm install
   ```
3. Chạy server local:
   ```bash
   npm run dev
   ```
4. Truy cập:
   - Website: http://localhost:8080
   - Admin CMS: http://localhost:8080/admin/

## Deploy lên Vercel

### Chuẩn bị

1. Tạo GitHub OAuth App:
   - Vào GitHub Settings > Developer settings > OAuth Apps
   - Tạo mới với:
     - Application name: "HN Media Agency CMS"
     - Homepage URL: `https://hn-media-agency.vercel.app`
     - Authorization callback URL: `https://hn-media-agency.vercel.app/api/auth`
   - Lưu Client ID và Client Secret

2. Fork repository này về tài khoản GitHub của bạn

### Deploy

1. Vào [Vercel](https://vercel.com)
2. Import repository vừa fork
3. Cấu hình Environment Variables:
   ```
   GITHUB_CLIENT_ID=Ov23lio2L0EkJ9lpqLt9
   GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
   ```
4. Deploy!

### Environment Variables

Thêm các biến môi trường trong Vercel Dashboard:

```
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
```

**GitHub OAuth App đã tạo:**
- **Application name**: HNMedia
- **Client ID**: `Ov23lio2L0EkJ9lpqLt9`
- **Homepage URL**: `https://hn-media-agency-9uwh677iz-meep-ds-projects.vercel.app`
- **Authorization callback URL**: `https://hn-media-agency-9uwh677iz-meep-ds-projects.vercel.app/api/auth`

**Cách lấy GitHub Client Secret:**
1. Vào GitHub Settings > Developer settings > OAuth Apps
2. Click vào "HNMedia" app
3. Tạo mới Client Secret và lưu lại

### Cấu hình Decap CMS

Sau khi deploy, file `admin/config.yml` đã được cấu hình sẵn với:

```yaml
backend:
  name: github
  repo: MEEP-D/HNMedia-agency
  branch: main
  base_url: https://hn-media-agency-9uwh677iz-meep-ds-projects.vercel.app
  auth_endpoint: api/auth
```

## Quản lý nội dung

Truy cập `https://hn-media-agency-9uwh677iz-meep-ds-projects.vercel.app/admin/` để vào giao diện quản lý nội dung với Decap CMS.

Các collections có sẵn:
- **Cài đặt**: Cấu hình chung, thương hiệu, màu sắc
- **SEO**: Cấu hình SEO cho từng trang
- **Nội dung trang**: Quản lý nội dung các trang

## Hỗ trợ

Nếu gặp lỗi khi deploy hoặc sử dụng CMS, kiểm tra:
1. ✅ GitHub OAuth App đã được cấu hình đúng (HNMedia)
2. ✅ Environment variables đã được thêm vào Vercel (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET)
3. ✅ Repository public và có quyền truy cập
4. ✅ Admin CMS hoạt động tại `/admin/`

## License

MIT License