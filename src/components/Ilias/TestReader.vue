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
      <Spinner v-if="loading" class="spinner"></Spinner>
      <div v-else class="container-responsive">
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
import { Question, Line } from "../Reader";
import Spinner from "../../third_party/Spinner.vue";
export default {
  data() {
    return {
      loading: false
    };
  },
  components: {
    Spinner
  },
  methods: {
    handleDragover: handleDragover,
    handleDrop: function(e) {
      e.stopPropagation();
      e.preventDefault();
      this.loading = true;
      var files = e.dataTransfer.files,
        f = files[0],
        csv;
      var reader = new FileReader();
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
        this.loading = false;
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

function table2Test(table) {
  var Test = {
    system: "Ilias",
    questionsNr: 0,
    questions: [],
    studentsNr: 0,
    studentNameLines: [],
    setMaxScore: "none"
  };
  var iliasType = "normal";
  if (table[0][0] == table[2][0]) {
    iliasType = "shuffled";
  }

  switch (iliasType) {
    case "shuffled":
      table2TestShuffled(table, Test);
      break;
    default:
      var headings = table[0].slice(19, table[0].length);
      var questionsNr = headings.length;
      Test.questionsNr = questionsNr;
      Test.setMaxScore = table[1][3];
      for (let q = 0; q < questionsNr; q++) {
        let qq = new Question(headings[q]);
        Test.questions[q] = qq;
      }
      Test.studentsNr = table.length - 2;
      for (let rowNr = 1; rowNr < table.length - 1; rowNr++) {
        let line = table[rowNr],
          lineItems = new Line(),
          rowName = line[0];
        lineItems.lineName = rowName;
        lineItems.lineNr = rowNr;
        for (let q1 = 0; q1 < questionsNr; q1++) {
          let qq = Test.questions[q1];
          let rowAnswer = new Object();
          rowAnswer.name = qq.name;
          rowAnswer.attempted = score !== "";
          let score = line[19 + q1];
          if (score !== "") {
            score = score.replace(",", ".");
            var scoreVal = Number(score);
            rowAnswer.score = scoreVal;
          } else {
            rowAnswer.score = 0;
          }
          lineItems.lineAnswers.push(rowAnswer);
        }
        Test.studentNameLines.push(lineItems);
      }
  }
  return Test;
}

// In selected tests an random choice of all questions is presented
function table2TestShuffled(table, Test) {
  Test.setMaxScore = table[1][3];
  // Getting question titles sorted
  let qTitlePos = getQuestions();
  //let questionsNr = qTitlePos.length;
  Test.studentsNr = table.length / 2;
  //var i;
  //var q1, q1n;

  for (let i = 0; i < Test.studentsNr; i++) {
    let lineArrayTitle = table[2 * i];
    let rowNr = 2 * i + 1;
    var line = table[2 * i + 1],
      lineItems = new Line();
    if (Test.setMaxScore < table[1][3]) Test.setMaxScore = table[1][3];
    let rowName = line[0];
    lineItems.lineName = rowName;
    lineItems.lineNr = rowNr;
    for (let q1 = 19; q1 < lineArrayTitle.length; q1++) {
      let score = line[q1],
        q1n = lineArrayTitle[q1];
      let qq = Test.questions[qTitlePos[q1n]];
      let rowAnswer = new Object();
      rowAnswer.name = qq.name;
      rowAnswer.attempted = score !== "";
      if (score === "") {
        rowAnswer.score = 0;
      } else {
        rowAnswer.score = Number(score.replace(",", "."));
      }
      lineItems.lineAnswers.push(rowAnswer);
    }
    Test.studentNameLines.push(lineItems);
  }

  function getQuestions() {
    let qTitlesRaw = [];
    for (let s = 0; s < table.length / 2; s++) {
      let ss = 2 * s,
        line = table[ss];
      for (let qq = 19; qq < line.length; qq++) {
        if (!qTitlesRaw.includes(line[qq])) qTitlesRaw.push(line[qq]);
      }
    }
    let qTitles = qTitlesRaw.sort();
    let questionsNr = qTitles.length;
    // Initializing Test.questions
    Test.questionsNr = questionsNr;
    let qTitlePos = new Object();
    for (let q = 0; q < questionsNr; q++) {
      let qq = new Question(qTitles[q]);
      Test.questions[q] = qq;
      qTitlePos[qTitles[q]] = q;
    }
    return qTitlePos;
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
.spinner {
  margin: 0 auto;
  width: 100px;
}
</style>
