> Cập nhật: trang chủ và quản trị đã chuyển sang H01–H13. Xem [hướng dẫn bản bổ sung](BO-SUNG-H01-H13.md) cho cấu trúc và kiểm tra hiện tại. Thông tin về hero cũ/10 module bên dưới thuộc bản đầu.

# Kết quả kiểm tra bản chạy thử

Ngày kiểm tra: 25/09/2026. Môi trường: Windows, Node.js 24.21.0, Next.js 16.3.4, bản production chạy tại 127.0.0.1:3187, trình duyệt Chromium trong Codex.

## Chức năng

| Hạng mục | Kết quả |
|---|---|
| Build production và kiểm tra TypeScript | Đạt |
| 24 đường dẫn nội dung ban đầu (12 trang × VI/EN), canonical, ngôn ngữ HTML, 404 | Đạt |
| Mặc định VI; chuyển Smart iVier VI → đúng trang EN | Đạt |
| Menu desktop 4 nhóm, menu mobile, accordion, Escape và trả focus | Đạt |
| CRUD sản phẩm song ngữ, ảnh thật, xem trước, xuất bản từng ngôn ngữ | Đạt |
| Sửa nháp không làm đổi bản xuất bản; chống ghi đè phiên bản cũ | Đạt |
| Ẩn riêng ngôn ngữ, thùng rác cả hai bản, khôi phục ở trạng thái ẩn | Đạt |
| Bài viết và dự án: danh sách, đường dẫn chi tiết, xuất bản VI/EN | Đạt với nội dung kiểm thử tạm thời, đã gỡ |
| Phiên đăng nhập, nội dung, phiên bản và ảnh sau khởi động lại | Đạt |
| Khách chưa đăng nhập bị chặn API quản trị và preview | Đạt |
| Phân quyền admin/editor/media/viewer; chống CSRF và nguồn ghi ngoài ứng dụng | Đạt |
| Từ chối SVG, liên kết javascript; nội dung HTML được hiển thị an toàn như văn bản | Đạt |
| Ảnh chưa xuất bản không truy cập công khai; ảnh xuất bản truy cập được | Đạt |
| Lịch sử và xuất nội dung đúng quyền | Đạt |
| Form VI/EN báo trường thiếu, giữ nội dung, nói rõ chưa gửi khi chưa kết nối | Đạt |
| Sao lưu SQLite + ảnh; khôi phục vào thư mục riêng và kiểm tra tính toàn vẹn | Đạt; phiên đăng nhập bị xóa ở bản khôi phục |
| Tài khoản và nội dung kiểm thử đã được gỡ | Đạt: còn 17 bản ghi cấu trúc/nội dung, 3 ảnh khởi tạo, 0 tài khoản |

13 nhóm kiểm thử API ở `qa/integration-results.json` đều đạt. Kiểm thử bổ sung sau khởi động lại và mẫu tin tức/dự án nằm ở `qa/additional-results.json`. Luồng giao diện thực đã tạo bản nháp, sửa, lưu, xác nhận xuất bản, mở trang công khai và ẩn lại. Lỗi trạng thái “chưa lưu” sau khi lưu được phát hiện và sửa; đã kiểm tra lại nút preview/publish và trạng thái lưu. Bản cuối cũng kiểm tra ngôn ngữ HTML của preview EN và điểm lấy nét ảnh bằng 0.

## Desktop và mobile

Đã kiểm tra 7 trang đại diện tại mỗi độ rộng **360, 390, 768, 1024, 1440 px** (35 tổ hợp): trang chủ VI/EN, Giới thiệu VI, Smart iVier EN, Khách hàng/Dự án VI, Tin tức EN, Liên hệ VI. Không phát hiện tràn ngang hoặc ảnh bị lỗi. Quản trị được kiểm tra riêng ở 390 px và desktop. Đây là kiểm tra viewport mô phỏng, chưa kiểm tra trên thiết bị iOS/Android vật lý hoặc Safari.

Ảnh chụp:
- `qa/desktop.png`: toàn trang chủ VI desktop.
- `qa/mobile.png`, `qa/mobile-en.png`: toàn trang chủ trên mobile.
- `qa/admin-desktop.png`, `qa/admin-mobile.png`: quản trị.

Đã đối chiếu với MPT ở hero, tỷ lệ chữ, menu nhóm giải pháp, bố cục nhóm/sản phẩm, nền xen kẽ và khoảng trắng. Logo dùng bộ nhận diện iViTech. Ảnh hero tạo riêng. Các ảnh sản phẩm chưa có tài sản phù hợp được thay bằng khung chờ trung tính.

## Hiệu năng đã đo

Một lần tải trang chủ EN trên bản production cục bộ, viewport 390px: TTFB **22 ms**, DOMContentLoaded **102 ms**, load **117 ms**, First Contentful Paint **180 ms**. Dữ liệu gốc: `qa/performance-local.json`.

Đây là số đo trên localhost với điều kiện cache của phiên kiểm tra, không phải điểm Lighthouse hay cam kết tốc độ trên Internet. Chưa có máy chủ thật hoặc mạng di động để đo Core Web Vitals ngoài thực tế.

## Giới hạn cần biết

- Form chưa có nơi nhận được duyệt: đã kiểm tra trạng thái chưa kết nối, chưa kiểm tra giao nhận với dịch vụ bên ngoài.
- Các vùng khách hàng, dự án, đánh giá, đối tác, chứng nhận và tin tức bàn giao rỗng theo brief; mẫu dữ liệu tạm chỉ dùng để thử chức năng rồi gỡ.
- Chưa xuất bản tên miền, cấu hình email, phân tích truy cập hoặc công cụ tìm kiếm.
- Kiểm tra quyền và đầu vào là kiểm tra chức năng có mục tiêu; không thay cho kiểm thử xâm nhập độc lập.
- Trước vận hành thật cần rà duyệt nội dung/bản dịch, bổ sung tài sản, chọn nơi nhận form và kiểm tra trên hạ tầng triển khai.
