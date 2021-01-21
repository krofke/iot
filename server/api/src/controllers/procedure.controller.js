const db = require("../config/database");
const { report } = require("../app");
const middlewares = require("../middlewares/middlewares")

exports.execute = async (req, res) => {
  let response = {};
  try{
    var param = req.body.parametros || {};

    param.creds = {
      username : 'admin',
      email : 'admin@example.com',
      roles : ['CatSys-User', 'CatSys-SuperUser']
    };

    middlewares.preDbApply(req.body.parametros, req.body.procedure, response);  

    const { rows } = await db.query(`select app.api_${req.body.procedure}( $1 ) as proc`, [JSON.stringify(req.body.parametros)]);
    if (rows.length > 0 && rows[0].proc)
      response.response = rows[0].proc;
    response.status = 'OK';
    
    middlewares.postDbApply(req.body.parametros, rows, req.body.procedure, response);

  }catch(e) {
    response.status = 'ERRO';
    response.statusMessage = e.message;
  }
  res.status(201).send(response);
};