const PROFILE_URL = '/profile.json';
const POSTS_INDEX_URL = '/posts/index.json';
const POSTS_DIR = '/posts';

let profile = null;
let allPosts = null;
let currentPage = '';  // 'home' | 'series' | 'post'

// ==========================================
// Init
// ==========================================
function init() {
  handleRoute();
  window.addEventListener('hashchange', handleRoute);
}

function handleRoute() {
  const hash = window.location.hash.slice(1);
  if (!hash) { currentPage = 'home'; renderHome(); return; }
  if (hash.startsWith('series/')) {
    currentPage = 'series';
    renderSeries(decodeURIComponent(hash.slice(7)));
    return;
  }
  const slashIdx = hash.lastIndexOf('/');
  if (slashIdx !== -1) {
    currentPage = 'post';
    renderPost(hash.slice(slashIdx + 1));
    return;
  }
  currentPage = 'post';
  renderPost(hash);
}

// ==========================================
// Frontmatter Parser
// ==========================================
function parseFrontmatter(md) {
  const match = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: md };
  const yaml = match[1], content = match[2], data = {};
  let currentKey = null;
  for (const line of yaml.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    if (t.startsWith('- ') && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(t.slice(2).trim());
      continue;
    }
    const ci = t.indexOf(':');
    if (ci !== -1) { currentKey = t.slice(0, ci).trim(); data[currentKey] = t.slice(ci + 1).trim() || []; }
  }
  return { data, content };
}

// ==========================================
// Escape HTML
// ==========================================
function escapeHtml(str) {
  if (str == null) return '';
  const d = document.createElement('div');
  d.textContent = String(str);
  return d.innerHTML;
}

