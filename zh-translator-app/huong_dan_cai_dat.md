# Hướng Dẫn Cài Đặt Dành Cho Streamer

Đây là hướng dẫn chi tiết từng bước để cài đặt phần mềm dịch tiếng Trung và cấu hình các overlay (thêm giờ, danh sách bài hát, ...) trên phần mềm OBS Studio dành cho Livestream.

## 1. Tải và Chạy Phần Mềm

1. **Giải nén**: Sau khi tải file nén `ZH-Translator-AI.zip` về máy, bạn click chuột phải vào file và chọn **Extract All...** (Giải nén).
2. **Khởi động**: Vào thư mục vừa giải nén, tìm và nháy đúp chuột vào file **`ZH-Translator-AI.exe`** để chạy phần mềm.
3. Nếu Windows hiện cảnh báo bảo mật (Windows Protect), bạn chọn **More info** -> **Run anyway**.

---

## 2. Kết Nối Với TikTok Live

1. Khi phần mềm mở lên, bạn sẽ thấy giao diện chính với các mục Dịch TikTok, Dịch Trực Tiếp và Quản Lý Live.
2. Nhấn vào biểu tượng Menu (3 dấu gạch ngang) ở góc phải phía trên.
3. Trong mục **Kết Nối TikTok WebSocket**, đảm bảo đã điền đúng địa chỉ kết nối tới tools bắt chat của bạn (ví dụ: `ws://localhost:21213`).
4. Nhấn nút **Reconnect WS**. Nếu thấy biểu tượng cột sóng wifi trên cùng góc phải báo chữ "Live", nghĩa là ứng dụng đã kết nối thành công.

---

## 3. Cài Đặt Overlay Lên OBS Studio

Phần mềm hỗ trợ tạo ra các giao diện overlay trong suốt để bạn chèn trực tiếp lên OBS. 

*Lưu ý: Bạn cần phải đang mở phần mềm `ZH-Translator-AI.exe` thì các overlay này mới hoạt động nhé!*

Để thêm một overlay vào OBS, bạn làm theo cách sau:
- Mở **OBS Studio**, tại mục **Sources** (Nguồn), bấm dấu **+** và chọn **Browser** (Trình duyệt).
- Đặt tên tùy ý (ví dụ: `Overlay Danh Sách Quà`). Bấm OK.
- Ở ô **URL**, dán một trong các đường dẫn bên dưới tương ứng với chức năng bạn muốn.
- Tick vào ô **"Clear cache of page on close"** để Overlay tự làm mới khi cần. Bấm **OK** để hoàn thành.

Bạn có thể thay đổi kích thước của Browser Source trên màn hình OBS bằng cách kéo các góc của viền đỏ.

### Các Đường Dẫn Overlay (URL) Bạn Cần Dán Vào OBS:

1. **Overlay Thông Báo Quà Thêm Giờ (Mới)**
   - **URL:** `http://localhost:4000/gift-time`
   - **Chức năng:** Hiển thị danh sách các món quà và số giờ được cộng tương ứng (🐶 Corgi: +5p, 🐳 Cá Voi: +20p, 🦁 Mèo Leon: +60p).
   - *Gợi ý: Width: 400, Height: 400*

2. **Overlay Danh Sách Bài Hát Yêu Cầu (Queue)**
   - **URL:** `http://localhost:4000/queue`
   - **Chức năng:** Hiển thị danh sách các bài hát đang được yêu cầu kèm số lượng (Quà ưu tiên: Hearts/Love You).
   - *Gợi ý: Width: 400, Height: 500*

3. **Overlay Đồng Hồ Đếm Ngược (Timer)**
   - **URL:** `http://localhost:4000/timer`
   - **Chức năng:** Hiện thời gian đếm ngược của phiên livestream. Sẽ tự động tăng khi có người tặng quà đúng mục tiêu.
   - *Gợi ý: Width: 300, Height: 150*

---

## 4. Quản Lý Trong Quá Trình Live

Trong tab **Quản Lý Live**, bạn có thể tự mình điều khiển đồng hồ và danh sách nếu muốn (không phụ thuộc vào người xem tặng quà):
- Tự thêm/bớt thời gian cho đồng hồ.
- Xóa bài hát, sửa tên bài hát yêu cầu trong hàng chờ.

**Lưu ý Quan Trọng:** Khi tắt phần mềm, toàn bộ các overlay trên OBS cũng sẽ biến mất. Bạn chỉ cần mở lại phần mềm thì mọi thứ sẽ tự kết nối và hiện lên lại bình thường.

Chúc bạn có một buổi livestream thành công! 🎉
