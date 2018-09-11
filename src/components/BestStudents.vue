<template>
    <div id="best" :class=warnLevel>
        <h2>Wo machen auch die Besten Fehler?</h2>
        <div>{{ msg }}</div>
        <ul>
            <li v-for='item in msgArr' :key = item>
                {{ item }}
            </li>
        </ul>
        <div v-if = 'Students.length != 0'>
        <b>Hinweis:</b> {{ hint }}
    </div>
    </div>
</template>

<script>
function studentScore(s) {
  var sc = 0;
  for (var qn in s.scores) {
    sc += s.scores[qn];
  }
  s.totalScore = sc;
  return s;
}
export default {
  name: "BestStudents",
  data() {
    return {};
  },
  props: ["Students", "Questions"],
  computed: {
    msgArr: function() {
      var threshold = 0.2;
      var ss = this.Students;
      var scored = ss.map(studentScore);
      var scoredSorted = scored.sort(function(a, b) {
        return b.totalScore - a.totalScore;
      });
      var bestLength = Math.floor(scoredSorted.length * threshold) + 1;
      var best = scoredSorted.slice(0, bestLength);
      var msgArr = [];
      for (var q = 0; q < this.Questions.length; q++) {
        var qq = this.Questions[q];
        var qName = qq.name;
        var qMax = qq.maxScore;
        var qMsgArr = [];
        for (var s = 0; s < best.length; s++) {
          if (best[s].scores[qName] < qMax) {
            var relScore = Math.round(best[s].scores[qName] / qMax * 100);
            qMsgArr.push(best[s].name + ": " + relScore + " %");
          }
        }
        var qMsg = qMsgArr.join("; ");
        if (qMsg != "") {
          msgArr.push(qName + ": " + qMsg);
        }
      }
      return msgArr;
    },
    msg: function() {
      var threshold = 0.2;
      var tp = threshold * 100 + "% der Studierenden";

      if (this.Students.length == 0) {
        return "";
      }
      if (this.msgArr.length == 0) {
        return "Die besten " + tp + " erreichten die volle Punktzahl";
      }
      return (
        "Bei den folgenden Fragen erreichten die besten " +
        tp +
        " nicht die volle Punktzahl."
      );
      // eslint-disable-next-line
      console.log(msgArr);
    },
    warnLevel: function() {
      switch (this.msgArr.length) {
        case 0: {
          return "warn_0";
        }
        default: {
          return "warn_1";
        }
      }
    },
    hint: function() {
      if (this.warnLevel == "warn_1") {
        return "Wenn selbst die besten Studierenden eine Frage nicht richtig beantworten können, so deutet dies darauf hin, dass die Frage unklar formuliert ist oder dass benötigtes Vorwissen nicht bekannt ist.";
      } else {
        return "Wie erwartet haben die besten Studierenden alle Fragen richtig beantwortet.";
      }
    }
  }
};
</script>
