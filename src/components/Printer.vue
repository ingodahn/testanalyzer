<template>
  <v-hover v-slot:default="{ hover }" open-delay="200" class="ma-1">
    <v-btn color="primary"
    :elevation="hover ? 16 : 2"
    v-print
    >
    Seite drucken
    </v-btn>
  </v-hover>
</template>

<script>
export default {
  data() {
    return {};
  }
};
</script>