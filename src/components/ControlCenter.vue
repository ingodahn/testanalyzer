<template>
  <div>
    <h3>Art des Tests</h3>
    <form v-if="Mode.multiLine">
      <fieldset>
        <legend>Bei Studierenden mit mehreren Versuchen...</legend>
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
            ... wird für jede Frage das beste Ergebnis gewertet.
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
            ... wird der Versuch mit dem besten Gesamtergebnis gewwertet.
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
            ... wird der Durchschnitt aller Versuche gewertet.
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
            ... wird jeder Versuch separat gewertet.
            <br />
          </label>
        </div>
      </fieldset>
    </form>
    <br />
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
    <br />
    <form v-if="(Mode.multiLine && ! (Mode.studentScore == 'single')) || Mode.multiQuestion">
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
          ... das beste Ergebnis.
          <br />
        </label>
        <input
          type="radio"
          id="multiAvgQuestion"
          name="multiQuestionScore"
          value="multiAvgQuestion"
          v-model="Mode.multiQuestionScore"
          @click="typeSelected(['multiQuestionScore','multiAvgQuestion'])"
        />
        <label for="multiAvgQuestion">
          ... der Durchschnitt aller Ergebnisse.
          <br />
        </label>
      </fieldset>
    </form>
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
