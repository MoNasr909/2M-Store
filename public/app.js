const state = {
  user: null,
  products: [],
  cart: JSON.parse(localStorage.getItem('2m_cart') || '[]')
};

const $ = s => document.querySelector(s);

const money = n =>
  `EGP ${Number(n || 0).toLocaleString('en-US')}`;


/* =========================
   API
========================= */

async function api(url, opt = {}) {

  const r = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(opt.headers || {})
    },
    ...opt
  });

  let d = {};

  try {
    d = await r.json();
  } catch {}

  if (!r.ok) {
    throw new Error(d.error || 'Something went wrong');
  }

  return d;
}


/* =========================
   TOAST
========================= */

function toast(msg, type = 'ok') {

  const e = document.createElement('div');

  e.className = `toast ${type}`;

  e.textContent = msg;

  $('#toast').appendChild(e);

  setTimeout(() => e.remove(), 3000);
}


/* =========================
   CART
========================= */

function saveCart() {

  localStorage.setItem(
    '2m_cart',
    JSON.stringify(state.cart)
  );

  updateCartCount();
}


function updateCartCount() {

  const el = $('#cartCount');

  if (!el) return;

  el.textContent =
    state.cart.reduce(
      (s, x) => s + x.quantity,
      0
    );
}


function addToCart(id) {

  const p = state.products.find(
    x => x.id == id
  );

  if (!p) return;

  if (p.stock <= 0) {

    toast(
      'This product is out of stock',
      'bad'
    );

    return;
  }

  const x = state.cart.find(
    x => x.productId == id
  );

  if (x) {

    x.quantity =
      Math.min(
        x.quantity + 1,
        p.stock
      );

  } else {

    state.cart.push({
      productId: p.id,
      quantity: 1
    });

  }

  saveCart();

  toast(`${p.name} added to cart`);
}


function removeFromCart(id) {

  state.cart =
    state.cart.filter(
      x => x.productId != id
    );

  saveCart();

  render();
}


function setQty(id, q) {

  const x =
    state.cart.find(
      x => x.productId == id
    );

  if (!x) return;

  const p =
    state.products.find(
      p => p.id == id
    );

  const maxStock =
    p ? p.stock : 99;

  x.quantity =
    Math.max(
      1,
      Math.min(
        Number(q),
        maxStock
      )
    );

  saveCart();

  render();
}


/* =========================
   PRODUCT CARD
========================= */

function productCard(p) {

  return `
    <article class="product-card">

      <a href="#/product/${p.id}">

        <img
          class="product-image"
          src="${p.image}"
          alt="${p.name}"
        >

      </a>

      <div class="product-info">

        <div class="product-name">
          ${p.name}
        </div>

        <div class="product-type">
          ${
            p.category === 'watch'
              ? 'Original Look'
              : 'Perfume (Fragrance)'
          }
        </div>

        <div class="price">
          ${money(p.price)}
        </div>

        <div class="product-actions">

          <a href="#/product/${p.id}">
            View
          </a>

          <button
            class="add"
            onclick="addToCart(${p.id})"
          >
            🛒 Add to Cart
          </button>

        </div>

      </div>

    </article>
  `;
}


/* =========================
   HOME
========================= */

function hero() {

  return `
    <section class="hero">

      <div class="hero-copy">

        <div class="eyebrow">
          PREMIUM WATCHES & SIGNATURE FRAGRANCES
        </div>

        <h1>
          STYLE IN<br>
          <span>EVERY DETAIL</span>
        </h1>

        <p>
          Luxury watches and signature perfumes crafted
          for a more confident you.
        </p>

        <a
          class="gold-btn"
          href="#/shop"
        >
          SHOP NOW →
        </a>

      </div>

      <div class="hero-art">

        <img
          src="/assets/watch-green.svg"
          alt="2M watch"
        >

        <img
          class="perfume-art"
          src="/assets/perfume-blue.svg"
          alt="2M perfume"
        >

      </div>

    </section>
  `;
}


async function home() {

  const ps =
    await api('/api/products');

  state.products = ps;

  return hero() + `

    <section class="section">

      <div class="category-grid">

        <a
          class="category-card"
          href="#/watches"
        >

          <div>

            <b>WATCHES</b>

            <div class="muted">
              Timeless Style
            </div>

          </div>

          <div class="category-icon">
            ⌚
          </div>

          <span>→</span>

        </a>


        <a
          class="category-card"
          href="#/perfumes"
        >

          <div>

            <b>PERFUMES</b>

            <div class="muted">
              Lasting Impressions
            </div>

          </div>

          <div class="category-icon">
            ♧
          </div>

          <span>→</span>

        </a>

      </div>

    </section>


    <section class="section">

      <div class="section-head">

        <h2>
          FEATURED PRODUCTS
        </h2>

        <a
          class="muted"
          href="#/shop"
        >
          View All →
        </a>

      </div>

      <div class="product-grid">

        ${
          ps
            .slice(0, 7)
            .map(productCard)
            .join('')
        }


        <div
          class="category-card"
          style="min-height:100%;display:block"
        >

          <div class="eyebrow">
            2M STORE
          </div>

          <h3>
            MORE THAN<br>
            A PRODUCT
          </h3>

          <p class="muted">
            ✓ 100% Original Look<br>
            ✓ Fast Delivery<br>
            ✓ Customer Support
          </p>

          <a
            class="gold-btn"
            href="#/shop"
          >
            SHOP NOW →
          </a>

        </div>

      </div>

    </section>


    <div class="trust">

      <div>
        🚚
        <b>Fast Shipping</b>
        <span>Across Egypt</span>
      </div>

      <div>
        🛡
        <b>Secure Payment</b>
        <span>
          Cash on Delivery / Bank Transfer
        </span>
      </div>

      <div>
        ♧
        <b>24/7 Support</b>
        <span>We're here for you</span>
      </div>

      <div>
        ⌖
        <b>Easy Order Tracking</b>
        <span>Track your order anytime</span>
      </div>

    </div>
  `;
}


/* =========================
   SHOP
========================= */

async function shop(category = '') {

  let url = '/api/products';

  if (category) {

    url +=
      `?category=${encodeURIComponent(category)}`;

  }

  const ps = await api(url);

  state.products = ps;

  const title =
    category === 'watch'
      ? 'WATCHES'
      : category === 'perfume'
        ? 'PERFUMES'
        : 'SHOP ALL';

  return `
    <div class="page">

      <div class="section-head">

        <div>

          <h1 class="page-title">
            ${title}
          </h1>

          <p class="muted">
            Discover your next signature piece.
          </p>

        </div>

      </div>


      <div class="filters">

        <button
          class="${!category ? 'active' : ''}"
          onclick="location.hash='#/shop'"
        >
          All
        </button>

        <button
          class="${category === 'watch' ? 'active' : ''}"
          onclick="location.hash='#/watches'"
        >
          Watches
        </button>

        <button
          class="${category === 'perfume' ? 'active' : ''}"
          onclick="location.hash='#/perfumes'"
        >
          Perfumes
        </button>

      </div>


      <div class="product-grid">

        ${
          ps.length
            ? ps.map(productCard).join('')
            : `
              <div
                class="empty"
                style="grid-column:1/-1"
              >
                No products found.
              </div>
            `
        }

      </div>

    </div>
  `;
}


