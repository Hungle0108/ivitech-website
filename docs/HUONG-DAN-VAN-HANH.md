> Cập nhật: trang chủ và quản trị đã chuyển sang H01–H13. Xem [hướng dẫn bản bổ sung](BO-SUNG-H01-H13.md) cho cấu trúc và kiểm tra hiện tại. Thông tin về hero cũ/10 module bên dưới thuộc bản đầu.

# Hướng dẫn vận hành

## Biên tập và xuất bản

1. Đăng nhập /admin, chọn mục bên trái.
2. Với sản phẩm/tin tức/dự án, chọn **Thêm mới** hoặc **Biên tập**.
3. Chọn tab **Tiếng Việt** hoặc **English**; nhập nội dung riêng từng ngôn ngữ. Không cần sửa mã hay JSON.
4. Chọn ảnh từ thư viện; nhập alt phù hợp ngôn ngữ. Có thể dùng lại ảnh đã tải.
5. **Lưu nháp**; kiểm tra thông báo thành công. Nếu lỗi, dữ liệu vẫn nằm trên form để sửa hoặc thử lại.
6. **Xem trước** mở bản nháp ở vùng chỉ người đăng nhập truy cập.
7. **Xuất bản** và xác nhận để thay thế bản công khai của tab đang chọn.
8. Lặp lại cho ngôn ngữ còn lại. Nội dung chưa có bản Anh không tự xuất bản bằng tiếng Việt.

Đường dẫn là chữ thường không dấu, số và gạch ngang. Tên thương hiệu giữ nguyên. Khi sửa slug đã xuất bản, đường dẫn cũ không tự tạo chuyển hướng; kiểm tra các liên kết đã chia sẻ trước khi đổi.

## Bật các phần đang chờ

Chọn Trang chủ → tab ngôn ngữ → Các khối trang chủ. Bật/tắt hoặc đổi thứ tự; sau đó Lưu nháp, Xem trước, Xuất bản.

Để khối Dự án/Đối tác/Đánh giá/Chứng nhận xuất hiện, cần cả:
- Có nội dung ở collection tương ứng đã được duyệt và xuất bản.
- Module trang chủ được bật và xuất bản.

Module rỗng sẽ không tạo màn hình trống trên bản công khai.

## Ảnh

PNG, JPEG, WebP; tối đa 5 MB/ảnh và 24 triệu điểm ảnh trước tối ưu. Ảnh được tự tối ưu WebP, tối đa 1920px mỗi chiều, không phóng lớn. Thư viện cho phép sửa tên, alt VI/EN, nguồn và điểm lấy nét. Tên/alt trong nội dung có thể được biên tập riêng theo ngữ cảnh.

Ảnh còn được tham chiếu trong bản nháp hoặc snapshot xuất bản không được đưa vào thùng rác. Gỡ tham chiếu trước. Không công bố PDF hồ sơ đầy đủ, giấy tờ hoặc ảnh người khác nếu chưa được chọn duyệt.

## Ẩn, xóa và khôi phục

**Ẩn** chỉ tác động ngôn ngữ đang chọn. **Thùng rác** gỡ cả hai ngôn ngữ, dữ liệu vẫn còn. **Khôi phục** đưa nội dung về trạng thái ẩn. Kiểm tra và xuất bản lại khi sẵn sàng.

**Lịch sử** cho phép lấy nội dung từ một lần lưu trước về bản nháp; không tự ghi đè bản xuất bản.

## Kênh liên hệ và biểu mẫu

Cài đặt website chứa email, điện thoại, địa chỉ, Facebook, YouTube, Zalo. Điền riêng từng ngôn ngữ khi cần. Các trường rỗng không tạo nút giả. Dữ liệu liên hệ trong PDF không được tự nhập.

Nơi nhận form do người vận hành cấu hình trong .env.local:
```
CONTACT_WEBHOOK_URL=https://your-approved-receiver.example/endpoint
CONTACT_WEBHOOK_TOKEN=
```

URL trên chỉ là ví dụ cấu hình, không được dùng làm nơi nhận thật. Endpoint phải là nơi nhận đã được chủ website lựa chọn. Nhận JSON gồm name, organization, email, phone, solution, message, lang. Trả HTTP 2xx khi đã tiếp nhận. Khóa dịch vụ chỉ nằm phía máy chủ. Khởi động lại ứng dụng sau thay đổi môi trường.

Khi chưa cấu hình, nút chỉ kiểm tra các trường tại trình duyệt và nói rõ chưa gửi; API cũng từ chối tiếp nhận. Khi kết nối, thử gửi đến nơi nhận kiểm thử do bạn kiểm soát trước khi mở cho khách truy cập.

## Sao lưu đầy đủ

```powershell
npm run backup -- backups/ivitech-2026-09-25
```

Lệnh tạo thư mục mới có snapshot SQLite, toàn bộ ảnh và manifest SHA-256. Không chọn thư mục đã tồn tại. Giữ bản sao ngoài máy chủ vận hành. Bản sao bao gồm thông tin tài khoản đã băm; bảo quản như tài liệu nội bộ.

Nút **Xuất nội dung** trong quản trị xuất JSON để đối chiếu, không thay thế bản sao đầy đủ cùng ảnh.

## Khôi phục

Dừng ứng dụng trước, sau đó:

```powershell
npm run restore -- backups/ivitech-2026-09-25 --app-stopped
npm start
```

Lệnh kiểm tra đường dẫn, mã kiểm tra và tính toàn vẹn SQLite. Dữ liệu hiện tại được đổi sang thư mục data-before-restore-...; không bị xóa. Các phiên đăng nhập trong bản sao bị vô hiệu để người dùng đăng nhập lại.

Có thể thử khôi phục riêng bằng IVITECH_DATA_DIR trỏ tới một thư mục mới. Sau khi kiểm tra, bỏ biến này hoặc trả về vị trí vận hành đúng.

## Cấu hình khi triển khai sau này

SITE_URL phải đúng origin, bao gồm http/https và cổng nếu có. ALLOW_INDEXING mặc định false. Chỉ bật true khi nội dung được duyệt và môi trường thật đã sẵn sàng. Dùng HTTPS và ổ đĩa bền vững. Sao lưu trước khi cập nhật. Mã nguồn bản này cần Node.js; không chạy trực tiếp như tập HTML tĩnh hoặc Worker Cloudflare.

Chưa xuất bản lên tên miền thật trong phạm vi bàn giao này.

