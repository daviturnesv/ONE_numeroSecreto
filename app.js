let temaSelecionado = 'escuro';

function aplicarTema(tema) {
    document.body.classList.remove('tema-escuro', 'tema-roxo');
    document.body.classList.add(`tema-${tema}`);

    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.classList.remove('tema-escuro', 'tema-roxo');
        input.classList.add(`tema-${tema}`);
    });

    const botoes = document.querySelectorAll('.container__botao');
    botoes.forEach(botao => {
        botao.classList.remove('tema-escuro', 'tema-roxo');
        botao.classList.add(`tema-${tema}`);
    });

    const containers = document.querySelectorAll('#historicoJogosContainer, #leaderboardContainer');
    containers.forEach(container => {
        container.classList.remove('tema-escuro', 'tema-roxo');
        container.classList.add(`tema-${tema}`);
    });

    const elementosHistorico = document.querySelectorAll('#historicoJogos p, #leaderboard p');
    elementosHistorico.forEach(elemento => {
        elemento.classList.remove('tema-escuro', 'tema-roxo');
        elemento.classList.add(`tema-${tema}`);
    });
}

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

    document.getElementById("tema").addEventListener("change", function(event) {
        temaSelecionado = event.target.value;
        aplicarTema(temaSelecionado);
    });

    aplicarTema(temaSelecionado);
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
let criterioOrdenacao = 'tentativas'; // Pode ser 'tentativas', 'tempo' ou 'pontuacao'
let temporizadorInterval;

function iniciarJogo() {
    // Limpar jogo anterior
    if (temporizadorInterval) {
        clearInterval(temporizadorInterval);
    }
    
    // Configurações iniciais
    nivelSelecionado = document.getElementById("nivel").value;
    temaSelecionado = document.getElementById("tema").value;
    aplicarTema(temaSelecionado);
    const nivel = niveis[nivelSelecionado] || niveis.medio;

    // Inicializar variáveis do jogo
    numeroSecreto = Math.floor(Math.random() * nivel.maxNum) + 1;
    rodada = 1;
    tentativasRestantes = nivel.tentativas;
    historicoTentativas = [];
    startTime = Date.now();
    dicas = [
        `O número secreto é ${numeroSecreto % 2 === 0 ? 'par' : 'ímpar'}.`,
        `O número secreto é múltiplo de ${[2, 3, 5, 7].find(n => numeroSecreto % n === 0)}.`
    ];

    // Esconder elementos da tela inicial
    document.getElementById("configuracao").classList.add("hidden");
    document.getElementById("historicoJogosContainer").classList.add("hidden");
    document.getElementById("leaderboardContainer").classList.add("hidden");

    // Mostrar e resetar elementos da tela de jogo
    const gameElement = document.getElementById("game");
    gameElement.classList.remove("hidden");
    document.getElementById("guess").value = '';
    document.getElementById("mensagem").textContent = `Escolha um número entre 1 e ${nivel.maxNum}`;
    document.getElementById("tentativas").textContent = `Tentativas restantes: ${tentativasRestantes}`;
    document.getElementById("dicas").textContent = "";
    document.getElementById("historicoTentativas").innerHTML = "";
    document.getElementById("temporizador").textContent = "Tempo: 0 segundos";

    // Iniciar temporizador
    temporizadorInterval = setInterval(atualizarTemporizador, 1000);
    
    // Focar no campo de entrada
    document.getElementById("guess").focus();
}

function atualizarTemporizador() {
    let currentTime = Date.now();
    let timeElapsed = ((currentTime - startTime) / 1000).toFixed(0);
    document.getElementById("temporizador").textContent = `Tempo: ${timeElapsed} segundos`;
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
        let timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
        let pontuacao = calcularPontuacao(tentativasRestantes, timeTaken);
        alert(`Boa guri(a), acertasse o número secreto (${numeroSecreto}) em ${rodada} ${palavraRodada}, levou ${timeTaken} segundos e fez ${pontuacao} pontos`);
        finalizarJogo(true);
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
        alert(`Que lascada, não acertasse de jeito nenhum!\nO número secreto era ${numeroSecreto}`);
        finalizarJogo(false);
        return;
    }
}

