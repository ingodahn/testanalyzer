<template>
  <div id="Test" >
    <div id="container">
    <div id="head">
      <h1>Analyse eines 
        <select v-model="system">
          <option>IMathAS</option>
          <option>Ilias</option>
        </select>
        -Tests
      </h1>
    </div>
    <div id="intro">
      <p>Diese Webseite kann die Ergebnisse Ihrer IMathAS-Tests analysieren. Sie kann Ihnen dabei helfen, die Qualität Ihrer Testfragen einzuschätzen. </p>

      <p>Die Qualität einer Testfrage ist auch abhängig von der Zielstellung des jeweiligen Tests. So wird man bei einem Test zur Motivierung der Studierenden oder bei einem Test zum Üben eine höhere Erfolgsquote erwarten, als bei einem Diagnose-Test, der die Grenzen von Wissen, Können und Kompetenzen der Studierenden ausloten soll.</p>

      <p>IMathAS bietet Ihnen in seinem Gradebook umfangreiche Informationen zur Analyse der Ergebnisse jedes/jeder Studierenden an. Neben den Antworten und den erreichten Punktzahlen (ggf. noch gruppiert nach Lernzielen) finden Sie dort auch die von den Studierenden für die Antwort benötigte Zeit. Sie erreichen das Gradebook in IMathAS wenn Sie auf das Zahnrad neben dem Test klicken und dann <i>Noten</i> auswählen. Auf der dann erscheinenden Seite gibt es unten den Link <i>Export Student Answer Details</i>. Klicken Sie darauf und nehmen Sie die Einstellungen genau so vor, wie auf diesem Bild gezeigt.</p>
      <img class="center" src="../assets/csvEinstellung.png"/>
      <p>Die so erstellte csv-Datei laden Sie dann in diese Webseite.</p>

      <p> <b>Datenschutzhinweis:</b> Diese Webseite überträgt nach ihrem Aufruf keine Daten an andere Systeme. Alle Berechnungen erfolgen ausschließlich in Ihrem Browser.</p>

      <p> <b>Bitte bachten Sie:</b> Diese Software hat experimentellen Charakter. Es wird keinerlei Garantie übernommen. Hinweise auf Probleme und Wünsche zur Verbesserung der Seite sind jedoch <a href="mailto:dahn@dahn-research.eu">ausdrücklich erwünscht</a>.</p>
    </div>
    <TestReader v-on:testRead="testread"></TestReader>
    <div v-if='questionsNr != 0'>
      <p>Der Test hat {{questionsNr}} Fragen. Es liegen Daten von {{studentsNr}} Studierenden vor.</p>
      <p v-if='2*questionsNr >= studentsNr'><b>Für aussagekräftige Ergebnisse sollte es wenigstens doppelt so viele Studierende wie Fragen geben.</b></p>
    </div>
    
    <SetType :testtype=type v-on:typeselected ="settype"></SetType>
    
    <Less :Score=score></Less>
    <More :Score=score></More>
    <Attempts :Questions=questions></Attempts>
    
    <BestStudents :Students=students :Questions=questions></BestStudents>
    <!--
    <div id="output"/>
    -->
    <div class="push"></div>
    </div>
    <div class="footer">
      <p>&copy;Ingo Dahn (Dahn-Research), Lizenz: <a href="https://creativecommons.org/licenses/by-sa/3.0/de/">CC-BY-SA 3.0</a></p>
    </div>
  </div>
</template>

<script>
import SetType from "./SetType.vue";
import TestReader from "./TestReader.vue";
import Less from "./Less.vue";
import More from "./More.vue";
import Attempts from "./Attempts.vue";
import BestStudents from "./BestStudents.vue";

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
    TestReader,
    Less,
    More,
    Attempts,
    BestStudents
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
.center {
    display: block;
    margin-left: auto;
    margin-right: auto;
}
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

