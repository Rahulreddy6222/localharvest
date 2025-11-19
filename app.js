// app.js - updated to support weight variants per product

// Product data with weight variants and per-weight prices.
// For placeholders, img uses the path you generated earlier on this machine.
// Replace img paths with your real images later.
const products = [
  {
    id: 'p1',
    title: 'Fresh Mirchi',
    img: 'https://raw.githubusercontent.com/Rahulreddy6222/localharvest/main/images/mirchi.jpg',
    alt: 'Fresh Mirchi',
    variants: [
      { key: '250g', label: '250 g', price: 25 },
      { key: '500g', label: '500 g', price: 40 },
      { key: '1kg', label: '1 kg', price: 70 }
    ]
  },
  {
    id: 'p2',
    title: 'Turmeric Powder',
    img: 'https://raw.githubusercontent.com/Rahulreddy6222/localharvest/main/images/turmeric.jpg',
    alt: 'Turmeric Powder',
    variants: [
      { key: '250g', label: '250 g', price: 70 },
      { key: '500g', label: '500 g', price: 120 },
      { key: '1kg', label: '1 kg', price: 220 }
    ]
  },
  {
    id: 'p3',
    title: 'Organic Honey',
    img: 'https://raw.githubusercontent.com/Rahulreddy6222/localharvest/main/images/honey.jpg',
    alt: 'Organic Honey',
    variants: [
      { key: '250g', label: '250 g', price: 250 },
      { key: '500g', label: '500 g', price: 460 },
      { key: '1kg', label: '1 kg', price: 880 }
    ]
  }
]

// helpers to query
const $ = sel => document.querySelector(sel)
const $all = sel => [...document.querySelectorAll(sel)]

// RENDER PRODUCTS
const productsEl = $('#products')
function renderProducts(){
  productsEl.innerHTML = ''
  products.forEach(p => {
    const card = document.createElement('div')
    card.className = 'card'
    // Build weight options
    const options = p.variants.map(v => `<option value="${v.key}" data-price="${v.price}">${v.label} — ₹${v.price}</option>`).join('')
    // Start price shows first variant price
    const startPrice = p.variants[0].price
    card.innerHTML = `
      <div class="product-img">
        <img src="${p.img}" alt="${p.alt}" />
      </div>
      <h3>${p.title}</h3>
      <p class="small price-display">₹<span class="price-value">${startPrice.toFixed(2)}</span></p>

      <label class="small">Choose weight
        <select class="weight-select" data-id="${p.id}">
          ${options}
        </select>
      </label>

      <div style="margin-top:8px;">
        <button class="btn add-btn" data-id="${p.id}">Add to cart</button>
      </div>
    `
    productsEl.appendChild(card)
  })
}

// CART: we'll store cart as an object with keys of form `${productId}::${variantKey}`
// value = qty
let cart = JSON.parse(localStorage.getItem('lh_cart') || '{}')
function saveCart(){ localStorage.setItem('lh_cart', JSON.stringify(cart)); renderCartCount() }
function renderCartCount(){
  const count = Object.values(cart).reduce((s,n)=>s+n,0)
  $('#cart-count').textContent = count
}

// Cart modal UI
const cartModal = $('#cart-modal')
const cartItemsEl = $('#cart-items')
const cartSummary = $('#cart-summary')

function renderCart(){
  cartItemsEl.innerHTML = ''
  let total = 0
  if(Object.keys(cart).length === 0){
    cartItemsEl.innerHTML = '<p>Your cart is empty.</p>'
  } else {
    for(const compositeKey of Object.keys(cart)){
      const qty = cart[compositeKey]
      // compositeKey = id::variantKey
      const [id, variantKey] = compositeKey.split('::')
      const p = products.find(x => x.id === id)
      const variant = p.variants.find(v => v.key === variantKey)
      const subtotal = variant.price * qty
      total += subtotal

      const row = document.createElement('div')
      row.className = 'cart-row'
      row.innerHTML = `
        <div>
          <strong>${p.title} (${variant.label})</strong>
          <div class="small">₹${variant.price} × ${qty} = ₹${subtotal}</div>
        </div>
        <div>
          <button class="btn small dec" data-key="${compositeKey}">-</button>
          <button class="btn small inc" data-key="${compositeKey}">+</button>
          <div style="margin-top:8px;">
            <button class="small remove" data-key="${compositeKey}">Remove</button>
          </div>
        </div>
      `
      cartItemsEl.appendChild(row)
    }
  }
  cartSummary.innerHTML = `<p><strong>Total: ₹${total}</strong></p>`
}

// EVENTS: handle weight select change (update displayed price), add to cart, cart buttons
document.addEventListener('change', e => {
  if(e.target.matches('.weight-select')){
    // update the shown price in that card
    const select = e.target
    const price = select.selectedOptions[0].dataset.price
    // find nearest card and update .price-value
    const card = select.closest('.card')
    if(card){
      card.querySelector('.price-value').textContent = Number(price).toFixed(2)
    }
  }
})

document.addEventListener('click', e => {
  // add to cart
  if(e.target.matches('.add-btn')){
    const id = e.target.dataset.id
    // find the select for that product
    const sel = document.querySelector(`.weight-select[data-id="${id}"]`)
    const variantKey = sel.value
    const compositeKey = `${id}::${variantKey}`
    cart[compositeKey] = (cart[compositeKey] || 0) + 1
    saveCart()
    renderCart()
  }

  if(e.target.matches('#cart-btn')){
    cartModal.classList.remove('hidden'); renderCart()
  }
  if(e.target.matches('#close-cart')){
    cartModal.classList.add('hidden')
  }

  if(e.target.matches('.inc') || e.target.matches('.dec') || e.target.matches('.remove')){
    const key = e.target.dataset.key
    if(e.target.matches('.inc')){
      cart[key] = (cart[key] || 0) + 1
    } else if(e.target.matches('.dec')){
      if(cart[key] > 1) cart[key]-- 
      else delete cart[key]
    } else if(e.target.matches('.remove')){
      delete cart[key]
    }
    saveCart()
    renderCart()
  }
})

// initial render
renderProducts()
renderCartCount()

// Checkout flow (mock) - unchanged but now includes variant details
const checkoutModal = $('#checkout-modal')
$('#checkout-btn').addEventListener('click', ()=> {
  cartModal.classList.add('hidden')
  checkoutModal.classList.remove('hidden')
})
$('#close-checkout').addEventListener('click', ()=> checkoutModal.classList.add('hidden'))

$('#checkout-form').addEventListener('submit', e=>{
  e.preventDefault()
  const form = new FormData(e.target)
  const items = Object.keys(cart).map(compositeKey => {
    const [id, variantKey] = compositeKey.split('::')
    const p = products.find(x=>x.id===id)
    const v = p.variants.find(x=>x.key===variantKey)
    return { id, title: p.title, variant: v.label, qty: cart[compositeKey], price: v.price }
  })
  const order = {
    name: form.get('name'),
    phone: form.get('phone'),
    address: form.get('address'),
    items
  }
  $('#order-result').classList.remove('hidden')
  $('#order-result').innerHTML = `<h3>Order placed (mock)</h3>
    <p>Thanks ${order.name}! We have your order.</p>
    <pre>${JSON.stringify(order, null, 2)}</pre>`
  cart = {}
  saveCart()
  e.target.reset()
})
// Smooth scroll to products when clicking Shop now in the hero
document.addEventListener('click', e => {
  if (e.target && e.target.id === 'shop-now') {
    const prod = document.querySelector('#products')
    if (prod) {
      prod.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
})
