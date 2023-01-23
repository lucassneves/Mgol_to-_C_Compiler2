const fs = require('fs');
const csv = require('fast-csv');

const promiseNãoTerminais = new Promise((resolve, reject) => {
        const tabelaNãoTerminais = [];
        fs.createReadStream('tabelaNãoTerminais.csv')
            .pipe(csv.parse({headers:true}))
            .on('data', row => tabelaNãoTerminais.push(row))
            .on('error', error => reject(error.message))
            .on('end', () => resolve(tabelaNãoTerminais));
});

module.exports = {promiseNãoTerminais};

