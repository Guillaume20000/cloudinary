const cloudBase = "https://res.cloudinary.com/uwt5faeq/image/upload/";
const media = [
  {
    id: "souvenir-campus",
    name: "Sur le campus",
    publicId: "v1794504259/WhatsApp_Image_2026-11-12_at_18.15.34.jpg",
    category: "portrait",
    categoryLabel: "Portrait",
    subtitle: "Une journée en mouvement",
    description:
      "J'ai choisi ce portrait parce qu'il me rappelle une journée passée à l'extérieur, entre les cours et les allées du campus. La lumière, les longues fenêtres et le chemin en damier donnent à l'image une atmosphère particulière. Quand je la regarde, je repense autant au lieu qu'à ce moment de ma vie.",
    alt: "Portrait en pied dans une galerie extérieure",
    details: ["Portrait en pied", "Lumière naturelle", "Original Cloudinary"],
  },
  {
    id: "moment-passage",
    name: "Un instant de passage",
    publicId: "v1794504258/WhatsApp_Image_2026-11-12_at_18.jpg",
    category: "quotidien",
    categoryLabel: "Quotidien",
    subtitle: "Un moment pris sur le vif",
    description:
      "Cette photo garde le souvenir d'un passage dans un couloir ouvert sur l'extérieur. La lumière qui traverse la galerie, les colonnes et la vue sur les alentours font partie de ce que j'avais envie de conserver. C'est un instant simple, mais ces détails me permettent de retrouver l'ambiance du jour.",
    alt: "Portrait dans un couloir ouvert sur l'extérieur",
    details: ["Scène du quotidien", "Cadre extérieur", "Original Cloudinary"],
  },
  {
    id: "elegance-quotidien",
    name: "Élégance au quotidien",
    publicId: "v1794504258/WhatsApp_Image_2026-11-12_at_18.1.jpg",
    category: "portrait",
    categoryLabel: "Portrait",
    subtitle: "Un souvenir tout en présence",
    description:
      "J'ai gardé ce portrait pour son contraste avec les photos prises dehors. Le décor chaleureux, les lumières suspendues et les couleurs de la pièce racontent aussi une partie du souvenir. J'aime retrouver dans cette image les détails du lieu et l'atmosphère de ce moment.",
    alt: "Portrait dans un intérieur chaleureux",
    details: ["Portrait posé", "Décor intérieur", "Original Cloudinary"],
  },
  {
    id: "lieu-a-part",
    name: "Un lieu à part",
    publicId: "v1794504258/WhatsApp_Image_2026-11-12_at_18.15.jpg",
    category: "lieu",
    categoryLabel: "Lieux",
    subtitle: "Une pause dans un décor familier",
    description:
      "Cette image me rappelle une pause devant une porte et un décor que je connais bien. Les marches, la balustrade et les couleurs du bâtiment donnent à cette photo son caractère. Je l'ai ajoutée à l'album pour garder le souvenir du lieu autant que celui de l'instant.",
    alt: "Portrait debout devant une porte",
    details: ["Portrait en pied", "Décor familier", "Original Cloudinary"],
  },
];

const grid = document.querySelector("#media-grid");
const searchInput = document.querySelector("#media-search");
const sortSelect = document.querySelector("#sort-select");
const dialog = document.querySelector("#preview-dialog");
const previewVisual = document.querySelector(".preview-visual");
const modalImage = document.querySelector("#modal-image");
const modalTitle = document.querySelector("#modal-title");
const modalSubtitle = document.querySelector("#modal-subtitle");
const modalDescription = document.querySelector("#modal-description");
const modalCategory = document.querySelector("#modal-category");
const modalCounter = document.querySelector("#modal-counter");
const modalFacts = document.querySelector("#modal-facts");
const modalUrl = document.querySelector("#modal-url");
const modalDownload = document.querySelector("#modal-download");
const modalStatus = document.querySelector("#modal-status");
const toast = document.querySelector("#toast");
const emptyState = document.querySelector("#empty-state");
const filterButtons = [...document.querySelectorAll(".filter-tab")];
let activeFilter = "all";
let visibleMedia = [...media];
let selectedMedia = null;
let lastFocusedElement = null;
let toastTimer;
let touchStart = null;

const originalUrl = (item) => `${cloudBase}${item.publicId}`;
const previewUrl = (item, width = 720) =>
  `${cloudBase}f_auto,q_auto,w_${width},c_limit/${item.publicId}`;

function getFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem("cloudinary-library-favorites") || "[]");
    return Array.isArray(saved) ? saved.filter((id) => media.some((item) => item.id === id)) : [];
  } catch {
    showToast("Les favoris ne peuvent pas être chargés dans ce navigateur.");
    return [];
  }
}

let favorites = getFavorites();

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

function setFavorites(nextFavorites) {
  favorites = nextFavorites;
  try {
    localStorage.setItem("cloudinary-library-favorites", JSON.stringify(favorites));
  } catch {
    showToast("Le favori est sélectionné, mais sa sauvegarde est indisponible.");
  }
  renderMedia();
}

function createMediaCard(item, index) {
  const isFavorite = favorites.includes(item.id);
  const card = document.createElement("article");
  card.className = "photo-card";
  card.dataset.category = item.category;

  const imageFrame = document.createElement("div");
  imageFrame.className = "photo-frame";
  const imageLink = document.createElement("a");
  imageLink.className = "media-image-link";
  imageLink.href = originalUrl(item);
  imageLink.target = "_blank";
  imageLink.rel = "noopener noreferrer";
  imageLink.dataset.mediaId = item.id;
  imageLink.setAttribute("aria-label", `Ouvrir l'aperçu de ${item.name}`);

  const image = document.createElement("img");
  image.src = previewUrl(item);
  image.alt = item.alt;
  image.loading = "lazy";
  image.decoding = "async";
  imageLink.append(image);

  const imageOverlay = document.createElement("span");
  imageOverlay.className = "image-overlay";
  imageOverlay.innerHTML = '<span>Voir la photo <b aria-hidden="true">↗</b></span>';
  imageLink.append(imageOverlay);
  imageFrame.append(imageLink);

  const favoriteButton = document.createElement("button");
  favoriteButton.className = `favorite-button${isFavorite ? " is-favorite" : ""}`;
  favoriteButton.type = "button";
  favoriteButton.setAttribute("aria-label", isFavorite ? `Retirer ${item.name} des favoris` : `Ajouter ${item.name} aux favoris`);
  favoriteButton.setAttribute("aria-pressed", String(isFavorite));
  favoriteButton.textContent = isFavorite ? "★" : "☆";
  favoriteButton.addEventListener("click", () => {
    const next = isFavorite ? favorites.filter((id) => id !== item.id) : [...favorites, item.id];
    setFavorites(next);
  });
  imageFrame.append(favoriteButton);

  const meta = document.createElement("div");
  meta.className = "media-meta";
  const titleRow = document.createElement("div");
  titleRow.className = "media-title-row";
  const title = document.createElement("h3");
  title.textContent = item.name;
  const indexLabel = document.createElement("span");
  indexLabel.className = "media-index";
  indexLabel.textContent = String(index + 1).padStart(2, "0");
  titleRow.append(title, indexLabel);

  const details = document.createElement("div");
  details.className = "media-details";
  const category = document.createElement("span");
  category.className = "media-category";
  category.dataset.category = item.category;
  category.textContent = item.categoryLabel;
  const date = document.createElement("span");
  date.className = "media-date";
  date.textContent = "12 nov. 2026";
  details.append(category, date);
  meta.append(titleRow, details);
  card.append(imageFrame, meta);
  return card;
}

function renderMedia() {
  const searchTerm = searchInput.value.trim().toLocaleLowerCase("fr");
  visibleMedia = media.filter((item) => {
    const matchesCategory = activeFilter === "all" || activeFilter === "favorites" || item.category === activeFilter;
    const matchesSearch = `${item.name} ${item.categoryLabel} ${item.subtitle} ${item.description}`
      .toLocaleLowerCase("fr")
      .includes(searchTerm);
    const matchesFavorites = activeFilter !== "favorites" || favorites.includes(item.id);
    return matchesCategory && matchesSearch && matchesFavorites;
  });

  if (sortSelect.value === "name") {
    visibleMedia.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  }

  grid.replaceChildren(...visibleMedia.map(createMediaCard));
  emptyState.hidden = visibleMedia.length > 0;
  document.querySelector(".filter-tab[data-filter='all'] span").textContent = String(media.length).padStart(2, "0");
  const activeButton = filterButtons.find((button) => button.dataset.filter === activeFilter);
  document.querySelector("#gallery-title").firstChild.textContent =
    activeFilter === "all" ? "Quelques moments " : activeFilter === "favorites" ? "Mes favoris " : `${activeButton.textContent.trim()} `;
}

