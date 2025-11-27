# GitHub OAuth Setup Guide

## GitHub OAuth App đã tạo ✅

**Application Name**: HNMedia  
**Client ID**: `Ov23lio2L0EkJ9lpqLt9`  
**Status**: Ready và đã sử dụng trong tuần qua

## Cấu hình hiện tại

**Homepage URL**: `https://hn-media-agency-9uwh677iz-meep-ds-projects.vercel.app` ✅  
**Authorization callback URL**: `https://hn-media-agency-9uwh677iz-meep-ds-projects.vercel.app/api/auth` ✅

## Cấu hình Vercel Environment Variables

1. **Vào Vercel Dashboard**: https://vercel.com/dashboard
2. **Chọn project**: `hn-media-agency`  
3. **Click Settings tab** → Environment Variables
4. **Thêm biến môi trường**:

```
GITHUB_CLIENT_ID=Ov23lio2L0EkJ9lpqLt9
GITHUB_CLIENT_SECRET=[Client Secret từ GitHub OAuth App]
```

5. **Click Save** và **Redeploy** project

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

## ✅ Kiểm tra hoàn tất

Sau khi cấu hình xong:
1. **Truy cập**: https://hn-media-agency-9uwh677iz-meep-ds-projects.vercel.app/admin/
2. **Click "Login with GitHub"**
3. **Authorize application** và đăng nhập
4. **Success**: Vào được giao diện quản trị CMS

## 📋 Tình trạng hiện tại
- ✅ GitHub OAuth App: Đã tạo và cấu hình
- ✅ Domain Vercel: `hn-media-agency-9uwh677iz-meep-ds-projects.vercel.app`
- ✅ Admin CMS: Hoạt động tại `/admin/`
- ⏳ Cần: Cấu hình Environment Variables trong Vercel