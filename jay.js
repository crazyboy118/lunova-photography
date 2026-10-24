const CONTACT_DEFAULT = {
  phone: "+91 00000 00000",
  email: "yourname@example.com",
  address: "Your City, India",
};

const PRODUCTS = [
  { id: 1, name: "Poster", price: 299 },
  { id: 2, name: "T-Shirt", price: 599 },
  { id: 3, name: "Mug", price: 249 },
  { id: 4, name: "Notebook", price: 149 },
];

const socialURLs = [
  "https://www.facebook.com/",
  "https://twitter.com/",
  "https://www.instagram.com/",
  "https://www.youtube.com/",
];


const check = document.getElementById("check");
const mainBox = document.querySelector(".main_box");
const menuItems = document.querySelectorAll(".sidebar_menu .menu li");
const socialLinks = document.querySelectorAll(".sidebar_menu .social_media a");


const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      showToast("Storage full! Kuch purani cheezein delete karo.");
      return false;
    }
  },
};

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const fixUrl = (u) => (/^https?:\/\//i.test(u) ? u : "https://" + u);


const style = document.createElement("style");
style.textContent = `
  .sidebar_menu .menu li { cursor: pointer; transition: all 0.3s ease; }
  .sidebar_menu { z-index: 100; }
  .btn_one i { z-index: 60; }
  .sidebar_menu .menu li.active { background: rgba(255,215,0,.15); border-left: 4px solid gold; }

  .panel { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-45%);
    width: min(900px, 92vw); max-height: 85vh; overflow-y: auto;
    background: rgba(0,0,0,.72); backdrop-filter: blur(8px);
    border: 1px solid rgba(255,215,0,.4); border-radius: 12px; padding: 28px;
    color: #fff; opacity: 0; pointer-events: none; transition: all .35s ease; z-index: 50; }
  .panel.open { opacity: 1; transform: translate(-50%,-50%); pointer-events: auto; }
  .panel_close { position: absolute; top: 8px; right: 16px; background: none; border: none;
    color: gold; font-size: 32px; cursor: pointer; }
  .panel_title { color: gold; margin-bottom: 18px; font-weight: 600; }

  .btn_gold { background: gold; color: #000; border: none; padding: 10px 18px; border-radius: 6px;
    cursor: pointer; font-weight: 500; font-size: 15px; display: inline-block; }
  .btn_gold:hover { background: #ffe55c; }

  .form { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 18px; }
  .form.col { flex-direction: column; }
  .form input, .form select, .form textarea { padding: 10px 12px; border-radius: 6px;
    border: 1px solid rgba(255,255,255,.3); background: rgba(255,255,255,.1);
    color: #fff; font-size: 15px; flex: 1; min-width: 150px; }
  .form select option { color: #000; }
  .form ::placeholder { color: #bbb; }

  .row { display: flex; justify-content: space-between; align-items: center; gap: 12px;
    padding: 12px 14px; margin-bottom: 8px; background: rgba(255,255,255,.08); border-radius: 8px; }
  .row small { display: block; color: #ccc; font-size: 13px; margin-top: 3px; }
  .row a { font-size: 16px; }
  .del_inline { background: transparent; border: 1px solid #ff6b6b; color: #ff6b6b;
    padding: 5px 10px; border-radius: 5px; cursor: pointer; }

  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-top: 14px; }
  .thumb { position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; }
  .thumb img { width: 100%; height: 100%; object-fit: cover; cursor: zoom-in; transition: transform .3s; }
  .thumb img:hover { transform: scale(1.08); }
  .thumb .del { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,.7); color: #fff;
    border: none; width: 26px; height: 26px; border-radius: 50%; cursor: pointer; font-size: 16px; }

  .card { background: rgba(255,255,255,.08); padding: 16px; border-radius: 8px; text-align: center; }
  .card h3 { margin-bottom: 6px; }
  .card p { margin-bottom: 10px; color: gold; }
  .sub { margin: 20px 0 10px; color: gold; }
  .total { font-weight: 600; font-size: 18px; margin: 12px 0; }
  .empty, .hint { color: #bbb; font-size: 14px; margin-top: 10px; }

  .lightbox { position: fixed; inset: 0; background: rgba(0,0,0,.9); display: flex;
    align-items: center; justify-content: center; z-index: 200; cursor: zoom-out; }
  .lightbox img { max-width: 92vw; max-height: 92vh; border-radius: 8px; }

  .toast { position: fixed; bottom: 30px; right: 30px; background: rgba(0,0,0,.8); color: gold;
    padding: 12px 22px; border-radius: 8px; font-size: 15px; transform: translateY(100px);
    opacity: 0; transition: all .4s ease; z-index: 300; }
  .toast.show { transform: translateY(0); opacity: 1; }
`;
document.head.appendChild(style);


const toast = document.createElement("div");
toast.className = "toast";
document.body.appendChild(toast);
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}


