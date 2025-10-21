/* Simple static store with search, categories, product modal, cart (localStorage) */
/* Replace checkoutUrl with your PayPal/Stripe/Gumroad links for real payments */

const PRODUCTS = [
  { id:'p1', title:'White Orchid Candle', desc:'Fresh floral with soft musk', price:14.99, image:'https://picsum.photos/seed/p1/600/400', category:'Candles', sale:false, checkoutUrl:'' },
  { id:'p2', title:'Vanilla Shea Body Lotion', desc:'Rich, hydrating lotion', price:12.50, image:'https://picsum.photos/seed/p2/600/400', category:'Body', sale:true, checkoutUrl:'' },
  { id:'p3', title:'Lavender Linen Spray', desc:'Sleep-friendly linen mist', price:9.99, image:'https://picsum.photos/seed/p3/600/400', category:'Home', sale:false, checkoutUrl:'' },
  { id:'p4', title:'Citrus & Mint Hand Soap', desc:'Zesty & clean', price:6.99, image:'https://picsum.photos/seed/p4/600/400', category:'Body', sale:true, checkoutUrl:'' },
  { id:'p5', title:'Cozy Cashmere Candle', desc:'Warm amber & cashmere', price:19.99, image:'https://picsum.photos/seed/p5/600/400', category:'Candles', sale:false, checkoutUrl:'' },
  { id:'p6', title:'Gift Box — Mini Trio', desc:'Three favorites in a gift box', price:24.99, image:'https://picsum.photos/seed/p6/600/400', category:'Gifts', sale:false, checkoutUrl:'' }
];

// --- DOM refs
const catalogEl = document.getElementById('catalog');
const categoryList = document.getElementById('category-list');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const onlySaleChk = document.getElementById('only-sale');
const cartBtn = document.getElementById('cart-btn');
const cartCountEl = document.getElementById('cart-count');
const cartPanel = document.getElementById('cart-panel');
const cartItemsEl = document.getElementById('cart-items');
const subtotalEl = document.getElementById('subtotal');
const clearCartBtn = document.getElementById('clear-cart');
const checkoutBtn = document.getElementById('checkout');
const modal = document.getElementById('product-modal');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');
const shopAllBtn = document.getElementById('shop-all');
const yearEl = document.getElementById('year');

yearEl.textContent = new Date().getFullYear();

// --- cart (localStorage)
let cart = JSON.parse(localStorage.getItem('dorrik_cart') || '{}');

function saveCart(){ localStorage.setItem('dorrik_cart', JSON.stringify(cart)); renderCart(); }
function itemCount(){ return Object.values(cart).reduce((s,i)=>s+i.qty,0); }
function cartSubtotal(){ return Object.values(cart).reduce((s,i)=>s + i.price*i.qty,0); }

// --- render categories
function renderCategories(){
  const cats = ['All', ...Array.from(new Set(PRODUCTS.map(p=>p.category)))];
  categoryList.innerHTML = '';
  cats.forEach(c=>{
    const btn = document.createElement('button');
    btn.textContent = c;
    btn.dataset.cat = c;
    btn.addEventListener('click', ()=>{ document.querySelectorAll('.nav-links button').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); renderProducts(); });
    if(c==='All') btn.classList.add('active');
    categoryList.appendChild(btn);
  });
}

// --- product rendering (with filters/search)
function renderProducts(){
  const query = searchInput.value.trim().toLowerCase();
  const activeCatBtn = document.querySelector('.nav-links button.active');
  const cat = activeCatBtn ? activeCatBtn.dataset.cat : 'All';
  let list = PRODUCTS.slice();

  if(cat !== 'All') list = list.filter(p=>p.category===cat);
  if(onlySaleChk && onlySaleChk.checked) list = list.filter(p=>p.sale);
  if(query) list = list.filter(p => (p.title + ' ' + p.desc + ' ' + p.category).toLowerCase().includes(query));

  const sort = sortSelect.value;
  if(sort === 'price-asc') list.sort((a,b)=>a.price-b.price);
  if(sort === 'price-desc') list.sort((a,b)=>b.price-a.price);
  if(sort === 'new') list.reverse();

  catalogEl.innerHTML = '';
  list.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      ${p.sale ? '<div class="badge">SALE</div>' : ''}
      <img src="${p.image}" alt="${escape(p.title)}" loading="lazy">
      <h4 class="title">${escape(p.title)}</h4>
      <p class="desc">${escape(p.desc)}</p>
      <div class="price">$${p.price.toFixed(2)}</div>
      <div class="card-actions">
        <button class="btn btn-primary view-btn" data-id="${p.id}">View</button>
        <button class="btn btn-ghost add-btn" data-id="${p.id}">Add</button>
      </div>
    `;
    catalogEl.appendChild(card);
  });
}

// --- escape helper
function escape(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// --- modal open
function openProduct(id){
  const p = PRODUCTS.find(x=>x.id===id); if(!p) return;
  modalContent.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div><img src="${p.image}" alt="${escape(p.title)}" style="width:100%;border-radius:10px"></div>
      <div>
        <h2>${escape(p.title)}</h2>
        <p style="color:#666">${escape(p.desc)}</p>
        <div style="font-weight:800;margin:10px 0;font-size:18px">$${p.price.toFixed(2)}</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary modal-add" data-id="${p.id}">Add to cart</button>
          <button class="btn btn-ghost modal-buy" data-id="${p.id}">Buy now</button>
        </div>
      </div>
    </div>
  `;
  modal.setAttribute('aria-hidden','false');
}

