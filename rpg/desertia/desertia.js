/* =========================================================
   MUSIC PLAYER
========================================================= */

const tracks = [
  {
    title: "Burn the County Line",

    duration: "03:41",

    location: "COUNTY 6 / WEST HIGHWAY",

    note: "Gravada depois de uma noite particularmente ruim perto da fronteira do Condado 6.",

    src: "assets/audio/burn-the-county-line.mp3",
  },

  {
    title: "Red Sun Gospel",

    duration: "04:12",

    location: "RED MESA / SURVIVORS FEST",

    note: "A primeira versão foi tocada em Red Mesa. A multidão pediu bis. O gerador explodiu antes que pudessem tocar de novo.",

    src: "assets/audio/red-sun-gospel.mp3",
  },

  {
    title: "Last Static",

    duration: "05:06",

    location: "RADIO STATION 106.6",

    note: "A última faixa gravada na estação. Existem vozes na fita que nenhum integrante da banda lembra de ter gravado.",

    src: "assets/audio/last-static.mp3",
  },
];

/* ============================= */
/* ELEMENTS */
/* ============================= */

const audio = document.querySelector("#audio");

const playlist = document.querySelector("#playlist");

const cassettePlayer = document.querySelector("#cassette-player");

const nowPlaying = document.querySelector("#now-playing");

const playButton = document.querySelector("#play");

const deckStatus = document.querySelector("#deck-status");

const cassetteTrackNumber = document.querySelector("#cassette-track-number");

const trackLocation = document.querySelector("#track-location");

const trackFileTitle = document.querySelector("#track-file-title");

const trackFileText = document.querySelector("#track-file-text");

const currentTimeDisplay = document.querySelector("#current-time");

const totalTimeDisplay = document.querySelector("#total-time");

const progressDuration = document.querySelector("#progress-duration");

const trackProgress = document.querySelector("#track-progress");

const musicVolume = document.querySelector("#music-volume");

const audioAnomaly = document.querySelector("#audio-anomaly");

let current = 0;

let anomalyTriggered = false;

/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);

  const remainingSeconds = Math.floor(seconds % 60);

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(remainingSeconds).padStart(2, "0")
  );
}

/* =========================================================
   PLAYLIST
========================================================= */

function renderPlaylist() {
  playlist.innerHTML = "";

  tracks.forEach((track, index) => {
    const li = document.createElement("li");

    li.className = `track${index === current ? " active" : ""}`;

    li.innerHTML = `

        <span class="track-number">
          ${String(index + 1).padStart(2, "0")}
        </span>

        <span class="track-title">
          ${track.title}
        </span>

        <span class="track-duration">
          ${track.duration}
        </span>

      `;

    li.addEventListener("click", () => {
      loadTrack(index, true);
    });

    playlist.append(li);
  });
}

/* =========================================================
   LOAD TRACK
========================================================= */

function loadTrack(index, autoplay = false) {
  current = (index + tracks.length) % tracks.length;

  const track = tracks[current];

  audio.src = track.src;

  nowPlaying.textContent = track.title;

  trackLocation.textContent = track.location;

  trackFileTitle.textContent = track.title;

  trackFileText.textContent = track.note;

  cassetteTrackNumber.textContent = String(current + 1).padStart(2, "0");

  currentTimeDisplay.textContent = "00:00";

  totalTimeDisplay.textContent = track.duration;

  progressDuration.textContent = track.duration;

  trackProgress.value = 0;

  anomalyTriggered = false;

  audioAnomaly.hidden = true;

  cassettePlayer.classList.remove("anomaly");

  deckStatus.textContent = "TAPE READY";

  renderPlaylist();

  if (autoplay) {
    playTrack();
  }
}

/* =========================================================
   PLAY
========================================================= */

function playTrack() {
  audio
    .play()

    .then(() => {
      playButton.textContent = "Ⅱ PAUSE";

      deckStatus.textContent = "PLAY";

      cassettePlayer.classList.add("playing");
    })

    .catch(() => {
      deckStatus.textContent = "TAPE ERROR";

      nowPlaying.textContent = `${tracks[current].title} — arquivo não encontrado`;
    });
}

/* =========================================================
   PAUSE
========================================================= */

function pauseTrack() {
  audio.pause();

  playButton.textContent = "▶ PLAY";

  deckStatus.textContent = "PAUSED";

  cassettePlayer.classList.remove("playing");
}

