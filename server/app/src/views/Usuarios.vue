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
            class="col col-12 q-px-sm q-pt-sm"
            @input="tenantChanged"
            error-message="Selecione uma empresa"
            :error="tenantModel == null"
    />

      <q-table
              dense
              title="Usuários"
              id="usuarios-table"
              :data="usuariosRawData"
              :columns="usuariosDataColumns"
              :pagination.sync="usuariosPagination"
              row-key="id"
              hide-bottom
              @row-dblclick="usuariosTableRowClick"
      >
        <template v-slot:top>

          <div class="q-table__title">Usuários</div>
          <q-space />
          <q-icon name="fas fa-plus" style="font-size: 1rem;" @click.stop.prevent="mostrarModalnovoUsuario">
            <q-tooltip>
              NOVO USUÁRIO
            </q-tooltip>
          </q-icon>

        </template>

      </q-table>

    <q-dialog v-model="modalEditarUsuario" persistent @hide="novoUsuario = false">
      <q-card style="min-width: 750px">
        <q-card-section>
<!--          <div class="text-h6">{{modalUsuarioData.display_name}}</div>-->
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input outlined dense stack-label autofocus class="q-pt-sm"
                   label="Nome"
                   v-model="modalUsuarioData.display_name"
                   @keyup.enter="prompt = false"
                   error-message="Este não é um nome considerado valido"
                   :error="!modalUsuarioNomeValidado"
                   modalUsuarioNomeValidado
                   @input = "generateUserNameAndValidadeName"
                   debounce="200"
          />

          <q-input outlined dense stack-label readonly autofocus class="q-pt-sm"
                   label="Username"
                   v-model="modalUsuarioData.username"
                   @keyup.enter="prompt = false"
          />
          <q-input outlined dense stack-label autofocus class="q-pt-sm"
                   label="Email"
                   v-model="modalUsuarioData.user_email"
                   @keyup.enter="prompt = false"
                   error-message="Esta não é um email valido ou ja esta cadastrado para outro usuario"
                   :error="!modalUsuarioEmailValidado"
                   @input = "validaUsuarioEmail"
                   debounce="200"

          />
          <q-select  outlined dense stack-label autofocus class="q-pt-sm"
                  v-model="modalUsuarioData.user_roles"
                  multiple
                  :options="userAccessEnuns.roles"
                  use-chips
                  label="Roles"
          />
          <q-select  outlined dense stack-label autofocus class="q-pt-sm"
                     v-model="modalUsuarioData.user_apps"
                     multiple
                     :options="userAccessEnuns.app"
                     use-chips
                     label="Aplicações"
          />
          <q-select  outlined dense stack-label autofocus class="q-pt-sm"
                     v-model="modalUsuarioData.login_methods"
                     multiple
                     :options="userAccessEnuns.login"
                     use-chips
                     label="Metodos de login"
          />

          <q-toggle
                  v-model="modalUsuarioData.active"
                  color="blue"
                  :label="modalUsuarioData.active ? 'Ativo' : 'Inativo'"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn dense color="primary" label="Cancelar" v-close-popup />
          <q-btn dense color="primary" :disable="btnSalvarDissable" label="Salvar" @click.stop.prevent="salvarUsuario" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
        novoUsuario : false,
        userAccessEnuns : {},
        modalEditarUsuario : false,
        modalUsuarioData : {},
        modalUsuarioEmailValidado : true,
        modalUsuarioNomeValidado : true,
        tenants : [],
        tenantOnState : {},
        tenantModel : null,
        tenantOptions : [],
        usuariosRawData : [],
        usuariosDataColumns : [
          {
            name: "display_name",
            align: "left",
            label: "Nome",
            field: "display_name",
            sortable: true
          },
          {
            name: "username",
            align: "left",
            label: "Username",
            field: "username",
            sortable: true
          },
          {
            name: "user_email",
            align: "left",
            label: "Email",
            field: "user_email",
            sortable: true
          },
          {
            name: "active",
            align: "left",
            label: "Situação",
            field: "active",
            sortable: true,
            format: val => val ? 'Ativo' : 'Inativo'
          }
        ],
        usuariosPagination : {
            sortBy: "",
            descending: true,
            page: 1,
            rowsPerPage: 100,
            rowsNumber: 100
        }

    }
  },
  beforeMount() {
    this.startUp();
  },
  computed : {
    btnSalvarDissable() {
      return (
              !this.modalUsuarioEmailValidado ||
              !this.modalUsuarioNomeValidado ||
              !this.modalUsuarioData.username ||
              this.modalUsuarioData.username == '');
    }
  },
  methods : {
    validateEmail(email) {
      const re = /\S+@\S+\.\S+/;
      return re.test(String(email).toLowerCase());
    },
    validaUsuarioEmail(email){
      if (this.validateEmail(email)){
        this.$http.get("priv/user/verifica-email",{ params :  { email : email, userid : this.modalUsuarioData.id } }).then(r =>{
          this.modalUsuarioEmailValidado = r.body;
        });
      }else{
        this.modalUsuarioEmailValidado = false;
      }
    },
    generateUserNameAndValidadeName(username){
      let re = /\S{2}/gm;
      if (re.test(String(username).toLowerCase()) ){
        this.modalUsuarioNomeValidado = true;
        if (this.novoUsuario){
          this.$http.get("priv/user/generate-username",{ params :  { name : username } }).then(r =>{
            this.$set(this.modalUsuarioData, 'username', r.body);
          });
        }

      }else{
        this.modalUsuarioNomeValidado = false;
        if (this.novoUsuario) {
          this.$set(this.modalUsuarioData, 'username', '');
        }
      }
    },
    mostrarModalnovoUsuario(){
      this.novoUsuario = true;
      this.modalEditarUsuario = true;
      this.modalUsuarioData = {};
      this.modalUsuarioEmailValidado = false;
      this.modalUsuarioNomeValidado = false;
    },
    salvarUsuario(){
      this.modalUsuarioData.novo = this.novoUsuario;
      this.modalUsuarioData.user_tenant = this.tenantModel.value;
      this.$http.post("priv/user/put", this.modalUsuarioData).then(() =>{
        this.$q.notify(`Salvo!`);
        this.modalEditarUsuario = false;
        this.modalUsuarioData = {};
        this.startUp();
      }, (e) =>{
        this.$q.notify(`Erro ao salvar: ${e.body}`);
        this.startUp();
      });
    },
    usuariosTableRowClick(e, row){
          this.modalEditarUsuario = true;
          this.modalUsuarioData = { ...row };
          this.modalUsuarioEmailValidado = true;
          this.modalUsuarioNomeValidado = true;
      },
    tenantChanged(value){
      this.saveTenantOnState(value);
      this.$http.get("priv/user/get",{ params :  { tenant_id : value.value } }).then(r =>{
        this.usuariosRawData =  r.body.sort( (v1, v2) => v1.display_name.localeCompare(v2.display_name) );
      });
    },
    saveTenantOnState(value){
        let param = {
            key : 'ciam.usuarios.tenant',
            value : value
        };
        this.$http.post("priv/user-state/set", param)
    },
    startUp(){
      this.$http.get("priv/tenants/get").then(r =>{
        this.tenants = r.body.sort( (v1, v2) => v1.nome_exibicao.localeCompare(v2.nome_exibicao) );
      });
      this.$http.get("priv/user-state/get",{ params :  { key : 'ciam.usuarios.tenant' } }).then(r =>{
        this.tenantModel =  r.body;
        this.tenantChanged(this.tenantModel);
      });
      this.$http.get("priv/user/get-enums").then(r =>{
        this.userAccessEnuns =  r.body;
      });


    },
    tenantFilterFn (val, update) {

          if (val === '') {
            update(() => {
              this.tenantOptions = this.tenants.map(v => {
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
            this.tenantOptions = this.tenants.map(v => {
              let name = v.nome_exibicao.substring(0, 100);
              return {
                label :  name + " | " + v.dominio ,
                value : v.dominio
              }
            }).filter(v => v.label.toLowerCase().indexOf(needle) > -1)
          })

        }
  }
};
</script>
<style lang="less">
    #usuarios-table{
        cursor: pointer;
        margin-left: 10px;
        margin-right: 10px;
        margin-top: 5px;
        width: 100%;
        .q-table__middle {
            max-height: calc(100vh - 222px);
        }

        thead tr th {
            position: sticky;
            z-index: 1;
        }

        .q-table__top,
        .q-table__bottom,
        thead tr:first-child th {
            background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAYAAADgzO9IAAAABHNCSVQICAgIfAhkiAAAABVJREFUCJljYGBgEGaAAHQaN6C1DgA7XgCs3odsLgAAAABJRU5ErkJggg==);
            background-color: #fefefe;
        }


        thead tr:first-child th {
            top: 0;
        }

        .q-table--loading thead tr:last-child th {
            top: 400px;
        }
        .ocorrencia-fabprod-data-cols-text-overflow{
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
</style>