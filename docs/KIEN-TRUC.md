> Cập nhật: trang chủ và quản trị đã chuyển sang H01–H13. Xem [hướng dẫn bản bổ sung](BO-SUNG-H01-H13.md) cho cấu trúc và kiểm tra hiện tại. Thông tin về hero cũ/10 module bên dưới thuộc bản đầu.

# Kiến trúc website iViTech

## Phạm vi và nguồn quyết định

Brief Astra v1.0 ngày 25/09/2026 là đặc tả hiện hành. Sơ đồ H01–H13 từ cuộc trò chuyện cũ được thay bằng 10 module trong brief mới. Website có 12 trang ban đầu mỗi ngôn ngữ: trang chủ, giới thiệu, 7 giải pháp, khách hàng/dự án, tin tức, liên hệ. Trang chi tiết tin tức và dự án sinh từ nội dung được xuất bản.

## Luồng dữ liệu

Giao diện công khai → bản xuất bản trong SQLite → template hiển thị.
Quản trị → API kiểm tra phiên, quyền, CSRF và dữ liệu → bản nháp.
Xuất bản → sao chép bản nháp sang snapshot xuất bản của ngôn ngữ được chọn.
Ảnh → kiểm tra định dạng, giải mã và tối ưu WebP → ổ đĩa → metadata SQLite.

Website không đọc nội dung sản phẩm trực tiếp từ mảng JSX hoặc localStorage. Mã khởi tạo chỉ chạy một lần; cập nhật trong CMS được giữ qua lần chạy sau.

## Các bảng

| Bảng | Vai trò |
|---|---|
| documents | Mã nội dung ổn định, loại collection, trạng thái thùng rác |
| translations | Bản nháp và bản xuất bản riêng VI/EN; trạng thái, phiên bản, thời điểm |
| revisions | Lịch sử lưu và hành động; khôi phục về nháp |
| media | Tên ảnh, alt VI/EN, nguồn, điểm lấy nét, kích thước, thùng rác |
| users | Tài khoản, băm mật khẩu, vai trò, trạng thái |
| sessions | Băm token phiên, CSRF, hạn dùng 8 giờ |
| limits | Giới hạn đăng nhập và gửi biểu mẫu |
| meta | Đánh dấu các bước khởi tạo dữ liệu |

SQLite bật WAL, foreign keys, busy timeout. Thay đổi nhiều bảng dùng giao dịch. Phiên bản nội dung chống ghi đè khi hai người biên tập đồng thời.

## Các loại nội dung và giao diện quản trị

Trang chủ, Giới thiệu, Nhóm giải pháp, Sản phẩm, Khách hàng/Dự án, Đối tác, Đánh giá, Chứng nhận/Số liệu, Ghi nhận, Tin tức, Liên hệ, Cài đặt website và Trang danh sách.

Trường dùng chung: tên, mô tả, đường dẫn, nội dung, các phân đoạn, ảnh, alt, nguồn nội bộ, thứ tự và SEO. Sản phẩm có mã nhóm. Nhóm có biểu tượng và mô tả. Tin tức/dự án có chuyên mục; bộ lọc xuất hiện khi có nhiều chuyên mục.

Trang chủ có 10 module cố định về template; có thể sửa tiêu đề, mô tả, bật/tắt và đổi thứ tự. Các collection chứng minh năng lực ban đầu rỗng. Bật module rỗng chỉ tạo khung trong preview; trang công khai vẫn thu gọn.

Cài đặt toàn cục quản lý logo, tên thương hiệu, nhãn menu, nút tư vấn, footer, điện thoại, email, địa chỉ và liên kết xã hội. Các trường cần dịch được lưu riêng VI/EN.

## Bản nháp, xem trước và xuất bản

- Lưu nháp không thay thế snapshot công khai.
- Mỗi ngôn ngữ xuất bản/ẩn riêng.
- Preview yêu cầu phiên đăng nhập phía máy chủ.
- URL bản dịch được ánh xạ bằng mã nội dung, không đoán slug.
- Bản dịch chưa xuất bản có trang thông báo; không âm thầm trộn tiếng Việt vào /en.
- Xóa đưa cả nội dung vào thùng rác. Khôi phục đưa về trạng thái ẩn để kiểm tra trước khi xuất bản lại.
- Khôi phục lịch sử chỉ thay đổi nháp.
- Ảnh mới chỉ được trả công khai khi được tham chiếu trong snapshot đang xuất bản; các ảnh chưa dùng đòi hỏi đăng nhập.
- Bản chạy thử chặn lập chỉ mục bằng robots và X-Robots-Tag. Canonical và hreflang vẫn có đủ để kiểm tra.

## Quyền

| Vai trò | Xem nháp | Biên tập / Xuất bản | Ảnh | Tài khoản / Xuất |
|---|---:|---:|---:|---:|
| Quản trị viên | Có | Có | Có | Có |
| Biên tập viên | Có | Có | Có | Không |
| Quản lý ảnh | Có | Không | Có | Không |
| Chỉ xem | Có | Không | Không | Không |

API kiểm tra quyền trên từng thao tác. Giao diện khóa nút tương ứng để tránh nhầm. Cookie HttpOnly, SameSite=Strict; Secure khi SITE_URL là HTTPS. Các yêu cầu ghi yêu cầu Origin hợp lệ và CSRF, ngoại trừ đăng nhập và biểu mẫu công khai có kiểm tra Origin và giới hạn riêng.

Nội dung rich text là tập con định dạng văn bản: đoạn, danh sách và chữ đậm. Không thực thi HTML tùy ý. Ảnh chỉ nhận PNG/JPEG/WebP, xác thực chữ ký tệp, giải mã, giới hạn kích thước, loại metadata và mã hóa lại WebP.

## Tích hợp chưa kết nối

CONTACT_WEBHOOK_URL và CONTACT_WEBHOOK_TOKEN để trống. Website không lưu hoặc gửi dữ liệu form khi chưa cấu hình. Khi cấu hình HTTPS, máy chủ kiểm tra dữ liệu, hạn chế gửi lặp, gửi đến webhook và chỉ báo thành công khi nhận HTTP 2xx.

Chưa có tên miền/hosting; chưa kết nối email, Zalo, chatbot hoặc phân tích truy cập. Không có chức năng nội bộ của các phần mềm sản phẩm.

