const DEFAULT_SETTINGS = {
    engine: 'bing',
    globalFont: 'minecraft', 
    is24Hour: true,
    blink: false,
    customFont: false,
    showFooter: true,
    showWeather: true,
    weatherUnit: 'metric',
    weatherLocation: 'Beijing',
    weatherApiKey: '',
    showDoodle: false,
    showPoetry: true,
    vilinkoConnect: false,
    showNoteBtn: true,
    noteApp: 'Pogget',
    language: 'zh-CN',
    showSugUrls: true,
    bingWallpaper: false // 新增：默认关闭
};

let is24Hour = true;

const WEATHER_API_KEY = '9d703463f9f67ab79617c7f5fde1fe73';

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
const fontSelect = document.getElementById('fontSelect'); 
const languageSelect = document.getElementById('languageSelect');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const timeFormatToggle = document.getElementById('timeFormatToggle');
const blinkToggle = document.getElementById('blinkToggle');
const fontToggle = document.getElementById('fontToggle');
const footerToggle = document.getElementById('footerToggle');
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
const vilinkoConnectToggle = document.getElementById('vilinkoConnect');
const noteBtnToggle = document.getElementById('noteBtnToggle');
const noteAppSelect = document.getElementById('noteAppSelect');
const noteBtnGroup = document.getElementById('noteBtnGroup');
const noteAppGroup = document.getElementById('noteAppGroup');
const trustModalOverlay = document.getElementById('trustModalOverlay');
const closeTrustModalBtn = document.getElementById('closeTrustModalBtn');
const allTextBtn = document.getElementById('alltext');
const sugUrlsToggle = document.getElementById('sugUrlsToggle');
const bingWallpaperToggle = document.getElementById('bingWallpaperToggle'); // 新增

let translations = {}; // 存储翻译数据
let labsConfig = {}; // 存储实验室功能配置
let urlsConfig = {}; // 存储快捷网址配置

function saveSettings() {
    const settings = {
        engine: engineSelect.value,
        globalFont: fontSelect.value, 
        is24Hour: is24Hour,
        blink: blinkToggle.checked,
        customFont: fontToggle.checked,
        showFooter: footerToggle.checked,
        showWeather: weatherToggle.checked,
        weatherUnit: weatherUnitSelect.value,
        weatherLocation: weatherLocationInput.value || 'Beijing',
        weatherApiKey: weatherApiKeyInput.value.trim(),
        showDoodle: false, 
        showPoetry: poetryToggle.checked,
        vilinkoConnect: vilinkoConnectToggle.checked,
        showNoteBtn: noteBtnToggle.checked,
        noteApp: noteAppSelect.value,
        language: languageSelect ? languageSelect.value : 'zh-CN',
        showSugUrls: sugUrlsToggle ? sugUrlsToggle.checked : true,
        bingWallpaper: bingWallpaperToggle ? bingWallpaperToggle.checked : false // 新增
    };

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set(settings);
    } else {
        console.warn('chrome.storage.local 不可用');
    }
}

async function loadTranslations() {
    try {
        const response = await fetch('./source/txt/words.json');
        translations = await response.json();
    } catch (error) {
        console.error('无法加载翻译数据：', error);
        translations = {};
    }
}

async function loadLabsConfig() {
    try {
        const response = await fetch('./source/txt/labs.json');
        labsConfig = await response.json();
    } catch (error) {
        console.error('无法加载实验室配置：', error);
        labsConfig = {};
    }
}

async function loadUrlsConfig() {
    try {
        const response = await fetch('./source/txt/urls.json');
        urlsConfig = await response.json();
    } catch (error) {
        console.error('无法加载快捷网址配置：', error);
        urlsConfig = {};
    }
}

