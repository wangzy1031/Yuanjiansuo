// 1. 本地数据
const LOCAL_DATA = [
  // 软件类（software）
  {
    type: "software",
    name: "Chrome 浏览器",
    url: "https://www.google.com/chrome/",
    intro: "安全的跨平台浏览器，支持多标签页、扩展插件和同步功能"
  },
  {
    type: "software",
    name: "VS Code",
    url: "https://code.visualstudio.com/",
    intro: "微软出品的免费代码编辑器，支持语法高亮、代码补全和多语言开发"
  },
  {
    type: "software",
    name: "微信 PC版",
    url: "https://pc.weixin.qq.com/",
    intro: "微信官方电脑客户端，支持消息同步、文件传输和公众号/小程序访问"
  },
  {
    type: "software",
    name: "PotPlayer",
    url: "https://potplayer.daum.net/",
    intro: "强大的本地视频播放器，可自定义皮肤和字幕"
  },
  {
    type: "software",
    name: "WinRAR",
    url: "https://www.win-rar.com/",
    intro: "经典压缩解压工具，支持 ZIP、RAR 等多种格式，压缩率高"
  },
  {
    type: "software",
    name: "Office2021",
    url: "https://consumer-tkbdownload.huawei.com/ctkbfm/servlet/download/downloadServlet/H4sIAAAAAAAAAD2Qy0rDQBiF32XWVf65ZSauzJW6URf1AXK1AzUtaaIYcVmwKAjiUnBRkC5sly6y8WmG-BhOJLg5cPgP5_84d6heZuXkdpGhI4TRCKXzm2Kw1NhczbLT6Kq3Z3mukowAwXr_pdudfnnSu4_u9b1bP-jVZ69v26791vv1z2bVbR91-3zYqMXQch5VU9MScyA5pxALTJmV88gSVhyDTJOEcZFzk45Vc5Ka6Ng5bqYHSQFgSckYM6ekzKJKzYuJ6pGwBTajwAADwAgt1WURVXXZwwrJbOoFRi2HcMo9HzPuCu4SzImUGMuQOFw4numlfijtAPteGAAObCw8V5hf19FMpRf_61Rlnf2xDeuMHXT_C59MHf0-AQAA.zip",
    intro: "微软office办公套件，包含Word、Excel、PowerPoint等常用软件，注意：为下载链接"
  },
  {
    type: "software",
    name: "Office2019",
    url: "https://consumer-tkbdownload.huawei.com/ctkbfm/servlet/download/downloadServlet/H4sIAAAAAAAAAD2QwUrDQBiE32XPVf7N7mZ3PZmmCfWiHuoDbJKNXahpSVPFiseCRUEQj4KHgvRge_SQi0-zxMdwI8HLD8M_zHzMHVrMdTm6nWl0hDDqoWx6U3SSOJmbiT5VV608y3OTag-wtPsvW-_sy5PdfTSv7836wa4-2_u2bepvu1__bFbN9tHWz4dLM-tSzlU1dimJUgKnvs-IJlRIKjzKRKKlzmRCM_CcOzHLk8xZh8HxcnyQFgC-EJRS90pLrSozLUamRcI-SEqAAgaAHpqby0JVi7KFZTSGAWcRx4LgkIdB6OHQ40HMOQZGMcRRFA0w44zEYSSl7A-8mEsf-hD3CQlc17WamOzif52qXOg_tm6dYYDufwGJh0WcPgEAAA%3D%3D.zip",
    intro: "微软office办公套件，包含Word、Excel、PowerPoint等常用软件，注意：为下载链接"
  },
  {
    type: "software",
    name: "Office2016",
    url: "https://consumer-tkbdownload.huawei.com/ctkbfm/servlet/download/downloadServlet/H4sIAAAAAAAAAD2QzUrDQBSF32XWVe7MnZnOuDJpU-pGXdQHyM_UDtS0pIlixGXBoiCIS8GFIF3YLl1k49MM8TFMSnFz4XAP53ycO1IsTDa6nRtyRCjpkGR2k-4lNnJsp-Y0vGrl2XhsY8OASrf9dtXGvTy5zWf9-l6vHtzyq71v67r6cdvV78eyXj-66vmwtPN9ynmYT5oUmWAku4yBpoLLbqhi5EnEmTHcRILzxh3Z8iRprEPvuJwcxCmAVIrvXnFmwtzO0pFtkagEzRE4UADokIW9TMO8yFpY5vcDSqnwUarBALHPODLUPcUCxqQPFD3OFTKFqLXo-RKkDjQXQgYgfN9ruq7DqU0u_tfJs8Ls2PbrDD1y_wemyLu7PgEAAA%3D%3D.zip",
    intro: "微软office办公套件，包含Word、Excel、PowerPoint等常用软件，注意：为下载链接"
  },
  // 工具类（tool）
  {
    type: "tool",
    name: "Canva 可画",
    url: "https://www.canva.com/zh_cn/",
    intro: "在线设计工具，提供海报、PPT、简历等模板，拖拽操作无需设计基础"
  },
  {
    type: "tool",
    name: "Notion",
    url: "https://www.notion.so/zh-cn/",
    intro: "多功能笔记与协作平台，支持文档、表格、看板管理，可自定义工作流"
  },
  {
    type: "tool",
    name: "TinyPNG",
    url: "https://tinypng.com/",
    intro: "免费在线图片压缩工具，减少文件体积且保持画质，支持批量处理"
  },
  {
    type: "tool",
    name: "Figma",
    url: "https://www.figma.com/",
    intro: "在线 UI 设计与协作工具，支持多人实时协作和矢量图形编辑"
  }
];