/* =========================================================
   PLAY BUTTON
========================================================= */

playButton.addEventListener("click", () => {
  if (!audio.src) {
    loadTrack(current);
  }

  if (audio.paused) {
    playTrack();
  } else {
    pauseTrack();
  }
});

/* =========================================================
   PREVIOUS / NEXT
========================================================= */

document.querySelector("#prev").addEventListener("click", () => {
  loadTrack(current - 1, true);
});

document.querySelector("#next").addEventListener("click", () => {
  loadTrack(current + 1, true);
});

/* =========================================================
   AUDIO TIME
========================================================= */

audio.addEventListener("timeupdate", () => {
  const currentTime = audio.currentTime;

  const duration = audio.duration;

  currentTimeDisplay.textContent = formatTime(currentTime);

  if (Number.isFinite(duration)) {
    trackProgress.value = (currentTime / duration) * 100;
  }

  /*
      Last Static

      03:17
    */

  if (current === 2 && currentTime >= 197 && !anomalyTriggered) {
    triggerAnomaly();
  }
});

/* =========================================================
   METADATA
========================================================= */

audio.addEventListener("loadedmetadata", () => {
  const duration = formatTime(audio.duration);

  totalTimeDisplay.textContent = duration;

  progressDuration.textContent = duration;
});

/* =========================================================
   SEEK
========================================================= */

trackProgress.addEventListener("input", () => {
  if (!Number.isFinite(audio.duration)) {
    return;
  }

  audio.currentTime = (Number(trackProgress.value) / 100) * audio.duration;
});

/* =========================================================
   VOLUME
========================================================= */

musicVolume.addEventListener("input", () => {
  audio.volume = Number(musicVolume.value);
});

audio.volume = Number(musicVolume.value);

/* =========================================================
   TRACK ENDED
========================================================= */

audio.addEventListener("ended", () => {
  cassettePlayer.classList.remove("playing");

  loadTrack(current + 1, true);
});

/* =========================================================
   ANOMALY
========================================================= */

function triggerAnomaly() {
  anomalyTriggered = true;

  audioAnomaly.hidden = false;

  cassettePlayer.classList.add("anomaly");

  deckStatus.textContent = "⚠ SIGNAL ERROR";

  /*
    Pequeno aumento no HEAT.

    Continua conectado ao resto
    da página.
  */

  if (typeof increaseHeat === "function") {
    increaseHeat(12);
  }

  /*
    A interferência visual dura
    alguns segundos.

    A mensagem continua visível.
  */

  setTimeout(() => {
    cassettePlayer.classList.remove("anomaly");

    if (!audio.paused) {
      deckStatus.textContent = "PLAY";
    }
  }, 4500);
}

/* =========================================================
   INITIAL
========================================================= */

loadTrack(0);
/* =========================================================
   RADIO
========================================================= */

const MIN_FREQUENCY = 87.5;
const MAX_FREQUENCY = 108.0;
const FREQUENCY_STEP = 0.1;

/*
  Arquivos de áudio das transmissões.

  Depois é só colocar seus arquivos em:

  assets/audio/radio/

  Por exemplo:

  assets/audio/radio/highway-warning.mp3
*/

const stations = [
  {
    frequency: 88.1,

    title: "UNKNOWN SIGNAL",

    text: "Existe alguma coisa muito fraca no meio da estática.",

    src: "assets/audio/radio/unknown-88-1.mp3",

    heat: 3,
  },

  {
    frequency: 92.4,

    title: "HIGHWAY WARNING",

    text: "Transmissão de emergência recebida da Rodovia 17.",

    src: "assets/audio/radio/highway-warning.mp3",

    heat: 4,
  },

  {
    frequency: 97.7,

    title: "BLACK STAR EMERGENCY BROADCAST",

    text: "Transmissão militar automática. A origem do sinal é desconhecida.",

    src: "assets/audio/radio/black-star.mp3",

    heat: 5,
  },

  {
    frequency: 103.3,

    title: "UNKNOWN TRANSMISSION",

    text: "A voz parece estar tentando falar com alguém no passado.",

    src: "assets/audio/radio/unknown-103-3.mp3",

    heat: 7,
  },

  {
    frequency: 106.6,

    title: "THE LAST STATIC",

    text: "A transmissão da banda atravessa cinquenta anos de deserto.",

    src: "assets/audio/radio/last-static-radio.mp3",

    heat: 3,
  },

  {
    frequency: 107.9,

    title: "SOURCE UNKNOWN",

    text: "A origem desta transmissão não consta em nenhum registro.",

    src: "assets/audio/radio/unknown-107-9.mp3",

    heat: 9,
  },
];

