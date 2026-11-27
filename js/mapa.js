
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

  const workNames = {
    bailarina: "La Bailarina",
    libelula: "La Libélula",
    mariposa: "La Mariposa",
    tiempo: "El Tiempo",
    vigilante: "El Vigilante",
    wargiro: "War Giro"
  };

  const mapPins = document.querySelectorAll(".map-pin");
  const arMarkers = document.querySelectorAll(".ar-marker");

  let obras = [];

  // =====================================
  // ELEMENTOS DE LA FICHA DEL MAPA
  // =====================================

  const infoTitle = document.getElementById("info-title");
  const infoCard = document.getElementById("map-info");
  const infoImage = document.getElementById("info-image");
  const infoDescription = document.getElementById("info-description");
  const infoArtist = document.getElementById("info-artist");
  const infoYear = document.getElementById("info-year");
  const infoDetails = document.getElementById("info-details");
  const infoStatus = document.getElementById("info-status");
  const infoLink = document.getElementById("info-link");

  const closeInfo = document.getElementById("close-info");

  if (closeInfo && infoCard) {
    closeInfo.addEventListener("click", () => {
      infoCard.classList.remove("is-open");
    });
  }

  // =====================================
  // ELEMENTOS DE LA INTERFAZ AR
  // =====================================

  const arMysteryMessage =
    document.getElementById("ar-mystery-message");

  const arArtCard =
    document.getElementById("ar-art-card");

  const arCardTitle =
    document.getElementById("ar-card-title");

  const arCardImage =
    document.getElementById("ar-card-image");

  const arCardDescription =
    document.getElementById("ar-card-description");

  const arCardArtist =
    document.getElementById("ar-card-artist");

  const arCardYear =
    document.getElementById("ar-card-year");

  const arCardDetails =
    document.getElementById("ar-card-details");

  const closeArCard =
    document.getElementById("close-ar-card");

  // =====================================
  // LEER PROGRESO GUARDADO
  // =====================================

  function getProgress() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      );

      if (saved && Array.isArray(saved.completed)) {
        return [...new Set(
          saved.completed.filter(
            n => Number.isInteger(n) && n >= 0 && n < 5
          )
        )];
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

  // =====================================
  // COMPROBAR SI UNA OBRA FUE DESCUBIERTA
  // =====================================

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

  // Buscar obra por número de misión
  function getWorkByMission(index) {
    return obras.find(
      obra => Number(obra.missionIndex) === index
    );
  }

  // =====================================
  // ACTUALIZAR MARCADORES DEL MAPA
  // =====================================

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

  // =====================================
  // ACTUALIZAR ESFERAS DEL MAPA AR
  // =====================================

  function updateArMarkers() {

    arMarkers.forEach(marker => {

      const key = marker.dataset.work;
      const discovered = isWorkDiscovered(key);

      const sphere = marker.querySelector(
        ".ar-marker-sphere"
      );

      const label = marker.querySelector(
        ".ar-marker-label"
      );

      if (!sphere || !label) return;

      if (discovered) {

        sphere.setAttribute(
          "color",
          marker.dataset.color
        );

        label.setAttribute(
          "value",
          workNames[key]
        );

      } else {

        sphere.setAttribute("color", "#000000");

        label.setAttribute("value", "?");

      }

    });
  }

  // =====================================
  // ACTUALIZAR TODOS LOS MARCADORES
  // =====================================

  function updateAllMarkers() {
    updatePins();
    updateArMarkers();
  }

  // =====================================
  // OCULTAR MENSAJES Y FICHAS AR
  // =====================================

  function hideArMessages() {

    if (arMysteryMessage) {
      arMysteryMessage.hidden = true;
    }

    if (arArtCard) {
      arArtCard.hidden = true;
    }
  }

  // =====================================
  // MOSTRAR MENSAJE DE OBRA MISTERIOSA
  // =====================================

  function showArMystery() {

    hideArMessages();

    if (arMysteryMessage) {
      arMysteryMessage.hidden = false;
    }

  }

  // =====================================
  // MOSTRAR INFORMACIÓN DE OBRA EN AR
  // =====================================

  function showArWork(key) {

    hideArMessages();

    if (!isWorkDiscovered(key)) {
      showArMystery();
      return;
    }

    if (!arArtCard) return;

    // =====================================
    // WAR GIRO
    // =====================================

    if (key === "wargiro") {

      arCardTitle.textContent = "War Giro";

      arCardDescription.textContent =
        "¡Has encontrado el destino final de Los guardianes del arte! " +
        "Has reunido los cinco fragmentos de la Esencia Creativa.";

      arCardImage.src = "img/obras/war-gero.jpg";
      arCardImage.alt = "Escultura War Giro";
      arCardImage.hidden = false;

      arCardDetails.hidden = true;

      arArtCard.hidden = false;

      return;
    }

    // =====================================
    // OBRAS DE LAS CINCO MISIONES
    // =====================================

    const missionIndex = completedWorks[key];
    const obra = getWorkByMission(missionIndex);

    if (!obra) {

      arCardTitle.textContent = "Obra no disponible";

      arCardDescription.textContent =
        "No se encontró la información de esta obra.";

      arCardImage.hidden = true;
      arCardDetails.hidden = true;

      arArtCard.hidden = false;

      return;
    }

    arCardTitle.textContent = obra.titulo;

    arCardDescription.textContent =
      obra.descripcion || "";

    arCardImage.src = obra.imagen;
    arCardImage.alt = obra.titulo;
    arCardImage.hidden = !obra.imagen;

    arCardArtist.textContent =
      obra.artista || "No disponible";

    arCardYear.textContent =
      obra.anio || "No disponible";

    arCardDetails.hidden = false;

    arArtCard.hidden = false;
  }

  // =====================================
  // MOSTRAR INFORMACIÓN EN EL MAPA
  // =====================================

  function showWork(key) {

    infoCard.classList.add("is-open");

    infoImage.hidden = true;
    infoDetails.hidden = true;

    // =====================================
    // OBRAS BLOQUEADAS
    // =====================================

    if (!isWorkDiscovered(key)) {

      infoTitle.textContent = "Obra misteriosa";

      infoDescription.textContent =
        "Esta obra aún es un misterio. " +
        "¡Continúa tu aventura para descubrirla!";

      infoStatus.textContent =
        key === "wargiro"
          ? `Destino final bloqueado · ${getProgress().length}/5 misiones completadas`
          : "Completa la misión correspondiente para descubrir esta obra.";

      if (infoLink) {
        infoLink.hidden = false;
        infoLink.href = "aventura.html";
        infoLink.textContent = "Continuar la aventura →";
      }

      return;
    }

    // =====================================
    // WAR GIRO DESCUBIERTO
    // =====================================

    if (key === "wargiro") {

      infoTitle.textContent = "War Giro";

      infoDescription.textContent =
        "¡Has encontrado el destino final de Los guardianes del arte! " +
        "Has reunido los cinco fragmentos de la Esencia Creativa.";

      infoImage.src = "img/obras/war-gero.jpg";
      infoImage.alt = "Escultura War Giro";
      infoImage.hidden = false;

      infoStatus.textContent =
        "✧ ¡Destino final descubierto!";

      if (infoLink) {
        infoLink.hidden = false;
        infoLink.href = "aventura.html";
        infoLink.textContent = "Volver a la aventura →";
      }

      return;
    }

    // =====================================
    // OBRAS DESCUBIERTAS
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

    infoDescription.textContent =
      obra.descripcion || "";

    infoImage.src = obra.imagen;
    infoImage.alt = obra.titulo;
    infoImage.hidden = false;

    infoArtist.textContent =
      obra.artista || "No disponible";

    infoYear.textContent =
      obra.anio || "No disponible";

    infoDetails.hidden = false;

    infoStatus.textContent =
      "✓ Misión completada · Fragmento conseguido";

    if (infoLink) {
      infoLink.hidden = false;
      infoLink.href = "aventura.html";
      infoLink.textContent = "Consultar la aventura →";
    }
  }

  // =====================================
  // EVENTOS DE LOS MARCADORES DEL MAPA
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

    updateAllMarkers();

  } catch (error) {

    console.error(error);

    infoTitle.textContent = "Error al cargar el mapa";

    infoDescription.textContent =
      "No fue posible cargar la información de las obras.";

  }

  // =====================================
  // ACTUALIZAR SI CAMBIA EL PROGRESO
  // =====================================

  window.addEventListener("storage", updateAllMarkers);

  window.addEventListener("pageshow", updateAllMarkers);

  // También revisar el progreso al volver a la pestaña
  document.addEventListener("visibilitychange", () => {

    if (!document.hidden) {
      updateAllMarkers();
    }

  });

  // =====================================
  // ELEMENTOS DE REALIDAD AUMENTADA
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
  // EVENTOS DE LAS ESFERAS AR
  // =====================================

  arMarkers.forEach(marker => {

    marker.addEventListener("click", () => {

      const key = marker.dataset.work;

      showArWork(key);

    });

  });

  // =====================================
  // CERRAR FICHA AR
  // =====================================

  if (closeArCard) {

    closeArCard.addEventListener("click", () => {
      hideArMessages();
    });

  }

  // =====================================
  // INICIAR AR
  // =====================================

  async function startAR() {

    document.body.classList.add("ar-active");

    arInterface.setAttribute("aria-hidden", "false");

    hideArMessages();

    updateAllMarkers();

    arGuide.classList.remove("is-hidden");

    arStatus.textContent =
      "Apunta la cámara hacia el mapa impreso...";

    try {

      // Esperar a que A-Frame termine de cargar
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

    hideArMessages();

    document.body.classList.remove("ar-active");

    arInterface.setAttribute("aria-hidden", "true");

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

    arGuide.classList.add("is-hidden");

    updateAllMarkers();

  });

  // =====================================
  // CUANDO MINDAR PIERDE EL MAPA
  // =====================================

  mapTarget.addEventListener("targetLost", () => {

    arStatus.textContent =
      "Busca nuevamente el mapa impreso con la cámara.";

    arGuide.classList.remove("is-hidden");

    hideArMessages();

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
