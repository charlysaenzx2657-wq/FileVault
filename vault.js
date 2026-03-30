/**
 * vault.js — FileVault shared in-memory storage
 * Persists within the same tab via a shared global object.
 * For cross-tab persistence, a backend is required.
 */

// Shared vault object (lives in window scope so all pages can access it)
if (!window._fileVault) {
  window._fileVault = {};
}

const Vault = {

  /**
   * Store a file in the vault.
   * @param {string} token - Unique token
   * @param {Object} fileData - { name, size, type, data (base64), uploadedAt }
   */
  store(token, fileData) {
    window._fileVault[token] = {
      ...fileData,
      uploadedAt: new Date().toISOString(),
      downloads: 0,
    };
    this._persist();
  },

  /**
   * Retrieve a file by token.
   * @param {string} token
   * @returns {Object|null}
   */
  get(token) {
    return window._fileVault[token] || null;
  },

  /**
   * Increment download count for a token.
   * @param {string} token
   */
  incrementDownloads(token) {
    if (window._fileVault[token]) {
      window._fileVault[token].downloads++;
      this._persist();
    }
  },

  /**
   * Returns all stored entries.
   * @returns {Object}
   */
  getAll() {
    return window._fileVault;
  },

  /**
   * Returns count of stored files.
   * @returns {number}
   */
  count() {
    return Object.keys(window._fileVault).length;
  },

  /**
   * Returns total size in bytes of all stored files.
   * @returns {number}
   */
  totalSize() {
    return Object.values(window._fileVault).reduce((acc, f) => acc + (f.size || 0), 0);
  },

  /**
   * Persist snapshot to sessionStorage for same-tab navigation.
   * Only metadata is stored (not the base64 data, which stays in memory).
   */
  _persist() {
    try {
      const meta = {};
      for (const [token, file] of Object.entries(window._fileVault)) {
        meta[token] = { name: file.name, size: file.size, type: file.type, uploadedAt: file.uploadedAt, downloads: file.downloads };
      }
      sessionStorage.setItem('_vaultMeta', JSON.stringify(meta));
    } catch (e) {
      // sessionStorage may be unavailable — silent fail
    }
  },
};

// ── Utility functions shared across pages ──

/**
 * Format bytes to human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
function fmtSize(bytes) {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

/**
 * Get an emoji icon for a MIME type.
 * @param {string} type
 * @returns {string}
 */
function getFileIcon(type) {
  if (!type) return '📄';
  if (type.startsWith('image/'))  return '🖼️';
  if (type.startsWith('video/'))  return '🎬';
  if (type.startsWith('audio/'))  return '🎵';
  if (type.includes('pdf'))       return '📕';
  if (type.includes('zip') || type.includes('rar') || type.includes('7z') || type.includes('tar')) return '📦';
  if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return '📊';
  if (type.includes('presentation') || type.includes('powerpoint')) return '📊';
  if (type.includes('word') || type.includes('document'))           return '📝';
  if (type.includes('text/'))     return '📃';
  if (type.includes('javascript') || type.includes('json') || type.includes('html') || type.includes('css')) return '💻';
  return '📄';
}

/**
 * Generate a secure-looking random token in format XXXX-XXXX-XXXX.
 * Uses a charset that avoids ambiguous characters (0/O, 1/I/l).
 * @returns {string}
 */
function generateToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${seg()}-${seg()}-${seg()}`;
}
