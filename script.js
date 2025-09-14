// 1. 【关键】Algolia 配置（务必替换为你的真实信息！）
// 提示：从 Algolia 控制台获取（Settings → API Keys）
const ALGOLIA_CONFIG = {
  appId: "RZOWXGOWIK",       // 示例：K2QXXXXXX（不要用示例值）
  searchKey: "810cb27d5df9d22cd078aa808c8b5b18", // 示例：a1b2c3d4e5f6XXXX（不要用示例值）
  indexName: "yuanjiansuo"            // 你创建的索引名称（必须与控制台一致）
};

// 2. 全局状态与 DOM 元素（提前缓存，避免重复获取）
const appState = {
  currentType: "software", // 默认选中“软件”分类
  isLoading: false         // 加载状态锁（防止重复请求）
};
const DOM = {
  menuBtns: document.querySelectorAll(".menu-btn"),
  searchInput: document.getElementById("search-input"),
  searchBtn: document.getElementById("search-btn"),
  contentArea: document.getElementById("content-area"),
  aboutBtn: document.getElementById("about-btn"),
  aboutPanel: document.getElementById("about-panel")
};

// 3. 初始化 Algolia 客户端（增加配置校验）
let searchClient = null;
let algoliaIndex = null;

function initAlgolia() {
  // 校验配置是否完整（避免因配置为空导致失败）
  if (!ALGOLIA_CONFIG.appId || !ALGOLIA_CONFIG.searchKey || !ALGOLIA_CONFIG.indexName) {
    showError("Algolia 配置不完整！请检查 script.js 中的 appId、searchKey、indexName");
    return false;
  }

  // 初始化客户端（兼容最新 Algolia 库）
  try {
    // 修复：使用 algoliasearch 正确初始化方式（部分版本需解构）
    const algoliasearch = window.algoliasearch || (() => { throw new Error("Algolia 库未加载") });
    searchClient = algoliasearch(ALGOLIA_CONFIG.appId, ALGOLIA_CONFIG.searchKey);
    algoliaIndex = searchClient.initIndex(ALGOLIA_CONFIG.indexName);
    console.log("Algolia 客户端初始化成功");
    return true;
  } catch (error) {
    showError(`Algolia 初始化失败：${error.message}`);
    return false;
  }
}

// 4. 页面加载完成后初始化（确保 DOM 与 Algolia 都准备好）
window.addEventListener("DOMContentLoaded", () => {
  // 先初始化 Algolia，再加载内容
  const isAlgoliaReady = initAlgolia();
  if (isAlgoliaReady) {
    loadFeaturedItems(appState.currentType); // 加载默认分类内容
    updateSearchPlaceholder();               // 更新搜索框提示
    bindEventListeners();                     // 绑定所有交互事件
  }
});

// 5. 绑定所有交互事件（统一管理，避免重复绑定）
function bindEventListeners() {
  // 分类切换（软件/工具）
  DOM.menuBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type;
      if (type === appState.currentType) return; // 点击当前分类不重复加载

      // 更新按钮状态
      DOM.menuBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // 切换分类并加载内容
      appState.currentType = type;
      DOM.searchInput.value = ""; // 清空搜索框
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

// 6. 加载精选内容（无搜索时显示全部分类内容）
function loadFeaturedItems(type) {
  if (appState.isLoading || !algoliaIndex) return; // 防止重复请求或客户端未就绪

  // 显示加载状态
  setContentLoading();
  appState.isLoading = true;

  // 修复：使用最新 Algolia 搜索参数（v4 版本推荐用 filters 而非 facetFilters）
  algoliaIndex
    .search("", {
      filters: `type:"${type}"`,  // 精准筛选分类（与 JSON 中 type 字段完全匹配）
      hitsPerPage: 20,            // 每页最多显示 20 条
      attributesToRetrieve: ["objectID", "name", "url", "intro", "type"] // 只获取需要的字段
    })
    .then((response) => {
      appState.isLoading = false;
      if (response.hits && response.hits.length > 0) {
        renderItems(response.hits); // 渲染内容卡片
      } else {
        showError(`当前分类暂无内容，请先在 Algolia 控制台添加 ${type === "software" ? "软件" : "工具"} 数据`);
      }
    })
    .catch((error) => {
      appState.isLoading = false;
      // 错误详细提示（帮助定位问题）
      const errorMsg = getAlgoliaErrorMsg(error);
      showError(`加载失败：${errorMsg}（可按 F12 查看控制台详细错误）`);
      console.error("精选内容加载错误：", error); // 控制台输出完整错误，便于调试
    });
}

// 7. 搜索功能（关键词匹配名称/简介）
function searchItems(keyword) {
  if (appState.isLoading || !algoliaIndex) return;

  // 显示加载状态
  setContentLoading();
  appState.isLoading = true;

  algoliaIndex
    .search(keyword, {
      filters: `type:"${appState.currentType}"`, // 只搜索当前选中分类
      attributesToSearch: ["name", "intro"],     // 搜索“名称”和“简介”字段
      hitsPerPage: 20,
      attributesToRetrieve: ["objectID", "name", "url", "intro", "type"]
    })
    .then((response) => {
      appState.isLoading = false;
      if (response.hits && response.hits.length > 0) {
        renderItems(response.hits);
      } else {
        showError(`未找到包含“${keyword}”的结果，请尝试其他关键词`);
      }
    })
    .catch((error) => {
      appState.isLoading = false;
      const errorMsg = getAlgoliaErrorMsg(error);
      showError(`搜索失败：${errorMsg}（可按 F12 查看控制台详细错误）`);
      console.error("搜索错误：", error);
    });
}

// 8. 渲染内容卡片（软件/工具通用）
function renderItems(items) {
  if (!items || items.length === 0) {
    showError("暂无内容可显示");
    return;
  }

  // 拼接卡片 HTML（确保每个字段存在，避免报错）
  let html = "";
  items.forEach((item) => {
    const name = item.name || "未知名称";
    const intro = item.intro || "暂无简介";
    const url = item.url || "#"; // 防止链接为空导致点击无反应

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

// 9. 辅助函数：显示加载状态
function setContentLoading() {
  DOM.contentArea.innerHTML = '<div class="loading">加载中...</div>';
}

// 10. 辅助函数：显示错误信息
function showError(msg) {
  DOM.contentArea.innerHTML = `<div class="no-result">${msg}</div>`;
}

// 11. 辅助函数：更新搜索框占位符
function updateSearchPlaceholder() {
  DOM.searchInput.placeholder = appState.currentType === "software" 
    ? "搜索软件（如：Chrome）..." 
    : "搜索工具（如：Canva）...";
}

// 12. 【关键】解析 Algolia 错误信息（帮助快速定位问题）
function getAlgoliaErrorMsg(error) {
  if (!error) return "未知错误";

  // 常见错误类型判断
  if (error.status === 403) {
    return "API Key 无效或无权限（检查 Search-Only API Key 是否正确）";
  } else if (error.status === 404) {
    return "索引不存在（检查 indexName 是否与 Algolia 控制台一致）";
  } else if (error.message.includes("Network")) {
    return "网络异常（检查网络连接或 Algolia 访问权限）";
  } else if (error.message.includes("appId")) {
    return "Application ID 无效（检查 appId 是否正确）";
  } else {
    return error.message || "未知错误";
  }
}
