<template>
    <div id="">
        <div id="sys-sso"></div>

    <q-layout id="app" view="hHh lpR fFf">
        <q-header elevated class="bg-primary text-white" height="40px">
            <q-toolbar>
                <q-btn
                        flat
                        dense
                        round
                        @click="miniState = !miniState"
                        aria-label="Menu"
                        icon="fas fa-bars"
                />

                <router-link tag="div" to="/home">
                    <q-toolbar-title class="ciam-toolbar-title">
                        CIAM
                        <!-- <span class="text-accent">SYS</span> -->
                        <!-- <q-icon id="icone-ciam" name="fas fa-book"/> -->
                    </q-toolbar-title>
                </router-link>
            </q-toolbar>
        </q-header>

        <q-drawer
                v-model="drawer"
                show-if-above
                :mini="!drawer || miniState"
                bordered
                content-class="bg-grey-2"
                side="left"
        >
            <q-list>

               <router-link tag="div" to="/home">
                   <q-item clickable v-ripple tag="a">
                       <q-item-section avatar>
                           <q-icon name="fas fa-home"/>
                       </q-item-section>
                       <q-item-section>
                           <q-item-label>Tela inicial</q-item-label>
                        </q-item-section>
                    </q-item>
               </router-link>     

               <q-separator/>
               <q-separator/>
                          
                <router-link v-if="showEditUser" tag="div" to="/usuarios">
                    <q-item clickable v-ripple tag="a">
                        <q-item-section avatar>
                            <q-icon name="fas fa-user"/>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Usuarios</q-item-label>
                        </q-item-section>
                    </q-item>
                </router-link>


                <router-link v-if="showSuporte" tag="div" to="/suporte">
                    <q-item clickable v-ripple tag="a">
                        <q-item-section avatar>
                            <q-icon name="fas fa-headset"/>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Suporte</q-item-label>
                        </q-item-section>
                    </q-item>
                </router-link>
            </q-list>
        </q-drawer>

        <q-page-container v-if="jwtLoaded">
            <router-view/>
        </q-page-container>
    </q-layout>


    </div>
</template>

<script>
    export default {
        name: "AppInterno",
        mounted() {
          window.sysso({root : window.ssoUrl}).then( () =>{
            this.jwtLoaded = true;
            //this.$router.push('/home')
            return false;
          });
        },
        data() {
            return {
                drawer: false,
                miniState: true,
                jwtLoaded : false
            };
        },

        computed: {
            leftDrawerClosed() {
                return !this.leftDrawerOpen;
            },
            showSuporte(){
                let roles = window.getUserCreds().data.roles;
                return roles.includes("Suporte") 
            },
            showEditUser(){
                let roles = window.getUserCreds().data.roles;
                let rolesAllowed = ["SuperAdmin","TenantAdmin"]
                return rolesAllowed.some(r=> roles.includes(r))
            }
        },

        methods: {
            drawerClick(e) {
                if (this.miniState) {
                    this.miniState = false;
                    e.stopPropagation();
                }
            }
        }
    }
</script>

<style scoped>

    .lnk:link,
    .lnk:visited,
    .lnk:hover,
    .lnk:active {
        color: #f1f1f1;
        text-align: left;
        text-decoration: none;
        outline: none;
        font-family: "Open Sans", sans-serif;
    }

    ::-webkit-scrollbar {
        width: 5px;
        height: 5px;
    }

    ::-webkit-scrollbar-thumb {
        background: #57585a;
        border-radius: 4px;
    }

    #app {
        scrollbar-color: #57585a #e9e6e6;
        scrollbar-width: thin;
    }

    .q-header {
        height: 40px;
    }

    .q-toolbar {
        height: 40px !important;
        min-height: 40px !important;
    }

    #inicio-menu {
        margin-top: 0;
    }

    #icone-ciam {
        margin-left: 10px;
        margin-top: -2px;
    }

    .ciam-toolbar-title {
        user-select: none;
        cursor: pointer;
    }
</style>
<style lang="less">
    #app{
        .q-field{
            background-color: white;
        }
    }

</style>