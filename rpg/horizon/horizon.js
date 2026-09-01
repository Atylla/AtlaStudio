const output = document.querySelector("#terminal-output");
const form = document.querySelector("#terminal-form");
const input = document.querySelector("#command");
const terminal = document.querySelector(".terminal");

const PDF_PATH = "./project-horizon.pdf";

const esc = document.querySelector("#esc-retornar");


/* =========================================================
   ESTADO DA INVESTIGAÇÃO
   ========================================================= */

const state = {
  scanned: false,
  deck6Investigated: false,
  signalFound: false,
  signalDecoded: false,
  probeLaunched: false,

  unlockedLogs: new Set([
    "001",
    "014"
  ])
};


/* =========================================================
   LOGS
   ========================================================= */

const logs = {

  "001": `
ARQUIVO 001
CAPITÃ ELENA VASQUEZ
DIA DE MISSÃO: 184

Chegamos às coordenadas previstas.

Não existe estrela.
Não existe planeta.
Não existe matéria detectável.

Os sensores simplesmente deixam de receber informação depois de determinado ponto.

Ainda assim, existe uma linha no horizonte.

Distante demais para calcularmos a distância.

Solicitei nova calibração dos sensores.
`.trim(),


  "014": `
ARQUIVO 014
DEPARTAMENTO DE CARTOGRAFIA

O setor deveria estar vazio.

A primeira varredura retornou ausência total de matéria.

A segunda detectou nossa própria assinatura de nave a 0,7 UA à frente da ORPHEUS.

A terceira retornou os registros de identificação da nave.

A quarta varredura foi cancelada antes de terminar.
`.trim(),


  "022": `
ARQUIVO 022
ENGENHARIA

Encontramos alterações nos corredores centrais.

Não são danos estruturais.

As medidas simplesmente não correspondem mais aos projetos da nave.

O corredor C-14 está 3,8 metros mais comprido.

Nenhuma parede foi deslocada.

Não sabemos onde os 3,8 metros adicionais estão.
`.trim(),


  "031": `
ARQUIVO 031
SISTEMA MÉDICO AUTOMÁTICO

Tripulantes registrados: 17.

Assinaturas biométricas ativas: 18.

Não houve acoplamento.
Não houve missão extraveicular.
Não houve nascimento registrado.

A décima oitava assinatura se desloca com a tripulação.

Não pertence a nenhum compartimento específico.
`.trim(),


  "044": `
ARQUIVO 044
LABORATÓRIO DE COMUNICAÇÕES

A frequência não contém uma mensagem.

Ela contém relações.

Distância.
Forma.
Posição.
Interior.
Exterior.

Quando convertida para áudio, membros da tripulação afirmam escutar vozes.

As vozes não aparecem na gravação.

A transmissão continua aumentando de intensidade.

Não estamos nos aproximando do Horizonte.
`.trim(),


  "061": `
ARQUIVO 061
SONDA HZN-P3
TELEMETRIA RECUPERADA

Lançamento confirmado.

Velocidade nominal.

Trajetória: em direção ao Horizonte.

Após 11 minutos, a sonda desapareceu dos sensores.

Após 19 minutos, recebemos novamente seu sinal.

A transmissão vinha da nossa frente.

A câmera mostrava a ORPHEUS.

Segundo a telemetria, a sonda estava observando a nave de um ponto que ainda não alcançamos.
`.trim(),


  "077": `
ARQUIVO 077
REGISTRO LOCAL // DECK 6

Não existe acesso externo neste deck.

Mesmo assim, ouvimos impactos vindos do outro lado do casco.

O sistema registra pressão atmosférica do lado de fora da porta de manutenção.

Pressão normal.

Temperatura normal.

Gravidade normal.

A porta continua classificada como "EXTERIOR".

Ninguém recebeu autorização para abri-la.
`.trim(),


  "113": `
ARQUIVO 113
AUTORIA DESCONHECIDA

O Horizonte não está diante da nave.

Essa foi a primeira coisa que entendemos errado.

Distância não significa o mesmo aqui.

Ele não está longe.

Ele está do outro lado de alguma coisa.

E cada transmissão deixa essa coisa mais fina.
`.trim()

};


