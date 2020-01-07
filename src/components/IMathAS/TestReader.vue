<template>
  <div>
    <div v-if="ShowUpload">
      <h2>
        Daten
        <input
          class="readerButton hvr-grow"
          type="button"
          onclick="location.href='https://dahn-research.eu/TestAnalyzerSampleData/TestdatenIMathAS.csv'"
          value="Demo-Daten"
        />
      </h2>
      <p>
        Testergebnisse finden Sie im Gradebook von IMathAS. Sie erreichen das Gradebook, wenn Sie auf das Zahnrad neben dem Test klicken und dann
        <i>Noten</i> auswählen. Auf der dann erscheinenden Seite gibt es unten den Link
        <i>Export Student Answer Details</i>. Klicken Sie darauf und nehmen Sie die Einstellungen genau so vor, wie auf diesem Bild gezeigt.
      </p>
      <img class="center" src="./assets/csvEinstellung.png" />
      <p>Ziehen Sie die so erstellte csv-Datei mit der Maus in diese Webseite auf die Fläche unten.</p>
    </div>

    <Problemizer
      :Error="Error"
      :System="system"
      v-on:anonymize="anonymize()"
      v-on:sendMail="sendMail()"
    ></Problemizer>
    <br />
    <div id="app" v-if="ShowUpload">
      <Spinner v-if="loading" class="spinner"></Spinner>
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
import axios from "axios";
import { Question, Line, ReaderErrors, CSV } from "../Reader";
import Spinner from "../../third_party/Spinner.vue";
import Problemizer from "../Problemizer";

export default {
  props: ["ShowUpload", "Error", "Data"],
  data() {
    return {
      system: "IMathAS",
      autoMode: false,
      loading: false,
      lineArray: []
    };
  },
  mixins: [ReaderErrors, CSV],
  components: {
    Problemizer,
    Spinner
  },
  created: function() {
    let q = this.$route.query;
    if (q.hasOwnProperty("cid") & q.hasOwnProperty("aid")) {
      //eslint-disable-next-line
      console.log("Lade Test");
      this.autoMode = { cid: q.cid, aid: q.aid };
      axios({
        method: "GET",
        url: "../TestdatenIMathAS.csv"
      }).then(
        result => {
          this.autoMode.data = result.data; // Speicherung später rausnehmen
          //eslint-disable-next-line
          console.log("Daten geladen");
          this.handleData(this.autoMode.data);
        },
        error => {
          //eslint-disable-next-line
          console.error(error);
        }
      );
    }
  },
  methods: {
    handleDragover: handleDragover,
    handleDrop: function(e) {
      let component = this;
      try {
        e.stopPropagation();
        e.preventDefault();
        this.loading = true;
        this.cancelError();
        var files = e.dataTransfer.files,
          f = files[0],
          csv;
        let type = f.name.split(".").pop();
        if (!type.match(/csv/i)) throw "loadError";
        var reader = new FileReader();
        reader.onload = e => {
          try {
            // 1. Getting file
            csv = e.target.result;
            this.handleData(csv);
          } catch (er) {
            if (er == "loadError") component.handleLoadError();
            if (er == "processError") component.handleProcessError();
          }
        };
        reader.readAsText(f);
      } catch (er) {
        if (er == "loadError") component.handleLoadError();
        if (er == "processError") component.handleProcessError();
      }
    },
    handleData: function(csv) {
      // 2. Stripping off and storing Legende if necessary
      // 3. Parsing File into csv if necessary

      // 4. Parsing csv into array of arrays of items
      this.lineArray = this.parseCSV(csv, ",");

      // 5. table2test
      var test = table2Test(this.lineArray);

      //  6. Emit signal (or modify Test object's parts?)
      this.$emit("testRead", test);
      this.loading = false;
      this.Error.type = "loaded";
    },
    // Anonymize and save
    anonymize: function() {
      let firstRows = new Object();
      for (let lineNr = 2; lineNr < this.lineArray.length; lineNr++) {
        let line = this.lineArray[lineNr];
        let pii = line[0];
        if (!firstRows.hasOwnProperty(pii)) firstRows[pii] = lineNr;
        let ns = firstRows[pii].toString();
        line[0] = "Name_" + ns;
      }
      this.writeCSV(this.lineArray, ",", "imathas_anonymous.csv");
      this.processError = "anonymized";
      return;
    }
  }
};

function handleDragover(e) {
  e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
}

function table2Test(table) {
  try {
    var Test = {
      system: "IMathAS",
      info: "",
      questionsNr: 0,
      studentsNr: 0,
      setMaxScore: "none",
      questions: [],
      studentNameLines: []
    };
    var headings = table[0];
    let qCols = getQuestions();
    Test.setMaxScore = getMaxScore();
    Test.studentsNr = table.length - 2;
    for (let i = 2; i < table.length; i++) {
      let line = table[i];
      let lineItems = new Line();
      lineItems.lineName = line[0];
      lineItems.lineNr = i;
      for (let qNr = 0; qNr < Test.questionsNr; qNr++) {
        let rowAnswer = {
          name: Test.questions[qNr].name,
          attempted: line[qCols[qNr] + 1] != "",
          score: Number(line[qCols[qNr]])
        };
        lineItems.lineAnswers.push(rowAnswer);
      }
      Test.studentNameLines.push(lineItems);
    }
    return Test;
  } catch {
    throw "processError";
  }
  // getQuestions returns the array of column nrs for the questionscores
  function getQuestions() {
    try {
      let qPkt = new Array(),
        questionsNr = 0,
        cNr = 0,
        regex = /Points \((\d+) possible\)/;
      while (cNr < headings.length) {
        if (headings[cNr].match(/^Question/)) {
          let qq = new Question(headings[cNr]);
          var ms = regex.exec(table[1][cNr])[1];
          qq.maxScore = parseInt(ms);
          qPkt.push(cNr);
          Test.questions.push(qq);
          questionsNr++;
          cNr = cNr + 2;
        } else {
          cNr++;
        }
      }
      Test.questionsNr = questionsNr;
      return qPkt;
    } catch {
      throw "processError";
    }
  }

  function getMaxScore() {
    let maxScore = 0,
      rex = /(Question\s\d+)-/,
      root = "",
      ssq = 0;
    Test.questions.forEach(q => {
      let qnParts = rex.exec(q.name);
      if (qnParts) {
        if (qnParts[1] != root) {
          maxScore += ssq;
          root = qnParts[1];
          ssq = q.maxScore;
        } else {
          ssq = Math.max(ssq, q.maxScore);
        }
      } else {
        maxScore += ssq;
        maxScore += q.maxScore;
      }
    });
    maxScore += ssq;
    return maxScore;
  }
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
