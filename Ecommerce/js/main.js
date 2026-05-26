/**
 * Habesha Thread - Global Application Engine
 * Manages client-side e-commerce state (Bag, Search, Sidebar Drawers, Toast Notifications, Accordions).
 */

// Available catalog items database
const PRODUCT_CATALOG = {
  "heritage-suit": {
    id: "heritage-suit",
    name: "The Heritage Modernist Suit",
    price: 1250.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOyijPm1Ox0Ibg5LKTnbHYcTNf7rGkQ-1__nNMaTBjXm-ma5FuwFXUKNZO1lmVSHLntOKd0BDTZ_YN6BjaGYbX80xhVn48cvn0f4Pk6g0zzlGmco3YMiFThSBrsWIC8A__qhLuUSsCnglPfx8DqCx6wJFpkppQzKD6zeGVjpKcOSOFNv1Fglw2S6_j4tNDbxCmnSYjDoQEgN28Xzi5G-xDQFi5vXCbP0X47mmoCabXOCBb1FmArX32-5ltn4nMV6irtVLKKME2c3Y",
    description: "Charcoal Grey tailored suit with intricate 24k gold Tibeb embroidery."
  },
  "negus-suit": {
    id: "negus-suit",
    name: "Contemporary Negus Suit",
    price: 1450.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOyijPm1Ox0Ibg5LKTnbHYcTNf7rGkQ-1__nNMaTBjXm-ma5FuwFXUKNZO1lmVSHLntOKd0BDTZ_YN6BjaGYbX80xhVn48cvn0f4Pk6g0zzlGmco3YMiFThSBrsWIC8A__qhLuUSsCnglPfx8DqCx6wJFpkppQzKD6zeGVjpKcOSOFNv1Fglw2S6_j4tNDbxCmnSYjDoQEgN28Xzi5G-xDQFi5vXCbP0X47mmoCabXOCBb1FmArX32-5ltn4nMV6irtVLKKME2c3Y",
    description: "Charcoal Grey with exquisite, handcrafted hand-woven lapel Tibeb detailing."
  },
  "gabi-tunic": {
    id: "gabi-tunic",
    name: "The Artisan Gabi Tunic",
    price: 720.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDEmj5AOH4ciFe4Xu8JtQR1lt3cvII18TgmGFOKYDGqbgZOHiCPr1wlPh402wtx_jS013EVN_LPGVunAJmk8lQznITelibGop1wZosXrA-NFB7jOK4joBg78-r59bAaP84ysVjDbl9LRh4B9U9RFOn6yLZ5_coMhGucWU1uQdHSa2odIblmovUsTG15_sh1zX6obFQfvDHNcxxsCZ1Do13N1Z8p1HLKpGubmZjUDSTdquhoLKNI0jnGqnPihL3uf-FHKAxPFEkmbs",
    description: "Hand-spun organic emerald weave tunic representing traditional comfort."
  },
  "negade-blazer": {
    id: "negade-blazer",
    name: "City Negade Blazer",
    price: 890.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7si1vTCGyOBQo5aElSk334feMezql9lBWEuIhes1GJ9IoUPhLv5oJT-0pJuKraG65EYyVPbxaRMACa9X47ie_3pjo5lTva-2GF9_985G9EkFA_rl3JDtwi0jKXkyrB2CeKFPvLUfHFplUnU6kGSpRNGBf1owB5dqbjXtwqDgYUf1Tc1W5g4k_DFT05XVC-nePDf0-LPuaMjMdWV1TzuS679PhSIVNzgpVOQpZbMesz-rAfCL1k7Zwor99xXD5zlk8Bb77ayShBMM",
    description: "Tailored blazer in linen with deep navy tones and pocket-square accents."
  },
  "axumite-belt": {
    id: "axumite-belt",
    name: "Axumite Leather Belt",
    price: 340.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHtCntVzkRH3PIKKKBUUiHxLxlhZYHFAUWq3C5yaoC0oJRh8gz8sJgWw7ts69YtuZRo783GY1MzBm7wcmOr-7GH4jv76yDwTWniRBH-L6Uwur8Zwwgq0wWHYD_Kkc2HMHOqZLgQdoS_LYIf0xeJc5BAqC472rFsOxEnznRie4rwnADiuWwzW9Px94Lw0PHQtDdCDwVr6QYVuQ71gBIZVEyuin8FEi0u8J--gD3CM34jcM5L3ueCaqbTzAyhDFZZtSm37FBwCrJg3Y",
    description: "Premium handcrafted dark tan leather belt with architectural gold buckle details."
  },
  "axumite-belt-light": {
    id: "axumite-belt-light",
    name: "Axumite Heritage Belt (Tan)",
    price: 245.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHtCntVzkRH3PIKKKBUUiHxLxlhZYHFAUWq3C5yaoC0oJRh8gz8sJgWw7ts69YtuZRo783GY1MzBm7wcmOr-7GH4jv76yDwTWniRBH-L6Uwur8Zwwgq0wWHYD_Kkc2HMHOqZLgQdoS_LYIf0xeJc5BAqC472rFsOxEnznRie4rwnADiuWwzW9Px94Lw0PHQtDdCDwVr6QYVuQ71gBIZVEyuin8FEi0u8J--gD3CM34jcM5L3ueCaqbTzAyhDFZZtSm37FBwCrJg3Y",
    description: "Lighter variant rest on linen rest belt with Axum pattern buckle."
  },
  "ritual-vest": {
    id: "ritual-vest",
    name: "Imperial Ritual Vest",
    price: 680.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7r4L-hRe8rLWr0hLadRlJS1egeUffXFzsUHfRqgKvqhFxenHlGBGqvx4w7LasTNsF97ubmjtjKESQh0MVMf_O3rCDXeZFveYacifIy3PZpXGPqnAcfCwsL5cWJfZsJo6dzdym5MfHymDplo0zIykdPI0JGsoTyECtCyRMHFOz_eQaOnVpfLGnRoa7OJ9aPW-jG6eQ-bUjryTEwYPOVOrfH3KiD8FV3I8JqmVMZn8mRmriyOFtkE18pPCCD5IJ8ru50XMOa2ZBq38",
    description: "Wool knitted luxury vest with hand-embellished geometric stitch motifs."
  },
  "empire-loafers": {
    id: "empire-loafers",
    name: "Empire Loafers",
    price: 380.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7r4L-hRe8rLWr0hLadRlJS1egeUffXFzsUHfRqgKvqhFxenHlGBGqvx4w7LasTNsF97ubmjtjKESQh0MVMf_O3rCDXeZFveYacifIy3PZpXGPqnAcfCwsL5cWJfZsJo6dzdym5MfHymDplo0zIykdPI0JGsoTyECtCyRMHFOz_eQaOnVpfLGnRoa7OJ9aPW-jG6eQ-bUjryTEwYPOVOrfH3KiD8FV3I8JqmVMZn8mRmriyOFtkE18pPCCD5IJ8ru50XMOa2ZBq38",
    description: "Premium black leather loafers featuring subtle gold thread lining."
  },
  "tibeb-silk-square": {
    id: "tibeb-silk-square",
    name: "Tibeb Silk Square",
    price: 85.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7r4L-hRe8rLWr0hLadRlJS1egeUffXFzsUHfRqgKvqhFxenHlGBGqvx4w7LasTNsF97ubmjtjKESQh0MVMf_O3rCDXeZFveYacifIy3PZpXGPqnAcfCwsL5cWJfZsJo6dzdym5MfHymDplo0zIykdPI0JGsoTyECtCyRMHFOz_eQaOnVpfLGnRoa7OJ9aPW-jG6eQ-bUjryTEwYPOVOrfH3KiD8FV3I8JqmVMZn8mRmriyOFtkE18pPCCD5IJ8ru50XMOa2ZBq38",
    description: "100% Habesha hand-spun silk pocket square in rich gold accents."
  }
};

