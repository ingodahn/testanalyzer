<template>
  <div>
    <h3>Art des Tests</h3>
    <p></p>
    <div v-html="modeText"></div>
    <p>
      <!--
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
      -->
      <v-hover v-slot:default="{ hover }" open-delay="200" class="ma-1">
          <v-btn color="primary"
          v-if="showControls"
          v-on:click="showControls=false"
          :elevation="hover ? 16 : 2"
          >
          Auswahl ausblenden
          </v-btn>
      </v-hover>
      <v-hover v-slot:default="{ hover }" open-delay="200" class="ma-1">
        <v-btn color="primary"
        v-if="!showControls"
        v-on:click="showControls=true"
        :elevation="hover ? 16 : 2"
        >
        Einstellungen ändern
        </v-btn>
      </v-hover>
    </p>
    <div v-if="showControls">
      <h4>Auswahl</h4>
      <v-form>
        <v-radio-group v-model="Mode.questionScore">
          <template v-slot:label>
            <div>Der Test ist...</div>
          </template>
          <v-radio value="compulsory" @click="typeSelected(['questionScore','compulsory'])">
            <template v-slot:label>
              <div>... verpflichtend. Es wird erwartet, dass alle Studierenden alle Fragen bearbeiten. Eine nicht beantwortete Frage wird genauso bewertet, wie eine falsch beantwortete Frage.</div>
            </template>
          </v-radio>
          <v-radio value="voluntary" @click="typeSelected(['questionScore','voluntary'])">
            <template v-slot:label>
              <div>... freiwillig. Die Studierenden können wählen, welche Fragen sie bearbeiten. Fragen, die nicht beantwortet wurden, werden bei der Leistungsbewertung nicht berücksichtigt.</div>
            </template>
          </v-radio>
        </v-radio-group>
      </v-form>

      <v-form v-if="Mode.multiLine">
        <p>Studierende haben den Test mehrfach aufgerufen:</p>
        <v-radio-group v-model="Mode.multiLineScore" label="Welcher Versuch zählt für die Gesamtleistung?">
          <v-radio value="maxQuestion" @click="typeSelected(['multiLineScore','maxQuestion'])" label="Für jede Frage wird immer die beste Antwort gewertet.">
          </v-radio>
          <v-radio value="maxLine" @click="typeSelected(['multiLineScore','maxLine'])" label="Es wird der Versuch mit der höchsten Gesamtpunktzahl gewertet.">
          </v-radio>
          <v-radio value="avgLine" @click="typeSelected(['multiLineScore','avgLine'])" label="Es wird der Durchschnitt aller Versuche gewertet."></v-radio>
          <v-radio value="single" @click="typeSelected(['multiLineScore','single'])" label="Jeder Versuch wird separat gewertet."></v-radio>
        </v-radio-group>
      </v-form>
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