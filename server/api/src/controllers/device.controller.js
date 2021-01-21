const db = require("../config/db");

let register = async (req, res) => {

    if (!req.jwt.roles.includes("device")){
        res.status(401).send("forbiden");
        return
    }
    //select state_value from app.user_state where username = $1 and state_key = $2
    let device = req.query.device;
    let type = req.query.type;
    let query = `
        insert into app.devices(uuid, device_type, registry_date, last_contact_date) 
        VALUES
        ($1,$2,now(),now())
        on conflict (uuid) do update
        set device_type = excluded.device_type,
            last_contact_date = now()    
    
   `
    db.query(query , [device, type ]).then(_ =>{
        res.status(200).send();
    });

    

    
}

module.exports = {register};