<template>
  <div>
    <h2>Daten</h2>
    <p>Exportieren Sie Ihre Testdaten aus ILIAS als .csv-Datei.</p>
    <p>Falls Ihre Daten als Excel-Tabelle vorliegen, so speichern Sie sie in Ihrer Tabellenkalkulation als .csv-Datei als "CSV UTF-8 (Durch Trennzeichen ';' getrennt)".</p>
    <p>Ziehen Sie die so erstellte csv-Datei mit der Maus in diese Webseite auf die Fläche unten.</p>
    <p>
      <input
        class="demoData hvr-grow"
        type="button"
        onclick="location.href='https://dahn-research.eu/TestAnalyzerSampleData/TestdatenIlias.csv'"
        value="Demo-Daten"
      />
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
            >csv-Datei hier ablegen</div>
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
  }
  attempted(x) {
    return x !== "" && x != "---";
  }
  get attempts() {
    return this.answers.filter(this.attempted).length;
  }
}

function table2Test(table) {
  var Test = {
    system: "Ilias",
    info: "",
    questionsNr: 0,
    studentsNr: 0,
    setMaxScore: "none",
    questions: [],
    studentNames: []
  };
  var iliasType = "normal";
  if (table[0][0] == table[2][0]) {
    iliasType = "shuffled";
    iliasType = checkIliasType(iliasType, table, 2);
    if (iliasType == "shuffled" && table.length > 4)
      iliasType = checkIliasType(iliasType, table, 4);
  }

  switch (iliasType) {
    case "shuffled":
      table2TestShuffled(table, Test);
      break;
    case "selected":
      table2TestSelected(table, Test);
      break;
    default:
      var headings = table[0].slice(19, table[0].length);
      var questionsNr = headings.length;
      Test.questionsNr = questionsNr;
      Test.setMaxScore = table[1][3];
      for (var q = 0; q < questionsNr; q++) {
        var qq = new Question(headings[q]);
        qq.maxScore = 0;
        Test.questions[q] = qq;
      }
      Test.studentsNr = table.length - 2;
      // Ab hier weiter übertragen
      for (var i = 1; i < table.length - 1; i++) {
        var lineArray = table[i];
        Test.studentNames.push(lineArray[0]);
        for (var q1 = 0; q1 < questionsNr; q1++) {
          var score = lineArray[19 + q1];
          if (score !== "") {
            score = score.replace(",", ".");
            var scoreVal = Number(score);
            Test.questions[q1].scores.push(scoreVal);
            if (Test.questions[q1].maxScore < scoreVal) {
              Test.questions[q1].maxScore = scoreVal;
            }
          } else {
            Test.questions[q1].scores.push(0);
          }
          Test.questions[q1].answers.push(score);
        }
      }
  }
  return Test;
}

function checkIliasType(iliasType, table, s) {
  var iT = iliasType;
  var qb = 19;
  while (iT == "shuffled" && qb < table[s].length) {
    if (table[0].includes(table[s][qb])) {
      qb++;
    } else {
      iT = "selected";
    }
  }
  return iT;
}

function table2TestShuffled(table, Test) {
  // Getting question titles sorted
  var qTitles = table[0].slice(19, table[0].length).sort();
  var questionsNr = qTitles.length;
  Test.setMaxScore = table[1][3];
  //deshuffle assigns to each question title the question nr
  var deshuffle = {};
  for (var i = 0; i < questionsNr; i++) {
    deshuffle[qTitles[i]] = i;
  }
  // Initializing Test.questions
  Test.questionsNr = questionsNr;
  for (var q = 0; q < questionsNr; q++) {
    var qq = new Question(qTitles[q]);
    qq.maxScore = 0;
    Test.questions[q] = qq;
  }
  Test.studentsNr = table.length / 2;
  for (i = 0; i < Test.studentsNr; i++) {
    var lineArrayTitle = table[2 * i];
    var lineArray = table[2 * i + 1];
    Test.studentNames.push(lineArray[0]);
    for (var q1 = 0; q1 < questionsNr; q1++) {
      var qind = deshuffle[lineArrayTitle[19 + q1]];
      var score = lineArray[19 + q1];
      if (score != "") {
        score = score.replace(",", ".");
        var scoreVal = Number(score);
        Test.questions[qind].scores.push(scoreVal);
        if (Test.questions[qind].maxScore < scoreVal) {
          Test.questions[qind].maxScore = scoreVal;
        }
      } else {
        Test.questions[qind].scores.push(0);
      }
      Test.questions[qind].answers.push(score);
    }
  }
}

function table2TestSelected(table, Test) {
  // Getting question titles sorted
  var qTitlesRaw = table[0].slice(19, table[0].length);
  Test.setMaxScore = table[1][3];
  var qq;
  for (var s = 1; s < table.length / 2; s++) {
    var ss = 2 * s;
    for (qq = 19; qq < table[ss].length; qq++) {
      if (!qTitlesRaw.includes(table[ss][qq])) qTitlesRaw.push(table[ss][qq]);
    }
  }
  var qTitles = qTitlesRaw.sort();
  var questionsNr = qTitles.length;
  // Initializing Test.questions
  Test.questionsNr = questionsNr;
  for (var q = 0; q < questionsNr; q++) {
    qq = new Question(qTitles[q]);
    qq.maxScore = 0;
    Test.questions[q] = qq;
  }
  Test.studentsNr = table.length / 2;
  var i;
  for (i = 0; i < Test.studentsNr; i++) {
    var lineArrayTitle = table[2 * i];
    var lineArray = table[2 * i + 1];
    if (Test.setMaxScore < table[1][3]) Test.setMaxScore = table[1][3];
    Test.studentNames.push(lineArray[0]);
    var studentScores = {};
    for (var q1 = 19; q1 < lineArrayTitle.length; q1++) {
      var score = lineArray[q1];
      if (score !== "") {
        score = score.replace(",", ".");
        var scoreVal = Number(score);
        studentScores[lineArrayTitle[q1]] = scoreVal;
      } else {
        studentScores[lineArrayTitle[q1]] = "";
      }
    }
    for (q1 = 0; q1 < questionsNr; q1++) {
      if (studentScores.hasOwnProperty(qTitles[q1])) {
        var q1s = studentScores[qTitles[q1]];
        if (q1s !== "") {
          Test.questions[q1].scores.push(q1s);
          if (Test.questions[q1].maxScore < q1s) {
            Test.questions[q1].maxScore = q1s;
          }
        } else {
          Test.questions[q1].scores.push(0);
        }
        Test.questions[q1].answers.push(q1s);
      } else {
        Test.questions[q1].scores.push(0);
        // We use '---' if the question has not been presented
        Test.questions[q1].answers.push("---");
      }
    }
  }
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
