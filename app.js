// Trạng thái ứng dụng
const state = {
    currentFlow: null // 'A' or 'B'
};

// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    console.log("App initialized");
});

// Điều hướng
function startFlowA() {
    document.getElementById('flow-selection').classList.add('hidden');
    document.getElementById('flow-a').classList.remove('hidden');
    state.currentFlow = 'A';
}

function startFlowB() {
    document.getElementById('flow-selection').classList.add('hidden');
    document.getElementById('flow-b').classList.remove('hidden');
    state.currentFlow = 'B';
}

// Logic cho Luồng A
function togglePill(btn) {
    btn.classList.toggle('active');
}

async function submitFlowA() {
    // Thu thập dữ liệu
    const activePills = Array.from(document.querySelectorAll('#subject-pills .pill.active')).map(p => p.textContent);
    
    // Thu thập radio
    const workStyle1 = document.querySelector('input[name="work_style_1"]:checked');
    const workStyle2 = document.querySelector('input[name="work_style_2"]:checked');
    const workStyle3 = document.querySelector('input[name="work_style_3"]:checked');

    if (activePills.length === 0) {
        alert("Vui lòng chọn ít nhất 1 môn học bạn yêu thích!");
        return;
    }

    const traits = [];
    if (workStyle1) traits.push(workStyle1.value);
    if (workStyle2) traits.push(workStyle2.value);
    if (workStyle3) traits.push(workStyle3.value);

    const userMessage = `Môn học yêu thích: ${activePills.join(', ')}. Tính cách làm việc: ${traits.join(', ')}.`;

    const systemPrompt = `Bạn là chuyên gia tư vấn hướng nghiệp cho học sinh cấp 3 Việt Nam.
Dựa trên môn học yêu thích và tính cách làm việc của học sinh, gợi ý 3–5 ngành học phù hợp.

Trả lời ONLY bằng JSON format sau, trích xuất nguyên vẹn định dạng này, bắt đầu bằng { và kết thúc bằng }. Không giải thích thêm:
{
  "nganh": [
    {
      "ten": "Tên ngành",
      "emoji": "emoji phù hợp",
      "ly_do": "1 câu giải thích tại sao phù hợp với input của học sinh",
      "phu_hop_mon": ["môn 1", "môn 2"],
      "tinh_cach": "mô tả tính cách phù hợp ngắn gọn"
    }
  ]
}`;

    showLoading("Đang phân tích sở thích bằng AI...");
    
    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ systemPrompt, userMessage })
        });

        if (!response.ok) {
            const errBody = await response.json();
            throw new Error(errBody.error?.error?.message || "Lỗi kết nối đến server proxy.");
        }

        const data = await response.json();
        const textResponse = data.content?.[0]?.text;
        
        if (!textResponse) throw new Error("Dữ liệu trả về từ AI không hợp lệ.");

        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Không thể trích xuất JSON từ kết quả AI.");
        
        const parsedData = JSON.parse(jsonMatch[0]);
        
        hideLoading();
        if (parsedData.nganh && parsedData.nganh.length > 0) {
            renderMajors(parsedData.nganh);
        } else {
            alert("AI không trả về kết quả ngành nào. Vui lòng thử lại!");
        }

    } catch (error) {
        console.error(error);
        hideLoading();
        alert("Đã xảy ra lỗi: " + error.message + "\nVui lòng xem log (F12) để biết chi tiết và kiểm tra xem server.bat đã chạy chưa.");
    }
}

function showLoading(text) {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('loading-text').textContent = text;
    // Ẩn flow content tạm
    if (state.currentFlow === 'A') document.getElementById('flow-a').style.opacity = 0.3;
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
    if (state.currentFlow === 'A') document.getElementById('flow-a').style.opacity = 1;
}

function renderMajors(majors) {
    document.getElementById('results-a').classList.remove('hidden');
    const container = document.getElementById('majors-list');
    container.innerHTML = '';

    majors.forEach(major => {
        const card = document.createElement('div');
        card.className = 'major-card';
        
        const tagsHtml = major.phu_hop_mon.map(m => `<span class="tag tag-green">${m}</span>`).join('') + 
                         `<span class="tag">${major.tinh_cach}</span>`;

        card.innerHTML = `
            <div class="major-header">
                <span class="major-emoji">${major.emoji}</span>
                <div class="major-title">${major.ten}</div>
            </div>
            <div class="major-desc">${major.ly_do}</div>
            <div class="major-tags">${tagsHtml}</div>
            <button class="btn btn-outline w-100" onclick="goToFlowBMajor('${major.ten}')">Xem trường dạy ngành này →</button>
        `;
        container.appendChild(card);
    });
}

function goToFlowBMajor(majorName) {
    // Chuyển sang luồng B và điền sẵn ngành
    document.getElementById('flow-a').classList.add('hidden');
    document.getElementById('flow-b').classList.remove('hidden');
    state.currentFlow = 'B';
    document.getElementById('major-input').value = majorName;
    console.log("Navigating to Flow B with major:", majorName);
}

