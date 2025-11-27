# GitHub OAuth Setup Guide

## Tạo GitHub OAuth App

1. Vào GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Điền thông tin:
   - **Application name**: HN Media Agency CMS
   - **Homepage URL**: https://hn-media-agency-9uwh677iz-meep-ds-projects.vercel.app
   - **Authorization callback URL**: https://hn-media-agency-9uwh677iz-meep-ds-projects.vercel.app/api/auth
4. Click "Register application"
5. Lưu lại **Client ID** và **Client Secret**

## Cấu hình Vercel Environment Variables

Thêm các biến môi trường trong Vercel:

```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## Cấu hình Decap CMS

Trong file `admin/config.yml`:

```yaml
backend:
  name: github
  repo: MEEP-D/HNMedia-agency
  branch: main
  base_url: https://hn-media-agency-9uwh677iz-meep-ds-projects.vercel.app
  auth_endpoint: api/auth
```

## Cách hoạt động

1. Khi truy cập admin, Decap CMS sẽ redirect đến GitHub OAuth
2. Người dùng đăng nhập và authorize
3. GitHub redirect về `/api/auth` với authorization code
4. API auth sẽ exchange code lấy access token
5. Decap CMS sử dụng token để commit changes vào repository

## Lưu ý quan trọng

- Repository phải public để Decap CMS hoạt động
- Người dùng phải có quyền write vào repository
- Các thay đổi sẽ được commit trực tiếp vào branch đã cấu hình