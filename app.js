// Simple static store + cart logic
const PRODUCTS = [
  {
    id: "prod_1",
    title: "Candle App Pro",
    description: "Lighting controls and ambiance presets.",
    price: 9.99,
    image: "https://picsum.photos/seed/candle/600/400",
    checkoutUrl: "REPLACE_WITH_PAYMENT_LINK_1" // <-- insert your payment link
  },
  {
    id: "prod_2",
    title: "Studio Manager",
    description: "Inventory, orders and reporting.",
    price: 19.99,
    image: "https://picsum.photos/seed/studio/600/400",
    checkoutUrl: "REPLACE_WITH_PAYMENT_LINK_2"
  },
  {
    id: "prod_3",
    title: "Packaging Templates",
    description: "Printable labels & templates pack.",
    price: 4.99,
    image: "https://picsum.photos/seed/pack/600/400",
    checkoutUrl: "REPLACE_WITH_PAYMENT_LINK_3"
  }
];

// DOM refs
const catalog = document.getElementById('catalog')
const cartButton = document.getElementById('cart-button')
const cartCount = document.getElementById('cart-count')
const cartModal = document.getElementById('cart-modal')
const closeCart = document.getElementById('close-cart')
const cartItemsContainer = document.getElementById('cart-items')
const cartSubtotal = document.getElementById('cart-subtotal')
const clearCartBtn = document.getElementById('clear-cart')
const checkoutAllBtn = document.getElementById('checkout-all')
const yearEl = document.getElementById('year')

yearEl.textContent = new Date().getFullYear()

// Cart storage
let cart = JSON.parse(localStorage.getItem('cart_v1') || '{}')

// helper
function saveCart(){ localStorage.setItem('cart_v1', JSON.stringify(cart)); updateCartUI(); }
function totalItems(){ return Object.values(cart).reduce((s,i)=>s+i.qty,0) }
function subtotal(){ return Object.values(cart).reduce((s,i)=>s + i.qty * i.price, 0) }

// render catalog
function renderCatalog(){
  catalog.innerHTML = ''
  PRODUCTS.forEach(p=>{
    const card = document.createElement('article')
    card.className = 'card'
    card.innerHTML = `
      <img src="${p.image}" alt="${escapeHtml(p.title)}"/>
      <h4>${escapeHtml(p.title)}</h4>
      <p>${escapeHtml(p.description)}</p>
      <div class="price">$${p.price.toFixed(2)}</div>
      <div class="card-actions">
        <button class="btn btn-primary add-btn" data-id="${p.id}">Add to cart</button>
        <button class="btn btn-secondary buy-btn" data-id="${p.id}">Buy now</button>
      </div>
    `
    catalog.appendChild(card)
  })
}
function escapeHtml(s){ return (s+'').replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]) }

// cart UI
function updateCartUI(){
  cartCount.textContent = totalItems()
  cartItemsContainer.innerHTML = ''
  const items = Object.values(cart)
  if(items.length === 0){
    cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>'
  } else {
    items.forEach(it=>{
      const el = document.createElement('div')
      el.className = 'cart-item'
      el.innerHTML = `
        <img src="${escapeHtml(it.image)}" alt="${escapeHtml(it.title)}">
        <div style="flex:1">
          <div style="font-weight:600">${escapeHtml(it.title)}</div>
          <div style="color:#666;font-size:13px">$${(it.price).toFixed(2)}</div>
        </div>
        <div class="qty-controls">
          <button class="btn btn-secondary qty-minus" data-id="${it.id}">−</button>
          <div style="min-width:28px;text-align:center">${it.qty}</div>
          <button class="btn btn-secondary qty-plus" data-id="${it.id}">+</button>
        </div>
        <div style="width:64px;text-align:right;font-weight:600">$${(it.price*it.qty).toFixed(2)}</div>
      `
      cartItemsContainer.appendChild(el)
    })
  }

  cartSubtotal.textContent = `$${subtotal().toFixed(2)}`
  cartCount.textContent = totalItems()
}

// events
document.addEventListener('click', (e)=>{
  const add = e.target.closest('.add-btn')
  if(add){
    const id = add.dataset.id
    const p = PRODUCTS.find(x=>x.id===id)
    if(!p) return
    if(!cart[id]) cart[id] = {...p, qty:0}
    cart[id].qty += 1
    saveCart()
    return
  }

  const buy = e.target.closest('.buy-btn')
  if(buy){
    const id = buy.dataset.id
    const p = PRODUCTS.find(x=>x.id===id)
    if(!p) return
    // direct checkout for single product (open payment link)
    if(p.checkoutUrl && p.checkoutUrl.startsWith('http')){
      window.location.href = p.checkoutUrl
    } else {
      alert('No payment link configured for this product. Replace checkoutUrl in app.js with your payment link (PayPal, Stripe Payment Link, etc.)')
    }
    return
  }

  const qtyPlus = e.target.closest('.qty-plus')
  if(qtyPlus){
    const id = qtyPlus.dataset.id
    cart[id].qty += 1
    saveCart()
    return
  }

  const qtyMinus = e.target.closest('.qty-minus')
  if(qtyMinus){
    const id = qtyMinus.dataset.id
    cart[id].qty -= 1
    if(cart[id].qty <= 0) delete cart[id]
    saveCart()
    return
  }
})

// cart open/close
cartButton.addEventListener('click', ()=>{
  cartModal.setAttribute('aria-hidden','false')
  cartModal.style.display = 'flex'
  updateCartUI()
})
closeCart.addEventListener('click', ()=>{ cartModal.setAttribute('aria-hidden','true'); cartModal.style.display = 'none' })
clearCartBtn.addEventListener('click', ()=>{ cart = {}; saveCart(); })

// checkout all -> opens a configurable multi-item checkout URL or shows instructions
checkoutAllBtn.addEventListener('click', ()=>{
  const items = Object.values(cart)
  if(items.length === 0){ alert('Cart is empty'); return }
  // If you have a payment link per product, we will:
  // 1) If single-item cart, redirect to that product's checkoutUrl.
  // 2) If multi-item cart, build a simple "order summary" and open user's email client or show instructions.
  if(items.length === 1 && items[0].checkoutUrl && items[0].checkoutUrl.startsWith('http')){
    window.location.href = items[0].checkoutUrl
    return
  }

  // For multi-item: create an orderSummary and open mailto as default (you can replace with server checkout later)
  let body = 'Order summary:%0D%0A'
  items.forEach(it => {
    body += `${it.qty} x ${it.title} - $${(it.price*it.qty).toFixed(2)}%0D%0A`
  })
  body += `%0D%0ASubtotal: $${subtotal().toFixed(2)}%0D%0A%0D%0APlease reply with payment instructions.`
  const mailto = `mailto:you@yourstore.com?subject=New%20Order&body=${body}`
  window.location.href = mailto
})

// init
renderCatalog()
updateCartUI()
