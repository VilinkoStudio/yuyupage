// WebDAV 服务封装：固定使用坚果云 Dav 服务，负责连接校验与设置同步
// 通过 background service worker 转发请求，规避 Manifest V3 下 newtab 页面
// 直接访问第三方域名时的 CORS / 权限限制。

// 固定服务商地址（坚果云 Dav），不允许用户修改
const WEBDAV_FIXED_BASE = 'https://dav.jianguoyun.com/dav/';
// 远程设置文件路径（置于子目录中，避免直接写入 Dav 根目录被服务端拒绝）
const WEBDAV_SETTINGS_FILE = 'YuyuPage/yuyupage-settings.json';

// 通过 background 转发请求，支持超时控制
async function webdavRequest(config, options) {
    const { url, username, password } = config;
    const timeoutMs = options && options.timeout ? options.timeout : 20000;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await chrome.runtime.sendMessage({
            action: 'webdavRequest',
            url,
            method: options.method || 'PROPFIND',
            username,
            password,
            headers: options.headers || {},
            body: options.body || '',
            timeout: timeoutMs
        });

        return response; // { ok, status, statusText, data, error, code }
    } catch (e) {
        return { ok: false, status: 0, error: (e && e.message) || '请求异常', code: 'EXCEPTION' };
    } finally {
        clearTimeout(timer);
    }
}

// 构造设置文件的完整 URL（固定服务商，忽略用户名）
function getSettingsFileUrl() {
    return WEBDAV_FIXED_BASE + WEBDAV_SETTINGS_FILE;
}

// 校验账号信息（地址固定，仅需校验账号与密码）
function validateWebdavConfig(config) {
    const errors = {};
    if (!config.username) errors.username = '账号不能为空';
    if (!config.password) errors.password = '授权密码不能为空';
    return errors;
}

// 验证 WebDAV 连接是否可用（固定地址）
// 成功返回 { ok: true }
// 失败返回 { ok: false, error, code }
async function verifyWebdavConnection(config) {
    const reqConfig = {
        url: WEBDAV_FIXED_BASE,
        username: (config.username || '').trim(),
        password: config.password || ''
    };

    const errors = validateWebdavConfig(reqConfig);
    if (Object.keys(errors).length > 0) {
        return { ok: false, error: Object.values(errors).join('；'), code: 'INVALID' };
    }

    try {
        // 优先 OPTIONS 探测，失败回退 PROPFIND
        let resp = await webdavRequest(reqConfig, {
            method: 'OPTIONS',
            headers: { 'Depth': '0' }
        });

        if (resp && resp.ok) {
            return { ok: true };
        }

        resp = await webdavRequest(reqConfig, {
            method: 'PROPFIND',
            headers: { 'Depth': '0' },
            body: '<?xml version="1.0" encoding="utf-8"?><propfind xmlns="DAV:"><prop><current-user-principal/></prop></propfind>'
        });

        if (resp && resp.ok) {
            return { ok: true };
        }

        if (resp && (resp.status === 401 || resp.status === 403)) {
            return { ok: false, error: '授权失败：账号或密码错误', code: 'UNAUTHORIZED' };
        }
        if (resp && resp.status === 404) {
            return { ok: false, error: '地址无法访问（404），请检查 WebDAV 根路径', code: 'NOT_FOUND' };
        }
        if (resp && resp.status === 0) {
            return { ok: false, error: '无法连接服务器：网络错误或跨域被拦截', code: 'NETWORK' };
        }
        return {
            ok: false,
            error: (resp && (resp.error || resp.statusText)) || '验证失败',
            code: (resp && resp.code) || 'FAILED'
        };
    } catch (e) {
        return { ok: false, error: '请求异常：' + (e && e.message ? e.message : e), code: 'EXCEPTION' };
    }
}

// 确保父目录存在（MKCOL 创建文件夹，已存在则忽略）
async function ensureParentDir(config) {
    const fileUrl = getSettingsFileUrl();
    // 取文件 URL 的父目录（去掉末尾文件名）
    const parentUrl = fileUrl.slice(0, fileUrl.lastIndexOf('/', fileUrl.length - 2) + 1);
    const reqConfig = {
        url: parentUrl,
        username: (config.username || '').trim(),
        password: config.password || ''
    };
    const resp = await webdavRequest(reqConfig, { method: 'MKCOL' });
    // 201 创建成功，405/409 表示已存在（视为成功）
    if (resp && (resp.ok || resp.status === 405 || resp.status === 409)) {
        return { ok: true };
    }
    return { ok: false, error: (resp && resp.error) || '创建目录失败', code: 'MKDIR_FAILED' };
}

// 上传设置 JSON 到 WebDAV
async function uploadSettings(config, settingsJson) {
    const reqConfig = {
        url: getSettingsFileUrl(),
        username: (config.username || '').trim(),
        password: config.password || ''
    };

    const errors = validateWebdavConfig(reqConfig);
    if (Object.keys(errors).length > 0) {
        return { ok: false, error: Object.values(errors).join('；'), code: 'INVALID' };
    }

    // 先确保父目录存在
    const dirReady = await ensureParentDir(reqConfig);
    if (!dirReady.ok) {
        return dirReady;
    }

    try {
        const resp = await webdavRequest(reqConfig, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: settingsJson
        });

        if (resp && resp.ok) {
            return { ok: true };
        }
        if (resp && (resp.status === 401 || resp.status === 403)) {
            return { ok: false, error: '授权失败：账号或密码错误', code: 'UNAUTHORIZED' };
        }
        if (resp && resp.status === 0) {
            return { ok: false, error: '无法连接服务器：网络错误或跨域被拦截', code: 'NETWORK' };
        }
        return {
            ok: false,
            error: (resp && (resp.error || resp.statusText)) || '上传失败',
            code: (resp && resp.code) || 'UPLOAD_FAILED'
        };
    } catch (e) {
        return { ok: false, error: '上传异常：' + (e && e.message ? e.message : e), code: 'EXCEPTION' };
    }
}

// 从 WebDAV 下载设置 JSON
async function downloadSettings(config) {
    const reqConfig = {
        url: getSettingsFileUrl(),
        username: (config.username || '').trim(),
        password: config.password || ''
    };

    const errors = validateWebdavConfig(reqConfig);
    if (Object.keys(errors).length > 0) {
        return { ok: false, error: Object.values(errors).join('；'), code: 'INVALID' };
    }

    try {
        const resp = await webdavRequest(reqConfig, {
            method: 'GET'
        });

        if (resp && resp.ok) {
            return { ok: true, data: resp.data || '' };
        }
        if (resp && resp.status === 404) {
            return { ok: false, error: '云端暂无设置文件，请先同步上传', code: 'NOT_FOUND' };
        }
        if (resp && (resp.status === 401 || resp.status === 403)) {
            return { ok: false, error: '授权失败：账号或密码错误', code: 'UNAUTHORIZED' };
        }
        if (resp && resp.status === 0) {
            return { ok: false, error: '无法连接服务器：网络错误或跨域被拦截', code: 'NETWORK' };
        }
        return {
            ok: false,
            error: (resp && (resp.error || resp.statusText)) || '下载失败',
            code: (resp && resp.code) || 'DOWNLOAD_FAILED'
        };
    } catch (e) {
        return { ok: false, error: '下载异常：' + (e && e.message ? e.message : e), code: 'EXCEPTION' };
    }
}

// 暴露到全局
window.WebDavService = {
    WEBDAV_FIXED_BASE,
    WEBDAV_SETTINGS_FILE,
    verifyWebdavConnection,
    uploadSettings,
    downloadSettings,
    validateWebdavConfig
};
