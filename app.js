alert("Seja bem vindo ao Jogo do Número Secreto! Vai se aprumando ai");

let numeroSecreto = Math.floor(Math.random() * 100) + 1;
console.log(numeroSecreto);

let guess = prompt("Escolhe um numero entre 1 e 100, rapidin");

if (numeroSecreto == guess){
    alert(`Boa guri(a), acertasse o numero ${numeroSecreto}`);
    console.log("Acertou!");
} else{
    if (numeroSecreto > guess){
        alert(`Puts, o numero secreto é maior que ${guess}`);
    }else{
        alert(`Bah, o numero secreto é menor que ${guess}`);
    }
    console.log("Errou!!");
}
