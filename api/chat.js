
const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(req, res) {
  // 1. CHẶN CÁC REQUEST KHÔNG HỢP LỆ (Cú pháp Vercel)
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed - Chỉ chấp nhận POST nha!" });
  }

  try {
    // 2. LẤY DỮ LIỆU TỪ FRONTEND
    // Vercel tự động phân tích JSON, không cần JSON.parse()
    const { message } = req.body;
    const userMessage = message || "Xin chào";

    // 3. KẾT NỐI VỚI GOOGLE AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // QUAN TRỌNG: Đổi sang model này để có 14.400 lượt/ngày (Không dùng Gemini Flash nữa vì dễ bị chặn)
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // 4. "NẠP DỮ LIỆU" CHO BOT (Giữ nguyên nội dung của bạn)
    const portfolioData = `
      Tên: Phát
      Tên đầy đủ: Trần Vũ Hòa Phát
      Vị trí: Sinh viên năm nhất
      Trường đang theo học: Trường Đại học Sư Phạm Thành Phố Hồ Chí Minh
      Ngôn ngữ lập trình: C++, C#, Python, JS, PHP, CSS
      Công cụ sử dụng: Git, Github, Visual Studio Code, Kali Linux
      
      Sở thích: Code, bảo mật, tìm hiểu AI...
      
      Thông tin liên hệ: 
        Số điện thoại: +84 338 295 267
        Nơi ở: Ngã Năm, Cần Thơ
        Email: tranvuhoaphat@gmail.com
        Facebook: facebook.com/kaliyuki.info
        Github: https://github.com/coderishibuki
      
      Chứng chỉ đang sở hữu: Google Cybersecurity Professional Certificate (Sở hữu vào năm 2026)

      Một số dự án cá nhân: Website luyện gõ bàn phím, con AI (chính là bạn)=)),..
    `;

    const prompt = `
      Bạn tên là AI-P, là trợ lý AI ảo đại diện cho Phát trên website portfolio cá nhân.
      Nhiệm vụ của bạn là trả lời các câu hỏi dựa trên thông tin sau:
      ---
      ${portfolioData}
      ---
      
      Yêu cầu:
      1. Trả lời ngắn gọn, thân thiện, hài hước (dùng icon 🍓, 🦄).
      2. Chỉ trả lời dựa trên thông tin đã cung cấp. 
         - Nếu không biết: "Cái này để mình hỏi lại sếp Phát đã nhé!". 
         - Nếu thông tin mật: "Suỵt! Phát không cho mình nói đâu 🤫".
      3. Tuyệt đối không bịa đặt thông tin.
      4. Nếu khách hỏi về bạn -> Giới thiệu bạn là AI-P chạy bằng Gemini 3 Flash
      5. Nếu khách hỏi về Phát -> Trả lời dựa trên dữ liệu trên.

      Câu hỏi của khách: "${userMessage}"
      Trả lời:
    `;

    // 5. GỬI LÊN GEMMA VÀ CHỜ KẾT QUẢ
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 6. TRẢ KẾT QUẢ VỀ FRONTEND (Cú pháp Vercel)
    return res.status(200).json({ reply: text });

  } catch (error) {
    console.error("Lỗi Server:", error);
    return res.status(500).json({ error: "Server đang bận fix bug, thử lại sau nhé!" });
  }
}