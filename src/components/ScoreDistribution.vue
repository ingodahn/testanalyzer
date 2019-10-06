<template>
  <div id="diagram" :class="warnLevel" v-if="Layout == 'all' || warnLevel == 'warn_1'">
    <h2>Punkteverteilung</h2>
    <div v-if="ScoredSorted.length > 0">
      <div style="text-align: center;" v-if="Layout == 'all'">
        <div class="chart-container" style="width:25%; display: inline-block;">
          <BarChart :chartData="studentScores"></BarChart>
        </div>
      </div>

      <p v-if="hint">
        <b>Hinweis:</b>
        {{ hint }}
      </p>
      <div v-if="hintDetails != ''">
        <p>{{ hintDetails }}</p>

        <ul>
          <li>Gibt es Verständnisprobleme?</li>
          <li>Brauchen die Studierenden mehr Zeit?</li>
          <li>Fehlt ihnen die Motivation (insbesondere, wenn sie die Frage gar nicht erst versucht haben)?</li>
        </ul>
      </div>
      <Race
        id="trackComponent"
        :ScoredSorted="ScoredSorted"
        :TotalScore="TotalScore"
        :Questions="Questions"
        v-if="Layout == 'all'"
      ></Race>
    </div>
  </div>
</template>

<script>
import BarChart from "./Graphics/BarChart.vue";
import Race from "./Race.vue";

