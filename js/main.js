// 表情包数据 - 预置4张本地图片
let memesData = [
    {
        id: 1,
        title: "誓死效忠米哈游",
        url: "images/誓死效忠米哈游.jpg",
        category: ["meme"],
        views: 15234,
        downloads: 3421,
        date: "2025-06-15",
        isGif: false,
        hot: 98
    },
    {
        id: 2,
        title: "菲比猪鼻",
        url: "images/菲比猪鼻.jpg",
        category: ["cute"],
        views: 28567,
        downloads: 5623,
        date: "2025-06-14",
        isGif: false,
        hot: 100
    },
    {
        id: 3,
        title: "你这无礼之徒",
        url: "images/你这无礼之徒.jpg",
        category: ["meme"],
        views: 19876,
        downloads: 4456,
        date: "2025-06-13",
        isGif: false,
        hot: 95
    },
    {
        id: 4,
        title: "少爷，该启动鸣潮了哈哈",
        url: "images/少爷，该启动鸣潮了哈哈.jpg",
        category: ["cute"],
        views: 32109,
        downloads: 6789,
        date: "2025-06-12",
        isGif: false,
        hot: 99
    }
];

// 待审核数据
let pendingData = [];

// 菲比信息数据
const charactersData = [
    { name: "菲比", role: "教士", color: "#FF8C42", avatar: "images/菲比猪鼻.jpg" }
];

let currentCategory = 'all';
let currentSort = 'newest';
let searchQuery = '';
let nextId = 5;
let isAdmin = false;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    renderCharacters();
    renderMemes();
    updateHotList();
    initUploadModal();
    initAdminPanel();
});

// 创建粒子背景
function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (10 + Math.random() * 10) + 's';
        particle.style.width = (5 + Math.random() * 10) + 'px';
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
}

// 渲染角色列表
function renderCharacters() {
    const grid = document.getElementById('characterGrid');
    if (!grid) return;
    grid.innerHTML = charactersData.map(char => `
        <div class="character-item" onclick="filterByCharacter('${char.name}')">
            <img src="${char.avatar}" alt="${char.name}" class="character-avatar" style="border-color: ${char.color}" onerror="this.src='https://via.placeholder.com/100x100/FF8C42/FFFFFF?text=菲比'">
            <div class="character-name">${char.name}</div>
            <div class="character-role">${char.role}</div>
        </div>
    `).join('');
}

