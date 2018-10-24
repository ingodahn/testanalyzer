<template>
  <div id="app">
  <Test></Test>
  </div>
</template>

<script>
import Test from './components/Test.vue'
// import Chart from "chart.js";
// Object.defineProperty(Vue.prototype, '$Chart', { value: Chart });

export default {
  name: 'app',
  components: {
    Test
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}

.warn_1 {
  color: red
}
</style>