/* =========================
   PRODUCT DETAILS
========================= */

async function product(id) {

  const p =
    await api('/api/products/' + id);

  return `
    <div class="page">

      <a
        class="muted"
        href="#/shop"
      >
        ← Back to shop
      </a>


      <div
        class="detail"
        style="margin-top:25px"
      >

        <img
          src="${p.image}"
          alt="${p.name}"
        >


        <div>

          <div class="eyebrow">
            2M STORE / ${p.category.toUpperCase()}
          </div>

          <h1>
            ${p.name}
          </h1>

          <p class="muted">
            ${p.description || ''}
          </p>


          <div class="price">
            ${money(p.price)}
          </div>


          <div class="hero-badges">

            ${
              p.gender
                ? `<span class="badge">${p.gender}</span>`
                : ''
            }


            ${
              p.category === 'watch'

                ? `

                  ${
                    p.case_material
                      ? `<span class="badge">Case: ${p.case_material}</span>`
                      : ''
                  }

                  ${
                    p.strap_material
                      ? `<span class="badge">Strap: ${p.strap_material}</span>`
                      : ''
                  }

                  ${
                    p.color
                      ? `<span class="badge">Color: ${p.color}</span>`
                      : ''
                  }

                  ${
                    p.movement
                      ? `<span class="badge">Movement: ${p.movement}</span>`
                      : ''
                  }

                  ${
                    p.water_resistance
                      ? `<span class="badge">Water: ${p.water_resistance}</span>`
                      : ''
                  }

                  ${
                    p.watch_size || p.size
                      ? `<span class="badge">${p.watch_size || p.size}</span>`
                      : ''
                  }

                `

                : `

                  ${
                    p.volume || p.size
                      ? `<span class="badge">${p.volume || p.size}</span>`
                      : ''
                  }

                  ${
                    p.fragrance_family || p.notes
                      ? `<span class="badge">${p.fragrance_family || p.notes}</span>`
                      : ''
                  }

                  ${
                    p.top_notes
                      ? `<span class="badge">Top: ${p.top_notes}</span>`
                      : ''
                  }

                  ${
                    p.middle_notes
                      ? `<span class="badge">Middle: ${p.middle_notes}</span>`
                      : ''
                  }

                  ${
                    p.base_notes
                      ? `<span class="badge">Base: ${p.base_notes}</span>`
                      : ''
                  }

                `
            }


            <span class="badge">

              ${
                p.stock > 0
                  ? `${p.stock} in stock`
                  : 'Out of stock'
              }

            </span>

          </div>


          <button
            class="gold-btn"
            style="margin-top:25px"
            ${p.stock < 1 ? 'disabled' : ''}
            onclick="addToCart(${p.id})"
          >
            🛒 ADD TO CART
          </button>

        </div>

      </div>

    </div>
  `;
}


/* =========================
   CART PAGE
========================= */

function cart() {

  const items =
    state.cart
      .map(x => ({
        ...x,
        p: state.products.find(
          p => p.id == x.productId
        )
      }))
      .filter(x => x.p);


  const subtotal =
    items.reduce(
      (s, x) =>
        s + x.p.price * x.quantity,
      0
    );


  return `
    <div class="page">

      <h1 class="page-title">
        Your Cart
      </h1>


      ${
        items.length

          ? `

            ${items.map(x => `

              <div class="cart-row">

                <img
                  src="${x.p.image}"
                  alt="${x.p.name}"
                >


                <div>

                  <b>
                    ${x.p.name}
                  </b>

                  <div class="muted">
                    ${x.p.category}
                  </div>

                </div>


                <div class="qty">

                  <button
                    onclick="setQty(
                      ${x.p.id},
                      ${x.quantity - 1}
                    )"
                  >
                    −
                  </button>

                  <span>
                    ${x.quantity}
                  </span>

                  <button
                    onclick="setQty(
                      ${x.p.id},
                      ${x.quantity + 1}
                    )"
                  >
                    +
                  </button>

                </div>


                <div class="cart-price">
                  ${money(
                    x.p.price * x.quantity
                  )}
                </div>


                <button
                  class="remove"
                  onclick="removeFromCart(${x.p.id})"
                >
                  ×
                </button>

              </div>

            `).join('')}


            <div
              class="summary"
              style="margin-top:25px"
            >

              <div class="summary-line">

                <span>
                  Subtotal
                </span>

                <b>
                  ${money(subtotal)}
                </b>

              </div>


              <div class="summary-line">

                <span>
                  Delivery
                </span>

                <span>
                  Calculated at checkout
                </span>

              </div>


              <div class="summary-line total">

                <span>
                  Total
                </span>

                <span>
                  ${money(subtotal)}
                </span>

              </div>


              <a
                class="gold-btn"
                style="
                  width:100%;
                  justify-content:center;
                  margin-top:12px
                "
                href="#/checkout"
              >
                CHECKOUT →
              </a>

            </div>

          `

          : `

            <div class="empty">

              Your cart is empty.

              <br>

              <a
                class="gold-btn"
                style="margin-top:15px"
                href="#/shop"
              >
                START SHOPPING
              </a>

            </div>

          `
      }

    </div>
  `;
}


/* =========================
   CHECKOUT
========================= */

function checkout() {

  if (!state.user) {

    return `
      <div class="page">

        <div class="form-card">

          <h1 class="page-title">
            Login to Checkout
          </h1>

          <p class="muted">
            Create an account or sign in so we can
            save your order and delivery details.
          </p>

          <a
            class="gold-btn"
            href="#/login"
          >
            LOGIN / REGISTER
          </a>

        </div>

      </div>
    `;
  }


  const u = state.user;


  return `
    <div class="page">

      <h1 class="page-title">
        Checkout
      </h1>


      <form
        class="form-card"
        onsubmit="submitOrder(event)"
      >

        <div class="form-grid">


          <div class="field">

            <label>
              Full Name
            </label>

            <input
              name="name"
              value="${u.name || ''}"
              required
            >

          </div>


          <div class="field">

            <label>
              Phone Number
            </label>

            <input
              name="phone"
              value="${u.phone || ''}"
              required
            >

          </div>


          <div class="field">

            <label>
              Governorate
            </label>

            <input
              name="governorate"
              value="${u.governorate || ''}"
              required
            >

          </div>


          <div class="field">

            <label>
              Area / City
            </label>

            <input
              name="area"
              value="${u.area || ''}"
              required
            >

          </div>


          <div class="field full">

            <label>
              Detailed Address
            </label>

            <textarea
              name="address"
              rows="3"
              required
            >${u.address || ''}</textarea>

          </div>


          <div class="field">

            <label>
              Payment Method
            </label>

            <select name="paymentMethod">

              <option>
                Cash on Delivery
              </option>

              <option>
                Bank Transfer
              </option>

            </select>

          </div>


          <div class="field">

            <label>
              Order Notes
            </label>

            <input
              name="notes"
              placeholder="Optional"
            >

          </div>


        </div>


        <button
          class="gold-btn"
          style="margin-top:20px"
        >
          PLACE ORDER →
        </button>

      </form>

    </div>
  `;
}