/* =========================================================
   HISTÓRICO DE COMANDOS
   ========================================================= */

const commandHistory = [];
let historyIndex = 0;


/* =========================================================
   PRINT
   ========================================================= */

function print(text, type = "") {
  const p = document.createElement("p");

  p.className = `line ${type}`.trim();
  p.textContent = text;

  output.append(p);

  output.scrollTop = output.scrollHeight;
}


function printCommand(text) {
  print(`HZN-04> ${text}`, "command");
}


function unlockLog(id) {

  if (state.unlockedLogs.has(id)) {
    return false;
  }

  state.unlockedLogs.add(id);

  print(
    `NOVO ARQUIVO RECUPERADO: ${id}\nDigite "open ${id}" para acessar.`,
    "success"
  );

  return true;
}


/* =========================================================
   HELP
   ========================================================= */

function showHelp() {

  print(
`COMANDOS DISPONÍVEIS

help
    Exibe esta lista.

status
    Consulta os sistemas principais da ORPHEUS.

logs
    Lista arquivos conhecidos.

open [id]
    Abre um arquivo recuperado.

scan
    Executa uma varredura interna e externa.

crew
    Consulta o registro da tripulação.

deck [número]
    Consulta informações de um deck.

signal
    Analisa transmissões externas.

decode [valor]
    Tenta decodificar uma sequência ou identificador.

probe
    Consulta o subsistema de sondas.

download
    Baixa o PDF de Project Horizon.

clear
    Limpa o terminal.

Alguns comandos do HORIZON OS não constam na documentação.`,
    "system"
  );
}


/* =========================================================
   STATUS
   ========================================================= */

function showStatus() {

  print(
`ORPHEUS // HZN-04

ENERGIA.................. 41%
SUPORTE DE VIDA.......... OPERACIONAL
NAVEGAÇÃO................ INDISPONÍVEL
COMUNICAÇÃO.............. DEGRADADA
MOTORES.................. STANDBY

TRIPULAÇÃO REGISTRADA.... 17
ASSINATURAS BIOMÉTRICAS.. 18

INTEGRIDADE ESTRUTURAL... 73%
GEOMETRIA INTERNA........ ERRO

DISTÂNCIA DO HORIZONTE... INDETERMINADA
VARIAÇÃO DESDE ONTEM..... 0.000000%

ALERTA DE PROXIMIDADE.... ATIVO`,
    "system"
  );

}


/* =========================================================
   LOGS
   ========================================================= */

function showLogs() {

  const catalog = [
    ["001", "REGISTRO DE COMANDO"],
    ["014", "CARTOGRAFIA"],
    ["022", "ENGENHARIA"],
    ["031", "BIOMETRIA"],
    ["044", "COMUNICAÇÕES"],
    ["061", "SONDA HZN-P3"],
    ["077", "DECK 6"],
    ["113", "ORIGEM DESCONHECIDA"]
  ];

  let text = "ÍNDICE DE ARQUIVOS\n\n";

  for (const [id, name] of catalog) {

    if (state.unlockedLogs.has(id)) {

      text += `[${id}] ${name} ........ RECUPERADO\n`;

    } else {

      text += `[---] ${name} ........ INDISPONÍVEL\n`;

    }

  }

  text += '\nUse "open [id]" para acessar arquivos recuperados.';

  print(text, "system");
}


/* =========================================================
   OPEN
   ========================================================= */

function openLog(rawId) {

  if (!rawId) {

    print('USO: open [id]', "error");

    return;
  }

  const id = rawId.padStart(3, "0");

  if (!state.unlockedLogs.has(id)) {

    print(
      "ARQUIVO NÃO ENCONTRADO, CORROMPIDO OU AINDA NÃO RECUPERADO.",
      "error"
    );

    return;
  }

  if (!logs[id]) {

    print("ARQUIVO CORROMPIDO.", "error");

    return;
  }

  print(logs[id]);
}


