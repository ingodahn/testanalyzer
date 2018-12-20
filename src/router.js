import Vue from 'vue'
import Router from 'vue-router'
import IMathAS from './components/IMathAS/TestReader.vue'
import Selector from './components/Selector.vue'
import Ilias from './components/Ilias/TestReader.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/imathas',
      name: 'imathas',
      component: IMathAS
    },
    {
      path: '/ilias',
      name: 'ilias',
      component: Ilias
    },
    {
      path: '*',
      name: 'select',
      component: Selector
    }
  ]
})