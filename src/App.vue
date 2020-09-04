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
  color: hsl(198, 65%, 40%);
  background-color: hsla(60, 82%, 63%, 0.3);
  padding: 5px;
}
#testType {
  margin: 10px;
}
</style>