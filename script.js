// 1. 核心配置（【必须替换】为你的 GitHub 仓库信息！）
// 说明：将 data.json 上传到你的 GitHub 仓库，替换以下链接和分支名
const CONFIG = {
  // JSON 数据文件的 GitHub 原始链接（格式：https://raw.githubusercontent.com/用户名/仓库名/分支名/文件路径）
  jsonDataUrl: "https://raw.githubusercontent.com/wangzy1031/Yuanjiansuo/main/data.json",
  defaultCategory: "software", // 默认显示分类：software（软件）/ tool（工具）
  itemsPerPage: 20 // 每页最多显示内容数量
};

// 2. 全局状态管理
const APP_STATE = {
  currentCategory: CONFIG.defaultCategory, // 当前激活分类
  isLoading: false, // 加载状态锁（防止重复请求）
  allData: [] // 缓存所有从 GitHub 加载的 JSON 数据
};

// 3. DOM 元素缓存
const DOM = {
  categoryBtns: document.querySelectorAll(".menu-btn"), // 分类切换按钮
  searchInput: document.getElementById("search-input"), // 搜索框
  searchBtn: document.getElementById("search-btn"), // 搜索按钮
  contentArea: document.getElementById("content-area"), // 内容展示区
  aboutBtn: document.getElementById("about-btn"), // 关于按钮
  aboutPanel: document.getElementById("about-panel") // 关于面板
};

// 4. 页面初始化（DOM 加载完成后执行）
document.addEventListener("DOMContentLoaded", () => {
  // 绑定所有交互事件
  bindEventListeners();
  // 激活默认分类按钮
  activateCategoryBtn(APP_STATE.currentCategory);
  // 更新搜索框占位符
  updateSearchPlaceholder();
  // 从 GitHub 加载 JSON 数据并显示默认分类内容
  loadDataFromGithub();
});

// 5. 绑定所有交互事件
function bindEventListeners() {
  // 5.1 分类切换事件
  DOM.categoryBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetCategory = btn.dataset.type;
      // 避免重复点击当前分类
      if (targetCategory === APP_STATE.currentCategory) return;

      // 更新状态和 UI
      APP_STATE.currentCategory = targetCategory;
      activateCategoryBtn(targetCategory);
      DOM.searchInput.value = "";
      updateSearchPlaceholder();
      // 从缓存数据中筛选当前分类内容并显示
      renderFilteredData(targetCategory);
    });
  });

  // 5.2 搜索按钮点击事件
  DOM.searchBtn.addEventListener("click", () => {
    const keyword = DOM.searchInput.value.trim();
    // 有关键词：搜索当前分类下匹配内容；无关键词：显示当前分类全量内容
    if (keyword) {
      searchData(keyword, APP_STATE.currentCategory);
    } else {
      renderFilteredData(APP_STATE.currentCategory);
    }
  });

  // 5.3 回车键触发搜索
  DOM.searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      DOM.searchBtn.click();
    }
  });

  // 5.4 关于面板展开/收起
  DOM.aboutBtn.addEventListener("click", () => {
    DOM.aboutPanel.classList.toggle("hidden");
  });
}

// 6. 从 GitHub 加载 JSON 数据（核心：替代 Algolia 数据来源）
function loadDataFromGithub() {
  if (APP_STATE.isLoading) return;
  APP_STATE.isLoading = true;
  showLoading();

  // 使用 Fetch API 加载 GitHub 上的 JSON 文件
  fetch(CONFIG.jsonDataUrl)
    .then(response => {
      // 检查请求是否成功（GitHub 原始链接返回 200 为成功）
      if (!response.ok) {
        throw new Error(`请求失败：${response.status}（请检查 JSON 链接是否正确）`);
      }
      // 解析 JSON 数据
      return response.json();
    })
    .then(data => {
      APP_STATE.isLoading = false;
      // 验证数据格式是否正确（必须是数组，且包含必要字段）
      if (!Array.isArray(data) || data.length === 0) {
        showError("JSON 数据格式错误：必须是包含软件/工具条目的数组");
        return;
      }

      // 缓存数据并验证每条数据的必要字段
      APP_STATE.allData = data.filter(item => {
        const hasRequiredFields = item.type && item.name && item.url && item.intro;
        if (!hasRequiredFields) {
          console.warn("跳过无效数据（缺少必要字段）：", item);
        }
        return hasRequiredFields;
      });

      // 加载成功后，显示默认分类内容
      renderFilteredData(APP_STATE.currentCategory);
    })
    .catch(error => {
      APP_STATE.isLoading = false;
      // 显示具体错误（帮助定位问题，如链接错误、网络问题）
      showError(`加载数据失败：${error.message}<br>请检查：1. GitHub 链接是否正确 2. 网络连接 3. JSON 格式是否合法`);
      console.error("GitHub 数据加载错误：", error);
    });
}

