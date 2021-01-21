const jwt = require('jsonwebtoken')
const fs = require('fs');
const privateKey = fs.readFileSync('./certs/private.pem', 'utf8');
let token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + parseInt( '30000000'), //segundos
        nbf: Math.floor(Date.now() / 1000) - (60),//not befor 1 minuto antes de ser espedito para não dar problema com relogio desincronizado.
        iss: "https://iot.krofke.com.br",
        roles : ['device'],
        name : "admin",
    },
    privateKey,
    { algorithm: 'RS256' }
)
console.log(token)