// 渲染表情包
function renderMemes() {
    const grid = document.getElementById('memeGrid');
    let filtered = [...memesData];

    // 过滤掉神秘图片（除非已解锁）
    filtered = filtered.filter(m => !m.secret || isAdmin);

    // 分类筛选
    if (currentCategory !== 'all') {
        if (currentCategory === 'static') {
            filtered = filtered.filter(m => !m.isGif);
        } else if (currentCategory === 'gif') {
            filtered = filtered.filter(m => m.isGif);
        } else {
            filtered = filtered.filter(m => m.category.includes(currentCategory));
        }
    }

    // 搜索筛选
    if (searchQuery) {
        filtered = filtered.filter(m => m.title.includes(searchQuery));
    }

    // 排序
    if (currentSort === 'newest') {
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (currentSort === 'hottest') {
        filtered.sort((a, b) => b.hot - a.hot);
    } else if (currentSort === 'random') {
        filtered.sort(() => Math.random() - 0.5);
    }

    // 更新计数
    const resultCount = document.getElementById('resultCount');
    if (resultCount) resultCount.textContent = filtered.length;

    // 渲染
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="icon">📝</div>
                <p>还没有菲比表情包</p>
                <p>点击"添加新菲比"来添加第一个表情包吧~</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(meme => `
        <div class="meme-card" data-id="${meme.id}">
            <img src="${meme.url}" alt="${meme.title}" class="meme-image" loading="lazy" 
                onerror="this.src='https://via.placeholder.com/300x300/FF8C42/FFFFFF?text=${encodeURIComponent(meme.title)}'"
                onclick="handleImageClick(${meme.id}, '${meme.title}')">
            <div class="meme-info">
                <div class="meme-title">${meme.title}</div>
                <div class="meme-meta">
                    <div class="meme-stats">
                        <span class="meme-stat">
                            <span class="stat-label">热度</span>
                            <span class="stat-value">${meme.hot}</span>
                        </span>
                        <span class="meme-stat">
                            <span class="stat-label">下载</span>
                            <span class="stat-value">${formatNumber(meme.downloads)}</span>
                        </span>
                    </div>
                    <span>${meme.date}</span>
                </div>
                <div class="meme-actions">
                    <div class="meme-type ${meme.isGif ? 'gif' : 'static'}">
                        ${meme.isGif ? '动态图片' : '静态图片'}
                    </div>
                    <button class="download-btn" onclick="event.stopPropagation(); downloadMeme(${meme.id})" title="下载">
                        下载
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 处理图片点击
function handleImageClick(id, title) {
    const meme = memesData.find(m => m.id === id);
    if (meme) {
        openLightbox(meme.url);
    }
}

// 更新热门列表
function updateHotList() {
    const hotList = document.getElementById('hotList');
    if (!hotList) return;
    
    const sorted = [...memesData].sort((a, b) => b.hot - a.hot).slice(0, 6);
    
    if (sorted.length === 0) {
        hotList.innerHTML = `
            <div class="hot-item"><div class="hot-rank top">1</div><span class="hot-text">等待添加...</span></div>
            <div class="hot-item"><div class="hot-rank top">2</div><span class="hot-text">等待添加...</span></div>
            <div class="hot-item"><div class="hot-rank top">3</div><span class="hot-text">等待添加...</span></div>
        `;
        return;
    }
    
    hotList.innerHTML = sorted.map((meme, index) => `
        <div class="hot-item" onclick="searchByTitle('${meme.title}')">
            <div class="hot-rank ${index < 3 ? 'top' : ''}">${index + 1}</div>
            <span class="hot-text">${meme.title}</span>
        </div>
    `).join('');
}

// 搜索标题
function searchByTitle(title) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = title;
        searchQuery = title;
        renderMemes();
    }
}

// 下载表情包
function downloadMeme(id) {
    const meme = memesData.find(m => m.id === id);
    if (!meme) return;

    // 增加下载量
    meme.downloads++;
    meme.hot = Math.min(100, meme.hot + 1);
    renderMemes();
    updateHotList();

    // 执行下载
    const link = document.createElement('a');
    link.href = meme.url;
    link.download = `${meme.title}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 格式化数字
function formatNumber(num) {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

// 分类筛选
function filterCategory(category, btn) {
    currentCategory = category;
    document.querySelectorAll('.category-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderMemes();
}

// 排序
function sortMemes(sort, btn) {
    currentSort = sort;
    document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderMemes();
}

// 搜索
function handleSearch() {
    searchQuery = document.getElementById('searchInput').value;
    renderMemes();
}

// 切换导航标签
function switchTab(tab, el) {
    document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
    if (el) el.classList.add('active');

    if (tab === 'featured') {
        currentCategory = 'all';
        currentSort = 'hottest';
    } else if (tab === 'all') {
        currentCategory = 'all';
        currentSort = 'newest';
    } else if (tab === 'recommended') {
        currentCategory = 'all';
        currentSort = 'hottest';
    }
    
    // 更新排序按钮状态
    document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
    const sortBtn = document.querySelector(`button[onclick="sortMemes('${currentSort}', this)"]`);
    if (sortBtn) sortBtn.classList.add('active');
    
    renderMemes();
}

// 按角色筛选
function filterByCharacter(name) {
    searchQuery = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    renderMemes();
}

// 图片查看器
function openLightbox(url) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    img.src = url;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

// 上传模态框
function initUploadModal() {
    const fileInput = document.getElementById('uploadFile');
    const preview = document.getElementById('previewImage');
    const fileUpload = document.querySelector('.file-upload');

    if (fileUpload && fileInput) {
        fileUpload.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    preview.src = event.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// 显示上传模态框
function showAddModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// 关闭上传模态框
function closeUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // 重置表单
    const form = document.getElementById('uploadForm');
    const preview = document.getElementById('previewImage');
    if (form) form.reset();
    if (preview) {
        preview.src = '';
        preview.style.display = 'none';
    }
}

// 处理上传 - 需要审核
function handleUpload(event) {
    event.preventDefault();
    
    const fileInput = document.getElementById('uploadFile');
    const nameInput = document.getElementById('phoebeName');
    const categoryInput = document.getElementById('phoebeCategory');
    
    const file = fileInput.files[0];
    const name = nameInput.value.trim();
    const category = categoryInput.value;
    
    if (!file) {
        alert('请选择一张菲比图片！');
        return false;
    }
    
    if (!name) {
        alert('请给菲比起一个可爱的名字！');
        return false;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const newMeme = {
            id: nextId++,
            title: name,
            url: e.target.result,
            category: [category],
            views: 0,
            downloads: 0,
            date: new Date().toISOString().split('T')[0],
            isGif: file.type === 'image/gif',
            hot: 50,
            pending: true
        };
        
        // 添加到待审核列表
        pendingData.push(newMeme);
        
        closeUploadModal();
        
        // 显示审核提示
        showToast(`「${name}」已提交审核，请耐心等待~`);
        
        // 如果管理员面板打开，更新显示
        if (isAdmin) {
            renderAdminPanel();
        }
    };
    reader.readAsDataURL(file);
    
    return false;
}

// 管理员面板
function initAdminPanel() {
    // 隐藏原来的管理员按钮
    const adminToggle = document.getElementById('adminToggle');
    if (adminToggle) {
        adminToggle.style.display = 'none';
    }
    
    // 绑定右侧菲比头像点击事件（连续点击3次触发）
    const phoebeAvatar = document.getElementById('phoebeAvatar');
    if (phoebeAvatar) {
        let clickCount = 0;
        let clickTimer = null;
        
        phoebeAvatar.addEventListener('click', () => {
            clickCount++;
            if (clickCount === 1) {
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                }, 2000);
            }
            if (clickCount >= 3) {
                clearTimeout(clickTimer);
                clickCount = 0;
                toggleAdmin();
            }
        });
    }
}

function toggleAdmin() {
    if (!isAdmin) {
        const input = prompt('请输入验证信息：');
        if (!input) return;
        
        // 密码通过多段编码拼接，不直接出现在代码中
        // 分段: pb + qb + xwd + 5201314
        const p1 = String.fromCharCode(112, 98);
        const p2 = String.fromCharCode(113, 98);
        const p3 = String.fromCharCode(120, 119, 100);
        const p4 = String.fromCharCode(53, 50, 48, 49, 51, 49, 52);
        const key = p1 + p2 + p3 + p4;
        
        if (input === key) {
            isAdmin = true;
            showToast('管理员登录成功！');
            renderAdminPanel();
        } else {
            showToast('验证失败！');
        }
    } else {
        isAdmin = false;
        const panel = document.getElementById('adminPanel');
        if (panel) panel.classList.remove('active');
        showToast('已退出管理员模式');
    }
}

function renderAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (!panel) return;
    
    panel.classList.add('active');
    
    if (pendingData.length === 0) {
        panel.innerHTML = `
            <h3>审核面板</h3>
            <p style="text-align: center; color: #999; padding: 20px;">暂无待审核内容</p>
        `;
        return;
    }
    
    panel.innerHTML = `
        <h3>审核面板 (${pendingData.length} 条待审核)</h3>
        ${pendingData.map((item, index) => `
            <div class="review-item">
                <img src="${item.url}" alt="${item.title}">
                <div class="review-item-info">
                    <div class="review-item-title">${item.title}</div>
                    <div class="review-item-date">${item.date} | ${item.isGif ? '动态' : '静态'}</div>
                </div>
                <div class="review-actions">
                    <button class="review-btn approve" onclick="approveMeme(${index})">通过</button>
                    <button class="review-btn reject" onclick="rejectMeme(${index})">拒绝</button>
                </div>
            </div>
        `).join('')}
    `;
}

// 审核通过
function approveMeme(index) {
    const meme = pendingData[index];
    meme.pending = false;
    memesData.unshift(meme);
    pendingData.splice(index, 1);
    
    renderMemes();
    updateHotList();
    renderAdminPanel();
    showToast(`「${meme.title}」审核通过！`);
}

// 审核拒绝
function rejectMeme(index) {
    const meme = pendingData[index];
    pendingData.splice(index, 1);
    renderAdminPanel();
    showToast(`「${meme.title}」已拒绝`);
}

// Toast提示
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 90px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
        color: white;
        padding: 14px 28px;
        border-radius: 30px;
        font-weight: 800;
        z-index: 5000;
        box-shadow: 0 6px 25px rgba(255, 122, 61, 0.4);
        animation: slideDown 0.3s ease-out;
        font-size: 15px;
        letter-spacing: 0.5px;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// 回到顶部
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 键盘事件
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
        closeUploadModal();
    }
});
