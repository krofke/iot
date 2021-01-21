const db = require("../config/db");
const historicoRepository = require("../repository/historico.repository");

let userdata = async (req, res) => {
    let query = `
        select
               u.username,
               u.display_name "displayName",
               t.logo_url "tenantLogoUrl",
               (
                   select json_agg(row_to_json(ro ))
                   from (
                        select a.id,
                               a.nome_exibicao "nome",
                               a.nome          "sigla",
                               a.url,
                               a.logo_url      "logoUrl"
                        from app.applications a
                        where concat('"', a.nome, '"')::jsonb <@ u.user_apps::jsonb
                    ) as ro
               ) aplicacoes
        from app.users u
        inner join app.tenants t on t.dominio = u.user_tenant
        where u.id = $1
    `;

     db.query(query, [req.user] ).then(rs =>{
         if (rs.rowCount == 1){
             res.status(200).send(  rs.rows[0] );
         }else{
             res.sendStatus(404);
         }
     }).catch( e =>{
         res.code(500).send();
     });
    //
    //    res.status(200).send({
    //        "username":"guilherme.krofke@sysevolution.com.br",
    //        "displayName":"Guilherme Krofke",
    //        "tenantLogoUrl":"https://sso.licitasys.com.br/anexo/static/1",
    //        "aplicacoes":[
    //            {"id":-4,"nome":"CIAM SYS Evolution","sigla":"CIAM","url":"https://sso.licitasys.com.br/sidecar","logoUrl":"https://www.licitasys.com.br/static/logos/apps/ciam.png"},
    //            {"id":5,"nome":"Catalogo SYS Evolution","sigla":"CatSYS","url":"https://catsys.licitasys.com.br","logoUrl":"https://www.licitasys.com.br/static/logos/apps/catsys.png"},
    //            {"id":-3,"nome":"Filas SYS Evolution","sigla":"FILAS","url":"https://sso.licitasys.com.br/filas","logoUrl":"https://www.licitasys.com.br/static/logos/apps/fila.png"}
    //        ]
    //    });
};

