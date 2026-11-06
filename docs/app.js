// 新版 Release 沿用 app-release.apk 文件名，官网自动下载最新正式版。
const siteConfig = {
  releasePage: 'https://github.com/Study437/KeepStudy/releases',
  androidApkUrl: 'https://github.com/Study437/KeepStudy/releases/latest/download/app-release.apk',
  androidArm64Url: '',
  androidArm32Url: '',
};

const resources = [
  { id: 'construction', category: 'construction', label: '职业进阶 · 建筑工程', title: '一级建造师 · 系统学习资料', cover: '建筑<br>工程', subtitle: 'BUILD YOUR NEXT CHAPTER', icon: 'building', theme: 'sage', format: '视频课程 / 学习讲义', description: '从知识框架到重点梳理，为职业进阶找到适合自己的学习方向。App 内还可探索造价、监理、安全、消防等工程类资源。' },
  { id: 'graduate', category: 'graduate', label: '目标向前 · 考研升学', title: '研究生备考 · 知识梳理与精讲', cover: '向上<br>生长', subtitle: 'ONE STEP CLOSER', icon: 'cap', theme: 'peach', format: '备考资料 / 知识梳理', description: '让备考从清晰的方向开始。通过分类与关键词发现学习资料，收藏想看的内容，把大目标拆成每一次小小的开始。' },
  { id: 'reading', category: 'reading', label: '精神漫游 · 电子书', title: '读点好书 · 拓宽你的世界', cover: '读点<br>好书', subtitle: 'A WORLD BETWEEN PAGES', icon: 'book', theme: 'lavender', format: '电子书 / 自我成长', description: '给日常留一段阅读的时间。从电子书分类发现感兴趣的内容，收藏一份新知，让好奇心带你看见更大的世界。' },
  { id: 'career', category: 'career', label: '认真准备 · 公务员', title: '公考学习 · 积累每一点进步', cover: '厚积<br>薄发', subtitle: 'LITTLE BY LITTLE', icon: 'briefcase', theme: 'blue', format: '备考资料 / 视频学习', description: '按目标寻找备考资料，用搜索缩小范围，用收藏留下重点。把准备工作融入日常，积累每一点向前的力量。' },
  { id: 'teacher', category: 'career', label: '传递热爱 · 教师', title: '教师学习 · 为热爱再进一步', cover: '传递<br>热爱', subtitle: 'LEARN. GROW. INSPIRE.', icon: 'pencil', theme: 'yellow', format: '学习讲义 / 备考资料', description: '在教师分类中发现学习内容，整理感兴趣的方向。让每一次认真准备，成为走向热爱的下一步。' },
  { id: 'cost', category: 'construction', label: '专业进阶 · 工程造价', title: '造价工程师 · 专业知识学习', cover: '专业<br>进阶', subtitle: 'MAKE ROOM FOR GROWTH', icon: 'building', theme: 'rose', format: '专业资料 / 视频课程', description: '从造价工程师相关分类开始，发现适合当前学习阶段的资料。查看资源详情与目录，按自己的节奏继续学习。' },
];

const categoryTitles = {
  all: '总有一个方向，让你好奇。',
  construction: '为专业积累，为下一程准备。',
  graduate: '向目标靠近，再靠近一点。',
  career: '认真准备的人，自有方向。',
  reading: '翻开一页，看见更大的世界。',
  favorites: '把喜欢的，留给下一次学习。',
};

const grid = document.querySelector('#resource-grid');
const search = document.querySelector('#resource-search');
const downloadDialog = document.querySelector('#download-dialog');
const resourceDialog = document.querySelector('#resource-dialog');
const storageKey = 'keep-study-website-favorites';
let activeCategory = 'all';
let favorites = new Set();
let toastTimer;

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(saved)) favorites = new Set(saved.filter(id => resources.some(resource => resource.id === id)));
} catch {
  // 无痕模式或本地存储不可用时，演示收藏仍可在当前页面使用。
}

