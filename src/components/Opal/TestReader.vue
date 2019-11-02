<template>
  <div>
    <h2>Daten</h2>
    <p>Hier fehlt noch eine Anleitung zur Erzeugung der xls-Datei in Opal</p>
    <p>
      <input
        class="demoData hvr-grow"
        type="button"
        onclick="location.href='https://dahn-research.eu/TestAnalyzerSampleData/TestdatenOpal.xls'"
        value="Demo-Daten"
      />
    </p>
    <div v-if="loadError">
      <p>
        Die Datei konnte nicht geladen werden. Wenn diese Datei wirklich von OPAL erzeugt wurde, so schicken Sie bitte eine anonymisierte Version davon an
        <a
          href="mailto:dahn@dahn-research.eu"
        >dahn@dahn-research.eu</a>.
      </p>
    </div>
    <div v-if="processError">
      <p>
        Die Datei wurde geladen, konnte aber nicht verarbeitet werden. Wenn diese Datei wirklich von OPAL stammt, so speichern Sie sie bitte in anonymisierter Form und schicken Sie sie an
        <a
          href="mailto:dahn@dahn-research.eu"
        >dahn@dahn-research.eu</a>.
      </p>
      <p>Beim Öffnen der anonymisierten Datei gibt Excel möglicherweise eine Warnung aus, da sie nicht von einer Excel bekannten Quelle stammt.</p>
      <p>
        <input
          class="demoData hvr-grow"
          type="button"
          v-on:click="anonymize()"
          value="Anonymisieren"
        />
      </p>
    </div>
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
            >xls-Datei mit der Maus hier ablegen</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Question, Line } from "../Reader";
import Spinner from "../../third_party/Spinner.vue";
import { saveAs } from "file-saver";

export default {
  name: "OPAL-Reader",
  data() {
    return {
      loadError: false,
      processError: false,
      loading: false,
      lineArray: []
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
      this.loadError = false;
      this.processError = false;
      var files = e.dataTransfer.files,
        f = files[0];
      var reader = new FileReader();
      //name = f.name;

      reader.onload = e => {
        // 1. Getting file
        var data = e.target.result;
        let jsn = getXLS(data);
        if (jsn == "loadError") {
          this.$emit("errorRead", "loadError");
          this.loading = false;
          return;
        }

        // 2. Stripping off and storing Legende if necessary

        // 3. Parsing File into json

        // 4. Getting array of arrays of items
        this.lineArray = Object.values(jsn)[0];
        if (this.lineArray === undefined) {
          this.loading = false;
          this.loadError = true;
          return;
        }

        // 5. table2test
        var test = table2Test(this.lineArray);
        if (test == "processError") {
          //this.$emit("errorRead", "processError");
          this.loading = false;
          this.processError = true;
          return;
        }
        //  6. Emit signal (or modify Test object's parts?)
        this.$emit("testRead", test);
        this.loading = false;
      };
      reader.readAsArrayBuffer(f);
    },
    // Anonymize and save
    anonymize: function() {
      let names = new Object();
      for (let lineNr = 2; lineNr < this.lineArray.length - 3; lineNr++) {
        let pii =
          this.lineArray[lineNr][1] +
          this.lineArray[lineNr][2] +
          this.lineArray[lineNr][3];
        if (!names.hasOwnProperty(pii)) {
          names[pii] = {
            name: "Name_" + lineNr.toString(),
            given: "Vorname_" + lineNr.toString(),
            matrikel: "Matrikel_" + lineNr.toString()
          };
        }
        this.lineArray[lineNr][1] = names[pii].name;
        this.lineArray[lineNr][2] = names[pii].given;
        this.lineArray[lineNr][3] = names[pii].matrikel;
      }
      writeXLS(this.lineArray);
      this.processError = false;
    }
  }
};

import XLSX from "xlsx";

function process_wb(wb) {
  //global_wb = wb;
  var output = "";
  output = to_json(wb);
  return output;
}

