/* ═══════════════════════════════════════
   CONFIG — EDIT BEFORE LAUNCH
   1. formspree.io → create 2 forms → paste IDs
   2. Set your WhatsApp number
   ═══════════════════════════════════════ */
const CFG = {
  wa: '91XXXXXXXXXX',
  waDisplay: '+91 XXXXX XXXXX',
  formConsult: 'xyzabcde',
  formWaitlist: 'xyzabcdf',
  razorpayKey: 'rzp_test_XXXXXXXXXXXXXXXX', // Replace with your Razorpay key
  razorpayLive: false,  // Set true for production
};

/* ═══════════════════════════════════════
   CART SYSTEM
   ═══════════════════════════════════════ */
let cart;
try { cart = JSON.parse(localStorage.getItem('helmrx_cart') || '[]').filter(function(i){ return !i.sku || i.sku.indexOf('BUNDLE-') !== 0; }); } catch(e) { cart = []; }

function saveCart() {
  try { localStorage.setItem('helmrx_cart', JSON.stringify(cart)); } catch(e) {}
  updateCartUI();
}


const STACKS = {
  regrow: {
    name: 'The Regrowth Protocol',
    items: [
      {sku:'HL-01',name:'HELM Strand Finasteride 1mg',price:599,type:'rx',period:'month'},
      {sku:'HL-04',name:'HELM Strand Topical Min 5%',price:499,type:'otc',period:'month'},
      {sku:'HL-05',name:'HELM Strand Support',price:499,type:'supp',period:'month'}
    ],
    bundlePrice: 1299
  },
  duo: {
    name: 'The Regrowth Duo Protocol',
    items: [
      {sku:'HL-06',name:'HELM Strand Duo Spray',price:999,type:'rx',period:'month'},
      {sku:'HL-05',name:'HELM Strand Support',price:499,type:'supp',period:'month'}
    ],
    bundlePrice: 1299
  },
  confidence: {
    name: 'The Confidence Protocol',
    items: [
      {sku:'SW-01',name:'HELM Drive Tadalafil 5mg',price:899,type:'rx',period:'month'},
      {sku:'SW-06',name:'HELM Drive Support',price:499,type:'supp',period:'month'}
    ],
    bundlePrice: 1199
  },
  endurance: {
    name: 'The Endurance Protocol',
    items: [
      {sku:'SW-04',name:'HELM Endure Dapoxetine 30mg',price:699,type:'rx',period:'month'},
      {sku:'SW-08',name:'HELM Endure Spray',price:499,type:'otc',period:'bottle'},
      {sku:'SW-06',name:'HELM Drive Support',price:499,type:'supp',period:'month'}
    ],
    bundlePrice: 1399
  },
  'pe-control': {
    name: 'The Endurance Protocol',
    items: [
      {sku:'SW-04',name:'HELM Endure Dapoxetine 30mg',price:699,type:'rx',period:'month'},
      {sku:'SW-08',name:'HELM Endure Spray',price:499,type:'otc',period:'bottle'},
      {sku:'SW-06',name:'HELM Drive Support',price:499,type:'supp',period:'month'}
    ],
    bundlePrice: 1399
  },
  vitality: {
    name: 'The Performance Protocol',
    items: [
      {sku:'SW-03',name:'HELM Peak Sildenafil',price:499,type:'rx',period:'8 tabs'},
      {sku:'SW-06',name:'HELM Drive Support',price:499,type:'supp',period:'month'}
    ],
    bundlePrice: 899
  },
  chewable: {
    name: 'The Regrowth Duo Protocol',
    items: [
      {sku:'HL-06',name:'HELM Strand Duo Spray',price:999,type:'rx',period:'month'},
      {sku:'HL-05',name:'HELM Strand Support',price:499,type:'supp',period:'month'}
    ],
    bundlePrice: 1299
  },
  perform: {
    name: 'The Complete Performance Protocol',
    items: [
      {sku:'SW-01',name:'HELM Drive Tadalafil 5mg',price:899,type:'rx',period:'month'},
      {sku:'SW-04',name:'HELM Endure Dapoxetine 30mg',price:699,type:'rx',period:'month'},
      {sku:'SW-06',name:'HELM Drive Support',price:499,type:'supp',period:'month'}
    ],
    bundlePrice: 1799
  },
  'complete-hair': {
    name: 'The Complete Hair Protocol',
    items: [
      {sku:'HL-01',name:'HELM Strand Finasteride 1mg',price:599,type:'rx',period:'month'},
      {sku:'HL-04',name:'HELM Strand Topical Min 5%',price:499,type:'otc',period:'month'},
      {sku:'HL-07',name:'HELM Strand Wash Ketoconazole',price:399,type:'otc',period:'month'},
      {sku:'HL-05',name:'HELM Strand Support',price:499,type:'supp',period:'month'}
    ],
    bundlePrice: 1599
  }
};


function getCartBundleDiscount() {
  // Check each stack — if ALL its items are in cart, apply that stack's discount
  // Returns {name, discount} or null
  var cartSkus = cart.map(function(i){ return i.sku; });
  var bestDiscount = null;
  
  Object.keys(STACKS).forEach(function(key) {
    var stack = STACKS[key];
    var allPresent = stack.items.every(function(item) {
      return cartSkus.indexOf(item.sku) >= 0;
    });
    if (allPresent) {
      var individualTotal = stack.items.reduce(function(sum, i){ return sum + i.price; }, 0);
      var discount = individualTotal - stack.bundlePrice;
      if (discount > 0 && (!bestDiscount || discount > bestDiscount.discount)) {
        bestDiscount = { name: stack.name, discount: discount };
      }
    }
  });
  return bestDiscount;
}

function addStack(stackId) {
  var stack = STACKS[stackId];
  if (!stack) return;
  stack.items.forEach(function(item) {
    if (!cart.find(function(c){ return c.sku === item.sku; })) {
      cart.push({ sku: item.sku, name: item.name, price: item.price, type: item.type, period: item.period, qty: 1 });
    }
  });
  saveCart();
  showToast(stack.name + ' added to cart!');
}

function addToCart(sku, name, price, type, period) {
  const existing = cart.find(i => i.sku === sku);
  if (existing) { existing.qty++; }
  else { cart.push({ sku, name, price, type, period, qty: 1 }); }
  saveCart();
  showToast('Added to cart: ' + name);
  trackEvent('add_to_cart', {item_name: name, price: price, currency: 'INR'});
  // Bump animation on badge
  document.querySelectorAll('.nav-cart-badge').forEach(b => {
    b.classList.remove('bump');
    void b.offsetWidth;
    b.classList.add('bump');
  });
}

function removeFromCart(sku) {
  cart = cart.filter(i => i.sku !== sku);
  saveCart();
}

function updateQty(sku, delta) {
  const item = cart.find(i => i.sku === sku);
  if (!item) return;
  var newQty = item.qty + delta;
  if (newQty <= 0) { removeFromCart(sku); return; }
  if (newQty > 10) { showToast('Maximum 10 units per item.', 'error'); return; }
  item.qty = newQty;
  saveCart();
}

function updateCartUI() {
  const count = cart.filter(i => i.type !== 'discount').reduce((sum, i) => sum + i.qty, 0);
  const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  
  // Refresh checkout page if currently visible (any step)
  var checkoutPage = document.querySelector('.checkout-page');
  if (checkoutPage && checkoutPage.offsetParent !== null) {
    // If on step 2+ when cart changes, reset to step 1 with updated cart
    var coSec1 = document.getElementById('coSec1');
    if (!coSec1 || !coSec1.classList.contains('active')) {
      checkoutStep(1);
    } else {
      renderCheckoutCart();
      if (typeof renderCheckoutUpsells === 'function') renderCheckoutUpsells();
    }
  }

  // Badges
  document.querySelectorAll('.nav-cart-badge').forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });

  // Cart body
  const itemsEl = document.getElementById('cartItems');
  const emptyEl = document.getElementById('cartEmpty');
  const footerEl = document.getElementById('cartFooter');

  if (count === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    if (itemsEl) itemsEl.innerHTML = '';
    if (footerEl) footerEl.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (footerEl) footerEl.style.display = 'block';
  // Check for bundle discount
  var bundleDisc = getCartBundleDiscount();
  var displayTotal = bundleDisc ? total - bundleDisc.discount : total;
  document.getElementById('cartTotal').textContent = '₹' + displayTotal.toLocaleString('en-IN');
  
  // Show bundle discount line in cart drawer
  var bundleLineEl = document.getElementById('cartBundleLine');
  if (!bundleLineEl) {
    bundleLineEl = document.createElement('div');
    bundleLineEl.id = 'cartBundleLine';
    bundleLineEl.style.cssText = 'padding:8px 16px;background:rgba(42,124,111,.04);border-radius:8px;margin-top:8px;display:flex;justify-content:space-between;align-items:center';
    var itemsContainer = document.getElementById('cartItems');
    if (itemsContainer) itemsContainer.parentNode.insertBefore(bundleLineEl, itemsContainer.nextSibling);
  }
  if (bundleDisc) {
    bundleLineEl.style.display = 'flex';
    bundleLineEl.innerHTML = '<span style="color:var(--teal);font-size:.85rem">' + bundleDisc.name + ' discount</span><span style="color:var(--teal);font-weight:600;font-size:.9rem">\u2212\u20B9' + bundleDisc.discount.toLocaleString('en-IN') + '/mo</span>';
  } else {
    bundleLineEl.style.display = 'none';
  }

  itemsEl.innerHTML = cart.map(item => {
const tagClass = item.type === 'rx' ? 'tag-rx' : item.type === 'otc' ? 'tag-otc' : 'tag-supp';
    const tagLabel = item.type === 'rx' ? '℞ Rx' : item.type === 'otc' ? 'OTC' : 'Supplement';
    return '<div class="cart-item"><div class="cart-item-info">' +
      '<span class="cart-item-tag ' + tagClass + '">' + tagLabel + '</span>' +
      '<div class="cart-item-name">' + item.name + '</div>' +
      '<div class="cart-item-price">₹' + item.price.toLocaleString('en-IN') + '/' + item.period + '</div>' +
      '<div class="cart-item-qty">' +
        '<button onclick="updateQty(\'' + item.sku + '\',-1)">−</button>' +
        '<span>' + item.qty + '</span>' +
        '<button onclick="updateQty(\'' + item.sku + '\',1)">+</button>' +
      '</div>' +
      '<span class="cart-item-remove" onclick="removeFromCart(\'' + item.sku + '\')">Remove</span>' +
    '</div></div>';
  }).join('');
}

function toggleCart() {
  document.getElementById('cartOverlay').classList.toggle('open');
  document.getElementById('cartDrawer').classList.toggle('open');
  document.body.style.overflow = document.getElementById('cartDrawer').classList.contains('open') ? 'hidden' : '';
}


/* ═══════════════════════════════════════
   ACCOUNT SYSTEM (localStorage)
   ═══════════════════════════════════════ */
function getUsers() { return JSON.parse(localStorage.getItem('helmrx_users') || '[]'); }
function saveUsers(u) { localStorage.setItem('helmrx_users', JSON.stringify(u)); }
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function isValidPhone(phone) { return /^[6-9]\d{9}$/.test(phone.replace(/[\s\-+()]/g, '').replace(/^91/, '')); }
function getSession() { return localStorage.getItem('helmrx_session'); }
function setSession(email) { localStorage.setItem('helmrx_session', email); refreshAuthUI(); }
function clearSession() { localStorage.removeItem('helmrx_session'); refreshAuthUI(); }
function getCurrentUser() { const email = getSession(); return getUsers().find(u => u.email === email) || null; }
function updateCurrentUser(fn) { const users = getUsers(); const u = users.find(u => u.email === getSession()); if(u){fn(u);saveUsers(users);} }
function simpleHash(s) { let h=0; for(let i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0;} return 'h'+Math.abs(h).toString(36); }

function refreshAuthUI() {
  const user = getCurrentUser();
  const label = document.getElementById('navAccountLabel');
  const ddAuth = document.getElementById('ddAuth');
  const ddLogout = document.getElementById('ddLogout');
  if(user) {
    if(label) label.textContent = user.name.split(' ')[0];
    if(ddAuth) { ddAuth.innerHTML = ddAuth.innerHTML.replace(/Sign In.*Account/,'My Profile'); }
    if(ddLogout) ddLogout.style.display = 'flex';
    // Account page
    const authSec = document.getElementById('authSection');
    const profSec = document.getElementById('profileSection');
    if(authSec) authSec.style.display = 'none';
    if(profSec) {
      profSec.style.display = 'block';
      renderLoyaltyBadge();
      document.getElementById('profileAvatar').textContent = user.name.charAt(0).toUpperCase();
      document.getElementById('profileName').textContent = user.name;
      document.getElementById('profileEmail').textContent = user.email;
    }
  } else {
    if(label) label.textContent = 'Account';
    if(ddLogout) ddLogout.style.display = 'none';
    const authSec = document.getElementById('authSection');
    const profSec = document.getElementById('profileSection');
    if(authSec) authSec.style.display = 'block';
    if(profSec) profSec.style.display = 'none';
  }
}

function signUpUser() {
  const name=document.getElementById('suName').value.trim();
  const phone=document.getElementById('suPhone').value.trim();
  const email=document.getElementById('suEmail').value.trim().toLowerCase();
  const pass=document.getElementById('suPass').value;
  const passC=document.getElementById('suPassC').value;
  const err=document.getElementById('suError');
  err.textContent='';
  if(!name||!phone||!email||!pass){err.textContent='All fields are required.';return;}
  if(pass.length<6){err.textContent='Password must be at least 6 characters.';return;}
  if(pass!==passC){err.textContent='Passwords do not match.';return;}
  if(!isValidEmail(email)){err.textContent='Please enter a valid email.';return;}
  const users=getUsers();
  if(users.find(u=>u.email===email)){err.textContent='An account with this email already exists. Sign in instead.';return;}
  users.push({name,phone,email,password:simpleHash(pass),orders:[],subscriptions:[],addresses:[]});
  saveUsers(users);
  setSession(email);
  showToast('Account created! Welcome, '+name.split(' ')[0]+'.');
}

function signInUser() {
  const email=document.getElementById('siEmail').value.trim().toLowerCase();
  const pass=document.getElementById('siPass').value;
  const err=document.getElementById('siError');
  err.textContent='';
  if(!email||!pass){err.textContent='Please enter email and password.';return;}
  const user=getUsers().find(u=>u.email===email);
  if(!user){err.textContent='No account found. Create one first.';return;}
  if(user.password!==simpleHash(pass)){err.textContent='Incorrect password.';return;}
  setSession(email);
  showToast('Welcome back, '+user.name.split(' ')[0]+'!');
}

function logoutUser() {
  clearSession();
  showToast('Signed out.');
  navigateTo('home');
}

