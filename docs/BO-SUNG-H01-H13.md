# Bổ sung H01–H13 — vận hành và kiểm tra

Bản cập nhật ngày 25/09/2026, áp dụng Script bổ sung website iViTech, đối chiếu iViTech_Website.docx và hồ sơ PDF. Phần này thay cấu trúc trang chủ 10 module của bản đầu; các trang sản phẩm, Tin tức, Khách hàng/Dự án, Liên hệ và nền tảng quản trị được giữ.

## Những phần đã thay

- H01: nội dung mới, hai CTA đúng đích, cấu trúc 54/46 khi có ảnh thật. Khi chưa có ảnh, bản công khai dùng bố cục chữ gọn; preview giữ vùng ảnh. Có lựa chọn ảnh mobile riêng.
- H02: bốn quan sát, không CTA; H03: năm yếu tố kết nối bằng HTML/CSS, không gọi là năm bước triển khai.
- H04: nền navy và bốn dải ngang có mức nhấn bằng nhau, tên/giá trị lấy từ bản ghi nhóm; liên kết riêng tới sản phẩm và nhóm học tập.
- H05: hồ sơ → chỉnh lý → số hóa → dữ liệu → truy xuất → tri thức.
- H06: Smart iVier và iViHRM, lấy tên/mô tả/điểm chính từ bản ghi sản phẩm.
- H07: ba sản phẩm học tập, không tạo trang Lớp học thông minh mới.
- H08: ba trụ cột iViVi và đường học tập. Tỷ lệ 20/80 là module nháp riêng.
- H09–H12: phân đoạn nháp chờ dữ liệu; không nhập tên dự án, logo đối tác hoặc giấy tờ từ Word/PDF vào bản công khai.
- H12B: vị trí Tin tức tùy chọn trước H13; trang Tin tức và menu/footer luôn được giữ.
- H13: CTA gọn về Liên hệ, không lặp biểu mẫu dài trên trang chủ.
- Smart iVier: headline “Một nền tri thức. Ba trợ lý chuyên năng.”, nhu cầu/tình huống, giá trị định tính, nguyên tắc có kiểm chứng, hai giải pháp liên quan và CTA điền sẵn sản phẩm ở Liên hệ.

## Quản trị

Mở **Nội dung trang chủ**. Danh sách gồm H01–H13 và H12B, mỗi dòng có trạng thái VI/EN, Biên tập, Xem trước. Chọn ngôn ngữ, sửa, Lưu nháp rồi Xem trước; Xuất bản riêng từng ngôn ngữ. Thứ tự và số yếu tố nền tảng cố định; tiêu đề, mô tả, danh sách, nhãn và ảnh vẫn sửa được.

Liên kết chọn từ danh sách trang/phân đoạn. Máy chủ kiểm tra trang đích tồn tại và có bản xuất bản đúng ngôn ngữ. Phân đoạn đích chưa bật, chưa xuất bản hoặc còn rỗng không được dùng làm đích công khai.

H09, H10, H12 và H12B cần cả phân đoạn được bật/xuất bản và nội dung tương ứng được xuất bản. H11 cần nội dung/ảnh thật rồi bật/xuất bản. Ghi chú ứng viên dự án chỉ nằm trong trường nguồn biên tập của H09.

Tên/mô tả sản phẩm chỉnh tại **Sản phẩm**; tên/giá trị bốn lớp chỉnh tại **Nhóm giải pháp**. Trang chủ tham chiếu những bản ghi này, không có bản sao tên sản phẩm cần sửa riêng.

### Phương pháp 20/80

Trong H08 có hai tỷ lệ, phạm vi chương trình, mô tả và trạng thái riêng. Tổng phải bằng 100. Trạng thái Xuất bản bắt buộc có phạm vi áp dụng; sau đó vẫn phải xuất bản H08. Khi còn nháp, dữ liệu tỷ lệ bị loại khỏi dữ liệu công khai; preview chỉ người đăng nhập xem được. Bản bàn giao giữ trạng thái nháp và phạm vi trống.

### PDF

Thư viện nhận thêm PDF tối đa 5 MB. Trong **Chứng nhận/Số liệu**, chọn loại tài liệu cho đúng ý nghĩa, tải/chọn PDF đã được duyệt. PDF chưa được tham chiếu trong bản ghi đã xuất bản yêu cầu đăng nhập. Sau xuất bản, viewer đọc bằng PDF.js trong trang, có chuyển trang và liên kết tải thật. H12 vẫn cần bật/xuất bản để hiện khối trên trang chủ. Không tự nhập giấy phép, chữ ký hoặc mã QR từ hồ sơ.

### Đo lường tùy chọn