// 2. 全局状态管理（无需修改）
const APP_STATE = {
  currentCategory: "software", // 默认显示「软件」分类
  allData: [] // 存储筛选后的有效数据
};

// 3. DOM 元素缓存
const DOM = {
  categoryBtns: document.querySelectorAll(".menu-btn"),
  searchInput: document.getElementById("search-input"),
  searchBtn: document.getElementById("search-btn"),
  contentArea: document.getElementById("content-area"),
  aboutBtnTop: document.getElementById("about-btn-top"),
  aboutPanelTop: document.getElementById("about-panel-top"),
  aboutBtnSide: document.getElementById("about-btn-side"),
  aboutPanelSide: document.getElementById("about-panel-side")
};

// 4. 页面初始化
document.addEventListener("DOMContentLoaded", () => {
  // 初始化数据
  APP_STATE.allData = LOCAL_DATA;
  // 默认激活软件下载分类按钮
  if (DOM.categoryBtns.length > 0) {
    DOM.categoryBtns[0].classList.add("active");
    APP_STATE.currentCategory = DOM.categoryBtns[0].dataset.type || "software";
  }
  // 渲染默认分类内容
  renderFilteredData(APP_STATE.currentCategory);
  // 绑定交互事件
  bindAllEventListeners();
});

// 手机端菜单展开/收起逻辑（适配顶部栏）
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".sidebar");
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const aboutBtnTop = document.getElementById("about-btn-top");
  const aboutPanelTop = document.getElementById("about-panel-top");
  const aboutBtnSide = document.getElementById("about-btn-side");
  const aboutPanelSide = document.getElementById("about-panel-side");

  // 手机端菜单展开/收起
  function checkMobileMenuBtn() {
    if (window.innerWidth <= 768) {
      mobileMenuBtn.style.display = "block";
      sidebar.classList.remove("active");
      aboutPanelTop.classList.add("hidden");
      aboutPanelSide.classList.add("hidden");
    } else {
      mobileMenuBtn.style.display = "none";
      sidebar.classList.remove("active");
      aboutPanelTop.classList.add("hidden");
      aboutPanelSide.classList.add("hidden");
    }
  }
  checkMobileMenuBtn();
  window.addEventListener("resize", checkMobileMenuBtn);

  mobileMenuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    aboutPanelTop.classList.add("hidden");
    aboutPanelSide.classList.add("hidden");
  });

  // 手机端关于按钮弹窗
  aboutBtnTop.addEventListener("click", () => {
    aboutPanelTop.classList.toggle("hidden");
    sidebar.classList.remove("active");
  });

  if (aboutBtnSide && aboutPanelSide) {
    aboutBtnSide.addEventListener("click", () => {
      aboutPanelSide.classList.toggle("hidden");
    });

    // 点击弹窗外部关闭弹窗（仅电脑端）
    document.addEventListener("click", (e) => {
      if (
        window.innerWidth > 768 &&
        !aboutPanelSide.classList.contains("hidden") &&
        !aboutPanelSide.contains(e.target) &&
        e.target !== aboutBtnSide
      ) {
        aboutPanelSide.classList.add("hidden");
      }
    });
  }

  // 点击侧边栏任意按钮后自动收起
  sidebar.querySelectorAll(".menu-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("active");
      }
    });
  });
});

