<template>
  <div id="Test">
    <div class="container">
      <v-navigation-drawer v-model="drawer" app v-if="questionsNr > 0">
        <v-list dense>
          <v-list-item link v-if="layout == 'all'">
            <v-list-item-action>
              <v-icon>mdi-database-export</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title><a href="#basics">Daten</a></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item link v-if="layout == 'all' || componentStatus['scoreDistribution'] == 'warn_1'">
            <v-list-item-action>
              <v-icon :color="warnColor('scoreDistribution')">mdi-chart-bar</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title><a href="#scoreDistribution">Punkteverteilung</a></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item link v-if="layout == 'all' || componentStatus['more'] == 'warn_1'">
            <v-list-item-action>
              <v-icon :color="warnColor('more')">mdi-emoticon-happy-outline</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title><a href="#more">Viele Punkte</a></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item link v-if="layout == 'all' || componentStatus['less'] == 'warn_1'">
            <v-list-item-action>
              <v-icon :color="warnColor('less')">mdi-emoticon-sad-outline</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title><a href="#less">Wenige Punkte</a></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item link v-if="layout == 'all' || componentStatus['attempts'] == 'warn_1'">
            <v-list-item-action>
              <v-icon :color="warnColor('attempts')">mdi-account-question-outline</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title><a href="#attempts" :class="warnLevel('attempts')">Ungenutzt</a></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item link v-if="layout == 'all' || componentStatus['best'] == 'warn_1'">
            <v-list-item-action>
              <v-icon :color="warnColor('best')">mdi-flag-checkered</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title><a href="#best">Die Besten</a></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item link v-if="layout == 'all'">
            <v-list-item-action>
              <v-icon :color="warnColor('questionStatistics')">mdi-chart-line</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title><a href="#questionStatistics">Fragen-Statistik</a></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item link v-if="layout == 'all' || componentStatus['discriminator'] == 'warn_1'">
            <v-list-item-action>
              <v-icon :color="warnColor('discriminator')">mdi-scale-balance</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title><a href="#discriminator">Trennschärfe</a></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-container
        class="scroll-y"
      >
        <v-layout
          align-center
          justify-center
        >
        <v-flex xs12>
          <v-app-bar app color="#2481a8" absolute dark id="scroll-target">
            <v-app-bar-nav-icon @click.stop="drawer = !drawer" v-if="questionsNr>0"></v-app-bar-nav-icon>
            <v-toolbar-title>{{ pSystem }} Test-Analyse</v-toolbar-title>
          </v-app-bar>
          <v-btn
            v-scroll="onScroll"
            v-show="fab"
            fab
            dark
            fixed
            bottom
            right
            color="primary"
            @click="toTop"
          >
            <v-icon>mdi-arrow-up-bold-outline</v-icon>
          </v-btn>
          <v-main>
            <v-container class="fill-height" fluid>
            <div class="main" id="mainDiv">
              <div id="context" v-if="showContext">
                <p>Diese Webseite kann die Ergebnisse Ihrer Tests analysieren. Sie kann Ihnen dabei helfen, die Qualität Ihrer Testfragen einzuschätzen.</p>
                <p>Die Qualität einer Testfrage ist auch abhängig von der Zielstellung des jeweiligen Tests. So wird man bei einem Test zur Motivierung der Studierenden oder bei einem Test zum Üben eine höhere Erfolgsquote erwarten, als bei einem Diagnose-Test, der die Grenzen von Wissen, Können und Kompetenzen der Studierenden ausloten soll.</p>
                <p>
                  <b>Datenschutzhinweis:</b> Diese Webseite überträgt nach ihrem Aufruf keine Daten an andere Systeme. Alle Berechnungen erfolgen ausschließlich in Ihrem Browser. (
                  <a
                    href="https://de.wikipedia.org/wiki/Edge_Computing"
                    target="_blank"
                  >Edge Computing</a>)
                </p>
                <p>
                  <b>Bitte bachten Sie:</b> Es wird keinerlei Garantie übernommen. Hinweise auf Probleme und Wünsche zur Verbesserung der Seite sind jedoch
                  <a
                    href="mailto:dahn@dahn-research.eu"
                  >ausdrücklich erwünscht</a>.
                </p>
              </div>

              <div id="basics">
                <p>
                  <v-hover v-if="(! showUpload) && questionsNr != 0" v-slot:default="{ hover }" open-delay="200" class="ma-1">
                      <v-btn color="primary"
                      :elevation="hover ? 16 : 2"
                      v-on:click="showUpload = true; reset();"
                      >
                        Neue Datei laden
                      </v-btn>
                  </v-hover>
                  <v-hover v-if="layout == 'all' && questionsNr != 0 && hasHint()" v-slot:default="{ hover }" open-delay="200" class="ma-1">
                      <v-btn color="warning"
                      outlined
                      v-on:click="layout = 'hints'"
                      :elevation="hover ? 16 : 2"
                      >
                      Nur Hinweise anzeigen
                      </v-btn>
                  </v-hover>
                  <v-hover v-if="questionsNr != 0 && layout == 'hints'" v-slot:default="{ hover }" open-delay="200" class="ma-1">
                      <v-btn color="primary"
                      v-on:click="layout = 'all'"
                      :elevation="hover ? 16 : 2"
                      >
                      Alles anzeigen
                      </v-btn>
                  </v-hover>
                  <v-hover v-if="error.type =='loaded' && error.status=='start'" v-slot:default="{ hover }" open-delay="200" class="ma-1">
                    <v-btn color="primary"
                    v-on:click="reportProblem()"
                    :elevation="hover ? 16 : 2"
                    >
                    Problem melden
                    </v-btn>
                  </v-hover>
                  <span v-if="questionsNr != 0">
                    <Printer></Printer>
                  </span>
                </p>
                <router-view
                  ref="reader"
                  v-on:load="reset"
                  v-on:testRead="testread"
                  :ShowUpload="showUpload"
                  :Error="error"
                />
                <div v-if="layout == 'all' && questionsNr != 0">
                  <h2>Daten</h2>
                  <p>Der Test hat {{questionsNr}} Fragen. Es liegen Daten von {{studentsNr}} Studierenden vor. Maximal können {{ calcMaxScore }} Punkte erreicht werden.</p>

                  <EditMaxScores
                    v-if="layout == 'all' && (system == 'Ilias' || system == 'OLAT_xlsx')"
                    :Questions="questions"
                    :CalcMaxScore="calcMaxScore"
                    :TotalScore="totalScore"
                  ></EditMaxScores>
                  <ControlCenter
                    v-if="layout == 'all'"
                    id="controlCenter"
                    :Mode="mode"
                    v-on:typeselected="setMode"
                  ></ControlCenter>
                </div>
              </div>
              <div id="printArea" :class="printClass()">
                <ScoreDistribution
                  id="scoreDistribution"
                  :ScoredSorted="scoredSorted"
                  :TotalScore="calcMaxScore"
                  :Questions="questions"
                  :ComponentStatus="componentStatus"
                  :Layout="layout"
                ></ScoreDistribution>

                <More id="more" :Score="score" :ComponentStatus="componentStatus" :Layout="layout"></More>
                <Less
                  id="less"
                  :Score="score"
                  :Mode="mode"
                  :ComponentStatus="componentStatus"
                  :Layout="layout"
                ></Less>
                <Attempts
                  id="attempts"
                  :Questions="questions"
                  :Mode="mode"
                  :ComponentStatus="componentStatus"
                  :Layout="layout"
                ></Attempts>
                <BestStudents
                  id="best"
                  :ScoredSorted="scoredSorted"
                  :Questions="questions"
                  :ComponentStatus="componentStatus"
                  :Layout="layout"
                ></BestStudents>
                <QuestionStatistics
                  id="questionStatistics"
                  :Questions="questions"
                  :Mode="mode"
                  v-if="layout == 'all'"
                ></QuestionStatistics>
                <Discriminator
                  :ScoredSorted="scoredSorted"
                  :Questions="questions"
                  :Mode="mode"
                  :ComponentStatus="componentStatus"
                  :Layout="layout"
                ></Discriminator>
              </div>
            </div>
            </v-container>
          </v-main>
        </v-flex>
        </v-layout>
      </v-container>
      <v-footer color="#2481a8" app>
        <span class="white--text">
          &copy;Ingo Dahn (Dahn-Research), Lizenz:
            <a style="color: white;"
              href="https://creativecommons.org/licenses/by-sa/3.0/de/"
              target="_blank"
            >CC-BY-SA 3.0</a>
        </span>
      </v-footer>
    </div>
  </div>