const radioKnob = document.querySelector("#radio-knob");

const radioAudio = document.querySelector("#radio-audio");

const radio = document.querySelector(".radio");

const frequencyDisplay = document.querySelector("#frequency-display");

const frequencyNeedle = document.querySelector("#frequency-needle");

const transmissionTitle = document.querySelector("#transmission-title");

const transmissionText = document.querySelector("#transmission-text");

const signalStatus = document.querySelector("#signal-status");

const signalBars = document.querySelectorAll("#signal-bars i");

let frequency = 106.6;

let draggingKnob = false;

let currentStation = null;

let currentAudioSource = null;

/*
  Usado para evitar aumentar HEAT
  infinitamente ao passar pela mesma
  estação várias vezes.
*/

const discoveredStations = new Set();

/* =========================================================
   FREQUENCY
========================================================= */

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setFrequency(value) {
  frequency = Math.round(value * 10) / 10;

  frequency = clamp(frequency, MIN_FREQUENCY, MAX_FREQUENCY);

  frequencyDisplay.textContent = frequency.toFixed(1);

  radioKnob.setAttribute("aria-valuenow", frequency.toFixed(1));

  updateKnobRotation();

  updateFrequencyNeedle();

  checkSignal();
}

/* =========================================================
   KNOB VISUAL
========================================================= */

function updateKnobRotation() {
  const percentage =
    (frequency - MIN_FREQUENCY) / (MAX_FREQUENCY - MIN_FREQUENCY);

  /*
    Knob percorre 270 graus.

    -135° = mínimo
     135° = máximo
  */

  const rotation = -135 + percentage * 270;

  radioKnob.style.setProperty("--rotation", `${rotation}deg`);
}

function updateFrequencyNeedle() {
  const percentage =
    (frequency - MIN_FREQUENCY) / (MAX_FREQUENCY - MIN_FREQUENCY);

  frequencyNeedle.style.left = `${percentage * 100}%`;
}

/* =========================================================
   KNOB INTERACTION
========================================================= */

function frequencyFromPointer(event) {
  const rect = radioKnob.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2;

  const centerY = rect.top + rect.height / 2;

  const x = event.clientX - centerX;

  const y = event.clientY - centerY;

  /*
    Converte posição do mouse
    em ângulo.
  */

  let angle = (Math.atan2(y, x) * 180) / Math.PI;

  /*
    Deixamos 0° no topo.
  */

  angle += 90;

  if (angle > 180) {
    angle -= 360;
  }

  /*
    Limita movimento físico do knob.
  */

  angle = clamp(angle, -135, 135);

  const percentage = (angle + 135) / 270;

  return MIN_FREQUENCY + percentage * (MAX_FREQUENCY - MIN_FREQUENCY);
}

radioKnob.addEventListener("pointerdown", (event) => {
  draggingKnob = true;

  radioKnob.setPointerCapture(event.pointerId);

  const newFrequency = frequencyFromPointer(event);

  setFrequency(newFrequency);
});

radioKnob.addEventListener("pointermove", (event) => {
  if (!draggingKnob) {
    return;
  }

  const newFrequency = frequencyFromPointer(event);

  setFrequency(newFrequency);
});

radioKnob.addEventListener("pointerup", () => {
  draggingKnob = false;
});

radioKnob.addEventListener("pointercancel", () => {
  draggingKnob = false;
});

/* =========================================================
   MOUSE WHEEL
========================================================= */

/*
  Também dá para colocar o mouse
  em cima do knob e usar a rodinha.

  Pequeno detalhe, mas deixa o rádio
  gostoso de usar.
*/

radioKnob.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();

    const direction = event.deltaY > 0 ? -1 : 1;

    setFrequency(frequency + direction * FREQUENCY_STEP);
  },
  {
    passive: false,
  },
);

/* =========================================================
   KEYBOARD
========================================================= */

radioKnob.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "ArrowUp") {
    event.preventDefault();

    setFrequency(frequency + FREQUENCY_STEP);
  }

  if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
    event.preventDefault();

    setFrequency(frequency - FREQUENCY_STEP);
  }
});

