<template>
    <div id='questionStatistics'>
        <h2>Fragen-Statistik</h2>
        <div class="chart-container" style="width:50%" v-if="Score.length > 0">
            <LineChart :chartData=ScoreChart></LineChart>
        </div>
        <div v-if="Score.length > 0">
            <p>
                <b>Hinweis: </b>Wenn die maximal mögliche Punktzahl der Schwierigkeit der Aufgabe entsprechen soll, so vergleichen Sie die beiden Kurven. 
                Bei schwierigen Fragen ist der mittlere Punktwert niedrig, verglichen mit dem Maximalpunktwert. 
                Derartige Fragen kann man mit einem entsprechend höheren Maximalpunktwert belohnen.
            </p>
            <p>Eine angepasste Punkteverteilung wäre z.B.:</p>
            <p>
                <ul>
                    <li v-for='item in ScoreAdjust' :key = item>
                        {{ item }}
                    </li>
                </ul>
            </p>
            <p>Es kann aber gute Gründe geben, von dieser Punkteverteilung abzuweichen, z.B. um die Studierenden zur Beschäftigung mit einzelnen Fragen besonders zu motivieren.</p>
        </div>
    </div>
</template>

<script>
function avg(scores) {
    var avgScore=0;
    var len=scores.length;
    for (var i=0; i<len; i++) {
        avgScore += scores[i];
    }
    avgScore=avgScore/len;
    return avgScore;
}

function group(ar,n=20) {
    var ar1=[];
    var start=0;
    do {
        if (start+2*n <= ar.length) {
            ar1.push(ar.slice(start,start+n));
            start=start+n;
        } else if (start + 3*n/2 >= ar.length) {
            ar1.push(ar.slice(start,start+n));
            start=start+n;
        } else {
            ar1.push(ar.slice(start,start+n/2));
            ar1.push(ar.slice(start+n/2,ar.length));
            start=ar.length;
        }
    } while (start < ar.length)  
    return ar1;  
}

import LineChart from "./Graphics/LineChart.vue";
export default {
    name: 'questionStatistics',
    components: {
        LineChart
    },
    props: ['Score'],
    computed: {
        QNames: function () {
            return this.Score.map(x => x['name']);
        },
        QAvgs: function () {
            return this.Score.map(x => avg(x.scores).toFixed(2));
        },
        ScoreChart: function () {
            
            var chart={
                labels: [],
                datasets:[]
            };
            if (this.Score.length == 0) {
                return {
                    data: [chart]
                };
            }
            //eslint-disable-next-line
            console.log(group(this.Score));

            chart.labels=this.QNames;
            var maxData={
                label: "Maximale Punktzahl",
                data: this.Score.map(x => x.maxScore),
                borderColor: 'green'
            };
            chart.datasets[0]=maxData;
            var avgData={
                label: "Mittlere Punktzahl",
                data: this.QAvgs,
                borderColor: 'blue'
            }
            chart.datasets[1]=avgData;
            return chart;
        },
        ScoreAdjust: function () {
            var sMaxAdj=[];
            for (var qi=0; qi<this.Score.length; qi++) {
                var si=Math.round(this.Score[qi].maxScore * (5/this.QAvgs[qi]));
                sMaxAdj[qi] = this.QNames[qi]+': '+si+' Punkte';
            }
            return sMaxAdj;
        }
    }
}
</script>