function applyLanguage(lang) {
    if (!translations[lang]) return;
    
    const dict = translations[lang];

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            if (key === 'footer_copyright') {
                const yearSpan = el.querySelector('#footerYear');
                const year = yearSpan ? yearSpan.textContent : new Date().getFullYear();
                el.innerHTML = dict[key].replace('{year}', `<span id="footerYear">${year}</span>`);
            } else {
                el.textContent = dict[key];
            }
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) {
            el.placeholder = dict[key];
        }
    });

    const currentEngine = engineSelect ? engineSelect.value : 'bing';
    const placeholderKey = `search_placeholder_${currentEngine}`;
    if (dict[placeholderKey] && searchInput) {
        searchInput.placeholder = dict[placeholderKey];
    }

    if (dict['title']) {
        document.title = dict['title'];
    }

    // 英文环境下禁止使用像素字体
    if (fontSelect) {
        const minecraftOption = fontSelect.querySelector('option[value="minecraft"]');
        if (minecraftOption) {
            if (lang === 'en') {
                minecraftOption.disabled = true;
                if (fontSelect.value === 'minecraft') {
                    fontSelect.value = 'harmonyos';
                    applyGlobalFont('harmonyos');
                    saveSettings();
                }
            } else {
                minecraftOption.disabled = false;
            }
        }
    }
}

async function loadSettings() {
    let settings = DEFAULT_SETTINGS;

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        try {
            const result = await new Promise((resolve) => {
                chrome.storage.local.get(null, resolve); 
            });
            settings = { ...DEFAULT_SETTINGS, ...result };
        } catch (e) {
            console.error("无法从 chrome.storage.local 中读取数据", e);
        }
    }

    // 加载翻译数据
    await loadTranslations();
    // 加载实验室配置
    await loadLabsConfig();
    // 加载快捷网址配置
    await loadUrlsConfig();

    // 应用语言设置
    if (languageSelect) {
        languageSelect.value = settings.language;
        applyLanguage(settings.language);
    }

    engineSelect.value = settings.engine;
    applyEngine(settings.engine);

    fontSelect.value = settings.globalFont; 
    applyGlobalFont(settings.globalFont); 

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

    // 加载信任环状态
    if (vilinkoConnectToggle) {
        vilinkoConnectToggle.checked = settings.vilinkoConnect;
    }

    // 加载便签按钮显示状态
    if (noteBtnToggle) {
        noteBtnToggle.checked = settings.showNoteBtn;
    }

    if (noteAppSelect) {
        noteAppSelect.value = settings.noteApp;
    }

    if (sugUrlsToggle) {
        sugUrlsToggle.checked = settings.showSugUrls;
    }

    // 新增：加载 Bing 壁纸设置
    if (bingWallpaperToggle) {
        bingWallpaperToggle.checked = settings.bingWallpaper;
    }
    
    // 新增：应用 Bing 壁纸
    applyBingWallpaper(settings.bingWallpaper);

    updateTrustRingDependentControls(vilinkoConnectToggle.checked);

    applyNoteBtnVisibility(settings.showNoteBtn);

    if (settings.showWeather) {
        fetchWeather();
    }
}

function applyEngine(engine) {
    const config = searchEngines[engine];
    searchForm.action = config.action;
    searchInput.name = config.name;
    
    const currentLang = languageSelect ? languageSelect.value : 'zh-CN';
    const dict = translations[currentLang];
    if (dict) {
        const placeholderKey = `search_placeholder_${engine}`;
        if (dict[placeholderKey]) {
            searchInput.placeholder = dict[placeholderKey];
        } else {
            searchInput.placeholder = config.placeholder;
        }
    } else {
        searchInput.placeholder = config.placeholder;
    }
}