</template>

<script>
import ControlCenter from "./ControlCenter.vue";
import Less from "./Less.vue";
import More from "./More.vue";
import Attempts from "./Attempts.vue";
import BestStudents from "./BestStudents.vue";
import EditMaxScores from "./EditMaxScores.vue";
import ScoreDistribution from "./ScoreDistribution.vue";
import QuestionStatistics from "./QuestionStatistics.vue";
import Discriminator from "./Discriminator.vue";
import Printer from "./Printer.vue";
import { Student } from "./Scoring.js";
export default {
  name: "Test",
  data() {
    return {
      fab: false,
      drawer: null,
      system: "",
      type: "compulsory",
      reportingProblem: false,
      questionsNr: 0,
      studentsDataNr: 0,
      setMaxScore: "none",
      questions: [],
      students: {},
      studentLinesNr: 0,
      mode: {
        questionScore: "compulsory",
        // multiLine is true iff at least one student name occurs in more than one line
        multiLine: false,
        // multiQuestion is true iff in at least one line at least one question occurs more than once
        multiQuestion: false,
        //mode.multiLineScore is false if each student has a single line. Otherwise it is one of 'maxQuestion', 'maxLine' or 'single'
        multiLineScore: false
      },
      error: {
        type: "empty",
        status: "start"
      },
      componentStatus: {
        scoreDistribution: "warn_0",
        less: "warn_0",
        more: "warn_0",
        attempts: "warn_0",
        best: "warn_0",
        discriminator: "warn_0"
      },
      showContext: true,
      showUpload: true,
      layout: "all",
      loading: false
    };
  },
  components: {
    Printer,
    ControlCenter,
    Less,
    More,
    Attempts,
    BestStudents,
    EditMaxScores,
    ScoreDistribution,
    QuestionStatistics,
     Discriminator
  },
  methods: {
    setMode: function(typeval) {
      this.mode[typeval[0]] = typeval[1];
    },
    reset: function() {
      this.system = "";
      this.reportingProblem = false;
      this.questionsNr = 0;
      this.studentsDataNr = 0;
      this.questions = [];
      this.students = {};
      this.mode.multiLine = false;
      this.mode = {
        questionScore: "compulsory",
        multiLine: false,
        multiQuestion: false,
        multiLineScore: false
      };
      this.error = {
        type: "none",
        status: "start"
      };
      this.studentLinesNr = 0;
      this.showContext = true;
      this.showUpload = true;
      this.layout = "all";
      this.setMaxScore = "none";
      this.loading = false;
    },
    errorRead: function() {
      this.reset();
    },
    reportProblem: function() {
      this.error.status = "started";
    },
    testread: function(test) {
      this.system = test.system;
      this.questionsNr = test.questions.length;
      if (test.hasOwnProperty("setMaxScore"))
        this.setMaxScore = test.setMaxScore;
      else this.setMaxScore = "none";
      this.questions = test.questions;
      let qIndex = new Object();
      this.questions.forEach(function(v, a) {
        qIndex[v.name] = a;
      });

      this.studentsDataNr = test.studentsNr;
      var snlThis = new Object();
      this.studentLinesNr = 0;
      var snlThat = test.studentNameLines;
      for (var i = 0; i < snlThat.length; i++) {
        let snli = snlThat[i],
          snlName = snli.lineName,
          snlScore = snli.lineScore,
          snlNr = snli.lineNr;
        this.students = snlThis;
        if (snli.participated) {
          let s;
          let snlEntry = { lineNr: snlNr, lineScore: snlScore };
          if (!snlThis.hasOwnProperty(snlName)) {
            s = new Student(snlName);
            s.lines = [snlEntry];
            snlThis[snlName] = s;
          } else {
            s = snlThis[snlName];
            s.lines.push(snlEntry);
          }
          let snliAnswers = snli.lineAnswers;
          snliAnswers.forEach(ans => {
            let qn = this.questions[qIndex[ans.name]];

            let cnt = qn.addStudentLineAnswer(
              snlName,
              snlNr,
              ans.attempted,
              ans.score
            );
            if (cnt > 1) this.mode.multiQuestion = true;
          });

          this.studentLinesNr++;
        }
      }

      let sNames = Object.keys(snlThis);

      this.stundentsNr == sNames.length;
      // if a student has more attempts, we sort her lines by lineScore
      if (sNames.length < this.studentLinesNr) {
        sNames.forEach(sn => {
          snlThis[sn].lines = snlThis[sn].lines.sort(
            (a, b) => b.lineScore - a.lineScore
          );
        });
        this.mode.multiLine = true;
        this.mode.questionScore = "voluntary";
        this.mode.multiLineScore = "maxQuestion";
      }

      this.showUpload = false;
      this.showContext = false;
    },
    hasHint: function() {
      return Object.values(this.componentStatus).find(x => x == "warn_1");
    },
    warnLevel: function(c) {
      return this.componentStatus[c];
    },
    warnColor: function(c) {
      return (this.warnLevel(c) == "warn_1")?"warning":"none";
    },
    printClass: function() {
      return (this.questionsNr > 0)?"active":"passive";
    },
    onScroll (e) {
      if (typeof window === 'undefined') return
      const top = window.pageYOffset ||   e.target.scrollTop || 0
      this.fab = top > 20
    },
    toTop () {
      this.$vuetify.goTo(0)
    }
  },

  computed: {
    studentsNr: function() {
      if (this.mode.multiLine) return Object.keys(this.students).length;
      return this.studentLinesNr;
    },
    /* score is an array containing for each question
     * - its name
     * - its maximum score
     *  - an array of student scores for this questions, considering only studentScores who have been presented this question and - in voluntary case only - who have attempted that question
     */
    score: function() {
      var scores = [];
      for (var i = 0; i < this.questionsNr; i++) {
        var q = this.questions[i];
        //var qscores = q.scores;
        var triedqscores = [];
        Object.keys(this.students).forEach(j => {
          if (this.mode.questionScore == "compulsory") {
            if (q.presentedTo(j)) triedqscores.push(q.scoreOf(j));
          } else {
            if (q.attemptedBy(j)) triedqscores.push(q.scoreOf(j));
          }
        });
        var totals =
          this.mode.questionScore == "compulsory" ? q.presented : q.attempted;
        scores.push({
          name: q.name,
          maxScore: q.getMaxScore(),
          scores: triedqscores,
          total: totals
        });
      }
      return scores;
    },
    totalScore: function() {
      var tScore = 0;
      for (var i = 0; i < this.questionsNr; i++) {
        tScore += this.questions[i].getMaxScore();
      }
      return tScore;
    },
    calcMaxScore: function() {
      if (isNaN(this.setMaxScore)) return this.totalScore;
      return this.setMaxScore;
    },
    testStudentScores: function() {
      let studentScores = [];
      let nameArray = Object.keys(this.students);

      if (!this.mode.multiLine) {
        nameArray.forEach(sname => {
          studentScores.push({
            name: sname,
            realName: sname,
            totalScore: this.students[sname].getScore(this.mode, this.questions)
          });
        });
      } else if (this.mode.multiLine && this.mode.multiLineScore == "single") {
        nameArray.forEach(sname => {
          {
            let scoreArray = this.students[sname].getScore(
              this.mode,
              this.questions
            );
            scoreArray.forEach(ll => {
              studentScores.push({
                name: sname + " (" + ll.lineNr + ")",
                realName: sname,
                lineNr: ll.lineNr,
                totalScore: ll.lineScore
              });
            });
          }
        });
      } else if (this.mode.multiLine) {
        nameArray.forEach(sname => {
          studentScores.push({
            name: sname,
            realName: sname,
            totalScore: this.students[sname].getScore(this.mode, this.questions)
          });
        });
      }
      return studentScores;
    },
    scoredSorted: function() {
      var ss = this.testStudentScores.slice(0);
      //eslint-disable-next-line
      //console.log(ss);
      var scoredSorted = ss.sort(function(a, b) {
        return a.totalScore - b.totalScore;
      });
      return scoredSorted;
    },

    pSystem: function() {
      var pS = this.$route.path;
      if (pS.match(/imathas/g)) return "IMathAS";
      if (pS.match(/ilias/)) return "ILIAS";
      if (pS.match(/olat/)) return "Open OLAT";
      if (pS.match(/opal/)) return "OPAL";
      return "";
    }
  }
};
</script>

