<template>
<div>
  <p>IMathAS bietet Ihnen in seinem Gradebook umfangreiche Informationen zur Analyse der Ergebnisse jedes/jeder Studierenden an. Neben den Antworten und den erreichten Punktzahlen (ggf. noch gruppiert nach Lernzielen) finden Sie dort auch die von den Studierenden für die Antwort benötigte Zeit. Sie erreichen das Gradebook in IMathAS wenn Sie auf das Zahnrad neben dem Test klicken und dann <i>Noten</i> auswählen. Auf der dann erscheinenden Seite gibt es unten den Link <i>Export Student Answer Details</i>. Klicken Sie darauf und nehmen Sie die Einstellungen genau so vor, wie auf diesem Bild gezeigt.</p>
      <img class="center" src="./assets/csvEinstellung.png"/>
      <p>Die so erstellte csv-Datei laden Sie dann in diese Webseite.</p>
    <p>
    <input type='file' accept='.csv' autocomplete="on" @change='openFile'>
    </p>
</div>
</template>

<script>
class Question {
  constructor(name) {
    this.name = name;
    this.maxScore = 1;
    this.scores = [];
    this.answers = [];
    this.attempts = 0;
  }
  get averageScore() {
    return this.calcAverageScore();
  }
  attempted(i) {
    return this.answers[i] != "";
  }
  calcAverageScore() {
    var s = 0;
    this.attempts = 0;
    for (var i = 0; i < this.scores.length; i++) {
      // We normalize scores
      s += parseInt(this.scores[i]) / this.maxScore;
      // As sideeffect we calculate the number of attempts
      if (this.attempted(i)) {
        this.attempts++;
      }
    }
    // return average score
    return s / this.answers.length;
  }
}

function table2Test(table) {
  var Test = {
    questionsNr: 0,
    studentsNr: 0,
    questions: [],
    studentNames: []
  };
  var lines = table.split("\n");
  var headings = lines[0].split(",");
  var questionsNr = (headings.length - 2) / 2;
  Test.questionsNr = questionsNr;
  var points = lines[1].split(",");
  var regex = /Points \((\d+) possible\)/;
  for (var q = 0; q < questionsNr; q++) {
    var qn = q + 1;
    var qq = new Question("Question " + qn);
    var ms = regex.exec(points[2 + 2 * q])[1];
    qq.maxScore = parseInt(ms);
    Test.questions[q] = qq;
  }
  Test.studentsNr = lines.length-3;
  var reName=/"([^"]*)"/;
  for (var i = 2; i < lines.length - 1; i++) {
    var line = lines[i];
    Test.studentNames.push(reName.exec(line)[1]);
    line=line.replace(/"[^"]*"/g,"XX");
    var lineArray = line.split(",");
    for (var q1 = 0; q1 < questionsNr; q1++) {
      Test.questions[q1].scores.push(Number(lineArray[2 + 2 * q1])),
      Test.questions[q1].answers.push(lineArray[3 + 2 * q1]);
    }
  }
  return Test;
}
var upload = function(event) {
  return new Promise(function(resolve, reject) {
    var input = event.target;
    var reader = new FileReader();
    reader.onerror = () => {
      reader.abort();
      reject(new DOMException("Problem parsing input file."));
    };
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsText(input.files[0]);
  });
};

export default {
  data() {
    return {};
  },
  methods: {
    openFile: function(event) {
      upload(event).then(x => {
        var y = table2Test(x);
        this.$emit("testRead", y);
      });
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
</style>

