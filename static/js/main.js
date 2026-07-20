/* ===============================
   Portfolio - Main JavaScript
   Pure client-side rendering, no build step
================================ */

const PROFILE_URL = '/profile.json';
const POSTS_INDEX_URL = '/posts/index.json';
const POSTS_DIR = '/posts';

let profile = null;

// ==========================================
// Init
// ==========================================
function init() {
  const hash = window.location.hash.slice(1);
  if (hash) {
    renderPost(hash);
  } else {
    renderHome();
  }
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      renderPost(hash);
    } else {
      renderHome();
    }
  });
}

// ==========================================
// Frontmatter Parser (pure JS, no lib)
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

    // List item: "- Value"
    if (trimmed.startsWith('- ') && currentKey) {
      if (!Array.isArray(data[currentKey])) {
        data[currentKey] = [];
      }
      data[currentKey].push(trimmed.slice(2).trim());
      continue;
    }

    // Key: Value or Key:
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
// Render Profile HTML
// ==========================================
function renderProfileHTML(showBackBtn) {
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

  // Back button on post detail pages
  if (showBackBtn) {
    html += `
    <div class="social-links" style="margin-top:15px;">
      <a href="#" class="btn back-btn">← 返回首页</a>
    </div>`;
  }

  return html;
}

// ==========================================
// Render Post Card (for list)
// ==========================================
function renderPostCard(post) {
  let tagsHTML = '';
  if (Array.isArray(post.tags)) {
    tagsHTML = post.tags.map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join('');
  }

  return `
    <article class="post-card">
      <div class="post-meta">
        <span class="date">${escapeHtml(post.date)}</span>
        <div class="tags">${tagsHTML}</div>
      </div>
      <h3>
        <a href="#${escapeHtml(post.id)}" class="post-title-link">
          ${escapeHtml(post.title)}
        </a>
      </h3>
      <p>${escapeHtml(post.summary)}</p>
      <a href="#${escapeHtml(post.id)}" class="read-more">阅读全文 →</a>
    </article>`;
}

// ==========================================
// Render Home Page
// ==========================================
async function renderHome() {
  const app = document.getElementById('app');

  // Show loading
  app.innerHTML = '<div class="layout-container" style="justify-content:center;"><p>加载中...</p></div>';

  try {
    // Fetch profile
    const profileResp = await fetch(PROFILE_URL);
    profile = await profileResp.json();

    // Fetch post index
    const indexResp = await fetch(POSTS_INDEX_URL);
    const postIds = await indexResp.json();

    // Fetch all posts and parse frontmatter
    const postsMeta = [];
    for (const id of postIds) {
      try {
        const resp = await fetch(`${POSTS_DIR}/${id}.md`);
        if (!resp.ok) {
          console.warn(`Post not found: ${id}`);
          continue;
        }
        const md = await resp.text();
        const { data } = parseFrontmatter(md);
        postsMeta.push({ id, ...data });
      } catch (e) {
        console.error(`Failed to load post: ${id}`, e);
      }
    }

    // Group by series
    const seriesMap = new Map();
    const uncategorized = [];

    for (const post of postsMeta) {
      if (post.series) {
        if (!seriesMap.has(post.series)) {
          seriesMap.set(post.series, []);
        }
        seriesMap.get(post.series).push(post);
      } else {
        uncategorized.push(post);
      }
    }

    // Sort within each group by date descending
    const sortByDate = (a, b) => new Date(b.date) - new Date(a.date);
    for (const posts of seriesMap.values()) {
      posts.sort(sortByDate);
    }
    uncategorized.sort(sortByDate);

    // Sort series groups by their latest post date
    const seriesEntries = [...seriesMap.entries()].sort((a, b) => {
      const aLatest = new Date(a[1][0].date);
      const bLatest = new Date(b[1][0].date);
      return bLatest - aLatest;
    });

    // Build posts HTML
    let postsHTML = '';

    for (const [seriesName, posts] of seriesEntries) {
      postsHTML += `<section class="series-section">
        <h2 class="series-title">📂 ${escapeHtml(seriesName)} <span class="series-count">(${posts.length}篇)</span></h2>`;
      for (const post of posts) {
        postsHTML += renderPostCard(post);
      }
      postsHTML += '</section>';
    }

    if (uncategorized.length > 0) {
      postsHTML += `<section class="series-section">
        <h2 class="series-title">📂 未分类 <span class="series-count">(${uncategorized.length}篇)</span></h2>`;
      for (const post of uncategorized) {
        postsHTML += renderPostCard(post);
      }
      postsHTML += '</section>';
    }

    postsHTML += `<footer><p>&copy; 2026 ${escapeHtml(profile.name)}. Built with ❤️</p></footer>`;

    app.innerHTML = `
      <div class="layout-container">
        <aside class="profile-card">${renderProfileHTML(false)}</aside>
        <main class="posts-feed">${postsHTML}</main>
      </div>`;

  } catch (e) {
    console.error('Failed to load page:', e);
    app.innerHTML = '<div class="layout-container" style="justify-content:center;"><p>加载失败，请刷新重试。</p></div>';
  }
}

// ==========================================
// Render Single Post
// ==========================================
async function renderPost(postId) {
  const app = document.getElementById('app');
  app.innerHTML = '<div class="layout-container" style="justify-content:center;"><p>加载中...</p></div>';

  try {
    // Fetch profile if not loaded
    if (!profile) {
      const profileResp = await fetch(PROFILE_URL);
      profile = await profileResp.json();
    }

    const resp = await fetch(`${POSTS_DIR}/${postId}.md`);
    if (!resp.ok) throw new Error('Post not found');

    const md = await resp.text();
    const { data, content } = parseFrontmatter(md);

    // Render tags
    let tagsHTML = '';
    if (Array.isArray(data.tags)) {
      tagsHTML = data.tags.map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join('');
    }

    // Render markdown content
    const renderedContent = typeof marked !== 'undefined'
      ? marked.parse(content)
      : `<pre>${escapeHtml(content)}</pre>`;

    const postHTML = `
      <article class="post-card full-post">
        <div class="post-meta">
          <span class="date">${escapeHtml(data.date)}</span>
          <div class="tags">${tagsHTML}</div>
        </div>
        ${data.series ? `<p class="post-series">📂 ${escapeHtml(data.series)}</p>` : ''}
        <h1 style="margin-bottom: 20px; font-size: 2rem;">${escapeHtml(data.title)}</h1>
        <div class="post-content">${renderedContent}</div>
      </article>`;

    app.innerHTML = `
      <div class="layout-container">
        <aside class="profile-card">${renderProfileHTML(true)}</aside>
        <main class="posts-feed">${postHTML}</main>
      </div>`;

    // Bind back button
    const backBtn = app.querySelector('.back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '';
      });
    }

    window.scrollTo(0, 0);

  } catch (e) {
    console.error('Failed to load post:', e);
    app.innerHTML = `
      <div class="layout-container">
        <main class="posts-feed" style="flex:1; text-align:center;">
          <div class="post-card">
            <h2>文章不存在</h2>
            <p style="margin-top:15px;">找不到该文章，可能已被删除。</p>
            <a href="#" class="btn back-btn" style="display:inline-block; margin-top:20px; padding:8px 20px;">← 返回首页</a>
          </div>
        </main>
      </div>`;

    const backBtn = app.querySelector('.back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '';
      });
    }
  }
}

// ==========================================
// Start on DOM ready
// ==========================================
document.addEventListener('DOMContentLoaded', init);
