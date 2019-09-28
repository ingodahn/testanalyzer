<template>
  <div id="maxScores">
    <h3>Maximal erreichbare Punkte</h3>
    <p>Ihre Datei enthielt keine Information über die maximalen Punktzahlen, die bei den einzelnen Aufgaben erreicht werden können.</p>
    <p
      v-if="TotalScore != CalcMaxScore"
    >Insgesamt können {{CalcMaxScore}} Punkte erreicht werden, die Summe der ermittelten Punktzahlen der einzelnen Aufgaben ergibt {{TotalScore}}.</p>
    <p>Bitte prüfen Sie, ob die maximal erreichbaren Punkte für alle Aufgaben richtig ermittelt wurden und korrigieren Sie ggf. die Werte.</p>
    <table id="maxScoreList">
      <tr>
        <th>Frage</th>
        <th class="scoreCol">Maximale Punktzahl</th>
      </tr>
      <tr v-for="(question, index) in Questions" :key="index">
        <td>{{question.name}}</td>
        <td class="scoreCol">
          <input type="number" min="0" v-model="question.maxScore" />
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  name: "EditMaxScores",
  data() {
    return {};
  },
  props: ["Questions", "CalcMaxScore", "TotalScore"]
};
</script>

<style scoped>
table {
  margin-left: auto;
  margin-right: auto;
}
.scoreCol {
  text-align: center;
}
th,
td {
  border-bottom: 1px solid #ddd;
}
input[type="number"] {
  width: 50px;
}
</style>
