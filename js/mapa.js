
document.addEventListener("DOMContentLoaded", async () => {

  // =====================================
  // CONFIGURACIÓN Y ELEMENTOS
  // =====================================

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

  const infoCard = document.getElementById("map-info");
  const closeInfoButton = document.getElementById("close-info");

  const infoTitle = document.getElementById("info-title");
  const infoImage = document.getElementById("info-image");
  const infoDescription = document.getElementById("info-description");
  const infoArtist = document.getElementById("info-artist");
  const infoYear = document.getElementById("info-year");
  const infoDetails = document.getElementById("info-details");
  const infoStatus = document.getElementById("info-status");

  // =====================================
  // CERRAR FICHA DE INFORMACIÓN
  // =====================================

  function closeInfo() {
    infoCard.classList.remove("is-open");
  }

  closeInfoButton.addEventListener("click", closeInfo);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeInfo();
    }
  });

  // =====================================
  // PROGRESO DE LA AVENTURA
  // =====================================

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

  function isWarGiroFound() {
    return getProgress().length === 5 &&
      localStorage.getItem(WAR_KEY) === "true";
  }

  function getWorkByMission(index) {
    return obras.find(obra => obra.missionIndex === index);
  }

  // =====================================
  // ACTUALIZAR MARCADORES
  // =====================================

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

  // =====================================
  // MOSTRAR INFORMACIÓN DE LAS OBRAS
  // =====================================

  function showWork(key) {

    // En celular abre la ficha como ventana emergente
    if (window.matchMedia("(max-width: 760px)").matches) {
      infoCard.classList.add("is-open");
    }

    infoImage.hidden = true;
    infoDetails.hidden = true;

    infoImage.removeAttribute("src");

    // -------------------------------------
    // WAR GIRO
    // -------------------------------------

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

    // -------------------------------------
    // OBRAS DE LAS CINCO MISIONES
    // -------------------------------------

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

  // =====================================
  // EVENTOS DE LOS MARCADORES
  // =====================================

  mapPins.forEach(pin => {
    pin.addEventListener("click", () => {
      showWork(pin.dataset.work);
    });
  });

  // =====================================
  // CARGAR INFORMACIÓN DESDE JSON
  // =====================================

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

    infoStatus.textContent = "";
  }

  // Actualizar progreso si cambia en otra página
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

  // -------------------------------------
  // INICIAR AR
  // -------------------------------------

  async function startAR() {

    document.body.classList.add("ar-active");
    arInterface.setAttribute("aria-hidden", "false");

    arStatus.textContent =
      "Apunta la cámara hacia el mapa impreso...";

    try {

      // Esperar a que A-Frame termine de cargar
      if (!scene.hasLoaded) {
        await new Promise(resolve => {
          scene.addEventListener("loaded", resolve, { once: true });
        });
      }

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

      document.body.classList.remove("ar-active");
      arInterface.setAttribute("aria-hidden", "true");
    }
  }

  // -------------------------------------
  // DETENER AR
  // -------------------------------------

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

  // -------------------------------------
  // DETECCIÓN DEL MAPA IMPRESO
  // -------------------------------------

  mapTarget.addEventListener("targetFound", () => {
    arStatus.textContent =
      "✧ ¡Mapa reconocido! Explora los puntos de interés.";
  });

  mapTarget.addEventListener("targetLost", () => {
    arStatus.textContent =
      "Busca nuevamente el mapa impreso con la cámara.";
  });

  // -------------------------------------
  // CERRAR CÁMARA AL ABANDONAR LA PÁGINA
  // -------------------------------------

  document.addEventListener("visibilitychange", () => {

    if (
      document.hidden &&
      document.body.classList.contains("ar-active")
    ) {
      stopAR();
    }

  });

});
