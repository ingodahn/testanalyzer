<template>
  <div>
    <div v-if="ShowUpload">
      <h2>
        Daten
        <input
          class="readerButton hvr-grow"
          type="button"
          onclick="location.href='https://dahn-research.eu/TestAnalyzerSampleData/TestdatenOlat.xlsx'"
          value="Demo-Daten"
        />
      </h2>
      <p>
        Zur Auswertung der Testergebnisse archivieren Sie zunächst den Test in Open OLAT. Sie finden das Werkzeug zur Datenarchivierung in Ihrem OLAT-Kurs im Menü
        <i>Administration</i>. Ändern Sie die voreingestellten Download-Optionen nicht.
      </p>
      <p>
        Sie erhalten ein zip-Archiv, in dem Sie nach dem Entpacken u.a. eine Datei mit der Endung .xls oder ,xlsx vorfinden. Überschreiben Sie diese Datei
        <u>nicht</u> mit einem anderen Programm, wie etwa einer Tabellenkalkulation! Ziehen Sie diese xls- oder xlsx-Datei mit der Maus in diese Webseite auf die Fläche unten.
      </p>
    </div>

    <Problemizer
      v-if="error != 'empty'"
      :Error="error"
      :System="system"
      v-on:anonymize="anonymize()"
      v-on:sendMail="sendMail()"
      v-on:cancelError="cancelError()"
    ></Problemizer>

    <br />

    <div id="app" v-if="ShowUpload">
      <Spinner v-if="loading" class="spinner"></Spinner>
      <div v-else class="container-responsive">
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
import { Question, Line, ReaderErrors, CSV } from "../Reader";
import Spinner from "../../third_party/Spinner.vue";
import Problemizer from "../Problemizer";
import XLSX from "xlsx";
import { saveAs } from "file-saver";

export default {
  props: ["ShowUpload"],
  data() {
    return {
      system: "Open OLAT",
      loading: false,
      lineArray: [],
      type: "",
      legend: ""
    };
  },
  mixins: [ReaderErrors, CSV],
  components: {
    Problemizer,
    Spinner
  },
  methods: {
    handleDragover: handleDragover,
    handleDrop: function(e) {
      e.stopPropagation();
      e.preventDefault();
      let component = this;
      this.loading = true;
      this.cancelError();
      var files = e.dataTransfer.files,
        f = files[0],
        csv;
      this.type = f.name.split(".").pop();
      var reader = new FileReader();

      reader.onload = e => {
        try {
          // 1. Getting file
          var data = e.target.result;
          var toAnalyze;

          // 2. Stripping off and storing Legende if necessary
          if (this.type == "xls") {
            toAnalyze = data.split("\nLegende");
            if (toAnalyze.length != 2) throw "loadError";
            csv = toAnalyze[0];
          } else {
            // 3. Parsing File into csv if necessary
            var fileData = getXLSX(data);
            csv = XLSX.utils.sheet_to_csv(fileData);
          }

          // 4. Parsing csv into array of arrays of items
          if (this.type == "xls") {
            this.lineArray = this.parseCSV(csv, "\t");
            this.legend = toAnalyze[1];
          } else {
            this.lineArray = this.parseCSV(csv, ",");
          }

          // 5. table2test
          var test = table2Test(this.lineArray, this.type);
          test.system = "OLAT_" + this.type;
          if (this.type == "xls") {
            addMaxScores(test.questions, this.legend);
          }
          //  6. Emit signal (or modify Test object's parts?)
          this.$emit("testRead", test);
          this.loading = false;
        } catch (er) {
          if (er == "loadError") component.handleLoadError();
          if (er == "processError") component.handleProcessError();
        }
      };
      if (this.type == "xlsx") {
        reader.readAsArrayBuffer(f);
      } else {
        reader.readAsText(f);
      }
    },

    // Anonymize and save
    anonymize: function() {
      let regex = /^\d+$/;
      let firstRows = new Object(),
        selfTest = this.isSelfTest;
      for (let lineNr = 2; lineNr < this.lineArray.length; lineNr++) {
        let line = this.lineArray[lineNr];
        if (line[0].match(regex)) {
          let pii = selfTest ? line[1] : line[1] + " " + line[2];
          if (!firstRows.hasOwnProperty(pii)) firstRows[pii] = lineNr;
          let ns = firstRows[pii].toString();
          if (selfTest) {
            line[1] = "Name_" + ns;
          } else {
            line[1] = "Vorname_" + ns;
            line[2] = "Name_" + ns;
            line[3] = "k.A.";
            line[4] = "k.A.";
            line[5] = "k.A.";
            line[8] = "k.A.";
          }
        }
      }

      if (this.type == "xls") {
        let outLines = this.lineArray.map(line => line.join("\t"));
        let outData = outLines.join("\n") + "\nLegende" + this.legend;
        let blob = new Blob([outData], {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8"
        });
        saveAs(blob, "olat_anonymous.xls");
        return;
      }
      writeXLS(this.lineArray);
    }
  },
  computed: {
    isSelfTest: function() {
      let ar = this.lineArray;
      return (ar.length > 1) & (ar[1].length > 2) & (ar[1][2] == "Nachname")
        ? false
        : true;
    }
  }
};

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

