import Vue from 'vue';
import App from './App.vue';
import router from './router';
import VueResource from 'vue-resource';
import './quasar';

Vue.config.productionTip = false;
Vue.use(VueResource);

Vue.http.options.root = '/sso/';
Vue.http.options.xhr = {withCredentials: true};
window.ssoUrl = 'https://www.licitasys.com.br/';

////Importante ////Importante quando for alterar o widgetJs api/static/ rodar um npm run build com a variave dev como true. e apontar o script para o localhost no arquivo public/index.html
let dev = false;

if (process.env.NODE_ENV !== 'production' || dev) {
  Vue.http.options.root = 'http://localhost:3000/sso/';
  window.ssoUrl = 'http://localhost:3000/';
}
Vue.http.interceptors.push((request, next) => {
  request.credentials = true;
  request.headers.set('Authorization', `Bearer ${localStorage.getItem("sys-sso-token")}`);
  next();
});

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');