const panel = document.createElement("div");
panel.className = "panel";
panel.innerHTML = `<button class="panel_close" aria-label="Close">&times;</button>
  <h2 class="panel_title"></h2><div class="panel_body"></div>`;
mainBox.appendChild(panel);
panel.querySelector(".panel_close").addEventListener("click", closePanel);

function openPanel(name) {
  panel.querySelector(".panel_title").textContent = name;

  const body = document.createElement("div");
  body.className = "panel_body";
  panel.querySelector(".panel_body").replaceWith(body);
  SECTIONS[name](body);
  panel.classList.add("open");
}
function closePanel() {
  panel.classList.remove("open");
  menuItems.forEach((li) => li.classList.remove("active"));
}


function fieldHTML(f) {
  const req = f.optional ? "" : "required";
  if (f.type === "textarea")
    return `<textarea name="${f.name}" rows="3" placeholder="${f.label}" ${req}></textarea>`;
  if (f.type === "select")
    return `<select name="${f.name}">${f.options.map((o) => `<option value="${o.value}">${o.label}</option>`).join("")}</select>`;
  return `<input name="${f.name}" type="${f.type || "text"}" placeholder="${f.label}" title="${f.label}" ${req}>`;
}

function listSection(body, { key, fields, itemHTML, sort, empty, addLabel = "Add", col = false }) {
  let items = store.get(key, []);
  body.innerHTML = `
    <form class="form ${col ? "col" : ""}">
      ${fields.map(fieldHTML).join("")}
      <button class="btn_gold" type="submit">${addLabel}</button>
    </form>
    <div class="list"></div>`;
  const form = body.querySelector("form");
  const list = body.querySelector(".list");

  const draw = () => {
    const view = sort ? [...items].sort(sort) : items;
    list.innerHTML = view.length
      ? view
          .map((it) => `<div class="row"><div>${itemHTML(it)}</div>
              <button class="del_inline" data-id="${it.id}">Delete</button></div>`)
          .join("")
      : `<p class="empty">${empty}</p>`;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    items.push({ id: Date.now(), ...data });
    if (store.set(key, items)) {
      form.reset();
      draw();
      showToast("Added!");
    } else items.pop();
  });

  list.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-id]");
    if (!btn) return;
    items = items.filter((it) => String(it.id) !== btn.dataset.id);
    store.set(key, items);
    draw();
  });

  draw();
}


