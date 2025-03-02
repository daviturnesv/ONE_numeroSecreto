/**
 * Configurações de temas e acessibilidade
 */
let temaSelecionado = 'escuro';
let narradorAtivado = false;

/**
 * Definições de níveis de dificuldade do jogo
 * @type {Object} Configurações para cada nível (fácil, médio, difícil)
 */
const NIVEIS = {
    facil: { maxNum: 50, tentativas: 15 },
    medio: { maxNum: 100, tentativas: 10 },
    dificil: { maxNum: 200, tentativas: 5 }
};

/**
 * Variáveis de estado do jogo atual
 */
let numeroSecreto;
let rodada;
let tentativasRestantes;
let historicoTentativas;
let startTime;
let dicas;
let nivelSelecionado;
let temporizadorInterval;

/**
 * Configurações do leaderboard
 */
let criterioOrdenacao = 'tentativas'; // Pode ser 'tentativas', 'tempo' ou 'pontuacao'

/**
 * Gerenciamento da fila de narração
 */
let filaDeNarracao = [];
let estaNarrando = false;

/**
 * Aplica o tema selecionado a todos os elementos relevantes da interface
 * @param {string} tema - Nome do tema a ser aplicado ('escuro' ou 'roxo')
 */
function aplicarTema(tema) {
    // Remover todos os temas e aplicar o novo tema ao corpo da página
    document.body.classList.remove('tema-escuro', 'tema-roxo');
    document.body.classList.add(`tema-${tema}`);

    // Atualizar elementos de entrada (inputs e selects)
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.classList.remove('tema-escuro', 'tema-roxo');
        input.classList.add(`tema-${tema}`);
    });

    // Atualizar botões
    const botoes = document.querySelectorAll('.container__botao');
    botoes.forEach(botao => {
        botao.classList.remove('tema-escuro', 'tema-roxo');
        botao.classList.add(`tema-${tema}`);
    });

    // Atualizar containers principais
    const containers = document.querySelectorAll('#historicoJogosContainer, #leaderboardContainer');
    containers.forEach(container => {
        container.classList.remove('tema-escuro', 'tema-roxo');
        container.classList.add(`tema-${tema}`);
    });

    // Atualizar elementos do histórico e leaderboard
    const elementosHistorico = document.querySelectorAll('#historicoJogos p, #leaderboard p');
    elementosHistorico.forEach(elemento => {
        elemento.classList.remove('tema-escuro', 'tema-roxo');
        elemento.classList.add(`tema-${tema}`);
    });
}

/**
 * Inicialização da aplicação quando o DOM estiver pronto
 */
document.addEventListener("DOMContentLoaded", () => {
    // Carregar dados salvos
    atualizarHistorico();
    atualizarLeaderboard();

    // Configurar eventos de teclas
    configurarEventosTeclado();
    
    // Configurar eventos de mudança de tema e narrador
    configurarEventosMudancaOpcoes();

    // Verificar se o narrador está ativado por padrão
    verificarNarradorPadrao();

    // Aplicar tema inicial
    aplicarTema(temaSelecionado);
});

/**
 * Configura os eventos de teclado para melhorar a usabilidade
 */
function configurarEventosTeclado() {
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
}

/**
 * Configura os eventos relacionados às opções do jogo (tema e narrador)
 */
function configurarEventosMudancaOpcoes() {
    document.getElementById("tema").addEventListener("change", function(event) {
        temaSelecionado = event.target.value;
        aplicarTema(temaSelecionado);
    });

    document.getElementById("narrador").addEventListener("change", function(event) {
        narradorAtivado = event.target.checked;
        
        if (narradorAtivado) {
            // Notificar ativação e iniciar narração
            falarTexto("Narrador ativado. Agora vou narrar as informações do jogo.");
            narrarDadosIniciais();
        } else {
            // Notificar desativação (não usa fila de narração, pois o narrador está sendo desativado)
            if (window.responsiveVoice && responsiveVoice.voiceSupport()) {
                responsiveVoice.speak("Narrador desativado.", "Brazilian Portuguese Female");
            }
        }
    });
}

/**
 * Verifica se o narrador está ativado por padrão e inicia narração se necessário
 */
function verificarNarradorPadrao() {
    narradorAtivado = document.getElementById("narrador").checked;
    if (narradorAtivado) {
        // Pequeno atraso para garantir que a página esteja totalmente carregada
        setTimeout(() => {
            narrarDadosIniciais();
        }, 1000);
    }
}

let ordenarPorTentativas = true;

/**
 * Inicia um novo jogo com as configurações selecionadas
 */
