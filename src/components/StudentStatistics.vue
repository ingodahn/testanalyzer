<template>
  <div id="studentStatistics">
    <div>{{ Testing }}</div>
    <div
      class="questionGroupSelector"
      v-if="Questions.length > 0 && ChartGroups.length > 1"
    >Select from {{ ChartGroups.length }} Groups</div>

    <div style="text-align: center;">
      <div class="chart-container" v-if="Score.length > 0">
        <h3>Fragen {{ChartGroups[curChartGroup][0]+1}} - {{ChartGroups[curChartGroup][1]}}</h3>
        <RadarChart :chartData="ScoreChart()"></RadarChart>
      </div>
    </div>
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
  props: ["ScoredSorted", "Questions", "Score", "CurStudentNr"],
  data() {
    return {
      studentData: {},
      curChartGroup: 0,
      groupSize: 140
    };
  },
  methods: {
    ScoreChart: function() {
      var chart = {
        labels: this.ChartLabels,
        datasets: [this.MaxData, this.AvgData]
      };
      if (this.CurStudentNr > -1) {
        const cs = this.ScoredSorted[this.CurStudentNr];
        //eslint-disable-next-line
        console.log(cs);
        const cScore = cs.scores;
        var sData = {
          label: cs.name,
          data: [],
          borderColor: "red"
        };
        for (var i = 0; i < this.ChartLabels.length; i++) {
          var qn = this.ChartLabels[i];

          var qscore = cScore.hasOwnProperty(qn) ? cScore[qn] : 0;
          sData.data.push(qscore);
        }

        chart.datasets.unshift(sData);
      }

      return chart;
    }
  },
  computed: {
    Testing: function() {
      //eslint-disable-next-line
      console.log(this.ScoredSorted[this.CurStudentNr]);
      return "Here comes StudentStatistics";
    },
    ChartLabels: function() {
      const cg = this.ChartGroups[this.curChartGroup];
      return this.QNames.slice(cg[0], cg[1]);
    },
    MaxData: function() {
      const cg = this.ChartGroups[this.curChartGroup];
      return {
        label: "Maximale Punktzahl",
        data: this.Score.slice(cg[0], cg[1]).map(x => x.maxScore),
        borderColor: "green"
      };
    },
    AvgData: function() {
      const cg = this.ChartGroups[this.curChartGroup];
      return {
        label: "Mittlere Punktzahl",
        data: this.QAvgs.slice(cg[0], cg[1]),
        borderColor: "blue"
      };
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
      var n = this.groupSize;
      var start = 0;
      var ln = this.Questions.length;
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
      //eslint-disable-next-line
      console.log(ar1);
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