/* =========================================================
   SIGNAL DETECTION
========================================================= */

function checkSignal() {
  let nearestStation = null;

  let nearestDistance = Infinity;

  stations.forEach((station) => {
    const distance = Math.abs(frequency - station.frequency);

    if (distance < nearestDistance) {
      nearestDistance = distance;

      nearestStation = station;
    }
  });

  /*
    Uma estação começa a aparecer
    dentro de ±0.4 MHz.

    Exemplo:

    estação = 97.7

    97.3 → começa sinal
    97.5 → sinal razoável
    97.7 → perfeito
  */

  const MAX_SIGNAL_DISTANCE = 0.4;

  if (nearestDistance > MAX_SIGNAL_DISTANCE) {
    noSignal();

    return;
  }

  /*
    1 = frequência perfeita
    0 = limite da estação
  */

  const strength = 1 - nearestDistance / MAX_SIGNAL_DISTANCE;

  updateSignalStrength(strength);

  /*
    Só consideramos que a estação
    realmente foi sintonizada
    perto do centro.
  */

  if (nearestDistance <= 0.08) {
    lockStation(nearestStation);
  } else {
    weakStation(nearestStation, strength);
  }
}

/* =========================================================
   SIGNAL UI
========================================================= */

function updateSignalStrength(strength) {
  const activeBars = Math.ceil(strength * signalBars.length);

  signalBars.forEach((bar, index) => {
    bar.classList.toggle("active", index < activeBars);
  });
}

/* =========================================================
   NO SIGNAL
========================================================= */

function noSignal() {
  currentStation = null;

  radio.classList.remove("receiving");

  signalStatus.textContent = "SEARCHING";

  transmissionTitle.textContent = "NO SIGNAL";

  transmissionText.textContent = "KSSSSSSHHHHHHHHHHHH...";

  updateSignalStrength(0);

  stopRadioAudio();
}

/* =========================================================
   WEAK SIGNAL
========================================================= */

function weakStation(station, strength) {
  radio.classList.add("receiving");

  currentStation = station;

  if (strength < 0.35) {
    signalStatus.textContent = "WEAK";

    transmissionTitle.textContent = "SIGNAL DETECTED";

    transmissionText.textContent = "Existe alguma coisa no meio da estática.";
  } else if (strength < 0.7) {
    signalStatus.textContent = "RECEIVING";

    transmissionTitle.textContent = station.title;

    transmissionText.textContent = "A transmissão está quase legível.";
  } else {
    signalStatus.textContent = "STRONG";

    transmissionTitle.textContent = station.title;

    transmissionText.textContent = station.text;
  }

  playStationAudio(station, strength);
}

/* =========================================================
   LOCKED STATION
========================================================= */

function lockStation(station) {
  radio.classList.remove("receiving");

  currentStation = station;

  signalStatus.textContent = "LOCKED";

  transmissionTitle.textContent = station.title;

  transmissionText.textContent = station.text;

  updateSignalStrength(1);

  playStationAudio(station, 1);

  /*
    Só aumenta HEAT na primeira
    vez que encontra uma estação.
  */

  if (!discoveredStations.has(station.frequency)) {
    discoveredStations.add(station.frequency);

    if (typeof increaseHeat === "function") {
      increaseHeat(station.heat);
    }
  }
}

/* =========================================================
   RADIO AUDIO
========================================================= */

function playStationAudio(station, strength) {
  /*
    Se mudou de estação,
    carrega o novo arquivo.
  */

  if (currentAudioSource !== station.src) {
    currentAudioSource = station.src;

    radioAudio.src = station.src;

    radioAudio.currentTime = 0;

    radioAudio.play().catch(() => {
      /*
          Navegadores podem bloquear
          autoplay antes da primeira
          interação do usuário.

          Como o usuário precisa girar
          o knob, normalmente isso
          deixa de ser problema.
        */
    });
  }

  /*
    O volume aumenta quando chegamos
    perto da frequência correta.
  */

  const volume = clamp(strength, 0, 1);

  radioAudio.volume = volume;
}

/* =========================================================
   STOP AUDIO
========================================================= */

function stopRadioAudio() {
  if (!radioAudio.paused) {
    radioAudio.pause();
  }

  currentAudioSource = null;
}

/* =========================================================
   HERO BUTTON
========================================================= */