async function submitOrder(e) {

  e.preventDefault();

  const f =
    new FormData(e.target);


  try {

    await api('/api/auth/me', {

      method: 'PUT',

      body: JSON.stringify({

        name: f.get('name'),

        phone: f.get('phone'),

        governorate:
          f.get('governorate'),

        area:
          f.get('area'),

        address:
          f.get('address')

      })

    });


    state.user =
      (await api('/api/auth/me')).user;


    const r =
      await api('/api/orders', {

        method: 'POST',

        body: JSON.stringify({

          items: state.cart,

          paymentMethod:
            f.get('paymentMethod'),

          notes:
            f.get('notes'),

          deliveryFee: 0

        })

      });


    state.cart = [];

    saveCart();


    location.hash =
      `#/order-success/${r.number}/${r.total}`;


  } catch (err) {

    toast(
      err.message,
      'bad'
    );

  }
}


/* =========================
   LOGIN
========================= */

function login() {

  return `
    <div class="page">

      <form
        class="form-card"
        onsubmit="doLogin(event)"
      >

        <h1 class="page-title">
          Welcome Back
        </h1>

        <div id="loginError"></div>


        <div class="field">

          <label>
            Email
          </label>

          <input
            name="email"
            type="email"
            required
          >

        </div>


        <div
          class="field"
          style="margin-top:12px"
        >

          <label>
            Password
          </label>

          <input
            name="password"
            type="password"
            required
          >

        </div>


        <button
          class="gold-btn"
          style="margin-top:18px"
        >
          LOGIN
        </button>


        <p class="muted">

          New to 2M Store?

          <a
            style="color:var(--gold)"
            href="#/register"
          >
            Create an account
          </a>

        </p>

      </form>

    </div>
  `;
}


async function doLogin(e) {

  e.preventDefault();

  const f =
    new FormData(e.target);


  try {

    const r =
      await api('/api/auth/login', {

        method: 'POST',

        body: JSON.stringify({

          email:
            f.get('email'),

          password:
            f.get('password')

        })

      });


    state.user = r.user;


    toast('Welcome back');


    if (
      state.user.role === 'admin'
    ) {

      location.hash = '#/admin';

    } else {

      location.hash = '#/account';

    }


  } catch (err) {

    $('#loginError').innerHTML =
      `<div class="alert">${err.message}</div>`;

  }
}


/* =========================
   REGISTER
========================= */

function register() {

  return `
    <div class="page">

      <form
        class="form-card"
        onsubmit="doRegister(event)"
      >

        <h1 class="page-title">
          Create Account
        </h1>

        <div id="regError"></div>


        <div class="form-grid">


          <div class="field">

            <label>
              Full Name
            </label>

            <input
              name="name"
              required
            >

          </div>


          <div class="field">

            <label>
              Phone
            </label>

            <input
              name="phone"
              required
            >

          </div>


          <div class="field">

            <label>
              Email
            </label>

            <input
              name="email"
              type="email"
              required
            >

          </div>


          <div class="field">

            <label>
              Password
            </label>

            <input
              name="password"
              type="password"
              minlength="6"
              required
            >

          </div>


          <div class="field">

            <label>
              Governorate
            </label>

            <input
              name="governorate"
              required
            >

          </div>


          <div class="field">

            <label>
              Area / City
            </label>

            <input
              name="area"
              required
            >

          </div>


          <div class="field full">

            <label>
              Detailed Address
            </label>

            <textarea
              name="address"
              rows="3"
              required
            ></textarea>

          </div>


        </div>


        <button
          class="gold-btn"
          style="margin-top:18px"
        >
          CREATE ACCOUNT
        </button>


        <p class="muted">

          Already have an account?

          <a
            style="color:var(--gold)"
            href="#/login"
          >
            Login
          </a>

        </p>

      </form>

    </div>
  `;
}


async function doRegister(e) {

  e.preventDefault();

  const f =
    new FormData(e.target);


  try {

    const r =
      await api('/api/auth/register', {

        method: 'POST',

        body: JSON.stringify(
          Object.fromEntries(
            f.entries()
          )
        )

      });


    state.user = r.user;


    toast('Account created');


    location.hash = '#/account';


  } catch (err) {

    $('#regError').innerHTML =
      `<div class="alert">${err.message}</div>`;

  }
}


/* =========================
   ACCOUNT
========================= */

async function account() {

  if (!state.user) {

    return `
      <div class="page">

        <div class="form-card">

          <h1 class="page-title">
            My Account
          </h1>

          <p class="muted">
            Sign in to view your orders and
            saved delivery details.
          </p>

          <a
            class="gold-btn"
            href="#/login"
          >
            LOGIN
          </a>

        </div>

      </div>
    `;
  }


  const orders =
    await api('/api/orders/my');


  return `
    <div class="page">

      <div class="section-head">

        <div>

          <h1 class="page-title">
            My Account
          </h1>

          <p class="muted">
            Welcome, ${state.user.name}
          </p>

        </div>


        <button
          class="gold-btn"
          onclick="logout()"
        >
          LOGOUT
        </button>

      </div>


      <div class="account-grid">

        <div class="side-nav">

          <button class="active">
            My Orders
          </button>

          <button
            onclick="location.hash='#/profile'"
          >
            Profile
          </button>

        </div>


        <div>

          <h2>
            Order History
          </h2>


          ${
            orders.length

              ? orders.map(o => `

                <div class="order-card">

                  <div
                    style="
                      display:flex;
                      justify-content:space-between;
                      gap:10px
                    "
                  >

                    <b>
                      #2M${String(o.id).padStart(4,'0')}
                    </b>

                    <span class="status">
                      ${o.status}
                    </span>

                  </div>


                  <div
                    class="muted"
                    style="margin:8px 0"
                  >
                    ${
                      new Date(
                        o.created_at
                      ).toLocaleString()
                    }
                  </div>


                  <div>
                    ${
                      o.items.map(i =>
                        `${i.product_name} × ${i.quantity}`
                      ).join(' · ')
                    }
                  </div>


                  <strong
                    style="
                      display:block;
                      margin-top:8px;
                      color:var(--gold2)
                    "
                  >
                    ${money(o.total)}
                  </strong>

                </div>

              `).join('')

              : `

                <div class="empty">
                  No orders yet.
                </div>

              `
          }

        </div>

      </div>

    </div>
  `;
}