function to_json(workbook) {
  var result = {};
  let sheetName = workbook.SheetNames[0];
  var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
  if (roa.length) result[sheetName] = roa;
  return result;
}

function table2Test(table) {
  try {
    var Test = {
      system: "OPAL",
      questionsNr: 0,
      questions: [],
      studentNameLines: []
    };
    var qPkt = getQuestions();
    var rowNr = 3,
      tl = table.length;
    while (rowNr < tl - 3) {
      let line = table[rowNr - 1],
        lineItems = new Line(),
        firstName = line[2] ? line[2] : "",
        givenName = line[1],
        rowName = firstName + " " + givenName;
      lineItems.lineName = rowName;
      lineItems.lineNr = rowNr;
      for (let q1 = 0; q1 < Test.questionsNr; q1++) {
        let qq = Test.questions[q1];
        let rowAnswer = new Object();
        let s = line[qPkt[q1]];
        let at = s !== undefined;
        if (at) s = s.replace(",", ".");
        rowAnswer = {
          name: qq.name,
          attempted: at,
          score: at ? Number(s) : 0
        };
        lineItems.lineAnswers.push(rowAnswer);
      }
      Test.studentNameLines.push(lineItems);
      rowNr++;
    }
    return Test;
  } catch {
    return "processError";
  }
  //getQuestions collects all questions in Test.questions and returns in qPkt for each question number the nr of the column with its score
  function getQuestions() {
    let qTitleRow = table[0],
      qNr = 0;
    let cols = qTitleRow.length;
    // qPkt: Array hat collects the indices of columns with scores (heading contains 'Pkt')
    let qPkt = [],
      qTitles = [],
      regex = /^Max\.\sPunkte:\s(\d+)/;
    for (let c = 0; c < cols; c++) {
      let qs = qTitleRow[c];
      if (qs && qs.match(regex)) {
        if (qNr > 0) {
          let qT = qTitleRow[c - 1];
          if (qT === undefined || qT.length == 0)
            qT = "Frage " + qNr.toString();
          if (qTitles.includes(qT)) {
            throw "processError";
          }

          //Test.questions[qNr - 1] = new Question("Frage " + qNr.toString());
          Test.questions[qNr - 1] = new Question(qT);
          qTitles.push(qT);
          Test.questions[qNr - 1].maxScore = parseInt(regex.exec(qs)[1]);
          qPkt.push(c);
          qNr++;
        } else {
          Test.setMaxScore = parseInt(regex.exec(qs)[1]);
          qNr = 1;
        }
      }
    }
    Test.questionsNr = qNr - 1;
    if (qNr < 2) throw "processError";
    return qPkt;
  }
}

function handleDragover(e) {
  e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
}

/*
 * see https://oss.sheetjs.com/js-xlsx/ and
 * https://www.youtube.com/watch?v=FymC0XlK0Gs
 * https://redstapler.co/sheetjs-tutorial-convert-excel-html-table/
 */
function getXLS(data) {
  try {
    data = new Uint8Array(data);
    let jsn = process_wb(XLSX.read(data, { type: "array" }));
    return jsn;
  } catch {
    return "loadError";
  }
}

// See https://redstapler.co/sheetjs-tutorial-create-xlsx/
function writeXLS(lineArray) {
  var wb = XLSX.utils.book_new();
  wb.Props = {
    Title: "OPAL Spreadsheet",
    Subject: "Error",
    Author: "Testanalyzer",
    CreatedDate: new Date(2017, 12, 19)
  };
  wb.SheetNames.push("onyx_results");
  var ws = XLSX.utils.aoa_to_sheet(lineArray);
  wb.Sheets["onyx_results"] = ws;
  var wbout = XLSX.write(wb, { bookType: "biff8", type: "binary" });
  saveAs(
    //new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
    new Blob([s2ab(wbout)], { type: "application/vnd.ms-excel" }),
    "opal_anonymous.xls"
  );
}

function s2ab(s) {
  var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
  var view = new Uint8Array(buf); //create uint8array as viewer
  for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff; //convert to octet
  return buf;
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