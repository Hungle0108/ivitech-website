# Bảng màu số 1 và nền trang trí

Bản cập nhật này thay thế quy định xanh lá trang trí trong HE-MAU.md. Logo, ảnh thật và màu trạng thái chức năng được giữ nguyên.

Màu chủ đạo #2363EB; tiêu đề #102A56; lavender #7564C8; nền lavender #F1EEFA; xám lạnh #F8F9FC; trắng #FFFFFF; chữ phụ #475569. Chữ lavender nhỏ chỉ dùng trên trắng hoặc xám lạnh (tương phản 4,76:1 và 4,52:1). Trên nền lavender nhạt, dùng navy cho chữ nhỏ. Chữ trắng trên CTA xanh dương đạt 5,18:1.

## Tài sản được sử dụng

- Trang chủ H01: ảnh kính mờ trừu tượng đã tạo riêng cho website, không phải ảnh hoạt động thực tế; desktop WebP 1920 × 1080, khoảng 31 KB; mobile WebP 720 × 960, khoảng 9 KB.
- Hero iViVi: dùng cùng ảnh trang trí với lớp phủ nhẹ hơn về độ nổi, không phải ảnh lớp học hay bằng chứng triển khai.
- Hero Giới thiệu: nền màu dự phòng, chưa gắn ảnh đội ngũ. Chờ ảnh được xác nhận phù hợp cho vị trí hero.
- Không bổ sung ảnh người AI hoặc ảnh doanh nghiệp khác. Các ảnh nội dung đã có được giữ nguyên.

## Chỉnh sửa trong quản trị

Mở Nội dung trang chủ → H01, Giới thiệu, hoặc Sản phẩm → iViVi. Trong “Nền trang trí (Backdrop)” có bật/tắt, ảnh desktop/mobile, màu nền dự phòng, màu lớp phủ, điểm lấy nét ngang/dọc riêng mỗi thiết bị và ba mức phủ desktop. Mobile tự tăng độ phủ để bảo vệ vùng chữ. Các giá trị phần trăm nằm trong khoảng 0–100.

Chọn ảnh từ thư viện; muốn thay bằng ảnh thật cần xác nhận quyền sử dụng và kiểm tra khuôn mặt/chủ thể trên cả hai kích thước. Để ảnh trống sẽ dùng nền dự phòng. Không giảm lớp phủ nếu chưa kiểm tra lại độ tương phản. Lưu nháp → Xem trước → Xuất bản riêng VI/EN. Tắt backdrop không đổi nội dung trang.

Ảnh thuần trang trí có alt rỗng, nằm trong lớp aria-hidden, không nhận thao tác chuột, cắt tràn trong section. Nền dự phòng vẫn tồn tại khi ảnh lỗi. Picture chọn ảnh mobile riêng; ảnh hero tải sớm, component hỗ trợ lazy khi dùng ở vị trí phía dưới. Không video, parallax hoặc animation nền.

## Kiểm tra

Build thành công. Đã kiểm tra lưu và đọc lại cấu hình, preview nháp không ảnh hưởng bản công khai, giới hạn phần trăm, từ chối ảnh ngoài thư viện, quyền truy cập và schema xuất bản. Bản dữ liệu trước/sau được đối chiếu: nội dung cũ, trạng thái xuất bản và thời điểm xuất bản giữ nguyên; chỉ thêm cấu hình trang trí và ảnh mobile mới.

Kiểm tra trình duyệt: 12 trường hợp (3 hero × VI/EN × 1440/390 px), không tràn ngang; mobile chọn đúng ảnh riêng. Quét chữ trên trang chủ không phát hiện cặp màu nền phẳng dưới 4,5:1; vùng ảnh được kiểm tra trực quan với lớp phủ. Giả lập chặn tải backdrop: ảnh lỗi được ẩn, tiêu đề và CTA vẫn hiển thị trên nền dự phòng. Đã gỡ chặn sau kiểm tra.
