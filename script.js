const espacosCount = 12;
const maxRaspagens = 3;
let valoresOcultos = [];
let raspagensFeitas = 0;
let mousePressionado = false;

function iniciarJogo() {
    valoresOcultos = criarValoresOcultos();
    raspagensFeitas = 0;
    const area = document.getElementById("raspadinha");
    area.innerHTML = "";

    for (let i = 0; i < espacosCount; i++) {
        const espaco = document.createElement("div");
        espaco.className = "espaco";
        espaco.dataset.valor = valoresOcultos[i];

        const texto = document.createElement("span");
        texto.className = "valor";
        texto.textContent = valoresOcultos[i];
        espaco.appendChild(texto);

        const overlay = document.createElement("div");
        overlay.className = "overlay";
        overlay.textContent = "Raspe aqui";
        espaco.appendChild(overlay);

        espaco.addEventListener("mousedown", revelarEspaco);
        espaco.addEventListener("mouseenter", rasparSeSegurando);
        area.appendChild(espaco);
    }

    document.getElementById("resultado").textContent =
        "Segure o clique e arraste sobre até 3 espaços. Você só pode raspar 3 deles.";
}

function criarValoresOcultos() {
    const tipos = [
        "🎽 Camiseta Oficial KNOW",
        "🖊️ Caneta Personalizada KNOW",
        "💰 10% de desconto na matrícula",
        "🎟️ Entrada gratuita para evento"
    ];

    const deck = tipos.flatMap((valor) => Array(3).fill(valor));
    return deck.sort(() => Math.random() - 0.5);
}

function rasparSeSegurando(event) {
    if (!mousePressionado) {
        return;
    }
    revelarEspaco(event);
}

function revelarEspaco(event) {
    const espaco = event.currentTarget;
    if (espaco.classList.contains("revelado") || raspagensFeitas >= maxRaspagens) {
        return;
    }

    if (event.type === "mousedown") {
        mousePressionado = true;
    }

    espaco.classList.add("revelado");
    espaco.textContent = espaco.dataset.valor;
    raspagensFeitas += 1;
    verificarResultado(espaco.dataset.valor);
}

function verificarResultado(valor) {
    const revelados = Array.from(document.querySelectorAll(".espaco.revelado"));
    const iguais = revelados.filter((el) => el.dataset.valor === valor).length;

    if (raspagensFeitas === maxRaspagens) {
        if (iguais === 3) {
            document.getElementById("resultado").textContent =
                `Parabéns! Você ganhou: ${valor}`;
        } else {
            document.getElementById("resultado").textContent =
                "Fim de jogo! Você raspou 3 e não encontrou 3 iguais. Tente novamente.";
        }
        bloquearEspacos();
        return;
    }

    document.getElementById("resultado").textContent =
        `Você raspou ${raspagensFeitas} de ${maxRaspagens}. Continue segurando o clique...`;
}

function bloquearEspacos() {
    const espacos = document.querySelectorAll(".espaco");
    espacos.forEach((espaco) => {
        espaco.removeEventListener("mousedown", revelarEspaco);
        espaco.removeEventListener("mouseenter", rasparSeSegurando);
    });
}

window.addEventListener("mousedown", () => {
    mousePressionado = true;
});

window.addEventListener("mouseup", () => {
    mousePressionado = false;
});

window.addEventListener("load", iniciarJogo);
