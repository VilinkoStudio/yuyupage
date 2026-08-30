chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getBingWallpaper') {
        const fallbackUrl = chrome.runtime.getURL('source/localdata/wallpaper.jpg');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 40000);

        fetch('https://bing.biturl.top/?resolution=UHD&format=image&index=0&mkt=zh-CN', { signal: controller.signal })
            .then(response => {
                if (response.ok) {
                    sendResponse({ url: response.url });
                } else {
                    sendResponse({ url: fallbackUrl, isFallback: true });
                }
            })
            .catch(() => {
                sendResponse({ url: fallbackUrl, isFallback: true });
            })
            .finally(() => clearTimeout(timeoutId));

        return true; // 异步响应
    }

    if (message.action === 'openUrl' && message.url) {
        chrome.tabs.create({ url: message.url });
        sendResponse({ success: true });
        return true;
    }

    if (message.action === 'webdavRequest') {
        const { url, method = 'PROPFIND', username = '', password = '', headers = {}, body = '', timeout = 20000 } = message;

        // 构造 Basic Auth 头（兼容非 Latin1 字符）
        const raw = `${username}:${password}`;
        const b64 = btoa(encodeURIComponent(raw).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode('0x' + p1)));
        const authHeader = (username || password) ? { 'Authorization': 'Basic ' + b64 } : {};

        // 默认请求头：Depth 用于 PROPFIND/OPTIONS；Content-Type 由调用方通过 headers 决定
        const defaultHeaders = { 'Depth': '0' };
        if (body && !headers['Content-Type'] && !headers['content-type']) {
            defaultHeaders['Content-Type'] = 'application/octet-stream';
        }

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        const fetchOptions = {
            method,
            headers: Object.assign(defaultHeaders, authHeader, headers),
            signal: controller.signal
        };
        if (body) fetchOptions.body = body;

        fetch(url, fetchOptions)
            .then(async (response) => {
                let data = '';
                try { data = await response.text(); } catch (e) { data = ''; }
                sendResponse({
                    ok: response.ok,
                    status: response.status,
                    statusText: response.statusText,
                    data
                });
            })
            .catch((err) => {
                // 超时（AbortError）或网络错误，status=0
                sendResponse({
                    ok: false,
                    status: 0,
                    statusText: err && err.name === 'AbortError' ? 'Timeout' : (err && err.message) || 'Network Error',
                    error: err && err.name === 'AbortError' ? '请求超时' : (err && err.message) || '网络错误'
                });
            })
            .finally(() => clearTimeout(timer));

        return true; // 异步响应
    }
});
