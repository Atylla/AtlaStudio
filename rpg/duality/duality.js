const symbols = {
  sun: "☉",
  below: "▽",
  void: "○",
  eye: "◉",
  moon: "☾"
};

const solution = ["sun", "below", "void"];

let sequence = [];

const sequenceEl = document.querySelector("#sequence");
const resultEl = document.querySelector("#puzzle-result");

const resetButton = document.querySelector("#reset");
const submitButton = document.querySelector("#submit");

const relicButton = document.querySelector("#relic-button");
const relicOutput = document.querySelector("#relic-output");


/* ============================================================
   PUZZLE
============================================================ */

function updateSequence() {
  sequenceEl.textContent = sequence.length
    ? sequence.map(value => symbols[value]).join("  ")
    : "— — —";
}


function resetSequence(message) {
  sequence = [];

  resultEl.textContent = message;

  updateSequence();
}


document.querySelectorAll(".rune").forEach(button => {

  button.addEventListener("click", () => {

    if (sequence.length >= 3) {
      return;
    }

    sequence.push(button.dataset.value);

    button.classList.add("selected");

    setTimeout(() => {
      button.classList.remove("selected");
    }, 180);

    updateSequence();

  });

});


resetButton.addEventListener("click", () => {

  resetSequence(
    "As marcas voltam lentamente à posição original."
  );

});


submitButton.addEventListener("click", () => {

  const correct =
    sequence.length === solution.length &&
    solution.every(
      (value, index) => sequence[index] === value
    );

  if (correct) {

    resultEl.textContent =
      "Os três discos param ao mesmo tempo. A porta recua alguns centímetros sem produzir som. Do outro lado, alguém riscou a data de hoje na parede.";

    return;
  }

  resetSequence(
    "O mecanismo recusa a sequência. Alguma coisa se move atrás da parede."
  );

});


/* ============================================================
   RELÍQUIAS
============================================================ */

const relics = [
  "Uma moeda com duas faces idênticas. Quando lançada, cai sempre em pé.",

  "Um dente de metal ainda morno. Há inscrições microscópicas na raiz.",

  "Uma fotografia de uma escavação que ainda não aconteceu.",

  "Um mapa da Ruína. O ponto marcado como “VOCÊ ESTÁ AQUI” continua se movendo.",

  "Um sino sem badalo. Mesmo assim, você consegue ouvi-lo quando fecha os olhos.",

  "Uma chave que não possui dentes. Sua sombra, porém, possui.",

  "Uma pequena caixa de metal. Quando aberta, é possível ouvir chuva do outro lado.",

  "Um fragmento de vidro que reflete o corredor como ele era antes de ser soterrado.",

  "Uma placa metálica coberta de nomes. O último deles é o seu.",

  "Um medalhão encontrado em uma sepultura antiga. O retrato gravado nele muda toda vez que alguém dorme perto do objeto."
];


relicButton.addEventListener("click", () => {

  const relic =
    relics[
      Math.floor(
        Math.random() * relics.length
      )
    ];

  relicOutput.textContent = relic;

});