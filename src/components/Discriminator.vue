<template>
  <div id="discriminator" v-if="Layout == 'all' || warnLevel == 'warn_1'" :class="warnLevel">
    <h2>Trennschärfe</h2>
      <div v-if="Questions.length > 0">
      <p>
        Die <a href="https://de.wikipedia.org/wiki/Trennsch%C3%A4rfe_eines_Items" target="_blank">Trennschärfe</a> einer Frage in einem Test misst, inwieweit die Verteilung der Punkte der Frage der Leistungsverteilung der Gesamtpunktzahl des Tests entspricht.
      </p>
      <div style="text-align: center;" v-if="showDiscriminator">
        <div
          class="chart-container"
          style="display: inline-block; max-width: 50%;"
          v-if="Questions.length > 0"
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
          <LineChart :chartData="DiscriminatorChart(curGroupStart,curGroupEnd)"></LineChart>
        </div>
      </div>

      <p v-if="! showDiscriminator">
        Die Trennschärfe der Fragen kann nicht ermittelt werden, wenn die Bearbeitung der Fragen freiwillig ist (dies kann in den <a href="#controlCenter">Einstellungen des Tests</a> geändert werden) oder wenn es mehrere Versuche gibt.
      </p>
      <div v-if="showDiscriminator">
        <h4>Ist das für Sie relevant?</h4>
        <p> Die Trennschärfe ist nur für Tests von Interesse, die das Ziel haben, die Fähigkeiten der Studierenden auf einem bestimmten Gebiet zu bestimmen. Für solche Tests sollte man Fragen mit hoher Trennschärfe wählen, die sich alle auf dieses Gebiet beziehen, um ein klares Bild von der Stärke der Studierenden zu erhalten.
        </p>
        <p>
          Dagegen ist die Trennschärfe für Tests, die ein differenziertes Bild von der Leistungsfähigkeit der  Studierenden ermitteln sollen, von geringer Bedeutung, da einzelne Fragen in der Regel nur Teilaspekte des angestrebten Profils testen sollen. <b>Tip:</b> Um die Trennschärfe zur Beurteilung des Werts einer Frage zu nutzen zerlegen Sie Ihren Test ggf. in mehrere Einzeltests, die jeweils ein Teilgebiet testen.
        </p>
        <p>
          Die Berechnung der Trennschärfe ist nur für solche Fragen sinnvoll, die jedem Teilnehmer des Tests vorgelegt wurden, also nicht für Tests mit zufälliger Fragenauswahl.
        </p>
        <p v-if="nanHint">
          Die Trennschärfe kann nicht für Fragen ermittelt werden, bei denen alle Studierenden die selbe Punktzahl erreichten.
        </p>
        <div v-if="hintQuestionNames.low.length">
          <p>
            {{ lowPhrase }} Vielleicht kann man sie noch besser auf das Ziel des Tests abstimmen?
          </p>
          <p>
            <ul>
                <li v-for="item in hintQuestionNames.low" :key="item">{{ item }}</li>
            </ul>
          </p>
        </div>
        <div v-if="hintQuestionNames.zero.length">
          <p>
            {{ zeroPhrase }}
          </p>
          <p>
            <ul>
                <li v-for="item in hintQuestionNames.zero" :key="item">{{ item }}</li>
            </ul>
          </p>
        </div>
        <div v-if="hintQuestionNames.negative.length">
          <p>
            {{ negativePhrase }}
          </p>
          <p>
            <ul>
                <li v-for="item in hintQuestionNames.negative" :key="item">{{ item }}</li>
            </ul>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LineChart from "./Graphics/LineChart.vue";
