const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, '..', 'PRIVACY_POLICY.md');
const outDir = path.join(__dirname, '..', 'public');
const outHtml = path.join(outDir, 'ietv.html');
const faviconSrc = path.join(__dirname, '..', 'assets', 'images', 'favicon.png');
const faviconDst = path.join(outDir, 'favicon.png');

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parseMarkdown(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  const headings = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) { out.push(''); continue; }
    if (line.startsWith('### ')) {
      const text = line.slice(4).trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      headings.push({ level: 3, text, id });
      out.push(`<h3 id="${id}">${escapeHtml(text)}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      const text = line.slice(3).trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      headings.push({ level: 2, text, id });
      out.push(`<h2 id="${id}">${escapeHtml(text)}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      const text = line.slice(2).trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      headings.push({ level: 1, text, id });
      out.push(`<h1 id="${id}">${escapeHtml(text)}</h1>`);
      continue;
    }
    if (line.startsWith('- ')) {
      out.push(`<li>${escapeHtml(line.slice(2).trim())}</li>`);
      continue;
    }
    // links and bold
    const linked = line.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" rel="noopener">$1</a>');
    const bolded = linked.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    out.push(`<p>${bolded}</p>`);
  }

  const html = out.join('\n').replace(/(<li>.*?<\/li>\n?)+/gim, function(m){
    const items = m.match(/<li>.*?<\/li>/gim).join('\n');
    return '<ul>' + items + '</ul>';
  });

  return { html, headings };
}

ensureDir(outDir);

const md = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, 'utf8') : '';
const { html: bodyHtml, headings } = parseMarkdown(md);

// extract update date
const dateMatch = md.match(/Derni[eè]re mise à jour\s*[:\-]\s*(.+)/i);
const updateDate = (dateMatch && dateMatch[1]) ? dateMatch[1].trim() : new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

// build toc items and include a short label (first char) for collapsed view
const tocItems = headings.filter(h => h.level <= 2).map(h => {
  const full = escapeHtml(h.text || '');
  const short = escapeHtml((h.text || '').trim().charAt(0).toUpperCase() || '•');
  return '<div><a href="#' + h.id + '" data-short="' + short + '"><span class="toc-short">' + short + '</span><span class="toc-text">' + full + '</span></a></div>';
}).join('');