// ==========================================
// Strip markdown for excerpts
// ==========================================
function stripMarkdown(md) {
  return md
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/[*_](.+?)[*_]/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.+?)\]\(.*?\)/g, '$1')
    .replace(/^>\s+/gm, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

// ==========================================
// Fetch all posts metadata (cached)
// ==========================================
async function fetchAllPosts() {
  if (allPosts) return allPosts;
  const resp = await fetch(POSTS_INDEX_URL);
  const ids = await resp.json();
  const posts = [];
  for (const id of ids) {
    try {
      const r = await fetch(`${POSTS_DIR}/${id}.md`);
      if (!r.ok) continue;
      const { data } = parseFrontmatter(await r.text());
      posts.push({ id, ...data });
    } catch (e) { console.warn('Post load fail:', id); }
  }
  allPosts = posts;
  return posts;
}

// ==========================================
// Group by series + stats
// ==========================================
function groupBySeries(posts) {
  const map = new Map(), uncategorized = [];
  for (const p of posts) {
    if (p.series) { if (!map.has(p.series)) map.set(p.series, []); map.get(p.series).push(p); }
    else uncategorized.push(p);
  }
  const sorter = (a, b) => new Date(b.date) - new Date(a.date);
  for (const arr of map.values()) arr.sort(sorter);
  uncategorized.sort(sorter);
  const entries = [...map.entries()].sort((a, b) => new Date(b[1][0].date) - new Date(a[1][0].date));
  const totalSeries = entries.length + (uncategorized.length > 0 ? 1 : 0);
  return { entries, uncategorized, totalSeries, totalPosts: posts.length };
}

// ==========================================
// Running time (live clock)
// ==========================================
let _siteStart = null;

function runningTime() {
  const d = new Date(_siteStart);
  const now = new Date();
  let diff = Math.floor((now - d) / 1000); // total seconds

  const days = Math.floor(diff / 86400);  diff -= days * 86400;
  const hours = Math.floor(diff / 3600);   diff -= hours * 3600;
  const mins = Math.floor(diff / 60);      diff -= mins * 60;
  const secs = diff;

  return { days, hours, mins, secs };
}

function formatRuntime(t) {
  const parts = [];
  if (t.days > 0) parts.push(`${t.days} 天`);
  parts.push(`${t.hours} 时`);
  parts.push(`${t.mins} 分`);
  parts.push(`${t.secs} 秒`);
  return parts.join(' ');
}

let _clockTimer = null;

function startClock() {
  if (_clockTimer) return;
  _clockTimer = setInterval(() => {
    const el = document.getElementById('runtime');
    if (!el) { clearInterval(_clockTimer); _clockTimer = null; return; }
    el.textContent = '已运行 ' + formatRuntime(runningTime());
  }, 1000);
}

// ==========================================
// Sidebar
// ==========================================
function renderSidebar(activePage) {
  const homeClass = activePage === 'home' ? 'nav-active' : '';
  const seriesClass = activePage === 'series' ? 'nav-active' : '';

  let html = `
    <div class="profile-header">
      <img src="${escapeHtml(profile.avatar)}" alt="Avatar" class="avatar">
      <h1>${escapeHtml(profile.name)}</h1>
      <p class="title">${escapeHtml(profile.title)}</p>
    </div>`;

  // Nav buttons
  html += `
    <div class="sidebar-nav">
      <a href="#" class="nav-link ${homeClass}">首页</a>
      <a href="#series/" class="nav-link ${seriesClass}">合集</a>
    </div>`;

  html += `
    <p class="bio">${escapeHtml(profile.bio)}</p>
    <p class="email">${escapeHtml(profile.email)}</p>`;

  // Social links
  html += '<div class="social-links">';
  for (const link of profile.social_links) {
    html += `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener" class="btn">${escapeHtml(link.name)}</a>`;
  }
  html += '</div>';

  return html;
}

function renderStats(posts, seriesCount) {
  const t = runningTime();
  let html = '<div class="sidebar-stats">';
  html += `<span>${posts.length} 篇文章</span>`;
  html += `<span>${seriesCount} 个分类</span>`;
  html += `<span id="runtime">已运行 ${formatRuntime(t)}</span>`;
  html += '</div>';
  return html;
}

// ==========================================
// Load profile (cached)
// ==========================================
async function loadProfile() {
  if (profile) return;
  profile = await (await fetch(PROFILE_URL)).json();
  if (profile.site_since) _siteStart = profile.site_since;
}

// ==========================================
// Fetch full post with content
// ==========================================
async function fetchPostWithContent(id) {
  const resp = await fetch(`${POSTS_DIR}/${id}.md`);
  if (!resp.ok) throw new Error('Not found');
  const md = await resp.text();
  const { data, content } = parseFrontmatter(md);
  return { id, ...data, content };
}

// ==========================================
// HOME: random posts with excerpts
// ==========================================
async function renderHome() {
  const app = document.getElementById('app');
  app.innerHTML = '<div class="layout-container"><main class="posts-feed"><p class="loading-text">加载中...</p></main></div>';

  try {
    await loadProfile();
    const posts = await fetchAllPosts();
    const { totalSeries } = groupBySeries(posts);

    // Pick 4 random posts
    const shuffled = [...posts].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, Math.min(4, posts.length));

    // Fetch full content for picked posts
    const fullPosts = await Promise.all(picked.map(p => fetchPostWithContent(p.id).catch(() => null)));
    const valid = fullPosts.filter(Boolean);

    let mainHTML = '';

    for (const post of valid) {
      const excerpt = stripMarkdown(post.content || '').slice(0, 280);
      const seriesPrefix = post.series ? encodeURIComponent(post.series) + '/' : '';
      const href = '#' + seriesPrefix + post.id;

      let tagsHTML = '';
      if (Array.isArray(post.tags)) {
        tagsHTML = post.tags.map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join('');
      }

      mainHTML += `
        <article class="excerpt-card">
          <div class="post-meta">
            <span class="date">${escapeHtml(post.date)}</span>
            <div class="tags">${tagsHTML}</div>
          </div>
          <h3><a href="${href}" class="post-title-link">${escapeHtml(post.title)}</a></h3>
          <p class="excerpt-text">${escapeHtml(excerpt)}${excerpt.length >= 280 ? '...' : ''}</p>
          <a href="${href}" class="read-more">阅读全文 &rarr;</a>
        </article>`;
    }

    mainHTML += `<footer><p>&copy; 2026 ${escapeHtml(profile.name)}</p></footer>`;

    app.innerHTML = `
      <div class="layout-container">
        <aside class="profile-card">
          ${renderSidebar('home')}
          ${renderStats(posts, totalSeries)}
        </aside>
        <main class="posts-feed">${mainHTML}</main>
      </div>`;
    startClock();

  } catch (e) {
    console.error(e);
    app.innerHTML = '<div class="layout-container"><main class="posts-feed"><p class="loading-text">加载失败，请刷新重试。</p></main></div>';
  }
}

// ==========================================
// SERIES LIST: all series folders (simple list style)
// ==========================================
async function renderSeriesList() {
  const app = document.getElementById('app');
  app.innerHTML = '<div class="layout-container"><main class="posts-feed"><p class="loading-text">加载中...</p></main></div>';

  try {
    await loadProfile();
    const posts = await fetchAllPosts();
    const { entries, uncategorized, totalSeries } = groupBySeries(posts);

    let html = '';

    for (const [name, seriesPosts] of entries) {
      html += `
        <a href="#series/${encodeURIComponent(name)}" class="series-row">
          <span class="series-row-name">${escapeHtml(name)}</span>
          <span class="series-row-meta">${seriesPosts.length} 篇 &middot; 最近 ${escapeHtml(seriesPosts[0].date)}</span>
        </a>`;
    }

    if (uncategorized.length > 0) {
      html += `
        <a href="#series/${encodeURIComponent('未分类')}" class="series-row">
          <span class="series-row-name">未分类</span>
          <span class="series-row-meta">${uncategorized.length} 篇 &middot; 最近 ${escapeHtml(uncategorized[0].date)}</span>
        </a>`;
    }

    html += `<footer><p>&copy; 2026 ${escapeHtml(profile.name)}</p></footer>`;

    app.innerHTML = `
      <div class="layout-container">
        <aside class="profile-card">
          ${renderSidebar('series')}
          ${renderStats(posts, totalSeries)}
        </aside>
        <main class="posts-feed">${html}</main>
      </div>`;
    startClock();

  } catch (e) {
    console.error(e);
    app.innerHTML = '<div class="layout-container"><main class="posts-feed"><p class="loading-text">加载失败，请刷新重试。</p></main></div>';
  }
}

