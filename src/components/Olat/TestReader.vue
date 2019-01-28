<template>
<div>
  <p><b>Daten laden:</b> Zur Auswertung der Testergebnisse archivieren Sie zunächst den Test in Open OLAT. Eine Anleitung dafür finden Sie <a href="https://confluence.openolat.org/display/OO121DE/Archivierung+der+Test-+und+Fragebogenresultate" target="_blank">in der OLAT-Hilfe</a>.</p>
      <p>Sie erhalten ein zip-Archiv, in dem Sie nach dem Entpacken u.a. eine Datei mit der Endung .xls vorfinden. Diese Datei laden Sie dann in diese Webseite. <input class="demoData" type="button" onclick="location.href='https://dahn-research.eu/TestAnalyzerSampleData/TestdatenOlat.xls'" value="Demo-Daten" />
    </p>
    <p>
      <label class="custom-file-upload">
          <input type="file" class="realData" accept='.xls' autocomplete="on" @change='openFile'>
          OLAT-Datei hochladen
      </label>
     </p> 
</div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    openFile: function(event) {
      upload(event).then(x => {
        const toAnalyze=x.split('\nLegende');
       var myTest= table2Test(parse(toAnalyze[0], {
         delimiter: `\t`,
         trim: true,
         relax_column_count: true
       }));
       addMaxScores(myTest.questions,toAnalyze[1]);
        this.$emit("testRead", myTest);
      });
    }
  }
};

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
    info: '',
    questionsNr: 0,
    studentsNr: 0,
    questions: [],
    studentNames: []
  };
  var qTitleRow=table[0];
  //var qStartEnd=[];
  var cols=qTitleRow.length;
  var qPkt=[];
  for (var c=0;c<cols;c++) {
    var qs=qTitleRow[c];
    
    if (qs.length > 0) {
      Test.questions[Test.questionsNr] = new Question(qs);
    }
    if (table[1][c].match(/Pkt/)) {
      qPkt[Test.questionsNr]=c;
      Test.questionsNr++;
    } 
  }
  var rowNr=2;
  while (table[rowNr][0].length > 0) {
    var line=table[rowNr];
    Test.studentNames.push(line[1]+' '+line[2]);
    for (var q1=0; q1<Test.questionsNr; q1++) {
      Test.questions[q1].scores.push(Number(line[qPkt[q1]]));
      if (line[qPkt[q1]+1].length < 4) {
        Test.questions[q1].answers.push('');
      } else {
        Test.questions[q1].answers.push('X');
      }
    }
    rowNr++;
  }
  Test.studentsNr=rowNr-2;
  var qi=0;
  for (var i=rowNr; i<table.length;i++) {
    if (table[i][2] == 'maxValue') {
      Test.questions[qi].maxScore=Number(table[i][3]);
      qi++;
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
      reject(new DOMException("Problem uploading input file."));
    };
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsText(input.files[0]);
  });
};

function  addMaxScores(myQuestions,legend) {
  const regex=/maxValue\s*([\d.]+)/g;
  var i=0;
  var match = true;
  do {
    match=regex.exec(legend);
    if (match) {
      myQuestions[i].maxScore=Number(match[1]);
      i++;
    }
  } while (match);
}
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

