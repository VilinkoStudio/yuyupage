const WEATHER_API_KEY = "9d703463f9f67ab79617c7f5fde1fe73";

let is24Hour = true;

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
    showSuggestion: true // 新增：默认开启联想
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
const fontSelect = document.getElementById('fontSelect'); 
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
const suggestionToggle = document.getElementById('suggestionToggle'); // 新增：获取联想开关元素

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
        showSuggestion: suggestionToggle.checked // 新增：保存联想开关状态
    };

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set(settings);
    } else {
        console.warn('chrome.storage.local is not available');
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
            console.error("Failed to read from chrome.storage", e);
        }
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

    suggestionToggle.checked = settings.showSuggestion; // 新增：加载联想开关状态

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
    const minecraftFontStack = "'MinecraftFont', 'Google Sans', 'Product Sans', 'Helvetica Neue', Arial, sans-serif";
    const harmonyosFontStack = "'HarmonyOS Sans', 'HarmonyOS Sans SC', 'Microsoft YaHei', sans-serif";
    const misansFontStack = "'MiSans', 'MiSans Latin', 'HarmonyOS Sans', 'Microsoft YaHei', sans-serif";

    let targetFontStack = minecraftFontStack;

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
        targetFontStack = harmonyosFontStack;
    } else if (fontType === 'misans') {
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: 'MiSans';
                src: url('./source/misans.ttf') format('truetype');
                font-display: swap;
            }
        `;
        document.head.appendChild(style);
        targetFontStack = misansFontStack;
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

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchForm = document.getElementById('searchForm');
    const sugMenu = document.getElementById('sugMenu');

    if (!searchInput || !sugMenu) return;

    let activeSugIndex = -1; 

    // 新增：检查联想功能是否开启
    function isSuggestionEnabled() {
        return suggestionToggle ? suggestionToggle.checked : true;
    }

    searchInput.addEventListener('input', debounce(() => {
        // 新增：如果联想功能关闭，直接隐藏菜单并返回
        if (!isSuggestionEnabled()) {
            hideSugMenu();
            return;
        }
        const query = searchInput.value.trim();
        if (!query) {
            hideSugMenu();
            return;
        }
        fetchBaiduSug(query);
    }, 150)); 

    function fetchBaiduSug(text) {
        const url = `https://suggestion.baidu.com/su?wd=${encodeURIComponent(text)}&p=3&prod=pc&cb=`;
        
        fetch(url, { method: 'GET', mode: 'cors' })
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.arrayBuffer();
            })
            .then(buffer => {
                const decoder = new TextDecoder('gbk');
                const textData = decoder.decode(buffer);
                const startIdx = textData.indexOf('s:[]');
                const startIdxValid = textData.indexOf('s:[');
                if (startIdxValid !== -1) {
                    const endIdx = textData.indexOf(']', startIdxValid);
                    if (endIdx !== -1) {
                        const arrStr = textData.substring(startIdxValid + 2, endIdx + 1);
                        const cleanArrStr = arrStr.replace(/'/g, '"');
                        const sugArray = JSON.parse(cleanArrStr);
                        renderSugMenu(sugArray);
                        return;
                    }
                }
                hideSugMenu();
            })
            .catch(err => {
                console.error(err);
                hideSugMenu();
            });
    }

    function renderSugMenu(list) {
        const displayList = list.slice(0, 10); 

        if (displayList.length === 0) {
            hideSugMenu();
            return;
        }
        
        sugMenu.innerHTML = '';
        activeSugIndex = -1;

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

        sugMenu.style.display = 'block';
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
                searchInput.value = item.textContent; 
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

// 新增：监听联想开关变化并保存设置
if (suggestionToggle) {
    suggestionToggle.addEventListener('change', () => {
        saveSettings();
        // 如果关闭开关，立即隐藏联想菜单
        if (!suggestionToggle.checked) {
            const sugMenu = document.getElementById('sugMenu');
            if (sugMenu) sugMenu.style.display = 'none';
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
