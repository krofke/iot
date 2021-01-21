const db = require("../config/db");
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken')
const fs = require('fs');
//const { options } = require("../app");
require("../app");
const privateKey = fs.readFileSync('./certs/private.pem', 'utf8');
const publicKey = fs.readFileSync('./certs/public.pem', 'utf8');
const ciamUrl = process.env.CIAM_ADDRESS || 'http://localhost:3000/sso/'
const historicoRepository = require("../repository/historico.repository");
let key = publicKey;
key = key.replace('-----BEGIN PUBLIC KEY-----', '').replace('-----END PUBLIC KEY-----', '').trim();

//passport configuration
passport.use(new LocalStrategy(
    function(username, password, done) {
        try{
            db.query(`
            select row_to_json(rj) j from (
                select u.id, u.display_name, u.user_email, u.username, u.user_apps, u.user_roles, u.user_tenant
                from app.users u 
                inner join app.tenants t on t.dominio = u.user_tenant
                where (lower(u.username) = lower($1) or lower(u.user_email) = lower($2) ) and
                     password =  crypt($3, password) and 
                     t.active and u.active
            ) as rj;
            `,
                [ username, username, password]).then(rs =>{

                let rows = rs.rows;
                if (rows.length > 0){
                    let user = rows[0].j;
                    db.query('update app.users set last_login = now() where id = $1', [user.id] ).catch(e => console.log(e));
                    historicoRepository.salvarHistorico(user.username, 'login', 'login.controller(login)', 'info');
                    return done(null, user );
                }else{
                    return done(null, false);
                }
            });

        }catch(e) {
            return done(e);
        }
    }
));
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, done) {
        try{
            let email = profile.emails[0].value;

            db.query(`
            select row_to_json(rj) j from (
                select u.id, u.display_name, u.user_email, u.username, u.user_apps, u.user_roles, u.user_tenant
                from app.users u 
                inner join app.tenants t on t.dominio = u.user_tenant
                where lower(u.user_email) = lower($1)  and
                     t.active and u.active
            ) as rj;
            `,
                [ email ]).then(rs =>{

                let rows = rs.rows;
                if (rows.length > 0){
                    let user = rows[0].j;
                    db.query('update app.users set last_login = now() where id = $1', [user.id] ).catch(e => console.log(e));
                    historicoRepository.salvarHistorico(user.username, 'login', 'login.controller(login)', 'info');
                    return done(null, user );
                }else{
                    return done(null, false);
                }
            }).catch(e =>{
                return done(e);
            });

        }catch(e) {
            return done(e);
        }

    }
));
let googleCallback = async (req, resp) => {
    resp.redirect("/sso/")
}

passport.serializeUser(function(user, done){
    done(null,user.id);
});

passport.deserializeUser(function(id, done){
    done(null, id);
});



//Controllers
let loginFlow1 = async (req, res) => {
    try{
        if (req.isAuthenticated() ){
            res.status(200).send("autenticado");
        }else {
            const {rows} = await db.query(`
            select row_to_json(rj) j from (
                select u.login_methods
                from app.users u
                where (lower(u.username) = lower($1) or lower(u.user_email) = $2)
            ) as rj;
        `, [req.query.u, req.query.u]);
            if (rows.length > 0) {
                res.status(200).send(rows[0].j);
            } else {
                res.status(200).send({"login_methods": ["Interno"]});
            }
        }
    }catch(e) {
        res.status(503).send("Internal Server Error");  }
};


let loginInterno = async (req, res) =>{
    let route = req.query.sys_sso_redirect; 
    if (route){
        const redirectUrl = new URL(route);
        redirectUrl.searchParams.delete('sys_sso_redirect');
        resp.redirect(redirectUrl.toString());
    }else{
        res.status(200).send("/sso/#/home");
    }
}

///jwt
let getJwt = async (req, res) =>{
    try{
        const { rows } = await db.query(`
            select row_to_json(rj) j from (
                select u.id, u.display_name, u.user_email, u.username, u.user_apps, u.user_roles roles, u.user_tenant
                from app.users u
                where (u.id = $1 ) 
            ) as rj;
        `, [ req.session.passport.user ]);
        if (rows.length > 0){
            let token = jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + parseInt(process.env.CIAM_JWT_TIME_SEGUNDOS || '300'),
                    nbf: Math.floor(Date.now() / 1000) - (60),//not befor 1 minuto antes de ser espedito para não dar problema com relogio desincronizado.
                    iss: "https://www.licitasys.com.br/sso",
                    upn : rows[0].j.username,
                    groups :  rows[0].j.roles,
                    data: rows[0].j,
                    roles : rows[0].j.roles,
                    name : rows[0].j.username                     
                },
                privateKey,
                { algorithm: 'RS256' }
            );
            res.cookie('sys-sso-token', token, { maxAge: ( parseInt(process.env.CIAM_COOKIE_TIME_SEGUNDOS) || 3600 ) * 1000 , secure: false , sameSite : 'Lax', domain : process.env.CIAM_COOKIE_DOMAIN || 'localhost'});

            res.status(200).send(token);
        }else{
            res.status(401).send();
        }
    }catch(e) {
        console.log(e);
        res.status(401).send("Forbiden!");
    }

}

function getPublicKey(req, res){

     res.status(200).send({ key});
}

let logOut = (req, resp) =>{

    req.session.destroy();
    const redirectUrl = new URL(ciamUrl);
    
    let route = req.query.sys_sso_redirect;
    if (route && route !== ciamUrl){
        var routeUrl = new URL(route);
        routeUrl.searchParams.delete("sys_sso_redirect");
        redirectUrl.searchParams.append('sys_sso_redirect', routeUrl.toString() );
    }
    resp.redirect(redirectUrl.toString());
}
let jwtValidade = async  (req, resp) =>{
    if (req.jwt.data.roles.includes(req.query.role)){
        resp.status(200).send(req.jwt.data.username);
    }else{
        resp.status(401).send("Forbiden!");
    }
}
let generateJwtSuperAdmin = (req, resp) =>{
    if (req.jwt && req.jwt.data.roles.includes("SuperAdmin")) {

        req.body = req.body || {};
        req.body.username = 'Admin';
        req.body.email = 'admin@licitasys.com.br';

        let token = jwt.sign({
                exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60),
                nbf: Math.floor(Date.now() / 1000) - (60),//not before 1 minuto antes de ser espedito para não dar problema com relogio desincronizado.
                data : req.body
            },
            privateKey,
            {algorithm: 'RS256'}
        );
        historicoRepository.salvarHistorico(req.jwt.data.username, `Gerado token de app com o token ${JSON.stringify(req.body)}`, "login.controller(generateJwtSuperAdmin)", "sec");
        resp.status(200).send(token);
    }else{
        username = jwt && jwt.data ? jwt.data.username : 'anonimo';
        historicoRepository.salvarHistorico(username || 'Anonimo', `Tentativa de gerar token de usuario sem acesso ${req.body}`, "login.controller(generateJwtSuperAdmin)", "sec");
        resp.status(401).send("Forbiden!");
    }


}
module.exports = {loginFlow1, loginInterno, passport,logOut, getJwt, getPublicKey, jwtValidade, googleCallback, generateJwtSuperAdmin};
