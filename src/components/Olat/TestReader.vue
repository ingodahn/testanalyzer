<template>
  <div>
    <p>
      <b>Daten laden:</b> Zur Auswertung der Testergebnisse archivieren Sie zunächst den Test in Open OLAT. Sie finden das Werkzeug zur Datenarchivierung in Ihrem OLAT-Kurs im Menü
      <i>Administration</i>. Ändern Sie die voreingestellten Download-Optionen nicht.
    </p>
    <p>
      Sie erhalten ein zip-Archiv, in dem Sie nach dem Entpacken u.a. eine Datei mit der Endung .xls oder ,xlsx vorfinden. Überschreiben Sie diese Datei
      <u>nicht</u> mit einem anderen Programm, wie etwa einer Tabellenkalkulation! Ziehen Sie diese xls- oder xlsx-Datei mit der Maus in diese Webseite auf die Fläche unten.
    </p>
    <p>
      <input
        class="demoData"
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
    sendResult: function(M, C) {
      this.emit(M, C);
    },
    handleDragover: handleDragover,
    handleDrop: function(e) {
      e.stopPropagation();
      e.preventDefault();
      var files = e.dataTransfer.files,
        f = files[0],
        type = f.name.split(".").pop(),
        csv;
      /* We distinguish type zip, xls and alsx which all require different handlings
       * In each case a reader (zip or fileReader) is defined and
       * zip.loadAsync is a promise and calls the function with then when the file is loaded.
       * fileReader calls the function set as onLoad when the file is loaded.
       * These functions performe the further analysis and emit testread to the parent component
       */
      if (type == "zip") {
        var zip = new JSZip();
        zip.loadAsync(f /* = file blob */).then(
          function(zip) {
            unzipXlsX(zip);
          },
          function() {
            alert("Not a valid zip file");
          }
        );
      } else {
        var reader = new FileReader();
        //name = f.name;

        reader.onload = e => {
          // 1. Getting file
          var data = e.target.result;
          var toAnalyze;

          // 2. Stripping off and storing Legende if necessary
          switch (type) {
            case "xls":
              toAnalyze = data.split("\nLegende");
              csv = toAnalyze[0];
              break;
            case "xlsx":
              var fileData = getXLSX(data);
              csv = XLSX.utils.sheet_to_csv(fileData);
              break;
            default:
          }

          // 4. Parsing csv into array of arrays of items
          var csvArray;
          switch (type) {
            case "xls":
              csvArray = parseCSV(csv, "\t");
              break;
            case "xlsx":
              csvArray = parseCSV(csv, ",");
              break;
            default:
          }

          // 5. table2test
          var test = table2Test(csvArray, type);
          test.system = "OLAT_" + type;
          if (type == "xls") {
            addMaxScores(test.questions, toAnalyze[1]);
          }

          //  6. Emit signal (or modify Test object's parts?)
          if (type == "xls" || type == "xlsx") {
            this.$emit("testRead", test);
          }
        };
        // End reader.onload
        switch (type) {
          case "xlsx":
            reader.readAsArrayBuffer(f);
            break;
          case "xls":
            reader.readAsText(f);
            break;
          default:
        }
      }
    }
  }
};
import XLSX from "xlsx";
import JSZip from "jszip";

function handleData(data, type) {
  var csv, toAnalyze;

  // 2. Stripping off and storing Legende if necessary
  switch (type) {
    case "xls":
      toAnalyze = data.split("\nLegende");
      csv = toAnalyze[0];
      break;
    case "xlsx":
      var fileData = getXLSX(data);
      csv = XLSX.utils.sheet_to_csv(fileData);
      break;
    default:
  }

  // 4. Parsing csv into array of arrays of items
  var csvArray;
  switch (type) {
    case "xls":
      csvArray = parseCSV(csv, "\t");
      break;
    case "xlsx":
      csvArray = parseCSV(csv, ",");
      break;
    default:
  }

  // 5. table2test
  var test = table2Test(csvArray, type);
  test.system = "OLAT_" + type;
  if (type == "xls") {
    addMaxScores(test.questions, toAnalyze[1]);
  }
  return test;
}

function xtype(ff) {
  const tf = ff.name.split(".").pop();
  return tf == "xls" || tf == "xlsx";
}

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

function unzipXlsX(zip) {
  var zipFiles = Object.values(zip.files);
  var ff = zipFiles.find(xtype);

  if (!ff) {
    alert("Keine xls- oder xlsx-Datei gefunden");
  } else {
    var zipType = ff.name.split(".").pop();
    var zipReadType = zipType == "xlsx" ? "nodebuffer" : "text";

    // ggf. nodebuffer statt text
    ff.async(zipReadType).then(function(content) {
      var test = handleData(content, zipType);

      //eslint-disable-next-line
      console.log(test);
      this.sendResult("xxx", test);
    });
  }
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
