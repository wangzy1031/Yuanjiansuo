// 1. 核心配置（【2种方案可选】解决 GitHub 访问问题）
const CONFIG = {
  // 方案1：新版 GitHub 原始文件链接（推荐优先尝试，注意仓库必须是「公开」的！）
  // 格式：https://github.com/用户名/仓库名/raw/分支名/文件路径
  githubJsonUrl: "https://gitee.com/wangzy1031/yuanjs/raw/master/data.json",
  // 方案2：本地备用数据（当 GitHub 链接失效时自动启用，避免页面空白）
  localBackupData: [
    {
      "type": "software",
      "name": "Google Chrome",
      "url": "https://www.google.com/chrome/",
      "intro": "快速、安全的跨平台浏览器，支持多标签页和扩展插件"
    },
    {
      "type": "software",
      "name": "Visual Studio Code",
      "url": "https://code.visualstudio.com/",
      "intro": "免费开源的代码编辑器，支持语法高亮和多语言开发"
    },
    {
      "type": "tool",
      "name": "Canva 可画",
      "url": "https://www.canva.com/zh_cn/",
      "intro": "在线设计工具，提供海报、PPT等模板，拖拽即可制作"
    },
    {
      "type": "tool",
      "name": "Notion",
      "url": "https://www.notion.so/zh-cn/",
      "intro": "多功能笔记工具，支持文档、表格和团队协作"
    }
  ],
  defaultCategory: "software", // 默认显示分类
  itemsPerPage: 20
};

// 2. 全局状态管理
const APP_STATE = {
  currentCategory: CONFIG.defaultCategory,
  isLoading: false,
  allData: [] // 最终使用的数据（GitHub 加载成功则用 GitHub 数据，否则用本地备用数据）
};

// 3. DOM 元素缓存
const DOM = {
  categoryBtns: document.querySelectorAll(".menu-btn"),
  searchInput: document.getElementById("search-input"),
  searchBtn: document.getElementById("search-btn"),
  contentArea: document.getElementById("content-area"),
  aboutBtn: document.getElementById("about-btn"),
  aboutPanel: document.getElementById("about-panel")
};

// 4. 页面初始化
document.addEventListener("DOMContentLoaded", () => {
  bindEventListeners();
  activateCategoryBtn(APP_STATE.currentCategory);
  updateSearchPlaceholder();
  // 优先加载 GitHub 数据，失败则用本地备用数据
  loadDataWithFallback();
});

// 5. 绑定所有交互事件（逻辑不变，保留原功能）
function bindEventListeners() {
  // 分类切换
  DOM.categoryBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetCategory = btn.dataset.type;
      if (targetCategory === APP_STATE.currentCategory) return;

      APP_STATE.currentCategory = targetCategory;
      activateCategoryBtn(targetCategory);
      DOM.searchInput.value = "";
      updateSearchPlaceholder();
      renderFilteredData(targetCategory);
    });
  });

  // 搜索按钮
  DOM.searchBtn.addEventListener("click", () => {
    const keyword = DOM.searchInput.value.trim();
    keyword ? searchData(keyword) : renderFilteredData(APP_STATE.currentCategory);
  });

  // 回车键搜索
  DOM.searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") DOM.searchBtn.click();
  });

  // 关于面板
  DOM.aboutBtn.addEventListener("click", () => {
    DOM.aboutPanel.classList.toggle("hidden");
  });
}

// 6. 【核心修复】带备用方案的数据加载（GitHub 失败则用本地数据）
function loadDataWithFallback() {
  if (APP_STATE.isLoading) return;
  APP_STATE.isLoading = true;
  showLoading("正在加载数据...");

  // 第一步：尝试加载 GitHub 数据
  fetch(CONFIG.githubJsonUrl, {
    // 新增请求头，适配新版 GitHub 跨域规则
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    },
    mode: "cors" // 允许跨域请求
  })
  .then(response => {
    // 处理 GitHub 可能返回的 HTML 页面（链接错误时会返回 200，但内容是 HTML）
    const isJsonResponse = response.headers.get("content-type")?.includes("application/json");
    if (!response.ok || !isJsonResponse) {
      throw new Error(`GitHub 数据加载失败（链接可能无效或返回非 JSON 内容）`);
    }
    return response.json();
  })
  .then(githubData => {
    // 验证 GitHub 数据格式
    if (Array.isArray(githubData) && githubData.length > 0) {
      APP_STATE.allData = filterValidData(githubData);
      showSuccess("已加载 GitHub 数据");
    } else {
      throw new Error("GitHub 数据为空或格式错误，启用本地备用数据");
    }
  })
  .catch(error => {
    // 第二步：GitHub 加载失败，启用本地备用数据
    console.warn("GitHub 数据加载异常：", error);
    APP_STATE.allData = filterValidData(CONFIG.localBackupData);
    showWarning("GitHub 数据加载失败，已启用本地备用数据");
  })
  .finally(() => {
    APP_STATE.isLoading = false;
    // 无论用哪种数据，都渲染默认分类内容
    renderFilteredData(APP_STATE.currentCategory);
  });
}

