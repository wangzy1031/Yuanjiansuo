// 1. 【必须替换】Algolia 配置（从控制台复制真实信息！）
const ALGOLIA_CONFIG = {
  appId: "RZOWXGOWIK",       // 示例：K2QXXXXXX（填真实值）
  searchKey: "810cb27d5df9d22cd078aa808c8b5b18", // 示例：a1b2c3d4e5f6XXXX（填真实值）
  indexName: "yuanjiansuo"            // 与控制台索引名称完全一致
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

// 3. Algolia 客户端初始化
let searchClient = null;
let algoliaIndex = null;

function initAlgolia() {
  if (!ALGOLIA_CONFIG.appId || !ALGOLIA_CONFIG.searchKey || !ALGOLIA_CONFIG.indexName) {
    showError("❌ Algolia 配置不完整！请检查 3 个配置项");
    console.error("配置缺失：", ALGOLIA_CONFIG);
    return false;
  }

  try {
    const algoliasearch = window.algoliasearch;
    if (!algoliasearch) throw new Error("Algolia 库未加载");
    
    searchClient = algoliasearch(ALGOLIA_CONFIG.appId, ALGOLIA_CONFIG.searchKey);
    algoliaIndex = searchClient.initIndex(ALGOLIA_CONFIG.indexName);
    console.log("✅ Algolia 初始化成功", { indexName: ALGOLIA_CONFIG.indexName });
    return true;
  } catch (error) {
    showError(`❌ 初始化失败：${error.message}`);
    console.error("初始化错误：", error);
    return false;
  }
}

// 4. 页面加载完成执行
window.addEventListener("DOMContentLoaded", () => {
  fixStyleLoading();
  const isAlgoliaReady = initAlgolia();
  if (isAlgoliaReady) {
    loadFeaturedItems(appState.currentType);
    updateSearchPlaceholder();
    bindEventListeners();
  }
});

// 5. 绑定交互事件
function bindEventListeners() {
  DOM.menuBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type;
      if (type === appState.currentType) return;

      DOM.menuBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      appState.currentType = type;
      DOM.searchInput.value = "";
      updateSearchPlaceholder();
      loadFeaturedItems(type);
    });
  });

  DOM.searchBtn.addEventListener("click", () => {
    const keyword = DOM.searchInput.value.trim();
    keyword ? searchItems(keyword) : loadFeaturedItems(appState.currentType);
  });

  DOM.searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") DOM.searchBtn.click();
  });

  DOM.aboutBtn.addEventListener("click", () => {
    DOM.aboutPanel.classList.toggle("hidden");
  });
}

// 6. 【核心修复】加载精选内容（修改筛选语法，避免引号冲突）
function loadFeaturedItems(type) {
  if (appState.isLoading || !algoliaIndex) return;
  setContentLoading();
  appState.isLoading = true;

  // 修复：改用 Algolia 推荐的筛选语法（用单引号包裹值，避免嵌套冲突）
  const filterStr = `type:'${type}'`; 
  console.log("📡 发送精选请求，筛选条件：", filterStr);

  algoliaIndex
    .search("", {
      filters: filterStr, // 关键修复：筛选条件用单引号包裹 type 值
      hitsPerPage: 20,
      attributesToRetrieve: ["objectID", "name", "url", "intro"]
    })
    .then((response) => {
      appState.isLoading = false;
      console.log("📥 精选返回结果：", { total: response.nbHits, hits: response.hits });

      if (response.hits.length > 0) {
        renderItems(response.hits);
      } else {
        // 更精准的错误提示（包含当前筛选条件）
        showError(`⚠️ 当前分类无数据！筛选条件：${filterStr}\n请检查 Algolia 中 type 字段是否等于 ${type}（无引号、无空格）`);
        console.warn("⚠️ 无数据详情：", {
          filterUsed: filterStr,
          algoliaDataSample: "进入 Algolia Browse 页面，确认数据的 type 字段值"
        });
      }
    })
    .catch((error) => {
      appState.isLoading = false;
      showError(`❌ 加载失败：${getAlgoliaErrorMsg(error)}`);
      console.error("加载错误：", error);
    });
}

