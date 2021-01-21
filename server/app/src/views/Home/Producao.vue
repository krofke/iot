<template>
    <div class="row q-pa-lg">
    <q-card v-for="card in cards" :key="card.id" class="col-2 q-ml-lg q-mt-lg">
      <q-card-section class="bg-primary text-white" >
        <div align="center" class="text-h6">{{card.titulo}}</div>
        <div align="center">
            <q-icon class="q-mt-lg" style="font-size : 50px"   :name="card.icone" />
        </div>        
      </q-card-section>
      <q-separator />
      <q-card-actions>
        <q-btn class="col-12" @click="openUrl(card.link)" color='primary'>Acessar</q-btn>        
      </q-card-actions>
    </q-card>

    </div>
</template>

<script>
export default {
    data(){
        return {
            cards : [
                {id: 1, titulo : "Abertura", link : "https://www.licitasys.com.br/Views/Operacao/#/Fila/L2", icone : "fas fa-door-open"},
                {id: 2, titulo : "Pre extração", link : "https://www.licitasys.com.br/Views/Operacao/#/Fila/PX", icone : "fas fa-folder-open"},
                {id: 3, titulo : "Extração", link : "https://www.licitasys.com.br/Views/Operacao/#/Fila/LA", icone : "fas fa-paste"},
                {id: 4, titulo : "Associação", link : "https://www.licitasys.com.br/Views/Operacao/#/Fila/LA", icone : "fas fa-project-diagram"},
                {id: 5, titulo : "Resultado", link : "https://www.licitasys.com.br/Views/Operacao/#/ResultadosOperacao", icone : "fas fa-gavel"}
                // ,{id: 6, titulo : "Gerenciamento robo", link : "http://central.sysevolution.com.br/#/Gerenciamento/senhauser", icone : "fas fa-robot"}

            ]
        }
    },
    methods : {
        openUrl(url){
             window.open(url);
        }
    }
}
</script>