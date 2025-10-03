// Utilidades simples de almacenamiento
const STORAGE_KEY = "demo-reviews";

function loadReviews() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}
function saveReviews(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// Elementos
const form = document.getElementById("reviewForm");
const ratingValue = document.getElementById("ratingValue");
const charCount = document.getElementById("charCount");
const errorBox = document.getElementById("formError");
const reviewsUL = document.getElementById("reviews");
const avgScoreEl = document.getElementById("avgScore");
const totalCountEl = document.getElementById("totalCount");

const ratingInputs = [...document.querySelectorAll('input[name="rating"]')];
const commentEl = document.getElementById("comment");

// Estado inicial
let reviews = loadReviews();
renderList(reviews);
updateStats(reviews);

// Listeners de rating (actualiza el número mostrado)
ratingInputs.forEach((input) => {
  input.addEventListener("change", () => {
    ratingValue.textContent = Number(input.value).toFixed(1);
    errorBox.textContent = "";
  });
});

// Contador de caracteres del comentario
commentEl.addEventListener("input", () => {
  charCount.textContent = `${commentEl.value.length}/300`;
});

// Submit
form.addEventListener("submit", (e) => {
  e.preventDefault();
  errorBox.textContent = "";

  const rating = getSelectedRating();
  const comment = commentEl.value.trim();

  if (!rating) {
    errorBox.textContent = "Por favor, selecciona una calificación.";
    return;
  }
  if (!comment) {
    errorBox.textContent = "Escribe un comentario breve.";
    return;
  }

  const newReview = {
    id: crypto.randomUUID(),
    rating: Number(rating),
    comment,
    createdAt: new Date().toISOString()
  };

  reviews = [newReview, ...reviews]; // agrega al inicio
  saveReviews(reviews);
  renderList(reviews);
  updateStats(reviews);

  // reset form
  form.reset();
  ratingValue.textContent = "0.0";
  charCount.textContent = "0/300";
});

function getSelectedRating() {
  const sel = ratingInputs.find((i) => i.checked);
  return sel ? sel.value : null;
}

// Render lista
function renderList(list) {
  reviewsUL.innerHTML = "";
  if (!list.length) {
    reviewsUL.innerHTML = `<li class="review">No hay reseñas aún. ¡Sé el primero!</li>`;
    return;
  }

  for (const r of list) {
    const li = document.createElement("li");
    li.className = "review";
    li.innerHTML = `
      <div class="meta">
        <span class="stars-inline" aria-label="${r.rating} estrellas">
          ${renderSmallStars(r.rating)}
        </span>
        <span>${r.rating.toFixed(1)}</span>
        <span style="color:#6b7280;font-weight:400">· ${formatDate(r.createdAt)}</span>
      </div>
      <p class="text"></p>
    `;
    li.querySelector(".text").textContent = r.comment;
    reviewsUL.appendChild(li);
  }
}

function renderSmallStars(value) {
  // pinta 5 estrellas pequeñas, llenas si i <= value
  let html = "";
  for (let i = 1; i <= 5; i++) {
    html += `<svg class="star-small" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l2.9 6.6 7.1.7-5.3 4.6 1.6 6.9L12 17l-6.3 4.8 1.6-6.9L2 9.3l7.1-.7L12 2z"
        fill="${i <= Math.round(value) ? "currentColor" : "#d1d5db"}" />
    </svg>`;
  }
  return html;
}

function updateStats(list) {
  if (!list.length) {
    avgScoreEl.textContent = "—";
    totalCountEl.textContent = "(0 reseñas)";
    return;
  }
  const avg = list.reduce((a, r) => a + r.rating, 0) / list.length;
  avgScoreEl.textContent = avg.toFixed(1);
  totalCountEl.textContent = `(${list.length} ${list.length === 1 ? "reseña" : "reseñas"})`;
}

function formatDate(iso) {
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });
  return fmt.format(d);
}
