<template>
  <div id="Test" >
    <div id="container">
    <div id="head">
      <h1>Test-Analyse</h1>
       <p>Diese Webseite kann die Ergebnisse Ihrer Tests analysieren. Sie kann Ihnen dabei helfen, die Qualität Ihrer Testfragen einzuschätzen. </p>
       <p>Die Qualität einer Testfrage ist auch abhängig von der Zielstellung des jeweiligen Tests. So wird man bei einem Test zur Motivierung der Studierenden oder bei einem Test zum Üben eine höhere Erfolgsquote erwarten, als bei einem Diagnose-Test, der die Grenzen von Wissen, Können und Kompetenzen der Studierenden ausloten soll.</p>
       <p> <b>Datenschutzhinweis:</b> Diese Webseite überträgt nach ihrem Aufruf keine Daten an andere Systeme. Alle Berechnungen erfolgen ausschließlich in Ihrem Browser.</p>
       <p> <b>Bitte bachten Sie:</b> Diese Software hat experimentellen Charakter. Es wird keinerlei Garantie übernommen. Hinweise auf Probleme und Wünsche zur Verbesserung der Seite sind jedoch <a href="mailto:dahn@dahn-research.eu">ausdrücklich erwünscht</a>.</p>
      
      <h2>Bitte wählen Sie Ihr System</h2>
        <input type="radio" id="imathas" v-model="system" value="IMathAS">
        <label for="IMathAS">IMathAS</label>
        <input type="radio" id="ilias" v-model="system" value="Ilias">
        <label for="Ilias">Ilias</label>
        
    </div>
    <h2>Laden Sie Ihre Testdaten hoch</h2>
    <div id="intro">
      <TestReaderIMathAS v-if="system == 'IMathAS'" v-on:testRead="testread"></TestReaderIMathAS>
      <TestReaderIlias v-if="system == 'Ilias'" v-on:testRead="testread"></TestReaderIlias>
      
    </div>
    
    <div v-if='questionsNr != 0'>
      <p>Der Test hat {{questionsNr}} Fragen. Es liegen Daten von {{studentsNr}} Studierenden vor. Maximal können {{ totalScore }} Pukte erreicht werden.</p>
      <p v-if='2*questionsNr >= studentsNr'><b>Für aussagekräftige Ergebnisse sollte es wenigstens doppelt so viele Studierende wie Fragen geben.</b></p>
      <EditMaxScores v-if="system == 'Ilias'" :Questions=questions></EditMaxScores>
    </div>
    
    <SetType :testtype=type v-on:typeselected ="settype"></SetType>
    
    <Less :Score=score></Less>
    <More :Score=score></More>
    <Attempts :Questions=questions></Attempts>
    
    <BestStudents :Students=students :Questions=questions></BestStudents>
    <div class="push"></div>
    </div>
    <div class="footer">
      <p>&copy;Ingo Dahn (Dahn-Research), Lizenz: <a href="https://creativecommons.org/licenses/by-sa/3.0/de/">CC-BY-SA 3.0</a></p>
    </div>
  </div>
</template>

<script>
import SetType from "./SetType.vue";
import TestReaderIMathAS from "./IMathAS/TestReader.vue";
import TestReaderIlias from "./Ilias/TestReader.vue";
import Less from "./Less.vue";
import More from "./More.vue";
import Attempts from "./Attempts.vue";
import BestStudents from "./BestStudents.vue";
import EditMaxScores from "./EditMaxScores.vue";

export default {
  name: "Test",
  data() {
    return {
      system: 'IMathAS',
      type: "compulsory",
      questionsNr: 0,
      studentsNr: 0,
      questions: [],
      studentNames: []
    };
  },
  components: {
    SetType,
    TestReaderIMathAS,
    TestReaderIlias,
    Less,
    More,
    Attempts,
    BestStudents,
    EditMaxScores
  },
  methods: {
    settype: function(typeval) {
      this.type = typeval;
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
      var tScore=0;
      for (var i=0;i < this.questionsNr; i++) {
        tScore += Number(this.questions[i].maxScore);
        //eslint-disable-next-line
        console.log(tScore);
      }
      //eslint-disable-next-line
      console.log(tScore);
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
    questionNames: function() {
      var questionNames = [];
      for (var i = 0; i < this.questionsNr; i++) {
        questionNames.push(this.questions[i].name);
      }
      return questionNames;
    }
  }
};
</script>

<style scoped>
.footer {
   position: fixed;
   left: 0;
   bottom: 0;
   width: 100%;
   height: 50px;
   background-color: hsl(198, 65%, 40%);
   color: white;
   text-align: center;
}
.push {
  height: 50px;
}
.container {
  min-height: 100%;
  margin-bottom: -50px;
}
</style>

