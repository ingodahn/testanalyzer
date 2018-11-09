<template>
    <div id='questionStatistics'>
        <h2>Fragen-Statistik</h2>
        <div class="chart-container" style="width:800px" v-if="Questions.length > 0">
            <LineChart :chartData=maxScoreData></LineChart>
        </div>
    </div>
</template>

<script>
function avg(q) {
    var avgScore=0;
    var scores=q.scores;
    var len=scores.length;
    for (var i=0; i<len; i++) {
        avgScore += scores[i];
    }
    avgScore=avgScore/len;
    return avgScore;
}
/*
Chart.scaleService.updateScaleDefaults('linear', {
    ticks: {
        min: 0
    }
});
*/
import LineChart from "./Graphics/LineChart.vue";
export default {
    name: 'questionStatistics',
    components: {
        LineChart
    },
    props: ['Questions'],
    computed: {
        maxScoreData: function () {
            var chart={
                labels: [],
                datasets:[],
                options: {
                    responsive: true
                }
            };
            if (this.Questions.length == 0) {
                return {
                    data: [chart]
                };
            }
            
            chart.labels=this.Questions.map(x => x['name']);
            var maxData={
                label: "Maximale Punktzahl",
                data: this.Questions.map(x => Number(x.maxScore)),
                borderColor: 'green'
            };
            chart.datasets[0]=maxData;
            var avgData={
                label: "Mittlere Punktzahl",
                data: this.Questions.map(x => avg(x).toFixed(2)),
                borderColor: 'blue'
            }
            chart.datasets[1]=avgData;
            return chart;
        }
    }
}
</script>