// ==========================================
// SERIES DETAIL: articles within a series
// ==========================================
async function renderSeries(name) {
  // If no series name (just #series/), show the list of all series
  if (!name) { renderSeriesList(); return; }

  const app = document.getElementById('app');
  app.innerHTML = '<div class="layout-container"><main class="posts-feed"><p class="loading-text">加载中...</p></main></div>';

  try {
    await loadProfile();
    const posts = await fetchAllPosts();
    const { entries, uncategorized, totalSeries } = groupBySeries(posts);

    let seriesPosts;
    if (name === '未分类') seriesPosts = uncategorized;
    else { const e = entries.find(([n]) => n === name); seriesPosts = e ? e[1] : []; }

    if (seriesPosts.length === 0) {
      app.innerHTML = `
        <div class="layout-container">
          <aside class="profile-card">${renderSidebar('series')}${renderStats(posts, totalSeries)}</aside>
          <main class="posts-feed"><div class="excerpt-card"><p>该合集下暂无文章。</p></div></main>
        </div>`;
      return;
    }

    let html = `
      <div class="series-detail-header">
        <a href="#series/" class="back-link">&larr; 所有合集</a>
        <h2>${escapeHtml(name)} <span class="series-count">${seriesPosts.length} 篇</span></h2>
      </div>`;

    for (const post of seriesPosts) {
      let tagsHTML = '';
      if (Array.isArray(post.tags)) {
        tagsHTML = post.tags.map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join('');
      }
      const href = '#' + encodeURIComponent(name) + '/' + post.id;

      html += `
        <article class="excerpt-card">
          <div class="post-meta">
            <span class="date">${escapeHtml(post.date)}</span>
            <div class="tags">${tagsHTML}</div>
          </div>
          <h3><a href="${href}" class="post-title-link">${escapeHtml(post.title)}</a></h3>
          <p>${escapeHtml(post.summary || '')}</p>
          <a href="${href}" class="read-more">阅读全文 &rarr;</a>
        </article>`;
    }

    html += `<footer><p>&copy; 2026 ${escapeHtml(profile.name)}</p></footer>`;

    app.innerHTML = `
      <div class="layout-container">
        <aside class="profile-card">${renderSidebar('series')}${renderStats(posts, totalSeries)}</aside>
        <main class="posts-feed">${html}</main>
      </div>`;
    startClock();

  } catch (e) {
    console.error(e);
    app.innerHTML = '<div class="layout-container"><main class="posts-feed"><p class="loading-text">加载失败，请刷新重试。</p></main></div>';
  }
}

// ==========================================
// POST: single article detail
// ==========================================
async function renderPost(postId) {
  const app = document.getElementById('app');
  app.innerHTML = '<div class="layout-container"><main class="posts-feed"><p class="loading-text">加载中...</p></main></div>';

  try {
    await loadProfile();

    const post = await fetchPostWithContent(postId);
    const posts = await fetchAllPosts();
    const { totalSeries } = groupBySeries(posts);

    let backTo = '#';
    if (post.series) backTo = '#series/' + encodeURIComponent(post.series);

    let tagsHTML = '';
    if (Array.isArray(post.tags)) {
      tagsHTML = post.tags.map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join('');
    }

    const rendered = typeof marked !== 'undefined' ? marked.parse(post.content) : `<pre>${escapeHtml(post.content)}</pre>`;

    const breadcrumb = post.series
      ? `<div class="post-breadcrumb"><a href="#series/">合集</a> / <a href="${backTo}">${escapeHtml(post.series)}</a></div>`
      : '<div class="post-breadcrumb"><a href="#">首页</a></div>';

    const postHTML = `
      <article class="excerpt-card full-post">
        <div class="post-meta">
          <span class="date">${escapeHtml(post.date)}</span>
          <div class="tags">${tagsHTML}</div>
        </div>
        ${breadcrumb}
        <h1 class="post-detail-title">${escapeHtml(post.title)}</h1>
        <div class="post-content">${rendered}</div>
      </article>`;

    app.innerHTML = `
      <div class="layout-container">
        <aside class="profile-card">${renderSidebar('post')}${renderStats(posts, totalSeries)}</aside>
        <main class="posts-feed">${postHTML}</main>
      </div>`;
    startClock();

    window.scrollTo(0, 0);

    // Redirect old-format URLs
    if (!window.location.hash.includes('/')) {
      const newHash = post.series ? encodeURIComponent(post.series) + '/' + postId : postId;
      if ('#' + newHash !== window.location.hash) {
        window.location.replace('#' + newHash);
      }
    }

  } catch (e) {
    console.error(e);
    app.innerHTML = `
      <div class="layout-container">
        <main class="posts-feed" style="flex:1; text-align:center;">
          <div class="excerpt-card">
            <h2>文章不存在</h2>
            <p style="margin-top:15px;">找不到该文章，可能已被删除。</p>
            <p style="margin-top:10px;"><a href="#" class="read-more">&larr; 返回首页</a></p>
          </div>
        </main>
      </div>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
