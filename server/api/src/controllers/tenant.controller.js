const db = require("../config/db");

let getAll = async (req, res) => {

    let username = req.jwt.data.username;

    db.query(`
        select t.*
        from app.tenants t
        left join app.users u on u.username = $1
        where u.username =  $1 and (
              u.user_tenant = t.dominio or
              '"SuperAdmin"'::jsonb <@ user_roles::jsonb or
              '"Suporte"'::jsonb <@ user_roles::jsonb
        );    
    `,
        [username]).then(rs =>{

               res.status(200).send(  rs.rows );
    });
}


module.exports = {getAll};