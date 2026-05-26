/**
 * Habesha Thread - API client
 * Talks to the Express backend. Set window.HT_API_BASE in HTML if needed.
 */
(function () {
  const DEFAULT_BASE = 'http://localhost:3000/api';
  const BASE = window.HT_API_BASE || DEFAULT_BASE;
  const CART_KEY = 'habesha_thread_cart_id';

  async function request(path, opts = {}) {
    const res = await fetch(BASE + path, {
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      ...opts,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) {
      const msg = data.error || `Request failed (${res.status})`;
      const err = new Error(msg);
      err.status = res.status;
      err.details = data.details;
      throw err;
    }
    return data;
  }

  function getCartId() {
    return localStorage.getItem(CART_KEY);
  }
  function setCartId(id) {
    if (id) localStorage.setItem(CART_KEY, id);
  }
  function clearCartId() {
    localStorage.removeItem(CART_KEY);
  }

  async function ensureCartId() {
    let id = getCartId();
    if (id) return id;
    const { cart_id } = await request('/cart', { method: 'POST' });
    setCartId(cart_id);
    return cart_id;
  }

  const api = {
    base: BASE,
    request,
    getCartId,
    clearCartId,
    ensureCartId,

    // Products
    listProducts: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request('/products' + (qs ? '?' + qs : ''));
    },
    getProduct: (slug) => request('/products/' + encodeURIComponent(slug)),
    searchProducts: (q) => request('/products/search?q=' + encodeURIComponent(q)),

    // Cart
    getCart: async () => {
      const id = await ensureCartId();
      try {
        return await request('/cart/' + id);
      } catch (err) {
        if (err.status === 404) {
          clearCartId();
          const fresh = await ensureCartId();
          return await request('/cart/' + fresh);
        }
        throw err;
      }
    },
    addToCart: async ({ product_slug, product_id, size_label, size_id, qty = 1 }) => {
      const id = await ensureCartId();
      return request(`/cart/${id}/items`, {
        method: 'POST',
        body: { product_slug, product_id, size_label, size_id, qty },
      });
    },
    updateCartItem: async (itemId, qty) => {
      const id = await ensureCartId();
      return request(`/cart/${id}/items/${itemId}`, { method: 'PATCH', body: { qty } });
    },
    removeCartItem: async (itemId) => {
      const id = await ensureCartId();
      return request(`/cart/${id}/items/${itemId}`, { method: 'DELETE' });
    },

    // Checkout
    createOrder: async ({ customer, shipping_address }) => {
      const cart_id = await ensureCartId();
      return request('/checkout', {
        method: 'POST',
        body: { cart_id, customer, shipping_address },
      });
    },
    confirmFakePayment: (orderNo) =>
      request(`/checkout/${encodeURIComponent(orderNo)}/confirm-fake-payment`, { method: 'POST' }),

    // Orders
    getOrder: (orderNo, email) =>
      request(`/orders/${encodeURIComponent(orderNo)}` + (email ? `?email=${encodeURIComponent(email)}` : '')),
  };

  window.HTApi = api;
})();
