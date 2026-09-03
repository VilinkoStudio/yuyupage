(function () {
    'use strict';

    const EXPECTED_TOKEN = "SGVsbG8gd29ybGQhIHRoaXMgaXMgYSByYW5kb20g";

    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');

    const token = tokenFromUrl ? tokenFromUrl.trim() : null;
    const expected = EXPECTED_TOKEN.trim();

    const isAvailable = (token === expected);

    const GIF_NORMAL = './source/study-cloud-normal-x-5279fb.gif';
    const GIF_LISTENING = './source/study-cloud-listening-x-5279fb.gif';
    const GIF_CURIOUS = './source/study-cloud-curious-x-5279fb.gif';
    const GIF_EXCITED = './source/study-cloud-excited-x-5279fb.gif';
    const GIF_DROWSY = './source/study-cloud-drowsy-x-5279fb.gif';

    const gifImg = document.getElementById('gifImg');
    const searchInput = document.getElementById('searchInput');
    const sendBtn = document.getElementById('sendBtn');
    const apiContent = document.getElementById('apiContent');
    const apiBadge = document.getElementById('apiBadge');
    const tabAll = document.getElementById('tab-all');

    let isRequesting = false;
    let prevHasText = false;

    function setGif(src) {
        if (gifImg.src !== src) {
            gifImg.src = src;
        }
    }

    function refreshGif() {
        if (!isAvailable) {
            setGif(GIF_DROWSY);
            return;
        }
        if (isRequesting) {
            setGif(GIF_CURIOUS);
            return;
        }
        const hasText = searchInput.value.trim().length > 0;
        if (hasText) {
            setGif(GIF_LISTENING);
        } else {
            setGif(GIF_NORMAL);
        }
    }

    function setExcited() {
        setGif(GIF_EXCITED);
    }

    function applyAvailability() {
        if (!isAvailable) {
            searchInput.disabled = true;
            sendBtn.disabled = true;
            searchInput.placeholder = '服务暂不可用（Token 无效）';
            setGif(GIF_DROWSY);
            prevHasText = false;
            apiContent.innerHTML = '<span class="placeholder"><i class="fas fa-lock" style="margin-right:6px;"></i>Token 无效，服务已锁定</span>';
            apiBadge.innerHTML = '<i class="fas fa-times-circle" style="margin-right:4px;color:#ef4444;"></i>锁定';
        } else {
            searchInput.disabled = false;
            sendBtn.disabled = false;
            searchInput.placeholder = '输入关键词，Shift+Enter 换行，Enter 发送';
            prevHasText = searchInput.value.trim().length > 0;
            refreshGif();
            const currentContent = apiContent.innerHTML;
            if (!currentContent.trim() || currentContent.includes('锁定')) {
                apiContent.innerHTML = '<span class="placeholder"><i class="fas fa-search" style="margin-right:8px;"></i>输入关键词后发送，将显示回答</span>';
            }
            apiBadge.innerHTML = '<i class="fas fa-hourglass-half" style="margin-right:4px;"></i>等待';
        }
    }

    function renderSources(sources) {
        if (!sources || sources.length === 0) {
            tabAll.innerHTML = '<div class="empty-tip"><i class="fas fa-inbox" style="margin-right:6px;"></i>暂无相关资源</div>';
            return;
        }
        const itemsHtml = sources.map((src) => {
            const title = src.title || '无标题';
            const link = src.link || '#';
            const date = src.date || '未知日期';
            const summary = src.summary || src.snippet || '';
            const metaText = date ? date : (summary ? summary.slice(0, 20) + '…' : '');
            return `
                        <a href="${link}" target="_blank" class="resource-item" style="text-decoration:none;color:inherit;display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f3f5f9;border-radius:4px;padding-left:6px;padding-right:6px;">
                            <div class="info">
                                <span class="icon"><i class="fas fa-link"></i></span>
                                <span class="name">${title}</span>
                                <span class="meta">${metaText}</span>
                            </div>
                            <span class="tag">来源</span>
                        </a>
                    `;
        }).join('');
        tabAll.innerHTML = itemsHtml;
    }

    async function callAPI(query) {
        if (!isAvailable) return;
        if (!query || query.trim() === '') return;

        isRequesting = true;
        refreshGif();
        apiBadge.innerHTML = '<i class="fas fa-spinner fa-pulse" style="margin-right:4px;"></i>请求中';
        apiContent.innerHTML = '<span class="placeholder"><i class="fas fa-spinner fa-pulse" style="margin-right:8px;"></i>加载中<span class="loading-dots"></span></span>';
        tabAll.innerHTML = '<div class="empty-tip"><i class="fas fa-spinner fa-pulse" style="margin-right:6px;"></i>加载资源中...</div>';

        try {
            const myHeaders = new Headers();
            myHeaders.append("Authorization", "Bearer mk-14C698859873BA199E8CC2442C602606");
            myHeaders.append("Accept", "application/json");
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify({
                q: query.trim(),
                model: "fast",
                format: "simple"
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow"
            };

            const response = await fetch("https://metaso.cn/api/v1/chat/completions", requestOptions);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();

            let answer = null;
            let sources = null;
            if (result && typeof result === 'object') {
                if (result.answer !== undefined && result.answer !== null) {
                    answer = result.answer;
                } else if (result.data && result.data.answer !== undefined) {
                    answer = result.data.answer;
                }
                if (result.sources && Array.isArray(result.sources)) {
                    sources = result.sources;
                } else if (result.data && result.data.sources && Array.isArray(result.data.sources)) {
                    sources = result.data.sources;
                }
            }

            if (answer) {
                const parsedHtml = marked.parse(answer);
                apiContent.innerHTML = parsedHtml;
            } else {
                apiContent.innerHTML = '<span class="placeholder"><i class="fas fa-exclamation-triangle" style="margin-right:6px;color:#f59e0b;"></i>未能解析 answer 字段</span>';
            }

            if (sources && sources.length > 0) {
                renderSources(sources);
            } else {
                renderSources([]);
            }

            apiBadge.innerHTML = '<i class="fas fa-check-circle" style="margin-right:4px;color:#10b981;"></i>成功';
            setTimeout(() => {
                apiBadge.innerHTML = '<i class="fas fa-hourglass-half" style="margin-right:4px;"></i>等待';
            }, 3000);

        } catch (error) {
            console.error('API 请求失败:', error);
            apiContent.innerHTML = `<span class="placeholder"><i class="fas fa-exclamation-circle" style="margin-right:6px;color:#ef4444;"></i>请求异常：${error.message || '未知错误'}</span>`;
            apiBadge.innerHTML = '<i class="fas fa-times-circle" style="margin-right:4px;color:#ef4444;"></i>异常';
            setTimeout(() => {
                apiBadge.innerHTML = '<i class="fas fa-hourglass-half" style="margin-right:4px;"></i>等待';
            }, 3000);
            renderSources([]);
        } finally {
            isRequesting = false;
            setExcited();
            setTimeout(() => {
                prevHasText = searchInput.value.trim().length > 0;
                refreshGif();
            }, 600);
        }
    }

    function handleSend() {
        if (!isAvailable) {
            console.warn('Token 无效，拒绝发送');
            return;
        }
        const text = searchInput.value.trim();
        if (!text) {
            searchInput.style.borderColor = '#fca5a5';
            setTimeout(() => { searchInput.style.borderColor = ''; }, 600);
            return;
        }
        if (isRequesting) return;

        searchInput.value = '';
        prevHasText = false;
        sendBtn.style.transform = 'scale(0.92)';
        setTimeout(() => { sendBtn.style.transform = ''; }, 150);
        callAPI(text);
    }

    sendBtn.addEventListener('click', handleSend);
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });
    searchInput.addEventListener('input', function () {
        if (!isAvailable || isRequesting) return;
        const hasText = this.value.trim().length > 0;
        if (hasText !== prevHasText) {
            prevHasText = hasText;
            refreshGif();
        }
    });
    searchInput.addEventListener('focus', function () {
        if (isAvailable) this.placeholder = '输入关键词，Shift+Enter 换行，Enter 发送';
    });
    searchInput.addEventListener('blur', function () {
        if (isAvailable) this.placeholder = '输入关键词，Shift+Enter 换行，Enter 发送';
    });

    function init() {
        setGif(GIF_NORMAL);
        applyAvailability();
        console.log('✅ 页面初始化完成，当前状态:', isAvailable ? '可用' : '不可用');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const width = window.innerWidth;
            const ua = navigator.userAgent.toLowerCase();
            const mobileKeywords = ['android', 'iphone', 'ipod', 'ipad', 'blackberry', 'windows phone', 'mobile'];
            const uaMatch = mobileKeywords.some(kw => ua.includes(kw));
            if (width < 768 || uaMatch) {
                document.body.classList.add('mobile-warning');
            } else {
                document.body.classList.remove('mobile-warning');
            }
        }, 300);
    });

    let sendLock = false;
    const originalHandle = handleSend;
    handleSend = function () {
        if (sendLock || isRequesting) return;
        sendLock = true;
        originalHandle();
        setTimeout(() => { sendLock = false; }, 400);
    };
    sendBtn.removeEventListener('click', handleSend);
    sendBtn.addEventListener('click', handleSend);

})();