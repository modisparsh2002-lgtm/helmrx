/* ═══════════════════════════════════════════════════════════════
   HELMRx MOBILE INIT — Mobile-specific behaviors
   Loaded ONLY on mobile.html after app.js
   ═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  /* ── 1. Show bottom nav ── */
  var bottomNav = document.getElementById('mobileBottomNav');
  if (bottomNav) bottomNav.style.display = 'flex';

  /* ── 2. Bottom nav active state ── */
  var navItems = {
    home: document.getElementById('bnHome'),
    treatments: document.getElementById('bnTreatments'),
    cart: document.getElementById('bnCart'),
    account: document.getElementById('bnAccount')
  };
  var pageToNav = {
    'home': 'home',
    'cat-hair': 'treatments', 'cat-sexual': 'treatments',
    'cat-supplements': 'treatments', 'cat-weight': 'treatments',
    'account': 'account', 'orders': 'account', 'subscriptions': 'account'
  };

  function updateBottomNavActive(page) {
    var key = pageToNav[page] || '';
    Object.keys(navItems).forEach(function(k) {
      if (navItems[k]) navItems[k].classList.toggle('active', k === key);
    });
    // Hide bottom nav on quiz/checkout/confirm
    if (bottomNav) {
      var hide = page.startsWith('quiz-') || page === 'confirm' || page === 'checkout';
      bottomNav.style.display = hide ? 'none' : 'flex';
    }
  }

  // Patch navigateTo for bottom nav tracking
  var _origNav = window.navigateTo;
  if (_origNav) {
    window.navigateTo = function(page, skipPush) {
      _origNav(page, skipPush);
      setTimeout(function() {
        updateBottomNavActive(page);
        showStickyCta(page);
      }, 350);
    };
  }
  updateBottomNavActive(typeof currentPage !== 'undefined' ? currentPage : 'home');


  /* ── 3. Bottom nav badge sync ── */
  var bottomBadge = document.getElementById('bottomNavBadge');
  function syncBottomBadge() {
    if (!bottomBadge) return;
    var count = 0;
    try {
      var c = JSON.parse(localStorage.getItem('helmrx_cart') || '[]');
      count = c.reduce(function(s, i) { return s + (i.type !== 'discount' ? (i.qty || 1) : 0); }, 0);
    } catch(e) {}
    bottomBadge.textContent = count;
    bottomBadge.style.display = count > 0 ? 'flex' : 'none';
  }

  var _origCartUI = window.updateCartUI;
  if (_origCartUI) {
    window.updateCartUI = function() {
      _origCartUI();
      syncBottomBadge();
    };
  }
  syncBottomBadge();


  /* ── 4. Footer accordion ── */
  document.querySelectorAll('.footer-col h5, .footer-col .footer-heading').forEach(function(heading) {
    heading.addEventListener('click', function(e) {
      e.preventDefault();
      var col = this.closest('.footer-col');
      if (!col) return;
      col.parentElement.querySelectorAll('.footer-col.footer-open').forEach(function(open) {
        if (open !== col) open.classList.remove('footer-open');
      });
      col.classList.toggle('footer-open');
    });
  });


  /* ── 5. Sticky product CTA ── */
  var stickyBar = document.getElementById('mobileStickyCta');
  var stickyName = document.getElementById('stickyCtaName');
  var stickyPrice = document.getElementById('stickyCtaPrice');
  var stickyBtn = document.getElementById('stickyCtaBtn');
  var productPages = {
    'product-finasteride': { name: 'HELM Strand', price: '\u20B9599/mo', sku: 'HL-01', fullName: 'HELM Strand Finasteride 1mg', numPrice: 599, type: 'rx' },
    'product-minoxidil': { name: 'Minoxidil 5%', price: '\u20B9449/mo', sku: 'HL-04', fullName: 'HELM Strand Topical Minoxidil 5%', numPrice: 449, type: 'otc' },
    'product-sildenafil': { name: 'HELM Peak', price: '\u20B9499/mo', sku: 'SW-03', fullName: 'HELM Peak Sildenafil 50mg', numPrice: 499, type: 'rx' },
    'product-tadalafil': { name: 'HELM Drive', price: '\u20B9899/mo', sku: 'SW-01', fullName: 'HELM Drive Tadalafil 5mg', numPrice: 899, type: 'rx' }
  };

  // Category pages get a generic CTA
  var categoryPages = {
    'cat-hair': { name: 'Hair Loss Treatment', price: 'From \u20B9599/mo', action: 'quiz-hair', btnText: 'Take Free Quiz' },
    'cat-sexual': { name: 'Sexual Wellness', price: 'From \u20B962/use', action: 'quiz-sexual', btnText: 'Take Free Quiz' },
    'cat-supplements': { name: 'Supplements', price: 'From \u20B9299/mo', action: 'cat-supplements', btnText: 'Shop Supplements' },
    'cat-weight': { name: 'Weight Loss', price: 'Coming Soon', action: 'cat-weight', btnText: 'Join Waitlist' },
    'home': { name: 'Get Started', price: 'Free doctor consultation', action: null, btnText: 'Get Started Free' }
  };

  // Which page is this?
  var _stickyPage = '';

  function showStickyCta(page) {
    if (!stickyBar) return;
    _stickyPage = page;
    var prod = productPages[page];
    var cat = categoryPages[page];
    if (prod) {
      stickyName.textContent = prod.name;
      stickyPrice.textContent = prod.price;
      stickyBtn.textContent = 'Add to Cart';
      stickyBtn.onclick = function() {
        if (typeof addToCart === 'function') addToCart(prod.sku, prod.fullName, prod.numPrice, prod.type, 'month');
      };
      // Show immediately for product pages
      stickyBar.classList.add('visible');
    } else if (cat) {
      stickyName.textContent = cat.name;
      stickyPrice.textContent = cat.price;
      stickyBtn.textContent = cat.btnText;
      stickyBtn.onclick = function() {
        if (cat.action && typeof navigateTo === 'function') navigateTo(cat.action);
        else if (typeof openCatChooser === 'function') openCatChooser();
      };
      // Show after scroll for category pages
      if (window.scrollY > 300) stickyBar.classList.add('visible');
    } else {
      stickyBar.classList.remove('visible');
    }
  }

  // Show/hide sticky CTA on scroll
  window.addEventListener('scroll', function() {
    if (!stickyBar) return;
    var page = _stickyPage || (typeof currentPage !== 'undefined' ? currentPage : '');
    if (!productPages[page] && !categoryPages[page]) return;
    stickyBar.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });

  showStickyCta(typeof currentPage !== 'undefined' ? currentPage : 'home');
})();
