/* =========================================================
   MUSIC PLAYER
========================================================= */

const tracks = [
  {
    title: "01 — Burn the County Line",
    duration: "03:41",
    src: "assets/audio/burn-the-county-line.mp3"
  },
  {
    title: "02 — Red Sun Gospel",
    duration: "04:12",
    src: "assets/audio/red-sun-gospel.mp3"
  },
  {
    title: "03 — Last Static",
    duration: "05:06",
    src: "assets/audio/last-static.mp3"
  }
];

const audio = document.querySelector("#audio");
const playlist = document.querySelector("#playlist");

const nowPlaying =
  document.querySelector("#now-playing");

const playButton =
  document.querySelector("#play");

const audioAnomaly =
  document.querySelector("#audio-anomaly");

let current = 0;
let anomalyTriggered = false;


function renderPlaylist() {

  playlist.innerHTML = "";

  tracks.forEach((track, index) => {

    const li =
      document.createElement("li");

    li.className =
      `track${index === current ? " active" : ""}`;

    li.innerHTML = `
      <span>${track.title}</span>
      <span>${track.duration}</span>
    `;

    li.addEventListener(
      "click",
      () => loadTrack(index, true)
    );

    playlist.append(li);

  });

}


function loadTrack(index, autoplay = false) {

  current =
    (index + tracks.length) %
    tracks.length;

  const track =
    tracks[current];

  audio.src =
    track.src;

  nowPlaying.textContent =
    track.title;

  anomalyTriggered = false;
  audioAnomaly.hidden = true;

  renderPlaylist();

  if (autoplay) {

    audio.play()
      .then(() => {
        playButton.textContent =
          "PAUSE";
      })
      .catch(() => {

        nowPlaying.textContent =
          `${track.title} — adicione o arquivo MP3`;

      });

  }

}


playButton.addEventListener(
  "click",
  () => {

    if (!audio.src) {
      loadTrack(current);
    }

    if (audio.paused) {

      audio.play()
        .then(() => {

          playButton.textContent =
            "PAUSE";

        })
        .catch(() => {

          nowPlaying.textContent =
            `${tracks[current].title} — arquivo ainda não adicionado`;

        });

    } else {

      audio.pause();

      playButton.textContent =
        "PLAY";

    }

  }
);


document
  .querySelector("#prev")
  .addEventListener(
    "click",
    () => loadTrack(current - 1, true)
  );


document
  .querySelector("#next")
  .addEventListener(
    "click",
    () => loadTrack(current + 1, true)
  );


audio.addEventListener(
  "ended",
  () => loadTrack(current + 1, true)
);


/*
  Pequeno segredo:

  aos 3:17 de Last Static
  uma mensagem aparece.
*/

audio.addEventListener(
  "timeupdate",
  () => {

    if (
      current === 2 &&
      audio.currentTime >= 197 &&
      !anomalyTriggered
    ) {

      anomalyTriggered = true;

      audioAnomaly.hidden = false;

      increaseHeat(12);

    }

  }
);


/* =========================================================
   RADIO
========================================================= */

const stations = [

  {
    frequency: "88.1",
    title: "NO CARRIER",
    text:
      "Só estática. Por alguns segundos parece haver alguém respirando do outro lado.",
    signal: 1,
    heat: 2
  },

  {
    frequency: "92.4",
    title: "HIGHWAY WARNING",
    text:
      "\"Se alguém ainda estiver ouvindo... não atravessem a Rodovia 17 depois do pôr do sol. Não parem para ninguém.\"",
    signal: 3,
    heat: 4
  },

  {
    frequency: "97.7",
    title: "BLACK STAR EMERGENCY BROADCAST",
    text:
      "\"Esta frequência pertence à Black Star Militia. Civis devem permanecer fora das Zonas de Contenção 4, 6 e 11.\"",
    signal: 4,
    heat: 3
  },

  {
    frequency: "103.3",
    title: "UNKNOWN TRANSMISSION",
    text:
      "\"Pai? Se você estiver ouvindo isso... acho que conseguimos mandar o sinal para trás. Não sei quanto tempo.\"",
    signal: 2,
    heat: 7
  },

  {
    frequency: "106.6",
    title: "THE LAST STATIC",
    text:
      "Música distorcida atravessa a estática. Cinco pessoas discutem ao fundo. Alguém manda aumentar o volume.",
    signal: 5,
    heat: 2
  },

  {
    frequency: "107.9",
    title: "SIGNAL / SOURCE UNKNOWN",
    text:
      "Uma voz repete as coordenadas da estação onde a banda encontrou o transmissor. A gravação parece responder quando você aumenta o volume.",
    signal: 2,
    heat: 9
  }

];


