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
    const mensagemElement = document.getElementById("mensagem");
    const maxNum = nivel.maxNum;

    if (!Number.isInteger(guess) || guess < 1 || guess > maxNum) {
        mensagemElement.textContent = `Por favor, digite um número inteiro entre 1 e ${maxNum}.`;
        mensagemElement.style.color = "#ff6b6b";
        document.getElementById("guess").focus();
        return;
    }

    if (numeroSecreto === guess) {
        let palavraRodada = rodada === 1 ? "tentativa" : "tentativas";
        let timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
        let pontuacao = calcularPontuacao(tentativasRestantes, timeTaken);
        mensagemElement.textContent = `Boa guri(a), acertasse o número secreto (${numeroSecreto}) em ${rodada} ${palavraRodada}, levou ${timeTaken} segundos e fez ${pontuacao.toFixed(2)} pontos`;
        mensagemElement.style.color = "#4cd137";
        finalizarJogo(true);
        return;
    } else {
        // Calcular a cor baseada na proximidade
        const corProximidade = calcularCorProximidade(guess, numeroSecreto, maxNum);
        
        if (numeroSecreto > guess) {
            mensagemElement.textContent = `Puts, o número secreto é maior que ${guess}`;
            historicoTentativas.push(`${guess} (↑)`);
        } else {
            mensagemElement.textContent = `Bah, o número secreto é menor que ${guess}`;
            historicoTentativas.push(`${guess} (↓)`);
        }
        
        // Aplicar a cor baseada na proximidade
        mensagemElement.style.color = corProximidade;
        
        // Feedback de proximidade baseado na dificuldade
        let distancia = Math.abs(numeroSecreto - guess);
        
        if (nivelSelecionado === 'facil') {
            // Nível fácil: mostra percentual exato
            let percentualProx = 100 - Math.min(100, Math.round((distancia / maxNum) * 100));
            mensagemElement.textContent += ` (${percentualProx}% próximo)`;
        } else if (nivelSelecionado === 'medio') {
            // Nível médio: mostra dica menos precisa (quente, morno, frio)
            if (distancia < maxNum / 10) {
                mensagemElement.textContent += " (MUITO QUENTE!)";
            } else if (distancia < maxNum / 5) {
                mensagemElement.textContent += " (quente)";
            } else if (distancia < maxNum / 3) {
                mensagemElement.textContent += " (morno)";
            } else {
                mensagemElement.textContent += " (frio)";
            }
        } else {
            // Nível difícil: sem dica de proximidade ou dica muito vaga
            if (distancia < maxNum / 8) {
                mensagemElement.textContent += " (próximo)";
            }
        }
        
        console.log("Errou!!");
    }

    if (rodada === Math.ceil(tentativasRestantes / 2)) {
        const dicaElement = document.getElementById("dicas");
        dicaElement.textContent = dicas.shift();
        dicaElement.classList.add("dica-animada");
        
        // Destaque adicional para a dica
        dicaElement.style.padding = "10px";
        dicaElement.style.border = "2px dashed #1875E8";
        dicaElement.style.backgroundColor = "rgba(24, 117, 232, 0.1)";
        dicaElement.style.borderRadius = "8px";
        
        // Animação mais longa e visível
        setTimeout(() => {
            dicaElement.classList.remove("dica-animada");
            dicaElement.style.border = "";
            dicaElement.style.backgroundColor = "";
            dicaElement.style.padding = "";
        }, 3000); // 3 segundos de duração
        
        // Efeito sonoro (opcional)
        const audio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAGYgD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwA8MAAAAAAAAAABQgJAilQQABzAAABmKIZtdSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=');
        audio.play().catch(e => console.log("Áudio não pôde ser reproduzido: ", e));
    }

    rodada++;
    tentativasRestantes--;

    document.getElementById("tentativas").textContent = `Tentativas restantes: ${tentativasRestantes}`;
    const historicoElement = document.getElementById("historicoTentativas");
    historicoElement.innerHTML = "";
    historicoTentativas.forEach(tentativa => {
        const tentativaElement = document.createElement("span");
        const match = tentativa.match(/(\d+)\s+\((.*?)\)/);
        
        if (match) {
            const numero = parseInt(match[1]);
            const direcao = match[2];
            
            // Calcular a proximidade para indicador visual
            const distancia = Math.abs(numeroSecreto - numero);
            const maxNum = nivel.maxNum;
            
            // Cor baseada na proximidade
            const corProximidade = calcularCorProximidade(numero, numeroSecreto, maxNum);
            
            tentativaElement.className = "tentativa-item";
            
            if (nivelSelecionado === 'facil') {
                // Nível fácil: mostrar barra de progresso e percentual
                const percentualProx = 100 - Math.min(100, Math.round((distancia / maxNum) * 100));
                
                tentativaElement.innerHTML = `
                    <span class="numero-tentativa">${numero} ${direcao}</span>
                    <span class="indicador-proximidade" style="background: linear-gradient(to right, ${corProximidade} ${percentualProx}%, transparent ${percentualProx}%);">
                        <span class="valor-proximidade">${percentualProx}%</span>
                    </span>
                `;
            } else {
                // Níveis médio e difícil: mostrar apenas o número e direção
                tentativaElement.textContent = `${numero} ${direcao}`;
            }
            
            tentativaElement.style.backgroundColor = `rgba(${corProximidade.slice(4, -1)}, 0.3)`;
            tentativaElement.style.borderLeft = `4px solid ${corProximidade}`;
            tentativaElement.style.color = Math.abs(numeroSecreto - numero) < maxNum / 4 ? "#333" : "white";
        } else {
            tentativaElement.textContent = tentativa;
        }
        
        historicoElement.appendChild(tentativaElement);
    });

    if (tentativasRestantes === 0) {
        mensagemElement.textContent = `Que lascada, não acertasse de jeito nenhum! O número secreto era ${numeroSecreto}`;
        mensagemElement.style.color = "#e84118";
        finalizarJogo(false);
        return;
    }
    
    // Limpar campo de entrada e manter foco
    document.getElementById("guess").value = '';
    document.getElementById("guess").focus();
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

    // Pequeno atraso para visualizar a mensagem final antes de voltar à tela inicial
    setTimeout(() => {
        // Atualizar interfaces
        atualizarHistorico();
        atualizarLeaderboard();

        // Esconder tela de jogo
        document.getElementById("game").classList.add("hidden");
        
        // Mostrar tela inicial
        document.getElementById("configuracao").classList.remove("hidden");
        document.getElementById("historicoJogosContainer").classList.remove("hidden");
        document.getElementById("leaderboardContainer").classList.remove("hidden");
    }, 2500); // Espera 2,5 segundos antes de voltar à tela inicial
}

