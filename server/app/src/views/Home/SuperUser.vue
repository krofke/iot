<template>
    <div class="row q-pa-md">
          <q-table
              :data="historicoData"
              class="col-6"
              :columns="historicoDataCols"
              id="historico-table"
              row-key="id"
              dense
              title="Eventos de login como suporte"
              virtual-scroll
              :pagination.sync="pagination"
              :rows-per-page-options="[0]"
          />
    </div>
</template>

<script>
import moment from 'moment'
export default {
    data(){
        return {
            historicoData : [],
            historicoDataCols : [
                { name: 'usuario', align: 'left', label: 'Usuario', field: 'usuario', sortable: true },
                { name: 'dominio', align: 'left', label: 'Dominio', field: 'dominio', sortable: true },
                { name: 'event_date', align: 'left', label: 'Data', field: 'event_date',  format: val => moment(val).format("DD/MM/YYYY HH:mm Z") }
            ],
            pagination : {rowsPerPage: 0 },
            
        }
    },
    mounted(){
        this.loadData();
    },
    methods : {
        loadData(){
            this.$http.get('priv/historico/historico-impersonate-licita' ).then(resonse =>{
                this.historicoData = resonse.body;
            })
        }
    }
}
</script>

<style lang="less">
#historico-table{
  cursor: pointer;
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAYAAADgzO9IAAAABHNCSVQICAgIfAhkiAAAABVJREFUCJljYGBgEGaAAHQaN6C1DgA7XgCs3odsLgAAAABJRU5ErkJggg==);
  background-color: #fefefe;
  .q-table__middle {
     max-height: 300px;
     height:  300px;

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
  .produtos-data-cols-text-overflow{
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>