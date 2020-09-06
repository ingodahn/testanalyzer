<template>
  <div class="select">
    <h2>Bitte wählen Sie Ihr System</h2>

    <nav>
      <v-hover v-slot:default="{ hover }" open-delay="200" class="ma-1">
        <v-btn color="primary"
        large
        to="/imathas"
        :elevation="hover ? 16 : 2"
        >
        IMathAS
        </v-btn>
      </v-hover>
      <v-hover v-slot:default="{ hover }" open-delay="200" class="ma-1">
        <v-btn color="primary"
        large
        to="/ilias"
        :elevation="hover ? 16 : 2"
        >
        ILIAS
        </v-btn>
      </v-hover>
      <v-hover v-slot:default="{ hover }" open-delay="200" class="ma-1">
        <v-btn color="primary"
        large
        to="/olat"
        :elevation="hover ? 16 : 2"
        >
        Open OLAT
        </v-btn>
      </v-hover>
      <v-hover v-slot:default="{ hover }" open-delay="200" class="ma-1">
        <v-btn color="primary"
        large
        to="/opal"
        :elevation="hover ? 16 : 2"
        >
        OPAL
        </v-btn>
      </v-hover>
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
