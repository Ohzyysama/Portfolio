/* ===============================
   Portfolio - Main JavaScript
================================ */

const PROFILE_URL = '/profile.json';
const POSTS_INDEX_URL = '/posts/index.json';
const POSTS_DIR = '/posts';

let profile = null;
let allPosts = null;

// ==========================================
// Init
// ==========================================
function init() {
  handleRoute();
  window.addEventListener('hashchange', handleRoute);
}

function handleRoute() {
  const hash = window.location.hash.slice(1);
  if (!hash) {
    renderHome();
    return;
  }
  // #series/合集名 -> article list
  if (hash.startsWith('series/')) {
    const name = decodeURIComponent(hash.slice(7));
    renderSeries(name);
    return;
  }
  // #合集名/postId -> post detail
  const slashIdx = hash.lastIndexOf('/');
  if (slashIdx !== -1) {
    const postId = hash.slice(slashIdx + 1);
    renderPost(postId);
    return;
  }
  // Old format: just postId -> try to redirect
  renderPost(hash);
}

// ==========================================
// Frontmatter Parser
// ==========================================
function parseFrontmatter(md) {
  const match = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: md };

  const yaml = match[1];
  const content = match[2];
  const data = {};
  let currentKey = null;

  for (const line of yaml.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('- ') && currentKey) {
      if (!Array.isArray(data[currentKey])) {
        data[currentKey] = [];
      }
      data[currentKey].push(trimmed.slice(2).trim());
      continue;
    }

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx !== -1) {
      currentKey = trimmed.slice(0, colonIdx).trim();
      const value = trimmed.slice(colonIdx + 1).trim();
      data[currentKey] = value || [];
    }
  }

  return { data, content };
}

// ==========================================
// Escape HTML
// ==========================================
function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

// ==========================================
// Fetch all posts metadata (cached)
// ==========================================
async function fetchAllPosts() {
  if (allPosts) return allPosts;

  const indexResp = await fetch(POSTS_INDEX_URL);
  const postIds = await indexResp.json();

  const posts = [];
  for (const id of postIds) {
    try {
      const resp = await fetch(`${POSTS_DIR}/${id}.md`);
      if (!resp.ok) { console.warn('Post not found:', id); continue; }
      const md = await resp.text();
      const { data } = parseFrontmatter(md);
      posts.push({ id, ...data });
    } catch (e) {
      console.error('Failed to load post:', id, e);
    }
  }
  allPosts = posts;
  return posts;
}

// ==========================================
// Group posts by series
// ==========================================
function groupBySeries(posts) {
  const map = new Map();
  const uncategorized = [];

  for (const p of posts) {
    if (p.series) {
      if (!map.has(p.series)) map.set(p.series, []);
      map.get(p.series).push(p);
    } else {
      uncategorized.push(p);
    }
  }

  const sortByDate = (a, b) => new Date(b.date) - new Date(a.date);
  for (const arr of map.values()) arr.sort(sortByDate);
  uncategorized.sort(sortByDate);

  // Sort groups: named series first by latest post date, uncategorized last
  const entries = [...map.entries()].sort((a, b) =>
    new Date(b[1][0].date) - new Date(a[1][0].date)
  );

  return { entries, uncategorized };
}

// ==========================================
// Find post by id (from cached data)
// ==========================================
function findPost(postId) {
  if (!allPosts) return null;
  return allPosts.find(p => p.id === postId);
}

// ==========================================
// Profile sidebar HTML
// ==========================================
function renderProfileHTML(backTo) {
  let html = `
    <div class="profile-header">
      <img src="${escapeHtml(profile.avatar)}" alt="Avatar" class="avatar">
      <h1>${escapeHtml(profile.name)}</h1>
      <p class="title">${escapeHtml(profile.title)}</p>
    </div>
    <p class="bio">${escapeHtml(profile.bio)}</p>
    <p class="email">${escapeHtml(profile.email)}</p>
    <div class="social-links">`;

  for (const link of profile.social_links) {
    html += `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener" class="btn">${escapeHtml(link.name)}</a>`;
  }
  html += '</div>';

  // Back link in sidebar
  if (backTo) {
    html += `
    <div class="sidebar-back">
      <a href="${escapeHtml(backTo)}" class="back-link">&larr; ${backTo === '#' ? '首页' : '合集列表'}</a>
    </div>`;
  }

  return html;
}

// ==========================================
// Series card (folder-style)
// ==========================================
function renderSeriesCard(name, posts) {
  const count = posts.length;
  const latestDate = posts[0].date;
  const label = count === 1 ? '篇' : '篇';

  return `
    <a href="#series/${encodeURIComponent(name)}" class="series-card">
      <div class="series-card-top">
        <span class="series-name">${escapeHtml(name)}</span>
        <span class="series-arrow">&rarr;</span>
      </div>
      <div class="series-card-bottom">
        <span>${count} ${label}文章</span>
        <span class="series-latest">最近更新 ${escapeHtml(latestDate)}</span>
      </div>
    </a>`;
}

// ==========================================
// Post card (for article list)
// ==========================================
function renderPostCard(post) {
  let tagsHTML = '';
  if (Array.isArray(post.tags)) {
    tagsHTML = post.tags.map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join('');
  }

  const seriesPrefix = post.series ? encodeURIComponent(post.series) + '/' : '';

  return `
    <article class="post-card">
      <div class="post-meta">
        <span class="date">${escapeHtml(post.date)}</span>
        <div class="tags">${tagsHTML}</div>
      </div>
      <h3>
        <a href="#${seriesPrefix}${escapeHtml(post.id)}" class="post-title-link">
          ${escapeHtml(post.title)}
        </a>
      </h3>
      <p>${escapeHtml(post.summary)}</p>
      <a href="#${seriesPrefix}${escapeHtml(post.id)}" class="read-more">阅读全文 &rarr;</a>
    </article>`;
}

