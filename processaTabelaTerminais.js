const fs = require('fs');
const csv = require('fast-csv');

const promiseTerminais = new Promise((resolve, reject) => {
        const tabelaTerminais = [];
        fs.createReadStream('tabelaTerminais.csv')
            .pipe(csv.parse({headers:true}))
            .on('data', row => tabelaTerminais.push(row))
            .on('error', error => reject(error.message))
            .on('end', () => resolve(tabelaTerminais));
});

module.exports = {promiseTerminais};

