const fs = require('fs');
const path = require('path');

const nomeArquivoSelecionado = 'fonte.txt';
// const nomeArquivoSelecionado = 'numeros.txt';

const filepath = path.join(process.cwd(), nomeArquivoSelecionado);
const conteudoArquivoSelecionado = fs.readFileSync(filepath, 'utf8');

////////////////////////////////////////////////////////////////////////////////

const palavrasReservadas = require('./palavrasReservadas');
const letras = require('./letras');
const listaDeErros = require('./listaDeErros');
const digitos = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const tabelaSimbolos = palavrasReservadas;
const tabelaTokens = [];

let cursor = 0;
let linha = 1;
let coluna = 1;
let simbolo = '';
let ch = conteudoArquivoSelecionado[cursor];
let prox = conteudoArquivoSelecionado[cursor + 1];

const reiniciaSimbolo = () => simbolo = '';

const avançaCursor = () => cursor++;

const reiniciaEAvança = () => {
  reiniciaSimbolo();
  avançaCursor();
}

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
    coluna = 1;
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
  console.table(tabelaTokens);
  console.table(tabelaSimbolos);
}

const finalizaArquivo = () => {
  adicionaToken(retornaEOF());
  printTables();
  reiniciaVariaveis();
}

const reiniciaVariaveis = () => {
  cursor = 0;
  linha = 1;
  coluna = 1;
  simbolo = '';
  ch = conteudoArquivoSelecionado[cursor];
  prox = conteudoArquivoSelecionado[cursor + 1];
}

const retornaEOF = () => ({Classe: 'EOF', Lexema: simbolo, Tipo: 'Final de Arquivo'});

const retornaVIR = () => ({Classe: 'VIR', Lexema: ',', Tipo: 'Vírgula'});

const retornaPT_V = () => ({Classe: 'PT_V', Lexema: ';', Tipo: 'Ponto e vírgula'});

const retornaAB_P = () => ({Classe: 'AB_P', Lexema: '(', Tipo: 'Abre Parênteses'});

const retornaFC_P = () => ({Classe: 'FC_P', Lexema: ')', Tipo: 'Fecha Parênteses'});

const retornaERRO = () => ({Classe: 'ERRO', Lexema: simbolo, Tipo: 'NULO'});

const retornaID = () => {
  if (!tabelaSimbolos.find(token => token.Lexema === simbolo)) {
    tabelaSimbolos.push({Classe: 'id', Lexema: simbolo, Tipo: 'Identificador'});
    return {Classe: 'id', Lexema: simbolo, Tipo: 'Identificador'};
  } else {
    return tabelaSimbolos.find(token => token.Lexema === simbolo);
  }
}

const retornaNUM = () => {
  return simbolo.search(ch => ch === '.') === -1 ? 
    {Classe: 'Num', Lexema: simbolo, Tipo: 'Inteiro'} : 
    {Classe: 'Num', Lexema: simbolo, Tipo: 'Real'};
}

const retornaLIT = () => ({Classe: 'Lit', Lexema: simbolo, Tipo: 'Constante literal'});

const retornaATR = () => ({Classe: 'ATR', Lexema: '<-', Tipo: 'Atribuição'});

const retornaOPA = () => ({Classe: 'OPA', Lexema: simbolo, Tipo: 'Operadores aritméticos'});

const retornaOPR = () => ({Classe: 'OPR', Lexema: simbolo, Tipo: 'Operadores relacionais'});

const leComentario = () => {
  while (ch !== '}' && ch !== undefined) {
    concatenaEAvança(ch);
  }
  if (ch === undefined) {
    adicionaTokenEAvança(scanner(ch, 95));
  }
  if (ch === '}') {
    avançaCursorEAtualizaCaracter();
    reiniciaSimbolo();
  }
}

const leIdentificador = () => {
  while (letras.includes(prox) || digitos.includes(prox) || prox === '_') {
    concatenaEAvança(ch);
  }
  concatenaEAvança(ch);
  return adicionaToken(retornaID());
}