function renderGallery(body) {
  let photos = store.get("gallery", []);
  body.innerHTML = `
    <label class="btn_gold">+ Add Photos<input type="file" accept="image/*" multiple hidden></label>
    <div class="grid"></div>`;
  const input = body.querySelector("input");
  const grid = body.querySelector(".grid");

  const draw = () => {
    grid.innerHTML = photos.length
      ? photos
          .map((src, i) => `<div class="thumb"><img src="${src}" data-i="${i}" alt="Photo ${i + 1}">
              <button class="del" data-del="${i}" aria-label="Delete">&times;</button></div>`)
          .join("")
      : `<p class="empty"</p>`;
  };

  input.addEventListener("change", async () => {
    const added = [];
    try {
      for (const file of input.files) added.push(await resizeImage(file));
    } catch {
      showToast("Ek photo load nahi ho payi.");
    }
    if (added.length) {
      photos.push(...added);
      if (store.set("gallery", photos)) showToast(`${added.length} photo add hui`);
      else photos.splice(-added.length);
      draw();
    }
    input.value = "";
  });

  grid.addEventListener("click", (e) => {
    const del = e.target.closest("[data-del]");
    if (del) {
      photos.splice(+del.dataset.del, 1);
      store.set("gallery", photos);
      return draw();
    }
    const img = e.target.closest("img");
    if (img) openLightbox(photos[+img.dataset.i]);
  });

  draw();
}

function resizeImage(file, max = 900) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function openLightbox(src) {
  const box = document.createElement("div");
  box.className = "lightbox";
  box.innerHTML = `<img src="${src}" alt="Full photo">`;
  box.addEventListener("click", () => box.remove());
  document.body.appendChild(box);
}

function renderShortcuts(body) {
  listSection(body, {
    key: "shortcuts",
    fields: [
      { name: "name", label: "Name (e.g. GitHub)" },
      { name: "url", label: "Link (e.g. github.com)" },
    ],
    itemHTML: (it) =>
      `<a href="${esc(fixUrl(it.url))}" target="_blank" rel="noopener noreferrer">${esc(it.name)}</a>
       <small>${esc(it.url)}</small>`,
       empty: "we can add shortcuts in this area :)"
  });
}

function renderExhibits(body) {
  listSection(body, {
    key: "exhibits",
    fields: [
      { name: "title", label: "Exhibit title" },
      { name: "description", label: "Description" },
    ],
    itemHTML: (it) => `<strong>${esc(it.title)}</strong><small>${esc(it.description)}</small>`,
    empty: "This is a Exhibits section :)"
  });
}

function renderEvents(body) {
  listSection(body, {
    key: "events",
    fields: [
      { name: "title", label: "Event name" },
      { name: "date", label: "Date", type: "date" },
      { name: "place", label: "Place (optional)", optional: true },
    ],
    sort: (a, b) => a.date.localeCompare(b.date),
    itemHTML: (it) =>
      `<strong>${esc(it.title)}</strong>
       <small>${esc(it.date)}${it.place ? " · " + esc(it.place) : ""}</small>`,
    empty: "This is the event section of the page :)",
  });
}

function renderStore(body) {
  let cart = store.get("cart", {});
  body.innerHTML = `
    <div class="grid">${PRODUCTS.map((p) => `<div class="card"><h3>${p.name}</h3>
      <p>₹${p.price}</p><button class="btn_gold" data-add="${p.id}">Add to Cart</button></div>`).join("")}</div>
    <h3 class="sub">Your Cart</h3><div class="cart"></div>`;
  const cartEl = body.querySelector(".cart");

  const drawCart = () => {
    const rows = PRODUCTS.filter((p) => cart[p.id]);
    const total = rows.reduce((s, p) => s + p.price * cart[p.id], 0);
    cartEl.innerHTML = rows.length
      ? rows.map((p) => `<div class="row"><div>${p.name} × ${cart[p.id]}
            <small>₹${p.price * cart[p.id]}</small></div>
            <button class="del_inline" data-rem="${p.id}">Remove</button></div>`).join("") +
        `<div class="total">Total: ₹${total}</div>
         <button class="btn_gold" data-checkout>Checkout</button>`
      : `<p class="empty"> website store :)</p>`;
  };

  body.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    const rem = e.target.closest("[data-rem]");
    if (add) {
      cart[add.dataset.add] = (cart[add.dataset.add] || 0) + 1;
      showToast("Added in the cart");
    } else if (rem) {
      delete cart[rem.dataset.rem];
    } else if (e.target.closest("[data-checkout]")) {
      cart = {};
      showToast("Order is placed (demo)");
    } else return;
    store.set("cart", cart);
    drawCart();
  });

  drawCart();
}

