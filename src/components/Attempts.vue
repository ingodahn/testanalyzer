<template>
    <div id="less" :class=warnLevel>
    <h2>Ungenutzte Fragen?</h2>
    <p>{{ msg }}</p>
    <div v-if = 'Questions.length != 0'>
        <b>Hinweis:</b> {{ hint }}
    </div>
</div>
</template>

<script>
export default {
  name: "Attempts",
  props: ["Questions"],
  data () {
        return {

        }
    },
  computed: {
    attempts: function () {
      var attempts = [];
      var threshold = 0.2;

      for (var i = 0; i < this.Questions.length; i++) {
        var q = this.Questions[i];
        var sn = q.scores.length;
        var ua = q.scores.filter(j => j != "").length;
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
            "Die Aufgaben " + this.attempts.join() + " wurden von weniger als " + tp
          );
        }
      }
    },
    warnLevel: function () {
      switch(this.attempts.length) {
          case 0: {
              return "warn_0";
          }
          default: {return "warn_1";}
      }
    },
    hint: function () {
        if (this.warnLevel == 'warn_1') {
            var frage= 'Frage';
            if (this.attempts.length > 1) {
                frage='Fragen';
            }
            return "Versuchen Sie, durch Gespräche mit den Studierenden, herauszubekommen, warum sie diese "+frage+"Frage nicht versucht haben. Vielleicht war die Formulierung der Frage nicht verständlich? Falls dies die letzte Frage des Tests war könnte es auch daran liegen, dass die Zeit für den Test zu knapp bemessen war. Sie sollten diese "+frage+" modifizieren, sie durch andere Fragen ersetzen oder weglassen.";
        } else {
            return 'So sollte es sein. Ihre Aufgaben sind verständlich';
        }
        
    }
  }
};
</script>
