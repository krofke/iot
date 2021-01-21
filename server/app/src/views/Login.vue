<template>
    <div>
        <q-card
                class="login-card background-sys"

        >
            <div>
                <img id="logo-sys" src="https://www.licitasys.com.br/static/logos/logo-sys.png">
                <span class="navbar-brand">LICITA<span class="sys">SYS</span></span>
            </div>
            <q-stepper
                    v-model="step"
                    ref="stepper"
                    color="primary"
                    animated
                    no-header-navigation
                    flat
                    class="q-stepper-hide background-sys"
            >

                <q-step
                        :name="1"
                        title="d"
                        class="login-step login-step-1"
                        style="min-height: 100px;"
                >
                    <q-input
                            type="text"
                            class="col-4"
                            color="gray"
                            bg-color="white"
                            label-color="white"
                            outlined
                            label="Digite aqui o seu email ou usuário"
                            stack-label
                            placeholder="colaborador@bigpharmacompany.com"
                            v-model="currentUser"
                            @keydown.enter.prevent="loadLoginOptions"
                            autofocus
                    >
                        <template v-slot:append>
                            <q-btn round dense flat icon="fas fa-sign-in-alt" @click="loadLoginOptions"/>
                        </template>
                    </q-input>
                </q-step>
                <q-step
                        :name="2"
                        title="d"
                        class="login-step login-step-2"
                        :done="step > 2"
                        style="min-height: 100px;"
                >
                    <div class="row">
                        <div class="col-12">
                            <q-input
                                    v-show="loginMethods.includes('Interno')"
                                    type="password"
                                    class="col-11"
                                    color="gray"
                                    bg-color="white"
                                    label-color="white"
                                    outlined
                                    :label="'Digite aqui a senha para: ' + currentUser "
                                    stack-label
                                    v-model="currentUserPass"
                                    @keydown.enter.prevent="doLoginWithPassword"
                                    error-message="Falha no login"
                                    :error="erroLogin"
                                    autofocus
                            >
                                <template v-slot:append>
                                    <q-btn round dense flat icon="fas fa-sign-in-alt" @click="doLoginWithPassword"/>
                                </template>
                            </q-input>
                        </div>
                        <q-btn v-show="loginMethods.includes('Google')" label="Fazer login pelo Google"    dense class="col-12 q-mt-md q-pa-sm" style="color: white" color="secondary" icon="fab fa-google" @click="doLoginWithGoogle"/>
                        <q-btn v-show="loginMethods.includes('Microsoft')" label="Fazer login pela Microsoft" dense class="col-12 q-mt-md q-pa-sm" style="color: white" color="secondary"  icon="fab fa-microsoft" @click="doLoginWithMicrosoft"/>

                        <q-btn class="col-2 q-mt-md" style="color: white" round dense flat icon="fa fa-backward" @click="$refs.stepper.previous()"/>

                        <div class="col-10 q-mt-md" v-show="loginMethods.includes('Interno')">

                        </div>
                    </div>
                </q-step>
            </q-stepper>
        </q-card>

    </div>
</template>

<script>
    export default {
        name: "Login",
        data () {
            return {
                step: 1,
                currentUser : '',
                currentUserPass : '',
                loginMethods : [],
               erroLogin : false
            }
        },
        mounted() {
            this.verifyCurrentUserInLocalStorage();
        },
        methods : {
            verifyCurrentUserInLocalStorage(){
                let currUser = window.localStorage.getItem("sys-username");
                if (currUser){
                    this.currentUser = currUser;
                    this.loadLoginOptions();
                }

            },
            loadLoginOptions(){
                window.localStorage.setItem("sys-username", this.currentUser);
                if (this.currentUser != '') {
                    this.$http.get('login/1',  { params : { u : this.currentUser} }).then(r =>{
                        if (r.body == 'autenticado'){
                            this.routeAfterLogin();
                        }else {
                            this.loginMethods = r.body.login_methods;
                            this.$refs.stepper.next();
                        }
                    })

                }
            },
            doLoginWithPassword(){
                var formData = {
                    username : this.currentUser,
                    password : this.currentUserPass
                }
                this.$http.post("login/2", formData, { emulateJSON: true}).then(response =>{
                    //this.routeAfterLogin();
                    this.loadLoginOptions();
                }, (response =>{
                    this.erroLogin = true;
                }))
            },
            routeAfterLogin(){
                let curentUrl = new URL(document.location.href);
                let route = curentUrl.searchParams.get("sys_sso_redirect")

                if (route){
                    let redirectUrl = new URL(route);
                    redirectUrl.searchParams.delete('sys_sso_redirect');
                    document.location = redirectUrl.toString();
                }else if (this.$router.currentRoute.name == "login"){
                    this.$router.push('home');                          
                }
            },
            doLoginWithGoogle(){
                document.location = '/sso/login/google'
            },
            doLoginWithMicrosoft(){
                window.alert("Login com Microsoft");
            }
        }
    }
</script>

<style lang="less">
    .q-stepper-hide{
        .q-stepper__header{
            display: none;
        }
    }

</style>
<style scoped lang="less">
    .login-card{
        height: 300px;
        width: 400px;
        position: absolute;
        left: 50%;
        top: 30%;
        transform: translate(-50%, -50%);
        user-select: none;
    }
    #logo-sys{
        height: 90px;
        margin-left: calc(50% - 45px);
        margin-top: 25px;
        margin-bottom: 5px;
    }
    .navbar-brand {
        font-size: 30px;
        font-weight: bold;
        color: #2D2D30;
        display: block;
        margin-bottom: 5px;
        text-align: center;
        color: #afafaf;
        .sys{
            color: #FF6622;
        }
    }
    .login-step{
        border-color: #4d5258;
    }

    .background-sys{
        background-color: rgba(77,82,88,1);
    }
</style>