<template>
  <div>
    <h3>Art des Tests</h3>
    <div v-html="modeText"></div>
    <input
      v-if="showControls"
      class="testButton hvr-grow"
      type="button"
      v-on:click="showControls = false"
      value="Auswahl ausblenden"
    />
    <input
      v-if="!showControls"
      class="testButton hvr-grow"
      type="button"
      v-on:click="showControls=true"
      value="Einstellungen ändern"
    />
    <div v-if="showControls">
      <h4>Auswahl</h4>
      <form>
        <fieldset>
          <legend>Der Test ist...</legend>
          <input
            type="radio"
            id="compulsory"
            name="questionScore"
            value="compulsory"
            v-model="Mode.questionScore"
            @click="typeSelected(['questionScore','compulsory'])"
          />
          <label for="compulsory">
            ... verpflichtend. Es wird erwartet, dass alle Studierenden alle Fragen bearbeiten. Eine nicht beantwortete Frage wird genauso bewertet, wie eine falsch beantwortete Frage.
            <br />
          </label>
          <input
            type="radio"
            id="voluntary"
            name="questionScore"
            value="voluntary"
            v-model="Mode.questionScore"
            @click="typeSelected(['questionScore','voluntary'])"
          />
          <label for="voluntary">
            ... freiwillig. Die Studierenden können wählen, welche Fragen sie bearbeiten. Fragen, die nicht beantwortet wurden, werden bei der Leistungsbewertung nicht berücksichtigt.
            <br />
          </label>
        </fieldset>
      </form>
      <form v-if="Mode.multiLine">
        <p>Studierende haben den Test mehrfach aufgerufen:</p>
        <fieldset>
          <legend>Welcher Versuch zählt?</legend>
          <input
            type="radio"
            id="maxQuestion"
            name="multiLineScore"
            v-model="Mode.multiLineScore"
            value="maxQuestion"
            @click="typeSelected(['multiLineScore','maxQuestion'])"
          />
          <label for="maxQuestion">Für jede Frage wird immer die beste Antwort gewertet.</label>
          <br />
          <input
            type="radio"
            id="maxLine"
            name="multiLineScore"
            v-model="Mode.multiLineScore"
            value="maxLine"
            @click="typeSelected(['multiLineScore','maxLine'])"
          />
          <label for="maxLine">Es wird der Versuchs mit der höchsten Gesamtpunktzahl gewertet.</label>
          <br />
          <input
            type="radio"
            id="avgLine"
            name="multiLineScore"
            v-model="Mode.multiLineScore"
            value="avgLine"
            @click="typeSelected(['multiLineScore','avgLine'])"
          />
          <label for="average">Es wird der Durchschnitt aller Versuche gewertet.</label>
          <br />
          <input
            type="radio"
            id="single"
            name="multiLineScore"
            v-model="Mode.multiLineScore"
            value="single"
            @click="typeSelected(['multiLineScore','single'])"
          />
          <label for="single">Jeder Versuch wird separat gewertet.</label>
        </fieldset>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "ControlCenter",
  props: ["Mode"],
  data() {
    return {
      showControls: false
    };
  },
  methods: {
    typeSelected: function(typeval) {
      this.$emit("typeselected", typeval);
    }
  },
  computed: {
    modeText: function() {
      let text =
        "<p>Bei der Analyse wird von folgenden Annahmen ausgegangen.<br/>";
      switch (this.Mode.questionScore) {
        case "voluntary": {
          text +=
            " Der Test ist freiwillig. Die Studierenden können wählen, welche Fragen sie bearbeiten. Fragen, die nicht beantwortet wurden, werden bei der Leistungsbewertung nicht berücksichtigt.";
          break;
        }
        default: {
          text +=
            " Der Test ist verpflichtend. Es wird erwartet, dass alle Studierenden alle Fragen bearbeiten. Eine nicht beantwortete Frage wird genauso bewertet, wie eine falsch beantwortete Frage.";
        }
      }
      if (this.Mode.multiLine) {
        text += "<br/>";
        switch (this.Mode.multiLineScore) {
          case "maxLine": {
            text +=
              " Es wird der Versuchs mit der höchsten Gesamtpunktzahl gewertet.";
            break;
          }
          case "average": {
            text += " Es wird der Durchschnitt aller Versuche gewertet.";
            break;
          }
          case "single": {
            text += " Jeder Versuch wird separat gewertet.";
            break;
          }
          default: {
            text += " Für jede Frage wird immer die beste Antwort gewertet.";
          }
        }
      }
      return text + "</p>";
    }
  }
};
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
.hvr-grow:not(:hover) {
  transform: scale(1);
}

.testButton {
  border: 1px solid #ccc;
  display: inline-block;
  padding: 6px 12px;
  margin-right: 6px;
  cursor: pointer;
  background-color: hsl(198, 65%, 40%);
  color: white;
  border-radius: 10px;
}
</style>