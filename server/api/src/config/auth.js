const LocalStrategy = require('passport-local').Strategy

module.exports = function(passport){
    passport.use(new LocalStrategy( {
            usernameField: 'username',
            passwordField: 'password'
        },
        (username, password, done) => {
            findUser(username, (err, user) => {
                if (err) { return done(err) }

                // usuário inexistente
                if (!user) { return done(null, false) }

                // comparando as senhas
                bcrypt.compare(password, user.password, (err, isValid) => {
                    if (err) { return done(err) }
                    if (!isValid) { return done(null, false) }
                    return done(null, user)
                })
            })
        }
    ));
}