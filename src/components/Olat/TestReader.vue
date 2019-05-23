<template>
  <div>
    <h2>Daten</h2>
    <p>
      Zur Auswertung der Testergebnisse archivieren Sie zunächst den Test in Open OLAT. Sie finden das Werkzeug zur Datenarchivierung in Ihrem OLAT-Kurs im Menü
      <i>Administration</i>. Ändern Sie die voreingestellten Download-Optionen nicht.
    </p>
    <p>
      Sie erhalten ein zip-Archiv, in dem Sie nach dem Entpacken u.a. eine Datei mit der Endung .xls oder ,xlsx vorfinden. Überschreiben Sie diese Datei
      <u>nicht</u> mit einem anderen Programm, wie etwa einer Tabellenkalkulation! Ziehen Sie diese xls- oder xlsx-Datei mit der Maus in diese Webseite auf die Fläche unten.
    </p>
    <p>
      <input
        class="demoData hvr-grow"
        type="button"
        onclick="location.href='https://dahn-research.eu/TestAnalyzerSampleData/TestdatenOlat.xlsx'"
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
            >xls- oder xlsx-Datei mit der Maus hier ablegen</div>
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
        type = f.name.split(".").pop(),
        csv;

      var reader = new FileReader();
      //name = f.name;

      reader.onload = e => {
        // 1. Getting file
        var data = e.target.result;
        var toAnalyze;

        // 2. Stripping off and storing Legende if necessary
        if (type == "xls") {
          toAnalyze = data.split("\nLegende");
          csv = toAnalyze[0];
        } else {
          // 3. Parsing File into csv if necessary
          var fileData = getXLSX(data);
          csv = XLSX.utils.sheet_to_csv(fileData);
        }

        // 4. Parsing csv into array of arrays of items
        var csvArray;
        if (type == "xls") {
          csvArray = parseCSV(csv, "\t");
        } else {
          csvArray = parseCSV(csv, ",");
        }

        // 5. table2test
        var test = table2Test(csvArray, type);
        test.system = "OLAT_" + type;
        if (type == "xls") {
          addMaxScores(test.questions, toAnalyze[1]);
        }

        //  6. Emit signal (or modify Test object's parts?)
        this.$emit("testRead", test);
      };
      if (type == "xlsx") {
        reader.readAsArrayBuffer(f);
      } else {
        reader.readAsText(f);
      }
    }
  }
};
import XLSX from "xlsx";

function fixdata(data) {
  var o = "",
    l = 0,
    w = 10240;
  for (; l < data.byteLength / w; ++l)
    o += String.fromCharCode.apply(
      null,
      new Uint8Array(data.slice(l * w, l * w + w))
    );
  o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
  return o;
}

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
    return x != "";
  }
  get attempts() {
    return this.answers.filter(this.attempted).length;
  }
}

function table2Test(table, type) {
  var Test = {
    system: "Olat",
    info: "",
    questionsNr: 0,
    studentsNr: 0,
    questions: [],
    studentNames: [],
    isSelfTest: false
  };
  var qTitleRow = table[0];

  var cols = qTitleRow.length;
  var qPkt = [];
  for (var c = 0; c < cols; c++) {
    var qs = qTitleRow[c];

    if (qs.length > 0 && !qs.match(/$Sektion/)) {
      Test.questions[Test.questionsNr] = new Question(qs);
    }
    if (table[1][c].match(/Pkt/)) {
      qPkt[Test.questionsNr] = c;
      Test.questionsNr++;
    }
  }
  if (table[1][1].length == 0) {
    Test.isSelfTest = true;
  }
  var rowNr = 2;
  while (rowNr < table.length) {
    var line = table[rowNr];
    if (Test.isSelfTest) {
      Test.studentNames.push(line[1]);
    } else {
      Test.studentNames.push(line[1] + " " + line[2]);
    }

    if (type == "xlsx") {
      // In xlsx-Dateien erkennt man unversuchte Aufgaben an einem leeren Punkteeintrag
      for (var q1 = 0; q1 < Test.questionsNr; q1++) {
        if (line[qPkt[q1]].length == 0) {
          Test.questions[q1].scores.push(0);
          Test.questions[q1].answers.push("");
        } else {
          Test.questions[q1].scores.push(Number(line[qPkt[q1]]));
          Test.questions[q1].answers.push("X");
        }
      }
    } else {
      // in xls-Dateien erkennt man unversuchte Aufgaben an einem "n/a" in der auf die Punktspalte folgenden Spalte für die Startzeit
      for (q1 = 0; q1 < Test.questionsNr; q1++) {
        Test.questions[q1].scores.push(Number(line[qPkt[q1]]));
        if (line[qPkt[q1] + 1].length < 4) {
          Test.questions[q1].answers.push("");
        } else {
          Test.questions[q1].answers.push("X");
        }
      }
    }

    rowNr++;
  }
  Test.studentsNr = rowNr - 2;
  var qi = 0;
  for (var i = rowNr; i < table.length; i++) {
    if (table[i][2] == "maxValue") {
      Test.questions[qi].maxScore = Number(table[i][3]);
      qi++;
    }
  }

  return Test;
}

function addMaxScores(myQuestions, legend) {
  const regex = /maxValue\s*([\d.]+)/g;
  var i = 0;
  var match = true;
  do {
    match = regex.exec(legend);
    if (match) {
      myQuestions[i].maxScore = Number(match[1]);
      i++;
    }
  } while (match);
}

function getXLSX(data) {
  var fixedData = fixdata(data),
    workbook = XLSX.read(btoa(fixedData), { type: "base64" }),
    firstSheetName = workbook.SheetNames[0];
  return workbook.Sheets[firstSheetName];
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
