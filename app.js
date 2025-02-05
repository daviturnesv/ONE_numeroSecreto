document.addEventListener("DOMContentLoaded", () => {
    atualizarHistorico();
    atualizarLeaderboard();

    document.getElementById("nivel").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            iniciarJogo();
        }
    });

    document.getElementById("guess").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            fazerPalpite();
        }
    });
});

const niveis = {
    facil: { maxNum: 50, tentativas: 15 },
    medio: { maxNum: 100, tentativas: 10 },
    dificil: { maxNum: 200, tentativas: 5 }
};

let numeroSecreto;
let rodada;
let tentativasRestantes;
let historicoTentativas;
let startTime;
let dicas;
let nivelSelecionado;
let ordenarPorTentativas = true;

function iniciarJogo() {
    nivelSelecionado = document.getElementById("nivel").value;
    const nivel = niveis[nivelSelecionado] || niveis.medio;

    numeroSecreto = Math.floor(Math.random() * nivel.maxNum) + 1;
    console.log(numeroSecreto);

    rodada = 1;
    tentativasRestantes = nivel.tentativas;
    historicoTentativas = [];
    startTime = Date.now();
    dicas = [
        `O número secreto é ${numeroSecreto % 2 === 0 ? 'par' : 'ímpar'}.`,
        `O número secreto é múltiplo de ${[2, 3, 5, 7].find(n => numeroSecreto % n === 0)}.`
    ];

    document.getElementById("configuracao").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");
    document.getElementById("historicoJogosContainer").classList.add("hidden");
    document.getElementById("leaderboardContainer").classList.add("hidden");
    document.getElementById("mensagem").textContent = `Escolha um número entre 1 e ${nivel.maxNum}`;
    document.getElementById("tentativas").textContent = `Tentativas restantes: ${tentativasRestantes}`;
    document.getElementById("dicas").textContent = "";
    document.getElementById("historicoTentativas").innerHTML = "";
}

function fazerPalpite() {
    const guess = Number(document.getElementById("guess").value);

    const nivel = niveis[nivelSelecionado] || niveis.medio;

    if (!Number.isInteger(guess) || guess < 1 || guess > nivel.maxNum) {
        alert(`Por favor, digite um número inteiro entre 1 e ${nivel.maxNum}.`);
        return;
    }

    if (numeroSecreto === guess) {
        let palavraRodada = rodada === 1 ? "tentativa" : "tentativas";
        let endTime = Date.now();
        let timeTaken = ((endTime - startTime) / 1000).toFixed(2);
        alert(`Boa guri(a), acertasse o número secreto (${numeroSecreto}) em ${rodada} ${palavraRodada} e levou ${timeTaken} segundos`);
        console.log("Acertou!");

        let historicoJogos = JSON.parse(localStorage.getItem('historicoJogos')) || [];
        let jogoNumero = historicoJogos.length + 1;
        historicoJogos.push({ jogoNumero, numeroSecreto, rodada, timeTaken, nivel: nivelSelecionado, tentativas: [...historicoTentativas], status: 'Acertou' });
        localStorage.setItem('historicoJogos', JSON.stringify(historicoJogos));

        let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        leaderboard.push({ jogoNumero, rodada, timeTaken, nivel: nivelSelecionado });
        ordenarLeaderboard(leaderboard);
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

        atualizarHistorico();
        atualizarLeaderboard();

        document.getElementById("game").classList.add("hidden");
        document.getElementById("configuracao").classList.remove("hidden");
        document.getElementById("historicoJogosContainer").classList.remove("hidden");
        document.getElementById("leaderboardContainer").classList.remove("hidden");
        return;
    } else if (numeroSecreto > guess) {
        alert(`Puts, o número secreto é maior que ${guess}`);
        historicoTentativas.push(`${guess} (↑)`);
        console.log("Errou!!");
    } else if (numeroSecreto < guess) {
        alert(`Bah, o número secreto é menor que ${guess}`);
        historicoTentativas.push(`${guess} (↓)`);
        console.log("Errou!!");
    }

    if (rodada === Math.ceil(tentativasRestantes / 2)) {
        document.getElementById("dicas").textContent = dicas.shift();
    }

    rodada++;
    tentativasRestantes--;

    document.getElementById("tentativas").textContent = `Tentativas restantes: ${tentativasRestantes}`;
    document.getElementById("historicoTentativas").innerHTML = historicoTentativas.join(", ");

    if (tentativasRestantes === 0) {
        let endTime = Date.now();
        let timeTaken = ((endTime - startTime) / 1000).toFixed(2);
        alert(`Que lascada, não acertasse de jeito nenhum!\nO número secreto era ${numeroSecreto}`);
        console.log("Errou tudo!");

        let historicoJogos = JSON.parse(localStorage.getItem('historicoJogos')) || [];
        let jogoNumero = historicoJogos.length + 1;
        historicoJogos.push({ jogoNumero, numeroSecreto, rodada, timeTaken, nivel: nivelSelecionado, tentativas: [...historicoTentativas], status: 'Errou' });
        localStorage.setItem('historicoJogos', JSON.stringify(historicoJogos));

        let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        leaderboard.push({ jogoNumero, rodada, timeTaken, nivel: nivelSelecionado });
        ordenarLeaderboard(leaderboard);
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

        atualizarHistorico();
        atualizarLeaderboard();

        document.getElementById("game").classList.add("hidden");
        document.getElementById("configuracao").classList.remove("hidden");
        document.getElementById("historicoJogosContainer").classList.remove("hidden");
        document.getElementById("leaderboardContainer").classList.remove("hidden");
    }
}

