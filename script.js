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
    console.error("Algolia 配置缺失：", ALGOLIA_CONFIG); // 打印配置详情
    return false;
  }

  // 第二步：初始化客户端（确保 Algolia 库加载成功）
  try {
    const algoliasearch = window.algoliasearch;
    if (!algoliasearch) throw new Error("Algolia 搜索库未加载（检查 index.html 中 Algolia 脚本引入）");
    
    searchClient = algoliasearch(ALGOLIA_CONFIG.appId, ALGOLIA_CONFIG.searchKey);
    algoliaIndex = searchClient.initIndex(ALGOLIA_CONFIG.indexName);
    console.log("✅ Algolia 客户端初始化成功", {
      appId: ALGOLIA_CONFIG.appId,
      indexName: ALGOLIA_CONFIG.indexName
    });
    return true;
  } catch (error) {
    showError(`❌ Algolia 初始化失败：${error.message}`);
    console.error("Algolia 初始化错误详情：", error);
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
    console.log("🔄 开始加载默认分类内容（软件）");
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
      if (type === appState.currentType) {
        console.log("ℹ️ 已选中当前分类，无需重复加载：", type);
        return;
      }

      // 更新按钮激活状态
      DOM.menuBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // 切换分类并加载内容
      appState.currentType = type;
      DOM.searchInput.value = "";
      updateSearchPlaceholder();
      console.log("🔄 切换分类，加载内容：", type);
      loadFeaturedItems(type);
    });
  });

  // 搜索按钮点击
  DOM.searchBtn.addEventListener("click", () => {
    const keyword = DOM.searchInput.value.trim();
    if (keyword) {
      console.log("🔍 执行搜索：", { keyword, currentType: appState.currentType });
      searchItems(keyword);
    } else {
      console.log("ℹ️ 搜索关键词为空，加载当前分类精选内容");
      loadFeaturedItems(appState.currentType);
    }
  });

  // 回车键搜索
  DOM.searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      console.log("ℹ️ 按下回车键，触发搜索");
      DOM.searchBtn.click();
    }
  });

  // 关于面板展开/收起
  DOM.aboutBtn.addEventListener("click", () => {
    const isHidden = DOM.aboutPanel.classList.contains("hidden");
    console.log(`ℹ️ 关于面板${isHidden ? "展开" : "收起"}`);
    DOM.aboutPanel.classList.toggle("hidden");
  });
}

// 6. 加载精选内容（带完整调试日志）
function loadFeaturedItems(type) {
  if (appState.isLoading) {
    console.log("ℹ️ 正在加载中，忽略重复请求：", type);
    return;
  }
  if (!algoliaIndex) {
    showError("❌ Algolia 客户端未初始化，无法加载内容");
    console.error("ℹ️ 加载精选内容失败：Algolia 客户端为空");
    return;
  }

  // 显示加载状态
  setContentLoading();
  appState.isLoading = true;
  console.log("📡 向 Algolia 发送精选内容请求：", {
    type: type,
    filters: `type:"${type}"`,
    hitsPerPage: 20
  });

  algoliaIndex
    .search("", {
      filters: `type:"${type}"`,  // 筛选当前分类（与 JSON 中 type 匹配）
      hitsPerPage: 20,            // 每页最多 20 条
      attributesToRetrieve: ["objectID", "name", "url", "intro"] // 只获取需要的字段
    })
    .then((response) => {
      appState.isLoading = false;
      // 打印完整返回数据（关键调试日志）
      console.log("📥 Algolia 精选内容返回结果：", {
        requestType: "featured",
        targetType: type,
        totalHits: response.nbHits, // 总匹配数据量
        returnedHits: response.hits.length, // 本次返回数据量
        rawResponse: response // 原始响应（可展开查看所有字段）
      });

      // 处理返回结果
      if (response.hits.length > 0) {
        console.log("✅ 有匹配数据，开始渲染：", response.hits);
        renderItems(response.hits);
      } else {
        showError(`⚠️ 当前分类（${type === "software" ? "软件" : "工具"}）暂无数据，请检查 Algolia 中 type 字段是否为“${type}”`);
        console.warn("⚠️ 无匹配数据原因：", {
          possibleReasons: [
            "1. Algolia 中无 type 为 " + type + " 的数据",
            "2. 筛选条件错误（type 字段大小写不匹配）",
            "3. 索引名称错误（未找到对应索引）"
          ],
          currentFilter: `type:"${type}"`
        });
      }
    })
    .catch((error) => {
      appState.isLoading = false;
      const errorMsg = getAlgoliaErrorMsg(error);
      showError(`❌ 加载失败：${errorMsg}`);
      console.error("❌ 精选内容加载错误详情：", {
        errorMsg: error.message,
        errorStatus: error.status,
        errorStack: error.stack
      });
    });
}

