<template>
<div>
  <p>Zur Auswertung der Testergebnisse archivieren Sie zunächst den Test in Open OLAT.</p>
      <p>Die so erstellte csv-Datei laden Sie dann in diese Webseite. <input class="demoData" type="button" onclick="location.href='https://dahn-research.eu/TestAnalyzerSampleData/TestdatenOlat.csv'" value="Demo-Daten" />
    </p>
    <p>
      <label class="custom-file-upload">
          <input type="file" class="realData" accept='.csv' autocomplete="on" @change='openFile'>
          OLAT-Datei hochladen
      </label>
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
    system: "Olat",
    questionsNr: 0,
    studentsNr: 0,
    questions: [],
    studentNames: []
  };
  var headings=table[0];
  var questionsNr = (headings.length - 2) / 2;
  Test.questionsNr = questionsNr;
 
  var regex = /Points \((\d+) possible\)/;
  for (var q = 0; q < questionsNr; q++) {
    var qq = new Question(table[0][2*q+2])
    var ms = regex.exec(table[1][2*q+2])[1];
    qq.maxScore = parseInt(ms);
    Test.questions[q] = qq;
  }
  Test.studentsNr = table.length-2;

  for (var i = 2; i < table.length; i++) {
    var line = table[i];
    Test.studentNames.push(line[0].substring(1,line[0].length));
    for (var q1 = 0; q1 < questionsNr; q1++) {
      
      Test.questions[q1].scores.push(Number(line[2 + 2 * q1])),
      Test.questions[q1].answers.push(line[3 + 2 * q1]);
    }
  }
  
  return Test;
}
var parse = require('csv-parse/lib/sync');

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
       var y=table2Test(parse(x));
        this.$emit("testRead", y);
      });
    }
  }
};
</script>

<style scoped>

.custom-file-upload, .demoData{
    border: 1px solid #ccc;
    display: inline-block;
    padding: 6px 12px;
    cursor: pointer;
    background-color: hsl(198, 65%, 40%);
    color: white;
    border-radius: 10px;
}
.realData {
  display: none;
}
.center {
    display: block;
    margin-left: auto;
    margin-right: auto;
}
</style>