document.querySelector("#tune-in").addEventListener("click", () => {
  document.querySelector("#radio").scrollIntoView({
    behavior: "smooth",
  });

  /*
        Começa perto da principal,
        mas não exatamente nela.

        Assim o usuário ainda precisa
        girar o rádio um pouquinho.
      */

  setFrequency(106.2);
});

/* =========================================================
   INITIAL STATE
========================================================= */

setFrequency(106.2);

/* =========================================================
   HEAT
========================================================= */

const AMBIENT_HEAT = 18;

let heat = AMBIENT_HEAT;

const heatFill = document.querySelector("#heat-fill");

const heatMiniFill = document.querySelector("#heat-mini-fill");

const heatValue = document.querySelector("#heat-value");

const heatMiniValue = document.querySelector("#heat-mini-value");

const heatStatus = document.querySelector("#heat-status");

const heatMessage = document.querySelector("#heat-message");

/* ============================= */
/* HEAT MANAGEMENT */
/* ============================= */

function setHeat(value) {
  heat = Math.max(AMBIENT_HEAT, Math.min(100, Math.round(value)));

  updateHeat();
}

function increaseHeat(amount) {
  setHeat(heat + amount);
}

function decreaseHeat(amount) {
  setHeat(heat - amount);
}

/* ============================= */
/* UPDATE UI */
/* ============================= */

function updateHeat() {
  heatFill.style.width = `${heat}%`;

  if (heatMiniFill) {
    heatMiniFill.style.width = `${heat}%`;
  }

  heatValue.textContent = `${heat}%`;

  if (heatMiniValue) {
    heatMiniValue.textContent = `${heat}%`;
  }

  document.body.classList.remove("heat-warning", "heat-critical");

  if (heat < 35) {
    heatStatus.textContent = "MOTOR ESTÁVEL";

    heatMessage.textContent = "Ainda dá para continuar dirigindo.";
  } else if (heat < 60) {
    heatStatus.textContent = "TEMPERATURA ALTA";

    heatMessage.textContent =
      "O painel começou a fazer barulhos que não fazia antes.";
  } else if (heat < 80) {
    heatStatus.textContent = "⚠ OVERHEAT";

    heatMessage.textContent =
      "O rádio está chiando. O motor está quente. Alguma coisa está seguindo vocês.";

    document.body.classList.add("heat-warning");
  } else if (heat < 100) {
    heatStatus.textContent = "⚠⚠ DANGER";

    heatMessage.textContent =
      "Não pare. Não desligue o rádio. Não olhe para trás.";

    document.body.classList.add("heat-critical");
  } else {
    heatStatus.textContent = "GET THE FUCK OUT.";

    heatMessage.textContent = "O ponteiro atravessou o limite vermelho.";

    document.body.classList.add("heat-critical");
  }
}

/* =========================================================
   THROTTLE
========================================================= */

const throttle = document.querySelector("#throttle");

const throttleLabel = document.querySelector("#throttle-label");

const speedValue = document.querySelector("#speed-value");

const loadValue = document.querySelector("#load-value");

const engineEvent = document.querySelector("#engine-event");

const throttleModes = [
  {
    label: "IDLE",
    speed: 0,
    load: 0,
    heat: -1,
    message: "Motor em marcha lenta.",
  },

  {
    label: "CRUISE",
    speed: 45,
    load: 20,
    heat: 0,
    message: "A Desert Rat segue sem reclamar muito.",
  },

  {
    label: "PUSH",
    speed: 75,
    load: 40,
    heat: 1,
    message: "O motor começa a trabalhar de verdade.",
  },

  {
    label: "HARD",
    speed: 105,
    load: 65,
    heat: 2,
    message: "A carroceria vibra. Alguma coisa no porta-malas caiu.",
  },

  {
    label: "FULL",
    speed: 135,
    load: 85,
    heat: 3,
    message: "O escapamento cospe fogo. Provavelmente normal.",
  },

  {
    label: "REDLINE",
    speed: "???",
    load: 100,
    heat: 5,
    message: "BAD IDEA. KEEP GOING.",
  },
];

function updateThrottle() {
  const value = Number(throttle.value);

  const mode = throttleModes[value];

  throttleLabel.textContent = mode.label;

  speedValue.textContent = `${mode.speed} KM/H`;

  loadValue.textContent = `${mode.load}%`;

  engineEvent.textContent = mode.message;

  /*
    Dá uma classe especial quando
    o jogador coloca no REDLINE.
  */

  throttle.classList.toggle("redline", value === 5);
}

