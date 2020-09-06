<template>
  <v-app>
    <div id="app">
      <Test></Test>
    </div>
  </v-app>
</template>

<script>
import Test from './components/Test.vue'

export default {
  name: 'app',
  components: {
    Test
  },
  data: () => ({
    //
  }),
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.warn_1 {
  border-style: none solid none solid;
  border-color: #FFC107;
  padding: 1em;
}
#testType {
  margin: 10px;
}
</style>