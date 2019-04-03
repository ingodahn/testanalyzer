<template>
  <div id="studentStatistics">
    <div>{{ Testing }}</div>
    <!--
    <div style="text-align: center;">
      <div class="chart-container" v-if="Score.length > 0">
        <div v-for="item in ChartGroups" :key="item[0]">
          <h3>Fragen {{item[0]+1}} - {{item[1]}}</h3>
          <RadarChart :chartData="ScoreChart(item[0],item[1])"></RadarChart>
        </div>
      </div>
    </div>
    -->
  </div>
</template>

<script>
function avg(scores) {
  var avgScore = 0;
  var len = scores.length;
  for (var i = 0; i < len; i++) {
    avgScore += scores[i];
  }
  avgScore = avgScore / len;
  return avgScore;
}

import RadarChart from "./Graphics/RadarChart.vue";
export default {
  name: "studentStatistics",
  components: {
    RadarChart
  },
  props: ["ScoredSorted", "Questions"],
  data() {
    return {
      studentData: {}
    };
  },
  methods: {
    CacheStudentData: function(name) {
      //eslint-disable-next-line
      console.log("Caching data for " + name);
    },
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
    Testing: function() {
      //eslint-disable-next-line
      console.log(this.ScoredSorted[1]["scores"]["Question 1"]);
      return "Here comes StudentStatistics";
    },
    QNames: function() {
      return this.Score.map(x => x["name"]);
    },
    QAvgs: function() {
      return this.Score.map(x => avg(x.scores).toFixed(2));
    },
    ScoreAdjust: function() {
      var sMaxAdj = [];
      for (var qi = 0; qi < this.Score.length; qi++) {
        var si = Math.round(this.Score[qi].maxScore * (5 / this.QAvgs[qi]));
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
            ar1.push([start + n, ln]);
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
    }
  }
};
</script>

<style scoped>
chart-container {
  width: 50%;
  display: inline-block;
}

#radar-chart {
  border: 1px solid hsl(198, 65%, 40%);
  border-radius: 10px;
  box-shadow: -10px 19px 15px silver;
}
</style>
