
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const app = express();
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session)
const index = require('./routes/index');
const healthRoute = require('./routes/health.routes');
const loginRoute = require('./routes/login.routes');
const userRoute = require('./routes/user.routes');
const userStateRoute = require('./routes/user-state.routes');
const historicoRoute = require('./routes/historico.routes');
const tenantRoute = require('./routes/tenant.routes');
const applicationsRoute = require('./routes/application.routes');
const pingRoute = require('./routes/ping.routes')
const deviceRoute = require('./routes/device.routes')


const loginController = require('./controllers/login.controller')

const db = require('./config/db');
const jwt = require('express-jwt');
const fs = require('fs');
const uuid = require('uuid')
const secret = process.env.CIAM_COOKIE_SECRET || 'novela'




//if(process.env.NODE_ENV === 'development') {
    app.use(cors({
        credentials: true,
        origin : function(origin, callback){
            let origins = ['http://localhost:8080', 'http://localhost:3000', 'https://iot.krofke.com.br'];
            if (origins.includes(origin)){
                callback(null, origin);
            }else{
                callback(null, '');
            }
        }
    }));
//}

let publicKey = fs.readFileSync('./certs/public.pem', 'utf8');
//jwt({ secret: publicKey, algorithms: ['RS256'] });
let secRoutes = (req)=>{
    return !req.url.startsWith("/sso/priv") &&
           !req.url.startsWith("/device") &&
           !req.url.startsWith("/sso/login/jwt-validade")&&
           !req.url.startsWith("/sso/login/jwt-superadmin");
};

app.use(jwt({ secret: publicKey, algorithms: ['RS256'], requestProperty: 'jwt'}).unless({custom  : secRoutes }));

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
      res.status(401).send('Unauthorized');
    }

  });


app.use("/sso", express.static('../app/dist'));
app.use("/sso", express.static('static'));
app.use("/", express.static('worker'));


//novo
const buildSessionConfig = (options) => session({
store: new pgSession({
    pool : db.pool,
    tableName : 'sessions',
    schemaName : "app",
}),
    secret: secret,
    cookie: { maxAge: ( parseInt(process.env.CIAM_COOKIE_TIME_SEGUNDOS) || 3600 ) * 1000, secure: false , sameSite : 'Lax', domain : process.env.CIAM_COOKIE_DOMAIN || 'localhost'},
    resave: false,
    saveUninitialized: false
})
  
const rollingSession    = buildSessionConfig({ rolling: true })
const nonRollingSession = buildSessionConfig({ rolling: false })

let sysSession =  (req, res, next) => {
    if (req.path.startsWith('/sso/login/jwt')) {
        nonRollingSession(req, res, next)
    } else {
        rollingSession(req, res, next)
    }
}
app.use(sysSession);




app.use(loginController.passport.initialize({}) );
app.use( loginController.passport.session() );




app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.json({ type: 'application/vnd.api+json' }));

app.use(function (req, res, next) {
    let username = 'anonimo';
    if (req.user){
        username = req.user;
    }else if (req.jwt && req.jwt.data && req.jwt.data.username){
        username = req.jwt.data.username;
    }
    console.log(Date.now(), " | path: " , req.path , ' | user: ', username);
    next();
});


app.use(index);
app.use('/health', healthRoute);
app.use('/sso/login', loginRoute);
app.use('/sso/priv/user', userRoute);
app.use('/sso/priv/user-state', userStateRoute);
app.use('/sso/priv/tenants', tenantRoute);
app.use('/sso/priv/applications', applicationsRoute);
app.use('/sso/priv/historico', historicoRoute);
app.use('/sso/' , pingRoute)
app.use('/device/', deviceRoute)

app.use((err, req, res, next) => {
    if (err) {
        let id = uuid.v4();
        console.log('#########################################################################################################\n',
                     'uuid: ',  id, ' | path :', req.path , ' | user: ', req.jwt.name || 'anonimo' , '\n' ,  err, '\n',
                    '#########################################################################################################');
        return res.status(500).send(`Server error ${id}`);
    }
    next();
});


module.exports = app;