/* =========================
   PROFILE
========================= */

async function profile() {

  if (!state.user) {

    location.hash = '#/login';

    return '';
  }


  return `
    <div class="page">

      <form
        class="form-card"
        onsubmit="saveProfile(event)"
      >

        <h1 class="page-title">
          My Profile
        </h1>


        <div class="form-grid">


          <div class="field">

            <label>
              Full Name
            </label>

            <input
              name="name"
              value="${state.user.name || ''}"
              required
            >

          </div>


          <div class="field">

            <label>
              Phone
            </label>

            <input
              name="phone"
              value="${state.user.phone || ''}"
              required
            >

          </div>


          <div class="field">

            <label>
              Governorate
            </label>

            <input
              name="governorate"
              value="${state.user.governorate || ''}"
              required
            >

          </div>


          <div class="field">

            <label>
              Area / City
            </label>

            <input
              name="area"
              value="${state.user.area || ''}"
              required
            >

          </div>


          <div class="field full">

            <label>
              Detailed Address
            </label>

            <textarea
              name="address"
              rows="3"
              required
            >${state.user.address || ''}</textarea>

          </div>


        </div>


        <button
          class="gold-btn"
          style="margin-top:18px"
        >
          SAVE CHANGES
        </button>

      </form>

    </div>
  `;
}


async function saveProfile(e) {

  e.preventDefault();

  const f =
    new FormData(e.target);


  try {

    state.user =
      (
        await api('/api/auth/me', {

          method: 'PUT',

          body: JSON.stringify(
            Object.fromEntries(
              f.entries()
            )
          )

        })
      ).user;


    toast('Profile updated');


  } catch (err) {

    toast(
      err.message,
      'bad'
    );

  }
}


/* =========================
   LOGOUT
========================= */

async function logout() {

  try {

    await api(
      '/api/auth/logout',
      {
        method: 'POST'
      }
    );

  } catch {}


  state.user = null;

  location.hash = '#/';

  toast('Logged out');
}


/* =========================
   SUCCESS
========================= */

function success(number, total) {

  return `
    <div class="page">

      <div
        class="form-card"
        style="text-align:center"
      >

        <div style="font-size:55px">
          ✓
        </div>


        <h1 class="page-title">
          ORDER CONFIRMED
        </h1>


        <p class="muted">
          Thank you for shopping with 2M Store.
        </p>


        <p>
          Your order number is

          <b style="color:var(--gold2)">
            #${number}
          </b>

        </p>


        <h2 style="color:var(--gold2)">
          ${money(total)}
        </h2>


        <p class="muted">
          We will contact you on
          <b>
            ${state.user?.phone || 'your phone'}
          </b>
          to confirm delivery.
        </p>


        <a
          class="gold-btn"
          href="#/account"
        >
          VIEW MY ORDERS
        </a>


        <a
          class="gold-btn"
          href="https://wa.me/201280765582"
          target="_blank"
        >
          WHATSAPP
        </a>

      </div>

    </div>
  `;
}


/* =========================
   ABOUT
========================= */

function about() {

  return `
    <div class="page">

      <h1 class="page-title">
        About 2M Store
      </h1>


      <p
        class="muted"
        style="
          max-width:750px;
          line-height:1.8
        "
      >
        2M Store is an online brand focused on
        watches and signature perfumes.
        We care about presentation, customer
        support and a smooth ordering experience
        from product selection to delivery.
      </p>


      <div
        class="category-grid"
        style="margin-top:25px"
      >


        <div class="category-card">

          <div>

            <b>
              WATCHES
            </b>

            <p class="muted">
              Classic pieces for everyday style.
            </p>

          </div>

          <span class="category-icon">
            ⌚
          </span>

        </div>


        <div class="category-card">

          <div>

            <b>
              SIGNATURE PERFUMES
            </b>

            <p class="muted">
              Fragrances prepared by 2M Store.
            </p>

          </div>

          <span class="category-icon">
            ♧
          </span>

        </div>


      </div>

    </div>
  `;
}


/* =========================
   CONTACT
========================= */

function contact() {

  return `
    <div class="page">

      <div class="form-card">

        <h1 class="page-title">
          Contact Us
        </h1>


        <p class="muted">
          We're here to help with orders,
          products and delivery.
        </p>


        <p>

          ☎

          <a
            style="color:var(--gold)"
            href="tel:01280765582"
          >
            01280765582
          </a>

        </p>


        <p>

          ◉

          <a
            style="color:var(--gold)"
            href="https://wa.me/201280765582"
            target="_blank"
          >
            Chat on WhatsApp
          </a>

        </p>


        <p>

          f

          <a
            style="color:var(--gold)"
            href="https://www.facebook.com/profile.php?id=61584806522383"
            target="_blank"
          >
            2M Store Facebook Page
          </a>

        </p>


        <p>
          Join our WhatsApp community:
        </p>


        <a
          class="gold-btn"
          href="https://chat.whatsapp.com/HelMX26p9tzC8vFu17o7aS"
          target="_blank"
        >
          JOIN WHATSAPP GROUP
        </a>

      </div>

    </div>
  `;
}


/* =====================================================
   ADMIN DASHBOARD
===================================================== */

