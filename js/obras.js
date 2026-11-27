
document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("works-grid");
  const STORAGE_KEY = "ccu-guardianes-progreso-v1";

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

      if (saved && Array.isArray(saved.completed)) {
        return [
          ...new Set(
            saved.completed.filter(
              n => Number.isInteger(n) && n >= 0 && n < 5
            )
          )
        ];
      }
    } catch (error) {
      console.error("No se pudo leer el progreso:", error);
    }

    return [];
  }

  function isUnlocked(index, completed) {
    if (index === 0) return true;

    for (let i = 0; i < index; i++) {
      if (!completed.includes(i)) {
        return false;
      }
    }

    return true;
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  }

  try {
    const response = await fetch("data/obras.json");

    if (!response.ok) {
      throw new Error("No se pudo cargar el catálogo.");
    }

    const obras = await response.json();

    if (!Array.isArray(obras)) {
      throw new Error("El archivo de obras no tiene el formato esperado.");
    }

    const completed = loadProgress();

    const unlockedWorks = obras
      .filter(obra => isUnlocked(obra.missionIndex, completed))
      .sort((a, b) => a.missionIndex - b.missionIndex);

    if (unlockedWorks.length === 0) {
      grid.textContent = "Todavía no hay obras descubiertas.";
      return;
    }

    grid.innerHTML = unlockedWorks.map(obra => {
      const titulo = obra.titulo || "Obra sin título";
      const imagen = obra.imagen || "";

      const imageHTML = imagen
        ? `
          <img
            class="work-image"
            src="${escapeHTML(imagen)}"
            alt="Imagen de ${escapeHTML(titulo)}"
            loading="lazy"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';"
          >
          <div class="work-placeholder" aria-hidden="true" style="display:none;">
            ✳
          </div>
        `
        : `
          <div class="work-placeholder" aria-hidden="true">
            ✳
          </div>
        `;

      return `
        <article class="work-card">
          <div class="work-image-container">
            ${imageHTML}
          </div>

          <span class="work-tag">
            ${escapeHTML(obra.tipo || "Obra")}
          </span>

          <h2>${escapeHTML(titulo)}</h2>

          <p>${escapeHTML(obra.artista || "Autor no identificado")}</p>

          <p>
            ${escapeHTML(obra.tecnica || "Técnica no disponible")}
            ·
            ${escapeHTML(obra.anio || "Fecha no disponible")}
          </p>

          <p>${escapeHTML(obra.descripcion || "")}</p>
        </article>
      `;
    }).join("");

  } catch (error) {
    console.error(error);

    grid.textContent =
      "No fue posible cargar el catálogo. Intenta recargar la página.";
  }
});
