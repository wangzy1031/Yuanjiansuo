// 1. 【必须替换】Algolia 配置（从控制台复制真实信息！）
const ALGOLIA_CONFIG = {
  appId: "RZOWXGOWIK",       // 示例：K2QXXXXXX（删除示例，填真实值）
  searchKey: "810cb27d5df9d22cd078aa808c8b5b18", // 示例：a1b2c3d4e5f6XXXX（填真实值）
  indexName: "yuanjiansuo"            // 你创建的索引名称（必须与控制台一致）
};

// 2. 全局状态与 DOM 元素缓存
const appState = {
  currentType: "software", // 默认选中“软件”分类
  isLoading: false         // 防止重复请求的锁
};
const DOM = {
  menuBtns: document.querySelectorAll(".menu-btn"),
  searchInput: document.getElementById("search-input"),
  searchBtn: document.getElementById("search-btn"),
  contentArea: document.getElementById("content-area"),
  aboutBtn: document.getElementById("about-btn"),
  aboutPanel: document.getElementById("about-panel")
};

// 3. Algolia 客户端初始化（兼容 v4 版本，移除旧参数）
let searchClient = null;
let algoliaIndex = null;

function initAlgolia() {
  // 第一步：校验配置是否完整（避免空配置导致失败）
  if (!ALGOLIA_CONFIG.appId || !ALGOLIA_CONFIG.searchKey || !ALGOLIA_CONFIG.indexName) {
    showError("❌ Algolia 配置不完整！请检查 script.js 中的 3 个配置项");
    return false;
  }

  // 第二步：初始化客户端（确保 Algolia 库加载成功）
  try {
    const algoliasearch = window.algoliasearch;
    if (!algoliasearch) throw new Error("Algolia 搜索库未加载");
    
    searchClient = algoliasearch(ALGOLIA_CONFIG.appId, ALGOLIA_CONFIG.searchKey);
    algoliaIndex = searchClient.initIndex(ALGOLIA_CONFIG.indexName);
    console.log("✅ Algolia 客户端初始化成功");
    return true;
  } catch (error) {
    showError(`❌ Algolia 初始化失败：${error.message}`);
    return false;
  }
}

// 4. 页面加载完成后执行（确保 DOM 和样式都就绪）
window.addEventListener("DOMContentLoaded", () => {
  // 先修复样式加载（避免 CSP 拦截问题）
  fixStyleLoading();
  
  // 再初始化 Algolia 并加载内容
  const isAlgoliaReady = initAlgolia();
  if (isAlgoliaReady) {
    loadFeaturedItems(appState.currentType);
    updateSearchPlaceholder();
    bindEventListeners();
  }
});

// 5. 绑定所有交互事件（统一管理）
function bindEventListeners() {
  // 分类切换（软件/工具）
  DOM.menuBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type;
      if (type === appState.currentType) return; // 点击当前分类不重复加载

      // 更新按钮激活状态
      DOM.menuBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // 切换分类并加载内容
      appState.currentType = type;
      DOM.searchInput.value = "";
      updateSearchPlaceholder();
      loadFeaturedItems(type);
    });
  });

  // 搜索按钮点击
  DOM.searchBtn.addEventListener("click", () => {
    const keyword = DOM.searchInput.value.trim();
    keyword ? searchItems(keyword) : loadFeaturedItems(appState.currentType);
  });

  // 回车键搜索
  DOM.searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") DOM.searchBtn.click();
  });

  // 关于面板展开/收起
  DOM.aboutBtn.addEventListener("click", () => {
    DOM.aboutPanel.classList.toggle("hidden");
  });
}

// 6. 加载精选内容（无搜索时显示全部分类）
// 【核心修复】移除 attributesToSearch，改用 Algolia v4 支持的 attributesToRetrieve
function loadFeaturedItems(type) {
  if (appState.isLoading || !algoliaIndex) return;

  // 显示加载状态
  setContentLoading();
  appState.isLoading = true;

  algoliaIndex
    .search("", {
      filters: `type:"${type}"`,  // 筛选当前分类（与 JSON 中 type 匹配）
      hitsPerPage: 20,            // 每页最多 20 条
      attributesToRetrieve: ["objectID", "name", "url", "intro"] // 只获取需要的字段
    })
    .then((response) => {
      appState.isLoading = false;
      response.hits.length > 0 
        ? renderItems(response.hits) 
        : showError(`⚠️ 当前分类暂无内容，请在 Algolia 控制台添加${type === "software" ? "软件" : "工具"}数据`);
    })
    .catch((error) => {
      appState.isLoading = false;
      const errorMsg = getAlgoliaErrorMsg(error);
      showError(`❌ 加载失败：${errorMsg}`);
      console.error("加载错误详情：", error);
    });
}

