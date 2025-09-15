// 1. 【核心】本地内嵌数据（直接在这里添加/修改软件/工具，无需外部文件）
// 格式说明：type 只能是 "software"（软件）或 "tool"（工具），确保每个条目都有 name/url/intro
const LOCAL_DATA = [
  // -------------------------- 软件类（software）--------------------------
  {
    "type": "software",
    "name": "Google Chrome",
    "url": "https://www.google.com/chrome/",
    "intro": "快速、安全的跨平台浏览器，支持多标签页、扩展插件和同步功能"
  },
  {
    "type": "software",
    "name": "Visual Studio Code",
    "url": "https://code.visualstudio.com/",
    "intro": "免费开源的轻量级代码编辑器，支持语法高亮、代码补全和多语言开发"
  },
  {
    "type": "software",
    "name": "微信电脑版",
    "url": "https://pc.weixin.qq.com/",
    "intro": "微信官方电脑客户端，支持消息同步、文件传输和公众号/小程序访问"
  },
  {
    "type": "software",
    "name": "PotPlayer",
    "url": "https://potplayer.daum.net/",
    "intro": "功能强大的视频播放器，支持几乎所有格式，可自定义皮肤和字幕"
  },
  {
    "type": "software",
    "name": "7-Zip",
    "url": "https://www.7-zip.org/",
    "intro": "免费开源的压缩工具，支持 ZIP、RAR 等多种格式，压缩率高"
  },

  // -------------------------- 工具类（tool）--------------------------
  {
    "type": "tool",
    "name": "Canva 可画",
    "url": "https://www.canva.com/zh_cn/",
    "intro": "在线设计工具，提供海报、PPT、简历等模板，拖拽操作无需设计基础"
  },
  {
    "type": "tool",
    "name": "Notion",
    "url": "https://www.notion.so/zh-cn/",
    "intro": "多功能协作工具，支持文档、表格、看板管理，可自定义工作流"
  },
  {
    "type": "tool",
    "name": "TinyPNG",
    "url": "https://tinypng.com/",
    "intro": "免费在线图片压缩工具，减少文件体积且保持画质，支持批量处理"
  },
  {
    "type": "tool",
    "name": "Markdown Here",
    "url": "https://markdown-here.com/",
    "intro": "浏览器插件/邮箱插件，可将 Markdown 格式文本实时渲染为富文本"
  },
  {
    "type": "tool",
    "name": "Figma",
    "url": "https://www.figma.com/",
    "intro": "在线 UI 设计工具，支持实时协作、原型制作和矢量图形编辑"
  }
];

// 2. 全局状态管理（无需修改）
const APP_STATE = {
  currentCategory: "software", // 默认显示「软件」分类
  allData: [] // 存储筛选后的有效数据
};

// 3. DOM 元素缓存（无需修改，确保 HTML 中元素 ID/class 匹配）
const DOM = {
  categoryBtns: document.querySelectorAll(".menu-btn"), // 分类切换按钮（需有 data-type 属性）
  searchInput: document.getElementById("search-input"), // 搜索框（ID 必须为 search-input）
  searchBtn: document.getElementById("search-btn"),     // 搜索按钮（ID 必须为 search-btn）
  contentArea: document.getElementById("content-area"), // 内容展示区（ID 必须为 content-area）
  aboutBtn: document.getElementById("about-btn"),       // 关于按钮（ID 必须为 about-btn）
  aboutPanel: document.getElementById("about-panel")    // 关于面板（ID 必须为 about-panel）
};

// 4. 页面初始化（加载数据+绑定事件，无需修改）
document.addEventListener("DOMContentLoaded", () => {
  // 初始化数据（筛选有效条目，避免格式错误）
  initLocalData();
  // 绑定所有交互事件
  bindAllEventListeners();
  // 激活默认分类按钮
  activateCategoryBtn(APP_STATE.currentCategory);
  // 更新搜索框占位符
  updateSearchPlaceholder();
  // 渲染默认分类内容
  renderFilteredData(APP_STATE.currentCategory);
});

// 5. 初始化本地数据（筛选有效条目，无需修改）
function initLocalData() {
  // 过滤无效数据：确保每个条目有 type/name/url/intro，且 type 符合规范
  APP_STATE.allData = LOCAL_DATA.filter(item => {
    const hasRequiredFields = !!item.type && !!item.name && !!item.url && !!item.intro;
    const isValidType = item.type.toLowerCase() === "software" || item.type.toLowerCase() === "tool";
    // 无效数据打印警告（便于排查）
    if (!hasRequiredFields || !isValidType) {
      console.warn("跳过无效数据（缺少字段或类型错误）：", item);
    }
    return hasRequiredFields && isValidType;
  });

  // 提示数据加载结果
  console.log(`✅ 本地数据初始化完成，共加载 ${APP_STATE.allData.length} 条有效内容`);
}