// ==========================================
// HOME: series folder list
// ==========================================
async function renderHome() {
  const app = document.getElementById('app');
  app.innerHTML = '<div class="layout-container"><main class="posts-feed"><p class="loading-text">加载中...</p></main></div>';

  try {
    if (!profile) {
      const resp = await fetch(PROFILE_URL);
      profile = await resp.json();
    }

    const posts = await fetchAllPosts();
    const { entries, uncategorized } = groupBySeries(posts);

    let html = '<h2 class="page-heading">文章合集</h2>';

    for (const [name, seriesPosts] of entries) {
      html += renderSeriesCard(name, seriesPosts);
    }

    if (uncategorized.length > 0) {
      html += renderSeriesCard('未分类', uncategorized);
    }

    html += `<footer><p>&copy; 2026 ${escapeHtml(profile.name)}</p></footer>`;

    app.innerHTML = `
      <div class="layout-container">
        <aside class="profile-card">${renderProfileHTML(null)}</aside>
        <main class="posts-feed">${html}</main>
      </div>`;

  } catch (e) {
    console.error(e);
    app.innerHTML = '<div class="layout-container"><main class="posts-feed"><p class="loading-text">加载失败，请刷新重试。</p></main></div>';
  }
}

// ==========================================
// SERIES: article list within a series
// ==========================================
async function renderSeries(name) {
  const app = document.getElementById('app');
  app.innerHTML = '<div class="layout-container"><main class="posts-feed"><p class="loading-text">加载中...</p></main></div>';

  try {
    if (!profile) {
      const resp = await fetch(PROFILE_URL);
      profile = await resp.json();
    }

    const posts = await fetchAllPosts();
    const { entries, uncategorized } = groupBySeries(posts);

    let seriesPosts;
    if (name === '未分类') {
      seriesPosts = uncategorized;
    } else {
      const entry = entries.find(([n]) => n === name);
      seriesPosts = entry ? entry[1] : [];
    }

    if (seriesPosts.length === 0) {
      app.innerHTML = `
        <div class="layout-container">
          <aside class="profile-card">${renderProfileHTML('#')}</aside>
          <main class="posts-feed">
            <div class="post-card"><p>该合集下暂无文章。</p></div>
          </main>
        </div>`;
      return;
    }

    let html = `
      <div class="series-header">
        <h2 class="page-heading">${escapeHtml(name)}</h2>
        <span class="series-post-count">共 ${seriesPosts.length} 篇</span>
      </div>`;

    for (const post of seriesPosts) {
      html += renderPostCard(post);
    }

    app.innerHTML = `
      <div class="layout-container">
        <aside class="profile-card">${renderProfileHTML('#')}</aside>
        <main class="posts-feed">${html}</main>
      </div>`;

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
    if (!profile) {
      const resp = await fetch(PROFILE_URL);
      profile = await resp.json();
    }

    const resp = await fetch(`${POSTS_DIR}/${postId}.md`);
    if (!resp.ok) throw new Error('Not found');

    const md = await resp.text();
    const { data, content } = parseFrontmatter(md);

    // Build back link
    let backTo = '#';
    if (data.series) {
      backTo = '#series/' + encodeURIComponent(data.series);
    }

    let tagsHTML = '';
    if (Array.isArray(data.tags)) {
      tagsHTML = data.tags.map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join('');
    }

    const renderedContent = typeof marked !== 'undefined'
      ? marked.parse(content)
      : `<pre>${escapeHtml(content)}</pre>`;

    const seriesLine = data.series
      ? `<div class="post-breadcrumb"><a href="${backTo}">${escapeHtml(data.series)}</a></div>`
      : '';

    const postHTML = `
      <article class="post-card full-post">
        <div class="post-meta">
          <span class="date">${escapeHtml(data.date)}</span>
          <div class="tags">${tagsHTML}</div>
        </div>
        ${seriesLine}
        <h1 class="post-detail-title">${escapeHtml(data.title)}</h1>
        <div class="post-content">${renderedContent}</div>
      </article>`;

    app.innerHTML = `
      <div class="layout-container">
        <aside class="profile-card">${renderProfileHTML(backTo)}</aside>
        <main class="posts-feed">${postHTML}</main>
      </div>`;

    window.scrollTo(0, 0);

    // Handle old-format URLs: redirect to new format
    if (!window.location.hash.includes('/')) {
      const newHash = backTo === '#' ? '' : data.series
        ? encodeURIComponent(data.series) + '/' + postId
        : postId;
      if (newHash && '#' + newHash !== window.location.hash) {
        window.location.replace('#' + newHash);
      }
    }

  } catch (e) {
    console.error(e);
    app.innerHTML = `
      <div class="layout-container">
        <main class="posts-feed" style="flex:1; text-align:center;">
          <div class="post-card">
            <h2>文章不存在</h2>
            <p style="margin-top:15px;">找不到该文章，可能已被删除。</p>
            <p style="margin-top:10px;"><a href="#" class="read-more">&larr; 返回首页</a></p>
          </div>
        </main>
      </div>`;
  }
}

// ==========================================
// Start
// ==========================================
document.addEventListener('DOMContentLoaded', init);
