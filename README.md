# Website iViTech — bản chạy thử cục bộ

Website song ngữ Việt–Anh, trang chủ H01–H13, 7 trang giải pháp và CMS có dữ liệu lưu bền vững. Tiếng Việt mặc định. Chưa xuất bản lên tên miền thật.

## Mở bản chạy thử

- Website: http://127.0.0.1:3187/vi
- English: http://127.0.0.1:3187/en
- Quản trị: http://127.0.0.1:3187/admin

Nếu máy đã dừng ứng dụng, chạy lại theo các bước dưới đây.

## Yêu cầu

Node.js **24 LTS** (đã kiểm tra với 24.21.0), npm, ổ đĩa có quyền ghi. Không cần đăng ký dịch vụ trả phí.

## Cài và chạy

Trong thư mục website:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run build
npm start
```

Không ghi đè `.env.local` đã được cấu hình. Repository chỉ chứa `.env.example`; tạo `.env.local` trên máy chạy ứng dụng. Khi phát triển giao diện có thể dùng `npm run dev`.

Ứng dụng chỉ lắng nghe tại 127.0.0.1, cổng 3187. Không có thao tác xuất bản ra Internet trong quá trình bàn giao.

## Tạo quản trị viên đầu tiên

Không có mật khẩu mặc định hoặc tài khoản dùng chung. Repository không chứa tài khoản, mật khẩu hoặc cơ sở dữ liệu của bản chạy thử.

Mở PowerShell trong thư mục website:

```powershell
$env:ADMIN_EMAIL = Read-Host "Email quản trị"
$env:ADMIN_NAME = Read-Host "Tên hiển thị"
$adminSecret = Read-Host "Mật khẩu ít nhất 12 ký tự" -AsSecureString
$env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new("", $adminSecret).Password
npm run admin:create
Remove-Item Env:ADMIN_PASSWORD
Remove-Item Env:ADMIN_EMAIL
Remove-Item Env:ADMIN_NAME
```

Mật khẩu được lưu dưới dạng băm scrypt kèm salt. Lệnh chỉ tạo tài khoản khi cơ sở dữ liệu chưa có người dùng. Sau đó dùng mục **Tài khoản** trong quản trị để tạo thêm.

## Tài liệu bàn giao

- [Bản cập nhật H01–H13: vận hành và kiểm tra](docs/BO-SUNG-H01-H13.md)

- [Hướng dẫn vận hành](docs/HUONG-DAN-VAN-HANH.md)
- [Kiến trúc và mô hình nội dung](docs/KIEN-TRUC.md)
- [Đối chiếu nội dung và tài sản còn thiếu](docs/NOI-DUNG-VA-TAI-SAN.md)
- [Kết quả kiểm tra](docs/KIEM-THU.md)

## Lựa chọn kỹ thuật

Next.js 16 / React, chạy bằng Node.js; SQLite trên ổ đĩa và thư mục ảnh `data/media`. Giao diện dùng Be Vietnam Pro tự lưu trữ (SIL Open Font License), các thành phần tương tác Radix/shadcn và biểu tượng Lucide.

Khung Sites ban đầu được dùng để chuẩn bị cấu trúc và thư viện giao diện. Bản này chạy **cục bộ bằng Next.js/Node**, không phụ thuộc dịch vụ đăng nhập hoặc lưu trữ của Sites/Cloudflare. Chưa đăng ký hosting.

## Dữ liệu

- `data/ivitech.sqlite`: bản nháp, bản xuất bản, người dùng, phiên đăng nhập, lịch sử và metadata ảnh.
- `data/media/`: ảnh tải lên và tài sản khởi tạo.
- `lib/initial-content.mjs`: nội dung khởi tạo lần đầu, không phải nguồn dữ liệu trực tiếp của trang công khai.
- `lib/db.mjs`: khởi tạo schema và nội dung một lần; lần chạy sau đọc dữ liệu đã lưu.
- `public/brand/`: tài sản nhận diện gốc phục vụ khởi tạo. Không chứa PDF đầy đủ hoặc giấy tờ pháp lý.

Không xóa `data` khi cập nhật mã nguồn. Nếu dùng môi trường triển khai mới, đặt `IVITECH_DATA_DIR` trỏ tới ổ lưu trữ bền vững. SQLite của bản này phù hợp một máy chủ ghi dữ liệu; không dùng thư mục tạm hoặc nhiều bản ứng dụng độc lập với các ổ đĩa riêng.

## Kiểm thử

`qa/integration-results.json` lưu kết quả kiểm tra API. Bộ kiểm thử có tạo nội dung tạm; chỉ chạy trong bản sao dữ liệu hoặc môi trường kiểm thử. Không chạy bộ kiểm thử trên website đã có nội dung vận hành.


## Phạm vi bản GitHub

Mã nguồn và nội dung khởi tạo VI/EN đã cập nhật A01/B01/C01; tài sản cần chạy và hướng dẫn quản trị. Không chứa dữ liệu vận hành, tài khoản thử nghiệm, phiên đăng nhập, bản sao lưu, tài liệu nguồn đầy đủ hoặc cấu hình bí mật. Dữ liệu mới được khởi tạo khi chạy lần đầu; các chỉnh sửa riêng trong cơ sở dữ liệu cục bộ không tự chuyển sang máy khác.