// 6. 绑定所有交互事件（分类/搜索/关于面板，无需修改）
function bindAllEventListeners() {
  // 6.1 分类切换事件
  DOM.categoryBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetCategory = btn.dataset.type;
      // 避免重复点击当前分类
      if (targetCategory === APP_STATE.currentCategory) return;

      // 更新状态和 UI
      APP_STATE.currentCategory = targetCategory;
      activateCategoryBtn(targetCategory);
      DOM.searchInput.value = ""; // 清空搜索框
      updateSearchPlaceholder();
      renderFilteredData(targetCategory); // 渲染目标分类内容
    });
  });

  // 6.2 搜索按钮点击事件
  DOM.searchBtn.addEventListener("click", () => {
    const keyword = DOM.searchInput.value.trim();
    // 有关键词则搜索，无关键词则显示全部分类内容
    keyword ? searchData(keyword) : renderFilteredData(APP_STATE.currentCategory);
  });

  // 6.3 回车键触发搜索
  DOM.searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      DOM.searchBtn.click();
    }
  });

  // 6.4 关于面板展开/收起
  DOM.aboutBtn.addEventListener("click", () => {
    DOM.aboutPanel.classList.toggle("hidden");
  });
}

// 7. 渲染指定分类的内容（无需修改）
function renderFilteredData(category) {
  // 筛选当前分类的内容（不区分大小写，兼容输入错误）
  const filteredData = APP_STATE.allData.filter(item => 
    item.type.toLowerCase() === category.toLowerCase()
  );

  // 无数据时显示提示
  if (filteredData.length === 0) {
    DOM.contentArea.innerHTML = `
      <div class="no-result" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6c757d; font-size: 16px;">
        当前「${category === "software" ? "软件" : "工具"}」分类暂无内容
      </div>
    `;
    return;
  }

  // 有数据则渲染卡片
  renderContentCards(filteredData);
}

// 8. 搜索功能（匹配名称/简介，支持关键词高亮，无需修改）
function searchData(keyword) {
  // 双重筛选：先匹配分类，再匹配关键词（不区分大小写）
  const searchResult = APP_STATE.allData.filter(item => {
    const matchesCategory = item.type.toLowerCase() === APP_STATE.currentCategory.toLowerCase();
    const matchesKeyword = item.name.toLowerCase().includes(keyword.toLowerCase()) 
      || item.intro.toLowerCase().includes(keyword.toLowerCase());
    return matchesCategory && matchesKeyword;
  });

  // 无搜索结果时显示提示
  if (searchResult.length === 0) {
    DOM.contentArea.innerHTML = `
      <div class="no-result" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6c757d; font-size: 16px;">
        未找到包含「${keyword}」的${APP_STATE.currentCategory === "software" ? "软件" : "工具"}<br>
        建议尝试更简短的关键词
      </div>
    `;
    return;
  }

  // 渲染搜索结果（含关键词高亮）
  renderContentCards(searchResult);
}

// 9. 渲染内容卡片（样式与交互，无需修改）
function renderContentCards(items) {
  let cardHtml = "";

  items.forEach(item => {
    // 校验链接有效性（避免无效链接点击报错）
    const isUrlValid = item.url.startsWith("http://") || item.url.startsWith("https://");
    // 关键词高亮（搜索时标绿）
    const keyword = DOM.searchInput.value.trim().toLowerCase();
    const highlightedName = highlightKeyword(item.name, keyword);
    const highlightedIntro = highlightKeyword(item.intro, keyword);

    // 拼接卡片 HTML（与 CSS 样式对应，可根据需求调整样式）
    cardHtml += `
      <div class="item-card" style="margin: 15px; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h3 style="margin-top: 0; color: #2d3748; font-size: 18px;">${highlightedName}</h3>
        <p class="intro" style="color: #4a5568; line-height: 1.6; margin: 10px 0 20px;">${highlightedIntro}</p>
        <a 
          href="${isUrlValid ? item.url : '#'}" 
          target="_blank" 
          class="link-btn"
          style="display: inline-block; padding: 8px 16px; background: #2bb053ff; color: white; text-decoration: none; border-radius: 4px;"
          ${!isUrlValid ? 'onclick="event.preventDefault(); alert(\'链接无效，请检查数据中的 url 字段\')"' : ''}
        >
          前往官网
        </a>
      </div>
    `;
  });

  // 将卡片插入内容区（若需分页，可在此处添加分页逻辑）
  DOM.contentArea.innerHTML = cardHtml;
}

// 10. 辅助函数：关键词高亮（搜索结果标绿，无需修改）
function highlightKeyword(text, keyword) {
  if (!keyword) return text;
  // 正则匹配关键词（不区分大小写）
  const regex = new RegExp(`(${keyword})`, "gi");
  // 用绿色加粗样式包裹关键词
  return text.replace(regex, '<span style="color: #2e7d32; font-weight: 600;">$1</span>');
}

// 11. 辅助函数：激活分类按钮（添加 active 样式，无需修改）
function activateCategoryBtn(category) {
  DOM.categoryBtns.forEach(btn => {
    if (btn.dataset.type === category) {
      btn.classList.add("active");
      // 可在此处添加 active 样式（若 CSS 中未定义）
      btn.style.cssText = "background: #2abb90ff; color: white;";
    } else {
      btn.classList.remove("active");
      btn.style.cssText = "background: #e2e8f0; color: #2d3748;";
    }
  });
}

// 12. 辅助函数：更新搜索框占位符（根据分类切换，无需修改）
function updateSearchPlaceholder() {
  DOM.searchInput.placeholder = APP_STATE.currentCategory === "software"
    ? "搜索软件（如：Chrome、VS Code）..."
    : "搜索工具（如：Canva、Notion）...";
}
