<template>
    <div id="diagram">
        <div id="diagramSettings">
            Diagram Settings
        </div>
        <div class="chart-container">
            <Graphics v-if='ScoredSorted.length > 0' :Chart=studentScores></Graphics>
        </div>
    </div>
</template>

<script>
import Graphics from "./Graphics.vue";
export default {
    name: "Diagram",
    data() {
        return {
            bucketsNr: 5
        }
    },
    props: ["ScoredSorted"],
    components: {
        Graphics
    },
    computed:{
        studentScores: function() {
            if (this.ScoredSorted.length == 0) {
                return {};
            }
// eslint-disable-next-line
// console.log(this.ScoredSorted);
            var chart={
                type: 'bar',
                labels: [],
                data: {
                    datasets:[]
                }
            };
            // Return list of numbers of students in n groups by score
            const n=this.bucketsNr;
            var scoreClasses=Array(n).fill(0);
            var studentsNr=this.ScoredSorted.length;
            const maxScore=this.ScoredSorted[0].totalScore;
            var i=0;
            var lim=maxScore*(n-1)/n;
            for(var s=0; s<studentsNr;s++){
                var score=this.ScoredSorted[s].totalScore;
                if (score >= lim) {
                    scoreClasses[i]++
                } else {
                    while (score < lim) {
                        i++;
                        lim=lim-maxScore/n;
                    }
                    scoreClasses[i]++;
                }
            }
            var chartLabels=[];
            for (var j=0;j<n;j++) {
// eslint-disable-next-line
// console.log(maxScore);
                chartLabels[j]=(maxScore*(n-j)/n).toString()+" - "+(maxScore*(n-j-1)/n).toString()
            }
            chart.data.labels=chartLabels;
            var chartData={
                label: "Punkteverteilung:",
                data: scoreClasses
            };
            chart.data.datasets[0]=chartData;
            return chart;
        }
    }
}


</script>

