<template>
  <div id="less" :class="warnLevel" v-if="Layout == 'all' || warnLevel == 'warn_1'">
    <h2>Ungenutzte Fragen?</h2>
    <div style="text-align: center;" v-if="Layout == 'all'">
      <ChartPlayer :Chart="attemptChart" v-if="Questions.length > 0"></ChartPlayer>
    </div>
    <div v-if="Questions.length != 0">
      <p>{{ msg }}</p>
      <ul>
        <li v-for="item in attemptsNrs" :key="item">{{ qName(item) }}, z.B. nicht versucht von <ListPlayer :ListData="unattemptedList(item)" PlayerType="selector"></ListPlayer></li>
      </ul>
      <b>Hinweis: </b>
      <div v-html="hint"></div>
    </div>
  </div>
</template>

<script>
import ChartPlayer from "./ChartPlayer.vue";
import ListPlayer from "./ListPlayer.vue";
export default {
  name: "Attempts",
  props: ["Questions", "Mode", "ComponentStatus", "Layout"],
  data() {
    return {
      curGroup: 0,
    };
  },
  components: {
    ChartPlayer,
    ListPlayer
  },
  methods: {
    unattemptedList: function(i) {
      // Find names of students that have seen but not attempted question i
      let ss=this.Questions[i].studentScores;
      return Object.keys(ss).filter(sName => (ss[sName].presented && ! ss[sName].attempted))
      //return ["a","b","c","d"];
    },
    qName: function(i) {
      return this.Questions[i].name;
    }
  },

  computed: {
    attemptChart: function() {
      let chart = {
        labels: [],
        datasets: []
      };
      if (this.Questions.length == 0) {
        return chart;
      }
      chart.labels=this.QNames;
      chart.datasets[0] = {
        label: "% der Studierenden, die die Frage bearbeitet haben",
        data: this.Questions.map(
          x => (x.attempted / x.presented) * 100
        ),
        borderColor: "blue"
      };
      return chart;
    },
    QNames: function() {
      return this.Questions.map(x => x.name);
    },
    attemptsNrs: function() {
      var attemptsNrs = [];
      var threshold = 0.2;

      for (var i = 0; i < this.Questions.length; i++) {
        var q = this.Questions[i];

        if (q.attempted / q.presented < threshold) {
          attemptsNrs.push(i);
        }
      }
      return attemptsNrs;
    },
    attempts: function() {
      return this.attemptsNrs.map(qi => this.Questions[qi].name)
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
          return "Alle Aufgaben wurden von mindestens " + tp;
        }
        case 1: {
          return "Diese Aufgabe wurde von weniger als " + tp;
        }
        default: {
          return (
            "Diese Aufgaben wurden von weniger als " +
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
          s["attempts"] = "warn_1";
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
          "<p>Versuchen Sie, durch Gespräche mit diesen Studierenden, herauszubekommen, warum sie diese " +
          frage +
          " nicht versucht haben. Sprechen Sie insbesondere mit den zuerst genannten Studierenden, denn diese haben insgesamt am Besten abgeschnitten.</p><p>Vielleicht war die Formulierung nicht verständlich? Insbesondere bei den letzten Fragen des Tests könnte es auch daran liegen, dass die Zeit für den Test zu knapp bemessen war. Sie sollten diese " +
          frage +
          " modifizieren, sie durch andere Fragen ersetzen oder weglassen.</p>"
        );
      } else {
        return "<p>So sollte es sein. Ihre Aufgaben sind verständlich.</p>";
      }
    },
  }
};
</script>