function iniciarJogo() {
    // Limpar temporizador de jogo anterior se existir
    if (temporizadorInterval) {
        clearInterval(temporizadorInterval);
    }
    
    // Carregar configurações baseadas nas seleções do usuário
    carregarConfiguracoesJogo();

    // Esconder elementos da tela inicial
    alternarVisibilidadeElementos(false);

    // Configurar interface do jogo
    configurarInterfaceJogo();
    
    // Iniciar temporizador e focar no campo de entrada
    iniciarTemporizador();
    document.getElementById("guess").focus();
}

/**
 * Carrega as configurações para o novo jogo
 */
function carregarConfiguracoesJogo() {
    // Obter configurações selecionadas
    nivelSelecionado = document.getElementById("nivel").value;
    temaSelecionado = document.getElementById("tema").value;
    aplicarTema(temaSelecionado);
    
    const nivel = NIVEIS[nivelSelecionado] || NIVEIS.medio;

    // Inicializar variáveis do jogo
    numeroSecreto = Math.floor(Math.random() * nivel.maxNum) + 1;
    rodada = 1;
    tentativasRestantes = nivel.maxNum;
    historicoTentativas = [];
    startTime = Date.now();
    
    // Preparar dicas específicas para o número secreto
    dicas = gerarDicasParaNumero(numeroSecreto);
}

/**
 * Gera dicas personalizadas para o número secreto
 * @param {number} numero - O número secreto para gerar dicas
 * @returns {Array} - Lista de dicas sobre o número
 */
function gerarDicasParaNumero(numero) {
    return [
        `O número secreto é ${numero % 2 === 0 ? 'par' : 'ímpar'}.`,
        `O número secreto é ${encontrarMultiplicidade(numero)}.`
    ];
}

/**
 * Encontra uma característica de multiplicidade do número
 * @param {number} numero - Número para analisar
 * @returns {string} - Descrição da característica de multiplicidade
 */
function encontrarMultiplicidade(numero) {
    const divisor = [2, 3, 5, 7].find(n => numero % n === 0);
    return divisor ? `múltiplo de ${divisor}` : `não múltiplo de 2, 3, 5 ou 7`;
}

/**
 * Alterna a visibilidade dos elementos entre tela inicial e tela de jogo
 * @param {boolean} mostrarTelaInicial - Se verdadeiro, mostra a tela inicial. Se falso, mostra a tela de jogo.
 */
function alternarVisibilidadeElementos(mostrarTelaInicial) {
    // Define a visibilidade com base no parâmetro
    const estadoTelaInicial = mostrarTelaInicial ? "remove" : "add";
    const estadoTelaJogo = mostrarTelaInicial ? "add" : "remove";
    
    // Aplica aos elementos da tela inicial
    document.getElementById("configuracao").classList[estadoTelaInicial]("hidden");
    document.getElementById("historicoJogosContainer").classList[estadoTelaInicial]("hidden");
    document.getElementById("leaderboardContainer").classList[estadoTelaInicial]("hidden");
    
    // Aplica ao elemento da tela de jogo
    document.getElementById("game").classList[estadoTelaJogo]("hidden");
}

function atualizarTemporizador() {
    let currentTime = Date.now();
    let timeElapsed = ((currentTime - startTime) / 1000).toFixed(0);
    document.getElementById("temporizador").textContent = `Tempo: ${timeElapsed} segundos`;
}

function fazerPalpite() {
    const guess = Number(document.getElementById("guess").value);
    const nivel = NIVEIS[nivelSelecionado] || NIVEIS.medio;
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
        const mensagem = `Boa guri(a), acertasse o número secreto (${numeroSecreto}) em ${rodada} ${palavraRodada}, levou ${Math.round(timeTaken)} segundos e fez ${Math.round(pontuacao)} pontos`;
        mensagemElement.textContent = mensagem;
        mensagemElement.style.color = "#4cd137";
        falarTexto(mensagem);
        celebrarVitoria();
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

    falarTexto(mensagemElement.textContent);

    if (rodada === Math.ceil(tentativasRestantes / 2)) {
        const dicaElement = document.getElementById("dicas");
        const dica = dicas.shift();
        dicaElement.textContent = dica;
        falarTexto(`Dica: ${dica}`);
        
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
    
    // Adicionar após atualizar o contador de tentativas
    if (tentativasRestantes <= 2) {
        document.getElementById("tentativas").classList.add("shake");
        setTimeout(() => {
            document.getElementById("tentativas").classList.remove("shake");
        }, 500);
    }

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
        const mensagem = `Que lascada, não acertasse de jeito nenhum! O número secreto era ${numeroSecreto}`;
        mensagemElement.textContent = mensagem;
        mensagemElement.style.color = "#e84118";
        falarTexto(mensagem);
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

    // Tempo de espera maior se o narrador estiver ativo
    const tempoEspera = narradorAtivado ? 7000 : 2500;
    
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
        
        // Falar sobre o retorno à tela inicial
        if (narradorAtivado) {
            falarTexto("Voltando à tela inicial. Você pode iniciar um novo jogo.");
            narrarDadosIniciais();
        }
    }, tempoEspera);
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

