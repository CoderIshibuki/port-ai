const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function(event, context) {
  // 1. CHẶN CÁC REQUEST KHÔNG HỢP LỆ
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed - Chỉ chấp nhận POST nha!" };
  }

  try {
    // 2. LẤY DỮ LIỆU TỪ FRONTEND
    const body = JSON.parse(event.body);
    const userMessage = body.message || "Xin chào";

    // 3. KẾT NỐI VỚI GOOGLE GEMINI
    // Lấy Key từ biến môi trường .env
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // 4. "NẠP DỮ LIỆU" CHO BOT
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

      Một số dự án cá nhân: Website luyện gõ bàn phím, con AI (chính là ban)=)),..
    `;

    // System Instruction)
    const prompt = `
      Bạn tên là AI-P, là trợ lý AI ảo đại diện cho Phát trên website portfolio cá nhân, bạn trả lời câu hỏi dưới tư cách là bạn đang mô tả về Phát
      Nhiệm vụ của bạn là trả lời các câu hỏi của nhà tuyển dụng hoặc khách ghé thăm dựa trên thông tin sau:
      ---
      ${portfolioData}
      ---
      
      Yêu cầu:
      1. Trả lời ngắn gọn, thân thiện, một chút hài hước.
      2. Chỉ trả lời dựa trên thông tin đã cung cấp. 
        - Nếu không biết, hãy bảo: "Cái này để mình hỏi lại sếp Phát đã nhé!". 
        - Nếu thông tin mật, hãy bảo: "Đây là thông tin mật, Phát không cho trả lời đâu!"
      3. Đừng bịa đặt thông tin sai sự thật.
      4. Đừng nhồi nhét chữ code dạo, code thật,...
      5. Có thể trả lời một vài câu hỏi tính toán, code,... ở mức cơ bản, nếu hỏi khó hơn thì... trả lời sao tùy bạn
      6. Nếu hỏi về bạn thì trả lời về bạn và dừng, nếu hỏi về tôi thì trả lời thông tin của tôi ở mức cơ bản, đừng show quá nhiều
      7. Đừng nói là bạn đang tìm hiểu thêm về Phát, cũng đừng gọi là sếp nha

      Câu hỏi của khách: "${userMessage}"
      Trả lời:
    `;

    // 5. GỬI LÊN GEMINI VÀ CHỜ KẾT QUẢ
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 6. TRẢ KẾT QUẢ VỀ FRONTEND
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ reply: text }),
    };

  } catch (error) {
    console.error("Lỗi Server:", error); //debug
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server đang bận code bug, thử lại sau nhé!" }),
    };
  }
};
