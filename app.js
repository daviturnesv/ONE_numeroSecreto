alert("Seja bem vindo ao Jogo do Número Secreto! Vai se aprumando ai");

let numeroSecreto = Math.floor(Math.random() * 100) + 1;
console.log(numeroSecreto);

let guess = prompt("Escolhe um numero entre 1 e 100, rapidin");

if (numeroSecreto == guess){
    alert(`Boa guri(a), acertasse o numero ${numeroSecreto}`);
    console.log("Acertou!");
} else{
    alert("Bah pia, errasse feio");
    console.log("Errou!!");
}