/* =========================================================
   SCAN
   ========================================================= */

function scan() {

  if (!state.scanned) {

    state.scanned = true;

    print(
`INICIANDO VARREDURA...

CASCO EXTERNO............. OK
PROPULSÃO................. OK
COMUNICAÇÕES.............. INTERFERÊNCIA
CARTOGRAFIA............... ERRO
GEOMETRIA INTERNA......... INCONSISTENTE

ANOMALIA LOCALIZADA.

CORREDOR C-14:
COMPRIMENTO REGISTRADO.... 42,2 m
COMPRIMENTO DE PROJETO.... 38,4 m

DIFERENÇA................. +3,8 m

Nenhuma alteração física registrada nos arquivos de manutenção.`,
      "system"
    );

    unlockLog("022");

    return;
  }

  print(
`VARREDURA CONCLUÍDA.

Nenhuma nova alteração estrutural detectada.

Observação:
o corredor C-14 continua 3,8 metros maior do que deveria.`,
    "system"
  );
}


/* =========================================================
   CREW
   ========================================================= */

function crew() {

  print(
`REGISTRO DE TRIPULAÇÃO

01  ELENA VASQUEZ......... CAPITÃ
02  MARCUS VALE........... NAVEGAÇÃO
03  DR. SORA YAMADA....... XENOBIOLOGIA
04  ILYA PETROV........... ENGENHARIA
05  RENATA SILVA.......... COMUNICAÇÕES
06  DANIEL KLINE.......... MÉDICO
07  LI WEI................ CARTOGRAFIA
08  NOAH REYES............ SISTEMAS
09  AMIRA KHOURY.......... FÍSICA
10  JONAS BECKER.......... ENGENHARIA
11  MAYA OKAFOR........... PESQUISA
12  ERIK HOLM............. SEGURANÇA
13  LENA PARK............. SISTEMAS
14  TOMÁS VEGA............ MANUTENÇÃO
15  PRIYA NAIR............ BIOLOGIA
16  ISAAC WARD............ PILOTO
17  ANA TORRES............ COMUNICAÇÕES

ASSINATURAS ATIVAS: 18

ASSINATURA 18:
IDENTIDADE............... NÃO CADASTRADA
LOCALIZAÇÃO.............. INSTÁVEL
ÚLTIMO SINAL CONFIÁVEL... DECK 6`,
    "system"
  );

  unlockLog("031");
}


/* =========================================================
   DECK
   ========================================================= */

function inspectDeck(number) {

  if (!number) {

    print('USO: deck [número]', "error");

    return;
  }

  switch (number) {

    case "1":
      print(
`DECK 1 // COMANDO

STATUS: OPERACIONAL

ACESSO À PONTE BLOQUEADO.
NENHUMA RESPOSTA DA TRIPULAÇÃO.`,
        "system"
      );
      break;


    case "2":
      print(
`DECK 2 // HABITAÇÃO

STATUS: PARCIAL

17 CABINES REGISTRADAS.
18 PORTAS DETECTADAS PELO SISTEMA DE PROXIMIDADE.`,
        "system"
      );
      break;


    case "3":
      print(
`DECK 3 // LABORATÓRIOS

STATUS: ISOLADO

SISTEMA MÉDICO EM MODO AUTOMÁTICO.
ACESSO REMOTO NEGADO.`,
        "system"
      );
      break;


    case "4":
      print(
`DECK 4 // ENGENHARIA

STATUS: OPERACIONAL

CONSUMO ENERGÉTICO 12% ACIMA DO PREVISTO.

ORIGEM DO CONSUMO NÃO IDENTIFICADA.`,
        "system"
      );
      break;


    case "5":
      print(
`DECK 5 // CARGA

STATUS: OPERACIONAL

NENHUMA ANOMALIA REGISTRADA.`,
        "system"
      );
      break;


    case "6":

      state.deck6Investigated = true;

      print(
`DECK 6 // MANUTENÇÃO

STATUS.................... INCONSISTENTE

ACESSOS REGISTRADOS....... 4
ACESSOS DETECTADOS........ 5

PORTA M-06-E:
CLASSIFICAÇÃO............. EXTERIOR
PRESSÃO ALÉM DA PORTA..... 101.3 kPa
TEMPERATURA............... 21°C
GRAVIDADE................. 1.00 G

AVISO:

A ORPHEUS NÃO POSSUI COMPARTIMENTO EXTERNO
CONECTADO À PORTA M-06-E.`,
        "system"
      );

      unlockLog("077");

      break;


    default:

      print(
        `DECK ${number}: NÃO ENCONTRADO.`,
        "error"
      );
  }

}


