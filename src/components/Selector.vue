<template>
  <div class="select">
    <h2>Bitte wählen Sie Ihr System</h2>
    <nav>
      <router-link to="/imathas">IMathAS</router-link>
      <router-link to="/ilias">ILIAS</router-link>
      <router-link to="/olat">Open OLAT</router-link>
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