// 7. 搜索功能（带完整调试日志）
function searchItems(keyword) {
  if (appState.isLoading) {
    console.log("ℹ️ 正在搜索中，忽略重复请求：", keyword);
    return;
  }
  if (!algoliaIndex) {
    showError("❌ Algolia 客户端未初始化，无法搜索");
    console.error("ℹ️ 搜索失败：Algolia 客户端为空");
    return;
  }

  // 显示加载状态
  setContentLoading();
  appState.isLoading = true;
  console.log("📡 向 Algolia 发送搜索请求：", {
    keyword: keyword,
    currentType: appState.currentType,
    filters: `type:"${appState.currentType}"`
  });

  algoliaIndex
    .search(keyword, {
      filters: `type:"${appState.currentType}"`,  // 只搜索当前分类
      hitsPerPage: 20,
      attributesToRetrieve: ["objectID", "name", "url", "intro"] // 仅保留必要字段
    })
    .then((response) => {
      appState.isLoading = false;
      // 打印完整搜索返回数据（关键调试日志）
      console.log("📥 Algolia 搜索返回结果：", {
        requestType: "search",
        keyword: keyword,
        targetType: appState.currentType,
        totalHits: response.nbHits,
        returnedHits: response.hits.length,
        rawResponse: response
      });

      // 处理搜索结果
      if (response.hits.length > 0) {
        console.log("✅ 搜索到匹配数据，开始渲染：", response.hits);
        renderItems(response.hits);
      } else {
        showError(`⚠️ 未找到“${keyword}”匹配的“${appState.currentType === 'software' ? '软件' : '工具'}”数据`);
        console.warn("⚠️ 搜索无结果原因：", {
          possibleReasons: [
            "1. Algolia 中无包含关键词的对应类型数据",
            "2. 可搜索属性未配置（未添加 name/intro 到搜索属性）",
            "3. 关键词拼写错误或无匹配内容"
          ],
          searchParams: {
            keyword: keyword,
            typeFilter: appState.currentType
          }
        });
      }
    })
    .catch((error) => {
      appState.isLoading = false;
      const errorMsg = getAlgoliaErrorMsg(error);
      showError(`❌ 搜索失败：${errorMsg}`);
      console.error("❌ 搜索错误详情：", {
        errorMsg: error.message,
        errorStatus: error.status,
        errorStack: error.stack,
        searchKeyword: keyword
      });
    });
}

