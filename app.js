alert("Seja bem-vindo ao Jogo do Número Secreto! Vai se aprumando aí");

const niveis = {
    facil: { maxNum: 50, tentativas: 15 },
    medio: { maxNum: 100, tentativas: 10 },
    dificil: { maxNum: 200, tentativas: 5 }
};

let nivel = prompt("Escolha o nível de dificuldade: facil, medio ou dificil");
nivel = niveis[nivel] || niveis.medio;

let numeroSecreto = Math.floor(Math.random() * nivel.maxNum) + 1;
console.log(numeroSecreto);

let guess = null;
let rodada = 1;
let tentativasRestantes = nivel.tentativas;
let historicoTentativas = [];
let startTime = Date.now();
let dicas = [
    `O número secreto é ${numeroSecreto % 2 === 0 ? 'par' : 'ímpar'}.`,
    `O número secreto é múltiplo de ${[2, 3, 5, 7].find(n => numeroSecreto % n === 0)}.`
];

function playSound() {
    let audio = new Audio('https://www.soundjay.com/button/beep-07.wav');
    audio.play().catch(error => console.log(error));
}

function atualizarHistorico() {
    let historicoJogos = JSON.parse(localStorage.getItem('historicoJogos')) || [];
    let historicoJogosElement = document.getElementById('historicoJogos');
    historicoJogosElement.innerHTML = "<h2>Histórico de Jogos</h2>";
    historicoJogos.forEach((jogo, index) => {
        historicoJogosElement.innerHTML += `<p>Jogo ${index + 1}: Número Secreto: ${jogo.numeroSecreto}, Tentativas: ${jogo.rodada}, Tempo: ${jogo.timeTaken} segundos</p>`;
    });
}

function atualizarLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    let leaderboardElement = document.getElementById('leaderboard');
    leaderboardElement.innerHTML = "<h2>Leaderboard</h2>";
    leaderboard.forEach((entry, index) => {
        leaderboardElement.innerHTML += `<p>${index + 1}. ${entry.rodada} tentativas, ${entry.timeTaken} segundos</p>`;
    });
}

while (tentativasRestantes > 0) {
    guess = prompt(`Rodada ${rodada}\nEscolha um número entre 1 e ${nivel.maxNum}, rapidin\nTentativas anteriores: ${historicoTentativas.join(", ")}`);
    console.log(`Rodada ${rodada}`);

    if (guess == "") {
        alert("Ai tu complica, tens que digitar algo");
        console.log("Jogador não digitou");
        continue;
    }

    guess = Number(guess);

    if (!Number.isInteger(guess) || guess < 1 || guess > nivel.maxNum) {
        alert(`Por favor, digite um número inteiro entre 1 e ${nivel.maxNum}.`);
        console.log("Jogador digitou um número inválido");
        continue;
    }

    if (numeroSecreto === guess) {
        let palavraRodada = rodada === 1 ? "tentativa" : "tentativas";
        let endTime = Date.now();
        let timeTaken = ((endTime - startTime) / 1000).toFixed(2);
        alert(`Boa guri(a), acertasse o número secreto (${numeroSecreto}) em ${rodada} ${palavraRodada} e levou ${timeTaken} segundos`);
        console.log("Acertou!");

        let historicoJogos = JSON.parse(localStorage.getItem('historicoJogos')) || [];
        historicoJogos.push({ numeroSecreto, rodada, timeTaken });
        localStorage.setItem('historicoJogos', JSON.stringify(historicoJogos));

        // Atualizar leaderboard
        let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        leaderboard.push({ rodada, timeTaken });
        leaderboard.sort((a, b) => a.rodada - b.rodada || a.timeTaken - b.timeTaken);
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

        // Atualizar histórico e leaderboard na página
        atualizarHistorico();
        atualizarLeaderboard();

        break;
    } else if (numeroSecreto > guess) {
        alert(`Puts, o número secreto é maior que ${guess}`);
        historicoTentativas.push(`${guess} (↑)`);
        console.log("Errou!!");
        playSound();
    } else if (numeroSecreto < guess) {
        alert(`Bah, o número secreto é menor que ${guess}`);
        historicoTentativas.push(`${guess} (↓)`);
        console.log("Errou!!");
        playSound();
    }

    if (rodada === Math.ceil(nivel.tentativas / 2)) {
        alert(dicas.shift());
    }

    rodada++;
    tentativasRestantes--;
}

if (tentativasRestantes === 0) {
    alert(`Que lascada, não acertasse de jeito nenhum!\nO número secreto era ${numeroSecreto}`);
    console.log("Errou tudo!");
    playSound();
}

// Atualizar histórico e leaderboard na página ao carregar
atualizarHistorico();
atualizarLeaderboard();