export default {
  components: {
    LineChart,
  },
  props: ["ScoredSorted","Questions","Mode","ComponentStatus","Layout"],
  data() {
    return {
      curGroup: 0,
    }
  },
  methods: {
    DiscriminatorChart: function(start, end) {
      var chart = {
        labels: [],
        datasets: []
      };
      if (this.Questions.length == 0) {
        return {
          data: [chart]
        };
      }

      chart.labels = this.QNames.slice(start, end).map(t =>
        t.length < 40 ? t : t.substring(0, 40) + "..."
      );
      var discData = {
        label: "Trennschärfe",
        data: this.Cors.slice(start,end),
        borderColor: "green"
      };
      chart.datasets[0] = discData;
      return chart;
    },
    ResetCurGroup: function() {
      this.curGroup = 0;
    }
  },
  computed: {
    QNames: function() {
      return this.Questions.map(x => x["name"]);
    },
    Cors: function() {
      if (! this.Questions.length) return 300;
      let sAll=[], sQ=[];
      for (let i=0; i< this.Questions.length; i++) {
        sQ[i]=[];
      }
      this.ScoredSorted.forEach(stud => {
        sAll.push(stud.totalScore);
        this.Questions.forEach(function(q,i) {
          if (q.answers[stud.realName] == undefined) {
            sQ[i].push(0);
          } else {
            sQ[i].push(Object.values(q.answers[stud.realName])[0][0].score);
          }
        })
      });
      let cors=[];
      for (let i=0;i<sQ.length; i++) {
        cors.push(correlation(sAll,sQ[i]));
      }
      return cors;
    },
    nanHint: function() {
      let cors=this.Cors, ch=false;
      for (let i=0; i<cors.length; i++) {
        if (isNaN(cors[i])) {
          ch=true;
          break;
        }
      }
      return ch;
    },
    hintQuestionNames: function() {
      let lowC=[], zerC=[], negC=[];
      let cl=this.Cors;
      this.QNames.forEach(function(qn,i) {
        let c=cl[i];
        if (isNaN(c)) return;
        if (c >= 0.29) return;
        if (c >= 0.1) {
          lowC.push(qn);
          return;
        }
        if (c >= -0.1) {
          zerC.push(qn);
          return;
        }
        negC.push(qn);
      });
      return {low: lowC, zero: zerC, negative: negC};
    },
    lowPhrase: function() {
      return (this.hintQuestionNames.low.length > 1)?"Die folgenden Fragen haben eine niedrige Trennschärfe.":"Die folgende Frage hat eine niedrige Trennschärfe.";
    },
    zeroPhrase: function() {
      return (this.hintQuestionNames.zero.length > 1)?"Die folgenden Fragen haben eine Trennschärfe nahe 0. Sie scheinen mit dem restlichen Test wenig gemeinsam zu haben.":"Die folgende Frage hat eine Trennschärfe nahe 0. Sie scheint mit dem restlichen Test wenig gemeinsam zu haben."
    },
    negativePhrase: function() {
      return (this.hintQuestionNames.negative.length > 1)?"Die folgenden Fragen haben eine negative Trennschärfe. Wurden sie umgekehrt verstanden?":"Die folgende Frage hat eine negative Trennschärfe. Wurde sie umgekehrt verstanden?"
    },
    warnLevel: function() {
      let h=this.hintQuestionNames;
      var s = this.ComponentStatus;
      var ss =
        this.showDiscriminator && (h.low.length || h.zero.length || h.negative.length)
          ? "warn_1"
          : "warn_0";
      s["discriminator"] = ss;
      return ss;
    },
    // Chart-Funktionen
    showDiscriminator: function() {
      return (this.Mode.questionScore!='compulsory' || this.Mode.multiLine)?false:true;
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
      if (this.curGroup >= this.ChartGroups.length) this.ResetCurGroup();
      return this.ChartGroups.length ? this.ChartGroups[this.curGroup][0] : 0;
    },
    curGroupEnd: function() {
      if (this.curGroup >= this.ChartGroups.length) this.ResetCurGroup();
      return this.ChartGroups.length ? this.ChartGroups[this.curGroup][1] : 0;
    }
  }
}

function correlation(x,y) {
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0,
    sumY2 = 0;
  const minLength = x.length = y.length = Math.min(x.length, y.length),
    reduce = (xi, idx) => {
      const yi = y[idx];
      sumX += xi;
      sumY += yi;
      sumXY += xi * yi;
      sumX2 += xi * xi;
      sumY2 += yi * yi;
    }
  x.forEach(reduce);
  return (minLength * sumXY - sumX * sumY) / Math.sqrt((minLength * sumX2 - sumX * sumX) * (minLength * sumY2 - sumY * sumY));
}


</script>