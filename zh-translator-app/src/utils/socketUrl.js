export const getSocketUrl = () => {
  // Nếu đang chạy trên Electron (file://) hoặc Vite (port 3000/5173) 
  // thì ép kết nối thẳng vào cổng 4000 của server cục bộ.
  if (
    window.location.protocol === 'file:' || 
    window.location.port === '3000' || 
    window.location.port === '5173'
  ) {
    return 'http://localhost:4000';
  }
  
  // Nếu người dùng truy cập từ 1 tên miền public (Ngrok, Cloudflare)
  // thì để rỗng để Socket.io tự kết nối tới cùng domain đó.
  return '';
};
