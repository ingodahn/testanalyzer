<template>
  <span>
    <span v-if="PlayerType=='selector'">
      <span v-if="ListData.length == 1">{{ListData[0]}}</span>
      <span v-else>
        <v-select :items="ListData" :value="ListData[0]" solo dense></v-select>
      </span>
    </span>
    <span v-if="PlayerType == 'player'">
      <span v-if="curItem < ListData.length">
        {{ listItem }}
        <span class="listSwitch">
          <v-hover v-if="curItem > 1" v-slot:default="{ hover }" open-delay="200" class="ma-1">
            <v-btn icon color="primary"
            v-on:click="curItem=0"
            :elevation="hover ? 16 : 2"
            >
              <v-icon>mdi-skip-backward</v-icon>
            </v-btn>
          </v-hover>
          <v-hover v-if="curItem > 0" v-slot:default="{ hover }" open-delay="200" class="ma-1">
            <v-btn icon color="primary"
            v-on:click="curItem--"
            :elevation="hover ? 16 : 2"
            >
              <v-icon>mdi-step-backward</v-icon>
            </v-btn>
          </v-hover>
          <v-hover v-if="curItem < ListData.length-1" v-slot:default="{ hover }" open-delay="200" class="ma-1">
            <v-btn icon color="primary"
            v-on:click="curItem++"
            :elevation="hover ? 16 : 2"
            >
              <v-icon>mdi-step-forward</v-icon>
            </v-btn>
          </v-hover>
          <v-hover v-if="curItem < ListData.length-2" v-slot:default="{ hover }" open-delay="200" class="ma-1">
            <v-btn icon color="primary"
            v-on:click="curItem=ListData.length-1"
            :elevation="hover ? 16 : 2"
            >
              <v-icon>mdi-skip-forward</v-icon>
            </v-btn>
          </v-hover>
        </span>
      </span>
    </span>
  </span>
</template>

<script>
export default {
  props: {
    "ListData": {
      type: Array,
    },
    "PlayerType": {
      type: String,
      default: "player"
    }
  },
  data() {
    return {
      curItem: 0,
    }
  },

  computed: {
    listItem: function() {
      return this.ListData[this.curItem];
    }
  }
}
</script>