export default {
  name: "Diagram",
  data() {
    return {
      diagrams: {
        scoreDistribution: {
          title: "Punkteverteilung"
        }
      },
      bucketsNr: 5
    };
  },
  props: [
    "ScoredSorted",
    "TotalScore",
    "Questions",
    "ComponentStatus",
    "Layout"
  ],
  components: {
    BarChart,
    Race
  },
  computed: {
    scoreClasses: function() {
      // Return list of numbers of students in n groups by score
      const n = this.bucketsNr;
      var scoreClasses = Array(n).fill(0);
      var studentsNr = this.ScoredSorted.length;
      const maxScore = this.TotalScore;
      var i = 0;
      var lim = maxScore / n;

      for (var s = 0; s < studentsNr; s++) {
        var score = this.ScoredSorted[s].totalScore;
        if (score <= lim) {
          scoreClasses[i]++;
        } else {
          while (score > lim) {
            i++;
            lim = lim + maxScore / n;
          }
          scoreClasses[i]++;
        }
      }
      return scoreClasses;
    },
    chartLabels: function() {
      const n = this.bucketsNr;
      const maxScore = this.TotalScore;
      var chartLabels = [];
      for (var j = 0; j < n; j++) {
        chartLabels[j] =
          ((maxScore * j) / n).toString() +
          " - " +
          ((maxScore * (j + 1)) / n).toString();
      }
      return chartLabels;
    },
    studentScores: function() {
      if (this.ScoredSorted.length == 0) {
        return {};
      }
      var chart = {
        labels: [],
        datasets: []
      };
      const n = this.bucketsNr;
      var backgroundColor = Array(n).fill("hsl(198, 65%, 40%)");

      chart.labels = this.chartLabels;
      var chartData = {
        label: "Punkteverteilung",
        data: this.scoreClasses,
        backgroundColor: backgroundColor
      };
      chart.datasets[0] = chartData;
      return chart;
    },
    warnLevel: function() {
      var s = this.ComponentStatus;
      switch (this.gaps.length) {
        case 0: {
          s["scoreDistribution"] = "warn_0";
          return "warn_0";
        }
        default: {
          s["scoreDistribution"] = "warn_1";
          return "warn_1";
        }
      }
    },
    gaps: function() {
      const scores = this.scoreClasses;
      if (this.ScoredSorted.length == 0) {
        return [];
      }
      const n = this.bucketsNr;
      var gaps = [];
      var i = 0;
      while (i < n - 1) {
        if (scores[i + 1] < scores[i] * 0.3) {
          gaps.push(i);
        }
        i++;
      }
      return gaps;
    },
    hintDetails: function() {
      // No gaps - no hints...
      if (this.gaps.length == 0) {
        return "";
      }
      // ...else take first gap
      var gap = this.gaps[0];
      // Calculate number of students before gap
      var snr = sum(this.scoreClasses, 0, gap);
      // We selct maximum 10 students before the gap...
      const weakStudents = this.ScoredSorted.slice(Math.max(0, snr - 10), snr);
      //... and maximum 10 students after the gap
      const goodStudents = this.ScoredSorted.slice(
        snr,
        Math.min(snr + 10, this.ScoredSorted.length)
      );
      // Build array of scores of weak students...
      const weakStudentsScores = weakStudents.map(x => x.scores);
      // ...and of good students
      const goodStudentsScores = goodStudents.map(x => x.scores);
      var lgood = goodStudents.length;
      const lweak = weakStudents.length;

      var weakStudentsQ = {};
      for (var q = 0; q < this.Questions.length; q++) {
        weakStudentsQ[this.Questions[q].name] = 0;
      }
      // How scored the weak students per question? weakStudentsQ sums up scores of weak students per question
      for (var i = 0; i < lweak; i++) {
        for (var name in weakStudentsScores[i]) {
          weakStudentsQ[name] += weakStudentsScores[i][name];
        }
      }
      // How scored the good students per question? goodStudentsQ sums up scores of good students per question
      // We start with the maxScores if the gap is the top class
      var goodStudentsQ = {};
      if (lgood == 0) {
        for (var qi = 0; qi < this.Questions.length; qi++) {
          var q1 = this.Questions[qi];
          goodStudentsQ[q1.name] = q1.getMaxScore();
        }
        lgood = 1;
      } else {
        // Otherwise we initialize goodStudentsQ with 0 for all questions
        for (qi = 0; qi < this.Questions.length; qi++) {
          goodStudentsQ[this.Questions[qi].name] = 0;
        }
      }

      // Now we sum up the cores of the good students
      for (var i1 = 0; i1 < lgood; i1++) {
        for (var name1 in goodStudentsScores[i1]) {
          goodStudentsQ[name1] += goodStudentsScores[i1][name1];
        }
      }

      // Calculate the diference in average score between good and weak students
      var diffScores = {};
      for (var name2 in goodStudentsQ) {
        diffScores[name2] =
          goodStudentsQ[name2] / lgood - weakStudentsQ[name2] / lweak;
      }

      var maxDiff = 0;
      var maxDiffName = "";
      for (var name3 in diffScores) {
        if (diffScores[name3] > maxDiff) {
          maxDiff = diffScores[name3];
          maxDiffName = name3;
        }
      }

      var maxDiffMaxScore = 0;
      for (var q2 = 0; q2 < this.Questions.length; q2++) {
        if (this.Questions[q2].name == maxDiffName) {
          maxDiffMaxScore = this.Questions[q2].getMaxScore();
          break;
        }
      }
      var wsi = 0;
      for (var wi = lweak - 1; wi >= 0; wi--) {
        if (weakStudents[wi].scores[maxDiffName] < maxDiffMaxScore) {
          wsi = wi;
          break;
        }
      }
      var ws = weakStudents[wsi].name;
      return (
        "Sehen Sie sich insbesondere die Antworten der Studierenden mit " +
        this.chartLabels[gap] +
        " Punkten auf die Frage " +
        maxDiffName +
        " an, z.B. von " +
        ws +
        ", bzw. fragen Sie sie, warum sie diese Frage nicht bearbeitet haben."
      );
    },
    hint: function() {
      if (this.gaps.length == 0) {
        return "";
      } else {
        return (
          "Nur wenige Studierende haben " +
          this.chartLabels[this.gaps[0] + 1] +
          " Punkte."
        );
      }
    }
  }
};

function sum(array, start, end) {
  if (array.length == 0) {
    return 0;
  }
  start = Math.max(start, 0);
  end = Math.min(end, array.length - 1);
  var tmpArray = array.slice(start, end + 1);
  return tmpArray.reduce((a, b) => a + b, 0);
}
</script>

<style>
#bar-chart {
  border: 1px solid hsl(198, 65%, 40%);
  border-radius: 10px;
  box-shadow: -10px 19px 15px silver;
}
</style>
