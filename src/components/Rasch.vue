<template>
    <div id='rasch'>
        <h2>Rasch-Modell</h2>
        <div v-if="Score.length > 0">
            <p>Mit dem <a href="https://de.wikipedia.org/wiki/Rasch-Modell" target="_blank">Rasch-Modell</a> aus der probabilistischen Test-Theorie (Item-Response-Theorie) kann man versuchen, unterschiedliche Tests zu vergleichen, siehe dazu auch die Ausführungen in diesem <a href="https://youtu.be/EgXC46ByFlY?t=3386" target="_blank">Video von Jörn Loviscach</a>. Die Anwendbarkeit des Modells ist im konkreten Fall zu diskutieren. Das folgende Diagramm soll diese Diskussion unterstützen.
            </p>
            <p>
                Dargestellt ist näherungsweise der Logarithmus des Quotienten aus der Wahrscheinlichkeit dass die Frage richtig beantwortet wird zu der Wahrscheinlichkeit dass die Frage nicht richtig beantwortet wird. Ein Wert größer als 0 bedeutet also, dass die Wahrscheinlichkeit größer ist dass die Frage richtig beantwortet wird.    
            </p>
            <div class="chart-container" style="width:800px">
                <LineChart :chartData=raschData></LineChart>
            </div>
        </div>
    </div>
</template>

<script>
function avg(scores,threshold) {
    var avgScore=0;
    var len=scores.length;
    for (var i=0; i<len; i++) {
        var s=scores[i] ;
        if (s >= threshold) {
            avgScore ++;
        }
    }
    avgScore=avgScore/len;
    return avgScore;
}

import LineChart from "./Graphics/LineChart.vue";
export default {
    name: 'rasch',
    data () {
        return {
            threshold: 1
        }
    },
    components: {
        LineChart
    },
    props: ['Score'],
    computed: {
        
        raschData: function () {
            var chart={
                labels: [],
                datasets:[],
            };
            
            if (this.Score.length == 0) {
                return {
                    data: [chart]
                };
            }
            
            chart.labels=this.Score.map(x => x['name']);
            /*
            var maxData={
                label: "Maximale Punktzahl",
                data: this.Score.map(x => Number(x.maxScore)),
                borderColor: 'green'
            };
            chart.datasets[0]=maxData;
            */
           var prepData=this.Score.map(x => avg(x.scores,x.maxScore*this.threshold));
           var chartData=prepData.map(x => Math.log(x/(1-x)).toFixed(2));
           
            var raschData={
                label: "Rasch-Item-Index",
                data: chartData,
                borderColor: 'blue'
            }
            chart.datasets[0]=raschData;
            return chart;
        }
    }
}
</script>