function applyGlobalFont(fontType) {
    const root = document.documentElement;
    const minecraftFontStack = "'MinecraftFont', 'Google Sans', 'Product Sans', 'Helvetica Neue', Arial, sans-serif";
    const harmonyosFontStack = "'HarmonyOS Sans', 'HarmonyOS Sans SC', 'Microsoft YaHei', sans-serif";
    const misansFontStack = "'MiSans', 'MiSans Latin', 'HarmonyOS Sans', 'Microsoft YaHei', sans-serif";
    const tencentFontStack = "'Tencent Sans', 'TencentFont', 'HarmonyOS Sans', 'Microsoft YaHei', sans-serif";

    let targetFontStack = minecraftFontStack;

    if (fontType === 'harmonyos') {
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: 'HarmonyOS Sans';
                src: url('./source/ttf/harmonyos.ttf') format('truetype');
                font-display: swap;
            }
        `;
        document.head.appendChild(style);
        targetFontStack = harmonyosFontStack;
    } else if (fontType === 'misans') {
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: 'MiSans';
                src: url('./source/ttf/misans.ttf') format('truetype');
                font-display: swap;
            }
        `;
        document.head.appendChild(style);
        targetFontStack = misansFontStack;
    } else if (fontType === 'Tencent') {
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: 'Tencent Sans';
                src: url('./source/ttf/Tencent.ttf') format('truetype');
                font-display: swap;
            }
        `;
        document.head.appendChild(style);
        targetFontStack = tencentFontStack;
    } else {
        targetFontStack = minecraftFontStack;
    }

    document.body.style.fontFamily = targetFontStack;
    searchInput.style.fontFamily = targetFontStack;
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

// 双击诗词搜索功能
if (poetryContent) {
    poetryContent.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        
        const content = poetryContent.innerText.trim();
        if (!content) return;

        const currentEngine = engineSelect ? engineSelect.value : 'bing';
        const engineConfig = searchEngines[currentEngine];
        
        if (engineConfig) {
            const searchUrl = `${engineConfig.action}?${engineConfig.name}=${encodeURIComponent(content)}`;
            window.open(searchUrl, '_blank');
        }
    });
    
    poetryContent.style.cursor = 'pointer';
    poetryContent.title = '双击搜索诗词';
}

async function loadPoetry() {
    try {
        const response = await fetch('https://v2.jinrishici.com/one.json');
        const data = await response.json();
        if (data && data.status === "success") {
            const content = data.data.content; 
            if (poetryContent) poetryContent.innerText = content;
        }
    } catch (error) {
        console.error('获取诗词失败:', error);
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
    let apiKey = WEATHER_API_KEY;
    const customKey = weatherApiKeyInput.value.trim();
    
    if (customKey) {
        apiKey = customKey;
    } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
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
    document.getElementById('footerYear').textContent = new Date().getFullYear();
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
    if (e.target.value === 'minecraft' && languageSelect && languageSelect.value === 'en') {
        e.target.value = 'harmonyos'; 
        alert('Pixel font is not supported in English mode.');
    }
    applyGlobalFont(e.target.value);
    saveSettings();
});

// 监听语言选择变化
if (languageSelect) {
    languageSelect.addEventListener('change', (e) => {
        applyLanguage(e.target.value);
        saveSettings();
    });
}

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

// 新增：监听信任环开关变化
vilinkoConnectToggle.addEventListener('change', (e) => {
    updateTrustRingDependentControls(e.target.checked);
    saveSettings();
});

// 新增：监听便签按钮开关变化
noteBtnToggle.addEventListener('change', (e) => {
    applyNoteBtnVisibility(e.target.checked);
    saveSettings();
});

// 新增：监听便签应用选择变化
noteAppSelect.addEventListener('change', () => {
    saveSettings();
});

// 新增：监听联想网址开关变化
if (sugUrlsToggle) {
    sugUrlsToggle.addEventListener('change', () => {
        saveSettings();
    });
}

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

document.addEventListener('contextmenu', (e) => {
    const target = e.target;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
    if (!isInput) {
        e.preventDefault();
    }
});

// 新增：便签按钮点击处理
if (allTextBtn) {
    allTextBtn.addEventListener('click', () => {
        // 检查信任环是否启用
        const isTrustRingEnabled = vilinkoConnectToggle ? vilinkoConnectToggle.checked : false;
        
        if (!isTrustRingEnabled) {
            // 如果未启用，显示弹窗
            if (trustModalOverlay) {
                trustModalOverlay.classList.add('active');
            }
        } else {
            // 如果已启用，执行原有的便签逻辑（仅做占位）
            console.log('Trust ring enabled, opening notes...');
            // TODO: 打开便签的具体逻辑
        }
    });
}

if (closeTrustModalBtn && trustModalOverlay) {
    closeTrustModalBtn.addEventListener('click', () => {
        trustModalOverlay.classList.remove('active');
    });
}

if (trustModalOverlay) {
    trustModalOverlay.addEventListener('click', (e) => {
        if (e.target === trustModalOverlay) {
            trustModalOverlay.classList.remove('active');
        }
    });
}

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

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchForm = document.getElementById('searchForm');
    const sugMenu = document.getElementById('sugMenu');

    if (!searchInput || !sugMenu) return;

    let activeSugIndex = -1; 

    // 检查是否为实验室协议链接
    function checkLabsProtocol(query) {
        const prefix = 'yuyupage://labs/';
        if (query.startsWith(prefix)) {
            const key = query.substring(prefix.length);
            // 区分大小写匹配
            if (labsConfig[key]) {
                window.open(labsConfig[key], '_blank');
                return true;
            }
        }
        return false;
    }

    searchInput.addEventListener('input', debounce(() => {
        const query = searchInput.value.trim();
        if (!query) {
            hideSugMenu();
            return;
        }
        
        // 如果是实验室协议，不显示搜索建议，直接等待回车处理
        if (checkLabsProtocol(query)) {
            hideSugMenu();
            return;
        }

        let customMenuResult = tryCalculate(query) || tryTimeCalculate(query) || tryTranslation(query);
        fetchBaiduSug(query, customMenuResult);
    }, 150)); 

    // 监听回车键，拦截实验室协议
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (checkLabsProtocol(query)) {
                e.preventDefault();
                searchInput.value = '';
                hideSugMenu();
                return;
            }
        }
    });

    function tryCalculate(str) {
        const cleanStr = str.replace(/\s+/g, '');
        const calcRegex = /^(-?\d+(\.\d+)?)([\+\-\*\/])(-?\d+(\.\d+)?)$/;
        const match = cleanStr.match(calcRegex);
        
        if (!match) return null;
        
        const num1 = parseFloat(match[1]);
        const op = match[3];
        const num2 = parseFloat(match[4]);
        let res = 0;
        
        switch (op) {
            case '+': res = num1 + num2; break;
            case '-': res = num1 - num2; break;
            case '*': res = num1 * num2; break;
            case '/': 
                if (num2 === 0) return { type: 'calc', text: '计算算式：除数不能为零', value: '' };
                res = num1 / num2; 
                break;
            default: return null;
        }
        
        if (!Number.isInteger(res)) {
            res = parseFloat(res.toFixed(8));
        }
        
        return { type: 'calc', text: `计算算式：${num1} ${op} ${num2} = ${res}`, value: res.toString() };
    }

    function tryTimeCalculate(str) {
        if (!str.toLowerCase().startsWith('totime')) return null;
        
        const dateStr = str.substring(6).trim();
        const dateRegex = /^(\d{4})[-/.]?(\d{2})[-/.]?(\d{2})$/;
        const match = dateStr.match(dateRegex);
        
        if (!match) return null;
        
        const targetDate = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00`);
        if (isNaN(targetDate.getTime())) return null;
        
        const nowDate = new Date();
        const currentDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
        
        const diffTime = targetDate.getTime() - currentDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        return { type: 'time', text: diffDays.toString(), value: diffDays.toString() };
    }

    function tryTranslation(str) {
        // 检测是否包含英文字符
        if (/[a-zA-Z]/.test(str)) {
            const encodedText = encodeURIComponent(str);
            const translationUrl = `https://www.bing.com/translator?from=auto&to=zh-Hans&text=${encodedText}`;
            return { type: 'translate', text: '快捷翻译', value: translationUrl };
        }
        return null;
    }

    function fetchBaiduSug(text, customMenuResult) {
        const url = `https://suggestion.baidu.com/su?wd=${encodeURIComponent(text)}&p=3&prod=pc&cb=`;
        
        fetch(url, { method: 'GET', mode: 'cors' })
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.arrayBuffer();
            })
            .then(buffer => {
                const decoder = new TextDecoder('gbk');
                const textData = decoder.decode(buffer);
                const startIdxValid = textData.indexOf('s:[');
                let sugArray = [];
                
                if (startIdxValid !== -1) {
                    const endIdx = textData.indexOf(']', startIdxValid);
                    if (endIdx !== -1) {
                        const arrStr = textData.substring(startIdxValid + 2, endIdx + 1);
                        const cleanArrStr = arrStr.replace(/'/g, '"');
                        sugArray = JSON.parse(cleanArrStr);
                    }
                }
                
                renderSugMenu(sugArray, customMenuResult);
            })
            .catch(err => {
                console.error(err);
                renderSugMenu([], customMenuResult);
            });
    }

    function renderSugMenu(list, customMenuResult) {
        sugMenu.innerHTML = '';
        activeSugIndex = -1;

        let hasContent = false;

        // 新增：检查输入是否匹配快捷网址配置（不区分大小写）
        // 只有在设置开启时才执行此逻辑
        const query = searchInput.value.trim();
        let matchedUrl = null;
        
        const isSugUrlsEnabled = sugUrlsToggle ? sugUrlsToggle.checked : true;

        if (isSugUrlsEnabled && query) {
            const lowerQuery = query.toLowerCase();
            for (const key in urlsConfig) {
                if (key.toLowerCase() === lowerQuery) {
                    matchedUrl = urlsConfig[key];
                    break;
                }
            }
        }

        if (matchedUrl) {
            const urlItem = document.createElement('div');
            urlItem.className = 'sug-item custom-tool-item';
            urlItem.setAttribute('data-value', matchedUrl);
            
            // 设置 Flex 布局以容纳右侧图标
            urlItem.style.display = 'flex';
            urlItem.style.justifyContent = 'space-between';
            urlItem.style.alignItems = 'center';
            urlItem.style.fontWeight = 'bold';
            urlItem.style.color = 'var(--input-focus-border)';
            
            if (searchInput.classList.contains('custom-font')) {
                urlItem.style.fontFamily = "'MinecraftFont', sans-serif";
            } else {
                urlItem.style.fontFamily = document.body.style.fontFamily;
            }
            
            // 创建文本span
            const textSpan = document.createElement('span');
            textSpan.textContent = matchedUrl;
            textSpan.style.overflow = 'hidden';
            textSpan.style.textOverflow = 'ellipsis';
            textSpan.style.whiteSpace = 'nowrap';
            
            // 创建外链图标
            const iconSpan = document.createElement('i');
            iconSpan.className = 'fa-solid fa-arrow-up-right-from-square';
            iconSpan.style.fontSize = '0.8em';
            iconSpan.style.opacity = '0.7';
            iconSpan.style.marginLeft = '8px';
            // 确保图标使用 FontAwesome 字体，不被全局字体覆盖
            iconSpan.style.fontFamily = "'Font Awesome 6 Free', 'Font Awesome 6 Brands', sans-serif"; 

            urlItem.appendChild(textSpan);
            urlItem.appendChild(iconSpan);
            
            urlItem.addEventListener('click', () => {
                window.open(matchedUrl, '_blank');
                hideSugMenu();
            });
            
            sugMenu.appendChild(urlItem);
            hasContent = true;
        }

        if (customMenuResult) {
            const customItem = document.createElement('div');
            customItem.className = 'sug-item custom-tool-item';
            customItem.setAttribute('data-value', customMenuResult.value);
            
            if (customMenuResult.type === 'calc') {
                customItem.style.fontWeight = 'bold';
                customItem.style.color = 'var(--input-focus-border)';
            } else if (customMenuResult.type === 'time') {
                customItem.style.fontWeight = 'bold';
                customItem.style.color = 'var(--input-focus-border)'; 
            } else if (customMenuResult.type === 'translate') {
                customItem.style.fontWeight = 'bold';
                customItem.style.color = 'var(--input-focus-border)';
            }
            
            if (searchInput.classList.contains('custom-font')) {
                customItem.style.fontFamily = "'MinecraftFont', sans-serif";
            } else {
                customItem.style.fontFamily = document.body.style.fontFamily;
            }
            
            customItem.textContent = customMenuResult.text;
            
            // 将事件处理完全移至 JavaScript 中，避免使用 HTML 属性
            customItem.addEventListener('click', () => {
                if (customMenuResult.type === 'translate') {
                    window.open(customMenuResult.value, '_blank');
                    hideSugMenu();
                } else {
                    searchInput.value = customMenuResult.value;
                    hideSugMenu();
                }
            });
            
            sugMenu.appendChild(customItem);
            hasContent = true;
        }

        const displayList = list.slice(0, 10); 
        if (displayList.length > 0) {
            hasContent = true;
            displayList.forEach((itemText) => {
                const item = document.createElement('div');
                item.className = 'sug-item';
                
                if (searchInput.classList.contains('custom-font')) {
                    item.style.fontFamily = "'MinecraftFont', sans-serif";
                } else {
                    item.style.fontFamily = document.body.style.fontFamily;
                }
                item.textContent = itemText;

                item.addEventListener('click', () => {
                    searchInput.value = itemText;
                    hideSugMenu();
                    searchForm.submit(); 
                });

                sugMenu.appendChild(item);
            });
        }

        if (hasContent) {
            sugMenu.style.display = 'block';
        } else {
            sugMenu.style.display = 'none';
        }
    }

    function hideSugMenu() {
        sugMenu.style.display = 'none';
        sugMenu.innerHTML = '';
        activeSugIndex = -1;
    }

    searchInput.addEventListener('keydown', (e) => {
        const items = sugMenu.querySelectorAll('.sug-item');
        if (sugMenu.style.display !== 'block' || items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeSugIndex = (activeSugIndex + 1) % items.length;
            updateSugSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeSugIndex = (activeSugIndex - 1 + items.length) % items.length;
            updateSugSelection(items);
        } else if (e.key === 'Enter' && activeSugIndex >= 0) {
            e.preventDefault();
            items[activeSugIndex].click(); 
        } else if (e.key === 'Escape') {
            hideSugMenu();
        }
    });

    function updateSugSelection(items) {
        items.forEach((item, index) => {
            if (index === activeSugIndex) {
                item.classList.add('active');
                if (item.classList.contains('custom-tool-item')) {
                    searchInput.value = item.getAttribute('data-value');
                } else {
                    searchInput.value = item.textContent; 
                }
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('active');
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (!searchForm.contains(e.target) && !sugMenu.contains(e.target)) {
            hideSugMenu();
        }
    });

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
});