function atualizarHistorico() {
    let historicoJogos = JSON.parse(localStorage.getItem('historicoJogos')) || [];
    let historicoJogosElement = document.getElementById('historicoJogos');
    historicoJogosElement.innerHTML = "";
    historicoJogos.forEach((jogo) => {
        let jogoElement = document.createElement('p');
        jogoElement.innerHTML = `Jogo ${jogo.jogoNumero}: Número Secreto: ${jogo.numeroSecreto}, Tentativas: ${jogo.rodada}, Tempo: ${jogo.timeTaken} segundos, Dificuldade: ${jogo.nivel}, Status: ${jogo.status}`;
        jogoElement.addEventListener('click', () => {
            alert(`Tentativas do Jogo ${jogo.jogoNumero}:\n${jogo.tentativas.join("\n")}`);
        });
        historicoJogosElement.appendChild(jogoElement);
    });
}

function atualizarLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    ordenarLeaderboard(leaderboard);
    let leaderboardElement = document.getElementById('leaderboard');
    leaderboardElement.innerHTML = "";
    leaderboard.forEach((entry, index) => {
        leaderboardElement.innerHTML += `<p>${index + 1}. Jogo ${entry.jogoNumero}, ${entry.rodada} tentativas, ${entry.timeTaken} segundos, Dificuldade: ${entry.nivel}</p>`;
    });
}

function deletarHistorico() {
    localStorage.removeItem('historicoJogos');
    atualizarHistorico();
}

function deletarLeaderboard() {
    localStorage.removeItem('leaderboard');
    atualizarLeaderboard();
}

function mudarOrientacao(elementId) {
    const element = document.getElementById(elementId);
    if (element.style.flexDirection === 'column') {
        element.style.flexDirection = 'row';
    } else {
        element.style.flexDirection = 'column';
    }
}

function mudarOrdemLeaderboard() {
    ordenarPorTentativas = !ordenarPorTentativas;
    const ordenarButton = document.getElementById('ordenarLeaderboard');
    ordenarButton.textContent = ordenarPorTentativas ? "Ordenado por: Tentativas" : "Ordenado por: Tempo";
    atualizarLeaderboard();
}

function ordenarLeaderboard(leaderboard) {
    if (ordenarPorTentativas) {
        leaderboard.sort((a, b) => a.rodada - b.rodada || a.timeTaken - b.timeTaken);
    } else {
        leaderboard.sort((a, b) => a.timeTaken - b.timeTaken || a.rodada - b.rodada);
    }
}