async function admin() {

  if (
    !state.user ||
    state.user.role !== 'admin'
  ) {

    return `
      <div class="page">

        <div class="form-card">

          <h1 class="page-title">
            Admin Login
          </h1>

          <p class="muted">
            Use your store administrator account.
          </p>

          <a
            class="gold-btn"
            href="#/login"
          >
            LOGIN
          </a>

        </div>

      </div>
    `;
  }


  const [
    stats,
    orders,
    products
  ] = await Promise.all([

    api('/api/admin/stats'),

    api('/api/admin/orders'),

    api('/api/admin/products')

  ]);


  return `
    <div class="page">

      <div class="section-head">

        <h1 class="page-title">
          Admin Dashboard
        </h1>


        <button
          class="gold-btn"
          onclick="logout()"
        >
          LOGOUT
        </button>

      </div>


      <!-- STATS -->

      <div class="stat-grid">

        <div class="stat">

          Orders

          <b>
            ${stats.orders}
          </b>

        </div>


        <div class="stat">

          Revenue

          <b>
            ${money(stats.revenue)}
          </b>

        </div>


        <div class="stat">

          Customers

          <b>
            ${stats.customers}
          </b>

        </div>


        <div class="stat">

          Products

          <b>
            ${stats.products}
          </b>

        </div>

      </div>


      <!-- ADMIN NAV -->

      <div
        class="admin-nav"
        style="margin-top:25px"
      >

        <button
          class="gold-btn"
          onclick="
            document
              .getElementById('ordersAdmin')
              .scrollIntoView()
          "
        >
          ORDERS
        </button>


        <button
          class="gold-btn"
          onclick="
            document
              .getElementById('productsAdmin')
              .scrollIntoView()
          "
        >
          PRODUCTS
        </button>

      </div>


      <!-- ORDERS -->

      <section id="ordersAdmin">

        <h2>
          Orders
        </h2>


        <div style="overflow:auto">

          <table class="admin-table">

            <thead>

              <tr>

                <th>
                  Order
                </th>

                <th>
                  Customer
                </th>

                <th>
                  Total
                </th>

                <th>
                  Status
                </th>

                <th>
                  Change
                </th>

              </tr>

            </thead>


            <tbody>

              ${
                orders.map(o => `

                  <tr>

                    <td>
                      #2M${String(o.id).padStart(4,'0')}
                    </td>


                    <td>

                      ${o.user.name}

                      <br>

                      <span class="muted">
                        ${o.user.phone}
                      </span>

                    </td>


                    <td>
                      ${money(o.total)}
                    </td>


                    <td>
                      ${o.status}
                    </td>


                    <td>

                      <select
                        onchange="
                          changeOrderStatus(
                            ${o.id},
                            this.value
                          )
                        "
                      >

                        ${
                          [
                            'New',
                            'Confirmed',
                            'Preparing',
                            'Shipped',
                            'Delivered',
                            'Cancelled'
                          ]
                          .map(s => `

                            <option
                              value="${s}"
                              ${
                                s === o.status
                                  ? 'selected'
                                  : ''
                              }
                            >
                              ${s}
                            </option>

                          `)
                          .join('')
                        }

                      </select>

                    </td>

                  </tr>

                `).join('')
              }

            </tbody>

          </table>

        </div>

      </section>


      <!-- PRODUCTS -->

      <section
        id="productsAdmin"
        style="margin-top:40px"
      >

        <div
          class="section-head"
        >

          <h2>
            Products
          </h2>

          <button
            class="gold-btn"
            onclick="showAddProductForm()"
          >
            + ADD PRODUCT
          </button>

        </div>


        <!-- =========================
             ADD PRODUCT
        ========================== -->

        <div
          id="addProductBox"
          style="
            display:none;
            margin-bottom:25px
          "
        >

          <form
            class="form-card"
            style="margin:0"
            onsubmit="addAdminProduct(event)"
          >

            <h3>
              Add New Product
            </h3>


            <div class="form-grid">


              <!-- COMMON FIELDS -->

              <div class="field">

                <label>
                  Product Name
                </label>

                <input
                  name="name"
                  required
                >

              </div>


              <div class="field">

                <label>
                  Category
                </label>

                <select
                  name="category"
                  id="addCategory"
                  onchange="toggleAddProductFields()"
                  required
                >

                  <option value="watch">
                    Watch
                  </option>

                  <option value="perfume">
                    Perfume
                  </option>

                </select>

              </div>


              <div class="field">

                <label>
                  Price
                </label>

                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                >

              </div>


              <div class="field">

                <label>
                  Old Price
                </label>

                <input
                  name="oldPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Optional"
                >

              </div>


              <div class="field">

                <label>
                  Stock
                </label>

                <input
                  name="stock"
                  type="number"
                  min="0"
                  value="10"
                  required
                >

              </div>


              <div class="field">

                <label>
                  Gender
                </label>

                <select name="gender">

                  <option value="">
                    Select
                  </option>

                  <option value="Men">
                    Men
                  </option>

                  <option value="Women">
                    Women
                  </option>

                  <option value="Unisex">
                    Unisex
                  </option>

                </select>

              </div>


              <div class="field full">

                <label>
                  Image Path or URL
                </label>

                <input
                  name="image"
                  placeholder="/assets/product.jpg"
                  required
                >

              </div>


              <div class="field full">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  rows="4"
                  placeholder="Product description..."
                ></textarea>

              </div>


              <!-- =========================
                   WATCH FIELDS
              ========================== -->

              <div
                id="addWatchFields"
                style="display:contents"
              >

                <div class="field">

                  <label>
                    Case Material
                  </label>

                  <input
                    name="caseMaterial"
                    placeholder="Example: Stainless Steel"
                  >

                </div>


                <div class="field">

                  <label>
                    Strap Material
                  </label>

                  <input
                    name="strapMaterial"
                    placeholder="Example: Leather"
                  >

                </div>


                <div class="field">

                  <label>
                    Color
                  </label>

                  <input
                    name="color"
                    placeholder="Example: Green"
                  >

                </div>


                <div class="field">

                  <label>
                    Movement
                  </label>

                  <input
                    name="movement"
                    placeholder="Example: Quartz"
                  >

                </div>


                <div class="field">

                  <label>
                    Water Resistance
                  </label>

                  <input
                    name="waterResistance"
                    placeholder="Example: 3 ATM"
                  >

                </div>


                <div class="field">

                  <label>
                    Watch Size / Diameter
                  </label>

                  <input
                    name="watchSize"
                    placeholder="Example: 40mm"
                  >

                </div>

              </div>


              <!-- =========================
                   PERFUME FIELDS
              ========================== -->

              <div
                id="addPerfumeFields"
                style="display:none"
              >

                <div class="field">

                  <label>
                    Volume
                  </label>

                  <input
                    name="volume"
                    placeholder="Example: 50ml"
                  >

                </div>


                <div class="field">

                  <label>
                    Fragrance Family
                  </label>

                  <input
                    name="fragranceFamily"
                    placeholder="Example: Woody / Amber"
                  >

                </div>


                <div class="field">

                  <label>
                    Top Notes
                  </label>

                  <input
                    name="topNotes"
                    placeholder="Example: Citrus"
                  >

                </div>


                <div class="field">

                  <label>
                    Middle Notes
                  </label>

                  <input
                    name="middleNotes"
                    placeholder="Example: Floral"
                  >

                </div>


                <div class="field">

                  <label>
                    Base Notes
                  </label>

                  <input
                    name="baseNotes"
                    placeholder="Example: Musk"
                  >

                </div>

              </div>

            </div>


            <div
              style="
                display:flex;
                gap:10px;
                margin-top:18px
              "
            >

              <button
                class="gold-btn"
              >
                ADD PRODUCT
              </button>


              <button
                type="button"
                onclick="hideAddProductForm()"
              >
                CANCEL
              </button>

            </div>

          </form>

        </div>


        <!-- =========================
             EDIT PRODUCT
        ========================== -->

        <div
          id="editProductBox"
          style="
            display:none;
            margin-bottom:25px
          "
        >

          <form
            class="form-card"
            style="margin:0"
            onsubmit="updateAdminProduct(event)"
          >

            <h3>
              ✏️ Edit Product
            </h3>


            <input
              type="hidden"
              name="id"
              id="editProductId"
            >


            <div class="form-grid">


              <!-- COMMON -->

              <div class="field">

                <label>
                  Product Name
                </label>

                <input
                  id="editName"
                  name="name"
                  required
                >

              </div>


              <div class="field">

                <label>
                  Category
                </label>

                <select
                  id="editCategory"
                  name="category"
                  onchange="toggleEditProductFields()"
                  required
                >

                  <option value="watch">
                    Watch
                  </option>

                  <option value="perfume">
                    Perfume
                  </option>

                </select>

              </div>


              <div class="field">

                <label>
                  Price
                </label>

                <input
                  id="editPrice"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                >

              </div>


              <div class="field">

                <label>
                  Old Price
                </label>

                <input
                  id="editOldPrice"
                  name="oldPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Optional"
                >

              </div>


              <div class="field">

                <label>
                  Stock
                </label>

                <input
                  id="editStock"
                  name="stock"
                  type="number"
                  min="0"
                  required
                >

              </div>


              <div class="field">

                <label>
                  Gender
                </label>

                <select
                  id="editGender"
                  name="gender"
                >

                  <option value="">
                    Select
                  </option>

                  <option value="Men">
                    Men
                  </option>

                  <option value="Women">
                    Women
                  </option>

                  <option value="Unisex">
                    Unisex
                  </option>

                </select>

              </div>


              <div class="field full">

                <label>
                  Image Path or URL
                </label>

                <input
                  id="editImage"
                  name="image"
                  required
                >

              </div>


              <div class="field full">

                <label>
                  Description
                </label>

                <textarea
                  id="editDescription"
                  name="description"
                  rows="4"
                ></textarea>

              </div>


              <!-- =========================
                   WATCH EDIT FIELDS
              ========================== -->

              <div
                id="editWatchFields"
                style="display:contents"
              >

                <div class="field">

                  <label>
                    Case Material
                  </label>

                  <input
                    id="editCaseMaterial"
                    name="caseMaterial"
                    placeholder="Example: Stainless Steel"
                  >

                </div>


                <div class="field">

                  <label>
                    Strap Material
                  </label>

                  <input
                    id="editStrapMaterial"
                    name="strapMaterial"
                    placeholder="Example: Leather"
                  >

                </div>


                <div class="field">

                  <label>
                    Color
                  </label>

                  <input
                    id="editColor"
                    name="color"
                    placeholder="Example: Green"
                  >

                </div>


                <div class="field">

                  <label>
                    Movement
                  </label>

                  <input
                    id="editMovement"
                    name="movement"
                    placeholder="Example: Quartz"
                  >

                </div>


                <div class="field">

                  <label>
                    Water Resistance
                  </label>

                  <input
                    id="editWaterResistance"
                    name="waterResistance"
                    placeholder="Example: 3 ATM"
                  >

                </div>


                <div class="field">

                  <label>
                    Watch Size / Diameter
                  </label>

                  <input
                    id="editWatchSize"
                    name="watchSize"
                    placeholder="Example: 40mm"
                  >

                </div>

              </div>


              <!-- =========================
                   PERFUME EDIT FIELDS
              ========================== -->

              <div
                id="editPerfumeFields"
                style="display:none"
              >

                <div class="field">

                  <label>
                    Volume
                  </label>

                  <input
                    id="editVolume"
                    name="volume"
                    placeholder="Example: 50ml"
                  >

                </div>


                <div class="field">

                  <label>
                    Fragrance Family
                  </label>

                  <input
                    id="editFragranceFamily"
                    name="fragranceFamily"
                    placeholder="Example: Woody / Amber"
                  >

                </div>


                <div class="field">

                  <label>
                    Top Notes
                  </label>

                  <input
                    id="editTopNotes"
                    name="topNotes"
                    placeholder="Example: Citrus"
                  >

                </div>


                <div class="field">

                  <label>
                    Middle Notes
                  </label>

                  <input
                    id="editMiddleNotes"
                    name="middleNotes"
                    placeholder="Example: Floral"
                  >

                </div>


                <div class="field">

                  <label>
                    Base Notes
                  </label>

                  <input
                    id="editBaseNotes"
                    name="baseNotes"
                    placeholder="Example: Musk"
                  >

                </div>

              </div>

            </div>


            <div
              style="
                display:flex;
                gap:10px;
                margin-top:18px
              "
            >

              <button
                class="gold-btn"
              >
                SAVE CHANGES
              </button>


              <button
                type="button"
                onclick="hideEditProductForm()"
              >
                CANCEL
              </button>

            </div>

          </form>

        </div>


        <!-- PRODUCTS TABLE -->

        <div style="overflow:auto">

          <table class="admin-table">

            <thead>

              <tr>

                <th>
                  Image
                </th>

                <th>
                  Product
                </th>

                <th>
                  Category
                </th>

                <th>
                  Price
                </th>

                <th>
                  Old Price
                </th>

                <th>
                  Stock
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              ${
                products.map(p => `

                  <tr>

                    <td>

                      <img
                        src="${p.image}"
                        alt="${p.name}"
                        style="
                          width:55px;
                          height:55px;
                          object-fit:contain;
                          border-radius:8px
                        "
                      >

                    </td>


                    <td>
                      <b>
                        ${p.name}
                      </b>
                    </td>


                    <td>
                      ${p.category}
                    </td>


                    <td>
                      ${money(p.price)}
                    </td>


                    <td>
                      ${
                        p.old_price
                          ? money(p.old_price)
                          : '-'
                      }
                    </td>


                    <td>
                      ${p.stock}
                    </td>


                    <td
                      style="white-space:nowrap"
                    >

                      <button
                        onclick="
                          editProduct(${p.id})
                        "
                      >
                        ✏️ Edit
                      </button>


                      <button
                        onclick="
                          deactivateProduct(${p.id})
                        "
                        style="margin-left:5px"
                      >
                        Hide
                      </button>

                    </td>

                  </tr>

                `).join('')
              }

            </tbody>

          </table>

        </div>

      </section>

    </div>
  `;
}


