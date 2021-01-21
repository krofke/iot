
let ping = async (req, res) => {
    if (req.user){
        res.status(200).send("OK");
    }else{
        res.status(401).send("ERRO");
    }
    
}

module.exports = {ping};