function applyNoteBtnVisibility(enabled) {
    const allTextBtn = document.getElementById('alltext');
    if (allTextBtn) {
        if (enabled) {
            allTextBtn.style.display = 'block'; // 或者 flex，取决于原有样式，这里假设 block 或继承
            allTextBtn.style.visibility = 'visible';
            allTextBtn.style.opacity = '0.7'; // 恢复默认透明度
        } else {
            allTextBtn.style.display = 'none';
        }
    }
}

// 更新依赖信任环的控件状态
function updateTrustRingDependentControls(isTrustRingEnabled) {
    const isDisabled = !isTrustRingEnabled;
    
    if (noteBtnToggle) {
        noteBtnToggle.disabled = isDisabled;
    }
    if (noteBtnGroup) {
        if (isDisabled) {
            noteBtnGroup.classList.add('setting-disabled');
        } else {
            noteBtnGroup.classList.remove('setting-disabled');
        }
    }

    if (noteAppSelect) {
        noteAppSelect.disabled = isDisabled;
    }
    if (noteAppGroup) {
        if (isDisabled) {
            noteAppGroup.classList.add('setting-disabled');
        } else {
            noteAppGroup.classList.remove('setting-disabled');
        }
    }
}

// 新增：应用 Bing 壁纸功能
function applyBingWallpaper(enabled) {
    const bgElement = document.getElementById('bing-bg');
    const timeDisplay = document.getElementById('timeDisplay');
    const searchInput = document.getElementById('searchInput');
    const poetryBox = document.getElementById('poetryBox');
    const poetryContent = document.getElementById('poetry-content'); // 获取诗词内容元素
    const poetryAuthor = document.getElementById('poetry-author');   // 获取诗词作者元素
    const pageFooter = document.getElementById('pageFooter');
    const weatherWidget = document.getElementById('weatherWidget');
    const allTextBtn = document.getElementById('alltext');
    const openSettingsBtn = document.getElementById('openSettingsBtn');
    const sugMenu = document.getElementById('sugMenu');

    if (enabled) {
        // 显示背景层并获取壁纸
        bgElement.style.display = 'block';
        fetchBingWallpaper();

        // 时间显示：移除模糊背景，改为文字阴影
        if (timeDisplay) {
            // 清除之前的模糊背景样式
            timeDisplay.style.backgroundColor = '';
            timeDisplay.style.backdropFilter = '';
            timeDisplay.style.WebkitBackdropFilter = '';
            timeDisplay.style.borderRadius = '';
            timeDisplay.style.padding = '';
            timeDisplay.style.boxShadow = '';
            
            // 添加文字阴影以提高对比度
            timeDisplay.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.5)';
            timeDisplay.style.color = '#fff'; // 确保文字为白色
        }
        
        // 搜索框：变为高斯模糊背景并关闭深浅变换（固定背景色）
        if (searchInput) {
            searchInput.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
            searchInput.style.backdropFilter = 'blur(15px)';
            searchInput.style.WebkitBackdropFilter = 'blur(15px)';
            searchInput.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            searchInput.style.color = '#fff'; // 强制白色文字以确保对比度
            searchInput.style.setProperty('--input-text', '#fff');
            
            // 动态注入样式以修改 placeholder 颜色
            let styleId = 'bing-wallpaper-placeholder-style';
            let styleEl = document.getElementById(styleId);
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = styleId;
                document.head.appendChild(styleEl);
            }
            styleEl.textContent = `
                #searchInput::placeholder {
                    color: rgba(255, 255, 255, 0.8) !important;
                    opacity: 1; /* Firefox */
                }
            `;

            // 移除 hover/focus 的默认背景变化，保持模糊感
            searchInput.onfocus = function() { this.style.backgroundColor = 'rgba(255, 255, 255, 0.35)'; };
            searchInput.onblur = function() { this.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'; };
        }

        // 诗词：仅对文字部分应用模糊背景
        if (poetryBox) {
            // 彻底清除父容器的背景样式，确保只有文字有背景
            poetryBox.style.backgroundColor = 'transparent';
            poetryBox.style.backdropFilter = 'none';
            poetryBox.style.WebkitBackdropFilter = 'none';
            poetryBox.style.borderRadius = '0';
            poetryBox.style.padding = '0 20px'; // 保持原有的左右内边距以维持布局宽度，但上下由内部元素控制
            poetryBox.style.boxShadow = 'none';
            
            // 定义文字部分的模糊样式
            const poetryBlurStyle = {
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)',
                borderRadius: '8px',
                padding: '4px 10px',
                color: '#fff',
                display: 'inline-block', // 确保背景只包裹文字
                margin: '0 4px' // 保持原有的间距
            };

            if (poetryContent) Object.assign(poetryContent.style, poetryBlurStyle);
        }

        // 页脚
        if (pageFooter) {
            // 修复：遵循页脚显示开关状态
            if (footerToggle && !footerToggle.checked) {
                pageFooter.style.opacity = "0";
                pageFooter.style.visibility = "hidden";
            } else {
                pageFooter.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                pageFooter.style.backdropFilter = 'blur(5px)';
                pageFooter.style.WebkitBackdropFilter = 'blur(5px)';
                pageFooter.style.borderRadius = '8px';
                pageFooter.style.padding = '5px 10px';
                pageFooter.style.width = 'auto';
                pageFooter.style.left = '50%';
                pageFooter.style.transform = 'translateX(-50%)';
                pageFooter.style.color = '#fff';
                pageFooter.style.opacity = "0.6";
                pageFooter.style.visibility = "visible";
            }
        }

        // 优化：天气组件移除背景模糊，改为文字阴影
        if (weatherWidget) {
            weatherWidget.style.backgroundColor = 'transparent';
            weatherWidget.style.backdropFilter = 'none';
            weatherWidget.style.WebkitBackdropFilter = 'none';
            weatherWidget.style.borderRadius = '0';
            weatherWidget.style.padding = '0';
            
            const icon = weatherWidget.querySelector('i');
            const text = weatherWidget.querySelector('span');
            
            if (icon) {
                icon.style.textShadow = '0 1px 3px rgba(0, 0, 0, 0.5)';
                icon.style.color = '#fff';
            }
            if (text) {
                text.style.textShadow = '0 1px 3px rgba(0, 0, 0, 0.5)';
                text.style.color = '#fff';
            }
        }

        if (allTextBtn) {
            allTextBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            allTextBtn.style.backdropFilter = 'blur(10px)';
            allTextBtn.style.WebkitBackdropFilter = 'blur(10px)';
            allTextBtn.style.borderRadius = '50%';
            allTextBtn.style.padding = '8px';
            allTextBtn.style.color = '#fff';
        }
        if (openSettingsBtn) {
            openSettingsBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            openSettingsBtn.style.backdropFilter = 'blur(10px)';
            openSettingsBtn.style.WebkitBackdropFilter = 'blur(10px)';
            openSettingsBtn.style.borderRadius = '50%';
            openSettingsBtn.style.padding = '8px';
            openSettingsBtn.style.color = '#fff';
        }

        // 联想词菜单：高斯模糊背景并关闭深浅变换
        if (sugMenu) {
            sugMenu.style.backgroundColor = 'rgba(30, 30, 30, 0.6)'; // 深色半透明背景
            sugMenu.style.backdropFilter = 'blur(15px)';
            sugMenu.style.WebkitBackdropFilter = 'blur(15px)';
            sugMenu.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            // 强制子元素文字颜色为白色
            const items = sugMenu.querySelectorAll('.sug-item');
            items.forEach(item => item.style.color = '#fff');
        }

    } else {
        // 禁用壁纸，恢复默认样式
        bgElement.style.display = 'none';
        bgElement.style.backgroundImage = '';

        // 清除内联样式以恢复 CSS 变量控制
        if (timeDisplay) {
            timeDisplay.style.cssText = '';
        }
        if (searchInput) {
            searchInput.style.cssText = '';
            searchInput.onfocus = null;
            searchInput.onblur = null;
        }
        
        // 移除动态注入的 placeholder 样式
        let styleEl = document.getElementById('bing-wallpaper-placeholder-style');
        if (styleEl) {
            styleEl.remove();
        }

        if (poetryBox) poetryBox.style.cssText = '';
        // 新增：清除诗词文字部分的内联样式
        if (poetryContent) poetryContent.style.cssText = '';
        if (poetryAuthor) poetryAuthor.style.cssText = '';
        
        if (pageFooter) {
            pageFooter.style.cssText = '';
            pageFooter.style.width = '100%';
            pageFooter.style.left = '0';
            pageFooter.style.transform = 'none';
            // 修复：恢复页脚开关控制的状态
            applyFooter(footerToggle ? footerToggle.checked : true);
        }
        if (weatherWidget) weatherWidget.style.cssText = '';
        if (allTextBtn) allTextBtn.style.cssText = '';
        if (openSettingsBtn) openSettingsBtn.style.cssText = '';
        if (sugMenu) {
            sugMenu.style.cssText = '';
            // 恢复后可能需要重新渲染一次菜单以应用正确颜色，或者依靠 CSS 默认值
        }
    }
}

// 新增：获取 Bing 壁纸
async function fetchBingWallpaper() {
    const bgElement = document.getElementById('bing-bg');
    try {
        const response = await fetch('https://bing.shangzhenyang.com/api/1080p');
        if (response.ok) {
            const imageUrl = response.url; // API 可能会重定向到图片地址
            bgElement.style.backgroundImage = `url('${imageUrl}')`;
        }
    } catch (error) {
        console.error('Failed to fetch Bing wallpaper:', error);
    }
}

// 新增：监听 Bing 壁纸开关变化
if (bingWallpaperToggle) {
    bingWallpaperToggle.addEventListener('change', (e) => {
        applyBingWallpaper(e.target.checked);
        saveSettings();
    });
}
