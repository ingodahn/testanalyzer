<template>
  <div id="less">
    <h2 :class="warnLevel">Bei welchen Fragen wurden oft wenige Punkte erreicht?</h2>
    <div v-if="Score.length != 0">
      <div :class="warnLevel1">
        <div v-if="questionSuccess.length == 0">
          <p>Es wurden bei allen Aufgaben im Mittel mindestens {{ tp }} erreicht.</p>
        </div>
        <div v-if="questionSuccess.length == 1">
          <p>Bei der Aufgabe</p>
          <ul>
            <li>{{questionSuccess[0]}}</li>
          </ul>
          wurden im Mittel weniger als {{ tp }} erreicht.
        </div>
        <div v-if="questionSuccess.length > 1">
          <p>Bei jeder der Aufgaben</p>
          <ul>
            <li v-for="item in questionSuccess" :key="item">{{ item }}</li>
          </ul>
          <p>wurden im Mittel weniger als {{ tp }} erreicht.</p>
        </div>
        <div v-html="hint"></div>
      </div>
      <div :class="warnLevel2">
        <p>{{ start50 }}</p>
        <ul>
          <li v-for="item in less50" :key="item">{{ item }}</li>
        </ul>
        <p>{{ end50 }}</p>
        <div v-html="hint50"></div>
      </div>
    </div>
  </div>
</template>

<script>
function avg(q) {
  var maxScore = Number(q.maxScore);
  var avgScore = 0;
  var scores = q.scores;
  var len = scores.length;
  for (var i = 0; i < len; i++) {
    avgScore += scores[i];
  }
  avgScore = avgScore / (maxScore * len);
  return avgScore;
}
export default {
  name: "Less",
  props: ["Score", "ComponentStatus"],
  data() {
    return {
      threshold: 0.2
    };
  },
  computed: {
    questionSuccess: function() {
      var threshold = 0.2;
      var questions = this.Score;
      var questionsNr = questions.length;
      var qs = [];
      for (var i = 0; i < questionsNr; i++) {
        if (avg(questions[i]) < threshold) {
          qs.push(questions[i].name);
        }
      }
      return qs;
    },
    less50: function() {
      var fewFull = [];
      for (var qn = 0; qn < this.Score.length; qn++) {
        var qMax = this.Score[qn].maxScore;
        var qs = this.Score[qn].scores.filter(x => x < qMax);
        if (2 * qs.length > this.Score[qn].scores.length) {
          fewFull.push(this.Score[qn].name);
        }
      }
      var fewFullRest = fewFull.filter(
        n => this.questionSuccess.indexOf(n) < 0
      );
      return fewFullRest;
    },
    warnLevel: function() {
      var s = this.ComponentStatus;
      var ss =
        this.warnLevel1 == "warn_1" || this.warnLevel2 == "warn_1"
          ? "warn_1"
          : "warn_0";
      s["less"] = ss;
      return ss;
    },
    warnLevel1: function() {
      return this.questionSuccess.length ? "warn_1" : "warn_0";
    },
    warnLevel2: function() {
      return this.less50.length ? "warn_1" : "warn_0";
    },
    hint: function() {
      if (this.questionSuccess.length) {
        var hint = "";
        var frage = "Frage";
        var ist = "Ist";
        if (this.questionSuccess.length > 1) {
          frage = "Fragen";
          ist = "Sind";
        }
        hint =
          "Viele Studierende haben damit Probleme. Woran kann das liegen? " +
          ist +
          " diese " +
          frage +
          " für alle eindeutig und verständlich formuliert? Haben die Studierenden das benötigte Wissen? Sprechen Sie mit den Studierenden darüber! Überlegen Sie, warum Sie diese " +
          frage +
          " in den Test aufgenommen haben. <br/>Wollten Sie Wissensdefizit deutlich machen? Dies kann leicht demotivieren. <br/>Vielleicht können Sie diese " +
          frage +
          " in Teilaufgaben zerlegen, so dass die Studierenden schrittweise zur Lösung geführt werden? <br/>Sie könnten auch mehr Punkte für diese " +
          frage +
          " vergeben, um die besondere Schwierigkeit zu berücksichtigen (s. Abschnitt Fragen-Statistik).";
      } else {
        hint = "So sollte es sein. Ihre Aufgaben sind nicht zu schwer.";
      }
      return "<p><b>Hinweis:</b> " + hint + "</p>";
    },
    start50: function() {
      var start50 = "";
      if (this.less50.length == 0) {
        start50 = "Bei jeder ";
        if (this.questionSuccess.length) {
          start50 += "der übrigen Fragen ";
        } else {
          start50 += "Frage ";
        }
        return (start50 +=
          "haben die meisten Studierenden die volle Punktzahl erreicht.");
      }
      if (this.questionSuccess.length) {
        start50 = "Außerdem konnten die meisten Studierenden bei ";
      } else {
        start50 = "Die meisten Studierenden konnten bei ";
      }
      if (this.less50.length == 1) {
        start50 += "der Frage";
      } else {
        start50 += "den Fragen";
      }

      return start50;
    },
    end50: function() {
      if (this.less50.length == 0) {
        return "";
      }
      return "nicht die volle Punktzahl erreichen.";
    },
    hint50: function() {
      const qsl = this.questionSuccess.length,
        l50l = this.less50.length;
      if (qsl == 0 && l50l == 0) {
        return "<p><b>Hinweis:</b> Da viele Studierende die volle Punktzahl erreicht haben, sollten sie sich bei Fragen gegenseitig gut helfen können.</p>";
      }
      var hint50 = "<p><b>Hinweis:</b> ";
      if (qsl > 0 && l50l == 0) {
        hint50 += "Sie können sich auf obige ";
        hint50 += qsl == 1 ? "Frage " : "Fragen ";
        hint50 +=
          "konzentrieren; bei den übrigen Fragen sollten sich die Studierenden auch gut untereinander helfen können.</p>";
        return hint50;
      }
      hint50 +=
        "Bei einem Vortest wäre das normal. Ansonsten  brauchen die Studierenden bei ";
      hint50 += qsl + l50l > 1 ? "diesen Fragen" : "dieser Frage";
      hint50 +=
        " möglicherweise Ihre Hilfe, da sie sich nicht ausreichend gegenseitig helfen können.</p>";
      hint50 +=
        "<p>Sie könnten z.B. die Studierenden auf Literatur oder analoge Online-Selbsttests hinweisen und gelegentlich ähnliche Aufgaben zur Wiederholung stellen.</p>";
      return hint50;
    },
    tp: function() {
      return this.threshold * 100 + "% der Punkte";
    }
  }
};
</script>
