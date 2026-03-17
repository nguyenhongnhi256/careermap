# Nhật ký phát triển "CareerMap VN"

**Thời gian tạo:** 2026-03-17 11:28
**Thư mục làm việc:** `d:\Vibecoding\careermap`
**Công nghệ:** HTML5, CSS Variables, Vanilla JS, Node.js, Google Gen AI (Gemini 2.5 Flash)

---

## Tóm tắt quá trình phát triển

Dự án được triển khai dựa trên bản Planning hoàn chỉnh về nghiệp vụ hướng nghiệp học sinh cấp 3.

### 1. Phân tích & Tối ưu luồng UX/UI theo tư duy Product
- **Luồng A (Tìm ngành):** Rút gọn, loại bỏ các input không phù hợp (Khu vực, Điểm số, Học phí) cản trở trải nghiệm khám phá. Chỉ giữ lại form Môn học & Sở thích công việc để tìm Ngành.
- **Luồng B (Tìm trường):** Chỉ xuất hiện sau khi đã chọn Ngành. Được thiết kế chuyên biệt để nhập Vị trí ưu tiên, Ngân sách và Điểm thi dự kiến.
- **Vá lỗ hổng bảo mật rò rỉ API:** Không trực tiếp hard-code key Anthropic/Gemini vào code HTML, mà xây dựng một Express Proxy Server nhỏ gọn trên máy chạy tại cổng 3000 để bọc API và kết nối với Frontend.

### 2. Thiết kế giao diện (Frontend)
- Áp dụng cấu trúc Responsive / Mobile-first. 
- Tone and Mood sáng, thân thiện, dùng font `Be Vietnam Pro` nguyên bản.
- Biến tấu form nhập liệu bằng Component "Multi-select Pills" (Chọn môn) và "Radio Cards" (Chọn kiểu làm việc) để tránh khô cứng.
- Tích hợp Card danh sách Trường chuyên nghiệp kèm Disclaimer Box nổi bật, Tags hệ thống trực quan và hiển thị Mức lương tham khảo của từng nghề.
- Tương tác chờ Load API bằng Skeleton CSS Loading thân thiện.

### 3. Cấu hình Backend Serverless Node.js & Tích hợp AI
- Khác với kế hoạch dùng Mock Data hoặc Anthropic lúc đầu, quá trình phát triển đã xoay trục sang cài đặt Node.js trực tiếp vào môi trường Cục bộ của người dùng.
- Tích hợp thành công **Google Gemini API** (`@google/genai` module với Model `gemini-2.5-flash`) chạy qua CLI script `npm` và PowerShell bypass.
- Prompt kỹ sư được thiết kế kín kẽ để bắt AI:
   - *Luôn tuân thủ output strictly format bằng định dạng JSON thuần để Frontend có thể móc dữ liệu không bị vỡ.*
   - *Ưu tiên dữ liệu tuyển sinh 2023-2024. Không chém số, điền 'Đang cập nhật' nếu thiếu thông tin.*
- Server vận hành ổn định qua script auto-start `start_server.bat` trên Windows giúp khởi chạy local server và tự động fetch giá trị API key trong file cấu hình `.env` ẩn.

---

**Trạng thái hiện tại:** Hoàn tất, web app chạy trơn tru với dữ liệu thật. Sẵn sàng đem đi public hoặc host lên Vercel/Netlify.