let getAllUsersByTenant =  async (req, res) => {

    let username = req.jwt.data.username;
    let tenant = req.query.tenant_id;
    let query = `
        select u.id, u.username, u.user_email, u.display_name, u.login_methods, u.user_roles, u.user_apps, u.active
        from app.users u
        inner join app.users u2 on u2.username = $1
        where u.user_tenant = $2 and
        (
            '"SuperAdmin"'::jsonb <@ u2.user_roles::jsonb or
            ( '"TenantAdmin"'::jsonb <@ u2.user_roles::jsonb and u.user_tenant = u2.user_tenant )
        )
    `;

    db.query(query, [username, tenant] ).then(rs =>{
        res.status(200).send(  rs.rows );
    });
}
let getUserAcessEnum = async (req, res) => {
    let sql = `
    DO
    $$
    DECLARE
        _roles json;
        _app json;
        _login json;
    begin
    select json_agg (j.r) into _roles
    from (select json_array_elements_text(roles) r from app.applications)
    as j;
    
    select
         json_agg(distinct a.nome) into _app
    from app.applications a;
    
    _login = '["Interno","Microsoft", "Google"]'::json;
    
    drop table if exists tmp_enum;
    create temporary table if not exists tmp_enum on commit drop as
    select _roles as roles, _app as app, _login as login;
    end;
    $$;
    select row_to_json(e) j from tmp_enum e;
    `
    db.query(sql ).then(rs =>{
        res.status(200).send(  rs[1].rows[0].j );
    }).catch(e =>{
        console.log(e);
        res.status(500).send( 'Server error!' );
    });
}
let salvarUsuario = async (req, res) => {
    let username = req.jwt.data.username;
    let roles = req.jwt.data.roles;
    let tenant = req.jwt.data.user_tenant;

    let username_req = req.body.username.trim();
    let user_email = req.body.user_email.trim();
    let display_name = req.body.display_name.trim();
    let login_methods = JSON.stringify(req.body.login_methods || []);
    let user_roles = JSON.stringify(req.body.user_roles || []);
    let user_apps = JSON.stringify( req.body.user_apps || []);
    let user_tenant = req.body.user_tenant.trim();
    let active = req.body.active || false;
    let id = req.body.id;

    if (req.body.novo){
        let sql = `
        insert into app.users(username, user_email, display_name, login_methods, user_roles, user_apps, user_tenant, active) 
        values
        ($1, $2, $3, $4, $5, $6, $7, $8)
        `
        if (roles.includes('SuperAdmin')){
            historicoRepository.salvarHistorico(username, req.body, 'user.controller.salvarUsuario(super admin | criar)');
            db.query( sql,[username_req,user_email,display_name,login_methods,user_roles,user_apps,user_tenant,active]).then( ()=>{
                res.status(200).send();
            }).catch((e) =>{
                console.log(e);
                if (e.message.startsWith('duplicate key')){
                    res.status(500).send("Usuário já existe!");
                }else{
                    res.status(500).send("Server error!");
                }

            })

        }else if(roles.includes('TenantAdmin')){
            if (user_tenant != tenant){
                historicoRepository.salvarHistorico(username, req.body, 'user.controller.salvarUsuario(criacao de usuario fora do tenant do usuario solicitante)', 'sec');
                res.status(401).send();
            }else{
                db.query( sql,[username_req,user_email,display_name,login_methods,user_roles,user_apps,tenant,active]).then( ()=>{
                    res.status(200).send();
                }).catch((e) =>{
                    console.log(e);
                    res.status(500).send("Server error!");
                })
            }
        }else{
            historicoRepository.salvarHistorico(username, req.body, 'user.controller.salvarUsuario(sem acesso)','sec');
            res.status(401).send();
        }
    }else{
        if (!roles.includes('SuperAdmin') && !roles.includes('TenantAdmin')){

            historicoRepository.salvarHistorico(username, req.body, 'user.controller.salvarUsuario(sem acesso)','sec');
            res.status(401).send();

        }else if(roles.includes('SuperAdmin')){
            historicoRepository.salvarHistorico(username, req.body, 'user.controller.salvarUsuario(super admin)');
            let sql = `
            update app.users set
                user_email = $1,
                display_name = $2,
                login_methods = $3,
                user_roles = $4,
                user_apps = $5,
                active = $7
            where id = $6;        
            `
            db.query(sql,[user_email,display_name,login_methods,user_roles,user_apps,id,active]).then(rs =>{
                res.status(200).send();
            }).catch(e =>{
                console.log(e);
                res.status(500).send( 'Server error!' );
            });
        }else{
            let sql = `
            update app.users set
                user_email = $1,
                display_name = $2,
                login_methods = $3,
                user_roles = $4,
                user_apps = $5,
                active = $8
            where id = $6  and 
                  user_tenant = $7;        
            `
            db.query(sql,[user_email,display_name,login_methods,user_roles,user_apps,id,tenant,active]).then(rs =>{
                if (rs.rowCount > 0){
                    historicoRepository.salvarHistorico(username, req.body, 'user.controller.salvarUsuario(tenant admin)');
                    res.status(200).send();
                }else{
                    historicoRepository.salvarHistorico(username, req.body, 'user.controller.salvarUsuario(tenant admin | tenant invalido)','sec' );
                    res.status(401).send();
                }
            }).catch(e =>{
                console.log(e);
                res.status(500).send( 'Server error!' );
            });
        }
    }
}
let verificaEmail = async (req, resp) => {

    let email = req.query.email.trim();
    let id = req.query.userid || null;
    db.query(`select 1 from app.users u where u.user_email = $1 and ($2::uuid is null or u.id::uuid != $3) limit 1`, [ email, id, id ] ).then( (rs) => {
        resp.status(200).send(rs.rowCount == 0);
    }).catch((e)=>{
        console.log(e)
        resp.status(500).send("Server error!");
    });
}

let generateUsername = async (req, resp) => {
    let tmpUsername = req.query.name.toLowerCase().trim();
    if (tmpUsername == '' || tmpUsername == null){
        resp.status(200).send('');
        return;
    }
    let valida = async (username)  =>{
        const { rows } = await db.query(`select 1 from app.users u where u.username = $1 limit 1`, [ username ] );
        return rows.length == 0;
    }

    const regex = /\b[a-zA-Z]{1,3}/gm;
    let username = "";
    let m;
    let last = '';
    let first = '';
    while ((m = regex.exec(tmpUsername)) !== null) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        m.forEach((match) => {
            if (first == ''){
                first = match;
            }else{
                last = match;
            }
        });
    }
    username = first  + last ;

    let count = 1;
    tmpUsername = username;
    username+=count;
    let validado = await valida(username);
    while (!validado ){
        count++;
        username = tmpUsername + count;
        validado = await valida(username);
    }

    resp.status(200).send(username);
}

module.exports = {userdata, getAllUsersByTenant, getUserAcessEnum,salvarUsuario, generateUsername, generateUsername, verificaEmail};