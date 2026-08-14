chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getBingWallpaper') {
        fetch('https://bing.biturl.top/?resolution=UHD&format=image&index=0&mkt=zh-CN')
            .then(response => {
                if (response.ok) {
                    sendResponse({ url: response.url });
                } else {
                    sendResponse({ error: 'Failed to fetch wallpaper' });
                }
            })
            .catch(error => {
                sendResponse({ error: error.message });
            });
        
        return true;
    }
});