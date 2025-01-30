alert("Seja bem vindo ao Jogo do Número Secreto! Vai se aprumando ai");

let numeroSecreto = Math.floor(Math.random() * 100) + 1;
console.log(numeroSecreto);

let guess = null;
let rodada = 1;
let tentativasRestantes = 10;

while (tentativasRestantes > 0){
    guess = prompt(`Rodada ${rodada}\nEscolhe um numero entre 1 e 100, rapidin`);
    console.log(`Rodada ${rodada}`);

    if (guess == ""){
        alert("Ai tu comprica, tens que digitar algo");
        console.log("Jogador não digitou");
        continue;
    }
    
    guess = Number(guess);

    if (!Number.isInteger(guess) || guess < 1 || guess > 100) {
        alert("Por favor, digite um número inteiro entre 1 e 100.");
        console.log("Jogador digitou um número inválido");
        continue;
    }

    if (numeroSecreto === guess){
        let palavraRodada = rodada === 2 ? "tentativa" : "tentativas";
        if( rodada === 2){
            alert(`Bah, pia é vidente, acertasse o numero secreto (${numeroSecreto}) em ${rodada - 1} ${palavraRodada}`);
        }else{
            alert(`Boa guri(a), acertasse o numero secreto (${numeroSecreto}) em ${rodada - 1} ${palavraRodada}`);
        }
        console.log("Acertou!");
        break
    }else if (numeroSecreto > guess){
        alert(`Puts, o numero secreto é maior que ${guess}`);
        console.log("Errou!!");
    }else if(numeroSecreto < guess){
        alert(`Bah, o numero secreto é menor que ${guess}`);
        console.log("Errou!!");
    }
    rodada++;;
    tentativasRestantes--;
}

if (tentativasRestantes === 0){
    alert(`Que lascada, não acertasse de jeito nenhum! \nO numero secreto era ${numeroSecreto}`);
    console.log("Errou tudo!");    
}


