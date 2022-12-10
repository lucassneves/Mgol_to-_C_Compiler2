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
    case 1:
      return {Classe: 'VIR', Lexema: ',', Tipo: 'Vírgula'};      
    case 2:
      return {Classe: 'PT_V', Lexema: ';', Tipo: 'Ponto e vírgula'};
    case 3:
      return {Classe: 'AB_P', Lexema: '(', Tipo: 'Abre Parênteses'};
    case 4:
      return {Classe: 'FC_P', Lexema: ')', Tipo: 'Fecha Parênteses'};
    case 5:
      return {Classe: 'OPA', Lexema: simbolo, Tipo: 'Operadores aritméticos'}; 
    // case 6:
    //   return {Classe: 'Comentário', Lexema: '{.}', Tipo: 'ND'};
    case 8:
      return {Classe: 'Lit', Lexema: simbolo, Tipo: 'Constante literal'};
    case 10:
      if (!tabelaSimbolos.find(token => token.Lexema === simbolo)) {
        tabelaSimbolos.push({Classe: 'id', Lexema: simbolo, Tipo: 'Identificador'});
      }
      return {Classe: 'id', Lexema: simbolo, Tipo: 'Identificador'};
    case 11:
      return {Classe: 'EOF', Lexema: simbolo, Tipo: 'Final de Arquivo'};
    case 12:
      return {Classe: 'OPR', Lexema: simbolo, Tipo: 'Operadores relacionais'};
    case 14:
      return {Classe: 'ATR', Lexema: '<-', Tipo: 'Atribuição'};
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

const finalizaArquivo = (prox) => {
  if (prox === undefined) {
    adicionaToken(scanner(prox, 11));
    console.table(tabelaTokens);
    console.table(tabelaSimbolos);
  }
}

do {

  if (letras.includes(ch)) { // se letra caso 10
    while (letras.includes(prox) || digitos.includes(prox) || prox === '_') {
      simbolo = simbolo.concat(ch);
      avançaCursor();
    }
    simbolo = simbolo.concat(ch);
    adicionaToken(scanner(simbolo, 10));
    simbolo = '';
  } else if (ch === ';') { // se ; caso 2
    adicionaToken(scanner(ch, 2));
  } else if (ch === ',') {
    adicionaToken(scanner(ch, 1));
  } else if (ch === '{') {
    while (ch !== '}') {
      simbolo = simbolo.concat(ch);
      avançaCursor();
    }
    //adicionaToken(scanner(simbolo, 6));
    //Tokens não devem ser gerados para comentários, apenas reconhecidos
    simbolo = '';
  } else if (ch === '"') {
    simbolo = simbolo.concat(ch);
    do {
      avançaCursor();
      simbolo = simbolo.concat(ch);
    } while (ch !== '"');
    adicionaToken(scanner(simbolo, 8));
    simbolo = '';
  } else if (ch === '(') {
    adicionaToken(scanner(ch, 3));
  } else if (ch === ')') {
    adicionaToken(scanner(ch, 4));
  } else if (ch === '+' || ch === '-' || ch === '/' ||ch === '*') {
    adicionaToken(scanner(ch, 5));
  } else if (ch === '>'||ch === '>=' || ch === '='|| ch === '<') {
    if (ch === '<') { 
      if (prox === '-') {
        adicionaToken(scanner(ch+prox, 14));  //Atribuição '<-'
        avançaCursor();
      }
      else if (prox === '>'||prox === '=') {
        adicionaToken(scanner(ch+prox, 12));  //Operador Relacional '<>' ou '<='
        avançaCursor();
      }
      else
        adicionaToken(scanner(ch, 12));       //Operador Relacional '<'
    } else { 
      if (prox === '=') {
        adicionaToken(scanner(ch+prox, 12));  //Operador Relacional '>='
        avançaCursor();
      }
      else
        adicionaToken(scanner(ch, 12));       //Operador Relacional '>'
    }
  } else {
    avançaCursor();
  }

  finalizaArquivo(prox);

} while (prox !== undefined);