function forgotPassword() {
  const email = (document.getElementById('siEmail') || document.getElementById('coSiEmail')).value.trim().toLowerCase();
  if(!email || !isValidEmail(email)) { showToast('Enter your email first, then click forgot password.', 'error'); return; }
  const users = getUsers();
  const user = users.find(u => u.email === email);
  if(!user) { showToast('No account found with that email.', 'error'); return; }
  // Show inline reset form instead of using prompt()
  var resetContainer = document.getElementById('resetPasswordInline');
  if (!resetContainer) {
    resetContainer = document.createElement('div');
    resetContainer.id = 'resetPasswordInline';
    resetContainer.style.cssText = 'margin-top:16px;padding:16px;background:var(--cream);border-radius:var(--radius-sm);';
    resetContainer.innerHTML = '<label style="font-size:.85rem;font-weight:500;display:block;margin-bottom:8px">New password (min 6 characters)</label><input type="password" id="resetNewPassword" class="quiz-input" minlength="6" placeholder="Enter new password" style="margin-bottom:12px"><button class="btn btn-primary btn-sm" onclick="confirmResetPassword()">Reset Password</button>';
    var form = document.querySelector('.auth-form') || document.getElementById('siEmail').closest('div');
    if (form) form.appendChild(resetContainer);
  }
  resetContainer.style.display = '';
  resetContainer.dataset.email = email;
}
function confirmResetPassword() {
  var container = document.getElementById('resetPasswordInline');
  var newPass = document.getElementById('resetNewPassword').value;
  if(!newPass || newPass.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return; }
  var email = container.dataset.email;
  var users = getUsers();
  var user = users.find(function(u){ return u.email === email; });
  if(user) { user.password = simpleHash(newPass); saveUsers(users); }
  container.style.display = 'none';
  showToast('Password reset! You can now sign in.');
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t,i)=>t.classList.toggle('active',tab==='signin'?i===0:i===1));
  document.getElementById('authSignin').classList.toggle('active',tab==='signin');
  document.getElementById('authSignup').classList.toggle('active',tab==='signup');
}

/* ═══════════════════════════════════════
   CHECKOUT FLOW
   ═══════════════════════════════════════ */
let selectedPlan = '3mo';
const planDiscount = {'1mo':0,'3mo':0.20,'6mo':0.30};
const planLabel = {'1mo':'Monthly','3mo':'3 Months','6mo':'6 Months'};
const planMonths = {'1mo':1,'3mo':3,'6mo':6};

function selectPlan(plan) {
  selectedPlan = plan;
  document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('plan'+plan).classList.add('selected');
  renderCheckoutCart();
}

function renderCheckoutCart() {
  const items = document.getElementById('coCartItems');
  const totals = document.getElementById('coCartTotals');
  if (!items) return;
  const disc = planDiscount[selectedPlan];
  const months = planMonths[selectedPlan];
  let subtotal = 0, discountAmt = 0;

  items.innerHTML = cart.map(item => {
    const orig = item.price * item.qty;
    const discounted = Math.round(orig * (1 - disc));
    subtotal += orig;
    discountAmt += (orig - discounted);
    return '<div class="co-cart-item"><div class="co-item-info">' +
      '<div class="co-item-name">' + item.name + ' ×' + item.qty + '</div>' +
      '<div class="co-item-meta">' + (item.type==='rx'?'℞ Prescription':'OTC/Supplement') + ' · ' + item.period + '</div>' +
    '</div><div class="co-item-price">' +
      (disc > 0 ? '<div class="co-item-orig">₹'+orig.toLocaleString('en-IN')+'/' + item.period + '</div>' : '') +
      '<div>₹' + (disc>0?discounted:orig).toLocaleString('en-IN') + '/' + item.period + '</div>' +
    '</div></div>';
  }).join('');

  // Dynamic bundle discount
  var bundleDisc = getCartBundleDiscount();
  var bundleAmt = bundleDisc ? bundleDisc.discount : 0;
  var afterBundle = subtotal - bundleAmt;
  var planDiscAmt = Math.round(afterBundle * disc);
  var monthlyFinal = afterBundle - planDiscAmt;
  var billFinal = monthlyFinal * months;

  totals.innerHTML =
    '<div class="co-total-row"><span>Subtotal (per month)</span><span>\u20B9'+subtotal.toLocaleString('en-IN')+'</span></div>' +
    (bundleAmt > 0 ? '<div class="co-total-row" style="color:var(--teal)"><span>'+bundleDisc.name+' stack discount</span><span>\u2212\u20B9'+bundleAmt.toLocaleString('en-IN')+'</span></div>' : '') +
    (disc > 0 ? '<div class="co-total-row" style="color:var(--green)"><span>'+planLabel[selectedPlan]+' discount (\u2212'+Math.round(disc*100)+'%)</span><span>\u2212\u20B9'+planDiscAmt.toLocaleString('en-IN')+'</span></div>' : '') +
    '<div class="co-total-row"><span>Delivery</span><span style="color:var(--green)">FREE</span></div>' +
    '<div class="co-total-row"><span>Doctor consultation</span><span style="color:var(--green)">FREE</span></div>' +
    '<div class="co-total-row grand"><span>Total ('+months+' month'+(months>1?'s':'')+')</span><span>\u20B9'+billFinal.toLocaleString('en-IN')+'</span></div>';

  var totalSavings = (bundleAmt + planDiscAmt) * months;
  if (totalSavings > 0) {
    totals.innerHTML += '<div class="co-savings">You save \u20B9'+totalSavings.toLocaleString('en-IN')+' total!</div>';
  }
}

function checkoutStep(n) {
  trackEvent('checkout_step', {step: n, step_name: ['cart','account','shipping','payment','health'][n-1] || 'unknown'});
  if(n===1){ window._healthDone = false; /* reset health flag on new checkout */ }
  if(n===2){
    if(cart.length===0){showToast('Your cart is empty.', 'error');return;}
  }
  if(n===3){
    if(!getSession()){showToast('Please sign in or create an account first.', 'error');return;}
  }
  if(n===4){
    const name=document.getElementById('shipName').value.trim();
    const addr=document.getElementById('shipAddr1').value.trim();
    const city=document.getElementById('shipCity').value.trim();
    const pin=document.getElementById('shipPin').value.trim();
    const phone=document.getElementById('shipPhone').value.trim();
    const err=document.getElementById('shipError');
    err.textContent='';
    if(!name||!addr||!city||!pin||!phone){err.textContent='Please fill in all required shipping fields.';return;}
    if(!/^\d{6}$/.test(pin)){err.textContent='Please enter a valid 6-digit PIN code.';return;}
    if(!isValidPhone(phone)){err.textContent='Please enter a valid 10-digit Indian mobile number.';return;}
    // Save address to user
    updateCurrentUser(u => { u.addresses=[{name,addr1:addr,addr2:document.getElementById('shipAddr2').value.trim(),city,state:document.getElementById('shipState').value,pin,phone}]; });
  }

  // Show correct step (5 steps if Rx items in cart)
  const hasRxInCart = cart.some(i=>i.type==='rx');
  const maxSteps = hasRxInCart ? 5 : 4;
  
  // If stepping to payment (4) and has Rx items, redirect to step 5 (health) first
  // unless health info already filled
  if(n===4 && hasRxInCart && !window._healthDone) {
    // Show health step 5 instead
    const coStep5 = document.getElementById('coStep5');
    if(coStep5) coStep5.style.display = '';
  }
  
  for(let i=1;i<=5;i++){
    const sec = document.getElementById('coSec'+i);
    const step = document.getElementById('coStep'+i);
    if(sec) sec.classList.toggle('active',i===n);
    if(step) {
      step.classList.toggle('active',i===n);
      step.classList.toggle('done',i<n);
      // Hide step 5 if no Rx items
      if(i===5 && !hasRxInCart) step.style.display='none';
    }
  }

  // Step 2: check if logged in
  if(n===2){
    const user=getCurrentUser();
    document.getElementById('coAuthNeeded').style.display=user?'none':'block';
    document.getElementById('coAuthDone').style.display=user?'block':'none';
    if(user) document.getElementById('coUserGreeting').textContent='Signed in as '+user.name+' ('+user.email+')';
    // Auto-fill shipping from user data
    if(user){
      document.getElementById('shipName').value=document.getElementById('shipName').value||user.name;
      document.getElementById('shipPhone').value=document.getElementById('shipPhone').value||user.phone;
      if(user.addresses&&user.addresses[0]){
        const a=user.addresses[0];
        document.getElementById('shipAddr1').value=document.getElementById('shipAddr1').value||a.addr1;
        document.getElementById('shipAddr2').value=document.getElementById('shipAddr2').value||a.addr2||'';
        document.getElementById('shipCity').value=document.getElementById('shipCity').value||a.city;
        document.getElementById('shipPin').value=document.getElementById('shipPin').value||a.pin;
        if(a.state)document.getElementById('shipState').value=a.state;
      }
    }
  }

  // Step 4: render summary
  if(n===4){
    const disc=planDiscount[selectedPlan];
    const months=planMonths[selectedPlan];
    let itemsTotal=0;
    const hasRx = cart.some(function(i){return i.type==='rx';});
    document.getElementById('coPreAuthNotice').style.display = hasRx?'flex':'none';
    const bd = getCartBundleDiscount();
    const bdAmt = bd ? bd.discount : 0;
    const lines = cart.map(i=>{
      itemsTotal += i.price * i.qty;
      return '<div class="co-total-row"><span>'+i.name+' \u00D7'+i.qty+'</span><span>\u20B9'+i.price.toLocaleString('en-IN')+'/'+i.period+'</span></div>';
    });
    const afterBundle = itemsTotal - bdAmt;
    const planDiscAmt = Math.round(afterBundle * disc);
    const monthlyFinal = afterBundle - planDiscAmt;
    let summaryHtml = lines.join('');
    if (bdAmt > 0) summaryHtml += '<div class="co-total-row" style="color:var(--teal)"><span>'+bd.name+' discount</span><span>\u2212\u20B9'+bdAmt.toLocaleString('en-IN')+'</span></div>';
    if (disc > 0) summaryHtml += '<div class="co-total-row" style="color:var(--green)"><span>'+planLabel[selectedPlan]+' (\u2212'+Math.round(disc*100)+'%)</span><span>\u2212\u20B9'+planDiscAmt.toLocaleString('en-IN')+'</span></div>';
    summaryHtml += '<div class="co-total-row grand"><span>Total ('+months+' mo)</span><span>\u20B9'+(monthlyFinal*months).toLocaleString('en-IN')+'</span></div>';
    document.getElementById('coPaymentSummary').innerHTML = summaryHtml;
  }

  // Step 1: render cart
  if(n===1) { renderCheckoutCart(); renderCheckoutUpsells(); }

  window.scrollTo({top:0,behavior:'smooth'});
}

function switchCoAuthTab(tab) {
  document.querySelectorAll('#coSec2 .auth-tab').forEach((t,i)=>t.classList.toggle('active',tab==='signin'?i===0:i===1));
  document.getElementById('coAuthSignin').classList.toggle('active',tab==='signin');
  document.getElementById('coAuthSignup').classList.toggle('active',tab==='signup');
}

function coSignIn() {
  const email=document.getElementById('coSiEmail').value.trim().toLowerCase();
  const pass=document.getElementById('coSiPass').value;
  const err=document.getElementById('coSiError');
  err.textContent='';
  if(!email||!pass){err.textContent='Please enter email and password.';return;}
  const user=getUsers().find(u=>u.email===email);
  if(!user){err.textContent='No account found.';return;}
  if(user.password!==simpleHash(pass)){err.textContent='Incorrect password.';return;}
  setSession(email);
  checkoutStep(3);
}

function coSignUp() {
  const name=document.getElementById('coSuName').value.trim();
  const phone=document.getElementById('coSuPhone').value.trim();
  const email=document.getElementById('coSuEmail').value.trim().toLowerCase();
  const pass=document.getElementById('coSuPass').value;
  const passC=document.getElementById('coSuPassC').value;
  const err=document.getElementById('coSuError');
  err.textContent='';
  if(!name||!phone||!email||!pass){err.textContent='All fields are required.';return;}
  if(pass.length<6){err.textContent='Password must be at least 6 characters.';return;}
  if(pass!==passC){err.textContent='Passwords do not match.';return;}
  const users=getUsers();
  if(users.find(u=>u.email===email)){err.textContent='Account exists. Sign in instead.';return;}
  users.push({name,phone,email,password:simpleHash(pass),orders:[],subscriptions:[],addresses:[]});
  saveUsers(users);
  setSession(email);
  checkoutStep(3);
}

/* ═══════════════════════════════════════
   RAZORPAY PAYMENT
   ═══════════════════════════════════════ */
let _razorpayLoading = false;
function loadRazorpay() {
  if (typeof Razorpay !== 'undefined' || _razorpayLoading) return;
  _razorpayLoading = true;
  var s = document.createElement('script');
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.async = true;
  document.head.appendChild(s);
}

function initiatePayment() {
  const user = getCurrentUser();
  if(!user){showToast('Please sign in first.', 'error');checkoutStep(2);return;}
  const disc = planDiscount[selectedPlan];
  const months = planMonths[selectedPlan];
  let monthlyTotal = 0;
  cart.forEach(i => { monthlyTotal += i.price * i.qty; });
  // Apply bundle discount
  var bd = getCartBundleDiscount();
  if (bd) monthlyTotal -= bd.discount;
  // Apply plan discount
  monthlyTotal = Math.round(monthlyTotal * (1 - disc));
  const totalPaise = monthlyTotal * months * 100;
  const hasRx = cart.some(i => i.type === 'rx');
  const orderId = 'HRX-' + Date.now().toString(36).toUpperCase();

  if (typeof Razorpay === 'undefined') {
    // Razorpay not loaded — fallback for local testing
    processOrderSuccess(orderId, 'OFFLINE-'+Date.now(), hasRx, monthlyTotal, months);
    return;
  }

  const options = {
    key: CFG.razorpayKey,
    amount: totalPaise,
    currency: 'INR',
    name: 'HelmRx',
    description: planLabel[selectedPlan] + ' Plan — ' + cart.map(i=>i.name).join(', ').substring(0,200),
    handler: function(response) {
      clearTimeout(window._paymentTimeout);
      processOrderSuccess(orderId, response.razorpay_payment_id, hasRx, monthlyTotal, months);
    },
    prefill: { name: user.name, email: user.email, contact: user.phone },
    notes: { order_id: orderId, plan: selectedPlan, has_rx: hasRx ? 'yes':'no' },
    theme: { color: '#2A7C6F' },
    modal: { ondismiss: function(){ showToast('Payment cancelled.', 'error'); } }
  };
  const rzp = new Razorpay(options);
  rzp.on('payment.failed', function(response) {
    showToast('Payment failed. Please try again.', 'error');
    // Show retry UI
    var retryDiv = document.getElementById('paymentRetry');
    if (!retryDiv) {
      retryDiv = document.createElement('div');
      retryDiv.id = 'paymentRetry';
      retryDiv.style.cssText = 'background:#FFF3E0;border:1px solid #FFB74D;border-radius:12px;padding:20px;margin-top:16px;text-align:center';
      retryDiv.innerHTML = '<h3 class="h4" style="color:#E65100;margin-bottom:8px">Payment didn\'t go through</h3>' +
        '<p style="font-size:.88rem;color:var(--text-muted);margin-bottom:12px">This can happen due to network issues or bank limits. Your order is saved.</p>' +
        '<button class="btn btn-primary" onclick="initiatePayment()" style="margin-right:8px">Try Again</button>' +
        '<button class="btn btn-outline" onclick="window.open(\'https://wa.me/'+CFG.wa+'?text=Payment+failed+for+my+order.+Can+you+help?\',\'_blank\')">Get Help on WhatsApp</button>';
      var coSec4 = document.getElementById('coSec4');
      if (coSec4) coSec4.appendChild(retryDiv);
    }
  });
  rzp.open();
  // Payment timeout (5 minutes)
  window._paymentTimeout = setTimeout(function() {
    showToast('Payment session timed out. Please try again.', 'error');
    trackEvent('payment_timeout', {order_id: orderId});
  }, 300000);
}

