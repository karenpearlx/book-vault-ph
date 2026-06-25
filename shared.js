// ============================================================
// The Book Vault PH — data layer
// Supabase when configured; localStorage fallback otherwise.
//
// SCHEMA (Supabase):
//   books    (id uuid pk, title, author, genre, condition,
//             price_bought numeric, price_sell numeric,
//             summary text, cover_url text,
//             is_featured boolean, status text default 'available',
//             created_at timestamptz)
//   status values: 'available', 'coming_soon'
//   settings (key text pk, value jsonb)
//     known keys: 'featured_author' → {name, bio}
//                 'featured_book'   → {description}
// ============================================================

const BVPH = (() => {
  const K_BOOKS_LOCAL = 'bvph_books_v1';
  const K_FEAT_LOCAL  = 'bvph_featured_v1';
  const K_ORDERS      = 'bvph_orders_v1';
  const K_AUTH        = 'bvph_auth_v1';
  const K_WISHLIST    = 'bvph_wishlist_v1';
  const K_CART        = 'bvph_cart_v1';
  const PASSWORD      = 'KpearlOng99!';

  const GENRES = [
    'Fiction','Non-Fiction','Thriller','Romance','Fantasy',
    'Horror','Self-Help','Mystery','Sci-Fi','Biography','Other'
  ];
  const CONDITIONS = ['Like New','Good','Fair'];

  // Demo books removed - using Supabase as source of truth
  const DEMO_BOOKS = [];

  // ---------- SUPABASE INIT ----------
  const cfg = (typeof window !== 'undefined' && window.BVPH_CONFIG) || {};
  const SUPABASE_URL = cfg.SUPABASE_URL || '';
  const SUPABASE_KEY = cfg.SUPABASE_ANON_KEY || '';
  const HAS_LIB = typeof window !== 'undefined' && window.supabase && window.supabase.createClient;
  const HAS_KEYS = !!(SUPABASE_URL && SUPABASE_KEY)
    && !SUPABASE_URL.includes('YOUR_')
    && !SUPABASE_KEY.includes('YOUR_');
  const USE_SUPABASE = HAS_LIB && HAS_KEYS;
  let sb = null;
  if (USE_SUPABASE) {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  // ---------- CACHE ----------
  let _books = null;     // null = not loaded yet
  let _featured = null;
  let _subscribers = [];
  const _notify = () => _subscribers.forEach(fn => { try { fn(); } catch(e){} });

  // ---------- LOCAL FALLBACK ----------
  const _readBooksLocal = () => {
    try {
      const raw = localStorage.getItem(K_BOOKS_LOCAL);
      if (!raw) return [...DEMO_BOOKS];
      const p = JSON.parse(raw);
      return Array.isArray(p) && p.length ? p : [...DEMO_BOOKS];
    } catch(e) { return [...DEMO_BOOKS]; }
  };
  const _writeBooksLocal = (books) => {
    try { localStorage.setItem(K_BOOKS_LOCAL, JSON.stringify(books)); } catch(e) {}
  };
  const _readFeaturedLocal = () => {
    try {
      const raw = localStorage.getItem(K_FEAT_LOCAL);
      if (!raw) return { bookDescription:'', authorName:'', authorBio:'' };
      const p = JSON.parse(raw);
      return { bookDescription: p.bookDescription || '', authorName: p.authorName || '', authorBio: p.authorBio || '' };
    } catch(e) { return { bookDescription:'', authorName:'', authorBio:'' }; }
  };
  const _writeFeaturedLocal = (f) => {
    try { localStorage.setItem(K_FEAT_LOCAL, JSON.stringify(f)); } catch(e) {}
  };

  // ---------- ROW <-> BOOK ----------
  const rowToBook = (r) => ({
    id: r.id,
    title: r.title,
    author: r.author,
    genre: r.genre || 'Other',
    condition: r.condition || 'Good',
    costPrice: Number(r.price_bought) || 0,
    sellPrice: Number(r.price_sell) || 0,
    summary: r.summary || '',
    cover: r.cover_url || '',
    rating: r.rating ? Number(r.rating) : null,
    goodreads_url: r.goodreads_url || '',
    featured: !!r.is_featured,
    status: r.status || 'available',
    quantity: r.quantity || 1,
    sale_status: r.sale_status || 'available',
    creditor_name: r.creditor_name || '',
    creditor_phone: r.creditor_phone || '',
    creditor_address: r.creditor_address || '',
    creditor_notes: r.creditor_notes || '',
    reserver_name: r.reserver_name || '',
    reserver_phone: r.reserver_phone || '',
    reserver_address: r.reserver_address || '',
    reserver_notes: r.reserver_notes || '',
    reserver_paid: !!r.reserver_paid,
    createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
  });
  // Row payload for INSERT/UPDATE. Omit id when undefined so Postgres
  // can generate the UUID on insert.
  const bookToRow = (b, { includeId = true } = {}) => {
    const row = {
      title: b.title,
      author: b.author,
      genre: b.genre,
      condition: b.condition,
      price_bought: Number(b.costPrice) || 0,
      price_sell: Number(b.sellPrice) || 0,
      summary: b.summary || '',
      cover_url: b.cover || '',
      rating: b.rating ? Number(b.rating) : null,
      goodreads_url: b.goodreads_url || null,
      is_featured: !!b.featured,
      status: b.status || 'available',
      quantity: b.quantity || 1,
      sale_status: b.sale_status || 'available',
      creditor_name: b.creditor_name || null,
      creditor_phone: b.creditor_phone || null,
      creditor_address: b.creditor_address || null,
      creditor_notes: b.creditor_notes || null,
      reserver_name: b.reserver_name || null,
      reserver_phone: b.reserver_phone || null,
      reserver_address: b.reserver_address || null,
      reserver_notes: b.reserver_notes || null,
      reserver_paid: b.reserver_paid || false,
    };
    if (includeId && b.id) row.id = b.id;
    return row;
  };

  // ---------- LOAD ----------
  async function loadBooks() {
    if (!USE_SUPABASE) {
      _books = _readBooksLocal();
      return _books;
    }
    const { data, error } = await sb.from('books').select('id,title,author,genre,condition,price_bought,price_sell,summary,is_featured,status,rating,goodreads_url,created_at').order('created_at', { ascending: false });
    if (error) {
      console.error('[BVPH] load books error:', error);
      if (_books === null) _books = _readBooksLocal();
      return _books;
    }
    _books = (data || []).length ? data.map(rowToBook) : [...DEMO_BOOKS];
    if (!_books.some(b => b.demo)) _writeBooksLocal(_books);
    return _books;
  }

  async function loadFeatured() {
    if (!USE_SUPABASE) {
      _featured = _readFeaturedLocal();
      return _featured;
    }
    const { data, error } = await sb.from('settings').select('*');
    if (error) {
      console.error('[BVPH] load settings error:', error);
      if (_featured === null) _featured = _readFeaturedLocal();
      return _featured;
    }
    const map = {};
    (data || []).forEach(r => { map[r.key] = r.value || {}; });
    _featured = {
      bookDescription: map['featured_book']?.description || '',
      authorName: map['featured_author']?.name || '',
      authorBio: map['featured_author']?.bio || '',
    };
    _writeFeaturedLocal(_featured);
    return _featured;
  }

  async function init() {
    await Promise.all([loadBooks(), loadFeatured()]);
    if (USE_SUPABASE) _setupRealtime();
    return { mode: USE_SUPABASE ? 'supabase' : 'local', books: _books, featured: _featured };
  }

  function _setupRealtime() {
    try {
      sb.channel('bvph-changes')
        .on('postgres_changes', { event:'*', schema:'public', table:'books' }, async () => {
          await loadBooks(); _notify();
        })
        .on('postgres_changes', { event:'*', schema:'public', table:'settings' }, async () => {
          await loadFeatured(); _notify();
        })
        .subscribe();
    } catch(e) {
      console.warn('[BVPH] realtime failed:', e);
    }
  }

  // ---------- SYNC GETTERS ----------
  const getBooks = () => (_books !== null ? _books : _readBooksLocal());
  const getBook = (id) => getBooks().find(b => b.id === id);
  const getFeatured = () => (_featured !== null ? _featured : _readFeaturedLocal());

  // ---------- COVER LOADING ----------
  const _coverCache = {};
  const _coverLoading = {};
  async function getCover(id) {
    if (_coverCache[id]) return _coverCache[id];
    if (_coverLoading[id]) return _coverLoading[id];
    if (!USE_SUPABASE) return null;
    _coverLoading[id] = (async () => {
      const { data } = await sb.from('books').select('cover_url').eq('id', id).single();
      _coverCache[id] = data?.cover_url || null;
      delete _coverLoading[id];
      return _coverCache[id];
    })();
    return _coverLoading[id];
  }
  async function getCovers(ids) {
    const missing = ids.filter(id => !_coverCache[id] && !_coverLoading[id]);
    if (missing.length && USE_SUPABASE) {
      // Load in batches of 3 to avoid timeout
      const BATCH = 3;
      for (let i = 0; i < missing.length; i += BATCH) {
        const batch = missing.slice(i, i + BATCH);
        const { data } = await sb.from('books').select('id,cover_url').in('id', batch);
        (data || []).forEach(r => { _coverCache[r.id] = r.cover_url; });
      }
    }
    return ids.reduce((o, id) => { o[id] = _coverCache[id] || null; return o; }, {});
  }

  // ---------- WRITES ----------
  // Save the entire books collection. Diffs against the cache to
  // figure out what to insert / update / delete. Demo books skipped.
  async function saveBooks(newBooks) {
    newBooks = newBooks.filter(b => !b.demo).map(b => ({...b}));

    // Enforce single-featured invariant in the payload
    const fIdx = newBooks.findIndex(b => b.featured);
    if (fIdx >= 0) newBooks.forEach((b, i) => b.featured = (i === fIdx));

    if (!USE_SUPABASE) {
      _writeBooksLocal(newBooks);
      _books = newBooks;
      _notify();
      return getBooks();
    }

    const existing = (_books || []).filter(b => !b.demo);
    const newIds = new Set(newBooks.map(b => b.id).filter(Boolean));
    const toDelete = existing.filter(b => !newIds.has(b.id)).map(b => b.id);

    if (toDelete.length) {
      const { error } = await sb.from('books').delete().in('id', toDelete);
      if (error) console.error('[BVPH] delete error:', error);
    }
    if (newBooks.length) {
      // Inserts (no id) and updates (with id) all via upsert
      const rows = newBooks.map(b => bookToRow(b, { includeId: !!b.id && !b.id.startsWith('tmp_') }));
      const { error } = await sb.from('books').upsert(rows);
      if (error) console.error('[BVPH] upsert error:', error);
    }
    await loadBooks();
    _notify();
    return getBooks();
  }

  // Add a single new book. Returns the inserted row (with DB-generated UUID).
  async function addBook(book) {
    if (!USE_SUPABASE) {
      const all = getBooks().filter(b => !b.demo);
      const created = { ...book, id: book.id || newId(), createdAt: Date.now() };
      all.unshift(created);
      _writeBooksLocal(all);
      _books = all;
      _notify();
      return created;
    }
    const row = bookToRow(book, { includeId: false });
    const { data, error } = await sb.from('books').insert(row).select().single();
    if (error) { console.error('[BVPH] insert error:', error); throw error; }
    // If newly added is featured, clear others
    if (data?.is_featured) await _clearOtherFeatured(data.id);
    await loadBooks();
    _notify();
    return rowToBook(data);
  }

  // Update a single book by id.
  async function updateBook(id, patch) {
    if (!USE_SUPABASE) {
      const all = getBooks().filter(b => !b.demo).map(b => b.id === id ? { ...b, ...patch } : b);
      _writeBooksLocal(all);
      _books = all;
      _notify();
      return all.find(b => b.id === id);
    }
    const row = bookToRow({ ...getBook(id), ...patch }, { includeId: false });
    const { error } = await sb.from('books').update(row).eq('id', id);
    if (error) { console.error('[BVPH] update error:', error); throw error; }
    if (patch.featured === true) await _clearOtherFeatured(id);
    await loadBooks();
    _notify();
    return getBook(id);
  }

  async function deleteBook(id) {
    if (!USE_SUPABASE) {
      const all = getBooks().filter(b => !b.demo).filter(b => b.id !== id);
      _writeBooksLocal(all);
      _books = all;
      _notify();
      return;
    }
    const { error } = await sb.from('books').delete().eq('id', id);
    if (error) { console.error('[BVPH] delete error:', error); throw error; }
    await loadBooks();
    _notify();
  }

  // Star toggle: pass an id to feature, or null to clear all.
  async function setFeaturedBook(id) {
    if (!USE_SUPABASE) {
      const all = getBooks().filter(b => !b.demo).map(b => ({ ...b, featured: b.id === id }));
      _writeBooksLocal(all);
      _books = all;
      _notify();
      return;
    }
    // Clear all currently-featured rows (touches only matching ones)
    const { error: e1 } = await sb.from('books').update({ is_featured: false }).eq('is_featured', true);
    if (e1) console.error('[BVPH] clear featured error:', e1);
    if (id) {
      const { error: e2 } = await sb.from('books').update({ is_featured: true }).eq('id', id);
      if (e2) console.error('[BVPH] set featured error:', e2);
    }
    await loadBooks();
    _notify();
  }

  async function _clearOtherFeatured(keepId) {
    if (!USE_SUPABASE) return;
    const { error } = await sb.from('books').update({ is_featured: false }).eq('is_featured', true).neq('id', keepId);
    if (error) console.error('[BVPH] clear-others error:', error);
  }

  // Save featured panel text fields (and optionally bookId).
  async function saveFeatured(f) {
    const merged = {
      bookDescription: f.bookDescription || '',
      authorName: f.authorName || '',
      authorBio: f.authorBio || '',
    };
    if (!USE_SUPABASE) {
      _writeFeaturedLocal(merged);
      _featured = merged;
      if (f.bookId !== undefined) await setFeaturedBook(f.bookId);
      _notify();
      return _featured;
    }
    // Upsert two settings rows in parallel
    const author = { name: merged.authorName, bio: merged.authorBio };
    const book = { description: merged.bookDescription };
    const [r1, r2] = await Promise.all([
      sb.from('settings').upsert({ key: 'featured_author', value: author }, { onConflict: 'key' }),
      sb.from('settings').upsert({ key: 'featured_book',   value: book   }, { onConflict: 'key' }),
    ]);
    if (r1.error) console.error('[BVPH] settings author error:', r1.error);
    if (r2.error) console.error('[BVPH] settings book error:', r2.error);
    if (f.bookId !== undefined) await setFeaturedBook(f.bookId);
    await loadFeatured();
    _notify();
    return _featured;
  }



  // ---------- ANALYTICS ----------
  const K_SESSION = 'bvph_session_id_v1';
  const ANALYTICS_EVENTS = new Set(['page_view','book_click','order_start','wishlist_add','nav_click','buy_now_click','payment_view','order_submit','contact_click']);
  const getSessionId = () => {
    try {
      let id = sessionStorage.getItem(K_SESSION);
      if (!id) {
        id = (window.crypto?.randomUUID?.() || ('s_' + Date.now().toString(36) + Math.random().toString(36).slice(2,10)));
        sessionStorage.setItem(K_SESSION, id);
      }
      return id;
    } catch(e) {
      return 's_' + Date.now().toString(36) + Math.random().toString(36).slice(2,10);
    }
  };
  const currentPage = () => {
    try {
      const path = window.location.pathname || '/';
      return path === '/' ? 'index.html' : path.replace(/^\//,'');
    } catch(e) { return 'unknown'; }
  };
  function track(eventType, opts = {}) {
    if (!USE_SUPABASE || !ANALYTICS_EVENTS.has(eventType)) return Promise.resolve(false);
    if (localStorage.getItem('bvph_admin')) return Promise.resolve(false); // exclude admin visits
    const payload = {
      event_type: eventType,
      page: opts.page || currentPage(),
      book_id: opts.bookId || opts.book_id || null,
      session_id: opts.sessionId || getSessionId(),
      referrer: opts.referrer !== undefined ? opts.referrer : (document.referrer || null),
    };
    if (opts.element) payload.element = opts.element;
    if (opts.target) payload.target = opts.target;
    const send = () => sb.from('analytics').insert(payload).then(({ error }) => {
      if (error) console.warn('[BVPH] analytics error:', error.message || error);
      return !error;
    }).catch(e => { console.warn('[BVPH] analytics failed:', e); return false; });
    if ('requestIdleCallback' in window) return new Promise(resolve => requestIdleCallback(() => send().then(resolve), { timeout: 1500 }));
    return send();
  }
  const trackPageView = (page) => track('page_view', { page });
  const trackClick = (element, opts = {}) => track(opts.eventType || 'nav_click', { ...opts, element });
  async function getAnalytics() {
    if (!USE_SUPABASE) return { events: [], books: [] };
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [{ data: events, error: e1 }, { data: books, error: e2 }] = await Promise.all([
      sb.from('analytics').select('*').gte('created_at', since).order('created_at', { ascending: false }).limit(1000),
      sb.from('books').select('id,title,author,cover_url'),
    ]);
    if (e1) console.warn('[BVPH] analytics load error:', e1.message || e1);
    if (e2) console.warn('[BVPH] analytics books load error:', e2.message || e2);
    return { events: events || [], books: books || [] };
  }

  // ---------- LIVE-UPDATE SUBSCRIBE ----------
  function onChange(fn) {
    _subscribers.push(fn);
    return () => { _subscribers = _subscribers.filter(f => f !== fn); };
  }

  // ---------- STATUS ----------
  const status = () => ({
    mode: USE_SUPABASE ? 'supabase' : 'local',
    configured: USE_SUPABASE,
    libLoaded: HAS_LIB,
    hasKeys: HAS_KEYS,
    booksLoaded: _books !== null,
    bookCount: _books?.length || 0,
  });

  // ---------- ORDERS (localStorage) ----------
  const getOrders = () => { try { const r = localStorage.getItem(K_ORDERS); return r ? JSON.parse(r) : []; } catch(e){ return []; } };
  const saveOrders = (orders) => localStorage.setItem(K_ORDERS, JSON.stringify(orders));
  const addOrder = (order) => {
    const orders = getOrders();
    const id = 'o_' + Date.now().toString(36) + Math.random().toString(36).slice(2,5);
    const full = { id, status:'pending', createdAt: Date.now(), ...order };
    orders.unshift(full);
    saveOrders(orders);
    return full;
  };
  const getOrder = (id) => getOrders().find(o => o.id === id);

  // ---------- AUTH ----------
  const SESSION_MS = 30 * 60 * 1000;
  const _readAuth = () => { try { const raw = localStorage.getItem(K_AUTH); if (!raw || raw === '1') return null; const o = JSON.parse(raw); return o?.at ? o : null; } catch(e){ return null; } };
  const sessionMsLeft = () => { const a = _readAuth(); return a ? Math.max(0, (a.at + SESSION_MS) - Date.now()) : 0; };
  const isAuthed = () => sessionMsLeft() > 0;
  const login = (pw) => { if (pw === PASSWORD) { localStorage.setItem(K_AUTH, JSON.stringify({ at: Date.now() })); return true; } return false; };
  const logout = () => localStorage.removeItem(K_AUTH);
  const enforceSession = () => { if (_readAuth() && !isAuthed()) { logout(); return false; } return isAuthed(); };

  // ---------- UTIL ----------
  const newId = () => (window.crypto?.randomUUID?.() || ('b_' + Date.now().toString(36) + Math.random().toString(36).slice(2,7)));
  const fileToDataUrl = (file, maxW=800, quality=0.82) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // ---------- WISHLIST (localStorage only) ----------
  const _wlSubs = [];
  const _notifyWl = () => _wlSubs.forEach(fn => { try { fn(); } catch(e){} });
  const getWishlist = () => {
    try { const raw = localStorage.getItem(K_WISHLIST); const a = raw ? JSON.parse(raw) : []; return Array.isArray(a) ? a : []; }
    catch(e) { return []; }
  };
  const _writeWishlist = (ids) => {
    try { localStorage.setItem(K_WISHLIST, JSON.stringify(ids)); } catch(e) {}
    _notifyWl();
    try { window.dispatchEvent(new CustomEvent('bvph:wishlist')); } catch(e){}
  };
  const isInWishlist = (id) => getWishlist().includes(id);
  const addToWishlist = (id) => { const a = getWishlist(); if (!a.includes(id)) { a.unshift(id); _writeWishlist(a); } };
  const removeFromWishlist = (id) => { _writeWishlist(getWishlist().filter(x => x !== id)); };
  const toggleWishlist = (id) => { isInWishlist(id) ? removeFromWishlist(id) : addToWishlist(id); return isInWishlist(id); };
  const onWishlistChange = (fn) => { _wlSubs.push(fn); return () => { const i = _wlSubs.indexOf(fn); if (i>=0) _wlSubs.splice(i,1); }; };
  const getWishlistBooks = () => {
    const ids = getWishlist();
    const map = new Map((_books||[]).map(b => [b.id, b]));
    return ids.map(id => map.get(id)).filter(Boolean);
  };

  // -------- Cart --------
  const _cartSubs = [];
  const _readCart = () => { try { const r = localStorage.getItem(K_CART); return r ? JSON.parse(r) : []; } catch(e){ return []; } };
  const _writeCart = (items) => { try { localStorage.setItem(K_CART, JSON.stringify(items)); _cartSubs.forEach(fn => fn(items)); window.dispatchEvent(new CustomEvent('bvph:cart')); } catch(e){} };
  const getCart = () => _readCart();
  const getCartCount = () => _readCart().reduce((sum, item) => sum + (item.qty || 1), 0);
  const isInCart = (id) => _readCart().some(item => item.id === id);
  const addToCart = (id, qty = 1) => {
    const cart = _readCart();
    const existing = cart.find(item => item.id === id);
    if (existing) { existing.qty = (existing.qty || 1) + qty; }
    else { cart.push({ id, qty }); }
    _writeCart(cart);
  };
  const updateCartQty = (id, qty) => {
    const cart = _readCart();
    const item = cart.find(x => x.id === id);
    if (item) { item.qty = Math.max(1, qty); _writeCart(cart); }
  };
  const removeFromCart = (id) => { _writeCart(_readCart().filter(x => x.id !== id)); };
  const clearCart = () => _writeCart([]);
  const onCartChange = (fn) => { _cartSubs.push(fn); return () => { const i = _cartSubs.indexOf(fn); if (i>=0) _cartSubs.splice(i,1); }; };
  const getCartBooks = () => {
    const cart = _readCart();
    const map = new Map((_books||[]).map(b => [b.id, b]));
    return cart.map(item => {
      const book = map.get(item.id);
      return book ? { ...book, qty: item.qty || 1 } : null;
    }).filter(Boolean);
  };
  const getCartTotal = () => getCartBooks().reduce((sum, b) => sum + (Number(b.sellPrice) || 0) * (b.qty || 1), 0);

  return {
    GENRES, CONDITIONS, USE_SUPABASE,
    init, loadBooks, loadFeatured, onChange, status,
    getBooks, getBook, getFeatured, getCover, getCovers,
    saveBooks, addBook, updateBook, deleteBook, setFeaturedBook, saveFeatured,
    getOrders, saveOrders, addOrder, getOrder,
    newId, fileToDataUrl,
    isAuthed, login, logout, enforceSession, sessionMsLeft, SESSION_MS,
    getWishlist, isInWishlist, addToWishlist, removeFromWishlist, toggleWishlist,
    onWishlistChange, getWishlistBooks,
    getCart, getCartCount, isInCart, addToCart, updateCartQty, removeFromCart, clearCart, onCartChange, getCartBooks, getCartTotal,
    track, trackPageView, trackClick, getAnalytics,
    supabase: () => sb,
  };
})();
