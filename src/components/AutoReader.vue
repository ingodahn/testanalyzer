<template>
  <div>
    <p>{{ Message }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      Message: "AutoReader geladen"
    };
  },
  created: function() {
    if (this.$route.query.system) {
      this.Message = "Lade Test von " + this.$route.query.system;
    } else {
      this.Message = "Kein System angegeben";
    }
  }
};
</script>