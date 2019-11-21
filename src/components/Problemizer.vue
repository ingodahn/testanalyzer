<template>
  <div>
    <p :class="Error">{{ errorMessage }}</p>
    <div v-html="problemMessage"></div>

    <input
      class="readerButton hvr-grow"
      type="button"
      v-on:click="handleProblem()"
      :value="buttonText"
    />
    <input
      v-if="status != 'init'"
      class="readerButton hvr-grow"
      type="button"
      v-on:click="cancelProblem()"
      value="Abbrechen"
    />
  </div>
</template>

<script>
//import { ReaderErrors, CSV } from "../Reader";
export default {
  name: "Problemizer",
  //props: ["LineArray", "Error"],
  props: ["Error", "System"],
  //mixins: [ReaderErrors, CSV],
  data() {
    return {
      problemMessage: "",
      status: "init",
      buttonText: "Problem melden"
    };
  },
  methods: {
    handleProblem: function() {
      if (this.Error == "processError" || this.Error == "none") {
        switch (this.status) {
          case "init": {
            //"Report Problem" pressed
            this.problemMessage =
              "<p>Sie können eine <b>anonymisierte</b> Version Ihrer Datei einschicken.</p>";
            this.buttonText = "Daten anonymisieren";
            this.status = "started";
            break;
          }
          case "started": {
            //Anonymize pressed
            this.$emit("anonymize");
            this.problemMessage =
              "<p>Bitte prüfen Sie die Anonymisierung mit einem Texteditor oder einer Tabellenverarbeitung. Eine Tabellenverarbeitung gibt beim Öffnen der anonymisierten Datei möglicherweise eine Warnung aus, da die Datei aus einer unbekannten Quelle stammt. Diese Warnung können Sie ignorieren.</p>";
            this.buttonText = "Absenden";
            this.status = "anonymized";
            break;
          }
          case "anonymized": {
            // Send pressed
            this.problemMessage = "";
            this.$emit("sendMail");
            this.buttonText = "Problem melden";
            this.status = "init";
          }
        }
      } else {
        this.$emit("sendMail");
      }
    },
    cancelProblem: function() {
      this.problemMessage = "";
      this.status = "init";
      this.buttonText = "Problem melden";
      this.status = "init";
      this.$emit("cancelError");
    }
  },
  computed: {
    errorMessage: function() {
      if (this.Error == "loadError")
        return (
          "Die Datei konnte nicht geladen werden. Wenn diese Datei wirklich von " +
          this.System +
          " erzeugt wurde, so melden Sie bitte das Problem. Fügen Sie möglichst eine anonymisierte Version Ihrer Datei bei."
        );
      if (this.Error == "processError")
        return (
          "Die Datei wurde geladen, konnte aber nicht verarbeitet werden. Wenn diese Datei wirklich von " +
          this.System +
          " erzeugt wurde, so melden Sie bitte das Problem. Dabei können Sie eine anonymisierte Version Ihrer Datei erzeugen. Bitte fügen Sie diese Ihrer Problembeschreibung bei."
        );
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
}
</style>