// 7. 【核心修复】搜索功能（同步修改筛选语法）
function searchItems(keyword) {
  if (appState.isLoading || !algoliaIndex) return;
  setContentLoading();
  appState.isLoading = true;

  // 修复：同样用单引号包裹 type 值
  const filterStr = `type:'${appState.currentType}'`;
  console.log("📡 发送搜索请求：", { keyword, filter: filterStr });

  algoliaIndex
    .search(keyword, {
      filters: filterStr, // 关键修复：筛选条件用单引号
      hitsPerPage: 20,
      attributesToRetrieve: ["objectID", "name", "url", "intro"]
    })
    .then((response) => {
      appState.isLoading = false;
      console.log("📥 搜索返回结果：", { keyword, total: response.nbHits, hits: response.hits });

      if (response.hits.length > 0) {
        renderItems(response.hits);
      } else {
        showError(`⚠️ 未找到“${keyword}”匹配数据！筛选条件：${filterStr}`);
      }
    })
    .catch((error) => {
      appState.isLoading = false;
      showError(`❌ 搜索失败：${getAlgoliaErrorMsg(error)}`);
      console.error("搜索错误：", error);
    });
}

// 8. 渲染内容卡片
function renderItems(items) {
  if (!Array.isArray(items)) {
    showError("⚠️ 数据格式错误（不是数组）");
    console.error("渲染错误：数据非数组", items);
    return;
  }

  let html = "";
  items.forEach((item) => {
    const name = item.name ? item.name.trim() : "未知名称";
    const intro = item.intro ? item.intro.trim() : "暂无简介";
    const url = item.url ? item.url.trim() : "#";

    html += `
      <div class="item-card">
        <h3>${name}</h3>
        <p class="intro">${intro}</p >
        <a 
          href=" " 
          target="_blank" 
          class="link-btn"
          ${url === "#" ? 'onclick="return false;" title="链接无效"' : ''}
        >
          前往官网
        </a >
      </div>
    `;
  });

  DOM.contentArea.innerHTML = html;
  console.log("✅ 渲染完成，共", items.length, "条数据");
}

// 9. 修复样式加载
function fixStyleLoading() {
  const styleLink = document.querySelector('link[href="style.css"]');
  if (styleLink) {
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    if (bodyBg.includes("248, 249, 250")) {
      console.log("✅ 样式已生效");
      return;
    }
  }

  const newStyleLink = document.createElement("link");
  newStyleLink.rel = "stylesheet";
  newStyleLink.href = "style.css";
  newStyleLink.onload = () => console.log("✅ 样式重新加载成功");
  newStyleLink.onerror = () => showError("⚠️ 样式文件加载失败（检查文件位置）");
  document.head.insertBefore(newStyleLink, document.head.firstChild);
}

// 10. 辅助函数：显示加载状态
function setContentLoading() {
  DOM.contentArea.innerHTML = '<div class="loading">加载中...</div>';
}

// 11. 辅助函数：显示错误信息
function showError(msg) {
  DOM.contentArea.innerHTML = `<div class="no-result">${msg.replace(/\n/g, '<br>')}</div>`;
}

// 12. 辅助函数：更新搜索框占位符
function updateSearchPlaceholder() {
  DOM.searchInput.placeholder = appState.currentType === "software" 
    ? "搜索软件（如：Chrome）..." 
    : "搜索工具（如：Canva）...";
}

// 13. 解析 Algolia 错误信息
function getAlgoliaErrorMsg(error) {
  if (!error) return "未知错误";

  switch (true) {
    case error.status === 403:
      return "API Key 无效（检查 Search-Only API Key，关闭 IP 限制）";
    case error.status === 404:
      return "索引不存在（检查 indexName 与控制台一致，区分大小写）";
    case error.message.includes("Network"):
      return "网络异常（刷新页面重试）";
    default:
      return error.message;
  }
}