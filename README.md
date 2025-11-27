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
   GITHUB_TOKEN=your_github_personal_access_token
   ```
4. Deploy!

### Environment Variables

Thêm các biến môi trường trong Vercel Dashboard:

```
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
```

**Cách lấy GitHub OAuth credentials:**
1. Vào GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Điền thông tin:
   - **Application name**: HN Media Agency CMS
   - **Homepage URL**: https://your-domain.vercel.app
   - **Authorization callback URL**: https://your-domain.vercel.app/api/auth
4. Lưu lại Client ID và Client Secret

### Cấu hình Decap CMS

Sau khi deploy, cập nhật file `public/admin/config.yml`:

```yaml
backend:
  name: github
  repo: your-username/your-repo-name  # Thay bằng repo của bạn
  branch: main
  base_url: https://your-domain.vercel.app
  auth_endpoint: api/auth
```

## Quản lý nội dung

Truy cập `/admin/` để vào giao diện quản lý nội dung với Decap CMS.

Các collections có sẵn:
- **Cài đặt**: Cấu hình chung, thương hiệu, màu sắc
- **SEO**: Cấu hình SEO cho từng trang
- **Nội dung trang**: Quản lý nội dung các trang

## Hỗ trợ

Nếu gặp lỗi khi deploy hoặc sử dụng CMS, kiểm tra:
1. GitHub OAuth App đã được cấu hình đúng
2. Environment variables đã được thêm vào Vercel
3. Repository có quyền truy cập

## License

MIT License