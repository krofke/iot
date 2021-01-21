<template>
    <div class="container-app">
        <Login v-if="showLogin"/>
        <AppInterno v-else/>
        <!-- <router-view/>-->

    </div>
</template>

<script>
import Login from './views/Login.vue'
import AppInterno from './views/AppInterno.vue'
export default {
    components : {
        Login, AppInterno
    },
    mounted() {
        this.showLogin = this.$router.currentRoute.name == 'login'
    },
    data(){
        return {
            showLogin : true
        }
    },
    watch: {
        '$route' (to){
            this.showLogin = to.name == 'login'
        }
    }
}
</script>

<style lang="less">
    .container-app{
        background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAIAAABv85FHAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH5AIJEDktEbSdYQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAABySURBVAjXbY+xDsIwFAPvpYD4/39jY6tEGVArgcTQJjmGlgxVPdo6y8bp6aG+b1THxz4YBzVUgGUmBZFAcuZyBRKbJBKlIFhW67RFZaZmUkdeIFYvNQwStVD9NzUuAirdmShEA9TPtN853FXsb8f/Xv0PKG6FKjNNKccAAAAASUVORK5CYII=');
        background-repeat: repeat;
        height: 100vh;
        width: 100vw;
    }
</style>