function processOrderSuccess(orderId, paymentId, hasRx, monthlyTotal, months) {
  const order = {
    id: orderId,
    paymentId: paymentId,
    date: new Date().toISOString(),
    items: cart.map(i => ({...i})),
    plan: selectedPlan,
    monthlyTotal: monthlyTotal,
    total: monthlyTotal * months,
    months: months,
    hasRx: hasRx,
    status: hasRx ? 'doctor-review' : 'confirmed',
    shipping: {
      name: document.getElementById('shipName').value,
      addr1: document.getElementById('shipAddr1').value,
      city: document.getElementById('shipCity').value,
      pin: document.getElementById('shipPin').value,
    }
  };

  // Save order to user
  updateCurrentUser(u => {
    u.orders = u.orders || [];
    u.orders.unshift(order);
    // Create subscription
    if (months > 1) {
      u.subscriptions = u.subscriptions || [];
      u.subscriptions.unshift({
        id: 'SUB-' + Date.now().toString(36).toUpperCase(),
        orderId: orderId,
        items: cart.map(i => ({...i})),
        plan: selectedPlan,
        monthlyAmount: monthlyTotal,
        status: hasRx ? 'pending-prescription' : 'active',
        startDate: new Date().toISOString(),
        nextDelivery: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      });
    }
  });

  // Also submit quiz data to Formspree if Rx items (doctor needs medical info)
  if (hasRx) {
    const user = getCurrentUser();
    const quizData = {...hairQuizData, ...swQuizData, ...suppQuizData};
    submitToFormspree(CFG.formConsult, {
      _subject: 'New Order ' + orderId + ' — Rx Review Needed',
      name: user.name, email: user.email, phone: user.phone,
      order_id: orderId, payment_id: paymentId,
      plan: selectedPlan, monthly_total: '₹'+monthlyTotal,
      items: cart.map(i=>i.name+' ×'+i.qty).join('; '),
      quiz_data: JSON.stringify(quizData),
    }, () => {});
  }

  // Render cross-sell before clearing cart so it can filter based on purchased items
  var purchasedSkus = cart.map(function(i){ return i.sku; });
  cart = []; saveCart();
  navigateTo('confirm');
  if(typeof renderCrossSell==='function')renderCrossSell(purchasedSkus);
  trackEvent('purchase', {order_id: orderId, value: monthlyTotal * months, currency: 'INR'});
  // Update confirmation page
  const icon = document.querySelector('.confirm-icon');
  if(icon) icon.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>';
  const h = document.querySelector('#page-confirm h2');
  if(h) h.textContent = hasRx ? 'Order placed — Doctor review in progress' : 'Order confirmed!';
  var deliveryDate = new Date(Date.now() + 5*24*60*60*1000).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
  var deliveryEl = document.querySelector('#page-confirm .confirm-delivery');
  if(deliveryEl) deliveryEl.textContent = 'Estimated delivery: ' + deliveryDate;
  const sub = document.querySelector('#page-confirm .confirm-sub');
  if(sub) sub.textContent = hasRx
    ? 'Order ' + orderId + '. Your doctor will review your case within 24 hours. Your card has been saved but will not be charged until the doctor approves your prescription.'
    : 'Order ' + orderId + '. Your items are being packed and will ship within 48 hours.';
}

/* ═══════════════════════════════════════
   ORDER TRACKING
   ═══════════════════════════════════════ */
function renderOrders() {
  const el = document.getElementById('ordersContent');
  if(!el) return;
  const user = getCurrentUser();
  if(!user || !user.orders || user.orders.length === 0) {
    el.innerHTML = '<div class="empty-state"><h3>No orders yet</h3><p>Once you place an order, it will appear here with real-time tracking.</p><a class="btn btn-primary" onclick="navigateTo(\x27home\x27)" style="margin-top:16px">Start Shopping</a></div>';
    return;
  }
  el.innerHTML = user.orders.map(o => {
    const statusMap = {
      'doctor-review': ['Doctor Reviewing','status-review'],
      'confirmed': ['Confirmed','status-prescribed'],
      'prescribed': ['Prescribed','status-prescribed'],
      'shipped': ['Shipped','status-shipped'],
      'delivered': ['Delivered','status-delivered'],
    };
    const [statusText, statusClass] = statusMap[o.status] || ['Processing','status-review'];
    const steps = ['Placed','Doctor Review','Prescribed','Shipped','Delivered'];
    const statusIndex = {'doctor-review':1,'confirmed':2,'prescribed':2,'shipped':3,'delivered':4};
    const si = statusIndex[o.status] || 0;

    return '<div class="order-card">' +
      '<div class="order-header">' +
        '<div><div class="order-id">' + o.id + '</div><div class="order-date">' + new Date(o.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) + '</div></div>' +
        '<div class="order-status '+statusClass+'">' + statusText + '</div>' +
      '</div>' +
      '<div class="order-items">' + o.items.map(i=>i.name+' ×'+i.qty).join(' · ') + '</div>' +
      '<div class="order-total">₹'+o.total.toLocaleString('en-IN')+' · '+planLabel[o.plan]+' plan</div>' +
      '<div style="margin-top:8px">' + (o.status === 'delivered' ? '<button class="btn btn-outline btn-sm" onclick="initiateReturn(\''+o.id+'\')" style="font-size:.75rem"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px"><path d="M3 10h13a4 4 0 010 8H7"/><path d="M7 6l-4 4 4 4"/></svg> Return / Exchange</button>' : '') + '</div>' + '<div class="order-track">' + steps.map((s,i) =>
        '<div class="track-step'+(i<si?' done':'')+(i===si?' active':'')+'"><div class="track-dot">'+(i<si?'✓':'')+'</div><div class="track-label">'+s+'</div></div>'
      ).join('') + '</div>' +
    '</div>';
  }).join('');
}

function renderSubscriptions() {
  const el = document.getElementById('subsContent');
  if(!el) return;
  const user = getCurrentUser();
  if(!user || !user.subscriptions || user.subscriptions.length === 0) {
    el.innerHTML = '<div class="empty-state"><h3>No active subscriptions</h3><p>Subscribe to a 3 or 6 month plan during checkout to save up to 30% and get automatic deliveries.</p><a class="btn btn-primary" onclick="navigateTo(\x27home\x27)" style="margin-top:16px">Start Shopping</a></div>';
    return;
  }
  el.innerHTML = user.subscriptions.map(s => {
    const statusColor = s.status==='active' ? 'status-shipped' : 'status-review';
    return '<div class="order-card">' +
      '<div class="order-header">' +
        '<div><div class="order-id">' + s.id + '</div><div class="order-date">Started: '+new Date(s.startDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})+'</div></div>' +
        '<div class="order-status '+statusColor+'">' + (s.status==='active'?'Active':'Pending Prescription') + '</div>' +
      '</div>' +
      '<div class="order-items">' + s.items.map(i=>i.name).join(' · ') + '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">' +
        '<div class="order-total">₹'+s.monthlyAmount.toLocaleString('en-IN')+'/mo · '+planLabel[s.plan]+'</div>' +
        '<div style="font-size:.85rem;color:var(--text-muted)">Next delivery: '+(s.nextDelivery||'Pending')+' <span style="font-size:.72rem;color:var(--teal)">(reminder sent 3 days before)</span></div>' +
      '</div>' +
      '<div style="margin-top:12px;display:flex;gap:8px">' +
        '<button class="btn btn-outline btn-sm" onclick="showToast(\x27To pause or modify, WhatsApp us at '+CFG.waDisplay+' with your subscription ID.\x27)">Pause / Modify</button>' +
        '<button class="btn btn-outline btn-sm" style="color:var(--red);border-color:var(--red)" onclick="if(confirm(\x27Cancel subscription '+s.id+'? WhatsApp us to confirm.\x27))window.open(\x27https://wa.me/'+CFG.wa+'?text=Cancel+subscription+'+s.id+'\x27,\x27_blank\x27)">Cancel</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* ═══════════════════════════════════════
   QUIZ → CHECKOUT BRIDGE
   ═══════════════════════════════════════ */
function addHairRecoAndCheckout() {
  // Always recommend stacks, not individual products
  const pref = hairQuizData.hairPref || '';
  if (pref.includes('Topical')) {
    addStack('regrow');
  } else if (pref.includes('Chewable')) {
    addStack('chewable');
  } else {
    addStack('regrow');
  }
  showToast('Your recommended stack has been added to cart! Browse more or proceed to checkout.');
  navigateTo('cat-hair');
}

function addSWRecoAndCheckout() {
  // Always recommend stacks, not individual products
  const concerns = [];
  document.querySelectorAll('#sexualQuiz .quiz-step[data-step="1"] .quiz-option.selected').forEach(el => concerns.push(el.textContent.trim()));
  const hasED = concerns.some(c => c.includes('erection'));
  const hasPE = concerns.some(c => c.includes('quickly') || c.includes('premature'));

  if (hasED && hasPE) {
    addStack('perform');
  } else if (hasED) {
    addStack('confidence');
  } else if (hasPE) {
    addStack('endurance');
  } else {
    addStack('vitality');
  }
  showToast('Your recommended stack has been added to cart! Browse more or proceed to checkout.');
  navigateTo('cat-sexual');
}

// Populate recommendation display in quiz final step
function populateHairReco() {
  const el = document.getElementById('hairRecoItems');
  if(!el) return;
  const pref = hairQuizData.hairPref || '';
  let stackName = '';
  let items = [];
  let bundlePrice = 0;
  if (pref.includes('Topical')) {
    stackName = 'The Regrowth Protocol';
    items = ['HELM Strand (Finasteride 1mg) ℞ — ₹599/mo','HELM Strand Topical (Minoxidil 5%) — ₹499/mo','HELM Strand Support — ₹499/mo'];
    bundlePrice = 1299;
  } else if (pref.includes('Chewable')) {
    stackName = 'The Regrowth Duo Protocol';
    items = ['HELM Strand Duo (Fin+Min Spray) ℞ — ₹999/mo','HELM Strand Support — ₹499/mo'];
    bundlePrice = 1299;
  } else {
    stackName = 'The Regrowth Protocol';
    items = ['HELM Strand (Finasteride 1mg) ℞ — ₹599/mo','HELM Strand Topical (Minoxidil 5%) — ₹499/mo','HELM Strand Support — ₹499/mo'];
    bundlePrice = 1299;
  }
  el.innerHTML = '<strong>' + stackName + '</strong><br>' + items.map(i => '• ' + i).join('<br>') + '<br><br><strong style="font-size:1rem;color:var(--navy)">Protocol price: ₹' + bundlePrice.toLocaleString('en-IN') + '/mo</strong> <span style="font-size:.85rem;color:var(--teal)">(save with 3-month plan at checkout)</span>';
}

function populateSWReco() {
  const el = document.getElementById('swRecoItems');
  if(!el) return;
  const concerns = [];
  document.querySelectorAll('#sexualQuiz .quiz-step[data-step="1"] .quiz-option.selected').forEach(e => concerns.push(e.textContent.trim()));
  let items = [];
  const hasED = concerns.some(c => c.includes('erection'));
  const hasPE = concerns.some(c => c.includes('quickly'));
  if(hasED&&hasPE) { items.push('HELM Drive (Tadalafil 5mg) — ₹899/mo'); items.push('HELM Endure (Dapoxetine 30mg) — ₹699/mo'); }
  else if(hasED) items.push('HELM Drive (Tadalafil 5mg Daily) — ₹899/mo');
  else if(hasPE) { items.push('HELM Endure (Dapoxetine 30mg) — ₹699/mo'); items.push('HELM Endure Spray — ₹499'); }
  else items.push('HELM Drive Support (D3+Zinc+Mag) — ₹499/mo');
  el.innerHTML = items.map(i => '• ' + i).join('<br>');
}


/* ═══════════════════════════════════════
   TOAST NOTIFICATION
   ═══════════════════════════════════════ */
let toastTimer;
function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.classList.remove('toast-error', 'toast-success');
  if (type === 'error') {
    t.textContent = msg;
    t.classList.add('toast-error');
  } else {
    t.textContent = '✓ ' + msg;
    t.classList.add('toast-success');
  }
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

/* ═══════════════════════════════════════
   SPA NAVIGATION
   ═══════════════════════════════════════ */
var pageTitles = {
  'home': 'HelmRx — Doctor-Led Men\'s Health, Delivered',
  'cat-hair': 'Hair Loss Treatment — HelmRx',
  'cat-sexual': 'ED & PE Treatment — HelmRx',
  'cat-supplements': 'Evidence-Based Supplements — HelmRx',
  'cat-weight': 'Medical Weight Loss — HelmRx',
  'checkout': 'Checkout — HelmRx',
  'quiz-hair': 'Hair Loss Assessment — HelmRx',
  'quiz-sexual': 'Sexual Wellness Assessment — HelmRx',
  'quiz-supplements': 'Supplement Recommendation Quiz — HelmRx',
  'blog': 'The HelmRx Journal — Evidence-Based Men\'s Health',
  'doctors': 'Our Doctors — HelmRx',
  'about': 'About HelmRx',
  'privacy': 'Privacy Policy — HelmRx',
  'terms': 'Terms of Service — HelmRx',
};
let currentPage = 'home';
let navigating = false;

function navigateTo(page, skipPush) {
  trackEvent('page_view', {page: page});

  // Guard: prevent double navigation
  const prevEl = document.getElementById('page-' + currentPage);
  var nextEl = document.getElementById('page-' + page);
  if (!nextEl) { nextEl = document.getElementById('page-404'); page = '404'; }
  if (!nextEl) return;
  if (page === currentPage && !navigating) return;
  if (navigating) {
    // Safety: reset navigating after 1s to prevent permanent lock
    setTimeout(function(){ navigating = false; }, 1000);
    return;
  }
  navigating = true;

  // Browser history support
  if (!skipPush) {
    history.pushState({page: page}, '', '#' + page);
  }
  
  // Page-specific pre-navigation hooks
  if (page === 'orders') renderOrders();
  if (page === 'subscriptions') renderSubscriptions();
  if (page === 'checkout') { loadRazorpay(); if(cart.length===0){showToast('Your cart is empty. Add items first.', 'error');navigating=false;page='home';navigateTo('home');return;} else {setTimeout(function(){checkoutStep(1);},350);} }
  if (page === 'account') refreshAuthUI();
  var loader = document.getElementById('pageLoader');
  if(loader){loader.style.width='60%';}
  currentPage = page;
  if (prevEl) { prevEl.classList.remove('visible'); setTimeout(() => prevEl.classList.remove('active'), 300); }
  setTimeout(() => {
    nextEl.classList.add('active');
    requestAnimationFrame(() => nextEl.classList.add('visible'));
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    // Highlight active nav link
    var navMap={'cat-hair':'Regrow','cat-sexual':'Perform','cat-supplements':'Feel Better','cat-weight':'Lose Weight','blog':'Learn','upload-rx':'Upload','quiz-supplements':'Feel Better'};
    var activeText = navMap[page] || '';
    if(activeText) document.querySelectorAll('.nav-link').forEach(l => { if(l.textContent.trim().startsWith(activeText)) l.classList.add('active'); });
    const nav = document.getElementById('nav');
    const waFloat = document.getElementById('waFloat');
    if (page.startsWith('quiz-') || page === 'confirm') {
      nav.style.display = 'none'; if (waFloat) waFloat.style.display = 'none';
    } else {
      nav.style.display = ''; if (waFloat) waFloat.style.display = '';
    }
    setTimeout(initScrollAnimations, 100);
    updateOffersBar(page);
    renderBreadcrumb(page);
    trackView(page);
    document.title = pageTitles[page] || 'HelmRx — Doctor-Led Men\'s Health';
    // Restore bar spacer if bar is visible
    var bar = document.getElementById('offersBar');
    if(bar && bar.style.display !== 'none') { nextEl.querySelectorAll('.page-spacer').forEach(s => s.classList.add('page-spacer-bar')); }
    // Move footer into active page
    const footer = document.getElementById('mainFooter');
    if (footer && !page.startsWith('quiz-') && page !== 'confirm') {
      nextEl.appendChild(footer);
      footer.style.display = '';
    } else if (footer) {
      footer.style.display = 'none';
    }
    navigating = false;
    if(loader){loader.style.width='100%';setTimeout(function(){loader.style.width='0';loader.style.transition='none';setTimeout(function(){loader.style.transition='width .3s ease';},50);},200);}
  }, prevEl ? 200 : 0);
}

function scrollToSection(id) {
  setTimeout(() => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 350);
}

/* ═══════════════════════════════════════
   MOBILE NAV
   ═══════════════════════════════════════ */
function toggleMobile() {
  document.getElementById('navBurger').classList.toggle('open');
  document.getElementById('navMobile').classList.toggle('open');
  var isOpen = document.getElementById('navMobile').classList.contains('open');
  document.body.style.overflow = isOpen ? 'hidden' : '';
  if (isOpen) trapFocusMobile();
}
function closeMobile() {
  document.getElementById('navBurger').classList.remove('open');
  document.getElementById('navMobile').classList.remove('open');
  document.body.style.overflow = '';
}

function trapFocusMobile() {
  var nav = document.getElementById('navMobile');
  if (!nav) return;
  var focusable = nav.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
  if (focusable.length === 0) return;
  var first = focusable[0];
  var last = focusable[focusable.length - 1];
  nav.addEventListener('keydown', function handler(e) {
    if (!nav.classList.contains('open')) { nav.removeEventListener('keydown', handler); return; }
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  first.focus();
}

window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

function toggleFaq(btn) { btn.closest('.faq-item').classList.toggle('open'); }

var _scrollObserver = null;
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.fade-up').forEach(el => el.classList.add('in-view'));
    return;
  }
  // Disconnect previous observer to prevent leaks
  if (_scrollObserver) _scrollObserver.disconnect();
  _scrollObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); _scrollObserver.unobserve(e.target); } });
  }, { threshold: 0.05, rootMargin: '50px' });
  document.querySelectorAll('.fade-up:not(.in-view)').forEach(el => _scrollObserver.observe(el));
}