// Global State
let cart = [];
let selectedSize = "IT 48"; // Default size

// Initialize Engine on Page Load
document.addEventListener("DOMContentLoaded", () => {
  loadCartFromStorage();
  createCartDrawerUI();
  createSearchOverlayUI();
  createToastUI();
  bindGlobalEvents();
  initParallaxFallback();
});

// Load Cart state
function loadCartFromStorage() {
  const stored = localStorage.getItem("habesha_thread_cart");
  if (stored) {
    try {
      cart = JSON.parse(stored);
    } catch (e) {
      cart = [];
    }
  }
  updateCartCounters();
}

function saveCartToStorage() {
  localStorage.setItem("habesha_thread_cart", JSON.stringify(cart));
  updateCartCounters();
  renderCartItems();
}

// Global Event Bindings
function bindGlobalEvents() {
  // Size selection on product page
  const sizeButtons = document.querySelectorAll(".size-selector-btn");
  sizeButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      sizeButtons.forEach(b => b.classList.remove("size-btn-active"));
      btn.classList.add("size-btn-active");
      selectedSize = btn.dataset.size || btn.textContent.trim();
    });
  });

  // Intercept cart icon clicks
  const cartTriggers = document.querySelectorAll(".cart-trigger");
  cartTriggers.forEach(trigger => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      toggleCartDrawer(true);
    });
  });

  // Intercept search icon clicks
  const searchTriggers = document.querySelectorAll(".search-trigger");
  searchTriggers.forEach(trigger => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      toggleSearchOverlay(true);
    });
  });

  // Add to cart buttons
  const buyButtons = document.querySelectorAll(".add-to-cart-btn");
  buyButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const pid = btn.dataset.productId;
      if (pid && PRODUCT_CATALOG[pid]) {
        addToCart(pid, selectedSize);
      }
    });
  });

  // Sticky header transition
  const header = document.querySelector("nav, header");
  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        header.classList.add("bg-surface/95", "shadow-sm");
        header.classList.remove("bg-surface/80", "bg-surface/90");
      } else {
        header.classList.remove("bg-surface/95", "shadow-sm");
        header.classList.add("bg-surface/80");
      }
    });
  }

  // Details expand micro-interactions (exclusively toggle one-open at a time)
  document.querySelectorAll('details').forEach((el) => {
    el.addEventListener('toggle', (e) => {
      if (el.open) {
        document.querySelectorAll('details').forEach((otherEl) => {
          if (otherEl !== el) otherEl.open = false;
        });
      }
    });
  });
}

