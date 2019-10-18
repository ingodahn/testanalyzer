<template>
  <div>
    <h3>Art des Tests</h3>
    <fieldset>
      <legend>Bitte wählen Sie die Art des Tests.</legend>
      <div>
        <input
          type="radio"
          id="compulsory"
          name="testType"
          value="compulsory"
          v-model="typeset"
          checked
          @click="typeSelected('compulsory')"
        />
        <label
          for="compulsory"
        >Der Test ist verpflichtend. Es wird erwartet, dass alle Studierenden alle Fragen bearbeiten. Eine nicht beantwortete Frage wird in der Analyse genauso bewertet, wie eine falsch beantwortete Frage.</label>
      </div>
      <div>
        <input
          type="radio"
          id="voluntary"
          name="testType"
          value="voluntary"
          v-model="typeset"
          @click="typeSelected('voluntary')"
        />
        <label
          for="voluntary"
        >Der Test ist freiwillig. Die Studierenden können wählen, welche Fragen sie bearbeiten. Die Analyse berücksichtigt nur Fragen, die beantwortet wurden.</label>
      </div>
    </fieldset>
  </div>
</template>

<script>
export default {
  name: "SetType",
  props: ["testtype"],
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