// 8. 渲染内容卡片（带数据校验和渲染日志）
function renderItems(items) {
  // 先检查数据格式是否正确
  if (!Array.isArray(items)) {
    showError("⚠️ 数据格式错误，不是数组（无法渲染）");
    console.error("❌ 渲染失败：数据格式错误", {
      dataType: typeof items,
      rawData: items
    });
    return;
  }

  console.log("🎨 开始渲染内容卡片：", {
    totalItems: items.length,
    firstItemSample: items.length > 0 ? items[0] : "无数据"
  });

  let html = "";
  // 遍历数据时增加字段校验和日志
  items.forEach((item, index) => {
    console.log(`📄 处理第 ${index+1} 条数据：`, {
      objectID: item.objectID,
      name: item.name,
      type: item.type,
      hasUrl: !!item.url
    });

    // 字段容错处理（避免空值导致页面错乱）
    const name = item.name ? item.name.trim() : "未知名称";
    const intro = item.intro ? item.intro.trim() : "暂无简介";
    const url = item.url ? item.url.trim() : "#"; // 空链接时设为占位符

    // 拼接卡片 HTML（确保语法正确，避免引号冲突）
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

  // 强制设置内容到页面，并打印最终 HTML（确认渲染结果）
  DOM.contentArea.innerHTML = html;
  console.log("✅ 渲染完成！最终生成的 HTML 长度：", html.length, "字符");
  if (html.length < 100) {
    console.warn("⚠️ 生成的 HTML 过短，可能无有效内容：", html);
  }
}

// 9. 修复样式加载问题（解决 CSP 拦截 font-awesome 的问题）
function fixStyleLoading() {
  // 检查本地样式是否加载成功
  const styleLink = document.querySelector('link[href="style.css"]');
  if (styleLink) {
    console.log("ℹ️ 本地样式文件已存在：", styleLink.href);
    // 验证样式是否生效（检查 body 样式是否被应用）
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    console.log("ℹ️ 当前页面背景色（样式生效检查）：", bodyBg);
    if (bodyBg.includes("248, 249, 250")) { // 匹配 style.css 中 body 的 #f8f9fa
      console.log("✅ 本地样式已生效");
      return;
    } else {
      console.warn("⚠️ 本地样式存在但未生效，重新加载");
    }
  }

  // 重新加载本地 style.css（确保优先级高于外部样式）
  const newStyleLink = document.createElement("link");
  newStyleLink.rel = "stylesheet";
  newStyleLink.href = "style.css"; // 本地样式文件，避免 CSP 拦截
  newStyleLink.onload = () => {
    console.log("✅ 本地样式重新加载成功");
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    console.log("✅ 样式生效验证：页面背景色", bodyBg);
  };
  newStyleLink.onerror = () => {
    showError("⚠️ 样式文件加载失败（检查 style.css 是否与 script.js 在同一文件夹）");
    console.error("❌ 本地样式加载失败：style.css 未找到或无法访问");
  };
  
  // 插入到 head 顶部，确保优先加载
  document.head.insertBefore(newStyleLink, document.head.firstChild);
}

// 10. 辅助函数：显示加载状态
function setContentLoading() {
  DOM.contentArea.innerHTML = '<div class="loading">加载中...</div>';
  console.log("⏳ 显示加载状态");
}

// 11. 辅助函数：显示错误信息
function showError(msg) {
  DOM.contentArea.innerHTML = `<div class="no-result">${msg}</div>`;
  console.log("❌ 显示错误信息：", msg);
}

// 12. 辅助函数：更新搜索框占位符
function updateSearchPlaceholder() {
  const placeholder = appState.currentType === "software" 
    ? "搜索软件（如：Chrome）..." 
    : "搜索工具（如：Canva）...";
  DOM.searchInput.placeholder = placeholder;
  console.log("ℹ️ 更新搜索框占位符：", placeholder);
}

// 13. 解析 Algolia 错误信息（快速定位问题）
function getAlgoliaErrorMsg(error) {
  if (!error) return "未知错误";

  // 常见错误类型匹配（带解决方案提示）
  switch (true) {
    case error.status === 403:
      return "API Key 无效或无权限（解决方案：检查 Search-Only API Key 是否正确，且未开启 IP 限制）";
    case error.status === 404:
      return "索引不存在（解决方案：检查 indexName 与 Algolia 控制台完全一致，区分大小写）";
    case error.message.includes("Network") || error.message.includes("Failed to fetch"):
      return "网络异常（解决方案：检查网络连接，或刷新页面重试）";
    case error.message.includes("appId") || error.message.includes("Application ID"):
      return "Application ID 无效（解决方案：检查 appId 是否与 Algolia 控制台一致）";
    default:
      return `未知错误（${error.message}），可查看控制台详细日志`;
  }
}