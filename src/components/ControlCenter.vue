<template>
  <div>
    <h3>Art des Tests</h3>
    <form v-if="Mode.multiLine">
      <fieldset>
        <legend>Studierende haben mehrere Versuche gemacht. Wie bewerten Sie deren Gesamtleistung?</legend>
        <div>
          <input
            v-if="!Mode.multiQuestion"
            type="radio"
            id="maxQuestion"
            name="studentScore"
            value="maxQuestion"
            v-model="Mode.studentScore"
            @click="typeSelected(['studentScore','maxQuestion'])"
          />
          <label for="maxQuestion">
            Für jede Frage wird das beste Ergebnis gewertet.
            <br />
          </label>
          <input
            type="radio"
            id="maxLine"
            name="studentScore"
            value="maxLine"
            v-model="Mode.studentScore"
            @click="typeSelected(['studentScore','maxLine'])"
          />
          <label for="maxLine">
            Der Versuch mit dem besten Gesamtergebnis zählt.
            <br />
          </label>
          <input
            type="radio"
            id="avgLine"
            name="studentScore"
            value="avgLine"
            v-model="Mode.studentScore"
            @click="typeSelected(['studentScore','avgLine'])"
          />
          <label for="avgLine">
            Es wird der Durchschnitt aller Versuche genommen.
            <br />
          </label>
          <input
            type="radio"
            id="single"
            name="studentScore"
            value="single"
            v-model="Mode.studentScore"
            @click="typeSelected(['studentScore','single'])"
          />
          <label for="single">
            Jeder Versuch wird separat bewertet.
            <br />
          </label>
        </div>
      </fieldset>
    </form>
    <br />
    <form>
      <fieldset>
        <legend>Wie bewerten Sie die Kenntnisse der Studierenden bei einzelnen Fragen?</legend>
        <input
          type="radio"
          id="compulsory"
          name="questionScore"
          value="compulsory"
          v-model="Mode.questionScore"
          @click="typeSelected(['questionScore','compulsory'])"
        />
        <label for="compulsory">
          Der Test ist verpflichtend. Es wird erwartet, dass alle Studierenden alle Fragen bearbeiten. Eine nicht beantwortete Frage wird genauso bewertet, wie eine falsch beantwortete Frage.
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
          Der Test ist freiwillig. Die Studierenden können wählen, welche Fragen sie bearbeiten. Fragen, die nicht beantwortet wurden, werden bei der Leistungsbewertung nicht berücksichtigt.
          <br />
        </label>
      </fieldset>
    </form>
    <br />
    <form v-if="Mode.multiLine || Mode.multiQuestion">
      <fieldset>
        <legend>Bei mehrfach gestellten Fragen zählt...</legend>
        <input
          type="radio"
          id="multiMaxQuestion"
          name="multiQuestionScore"
          value="multiMaxQuestion"
          v-model="Mode.multiQuestionScore"
          @click="typeSelected(['multiQuestionScore','multiMaxQuestion'])"
        />
        <label for="multiMaxQuestion">
          ...das beste Ergebnis.
          <br />
        </label>
        <input
          type="radio"
          id="multiAvgQuestion"
          name="questionScore"
          value="voluntary"
          v-model="Mode.multiQuestionScore"
          @click="typeSelected(['multiQuestionScore','multiAvgQuestion'])"
        />
        <label for="voluntary">
          ... der Durchschnitt aller Ergebnisse.
          <br />
        </label>
      </fieldset>
    </form>
    <!--
    <form v-if="Mode.multiLine || Mode.multiQuestion">
        <h3>Mehrfache Versuche</h3>
        <p>Studierende haben Fragen mehrfach bearbeitet. Welcher Versuch zählt?</p>
        <fieldset>
          <input type="radio" id="maxQuestion" v-model="multiLineScore" value="maxQuestion" />
          <label for="maxQuestion">Für jede Frage wird die beste Antwort gewertet<br/></label>
          <br />
          <input type="radio" id="maxLine" v-model="multiLineScore" value="maxLine" />
          <label
            for="maxLine"
          >Es werden die Antworten des Versuchs mit der höchsten Gesamtpunktzahl gewertet<br/></label>
          <br />
          <input type="radio" id="single" v-model="multiLineScore" value="single" />
          <label for="single">Jeder Versuch wird separat gewertet<br/></label>
        </fieldset>
        <br />
      </form>
    -->
  </div>
</template>

<script>
export default {
  name: "ControlCenter",
  props: ["Mode"],
  data() {
    return {
      typeset: this.testtype
    };
  },
  methods: {
    typeSelected: function(typeval) {
      this.$emit("typeselected", typeval);
    }
  }
};
</script>