// Cart State Operations
function addToCart(productId, size = "IT 48", qty = 1) {
  const itemDef = PRODUCT_CATALOG[productId];
  if (!itemDef) return;

  const existingIndex = cart.findIndex(item => item.id === productId && item.size === size);
  if (existingIndex > -1) {
    cart[existingIndex].qty += qty;
  } else {
    cart.push({
      id: productId,
      name: itemDef.name,
      price: itemDef.price,
      image: itemDef.image,
      size: size,
      qty: qty
    });
  }

  saveCartToStorage();
  showToast(`Added ${itemDef.name} (${size}) to bag`);
  
  // Auto open cart drawer to verify addition
  setTimeout(() => {
    toggleCartDrawer(true);
  }, 300);
}

function updateCartQuantity(productId, size, change) {
  const index = cart.findIndex(item => item.id === productId && item.size === size);
  if (index > -1) {
    cart[index].qty += change;
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
    saveCartToStorage();
  }
}

function removeCartItem(productId, size) {
  const index = cart.findIndex(item => item.id === productId && item.size === size);
  if (index > -1) {
    cart.splice(index, 1);
    saveCartToStorage();
  }
}

function updateCartCounters() {
  const count = cart.reduce((total, item) => total + item.qty, 0);
  const badges = document.querySelectorAll(".cart-count-badge");
  badges.forEach(badge => {
    badge.textContent = count;
    if (count === 0) {
      badge.classList.add("hidden");
    } else {
      badge.classList.remove("hidden");
    }
  });
}

// Create Toast Notification Element
function createToastUI() {
  if (document.getElementById("global-toast")) return;
  const toast = document.createElement("div");
  toast.id = "global-toast";
  toast.className = "toast-msg";
  document.body.appendChild(toast);
}

