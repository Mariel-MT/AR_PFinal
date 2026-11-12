document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("works-grid");
  try {
    const response = await fetch("data/obras.json");
    if (!response.ok) throw new Error("No se pudo cargar el catálogo.");
    const obras = await response.json();

    grid.innerHTML = obras.map((obra) => `
      <article class="work-card">
        <div class="work-placeholder" aria-hidden="true">✳</div>
        <span class="work-tag">${escapeHTML(obra.tipo || "Obra")}</span>
        <h2>${escapeHTML(obra.titulo || "Obra sin título")}</h2>
        <p>${escapeHTML(obra.artista || "Autor no identificado")}</p>
        <p>${escapeHTML(obra.tecnica || "Técnica no disponible")} · ${escapeHTML(obra.anio || "Fecha no disponible")}</p>
        <p>${escapeHTML(obra.descripcion || "")}</p>
      </article>
    `).join("");
  } catch (error) {
    console.error(error);
    grid.textContent = "No fue posible cargar el catálogo. Intenta recargar la página.";
  }
});

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}