<style scoped>
/* Grow */
.hvr-grow {
  display: inline-block;
  vertical-align: middle;
  transform: translateZ(0);
  box-shadow: 0 0 1px rgba(0, 0, 0, 0);
  backface-visibility: hidden;
  -moz-osx-font-smoothing: grayscale;
  transition-duration: 0.3s;
  transition-property: transform;
}

.hvr-grow:hover,
.hvr-grow:focus,
.hvr-grow:active {
  transform: scale(1.1);
}

.page-title {
  grid-column: 1/3;
  left: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  background-color: hsl(198, 65%, 40%);
  color: white;
  text-align: center;
}
.navigation {
  top: 75px;
  left: 0;
  height: 100vh;
  border-width: 1px;
  border-right-style: dashed;
  padding: 1em;
  grid-column: 1/2;
  grid-row: 2;
  position: sticky;
}
.footer {
  height: 50px;
  grid-column: 1/3;
  grid-row: 3;

  background-color: hsl(198, 65%, 40%);
  color: white;
  text-align: center;
}

.push {
  height: 50px;
}
.container {
  display: grid;
  grid-gap: 10px;
  grid-template-columns: auto auto;
  grid-template-rows: auto 1fr auto;
  min-height: 100%;
  padding: 20px;
}

.testButton {
  border: 1px solid #ccc;
  display: inline-block;
  padding: 6px 12px;
  margin-right: 6px;
  cursor: pointer;
  background-color: hsl(198, 65%, 40%);
  color: white;
  border-radius: 10px;
}
.hintLayout {
  color: hsl(198, 65%, 40%);
  background-color: hsla(60, 82%, 63%, 0.3);
}
.passive {
  color: lightgrey;
}
body {
  background-color: #eeeeee;
  font-family: "Montserrat", sans-serif;
  display: grid;
  grid-template-rows: auto;
  justify-items: center;
  padding-top: 50px;
}

nav {
  padding: 20px 20px 20px 0;
}

nav a {
  padding: 10px;
  text-decoration: none;
  background: #fff;
  border-radius: 3px;
  color: rgb(0, 110, 255);
  font-weight: bold;
  margin-right: 15px;
}
</style>
