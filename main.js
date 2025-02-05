const fs = require('fs');
var logStream = fs.createWriteStream('PROGRAMA.c', {flags: 'w'});
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

const imprimeLéxico = () => {
  console.table(tabelaTokens);
  console.table(tabelaSimbolos);
  console.log("Fim análise léxica");
}

const finalizaArquivo = () => {
  adicionaToken(retornaEOF());
  imprimeLéxico();
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

const retornaEOF = () => ({Classe: 'eof', Lexema: simbolo, Tipo: ''});

const retornaVIR = () => ({Classe: 'vir', Lexema: ',', Tipo: ''});

const retornaPT_V = () => ({Classe: 'pt_v', Lexema: ';', Tipo: ''});

const retornaAB_P = () => ({Classe: 'ab_p', Lexema: '(', Tipo: ''});

const retornaFC_P = () => ({Classe: 'fc_p', Lexema: ')', Tipo: ''});

const retornaERRO = () => ({Classe: 'erro', Lexema: simbolo, Tipo: ''});

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
    {Classe: 'num', Lexema: simbolo, Tipo: ''} : // inteiro
    {Classe: 'num', Lexema: simbolo, Tipo: ''}; // real
}

const retornaLIT = () => ({Classe: 'lit', Lexema: simbolo, Tipo: ''});

const retornaATR = () => ({Classe: 'atr', Lexema: '<-', Tipo: ''});

const retornaOPA = () => ({Classe: 'opa', Lexema: simbolo, Tipo: ''});

const retornaOPR = () => ({Classe: 'opr', Lexema: simbolo, Tipo: ''});

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
  simbolo = ch;
  adicionaToken(retornaOPA());
  !digitos.includes(prox) ? leErro(97) : avançaCursorEAtualizaCaracter();
}