function renderContact(body) {
  let info = { ...CONTACT_DEFAULT, ...store.get("contact", {}) };

  function show() {
    body.innerHTML = `
      <div class="row"><div>Phone<small><a href="tel:${esc(info.phone.replace(/[^\d+]/g, ""))}">${esc(info.phone)}</a></small></div></div>
      <div class="row"><div>Email<small><a href="mailto:${esc(info.email)}">${esc(info.email)}</a></small></div></div>
      <div class="row"><div>Address<small>${esc(info.address)}</small></div></div>
      <button class="btn_gold" id="editContact">Edit Details</button>`;
    body.querySelector("#editContact").addEventListener("click", edit);
  }

  function edit() {
    body.innerHTML = `
      <form class="form col">
        <input name="phone" value="${esc(info.phone)}" placeholder="Phone number" required>
        <input name="email" type="email" value="${esc(info.email)}" placeholder="Email" required>
        <input name="address" value="${esc(info.address)}" placeholder="Address" required>
        <button class="btn_gold" type="submit">Save</button>
      </form>`;
    body.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      info = Object.fromEntries(new FormData(e.target));
      store.set("contact", info);
      showToast("Contact details save ho gayi");
      show();
    });
  }

  show();
}

function renderFeedback(body) {
  listSection(body, {
    key: "feedback",
    col: true,
    addLabel: "Submit Feedback",
    fields: [
      { name: "name", label: "Your name" },
      {
        name: "rating",
        type: "select",
        options: [5, 4, 3, 2, 1].map((n) => ({ value: n, label: "★".repeat(n) + "☆".repeat(5 - n) })),
      },
      { name: "message", label: "Write your feedback...", type: "textarea" },
    ],
    sort: (a, b) => b.id - a.id,
    itemHTML: (it) =>
      `<strong>${esc(it.name)}</strong> <span style="color:gold">${"★".repeat(+it.rating)}</span>
       <small>${esc(it.message)}</small>`,
    empty: "You can give your valuable feedback here :)",
  });
}

const SECTIONS = {
  Gallery: renderGallery,
  Shortcuts: renderShortcuts,
  Exhibits: renderExhibits,
  Events: renderEvents,
  Store: renderStore,
  Contact: renderContact,
  Feedback: renderFeedback,
};


const closeSidebar = () => (check.checked = false);

menuItems.forEach((item) => {
  item.setAttribute("tabindex", "0");
  const activate = (e) => {
    e.preventDefault();
    const name = item.querySelector("a").textContent.trim();
    if (!SECTIONS[name]) return;
    menuItems.forEach((li) => li.classList.remove("active"));
    item.classList.add("active");
    openPanel(name);
    setTimeout(closeSidebar, 200);
  };
  item.addEventListener("click", activate);
  item.addEventListener("keydown", (e) => e.key === "Enter" && activate(e));
});

socialLinks.forEach((link, i) => {
  link.href = socialURLs[i];
  link.target = "_blank";
  link.rel = "noopener noreferrer";
});

mainBox.addEventListener("click", (e) => {
  if (!check.checked) return;
  if (e.target.closest("#check, .sidebar_menu, .btn_one, .btn_two")) return;
  closeSidebar();
});


document.addEventListener("keydown", (e) => {
  const typing = e.target.matches("input, textarea, select");
  if (e.key === "Escape") {
    const lb = document.querySelector(".lightbox");
    if (lb) lb.remove();
    else if (panel.classList.contains("open")) closePanel();
    else closeSidebar();
  }
  if (!typing && e.key.toLowerCase() === "m" && !e.ctrlKey && !e.metaKey) {
    check.checked = !check.checked;
  }
});
