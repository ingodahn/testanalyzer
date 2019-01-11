<template>
    <div>
        <ul>
            <li><a href="#context">Kontext</a></li>
            <li v-if="$route.path == '/'"><a href="#system">Systemauswahl</a></li>
            <li><a href="#upload">Daten hochladen</a></li>
            <li><a href="#testType">Art des Tests</a></li>
            <div v-if="QuestionsNr > 0">
                <li><a href="#scoreDistribution" :class="warnLevel('scoreDistribution')">Punkteverteilung</a></li>
                <li><a href="#less" :class="warnLevel('less')">Wenig Punkte</a></li>
                <li><a href="#more" :class="warnLevel('more')">Viele Punkte</a></li>
                <li><a href="#attempts" :class="warnLevel('attempts')">Ungenutzt</a></li>
                <li><a href="#best" :class="warnLevel('best')">Die Besten</a></li>
                <li><a href="#questionStatistics">Fragen-Statistik</a></li>
                <!--
                <li><a href="#rasch">Rasch-Modell</a></li>
                -->
            </div>
            <div v-else>
                <li class="inactive">Punkteverteilung</li>
                <li class="inactive">Wenig Punkte</li>
                <li class="inactive">Ungenutzt</li>
                <li class="inactive">Die Besten</li>
                <li class="inactive">Fragen-Statistik</li>
            </div>
        </ul>
    </div>
</template>

<script>
export default {
    name: "Navigation",
    props: ["QuestionsNr","ComponentStatus"],
    methods: {
        warnLevel: function (c) {
            return this.ComponentStatus[c];
        }
    }
}

</script>

<style scoped>
    li {
         list-style: none;
    }
    a {
        display: block;
        padding: 4px 0 4px 10px;
        border-width: 0 0 1px 0;
        border-style: dotted;
        text-decoration: none;
    }
    .inactive {
        display: block;
        padding: 4px 0 4px 10px;
        border-width: 0 0 1px 0;
        border-style: dotted;
        color: grey;
    }
</style>

