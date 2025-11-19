// Simple product data (edit this with your actual products)
const products = [
  { id: 'p1', title: 'Fresh Mirchi (500g)', price: 40, img: '' },
  { id: 'p2', title: 'Turmeric Powder (200g)', price: 120, img: '' },
  { id: 'p3', title: 'Organic Honey (250g)', price: 250, img: '' }
]

// utilities
const $ = sel => document.querySelector(sel)
const $all = sel => [...document.querySelectorAll(sel)]

// render product grid
const productsEl = $('#products')
function renderProducts(){
  productsEl.innerHTML = ''
  products.forEach(p=>{
    const card = document.createElement('div')
    card.className = 'card'
    card.innerHTML = `
      <div class="product-img">Image</div>
      <h3>${p.title}</h3>
      <p class="small">₹${p.price.toFixed(2)}</p>
      <button class="btn add-btn" data-id="${p.id}">Add to cart</button>
    `
    productsEl.appendChild(card)
  })
}

// CART (stored in localStorage)
let cart = JSON.parse(localStorage.getItem('lh_cart') || '{}') // {id: qty}
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
    for(const id of Object.keys(cart)){
      const qty = cart[id]
      const p = products.find(x=>x.id === id)
      const row = document.createElement('div')
      row.className = 'cart-row'
      const subtotal = p.price * qty
      total += subtotal
      row.innerHTML = `
        <div>
          <strong>${p.title}</strong>
          <div class="small">₹${p.price} × ${qty} = ₹${subtotal}</div>
        </div>
        <div>
          <button class="btn small dec" data-id="${id}">-</button>
          <button class="btn small inc" data-id="${id}">+</button>
          <button class="small" data-id="${id} style="margin-top:6px">Remove</button>
        </div>
      `
      cartItemsEl.appendChild(row)
    }
  }
  cartSummary.innerHTML = `<p><strong>Total: ₹${total}</strong></p>`
}

// events
document.addEventListener('click', e=>{
  if(e.target.matches('.add-btn')){
    const id = e.target.dataset.id
    cart[id] = (cart[id] || 0) + 1
    saveCart()
    renderCart()
  }
  if(e.target.matches('#cart-btn')){ cartModal.classList.remove('hidden'); renderCart() }
  if(e.target.matches('#close-cart')){ cartModal.classList.add('hidden') }
  if(e.target.matches('.inc')){ const id=e.target.dataset.id; cart[id] = (cart[id]||0)+1; saveCart(); renderCart() }
  if(e.target.matches('.dec')){ const id=e.target.dataset.id; if(cart[id]>1) cart[id]--; else delete cart[id]; saveCart(); renderCart() }
})

renderProducts()
renderCartCount()

// Checkout flow (mock)
const checkoutModal = $('#checkout-modal')
$('#checkout-btn').addEventListener('click', ()=> {
  cartModal.classList.add('hidden')
  checkoutModal.classList.remove('hidden')
})
$('#close-checkout').addEventListener('click', ()=> checkoutModal.classList.add('hidden'))

$('#checkout-form').addEventListener('submit', e=>{
  e.preventDefault()
  const form = new FormData(e.target)
  const order = {
    name: form.get('name'),
    phone: form.get('phone'),
    address: form.get('address'),
    items: Object.keys(cart).map(id=>{
      const p = products.find(x=>x.id===id)
      return { id, title: p.title, qty: cart[id], price: p.price }
    })
  }
  // Mock placing order: show order summary and clear cart
  $('#order-result').classList.remove('hidden')
  $('#order-result').innerHTML = `<h3>Order placed (mock)</h3>
    <p>Thanks ${order.name}! We have your order.</p>
    <pre>${JSON.stringify(order, null, 2)}</pre>`
  cart = {}
  saveCart()
  e.target.reset()
})
