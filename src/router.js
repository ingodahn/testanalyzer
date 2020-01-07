import Vue from "vue";
import Router from "vue-router";
import Selector from "./components/Selector.vue";
const IMathAS = () => import("./components/IMathAS/TestReader.vue");
const Ilias = () => import("./components/Ilias/TestReader.vue");
const Olat = () => import("./components/Olat/TestReader.vue");
const Opal = () => import("./components/Opal/TestReader.vue");

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/imathas",
      name: "imathas",
      component: IMathAS
    },
    {
      path: "/ilias",
      name: "ilias",
      component: Ilias
    },
    {
      path: "/olat",
      name: "olat",
      component: Olat
    },
    {
      path: "/opal",
      name: "opal",
      component: Opal
    },
    {
      path: "*",
      name: "select",
      component: Selector
    }
  ]
});
