const db = require('../config/db');
const historicoRepository = require("../repository/historico.repository");

let salvarHistorico = async (req, res) => {
    historicoRepository.salvarHistorico(req.jwt.data.username, JSON.stringify(req.body), req.body.source, req.body.prioridade );
    res.status(200).send();
}

let obterHistoricoImpersonateLicita = async (req, res) => {

    if (req.jwt.data.roles.includes('SuperAdmin') ){
        let sql = `
            select
                e.id, 
                (e.description::json)->>'username' usuario,
                (e.description::json)->>'impersonatedDomain' dominio,
                e.event_date
            from app.events e
            where e.source = 'Licita' and
                (e.description::json)->>'path' = '/default.aspx'
            order by event_date desc
            limit 100    
        `
        db.query(sql).then( rs =>{
            res.status(200).send(rs.rows);
        });
    }else{
        res.status(401);
    }

}



module.exports = {salvarHistorico, obterHistoricoImpersonateLicita}