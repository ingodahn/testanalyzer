<template>
    <div id="diagram" :class=warnLevel>
        <h2>Punkteverteilung</h2>
        <div v-if='ScoredSorted.length > 0'>
            <div class="chart-container" style="width:20%">
                <BarChart :chartData=studentScores></BarChart>
            </div>
            <p><b>Hinweis:</b> {{ hint }}</p>
            <div v-if="hintDetails != ''">
                <p>{{ hintDetails }}</p>
                <p>
                    <ul>
                        <li>Gibt es Verständnisprobleme?</li>
                        <li>Brauchen die Studierenden mehr Zeit?</li>
                        <li>Fehlt ihnen die Motivation (insbesondere, wenn sie die Frage gar nicht erst versucht haben)?</li>
                    </ul>
                </p>
            </div>
        </div>
    </div>
    

</template>

<script>
import BarChart from "./Graphics/BarChart.vue";

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
    props: ["ScoredSorted", "TotalScore","Questions", "ComponentStatus"],
    components: {
        BarChart
    },
    computed:{
        scoreClasses: function() {
            // Return list of numbers of students in n groups by score
            const n=this.bucketsNr;
            var scoreClasses=Array(n).fill(0);
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
            return scoreClasses;
        },
        chartLabels: function() {
            const n=this.bucketsNr;
            const maxScore=this.TotalScore;
            var chartLabels=[];
            for (var j=0;j<n;j++) {
                chartLabels[j]=(maxScore*j/n).toString()+" - "+(maxScore*(j+1)/n).toString()
            }
            return chartLabels;
        },
        studentScores: function() {
            if (this.ScoredSorted.length == 0) {
                return {};
            }
            var chart={
                labels: [],
                datasets:[]
            };
            const n=this.bucketsNr;
            var backgroundColor=Array(n).fill('hsl(198, 65%, 40%)');
            
            chart.labels=this.chartLabels;
            var chartData={
                label: "Punkteverteilung:",
                data: this.scoreClasses,
                backgroundColor: backgroundColor
            };
            chart.datasets[0]=chartData;
            return chart;
        },
        warnLevel: function () {
            var s=this.ComponentStatus;
            switch(this.gaps.length) {
                case 0: {
                    s['scoreDistribution']= 'warn_0';
                    return "warn_0";
                }
                default: {
                    s['scoreDistribution']= 'warn_1';
                    return "warn_1";}
            }
        },
        gaps: function() {
            const scores=this.scoreClasses;
            if (this.ScoredSorted.length == 0) {
                return [];
            }
            const n=this.bucketsNr;
            var gaps=[];
            var i=0;
            while ( i<n-1 ) {
                if (scores[i+1] <= scores[i]*0.2) {
                    gaps.push(i)
                }
                i++;
            }
            return gaps;
        },
        hintDetails: function () {
            
            if (this.gaps.length == 0) {
                return '';
            }
            var gap=this.gaps[0];
            var snr=sum(this.scoreClasses,0,gap);
            const weakStudents=this.ScoredSorted.slice(Math.max(0,snr-10),snr);
            const goodStudents=this.ScoredSorted.slice(snr,Math.min(snr+10,this.ScoredSorted.length));
            const weakStudentsScores=weakStudents.map(x => x.scores);
            const goodStudentsScores=goodStudents.map(x => x.scores)
            var lgood=goodStudents.length;
            const lweak=weakStudents.length;
            
            var weakStudentsQ={};
            for (var q=0; q < this.Questions.length; q++) {
                weakStudentsQ[this.Questions[q]['name']] = 0;
            }
           
            for (var i=0; i<lweak; i++) {
                for (var name in weakStudentsScores[i] ) {
                    weakStudentsQ[name] += weakStudentsScores[i][name];
                }
            }
            
            var goodStudentsQ = {};
            if (lgood == 0) {
                for (var qi=0; qi < this.Questions.length; qi++) {
                    var q1=this.Questions[qi];
                    goodStudentsQ[q1['name']] = q1['maxScore'];
                }
                lgood=1;
            } else {
                goodStudentsQ=goodStudentsScores[0];
            }
            
            for (var i1=1; i1<lgood; i1++) {
                for (var name1 in goodStudentsScores[i1] ) {
                    goodStudentsQ[name1] += goodStudentsScores[i1][name1];
                }
            }
            var diffScores={};
            for (var name2 in goodStudentsQ) {
                diffScores[name2]=goodStudentsQ[name2]/lgood - weakStudentsQ[name2]/lweak;
            }
            var maxDiff=0;
            var maxDiffName='';
            for (var name3 in diffScores) {
                if (diffScores[name3] > maxDiff) {
                    maxDiff=diffScores[name3];
                    maxDiffName=name3;
                }
            }
            var maxDiffMaxScore=0;
            for (var q2= 0; q2 < this.Questions.length; q2++) {
                if (this.Questions[q2]['name'] == maxDiffName) {
                    maxDiffMaxScore=this.Questions[q2]['maxScore'];
                    break;
                }
            }
            var wsi=0;
            for (var wi=lweak-1; wi >= 0; wi--) {
                if (weakStudents[wi].scores[maxDiffName] < maxDiffMaxScore) {
                    wsi=wi;
                    break;
                }
            }
            var ws = weakStudents[wsi].name+" ("+ weakStudents[wsi].scores[maxDiffName]+" von "+maxDiffMaxScore+" Punkten).";
            return "Sehen Sie sich insbesondere die Antworten der Studierenden mit "+this.chartLabels[gap]+" Punkten auf die Frage "+maxDiffName + " an, z.B. von "+ws;
        },
        hint: function() {
            if (this.gaps.length == 0) {
                return "Aus diesem Bild kann ich keine Hinweise ableiten."
            } else {
                return "Nur wenige Studierende haben "+this.chartLabels[this.gaps[0]+1] + " Punkte.";
            }
        }
    }
}

function sum(array,start,end) {
	if (array.length == 0) {
		return 0;
	}
	start=Math.max(start,0);
	end=Math.min(end,array.length-1);
	var tmpArray=array.slice(start,end+1);
	return tmpArray.reduce((a, b) => a + b, 0);
}

</script>

