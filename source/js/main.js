const WEATHER_API_KEY = "9d703463f9f67ab79617c7f5fde1fe73";

let is24Hour = true;

const DEFAULT_SETTINGS = {
    engine: 'bing',
    globalFont: 'minecraft', // 新增默认字体设置
    is24Hour: true,
    blink: false,
    customFont: false,
    showFooter: true,
    showWeather: true,
    weatherUnit: 'metric',
    weatherLocation: 'Beijing',
    weatherApiKey: '',
    showDoodle: false,
    showPoetry: true
};

const searchEngines = {

    bing: {
        action: "https://cn.bing.com/search",
        name: "q",
        placeholder: "使用 Bing 搜索..."
    },

    google: {
        action: "https://www.google.com/search",
        name: "q",
        placeholder: "使用 Google 搜索..."
    },

    baidu: {
        action: "https://www.baidu.com/s",
        name: "wd",
        placeholder: "使用 百度 搜索..."
    },

    sogou: {
        action: "https://www.sogou.com/web",
        name: "query",
        placeholder: "使用 搜狗 搜索..."
    },

    360: {
        action: "https://www.so.com/s",
        name: "q",
        placeholder: "使用 360 搜索..."
    },

    yandex: {
        action: "https://yandex.com/search/",
        name: "text",
        placeholder: "使用 Yandex 搜索..."
    }

};

const modalOverlay = document.getElementById('modalOverlay');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');

const engineSelect = document.getElementById('engineSelect');
const fontSelect = document.getElementById('fontSelect'); // 新增字体选择元素

const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');

const timeFormatToggle = document.getElementById('timeFormatToggle');
const blinkToggle = document.getElementById('blinkToggle');
const fontToggle = document.getElementById('fontToggle');
const footerToggle = document.getElementById('footerToggle');

//const doodleToggle = document.getElementById('doodleToggle');
//const doodleSlot = document.getElementById('doodleSlot');

const poetryToggle = document.getElementById('poetryToggle');
const poetryBox = document.getElementById('poetryBox');
const poetryContent = document.getElementById('poetry-content');
const poetryAuthor = document.getElementById('poetry-author');

const clockColon = document.getElementById('clockColon');

const pageFooter = document.getElementById('pageFooter');

const weatherWidget = document.getElementById('weatherWidget');
const weatherTemp = document.getElementById('weatherTemp');

const weatherToggle = document.getElementById('weatherToggle');
const weatherUnitSelect = document.getElementById('weatherUnitSelect');
const weatherLocationInput = document.getElementById('weatherLocationInput');

const weatherUnitGroup = document.getElementById('weatherUnitGroup');
const weatherLocationGroup = document.getElementById('weatherLocationGroup');
const weatherApiKeyGroup = document.getElementById('weatherApiKeyGroup');
const weatherApiKeyInput = document.getElementById('weatherApiKeyInput');

function saveSettings() {

    const settings = {
        engine: engineSelect.value,
        globalFont: fontSelect.value, // 保存字体设置
        is24Hour: is24Hour,
        blink: blinkToggle.checked,
        customFont: fontToggle.checked,
        showFooter: footerToggle.checked,
        showWeather: weatherToggle.checked,
        weatherUnit: weatherUnitSelect.value,
        weatherLocation: weatherLocationInput.value || 'Beijing',
        weatherApiKey: weatherApiKeyInput.value.trim(),
        showDoodle: false, // doodle功能已禁用，固定为false或根据实际需求调整，此处保持一致性
        showPoetry: poetryToggle.checked
    };

    // 同时存储到 chrome.storage.local
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set(settings);
    } else {
        console.warn('chrome.storage.local is not available');
    }
}