let stationIndex = 4;


const frequencyDisplay =
  document.querySelector(
    "#frequency-display"
  );

const transmissionTitle =
  document.querySelector(
    "#transmission-title"
  );

const transmissionText =
  document.querySelector(
    "#transmission-text"
  );

const presetButtons =
  document.querySelectorAll(
    "[data-frequency]"
  );

const signalBars =
  document.querySelectorAll(
    "#signal-bars i"
  );


function tuneStation(index) {

  stationIndex =
    (index + stations.length) %
    stations.length;

  const station =
    stations[stationIndex];

  frequencyDisplay.textContent =
    station.frequency;

  transmissionTitle.textContent =
    station.title;

  transmissionText.textContent =
    station.text;


  presetButtons.forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.frequency ===
        station.frequency
    );

  });


  signalBars.forEach(
    (bar, index) => {

      bar.classList.toggle(
        "active",
        index < station.signal
      );

    }
  );


  increaseHeat(
    station.heat
  );

}


document
  .querySelector("#freq-down")
  .addEventListener(
    "click",
    () => tuneStation(stationIndex - 1)
  );


document
  .querySelector("#freq-up")
  .addEventListener(
    "click",
    () => tuneStation(stationIndex + 1)
  );


presetButtons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      const index =
        stations.findIndex(
          station =>
            station.frequency ===
            button.dataset.frequency
        );

      tuneStation(index);

    }
  );

});


document
  .querySelector("#tune-in")
  .addEventListener(
    "click",
    () => {

      document
        .querySelector("#radio")
        .scrollIntoView({
          behavior: "smooth"
        });

      tuneStation(4);

    }
  );


/* =========================================================
   HEAT
========================================================= */

let heat = 18;


const heatFill =
  document.querySelector(
    "#heat-fill"
  );

const heatMiniFill =
  document.querySelector(
    "#heat-mini-fill"
  );

const heatValue =
  document.querySelector(
    "#heat-value"
  );

const heatMiniValue =
  document.querySelector(
    "#heat-mini-value"
  );

const heatStatus =
  document.querySelector(
    "#heat-status"
  );

const heatMessage =
  document.querySelector(
    "#heat-message"
  );


function increaseHeat(amount) {

  heat =
    Math.min(
      100,
      heat + amount
    );

  updateHeat();

}


function updateHeat() {

  heatFill.style.width =
    `${heat}%`;

  heatMiniFill.style.width =
    `${heat}%`;

  heatValue.textContent =
    `${heat}%`;

  heatMiniValue.textContent =
    `${heat}%`;


  document.body.classList.remove(
    "heat-warning",
    "heat-critical"
  );


  if (heat < 35) {

    heatStatus.textContent =
      "MOTOR ESTÁVEL";

    heatMessage.textContent =
      "Ainda dá para continuar dirigindo.";

  }

  else if (heat < 60) {

    heatStatus.textContent =
      "TEMPERATURA ALTA";

    heatMessage.textContent =
      "O painel começou a fazer barulhos que não fazia antes.";

  }

  else if (heat < 80) {

    heatStatus.textContent =
      "⚠ OVERHEAT";

    heatMessage.textContent =
      "O rádio está chiando. O motor está quente. Alguma coisa está seguindo vocês.";

    document.body.classList.add(
      "heat-warning"
    );

  }

  else if (heat < 100) {

    heatStatus.textContent =
      "⚠⚠ DANGER";

    heatMessage.textContent =
      "Não pare. Não desligue o rádio. Não olhe para trás.";

    document.body.classList.add(
      "heat-critical"
    );

  }

  else {

    heatStatus.textContent =
      "GET THE FUCK OUT.";

    heatMessage.textContent =
      "O ponteiro atravessou o limite vermelho.";

    document.body.classList.add(
      "heat-critical"
    );

  }

}