function icon(name, className = '') {
  return `<svg class="icon ${className}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
}

function announce(message) {
  const toast = document.querySelector('.toast');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
}

function renderResources() {
  const query = search.value.trim().toLocaleLowerCase('zh-CN');
  const matches = resources.filter(resource => {
    const inCategory = activeCategory === 'all' || (activeCategory === 'favorites' ? favorites.has(resource.id) : resource.category === activeCategory);
    const inSearch = `${resource.title} ${resource.label} ${resource.format}`.toLocaleLowerCase('zh-CN').includes(query);
    return inCategory && inSearch;
  });

  document.querySelector('#category-title').textContent = categoryTitles[activeCategory];
  document.querySelector('.favorite-count').textContent = favorites.size;

  if (!matches.length) {
    grid.innerHTML = `<div class="empty-state">${icon(activeCategory === 'favorites' && !query ? 'star' : 'search')}<strong>${activeCategory === 'favorites' && !query ? '给喜欢的资源，点一颗星。' : '还没找到这个关键词。'}</strong><p>${activeCategory === 'favorites' && !query ? '回到全部方向，收藏想留到下次的内容。' : '换一个关键词，或到 App 中探索更多内容。'}</p><button data-reset-search>${query ? '清空搜索' : '去发现资源'}</button></div>`;
    return;
  }

  grid.innerHTML = matches.map(resource => {
    const saved = favorites.has(resource.id);
    return `<article class="resource-card"><button class="resource-card-open" data-resource="${resource.id}" aria-label="查看演示资源：${resource.title}"><span class="resource-cover theme-${resource.theme}"><span class="cover-label">KEEP STUDY / LEARN SOMETHING NEW</span><span class="cover-title">${resource.cover}<span class="cover-subtitle">${resource.subtitle}</span></span>${icon(resource.icon)}</span><span class="resource-info"><span class="resource-tag">${resource.label}</span><span class="resource-title">${resource.title}</span><span class="resource-format">${resource.format}</span></span></button><button class="resource-save" data-save="${resource.id}" aria-label="${saved ? '取消收藏' : '收藏'}：${resource.title}" aria-pressed="${saved}">${icon('star')}</button></article>`;
  }).join('');
}

function setCategory(category) {
  activeCategory = category;
  search.value = '';
  document.querySelectorAll('[data-category]').forEach(button => {
    const selected = button.dataset.category === category;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  renderResources();
}

function toggleFavorite(id) {
  const wasSaved = favorites.has(id);
  if (wasSaved) favorites.delete(id);
  else favorites.add(id);
  try {
    localStorage.setItem(storageKey, JSON.stringify([...favorites]));
  } catch {
    // 收藏状态保留在内存中，不影响交互。
  }
  renderResources();
  const focusTarget = document.querySelector(`[data-save="${id}"]`) || document.querySelector('[data-category="favorites"]');
  focusTarget.focus({ preventScroll: true });
  announce(wasSaved ? '已取消收藏' : '已加入演示收藏，留给下一次学习');
}

function showDialog(dialog) {
  dialog.showModal();
  document.body.style.overflow = 'hidden';
}

function usableDownloadUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value, document.baseURI);
    return url.protocol === 'https:' || (url.origin === location.origin && url.protocol === 'http:') ? url.href : null;
  } catch {
    return null;
  }
}

function showDownload() {
  const options = document.querySelector('#download-options');
  options.replaceChildren();
  const versions = [
    { url: siteConfig.androidApkUrl, title: 'Android 安装包', subtitle: '官方发布安装包 · Android 7.0 及以上' },
    { url: siteConfig.androidArm64Url, title: 'Android 64 位', subtitle: '适用于大多数 Android 手机 · ARM64' },
    { url: siteConfig.androidArm32Url, title: 'Android 32 位', subtitle: '适用于部分较早的 Android 设备 · ARMv7' },
  ].filter(version => usableDownloadUrl(version.url));

  document.querySelector('.dialog-description').textContent = versions.length === 1
    ? '下载 Android 安装包，开始探索学习资源。'
    : versions.length > 1 ? '选择适合设备的 Android 安装包。' : '好资源，值得认真准备。';

  if (versions.length) {
    for (const [index, version] of versions.entries()) {
      const link = document.createElement('a');
      link.className = `button download-option ${index === 0 ? 'button-primary' : 'button-dark'}`;
      link.href = usableDownloadUrl(version.url);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.innerHTML = `<span>${version.title}<small>${version.subtitle}</small></span>${icon('download')}`;
      options.append(link);
    }
  } else {
    const status = document.createElement('div');
    status.className = 'download-pending';
    status.innerHTML = `<strong>Android 安装包尚未公开发布</strong><p>安装包就绪后会在官方渠道提供。你可以前往发布页查看当前发布情况。</p>`;
    const releaseLink = document.createElement('a');
    releaseLink.className = 'text-link';
    releaseLink.href = siteConfig.releasePage;
    releaseLink.target = '_blank';
    releaseLink.rel = 'noopener noreferrer';
    releaseLink.innerHTML = `前往官方发布页 ${icon('arrow-up')}`;
    status.append(releaseLink);
    options.append(status);
  }
  showDialog(downloadDialog);
}

function showResource(id) {
  const resource = resources.find(item => item.id === id);
  if (!resource) return;
  document.querySelector('#resource-detail').innerHTML = `<div class="resource-detail-icon theme-${resource.theme}">${icon(resource.icon)}</div><span class="detail-tag">${resource.label}</span><h2 id="resource-dialog-title">${resource.title}</h2><p class="detail-description">${resource.description}</p>`;
  showDialog(resourceDialog);
}

document.querySelectorAll('[data-download]').forEach(button => button.addEventListener('click', showDownload));
document.querySelector('#detail-download').addEventListener('click', () => {
  resourceDialog.close();
  showDownload();
});

document.querySelectorAll('.app-dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (!document.querySelector('dialog[open]')) document.body.style.overflow = '';
  });
});

document.querySelectorAll('[data-category]').forEach(button => {
  button.addEventListener('click', () => setCategory(button.dataset.category));
});

grid.addEventListener('click', event => {
  const save = event.target.closest('[data-save]');
  const resource = event.target.closest('[data-resource]');
  if (save) toggleFavorite(save.dataset.save);
  else if (resource) showResource(resource.dataset.resource);
  else if (event.target.closest('[data-reset-search]')) {
    if (search.value.trim()) {
      search.value = '';
      renderResources();
      search.focus({ preventScroll: true });
    } else {
      setCategory('all');
      document.querySelector('[data-category="all"]').focus({ preventScroll: true });
    }
  }
});
search.addEventListener('input', renderResources);

document.querySelector('[data-show-favorites]').addEventListener('click', () => setCategory('favorites'));

const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('.mobile-nav');
function closeMenu() {
  mobileNav.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', '打开导航');
}
menuButton.addEventListener('click', () => {
  const opening = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.setAttribute('aria-label', opening ? '关闭导航' : '打开导航');
  mobileNav.hidden = !opening;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
matchMedia('(min-width: 701px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

renderResources();
document.querySelector('#copyright-year').textContent = new Date().getFullYear();

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('js');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.06 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}