function completeCheckout() {
  const hasRx = cart.some(i=>i.type==='rx');
  window._healthDone = true;
  if(hasRx) {
    // Validate health fields
    const dob = document.getElementById('coHealthDob').value;
    const meds = document.getElementById('coHealthMeds').value.trim();
    const allergies = document.getElementById('coHealthAllergies').value.trim();
    const conditions = document.getElementById('coHealthConditions').value.trim();
    if(!dob || !meds || !allergies || !conditions) {
      showToast('Please fill in all health information for your doctor.', 'error');
      return;
    }
  }
  // Show confirmation
  navigateTo('confirm');
  showToast('Order placed successfully!');
}


function renderCheckoutUpsells() {
  var recoDiv = document.getElementById('coRecommendations');
  var recoItems = document.getElementById('coRecoItems');
  if(!recoDiv || !recoItems) return;
  
  var cartIds = cart.map(function(i){ return i.sku; });
  var hasHairRx = cartIds.some(function(id){ return ['HL-01','HL-02','HL-03','HL-04B','HL-06'].indexOf(id) >= 0; });
  var hasSexualRx = cartIds.some(function(id){ return ['SW-01','SW-02','SW-03','SW-04','SW-05','SW-07'].indexOf(id) >= 0; });
  
  var suggestions = [];
  
  if(hasHairRx) {
    if(cartIds.indexOf('HL-04') < 0 && cartIds.indexOf('HL-04B') < 0) suggestions.push({sku:'HL-04',name:'HELM Strand Topical Min 5%',price:499,type:'otc',unit:'month',reason:'Boosts regrowth when paired with Finasteride'});
    if(cartIds.indexOf('HL-05') < 0) suggestions.push({sku:'HL-05',name:'HELM Strand Support',price:499,type:'supp',unit:'month',reason:'D3 + Zinc + Biotin — targets Indian deficiencies'});
    if(cartIds.indexOf('HL-07') < 0) suggestions.push({sku:'HL-07',name:'HELM Strand Wash Keto 2%',price:399,type:'otc',unit:'bottle',reason:'Anti-fungal + anti-inflammatory — complements treatment'});
  }
  
  if(hasSexualRx) {
    if(cartIds.indexOf('SW-06') < 0) suggestions.push({sku:'SW-06',name:'HELM Drive Support',price:499,type:'supp',unit:'month',reason:'D3 + Zinc + Mag — evidence-based sexual health support'});
    if(cartIds.indexOf('SW-08') < 0) suggestions.push({sku:'SW-08',name:'HELM Endure Spray',price:499,type:'otc',unit:'bottle',reason:'Topical desensitiser for PE — no Rx needed'});
    if(cartIds.indexOf('SP-06') < 0) suggestions.push({sku:'SP-06',name:'HELM Foundation Bundle',price:699,type:'supp',unit:'month',reason:'D3+B12+Zinc+Mag — the base layer for any protocol'});
  }
  
  if(cartIds.indexOf('SP-01') < 0 && suggestions.length < 3) suggestions.push({sku:'SP-01',name:'HELM D3',price:299,type:'supp',unit:'month',reason:'61–70% of Indians are D3 deficient — supports all protocols'});
  if(cartIds.indexOf('SP-05') < 0 && suggestions.length < 3) suggestions.push({sku:'SP-05',name:'HELM Omega',price:499,type:'supp',unit:'month',reason:'EPA+DHA for heart, joint, and brain health'});
  
  suggestions = suggestions.slice(0, 3);
  
  if(suggestions.length === 0) {
    recoDiv.style.display = 'none';
    return;
  }
  
  recoDiv.style.display = 'block';
  recoItems.innerHTML = '';
  
  suggestions.forEach(function(s) {
    var priceLabel = s.unit === 'month' ? s.price + '/mo' : s.price + '/' + s.unit;
    var typeLabel = s.type === 'otc' ? 'OTC' : 'Supplement';
    
    var card = document.createElement('div');
    card.className = 'upsell-card';
    
    var info = document.createElement('div');
    info.className = 'upsell-card-info';
    info.innerHTML = '<div class="upsell-card-name">' + s.name + 
      ' <span class="upsell-card-badge">' + 
      typeLabel + ' \u00B7 Ships today</span></div>' +
      '<div class="upsell-card-reason">' + s.reason + '</div>';
    
    var btn = document.createElement('button');
    btn.className = 'btn btn-cart btn-sm';
    btn.style.cssText = 'white-space:nowrap;margin-left:12px';
    btn.textContent = '+ \u20B9' + priceLabel;
    btn.addEventListener('click', (function(item) {
      return function() {
        addToCart(item.sku, item.name, item.price, item.type, item.unit);
        renderCheckoutCart();
        renderCheckoutUpsells();
      };
    })(s));
    
    card.appendChild(info);
    card.appendChild(btn);
    recoItems.appendChild(card);
  });
}


// Safety fallback: if elements are still hidden after 1.5s, force show them
setTimeout(() => {
  document.querySelectorAll('.fade-up:not(.in-view)').forEach(el => el.classList.add('in-view'));
}, 1500);

/* ═══════════════════════════════════════
   QUIZ LOGIC
   ═══════════════════════════════════════ */
const hairQuizData = {};
const swQuizData = {};
const suppQuizData = {};

function getStore(key) { return key.startsWith('sw') ? swQuizData : key.startsWith('supp') ? suppQuizData : hairQuizData; }

function selectOption(el, key, dqValue) {
  el.closest('.quiz-options').querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  getStore(key)[key] = el.textContent.trim();
  if (key === 'swNitrates') {
    const dq = el.dataset.dq === 'true';
    document.getElementById('nitrateDQ').style.display = dq ? 'block' : 'none';
    document.getElementById('nitrateActions').style.display = dq ? 'none' : 'flex';
  }
  if (key === 'swCardiac') {
    const dq = el.dataset.dq === 'true';
    document.getElementById('cardiacDQ').style.display = dq ? 'block' : 'none';
    document.getElementById('cardiacActions').style.display = dq ? 'none' : 'flex';
  }
}

function toggleCheck(el) { el.classList.toggle('selected'); }

function stepOk(quizId, n) {
  const step = document.querySelector('#' + quizId + ' .quiz-step[data-step="' + n + '"]');
  if (!step) return true;
  const opts = step.querySelectorAll('.quiz-options .quiz-option');
  if (opts.length === 0) return true;
  // Check for at least one selected (works for both single and multi-select)
  return step.querySelector('.quiz-option.selected') !== null;
}

function shakeStep(quizId, n) {
  const opts = document.querySelector('#' + quizId + ' .quiz-step[data-step="' + n + '"] .quiz-options');
  if (opts) { opts.style.animation = 'none'; void opts.offsetHeight; opts.style.animation = 'shake 0.4s ease'; }
}

// Hair quiz
const H_STEPS = 8;