/* =========================================================
   ROAD MAP
========================================================= */

const locations = {

  "gas-town": {

    name: "GAS TOWN",

    population:
      "312",

    threat:
      "●●○○○",

    description:
      "Uma cidade construída ao redor de três postos de combustível. Aqui gasolina vale mais que dinheiro e água vale mais que gasolina.",

    note:
      "ÚLTIMO SHOW: \"ninguém morreu. tecnicamente.\"",

    heat: 2

  },


  "red-mesa": {

    name:
      "RED MESA",

    population:
      "1.104",

    threat:
      "●●●○○",

    description:
      "Barracas, geradores, carros soldados uns aos outros e o maior mercado itinerante que a banda encontrou até agora.",

    note:
      "A BATERISTA FOI PROIBIDA DE VOLTAR AO SURVIVORS FEST.",

    heat: 3

  },


  "dead-valley": {

    name:
      "DEAD VALLEY",

    population:
      "0",

    threat:
      "●●●●●",

    description:
      "A estrada atravessa quilômetros de veículos abandonados. Alguns motores ainda estão quentes. Nenhum deles chegou ali recentemente.",

    note:
      "SHOW CANCELADO / MOTIVO OFICIAL: TEMPESTADE RADIOATIVA.",

    heat: 8

  },


  "crater-city": {

    name:
      "CRATER CITY",

    population:
      "2.870",

    threat:
      "●●●●○",

    description:
      "Uma cidade construída dentro da cratera deixada por uma explosão que ninguém consegue identificar. À noite as paredes brilham.",

    note:
      "PRÓXIMO SHOW: REACTOR CLUB.",

    heat: 5

  },


  "radio-station": {

    name:
      "RADIO 106.6",

    population:
      "5",

    threat:
      "?????",

    description:
      "Uma velha estação de rádio no meio de absolutamente nada. A energia estava ligada quando eles chegaram.",

    note:
      "A ANTENA NÃO TRANSMITE PARA LONGE. TRANSMITE PARA ANTES.",

    heat: 10

  }

};


const locationName =
  document.querySelector(
    "#location-name"
  );

const locationPopulation =
  document.querySelector(
    "#location-population"
  );

const locationThreat =
  document.querySelector(
    "#location-threat"
  );

const locationDescription =
  document.querySelector(
    "#location-description"
  );

const locationNote =
  document.querySelector(
    "#location-note"
  );

const mapPoints =
  document.querySelectorAll(
    "[data-location]"
  );


mapPoints.forEach(point => {

  point.addEventListener(
    "click",
    () => {

      const location =
        locations[
          point.dataset.location
        ];

      mapPoints.forEach(
        item =>
          item.classList.remove(
            "active"
          )
      );

      point.classList.add(
        "active"
      );

      locationName.textContent =
        location.name;

      locationPopulation.textContent =
        location.population;

      locationThreat.textContent =
        location.threat;

      locationDescription.textContent =
        location.description;

      locationNote.textContent =
        location.note;

      increaseHeat(
        location.heat
      );

    }
  );

});


/* =========================================================
   BOOTLEG ARCHIVE
========================================================= */

const artifactButtons =
  document.querySelectorAll(
    "[data-artifact]"
  );


