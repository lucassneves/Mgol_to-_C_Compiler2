const fs = require('fs');
const path = require('path');

const nomeArquivoSelecionado = 'fonte.txt';
const filepath = path.join(process.cwd(), nomeArquivoSelecionado);

const conteudoArquivoSelecionado = fs.readFileSync(filepath, 'utf8');

const palavrasReservadas = [
  {classe: 'inicio', lexema: 'inicio', tipo: 'inicio'},
  {classe: 'varinicio', lexema: 'varinicio', tipo: 'varinicio'},
  {classe: 'varfim', lexema: 'varfim', tipo: 'varfim'},
  {classe: 'escreva', lexema: 'escreva', tipo: 'escreva'},
  {classe: 'leia', lexema: 'leia', tipo: 'leia'},
  {classe: 'se', lexema: 'se', tipo: 'se'},
  {classe: 'entao', lexema: 'entao', tipo: 'entao'},
  {classe: 'fimse', lexema: 'fimse', tipo: 'fimse'},
  {classe: 'fim', lexema: 'fim', tipo: 'fim'},
  {classe: 'inteiro', lexema: 'inteiro', tipo: 'inteiro'},
  {classe: 'literal', lexema: 'literal', tipo: 'literal'},
  {classe: 'real', lexema: 'real', tipo: 'real'},
];

const tabelaSimbolos = palavrasReservadas;
let simbolo = '';

const letras = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];

const digitos = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
];

const scanner = (simbolo) => {
  switch (simbolo) {
    
  }
};

let estado = 0;
const getEstado = () => estado;
const setEstado = (novoEstado) => estado = novoEstado;

for (let i = 0; i < conteudoArquivoSelecionado.length; i++) {
  let ch = conteudoArquivoSelecionado[i];
  scanner(ch);

  /*
  if (letras.includes(ch)) {
    
    while (letras.includes(ch) || digitos.includes(ch) || ch === '_') {
      simbolo = simbolo.concat(ch);
      i++;
      if (i >= conteudoArquivoSelecionado.length) break;
      else ch = conteudoArquivoSelecionado[i];
    }

    scanner(simbolo);
    simbolo = '';
  }
  */
}



