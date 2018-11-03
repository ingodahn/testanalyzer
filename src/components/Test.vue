<template>
  <div id="Test" >
    <div class="container">
      <div class="page-title">
        <h1>Test-Analyse</h1>
      </div>
      <div class="navigation">
        <Navigation :QuestionsNr="questionsNr"></Navigation>
      </div>
      <div class="main">
        <div id="context">
          <p>Diese Webseite kann die Ergebnisse Ihrer Tests analysieren. Sie kann Ihnen dabei helfen, die Qualität Ihrer Testfragen einzuschätzen. </p>
          <p>Die Qualität einer Testfrage ist auch abhängig von der Zielstellung des jeweiligen Tests. So wird man bei einem Test zur Motivierung der Studierenden oder bei einem Test zum Üben eine höhere Erfolgsquote erwarten, als bei einem Diagnose-Test, der die Grenzen von Wissen, Können und Kompetenzen der Studierenden ausloten soll.</p>
          <p> <b>Datenschutzhinweis:</b> Diese Webseite überträgt nach ihrem Aufruf keine Daten an andere Systeme. Alle Berechnungen erfolgen ausschließlich in Ihrem Browser.</p>
          <p> <b>Bitte bachten Sie:</b> Diese Software hat experimentellen Charakter. Es wird keinerlei Garantie übernommen. Hinweise auf Probleme und Wünsche zur Verbesserung der Seite sind jedoch <a href="mailto:dahn@dahn-research.eu">ausdrücklich erwünscht</a>.</p>
        </div>
    <div id="system">
      <h2>Bitte wählen Sie Ihr System</h2>
        <input type="radio" id="imathas" v-model="system" value="IMathAS" v-on:click="reset">
        <label for="IMathAS">IMathAS</label>
        <input type="radio" id="ilias" v-model="system" value="Ilias" v-on:click="reset"> 
        <label for="Ilias">Ilias</label>
    </div>
    <div id="upload">
      <h2>Laden Sie Ihre Testdaten hoch</h2>

      <div id="intro">
        <TestReaderIMathAS v-if="system == 'IMathAS'" v-on:testRead="testread"></TestReaderIMathAS>
        <TestReaderIlias v-if="system == 'Ilias'" v-on:testRead="testread"></TestReaderIlias>
        
      </div>
    </div>
    
    <div id="basics" v-if='questionsNr != 0'>
      <p>Der Test hat {{questionsNr}} Fragen. Es liegen Daten von {{studentsNr}} Studierenden vor. Maximal können {{ totalScore }} Pukte erreicht werden.</p>
      <p v-if='2*questionsNr >= studentsNr'><b>Für aussagekräftige Ergebnisse sollte es wenigstens doppelt so viele Studierende wie Fragen geben.</b></p>
      <EditMaxScores v-if="system == 'Ilias'" :Questions=questions></EditMaxScores>
    </div>
    
    <SetType id="testType" :testtype=type v-on:typeselected ="settype"></SetType>

    <ScoreDistribution id="scoreDistribution" :ScoredSorted=scoredSorted :TotalScore=totalScore :Charts="['scoreDistribution']" :Questions = questions></ScoreDistribution>
    <Less id="less" :Score=score></Less>
    <More id="more" :Score=score></More>
    <Attempts id="attempts" :Questions=questions></Attempts>
    
    <BestStudents id="best" :Students=students :ScoredSorted=scoredSorted :Questions=questions></BestStudents>
    </div>
    <!--
    <div class="push"></div>
    -->
    <div class="footer">
      <p>&copy;Ingo Dahn (Dahn-Research), Lizenz: <a href="https://creativecommons.org/licenses/by-sa/3.0/de/">CC-BY-SA 3.0</a></p>
    </div>
    </div>
    
  </div>
</template>

<script>
import Navigation from "./Navigation.vue";
import SetType from "./SetType.vue";
import TestReaderIMathAS from "./IMathAS/TestReader.vue";
import TestReaderIlias from "./Ilias/TestReader.vue";
import Less from "./Less.vue";
import More from "./More.vue";
import Attempts from "./Attempts.vue";
import BestStudents from "./BestStudents.vue";
import EditMaxScores from "./EditMaxScores.vue";
import ScoreDistribution from "./ScoreDistribution.vue";

export default {
  name: "Test",
  data() {
    return {
      system: "IMathAS",
      type: "compulsory",
      questionsNr: 0,
      studentsNr: 0,
      questions: [],
      studentNames: []
    };
  },
  components: {
    Navigation,
    SetType,
    TestReaderIMathAS,
    TestReaderIlias,
    Less,
    More,
    Attempts,
    BestStudents,
    EditMaxScores,
    ScoreDistribution
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
    },
    testread: function(test) {
      this.questionsNr = test.questionsNr;
      this.questions = test.questions;
      this.studentsNr = test.studentsNr;
      this.studentNames = test.studentNames;
    }
  },

  computed: {
    score: function() {
      var scores = [];
      for (var i = 0; i < this.questionsNr; i++) {
        var q = this.questions[i];
        var qscores = q.scores;
        if (this.type == "voluntary") {
          var triedqscores = [];
          for (var j = 0; j < qscores.length; j++) {
            if (q.answers[j] != "") {
              triedqscores.push(qscores[j]);
            }
          }
          qscores = triedqscores;
        }
        scores.push({
          name: q.name,
          maxScore: q.maxScore,
          scores: qscores
        });
      }
      return scores;
    },
    totalScore: function() {
      var tScore = 0;
      for (var i = 0; i < this.questionsNr; i++) {
        // maxScore can be string if modified by input
        tScore += Number(this.questions[i].maxScore);
      }
      return tScore;
    },
    students: function() {
      var students = [];
      for (var s = 0; s < this.studentsNr; s++) {
        var sq = {
          name: this.studentNames[s],
          scores: {}
        };
        for (var qn = 0; qn < this.questionsNr; qn++) {
          var q = this.questions[qn];
          if (this.type == "compulsory" || q.answers[s] != "") {
            sq.scores[q.name] = q.scores[s];
          }
        }
        students.push(sq);
      }

      return students;
    },
    scoredSorted: function() {
      var ss = this.students;
      var scored = ss.map(studentScore);
      var scoredSorted = scored.sort(function(a, b) {
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
    }
  }
};
function studentScore(s) {
  // Calculates score for student s
  var sc = 0;
  for (var qn in s.scores) {
    sc += s.scores[qn];
  }
  s.totalScore = sc;
  return s;
}
</script>

<style scoped>
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
</style>