/* =========================================================
   SIGNAL
   ========================================================= */

function signal() {

  state.signalFound = true;

  print(
`SUBSISTEMA DE COMUNICAÇÕES

ORIGEM.................... DESCONHECIDA
DIREÇÃO................... HORIZONTE
FREQUÊNCIA................ VARIÁVEL
MODULAÇÃO................. NÃO RECONHECIDA

A transmissão não segue uma progressão temporal estável.

PADRÃO RECORRENTE DETECTADO:

8  15  18  9  26  15  14

INTERVALO:
13.000000 segundos

O sistema possui um módulo experimental de decodificação.`,
    "system"
  );
}


/* =========================================================
   DECODE
   ========================================================= */

function decode(value) {

  if (!value) {

    print(
      'USO: decode [valor]',
      "error"
    );

    return;
  }

  const clean = value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  const acceptedValues = [
    "horizon",
    "8 15 18 9 26 15 14",
    "815189261514"
  ];


  if (!state.signalFound) {

    print(
      "NENHUM SINAL DISPONÍVEL PARA DECODIFICAÇÃO.",
      "error"
    );

    return;
  }


  if (!acceptedValues.includes(clean)) {

    print(
`DECODIFICAÇÃO FALHOU.

O padrão não corresponde aos protocolos conhecidos.`,
      "error"
    );

    return;
  }


  if (!state.signalDecoded) {

    state.signalDecoded = true;

    print(
`DECODIFICAÇÃO PARCIAL CONCLUÍDA.

PADRÃO:
8 15 18 9 26 15 14

CONVERSÃO ALFABÉTICA:

H O R I Z O N


AVISO

A sequência não foi encontrada dentro da transmissão.

Ela foi encontrada na estrutura utilizada
para organizar os pacotes de transmissão.

O sistema não sabe explicar a diferença.`,
      "success"
    );

    unlockLog("044");
    unlockLog("113");

    return;
  }


  print(
    "SINAL JÁ DECODIFICADO.",
    "system"
  );

}


/* =========================================================
   PROBE
   ========================================================= */

function probe() {

  if (!state.probeLaunched) {

    state.probeLaunched = true;

    print(
`SUBSISTEMA DE SONDAS

HZN-P1.................... PERDIDA
HZN-P2.................... SEM TELEMETRIA
HZN-P3.................... SINAL DETECTADO

ÚLTIMA MISSÃO:
CARTOGRAFAR O LIMITE DO SETOR.

TRAJETÓRIA:
ORPHEUS -> HORIZONTE

STATUS ATUAL:
SINAL RECEBIDO.

ORIGEM DO SINAL:
0,42 UA À FRENTE DA ORPHEUS.

ERRO:

A HZN-P3 NÃO POSSUI PROPULSÃO
SUFICIENTE PARA TER ALCANÇADO ESSA POSIÇÃO.`,
      "system"
    );

    unlockLog("061");

    return;
  }


  print(
`HZN-P3

SINAL AINDA ATIVO.

DISTÂNCIA DO SINAL:
0,42 UA

A distância não mudou desde a última consulta.`,
    "system"
  );

}


/* =========================================================
   DOWNLOAD
   ========================================================= */

