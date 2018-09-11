<template>
<div>
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
  var headings = lines[0].split(",");
  var questionsNr = (headings.length - 2) / 2;
  Test.questionsNr = questionsNr;
  var points = lines[1].split(",");
  var regex = /Points \((\d+) possible\)/;
  for (var q = 0; q < questionsNr; q++) {
    var qn = q + 1;
    var qq = new Question("Frage " + qn);
    var ms = regex.exec(points[2 + 2 * q])[1];
    qq.maxScore = parseInt(ms);
    Test.questions[q] = qq;
  }
  Test.studentsNr = lines.length-3;
  for (var i = 2; i < lines.length - 1; i++) {
    var line = lines[i];
    var lineArray = line.split(",");
    var family=lineArray[0];
    var given=lineArray[1];
    family=family.substr(1,family.length);
    given=given.substr(0,given.length-1);
    Test.studentNames.push(family+','+given);
    for (var q1 = 0; q1 < questionsNr; q1++) {
      Test.questions[q1].scores.push(Number(lineArray[3 + 2 * q1])),
      Test.questions[q1].answers.push(lineArray[4 + 2 * q1]);
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
