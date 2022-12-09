const fs = require('fs');
const path = require('path');

const nomeArquivoSelecionado = 'teste.txt';
const filepath = path.join(process.cwd(), nomeArquivoSelecionado);

const conteudoArquivoSelecionado = fs.readFileSync(filepath, 'utf8');
console.log(`Conteúdo em ${nomeArquivoSelecionado}:`, conteudoArquivoSelecionado);

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
]

const tabelaSimbolos = palavrasReservadas;