throttle.addEventListener("input", updateThrottle);

/* =========================================================
   ENGINE LOOP
========================================================= */

/*
  A cada 1.2 segundos o motor reage
  à posição atual do acelerador.
*/

setInterval(() => {
  const value = Number(throttle.value);

  const mode = throttleModes[value];

  /*
      Em IDLE o motor esfria,
      mas nunca abaixo da temperatura
      ambiente do deserto.
    */

  if (mode.heat < 0 && heat > AMBIENT_HEAT) {
    decreaseHeat(Math.abs(mode.heat));
  }

  if (mode.heat > 0) {
    increaseHeat(mode.heat);
  }
}, 1200);

/* =========================================================
   RADIATOR
========================================================= */

const purgeButton = document.querySelector("#purge-radiator");

const radiatorStatus = document.querySelector("#radiator-status");

let radiatorReady = true;

purgeButton.addEventListener("click", () => {
  if (!radiatorReady) {
    return;
  }

  radiatorReady = false;

  /*
      Resfriamento forte.
    */

  decreaseHeat(18);

  engineEvent.textContent =
    "KSSSSSSHHHH — vapor explode pelas laterais do capô.";

  purgeButton.disabled = true;

  /*
      Cooldown visual.
    */

  let seconds = 8;

  radiatorStatus.textContent = `PRESSURE ${seconds}s`;

  const cooldown = setInterval(() => {
    seconds -= 1;

    radiatorStatus.textContent = `PRESSURE ${seconds}s`;

    if (seconds <= 0) {
      clearInterval(cooldown);

      radiatorReady = true;

      purgeButton.disabled = false;

      radiatorStatus.textContent = "READY";
    }
  }, 1000);
});

/* =========================================================
   INITIAL STATE
========================================================= */

updateHeat();

updateThrottle();

/* =========================================================
   ROAD MAP
========================================================= */

const locations = {
  "gas-town": {
    name: "GAS TOWN",

    population: "312",

    threat: "●●○○○",

    description:
      "Uma cidade construída ao redor de três postos de combustível. Aqui gasolina vale mais que dinheiro e água vale mais que gasolina.",

    note: 'ÚLTIMO SHOW: "ninguém morreu. tecnicamente."',

    heat: 2,
  },

  "red-mesa": {
    name: "RED MESA",

    population: "1.104",

    threat: "●●●○○",

    description:
      "Barracas, geradores, carros soldados uns aos outros e o maior mercado itinerante que a banda encontrou até agora.",

    note: "A BATERISTA FOI PROIBIDA DE VOLTAR AO SURVIVORS FEST.",

    heat: 3,
  },

  "dead-valley": {
    name: "DEAD VALLEY",

    population: "0",

    threat: "●●●●●",

    description:
      "A estrada atravessa quilômetros de veículos abandonados. Alguns motores ainda estão quentes. Nenhum deles chegou ali recentemente.",

    note: "SHOW CANCELADO / MOTIVO OFICIAL: TEMPESTADE RADIOATIVA.",

    heat: 8,
  },

  "crater-city": {
    name: "CRATER CITY",

    population: "2.870",

    threat: "●●●●○",

    description:
      "Uma cidade construída dentro da cratera deixada por uma explosão que ninguém consegue identificar. À noite as paredes brilham.",

    note: "PRÓXIMO SHOW: REACTOR CLUB.",

    heat: 5,
  },

  "radio-station": {
    name: "RADIO 106.6",

    population: "5",

    threat: "?????",

    description:
      "Uma velha estação de rádio no meio de absolutamente nada. A energia estava ligada quando eles chegaram.",

    note: "A ANTENA NÃO TRANSMITE PARA LONGE. TRANSMITE PARA ANTES.",

    heat: 10,
  },
};

const locationName = document.querySelector("#location-name");

const locationPopulation = document.querySelector("#location-population");

const locationThreat = document.querySelector("#location-threat");

const locationDescription = document.querySelector("#location-description");

const locationNote = document.querySelector("#location-note");

const mapPoints = document.querySelectorAll("[data-location]");

mapPoints.forEach((point) => {
  point.addEventListener("click", () => {
    const location = locations[point.dataset.location];

    mapPoints.forEach((item) => item.classList.remove("active"));

    point.classList.add("active");

    point.classList.add("visited");

    locationName.textContent = location.name;

    locationPopulation.textContent = location.population;

    locationThreat.textContent = location.threat;

    locationDescription.textContent = location.description;

    locationNote.textContent = location.note;

    increaseHeat(location.heat);
  });
});

