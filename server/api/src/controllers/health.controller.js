const db = require("../config/db");

exports.health = async (req, res) => {
  console.log("Respondendo se estou vivo!")
  try{
    const { rows } = await db.query(`select 1 u`);
    if (rows.length > 0 && rows[0].u == 1)
        res.status(200).send("Saudavel!");
    else
        res.status(503).send("Servidor iniciando.....");   
  }catch(e) {
    res.status(503).send("Servidor iniciando.....");  }
};