artifactButtons.forEach(button => {

  let openedBefore = false;

  button.addEventListener(
    "click",
    () => {

      const content =
        button.nextElementSibling;

      const opening =
        content.hidden;

      content.hidden =
        !content.hidden;


      button.querySelector(
        "small"
      ).textContent =
        opening
          ? "FECHAR ARQUIVO ↑"
          : "ABRIR ARQUIVO →";


      if (
        opening &&
        !openedBefore
      ) {

        openedBefore = true;

        increaseHeat(4);

      }

    }
  );

});


/* =========================================================
   VEHICLE
========================================================= */

const vehicleParts = {

  engine: {

    label:
      "ENGINE",

    description:
      "V8 remendado tantas vezes que nenhum cilindro parece pertencer ao mesmo motor. Funciona com gasolina, etanol e, segundo o guitarrista, \"qualquer coisa que queime\"."

  },


  radio: {

    label:
      "LONG RANGE RADIO",

    description:
      "Montado com peças encontradas nas Zonas. Depois da estação 106.6, começou a receber sinais mesmo quando está desligado."

  },


  trunk: {

    label:
      "TRUNK",

    description:
      "Três amplificadores, duas guitarras, um baixo, peças de bateria, galões de combustível, munição, cabos e quase nenhuma comida."

  },


  backseat: {

    label:
      "BACK SEAT",

    description:
      "Três latas vazias, uma guitarra quebrada e alguma coisa respirando debaixo de um cobertor. Ninguém quer verificar."

  }

};


const vehicleLabel =
  document.querySelector(
    "#vehicle-label"
  );

const vehicleDescription =
  document.querySelector(
    "#vehicle-description"
  );

const vehicleButtons =
  document.querySelectorAll(
    "[data-part]"
  );


vehicleButtons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      const part =
        vehicleParts[
          button.dataset.part
        ];

      vehicleButtons.forEach(
        item =>
          item.classList.remove(
            "active"
          )
      );

      button.classList.add(
        "active"
      );

      vehicleLabel.textContent =
        part.label;

      vehicleDescription.textContent =
        part.description;


      if (
        button.dataset.part ===
        "backseat"
      ) {

        increaseHeat(6);

      }

    }
  );

});


/* =========================================================
   RANDOM ROAD EVENTS
========================================================= */

const roadEvents = [

  "Um posto aparece no mapa. O problema: ele não existia cinco minutos atrás.",

  "O rádio sintoniza uma música que a banda ainda não compôs.",

  "Marcas de pneus saem da estrada e continuam em linha reta pelo deserto.",

  "Uma placa anuncia a mesma cidade pelos próximos 87 quilômetros.",

  "Há alguém no banco de trás. Ninguém lembra de tê-lo deixado entrar.",

  "O horizonte pisca como uma televisão velha.",

  "Uma tempestade de areia vem na direção contrária ao vento.",

  "Um comboio passa por vocês. Todos os motoristas têm o mesmo rosto.",

  "Uma criança oferece água em troca de uma fita cassete específica.",

  "O tanque está mais cheio do que estava vinte minutos atrás.",

  "Ao longe existe um palco montado no meio do deserto. Há gente esperando pela banda.",

  "Um rádio enterrado na areia está tocando Last Static.",

  "A estrada desaparece por três quilômetros e reaparece exatamente onde deveria estar.",

  "Uma torre de transmissão aparece no horizonte. O rádio marca 106.6 FM.",

  "Vocês encontram as próprias marcas de pneu vindo da direção oposta."

];


document
  .querySelector("#random-road")
  .addEventListener(
    "click",
    () => {

      const result =
        roadEvents[
          Math.floor(
            Math.random() *
            roadEvents.length
          )
        ];

      document
        .querySelector("#road-result")
        .textContent =
          result;

      increaseHeat(
        Math.floor(
          Math.random() * 7
        ) + 3
      );

    }
  );


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