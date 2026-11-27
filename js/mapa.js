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

  // =====================================
  // ELEMENTOS DE LA FICHA
  // =====================================

  const infoTitle = document.getElementById("info-title");
  const infoCard = document.getElementById("map-info");
  const infoImage = document.getElementById("info-image");
  const infoDescription = document.getElementById("info-description");
  const infoArtist = document.getElementById("info-artist");
  const infoYear = document.getElementById("info-year");
  const infoDetails = document.getElementById("info-details");
  const infoStatus = document.getElementById("info-status");

  const closeInfo = document.getElementById("close-info");

  // Cerrar la ficha de información
  if (closeInfo && infoCard) {
    closeInfo.addEventListener("click", () => {
      infoCard.classList.remove("is-open");
    });
  }

  // =====================================
  // LEER PROGRESO GUARDADO
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

  // =====================================
  // COMPROBAR SI SE DESCUBRIÓ WAR GIRO
  // =====================================

  function isWarGiroFound() {
    return getProgress().length === 5 &&
      localStorage.getItem(WAR_KEY) === "true";
  }

  // Buscar obra por número de misión
  function getWorkByMission(index) {
    return obras.find(obra => obra.missionIndex === index);
  }

  // =====================================
  // ACTUALIZAR APARIENCIA DE MARCADORES
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
  // MOSTRAR INFORMACIÓN DE UNA OBRA
  // =====================================

  function showWork(key) {

    // Mostrar la ficha al seleccionar cualquier marcador
    infoCard.classList.add("is-open");

    infoImage.hidden = true;
    infoDetails.hidden = true;

    // =====================================
    // WAR GIRO
    // =====================================

    if (key === "wargiro") {

      if (!isWarGiroFound()) {
        infoTitle.textContent = "Destino secreto";

        infoDescription.textContent =
          "War Giro es el descubrimiento final. " +
          "Completa las cinco misiones y resuelve el último acertijo para encontrarlo.";

        infoStatus.textContent =
          Progreso: ${getProgress().length}/5 misiones completadas;

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

    // =====================================
    // OBRAS DE LAS CINCO MISIONES
    // =====================================

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
      : Misión ${missionIndex + 1} · ${getProgress().length}/5 fragmentos reunidos;
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
  // CARGAR INFORMACIÓN DE LAS OBRAS
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
  const arGuide = document.querySelector(".ar-guide");
  const mapTarget = document.getElementById("map-target");

  let arStarted = false;

  // =====================================
  // INICIAR AR
  // =====================================

  async function startAR() {

    document.body.classList.add("ar-active");
    arInterface.setAttribute("aria-hidden", "false");

    // Restablecer las instrucciones al abrir la cámara
    arGuide.classList.remove("is-hidden");

    arStatus.textContent =
      "Apunta la cámara hacia el mapa impreso...";

    try {

      // Esperar a que A-Frame termine de cargar la escena
      if (!scene.hasLoaded) {
        await new Promise(resolve => {
          scene.addEventListener("loaded", resolve, {
            once: true
          });
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

  // =====================================
  // DETENER AR
  // =====================================

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

    // Preparar las instrucciones para la próxima apertura
    arGuide.classList.remove("is-hidden");
  }

  // Botones de realidad aumentada
  startButton.addEventListener("click", startAR);
  closeButton.addEventListener("click", stopAR);

  // =====================================
  // CUANDO MINDAR RECONOCE EL MAPA
  // =====================================

  mapTarget.addEventListener("targetFound", () => {

    arStatus.textContent =
      "✧ ¡Mapa reconocido! Explora los puntos de interés.";

    // Ocultar las instrucciones de encuadre
    arGuide.classList.add("is-hidden");

  });

  // =====================================
  // CUANDO MINDAR PIERDE EL MAPA
  // =====================================

  mapTarget.addEventListener("targetLost", () => {

    arStatus.textContent =
      "Busca nuevamente el mapa impreso con la cámara.";

    // Volver a mostrar las instrucciones
    arGuide.classList.remove("is-hidden");

  });

  // =====================================
  // DETENER CÁMARA AL ABANDONAR LA PÁGINA
  // =====================================

  document.addEventListener("visibilitychange", () => {

    if (
      document.hidden &&
      document.body.classList.contains("ar-active")
    ) {
      stopAR();
    }

  });

});
