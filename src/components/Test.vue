<template>
  <div id="Test">
    <div class="container">
      <div id="home" class="page-title">
        <h1>{{ pSystem }} Test-Analyse</h1>
      </div>
      <div class="navigation">
        <Navigation :QuestionsNr="questionsNr" :ComponentStatus="componentStatus" :Layout="layout"></Navigation>
      </div>
      <div class="main">
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
        <div id="system" v-if="showUpload">
          <router-view v-on:load="reset" v-on:testRead="testread" />
        </div>

        <div id="basics" v-if="questionsNr != 0">
          <p>
            <input
              v-if="! showUpload"
              class="testButton hvr-grow"
              type="button"
              v-on:click="showUpload = true; reset();"
              value="Neue Datei laden"
            />
            <input
              v-if="layout == 'all' && hasHint()"
              class="testButton hintLayout hvr-grow"
              type="button"
              v-on:click="layout = 'hints'"
              value="Nur Hinweise anzeigen"
            />
            <input
              v-if="layout == 'hints'"
              class="testButton hvr-grow"
              type="button"
              v-on:click="layout = 'all'"
              value="Alles anzeigen"
            />
          </p>
          <hr />
          <div v-if="layout == 'all'">
            <h2>Daten</h2>
            <p>Der Test hat {{questionsNr}} Fragen. Es liegen Daten von {{studentsNr}} Studierenden vor. Maximal können {{ calcMaxScore }} Punkte erreicht werden.</p>
            <p v-if="2*questionsNr >= studentsNr">
              <b>Für aussagekräftige Ergebnisse sollte es wenigstens doppelt so viele Studierende wie Fragen geben.</b>
            </p>

            <EditMaxScores
              v-if="layout == 'all' && (system == 'Ilias' || system == 'OLAT_xlsx')"
              :Questions="questions"
              :CalcMaxScore="calcMaxScore"
              :TotalScore="totalScore"
            ></EditMaxScores>
            <SetType
              v-if="layout == 'all'"
              id="testType"
              :testtype="mode.testtype"
              v-on:typeselected="settype"
            ></SetType>
            <form v-if="multilineScore">
              <h3>Mehrfache Versuche</h3>
              <p>Studierende haben den Test mehrfach aufgerufen im Mittel {{(studentLinesNr / studentsNr).toFixed(1)}} mal. Welcher Versuch zählt?</p>
              <fieldset>
                <input type="radio" id="maxQuestion" v-model="multilineScore" value="maxQuestion" />
                <label for="maxQuestion">Für jede Frage wird die beste Antwort gewertet</label>
                <br />
                <input type="radio" id="maxLine" v-model="multilineScore" value="maxLine" />
                <label
                  for="maxLine"
                >Es werden die Antworten des Versuchs mit der höchsten Gesamtpunktzahl gewertet</label>
                <br />
                <input type="radio" id="single" v-model="multilineScore" value="single" />
                <label for="single">Jeder Versuch wird separat gewertet</label>
              </fieldset>
            </form>
          </div>
        </div>
        <div v-if="multiPresented != ''">
          <h3>Wiederholte Fragen</h3>
          <p>{{multiPresented}}</p>
        </div>
        <ScoreDistribution
          id="scoreDistribution"
          :StudentsMaxScores="studentsMaxScores"
          :ScoredSorted="scoredSorted"
          :TotalScore="calcMaxScore"
          :Questions="questions"
          :Mode="mode"
          :ComponentStatus="componentStatus"
          :Layout="layout"
        ></ScoreDistribution>
        <Less
          id="less"
          :StudentsMaxScores="studentsMaxScores"
          :Score="score"
          :ComponentStatus="componentStatus"
          :Layout="layout"
        ></Less>
        <More id="more" :Score="score" :ComponentStatus="componentStatus" :Layout="layout"></More>
        <Attempts
          id="attempts"
          :Questions="questions"
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
        <QuestionStatistics id="questionStatistics" :Score="score" v-if="layout == 'all'"></QuestionStatistics>
      </div>
      <div class="footer">
        <p>
          &copy;Ingo Dahn (Dahn-Research), Lizenz:
          <a
            href="https://creativecommons.org/licenses/by-sa/3.0/de/"
          >CC-BY-SA 3.0</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import Navigation from "./Navigation.vue";
