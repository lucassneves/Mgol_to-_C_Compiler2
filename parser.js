const fs = require('fs');
const path = require('path');
const nomeArquivoSelecionado = 'fonte.txt';
// const nomeArquivoSelecionado = 'numeros.txt';
const filepath = path.join(process.cwd(), nomeArquivoSelecionado);
const conteudoArquivoSelecionado = fs.readFileSync(filepath, 'utf8');
const palavrasReservadas = require('./palavrasReservadas');

////////////////////////////////////////////////////////////////////////////////

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
////case 6:
////  return {Classe: 'Comentário', Lexema: '{.}', Tipo: 'ND'};
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
    case 16:  
      return {Classe: 'Num', Lexema: simbolo, Tipo: 'Inteiro'};
    case 18:  
      return {Classe: 'Num', Lexema: simbolo, Tipo: 'Float'};
    case 21:  
      return {Classe: 'Num', Lexema: simbolo, Tipo: 'Notação Científica'};  
    case 97:  
      return {Classe: 'ERRO', Lexema: simbolo, Tipo: `Número terminado em +/-, linha: ${linha}, coluna: ${coluna}`};  
    case 98:  
      return {Classe: 'ERRO', Lexema: simbolo, Tipo: `Número terminado em e/E, linha: ${linha}, coluna: ${coluna}`};  
    case 99:  
      return {Classe: 'ERRO', Lexema: simbolo, Tipo: `Número terminado em ., linha: ${linha}, coluna: ${coluna}`};  
    default:
      return {Classe: 'ERRO', Lexema: simbolo, Tipo: 'NULO'};
  }
};

// posicionamento
let cursor = 0;
let linha = 0;
let coluna = 0;
let simbolo = '';
let ch = conteudoArquivoSelecionado[cursor];
let prox = conteudoArquivoSelecionado[cursor + 1];


const reiniciaSimbolo = () => simbolo = '';
const avançaCursor = () => cursor++;
const atualiza = () => {
  ch = conteudoArquivoSelecionado[cursor];
  prox = conteudoArquivoSelecionado[cursor + 1];
}


const avançaCursorEAtualizaCaracter = () => {
  avançaCursor();
  atualiza();
}


const processaCaracter = (ch) => {
  if (ch === '\n') {
    linha++;
    coluna = 0;
  } else {
    coluna++;
    simbolo = simbolo.concat(ch);
  }
}


const concatenaEAvança = (ch) => {
  processaCaracter(ch);
  avançaCursorEAtualizaCaracter();
}


const adicionaToken = (token) => {
  tabelaTokens.push(token);
  reiniciaSimbolo();
}


const adicionaTokenEAvança = (token) => {
  tabelaTokens.push(token);
  avançaCursorEAtualizaCaracter();
  reiniciaSimbolo();
}


const printTables = () => {
  console.table(tabelaTokens);
  console.table(tabelaSimbolos);
}


const finalizaArquivo = (prox) => {
  if (prox === undefined) {
    adicionaTokenEAvança(scanner(prox, 11));
    printTables();
  }
}


const parser = () => {
  do {
    if (digitos.includes(ch)) {
      concatenaEAvança(ch);
      while (digitos.includes(ch)) {
        concatenaEAvança(ch);
      }
      if (ch !== '.' && ch !== 'e' && ch !== 'E') {
        adicionaToken(scanner(simbolo, 16));
      } else {
        if (ch === 'e' || ch === 'E') {
          concatenaEAvança(ch);
          if (ch === '+' || ch === '-') {
            concatenaEAvança(ch);
            if (!digitos.includes(ch)) {
              adicionaToken(scanner(simbolo, 97));
            } else {
              while (digitos.includes(ch)) {
                concatenaEAvança(ch);
              }
              adicionaTokenEAvança(scanner(simbolo, 21));
            }
          } else if (!digitos.includes(ch)) {
            adicionaTokenEAvança(scanner(simbolo, 98));
          } else {
            while (digitos.includes(ch)) {
              concatenaEAvança(ch);
            }
            adicionaTokenEAvança(scanner(simbolo, 21));
          }
        }
        if (ch === '.') {
          concatenaEAvança(ch);
          if (!digitos.includes(ch)) {
            adicionaTokenEAvança(scanner(simbolo, 99));
          } else {
            while (digitos.includes(ch)) {
              concatenaEAvança(ch);
            }
            adicionaTokenEAvança(scanner(simbolo, 18));
          }
        }
      }
    
    } else if (letras.includes(ch)) { // se letra caso 10
      while (letras.includes(prox) || digitos.includes(prox) || prox === '_') {
        concatenaEAvança(ch);
      }
      simbolo = simbolo.concat(ch);
      adicionaTokenEAvança(scanner(simbolo, 10));
    } else if (ch === ';') { // se ; caso 2
      adicionaTokenEAvança(scanner(ch, 2));
    } else if (ch === ',') {
      adicionaTokenEAvança(scanner(ch, 1));
    } else if (ch === '{') {
  
      while (ch !== '}') {
        concatenaEAvança(ch);
      }
      if (ch === '}') {
        avançaCursorEAtualizaCaracter();
        reiniciaSimbolo();
      }
  
    } else if (ch === '"') {
      concatenaEAvança(ch);
      while (ch !== '"') {
        concatenaEAvança(ch);
      }
      concatenaEAvança(ch);
      adicionaToken(scanner(simbolo, 8));
    } else if (ch === '(') {
      adicionaTokenEAvança(scanner(ch, 3));
    } else if (ch === ')') {
      adicionaTokenEAvança(scanner(ch, 4));
    } else if (ch === '+' || ch === '-' || ch === '/' ||ch === '*') {
      adicionaTokenEAvança(scanner(ch, 5));
    } else if (ch === '>'||ch === '>=' || ch === '='|| ch === '<') {
      if (ch === '<') { 
        if (prox === '-') {
          adicionaTokenEAvança(scanner(ch+prox, 14));  //Atribuição '<-'
          avançaCursorEAtualizaCaracter();
        }
        else if (prox === '>'||prox === '=') {
          adicionaTokenEAvança(scanner(ch+prox, 12));  //Operador Relacional '<>' ou '<='
          avançaCursorEAtualizaCaracter();
        }
        else
          adicionaTokenEAvança(scanner(ch, 12));       //Operador Relacional '<'
      } else { 
        if (prox === '=') {
          adicionaTokenEAvança(scanner(ch+prox, 12));  //Operador Relacional '>='
          avançaCursorEAtualizaCaracter();
        }
        else
          adicionaTokenEAvança(scanner(ch, 12));       //Operador Relacional '>'
      }
    } else {
      avançaCursorEAtualizaCaracter();
    }
  
    finalizaArquivo(prox);
  } while (prox !== undefined);
}

parser();
