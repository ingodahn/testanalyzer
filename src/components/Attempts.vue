<template>
  <div id="less" :class="warnLevel" v-if="Layout == 'all' || warnLevel == 'warn_1'">
    <h2>Ungenutzte Fragen?</h2>
    <div style="text-align: center;" v-if="Layout == 'all'">
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
        <LineChart :chartData="AttemptChart(curGroupStart,curGroupEnd)"></LineChart>
      </div>
    </div>
    <p>{{ msg }}</p>
    <div v-if="Questions.length != 0">
      <b>Hinweis:</b>
      {{ hint }}
    </div>
  </div>
</template>

<script>
import LineChart from "./Graphics/LineChart.vue";
export default {
  name: "Attempts",
  props: ["Questions", "ComponentStatus", "Layout"],
  data() {
    return {
      curGroup: 0
    };
  },
  components: {
    LineChart
  },
  methods: {
    AttemptChart: function(start, end) {
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
      var attemptData = {
        label: "% der Studierenden, die die Frage bearbeitet haben",
        data: this.Questions.slice(start, end).map(x =>
          Math.round((x.attempts * 100) / x.answers.length)
        ),
        borderColor: "blue"
      };

      chart.datasets[0] = attemptData;
      return chart;
    }
  },
  computed: {
    attempts: function() {
      var attempts = [];
      var threshold = 0.2;

      for (var i = 0; i < this.Questions.length; i++) {
        var q = this.Questions[i];
        var sn = q.answers.filter(j => j != "---").length;
        var ua = q.answers.filter(j => j !== "" && j != "---").length;
        if (ua / sn < threshold) {
          attempts.push(q.name);
        }
      }
      return attempts;
    },
    msg: function() {
      var msg = "";
      var threshold = 0.2;
      var tp = threshold * 100 + "% der Studierenden bearbeitet.";
      if (this.Questions.length == 0) {
        return msg;
      }

      switch (this.attempts.length) {
        case 0: {
          return "Alle Fragen wurden von mindestens " + tp;
        }
        case 1: {
          return this.attempts[0] + " wurde von weniger als " + tp;
        }
        default: {
          return (
            "Die Aufgaben " +
            this.attempts.join() +
            " wurden von weniger als " +
            tp
          );
        }
      }
    },
    warnLevel: function() {
      var s = this.ComponentStatus;
      switch (this.attempts.length) {
        case 0: {
          s["attempts"] = "warn_0";
          return "warn_0";
        }
        default: {
          s["attempts"] = "warn_0";
          return "warn_1";
        }
      }
    },
    hint: function() {
      if (this.warnLevel == "warn_1") {
        var frage = "Frage";
        if (this.attempts.length > 1) {
          frage = "Fragen";
        }
        return (
          "Versuchen Sie, durch Gespräche mit den Studierenden, herauszubekommen, warum sie diese " +
          frage +
          "Frage nicht versucht haben. Vielleicht war die Formulierung der Frage nicht verständlich? Falls dies die letzte Frage des Tests war könnte es auch daran liegen, dass die Zeit für den Test zu knapp bemessen war. Sie sollten diese " +
          frage +
          " modifizieren, sie durch andere Fragen ersetzen oder weglassen."
        );
      } else {
        return "So sollte es sein. Ihre Aufgaben sind verständlich";
      }
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
      return this.ChartGroups.length ? this.ChartGroups[this.curGroup][0] : 0;
    },
    curGroupEnd: function() {
      return this.ChartGroups.length ? this.ChartGroups[this.curGroup][1] : 0;
    },
    QNames: function() {
      return this.Questions.map(x => x["name"]);
    }
  }
};
</script>
