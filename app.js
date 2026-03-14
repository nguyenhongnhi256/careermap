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

    // Call API (Mocking for structural test, will implement real fetch later)
    showLoading("Đang phân tích sở thích của bạn...");
    
    // Giả lập API trả về sau 2s
    setTimeout(() => {
        hideLoading();
        renderMajors([
            {
                ten: "Công nghệ thông tin",
                emoji: "💻",
                ly_do: "Bạn thích làm việc phân tích/logic và độc lập, rất hợp với lập trình.",
                phu_hop_mon: ["Toán", "Tin học"],
                tinh_cach: "Phân tích, làm một mình"
            },
            {
                ten: "Kinh tế - Tài chính",
                emoji: "📊",
                ly_do: "Kỹ năng tính toán tốt từ môn Toán kết hợp với tư duy logic.",
                phu_hop_mon: ["Toán"],
                tinh_cach: "Phân tích, văn phòng"
            }
        ]);
    }, 2000);
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
    
    if (!major) {
        alert("Vui lòng nhập ngành bạn muốn học!");
        return;
    }

    showLoading("Đang tra cứu dữ liệu trường và điểm chuẩn...");

    // Dữ liệu giả lập đa dạng khu vực
    const allSchools = [
        {
            ten: "Đại học Bách Khoa Hà Nội",
            viet_tat: "HUST",
            loai: "Công lập",
            hoc_phi: "25-30 triệu/năm",
            diem_chuan: "26-28 điểm",
            khu_vuc: "Hà Nội",
            dac_diem: ["Học bổng", "Nhiều Lab"],
            website: "#"
        },
        {
            ten: "Đại học Công nghệ - ĐHQGHN",
            viet_tat: "UET",
            loai: "Công lập",
            hoc_phi: "20-25 triệu/năm",
            diem_chuan: "25-27.5 điểm",
            khu_vuc: "Hà Nội",
            dac_diem: ["Sinh viên giỏi", "Việc làm tốt"],
            website: "#"
        },
        {
            ten: "Đại học Bách Khoa TP.HCM - ĐHQG HCM",
            viet_tat: "HCMUT",
            loai: "Công lập",
            hoc_phi: "30-35 triệu/năm",
            diem_chuan: "25-27 điểm",
            khu_vuc: "TP.HCM",
            dac_diem: ["Lâu đời", "Thực hành nhiều"],
            website: "#"
        },
        {
            ten: "Đại học Khoa học Tự nhiên TP.HCM",
            viet_tat: "HCMUS",
            loai: "Công lập",
            hoc_phi: "25-30 triệu/năm",
            diem_chuan: "24-27 điểm",
            khu_vuc: "TP.HCM",
            dac_diem: ["Khoa học cơ bản", "AI Lab"],
            website: "#"
        },
        {
            ten: "Đại học Bách Khoa - ĐH Đà Nẵng",
            viet_tat: "DUT",
            loai: "Công lập",
            hoc_phi: "20-25 triệu/năm",
            diem_chuan: "23-26 điểm",
            khu_vuc: "Đà Nẵng",
            dac_diem: ["Uy tín miền Trung", "Ký túc xá rộng"],
            website: "#"
        }
    ];

    // Lọc theo khu vực
    let filteredSchools = allSchools;
    if (location !== "Toàn quốc" && location !== "Tỉnh khác") {
        filteredSchools = allSchools.filter(s => s.khu_vuc === location);
    } else if (location === "Tỉnh khác") {
        // Mock data cho tỉnh khác (nếu không có thì trả về mảng rỗng để render thông báo)
        filteredSchools = [];
    }

    // Nếu không có trường nào phù hợp sau khi lọc
    if (filteredSchools.length === 0) {
        filteredSchools = [
            {
                ten: "Không tìm thấy dữ liệu trường ở khu vực này đối với ngành " + major,
                viet_tat: "N/A",
                loai: "N/A",
                hoc_phi: "N/A",
                diem_chuan: "N/A",
                khu_vuc: location,
                dac_diem: ["Cần mở rộng tìm kiếm"],
                website: "#"
            }
        ];
    }

    // Mock API call
    setTimeout(() => {
        hideLoading();
        renderSchoolsAndCareers({
            truong: filteredSchools,
            nghe: [
                {
                    ten: "Chuyên viên " + major,
                    mo_ta: `Làm việc trong lĩnh vực liên quan mật thiết đến ${major}.`,
                    luong_fresher: "10-15 triệu/tháng",
                    luong_senior: "30-60 triệu/tháng"
                }
            ],
            ky_nang: ["Tư duy logic", "Giải quyết vấn đề", "Ngoại ngữ"],
            xu_huong: `Ngành ${major} vẫn sẽ có nhu cầu tuyển dụng lớn, đặc biệt khi yêu cầu chất lượng công việc ngày càng cao.`
        });
    }, 1500);
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
