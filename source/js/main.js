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
    language: 'zh-CN'
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

let translations = {}; // 存储翻译数据

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
        language: languageSelect ? languageSelect.value : 'zh-CN'
    };

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set(settings);
    } else {
        console.warn('chrome.storage.local is not available');
    }
}

async function loadTranslations() {
    try {
        const response = await fetch('./source/txt/words.json');
        translations = await response.json();
    } catch (error) {
        console.error('Failed to load translations:', error);
        translations = {};
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

    // 更新文档标题
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
            console.error("Failed to read from chrome.storage", e);
        }
    }

    // 加载翻译数据
    await loadTranslations();

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
            // 如果已启用，执行原有的便签逻辑（此处假设原有逻辑在其他地方或暂无具体实现，仅做占位）
            console.log('Trust ring enabled, opening notes...');
            // TODO: 添加打开便签的具体逻辑
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

    searchInput.addEventListener('input', debounce(() => {
        const query = searchInput.value.trim();
        if (!query) {
            hideSugMenu();
            return;
        }
        
        let customMenuResult = tryCalculate(query) || tryTimeCalculate(query) || tryTranslation(query);
        fetchBaiduSug(query, customMenuResult);
    }, 150)); 

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

        if (customMenuResult) {
            const customItem = document.createElement('div');
            customItem.className = 'sug-item custom-tool-item';
            customItem.setAttribute('data-value', customMenuResult.value);
            
            if (customMenuResult.type === 'calc') {
                customItem.style.fontWeight = 'bold';
                customItem.style.color = 'var(--input-focus-border)';
            } else if (customMenuResult.type === 'time') {
                customItem.style.fontWeight = 'bold';
                customItem.style.color = '#5279FB'; 
            } else if (customMenuResult.type === 'translate') {
                customItem.style.fontWeight = 'bold';
                customItem.style.color = '#5279FB';
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
