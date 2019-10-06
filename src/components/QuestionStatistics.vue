<template>
  <div id="questionStatistics">
    <h2>Fragen-Statistik</h2>
    <div style="text-align: center;">
      <div class="chart-container" style="width:50%;display: inline-block;" v-if="Score.length > 0">
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
    <div v-if="Score.length > 0" style="margin-top: 25px;">
      <p>
        <b>Hinweis:</b>Wenn die maximal mögliche Punktzahl der Schwierigkeit der Aufgabe entsprechen soll, so vergleichen Sie die beiden Kurven.
        Bei schwierigen Fragen ist der mittlere Punktwert niedrig, verglichen mit dem Maximalpunktwert.
        Derartige Fragen kann man mit einem entsprechend höheren Maximalpunktwert belohnen.
      </p>
      <p>Eine angepasste Punkteverteilung wäre z.B.:</p>

      <ul>
        <li v-for="item in ScoreAdjust" :key="item">{{ item }}</li>
      </ul>

      <p>Es kann aber gute Gründe geben, von dieser Punkteverteilung abzuweichen, z.B. um die Studierenden zur Beschäftigung mit einzelnen Fragen besonders zu motivieren.</p>
    </div>
  </div>
</template>

<script>
function avg(scoresItem) {
  var avgScore = 0;
  var len = scoresItem.scores.length;
  for (var i = 0; i < len; i++) {
    avgScore += scoresItem.scores[i];
  }
  avgScore = avgScore / scoresItem.total;
  return avgScore;
}

import LineChart from "./Graphics/LineChart.vue";
export default {
  name: "questionStatistics",
  components: {
    LineChart
  },
  props: ["Score"],
  data() {
    return {
      curGroup: 0
    };
  },
  methods: {
    ScoreChart: function(start, end) {
      var chart = {
        labels: [],
        datasets: []
      };
      if (this.Score.length == 0) {
        return {
          data: [chart]
        };
      }

      chart.labels = this.QNames.slice(start, end);
      var maxData = {
        label: "Maximale Punktzahl",
        data: this.Score.slice(start, end).map(x => x.maxScore),
        borderColor: "green"
      };
      chart.datasets[0] = maxData;
      var avgData = {
        label: "Mittlere Punktzahl",
        data: this.QAvgs.slice(start, end),
        borderColor: "blue"
      };
      chart.datasets[1] = avgData;
      return chart;
    }
  },
  computed: {
    QNames: function() {
      return this.Score.map(x => x["name"]);
    },
    QAvgs: function() {
      return this.Score.map(x => avg(x).toFixed(2));
    },
    ScoreAdjust: function() {
      var sMaxAdj = [];
      for (var qi = 0; qi < this.Score.length; qi++) {
        var si = 0;
        if (this.QAvgs[qi] > 0) {
          si = Math.round(this.Score[qi].maxScore * (5 / this.QAvgs[qi]));
        }
        sMaxAdj[qi] = this.QNames[qi] + ": " + si + " Punkte";
      }
      return sMaxAdj;
    },
    ChartGroups: function() {
      var ar1 = [];
      var n = 20;
      var start = 0;
      var ln = this.Score.length;
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
      return this.ChartGroups.length ? this.ChartGroups[this.curGroup][0] : 0;
    },
    curGroupEnd: function() {
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