/* =====================================================
   PRODUCT FIELD TOGGLES
===================================================== */

function toggleAddProductFields() {

  const category =
    document.getElementById(
      'addCategory'
    )?.value;


  const watch =
    document.getElementById(
      'addWatchFields'
    );


  const perfume =
    document.getElementById(
      'addPerfumeFields'
    );


  if (!watch || !perfume) return;


  if (category === 'watch') {

    watch.style.display =
      'contents';

    perfume.style.display =
      'none';

  } else {

    watch.style.display =
      'none';

    perfume.style.display =
      'contents';

  }
}


function toggleEditProductFields() {

  const category =
    document.getElementById(
      'editCategory'
    )?.value;


  const watch =
    document.getElementById(
      'editWatchFields'
    );


  const perfume =
    document.getElementById(
      'editPerfumeFields'
    );


  if (!watch || !perfume) return;


  if (category === 'watch') {

    watch.style.display =
      'contents';

    perfume.style.display =
      'none';

  } else {

    watch.style.display =
      'none';

    perfume.style.display =
      'contents';

  }
}


/* =====================================================
   SHOW ADD PRODUCT
===================================================== */

function showAddProductForm() {

  const editBox =
    document.getElementById(
      'editProductBox'
    );


  const addBox =
    document.getElementById(
      'addProductBox'
    );


  if (editBox)
    editBox.style.display =
      'none';


  if (addBox) {

    addBox.style.display =
      'block';


    const category =
      document.getElementById(
        'addCategory'
      );


    if (category)
      category.value =
        category.value || 'watch';


    toggleAddProductFields();


    addBox.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

  }
}