function showPreview(item, trigger) {
  selectedMedia = item;
  lastFocusedElement = trigger || document.activeElement;
  const index = visibleMedia.findIndex((entry) => entry.id === item.id);
  modalImage.src = previewUrl(item, 1400);
  modalImage.alt = item.alt;
  modalTitle.textContent = item.name;
  modalSubtitle.textContent = item.subtitle;
  modalDescription.textContent = item.description;
  modalCategory.textContent = item.categoryLabel;
  modalCounter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(visibleMedia.length).padStart(2, "0")}`;
  modalUrl.href = originalUrl(item);
  modalUrl.textContent = originalUrl(item);
  modalDownload.href = originalUrl(item).replace("/image/upload/", `/image/upload/fl_attachment:${item.id}/`);
  modalDownload.download = `${item.id}.jpg`;
  modalStatus.textContent = "";
  modalFacts.replaceChildren(
    ...item.details.map((fact) => {
      const element = document.createElement("span");
      element.className = "detail-fact";
      element.textContent = fact;
      return element;
    }),
  );
  if (!dialog.open) dialog.showModal();
  document.querySelector("#modal-close").focus();
}

function movePreview(direction) {
  if (!selectedMedia || visibleMedia.length < 2) return;
  const index = visibleMedia.findIndex((item) => item.id === selectedMedia.id);
  const nextIndex = (index + direction + visibleMedia.length) % visibleMedia.length;
  showPreview(visibleMedia[nextIndex], lastFocusedElement);
}

function updateFilterButtons(activeButton) {
  for (const button of filterButtons) {
    const isActive = button === activeButton;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }
  activeFilter = activeButton.dataset.filter;
  renderMedia();
}

for (const button of filterButtons) {
  button.addEventListener("click", () => updateFilterButtons(button));
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-media-id]");
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const item = media.find((entry) => entry.id === link.dataset.mediaId);
  if (item) showPreview(item, link);
});

searchInput.addEventListener("input", renderMedia);
sortSelect.addEventListener("change", renderMedia);

document.querySelector("#reset-filters").addEventListener("click", () => {
  searchInput.value = "";
  sortSelect.value = "recent";
  updateFilterButtons(filterButtons[0]);
});

document.querySelector("#modal-close").addEventListener("click", () => dialog.close());
document.querySelector("#modal-previous").addEventListener("click", () => movePreview(-1));
document.querySelector("#modal-next").addEventListener("click", () => movePreview(1));
previewVisual.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "touch" && !event.target.closest("button")) {
    touchStart = { x: event.clientX, y: event.clientY };
  }
});
previewVisual.addEventListener("pointerup", (event) => {
  if (event.pointerType !== "touch" || !touchStart || event.target.closest("button")) return;
  const deltaX = event.clientX - touchStart.x;
  const deltaY = event.clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
    movePreview(deltaX < 0 ? 1 : -1);
  }
});
previewVisual.addEventListener("pointercancel", () => {
  touchStart = null;
});
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener("close", () => {
  lastFocusedElement?.focus();
  selectedMedia = null;
});

document.querySelector("#modal-copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(modalUrl.href);
    modalStatus.textContent = "Lien public copié dans le presse-papiers.";
  } catch {
    modalStatus.textContent = "La copie automatique est indisponible. Ouvrez ou sélectionnez le lien public ci-dessus.";
  }
});

document.querySelector("#modal-share").addEventListener("click", async () => {
  if (!navigator.share) {
    modalStatus.textContent = "Le partage direct n'est pas proposé par ce navigateur. Copiez le lien public à la place.";
    return;
  }
  try {
    await navigator.share({ title: `IR Guillaume Ostoko — ${modalTitle.textContent}`, text: modalSubtitle.textContent, url: modalUrl.href });
    modalStatus.textContent = "Le menu de partage a été ouvert.";
  } catch (error) {
    if (error.name !== "AbortError") modalStatus.textContent = "Le partage a échoué. Vous pouvez copier le lien public.";
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !dialog.open && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    searchInput.focus();
  }
  if (!dialog.open) return;
  if (event.key === "ArrowLeft") movePreview(-1);
  if (event.key === "ArrowRight") movePreview(1);
});

renderMedia();
