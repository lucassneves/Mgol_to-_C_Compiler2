const fs = require('fs');
const path = require('path');

async function compiladorAguardaPromises() {

const nomeArquivoSelecionado = 'fonte.txt';
// const nomeArquivoSelecionado = 'numeros.txt';
const filepath = path.join(process.cwd(), nomeArquivoSelecionado);
const conteudoArquivoSelecionado = fs.readFileSync(filepath, 'utf8');

////////////////////////////////////////////////////////////////////////////////

const palavrasReservadas = require('./palavrasReservadas');
const letras = require('./letras');
const listaDeErros = require('./listaDeErros');

////////////////////////////////////////////////////////////////////////////////

const objetoTabelaTerminais = require('./processaTabelaTerminais');
const objetoTabelaNãoTerminais = require('./processaTabelaNãoTerminais');
const tabelaTerminais = await objetoTabelaTerminais.promiseTerminais;
const tabelaNãoTerminais = await objetoTabelaNãoTerminais.promiseNãoTerminais;

////////////////////////////////////////////////////////////////////////////////

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

const retornaEOF = () => ({Classe: 'EOF', Lexema: simbolo, Tipo: ''});

const retornaVIR = () => ({Classe: 'VIR', Lexema: ',', Tipo: ''});

const retornaPT_V = () => ({Classe: 'PT_V', Lexema: ';', Tipo: ''});

const retornaAB_P = () => ({Classe: 'AB_P', Lexema: '(', Tipo: ''});

const retornaFC_P = () => ({Classe: 'FC_P', Lexema: ')', Tipo: ''});

const retornaERRO = () => ({Classe: 'ERRO', Lexema: simbolo, Tipo: ''});

const retornaID = () => {
  if (!tabelaSimbolos.find(token => token.Lexema === simbolo)) {
    tabelaSimbolos.push({Classe: 'id', Lexema: simbolo, Tipo: ''});
    return {Classe: 'id', Lexema: simbolo, Tipo: ''};
  } else {
    return tabelaSimbolos.find(token => token.Lexema === simbolo);
  }
}

const retornaNUM = () => {
  return simbolo.search(ch => ch === '.') === -1 ? 
    {Classe: 'Num', Lexema: simbolo, Tipo: 'Inteiro'} : 
    {Classe: 'Num', Lexema: simbolo, Tipo: 'Real'};
}

const retornaLIT = () => ({Classe: 'Lit', Lexema: simbolo, Tipo: ''});

const retornaATR = () => ({Classe: 'ATR', Lexema: '<-', Tipo: ''});

const retornaOPA = () => ({Classe: 'OPA', Lexema: simbolo, Tipo: ''});

const retornaOPR = () => ({Classe: 'OPR', Lexema: simbolo, Tipo: ''});

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

const getToken = () => tabelaTokens.shift();

const regrasGramaticais = new Map([
  [1, { regra: `P' -> P`, reduz: 2, reduzPara: `P'`}],
  [2, { regra: `P -> inicio V A`, reduz: 6, reduzPara: `P`}],
  [3, { regra: `V -> varinicio LV`, reduz: 4, reduzPara: `V`}],
  [4, { regra: `LV -> D LV`, reduz: 4, reduzPara: `LV`}],
  [5, { regra: `LV -> varfim pt_v`, reduz: 4, reduzPara: `LV`}],
  [6, { regra: `D -> TIPO L pt_v`, reduz: 6, reduzPara: `D`}],
  [7, { regra: `L -> id vir L`, reduz: 6, reduzPara: `L`}],
  [8, { regra: `L -> id`, reduz: 2, reduzPara: `L`}],
  [9, { regra: `TIPO -> inteiro`, reduz: 2, reduzPara: `TIPO`}],
  [10, { regra: `TIPO -> real`, reduz: 2, reduzPara: `TIPO`}],
  [11, { regra: `TIPO -> literal`, reduz: 2, reduzPara: `TIPO`}],
  [12, { regra: `A -> ES A`, reduz: 4, reduzPara: `A`}],
  [13, { regra: `ES -> leia id pt_v`, reduz: 6, reduzPara: `ES`}],
  [14, { regra: `ES -> escreva ARG pt_v`, reduz: 6, reduzPara: `ES`}],
  [15, { regra: `ARG -> lit`, reduz: 2, reduzPara: `ARG`}],
  [16, { regra: `ARG -> num`, reduz: 2, reduzPara: `ARG`}],
  [17, { regra: `ARG -> id`, reduz: 2, reduzPara: `ARG`}],
  [18, { regra: `A -> CMD A`, reduz: 4, reduzPara: `A`}],
  [19, { regra: `CMD -> id atr LD pt_v`, reduz: 8, reduzPara: `CMD`}],
  [20, { regra: `LD -> OPRD opa OPRD`, reduz: 6, reduzPara: `LD`}],
  [21, { regra: `LD -> OPRD`, reduz: 2, reduzPara: `LD`}],
  [22, { regra: `OPRD -> id`, reduz: 2, reduzPara: `OPRD`}],
  [23, { regra: `OPRD -> num`, reduz: 2, reduzPara: `OPRD`}],
  [24, { regra: `A -> COND A`, reduz: 4, reduzPara: `A`}],
  [25, { regra: `COND -> CAB CP`, reduz: 4, reduzPara: `COND`}],
  [26, { regra: `CAB -> se ab_p EXP_R fc_p então`, reduz: 10, reduzPara: `CAB`}],
  [27, { regra: `EXP_R -> OPRD opr OPRD`, reduz: 6, reduzPara: `EXP_R`}],
  [28, { regra: `CP -> ES CP`, reduz: 4, reduzPara: `CP`}],
  [29, { regra: `CP -> CMD CP`, reduz: 4, reduzPara: `CP`}],
  [30, { regra: `CP -> COND CP`, reduz: 4, reduzPara: `CP`}],
  [31, { regra: `CP -> fimse`, reduz: 4, reduzPara: `CP`}],
  [32, { regra: `A -> fim`, reduz: 2, reduzPara: `A`}],
]);

let estadoInicial = 0
let pilha = [estadoInicial];

const getRegraGramatical = (numeroRegra) => {
  return regrasGramaticais.get(parseInt(numeroRegra));
}

const shift = (classeToken, estado) => {
  pilha.push(classeToken);
  pilha.push(parseInt(estado));
  console.log('pilha:', pilha);
  token = getToken();
  console.log('token:', token);
};

const redução = (numeroRegra) => {
  let regraGramatical = getRegraGramatical(numeroRegra);
  removePilha(regraGramatical.reduz);
  adicionaPilha(regraGramatical.reduzPara);
  console.log('regra:', regraGramatical, 'pilha:', pilha);
}

const realizaAção = (ação) => {
  console.log('realizaAção, ação:', ação);
  switch (ação[0]) {
    case 's':
    case 'S':  
      return shift(token.Classe, ação.slice(1));
    case 'r':
    case 'R':  
      // remove R estados do topo da pilha
      return redução(ação.slice(1));
    case 'a':
    case 'A':
      return console.log('accept');
    default:
      return console.error('error');  
  }
};

const retornaTopoPilha = () => pilha[pilha.length - 1];

const adicionaPilha = (tokenOuEstado) => pilha.push(tokenOuEstado);

const removePilha = (quantiaReduzida) => {
  while (quantiaReduzida--) {
    pilha.pop();
  }
};

const retornaAção = () => {
  return tabelaCanonicaTerminais[retornaTopoPilha()][token.Classe]; 
};

const consultaTabelaTerminais = (classe) => {
  console.log(tabelaTerminais[retornaTopoPilha()]);
  return tabelaTerminais[retornaTopoPilha()][classe];
}

let token = getToken();

/*
while (tabelaTokens.length !== 0) {
  let ação = consultaTabelaTerminais(token.Classe);
  realizaAção(ação);
}
*/

for (var i = 0; i<20; i++) {
  let ação = consultaTabelaTerminais(token.Classe);
  realizaAção(ação);
}

  





// parser();
// comparar classe do primeiro token com topo da pilha
// na tabela canônica.
// chamar função pertinente. switch(ação) {accept, error, shift, reduce}
// produzir árvore

};

compiladorAguardaPromises();