function table2Test(table, type) {
  try {
    var Test = {
      system: "Olat",
      questionsNr: 0,
      questions: [],
      studentNameLines: [],
      isSelfTest: false
    };
    var qPkt = getQuestions();
    if (Test.questionsNr == 0) throw "processError";
    Test.isSelfTest = table[1][2] == "Nachname" ? false : true;
    var rowNr = 3,
      rowName = "",
      tl = table.length;
    if (type == "xls") tl--;
    while (rowNr < tl) {
      var line = table[rowNr - 1],
        lineItems = new Line();
      rowName = Test.isSelfTest ? line[1] : line[1] + " " + line[2];
      lineItems.lineName = rowName;
      lineItems.lineNr = rowNr;

      for (var q1 = 0; q1 < Test.questionsNr; q1++) {
        var qq = Test.questions[q1];
        let rowAnswer = new Object();
        switch (type) {
          case "xlsx": {
            // In xlsx-Dateien erkennt man unversuchte Aufgaben an einem leeren Punkteeintrag
            let scoreVal = Number(line[qPkt[q1]]);
            rowAnswer =
              line[qPkt[q1]].length == 0
                ? { attempted: false, score: 0 }
                : { attempted: true, score: scoreVal };
            break;
          }
          default: {
            // in xls-Dateien erkennt man unversuchte Aufgaben an einem "n/a" in der auf die Punktspalte folgenden Spalte für die Startzeit oder 0 für die Dauer
            let regex = /^n\/a$|^0$/;
            rowAnswer = {
              score: Number(line[qPkt[q1]]),
              attempted: line[qPkt[q1] + 1].match(regex) ? false : true
            };
          }
        }
        rowAnswer["name"] = qq.name;
        lineItems.lineAnswers.push(rowAnswer);
      }
      Test.studentNameLines.push(lineItems);
      rowNr++;
    }

    return Test;
  } catch {
    throw "processError";
  }
  //getQuestions collects all questions in Test.questions and returns in qPkt for each question number the nr of the column with its score
  function getQuestions() {
    var qTitleRow = table[0];
    var cols = qTitleRow.length;
    // qPkt: Array hat collects the indices of columns with scores (heading contains 'Pkt')
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
    return qPkt;
  }
}

function addMaxScores(myQuestions, legend) {
  try {
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
    return "ok";
  } catch {
    throw "processError";
  }
}

function getXLSX(data) {
  try {
    var fixedData = fixdata(data),
      workbook = XLSX.read(btoa(fixedData), { type: "base64" }),
      firstSheetName = workbook.SheetNames[0];
    return workbook.Sheets[firstSheetName];
  } catch {
    throw "loadError";
  }
}

// See https://redstapler.co/sheetjs-tutorial-create-xlsx/
function writeXLS(lineArray) {
  var wb = XLSX.utils.book_new();
  wb.Props = {
    Title: "Open OLAT Spreadsheet",
    Subject: "Error",
    Author: "Testanalyzer",
    CreatedDate: new Date()
  };
  wb.SheetNames.push("olat_results");
  var ws = XLSX.utils.aoa_to_sheet(lineArray);
  wb.Sheets["olat_results"] = ws;
  var wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
  saveAs(
    //new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
    new Blob([s2ab(wbout)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }),
    "olat_anonymous.xlsx"
  );
}

function s2ab(s) {
  var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
  var view = new Uint8Array(buf); //create uint8array as viewer
  for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff; //convert to octet
  return buf;
}
</script>

<style>
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
.readerButton {
  border: 1px solid #ccc;
  display: inline-block;
  padding: 6px 12px;
  margin-right: 6px;
  cursor: pointer;
  background-color: hsl(198, 65%, 40%);
  color: white;
  border-radius: 10px;
}

.readerButton.anonymize {
  background-color: green;
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