function showToast(message) {
  const toast = document.getElementById("global-toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Create Shopping Cart Slide-out UI
function createCartDrawerUI() {
  if (document.getElementById("cart-drawer-container")) return;

  const drawerHtml = `
    <!-- Cart Drawer Overlay -->
    <div id="cart-overlay" class="fixed inset-0 z-50 hidden cart-overlay opacity-0"></div>
    
    <!-- Cart Drawer Panel -->
    <div id="cart-panel" class="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-[#fbf9f8] border-l border-outline/10 z-50 drawer-transition transform translate-x-full shadow-2xl flex flex-col">
      <!-- Header -->
      <div class="px-md py-md border-b border-outline/10 flex justify-between items-center bg-[#1a1a1a] text-white">
        <h3 class="font-label-lg uppercase tracking-widest text-[14px]">YOUR BAG (<span id="cart-total-qty">0</span>)</h3>
        <button id="cart-close-btn" class="p-2 hover:text-[#d4af37] transition-colors">
          <span class="material-symbols-outlined align-middle">close</span>
        </button>
      </div>
      
      <!-- Items Container -->
      <div id="cart-items-list" class="flex-1 overflow-y-auto px-md py-md space-y-md">
        <!-- Dynamic Items rendered here -->
      </div>
      
      <!-- Footer Summary -->
      <div class="border-t border-outline/10 p-md bg-[#efeded] space-y-md">
        <div class="flex justify-between items-baseline">
          <span class="font-label-lg uppercase tracking-wider text-sm">Estimated Subtotal</span>
          <span id="cart-subtotal" class="font-headline-md text-xl font-bold">$0.00</span>
        </div>
        <p class="text-xs text-on-surface-variant leading-relaxed">Tax, shipping, and duty calculated at simulated checkout.</p>
        <button id="checkout-cta" class="w-full bg-[#1a1a1a] text-white py-lg font-label-lg uppercase tracking-[0.2em] hover:bg-[#d4af37] hover:text-[#1a1a1a] transition-all duration-300">
          PROCEED TO CHECKOUT
        </button>
      </div>
    </div>
  `;

  const wrapper = document.createElement("div");
  wrapper.id = "cart-drawer-container";
  wrapper.innerHTML = drawerHtml;
  document.body.appendChild(wrapper);

  // Bind internal closes
  document.getElementById("cart-close-btn").addEventListener("click", () => toggleCartDrawer(false));
  document.getElementById("cart-overlay").addEventListener("click", () => toggleCartDrawer(false));
  document.getElementById("checkout-cta").addEventListener("click", () => {
    if (cart.length === 0) {
      showToast("YOUR BAG IS EMPTY");
      return;
    }
    showToast("SIMULATING LUXURY CHECKOUT... THANK YOU!");
    setTimeout(() => {
      cart = [];
      saveCartToStorage();
      toggleCartDrawer(false);
    }, 1500);
  });

  renderCartItems();
}

function toggleCartDrawer(open) {
  const overlay = document.getElementById("cart-overlay");
  const panel = document.getElementById("cart-panel");
  
  if (open) {
    renderCartItems(); // refresh items
    overlay.classList.remove("hidden");
    // trigger reflow
    overlay.offsetHeight;
    overlay.classList.add("opacity-100");
    panel.classList.remove("translate-x-full");
  } else {
    overlay.classList.remove("opacity-100");
    panel.classList.add("translate-x-full");
    setTimeout(() => {
      overlay.classList.add("hidden");
    }, 400);
  }
}

function renderCartItems() {
  const container = document.getElementById("cart-items-list");
  const totalQtyText = document.getElementById("cart-total-qty");
  const subtotalText = document.getElementById("cart-subtotal");
  
  if (!container) return;

  const totalQty = cart.reduce((tot, it) => tot + it.qty, 0);
  totalQtyText.textContent = totalQty;

  const subtotal = cart.reduce((tot, it) => tot + (it.price * it.qty), 0);
  subtotalText.textContent = `$${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="h-64 flex flex-col justify-center items-center text-center space-y-md text-on-surface-variant">
        <span class="material-symbols-outlined text-[48px] text-[#d4af37] opacity-60">shopping_bag</span>
        <p class="font-headline-md italic">The Loom awaits your curation.</p>
        <p class="font-label-sm uppercase tracking-widest text-xs">YOUR BAG IS CURRENTLY EMPTY.</p>
        <button onclick="toggleCartDrawer(false);" class="border border-[#1a1a1a] px-lg py-md text-xs font-label-lg uppercase hover:bg-[#1a1a1a] hover:text-white transition-all">
          Browse Curation
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="flex gap-md py-md border-b border-outline/5 items-center">
      <!-- Thumb -->
      <img src="${item.image}" alt="${item.name}" class="w-20 h-24 object-cover border border-outline/5" />
      
      <!-- Details -->
      <div class="flex-1 space-y-1">
        <h4 class="font-headline-md text-sm font-bold uppercase leading-tight">${item.name}</h4>
        <p class="text-xs text-[#d4af37] font-medium uppercase tracking-wider">SIZE: ${item.size}</p>
        
        <!-- Quantity selection -->
        <div class="flex items-center gap-xs pt-1">
          <button onclick="updateCartQuantity('${item.id}', '${item.size}', -1);" class="w-6 h-6 border border-outline/20 hover:border-black flex items-center justify-center text-xs">
            <span class="material-symbols-outlined text-xs">remove</span>
          </button>
          <span class="w-8 text-center text-xs font-label-lg font-bold">${item.qty}</span>
          <button onclick="updateCartQuantity('${item.id}', '${item.size}', 1);" class="w-6 h-6 border border-outline/20 hover:border-black flex items-center justify-center text-xs">
            <span class="material-symbols-outlined text-xs">add</span>
          </button>
        </div>
      </div>
      
      <!-- Price and Remove -->
      <div class="text-right flex flex-col justify-between h-20">
        <span class="font-label-lg text-sm font-bold text-[#1a1a1a]">$${(item.price * item.qty).toLocaleString()}</span>
        <button onclick="removeCartItem('${item.id}', '${item.size}');" class="text-xs text-on-surface-variant hover:text-red-600 transition-colors uppercase tracking-widest text-[10px] mt-2 underline">
          Remove
        </button>
      </div>
    </div>
  `).join("");
}

// Create Fullscreen Minimalist Search Overlay UI
function createSearchOverlayUI() {
  if (document.getElementById("search-overlay-container")) return;

  const searchHtml = `
    <div id="search-overlay" class="fixed inset-0 z-50 bg-[#fbf9f8]/98 backdrop-blur-md hidden opacity-0 transition-opacity duration-300 flex flex-col justify-start">
      <!-- Close button -->
      <div class="flex justify-end p-lg">
        <button id="search-close-btn" class="p-md hover:text-[#d4af37] transition-colors">
          <span class="material-symbols-outlined text-[32px] align-middle">close</span>
        </button>
      </div>
      
      <!-- Search Input Container -->
      <div class="max-w-4xl mx-auto w-full px-lg mt-12 space-y-lg">
        <span class="text-[#d4af37] font-label-lg uppercase tracking-[0.3em] block text-center">Atelier Search</span>
        <div class="border-b-2 border-[#1a1a1a] flex items-center py-sm">
          <input id="search-input-field" class="flex-1 bg-transparent border-none text-2xl md:text-4xl text-[#1a1a1a] placeholder-on-surface-variant/40 font-headline-xl uppercase tracking-tighter focus:ring-0 w-full" placeholder="What are you weaving today?" type="text" />
          <span class="material-symbols-outlined text-[32px] text-[#1a1a1a]">search</span>
        </div>
        
        <!-- Live Results -->
        <div id="search-results-panel" class="pt-lg grid grid-cols-1 md:grid-cols-2 gap-lg overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
          <!-- Dynamically computed results -->
          <div class="md:col-span-2 text-center text-on-surface-variant/60 font-body-lg italic py-8">
            Start typing to explore the Modern Heritage edit...
          </div>
        </div>
      </div>
    </div>
  `;

  const wrapper = document.createElement("div");
  wrapper.id = "search-overlay-container";
  wrapper.innerHTML = searchHtml;
  document.body.appendChild(wrapper);

  const inputField = document.getElementById("search-input-field");
  
  // Bind close buttons
  document.getElementById("search-close-btn").addEventListener("click", () => toggleSearchOverlay(false));
  
  // Escape key closes search
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      toggleSearchOverlay(false);
      toggleCartDrawer(false);
    }
  });

  // Typelistener
  inputField.addEventListener("input", (e) => {
    renderSearchResults(e.target.value.trim());
  });
}

