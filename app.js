alert("Seja bem vindo ao Jogo do Número Secreto! Vai se aprumando ai");

let numeroSecreto = Math.floor(Math.random() * 100) + 1;
console.log(numeroSecreto);

let guess = null;
let rodada = 1;

while (numeroSecreto != guess){
    guess = prompt(`Rodada ${rodada}\nEscolhe um numero entre 1 e 100, rapidin`);
    console.log(`Rodada ${rodada}`);
    if (numeroSecreto > guess){
        alert(`Puts, o numero secreto é maior que ${guess}`);
        console.log("Errou!!");
    }else if(numeroSecreto < guess){
        alert(`Bah, o numero secreto é menor que ${guess}`);
        console.log("Errou!!");
    } else if (guess == null){
        alert("Ai tu comprica, tens que digitar algo");
        console.log("Jogador não digitou");
    }
    rodada += 1;
}
alert(`Boa guri(a), acertasse o numero secreto (${numeroSecreto}) em ${rodada - 1} tentativa(s)`);
console.log("Acertou!");