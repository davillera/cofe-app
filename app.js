// ====== Datos dummy de ítems (pedido) ======
const ITEMS = [
  {
    id: "cap-001",
    qty: 1,
    name: "Cappuccino",
    price: 3.15,
    image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "mal-002",
    qty: 1,
    name: "Malteada",
    price: 3.10,
    image: "https://images.unsplash.com/photo-1460306855393-0410f61241c7?q=80&w=600&auto=format&fit=crop"
  }
];

const STORAGE_KEY = "coffee-reviews-by-item"; // { [itemId]: Review[] }
const $ = (sel) => document.querySelector(sel);

const itemsList = $("#itemsList");
const reviewsUL = $("#reviews");
const currentItemName = $("#currentItemName");
const currentItemPrice = $("#currentItemPrice");
const avgForItem = $("#avgForItem");

const ratingInputs = [...document.querySelectorAll('input[name="rating"]')];
const ratingValue = $("#ratingValue");
const commentEl = $("#comment");
const charCount = $("#charCount");
const errorBox = $("#formError");
const form = $("#reviewForm");

let selectedItemId = ITEMS[0].id; // por defecto primer item

// ====== Storage helpers ======
function loadAll() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}; }
  catch { return {}; }
}
function saveAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function getReviewsFor(itemId) {
  const all = loadAll();
  return all[itemId] ?? [];
}
function addReview(itemId, review) {
  const all = loadAll();
  all[itemId] = [review, ...(all[itemId] ?? [])];
  saveAll(all);
}

// ====== Render de ítems ======
function renderItems() {
  itemsList.innerHTML = "";
  for (const it of ITEMS) {
    const li = document.createElement("li");
    li.className = "item";
    li.dataset.id = it.id;
    li.innerHTML = `
      <img src="${it.image}" alt="${it.name}" />
      <div class="info">
        <div class="row-top">
          <span class="qty">${it.qty}x</span>
          <span class="name">${it.name}</span>
        </div>
        <div class="price">$${it.price.toFixed(2)}</div>
      </div>
    `;
    if (it.id === selectedItemId) li.classList.add("active");
    li.addEventListener("click", () => selectItem(it.id));
    itemsList.appendChild(li);
  }
}
function selectItem(id) {
  selectedItemId = id;
  [...document.querySelectorAll(".item")].forEach(li =>
    li.classList.toggle("active", li.dataset.id === id)
  );

  const it = ITEMS.find(i => i.id === id);
  currentItemName.textContent = it.name;
  currentItemPrice.textContent = `· $${it.price.toFixed(2)}`;

  // reset UI de rating/comentario
  form.reset();
  ratingValue.textContent = "0.0";
  commentEl.value = "";
  charCount.textContent = "0/300";
  errorBox.textContent = "";

  renderReviewsFor(id);
  updateAvgFor(id);
}

// ====== Estrellas / comentario UI ======
ratingInputs.forEach(inp => {
  inp.addEventListener("change", () => {
    ratingValue.textContent = Number(inp.value).toFixed(1);
    errorBox.textContent = "";
  });
});
commentEl.addEventListener("input", () => {
  charCount.textContent = `${commentEl.value.length}/300`;
});

// ====== Envío de review ======
form.addEventListener("submit", (e) => {
  e.preventDefault();
  errorBox.textContent = "";

  const rating = getSelectedRating();
  const comment = commentEl.value.trim();

  if (!rating) {
    errorBox.textContent = "Selecciona una calificación.";
    return;
  }
  if (!comment) {
    errorBox.textContent = "Escribe un comentario.";
    return;
  }

  const review = {
    id: crypto.randomUUID(),
    rating: Number(rating),
    text: comment,
    createdAt: new Date().toISOString()
  };

  addReview(selectedItemId, review);
  renderReviewsFor(selectedItemId);
  updateAvgFor(selectedItemId);

  form.reset();
  ratingValue.textContent = "0.0";
  charCount.textContent = "0/300";
});

// ====== Render reseñas ======
function renderReviewsFor(itemId) {
  const list = getReviewsFor(itemId);
  reviewsUL.innerHTML = "";

  if (!list.length) {
    reviewsUL.innerHTML = `<li class="review">Aún no hay reseñas para este producto.</li>`;
    return;
  }

  for (const r of list) {
    const li = document.createElement("li");
    li.className = "review";
    li.innerHTML = `
      <div class="head">
        <span class="stars-inline" aria-label="${r.rating} estrellas">
          ${renderSmallStars(r.rating)}
        </span>
        <strong>${r.rating.toFixed(1)}</strong>
        <span class="date">${formatDate(r.createdAt)}</span>
      </div>
      <p class="text"></p>
    `;
    li.querySelector(".text").textContent = r.text;
    reviewsUL.appendChild(li);
  }
}

function renderSmallStars(value) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    const fill = i <= Math.round(value) ? "currentColor" : "#e1d6cc";
    html += `<svg class="star-small" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l2.9 6.6 7.1.7-5.3 4.6 1.6 6.9L12 17l-6.3 4.8 1.6-6.9L2 9.3l7.1-.7L12 2z" fill="${fill}"/>
    </svg>`;
  }
  return html;
}

function getSelectedRating() {
  const sel = ratingInputs.find(r => r.checked);
  return sel ? sel.value : null;
}

function updateAvgFor(itemId) {
  const list = getReviewsFor(itemId);
  if (!list.length) { avgForItem.textContent = "Promedio: —"; return; }
  const avg = list.reduce((a,b)=>a+b.rating,0) / list.length;
  avgForItem.textContent = `Promedio: ${avg.toFixed(1)} (${list.length})`;
}

function formatDate(iso) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("es-CO", {dateStyle:"medium"}).format(d);
}

// ====== Init ======
renderItems();
selectItem(selectedItemId);
