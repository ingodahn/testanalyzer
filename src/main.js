import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import Print from "vue-print-nb";
import vuetify from './plugins/vuetify';
Vue.use(Print);

Vue.config.productionTip = false;
/*
Vue.config.errorHandler = function(err, vm, info) {
  // err: error trace
  // vm: component in which error occured
  // info: Vue specific error information such as lifecycle hooks, events etc.

  // TODO: Perform any custom logic or log to server
  console.log(`Error: ${err.toString()}\nInfo: ${info}`);
  console.log(vm);
  alert("Interner Fehler");
};
*/

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount("#app");
