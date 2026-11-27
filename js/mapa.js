
document.addEventListener("DOMContentLoaded", async () => {

  // =====================================
  // CONFIGURACIÓN Y PROGRESO
  // =====================================

  const STORAGE_KEY = "ccu-guardianes-progreso-v1";
  const WAR_KEY = "ccu-guardianes-war-giro-descubierto";

  const MYSTERY_MESSAGE =
    "Esta obra aún es un misterio. ¡Continúa tu aventura para descubrirla!";

  const completedWorks = {
    bailarina: 0,
    libelula: 1,
    mariposa: 2,
    tiempo: 3,
    vigilante: 4
  };

  const workNames = {
    bailarina: "La Bailarina",
    mariposa: "La Mariposa",
    libelula: "La Libélula",
    vigilante: "El Vigilante",
    tiempo: "El Tiempo",
    wargiro: "War Giro"
  };

  let obras = [];

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

  function isWorkDiscovered(key) {
    if (key === "wargiro") {
      return isWarGiroFound();
    }

    const missionIndex = completedWorks[key];

    if (missionIndex === undefined) {
      return false;
    }

    return getProgress().includes(missionIndex);
  }

  function getWorkByMission(index) {
    return obras.find(obra => obra.missionIndex === index);
  }

  // =====================================
  // MAPA INTERACTIVO
  // =====================================

  const mapPins = document.querySelectorAll(".map-pin");

  const infoTitle = document.getElementById("info-title");
  const infoCard = document.querySelector(".map-info");
  const infoImage = document.getElementById("info-image");
  const infoDescription = document.getElementById("info-description");
  const infoArtist = document.getElementById("info-artist");
  const infoYear = document.getElementById("info-year");
  const infoDetails = document.getElementById("info-details");
  const infoStatus = document.getElementById("info-status");
  const closeInfo = document.getElementById("close-info");

  function updatePins() {
    mapPins.forEach(pin => {
      const key = pin.dataset.work;
      const discovered = isWorkDiscovered(key);

      pin.classList.toggle("is-complete", discovered);
      pin.classList.toggle("is-locked", !discovered);
      pin.classList.toggle(
        "is-final-locked",
        key === "wargiro" && !discovered
      );
    });
  }

  function showMysteryMessage() {
    infoTitle.textContent = "Obra aún por descubrir";
    infoImage.hidden = true;
    infoDetails.hidden = true;

    infoDescription.textContent = MYSTERY_MESSAGE;
    infoStatus.textContent = "✧ Sigue explorando para revelar este punto.";
  }

  function showWork(key) {

    if (window.matchMedia("(max-width: 760px)").matches) {
      infoCard.classList.add("is-open");
    }

    infoImage.hidden = true;
    infoDetails.hidden = true;

    // Bloquear información de obras no descubiertas.
    if (!isWorkDiscovered(key)) {
      showMysteryMessage();
      return;
    }

    // Información de War Giro.
    if (key === "wargiro") {
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

    // Información de las cinco misiones.
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

    infoStatus.textContent =
      "✓ Obra descubierta · Misión " + (missionIndex + 1) + " completada";
  }

  mapPins.forEach(pin => {
    pin.addEventListener("click", () => {
      showWork(pin.dataset.work);
    });
  });

  closeInfo.addEventListener("click", () => {
    infoCard.classList.remove("is-open");
  });

  // =====================================
  // CARGAR DATOS DE LAS OBRAS
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
  }

  // =====================================
  // REALIDAD AUMENTADA
  // =====================================

  const scene = document.getElementById("ar-scene");
  const startButton = document.getElementById("start-ar");
  const closeButton = document.getElementById("close-ar");
  const arInterface = document.getElementById("ar-interface");
  const arStatus = document.getElementById("ar-status");
  const arGuide = document.getElementById("ar-guide");
  const mapTarget = document.getElementById("map-target");

  const arMarkers = document.querySelectorAll(".ar-marker");

  const mysteryMessage = document.getElementById("ar-mystery-message");

  const arCard = document.getElementById("ar-art-card");
  const closeArCard = document.getElementById("close-ar-card");

  const arCardTitle = document.getElementById("ar-card-title");
  const arCardImage = document.getElementById("ar-card-image");
  const arCardDescription = document.getElementById("ar-card-description");
  const arCardDetails = document.getElementById("ar-card-details");
  const arCardArtist = document.getElementById("ar-card-artist");
  const arCardYear = document.getElementById("ar-card-year");

  let arStarted = false;
  let mysteryTimeout = null;

  // Actualizar colores y nombres de los puntos AR.
  function updateARMarkers() {
    arMarkers.forEach(marker => {
      const key = marker.dataset.work;
      const discovered = isWorkDiscovered(key);

      const sphere = marker.querySelector(".ar-marker-sphere");
      const label = marker.querySelector(".ar-marker-label");

      if (sphere) {
        sphere.setAttribute(
          "color",
          discovered ? marker.dataset.color : "#ffffff"
        );
      }

      if (label) {
        label.setAttribute(
          "value",
          discovered ? workNames[key] : "?"
        );
      }

      marker.classList.toggle("is-locked", !discovered);
    });
  }

  function hideArMessages() {
    mysteryMessage.hidden = true;
    arCard.hidden = true;

    if (mysteryTimeout) {
      clearTimeout(mysteryTimeout);
      mysteryTimeout = null;
    }
  }

  function showArMystery() {
    arCard.hidden = true;
    mysteryMessage.hidden = false;

    if (mysteryTimeout) {
      clearTimeout(mysteryTimeout);
    }

    mysteryTimeout = setTimeout(() => {
      mysteryMessage.hidden = true;
      mysteryTimeout = null;
    }, 3500);
  }

  function showArWork(key) {

    // Si no se ha descubierto, mostrar únicamente el mensaje.
    if (!isWorkDiscovered(key)) {
      showArMystery();
      return;
    }

    mysteryMessage.hidden = true;
    arCard.hidden = false;

    arCardImage.hidden = true;
    arCardDetails.hidden = true;

    // Información de War Giro.
    if (key === "wargiro") {
      arCardTitle.textContent = "War Giro";

      arCardDescription.textContent =
        "¡Has encontrado el destino final de Los guardianes del arte! " +
        "Has reunido los cinco fragmentos de la Esencia Creativa.";

      arCardImage.src = "img/obras/war-gero.jpg";
      arCardImage.alt = "Escultura War Giro";
      arCardImage.hidden = false;

      return;
    }

    // Información de las cinco misiones.
    const missionIndex = completedWorks[key];
    const obra = getWorkByMission(missionIndex);

    if (!obra) {
      arCardTitle.textContent = "Obra no disponible";
      arCardDescription.textContent =
        "No se encontró la información de esta obra.";
      return;
    }

    arCardTitle.textContent = obra.titulo;
    arCardDescription.textContent = obra.descripcion || "";

    arCardImage.src = obra.imagen;
    arCardImage.alt = obra.titulo;
    arCardImage.hidden = false;

    arCardArtist.textContent = obra.artista || "No disponible";
    arCardYear.textContent = obra.anio || "No disponible";

    arCardDetails.hidden = false;
  }

  // Hacer interactivos los seis puntos de la cámara.
  arMarkers.forEach(marker => {
    marker.addEventListener("click", event => {
      event.stopPropagation();

      const key = marker.dataset.work;
      showArWork(key);
    });
  });

  closeArCard.addEventListener("click", () => {
    arCard.hidden = true;
  });

  // =====================================
  // INICIAR Y CERRAR CÁMARA
  // =====================================

  async function startAR() {

    document.body.classList.add("ar-active");
    arInterface.setAttribute("aria-hidden", "false");

    hideArMessages();
    updateARMarkers();

    arGuide.classList.remove("is-hidden");

    arStatus.textContent =
      "Apunta la cámara hacia el mapa impreso...";

    try {
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

    hideArMessages();

    document.body.classList.remove("ar-active");
    arInterface.setAttribute("aria-hidden", "true");
  }

  startButton.addEventListener("click", startAR);
  closeButton.addEventListener("click", stopAR);

  // =====================================
  // DETECCIÓN DEL MAPA
  // =====================================

  mapTarget.addEventListener("targetFound", () => {

    arStatus.textContent =
      "✧ ¡Mapa reconocido! Toca los puntos para explorar.";

    arGuide.classList.add("is-hidden");
  });

  mapTarget.addEventListener("targetLost", () => {

    arStatus.textContent =
      "Busca nuevamente el mapa impreso con la cámara.";

    arGuide.classList.remove("is-hidden");

    hideArMessages();
  });

  // =====================================
  // ACTUALIZAR PROGRESO
  // =====================================

  function refreshProgress() {
    updatePins();
    updateARMarkers();
  }

  window.addEventListener("storage", refreshProgress);
  window.addEventListener("pageshow", refreshProgress);

  // Actualizar al volver a la pestaña.
  document.addEventListener("visibilitychange", () => {

    if (document.hidden && document.body.classList.contains("ar-active")) {
      stopAR();
    } else {
      refreshProgress();
    }

  });

});