function toggleSearchOverlay(open) {
  const overlay = document.getElementById("search-overlay");
  const inputField = document.getElementById("search-input-field");
  
  if (open) {
    overlay.classList.remove("hidden");
    overlay.offsetHeight;
    overlay.classList.add("opacity-100");
    inputField.focus();
  } else {
    overlay.classList.remove("opacity-100");
    setTimeout(() => {
      overlay.classList.add("hidden");
      inputField.value = "";
      document.getElementById("search-results-panel").innerHTML = `
        <div class="md:col-span-2 text-center text-on-surface-variant/60 font-body-lg italic py-8">
          Start typing to explore the Modern Heritage edit...
        </div>
      `;
    }, 300);
  }
}

function renderSearchResults(query) {
  const resultsContainer = document.getElementById("search-results-panel");
  if (!resultsContainer) return;

  if (!query) {
    resultsContainer.innerHTML = `
      <div class="md:col-span-2 text-center text-on-surface-variant/60 font-body-lg italic py-8">
        Start typing to explore the Modern Heritage edit...
      </div>
    `;
    return;
  }

  const queryLower = query.toLowerCase();
  const matched = Object.values(PRODUCT_CATALOG).filter(prod => 
    prod.name.toLowerCase().includes(queryLower) || 
    prod.description.toLowerCase().includes(queryLower)
  );

  if (matched.length === 0) {
    resultsContainer.innerHTML = `
      <div class="md:col-span-2 text-center space-y-sm py-12">
        <span class="material-symbols-outlined text-[40px] text-[#d4af37]">sentiment_dissatisfied</span>
        <p class="font-headline-md italic">No threads found matching "${query}"</p>
        <p class="text-xs text-on-surface-variant font-label-sm uppercase tracking-widest">Try searching for "Suit", "Tunic", "Belt", or "Blazer"</p>
      </div>
    `;
    return;
  }

  resultsContainer.innerHTML = matched.map(item => `
    <div class="flex gap-md p-md bg-[#efeded] border border-outline/5 hover:border-[#d4af37] transition-all cursor-pointer items-center" 
         onclick="window.location.href='product.html';">
      <img src="${item.image}" alt="${item.name}" class="w-16 h-20 object-cover border border-outline/5" />
      <div class="space-y-xs">
        <h4 class="font-headline-md text-sm font-bold uppercase leading-tight">${item.name}</h4>
        <p class="text-xs text-on-surface-variant line-clamp-1">${item.description}</p>
        <p class="font-label-lg text-sm text-[#d4af37] font-bold">$${item.price.toLocaleString()}</p>
      </div>
    </div>
  `).join("");
}

