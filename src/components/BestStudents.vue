<template>
  <div id="best" :class="warnLevel" v-if="Layout == 'all' || warnLevel == 'warn_1'">
    <h2>Wo machen auch die Besten Fehler?</h2>
    <div v-html="msg"></div>
    <ul>
      <li v-for="item in msgArr" :key="item">{{ item }}</li>
    </ul>
    <div v-if="ScoredSorted.length != 0">
      <b>Hinweis:&nbsp;</b>
      <span v-html="hint"></span>
    </div>
  </div>
</template>

<script>
export default {
  name: "BestStudents",
  data() {
    return {};
  },
  props: ["ScoredSorted", "Questions", "ComponentStatus", "Layout"],
  computed: {
    msgArr: function() {
      var best = this.ScoredSorted.slice(0);

      best = best.reverse().slice(0, this.bestLength);
      var msgArr = [];
      for (var q = 0; q < this.Questions.length; q++) {
        var qq = this.Questions[q];
        var qName = qq.name;
        //var qMax = Number(qq.maxScore);
        var qMax = qq.getMaxScore();
        var qMsgArr = [];
        for (var s = 0; s < best.length; s++) {
          if (
            best[s].scores.hasOwnProperty(qName) &&
            best[s].scores[qName] < qMax
          ) {
            qMsgArr.push(best[s].name);
          }
        }
        var qMsg = qMsgArr.slice(0, 2).join(", ");
        if (qMsg != "") {
          msgArr.push(qName + ": " + qMsg);
        }
      }

      return msgArr;
    },
    msg: function() {
      // var threshold = 0.2;
      var tp = this.bestLength + " Studierenden";

      if (this.ScoredSorted.length == 0) {
        return "";
      }
      if (this.msgArr.length == 0) {
        return "Die besten " + tp + " erreichten immer die volle Punktzahl";
      }
      var fr =
        this.msgArr.length == 1
          ? "Bei der folgenden Frage"
          : "Bei den folgenden Fragen";
      return (
        fr +
        " erreichten die besten " +
        tp +
        " nicht immer die volle Punktzahl, z.B. "
      );
    },
    warnLevel: function() {
      var s = this.ComponentStatus;
      switch (this.msgArr.length) {
        case 0: {
          s["best"] = "warn_0";
          return "warn_0";
        }
        default: {
          s["best"] = "warn_1";
          return "warn_1";
        }
      }
    },
    hint: function() {
      if (this.warnLevel == "warn_1") {
        return "Bei einem <span  style='font-style:italic;'>Vortest</span> zur Feststellung von Vorkenntnissen ist das in Ordnung.<br/><span  style='font-style:italic;'>Ansonsten</span> deutet es darauf hin, dass eine Frage unklar formuliert ist oder dass benötigtes Vorwissen nicht bekannt ist. Eine genauere Prüfung der Antworten der genannten Studierenden könnte genauere Hinweise liefern.";
      } else {
        return "Wie erwartet haben die besten Studierenden alle Fragen richtig beantwortet.";
      }
    },

    bestLength: function() {
      var threshold = 0.2;
      var bestLength = Math.floor(this.ScoredSorted.length * threshold) + 1;
      if (bestLength > 10) {
        bestLength = 10;
      }
      return bestLength;
    }
  }
};
</script>