// Logic cho Luồng B
async function submitFlowB() {
    const major = document.getElementById('major-input').value.trim();
    const location = document.getElementById('location-select').value;
    const score = document.getElementById('score-input').value.trim();
    const budget = document.getElementById('budget-select').value;
    
    if (!major) {
        alert("Vui lòng nhập ngành bạn muốn học!");
        return;
    }

    let userMessage = `Ngành muốn học: ${major}. Khu vực: ${location}.`;
    if (score) userMessage += ` Điểm thi dự kiến (3 môn): ${score} điểm.`;
    if (budget && budget !== "Không giới hạn") userMessage += ` Ngân sách học phí: ${budget}/năm.`;

    const systemPrompt = `Bạn là chuyên gia tư vấn tuyển sinh đại học Việt Nam.
Cung cấp thông tin tham khảo về trường và nghề nghiệp. BẮT BUỘC sử dụng dữ liệu điểm chuẩn mới nhất (năm 2023 hoặc 2024 tùy theo dữ liệu public khả dụng nhất).
Luôn dùng range cho học phí và lương, không dùng con số cứng.
Ưu tiên thông tin về các trường lớn, uy tín tại Việt Nam phù hợp với KHU VỰC, ĐIỂM SỐ và NGÂN SÁCH trong user prompt.
Với điểm chuẩn và học phí, NẾU KHÔNG CHẮC CHẮN HOẶC KHÔNG BIẾT, hãy trả về giá trị 'Đang cập nhật', tuyệt đối KHÔNG tự sáng tác số liệu. Phải có ít nhất 1-3 trường.

Trả lời ONLY bằng JSON format sau, bắt đầu bằng { và kết thúc bằng }. Không giải thích thêm:
{
  "truong": [
    {
      "ten": "Tên đầy đủ",
      "viet_tat": "VD: ĐHBK HN",
      "loai": "Công lập | Tư thục | Quốc tế",
      "hoc_phi": "VD: 15–20 triệu/năm",
      "diem_chuan": "VD: 24–26 điểm (2024)",
      "khu_vuc": "Hà Nội | TP.HCM | ...",
      "dac_diem": ["Học bổng", "Dạy tiếng Anh"],
      "website": "URL website chính thức"
    }
  ],
  "nghe": [
    {
      "ten": "Tên nghề",
      "mo_ta": "1 câu mô tả",
      "luong_fresher": "VD: 8–12 triệu/tháng",
      "luong_senior": "VD: 20–35 triệu/tháng"
    }
  ],
  "ky_nang": ["kỹ năng 1", "kỹ năng 2", "kỹ năng 3"],
  "xu_huong": "2–3 câu về triển vọng ngành tại Việt Nam"
}`;

    showLoading("AI đang tra cứu dữ liệu trường và điểm chuẩn...");

    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ systemPrompt, userMessage })
        });

        if (!response.ok) {
            const errBody = await response.json();
            throw new Error(errBody.error?.error?.message || "Lỗi kết nối đến server proxy.");
        }

        const data = await response.json();
        const textResponse = data.content?.[0]?.text;
        
        if (!textResponse) throw new Error("Dữ liệu trả về từ AI không hợp lệ.");

        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Không thể trích xuất JSON từ kết quả AI.");
        
        const parsedData = JSON.parse(jsonMatch[0]);
        
        hideLoading();
        if (parsedData.truong && parsedData.truong.length > 0) {
            renderSchoolsAndCareers(parsedData);
        } else {
            alert("AI không tìm thấy trường nào phù hợp. Vui lòng nới lỏng tiêu chí và thử lại!");
        }

    } catch (error) {
        console.error(error);
        hideLoading();
        alert("Đã xảy ra lỗi: " + error.message + "\nVui lòng xem log (F12) để biết chi tiết và kiểm tra xem server.bat đã chạy chưa.");
    }
}

function renderSchoolsAndCareers(data) {
    document.getElementById('results-b').classList.remove('hidden');
    
    // Render Schools
    const schoolsContainer = document.getElementById('schools-list');
    schoolsContainer.innerHTML = '';
    
    data.truong.forEach(t => {
        const tags = t.dac_diem.map(d => `<span class="tag tag-green">${d}</span>`).join('');
        schoolsContainer.innerHTML += `
            <div class="school-card">
                <div class="school-header">
                    <div>
                        <div class="school-name">${t.ten}</div>
                        <div class="text-muted text-sm">${t.loai} • ${t.khu_vuc}</div>
                    </div>
                    <span class="school-short">${t.viet_tat}</span>
                </div>
                <div class="school-meta">
                    <span>🎓 Điểm chuẩn: <strong style="color:var(--text-main)">${t.diem_chuan}</strong></span>
                </div>
                <div class="school-meta">
                    <span>💰 Học phí: <strong style="color:var(--text-main)">${t.hoc_phi}</strong></span>
                </div>
                <div class="major-tags mt-2">${tags}</div>
            </div>
        `;
    });

    // Render Careers
    const careerContainer = document.getElementById('career-info');
    
    const careersHtml = data.nghe.map(n => `
        <div class="career-item">
            <h4 class="mb-1" style="color:var(--text-main)">💻 ${n.ten}</h4>
            <p class="text-muted text-sm mb-2">${n.mo_ta}</p>
            <div class="salary-range text-sm">
                Fresher: ${n.luong_fresher} | Senior: ${n.luong_senior}
            </div>
        </div>
    `).join('');

    const skillsHtml = data.ky_nang.map(s => `<span class="tag tag-green">${s}</span>`).join('');

    careerContainer.innerHTML = `
        <div class="mb-4">
            <h4 class="mb-2" style="color:var(--text-main)">🛠️ Kỹ năng lõi cần có:</h4>
            <div class="major-tags">${skillsHtml}</div>
        </div>
        <div class="mb-4">
            <h4 class="mb-2" style="color:var(--text-main)">📈 Xu hướng ngành:</h4>
            <p class="text-muted text-sm">${data.xu_huong}</p>
        </div>
        <div>
            <h4 class="mb-2" style="color:var(--text-main)">💼 Vị trí công việc (Tham khảo):</h4>
            ${careersHtml}
        </div>
    `;
}