// 7. 筛选有效数据（确保每条数据都有必要字段）
function filterValidData(rawData) {
  return rawData.filter(item => {
    // 必须包含 type（software/tool）、name、url、intro 四个字段
    const hasRequiredFields = !!item.type && !!item.name && !!item.url && !!item.intro;
    const isValidType = item.type.toLowerCase() === "software" || item.type.toLowerCase() === "tool";
    if (!hasRequiredFields || !isValidType) {
      console.warn("跳过无效数据：", item);
    }
    return hasRequiredFields && isValidType;
  });
}

// 8. 分类筛选渲染（逻辑不变）
function renderFilteredData(category) {
  const filteredData = APP_STATE.allData.filter(item => 
    item.type.toLowerCase() === category.toLowerCase()
  );

  if (filteredData.length === 0) {
    showError(`当前「${category === "software" ? "软件" : "工具"}」分类暂无数据`);
    return;
  }

  renderContentCards(filteredData);
}

// 9. 搜索功能（逻辑不变，支持关键词高亮）
function searchData(keyword) {
  const searchResult = APP_STATE.allData.filter(item => {
    const matchesCategory = item.type.toLowerCase() === APP_STATE.currentCategory.toLowerCase();
    const matchesKeyword = item.name.toLowerCase().includes(keyword.toLowerCase()) 
      || item.intro.toLowerCase().includes(keyword.toLowerCase());
    return matchesCategory && matchesKeyword;
  });

  if (searchResult.length === 0) {
    showError(`未找到包含「${keyword}」的${APP_STATE.currentCategory === "software" ? "软件" : "工具"}`);
    return;
  }

  renderContentCards(searchResult);
}

// 10. 渲染内容卡片（逻辑不变）
function renderContentCards(items) {
  let cardHtml = "";
  const displayItems = items.slice(0, CONFIG.itemsPerPage);

  displayItems.forEach(item => {
    const isUrlValid = item.url.startsWith("http");
    const keyword = DOM.searchInput.value.trim().toLowerCase();
    const highlightedName = highlightKeyword(item.name, keyword);
    const highlightedIntro = highlightKeyword(item.intro, keyword);

    cardHtml += `
      <div class="item-card">
        <h3>${highlightedName}</h3>
        <p class="intro">${highlightedIntro}</p>
        <a 
          href="${isUrlValid ? item.url : '#'}" 
          target="_blank" 
          class="link-btn"
          ${!isUrlValid ? 'onclick="event.preventDefault(); alert(\'链接无效\')"' : ''}
        >
          前往官网
        </a>
      </div>
    `;
  });

  DOM.contentArea.innerHTML = cardHtml;
}

// 11. 辅助函数：关键词高亮
function highlightKeyword(text, keyword) {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword})`, "gi");
  return text.replace(regex, '<span style="color:#2e7d32; font-weight:600;">$1</span>');
}

// 12. 状态提示函数（新增：区分成功/警告/错误，更易排查问题）
function showLoading(msg) {
  DOM.contentArea.innerHTML = `
    <div class="loading" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6c757d; font-size: 18px;">
      ${msg}
    </div>
  `;
}

function showSuccess(msg) {
  console.log(`✅ ${msg}`);
  // 可选：在页面顶部显示短暂成功提示（不影响内容）
  const successTip = document.createElement("div");
  successTip.style.cssText = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#2e7d32; color:white; padding:8px 16px; border-radius:4px; font-size:14px; z-index:999;";
  successTip.textContent = msg;
  document.body.appendChild(successTip);
  setTimeout(() => successTip.remove(), 2000);
}

function showWarning(msg) {
  DOM.contentArea.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 20px; background:#fff3cd; color:#856404; border-radius:8px; font-size:16px; margin-bottom:20px;">
      ⚠️ ${msg}
    </div>
  `;
}

function showError(msg) {
  DOM.contentArea.innerHTML = `
    <div class="no-result" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #dc3545; font-size: 16px; line-height: 1.6;">
      ❌ ${msg}
    </div>
  `;
}

// 13. 其他辅助函数（不变）
function activateCategoryBtn(category) {
  DOM.categoryBtns.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.type === category);
  });
}

function updateSearchPlaceholder() {
  DOM.searchInput.placeholder = APP_STATE.currentCategory === "software"
    ? "搜索软件（如：Chrome）..."
    : "搜索工具（如：Canva）...";
}