async function loadSettings() {

    let settings = DEFAULT_SETTINGS;

    // 尝试从 chrome.storage.local 读取设置
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        try {
            const result = await new Promise((resolve) => {
                chrome.storage.local.get(null, resolve); // 获取所有存储项
            });
            
            // 合并默认设置和存储的设置
            settings = { ...DEFAULT_SETTINGS, ...result };
        } catch (e) {
            console.error("Failed to read from chrome.storage", e);
        }
    }

    engineSelect.value = settings.engine;
    applyEngine(settings.engine);

    fontSelect.value = settings.globalFont; // 设置下拉菜单值
    applyGlobalFont(settings.globalFont); // 应用字体

    is24Hour = settings.is24Hour;
    timeFormatToggle.checked = settings.is24Hour;

    blinkToggle.checked = settings.blink;
    applyBlink(settings.blink);

    fontToggle.checked = settings.customFont;
    applyFont(settings.customFont);

    footerToggle.checked = settings.showFooter;
    applyFooter(settings.showFooter);

    weatherToggle.checked = settings.showWeather;
    weatherUnitSelect.value = settings.weatherUnit;
    weatherLocationInput.value = settings.weatherLocation;
    weatherApiKeyInput.value = settings.weatherApiKey || '';

    applyWeatherVisibility(settings.showWeather);
    applyWeatherSettingState(settings.showWeather);

    poetryToggle.checked = settings.showPoetry;
    applyPoetry(settings.showPoetry);

    //doodleToggle.checked = settings.showDoodle;

    if (settings.showDoodle) {
        // doodleSlot.style.display = "flex"; // doodleSlot 已注释，此处逻辑保留但无实际效果
    } else {
        // doodleSlot.style.display = "none";
    }

    if (settings.showWeather) {
        fetchWeather();
    }
}

function applyEngine(engine) {

    const config = searchEngines[engine];

    searchForm.action = config.action;
    searchInput.name = config.name;
    searchInput.placeholder = config.placeholder;
}

function applyGlobalFont(fontType) {
    const root = document.documentElement;
    
    // 定义字体栈
    const minecraftFontStack = "'MinecraftFont', 'Google Sans', 'Product Sans', 'Helvetica Neue', Arial, sans-serif";
    const harmonyosFontStack = "'HarmonyOS Sans', 'HarmonyOS Sans SC', 'Microsoft YaHei', sans-serif";

    if (fontType === 'harmonyos') {
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: 'HarmonyOS Sans';
                src: url('./source/harmonyos.ttf') format('truetype');
                font-display: swap;
            }
        `;
        document.head.appendChild(style);
        
        document.body.style.fontFamily = harmonyosFontStack;
    } else {
        // 默认 Minecraft 字体
        document.body.style.fontFamily = minecraftFontStack;
    }
}

function applyFont(enabled) {

    if (enabled) {
        searchInput.classList.add('custom-font');
    } else {
        searchInput.classList.remove('custom-font');
    }
}

function applyBlink(enabled) {
    if (enabled) {
        clockColon.classList.add('blinking');
    } else {
        clockColon.classList.remove('blinking');
    }
}

function applyFooter(enabled) {

    if (enabled) {
        pageFooter.style.opacity = "0.6";
        pageFooter.style.visibility = "visible";
    } else {
        pageFooter.style.opacity = "0";
        pageFooter.style.visibility = "hidden";
    }
}

function applyPoetry(enabled) {

    if (enabled) {
        poetryBox.classList.remove('hidden');
    } else {
        poetryBox.classList.add('hidden');
    }
}

async function loadPoetry() {
    try {
        // 1. 从今日诗词官方 API 获取数据
        const response = await fetch('https://v2.jinrishici.com/one.json');
        const data = await response.json();

        if (data && data.status === "success") {
            // 2. 拿到诗词数据
            const content = data.data.content; // 诗词正文

            // 3. 将数据渲染到你的页面元素中（仅渲染正文）
            if (poetryContent) poetryContent.innerText = content;
        }
    } catch (error) {
        console.error('获取诗词失败:', error);
        // 容错处理：如果断网了，显示一句精选的默认诗词
        if (poetryContent) poetryContent.innerText = "海内存知己，天涯若比邻。";
    }
}

function applyWeatherVisibility(enabled) {

    if (enabled) {
        weatherWidget.classList.remove('hidden');
    } else {
        weatherWidget.classList.add('hidden');
    }
}

function applyWeatherSettingState(enabled) {

    if (enabled) {
        weatherUnitGroup.classList.remove('setting-disabled');
        weatherLocationGroup.classList.remove('setting-disabled');
    } else {
        weatherUnitGroup.classList.add('setting-disabled');
        weatherLocationGroup.classList.add('setting-disabled');
    }
}

async function fetchWeather() {

    const city = weatherLocationInput.value || 'Beijing';
    const unit = weatherUnitSelect.value;
    const symbol = unit === 'metric' ? '°C' : '°F';

    // 获取 API Key：优先使用用户输入的，否则使用默认值
    let apiKey = WEATHER_API_KEY;
    const customKey = weatherApiKeyInput.value.trim();
    if (customKey) {
        apiKey = customKey;
    } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        // 尝试从 chrome.storage 读取（作为备选或同步机制）
        try {
            const result = await new Promise((resolve) => {
                chrome.storage.local.get(['openWeatherApiKey'], resolve);
            });
            if (result.openWeatherApiKey) {
                apiKey = result.openWeatherApiKey;
            }
        } catch (e) {
            console.error("Failed to read from chrome.storage", e);
        }
    }

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${unit}&appid=${apiKey}`
        );

        const data = await response.json();

        if (data.main) {

            const temp = Math.round(data.main.temp);

            weatherTemp.textContent = `${temp}${symbol}`;

            const icon = weatherWidget.querySelector('i');

            const weatherMain = (data.weather[0].main || '').toLowerCase();

            if (weatherMain.includes('cloud')) {
                icon.className = 'fa-solid fa-cloud';
            } else if (weatherMain.includes('rain')) {
                icon.className = 'fa-solid fa-cloud-rain';
            } else if (weatherMain.includes('clear')) {
                icon.className = 'fa-solid fa-sun';
            } else if (weatherMain.includes('snow')) {
                icon.className = 'fa-solid fa-snowflake';
            } else {
                icon.className = 'fa-solid fa-cloud';
            }

        } else if (data.cod === 401) {
            weatherTemp.textContent = 'Key Err';
        }

    } catch {
        weatherTemp.textContent = '--';
    }
}