const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>IE TV — Politique de confidentialité</title>
    <link rel="icon" href="/favicon.png" />
    <style>
      :root{--bg:#f7fcff;--card:#fff;--accent:#0b77c2;--muted:#6b7280;--sidebar-width:280px}
      html,body{height:100%}
      body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;margin:0;background:var(--bg);color:#0b1726}
      header{background:linear-gradient(90deg,var(--accent),#4fb0e8);color:#fff;padding:16px 18px;display:flex;align-items:center;gap:12px}
      header img{width:44px;height:44px;border-radius:8px;background:transparent;padding:0;object-fit:contain}
      .layout{display:flex;height:calc(100vh - 72px)}
      .sidebar{width:var(--sidebar-width);min-width:64px;max-width:520px;background:#f3fbff;border-right:1px solid rgba(11,119,194,0.06);overflow:auto}
      .sidebar.collapsed{width:56px}
      /* when collapsed hide link text and show short label */
      .toc-short{display:none;display:inline-block;width:28px;text-align:center;margin-right:8px;font-weight:700;color:var(--accent)}
      .toc-text{display:inline-block}
      .sidebar.collapsed .toc-text{display:none}
      .sidebar.collapsed .toc-short{display:none}
      .sidebar .toc a{display:flex;align-items:center;gap:6px;padding:6px 8px}
      .sidebar.collapsed .toc a{justify-content:center;padding:6px 4px}
      /* when collapsed, hide the full TOC so links are not visible or clickable */
      .sidebar.collapsed .toc{display:none}
      /* sidebar logo shown only when collapsed */
      .sidebar-logo{display:none;padding:12px;text-align:center}
      .sidebar-logo img{width:40px;height:40px;border-radius:6px;object-fit:contain}
      .sidebar.collapsed .sidebar-logo{display:block}
      .sidebar:not(.collapsed) .sidebar-logo{display:none}
      /* sidebar menu button (in the vertical bar) */
      .side-menu-btn{display:block;background:transparent;border:0;color:var(--accent);font-size:20px;width:40px;height:40px;border-radius:8px;margin:8px;cursor:pointer}
      .sidebar.collapsed .side-menu-btn{margin:8px auto;display:block}
      .resizer{width:6px;cursor:col-resize;background:transparent}
      .content{flex:1;overflow:auto;padding:20px}
      .card{background:var(--card);padding:22px;border-radius:12px;box-shadow:0 6px 18px rgba(6,15,31,0.06);max-width:none}
      h1{margin-top:0}
      .toc{padding:12px}
      .toc ul{margin:8px 0 0 0;padding-left:12px}
      .toc a{color:var(--accent);text-decoration:none;display:block;padding:6px 8px;border-radius:6px}
      .toc a:hover{background:rgba(11,119,194,0.06)}
      .toc .toggle{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-bottom:1px solid rgba(11,119,194,0.04)}
      .collapse-btn{background:transparent;border:0;color:var(--accent);cursor:pointer;font-weight:600}
      main{max-width:900px}
       p{line-height:1.6;color:#0f1724}
      footer{margin-top:18px;color:var(--muted);font-size:13px}
      @media (max-width:800px){
        .layout{flex-direction:column;height:auto}
        .sidebar{width:100%;height:auto}
        .resizer{display:none}
      }
    </style>
  </head>
  <body>
    <header>
      <img src="/icon.png" alt="IE TV" />
      <div>
        <div style="font-weight:700;font-size:18px">IE TV</div>
        <div style="font-size:13px;opacity:0.95">Politique de confidentialité</div>
      </div>
    </header>
    <div class="layout">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-logo" aria-hidden="true">
          <button id="sideMenuBtn" class="side-menu-btn" aria-label="Menu">☰</button>
        </div>
        <div class="toc">
          <div class="toggle">
            <strong>Sommaire</strong>
            <div>
              <button class="collapse-btn" id="collapseBtn">◀</button>
            </div>
          </div>
          <div id="tocList">
            ${tocItems}
          </div>
        </div>
      </aside>
      <div class="resizer" id="resizer" title="Ajuster la largeur"></div>
      <div class="content">
        <div class="card">
          ${bodyHtml}
          <footer id="policyFooter">Dernière mise à jour : ${updateDate} — Pour toute question : <a href="mailto:contact@belmanhdubien.com">contact@belmanhdubien.com</a></footer>
        </div>
      </div>
    </div>
    <script>
      const sidebar = document.getElementById('sidebar');
      const collapseBtn = document.getElementById('collapseBtn');
      const sideMenuBtn = document.getElementById('sideMenuBtn');
      // restore persisted state and width
      const persisted = localStorage.getItem('ietv_sidebar_collapsed');
      const savedWidth = localStorage.getItem('ietv_sidebar_width');
      if (savedWidth) document.documentElement.style.setProperty('--sidebar-width', savedWidth + 'px');
      if (persisted === '1') { sidebar.classList.add('collapsed'); collapseBtn.textContent = '▶'; }
      const tocElement = document.querySelector('.toc');
      function setCollapsedState(isCollapsed){
        if (isCollapsed) {
          sidebar.classList.add('collapsed');
          collapseBtn.textContent = '▶';
          // mark TOC as hidden for assistive tech and remove focus
          if (tocElement) tocElement.setAttribute('aria-hidden','true');
          try { if (document.activeElement && sidebar.contains(document.activeElement)) document.activeElement.blur(); } catch(e){}
        } else {
          sidebar.classList.remove('collapsed');
          collapseBtn.textContent = '◀';
          if (tocElement) tocElement.removeAttribute('aria-hidden');
        }
        localStorage.setItem('ietv_sidebar_collapsed', isCollapsed ? '1' : '0');
      }

      collapseBtn.addEventListener('click', () => {
        const is = !sidebar.classList.contains('collapsed');
        setCollapsedState(is);
      });

      if (sideMenuBtn) {
        sideMenuBtn.addEventListener('click', () => {
          const isCollapsed = sidebar.classList.contains('collapsed');
          setCollapsedState(!isCollapsed);
        });
      }
      const resizer = document.getElementById('resizer');
      let dragging = false;
      resizer.addEventListener('mousedown', () => { 
        // if collapsed, expand first so user can drag
        if (sidebar.classList.contains('collapsed')) { sidebar.classList.remove('collapsed'); collapseBtn.textContent = '◀'; localStorage.setItem('ietv_sidebar_collapsed','0'); }
        dragging = true; document.body.style.cursor = 'col-resize'; 
      });
      // double click resizer to reset / expand
      resizer.addEventListener('dblclick', () => {
        document.documentElement.style.setProperty('--sidebar-width', '280px');
        sidebar.classList.remove('collapsed');
        collapseBtn.textContent = '◀';
        localStorage.setItem('ietv_sidebar_collapsed', '0');
        localStorage.removeItem('ietv_sidebar_width');
      });
      window.addEventListener('mousemove', (e) => { if (!dragging) return; const newWidth = Math.max(64, Math.min(520, e.clientX)); document.documentElement.style.setProperty('--sidebar-width', newWidth + 'px'); });
      window.addEventListener('mouseup', () => { if (dragging) {
        // persist width
        const w = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width').trim();
        if (w.endsWith('px')) localStorage.setItem('ietv_sidebar_width', w.replace('px',''));
      }
      dragging = false; document.body.style.cursor = ''; });
      document.querySelectorAll('.toc a').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const id = a.getAttribute('href').slice(1); const el = document.getElementById(id); if (el) el.scrollIntoView({behavior:'smooth', block:'start'}); history.replaceState(null,'', '#'+id); }));
    </script>
  </body>
</html>`;

fs.writeFileSync(outHtml, html, 'utf8');
const outLegacy = path.join(outDir, 'privacy-policy.html');
try { fs.writeFileSync(outLegacy, html, 'utf8'); console.log('Wrote', outLegacy); } catch(e) { console.log('Failed to write legacy file:', e.message); }

// copy favicon if exists
if (fs.existsSync(faviconSrc)) {
  try { fs.copyFileSync(faviconSrc, faviconDst); console.log('Copied favicon to public/favicon.png'); } catch(e) { console.log('Failed to copy favicon:', e.message); }
} else {
  console.log('No favicon found at', faviconSrc);
}

// copy icon (site logo) if exists
const iconSrc = path.join(__dirname, '..', 'assets', 'images', 'icon.png');
const iconDst = path.join(outDir, 'icon.png');
if (fs.existsSync(iconSrc)) {
  try { fs.copyFileSync(iconSrc, iconDst); console.log('Copied icon to public/icon.png'); } catch(e) { console.log('Failed to copy icon:', e.message); }
} else {
  console.log('No icon found at', iconSrc);
}

console.log('Wrote', outHtml);
 
