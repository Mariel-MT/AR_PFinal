
document.addEventListener("DOMContentLoaded", async () => {

  const STORAGE_KEY = "ccu-guardianes-progreso-v1";
  const WAR_KEY = "ccu-guardianes-war-giro-descubierto";

  const completedWorks = {
    bailarina: 0,
    libelula: 1,
    mariposa: 2,
    tiempo: 3,
    vigilante: 4
  };

  const mapPins = document.querySelectorAll(".map-pin");

  let obras = [];

  // Elementos de la ficha
  const infoTitle = document.getElementById("info-title");
  const infoCard = document.querySelector(".map-info");
  const infoImage = document.getElementById("info-image");
  const infoDescription = document.getElementById("info-description");
  const infoArtist = document.getElementById("info-artist");
  const infoYear = document.getElementById("info-year");
  const infoDetails = document.getElementById("info-details");
  const infoStatus = document.getElementById("info-status");

  // Botón de cierre que ya existe en mapa.html
const closeInfo = document.getElementById("close-info");

closeInfo.addEventListener("click", () => {
  infoCard.classList.remove("is-open");
});


  
  // Leer progreso guardado
  function getProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

      if (saved && Array.isArray(saved.completed)) {
        return saved.completed.filter(
          n => Number.isInteger(n) && n >= 0 && n < 5
        );
      }
    } catch (error) {
      console.error("No se pudo leer el progreso:", error);
    }

    return [];
  }

  // Comprobar si se descubrió War Giro
  function isWarGiroFound() {
    return getProgress().length === 5 &&
      localStorage.getItem(WAR_KEY) === "true";
  }

  // Buscar obra por número de misión
  function getWorkByMission(index) {
    return obras.find(obra => obra.missionIndex === index);
  }

  // Actualizar apariencia de los marcadores
  function updatePins() {
    const completed = getProgress();

    mapPins.forEach(pin => {
      const key = pin.dataset.work;

      if (key === "wargiro") {
        const found = isWarGiroFound();

        pin.classList.toggle("is-complete", found);
        pin.classList.toggle("is-final-locked", !found);
        return;
      }

      const missionIndex = completedWorks[key];
      const done = completed.includes(missionIndex);

      pin.classList.toggle("is-complete", done);
    });
  }

  // Mostrar información de una obra
  function showWork(key) {

    // En celular, abrir la ficha emergente
    if (window.matchMedia("(max-width: 760px)").matches) {
      infoCard.classList.add("is-open");
    }

    infoImage.hidden = true;
    infoDetails.hidden = true;

    if (key === "wargiro") {

      if (!isWarGiroFound()) {
        infoTitle.textContent = "Destino secreto";

        infoDescription.textContent =
          "War Giro es el descubrimiento final. " +
          "Completa las cinco misiones y resuelve el último acertijo para encontrarlo.";

        infoStatus.textContent =
          `Progreso: ${getProgress().length}/5 misiones completadas`;

        return;
      }

      infoTitle.textContent = "War Giro";

      infoDescription.textContent =
        "¡Has encontrado el destino final de Los guardianes del arte! " +
        "Has reunido los cinco fragmentos de la Esencia Creativa.";

      infoImage.src = "img/obras/war-gero.jpg";
      infoImage.alt = "Escultura War Giro";
      infoImage.hidden = false;

      infoStatus.textContent = "✧ ¡Destino final descubierto!";

      return;
    }

    const missionIndex = completedWorks[key];
    const obra = getWorkByMission(missionIndex);

    if (!obra) {
      infoTitle.textContent = "Obra no disponible";
      infoDescription.textContent =
        "No se encontró la información de esta obra.";
      infoStatus.textContent = "";
      return;
    }

    infoTitle.textContent = obra.titulo;
    infoDescription.textContent = obra.descripcion || "";

    infoImage.src = obra.imagen;
    infoImage.alt = obra.titulo;
    infoImage.hidden = false;

    infoArtist.textContent = obra.artista || "No disponible";
    infoYear.textContent = obra.anio || "No disponible";
    infoDetails.hidden = false;

    const done = getProgress().includes(missionIndex);

    infoStatus.textContent = done
      ? "✓ Misión completada · Fragmento conseguido"
      : `Misión ${missionIndex + 1} · ${getProgress().length}/5 fragmentos reunidos`;
  }

  // Eventos de los marcadores
  mapPins.forEach(pin => {
    pin.addEventListener("click", () => {
      showWork(pin.dataset.work);
    });
  });

  // Cargar información de las obras
  try {
    const response = await fetch("data/obras.json");

    if (!response.ok) {
      throw new Error("No se pudo cargar data/obras.json");
    }

    obras = await response.json();

    updatePins();

  } catch (error) {
    console.error(error);

    infoTitle.textContent = "Error al cargar el mapa";
    infoDescription.textContent =
      "No fue posible cargar la información de las obras.";
  }

  // Actualizar marcadores si cambia el progreso
  window.addEventListener("storage", updatePins);
  window.addEventListener("pageshow", updatePins);

  // =====================================
  // REALIDAD AUMENTADA
  // =====================================

  const scene = document.getElementById("ar-scene");
  const startButton = document.getElementById("start-ar");
  const closeButton = document.getElementById("close-ar");
  const arInterface = document.getElementById("ar-interface");
  const arStatus = document.getElementById("ar-status");
  const mapTarget = document.getElementById("map-target");

  let arStarted = false;

  async function startAR() {

    document.body.classList.add("ar-active");
    arInterface.setAttribute("aria-hidden", "false");

    arStatus.textContent =
      "Apunta la cámara hacia el mapa impreso...";

    try {
      const mindarSystem =
        scene.systems["mindar-image-system"];

      if (!mindarSystem) {
        throw new Error("No se pudo inicializar MindAR.");
      }

      await mindarSystem.start();

      arStarted = true;

    } catch (error) {
      console.error("Error al iniciar la cámara:", error);

      arStatus.textContent =
        "No se pudo abrir la cámara. Revisa los permisos del navegador.";
    }
  }

  async function stopAR() {

    try {
      const mindarSystem =
        scene.systems["mindar-image-system"];

      if (arStarted && mindarSystem) {
        await mindarSystem.stop();
      }

    } catch (error) {
      console.warn("No se pudo detener la cámara:", error);
    }

    arStarted = false;

    document.body.classList.remove("ar-active");
    arInterface.setAttribute("aria-hidden", "true");
  }

  startButton.addEventListener("click", startAR);
  closeButton.addEventListener("click", stopAR);

  // Cuando MindAR reconoce el mapa
  mapTarget.addEventListener("targetFound", () => {
    arStatus.textContent =
      "✧ ¡Mapa reconocido! Explora los puntos de interés.";
  });

  // Cuando deja de reconocerlo
  mapTarget.addEventListener("targetLost", () => {
    arStatus.textContent =
      "Busca nuevamente el mapa impreso con la cámara.";
  });

  // Detener cámara al abandonar la página
  document.addEventListener("visibilitychange", () => {
    if (
      document.hidden &&
      document.body.classList.contains("ar-active")
    ) {
      stopAR();
    }
  });

});
