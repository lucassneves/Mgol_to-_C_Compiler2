const fs = require('fs');
const path = require('path');
const nomeArquivoSelecionado = 'fonte.txt';
//const nomeArquivoSelecionado = 'numeros.txt';
//const nomeArquivoSelecionado = 'exemplo.txt';
const filepath = path.join(process.cwd(), nomeArquivoSelecionado);
const conteudoArquivoSelecionado = fs.readFileSync(filepath, 'utf8');

////////////////////////////////////////////////////////////////////////////////

const palavrasReservadas = require('./palavrasReservadas');
const letras = require('./letras');
const listaDeErros = require('./listaDeErros');
const { Console } = require('console');
const digitos = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const tabelaSimbolos = palavrasReservadas;
const tabelaTokens = [];


let cursor = 0;
let linha = 1;
let posicaoLinhaAnterior = 0;
let posicaoColunaAnterior = 0;
let coluna = 0;
let simbolo = '';
let ch = conteudoArquivoSelecionado[cursor];
let prox = conteudoArquivoSelecionado[cursor + 1];

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
    case 8:
      return {Classe: 'Lit', Lexema: simbolo, Tipo: 'Constante literal'};
    case 10:
      if (!tabelaSimbolos.find(token => token.Lexema === simbolo)) {
        tabelaSimbolos.push({Classe: 'id', Lexema: simbolo, Tipo: 'Identificador'});
        return {Classe: 'id', Lexema: simbolo, Tipo: 'Identificador'};
      } else {
          return tabelaSimbolos.find(token => token.Lexema === simbolo);
      }
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
    case 94:  
      console.log('ERRO LÉXICO:',"'"+simbolo+"',",listaDeErros[0] +`, linha: ${linha}, coluna: ${coluna}`);
      return {Classe: 'ERRO', Lexema: simbolo, Tipo: 'NULO'};
    case 95:
      console.log('ERRO LÉXICO: "EOF",',listaDeErros[1] +`, linha: ${posicaoLinhaAnterior}, coluna: ${posicaoColunaAnterior}`);
      return {Classe: 'ERRO', Lexema: simbolo, Tipo: 'NULO'};
      //return {Classe: 'ERRO', Lexema: simbolo, Tipo: listaDeErros[1] +`, linha: ${linha}, coluna: ${coluna}`}; 
    case 96:
      console.log('ERRO LÉXICO: "EOF",',listaDeErros[2] +`, linha: ${posicaoLinhaAnterior}, coluna: ${posicaoColunaAnterior}`);
      return {Classe: 'ERRO', Lexema: simbolo, Tipo: 'NULO'};
      //return {Classe: 'ERRO', Lexema: simbolo, Tipo: listaDeErros[2] +`, linha: ${linha}, coluna: ${coluna}`};  
    case 97:
      console.log('ERRO LÉXICO:',"'"+simbolo+"',",listaDeErros[3] +`, linha: ${linha}, coluna: ${coluna}`);
      return {Classe: 'ERRO', Lexema: simbolo, Tipo: 'NULO'};
      //return {Classe: 'ERRO', Lexema: simbolo, Tipo: listaDeErros[3] +`, linha: ${linha}, coluna: ${coluna}`};  
    case 98:
      console.log('ERRO LÉXICO:',"'"+simbolo+"',",listaDeErros[4] +`, linha: ${linha}, coluna: ${coluna}`); 
      return {Classe: 'ERRO', Lexema: simbolo, Tipo: 'NULO'};
      //return {Classe: 'ERRO', Lexema: simbolo, Tipo: listaDeErros[4] +`, linha: ${linha}, coluna: ${coluna}`};  
    case 99:
      console.log('ERRO LÉXICO:',"'"+simbolo+"',",listaDeErros[5] +`, linha: ${linha}, coluna: ${coluna}`); 
      return {Classe: 'ERRO', Lexema: simbolo, Tipo: 'NULO'};
      //return {Classe: 'ERRO', Lexema: simbolo, Tipo: listaDeErros[5] +`, linha: ${linha}, coluna: ${coluna}`};  
    default:
      console.log('ERRO:',"'"+simbolo+"',",listaDeErros[6] +`, linha: ${linha}, coluna: ${coluna}`); 
      return {Classe: 'ERRO', Lexema: simbolo, Tipo: 'NULO'};
  }
};