// 7. 筛选指定分类的内容（无搜索时显示）
function renderFilteredData(category) {
  // 从缓存数据中筛选当前分类
  const filteredData = APP_STATE.allData.filter(item => {
    // 严格匹配分类（software/tool，不区分大小写）
    return item.type.toLowerCase() === category.toLowerCase();
  });

  // 处理无数据情况
  if (filteredData.length === 0) {
    showError(`当前「${category === "software" ? "软件" : "工具"}」分类暂无数据<br>请在 GitHub 的 data.json 中添加对应分类的条目`);
    return;
  }

  // 渲染内容卡片
  renderContentCards(filteredData);
}

// 8. 搜索指定分类下的内容（关键词匹配）
function searchData(keyword, category) {
  if (!keyword) return;

  // 1. 先筛选当前分类 2. 再匹配关键词（名称/简介，不区分大小写）
  const searchResult = APP_STATE.allData.filter(item => {
    const isTargetCategory = item.type.toLowerCase() === category.toLowerCase();
    const matchesKeyword = item.name.toLowerCase().includes(keyword.toLowerCase()) 
      || item.intro.toLowerCase().includes(keyword.toLowerCase());
    return isTargetCategory && matchesKeyword;
  });

  // 处理搜索结果
  if (searchResult.length === 0) {
    showError(`未找到包含「${keyword}」的${category === "software" ? "软件" : "工具"}<br>建议：1. 检查关键词拼写 2. 尝试更简短的关键词`);
    return;
  }

  // 渲染搜索结果
  renderContentCards(searchResult);
}

// 9. 渲染内容卡片（软件/工具通用，支持链接有效性校验）
function renderContentCards(items) {
  let cardHtml = "";

  // 截取指定数量的内容（避免过多导致页面过长）
  const displayItems = items.slice(0, CONFIG.itemsPerPage);

  displayItems.forEach(item => {
    // 校验链接有效性（必须以 http/https 开头）
    const isUrlValid = item.url.startsWith("http://") || item.url.startsWith("https://");
    // 处理高亮关键词（如果是搜索结果，关键词标绿）
    const keyword = DOM.searchInput.value.trim().toLowerCase();
    const highlightedName = keyword 
      ? highlightKeyword(item.name, keyword) 
      : item.name;
    const highlightedIntro = keyword 
      ? highlightKeyword(item.intro, keyword) 
      : item.intro;

    // 拼接卡片 HTML（与 style.css 样式对应）
    cardHtml += `
      <div class="item-card">
        <h3>${highlightedName}</h3>
        <p class="intro">${highlightedIntro}</p>
        <a 
          href="${isUrlValid ? item.url : '#'}" 
          target="_blank" 
          class="link-btn"
          ${!isUrlValid ? 'onclick="event.preventDefault(); alert(\'链接无效，请检查 data.json 中的 url 字段\')"' : ''}
        >
          前往官网
        </a>
      </div>
    `;
  });

  // 将卡片插入内容区
  DOM.contentArea.innerHTML = cardHtml;
}

// 10. 辅助函数：关键词高亮（搜索结果中关键词标绿）
function highlightKeyword(text, keyword) {
  if (!keyword) return text;
  // 正则表达式：不区分大小写匹配关键词
  const regex = new RegExp(`(${keyword})`, "gi");
  // 用绿色 span 包裹关键词
  return text.replace(regex, '<span style="color:#2e7d32; font-weight:600;">$1</span>');
}

// 11. 辅助函数：显示加载状态
function showLoading() {
  DOM.contentArea.innerHTML = `
    <div class="loading" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6c757d; font-size: 18px;">
      加载中...
    </div>
  `;
}

// 12. 辅助函数：显示错误信息
function showError(msg) {
  DOM.contentArea.innerHTML = `
    <div class="no-result" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #dc3545; font-size: 16px; line-height: 1.6;">
      ${msg}
    </div>
  `;
}

// 13. 辅助函数：激活分类按钮（更新 UI 状态）
function activateCategoryBtn(category) {
  DOM.categoryBtns.forEach(btn => {
    if (btn.dataset.type === category) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

// 14. 辅助函数：更新搜索框占位符
function updateSearchPlaceholder() {
  DOM.searchInput.placeholder = APP_STATE.currentCategory === "software"
    ? "搜索软件（如：Chrome）..."
    : "搜索工具（如：Canva）...";
}
