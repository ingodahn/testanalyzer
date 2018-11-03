<template>
    <div>
        <ul>
            <li><a href="#context">Kontext</a></li>
            <li><a href="#system">Systemauswahl</a></li>
            <li><a href="#upload">Daten hochladen</a></li>
            <li><a href="#testType">Art des Tests</a></li>
            <div v-if="QuestionsNr > 0">
                <li><a href="#scoreDistribution">Punkteverteilung</a></li>
                <li><a href="#less">Wenig Punkte</a></li>
                <li><a href="#more">Viele Punkte</a></li>
                <li><a href="#attempts">Versuche</a></li>
                <li><a href="#best">Die Besten</a></li>
            </div>
            <div v-else>
                <li class="inactive">Punkteverteilung</li>
                <li class="inactive">Wenig Punkte</li>
                <li class="inactive">Versuche</li>
                <li class="inactive">Die Besten</li>
            </div>
        </ul>
    </div>
</template>

<script>
export default {
    name: "Navigation",
    props: ["QuestionsNr"]
}
//eslint-disable-next-line
//console.log(this.QuestionsNr);
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

