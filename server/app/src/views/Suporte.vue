<template>
  <div class="row">
    <q-select
        outlined dense stack-label
        v-model="tenantModel"
        use-input
        input-debounce="0"
        label="Empresa"
        :options="tenantOptions"
        @filter="tenantFilterFn"
        class="col col-10 q-px-sm q-pt-sm"
        @input="tenantChanged"
        error-message="Selecione uma empresa"
        :error="tenantModel == null"
    />
    <div class="col-2" id="tenants-logo">
      <img :src="tenantSelecionado.logo_url">
    </div>

    <q-separator class="q-mt-md col-12"/>

    <q-btn dense color="primary" class="q-ml-md q-mt-md" :disable="tenantModel == null" label="Logar como suporte no LicitaSYS PRD" @click.stop.prevent="abrirNovaJanelaComoSuporte('PRD')" />
    <q-btn dense color="secondary" class="q-ml-md q-mt-md" :disable="tenantModel == null" label="Logar como suporte no LicitaSYS QA" @click.stop.prevent="abrirNovaJanelaComoSuporte('QA')" />

  </div>
</template>

<script>
export default {
  beforeMount() {
    this.startUp();
  },
  data(){
    return {
      tenantModel : null,
      tenantRawData : [],
      tenantOptions : [],
      tenantSelecionado : {},
      showInpersonateSuporte : false,
    }
  },
  methods : {
    abrirNovaJanelaComoSuporte(ambiente){

      if (ambiente == 'PRD'){
        this.$http.post("https://www.licitasys.com.br/app/api/licita/logout").then( _ =>{
          window.open(`https://www.licitasys.com.br/Login.aspx#${this.tenantModel.value}\\suporte`);
        }, _ => {
          window.open(`https://www.licitasys.com.br/Login.aspx#${this.tenantModel.value}\\suporte`);

        });
      }else{
        this.$http.post("https://prodsysqa.licitasys.com.br/app/api/licita/logout").then( _ =>{
          window.open(`https://prodsysqa.licitasys.com.br/Login.aspx#${this.tenantModel.value}\\suporte`);
        }, _ => {
          window.open(`https://prodsysqa.licitasys.com.br/Login.aspx#${this.tenantModel.value}\\suporte`);

        });

      }

    },
    startUp(){
      this.startUpUserAcess();
      this.startUpTenants();
      this.$http.get("priv/user-state/get",{ params :  { key : 'ciam.tenants.tenant' } }).then(r =>{
        this.tenantModel =  r.body;
        this.tenantChanged(this.tenantModel);
      });
    },
    startUpTenants(){
      this.$http.get("priv/tenants/get").then(r =>{
        this.tenantRawData = r.body.sort( (v1, v2) => v1.nome_exibicao.localeCompare(v2.nome_exibicao) );
      });
    },
    startUpUserAcess(){
      let creds =  window.getUserCreds();
      if (
            creds && creds.data && creds.data.roles &&
          ( creds.data.roles.includes("SuperAdmin") || creds.data.roles.includes("Suporte") )
      ){
        this.showInpersonateSuporte = true;
      }else{
        this.showInpersonateSuporte = false;
      }
    },
    tenantChanged(value) {
      this.saveTenantOnState(value);
      this.tenantSelecionado = { ...this.tenantRawData.filter( f => f.dominio == value.value )[0] };
    },
    saveTenantOnState(value){
      let param = {
        key : 'ciam.tenants.tenant',
        value : value
      };
      this.$http.post("priv/user-state/set", param)
    },
    tenantFilterFn (val, update) {

      if (val === '') {
        update(() => {
          this.tenantOptions = this.tenantRawData.map(v => {
            let name = v.nome_exibicao.substring(0, 100);
            if (name.length > 100)
              name = name + "...";
            return {
              label : name + " | " + v.dominio,
              value : v.dominio
            }
          });
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase();
        this.tenantOptions = this.tenantRawData.map(v => {
          let name = v.nome_exibicao.substring(0, 100);
          return {
            label :  name + " | " + v.dominio ,
            value : v.dominio
          }
        }).filter(v => v.label.toLowerCase().indexOf(needle) > -1)
      })

    }
  }
}
</script>

<style lang="less">
#tenants-logo{
  position: relative;
  margin-top: 10px;
  height: 60px;
  img{
    max-width: 150px;
    max-height: 50px;
    position: absolute;
    margin: auto;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 5px;
    width: 150px;
  }
}
#tenants-titulo{
  max-height: 200px;
  height: 200px;
}
</style>