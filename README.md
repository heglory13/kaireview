# FPT Jobs Clone

Project đã được tách thành hai phần:

- `frontend/`: Next.js 16 app, React 19, Tailwind CSS v4.
- `backend/`: Node.js API dùng SQLite, có dữ liệu tuyển dụng mẫu và form ứng tuyển.

## Chạy project

```bash
npm run dev
```

Mặc định lệnh trên chạy frontend tại `http://localhost:3000`.

Chạy backend riêng:

```bash
npm run dev:backend
```

Backend mặc định chạy tại `http://localhost:4000` với endpoint:

```text
GET /api/health
GET /health
GET /api/jobs
GET /api/jobs/meta
GET /api/jobs/:slug
GET /api/applications
GET /api/applications/:id
POST /api/applications
PATCH /api/applications/:id
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
POST /api/auth/logout
GET /api/candidate/profile
PUT /api/candidate/profile
```

SQLite database được tạo tự động tại `backend/data/fptjobs.sqlite`. Có thể đổi vị trí bằng biến môi trường `SQLITE_PATH`.
Token đăng nhập được ký bằng `AUTH_TOKEN_SECRET`; khi chạy local nếu chưa cấu hình sẽ dùng secret dev mặc định.

## Gửi email Gmail cho admin

Khi ứng viên nộp hồ sơ, backend sẽ gửi email chi tiết cho admin nếu SMTP Gmail được cấu hình. Với Gmail, hãy dùng App Password thay cho mật khẩu đăng nhập thường:

Tạo file `backend/.env` từ file mẫu `backend/.env.example`:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="your-gmail@gmail.com"
SMTP_PASS="your-gmail-app-password"
SMTP_FROM="your-gmail@gmail.com"
ADMIN_NOTIFICATION_EMAIL="admin-receiver-1@gmail.com,admin-receiver-2@gmail.com"
```

Nếu chỉ gửi cho một email thì đặt một địa chỉ như bình thường. Nếu gửi cho nhiều email, phân tách bằng dấu phẩy hoặc dấu chấm phẩy.

Có thể cấu hình thêm `PUBLIC_SITE_URL` và `API_PUBLIC_URL` để link bài tuyển dụng/CV trong email là URL public đầy đủ.

Ví dụ tạo hồ sơ ứng tuyển:

```bash
curl -X POST http://localhost:4000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "jobSlug": "nhan-vien-kinh-doanh-cau-giay-25874",
    "fullName": "Nguyen Van A",
    "email": "a@example.com",
    "phone": "0901234567",
    "coverLetter": "Tôi muốn ứng tuyển vị trí này."
  }'
```

## Scripts

```bash
npm run dev:frontend
npm run dev:backend
npm run build
npm run lint
npm run typecheck
npm run check
```
