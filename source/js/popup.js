document.addEventListener('DOMContentLoaded', function() {
  // 从 manifest 读取版本与类型信息
  const manifest = chrome.runtime.getManifest();
  document.getElementById('manifestVersion').textContent = manifest.version;
  document.getElementById('manifestInfo').textContent = manifest.info;

  document.getElementById('qqChannel').addEventListener('click', function() {
    chrome.tabs.create({ 
      url: 'https://pd.qq.com/s/5twwx7ht2'
    });
  });

  document.getElementById('submitIssue').addEventListener('click', function() {
    chrome.tabs.create({ 
      url: 'https://github.com/VilinkoStudio/yuyupage/issues'
    });
  });

  const updateBtn = document.getElementById('checkUpdate');
  const UPDATE_URL = 'https://yuyupage.vilinko.com/update/extension_version.json';
  const ORIGINAL_TEXT = '检查更新';
  let newVersion = null; // { type: 'extension' | 'github', value: string }

  // 比较版本号，支持 "1.0.9" 格式；a > b 返回 1，a < b 返回 -1，相等返回 0
  function compareVersions(a, b) {
    const pa = String(a).split('.').map(function(n) { return parseInt(n, 10) || 0; });
    const pb = String(b).split('.').map(function(n) { return parseInt(n, 10) || 0; });
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
      const na = pa[i] || 0;
      const nb = pb[i] || 0;
      if (na > nb) return 1;
      if (na < nb) return -1;
    }
    return 0;
  }

  // 临时显示文本后恢复原文
  function showTemporary(text, ms) {
    updateBtn.textContent = text;
    setTimeout(function() {
      updateBtn.textContent = ORIGINAL_TEXT;
    }, ms);
  }

  updateBtn.addEventListener('click', function() {
    // 已发现新版本：点击跳转下载/发布页并复位
    if (newVersion) {
      const url = newVersion.type === 'extension'
        ? 'https://raw.githubusercontent.com/VilinkoStudio/yuyupage/refs/heads/crx/' + newVersion.value + '.zip'
        : 'https://github.com/VilinkoStudio/yuyupage/releases/tag/' + newVersion.value;
      chrome.tabs.create({ url: url });
      newVersion = null;
      updateBtn.textContent = ORIGINAL_TEXT;
      return;
    }

    if (updateBtn.classList.contains('checking')) {
      return;
    }

    updateBtn.classList.add('checking');
    updateBtn.textContent = '检查中...';

    // 从 manifest 获取当前版本与 info 类型
    const manifest = chrome.runtime.getManifest();
    const currentVersion = manifest.version;
    const infoType = manifest.info;

    fetch(UPDATE_URL)
      .then(function(res) {
        if (!res.ok) {
          throw new Error('HTTP ' + res.status);
        }
        return res.json();
      })
      .then(function(data) {
        if (infoType === 'Extension') {
          const onlineVersion = data.ExtensionVerInfo;
          if (compareVersions(onlineVersion, currentVersion) > 0) {
            newVersion = { type: 'extension', value: data.ExtensionVersion };
          }
        } else if (infoType === 'Github') {
          const onlineVersion = data.GithubVersionInfo;
          if (compareVersions(onlineVersion, currentVersion) > 0) {
            newVersion = { type: 'github', value: data.GithubVersionInfo };
          }
        }

        if (newVersion) {
          updateBtn.textContent = '发现新版本';
        } else {
          showTemporary('已是最新', 5000);
        }
      })
      .catch(function() {
        showTemporary('检查失败', 3000);
      })
      .finally(function() {
        updateBtn.classList.remove('checking');
      });
  });
});
