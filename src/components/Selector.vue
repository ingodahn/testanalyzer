<template>
  <div class="select">
    <h2>Bitte wählen Sie Ihr System</h2>
    <nav>
      <router-link to="/imathas" class="hvr-grow">IMathAS</router-link>
      <router-link to="/ilias" class="hvr-grow">ILIAS</router-link>
      <router-link to="/olat" class="hvr-grow">Open OLAT</router-link>
      <router-link to="/opal" class="hvr-grow">OPAL</router-link>
    </nav>
  </div>
</template>

<style scoped>
body {
  background-color: #eeeeee;
  font-family: "Montserrat", sans-serif;
  display: grid;
  grid-template-rows: auto;
  justify-items: center;
  padding-top: 50px;
}

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

nav {
  padding: 20px 20px 20px 0;
}

nav a {
  padding: 10px;
  text-decoration: none;
  background: hsl(198, 65%, 40%);
  border-radius: 5px;
  color: #fff;
  font-weight: bold;
  margin-right: 15px;
}
</style>