const reiniciaSimbolo = () => simbolo = '';

const avançaCursor = () => cursor++;

const atualiza = () => {
  ch = conteudoArquivoSelecionado[cursor];
  prox = conteudoArquivoSelecionado[cursor + 1];
}

const avançaCursorEAtualizaCaracter = () => {
  processaCaracter(ch);
  avançaCursor();
  atualiza();
}

const processaCaracter = (ch) => {
  if (ch === '\n') {
    linha++;
    coluna = 0;
  } else {
    coluna++;
  }
}

const concatenaCaracter = (ch) => {
  if (ch !== '\n')
    simbolo = simbolo.concat(ch);
}

const concatenaEAvança = (ch) => {
  concatenaCaracter(ch);
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
  // Printar tabelas apenas em caso de não houver Erros
  if (!tabelaTokens.find(token => token.Classe === 'ERRO')){
    console.table(tabelaTokens);
    console.table(tabelaSimbolos);
  }
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
              adicionaToken(scanner(simbolo, 21));
            }
          } else if (!digitos.includes(ch)) {
            adicionaToken(scanner(simbolo, 98));
          } else {
            while (digitos.includes(ch)) {
              concatenaEAvança(ch);
            }
            adicionaToken(scanner(simbolo, 21));
          }
        }
        if (ch === '.') {
          concatenaEAvança(ch);
          if (!digitos.includes(ch)) {
            adicionaToken(scanner(simbolo, 99));
          } else {
            while (digitos.includes(ch)) {
              concatenaEAvança(ch);
            }
            adicionaToken(scanner(simbolo, 18));
          }
        }
      }
    } else if (letras.includes(ch)) {
      while (letras.includes(prox) || digitos.includes(prox) || prox === '_') {
        concatenaEAvança(ch);
      }
      simbolo = simbolo.concat(ch);
      adicionaTokenEAvança(scanner(simbolo, 10));
    } else if (ch === ';') {
      adicionaTokenEAvança(scanner(ch, 2));
    } else if (ch === ',') {
      adicionaTokenEAvança(scanner(ch, 1));
    } else if (ch === '{') {
      posicaoLinhaAnterior = linha;
      posicaoColunaAnterior = coluna;
      while (ch !== '}' && ch !== undefined) {
        concatenaEAvança(ch);
      }
      if (ch === undefined){
        adicionaTokenEAvança(scanner(ch, 95));
      }
      if (ch === '}') {
        avançaCursorEAtualizaCaracter();
        reiniciaSimbolo();
      }

    } else if (ch === '"') {
      posicaoLinhaAnterior = linha;
      posicaoColunaAnterior = coluna;
      concatenaEAvança(ch);
      while (ch !== '"' && ch !== undefined) {
        concatenaEAvança(ch);
      }
      if (ch === undefined){
        adicionaTokenEAvança(scanner(ch, 96));
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
          adicionaTokenEAvança(scanner(ch+prox, 14));
          avançaCursorEAtualizaCaracter();
        }
        else if (prox === '>'||prox === '=') {
          adicionaTokenEAvança(scanner(ch+prox, 12));
          avançaCursorEAtualizaCaracter();
        }
        else
          adicionaTokenEAvança(scanner(ch, 12));
      } else { 
        if (prox === '=') {
          adicionaTokenEAvança(scanner(ch+prox, 12));
          avançaCursorEAtualizaCaracter();
        }
        else
          adicionaTokenEAvança(scanner(ch, 12));
      }
    } else {
      if (ch !== '\n' &&  ch !== ':' && ch !== undefined && ch !== "!" && 
          ch !== "'" &&   ch !== "?" && ch !== '[' &&       ch !== ']' &&
          ch !== '\r' &&  ch !== ' ' && ch !== '\t' &&      ch !== '\"')
        {
          adicionaTokenEAvança(scanner(ch, 94)); //Error de Caracter Invalido
      } else
        avançaCursorEAtualizaCaracter();
    }
    finalizaArquivo(prox);
  } while (prox !== undefined);
}

parser();
