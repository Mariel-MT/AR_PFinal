
document.addEventListener("DOMContentLoaded", async () => {

  const statusText = document.getElementById("status-text");
  const card = document.getElementById("art-card");
  const scene = document.getElementById("ar-scene");
  const closeButton = document.getElementById("close-card");
  const retryButton = document.getElementById("retry-button");
  const missionPanel = document.getElementById("mission-panel");

  const STORAGE_KEY = "ccu-guardianes-progreso-v1";

  let obras = [];
  let currentTarget = null;

  function setStatus(message) {
    statusText.textContent = message;
  }

  function normalize(text) {
    return String(text).toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

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

  function saveProgress(completed) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ completed })
    );
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

  // Muestra la mascota correspondiente al target reconocido.
  function showPet(targetIndex) {

    hideAllPets();

    const pet = document.getElementById("pet-" + targetIndex);

    if (!pet) {
      console.warn("No se encontró la mascota del target:", targetIndex);
      return;
    }

    pet.setAttribute("visible", true);
    pet.setAttribute("scale", "0.001 0.001 0.001");

    // Activa el efecto de aparición.
    pet.emit("pet-appear");
  }

  // Oculta todas las mascotas.
  function hideAllPets() {

    for (let i = 0; i < 5; i++) {
      const pet = document.getElementById("pet-" + i);

      if (pet) {
        pet.setAttribute("visible", false);
      }
    }
  }

  function showLockedMessage() {

    hideAllPets();

    missionPanel.hidden = false;
    missionPanel.replaceChildren();

    const heading = document.createElement("p");
    heading.className = "card-eyebrow";
    heading.textContent = "LOS GUARDIANES DEL ARTE";

    const title = document.createElement("h2");
    title.textContent = "✧ Obra desconocida";

    const message = document.createElement("p");
    message.className = "mission-locked";
    message.textContent =
      "Esta obra aún es un secreto. Completa las misiones anteriores para descubrirla.";

    missionPanel.append(heading, title, message);

    card.classList.remove("hidden");

    setStatus("Has encontrado una obra misteriosa...");
  }

  function showFicha(obra) {

    document.getElementById("art-title").textContent =
      obra.titulo || "Obra sin título";

    document.getElementById("art-artist").textContent =
      obra.artista || "Autor no identificado";

    document.getElementById("art-year").textContent =
      obra.anio || "No disponible";

    document.getElementById("art-technique").textContent =
      obra.tecnica || "No disponible";

    document.getElementById("art-type").textContent =
      obra.tipo || "No especificado";

    document.getElementById("art-location").textContent =
      obra.ubicacion || "CCU BUAP";

    document.getElementById("art-description").textContent =
      obra.descripcion || "";

    document.getElementById("art-more").href =
      obra.enlace || "catalogo.html";

    card.classList.remove("hidden");

    showMission(obra);

    setStatus("Obra reconocida: " + obra.titulo);
  }

  function showMission(obra) {

    const completed = loadProgress();
    const index = obra.missionIndex;
    const alreadyCompleted = completed.includes(index);

    missionPanel.hidden = false;
    missionPanel.replaceChildren();

    const heading = document.createElement("p");
    heading.className = "card-eyebrow";
    heading.textContent = "LOS GUARDIANES DEL ARTE";

    const title = document.createElement("h2");
    title.textContent = "Misión " + (index + 1);

    missionPanel.append(heading, title);

    if (alreadyCompleted) {

      const message = document.createElement("p");
      message.className = "mission-feedback success";
      message.textContent =
        "✧ ¡Ya conseguiste este fragmento de la Esencia Creativa!";

      missionPanel.append(message);
      return;
    }

    const riddleTitle = document.createElement("p");
    riddleTitle.className = "card-eyebrow";
    riddleTitle.textContent = "RESUELVE EL ACERTIJO";

    const riddle = document.createElement("blockquote");
    riddle.textContent = obra.acertijo;

    const hint = document.createElement("p");
    hint.className = "mission-hint";
    hint.textContent = "Pista: " + obra.pista;

    const form = document.createElement("form");

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Escribe tu respuesta";
    input.autocomplete = "off";
    input.required = true;
    input.setAttribute("aria-label", "Respuesta del acertijo");

    const button = document.createElement("button");
    button.type = "submit";
    button.textContent =
      index === 4 ? "Descubrir destino" : "Comprobar respuesta";

    const feedback = document.createElement("p");
    feedback.className = "mission-feedback";
    feedback.setAttribute("aria-live", "polite");

    form.append(input, button);
    missionPanel.append(riddleTitle, riddle, hint, form, feedback);

    form.addEventListener("submit", event => {

      event.preventDefault();

      const response = normalize(input.value);

      if (!response) {
        feedback.textContent = "Escribe una respuesta.";
        feedback.className = "mission-feedback error";
        return;
      }

      const validAnswers = (obra.respuestas || []).map(normalize);

      if (validAnswers.includes(response)) {

        const updated = loadProgress();

        if (!updated.includes(index)) {
          updated.push(index);
        }

        updated.sort((a, b) => a - b);

        saveProgress(updated);

        feedback.textContent =
          index === 4
            ? "¡Correcto! Has descubierto War Giro y completado la aventura."
            : "¡Correcto! Has conseguido el fragmento y desbloqueado la siguiente misión.";

        feedback.className = "mission-feedback success";

        form.remove();

        if (index === 4) {
          const finalMessage = document.createElement("p");
          finalMessage.textContent =
            "✧ ¡Insignia desbloqueada: Explorador del Arte!";

          missionPanel.append(finalMessage);
        }

      } else {

        feedback.textContent =
          "Esa respuesta no es correcta. Revisa la pista e inténtalo de nuevo.";

        feedback.className = "mission-feedback error";
      }
    });
  }

  function hideFicha() {

    card.classList.add("hidden");
    missionPanel.hidden = true;
    currentTarget = null;

    hideAllPets();

    setStatus("Busca una obra para escanear");
  }

  function handleTargetFound(obra) {

    currentTarget = obra.targetIndex;

    const completed = loadProgress();
    const unlocked = isUnlocked(obra.missionIndex, completed);

    if (!unlocked) {
      showLockedMessage();
      return;
    }

    showPet(obra.targetIndex);
    showFicha(obra);
  }

  try {

    const response = await fetch("data/obras.json");

    if (!response.ok) {
      throw new Error("No se pudo cargar data/obras.json");
    }

    obras = await response.json();

    if (!Array.isArray(obras)) {
      throw new Error("El archivo de obras no tiene el formato esperado.");
    }

  } catch (error) {

    console.error(error);
    setStatus("Error al cargar las fichas. Recarga la página.");
    return;
  }

  // Conectar los cinco índices del archivo .mind con las obras.
  obras.forEach(obra => {

    const target = document.querySelector(
      `[data-target-index="${obra.targetIndex}"]`
    );

    if (!target) {
      console.warn("No se encontró el target:", obra.targetIndex);
      return;
    }

    target.addEventListener("targetFound", () => {
      handleTargetFound(obra);
    });

    target.addEventListener("targetLost", () => {

      if (currentTarget === obra.targetIndex) {
        hideFicha();
      }

    });
  });

  scene.addEventListener("arReady", () => {
    setStatus("Cámara activa. Enfoca una de las cinco obras.");
  });

  scene.addEventListener("arError", event => {
    console.error("MindAR error:", event);
    setStatus("No se pudo iniciar la cámara. Revisa los permisos.");
  });

  closeButton.addEventListener("click", hideFicha);

  retryButton.addEventListener("click", () => {
    hideFicha();
    setStatus("Reiniciando escáner...");
    window.location.reload();
  });

});
