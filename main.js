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
const regrasGramaticais = new Map([
  [1, { regra: `P' -> P`}],
  [2, { regra: `P -> inicio V A`}],
  [3, { regra: `V -> varinicio LV`}],
  [4, { regra: `LV -> D LV`}],
  [5, { regra: `LV -> varfim pt_v`}],
  [6, { regra: `D -> TIPO L pt_v`}],
  [7, { regra: `L -> id vir L`}],
  [8, { regra: `L -> id`}],
  [9, { regra: `TIPO -> inteiro`}],
  [10, { regra: `TIPO -> real`}],
  [11, { regra: `TIPO -> literal`}],
  [12, { regra: `A -> ES A`}],
  [13, { regra: `ES -> leia id pt_v`}],
  [14, { regra: `ES -> escreva ARG pt_v`}],
  [15, { regra: `ARG -> lit`}],
  [16, { regra: `ARG -> num`}],
  [17, { regra: `ARG -> id`}],
  [18, { regra: `A -> CMD A`}],
  [19, { regra: `CMD -> id atr LD pt_v`}],
  [20, { regra: `LD -> OPRD opa OPRD`}],
  [21, { regra: `LD -> OPRD`}],
  [22, { regra: `OPRD -> id`}],
  [23, { regra: `OPRD -> num`}],
  [24, { regra: `A -> COND A`}],
  [25, { regra: `COND -> CAB CP`}],
  [26, { regra: `CAB -> se ab_p EXP_R fc_p então`}],
  [27, { regra: `EXP_R -> OPRD opr OPRD`}],
  [28, { regra: `CP -> ES CP`}],
  [29, { regra: `CP -> CMD CP`}],
  [30, { regra: `CP -> COND CP`}],
  [31, { regra: `CP -> fimse`}],
  [32, { regra: `A -> fim`}],
]);

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
