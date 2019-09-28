<template>
  <div>
    <h2>Daten</h2>
    <p>
      Testergebnisse finden Sie im Gradebook von IMathAS. Sie erreichen das Gradebook, wenn Sie auf das Zahnrad neben dem Test klicken und dann
      <i>Noten</i> auswählen. Auf der dann erscheinenden Seite gibt es unten den Link
      <i>Export Student Answer Details</i>. Klicken Sie darauf und nehmen Sie die Einstellungen genau so vor, wie auf diesem Bild gezeigt.
    </p>
    <img class="center" src="./assets/csvEinstellung.png" />
    <p>Ziehen Sie die so erstellte csv-Datei mit der Maus in diese Webseite auf die Fläche unten.</p>
    <p>
      <input
        class="demoData hvr-grow"
        type="button"
        onclick="location.href='https://dahn-research.eu/TestAnalyzerSampleData/TestdatenIMathAS.csv'"
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
            >csv-Datei mit der Maus hier ablegen</div>
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
        var csvArray = parseCSV(csv, ",");

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
    system: "IMathAS",
    info: "",
    questionsNr: 0,
    studentsNr: 0,
    setMaxScore: "none",
    questions: [],
    studentNames: []
  };
  var headings = table[0];
  var questionsNr = (headings.length - 2) / 2;
  Test.questionsNr = questionsNr;

  var regex = /Points \((\d+) possible\)/;
  for (var q = 0; q < questionsNr; q++) {
    var qq = new Question(table[0][2 * q + 2]);
    var ms = regex.exec(table[1][2 * q + 2])[1];
    qq.maxScore = parseInt(ms);
    Test.questions[q] = qq;
  }
  Test.studentsNr = table.length - 2;

  for (var i = 2; i < table.length; i++) {
    var line = table[i];
    Test.studentNames.push(line[0]);
    for (var q1 = 0; q1 < questionsNr; q1++) {
      Test.questions[q1].scores.push(Number(line[2 + 2 * q1])),
        Test.questions[q1].answers.push(line[3 + 2 * q1]);
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
