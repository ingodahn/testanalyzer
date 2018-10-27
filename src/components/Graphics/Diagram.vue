<template>
    <div id="diagram">
        <h2>Punkteverteilung</h2>
        <!--
        <div id="diagramSettings">
            {{ settings }}
        </div>
        -->
        <div class="chart-container" style="width:20%">
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
            diagrams: {
                scoreDistribution: {
                    title: "Punkteverteilung"
                }
            },
            bucketsNr: 5
        }
    },
    props: ["ScoredSorted", "TotalScore", "Charts"],
    components: {
        Graphics
    },
    computed:{
        settings: function (){
          switch (this.Charts.length)  {
              case 0: {
                  return "Kein Diagramm zum auswählen.";
              }
              case 1: {
                  return this.diagrams[this.Charts[0]].title;
              }
              default: {
                  return "Auswahl nicht definiert"
              }
          }
        },
        studentScores: function() {
            if (this.ScoredSorted.length == 0) {
                return {};
            }
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
            var backgroundColor=Array(n).fill('hsl(198, 65%, 40%)');
            var studentsNr=this.ScoredSorted.length;
            const maxScore=this.TotalScore;
            var i=0;
            var lim=maxScore/n;
            for(var s=0; s<studentsNr;s++){
                var score=this.ScoredSorted[s].totalScore;
                if (score <= lim) {
                    scoreClasses[i]++
                } else {
                    while (score > lim) {
                        i++;
                        lim=lim+maxScore/n;
                    }
                    scoreClasses[i]++;
                }
            }
            var chartLabels=[];
            for (var j=0;j<n;j++) {
                chartLabels[j]=(maxScore*j/n).toString()+" - "+(maxScore*(j+1)/n).toString()
            }
            chart.data.labels=chartLabels;
            var chartData={
                label: "Punkteverteilung:",
                data: scoreClasses,
                backgroundColor: backgroundColor
            };
            chart.data.datasets[0]=chartData;
            return chart;
        }
    }
}


</script>