const tourDates = document.querySelectorAll("[data-tour-location]");

tourDates.forEach((date) => {
  date.addEventListener("mouseenter", () => {
    const location = date.dataset.tourLocation;

    const mapPoint = document.querySelector(`[data-location="${location}"]`);

    if (mapPoint) {
      mapPoint.classList.add("tour-highlight");
    }
  });

  date.addEventListener("mouseleave", () => {
    mapPoints.forEach((point) => point.classList.remove("tour-highlight"));
  });
});
/* =========================================================
   BOOTLEG ARCHIVE
========================================================= */

const artifactButtons = document.querySelectorAll("[data-artifact]");

const archiveItems = document.querySelectorAll("[data-archive-item]");

const archiveCount = document.querySelector("#archive-count");

const archiveComplete = document.querySelector("#archive-complete");

const discoveredArtifacts = new Set();

function updateArchiveCount() {
  const discovered = discoveredArtifacts.size;

  const total = archiveItems.length;

  archiveCount.textContent = `${String(discovered).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  if (discovered === total) {
    archiveComplete.hidden = false;
  }
}

artifactButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    const artifact = button.closest(".artifact");

    const content = button.nextElementSibling;

    const opening = content.hidden;

    /*
          Fecha os outros itens.

          Isso mantém a section
          muito mais limpa.
        */

    artifactButtons.forEach((otherButton) => {
      if (otherButton === button) {
        return;
      }

      const otherArtifact = otherButton.closest(".artifact");

      const otherContent = otherButton.nextElementSibling;

      otherContent.hidden = true;

      otherArtifact.classList.remove("open");

      otherButton.querySelector(".artifact-button-footer small").textContent =
        "EXAMINAR →";
    });

    /*
          Abre / fecha atual.
        */

    content.hidden = !opening;

    artifact.classList.toggle("open", opening);

    button.querySelector(".artifact-button-footer small").textContent = opening
      ? "FECHAR ↑"
      : "EXAMINAR →";

    /*
          Primeira descoberta.
        */

    if (opening && !discoveredArtifacts.has(index)) {
      discoveredArtifacts.add(index);

      artifact.classList.add("discovered");

      updateArchiveCount();

      /*
            Mantemos sua integração
            com HEAT.
          */

      if (typeof increaseHeat === "function") {
        increaseHeat(4);
      }
    }
  });
});

updateArchiveCount();

/* =========================================================
   VEHICLE
========================================================= */

const vehicleParts = {
  engine: {
    label: "ENGINE",

    code: "DR-01 / ENG",

    description:
      'V8 remendado tantas vezes que nenhum cilindro parece pertencer ao mesmo motor. Funciona com gasolina, etanol e, segundo o guitarrista, "qualquer coisa que queime".',

    status: "RUNNING",
  },

  radio: {
    label: "LONG RANGE RADIO",

    code: "DR-01 / COM",

    description:
      "Montado com peças encontradas nas Zonas. Depois da estação 106.6, começou a receber sinais mesmo quando está desligado.",

    status: "SIGNAL DETECTED",
  },

  trunk: {
    label: "TRUNK",

    code: "DR-01 / CARGO",

    description:
      "Três amplificadores, duas guitarras, um baixo, peças de bateria, galões de combustível, munição, cabos e quase nenhuma comida.",

    status: "OVER CAPACITY",
  },

  backseat: {
    label: "BACK SEAT",

    code: "DR-01 / ???",

    description:
      "Três latas vazias, uma guitarra quebrada e alguma coisa respirando debaixo de um cobertor. Ninguém quer verificar.",

    status: "DO NOT CHECK",
  },
};

const vehicleLabel = document.querySelector("#vehicle-label");

const vehicleDescription = document.querySelector("#vehicle-description");

const vehiclePartCode = document.querySelector("#vehicle-part-code");

const vehiclePartStatus = document.querySelector("#vehicle-part-status");

const vehicleButtons = document.querySelectorAll("[data-part]");

vehicleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const part = vehicleParts[button.dataset.part];

    vehicleButtons.forEach((item) => item.classList.remove("active"));

    button.classList.add("active");

    vehicleLabel.textContent = part.label;

    vehicleDescription.textContent = part.description;

    vehiclePartCode.textContent = part.code;

    vehiclePartStatus.textContent = part.status;

    if (button.dataset.part === "backseat") {
      increaseHeat(6);
    }
  });
});

/* =========================================================
   ROAD ORACLE
========================================================= */

const roadEvents = [
  {
    category: "ROAD EVENT",

    text: "Um posto aparece no mapa. O problema: ele não existia cinco minutos atrás.",

    threat: 3,
  },

  {
    category: "RADIO ANOMALY",

    text: "O rádio sintoniza uma música que a banda ainda não compôs.",

    threat: 4,
  },

  {
    category: "TRACKS",

    text: "Marcas de pneus saem da estrada e continuam em linha reta pelo deserto.",

    threat: 2,
  },

  {
    category: "NAVIGATION",

    text: "Uma placa anuncia a mesma cidade pelos próximos 87 quilômetros.",

    threat: 2,
  },

  {
    category: "PASSENGER",

    text: "Há alguém no banco de trás. Ninguém lembra de tê-lo deixado entrar.",

    threat: 5,
  },

  {
    category: "ANOMALY",

    text: "O horizonte pisca como uma televisão velha.",

    threat: 4,
  },

  {
    category: "WEATHER",

    text: "Uma tempestade de areia vem na direção contrária ao vento.",

    threat: 3,
  },

  {
    category: "ENCOUNTER",

    text: "Um comboio passa por vocês. Todos os motoristas têm o mesmo rosto.",

    threat: 5,
  },

  {
    category: "TRADER",

    text: "Uma criança oferece água em troca de uma fita cassete específica.",

    threat: 1,
  },

  {
    category: "VEHICLE",

    text: "O tanque está mais cheio do que estava vinte minutos atrás.",

    threat: 3,
  },

  {
    category: "SHOW",

    text: "Ao longe existe um palco montado no meio do deserto. Há gente esperando pela banda.",

    threat: 2,
  },

  {
    category: "RADIO ANOMALY",

    text: "Um rádio enterrado na areia está tocando Last Static.",

    threat: 4,
  },

  {
    category: "NAVIGATION",

    text: "A estrada desaparece por três quilômetros e reaparece exatamente onde deveria estar.",

    threat: 4,
  },

  {
    category: "SIGNAL",

    text: "Uma torre de transmissão aparece no horizonte. O rádio marca 106.6 FM.",

    threat: 5,
  },

  {
    category: "ANOMALY",

    text: "Vocês encontram as próprias marcas de pneu vindo da direção oposta.",

    threat: 5,
  },
];

const roadWeather = [
  "DRY",

  "DUST",

  "HOT WIND",

  "ASH",

  "STATIC STORM",

  "RED SKY",
];

const roadVisibility = ["GOOD", "FAIR", "POOR", "BAD", "???"];

const roadResult = document.querySelector("#road-result");

const oracleCategory = document.querySelector("#oracle-category");

const oracleThreat = document.querySelector("#oracle-threat");

const oracleWeather = document.querySelector("#oracle-weather");

const oracleVisibility = document.querySelector("#oracle-visibility");

const oracleHeat = document.querySelector("#oracle-heat");

document.querySelector("#random-road").addEventListener("click", () => {
  const event = roadEvents[Math.floor(Math.random() * roadEvents.length)];

  const weather = roadWeather[Math.floor(Math.random() * roadWeather.length)];

  const visibility =
    roadVisibility[Math.floor(Math.random() * roadVisibility.length)];

  /*
        Quanto mais perigoso,
        maior tende a ser o HEAT.
      */

  const heatGain = Math.max(
    1,
    event.threat + Math.floor(Math.random() * 4) - 1,
  );

  roadResult.textContent = event.text;

  oracleCategory.textContent = event.category;

  oracleThreat.textContent = `THREAT 0${event.threat}`;

  oracleWeather.textContent = weather;

  oracleVisibility.textContent = visibility;

  oracleHeat.textContent = `+${heatGain}`;

  if (typeof increaseHeat === "function") {
    increaseHeat(heatGain);
  }
});

/* =========================================================
   START
========================================================= */

loadTrack(0);

tuneStation(4);

/*
  tuneStation aumenta HEAT.
  Como queremos começar em 18,
  restauramos o estado inicial.
*/

heat = 18;

updateHeat();