const leErro = (num) => {
  switch (num) {
    case 94:
      console.error(`ERRO: ${simbolo}', ${listaDeErros[0]}, linha: ${linha}, coluna: ${coluna}`); 
      break;
    case 95:
      console.error(`ERRO: ${simbolo}', ${listaDeErros[1]}, linha: ${linha}, coluna: ${coluna}`); 
      break;
    case 96:
      console.error(`ERRO: ${simbolo}', ${listaDeErros[2]}, linha: ${linha}, coluna: ${coluna}`); 
      break;
    case 97:
      console.error(`ERRO: ${simbolo}', ${listaDeErros[3]}, linha: ${linha}, coluna: ${coluna}`); 
      break;
    case 98:
      console.error(`ERRO: ${simbolo}', ${listaDeErros[4]}, linha: ${linha}, coluna: ${coluna}`); 
      break;
    case 99:
      console.error(`ERRO: ${simbolo}', ${listaDeErros[5]}, linha: ${linha}, coluna: ${coluna}`); 
      break;
    default:
      console.error(`ERRO: ${simbolo}', ${listaDeErros[6]}, linha: ${linha}, coluna: ${coluna}`); 
      break;
  }
  adicionaToken(retornaERRO());
}

const leNumeral = () => {
  concatenaEAvança(ch);
  while (digitos.includes(ch)) {
    concatenaEAvança(ch);
  }
  if (ch !== '.' && ch !== 'e' && ch !== 'E') {
    return adicionaToken(retornaNUM());
  } else {
    if (ch === '.') {
      concatenaEAvança(ch);
      if (!digitos.includes(ch)) {
        leErro(99);
      } else {
        while (digitos.includes(ch)) {
          concatenaEAvança(ch);
        }
        if (ch === 'e' || ch === 'E') {
          concatenaEAvança(ch);
          if (ch === '+' || ch === '-') {
            concatenaEAvança(ch);
            if (!digitos.includes(ch)) {
              leErro(97);
            } else {
              while (digitos.includes(ch)) {
                concatenaEAvança(ch);
              }
              return adicionaToken(retornaNUM());
            }
          } else if (!digitos.includes(ch)) {
            leErro(98);
          } else {
            while (digitos.includes(ch)) {
              concatenaEAvança(ch);
            }
            return adicionaToken(retornaNUM());
          }
        } else
          return adicionaToken(retornaNUM());
      }
    }
    if (ch === 'e' || ch === 'E') {
      concatenaEAvança(ch);
      if (ch === '+' || ch === '-') {
        concatenaEAvança(ch);
        if (!digitos.includes(ch)) {
          leErro(97);
        } else {
          while (digitos.includes(ch)) {
            concatenaEAvança(ch);
          }
          return adicionaToken(retornaNUM());
        }
      } else if (!digitos.includes(ch)) {
        leErro(98);
      } else {
        while (digitos.includes(ch)) {
          concatenaEAvança(ch);
        }
        return adicionaToken(retornaNUM());
      }
    }
  }
}

const leLiteral = () => {
  concatenaEAvança(ch);
  while (ch !== '"' && ch !== undefined) {
    concatenaEAvança(ch);
  }
  if (ch === undefined){
    leErro(96);
  }
  concatenaEAvança(ch);
  return adicionaToken(retornaLIT());
}

const leOPA = () => {
  adicionaToken(retornaOPA());
  !digitos.includes(prox) ? leErro(97) : avançaCursorEAtualizaCaracter();
}

const leOPR = () => {
  if (ch === '<') { 
    if (prox === '-') {
      adicionaTokenEAvança(retornaATR());
      avançaCursorEAtualizaCaracter();
    } else if (prox === '>'||prox === '=') {
      adicionaTokenEAvança(retornaOPR());
      avançaCursorEAtualizaCaracter();
    } else {
      adicionaTokenEAvança(retornaOPR());
    }
  } else { 
    if (prox === '=') {
      adicionaTokenEAvança(retornaOPR());
      avançaCursorEAtualizaCaracter();
    } else {
      adicionaTokenEAvança(retornaOPR());
    }
  }
}

const retornaEstado = (ch) => {
  if (letras.includes(ch)) {
    return 'ID';
  } else if (digitos.includes(ch)) {
    return 'NUM';
  } else if (ch === '+' || ch === '-' || ch === '/' ||ch === '*') {
    return 'OPA'; 
  } else if (ch === '>'||ch === '>=' || ch === '='|| ch === '<') {
    return 'OPR';
  } else {
    return ch;
  }
}