// 5. 渲染指定分类内容
function renderFilteredData(category) {
  const filteredData = APP_STATE.allData.filter(item =>
    item.type.toLowerCase() === category.toLowerCase()
  );
  if (filteredData.length === 0) {
    DOM.contentArea.innerHTML = `<div class="no-result">当前分类暂无内容</div>`;
    return;
  }
  let cardHtml = "";
  filteredData.forEach(item => {
    cardHtml += `
      <div class="item-card">
        <h3>${item.name}</h3>
        <p class="intro">${item.intro}</p>
        <a href="${item.url}" target="_blank" class="link-btn">前往官网</a>
      </div>
    `;
  });
  DOM.contentArea.innerHTML = cardHtml;
}

// 6. 绑定所有交互事件（分类/搜索/关于面板，无需修改）
function bindAllEventListeners() {
  // 分类切换事件
  DOM.categoryBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetCategory = btn.dataset.type;
      // 避免重复点击当前分类
      if (targetCategory === APP_STATE.currentCategory) return;

      // 更新状态和 UI
      APP_STATE.currentCategory = targetCategory;
      activateCategoryBtn(targetCategory);
      DOM.searchInput.value = ""; // 清空搜索框
      if (DOM.searchInputMobile) DOM.searchInputMobile.value = "";
      updateSearchPlaceholder();
      renderFilteredData(targetCategory); // 渲染目标分类内容
    });
  });

  // 搜索按钮点击事件（PC端）
  DOM.searchBtn.addEventListener("click", () => {
    const keyword = DOM.searchInput.value.trim();
    // 有关键词则搜索，无关键词则显示全部分类内容
    keyword ? searchData(keyword) : renderFilteredData(APP_STATE.currentCategory);
  });

  // 搜索按钮点击事件（手机端）
  if (DOM.searchBtnMobile && DOM.searchInputMobile) {
    DOM.searchBtnMobile.addEventListener("click", () => {
      const keyword = DOM.searchInputMobile.value.trim();
      // 有关键词则搜索，无关键词则显示全部分类内容
      keyword ? searchData(keyword) : renderFilteredData(APP_STATE.currentCategory);
    });
    DOM.searchInputMobile.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.keyCode === 13) {
        DOM.searchBtnMobile.click();
      }
    });
  }

  // 回车键触发搜索（PC端）
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

// 7. 搜索功能（匹配名称/简介，支持关键词高亮，无需修改）
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

// 8. 渲染内容卡片（样式与交互，无需修改）
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

// 9. 辅助函数：关键词高亮（搜索结果标绿，无需修改）
function highlightKeyword(text, keyword) {
  if (!keyword) return text;
  // 正则匹配关键词（不区分大小写）
  const regex = new RegExp(`(${keyword})`, "gi");
  // 用绿色加粗样式包裹关键词
  return text.replace(regex, '<span style="color: #2e7d32; font-weight: 600;">$1</span>');
}

// 10. 辅助函数：激活分类按钮（添加 active 样式，无需修改）
function activateCategoryBtn(category) {
  DOM.categoryBtns.forEach(btn => {
    if (btn.dataset.type === category) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

// 11. 辅助函数：更新搜索框占位符（根据分类切换，无需修改）
function updateSearchPlaceholder() {
  DOM.searchInput.placeholder = APP_STATE.currentCategory === "software"
    ? "搜索软件（如：Chrome、VS Code）..."
    : "搜索工具（如：Canva、Notion）...";
}