function atualizarHistorico() {
    let historicoJogos = JSON.parse(localStorage.getItem('historicoJogos')) || [];
    let historicoJogosElement = document.getElementById('historicoJogos');
    historicoJogosElement.innerHTML = "";
    historicoJogos.forEach((jogo) => {
        let jogoElement = document.createElement('p');
        jogoElement.innerHTML = `Jogo ${jogo.jogoNumero}: Número Secreto: ${jogo.numeroSecreto}, Tentativas: ${jogo.rodada}, Tempo: ${Math.round(jogo.timeTaken)} segundos, Pontuação: ${Math.round(jogo.pontuacao)}, Dificuldade: ${jogo.nivel}, Status: ${jogo.status}`;
        jogoElement.addEventListener('click', () => {
            // Criar modal ou painel para mostrar as tentativas
            const modalId = `modal-jogo-${jogo.jogoNumero}`;
            let modal = document.getElementById(modalId);
            
            if (!modal) {
                modal = document.createElement('div');
                modal.id = modalId;
                modal.className = `modal tema-${temaSelecionado}`;
                modal.innerHTML = `
                    <div class="modal-content">
                        <span class="close-button" onclick="this.parentNode.parentNode.style.display='none'">&times;</span>
                        <h3>Tentativas do Jogo ${jogo.jogoNumero}</h3>
                        <div class="tentativas-list">
                            ${jogo.tentativas.map(t => `<p>${t}</p>`).join('')}
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            }
            
            modal.style.display = 'flex';
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
            leaderboardElement.innerHTML += `<p>${index + 1}. Jogo ${entry.jogoNumero}, ${entry.rodada} tentativas, ${Math.round(entry.timeTaken)} segundos, ${Math.round(entry.pontuacao)} pontos, Dificuldade: ${entry.nivel}</p>`;
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

function calcularCorProximidade(chute, numeroSecreto, maxNum) {
    // Calcular distância relativa em uma escala mais sensível
    const distanciaAtual = Math.abs(numeroSecreto - chute);
    
    // Usar apenas 1/3 do maxNum como escala para aumentar a sensibilidade das cores
    const escalaAjustada = maxNum / 3;
    // Limitar a proximidade entre 0 (igual) e 1 (muito distante)
    const proximidade = Math.min(distanciaAtual / escalaAjustada, 1);
    
    // Sistema de cores melhorado com mais contraste
    let r, g, b;
    
    if (proximidade < 0.33) {
        // Verde (muito próximo) para verde-amarelado
        r = Math.floor(proximidade * 3 * 255);
        g = 220;
        b = 0;
    } else if (proximidade < 0.66) {
        // Verde-amarelado para laranja
        r = 255;
        g = Math.floor(220 - ((proximidade - 0.33) * 3 * 150));
        b = 0;
    } else {
        // Laranja para vermelho escuro (mais dramático)
        r = Math.floor(255 - ((proximidade - 0.66) * 3 * 80));
        g = Math.floor(70 - ((proximidade - 0.66) * 3 * 70));
        b = 0;
    }
    
    return `rgb(${r}, ${g}, ${b})`;
}