function downloadPDF() {
  print(
    `DOCUMENT NOT FOUND | ERROR 404

    [RECONEXÃO]

DOCUMENT FIND
    
ACESSO.................NEGADO
STATUS.................[EM BREVE]
    `,
    "error"
  );


  /*
    print(
    "INICIANDO TRANSFERÊNCIA // PROJECT HORIZON ONE-PAGE RPG...",
    "success"
  );

  const link = document.createElement("a");

  link.href = PDF_PATH;
  link.download = "project-horizon.pdf";

  document.body.appendChild(link);

  link.click();
  link.remove();
   */




}


/* =========================================================
   EASTER EGGS
   ========================================================= */

function whoAmI() {

  print(
`SESSÃO REMOTA

USUÁRIO................... NÃO IDENTIFICADO
ORIGEM.................... EXTERNA
AUTORIZAÇÃO............... NÍVEL 0

OBSERVAÇÃO:

Esta sessão não consta no registro de conexões da ORPHEUS.`,
    "system"
  );
}


function exitTerminal() {

  print(
`ENCERRANDO CONEXÃO...

ERRO.

O SERVIDOR REMOTO RECUSOU O ENCERRAMENTO.

CONEXÃO MANTIDA.`,
    "error"
  );
}


/* =========================================================
   EXECUÇÃO
   ========================================================= */

function runCommand(raw) {

  const trimmed = raw.trim();

  if (!trimmed) {
    return;
  }

  commandHistory.push(trimmed);
  historyIndex = commandHistory.length;

  printCommand(trimmed);

  const parts = trimmed.toLowerCase().split(/\s+/);

  const command = parts.shift();
  const args = parts;


  switch (command) {

    case "help":
    case "?":
      showHelp();
      break;


    case "status":
      showStatus();
      break;


    case "logs":
    case "ls":
      showLogs();
      break;


    case "open":
    case "cat":
      openLog(args[0]);
      break;


    case "scan":
      scan();
      break;


    case "crew":
      crew();
      break;


    case "deck":
      inspectDeck(args[0]);
      break;


    case "signal":
      signal();
      break;


    case "decode":
      decode(args.join(" "));
      break;


    case "probe":
      probe();
      break;


    case "download":
      downloadPDF();
      break;


    case "whoami":
      whoAmI();
      break;


    case "exit":
    case "logout":
      exitTerminal();
      break;


    case "clear":
    case "cls":
      output.innerHTML = "";
      break;


    default:

      print(
        `COMANDO DESCONHECIDO: ${command}\nDigite "help".`,
        "error"
      );

  }

}


/* =========================================================
   FORM
   ========================================================= */

form.addEventListener("submit", event => {

  event.preventDefault();

  const command = input.value;

  input.value = "";

  runCommand(command);

});


/* =========================================================
   HISTÓRICO ↑ ↓
   ========================================================= */

input.addEventListener("keydown", event => {

  if (event.key === "ArrowUp") {

    event.preventDefault();

    if (historyIndex > 0) {
      historyIndex--;
    }

    input.value =
      commandHistory[historyIndex] || "";

  }


  if (event.key === "ArrowDown") {

    event.preventDefault();

    if (historyIndex < commandHistory.length) {
      historyIndex++;
    }

    input.value =
      commandHistory[historyIndex] || "";

  }


});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    history.back();
  }
});


/* =========================================================
   FOCO AUTOMÁTICO
   ========================================================= */

terminal.addEventListener("click", () => {
  input.focus();
});


/* =========================================================
   CLOCK
   ========================================================= */

function updateClock() {

  document.querySelector("#clock").textContent =
    new Date().toLocaleTimeString(
      "pt-BR",
      {
        hour12: false
      }
    );

}

setInterval(updateClock, 1000);

updateClock();


/* =========================================================
   BOOT
   ========================================================= */

print("HORIZON OS v0.9.13", "system");
print("INICIALIZANDO INTERFACE REMOTA...", "system");
print("CONEXÃO ESTABELECIDA COM ORPHEUS // HZN-04", "system");

print(
`AVISO:
A última transmissão da nave foi recebida há ███ dias.`,
  "error"
);

print(
`Digite "help" para consultar os comandos disponíveis.`
);