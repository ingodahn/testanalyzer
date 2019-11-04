<template>
  <div id="questionStatistics">
    <h2>Fragen-Statistik</h2>
    <div style="text-align: center;">
      <div
        class="chart-container"
        style="width:50%;display: inline-block;"
        v-if="Questions.length > 0"
      >
        <h3>
          <span v-if="curGroup > 1">
            <input type="button" class="player" @click="curGroup=0" value="|<" />
          </span>
          <span v-if="curGroup > 0">
            <input type="button" class="player" @click="curGroup--" value="<" />
          </span>
          <span>Fragen {{curGroupStart+1}} - {{curGroupEnd}}</span>
          <span v-if="curGroup < ChartGroups.length-1">
            <input type="button" class="player" @click="curGroup++" value=">" />
          </span>
          <span v-if="curGroup < ChartGroups.length-2">
            <input type="button" class="player" @click="curGroup=ChartGroups.length-1" value=">|" />
          </span>
        </h3>
        <LineChart :chartData="ScoreChart(curGroupStart,curGroupEnd)"></LineChart>
      </div>
    </div>
    <div v-if="Questions.length > 0" style="margin-top: 25px;">
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
      <p>Eine angepasste Punkteverteilung wäre z.B.:</p>

      <ul>
        <li v-for="item in ScoreAdjust" :key="item">{{ item }}</li>
      </ul>

      <p>Es kann aber gute Gründe geben, von dieser Punkteverteilung abzuweichen, z.B. um die Studierenden zur Beschäftigung mit einzelnen Fragen besonders zu motivieren.</p>
    </div>
  </div>
</template>

<script>
import LineChart from "./Graphics/LineChart.vue";
export default {
  name: "questionStatistics",
  components: {
    LineChart
  },
  props: ["Questions", "Mode"],
  data() {
    return {
      curGroup: 0,
      multiLineHint:
        "Studierende haben Fragen mehrfach bearbeitet. Die <span style='color:red; font-weight:bold'>rote Kurve </span>zeigt, wieviele Punkte die Studierenden dabei maximal erreicht haben. Dies ist ein Hinweis auf den erreichten Leistungsstand (sofern die Aufgabe nicht durch mehrfaches Raten gelöst werden kann). Die <span style='color:blue; font-weight:bold'>blaue Kurve</span> zeigt die von den Studierenden im Mittel aller Versuche erreichte Punktzahl. Die Differenz zwischen der blauen und der roten Kurve ist ein Indiz für den Lernerfolg während der Laufzeit des Tests."
    };
  },
  methods: {
    ScoreChart: function(start, end) {
      var chart = {
        labels: [],
        datasets: []
      };
      if (this.Questions.length == 0) {
        return {
          data: [chart]
        };
      }

      chart.labels = this.QNames.slice(start, end);
      var maxData = {
        label: "Maximale Punktzahl",
        data: this.Questions.slice(start, end).map(x => x.getMaxScore()),
        borderColor: "green"
      };
      chart.datasets[0] = maxData;
      var avgData = {
        label: "Mittlere Punktzahl",
        data: this.QAvgs.slice(start, end),
        borderColor: "blue"
      };
      chart.datasets[1] = avgData;
      if (this.Mode.multiLine || this.Mode.multiQuestion) {
        let maxStudentData = {
          label: "Mittlere maximal erreichte Punktzahl",
          data: this.QMax.slice(start, end),
          borderColor: "red"
        };
        chart.datasets[2] = maxStudentData;
      }
      return chart;
    },
    ResetCurGroup: function() {
      this.curGroup = 0;
    }
  },
  computed: {
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
      for (var qi = 0; qi < this.Questions.length; qi++) {
        var si = 5;
        if (this.QAvgs[qi] > 0) {
          si = Math.round(
            this.Questions[qi].getMaxScore() * (5 / this.QAvgs[qi])
          );
        }
        sMaxAdj[qi] = this.QNames[qi] + ": " + si + " Punkte";
      }
      return sMaxAdj;
    },
    ChartGroups: function() {
      var ar1 = [];
      var n = 20;
      var start = 0;
      var ln = this.Questions.length;
      do {
        if (start + 2 * n <= ln) {
          ar1.push([start, start + n]);
          start = start + n;
        } else if (start + (3 * n) / 2 >= ln) {
          if (start + n <= ln) {
            ar1.push([start, start + n]);
            if (start + n < ln) ar1.push([start + n, ln]);
          } else {
            ar1.push([start, ln]);
          }
          start = ln;
        } else {
          ar1.push([start, start + n / 2]);
          ar1.push([start + n / 2, ln]);
          start = ln;
        }
      } while (start < ln);
      return ar1;
    },
    curGroupStart: function() {
      if (this.curGroup >= this.ChartGroups.length) this.ResetCurGroup();
      return this.ChartGroups.length ? this.ChartGroups[this.curGroup][0] : 0;
    },
    curGroupEnd: function() {
      if (this.curGroup >= this.ChartGroups.length) this.ResetCurGroup();
      return this.ChartGroups.length ? this.ChartGroups[this.curGroup][1] : 0;
    }
  }
};
</script>

<style>
#line-chart {
  border: 1px solid hsl(198, 65%, 40%);
  border-radius: 10px;
  box-shadow: -10px 19px 15px silver;
}
.player {
  border: 1px solid #ccc;
  display: inline-block;
  padding: 6px 12px;
  margin: 3px;
  cursor: pointer;
  background-color: hsl(198, 65%, 40%);
  color: white;
  border-radius: 10px;
  font-weight: bold;
}
</style>
