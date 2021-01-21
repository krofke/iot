const db = require("../config/db");

let getState = async (req, res) => {

    //select state_value from app.user_state where username = $1 and state_key = $2
    let username = req.jwt.data.username;
    let key = req.query.key;
    db.query('select state_value from app.user_state where username = $1 and state_key = $2', [username, key]).then(rs =>{
        let row = rs.rowCount > 0 ? rs.rows[0].state_value : {};
        res.status(200).send(  row );
    });
}
let setState = async (req, res) => {
    let username = req.jwt.data.username;
    let key = req.body.key;
    let value = req.body.value;
    db.query(`
        insert into app.user_state (username, state_key, state_value,state_date) 
        values  ($1, $2, $3 ,now())
        on conflict(username, state_key) do update
        set state_value = EXCLUDED.state_value, state_date = now()
    `, [username, key, value])
    .catch(e => {
        console.log(e);
    });

    res.status(200).send();
}

module.exports = {getState, setState};