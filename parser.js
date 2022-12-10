const fs = require('fs');
const path = require('path');

const nomeArquivoSelecionado = 'fonte.txt';
const filepath = path.join(process.cwd(), nomeArquivoSelecionado);

const conteudoArquivoSelecionado = fs.readFileSync(filepath, 'utf8');

////////////////////////////////////////////////////////////////////////////////

const palavrasReservadas = [
  {Classe: 'inicio', Lexema: 'inicio', Tipo: 'inicio'},
  {Classe: 'varinicio', Lexema: 'varinicio', Tipo: 'varinicio'},
  {Classe: 'varfim', Lexema: 'varfim', Tipo: 'varfim'},
  {Classe: 'escreva', Lexema: 'escreva', Tipo: 'escreva'},
  {Classe: 'leia', Lexema: 'leia', Tipo: 'leia'},
  {Classe: 'se', Lexema: 'se', Tipo: 'se'},
  {Classe: 'entao', Lexema: 'entao', Tipo: 'entao'},
  {Classe: 'fimse', Lexema: 'fimse', Tipo: 'fimse'},
  {Classe: 'fim', Lexema: 'fim', Tipo: 'fim'},
  {Classe: 'inteiro', Lexema: 'inteiro', Tipo: 'inteiro'},
  {Classe: 'literal', Lexema: 'literal', Tipo: 'literal'},
  {Classe: 'real', Lexema: 'real', Tipo: 'real'},
];

const tabelaSimbolos = palavrasReservadas;
const tabelaTokens = [];

const letras = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];

const digitos = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
];

////////////////////////////////////////////////////////////////////////////////

const scanner = (simbolo, estado) => {
  switch (estado) {
    case 10:
      // vou consertar
      if (!tabelaSimbolos.includes(token => token.Lexema === simbolo)) {
        tabelaSimbolos.push({Classe: 'id', Lexema: simbolo, Tipo: 'Identificador'});
      }
      return {Classe: 'id', Lexema: simbolo, Tipo: 'Identificador'};
    case 2:
      return {Classe: 'PT_V', Lexema: ';', Tipo: 'Ponto e vírgula'};
    case 1:
      return {Classe: 'VIR', Lexema: ',', Tipo: 'Vírgula'};
    default:
      return {Classe: 'ERRO', Lexema: simbolo, Tipo: 'NULO'};  
  }
};

// posicionamento
let cursor = 0;
let simbolo = '';
let ch = conteudoArquivoSelecionado[cursor];
let prox = conteudoArquivoSelecionado[cursor + 1];

// avança cursor e atualiza valor do caracter e do lookahead
const avançaCursor = () => {
  cursor++;
  ch = conteudoArquivoSelecionado[cursor];
  prox = conteudoArquivoSelecionado[cursor + 1];
}

const adicionaToken = (token) => {
  tabelaTokens.push(token); // adiciona token à tabela de tokens
  avançaCursor(); // ao adicionar um token, avança cursor
}

do {

  if (letras.includes(ch)) { // se letra caso 10
    while (letras.includes(ch) || digitos.includes(ch) || ch === '_') {
      simbolo = simbolo.concat(ch);
      avançaCursor();
    }
    adicionaToken(scanner(simbolo, 10));
    simbolo = '';
  } else if (ch === ';') { // se ; caso 2
    adicionaToken(scanner(simbolo, 2));
  } else if (ch === ',') {
    adicionaToken(scanner(simbolo, 1));
  }
  avançaCursor();
} while (prox !== undefined);

console.log('tabela tokens:', tabelaTokens, 'tabela simbolos:', tabelaSimbolos);