function finalizarJogo(acertou = true) {
    // Parar temporizador
    clearInterval(temporizadorInterval);
    
    // Calcular tempo e pontuação
    let endTime = Date.now();
    let timeTaken = ((endTime - startTime) / 1000).toFixed(2);
    let pontuacao = acertou ? calcularPontuacao(tentativasRestantes, timeTaken) : 0;
    
    // Atualizar histórico
    let historicoJogos = JSON.parse(localStorage.getItem('historicoJogos')) || [];
    let jogoNumero = historicoJogos.length + 1;
    historicoJogos.push({
        jogoNumero,
        numeroSecreto,
        rodada,
        timeTaken,
        pontuacao,
        nivel: nivelSelecionado,
        tentativas: [...historicoTentativas],
        status: acertou ? 'Acertou' : 'Errou'
    });
    localStorage.setItem('historicoJogos', JSON.stringify(historicoJogos));

    // Atualizar leaderboard
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ jogoNumero, rodada, timeTaken, pontuacao, nivel: nivelSelecionado });
    ordenarLeaderboard(leaderboard);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    // Atualizar interfaces
    atualizarHistorico();
    atualizarLeaderboard();

    // Esconder tela de jogo
    document.getElementById("game").classList.add("hidden");
    
    // Mostrar tela inicial
    document.getElementById("configuracao").classList.remove("hidden");
    document.getElementById("historicoJogosContainer").classList.remove("hidden");
    document.getElementById("leaderboardContainer").classList.remove("hidden");
}

function atualizarHistorico() {
    let historicoJogos = JSON.parse(localStorage.getItem('historicoJogos')) || [];
    let historicoJogosElement = document.getElementById('historicoJogos');
    historicoJogosElement.innerHTML = "";
    historicoJogos.forEach((jogo) => {
        let jogoElement = document.createElement('p');
        jogoElement.innerHTML = `Jogo ${jogo.jogoNumero}: Número Secreto: ${jogo.numeroSecreto}, Tentativas: ${jogo.rodada}, Tempo: ${jogo.timeTaken} segundos, Pontuação: ${jogo.pontuacao}, Dificuldade: ${jogo.nivel}, Status: ${jogo.status}`;
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
        if (entry.pontuacao > 0) {
            leaderboardElement.innerHTML += `<p>${index + 1}. Jogo ${entry.jogoNumero}, ${entry.rodada} tentativas, ${entry.timeTaken} segundos, ${entry.pontuacao} pontos, Dificuldade: ${entry.nivel}</p>`;
        }
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
    if (criterioOrdenacao === 'tentativas') {
        criterioOrdenacao = 'tempo';
    } else if (criterioOrdenacao === 'tempo') {
        criterioOrdenacao = 'pontuacao';
    } else {
        criterioOrdenacao = 'tentativas';
    }

    const ordenarButton = document.getElementById('ordenarLeaderboard');
    ordenarButton.textContent = `Ordenado por: ${criterioOrdenacao.charAt(0).toUpperCase() + criterioOrdenacao.slice(1)}`;
    atualizarLeaderboard();
}

function ordenarLeaderboard(leaderboard) {
    if (criterioOrdenacao === 'tentativas') {
        leaderboard.sort((a, b) => a.rodada - b.rodada || a.timeTaken - b.timeTaken);
    } else if (criterioOrdenacao === 'tempo') {
        leaderboard.sort((a, b) => a.timeTaken - b.timeTaken || a.rodada - b.rodada);
    } else if (criterioOrdenacao === 'pontuacao') {
        leaderboard.sort((a, b) => b.pontuacao - a.pontuacao || a.timeTaken - b.timeTaken);
    }
}

function calcularPontuacao(tentativasRestantes, timeTaken) {
    const pontosTentativas = tentativasRestantes * 10;
    const pontosTempo = Math.max(0, 100 - timeTaken);
    return pontosTentativas + pontosTempo;
}