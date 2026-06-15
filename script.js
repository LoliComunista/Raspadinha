const espacosCount = 12;
const maxRaspagens = 3;
const storageKey = "raspadinha_last_play_date";
let valoresOcultos = [];
let raspagensFeitas = 0;
let mousePressionado = false;

function iniciarJogo() {
    if (jaJogouHoje()) {
        mostrarBloqueioDiario();
        return;
    }
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

        const overlay = document.createElement("canvas");
        overlay.className = "overlay-canvas";
        overlay.dataset.revelado = "false";
        espaco.appendChild(overlay);

        overlay.addEventListener("pointerdown", iniciarRaspagem);
        area.appendChild(espaco);
        pintarOverlay(overlay);
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

function pintarOverlay(canvas) {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#c0c0c0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#555";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Raspe aqui", canvas.width / 2, canvas.height / 2);
}

function iniciarRaspagem(event) {
    if (raspagensFeitas >= maxRaspagens) {
        return;
    }

    mousePressionado = true;
    raspar(event);
}

function rasparDuranteArraste(event) {
    if (!mousePressionado || raspagensFeitas >= maxRaspagens) {
        return;
    }

    const overlay = event.target.closest(".overlay-canvas");
    if (!overlay) {
        return;
    }

    raspar({
        clientX: event.clientX,
        clientY: event.clientY,
        currentTarget: overlay
    });
}

function raspar(event) {
    const canvas = event.currentTarget;
    const espaco = canvas.closest(".espaco");
    if (espaco.classList.contains("revelado")) {
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const ctx = canvas.getContext("2d");

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    if (!espaco.classList.contains("revelado") && calcularCoberturaRaspada(canvas) >= 0.65) {
        revelarEspaco(espaco, canvas);
    }

    if (raspagensFeitas === maxRaspagens) {
        verificarResultado();
    }
}

function revelarEspaco(espaco, canvas) {
    if (espaco.classList.contains("revelado")) {
        return;
    }

    raspagensFeitas += 1;
    espaco.classList.add("revelado");
    canvas.dataset.revelado = "true";
    canvas.style.pointerEvents = "none";
    canvas.style.opacity = "0";
    espaco.querySelector(".valor").style.opacity = "1";
    atualizarResultado();
}

function atualizarResultado() {
    if (raspagensFeitas === 0) {
        document.getElementById("resultado").textContent =
            "Segure o clique e arraste sobre até 3 espaços. Você só pode raspar 3 deles.";
        return;
    }

    document.getElementById("resultado").textContent =
        `Você revelou ${raspagensFeitas} de ${maxRaspagens}. Continue segurando o clique...`;
}

function hoje() {
    const now = new Date();
    const ano = now.getFullYear();
    const mes = String(now.getMonth() + 1).padStart(2, "0");
    const dia = String(now.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function jaJogouHoje() {
    return localStorage.getItem(storageKey) === hoje();
}

function salvarJogoHoje() {
    localStorage.setItem(storageKey, hoje());
}

function mostrarBloqueioDiario() {
    const area = document.getElementById("raspadinha");
    area.innerHTML = "";
    const mensagem = document.createElement("p");
    mensagem.textContent = "Você já jogou hoje. Volte amanhã para raspar de novo.";
    mensagem.className = "bloqueio-diario";
    area.appendChild(mensagem);
    document.getElementById("resultado").textContent =
        "Raspadinha disponível novamente amanhã.";
}

function calcularCoberturaRaspada(canvas) {
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentCount = 0;

    for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) {
            transparentCount += 1;
        }
    }

    return transparentCount / (canvas.width * canvas.height);
}

function verificarResultado() {
    const revelados = Array.from(document.querySelectorAll(".espaco.revelado"));
    const valores = revelados.map((el) => el.dataset.valor);
    const contagem = valores.reduce((acc, valor) => {
        acc[valor] = (acc[valor] || 0) + 1;
        return acc;
    }, {});

    const ganhou = Object.values(contagem).some((quantidade) => quantidade >= 3);

    if (ganhou) {
        const valorPremiado = Object.keys(contagem).find(
            (valor) => contagem[valor] >= 3
        );
        document.getElementById("resultado").textContent =
            `Parabéns! Você ganhou: ${valorPremiado}`;
    } else {
        document.getElementById("resultado").textContent =
            "Fim de jogo! Você raspou 3 e não encontrou 3 iguais.";
        bloquearEspacos();
    }

    salvarJogoHoje();
}

function bloquearEspacos() {
    const espacos = document.querySelectorAll(".espaco");
    espacos.forEach((espaco) => {
        const canvas = espaco.querySelector("canvas.overlay-canvas");
        if (canvas) {
            canvas.style.pointerEvents = "none";
        }
    });
}

document.addEventListener("pointermove", rasparDuranteArraste);
window.addEventListener("mouseup", () => {
    mousePressionado = false;
});

window.addEventListener("load", iniciarJogo);
