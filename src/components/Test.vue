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
            <p>Der Test hat {{questionsNr}} Fragen. Es liegen Daten von {{studentsDataNr}} Studierenden vor, von denen {{studentsNr}} am Test teilgenommen haben. Maximal können {{ calcMaxScore }} Punkte erreicht werden.</p>
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
              :testtype="type"
              v-on:typeselected="settype"
            ></SetType>
          </div>
        </div>
        <ScoreDistribution
          id="scoreDistribution"
          :ScoredSorted="scoredSorted"
          :TotalScore="calcMaxScore"
          :Questions="questions"
          :ComponentStatus="componentStatus"
          :Layout="layout"
        ></ScoreDistribution>
        <Less id="less" :Score="score" :ComponentStatus="componentStatus" :Layout="layout"></Less>
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

export default {
  name: "Test",
  data() {
    return {
      system: "",
      type: "compulsory",
      questionsNr: 0,
      studentsNr: 0,
      studentsDataNr: 0,
      setMaxScore: "none",
      questions: [],
      studentNames: [],
      componentStatus: {
        scoreDistribution: "warn_0",
        less: "warn_0",
        more: "warn_0",
        attempts: "warn_0",
        best: "warn_0"
      },
      showContext: true,
      showUpload: true,
      layout: "all"
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
      this.type = typeval;
    },
    reset: function() {
      this.questionsNr = 0;
      this.studentsNr = 0;
      this.questions = [];
      this.studentNames = [];
      this.layout = "all";
      this.setMaxScore = "none";
    },
    testread: function(test) {
      this.system = test.system;
      this.questionsNr = test.questionsNr;
      this.setMaxScore = test.setMaxScore;
      this.questions = test.questions;
      this.studentsNr = test.studentsNr;
      this.studentsDataNr = test.studentsNr;
      this.studentNames = test.studentNames.map(function(item, index) {
        return item + " (" + index + ")";
      });

      // Removing non-participants
      for (var s = test.studentsNr - 1; s >= 0; s--) {
        var participated = false;
        for (var q = 0; q < this.questionsNr; q++) {
          if (this.questions[q].attemptedBy(s)) {
            participated = true;
            break;
          }
        }
        if (!participated) {
          this.studentNames.splice(s, 1);
          for (var q2 = 0; q2 < this.questionsNr; q2++) {
            this.questions[q2].removeStudent(s);
          }
          this.studentsNr--;
        }
      }
      this.showUpload = false;
      this.showContext = false;
    },
    hasHint: function() {
      return Object.values(this.componentStatus).find(x => x == "warn_1");
    }
  },

  computed: {
    /* score is an array containing for each question
     * - its name
     * - its maximum score
     *  - an array of student scores for this questions, considering only students who have been presented this question (q.answers[j]!='---') and - in voluntary case only - who have attempted that question (q.answers[j]!="")
     */
    score: function() {
      var scores = [];
      for (var i = 0; i < this.questionsNr; i++) {
        var q = this.questions[i];
        //var qscores = q.scores;
        var triedqscores = [];
        for (var j = 0; j < this.studentsNr; j++) {
          switch (this.type) {
            case "voluntary":
              if (q.attemptedBy(i)) triedqscores.push(q.scoreOf(j));
              break;
            default:
              if (q.presentedTo(i)) triedqscores.push(q.scoreOf(j));
          }
        }
        scores.push({
          name: q.name,
          maxScore: q.getMaxScore(),
          scores: triedqscores
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
      if (this.setMaxScore == "none") return this.totalScore;
      return this.setMaxScore;
    },
    students: function() {
      var studentScores = [];

      for (var s = 0; s < this.studentsNr; s++) {
        var student32 = {
          name: this.studentNames[s],
          index: s,
          scores: {},
          totalScore: 0
        };
        this.questions.forEach(qq => {
          if (
            qq.presentedTo(s) &&
            (this.type == "compulsory" || qq.attemptedBy(s))
          ) {
            student32["scores"][qq.name] = qq.scoreOf(s);
            student32["totalScore"] += qq.scoreOf(s);
          }
        });
        studentScores.push(student32);
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
    questionNames: function() {
      var questionNames = [];
      for (var i = 0; i < this.questionsNr; i++) {
        questionNames.push(this.questions[i].name);
      }
      return questionNames;
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
