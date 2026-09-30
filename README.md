# Quản lý suất ăn mầm non
Sổ "Công khai xuất nhập chi ăn hàng ngày" cho trường mầm non.

## Chạy
Chép vào `C:\xampp\htdocs\mamnon\`, bật Apache, mở `http://localhost/mamnon/` (Ctrl+F5 sau khi sửa source).
Mặc định `driver:'local'` (localStorage) nên F5 không mất dữ liệu. Đổi `js/api/kio-config.js` sang `'kio'` sau khi hoàn thiện adapter.

## Kiến trúc
UI → `app.js` / `modules/mod-*.js` → `DB.*` → `api/meal-api.js` → `api/kio-api.js` (KioStore) → local | KIO

## Cấu trúc
index.html · css/style.css · docs/mamnon_tables.sql
js/app.js · js/lib/qrcode.js (MIT, tạo QR offline) · js/api/{kio-config,kio-api,meal-api}.js · js/core/app.core.js · js/data/data.js (seed) · js/modules/{mod-daily,mod-master}.js

## Quy tắc nghiệp vụ (calc trong app.core.js)
- Thu = số cháu × tiền ăn/ngày; gas + gia vị = số cháu × đơn giá/trẻ.
- Tồn cuối = tồn đầu + SL nhập − SL chi (mặt hàng có theo dõi tồn: gạo, sữa); tự chuyển sang ngày sau.
- Thừa/thiếu = thu + tồn ngày trước − tổng chi; tự chuyển thành "Tồn ngày trước" của ngày sau.
- Thực phẩm đã phát sinh chứng từ thì không được xóa. Không khai báo tên bảng ngoài `kio-config.js`.

## Quên mật khẩu bằng OTP (Google Authenticator)
- Menu **Cài đặt mật khẩu**: đổi mật khẩu + thiết lập khóa OTP (TOTP RFC 6238: SHA-1, 6 số, 30 giây). Cần nhập mật khẩu hiện tại và mã OTP đầu tiên để bật.
- Màn đăng nhập → **Quên mật khẩu**: nhập tên đăng nhập + mã OTP → đúng thì đặt mật khẩu mới. Mỗi mã chỉ dùng một lần; sai 5 lần bị khóa 60 giây.
- Khóa OTP lưu trong bản ghi người dùng (`user.totp={secret,last}`), không cần thêm bảng. Quản trị có thể **Tắt OTP** của người dùng ở tab Người dùng (khi mất điện thoại).
