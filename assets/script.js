const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');

// Focus vào ô nhập liệu ngay khi tải trang
window.onload = () => userInput.focus();

// Hàm xử lý nút Enter
function handleEnter(e) {
    if (e.key === 'Enter') sendMessage();
}

// Hàm gợi ý câu hỏi
function fillInput(text) {
    userInput.value = text;
    sendMessage();
}

// Hàm gửi tin nhắn
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Ẩn màn hình chào mừng nếu là tin nhắn đầu tiên
    const welcomeScreen = document.querySelector('.welcome-screen');
    if (welcomeScreen) welcomeScreen.style.display = 'none';

    // 2. Hiện tin nhắn user
    appendMessage(text, 'user');
    userInput.value = '';

    // 3. Hiện loading
    const loadingId = 'loading-' + Date.now();
    appendLoading(loadingId);

    try {
        const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });

        const data = await response.json();
        
        // Xóa loading
        document.getElementById(loadingId).remove();

        if (data.reply) {
            // Format tin nhắn: **Bold** -> <b>, \n -> <br>
            let formatted = data.reply
                .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                .replace(/\n/g, '<br>');
            appendMessage(formatted, 'bot', true);
        } else {
            appendMessage("Lỗi server rồi, thử lại sau nha!", 'bot');
        }

    } catch (err) {
        if(document.getElementById(loadingId)) document.getElementById(loadingId).remove();
        appendMessage("Mất kết nối mạng! 🤯", 'bot');
        console.error(err);
    }
}

// Hàm thêm tin nhắn vào giao diện
function appendMessage(text, sender, isHTML = false) {
    const row = document.createElement('div');
    row.className = `msg-row ${sender}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    
    if(sender === 'bot') {
        // Thêm icon bot cho đẹp
        bubble.innerHTML = `<span style="color:#4b90ff; margin-right:10px;">🤖</span> ` + (isHTML ? text : text);
    } else {
        bubble.textContent = text;
    }

    row.appendChild(bubble);
    chatBox.appendChild(row);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Hàm hiện loading (3 dấu chấm)
function appendLoading(id) {
    const row = document.createElement('div');
    row.className = 'msg-row bot';
    row.id = id;
    row.innerHTML = `
        <div class="msg-bubble">
            <span style="color:#4b90ff; margin-right:10px;">🤖</span>
            <span class="dots"><span>.</span><span>.</span><span>.</span></span>
        </div>`;
    chatBox.appendChild(row);
    chatBox.scrollTop = chatBox.scrollHeight;
}