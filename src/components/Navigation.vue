<template>
  <div>
    <ul>
      <div v-if="QuestionsNr > 0">
        <li v-if="Layout == 'all'">
          <a href="#home">Daten</a>
        </li>
        <li v-if="Layout == 'all' || ComponentStatus['scoreDistribution'] == 'warn_1'">
          <a href="#scoreDistribution" :class="warnLevel('scoreDistribution')">Punkteverteilung</a>
        </li>
        <li v-if="Layout == 'all' || ComponentStatus['less'] == 'warn_1'">
          <a href="#less" :class="warnLevel('less')">Wenig Punkte</a>
        </li>
        <li v-if="Layout == 'all' || ComponentStatus['more'] == 'warn_1'">
          <a href="#more" :class="warnLevel('more')">Viele Punkte</a>
        </li>
        <li v-if="Layout == 'all' || ComponentStatus['attempts'] == 'warn_1'">
          <a href="#attempts" :class="warnLevel('attempts')">Ungenutzt</a>
        </li>
        <li v-if="Layout == 'all' || ComponentStatus['best'] == 'warn_1'">
          <a href="#best" :class="warnLevel('best')">Die Besten</a>
        </li>
        <li v-if="Layout == 'all'">
          <a href="#questionStatistics">Fragen-Statistik</a>
        </li>
      </div>
      <div v-else>
        <li class="inactive">Daten</li>
        <li class="inactive">Punkteverteilung</li>
        <li class="inactive">Wenig Punkte</li>
        <li class="inactive">Ungenutzt</li>
        <li class="inactive">Die Besten</li>
        <li class="inactive">Fragen-Statistik</li>
      </div>
    </ul>
  </div>
</template>

<script>
export default {
  name: "Navigation",
  props: ["QuestionsNr", "ComponentStatus", "Layout"],
  methods: {
    warnLevel: function(c) {
      return this.ComponentStatus[c];
    }
  }
};
</script>

<style scoped>
li {
  list-style: none;
}
a {
  display: block;
  padding: 4px 0 4px 10px;
  border-width: 0 0 1px 0;
  border-style: dotted;
  text-decoration: none;
}
.inactive {
  display: block;
  padding: 4px 0 4px 10px;
  border-width: 0 0 1px 0;
  border-style: dotted;
  color: grey;
}
</style>