const scanner = () => {
  atualiza();
  switch (retornaEstado(ch)) {
    case 'NUM':
      return leNumeral();
    case 'ID':
      return leIdentificador();
    case 'OPA':
      return leOPA();  
    case 'OPR':
      return leOPR();    
    case ',':
      return adicionaTokenEAvança(retornaVIR());
    case ';':
      return adicionaTokenEAvança(retornaPT_V());
    case '(':
      return adicionaTokenEAvança(retornaAB_P());
    case ')':
      return adicionaTokenEAvança(retornaFC_P());
    case '{':
      return leComentario();
    case '"':
      return leLiteral();  
    default:
      return reiniciaEAvança();
  }
}

const parser = () => {
  do {
    scanner();
  } while (cursor < conteudoArquivoSelecionado.length);
  finalizaArquivo();
}

parser();

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// ANALISADOR SINTÁTICO ////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

const regrasGramaticais = new Map([
  [1, { regra: `P' -> P`, reduz: 2}],
  [2, { regra: `P -> inicio V A`, reduz: 6}],
  [3, { regra: `V -> varinicio LV`, reduz: 4}],
  [4, { regra: `LV -> D LV`, reduz: 4}],
  [5, { regra: `LV -> varfim pt_v`, reduz: 4}],
  [6, { regra: `D -> TIPO L pt_v`, reduz: 6}],
  [7, { regra: `L -> id vir L`, reduz: 6}],
  [8, { regra: `L -> id`, reduz: 2}],
  [9, { regra: `TIPO -> inteiro`, reduz: 2}],
  [10, { regra: `TIPO -> real`, reduz: 2}],
  [11, { regra: `TIPO -> literal`, reduz: 2}],
  [12, { regra: `A -> ES A`, reduz: 4}],
  [13, { regra: `ES -> leia id pt_v`, reduz: 6}],
  [14, { regra: `ES -> escreva ARG pt_v`, reduz: 6}],
  [15, { regra: `ARG -> lit`, reduz: 2}],
  [16, { regra: `ARG -> num`, reduz: 2}],
  [17, { regra: `ARG -> id`, reduz: 2}],
  [18, { regra: `A -> CMD A`, reduz: 4}],
  [19, { regra: `CMD -> id atr LD pt_v`, reduz: 8}],
  [20, { regra: `LD -> OPRD opa OPRD`, reduz: 6}],
  [21, { regra: `LD -> OPRD`, reduz: 2}],
  [22, { regra: `OPRD -> id`, reduz: 2}],
  [23, { regra: `OPRD -> num`, reduz: 2}],
  [24, { regra: `A -> COND A`, reduz: 4}],
  [25, { regra: `COND -> CAB CP`, reduz: 4}],
  [26, { regra: `CAB -> se ab_p EXP_R fc_p então`, reduz: 10}],
  [27, { regra: `EXP_R -> OPRD opr OPRD`, reduz: 6}],
  [28, { regra: `CP -> ES CP`, reduz: 4}],
  [29, { regra: `CP -> CMD CP`, reduz: 4}],
  [30, { regra: `CP -> COND CP`, reduz: 4}],
  [31, { regra: `CP -> fimse`, reduz: 4}],
  [32, { regra: `A -> fim`, reduz: 2}],
]);

let pilha = [0];

const tabelaCanonica = {
  0: {
    'terminais': {
      'inicio': 's2',
    },
    'nãoTerminais': {

    },
  }
};

const verificaAção = (ação) => {
  switch (ação[0]) {
    case 's':
      // joga token.classe pra pilha, joga estado pra pilha
      return console.log('shift');
    case 'r':
      // remove R estados do topo da pilha
      return console.log('reduce');
    case 'a':
      return console.log('accept');
    case 'e':
      return console.log('error');  
  }
}

const retornaTopoPilha = () => pilha[pilha.length - 1];
const adicionaPilha = (tokenOuEstado) => pilha.push(tokenOuEstado);
const removePilha = (quantiaReduzida) => {
  while (quantiaReduzida--) {
    pilha.pop();
  }
}

console.log(verificaAção(tabelaCanonica[0]['inicio']));

// parser();
// comparar classe do primeiro token com topo da pilha
// na tabela canônica.
// chamar função pertinente. switch(ação) {accept, error, shift, reduce}
// produzir árvore