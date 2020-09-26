<template>
  <div style="text-align: center;">
      <div
        class="chart-container"
        style="display: inline-block; max-width: 50%;"
      >
        <h3>
          <v-hover v-if="curGroup > 1" v-slot:default="{ hover }" open-delay="200" class="ma-1">
              <v-btn icon color="primary"
              v-on:click="curGroup=0"
              :elevation="hover ? 16 : 2"
              >
                <v-icon>mdi-skip-backward</v-icon>
              </v-btn>
            </v-hover>
            <v-hover v-if="curGroup > 0" v-slot:default="{ hover }" open-delay="200" class="ma-1">
              <v-btn icon color="primary"
              v-on:click="curGroup--"
              :elevation="hover ? 16 : 2"
              >
                <v-icon>mdi-step-backward</v-icon>
              </v-btn>
            </v-hover>
            <span>Fragen {{curGroupStart+1}} - {{curGroupEnd}}</span>
            <v-hover v-if="curGroup < ChartGroups.length-1" v-slot:default="{ hover }" open-delay="200" class="ma-1">
              <v-btn icon color="primary"
              v-on:click="curGroup++"
              :elevation="hover ? 16 : 2"
              >
                <v-icon>mdi-step-forward</v-icon>
              </v-btn>
            </v-hover>
            <v-hover v-if="curGroup < ChartGroups.length-2" v-slot:default="{ hover }" open-delay="200" class="ma-1">
              <v-btn icon color="primary"
              v-on:click="curGroup=ChartGroups.length-1"
              :elevation="hover ? 16 : 2"
              >
                <v-icon>mdi-skip-forward</v-icon>
              </v-btn>
            </v-hover>
        </h3>
        <LineChart :chartData="ThisChart(curGroupStart,curGroupEnd)"></LineChart>
      </div>
    </div>
</template>

<script>
import LineChart from "./Graphics/LineChart.vue";
export default {
  components: {
    LineChart,
  },
  props: ["Chart"],
  data() {
    return {
      curGroup: 0,
    }
  },
   methods: {
    ThisChart: function(start, end) {
      var chart = {
        labels: [],
        datasets: []
      };
      if (this.Chart.labels.length == 0) {
        return {
          data: [chart]
        };
      }

      chart.labels = this.Chart.labels.slice(start, end).map(t =>
        t.length < 40 ? t : t.substring(0, 40) + "..."
      );
      this.Chart.datasets.forEach(d => {
        var chartData = {
        label: d.label,
        data: d.data.slice(start,end),
        borderColor: d.borderColor
      };
      chart.datasets.push(chartData);
      })

      return chart;
    },
    ResetCurGroup: function() {
      this.curGroup = 0;
    }
  },
  computed: {
    // Chart-Funktionen
    ShowChart: function() {
      return this.Chart.labels.length;
    },
    ChartGroups: function() {
      var ar1 = [];
      var n = 20;
      var start = 0;
      var ln = this.Chart.labels.length;
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
}
</script>

<style>
#line-chart {
  border: 1px solid hsl(198, 65%, 40%);
  border-radius: 10px;
  box-shadow: -10px 19px 15px silver;
  margin-bottom: 2em;
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