// 7. 搜索功能（【核心修复】移除 attributesToSearch，用默认搜索逻辑）
function searchItems(keyword) {
  if (appState.isLoading || !algoliaIndex) return;

  // 显示加载状态
  setContentLoading();
  appState.isLoading = true;

  algoliaIndex
    .search(keyword, {
      filters: `type:"${appState.currentType}"`,  // 只搜索当前分类
      hitsPerPage: 20,
      attributesToRetrieve: ["objectID", "name", "url", "intro"] // 仅保留必要字段
    })
    .then((response) => {
      appState.isLoading = false;
      response.hits.length > 0 
        ? renderItems(response.hits) 
        : showError(`⚠️ 未找到包含“${keyword}”的结果，请换个关键词试试`);
    })
    .catch((error) => {
      appState.isLoading = false;
      const errorMsg = getAlgoliaErrorMsg(error);
      showError(`❌ 搜索失败：${errorMsg}`);
      console.error("搜索错误详情：", error);
    });
}

// 8. 渲染内容卡片（增加字段容错，避免空值报错）
function renderItems(items) {
  let html = "";
  items.forEach((item) => {
    const name = item.name || "未知名称";
    const intro = item.intro || "暂无简介";
    const url = item.url || "#"; // 空链接时防止点击无效

    html += `
      <div class="item-card">
        <h3>${name}</h3>
        <p class="intro">${intro}</p>
        <a 
          href="${url}" 
          target="_blank" 
          class="link-btn"
          ${!item.url ? 'onclick="return false;" title="链接无效"' : ''}
        >
          前往官网
        </a>
      </div>
    `;
  });
  DOM.contentArea.innerHTML = html;
}

// 9. 修复样式加载问题（解决 CSP 拦截 font-awesome 的问题）
function fixStyleLoading() {
  // 检查是否已加载样式，避免重复加载
  const styleLink = document.querySelector('link[href*="style.css"]');
  if (styleLink && styleLink.sheet) {
    console.log("✅ 本地样式加载成功");
    return;
  }

  // 重新加载本地 style.css（确保优先级高于外部样式）
  const newStyleLink = document.createElement("link");
  newStyleLink.rel = "stylesheet";
  newStyleLink.href = "style.css"; // 本地样式文件，避免 CSP 拦截
  newStyleLink.onload = () => console.log("✅ 本地样式重新加载成功");
  newStyleLink.onerror = () => showError("⚠️ 样式文件加载失败，请检查 style.css 是否存在");
  
  // 插入到 head 顶部，确保优先加载
  document.head.insertBefore(newStyleLink, document.head.firstChild);
}

// 10. 辅助函数：显示加载状态
function setContentLoading() {
  DOM.contentArea.innerHTML = '<div class="loading">加载中...</div>';
}

// 11. 辅助函数：显示错误信息
function showError(msg) {
  DOM.contentArea.innerHTML = `<div class="no-result">${msg}</div>`;
}

// 12. 辅助函数：更新搜索框占位符
function updateSearchPlaceholder() {
  DOM.searchInput.placeholder = appState.currentType === "software" 
    ? "搜索软件（如：Chrome）..." 
    : "搜索工具（如：Canva）...";
}

// 13. 解析 Algolia 错误信息（快速定位问题）
function getAlgoliaErrorMsg(error) {
  if (!error) return "未知错误";

  // 常见错误类型匹配
  switch (true) {
    case error.status === 403:
      return "API Key 无效或无权限（请检查 Search-Only API Key）";
    case error.status === 404:
      return "索引不存在（请检查 indexName 与 Algolia 控制台一致）";
    case error.message.includes("Network"):
      return "网络异常（检查网络连接或刷新页面）";
    case error.message.includes("appId"):
      return "Application ID 无效（请检查 appId 是否正确）";
    default:
      return error.message || "未知错误";
  }
}
