/* ── MathZone Profile ── profile.js ── */
'use strict';

(function () {

  /* ── inject CSS ── */
  const style = document.createElement('style');
  style.textContent = `
    #mz-profile-btn {
      font-size: .65rem; font-weight: 700; letter-spacing: 1.5px;
      text-transform: uppercase; color: var(--neon);
      background: rgba(0,245,255,.07); border: 1px solid rgba(0,245,255,.2);
      border-radius: 5px; padding: .3rem .75rem; cursor: pointer;
      font-family: 'Exo 2', sans-serif; transition: all .2s; flex-shrink: 0;
    }
    #mz-profile-btn:hover { background: rgba(0,245,255,.15); }

    #mz-profile-overlay {
      display: none; position: fixed; inset: 0;
      background: rgba(0,0,0,.85); z-index: 8500;
      align-items: center; justify-content: center;
      backdrop-filter: blur(4px);
    }
    #mz-profile-overlay.open { display: flex; }

    #mz-profile-modal {
      background: #16161f; border: 1px solid #2a2a3a;
      border-radius: 16px; padding: 2rem;
      width: min(480px, 92vw); max-height: 85vh; overflow-y: auto;
      box-shadow: 0 24px 64px rgba(0,0,0,.8);
      animation: slideUp .3s ease;
    }
    .mz-prof-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 1.5rem;
    }
    .mz-prof-title {
      font-family: 'Black Ops One', cursive;
      font-size: 1.4rem; letter-spacing: 3px; color: #00f5ff;
    }
    .mz-prof-close {
      background: none; border: none; color: #6a6a8a;
      font-size: 1.3rem; cursor: pointer; transition: color .2s;
    }
    .mz-prof-close:hover { color: #00f5ff; }

    .mz-prof-avatar {
      width: 72px; height: 72px; border-radius: 50%;
      background: linear-gradient(135deg, #00f5ff22, #ff00aa22);
      border: 2px solid #00f5ff44;
      display: flex; align-items: center; justify-content: center;
      font-size: 2rem; margin: 0 auto 1rem; font-family: 'Black Ops One', cursive;
      color: #00f5ff; letter-spacing: 0;
    }
    .mz-prof-username {
      text-align: center; font-family: 'Black Ops One', cursive;
      font-size: 1.2rem; letter-spacing: 3px; color: #e8e8f0; margin-bottom: .25rem;
    }
    .mz-prof-joined {
      text-align: center; font-size: .7rem; color: #6a6a8a;
      letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 1.5rem;
    }

    .mz-prof-stats {
      display: grid; grid-template-columns: 1fr 1fr 1fr;
      gap: .75rem; margin-bottom: 1.5rem;
    }
    .mz-prof-stat {
      background: #111118; border: 1px solid #2a2a3a;
      border-radius: 8px; padding: .75rem .5rem; text-align: center;
    }
    .mz-prof-stat-val {
      font-family: 'Black Ops One', cursive; font-size: 1.2rem;
      color: #00f5ff; display: block; margin-bottom: .2rem;
    }
    .mz-prof-stat-lbl {
      font-size: .58rem; font-weight: 700; letter-spacing: 1.5px;
      text-transform: uppercase; color: #6a6a8a;
    }

    .mz-prof-section { margin-bottom: 1.2rem; }
    .mz-prof-section-title {
      font-size: .62rem; font-weight: 700; letter-spacing: 2px;
      text-transform: uppercase; color: #6a6a8a; margin-bottom: .6rem;
    }

    .mz-prof-game-row {
      display: flex; align-items: center; gap: .75rem;
      background: #111118; border: 1px solid #2a2a3a;
      border-radius: 7px; padding: .55rem .8rem; margin-bottom: .4rem;
    }
    .mz-prof-game-name { flex: 1; font-size: .8rem; font-weight: 600; }
    .mz-prof-game-plays { font-size: .7rem; color: #00f5ff; font-weight: 700; }

    .mz-prof-signout {
      width: 100%; background: rgba(255,0,170,.08);
      border: 1px solid rgba(255,0,170,.3); border-radius: 6px;
      color: #ff00aa; font-family: 'Exo 2', sans-serif;
      font-size: .75rem; font-weight: 700; letter-spacing: 2px;
      text-transform: uppercase; padding: .6rem; cursor: pointer;
      transition: all .2s; margin-top: .5rem;
    }
    .mz-prof-signout:hover { background: rgba(255,0,170,.18); }
  `;
  document.head.appendChild(style);

  /* ── wait for DOM ── */
  window.addEventListener('load', () => {
    injectButton();
    injectModal();
  });

  function injectButton() {
    const chip = document.getElementById('userChip');
    if (!chip) return;
    const btn = document.createElement('button');
    btn.id = 'mz-profile-btn';
    btn.textContent = '👤 Profile';
    btn.addEventListener('click', openProfile);
    chip.parentNode.insertBefore(btn, chip.nextSibling);
  }

  function injectModal() {
    const overlay = document.createElement('div');
    overlay.id = 'mz-profile-overlay';
    overlay.innerHTML = `<div id="mz-profile-modal"></div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) closeProfile(); });
    document.body.appendChild(overlay);
  }

  function openProfile() {
    const overlay = document.getElementById('mz-profile-overlay');
    const modal   = document.getElementById('mz-profile-modal');
    if (!overlay || !modal) return;
    modal.innerHTML = buildProfileHTML();
    overlay.classList.add('open');
  }

  function closeProfile() {
    const overlay = document.getElementById('mz-profile-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  window.mzProfileClose = closeProfile;

  function buildProfileHTML() {
    const username = localStorage.getItem('mz_session') || 'Guest';
    const users    = JSON.parse(localStorage.getItem('mz_users') || '{}');
    const userData = users[username] || {};
    const created  = userData.created ? new Date(userData.created).toLocaleDateString() : 'Unknown';

    /* analytics */
    let analytics = {};
    try { analytics = JSON.parse(localStorage.getItem('mz_analytics') || '{}'); } catch(e) {}
    const games      = analytics.games || {};
    const totalPlays = Object.values(games).reduce((s, g) => s + (g.plays || 0), 0);
    const totalTime  = analytics.totalTime || 0;
    const sessions   = (analytics.sessions || []).length;

    function fmtTime(sec) {
      if (!sec) return '0m';
      if (sec < 3600) return Math.floor(sec / 60) + 'm';
      return Math.floor(sec / 3600) + 'h ' + Math.floor((sec % 3600) / 60) + 'm';
    }

    /* most played */
    const sorted = Object.entries(games)
      .sort((a, b) => b[1].plays - a[1].plays)
      .slice(0, 5);

    const gameRows = sorted.length
      ? sorted.map(([id, g]) =>
          `<div class="mz-prof-game-row">
            <span class="mz-prof-game-name">${id}</span>
            <span class="mz-prof-game-plays">${g.plays} play${g.plays !== 1 ? 's' : ''}</span>
          </div>`).join('')
      : '<div style="font-size:.75rem;color:#6a6a8a;">No games played yet.</div>';

    const initial = username.charAt(0).toUpperCase();
    const theme   = localStorage.getItem('selectedTheme') || 'default';

    return `
      <div class="mz-prof-header">
        <div class="mz-prof-title">PROFILE</div>
        <button class="mz-prof-close" onclick="mzProfileClose()">✕</button>
      </div>
      <div class="mz-prof-avatar">${initial}</div>
      <div class="mz-prof-username">${username}</div>
      <div class="mz-prof-joined">Member since ${created}</div>
      <div class="mz-prof-stats">
        <div class="mz-prof-stat">
          <span class="mz-prof-stat-val">${totalPlays}</span>
          <span class="mz-prof-stat-lbl">Games Played</span>
        </div>
        <div class="mz-prof-stat">
          <span class="mz-prof-stat-val">${fmtTime(totalTime)}</span>
          <span class="mz-prof-stat-lbl">Time on Site</span>
        </div>
        <div class="mz-prof-stat">
          <span class="mz-prof-stat-val">${sessions}</span>
          <span class="mz-prof-stat-lbl">Sessions</span>
        </div>
      </div>
      <div class="mz-prof-section">
        <div class="mz-prof-section-title">Most Played</div>
        ${gameRows}
      </div>
      <div class="mz-prof-section">
        <div class="mz-prof-section-title">Info</div>
        <div class="mz-prof-game-row">
          <span class="mz-prof-game-name">Active Theme</span>
          <span class="mz-prof-game-plays">${theme}</span>
        </div>
        <div class="mz-prof-game-row">
          <span class="mz-prof-game-name">MathZone Version</span>
          <span class="mz-prof-game-plays">V4.1</span>
        </div>
      </div>
      <button class="mz-prof-signout" onclick="mzSignOut()">↩ Sign Out</button>
    `;
  }

  window.mzSignOut = function () {
    localStorage.removeItem('mz_session');
    closeProfile();
    location.reload();
  };

})();
