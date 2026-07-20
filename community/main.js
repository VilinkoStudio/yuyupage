document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('selectstart', e => e.preventDefault());
document.addEventListener('copy', e => e.preventDefault());
document.addEventListener('cut', e => e.preventDefault());
document.addEventListener('keydown', e => {
    if (e.keyCode === 123) e.preventDefault();
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) e.preventDefault();
    if (e.ctrlKey && e.shiftKey && e.key === 'I') e.preventDefault();
});

function setAutoTheme() {
    const hour = new Date().getHours();
    const html = document.documentElement;
    if (hour >= 7 && hour < 20) {
        html.classList.remove('dark');
    } else {
        html.classList.add('dark');
    }
}
setAutoTheme();
setInterval(setAutoTheme, 3600 * 1000);

// 全局变量存储原始数据与当前筛选条件
let originTableData = [];
let currentFilter = "全部";

// 筛选标签点击事件绑定
document.querySelectorAll('.filter-tabs .tab').forEach(tab => {
    tab.addEventListener('click', function () {
        // 切换激活样式
        document.querySelectorAll('.filter-tabs .tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.status;
        renderTable();
    })
});

// 根据筛选条件渲染表格
function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    let renderList = originTableData;

    if (currentFilter !== "全部") {
        renderList = originTableData.filter(item => item.status === currentFilter);
    }

    // 无数据提示
    if (renderList.length === 0) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="4">No Data.</td></tr>`;
        return;
    }

    renderList.forEach((item, index) => {
        const tr = document.createElement('tr');
        let statusClass = '';
        switch (item.status) {
            case '已采纳': statusClass = 'status-adopt'; break;
            case '未采纳': statusClass = 'status-reject'; break;
            case '规划中': statusClass = 'status-plan'; break;
            case '需评估': statusClass = 'status-eval'; break;
        }
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div class="suggest-box">${item.suggest}</div>
            </td>
            <td>${item.product}</td>
            <td class="${statusClass}">${item.status}</td>
        `;
        tbody.appendChild(tr);
    });
}

async function loadTableData() {
    try {
        const res = await fetch(`./data.json?_t=${Date.now()}`);
        const jsonData = await res.json();
        const updateTime = jsonData.config?.updateTime || "暂无更新时间";
        document.getElementById('updateDate').innerText = updateTime;
        originTableData = jsonData.tableData || [];
        renderTable();
    } catch (err) {
        document.getElementById('tableBody').innerHTML = `
            <tr><td colspan="4" style="text-align:center;padding:30px;">
                <i class="fa-solid fa-triangle-exclamation"></i> 数据加载失败
            </td></tr>
        `;
        document.getElementById('updateDate').innerText = "读取配置失败";
        console.error('数据加载错误：', err);
    }
}

window.addEventListener('DOMContentLoaded', loadTableData);