function celebrarVitoria() {
    const gameElement = document.getElementById("game");
    
    // Criar elementos de confete
    for (let i = 0; i < 100; i++) {
        const confete = document.createElement('div');
        confete.className = 'confete';
        confete.style.left = `${Math.random() * 100}%`;
        confete.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confete.style.animationDuration = `${1 + Math.random() * 2}s`;
        confete.style.animationDelay = `${Math.random()}s`;
        confete.style.width = `${5 + Math.random() * 10}px`;
        confete.style.height = `${5 + Math.random() * 10}px`;
        gameElement.appendChild(confete);
    }
    
    // Adicionar classe para efeito de pulsação na mensagem
    document.getElementById("mensagem").classList.add("mensagem-vitoria");
    
    // Remover confetes e efeitos após a animação
    setTimeout(() => {
        const confetes = document.querySelectorAll('.confete');
        confetes.forEach(c => c.remove());
        document.getElementById("mensagem").classList.remove("mensagem-vitoria");
    }, 3500);
}

function falarTexto(texto) {
    if (!narradorAtivado || !texto) return;
    
    // Adicionar à fila
    filaDeNarracao.push(texto);
    
    // Se não está narrando, iniciar narração
    if (!estaNarrando) {
        processarFilaDeNarracao();
    }
}

function processarFilaDeNarracao() {
    if (filaDeNarracao.length === 0) {
        estaNarrando = false;
        return;
    }
    
    estaNarrando = true;
    const textoAtual = filaDeNarracao.shift();
    
    if (window.responsiveVoice && responsiveVoice.voiceSupport()) {
        responsiveVoice.speak(textoAtual, "Brazilian Portuguese Female", {
            onend: processarFilaDeNarracao
        });
    } else {
        // Se não tiver suporte à voz, avança para o próximo item
        processarFilaDeNarracao();
    }
}

function narrarDadosIniciais() {
    if (!narradorAtivado) return;

    // Narrar título e opções de configuração
    const titulo = document.querySelector("h1").textContent;
    falarTexto(titulo);
    
    setTimeout(() => {
        // Narrar opções de nível
        const nivelSelecionadoTexto = document.getElementById("nivel").options[document.getElementById("nivel").selectedIndex].text;
        falarTexto(`Nível de dificuldade selecionado: ${nivelSelecionadoTexto}`);
        
        // Narrar tema
        setTimeout(() => {
            const temaSelecionadoTexto = document.getElementById("tema").options[document.getElementById("tema").selectedIndex].text;
            falarTexto(`Tema selecionado: ${temaSelecionadoTexto}`);
            
            // Narrar ranking e histórico
            setTimeout(() => {
                narrarRankings();
            }, 3000);
        }, 2000);
    }, 2000);
}

function narrarRankings() {
    if (!narradorAtivado) return;
    
    // Obter leaderboard
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    if (leaderboard.length > 0) {
        ordenarLeaderboard(leaderboard);
        
        // Narrar top 3 (ou menos se não houver 3)
        const top3 = leaderboard.slice(0, Math.min(3, leaderboard.length));
        falarTexto(`Top ${top3.length} do ranking:`);
        
        setTimeout(() => {
            top3.forEach((entry, index) => {
                if (entry.pontuacao > 0) {
                    setTimeout(() => {
                        falarTexto(`${index + 1}º lugar: Jogo ${entry.jogoNumero} com ${Math.round(entry.pontuacao)} pontos em ${entry.rodada} tentativas.`);
                    }, index * 4000);
                }
            });
            
            // Narrar último jogo após o ranking
            setTimeout(() => {
                narrarUltimoJogo();
            }, top3.length * 4000 + 1000);
        }, 1000);
    } else {
        narrarUltimoJogo();
    }
}

function narrarUltimoJogo() {
    if (!narradorAtivado) return;
    
    let historicoJogos = JSON.parse(localStorage.getItem('historicoJogos')) || [];
    if (historicoJogos.length > 0) {
        const ultimoJogo = historicoJogos[historicoJogos.length - 1];
        falarTexto(`Último jogo realizado: Jogo número ${ultimoJogo.jogoNumero}, 
                   você ${ultimoJogo.status === 'Acertou' ? 'acertou' : 'errou'} 
                   o número ${ultimoJogo.numeroSecreto} em ${ultimoJogo.rodada} tentativas, 
                   com ${Math.round(ultimoJogo.pontuacao)} pontos.`);
    }
}