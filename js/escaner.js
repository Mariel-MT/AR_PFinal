document.addEventListener("DOMContentLoaded", async () => {
  const statusText = document.getElementById("status-text");
  const card = document.getElementById("art-card");
  const scene = document.getElementById("ar-scene");
  const closeButton = document.getElementById("close-card");
  const retryButton = document.getElementById("retry-button");

  let obras = [];
  let currentTarget = null;

  function setStatus(message) {
    statusText.textContent = message;
  }

  function showFicha(obra) {
    document.getElementById("art-title").textContent = obra.titulo || "Obra sin título";
    document.getElementById("art-artist").textContent = obra.artista || "Autor no identificado";
    document.getElementById("art-year").textContent = obra.anio || "No disponible";
    document.getElementById("art-technique").textContent = obra.tecnica || "No disponible";
    document.getElementById("art-type").textContent = obra.tipo || "No especificado";
    document.getElementById("art-location").textContent = obra.ubicacion || "CCU BUAP";
    document.getElementById("art-description").textContent = obra.descripcion || "";
    card.classList.remove("hidden");
    setStatus("Obra reconocida");
  }

  function hideFicha() {
    card.classList.add("hidden");
    currentTarget = null;
    setStatus("Busca una obra para escanear");
  }

  try {
    const response = await fetch("data/obras.json");
    if (!response.ok) throw new Error("No se pudo cargar data/obras.json");
    obras = await response.json();
  } catch (error) {
    console.error(error);
    setStatus("Error al cargar las fichas. Recarga la página.");
    return;
  }

  // Cada entidad se conecta con un índice de target del archivo .mind.
  obras.forEach((obra) => {
    const target = document.querySelector(`[data-target-index="${obra.targetIndex}"]`);
    if (!target) return;

    target.addEventListener("targetFound", () => {
      currentTarget = obra.targetIndex;
      showFicha(obra);
    });

    target.addEventListener("targetLost", () => {
      if (currentTarget === obra.targetIndex) hideFicha();
    });
  });

  scene.addEventListener("arReady", () => {
    setStatus("Cámara activa. Enfoca la imagen de prueba.");
  });

  scene.addEventListener("arError", (event) => {
    console.error("MindAR error:", event);
    setStatus("No se pudo iniciar la cámara. Revisa los permisos del navegador.");
  });

  closeButton.addEventListener("click", hideFicha);

  retryButton.addEventListener("click", () => {
    hideFicha();
    setStatus("Si la cámara no responde, recarga esta página.");
    window.location.reload();
  });
});