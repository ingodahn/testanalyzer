<template>
<div>
  <p>Exportieren Sie Ihre Testdaten aus ILIAS als .csv-Datei und laden Sie sie dann in diese Webseite.</p>
  <p>Falls Ihre Daten als Excel-Tabelle vorliegen, so speichern Sie sie in Ihrer Tabellenkalkulation als .csv-Datei als "CSV UTF-8 (Durch Trennzeichen ';' getrennt)". 
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
  /*
  var node = document.getElementById("output");
  node.innerText = table;
  */
  var lines = table.split("\n");
  var headings = lines[0].split(";");
  var questionsNr = (headings.length - 19);
  Test.questionsNr = questionsNr;
  for (var q = 0; q < questionsNr; q++) {
    var qq = new Question(headings[19+q]);
    qq.maxScore = 0;
    Test.questions[q] = qq;
  }
  Test.studentsNr = lines.length-2;

  for (var i = 1; i < lines.length - 1; i++) {
    var line = lines[i];
    var lineArray = line.split(";");
    Test.studentNames.push(lineArray[0]);
    for (var q1 = 0; q1 < questionsNr; q1++) {
      var score=lineArray[19+q1];
      if ( score != '') {
        var scoreVal=Number(score);
        Test.questions[q1].scores.push(scoreVal);
        if (Test.questions[q1].maxScore < scoreVal) {
          Test.questions[q1].maxScore=scoreVal;
        }
      } else {
        Test.questions[q1].scores.push(0);
      }
      Test.questions[q1].answers.push[score];
    }
  }
  //eslint-disable-next-line
  console.log(Test.questions[0].maxScore);
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

