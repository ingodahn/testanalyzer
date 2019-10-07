<template>
  <div id="app">
    <orbit-spinner :animation-duration="1200" :size="55" :color="'hsl(198, 65%, 40%)'" />
  </div>
</template>

<script>
import { OrbitSpinner } from "epic-spinners";
export default {
  name: "Spinner",
  components: {
    OrbitSpinner
  }
};
</script>