// --- cart UI render
function renderCart(){
  cartCountEl.textContent = itemCount();
  cartItemsEl.innerHTML = '';
  const items = Object.values(cart);
  if(items.length === 0){
    cartItemsEl.innerHTML = '<p style="padding:12px;color:#666">Your cart is empty.</p>';
  } else {
    items.forEach(it=>{
      const el = document.createElement('div'); el.className = 'cart-item';
      el.innerHTML = `
        <img src="${escape(it.image)}" alt="${escape(it.title)}">
        <div style="flex:1">
          <div style="font-weight:700">${escape(it.title)}</div>
          <div style="color:#666;font-size:13px">$${it.price.toFixed(2)}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
          <div style="display:flex;gap:6px;align-items:center">
            <button class="btn btn-ghost qty-minus" data-id="${it.id}">−</button>
            <div>${it.qty}</div>
            <button class="btn btn-ghost qty-plus" data-id="${it.id}">+</button>
          </div>
          <div style="font-weight:700">$${(it.price * it.qty).toFixed(2)}</div>
        </div>
      `;
      cartItemsEl.appendChild(el);
    });
  }
  subtotalEl.textContent = `$${cartSubtotal().toFixed(2)}`;
}

// --- events (delegation)
document.addEventListener('click', e=>{
  // add from card
  const addBtn = e.target.closest('.add-btn');
  if(addBtn){
    const id = addBtn.dataset.id; addToCart(id); return;
  }
  // view product
  const viewBtn = e.target.closest('.view-btn');
  if(viewBtn){ openProduct(viewBtn.dataset.id); return; }

  // modal add / buy
  const modalAdd = e.target.closest('.modal-add');
  if(modalAdd){ addToCart(modalAdd.dataset.id); closeModal(); return; }
  const modalBuy = e.target.closest('.modal-buy');
  if(modalBuy){ buyNow(modalBuy.dataset.id); return; }

  // modal close
  if(e.target.id === 'modal-close' || e.target === modal) { closeModal(); return; }

  // cart open
  if(e.target.id === 'cart-btn' || e.target.closest && e.target.closest('#cart-btn')){ openCart(); return; }
  // close cart
  if(e.target.id === 'close-cart') { closeCart(); return; }
  // qty plus/minus
  const plus = e.target.closest('.qty-plus');
  if(plus){ modifyQty(plus.dataset.id, 1); return; }
  const minus = e.target.closest('.qty-minus');
  if(minus){ modifyQty(minus.dataset.id, -1); return; }
  // clear
  if(e.target.id === 'clear-cart'){ cart = {}; saveCart(); return; }
  // checkout
  if(e.target.id === 'checkout'){ checkoutFlow(); return; }
});

// search / sorting / filters events
searchInput.addEventListener('input', ()=>renderProducts());
sortSelect.addEventListener('change', ()=>renderProducts());
onlySaleChk.addEventListener('change', ()=>renderProducts());
shopAllBtn.addEventListener('click', e=>{ e.preventDefault(); document.querySelector('.nav-links button[data-cat="All"]').click(); });

// --- cart functions
function addToCart(id){
  const p = PRODUCTS.find(x=>x.id===id); if(!p) return;
  if(!cart[id]) cart[id] = {...p, qty:0};
  cart[id].qty += 1; saveCart();
}

function modifyQty(id, delta){
  if(!cart[id]) return;
  cart[id].qty += delta;
  if(cart[id].qty <= 0) delete cart[id];
  saveCart();
}

function openCart(){
  cartPanel.setAttribute('aria-hidden','false');
  renderCart();
}
function closeCart(){ cartPanel.setAttribute('aria-hidden','true'); }

function closeModal(){ modal.setAttribute('aria-hidden','true'); modalContent.innerHTML=''; }

// buy now single product -> direct checkout URL if provided
function buyNow(id){
  const p = PRODUCTS.find(x=>x.id===id);
  if(p && p.checkoutUrl){ window.location.href = p.checkoutUrl; return; }
  // fallback: add to cart and open email summary
  addToCart(id);
  checkoutFlow();
}

// checkout flow: if single-item in cart with checkoutUrl -> redirect; else open mailto with summary
function checkoutFlow(){
  const items = Object.values(cart);
  if(items.length === 0){ alert('Cart is empty'); return; }
  if(items.length === 1 && items[0].checkoutUrl){ window.location.href = items[0].checkoutUrl; return; }

  let body = 'Order summary:%0D%0A';
  items.forEach(it => { body += `${it.qty} x ${it.title} - $${(it.price*it.qty).toFixed(2)}%0D%0A`; });
  body += `%0D%0ASubtotal: $${cartSubtotal().toFixed(2)}%0D%0A%0D%0AProvide payment instructions and shipping address.`;
  window.location.href = `mailto:you@store.com?subject=Order&body=${body}`;
}

// save & init
function saveCart(){ localStorage.setItem('dorrik_cart', JSON.stringify(cart)); renderCart(); cartCountEl.textContent = itemCount(); }
function init(){ renderCategories(); renderProducts(); renderCart(); }
init();
