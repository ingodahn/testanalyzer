<template>
  <div>
    <p>
      <b>Daten laden:</b> Exportieren Sie Ihre Testdaten aus ILIAS als .csv-Datei.
    </p>
    <p>Falls Ihre Daten als Excel-Tabelle vorliegen, so speichern Sie sie in Ihrer Tabellenkalkulation als .csv-Datei als "CSV UTF-8 (Durch Trennzeichen ';' getrennt)".</p>
    <p>Die so erstellte csv-Datei laden Sie dann in diese Webseite.</p>
    <p>
      <input
        class="demoData"
        type="button"
        onclick="location.href='https://dahn-research.eu/TestAnalyzerSampleData/TestdatenIlias.csv'"
        value="Demo-Daten"
      >
    </p>
    <div id="app">
      <div class="container-responsive">
        <div class="row">
          <div class="col-md-12">
            <div
              id="drop"
              @drop="handleDrop"
              @dragover="handleDragover"
              @dragenter="handleDragover"
            >Datei hier ablegen</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    handleDragover: handleDragover,
    handleDrop: function(e) {
      e.stopPropagation();
      e.preventDefault();
      var files = e.dataTransfer.files,
        f = files[0],
        csv;

      var reader = new FileReader();
      //name = f.name;

      reader.onload = e => {
        // 1. Getting file
        csv = e.target.result;

        // 2. Stripping off and storing Legende if necessary
        // 3. Parsing File into csv if necessary

        // 4. Parsing csv into array of arrays of items
        var csvArray = parseCSV(csv, ";");

        // 5. table2test
        var test = table2Test(csvArray);

        //  6. Emit signal (or modify Test object's parts?)
        this.$emit("testRead", test);
      };
      reader.readAsText(f);
    }
  }
};

function handleDragover(e) {
  e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
}
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
    system: "Ilias",
    info: "",
    questionsNr: 0,
    studentsNr: 0,
    questions: [],
    studentNames: []
  };
  //var lines = table.split("\n");
  var headings = table[0];
  var questionsNr = headings.length - 19;
  Test.questionsNr = questionsNr;
  for (var q = 0; q < questionsNr; q++) {
    var qq = new Question(headings[19 + q]);
    qq.maxScore = 0;
    Test.questions[q] = qq;
  }
  Test.studentsNr = table.length - 2;

  for (var i = 1; i < table.length - 1; i++) {
    var lineArray = table[i];
    Test.studentNames.push(lineArray[0]);
    for (var q1 = 0; q1 < questionsNr; q1++) {
      var score = lineArray[19 + q1];
      if (score != "") {
        score = score.replace(",", ".");
        var scoreVal = Number(score);
        Test.questions[q1].scores.push(scoreVal);
        if (Test.questions[q1].maxScore < scoreVal) {
          Test.questions[q1].maxScore = scoreVal;
        }
      } else {
        Test.questions[q1].scores.push(0);
      }
      Test.questions[q1].answers.push[score];
    }
  }
  return Test;
}

function parseCSV(csv, del = ",") {
  var parse = require("csv-parse/lib/sync");
  var csvArray = parse(csv, {
    delimiter: del,
    trim: true,
    relax_column_count: true
  });
  return csvArray;
}
</script>

<style scoped>
.custom-file-upload,
.demoData {
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
#drop {
  border: 2px dashed #bbb;
  border-radius: 5px;
  padding: 25px;
  text-align: center;
  font: 20pt bold, "Vollkorn";
  color: #bbb;
}
</style>
