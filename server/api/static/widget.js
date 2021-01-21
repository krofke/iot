////Importante ////Importante quando for alterar o widgetJs api/static/ rodar um npm run build do webb com a variave dev do main.js como true.e apontar o script para o localhost no arquivo public/index.html

///Jst decode
!function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c?c:a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){function d(a){this.message=a}function e(a){var b=String(a).replace(/=+$/,"");if(b.length%4==1)throw new d("'atob' failed: The string to be decoded is not correctly encoded.");for(var c,e,g=0,h=0,i="";e=b.charAt(h++);~e&&(c=g%4?64*c+e:e,g++%4)?i+=String.fromCharCode(255&c>>(-2*g&6)):0)e=f.indexOf(e);return i}var f="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";d.prototype=new Error,d.prototype.name="InvalidCharacterError",b.exports="undefined"!=typeof window&&window.atob&&window.atob.bind(window)||e},{}],2:[function(a,b,c){function d(a){return decodeURIComponent(e(a).replace(/(.)/g,function(a,b){var c=b.charCodeAt(0).toString(16).toUpperCase();return c.length<2&&(c="0"+c),"%"+c}))}var e=a("./atob");b.exports=function(a){var b=a.replace(/-/g,"+").replace(/_/g,"/");switch(b.length%4){case 0:break;case 2:b+="==";break;case 3:b+="=";break;default:throw"Illegal base64url string!"}try{return d(b)}catch(c){return e(b)}}},{"./atob":1}],3:[function(a,b,c){"use strict";function d(a){this.message=a}var e=a("./base64_url_decode");d.prototype=new Error,d.prototype.name="InvalidTokenError",b.exports=function(a,b){if("string"!=typeof a)throw new d("Invalid token specified");b=b||{};var c=b.header===!0?0:1;try{return JSON.parse(e(a.split(".")[c]))}catch(f){throw new d("Invalid token specified: "+f.message)}},b.exports.InvalidTokenError=d},{"./base64_url_decode":2}],4:[function(a,b,c){(function(b){var c=a("./lib/index");"function"==typeof b.window.define&&b.window.define.amd?b.window.define("jwt_decode",function(){return c}):b.window&&(b.window.jwt_decode=c)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./lib/index":3}]},{},[4]);

function getUserCreds(){
    return jwt_decode(localStorage.getItem("sys-sso-token"));
}

function appendRedirect(rootUrl, redirectUrl){
    let ur = new URL(rootUrl);
    ur.searchParams.append("sys_sso_redirect", redirectUrl);
    return ur.toString();
}

function sysSsoVariablesSet(options) {
    window.sysSsoVariables = {
        showMenu: function (menuId) {
            if (menuId != "sso-menu-aplicativos")
                document.getElementById("sso-menu-aplicativos").style.visibility = 'hidden';
            if (menuId != "sso-menu-usuarios")
                document.getElementById("sso-menu-usuarios").style.visibility = 'hidden';
            if (menuId != "sso-mascara")
                document.getElementById("sso-mascara").style.visibility = 'hidden';

            var elementoToDiplay = document.getElementById(menuId);
            if (elementoToDiplay) {
                if (elementoToDiplay.style.visibility == 'visible') {
                    elementoToDiplay.style.visibility = 'hidden';
                } else {
                    elementoToDiplay.style.visibility = 'visible';
                    document.getElementById("sso-mascara").style.visibility = 'visible';
                }
            }
        },
        sair: function () {
            //window.location.href = options.root + "sso/login/0?sys_sso_redirect=" + window.location.href;
            window.location.href = appendRedirect(options.root + "sso/login/0" , window.location.href);
        }
    };
}
function ssoAppRedirect(id, urlRedirect) {

    var http = new XMLHttpRequest();
    var url = "/acesso/app?id=" + id;
    http.withCredentials = true;
    http.open('POST', url);
    http.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("sys-sso-token"));
    http.send();
    window.open(urlRedirect);
    //window.location.href = urlRedirect;
}
window.sysso = function(options) {

    sysSsoVariablesSet(options);
    var resolve;
    var reject;
    var promisse = new Promise(function (res, rej) {
        resolve = res;
        reject = rej;
    });
    options = options || {}
    options.root = options.root || '/';
    options.div = options.div || 'sys-sso';
    options.css = options.css || { backgroundColor: "#57585a", color: "#f1f1f1" };

//renovar o token
    function loginCrontrol() {
        var resolveLogin;
        var rejectLogin;
        var promisseLogin = new Promise(function (res, rej) {
            resolveLogin = res;
            rejectLogin = rej;
        });

        var hasAction = true;

        //ouve todas os cliques no navegador
        document.addEventListener('click', function (event) {
            hasAction = true;
        }, false);

        window.setInterval(() =>{
            if (hasAction){
                hasAction = false;
                var url = options.root +  "sso/ping"
                fetch(url).then( (response) =>{
                  if (response.status >= 300){
                        redirectToLogout()  
                  }                  
                });                
            }
        }, (1000*30) );

        function redirectToLogout(){
            window.location.href =  appendRedirect(options.root +  "sso", window.location.href);
        }

        function obtemToken() {
            var http = new XMLHttpRequest();
            var url = options.root +  "sso/login/jwt"
            http.withCredentials = true;
            http.open('GET', url);
            http.send();
            http.onreadystatechange = function () {
                if (http.readyState === XMLHttpRequest.DONE && http.status === 200) {
                    localStorage.setItem("sys-sso-token", http.responseText);
                    resolveLogin(http.responseText);
                }else if(http.readyState === XMLHttpRequest.DONE && http.status != 200){
                    //window.location.href = options.root +  "sso?sys_sso_redirect=" + window.location.href;
                    redirectToLogout()
                }
            }

            
        }
        obtemToken();
        //de x tempos em tempo renova o token
        let lastExp = 0;
        window.setInterval(() => {
            var userCreds = getUserCreds()
            dateTokenExpire = (new Date().getTime() + (30*1000) ) / 1000 ;
            if (  dateTokenExpire > userCreds.exp ) {
                obtemToken();
                console.log("Token atualizado " + new Date().toLocaleTimeString() );                
            }

        }, 1000 * 17);
        return promisseLogin;
    }


//Carrega o elemento
loginCrontrol().then((token) => {
    var http = new XMLHttpRequest();
    var url = options.root + "sso/priv/user/userdata";
    http.withCredentials = true;
    http.open('GET', url);
    http.setRequestHeader("Authorization", "Bearer " + token);
    http.send();
    http.onreadystatechange = function () {
        if (http.readyState === XMLHttpRequest.DONE && http.status === 200) {
            var response = JSON.parse(http.responseText);

            window.userData = response;

            var applications = '<div class="sso-applications">';


            response.aplicacoes.forEach(element => {
                applications += `
                <div class="sso-quadrado-application" onclick="ssoAppRedirect('${element.id}', '${element.url}')">
                    <img  class="sso-img-application"  src="${element.logoUrl}" >
                    <div  class="sso-nome-application">${element.sigla}</div>
                </div>
            `;
            });
            applications += '</div>';


            var html = `
        <!--Div widget-->
        <div id="sso-div">

            <img  id="sso-logo-empresa"    
                onclick="sysSsoVariables.showMenu('')"                        
                class=""         
                src="${response.tenantLogoUrl}"
            >

            <img  id="sso-img-apps"        
                onclick="sysSsoVariables.showMenu('sso-menu-aplicativos')"    
                class="sso-img"  
                src="data:image/png;base64,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"
            >

            <img  id="sso-img-user"        
                onclick="sysSsoVariables.showMenu('sso-menu-usuarios')"       
                class="sso-img"  
                src="data:image/png;base64,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"
            >

            <img  id="sso-img-notificacao" 
                onclick="sysSsoVariables.showMenu('')"                        
                class="sso-img"  
                src="data:image/png;base64,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"
            >

        </div>
    
    
        <!--Div menu aplicativos-->
        <div id="sso-menu-aplicativos" class="sso-menu">
            Aplicativos
            ${applications}
        </div>
        
    
        <!-- Menu usuario-->
        <div id="sso-menu-usuarios" class="sso-menu">
            ${response.displayName} 
            <div id="sso-menu-usuarios-conteudo">
                <a onclick="sysSsoVariables.sair()" >Sair</a>
            </div>                
        </div>

        <!-- Mascara-->
        <div id="sso-mascara"
            onclick="sysSsoVariables.showMenu('sso-mascara')"  
        >
    
    
        </div>        
        <!-- Estilos -->
        <style>
        #sso-div{
            position: absolute;
            width: 200px;
            height: 40px;
            z-index: 999998;
            right: 0;
            background-color: ${options.css.backgroundColor} ;
            color: ${options.css.color};
            border-bottom-left-radius: 15px 70%;
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
            padding-left: 10px;
        }
        #sso-div:after{
            content: "";
            position: absolute;
            width: 40px;
            height: 50px;
            right: calc(100% - 5px);
            bottom: 0;
            top: 0;
            background-color: transparent;
            border-top-right-radius: 50% 50px;
            box-shadow: 0px 0px 0px 20px ${options.css.backgroundColor};
            clip: rect(0px, 36px, 20px, 0px);
            z-index: 999998;
        }
        .sso-menu{
            background-color:var(--branco);
            position: absolute;
            z-index: 999999999;
            right: 20px;
            top: 45px;
            height: auto;
            width: 257px;
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
            border-radius: 5px;
            padding: 10px;
            text-align: center;
            visibility : hidden;

        }
        #sso-menu-aplicativos{
            background-color : white;
        }
        #sso-menu-usuarios{
            display: grid;
            text-align: left;
            margin-left: 16px;
            user-select: none;
            cursor: pointer;      
            background-color : white;             
        }
        #sso-logo-empresa{
            max-height : 40px;
            float : right;
            cursor : pointer;
        }
        .sso-img{
            cursor: pointer;
            max-height: 19px;
            margin-top: 12px;
        }
        #sso-img-apps{
            margin-left: 4px;

        }
        #sso-img-user{
            margin-left: 10px;
        }
        #sso-img-notificacao{
            margin-left: 40px;
        } 
        #sso-mascara{
            background-color: var(--cinza);
            opacity: .6;
            position: absolute;
            height: 100%;
            width: 100%;
            z-index : 99999;
            box-shadow: inset 0 0 0 3000px rgba(255,255,255,0.1);
            filter: blur(5px);
            visibility : hidden;                
        }   
        #sso-menu-usuarios-conteudo{
            display: grid;
            text-align: left;
            user-select: none;
            cursor: pointer;             
        }
        .sso-applications{
            display: grid;
            grid-template-columns: 84px 84px 84px;
            grid-template-rows: auto
            padding: 2px;  
            border-top : 1px solid rgba(0, 0, 0, 0.2);             
        }      
        .sso-quadrado-application{
            margin-right: 15px;
            padding: 5px;
            border-radius: 4px;
            cursor : pointer;
            margin-top : 6px;

        }
        .sso-quadrado-application:hover{
            box-shadow: 0 3px 4px 0 rgba(231, 120, 23, 0.2), 0 3px 2px 0 rgba(231, 120, 23, 0.19);
        }            
        .sso-img-application{
            max-height : 40px;
            border-radius : 3px;
        }
        .sso-nome-application{
            font-size : 12px;
            margin-top: -0px;
        }
        `;
            document.getElementById(options.div).innerHTML = html;
            resolve();
        }
    };
});

    return promisse;
}