const leOPR = () => {
  if (ch === '<') { 
    if (prox === '-') {
      adicionaTokenEAvança(retornaATR());
      avançaCursorEAtualizaCaracter();
    } else if (prox === '>') {
      simbolo = '>';
      adicionaTokenEAvança(retornaOPR());
      avançaCursorEAtualizaCaracter();
    } else if (prox === '=') {
      simbolo = '<=';
      adicionaTokenEAvança(retornaOPR());
      avançaCursorEAtualizaCaracter();
    } else {
      simbolo = '<';
      adicionaTokenEAvança(retornaOPR());
      avançaCursorEAtualizaCaracter()
    }
  } else { 
    if (prox === '=') {
      simbolo = '=';
      adicionaTokenEAvança(retornaOPR());
      avançaCursorEAtualizaCaracter();
    } else if (prox === '=') {
      simbolo = '>=';
      adicionaTokenEAvança(retornaOPR());
    } else {
      simbolo = '>';
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

let estadoInicial = 0
let pilha = [estadoInicial];

let fimAnaliseSintatica = false;
let tabelaRedução = [];

let variaveisTemporarias = [];
let contadorDeTemporarias = 0;
let variaveisTemporariasEmUso = []

let flagError = false;
let identificadorDeTabs = 1;

//Impressão do texto
let corpoDoTexto = [];
let linhaDotexto = '';


//Tokes para a validação do semântico
let contadorDeRetiradas = 0;
let pilhaSemantica = [];
let tokenTerminal;

const getToken = () => {
  if (tabelaTokens.length > 0) {
    return tabelaTokens.shift();
  } else {
    fimAnaliseSintatica = true;
  }
}

const regrasGramaticais = new Map([
  [1, { regra: `P' -> P`, reduz: 2, reduzPara: `P'`, numero: 1}],
  [2, { regra: `P -> inicio V A`, reduz: 6, reduzPara: `P`, numero: 2}],
  [3, { regra: `V -> varinicio LV`, reduz: 4, reduzPara: `V`, numero: 3}],
  [4, { regra: `LV -> D LV`, reduz: 4, reduzPara: `LV`, numero: 4}],
  [5, { regra: `LV -> varfim pt_v`, reduz: 4, reduzPara: `LV`, numero: 5}],
  [6, { regra: `D -> TIPO L pt_v`, reduz: 6, reduzPara: `D`, numero: 6}],
  [7, { regra: `L -> id vir L`, reduz: 6, reduzPara: `L`, numero: 7}],
  [8, { regra: `L -> id`, reduz: 2, reduzPara: `L`, numero: 8}],
  [9, { regra: `TIPO -> inteiro`, reduz: 2, reduzPara: `TIPO`, numero: 9}],
  [10, { regra: `TIPO -> real`, reduz: 2, reduzPara: `TIPO`, numero: 10}],
  [11, { regra: `TIPO -> literal`, reduz: 2, reduzPara: `TIPO`, numero: 11}],
  [12, { regra: `A -> ES A`, reduz: 4, reduzPara: `A`, numero: 12}],
  [13, { regra: `ES -> leia id pt_v`, reduz: 6, reduzPara: `ES`, numero: 13}],
  [14, { regra: `ES -> escreva ARG pt_v`, reduz: 6, reduzPara: `ES`, numero: 14}],
  [15, { regra: `ARG -> lit`, reduz: 2, reduzPara: `ARG`, numero: 15}],
  [16, { regra: `ARG -> num`, reduz: 2, reduzPara: `ARG`, numero: 16}],
  [17, { regra: `ARG -> id`, reduz: 2, reduzPara: `ARG`, numero: 17}],
  [18, { regra: `A -> CMD A`, reduz: 4, reduzPara: `A`, numero: 18}],
  [19, { regra: `CMD -> id atr LD pt_v`, reduz: 8, reduzPara: `CMD`, numero: 19}],
  [20, { regra: `LD -> OPRD opa OPRD`, reduz: 6, reduzPara: `LD`, numero: 20}],
  [21, { regra: `LD -> OPRD`, reduz: 2, reduzPara: `LD`, numero: 21}],
  [22, { regra: `OPRD -> id`, reduz: 2, reduzPara: `OPRD`, numero: 22}],
  [23, { regra: `OPRD -> num`, reduz: 2, reduzPara: `OPRD`, numero: 23}],
  [24, { regra: `A -> COND A`, reduz: 4, reduzPara: `A`, numero: 24}],
  [25, { regra: `COND -> CAB CP`, reduz: 4, reduzPara: `COND`, numero: 25}],
  [26, { regra: `CAB -> se ab_p EXP_R fc_p então`, reduz: 10, reduzPara: `CAB`, numero: 26}],
  [27, { regra: `EXP_R -> OPRD opr OPRD`, reduz: 6, reduzPara: `EXP_R`, numero: 27}],
  [28, { regra: `CP -> ES CP`, reduz: 4, reduzPara: `CP`, numero: 28}],
  [29, { regra: `CP -> CMD CP`, reduz: 4, reduzPara: `CP`, numero: 29}],
  [30, { regra: `CP -> COND CP`, reduz: 4, reduzPara: `CP`, numero: 30}],
  [31, { regra: `CP -> fimse`, reduz: 4, reduzPara: `CP`, numero: 31}],
  [32, { regra: `A -> fim`, reduz: 2, reduzPara: `A`, numero: 32}],
]);

const getRegraGramatical = (numeroRegra) => {
  return regrasGramaticais.get(parseInt(numeroRegra));
}

const consultaTabelaTerminais = (classe) => {
  let topo = tabelaTerminais[retornaTopoPilha()][classe];
  //console.log(topo);
  return topo;
}

const consultaTabelaNãoTerminais = () => {
  return GOTO(tabelaNãoTerminais[retornaSegundoDaPilha()][retornaTopoPilha()]);
}

const GOTO = (estado) => {
  empilha(parseInt(estado));
}

const shift = (classeToken, estado) => {
  //console.log("--Shift-------------------------------");
  empilha(classeToken);
  empilha(parseInt(estado));
  empilhaSemantico(token);
  
  // token = getToken();
  //imprimeToken();
  
};

const salvaRedução = (regraGramatical) => {
  tabelaRedução.push({regra: regraGramatical.numero,redução: `${regraGramatical.regra}`, pilha: pilha.join()});
}

const imprimeSintático = () => {
  console.table(tabelaRedução)
  console.log("Fim análise sintática");
};

const acrescentaCorpoDoTexto = (texto) => {
  corpoDoTexto.push(texto);
}

const concatenaCorpoDoTexto = (texto) => {
  corpoDoTexto[corpoDoTexto.length - 1] += " " + texto;
}

const retornaIndiceTabelaSimbolos = (token) => {
  let tokenRetornado = tabelaSimbolos.find(tokenTabela => tokenTabela.Lexema === token.Lexema);
  return tabelaSimbolos.indexOf(tokenRetornado);
}

const verificaIdNatabelaSimbolos = (Lexema) => {
  return tabelaSimbolos.find(token => token.Lexema === Lexema);
 }

 const acrecentaVariavelTemporaria = (token,tipo)=>{
  token.Lexema = "T" + contadorDeTemporarias;
  token.Tipo = tipo;
  variaveisTemporarias.push("\t"+ tipo+ " " + tokenTerminal.Lexema + ";\n");
  variaveisTemporariasEmUso.push(false);
  contadorDeTemporarias++;
  //variaveisTemporarias.push(tipo + " T" + variaveisTemporarias.length + ";");
};

const copiaToken = (token) => {
  return {Classe:token.Classe,Lexema:token.Lexema,Tipo:token.Tipo};
}


const atualizaTabelaSimbolos = (token, tipo) => {
  // console.log(tabelaSimbolos[retornaIndiceTabelaSimbolos(token)]);
  tabelaSimbolos[retornaIndiceTabelaSimbolos(token)].Tipo = tipo;
}

const atualizaTokenPilhaTipo = (indice, token) =>{
  pilhaSemantica[indice] = token;
}

const retornaTopoPilhaSemantica_IncrementaRetiradas = () => {
  let ultimo =  pilhaSemantica[pilhaSemantica.length - (1 + contadorDeRetiradas )]
  contadorDeRetiradas++;
  return ultimo;
}

const checaDisponibilidadeVariavelTemporaria = () => {
  for (let i = 0; i < contadorDeTemporarias; i++) {
    if (!variaveisTemporariasEmUso[i]){
      variaveisTemporariasEmUso[i] = true;
      return i;
    }
  }
  console.log("Erro: Nenhuma variável temporaria disponivel");
  flagError = true;
  return -1;
}

const ajustaTokenTerminal = (tokenT) =>{
  if (tokenT.Classe == 'lit')
    tokenT.Tipo = 'literal'
  else if (tokenT.Classe == 'num'){
    if(tokenT.Lexema.includes('.')){
      tokenT.Tipo = 'real';
    } else{
      tokenT.Tipo = 'int';
    }
  }
  else if (tokenT.Tipo == 'inteiro')
    tokenT.Tipo = 'int'
  else if (tokenT.Tipo == 'real')
    tokenT.Tipo = 'double'
  else if (tokenT.Classe == 'opr')
    tokenT.Tipo = tokenT.Lexema;
  else if (tokenT.Classe == 'atr')
    tokenT.Tipo = '=';
    else if (tokenT.Classe == 'opa')
    tokenT.Tipo = tokenT.Lexema;
  return tokenT
}

const escreveNoArquivo = (texto) => {
  logStream.write(texto);
}

const resetaContadorDeRetiradas = () => contadorDeRetiradas = 0;

const analisadorSemantico = (regraGramatical) => {
  let linhaDeImpressão;
  resetaContadorDeRetiradas();
  tokenTerminal = pilhaSemantica[pilhaSemantica.length -1];

  switch (regraGramatical.numero) {
    // LV -> varfim pt_v
    case 5:
      linhaDeImpressão = "\n\n"; // "juntando 2 \n com o \n padrão é  = 3 
      acrescentaCorpoDoTexto(linhaDeImpressão);
      break;

    // D -> TIPO L pt_v
    case 6:
      let case6token2 = retornaTopoPilhaSemantica_IncrementaRetiradas();
      case6token2 = retornaTopoPilhaSemantica_IncrementaRetiradas();
      let case6token3 = retornaTopoPilhaSemantica_IncrementaRetiradas();
  
      atualizaTabelaSimbolos(case6token2, case6token3.Tipo);
      break;

    // L -> id vir L
    case 7:
      let case7token1 = retornaTopoPilhaSemantica_IncrementaRetiradas();
      let case7token3 = retornaTopoPilhaSemantica_IncrementaRetiradas();
      case7token3 = retornaTopoPilhaSemantica_IncrementaRetiradas();
      atualizaTabelaSimbolos(case7token1, case7token3.Tipo);
      break;


    // L -> id
    case 8:
      let case8token1 = retornaTopoPilhaSemantica_IncrementaRetiradas();
      let case8token2 = retornaTopoPilhaSemantica_IncrementaRetiradas();

      if (case8token2.Classe === 'vir') {
        let case8token3 = retornaTopoPilhaSemantica_IncrementaRetiradas();
        let case8token4 = retornaTopoPilhaSemantica_IncrementaRetiradas();
        tokenTerminal.Tipo = case8token4.Tipo;
        case8token3.Tipo = case8token4.Tipo;
        atualizaTabelaSimbolos(case8token3, case8token4.Tipo);
        atualizaTabelaSimbolos(case8token1, case8token4.Tipo);
        atualizaTokenPilhaTipo(pilhaSemantica.length - 1, tokenTerminal);
        atualizaTokenPilhaTipo(pilhaSemantica.length - 3, case8token3);
        concatenaCorpoDoTexto(case8token3.Lexema + ', ' + case8token1.Lexema + ';');
      } else {
        tokenTerminal.Tipo = case8token2.Tipo;
        atualizaTabelaSimbolos(case8token1, tokenTerminal.Tipo);
        concatenaCorpoDoTexto(case8token1.Lexema + ';');
      }
      break;


    // TIPO -> inteiro
    case 9:
      tokenTerminal.Tipo = 'int';
      atualizaTokenPilhaTipo(pilhaSemantica.length -1,tokenTerminal);
      linhaDeImpressão = 'int';
      acrescentaCorpoDoTexto(linhaDeImpressão);
      break;
      
      
      // TIPO -> real
      case 10:
        tokenTerminal.Tipo = 'real';
        atualizaTokenPilhaTipo(pilhaSemantica.length -1,tokenTerminal);
        linhaDeImpressão = 'double';
        acrescentaCorpoDoTexto(linhaDeImpressão);
        break;
        
        
        // TIPO -> literal
        case 11:
          tokenTerminal.Tipo = 'literal';
          atualizaTokenPilhaTipo(pilhaSemantica.length -1,tokenTerminal);
          linhaDeImpressão = tokenTerminal.Tipo;
          acrescentaCorpoDoTexto(linhaDeImpressão);
      break;


    // ES -> leia id pt_v  
    case 13:
      let id = retornaTopoPilhaSemantica_IncrementaRetiradas();
      id = retornaTopoPilhaSemantica_IncrementaRetiradas();
      
      if (typeof id.Tipo !== undefined){
        if (id.Tipo == "literal")
          linhaDeImpressão = `scanf("%s", ${id.Lexema});`;
        else if (id.Tipo == "int")  
          linhaDeImpressão = `scanf("%d", &${id.Lexema});`;
        else if (id.Tipo == "real")  
          linhaDeImpressão = `scanf("%lf", &${id.Lexema});`;
        else{
          console.error("Erro: Variável não declarada");
          console.log(id);
          flagError = true;
        }
        acrescentaCorpoDoTexto(linhaDeImpressão);
      } else{
        console.log("Erro Semântico: Variável não declarada!\n");
        flagError = true;
      }
      break;


    // ES -> escreva ARG pt_v
    case 14:
      let case14token1 = retornaTopoPilhaSemantica_IncrementaRetiradas();
      case14token1 = retornaTopoPilhaSemantica_IncrementaRetiradas();

      if (case14token1.Classe === 'id') {
        if (case14token1.Tipo == 'literal') {
          linhaDeImpressão = `printf("%s", ${case14token1.Lexema});`;
        } else if (case14token1.Tipo == 'int') {
          linhaDeImpressão = `printf("%d", ${case14token1.Lexema});`;
        } else if (case14token1.Tipo == 'double') {
          linhaDeImpressão = `printf("%lf", ${case14token1.Lexema});`;
        } else {
          console.log(`Erro Semântico: Parâmetro ${case14token1} incorreto`);
          flagError = true;
        }
        acrescentaCorpoDoTexto(linhaDeImpressão);
      } else if (case14token1.Classe === 'lit') {
        linhaDeImpressão = `printf(${case14token1.Lexema});`;
        acrescentaCorpoDoTexto(linhaDeImpressão);
      }
      break;

    // ARG -> lit
    case 15:
      tokenTerminal = ajustaTokenTerminal(tokenTerminal);
      break;


    // ARG -> num
    case 16:
      tokenTerminal = ajustaTokenTerminal(tokenTerminal);
      break;

    // ARG -> id
    case 17:
      tokenTerminal = ajustaTokenTerminal(tokenTerminal);
      break;

    // CMD -> id atr LD pt_v
    case 19:
      let case19token1 = retornaTopoPilhaSemantica_IncrementaRetiradas();
      case19token1 = retornaTopoPilhaSemantica_IncrementaRetiradas();
      let case19token2 = retornaTopoPilhaSemantica_IncrementaRetiradas();
      let case19token3 = retornaTopoPilhaSemantica_IncrementaRetiradas();

      if (verificaIdNatabelaSimbolos(case19token3.Lexema) !== -1) {
        if (case19token3.Tipo === case19token1.Tipo ) {
          linhaDeImpressão = `${case19token3.Lexema} ${case19token2.Tipo} ${case19token1.Lexema};`
          acrescentaCorpoDoTexto(linhaDeImpressão);
        } else {
          console.log("Erro Semântico: Tipos diferentes para atribuição\n");
          flagError = true;
        }
      } else{
        console.log("Erro Semântico: Variável não declarada!\n");
        flagError = true;
      }
      break;

    // LD -> OPRD opa OPRD
    case 20:
      let tokenTemp1 = retornaTopoPilhaSemantica_IncrementaRetiradas();
      let opa = retornaTopoPilhaSemantica_IncrementaRetiradas();
      let tokenTemp2 = retornaTopoPilhaSemantica_IncrementaRetiradas();

      if ((tokenTemp1.Tipo == tokenTemp2.Tipo || (tokenTemp1.Tipo == 'int' && tokenTemp2.Tipo == 'real' )
      || (tokenTemp1.Tipo == 'real' && tokenTemp2.Tipo == 'int' ) ) && (tokenTemp1 != 'literal')) {
        tokenTerminal = copiaToken(tokenTemp2);

        if (tokenTemp1.Tipo !== tokenTemp2.Tipo ) {
          tokenTerminal.Tipo = 'real';
        } else {
          tokenTerminal.Tipo = tokenTemp2.Tipo;
        } 
        acrecentaVariavelTemporaria(tokenTerminal,tokenTemp2.Tipo);
        linhaDeImpressão = `${tokenTerminal.Lexema} = ${tokenTemp2.Lexema} ${opa.Tipo} ${tokenTemp1.Lexema};`
        acrescentaCorpoDoTexto(linhaDeImpressão);
      } else{
        console.log("Erro Semântico: Operandos com tipos incompatíveis");
        flagError = true;
      }
      break;


    // LD -> OPRD
    case 21:
      let token21 = retornaTopoPilhaSemantica_IncrementaRetiradas();
      token21 = retornaTopoPilhaSemantica_IncrementaRetiradas();
      token21 = ajustaTokenTerminal(token21);
      atualizaTokenPilhaTipo(pilhaSemantica.length -2,token21);
      break;


    // OPRD -> id
    case 22:
      tokenTerminal = ajustaTokenTerminal(tokenTerminal);
      let case22Token1 = retornaTopoPilhaSemantica_IncrementaRetiradas();
      case22Token2 = retornaTopoPilhaSemantica_IncrementaRetiradas();
      case22Token2 = ajustaTokenTerminal(case22Token2);
      break;


    // OPRD -> num
    case 23:
      let token23 = retornaTopoPilhaSemantica_IncrementaRetiradas();
      token23 = ajustaTokenTerminal(token23);
      let token23v2 = retornaTopoPilhaSemantica_IncrementaRetiradas();
      token23v2 = ajustaTokenTerminal(token23v2);
      break;


    // A -> COND A
    case 24:
      break;
      
      
      // COND -> CAB CP
    case 25:
      linhaDeImpressão = '}';
      acrescentaCorpoDoTexto(linhaDeImpressão);
      break;


    // CAB -> se ab_p EXP_R fc_p então
    case 26:
      let token26  = retornaTopoPilhaSemantica_IncrementaRetiradas();
      token26  = retornaTopoPilhaSemantica_IncrementaRetiradas();
      token26  = retornaTopoPilhaSemantica_IncrementaRetiradas();
      
      linhaDeImpressão = `if(${token26.Lexema}) {`;
      acrescentaCorpoDoTexto(linhaDeImpressão);
      
      break;


    // EXP_R -> OPRD opr OPRD
    case 27:
      let token27Temp1 = retornaTopoPilhaSemantica_IncrementaRetiradas();
      let opr = retornaTopoPilhaSemantica_IncrementaRetiradas();
      let token27Temp2 = retornaTopoPilhaSemantica_IncrementaRetiradas();
      
      if (token27Temp1.Tipo == token27Temp2.Tipo 
      || (token27Temp1.Tipo == 'int' && token27Temp2.Tipo == 'real' )
      || (token27Temp1.Tipo == 'real' && token27Temp2.Tipo == 'int' )) {
        tokenTerminal = {Classe:'exp_r',Lexema:'',Tipo:''};
        acrecentaVariavelTemporaria(tokenTerminal,'int');
        linhaDeImpressão =  `${tokenTerminal.Lexema} = ${token27Temp2.Lexema} ${opr.Tipo} ${token27Temp1.Lexema};`;
        acrescentaCorpoDoTexto(linhaDeImpressão);
      } else {
        console.log(`Erro: Operandos com tipos incompatíveis na linha ${linha} e coluna ${linha} `);
        flagError = true;
      }
      break;
      

    // CP -> ES CP
    case 28:
      break;


    // CP -> CMD CP
    case 29:
      break;


    // CP -> COND CP
    case 30:
      break;


    // CP -> fimse
    case 31:
      break;

      
    // A -> fim
    case 32:
      break;

    default:
      // imprimeRegra(regraGramatical);
      // imprimeToken();
      break;
  }
}

const redução = (numeroRegra) => {
  let regraGramatical = getRegraGramatical(numeroRegra);

  desempilha(regraGramatical.reduz);
  empilha(regraGramatical.reduzPara);
  salvaRedução(regraGramatical);
  consultaTabelaNãoTerminais(numeroRegra);

  analisadorSemantico(regraGramatical);
  
  desempilhaSemantica(regraGramatical.reduz/2);
  empilhaSemantico(tokenTerminal);
}

const finalizaAnalisadorSintatico = () => {fimAnaliseSintatica = true;}

const modoPânico = () => {
  token = getToken();
}

const realizaAção = (ação) => {
  switch (ação[0]) {
    case 'S':  
      return shift(token.Classe, ação.slice(1));
    case 'r':
      return redução(ação.slice(1));
    case 'a':
      return finalizaAnalisadorSintatico();
    default:
      return modoPânico();  
  }
};

const retornaTopoPilha = () => pilha[pilha.length - 1];

const retornaSegundoDaPilha = () => pilha[pilha.length - 2];

const empilha = (tokenOuEstado) => pilha.push(tokenOuEstado);

const empilhaSemantico = (tokenp) => pilhaSemantica.push(tokenp);

const imprimeToken = () => {
  console.log("TdP: "+pilhaSemantica.length); // TdP -- Tamanho da pilha
  for (i = 0; i < pilhaSemantica.length; i++) {
      console.log(`tokenClasse: ${pilhaSemantica[i].Classe}, tokenLexema: ${pilhaSemantica[i].Lexema}, tokenTipo: ${pilhaSemantica[i].Tipo}, `);
  }
  console.log("f----------------------------------");
}

const imprimeRegra = (regraGramatical) => {
  console.log("--Redução--------------------------------");
  console.log("Regra: " + regraGramatical.regra + "");
}


const desempilha = (quantiaReduzida) => {
  while (quantiaReduzida--) {
    pilha.pop();
  }
};

const desempilhaSemantica = (quantiaReduzida) =>{
  while (quantiaReduzida--) {
    pilhaSemantica.pop();
  }
}

const retornaAção = () => {
  return tabelaCanonicaTerminais[retornaTopoPilha()][token.Classe]; 
};

let token = getToken();

do {
  let ação = consultaTabelaTerminais(token.Classe);
  realizaAção(ação);
} while (!fimAnaliseSintatica);

imprimeSintático();

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// ANALISADOR SEMÁNTICO ////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

const inicializaArquivo = () => {
  logStream.write("#include<stdio.h>\n\ntypedef char literal[256];\nvoid main(void)\n{\t/*----Variaveis temporarias----*/\n");
}

const acrescentaIdentificadorDeTabs= () => {
  identificadorDeTabs = identificadorDeTabs +1;
}

const decresceIdentificadorDeTabs= () => {
  identificadorDeTabs = identificadorDeTabs -1;
}

const imprimeTabs = () => {
  for (i = 0; i < identificadorDeTabs; i++) {
    escreveNoArquivo("\t");
  }
}

const imprimeCorpoDoTextoNoarquivo = () => {
  for (let i=0; i < corpoDoTexto.length; i++){
    linhaDotexto = corpoDoTexto[i];

    if (typeof linhaDotexto !== 'undefined' && linhaDotexto.includes("}")){
      decresceIdentificadorDeTabs();
    }
    
    imprimeTabs();
    
    if (typeof linhaDotexto !== 'undefined') {
      escreveNoArquivo(linhaDotexto + "\n");
    }
    
    if (typeof linhaDotexto !== 'undefined' && linhaDotexto.includes("{")){
      acrescentaIdentificadorDeTabs();
    }
  }
}

const imprimeArquivo = () => {
  if (!flagError){
    inicializaArquivo();
    for (var i = 0;i < variaveisTemporarias.length; i++)
      escreveNoArquivo(variaveisTemporarias[i]);
    escreveNoArquivo("\t/*------------------------------*/\n");
    imprimeCorpoDoTextoNoarquivo();
    escreveNoArquivo("}\n");
  }
}

imprimeArquivo();
logStream.end();
};

compiladorAguardaPromises();