function hideAddProductForm() {

  const box =
    document.getElementById(
      'addProductBox'
    );


  if (box)
    box.style.display =
      'none';
}


/* =====================================================
   EDIT PRODUCT
===================================================== */

async function editProduct(id) {

  try {

    const p =
      await api(
        '/api/products/' + id
      );


    const editBox =
      document.getElementById(
        'editProductBox'
      );


    if (!editBox) {

      toast(
        'Edit form not found',
        'bad'
      );

      return;
    }


    /* =========================
       COMMON
    ========================= */

    document.getElementById(
      'editProductId'
    ).value =
      p.id;


    document.getElementById(
      'editName'
    ).value =
      p.name || '';


    document.getElementById(
      'editCategory'
    ).value =
      p.category || 'watch';


    document.getElementById(
      'editPrice'
    ).value =
      p.price ?? '';


    document.getElementById(
      'editOldPrice'
    ).value =
      p.old_price ?? '';


    document.getElementById(
      'editStock'
    ).value =
      p.stock ?? 0;


    document.getElementById(
      'editGender'
    ).value =
      p.gender || '';


    document.getElementById(
      'editImage'
    ).value =
      p.image || '';


    document.getElementById(
      'editDescription'
    ).value =
      p.description || '';


    /* =========================
       WATCH DATA
    ========================= */

    document.getElementById(
      'editCaseMaterial'
    ).value =
      p.case_material || '';


    document.getElementById(
      'editStrapMaterial'
    ).value =
      p.strap_material || '';


    document.getElementById(
      'editColor'
    ).value =
      p.color || '';


    document.getElementById(
      'editMovement'
    ).value =
      p.movement || '';


    document.getElementById(
      'editWaterResistance'
    ).value =
      p.water_resistance || '';


    document.getElementById(
      'editWatchSize'
    ).value =
      p.watch_size || p.size || '';


    /* =========================
       PERFUME DATA
    ========================= */

    document.getElementById(
      'editVolume'
    ).value =
      p.volume || p.size || '';


    document.getElementById(
      'editFragranceFamily'
    ).value =
      p.fragrance_family || p.notes || '';


    document.getElementById(
      'editTopNotes'
    ).value =
      p.top_notes || '';


    document.getElementById(
      'editMiddleNotes'
    ).value =
      p.middle_notes || '';


    document.getElementById(
      'editBaseNotes'
    ).value =
      p.base_notes || '';


    /* =========================
       SHOW CORRECT FIELDS
    ========================= */

    toggleEditProductFields();


    /* =========================
       HIDE ADD FORM
    ========================= */

    const addBox =
      document.getElementById(
        'addProductBox'
      );


    if (addBox)
      addBox.style.display =
        'none';


    editBox.style.display =
      'block';


    editBox.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });


  } catch (e) {

    toast(
      e.message,
      'bad'
    );

  }
}


/* =====================================================
   HIDE EDIT
===================================================== */

function hideEditProductForm() {

  const box =
    document.getElementById(
      'editProductBox'
    );


  if (box)
    box.style.display =
      'none';
}


/* =====================================================
   UPDATE PRODUCT
===================================================== */

async function updateAdminProduct(e) {

  e.preventDefault();


  const f =
    new FormData(e.target);


  const id =
    f.get('id');


  const category =
    f.get('category');


  const price =
    Number(
      f.get('price')
    );


  const oldPriceRaw =
    f.get('oldPrice');


  const oldPrice =
    oldPriceRaw === ''
      ? null
      : Number(oldPriceRaw);


  const stock =
    Number(
      f.get('stock')
    );


  if (!id) {

    toast(
      'Product ID is missing',
      'bad'
    );

    return;
  }


  if (
    !f.get('name') ||
    !category ||
    !f.get('image')
  ) {

    toast(
      'Please fill all required fields',
      'bad'
    );

    return;
  }


  if (
    Number.isNaN(price) ||
    price < 0
  ) {

    toast(
      'Invalid price',
      'bad'
    );

    return;
  }


  if (
    Number.isNaN(stock) ||
    stock < 0
  ) {

    toast(
      'Invalid stock',
      'bad'
    );

    return;
  }


  try {

    await api(
      '/api/admin/products/' + id,
      {

        method: 'PUT',

        body: JSON.stringify({

          /* COMMON */

          name:
            f.get('name').trim(),

          category:

            category,

          description:
            f.get('description') || '',

          price:
            price,

          oldPrice:
            oldPrice,

          image:
            f.get('image').trim(),

          stock:
            stock,

          gender:
            f.get('gender') || '',


          /* =========================
             PERFUME
          ========================= */

          volume:
            category === 'perfume'
              ? f.get('volume') || ''
              : '',

          fragranceFamily:
            category === 'perfume'
              ? f.get('fragranceFamily') || ''
              : '',

          topNotes:
            category === 'perfume'
              ? f.get('topNotes') || ''
              : '',

          middleNotes:
            category === 'perfume'
              ? f.get('middleNotes') || ''
              : '',

          baseNotes:
            category === 'perfume'
              ? f.get('baseNotes') || ''
              : '',


          /* =========================
             WATCH
          ========================= */

          caseMaterial:
            category === 'watch'
              ? f.get('caseMaterial') || ''
              : '',

          strapMaterial:
            category === 'watch'
              ? f.get('strapMaterial') || ''
              : '',

          color:
            category === 'watch'
              ? f.get('color') || ''
              : '',

          movement:
            category === 'watch'
              ? f.get('movement') || ''
              : '',

          waterResistance:
            category === 'watch'
              ? f.get('waterResistance') || ''
              : '',

          watchSize:
            category === 'watch'
              ? f.get('watchSize') || ''
              : ''

        })

      }
    );


    toast(
      'Product updated successfully'
    );


    hideEditProductForm();


    await render();


  } catch (e) {

    toast(
      e.message,
      'bad'
    );

  }
}


/* =====================================================
   ADD PRODUCT
===================================================== */

