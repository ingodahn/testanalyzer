<template>
  <div id="questionStatistics">
    <h2>Fragen-Statistik</h2>
    <div v-if="Questions.length > 0" style="margin-top: 25px;">
      <ChartPlayer :Chart="statChart"></ChartPlayer>
      <b>Hinweis:</b>
      <div v-if="Mode.multiLine || Mode.multiQuestion">
        <span v-html="multiLineHint"></span>
        <img
          src="../../public/info.png"
          width="20"
          title="Genauer: Blau: Für jede(n) Studierende(n) wird zunächst die bei allen Versuchen im Mittel erreichte Punktzahl bestimmt. Rot: Es wird für jede(n) Studierende(n) die maximal erreichte Punktzahl ermittelt. Diese Werte werden dann über alle Studierenden gemittelt. Bei freiwilligen Tests zählen nur die Versuche, bei denen eine Antwort eingegeben wurde."
        />
      </div>

      <div>
        Wenn die maximal mögliche Punktzahl der Schwierigkeit der Aufgabe entsprechen soll, so vergleichen Sie die blaue mit der grünen Kurve.
        Bei schwierigen Fragen ist der mittlere Punktwert niedrig, verglichen mit dem Maximalpunktwert.
        Derartige Fragen kann man mit einem entsprechend höheren Maximalpunktwert belohnen.
      </div>
      <p>
        Eine angepasste Punkteverteilung wäre z.B.:
        <img
          src="../../public/info.png"
          width="20"
          title="Zur Ermittlung der unten vorgeschlagenen Punktzahlen wurde ein Standardwert von 5 Punkten mit einem Schwierigkeitsfaktor multipliziert. Dabei wird der Schwierigkeitsfaktor als Quotient aus der bisherigen Maximalpunktzahl und der im Mittel erreichten Punktzahl der jeweiligen Frage berechnet."
        />
      </p>

      <ul>
        <li v-for="item in ScoreAdjust" :key="item">{{ item }}</li>
      </ul>

      <p>Es kann aber gute Gründe geben, von dieser Punkteverteilung abzuweichen, z.B. um die Studierenden zur Beschäftigung mit einzelnen Fragen besonders zu motivieren.</p>
    </div>
  </div>
</template>

<script>
import ChartPlayer from "./ChartPlayer.vue";
export default {
  name: "questionStatistics",
  components: {
    ChartPlayer
  },
  props: ["Questions", "Mode"],
  data() {
    return {
      multiLineHint:
        "Studierende haben Fragen mehrfach bearbeitet. Die <span style='color:red; font-weight:bold'>rote Kurve </span>zeigt, wieviele Punkte die Studierenden dabei maximal erreicht haben. Dies ist ein Hinweis auf den erreichten Leistungsstand (sofern die Aufgabe nicht durch mehrfaches Raten gelöst werden kann). Die <span style='color:blue; font-weight:bold'>blaue Kurve</span> zeigt die von den Studierenden im Mittel aller Versuche erreichte Punktzahl. Die Differenz zwischen der blauen und der roten Kurve ist ein Indiz für den Lernerfolg während der Laufzeit des Tests."
    };
  },

  computed: {
    statChart: function() {
      let chart = {
        labels: [],
        datasets: []
      };
      if (this.Questions.length == 0) {
        return chart;
      }
      chart.labels=this.QNames;

      chart.datasets[0]= {
        label: "Maximale Punktzahl",
        data: this.Questions.map(x => x.getMaxScore()),
        borderColor: "green"
      }

      chart.datasets[1] = {
        label: "Mittlere Punktzahl",
        data: this.QAvgs,
        borderColor: "blue"
      };

      if (this.Mode.multiLine || this.Mode.multiQuestion) {
        chart.datasets[2] = {
          label: "Mittlere maximal erreichte Punktzahl",
          data: this.QMax,
          borderColor: "red"
        };
      }
      return chart;
    },
    QNames: function() {
      return this.Questions.map(x => x["name"]);
    },
    QAvgs: function() {
      let avgData = [];
      this.Questions.forEach(q => {
        avgData.push(q.getStudentScoreAvg(this.Mode.questionScore));
      });
      return avgData;
    },
    QMax: function() {
      let maxData = [];
      this.Questions.forEach(q => {
        maxData.push(q.getMaxStudentScoreAvg(this.Mode.questionScore));
      });
      return maxData;
    },
    ScoreAdjust: function() {
      var sMaxAdj = [];
      let sMax = Math.round(6 / Math.min(...this.QAvgs.filter(a => a > 0)));
      for (var qi = 0; qi < this.Questions.length; qi++) {
        var si = 5;
        if (this.QAvgs[qi] > 0) {
          si = Math.round(
            this.Questions[qi].getMaxScore() * (5 / this.QAvgs[qi])
          );
        } else si = sMax; // no student knows the answer
        sMaxAdj[qi] = this.QNames[qi] + ": " + si + " Punkte";
      }
      return sMaxAdj;
    },
  }
};
</script>
