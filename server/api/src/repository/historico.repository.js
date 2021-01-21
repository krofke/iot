const db = require('../config/db');

let salvarHistorico = (username, description, source, prioridade) => {
    //prioridades
    // sec - seguranca,
    // info normal,
    // debug informaçoes de debug,
    // trace, informaçoes de trace.
    prioridade = prioridade || 'info';
    let sql = `
        insert into app.events(username, description, source, event_date,priority) 
        values ($1, $2, $3, now(), $4)
    `;
    db.query(sql, [username, description, source, prioridade]).catch(e => console.log(e));
}


module.exports = {salvarHistorico};