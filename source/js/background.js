chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getBingWallpaper') {
        fetch('https://bing.shangzhenyang.com/api/1080p')
            .then(response => {
                if (response.ok) {
                    // 返回最终重定向后的 URL
                    sendResponse({ url: response.url });
                } else {
                    sendResponse({ error: 'Failed to fetch wallpaper' });
                }
            })
            .catch(error => {
                sendResponse({ error: error.message });
            });
        
        // 返回 true 表示我们将异步发送响应
        return true;
    }
});