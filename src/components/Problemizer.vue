<template>
  <div>
    <div :class="Error.type">{{ errorMessage }}</div>
    <div v-html="problemMessage"></div>

    <input
      v-if="showButton"
      class="readerButton hvr-grow"
      type="button"
      v-on:click="nextStep()"
      :value="buttonText"
    />
    <input
      v-if="showButton"
      class="readerButton hvr-grow"
      type="button"
      v-on:click="cancelProblem()"
      value="Abbrechen"
    />
  </div>
</template>

<script>
export default {
  name: "Problemizer",
  props: ["System", "Error"],
  data() {
    return {};
  },
  methods: {
    nextStep: function() {
      if (this.Error.type == "loadError") {
        this.$emit("sendMail");
        this.cancelProblem();
      }
      switch (this.Error.status) {
        case "start": {
          //"Report Problem" pressed
          this.Error.status = "started";
          break;
        }
        case "started": {
          //Anonymize pressed
          this.$emit("anonymize");
          this.Error.status = "anonymized";
          break;
        }
        case "anonymized": {
          // Send pressed
          this.$emit("sendMail");
          this.Error.status = "start";
          this.Error.type = "loaded";
          break;
        }
        default:
          this.Error.status = "start";
      }
    },
    cancelProblem: function() {
      let t = this.Error.type;
      this.Error.type =
        t == "processError" || t == "loaded" ? "loaded" : "empty";
      this.Error.status = "start";
    }
  },

  computed: {
    showButton: function() {
      if (
        this.Error.type == "loaded" &&
        (this.Error.status == "started" || this.Error.status == "anonymized")
      )
        return true;
      if (
        this.Error.type == "processError" &&
        (this.Error.status == "start" ||
          this.Error.status == "started" ||
          this.Error.status == "anonymized")
      )
        return true;
      if (this.Error.type == "loadError") return true;
      return false;
    },
    errorMessage: function() {
      if (this.Error.type == "loadError")
        return (
          "Die Datei konnte nicht geladen werden. Wenn diese Datei wirklich von " +
          this.System +
          " erzeugt wurde, so melden Sie bitte das Problem. Fügen Sie möglichst eine anonymisierte Version Ihrer Datei bei."
        );
      if (this.Error.type == "processError")
        return (
          "Die Datei wurde geladen, konnte aber nicht verarbeitet werden. Wenn diese Datei wirklich von " +
          this.System +
          " erzeugt wurde, so melden Sie bitte das Problem. Dabei können Sie eine anonymisierte Version Ihrer Datei erzeugen. Bitte fügen Sie diese Ihrer Problembeschreibung bei."
        );
      return "";
    },
    problemMessage: function() {
      if (
        (this.Error.type == "loaded" || this.Error.type == "processError") &&
        this.Error.status == "started"
      )
        return "<p>Sie können eine <b>anonymisierte</b> Version Ihrer Datei einschicken.</p>";
      if (
        (this.Error.type == "loaded" || this.Error.type == "processError") &&
        this.Error.status == "anonymized"
      )
        return "<p>Bitte prüfen Sie die Anonymisierung mit einem Texteditor oder einer Tabellenverarbeitung. Eine Tabellenverarbeitung gibt beim Öffnen der anonymisierten Datei möglicherweise eine Warnung aus, da die Datei aus einer unbekannten Quelle stammt. Diese Warnung können Sie ignorieren.</p><p><i>Absenden</i> verschickt die Daten noch nicht; dies erledigen Sie mit Ihrem eMail-Programm. Bitte fügen Sie dabei die anonymisierte Datei als Anlage an</p>";
      return "";
    },
    buttonText: function() {
      if (this.Error.type == "processError" && this.Error.status == "start")
        return "Problem melden";
      if (
        (this.Error.type == "loaded" || this.Error.type == "processError") &&
        this.Error.status == "started"
      )
        return "Daten anonymisieren";
      if (
        (this.Error.type == "loaded" || this.Error.type == "processError") &&
        this.Error.status == "anonymized"
      )
        return "Absenden";
      if (this.Error.type == "loadError") return "Problem melden";
      return "";
    }
  }
};
</script>

<style scoped>
.loadError,
.processError {
  border-color: red;
  border-style: solid;
  padding: 1em;
  margin-bottom: 1em;
}
</style>