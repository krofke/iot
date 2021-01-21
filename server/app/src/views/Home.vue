<template>
    <div>
        <SuperUser v-if="home == 'SuperUser'"/>
        <TenantAdmin v-if="home == 'TenantAdmin'"/>
        <Producao v-if="home == 'Producao'"/>
        <User v-if="home == 'User'"/>        
    </div>
</template>

<script>
import SuperUser from  './Home/SuperUser'
import Producao from './Home/Producao'
import TenantAdmin from './Home/TenantAdmin'
import User from './Home/User'
export default {
    components : {
        SuperUser,
        Producao,
        TenantAdmin,
        User
    },
    data(){
        return {
            home : ''
        }         
    },
    mounted(){
        this.verificaRole();
    }, 
    methods : {
        verificaRole(){
            let roles = window.getUserCreds().data.roles;

            if (['SuperAdmin'].some(r=> roles.includes(r)) ){
                this.home = 'SuperUser';
            }else if (['TenantAdmin'].some(r=> roles.includes(r)) ){
                this.home = 'TenantAdmin';
            }else if (['Producao'].some(r=> roles.includes(r)) ){
                this.home = 'Producao';
            }else{
                this.home = 'User';
            }

           // this.home = 'Producao';
            
        }
    }

}
</script>