// 7. Scroll driven parallax observer fallback (like Firefox)
function initParallaxFallback() {
  if (!CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
    // Parallax scroll effects fallback
    const parallaxContainers = document.querySelectorAll(".scroll-parallax-container");
    if (parallaxContainers.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          window.addEventListener('scroll', onScrollParallax);
        } else {
          window.removeEventListener('scroll', onScrollParallax);
        }
      });
    }, { threshold: 0 });

    parallaxContainers.forEach(container => observer.observe(container));

    function onScrollParallax() {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      parallaxContainers.forEach(container => {
        const image = container.querySelector(".scroll-parallax-image");
        if (!image) return;

        const rect = container.getBoundingClientRect();
        const containerTop = rect.top + scrollY;
        const containerHeight = rect.height;

        if (scrollY >= containerTop - windowHeight && scrollY <= containerTop + containerHeight) {
          const scrollPercent = (scrollY - (containerTop - windowHeight)) / (containerHeight + windowHeight);
          // Scale from 0.95 to 1.05 based on scroll percent
          const scale = 0.95 + (scrollPercent * 0.1);
          image.style.transform = `scale(${scale})`;
        }
      });
    }

    onScrollParallax(); // Run once initially
  }
}

// Make globally accessible cart quantities
window.updateCartQuantity = updateCartQuantity;
window.removeCartItem = removeCartItem;
window.toggleCartDrawer = toggleCartDrawer;
window.addToCart = addToCart;
