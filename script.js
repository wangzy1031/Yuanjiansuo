// 1. 配置 Algolia（替换为你的 Algolia 信息！）
const ALGOLIA_APP_ID = "RZOWXGOWIK"; // 如：K2QXXXXXX
const ALGOLIA_SEARCH_KEY = "810cb27d5df9d22cd078aa808c8b5b18"; // 如：a1b2c3d4e5f6XXXX
const ALGOLIA_INDEX_NAME = "yuanjiansuo"; // 你创建的 Index 名称

// 初始化 Algolia 客户端
const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
const index = searchClient.initIndex(ALGOLIA_INDEX_NAME);

// 2. 获取 DOM 元素
const menuBtns = document.querySelectorAll(".menu-btn"); // 软件/工具按钮
const searchInput = document.getElementById("search-input"); // 搜索框
const searchBtn = document.getElementById("search-btn"); // 搜索按钮
const contentArea = document.getElementById("content-area"); // 内容展示区
const aboutBtn = document.getElementById("about-btn"); // 关于按钮
const aboutPanel = document.getElementById("about-panel"); // 关于面板

// 3. 全局变量（当前选中类型：software/tool）
let currentType = "software";

// 4. 初始化：加载精选内容（默认加载软件）
window.onload = () => {
  loadFeaturedItems(currentType);
  updateSearchPlaceholder();
};

// 5. 切换软件/工具导航
menuBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    // 更新按钮激活状态
    menuBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    
    // 更新当前类型并加载精选内容
    currentType = btn.dataset.type;
    loadFeaturedItems(currentType);
    updateSearchPlaceholder();
    
    // 清空搜索框
    searchInput.value = "";
  });
});

// 6. 搜索功能（点击搜索按钮）
searchBtn.addEventListener("click", () => {
  const keyword = searchInput.value.trim();
  if (keyword) {
    searchItems(keyword, currentType);
  } else {
    // 无关键词时加载精选
    loadFeaturedItems(currentType);
  }
});

// 7. 搜索功能（按回车键）
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const keyword = searchInput.value.trim();
    if (keyword) {
      searchItems(keyword, currentType);
    } else {
      loadFeaturedItems(currentType);
    }
  }
});

// 8. 关于面板切换（展开/收起）
aboutBtn.addEventListener("click", () => {
  aboutPanel.classList.toggle("hidden");
});

// 9. 加载精选内容（无搜索时显示）
function loadFeaturedItems(type) {
  // 显示加载状态
  contentArea.innerHTML = '<div class="loading">加载中...</div>';

  // 从 Algolia 查询对应类型的所有数据（作为精选）
  index
    .search("", {
      filters: `type:"${type}"`, // 筛选类型：software/tool
      hitsPerPage: 20, // 最多显示20条
    })
    .then((response) => {
      renderItems(response.hits);
    })
    .catch((error) => {
      contentArea.innerHTML = '<div class="no-result">加载失败，请刷新重试</div>';
      console.error("加载精选失败：", error);
    });
}

// 10. 搜索内容（关键词匹配）
function searchItems(keyword, type) {
  // 显示加载状态
  contentArea.innerHTML = '<div class="loading">搜索中...</div>';

  // 从 Algolia 搜索：匹配名称/简介，且筛选类型
  index
    .search(keyword, {
      attributesToSearch: ["name", "intro"], // 搜索“名称”和“简介”字段
      filters: `type:"${type}"`, // 只搜索当前类型（软件/工具）
      hitsPerPage: 20,
    })
    .then((response) => {
      if (response.hits.length === 0) {
        contentArea.innerHTML = '<div class="no-result">未找到相关结果，请更换关键词</div>';
      } else {
        renderItems(response.hits);
      }
    })
    .catch((error) => {
      contentArea.innerHTML = '<div class="no-result">搜索失败，请刷新重试</div>';
      console.error("搜索失败：", error);
    });
}

// 11. 渲染内容卡片（精选/搜索结果通用）
function renderItems(items) {
  let html = "";
  items.forEach((item) => {
    // 拼接卡片 HTML（每个卡片包含名称、简介、官网链接）
    html += `
      <div class="item-card">
        <h3>${item.name}</h3>
        <p class="intro">${item.intro}</p>
        <a href="${item.url}" target="_blank" class="link-btn">前往官网</a>
      </div>
    `;
  });
  // 将卡片插入内容区
  contentArea.innerHTML = html;
}

// 12. 更新搜索框占位符（根据当前类型切换）
function updateSearchPlaceholder() {
  if (currentType === "software") {
    searchInput.placeholder = "搜索软件...";
  } else {
    searchInput.placeholder = "搜索工具...";
  }
}