import SetType from "./SetType.vue";
import Less from "./Less.vue";
import More from "./More.vue";
import Attempts from "./Attempts.vue";
import BestStudents from "./BestStudents.vue";
import EditMaxScores from "./EditMaxScores.vue";
import ScoreDistribution from "./ScoreDistribution.vue";
import QuestionStatistics from "./QuestionStatistics.vue";
import { Student } from "./Scoring.js";
export default {
  name: "Test",
  data() {
    return {
      system: "",
      type: "compulsory",
      questionsNr: 0,
      studentsDataNr: 0,
      setMaxScore: "none",
      questions: [],
      studentNameLines: {},
      studentLinesNr: 0,
      mode: {
        testtype: "compulsory",
        // multiline is true iff at least one student name occurs in more than one line
        multiline: false,
        // multiquestion is true iff in at least one line at least one question occurs more than once
        multiquestion: false
      },
      //multilineScore is false if each student has a single line. Otherwise it is one of 'maxQuestion', 'maxLine' or 'single'
      multilineScore: false,

      componentStatus: {
        scoreDistribution: "warn_0",
        less: "warn_0",
        more: "warn_0",
        attempts: "warn_0",
        best: "warn_0"
      },
      showContext: true,
      showUpload: true,
      layout: "all",
      loading: false
    };
  },
  components: {
    Navigation,
    SetType,
    Less,
    More,
    Attempts,
    BestStudents,
    EditMaxScores,
    ScoreDistribution,
    QuestionStatistics
  },
  methods: {
    settype: function(typeval) {
      this.mode.testtype = typeval;
    },
    reset: function() {
      this.system = "";
      this.questionsNr = 0;
      this.studentsDataNr = 0;
      this.questions = [];
      this.studentNameLines = {};
      this.multilineScore = false;
      this.mode = {
        testtype: "compulsory",
        multiline: false,
        multiquestion: false
      };
      this.studentLinesNr = 0;
      this.showContext = true;
      this.showUpload = true;
      this.layout = "all";
      this.setMaxScore = "none";
      this.loading = false;
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
        this.studentNameLines = snlThis;
        if (snli.participated) {
          let snlEntry = { lineNr: snlNr, lineScore: snlScore };
          if (!snlThis.hasOwnProperty(snlName)) {
            let s = new Student(snlName);
            s.lines = [snlEntry];
            snlThis[snlName] = s;
          } else snlThis[snlName].lines.push(snlEntry);
          let snliAnswers = snli.lineAnswers;
          snliAnswers.forEach(ans => {
            let qn = this.questions[qIndex[ans.name]];

            let cnt = qn.addStudentLineAnswer(
              snlName,
              snlNr,
              ans.attempted,
              ans.score
            );
            if (cnt > 1) this.mode.multiquestion = true;
          });

          this.studentLinesNr++;
        }
      }

      let sNames = Object.keys(snlThis);

      this.stundentsNr == sNames.length;
      if (sNames.length < this.studentLinesNr) {
        sNames.forEach(sn => {
          snlThis[sn] = snlThis[sn].sort((a, b) => b.lineScore - a.lineScore);
        });
        this.mode.multiline = true;
        this.multilineScore = "maxQuestion";
      }

      this.showUpload = false;
      this.showContext = false;
      //eslint-disable-next-line
      console.log(this.studentNameLines);
    },
    hasHint: function() {
      return Object.values(this.componentStatus).find(x => x == "warn_1");
    }
  },

  computed: {
    studentsNr: function() {
      if (this.multilineScore) return Object.keys(this.studentNameLines).length;
      return this.studentLinesNr;
    },
    /* score is an array containing for each question
     * - its name
     * - its maximum score
     *  - an array of student scores for this questions, considering only students who have been presented this question and - in voluntary case only - who have attempted that question
     */
    score: function() {
      var scores = [];
      for (var i = 0; i < this.questionsNr; i++) {
        var q = this.questions[i];
        //var qscores = q.scores;
        var triedqscores = [];
        Object.keys(this.studentNameLines).forEach(j => {
          if (this.mode.testtype == "compulsory") {
            if (q.presentedTo(j)) triedqscores.push(q.scoreOf(j));
          } else {
            if (q.attemptedBy(j)) triedqscores.push(q.scoreOf(j));
          }
        });
        var totals =
          this.mode.testtype == "compulsory" ? q.presented : q.attempted;
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
    students: function() {
      var studentScores = [];
      var nameArray = Object.keys(this.studentNameLines).map(s => {
        return [s, this.studentNameLines[s].lines];
      });

      for (const [sname, slines] of nameArray) {
        // Entry template for students
        var student = {
          name: sname,
          // scores has for each question the total score for this question
          scores: {},
          // attempts has for each question the number of attempts
          attempts: {},
          totalScore: 0
        };
        var l = slines[0];
        var studentLines = new Object();
        studentLines[l] = student;
        if (this.multilineScore == "single") {
          studentLines = {};
          slines.forEach(ll => {
            studentLines[ll.lineNr] = {
              name: sname + " (" + ll.lineNr + ")",
              scores: {},
              attempts: {},
              totalScore: 0
            };
          });
        }
        this.questions.forEach(qq => {
          switch (this.multilineScore) {
            case "maxQuestion": {
              const ssatt = qq.scoreAttemptsOf(sname, "max");
              student["scores"][qq.name] = ssatt.totalScore;
              student["totalScore"] += ssatt.totalScore;
              student["attempts"][qq.name] = ssatt.attempts ? 1 : 0;
              break;
            }
            case "maxLine": {
              let sl = qq.scoreOfInLine(sname, slines[0].lineNr);
              student["scores"][qq.name] = sl;
              student["totalScore"] += sl;
              student["attempts"] = qq.attemptedByInLine(
                sname,
                slines[0].lineNr
              );
              break;
            }
            case "single": {
              slines.forEach(ll => {
                if (
                  this.mode.testtype == "compulsory" ||
                  qq.attemptedBy(sname)
                ) {
                  let lr = ll.lineNr;
                  studentLines[lr]["scores"][qq.name] = qq.scoreOfInLine(
                    sname,
                    lr
                  );
                  studentLines[ll.lineNr]["totalScore"] += qq.scoreOfInLine(
                    sname,
                    lr
                  );
                  studentLines[ll.lineNr]["attempts"][
                    qq.name
                  ] = qq.attemptedByInLine(sname, lr);
                }
              });
              break;
            }
            default: {
              if (
                qq.presentedTo(sname) &&
                (this.mode.testtype == "compulsory" || qq.attemptedBy(sname))
              ) {
                student["scores"][qq.name] = qq.scoreOf(sname);
                student["totalScore"] += qq.scoreOf(sname);
                student["attempts"][qq.name] = qq.attemptedBy(sname);
              }
            }
          }
        });
        studentScores = studentScores.concat(Object.values(studentLines));
      }
      return studentScores;
    },

    scoredSorted: function() {
      var ss = this.students.slice(0);
      var scoredSorted = ss.sort(function(a, b) {
        return a.totalScore - b.totalScore;
      });
      return scoredSorted;
    },
    studentsMaxScores: function() {
      let sMS = new Object();
      let nameArray = Object.keys(this.studentNameLines);
      nameArray.map(sn => {
        let sqData = new Object();
        this.questions.forEach(q => {
          sqData[q.name] = q.scoreAttemptsOf(sn, "max");
        });

        sMS[sn] = sqData;
      });
      return sMS;
    },
    questionNames: function() {
      var questionNames = [];
      for (var i = 0; i < this.questionsNr; i++) {
        questionNames.push(this.questions[i].name);
      }
      return questionNames;
    },
    multiPresented: function() {
      //Only in Ilias (so far) questions may be presented multiple times in the same run
      if (this.system == "Ilias") {
        for (var s = 0; s < this.studentsNr; s++) {
          for (var qi = 0; qi < this.questionsNr; qi++) {
            if (this.questions[qi].presentedTo(s) > 1)
              return "Im Test werden den Studierenden Fragen mit demselben Titel mehrfach gestellt. Bei der Auswertung wird angenommen, dass es sich dabei um Varianten derselben Frage handelt.";
          }
        }
      }
      return "";
    },
    pSystem: function() {
      var pS = this.$route.path;
      if (pS.match(/imathas/g)) return "IMathAS";
      if (pS.match(/ilias/)) return "Ilias";
      if (pS.match(/olat/)) return "Open OLAT";
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
.main {
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
