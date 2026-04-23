// saves profile on the website your on

(function () {

  const MZ_SESSION_KEY = 'mz_session';
  const MZ_USERS_KEY   = 'mz_users';
  const MZ_BANNED_KEY  = 'mz_banned';

  /* ── Storage helpers ── */
  function getSession()    { return localStorage.getItem(MZ_SESSION_KEY) || ''; }
  function setSession(u)   { localStorage.setItem(MZ_SESSION_KEY, u); }
  function clearSession()  { localStorage.removeItem(MZ_SESSION_KEY); }

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(MZ_USERS_KEY)) || {}; }
    catch(e) { return {}; }
  }
  function saveUsers(u) { localStorage.setItem(MZ_USERS_KEY, JSON.stringify(u)); }

  function getBanned() {
    try { return JSON.parse(localStorage.getItem(MZ_BANNED_KEY)) || []; }
    catch(e) { return []; }
  }
  function saveBanned(list) { localStorage.setItem(MZ_BANNED_KEY, JSON.stringify(list)); }

  function isBanned(username) {
    return getBanned().map(u => u.toLowerCase()).includes(username.toLowerCase());
  }

  /* ── Cross-tab sync ── */
  let bc = null;
  try {
    bc = new BroadcastChannel('mz_session_sync');
    bc.onmessage = function(e) {
      const { type, username } = e.data || {};
      if (type === 'signin' && username) {
        setSession(username);
        _applySession(username);
      } else if (type === 'signout') {
        clearSession();
        _clearSession();
      }
    };
  } catch(e) {}

  function bcast(type, username) {
    if (bc) bc.postMessage({ type, username });
  }

  /* ── UI helpers ── */
  function _applySession(username) {
    const chip = document.getElementById('userChip');
    if (chip) { chip.textContent = '👤 ' + username; chip.style.display = ''; }
    const signInPage = document.getElementById('signInPage');
    if (signInPage) signInPage.style.display = 'none';
    const bladeMenu = document.getElementById('bladeMenu');
    if (bladeMenu) bladeMenu.classList.add('active');
    window.dispatchEvent(new CustomEvent('mz:sessionRestored', { detail: { username } }));
  }

  function _clearSession() {
    const signInPage = document.getElementById('signInPage');
    if (signInPage) signInPage.style.display = 'flex';
    window.dispatchEvent(new CustomEvent('mz:sessionCleared'));
  }

  /* ── Public API ── */
  window.MZSaver = {

    /**
     * Register a new user account.
     * Returns { success, error }
     */
    register: function(username, password) {
      if (!username || username.length < 3)
        return { success: false, error: 'Username must be at least 3 characters.' };
      if (!password || password.length < 4)
        return { success: false, error: 'Password must be at least 4 characters.' };

      const users = getUsers();
      if (users[username])
        return { success: false, error: 'Username already taken.' };

      users[username] = { password: password, created: Date.now() };
      saveUsers(users);
      return { success: true };
    },

    /**
     * Validate login credentials.
     * Returns { success, error }
     */
    login: function(username, password) {
      if (!username || !password)
        return { success: false, error: 'Please fill in both fields.' };

      const users = getUsers();
      if (!users[username])
        return { success: false, error: 'Account not found.' };
      if (users[username].password !== password)
        return { success: false, error: 'Wrong password.' };
      if (isBanned(username))
        return { success: false, error: 'banned' };

      return { success: true };
    },

    /**
     * Sign in — saves session + syncs across tabs.
     */
    signIn: function(username) {
      setSession(username);
      bcast('signin', username);
      _applySession(username);
    },

    /**
     * Sign out — clears session + syncs across tabs.
     */
    signOut: function() {
      clearSession();
      bcast('signout', null);
      _clearSession();
    },

    /**
     * Reset a user's password to a random string.
     * Returns { success, newPassword, error }
     */
    resetPassword: function(username) {
      const users = getUsers();
      if (!users[username])
        return { success: false, error: 'Account not found.' };

      const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
      let newPass = '';
      for (let i = 0; i < 10; i++)
        newPass += chars[Math.floor(Math.random() * chars.length)];

      users[username].password = newPass;
      saveUsers(users);
      return { success: true, newPassword: newPass };
    },

    /**
     * Get the current logged-in username (empty string if none).
     */
    getUsername: function() { return getSession(); },

    /**
     * Show the current user's own credentials in an alert.
     * Called by the "See Your Username & Password" button.
     */
    showMyCredentials: function() {
      const sess = getSession();
      if (!sess) {
        alert('You have not created an account yet.');
        return;
      }
      const users = getUsers();
      const user  = users[sess];
      if (!user) {
        alert('You have not created an account yet.');
        return;
      }
      alert(
        '━━━━━━━━━━━━━━━━━━\n' +
        '  YOUR ACCOUNT INFO\n' +
        '━━━━━━━━━━━━━━━━━━\n' +
        'Username : ' + sess + '\n' +
        'Password : ' + user.password + '\n' +
        '━━━━━━━━━━━━━━━━━━'
      );
    },

    /**
     * Ban a username (admin use).
     */
    ban: function(username) {
      const list = getBanned();
      if (!list.includes(username.toLowerCase())) {
        list.push(username.toLowerCase());
        saveBanned(list);
      }
    },

    /**
     * Unban a username (admin use).
     */
    unban: function(username) {
      saveBanned(getBanned().filter(u => u !== username.toLowerCase()));
    },

    /**
     * Check if a username is banned.
     */
    isBanned: isBanned,

    /**
     * Get all registered usernames (no passwords).
     * Returns string[]
     */
    getAllUsers: function() {
      return Object.keys(getUsers());
    }
  };

  /* ── Auto-restore session on load ── */
  function autoRestore() {
    const sess = getSession();
    if (sess) _applySession(sess);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoRestore);
  } else {
    autoRestore();
  }

})();