async function addAdminProduct(e) {

  e.preventDefault();


  const f =
    new FormData(e.target);


  const category =
    f.get('category');


  const price =
    Number(
      f.get('price')
    );


  const stock =
    Number(
      f.get('stock')
    );


  const oldPriceRaw =
    f.get('oldPrice');


  const oldPrice =
    oldPriceRaw === ''
      ? null
      : Number(oldPriceRaw);


  if (
    !f.get('name') ||
    !category ||
    !f.get('image')
  ) {

    toast(
      'Please fill all required fields',
      'bad'
    );

    return;
  }


  if (
    Number.isNaN(price) ||
    price < 0
  ) {

    toast(
      'Invalid price',
      'bad'
    );

    return;
  }


  if (
    Number.isNaN(stock) ||
    stock < 0
  ) {

    toast(
      'Invalid stock',
      'bad'
    );

    return;
  }


  try {

    await api(
      '/api/admin/products',
      {

        method: 'POST',

        body: JSON.stringify({

          /* COMMON */

          name:
            f.get('name').trim(),

          category:

            category,

          description:
            f.get('description') || '',

          price:
            price,

          oldPrice:
            oldPrice,

          image:
            f.get('image').trim(),

          stock:
            stock,

          gender:
            f.get('gender') || '',


          /* =========================
             PERFUME
          ========================= */

          volume:
            category === 'perfume'
              ? f.get('volume') || ''
              : '',

          fragranceFamily:
            category === 'perfume'
              ? f.get('fragranceFamily') || ''
              : '',

          topNotes:
            category === 'perfume'
              ? f.get('topNotes') || ''
              : '',

          middleNotes:
            category === 'perfume'
              ? f.get('middleNotes') || ''
              : '',

          baseNotes:
            category === 'perfume'
              ? f.get('baseNotes') || ''
              : '',


          /* =========================
             WATCH
          ========================= */

          caseMaterial:
            category === 'watch'
              ? f.get('caseMaterial') || ''
              : '',

          strapMaterial:
            category === 'watch'
              ? f.get('strapMaterial') || ''
              : '',

          color:
            category === 'watch'
              ? f.get('color') || ''
              : '',

          movement:
            category === 'watch'
              ? f.get('movement') || ''
              : '',

          waterResistance:
            category === 'watch'
              ? f.get('waterResistance') || ''
              : '',

          watchSize:
            category === 'watch'
              ? f.get('watchSize') || ''
              : ''

        })

      }
    );


    toast(
      'Product added successfully'
    );


    e.target.reset();


    const categorySelect =
      document.getElementById(
        'addCategory'
      );


    if (categorySelect)
      categorySelect.value =
        'watch';


    toggleAddProductFields();


    hideAddProductForm();


    await render();


  } catch (e) {

    toast(
      e.message,
      'bad'
    );

  }
}


/* =====================================================
   HIDE PRODUCT
===================================================== */

async function deactivateProduct(id) {

  if (
    !confirm(
      'Hide this product?'
    )
  ) {

    return;
  }


  try {

    await api(
      '/api/admin/products/' + id,
      {
        method: 'DELETE'
      }
    );


    toast(
      'Product hidden'
    );


    await render();


  } catch (e) {

    toast(
      e.message,
      'bad'
    );

  }
}


/* =====================================================
   CHANGE ORDER STATUS
===================================================== */

async function changeOrderStatus(
  id,
  status
) {

  try {

    await api(
      '/api/admin/orders/' + id,
      {

        method: 'PUT',

        body: JSON.stringify({
          status
        })

      }
    );


    toast(
      'Order updated'
    );


    await render();


  } catch (e) {

    toast(
      e.message,
      'bad'
    );

  }
}


/* =====================================================
   SEARCH
===================================================== */

function openSearch() {

  const dialog =
    document.getElementById(
      'searchDialog'
    );


  if (!dialog) return;


  dialog.showModal();


  setTimeout(() => {

    const input =
      document.getElementById(
        'searchInput'
      );


    if (input)
      input.focus();

  }, 50);
}


async function runSearch() {

  const input =
    document.getElementById(
      'searchInput'
    );


  const q =
    input
      ? input.value.trim()
      : '';


  const dialog =
    document.getElementById(
      'searchDialog'
    );


  if (dialog)
    dialog.close();


  if (!q) {

    location.hash =
      '#/shop';

    return;
  }


  try {

    const ps =
      await api(
        '/api/products?search=' +
        encodeURIComponent(q)
      );


    state.products =
      ps;


    $('#app').innerHTML = `

      <div class="page">

        <h1 class="page-title">
          Search Results
        </h1>


        <p class="muted">
          ${ps.length}
          result(s) for “${q}”
        </p>


        <div class="product-grid">

          ${
            ps.length

              ? ps
                  .map(productCard)
                  .join('')

              : `

                <div
                  class="empty"
                  style="grid-column:1/-1"
                >
                  No products found.
                </div>

              `
          }

        </div>

      </div>

    `;


  } catch (e) {

    toast(
      e.message,
      'bad'
    );

  }
}


/* =====================================================
   RENDER
===================================================== */

async function render() {

  updateCartCount();


  const hash =
    location.hash.slice(1) || '/';


  let html = '';


  try {


    if (hash === '/') {

      html =
        await home();


    } else if (
      hash === '/shop'
    ) {

      html =
        await shop();


    } else if (
      hash === '/watches'
    ) {

      html =
        await shop('watch');


    } else if (
      hash === '/perfumes'
    ) {

      html =
        await shop('perfume');


    } else if (
      hash.startsWith('/product/')
    ) {

      html =
        await product(
          hash.split('/')[2]
        );


    } else if (
      hash === '/cart'
    ) {

      html =
        cart();


    } else if (
      hash === '/checkout'
    ) {

      html =
        checkout();


    } else if (
      hash === '/login'
    ) {

      html =
        login();


    } else if (
      hash === '/register'
    ) {

      html =
        register();


    } else if (
      hash === '/account'
    ) {

      html =
        await account();


    } else if (
      hash === '/profile'
    ) {

      html =
        await profile();


    } else if (
      hash === '/about'
    ) {

      html =
        about();


    } else if (
      hash === '/contact'
    ) {

      html =
        contact();


    } else if (
      hash === '/admin'
    ) {

      html =
        await admin();


    } else if (
      hash.startsWith(
        '/order-success/'
      )
    ) {

      const [
        ,
        number,
        total
      ] =
        hash.split('/');


      html =
        success(
          number,
          total
        );


    } else {

      html = `

        <div class="page">

          <div class="empty">
            Page not found.
          </div>

        </div>

      `;

    }


  } catch (e) {

    html = `

      <div class="page">

        <div class="alert">
          ${e.message}
        </div>

      </div>

    `;

  }


  $('#app').innerHTML =
    html;


  document
    .querySelectorAll('nav a')
    .forEach(a => {

      a.classList.toggle(

        'active',

        a.getAttribute('href')
          === '#' + hash

      );

    });


  updateCartCount();
}


/* =====================================================
   BOOT
===================================================== */

async function boot() {

  try {

    state.user =
      (
        await api(
          '/api/auth/me'
        )
      ).user;

  } catch {

    state.user =
      null;

  }


  updateCartCount();


  await render();
}


/* =====================================================
   EVENTS
===================================================== */

window.addEventListener(
  'hashchange',
  render
);


window.addEventListener(
  'load',
  boot
);