Mặc định không gửi sự kiện ra ngoài. Nếu sau này có nơi nhận đã được duyệt:

```
NEXT_PUBLIC_ANALYTICS_ENDPOINT=/api/analytics
ANALYTICS_WEBHOOK_URL=https://approved-receiver.example/events
```

URL trên chỉ minh họa. Cần build và khởi động lại khi đổi biến NEXT_PUBLIC. Máy chủ chỉ chuyển tiếp event, sectionId, locale, action, productId/contentId. Không lấy nội dung form, email hoặc điện thoại. Sự kiện xem dùng khối intro/sentinel hiển thị ít nhất 50% liên tục khoảng một giây, một lần mỗi trang. Click chỉ ghi lúc kích hoạt.

## Kiểm tra đã chạy

- Build production và TypeScript: đạt.
- 9 nhóm kiểm thử API mới: đạt; báo cáo `qa/v2-api-results.json`.
- 20 tổ hợp responsive: trang chủ VI/EN và Smart iVier VI/EN tại 360, 390, 768, 1024, 1440 px. Không tràn ngang, một H1/trang, không ảnh lỗi; `qa/v2-responsive-results.json`.
- Cấu trúc trang chủ được kiểm tra ở cả 10 trường hợp ngôn ngữ/độ rộng: H02 = 4 ý, H03 = 5 yếu tố, H04 = 4 lớp, H06 = 2 sản phẩm, H07 = 3 sản phẩm, H08 = 3 trụ cột. H02/H03 có 0 link/nút.
- Quản trị thực: sửa tỷ lệ 21+80 bị từ chối và báo lỗi; sửa lại, lưu nháp thành công; nút preview/publish được mở sau lưu. Bản nháp tồn tại sau khởi động lại và không hiện công khai.
- API kiểm tra VI/EN lưu nháp, preview, xuất bản độc lập; H11 xuất bản/ẩn; ràng buộc phần nền tảng; PDF riêng tư trước xuất bản và sau ẩn; analytics mặc định không gửi.
- Cả 24 trang công khai cũ tiếp tục trả 200; chưa tạo trang phụ rỗng.
- Kiểm tra mã trình duyệt cuối: không chứa ghi chú dự án Phú Lâm, Trương Công Định hoặc dữ liệu seed tỷ lệ nháp. Nguồn biên tập chỉ phục vụ máy chủ/quản trị có đăng nhập.

Đây là kiểm tra cục bộ bằng Chromium và viewport mô phỏng; chưa phải kiểm thử thiết bị iOS/Android/Safari thực, thử hiểu thông điệp với người dùng hoặc đo hiệu quả chuyển đổi. Không tuyên bố đã đạt mục tiêu hiểu trong 5–10 giây.

## Còn chờ

Ảnh thật H01/H02, screenshot Smart iVier và iViHRM, ảnh đúng thiết bị/Nexta, ảnh học tập, nội dung dự án/quan hệ đối tác, đội ngũ được chọn công bố, giấy tờ đã duyệt, phạm vi chương trình 20/80, bài Tin tức và nơi nhận form/analytics. Nội dung hoạt động độc lập khi thiếu ảnh; không tạo UI phần mềm hay người dùng giả để lấp chỗ.

Bản sao trước thay đổi nằm tại `backups/before-h01-h13` trên máy này (không đưa vào ZIP mã nguồn). Migration `supplement-v2` chỉ chạy một lần; cập nhật có ghi lịch sử nội dung cũ. Bản ZIP khởi tạo dữ liệu mới đầy đủ bằng seed và migration, không chứa tài khoản, phiên đăng nhập hoặc dữ liệu QA.

### Kiểm tra hoàn tất

Viewer PDF.js đã vẽ được tài liệu thử trong hộp xem, hiện số trang và liên kết tải; Escape đóng hộp và trả focus về “Xem tài liệu”. Menu mobile có Home/Trang chủ và tổng quan hệ sinh thái; Escape trả focus đúng nút mở.

Một lần tải EN trên localhost, viewport 390 px: TTFB 31 ms, DOMContentLoaded 113 ms, load 135 ms, FCP 156 ms (`qa/v2-performance-local.json`). Đây là số đo cục bộ trong phiên kiểm tra có cache, không phải điểm Lighthouse hay hiệu năng Internet.

Tài khoản và PDF thử đã gỡ. Bản cuối có 31 bản ghi (gồm 14 phân đoạn), 3 ảnh khởi tạo, 0 tài khoản. H08 giữ phương pháp nháp và phạm vi trống; H09–H12 cùng H12B chưa xuất bản. Bản public sạch tên ứng viên, phần trăm nháp và chuỗi QA.