// Quiz reinforcement messages — Hims-style interstitials between steps
const HAIR_REINFORCE = {
  1: { icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.8 2.3A5 5 0 0110 7v4a2 2 0 004 0V7a5 5 0 015.2-4.7"/><circle cx="16" cy="16" r="2"/><path d="M14 16v2a4 4 0 01-8 0v-3"/></svg>', text: 'Over 200 million Indian men experience pattern hair loss.', sub: 'You\'re taking the right step.' },
  2: { icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>', text: 'Earlier treatment = better outcomes.', sub: 'Finasteride is most effective when started early in the hair loss process.' },
  3: { icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6M10 3v7.4a2 2 0 01-.6 1.4L4 17.2A2 2 0 005.4 21h13.2a2 2 0 001.4-3.4L14.6 12a2 2 0 01-.6-1.4V3"/></svg>', text: 'Pattern hair loss is genetic and hormonal — not caused by stress or diet.', sub: 'That\'s why prescription treatment targets the root cause.' },
  5: { icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>', text: 'Your answers are reviewed only by your assigned physician.', sub: '100% confidential. Protected by doctor-patient privilege.' },
  6: { icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>', text: 'Almost done. Your doctor will use this to prescribe safely.', sub: 'No judgment — just evidence-based medicine.' }
};
const SW_REINFORCE = {
  1: { icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>', text: '1 in 5 Indian men over 40 experience this.', sub: 'Modern treatments are safe, effective, and completely private.' },
  2: { icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.5 1.5l-8 8a5.66 5.66 0 008 8l8-8a5.66 5.66 0 00-8-8z"/><path d="M6.5 13.5l5-5"/></svg>', text: 'Most men see significant improvement with treatment.', sub: '81% report improved erections with PDE5 inhibitors.' },
  3: { icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>', text: 'Everything you share stays between you and your doctor.', sub: 'Encrypted. Confidential. No one else sees your answers.' },
  5: { icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.8 2.3A5 5 0 0110 7v4a2 2 0 004 0V7a5 5 0 015.2-4.7"/><circle cx="16" cy="16" r="2"/><path d="M14 16v2a4 4 0 01-8 0v-3"/></svg>', text: 'Your safety is our priority.', sub: 'These questions help your physician prescribe the right treatment at the right dose.' },
  7: { icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 7h8M8 12h8M8 17h4"/></svg>', text: 'Almost there — your personalised plan is being prepared.', sub: 'A licensed physician will review everything before prescribing.' }
};

function showQuizReinforce(quizId, step, callback) {
  const msgs = quizId === 'hairQuiz' ? HAIR_REINFORCE : quizId === 'suppQuiz' ? SUPP_REINFORCE : SW_REINFORCE;
  const msg = msgs[step];
  if (!msg) { callback(); return; }
  const prefix = quizId === 'hairQuiz' ? 'hair' : quizId === 'suppQuiz' ? 'supp' : 'sw';
  const overlay = document.getElementById(prefix + 'Reinforce');
  const iconEl = document.getElementById(prefix + 'ReinforceIcon');
  const textEl = document.getElementById(prefix + 'ReinforceText');
  const subEl = document.getElementById(prefix + 'ReinforceSub');
  if (!overlay) { callback(); return; }
  // Reset content visibility for fresh animation
  const contentEl = overlay.querySelector('.quiz-reinforce-content');
  if (contentEl) { contentEl.style.opacity = '0'; contentEl.style.transform = 'translateY(10px)'; }
  iconEl.innerHTML = msg.icon;
  textEl.textContent = msg.text;
  subEl.textContent = msg.sub;
  overlay.classList.add('active');
  // Content fades in after 0.6s via CSS transition
  // Re-trigger the CSS transition
  requestAnimationFrame(() => {
    if (contentEl) { contentEl.style.opacity = ''; contentEl.style.transform = ''; }
  });
  // Total: 0.6s loader + 0.4s fade-in + 1.2s reading = ~2.2s
  setTimeout(() => { overlay.classList.remove('active'); setTimeout(callback, 250); }, 2400);
}

function showHairStep(s) {
  if (s === 1) trackEvent('quiz_start', {quiz: 'hair'});
  document.querySelectorAll('#hairQuiz .quiz-step').forEach(el => el.classList.remove('active'));
  document.querySelector('#hairQuiz .quiz-step[data-step="' + s + '"]').classList.add('active');
  document.getElementById('hairProgress').style.width = ((s / H_STEPS) * 100) + '%';
}
function nextHairStep(c) {
  if ((c <= 5 || c === 7) && !stepOk('hairQuiz', c)) { shakeStep('hairQuiz', c); return; }
  if (c < H_STEPS) {
    showQuizReinforce('hairQuiz', c, function() { showHairStep(c + 1); });
  }
  if (c === 7) populateHairReco(); // show reco on final step
}
function prevHairStep(c) { if (c > 1) showHairStep(c - 1); }

function submitHairQuiz() {
  // Now handled by addHairRecoAndCheckout
  addHairRecoAndCheckout();
}

// SW quiz
const SW_STEPS = 9;
function showSWStep(s) {
  if (s === 1) trackEvent('quiz_start', {quiz: 'sexual_wellness'});
  document.querySelectorAll('#sexualQuiz .quiz-step').forEach(el => el.classList.remove('active'));
  document.querySelector('#sexualQuiz .quiz-step[data-step="' + s + '"]').classList.add('active');
  document.getElementById('sexualProgress').style.width = ((s / SW_STEPS) * 100) + '%';
}
function nextSWStep(c) {
  if ((c <= 5 || c === 8) && !stepOk('sexualQuiz', c)) { shakeStep('sexualQuiz', c); return; }
  if (c < SW_STEPS) {
    showQuizReinforce('sexualQuiz', c, function() { showSWStep(c + 1); });
  }
  if (c === 8) populateSWReco(); // show reco on final step
}
function prevSWStep(c) { if (c > 1) showSWStep(c - 1); }

function submitSWQuiz() {
  // Now handled by addSWRecoAndCheckout
  addSWRecoAndCheckout();
}

// Supplements quiz
const SUPP_STEPS = 6;
const SUPP_REINFORCE = {
  1: { icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 15c6.667-6 13.333 0 20-6M9 3.236s6.5.6 8 5.764M15 20.764s-6.5-.6-8-5.764M2 9c6.667 6 13.333 0 20 6"/></svg>', text: '70% of Indians are Vitamin D deficient.', sub: 'Even small gaps compound over time — targeted supplements help close them.' },
  2: { icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>', text: 'Individual supplements beat generic multivitamins.', sub: 'Clinical-strength doses of what you actually need — not token amounts of everything.' },
  4: { icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>', text: 'Most office-based Indians get far less sun than they think.', sub: 'D3 supplementation is one of the most impactful changes you can make.' }
};

function showSuppStep(s) {
  if (s === 1) trackEvent('quiz_start', {quiz: 'supplements'});
  document.querySelectorAll('#suppQuiz .quiz-step').forEach(el => el.classList.remove('active'));
  document.querySelector('#suppQuiz .quiz-step[data-step="' + s + '"]').classList.add('active');
  document.getElementById('suppProgress').style.width = ((s / SUPP_STEPS) * 100) + '%';
}
function nextSuppStep(c) {
  if (c <= 5 && !stepOk('suppQuiz', c)) { shakeStep('suppQuiz', c); return; }
  if (c < SUPP_STEPS) {
    showQuizReinforce('suppQuiz', c, function() { showSuppStep(c + 1); });
  }
  if (c === 5) populateSuppReco();
}
function prevSuppStep(c) { if (c > 1) showSuppStep(c - 1); }

function populateSuppReco() {
  var el = document.getElementById('suppRecoItems');
  if (!el) return;
  var concerns = [];
  document.querySelectorAll('#suppQuiz .quiz-step[data-step="2"] .quiz-option.selected').forEach(function(e) { concerns.push(e.textContent.trim()); });
  var diet = suppQuizData.suppDiet || '';
  var sun = suppQuizData.suppSun || '';
  var items = [];
  var total = 0;
  // D3 — almost always recommended for Indian men
  if (sun.includes('Very little') || sun.includes('avoid') || sun.includes('Some')) {
    items.push('HELM D3 (Cholecalciferol 2000IU) — ₹299/mo'); total += 299;
  }
  // B12 — if veg, fatigue, brain fog
  if (diet.includes('Vegetarian') || concerns.some(function(c){ return c.includes('fatigue') || c.includes('Brain fog'); })) {
    items.push('HELM B12 (Methylcobalamin 1500mcg) — ₹299/mo'); total += 299;
  }
  // Zinc — if immunity, hair, libido
  if (concerns.some(function(c){ return c.includes('immunity') || c.includes('Hair') || c.includes('libido'); })) {
    items.push('HELM Zinc (Zinc Bisglycinate 25mg) — ₹299/mo'); total += 299;
  }
  // Magnesium — if sleep, stress
  if (concerns.some(function(c){ return c.includes('sleep') || c.includes('Stress'); })) {
    items.push('HELM Magnesium (Magnesium Glycinate 400mg) — ₹349/mo'); total += 349;
  }
  // Ashwagandha — if stress, low libido
  if (concerns.some(function(c){ return c.includes('Stress') || c.includes('libido'); })) {
    items.push('HELM Calm (Ashwagandha KSM-66 600mg) — ₹399/mo'); total += 399;
  }
  // Fallback: if nothing selected or general wellness
  if (items.length === 0 || concerns.some(function(c){ return c.includes('General wellness'); })) {
    items = ['HELM Foundation Bundle (D3 + B12 + Zinc + Mag) — ₹699/mo'];
    total = 699;
  }
  // If 3+ items, suggest the Foundation bundle as savings
  var bundleNote = '';
  if (items.length >= 3) {
    bundleNote = '<br><br><div style="background:var(--accent-green-bg);padding:10px 14px;border-radius:8px;font-size:.85rem;color:var(--accent-green);font-weight:500"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px"><path d="M9 18h6M10 22h4M12 2a7 7 0 015 11.9V17H7v-3.1A7 7 0 0112 2z"/></svg> Tip: The HELM Foundation Bundle covers D3 + B12 + Zinc + Mag for just ₹699/mo — save vs buying individually.</div>';
  }
  el.innerHTML = items.map(function(i){ return '• ' + i; }).join('<br>') + '<br><br><strong style="font-size:1rem;color:var(--navy)">Total: ₹' + total.toLocaleString('en-IN') + '/mo</strong>' + bundleNote;
}

function addSuppRecoAndCheckout() {
  var concerns = [];
  document.querySelectorAll('#suppQuiz .quiz-step[data-step="2"] .quiz-option.selected').forEach(function(e) { concerns.push(e.textContent.trim()); });
  var sun = suppQuizData.suppSun || '';
  var diet = suppQuizData.suppDiet || '';
  var added = 0;
  // Add individual supplements based on quiz answers
  if (sun.includes('Very little') || sun.includes('avoid') || sun.includes('Some')) {
    addToCart('SP-01','HELM D3',299,'supp','month'); added++;
  }
  if (diet.includes('Vegetarian') || concerns.some(function(c){ return c.includes('fatigue') || c.includes('Brain fog'); })) {
    addToCart('SP-02','HELM B12',299,'supp','month'); added++;
  }
  if (concerns.some(function(c){ return c.includes('immunity') || c.includes('Hair') || c.includes('libido'); })) {
    addToCart('SP-03','HELM Zinc',299,'supp','month'); added++;
  }
  if (concerns.some(function(c){ return c.includes('sleep') || c.includes('Stress'); })) {
    addToCart('SP-04','HELM Magnesium',349,'supp','month'); added++;
  }
  if (added === 0 || concerns.some(function(c){ return c.includes('General wellness'); })) {
    addToCart('SP-06','HELM Foundation Bundle',699,'supp','month');
  }
  showToast('Your personalised supplement stack has been added to cart!');
  navigateTo('cat-supplements');
}

/* ═══════════════════════════════════════
   WAITLIST
   ═══════════════════════════════════════ */
function submitWaitlist() {
  const email = document.getElementById('waitlistEmail').value.trim();
  const msg = document.getElementById('waitlistMsg');
  if (!email || !isValidEmail(email)) { msg.textContent = 'Please enter a valid email.'; msg.style.color = 'var(--red)'; return; }
  submitToFormspree(CFG.formWaitlist, { _subject: 'Waitlist Signup', email, source: 'weight_loss' }, () => {
    msg.textContent = "You're on the list! We'll notify you when Lose Weight launches.";
    msg.style.color = 'var(--teal)';
    document.getElementById('waitlistEmail').value = '';
  });
}

/* ═══════════════════════════════════════
   PRESCRIPTION UPLOAD
   ═══════════════════════════════════════ */
let uploadedFile = null;

function handleFileSelect(input) {
  if (input.files && input.files[0]) processFile(input.files[0]);
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById('uploadZone').classList.remove('dragover');
  if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
}

function processFile(file) {
  if (file.size > 10 * 1024 * 1024) { showToast('File must be under 10MB.'); return; }
  uploadedFile = file;
  document.getElementById('uploadFileName').innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg> ' + file.name.replace(/</g,'&lt;') + ' (' + (file.size / 1024).toFixed(0) + ' KB)';
  document.getElementById('uploadPreview').classList.add('show');
}

function submitPrescription() {
  const n = document.getElementById('rxName').value.trim();
  const p = document.getElementById('rxPhone').value.trim();
  const e = document.getElementById('rxEmail').value.trim();
  const notes = document.getElementById('rxNotes').value.trim();
  if (!n || !p || !e) { showToast('Please fill in name, phone, and email.', 'error'); return; }
  if (!uploadedFile) { showToast('Please upload your prescription file.', 'error'); return; }
  // Formspree free tier doesn't support file uploads, so we send metadata
  // and instruct user to WhatsApp the actual file
  const payload = {
    _subject: 'Prescription Upload — ' + n,
    name: n, phone: p, email: e, notes: notes || 'None',
    file_name: uploadedFile.name,
    file_size: (uploadedFile.size / 1024).toFixed(0) + ' KB',
    instruction: 'Patient will WhatsApp the prescription file. Please reach out to verify.',
  };
  submitToFormspree(CFG.formConsult, payload, () => {
    showToast('Prescription submitted!');
    // Open WhatsApp to send the file
    const msg = "Hi HelmRx! I just uploaded my prescription details via your website. My name is " + n + ". I'm sending the prescription file here for verification.";
    window.open('https://wa.me/' + CFG.wa + '?text=' + encodeURIComponent(msg), '_blank');
    navigateTo('confirm');
  if(typeof renderCrossSell==='function')renderCrossSell();
  });
}

/* ═══════════════════════════════════════
   FORMSPREE HELPER
   ═══════════════════════════════════════ */
function submitToFormspree(formId, data, onOk) {
  const btn = document.activeElement;
  if (btn && btn.tagName === 'BUTTON') { btn.disabled = true; btn.textContent = 'Submitting...'; }
  fetch('https://formspree.io/f/' + formId, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data),
  })
  .then(r => { if (r.ok) { if (onOk) onOk(); } else { return r.json().then(e => { throw new Error(e.error || 'Failed'); }); } })
  .catch(err => {
    console.error('Submit error:', err);
    showToast('Submission error. Please try again or WhatsApp us directly.');
  })
  .finally(() => {
    if (btn && btn.tagName === 'BUTTON') { btn.disabled = false; btn.textContent = btn.dataset.originalText || 'Submit'; }
  });
}

/* ═══════════════════════════════════════
   INIT
   ═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // WhatsApp links
  const waFloat = document.getElementById('waFloat');
  if (waFloat) waFloat.href = 'https://wa.me/' + CFG.wa;
  const confirmWa = document.getElementById('confirmWaLink');
  if (confirmWa) { confirmWa.href = 'https://wa.me/' + CFG.wa; confirmWa.textContent = CFG.waDisplay; }
  const helpWa = document.getElementById('helpWaBtn');
  if (helpWa) helpWa.href = 'https://wa.me/' + CFG.wa;
  document.querySelectorAll('.helpWaLink').forEach(function(el){ el.href = 'https://wa.me/' + CFG.wa; });

  // Mobile cart button visibility
  const mq = window.matchMedia('(max-width:768px)');
  function checkMobile(e) { document.getElementById('mobileCartBtn').style.display = e.matches ? 'flex' : 'none'; }
  mq.addEventListener('change', checkMobile);
  checkMobile(mq);

  // Accessibility
  document.querySelectorAll('a[onclick]:not([href])').forEach(el => {
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); } });
  });

  // Store original text on submit buttons
  document.querySelectorAll('[data-original-text]').forEach(btn => {
    if (!btn.dataset.originalText) btn.dataset.originalText = btn.textContent;
  });

  // Category chooser
  window.openCatChooser = () => document.getElementById('catChooser').classList.add('open');
  window.closeCatChooser = () => document.getElementById('catChooser').classList.remove('open');

  // Browser back/forward button support
  window.addEventListener('popstate', function(e) {
    var page = (e.state && e.state.page) ? e.state.page : 'home';
    navigateTo(page, true);
  });
  // Handle initial hash on page load
  if (window.location.hash && window.location.hash.length > 1) {
    var initialPage = window.location.hash.substring(1);
    if (document.getElementById('page-' + initialPage)) {
      navigateTo(initialPage, true);
    }
  }
  // Set initial history state
  history.replaceState({page: currentPage}, '', window.location.hash || '#home');

  // Close account dropdown when clicking outside
  document.addEventListener('click', e => {
    document.querySelectorAll('.account-dropdown.open').forEach(d => {
      if (!d.parentElement.contains(e.target)) d.classList.remove('open');
    });
  });

  // Product card detail toggle - handled inline via onclick
  // Init cart UI on load
  updateCartUI();
  // Restore offers bar state
  try { if(sessionStorage.getItem('helmrx_bar_closed')==='1'){document.getElementById('offersBar').style.display='none';document.getElementById('nav').classList.remove('nav-with-bar');document.querySelectorAll('.page-spacer').forEach(e=>e.classList.remove('page-spacer-bar'));} } catch(e) {}
});

// Dynamic announcement bar per category
function updateOffersBar(pageId) {
  var bar = document.querySelector('.offers-bar-text');
  if (!bar) return;
  var msgs = {
    'cat-hair': 'Hair loss treatments from <strong>₹599/mo</strong> · Regrow in as few as 3–6 months',
    'cat-sexual': '<strong>100% private & online</strong> · ED & PE treatments from ₹62/use · Free doctor consultation',
    'cat-supplements': 'Evidence-based supplements from <strong>₹299/mo</strong> · No prescription needed · Free delivery over ₹999',
    'cat-weight': 'GLP-1 weight loss protocols <strong>launching soon</strong> · Join the waitlist for early access',
    'product-finasteride': 'Finasteride 1mg from <strong>₹599/mo</strong> · Doctor-prescribed · Free consultation',
    'product-tadalafil': 'Tadalafil Daily from <strong>₹899/mo</strong> · Always ready, no planning needed',
    'product-sildenafil': 'Sildenafil from <strong>₹62/use</strong> · Doctor-prescribed · Discreet delivery',
    'product-minoxidil': 'Minoxidil 5% from <strong>₹499/mo</strong> · No prescription needed'
  };
  bar.innerHTML = msgs[pageId] || 'Hair loss treatments from <strong>₹599/mo</strong> · Free doctor consultation included';
}

// Important Safety Information toggles
function toggleSafety(el) {
  var panel = el.nextElementSibling;
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  el.classList.toggle('open');
}


// Scroll to top button
window.addEventListener('scroll', function() {
  var btn = document.getElementById('scrollTop');
  if (btn) btn.classList.toggle('visible', window.scrollY > 600);
}, { passive: true });

// Image fallback
document.addEventListener('error', function(e) {
  if (e.target.tagName === 'IMG' && !e.target.dataset.fallback) {
    e.target.dataset.fallback = '1';
    e.target.style.background = 'linear-gradient(135deg, #f0f4f8, #e2e8f0)';
    e.target.style.minHeight = '120px';
  }
}, true);

// Cookie consent
document.addEventListener('DOMContentLoaded', function() {
  if (!localStorage.getItem('helmrx_cookies')) {
    var cb = document.getElementById('cookieBanner');
    if (cb) cb.style.display = 'block';
  }
});


/* ═══════════════════════════════════════
   SEARCH SYSTEM
   ═══════════════════════════════════════ */
var searchIndex = [
  {name:'Hair Loss Treatments',desc:'Complete guide to clinical hair loss treatment',keywords:'hair loss landing page guide treatment',price:'From ₹599/mo',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 7h8M8 12h8M8 17h4"/></svg>',bg:'#E8F5E9',page:'landing-hair',type:'Guide'},
  {name:'HELM Strand',desc:'Finasteride 1mg · Daily tablet',keywords:'finasteride hair loss balding DHT strand regrow',price:'₹599/mo',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.5 1.5l-8 8a5.66 5.66 0 008 8l8-8a5.66 5.66 0 00-8-8z"/><path d="M6.5 13.5l5-5"/></svg>',bg:'#E8F5E9',page:'product-finasteride',type:'℞ Prescription'},
  {name:'HELM Strand Topical',desc:'Minoxidil 5% · Solution',keywords:'minoxidil topical hair growth regrow strand',price:'₹499/mo',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6M10 3v7.4a2 2 0 01-.6 1.4L4 17.2A2 2 0 005.4 21h13.2a2 2 0 001.4-3.4L14.6 12a2 2 0 01-.6-1.4V3"/></svg>',bg:'#E3F2FD',page:'product-minoxidil',type:'OTC'},
  {name:'HELM Strand Plus',desc:'Dutasteride 0.5mg · Daily tablet',keywords:'dutasteride hair loss stronger strand',price:'₹799/mo',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.5 1.5l-8 8a5.66 5.66 0 008 8l8-8a5.66 5.66 0 00-8-8z"/><path d="M6.5 13.5l5-5"/></svg>',bg:'#E8F5E9',page:'cat-hair',type:'℞ Prescription'},
  {name:'HELM Strand Foam',desc:'Minoxidil 5% · Foam',keywords:'minoxidil foam hair topical',price:'₹499/mo',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6M10 3v7.4a2 2 0 01-.6 1.4L4 17.2A2 2 0 005.4 21h13.2a2 2 0 001.4-3.4L14.6 12a2 2 0 01-.6-1.4V3"/></svg>',bg:'#E3F2FD',page:'cat-hair',type:'OTC'},
  {name:'HELM Strand Duo',desc:'Fin+Min combo spray',keywords:'finasteride minoxidil combo spray hair',price:'₹999/mo',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 15c6.667-6 13.333 0 20-6M9 3.236s6.5.6 8 5.764M15 20.764s-6.5-.6-8-5.764M2 9c6.667 6 13.333 0 20 6"/></svg>',bg:'#F3E5F5',page:'cat-hair',type:'℞ Prescription'},
  {name:'HELM Drive',desc:'Tadalafil 5mg · Daily',keywords:'tadalafil daily ED erectile dysfunction drive cialis',price:'₹899/mo',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',bg:'#FFF3E0',page:'product-tadalafil',type:'℞ Prescription'},
  {name:'HELM Drive Pro',desc:'Tadalafil 10/20mg · On-demand',keywords:'tadalafil on-demand ED erectile cialis drive',price:'₹100/use',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',bg:'#FFF3E0',page:'cat-sexual',type:'℞ Prescription'},
  {name:'HELM Peak',desc:'Sildenafil 50/100mg · On-demand',keywords:'sildenafil viagra ED erectile peak',price:'₹62/use',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',bg:'#FCE4EC',page:'product-sildenafil',type:'℞ Prescription'},
  {name:'HELM Endure',desc:'Dapoxetine 30mg · On-demand',keywords:'dapoxetine premature ejaculation PE endure priligy',price:'₹699/mo',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',bg:'#E8EAF6',page:'cat-sexual',type:'℞ Prescription'},
  {name:'HELM Endure Spray',desc:'Lidocaine 9.6% · Topical spray',keywords:'lidocaine spray delay PE premature',price:'₹499',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6M10 3v7.4a2 2 0 01-.6 1.4L4 17.2A2 2 0 005.4 21h13.2a2 2 0 001.4-3.4L14.6 12a2 2 0 01-.6-1.4V3"/></svg>',bg:'#E8EAF6',page:'cat-sexual',type:'OTC'},
  {name:'HELM D3',desc:'Vitamin D3 · 60,000 IU',keywords:'vitamin d3 supplement sun bone',price:'₹299/mo',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',bg:'#FFF8E1',page:'cat-supplements',type:'Supplement'},
  {name:'HELM B12',desc:'Methylcobalamin · 1500mcg',keywords:'vitamin b12 energy methylcobalamin',price:'₹299/mo',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',bg:'#FFF8E1',page:'cat-supplements',type:'Supplement'},
  {name:'HELM Zinc',desc:'Zinc Picolinate · 25mg',keywords:'zinc immune testosterone hair',price:'₹299/mo',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',bg:'#FFF8E1',page:'cat-supplements',type:'Supplement'},
  {name:'HELM Lean',desc:'Oral Semaglutide (coming soon)',keywords:'semaglutide GLP-1 weight loss lean ozempic wegovy',price:'From ₹4,499/mo',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v17M5 8l7-5 7 5"/><path d="M3 13l2-5h0l2 5a3 3 0 01-4 0zM17 13l2-5h0l2 5a3 3 0 01-4 0z"/></svg>',bg:'#F3E5F5',page:'cat-weight',type:'Coming Soon'},
  {name:'Hair Loss Treatment',desc:'Browse all hair loss products',keywords:'hair loss balding thinning receding',price:'From ₹499/mo',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></svg>',bg:'var(--cream)',page:'cat-hair',type:'Category'},
  {name:'Sexual Wellness',desc:'ED & PE treatments',keywords:'erectile dysfunction premature ejaculation sexual performance',price:'From ₹62/use',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></svg>',bg:'var(--cream)',page:'cat-sexual',type:'Category'},
  {name:'Supplements',desc:'Evidence-based vitamins & minerals',keywords:'vitamin supplement energy sleep',price:'From ₹299/mo',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></svg>',bg:'var(--cream)',page:'cat-supplements',type:'Category'},
];

function toggleSearch(){
  var overlay = document.getElementById('searchOverlay');
  overlay.classList.toggle('open');
  if(overlay.classList.contains('open')){
    setTimeout(function(){document.getElementById('searchInput').focus()},100);
  }
}
function closeSearch(){
  document.getElementById('searchOverlay').classList.remove('open');
  document.getElementById('searchInput').value='';
  document.getElementById('searchResults').innerHTML='';
  document.getElementById('searchPopular').style.display='';
}
function doSearch(q){
  document.getElementById('searchInput').value=q;
  handleSearch(q);
}
function handleSearch(q){
  var results = document.getElementById('searchResults');
  var popular = document.getElementById('searchPopular');
  q = q.toLowerCase().trim();
  if(!q){results.innerHTML='';popular.style.display='';return;}
  popular.style.display='none';
  var matches = searchIndex.filter(function(item){
    var haystack = (item.name + ' ' + item.desc + ' ' + item.keywords).toLowerCase();
    if (haystack.includes(q)) return true;
    // Fuzzy: check if all query words match (2+ chars) with partial match
    var words = q.split(/\s+/).filter(function(w){return w.length>=2;});
    if (words.length === 0) return haystack.includes(q);
    return words.every(function(w) {
      if (haystack.includes(w)) return true;
      // Simple typo tolerance: check if any word in haystack starts similarly
      return haystack.split(/\s+/).some(function(hw) {
        if (hw.length < 3 || w.length < 3) return false;
        var matches = 0;
        for (var i = 0; i < Math.min(w.length, hw.length); i++) { if (w[i] === hw[i]) matches++; }
        return matches >= w.length * 0.6;
      });
    });
  });
  if(matches.length===0){
    results.innerHTML='<div class="search-no-results">No results for "'+q+'"<br><br>Try searching for a treatment name, condition, or ingredient.<br><a style="color:var(--teal);cursor:pointer" onclick="closeSearch();openCatChooser()">Browse all categories →</a></div>';
    return;
  }
  results.innerHTML=matches.map(function(m){
    return '<div class="search-result-item" onclick="closeSearch();navigateTo(\''+m.page+'\')">'+
      '<div class="search-result-icon" style="background:'+m.bg+'">'+m.icon+'</div>'+
      '<div class="search-result-info"><div class="search-result-name">'+m.name+'</div><div class="search-result-meta">'+m.desc+' · '+m.type+'</div></div>'+
      '<div class="search-result-price">'+m.price+'</div>'+
    '</div>';
  }).join('');
}
// Keyboard shortcut
document.addEventListener('keydown',function(e){
  if(e.key==='/' && !e.target.matches('input,textarea,select')){e.preventDefault();toggleSearch();}
  if(e.key==='Escape')closeSearch();
});

/* Breadcrumbs */
var breadcrumbMap = {
  'cat-hair':['Regrow','Hair Loss Treatment'],
  'cat-sexual':['Perform','Sexual Wellness'],
  'cat-supplements':['Feel Better','Supplements'],
  'cat-weight':['Lose Weight','Weight Management'],
  'product-finasteride':['Regrow','cat-hair','Finasteride 1mg'],
  'product-minoxidil':['Regrow','cat-hair','Minoxidil 5%'],
  'product-tadalafil':['Perform','cat-sexual','Tadalafil Daily'],
  'product-sildenafil':['Perform','cat-sexual','Sildenafil'],
  'checkout':['Checkout'],
  'blog':['The HelmRx Journal'],
  'doctors':['Our Doctors'],
  'about':['About HelmRx'],
  'privacy':['Privacy Policy'],
  'terms':['Terms of Service'],
  'help':['Help Centre'],
  'account':['My Account'],
  'orders':['My Orders'],
  'subscriptions':['My Subscriptions'],
};
function renderBreadcrumb(page){
  // Remove existing breadcrumbs
  document.querySelectorAll('.breadcrumb-auto').forEach(function(el){el.remove();});
  var map = breadcrumbMap[page];
  if(!map) return;
  var pageEl = document.getElementById('page-'+page);
  if(!pageEl) return;
  var spacer = pageEl.querySelector('.page-spacer');
  if(!spacer) return;
  var bc = document.createElement('nav');
  bc.className = 'breadcrumb-auto breadcrumb';
  bc.setAttribute('aria-label','Breadcrumb');
  bc.style.cssText = 'max-width:1100px;margin:0 auto;padding:8px 24px';
  var crumbs = '<a onclick="navigateTo(\'home\')">Home</a><span class="bc-sep">›</span>';
  if(map.length===3){
    // Product page: Home > Category > Product
    crumbs += '<a onclick="navigateTo(\''+map[1]+'\')">'+map[0]+'</a><span class="bc-sep">›</span><span class="bc-current">'+map[2]+'</span>';
  } else if(map.length===2){
    // Category: Home > Category
    crumbs += '<span class="bc-current">'+map[1]+'</span>';
  } else {
    crumbs += '<span class="bc-current">'+map[0]+'</span>';
  }
  bc.innerHTML = crumbs;
  spacer.after(bc);
}

/* Buy Now — adds to cart and goes straight to checkout */
function buyNow(sku, name, price, type, period) {
  addToCart(sku, name, price, type, period);
  navigateTo('checkout');
}

/* Guest checkout */
function guestCheckout() {
  // Create a temporary guest session
  var guestEmail = 'guest_' + Date.now() + '@helmrx.temp';
  var users = getUsers();
  users.push({name:'Guest',phone:'',email:guestEmail,password:'',orders:[],subscriptions:[],addresses:[],isGuest:true});
  saveUsers(users);
  setSession(guestEmail);
  checkoutStep(3);
  showToast('Continuing as guest. You can create an account later.');
}

/* ═══════════════════════════════════════
   WISHLIST
   ═══════════════════════════════════════ */
var wishlist;
try { wishlist = JSON.parse(localStorage.getItem('helmrx_wishlist') || '[]'); } catch(e) { wishlist = []; }

function toggleWishlist(sku, name) {
  var idx = wishlist.indexOf(sku);
  if (idx >= 0) {
    wishlist.splice(idx, 1);
    showToast('Removed from wishlist');
  } else {
    wishlist.push(sku);
    showToast('Added to wishlist: ' + name);
  }
  try { localStorage.setItem('helmrx_wishlist', JSON.stringify(wishlist)); } catch(e) {}
  updateWishlistIcons();
}

function isWishlisted(sku) { return wishlist.indexOf(sku) >= 0; }

function updateWishlistIcons() {
  document.querySelectorAll('[data-wishlist]').forEach(function(el) {
    var sku = el.getAttribute('data-wishlist');
    el.classList.toggle('wishlisted', isWishlisted(sku));
  });
}

/* Recently Viewed */
var recentlyViewed;
try { recentlyViewed = JSON.parse(localStorage.getItem('helmrx_recent') || '[]'); } catch(e) { recentlyViewed = []; }

function trackView(page) {
  var productPages = ['product-finasteride','product-minoxidil','product-tadalafil','product-sildenafil','cat-hair','cat-sexual','cat-supplements','cat-weight'];
  if (productPages.indexOf(page) < 0) return;
  recentlyViewed = recentlyViewed.filter(function(p){ return p !== page; });
  recentlyViewed.unshift(page);
  if (recentlyViewed.length > 6) recentlyViewed = recentlyViewed.slice(0, 6);
  try { localStorage.setItem('helmrx_recent', JSON.stringify(recentlyViewed)); } catch(e) {}
}

/* Exit Intent */
var exitShown = false;
document.addEventListener('mouseout', function(e) {
  if (exitShown) return;
  if (e.clientY < 5 && !e.relatedTarget) {
    // Only show if on home/category page and hasn't been shown
    if (currentPage === 'home' || currentPage.startsWith('cat-')) {
      if (!sessionStorage.getItem('helmrx_exit_shown')) {
        document.getElementById('exitIntent').classList.add('show');
        sessionStorage.setItem('helmrx_exit_shown', '1');
        exitShown = true;
      }
    }
  }
});
function closeExitIntent() {
  document.getElementById('exitIntent').classList.remove('show');
}

/* Analytics event tracking */
function trackEvent(eventName, params) {
  // GA4
  if (typeof gtag === 'function') {
    gtag('event', eventName, params || {});
  }
  // Meta Pixel
  if (typeof fbq === 'function') {
    fbq('trackCustom', eventName, params || {});
  }
}

/* Sticky mobile CTA */
window.addEventListener('scroll', function() {
  var sticky = document.getElementById('stickyCta');
  if (!sticky) return;
  var show = window.scrollY > 400 && (currentPage === 'home' || currentPage.startsWith('cat-'));
  sticky.classList.toggle('visible', show && window.innerWidth <= 768);
}, { passive: true });

/* Category Filtering */

/* ED/PE condition toggle on sexual wellness page */
function showCondition(type, clickedCard) {
  var edSection = document.getElementById('sw-ed-section');
  var peSection = document.getElementById('sw-pe-section');
  if (!edSection || !peSection) return;
  
  // Toggle product sections
  if (type === 'ed') {
    edSection.style.display = '';
    peSection.style.display = 'none';
  } else {
    edSection.style.display = 'none';
    peSection.style.display = '';
  }
  
  // Toggle educational/compare/blog sections
  document.querySelectorAll('.sw-ed-content').forEach(function(el) { el.style.display = type === 'ed' ? '' : 'none'; });
  document.querySelectorAll('.sw-pe-content').forEach(function(el) { el.style.display = type === 'pe' ? '' : 'none'; });
  
  // Update card styles
  document.querySelectorAll('.condition-chooser .condition-card').forEach(function(card) {
    card.classList.remove('condition-active');
    card.style.borderColor = 'var(--border)';
  });
  clickedCard.classList.add('condition-active');
  clickedCard.style.borderColor = 'var(--teal)';
}

function filterProducts(chip, filter) {
  chip.closest('.cat-filter-bar').querySelectorAll('.filter-chip').forEach(function(c){c.classList.remove('active');});
  chip.classList.add('active');
  var grid = chip.closest('.cat-filter-bar').nextElementSibling;
  if (!grid) grid = chip.closest('section').querySelector('.product-grid');
  if (!grid) return;
  grid.querySelectorAll('.product-card, [style*="grid-column"]').forEach(function(card) {
    if (filter === 'all') { card.style.display = ''; return; }
    var text = card.textContent.toLowerCase();
    var show = false;
    if (filter === 'daily' && (text.includes('daily') || text.includes('take daily'))) show = true;
    if (filter === 'as-needed' && (text.includes('on-demand') || text.includes('as-needed') || text.includes('before activity'))) show = true;
    if (filter === 'otc' && (text.includes('otc') || text.includes('supplement') || text.includes('no rx'))) show = true;
    if (filter === 'pe' && (text.includes('premature') || text.includes('dapoxetine') || text.includes('endure'))) show = true;
    if (filter === 'tablet' && (text.includes('tablet') || text.includes('oral') || text.includes('chew'))) show = true;
    if (filter === 'topical' && (text.includes('topical') || text.includes('solution') || text.includes('foam') || text.includes('spray') || text.includes('shampoo'))) show = true;
    if (filter === 'support' && (text.includes('support') || text.includes('supplement') || text.includes('gummy') || text.includes('biotin'))) show = true;
    if (filter === 'energy' && (text.includes('b12') || text.includes('energy') || text.includes('omega') || text.includes('d3'))) show = true;
    if (filter === 'bone' && (text.includes('d3') || text.includes('zinc') || text.includes('magnesium') || text.includes('bone') || text.includes('immune'))) show = true;
    if (filter === 'bundle' && (text.includes('bundle') || text.includes('foundation') || text.includes('combo'))) show = true;
    card.style.display = show ? '' : 'none';
  });
}

/* Sorting */
function sortProducts(sel) {
  var grid = sel.closest('section').querySelector('.product-grid');
  if (!grid) return;
  var cards = Array.from(grid.querySelectorAll('.product-card'));
  if (cards.length === 0) return;
  var val = sel.value;
  cards.sort(function(a, b) {
    if (val === 'price-low' || val === 'price-high') {
      var pa = parseInt((a.textContent.match(/₹([\d,]+)/) || ['','9999'])[1].replace(/,/g,''));
      var pb = parseInt((b.textContent.match(/₹([\d,]+)/) || ['','9999'])[1].replace(/,/g,''));
      return val === 'price-low' ? pa - pb : pb - pa;
    }
    if (val === 'name') return a.querySelector('h4').textContent.localeCompare(b.querySelector('h4').textContent);
    return 0; // popular = original order
  });
  cards.forEach(function(c) { grid.appendChild(c); });
}

/* Dosage selector */
function selectDosage(btn, dose, price) {
  btn.closest('.dosage-selector').querySelectorAll('.dosage-btn').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  // Update the nearby price display if exists
  var card = btn.closest('.product-card') || btn.closest('.pp-card') || btn.closest('section');
  if (card) {
    var priceEl = card.querySelector('.price-main, .pp-price-main');
    if (priceEl) priceEl.textContent = '₹' + price;
  }
}

/* Reviews */
var reviewStars = 0;
function setStars(n) {
  reviewStars = n;
  document.querySelectorAll('#starInput span').forEach(function(s, i) {
    s.textContent = i < n ? '★' : '☆';
    s.classList.toggle('filled', i < n);
  });
}
function submitReview() {
  var text = document.getElementById('reviewText').value.trim();
  if (!reviewStars) { showToast('Please select a star rating.', 'error'); return; }
  if (!text || text.length < 10) { showToast('Please write at least a sentence.', 'error'); return; }
  showToast('Thank you! Your review has been submitted for moderation.');
  document.getElementById('reviewText').value = '';
  setStars(0);
}

/* PIN Code Lookup */
var pinDb = {
  '110': {city:'New Delhi',state:'Delhi',days:2},
  '400': {city:'Mumbai',state:'Maharashtra',days:2},
  '560': {city:'Bangalore',state:'Karnataka',days:2},
  '500': {city:'Hyderabad',state:'Telangana',days:3},
  '600': {city:'Chennai',state:'Tamil Nadu',days:3},
  '700': {city:'Kolkata',state:'West Bengal',days:3},
  '411': {city:'Pune',state:'Maharashtra',days:3},
  '380': {city:'Ahmedabad',state:'Gujarat',days:3},
  '302': {city:'Jaipur',state:'Rajasthan',days:4},
  '226': {city:'Lucknow',state:'Uttar Pradesh',days:4},
  '462': {city:'Bhopal',state:'Madhya Pradesh',days:4},
  '160': {city:'Chandigarh',state:'Chandigarh',days:3},
  '201': {city:'Noida',state:'Uttar Pradesh',days:2},
  '122': {city:'Gurgaon',state:'Haryana',days:2},
  '641': {city:'Coimbatore',state:'Tamil Nadu',days:4},
};
function lookupPin() {
  var pin = document.getElementById('shipPin').value.trim();
  if (pin.length < 3) return;
  var prefix = pin.substring(0, 3);
  var match = pinDb[prefix];
  var cityEl = document.getElementById('shipCity');
  var stateEl = document.getElementById('shipState');
  var pinMsg = document.getElementById('pinLookupMsg');
  if (match) {
    if (cityEl && !cityEl.value) cityEl.value = match.city;
    if (stateEl) {
      for (var i = 0; i < stateEl.options.length; i++) {
        if (stateEl.options[i].text === match.state || stateEl.options[i].value === match.state) {
          stateEl.selectedIndex = i; break;
        }
      }
    }
    if (pinMsg) { pinMsg.textContent = '✓ Delivers to ' + match.city + ' in ' + match.days + '–' + (match.days+1) + ' business days'; pinMsg.style.color = 'var(--teal)'; }
  } else if (pin.length === 6) {
    if (pinMsg) { pinMsg.textContent = '✓ Delivery available · Estimated 4–6 business days'; pinMsg.style.color = 'var(--teal)'; }
  }
}

/* Submit return */
function submitReturn() {
  var orderId = document.getElementById('returnOrderId').value.trim();
  var reason = document.getElementById('returnReason').value;
  var details = document.getElementById('returnDetails').value.trim();
  if (!orderId || !reason) { showToast('Please fill in order ID and reason.', 'error'); return; }
  submitToFormspree(CFG.formConsult, {
    _subject: 'Return Request — ' + orderId,
    order_id: orderId, reason: reason, details: details,
    email: getCurrentUser() ? getCurrentUser().email : 'unknown',
  }, function() {
    showToast('Return request submitted! We will respond within 24 hours.');
    document.getElementById('returnOrderId').value = '';
    document.getElementById('returnReason').value = '';
    document.getElementById('returnDetails').value = '';
  });
}

/* Scarcity + social proof indicators */
/* Scarcity indicators removed — undermines clinical positioning */


/* Out of stock + Notify me */
var oosProducts = ['HL-LEAN']; // HELM Lean is not yet available
function markOOS(sku, cardEl) {
  if (!cardEl) return;
  var btn = cardEl.querySelector('.btn-cart, .btn-primary');
  if (btn) {
    btn.textContent = 'Notify me when available';
    btn.className = 'btn btn-outline btn-sm';
    btn.onclick = function() {
      var email = prompt('Enter your email and we\'ll notify you when this is available:');
      if (email && isValidEmail(email)) {
        submitToFormspree(CFG.formWaitlist, {_subject:'Notify Me — '+sku, email: email, product: sku}, function(){
          showToast('We\'ll notify you at ' + email + ' when available!');
        });
      }
    };
  }
  var stockBadge = cardEl.querySelector('.stock-badge');
  if (stockBadge) {
    stockBadge.textContent = 'Coming Soon';
    stockBadge.className = 'stock-badge stock-out';
  }
}

/* Loyalty Points */
function getLoyaltyPoints() {
  var user = getCurrentUser();
  if (!user) return 0;
  var points = 0;
  (user.orders || []).forEach(function(o) { points += Math.floor(o.total / 10); });
  return points;
}
function renderLoyaltyBadge() {
  var user = getCurrentUser();
  if (!user) return;
  var points = getLoyaltyPoints();
  var tier = points < 500 ? 'Bronze' : points < 1500 ? 'Silver' : 'Gold';
  var tierColor = points < 500 ? '#CD7F32' : points < 1500 ? '#C0C0C0' : '#FFD700';
  var badge = document.getElementById('loyaltyBadge');
  if (badge) {
    badge.innerHTML = '<span style="color:' + tierColor + ';font-weight:700">' + tier + '</span> · ' + points + ' pts';
    badge.style.display = 'flex';
  }
}

/* Referral Program */
function getReferralCode() {
  var user = getCurrentUser();
  if (!user) return '';
  return 'HELM' + user.email.split('@')[0].toUpperCase().substring(0,6).replace(/[^A-Z0-9]/g,'');
}
function showReferral() {
  var user = getCurrentUser();
  if (!user) { showToast('Please sign in to get your referral code.', 'error'); return; }
  var code = getReferralCode();
  var msg = 'Your referral code: ' + code + '\n\nShare this link:\nhttps://helmrx.in/?ref=' + code + '\n\nBoth you and your friend get ₹200 off your next order!';
  if (navigator.share) {
    navigator.share({title:'Join HelmRx',text:'Get ₹200 off doctor-prescribed men\'s health treatments',url:'https://helmrx.in/?ref='+code});
  } else {
    navigator.clipboard.writeText('https://helmrx.in/?ref=' + code);
    showToast('Referral link copied! Share it to earn ₹200 off.');
  }
}

/* Support ticket */
function submitTicket() {
  var name = document.getElementById('ticketName').value.trim();
  var email = document.getElementById('ticketEmail').value.trim();
  var cat = document.getElementById('ticketCategory').value;
  var msg = document.getElementById('ticketMsg').value.trim();
  if (!name || !email || !cat || !msg) { showToast('Please fill in all fields.', 'error'); return; }
  submitToFormspree(CFG.formConsult, {
    _subject: 'Support Ticket — ' + cat,
    name: name, email: email, category: cat, message: msg,
  }, function() {
    showToast('Ticket submitted! We\'ll respond within 4 hours.');
    document.getElementById('ticketForm').style.display = 'none';
    document.getElementById('ticketName').value = '';
    document.getElementById('ticketEmail').value = '';
    document.getElementById('ticketMsg').value = '';
  });
}

/* Saved payment display */
function renderSavedPayment() {
  var user = getCurrentUser();
  if (!user || !user.orders || user.orders.length === 0) return;
  var lastOrder = user.orders[0];
  if (!lastOrder.paymentId) return;
  var el = document.getElementById('savedPaymentInfo');
  if (el) {
    el.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--cream);border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg><div style="flex:1"><div style="font-size:.82rem;font-weight:600">Payment method on file</div><div style="font-size:.75rem;color:var(--text-muted)">Last used: ' + new Date(lastOrder.date).toLocaleDateString('en-IN') + '</div></div><span style="font-size:.75rem;color:var(--teal);cursor:pointer" onclick="showToast(\'Razorpay securely stores your payment details.\')">Manage</span></div>';
    el.style.display = '';
  }
}

/* Dosage option selector (product detail pages) */
function selectDosageOption(el, label) {
  el.closest('.dosage-selector').querySelectorAll('.dosage-option').forEach(function(o){o.classList.remove('selected');});
  el.classList.add('selected');
  // Update the price display
  var priceEl = el.closest('.dosage-selector').parentElement.querySelector('.pp-price');
  var newPrice = el.querySelector('.dose-price');
  if (priceEl && newPrice) {
    priceEl.textContent = newPrice.textContent;
  }
  // Visual feedback
  showToast(label + ' selected');
}

/* PIN Code Lookup */
function checkPinCode() {
  var pin = document.getElementById('shipPin').value.trim();
  var resultEl = document.getElementById('pinResult');
  if (!resultEl) {
    resultEl = document.createElement('div');
    resultEl.id = 'pinResult';
    resultEl.className = 'pin-result';
    document.getElementById('shipPin').parentNode.appendChild(resultEl);
  }
  if (!/^\d{6}$/.test(pin)) {
    resultEl.className = 'pin-result pin-result--error';
    resultEl.textContent = 'Enter a valid 6-digit PIN code';
    return;
  }
  // Estimate delivery based on PIN prefix (metro vs tier-2 vs other)
  var prefix = pin.substring(0, 2);
  var metros = ['11','40','56','50','60','70','41','38','30','36','22','42','39','44']; // Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Kolkata, Pune
  var tier2 = ['14','34','46','37','48','45','35','33','32','43','47','49','31','25','23','26','15','13','12','20','16','17','18','24','52','51','28','27'];
  var days, label;
  if (metros.indexOf(prefix) >= 0) {
    days = '2–3'; label = 'Metro city';
  } else if (tier2.indexOf(prefix) >= 0) {
    days = '3–4'; label = 'Tier-2 city';
  } else {
    days = '4–6'; label = 'Your area';
  }
  var estDate = new Date(Date.now() + parseInt(days) * 24*60*60*1000).toLocaleDateString('en-IN',{day:'numeric',month:'short'});
  resultEl.className = 'pin-result pin-result--success';
  resultEl.textContent = '\u2713 ' + label + ' \u00B7 Estimated delivery: ' + days + ' business days (by ' + estDate + ')';
}

/* Cart-aware cross-sell on confirmation page */
function renderCrossSell(purchasedSkus) {
  var crossSellEl = document.getElementById('confirmCrossSell');
  if (!crossSellEl) return;
  var cartSkus = purchasedSkus || cart.map(function(i){return i.sku;});
  var suggestions = [
    {sku:'SP-01',name:'HELM D3',price:299,desc:'61–70% of Indians are D3 deficient',type:'supp',unit:'month'},
    {sku:'SP-03',name:'HELM Zinc',price:299,desc:'Supports hair, immunity, testosterone',type:'supp',unit:'month'},
    {sku:'SP-02',name:'HELM B12',price:299,desc:'Bioactive methylcobalamin for energy',type:'supp',unit:'month'},
    {sku:'SP-04',name:'HELM Mag',price:349,desc:'Glycinate form for sleep + recovery',type:'supp',unit:'month'}
  ].filter(function(s){return cartSkus.indexOf(s.sku) < 0;}).slice(0,2);
  if (suggestions.length === 0) { crossSellEl.style.display='none'; return; }
  var h = '<h3 class="h4" style="margin-bottom:12px;color:var(--navy)">Complete your protocol</h3><p style="font-size:.88rem;color:var(--text-muted);margin-bottom:16px">Men who combine treatments see better results. Consider adding:</p><div style="display:flex;flex-direction:column;gap:8px">';
  suggestions.forEach(function(s){
    h += '<div class="cross-sell-card"><div><strong style="font-size:.88rem">'+s.name+'</strong><br><span style="font-size:.78rem;color:var(--text-muted)">'+s.desc+'</span></div><button class="btn btn-cart btn-sm" onclick="addToCart(\''+s.sku+'\',\''+s.name+'\','+s.price+',\''+s.type+'\',\''+s.unit+'\')">+ ₹'+s.price+'/mo</button></div>';
  });
  h += '</div>';
  crossSellEl.innerHTML = h;
}

/* Return initiation */
function initiateReturn(orderId) {
  var msg = 'Hi HelmRx, I would like to initiate a return for order ' + orderId + '. Please guide me through the process.';
  window.open('https://wa.me/' + CFG.wa + '?text=' + encodeURIComponent(msg), '_blank');
  showToast('Opening WhatsApp to process your return...');
}

/* Keyboard navigation for product cards */
document.addEventListener('keydown', function(e) {
  // Tab trap for modals
  if (e.key === 'Escape') {
    closeMobile();
    if (document.getElementById('cartDrawer').classList.contains('open')) toggleCart();
    if (document.getElementById('catChooser').classList.contains('open')) closeCatChooser();
  }
});

/* ═══════════════════════════════════════
   PRODUCT GRID → CAROUSEL CONVERSION
   ═══════════════════════════════════════ */
(function initProductCarousels() {
  var catPages = ['page-cat-hair', 'page-cat-sexual', 'page-cat-supplements'];
  catPages.forEach(function(pid) {
    var page = document.getElementById(pid);
    if (!page) return;
    var grids = page.querySelectorAll('.product-grid');
    grids.forEach(function(grid) {
      // Skip grids with only 1 card
      var cards = grid.querySelectorAll('.product-card');
      if (cards.length < 2) return;
      
      // Check for inline sub-headers (grid-column divs)
      var subHeaders = grid.querySelectorAll('[style*="grid-column"]');
      if (subHeaders.length > 0) {
        // Split grid at sub-headers: create separate scroll sections
        convertGridWithSubHeaders(grid);
      } else {
        // Clean grid — just wrap in scroll container
        wrapInCarousel(grid);
      }
    });
  });
  
  function wrapInCarousel(grid) {
    var wrap = document.createElement('div');
    wrap.className = 'product-scroll-wrap';
    grid.parentNode.insertBefore(wrap, grid);
    wrap.appendChild(grid);
    
    // Add arrows
    var leftArr = document.createElement('button');
    leftArr.className = 'product-scroll-arrow left';
    leftArr.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    leftArr.onclick = function() { grid.scrollBy({ left: -340, behavior: 'smooth' }); };
    
    var rightArr = document.createElement('button');
    rightArr.className = 'product-scroll-arrow right';
    rightArr.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    rightArr.onclick = function() { grid.scrollBy({ left: 340, behavior: 'smooth' }); };
    
    wrap.appendChild(leftArr);
    wrap.appendChild(rightArr);
    
    // Hide/show arrows based on scroll position
    function updateArrows() {
      leftArr.style.display = grid.scrollLeft > 20 ? '' : 'none';
      rightArr.style.display = grid.scrollLeft < grid.scrollWidth - grid.clientWidth - 20 ? '' : 'none';
    }
    grid.addEventListener('scroll', updateArrows);
    // Defer initial check so layout is resolved
    setTimeout(updateArrows, 500);
  }
  
  function convertGridWithSubHeaders(grid) {
    // Collect children, split at sub-header boundaries
    var children = Array.from(grid.children);
    var sections = [];
    var currentCards = [];
    
    children.forEach(function(child) {
      if (child.style && child.style.gridColumn) {
        // This is a sub-header — flush current cards as a section, then start new section
        if (currentCards.length > 0) {
          sections.push({ header: null, cards: currentCards });
          currentCards = [];
        }
        sections.push({ header: child, cards: [] });
      } else if (child.classList && child.classList.contains('product-card')) {
        currentCards.push(child);
      } else {
        currentCards.push(child);
      }
    });
    if (currentCards.length > 0) {
      sections.push({ header: null, cards: currentCards });
    }
    
    // Build replacement structure
    var parent = grid.parentNode;
    var fragment = document.createDocumentFragment();
    
    sections.forEach(function(sec) {
      if (sec.header) {
        // Sub-header — place outside carousel
        sec.header.style.gridColumn = '';
        sec.header.style.marginBottom = '16px';
        sec.header.style.marginTop = '24px';
        fragment.appendChild(sec.header);
      }
      if (sec.cards.length > 0) {
        var newGrid = document.createElement('div');
        newGrid.className = 'product-grid';
        sec.cards.forEach(function(c) { newGrid.appendChild(c); });
        if (sec.cards.length >= 2) {
          var wrap = document.createElement('div');
          wrap.className = 'product-scroll-wrap';
          wrap.appendChild(newGrid);
          addArrows(wrap, newGrid);
          fragment.appendChild(wrap);
        } else {
          fragment.appendChild(newGrid);
        }
      }
    });
    
    parent.replaceChild(fragment, grid);
  }
  
  function addArrows(wrap, grid) {
    var leftArr = document.createElement('button');
    leftArr.className = 'product-scroll-arrow left';
    leftArr.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    leftArr.onclick = function() { grid.scrollBy({ left: -340, behavior: 'smooth' }); };
    
    var rightArr = document.createElement('button');
    rightArr.className = 'product-scroll-arrow right';
    rightArr.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    rightArr.onclick = function() { grid.scrollBy({ left: 340, behavior: 'smooth' }); };
    
    wrap.appendChild(leftArr);
    wrap.appendChild(rightArr);
    
    function updateArrows() {
      leftArr.style.display = grid.scrollLeft > 20 ? '' : 'none';
      rightArr.style.display = grid.scrollLeft < grid.scrollWidth - grid.clientWidth - 20 ? '' : 'none';
    }
    grid.addEventListener('scroll', updateArrows);
    setTimeout(updateArrows, 500);
  }
})();

/* ═══════════════════════════════════════
   INFINITE LOOPING CAROUSEL
   Arrows + Dots + Auto-rotation + Clone-based infinite loop
   ═══════════════════════════════════════ */
(function() {
  var AUTO_INTERVAL = 3500;
  var PAUSE_ON_INTERACT = 6000;

  function initInfiniteCarousels() {
    document.querySelectorAll('.product-carousel').forEach(function(carousel) {
      if (carousel.dataset.loopInit) return;
      carousel.dataset.loopInit = '1';

      var track = carousel.querySelector('.carousel-track');
      if (!track) return;
      var origItems = Array.from(track.querySelectorAll('.carousel-item'));
      var itemCount = origItems.length;
      if (itemCount < 2) return;

      /* ── 1. Clone items for infinite illusion ── */
      var gap = 20;
      origItems.forEach(function(item) {
        var clone = item.cloneNode(true);
        clone.classList.add('carousel-clone');
        clone.removeAttribute('onclick');
        // Re-attach click handlers from original
        var origOnclick = item.getAttribute('onclick');
        if (origOnclick) clone.setAttribute('onclick', origOnclick);
        track.appendChild(clone);
      });
      // Also prepend clones for backward loop
      for (var p = itemCount - 1; p >= 0; p--) {
        var preclone = origItems[p].cloneNode(true);
        preclone.classList.add('carousel-clone', 'carousel-clone-pre');
        var origOC = origItems[p].getAttribute('onclick');
        if (origOC) preclone.setAttribute('onclick', origOC);
        track.insertBefore(preclone, track.firstChild);
      }

      // After cloning: track has [clones_pre(N)] [originals(N)] [clones_post(N)]
      // We need to start scrolled to the original items
      var itemW = origItems[0].offsetWidth + gap;
      var originStart = itemCount * itemW; // scroll position of first original item
      carousel.scrollLeft = originStart;

      /* ── 2. Wrap in carousel-wrapper ── */
      var wrapper;
      if (carousel.parentElement.classList.contains('carousel-wrapper')) {
        wrapper = carousel.parentElement;
      } else {
        wrapper = document.createElement('div');
        wrapper.className = 'carousel-wrapper';
        carousel.parentNode.insertBefore(wrapper, carousel);
        wrapper.appendChild(carousel);
      }

      /* ── 3. Arrow buttons ── */
      var prevBtn = document.createElement('button');
      prevBtn.className = 'carousel-nav carousel-prev';
      prevBtn.innerHTML = '‹';
      prevBtn.setAttribute('aria-label', 'Previous');
      var nextBtn = document.createElement('button');
      nextBtn.className = 'carousel-nav carousel-next';
      nextBtn.innerHTML = '›';
      nextBtn.setAttribute('aria-label', 'Next');
      wrapper.appendChild(prevBtn);
      wrapper.appendChild(nextBtn);

      /* ── 4. Dot indicators (based on original items only) ── */
      var dotsContainer = document.createElement('div');
      dotsContainer.className = 'carousel-dots';
      for (var d = 0; d < itemCount; d++) {
        var dot = document.createElement('button');
        dot.className = 'carousel-dot' + (d === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Slide ' + (d + 1));
        dot.dataset.index = d;
        dotsContainer.appendChild(dot);
      }
      wrapper.appendChild(dotsContainer);

      /* ── 5. Infinite loop boundary check ── */
      var isJumping = false;
      function checkBounds() {
        if (isJumping) return;
        var origTotalW = itemCount * itemW;
        // If scrolled past all originals into post-clones, jump back
        if (carousel.scrollLeft >= originStart + origTotalW) {
          isJumping = true;
          carousel.style.scrollBehavior = 'auto';
          carousel.scrollLeft = carousel.scrollLeft - origTotalW;
          carousel.style.scrollBehavior = '';
          isJumping = false;
        }
        // If scrolled before originals into pre-clones
        if (carousel.scrollLeft < originStart - origTotalW + itemW) {
          isJumping = true;
          carousel.style.scrollBehavior = 'auto';
          carousel.scrollLeft = carousel.scrollLeft + origTotalW;
          carousel.style.scrollBehavior = '';
          isJumping = false;
        }
      }

      /* ── 6. Update dots based on position ── */
      function updateDots() {
        var relScroll = ((carousel.scrollLeft - originStart) % (itemCount * itemW) + (itemCount * itemW)) % (itemCount * itemW);
        var activeIdx = Math.round(relScroll / itemW) % itemCount;
        dotsContainer.querySelectorAll('.carousel-dot').forEach(function(dd, idx) {
          dd.classList.toggle('active', idx === activeIdx);
        });
      }

      carousel.addEventListener('scroll', function() {
        checkBounds();
        updateDots();
      }, { passive: true });

      /* ── 7. Arrow click handlers ── */
      prevBtn.addEventListener('click', function() {
        carousel.scrollBy({ left: -itemW, behavior: 'smooth' });
      });
      nextBtn.addEventListener('click', function() {
        carousel.scrollBy({ left: itemW, behavior: 'smooth' });
      });

      /* ── 8. Dot click → scroll to item ── */
      dotsContainer.addEventListener('click', function(e) {
        var dotEl = e.target.closest('.carousel-dot');
        if (!dotEl) return;
        var idx = parseInt(dotEl.dataset.index);
        carousel.scrollTo({ left: originStart + idx * itemW, behavior: 'smooth' });
      });

      /* ── 9. Auto-rotation ── */
      var timer = null, pauseTimer = null;
      function scrollNext() {
        if (!carousel.offsetParent) return;
        carousel.scrollBy({ left: itemW, behavior: 'smooth' });
      }
      function startAuto() { stopAuto(); timer = setInterval(scrollNext, AUTO_INTERVAL); }
      function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }
      function pauseAndResume() {
        stopAuto();
        clearTimeout(pauseTimer);
        pauseTimer = setTimeout(startAuto, PAUSE_ON_INTERACT);
      }
      carousel.addEventListener('mouseenter', stopAuto);
      carousel.addEventListener('mouseleave', pauseAndResume);
      carousel.addEventListener('touchstart', pauseAndResume, { passive: true });

      setTimeout(startAuto, 2500);
    });
  }

  function run() { setTimeout(initInfiniteCarousels, 800); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else { run(); }
})();


/* ═══════════════════════════════════════════════════════════════
   MOBILE-SPECIFIC BEHAVIORS
   Only runs on mobile (≤768px). Handles:
   - Bottom nav bar show/hide & active state
   - Footer accordion
   - Bottom nav badge sync
   - Sticky product CTA on product pages
   ═══════════════════════════════════════════════════════════════ */
(function() {
  var isMobile = window.matchMedia('(max-width:768px)');
  if (!isMobile.matches) return;

  /* ── 1. Show bottom nav ── */
  var bottomNav = document.getElementById('mobileBottomNav');
  if (bottomNav) bottomNav.style.display = 'flex';

  /* ── 2. Bottom nav active state tracking ── */
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
    // Hide bottom nav on quiz/checkout/confirm pages
    if (bottomNav) {
      var hidePages = page.startsWith('quiz-') || page === 'confirm' || page === 'checkout';
      bottomNav.style.display = hidePages ? 'none' : 'flex';
    }
  }

  // Hook into navigateTo — patch after it's defined
  var _origNavigateTo = window.navigateTo;
  window.navigateTo = function(page, skipPush) {
    _origNavigateTo(page, skipPush);
    setTimeout(function() { updateBottomNavActive(page); }, 350);
  };
  // Set initial state
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
  // Patch updateCartUI to sync bottom badge
  var _origUpdateCartUI = window.updateCartUI;
  if (_origUpdateCartUI) {
    window.updateCartUI = function() {
      _origUpdateCartUI();
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
      // Close siblings
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
    'product-finasteride': { name: 'HELM Strand', price: '₹599/mo', sku: 'HL-01', fullName: 'HELM Strand Finasteride 1mg', numPrice: 599, type: 'rx' },
    'product-minoxidil': { name: 'Minoxidil 5%', price: '₹449/mo', sku: 'HL-02', fullName: 'HELM Strand Minoxidil 5%', numPrice: 449, type: 'otc' },
    'product-sildenafil': { name: 'HELM Peak', price: '₹499/mo', sku: 'SE-02', fullName: 'HELM Peak Sildenafil 50mg', numPrice: 499, type: 'rx' },
    'product-tadalafil': { name: 'HELM Drive', price: '₹899/mo', sku: 'SE-01', fullName: 'HELM Drive Tadalafil 5mg', numPrice: 899, type: 'rx' }
  };

  function showStickyCta(page) {
    if (!stickyBar) return;
    var prod = productPages[page];
    if (prod) {
      stickyName.textContent = prod.name;
      stickyPrice.textContent = prod.price;
      stickyBtn.onclick = function() {
        if (typeof addToCart === 'function') addToCart(prod.sku, prod.fullName, prod.numPrice, prod.type, 'month');
      };
      stickyBar.style.display = 'flex';
      // Show after small delay
      setTimeout(function() { stickyBar.classList.add('visible'); }, 100);
    } else {
      stickyBar.classList.remove('visible');
      setTimeout(function() { stickyBar.style.display = 'none'; }, 300);
    }
  }

  // Show/hide sticky CTA on scroll (only on product pages)
  var lastScrollY = 0;
  window.addEventListener('scroll', function() {
    if (!stickyBar || stickyBar.style.display === 'none') return;
    var page = typeof currentPage !== 'undefined' ? currentPage : '';
    if (!productPages[page]) return;
    // Show after scrolling 300px
    if (window.scrollY > 300) {
      stickyBar.classList.add('visible');
    } else {
      stickyBar.classList.remove('visible');
    }
    lastScrollY = window.scrollY;
  }, { passive: true });

  // Hook into navigateTo for sticky CTA
  var _navWithSticky = window.navigateTo;
  window.navigateTo = function(page, skipPush) {
    _navWithSticky(page, skipPush);
    setTimeout(function() { showStickyCta(page); }, 400);
  };
  showStickyCta(typeof currentPage !== 'undefined' ? currentPage : 'home');
})();
