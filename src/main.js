import Vue from "vue";
import App from "./App.vue";
import router from "./router";

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

import VueHtmlToPaper from "vue-html-to-paper";

const options = {
  name: "_blank",
  specs: ["fullscreen=yes", "titlebar=yes", "scrollbars=yes"],
  styles: [
    "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css",
    "https://unpkg.com/kidlat-css/css/kidlat.css"
  ]
};

Vue.use(VueHtmlToPaper, options);

// or, using the defaults with no stylesheet

Vue.use(VueHtmlToPaper);

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