function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let period = '';
    if (!is24Hour) {
        period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
    }

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    document.getElementById('clockHours').textContent = hours;
    document.getElementById('clockMinutes').textContent = minutes;
    document.getElementById('timePeriod').textContent = period;
}

function updateFooterYear() {
    document.getElementById('footerYear').textContent =
        new Date().getFullYear();
}

openSettingsBtn.addEventListener('click', () => {
    modalOverlay.classList.add('active');
});

closeSettingsBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
    }
});

engineSelect.addEventListener('change', (e) => {
    applyEngine(e.target.value);
    saveSettings();
});

fontSelect.addEventListener('change', (e) => {
    applyGlobalFont(e.target.value);
    saveSettings();
});

timeFormatToggle.addEventListener('change', (e) => {
    is24Hour = e.target.checked;
    updateClock();
    saveSettings();
});

blinkToggle.addEventListener('change', (e) => {
    applyBlink(e.target.checked);
    saveSettings();
});

fontToggle.addEventListener('change', (e) => {
    applyFont(e.target.checked);
    saveSettings();
});

footerToggle.addEventListener('change', (e) => {
    applyFooter(e.target.checked);
    saveSettings();
});

poetryToggle.addEventListener('change', (e) => {
    applyPoetry(e.target.checked);
    saveSettings();
});

// doodleToggle.addEventListener('change', (e) => {
//    if (e.target.checked) {
//        doodleSlot.style.display = 'flex';
//    } else {
//        doodleSlot.style.display = 'none';
//    }
//    saveSettings();
//});

weatherToggle.addEventListener('change', (e) => {
    applyWeatherVisibility(e.target.checked);
    applyWeatherSettingState(e.target.checked);
    if (e.target.checked) {
        fetchWeather();
    }
    saveSettings();
});

weatherUnitSelect.addEventListener('change', () => {
    fetchWeather();
    saveSettings();
});

weatherLocationInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
    saveSettings();
});

weatherLocationInput.addEventListener('change', () => {
    fetchWeather();
    saveSettings();
});

weatherApiKeyInput.addEventListener('input', () => {
    saveSettings();
});

weatherApiKeyInput.addEventListener('change', () => {
    if (weatherToggle.checked) {
        fetchWeather();
    }
});

// 屏蔽除输入框外的右键菜单
document.addEventListener('contextmenu', (e) => {
    // 检查目标元素是否是输入框或文本域
    const target = e.target;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
    
    // 如果目标不是输入框，则阻止右键菜单
    if (!isInput) {
        e.preventDefault();
    }
});

loadSettings();
updateClock();
updateFooterYear();
loadPoetry();
setInterval(updateClock, 1000);
setInterval(() => {
    if (weatherToggle.checked) {
        fetchWeather();
    }
}, 600000);