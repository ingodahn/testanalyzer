<template>
    <div id="diagram" :class=warnLevel>
        <h2>Punkteverteilung</h2>
        <div v-if='ScoredSorted.length > 0'>
            <!--
            <div id="diagramSettings">
                {{ settings }}
            </div>
            -->
            <div class="chart-container" style="width:20%">
                <Graphics :Chart=studentScores></Graphics>
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
import Graphics from "./Graphics/Graphics.vue";
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
    props: ["ScoredSorted", "TotalScore", "Charts","Questions"],
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
        scoreClasses: function() {
            // Return list of numbers of students in n groups by score
            const n=this.bucketsNr;
            var scoreClasses=Array(n).fill(0);
            //eslint-disable-next-line
            console.log(this.ScoredSorted);
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
                type: 'bar',
                labels: [],
                data: {
                    datasets:[]
                }
            };
            const n=this.bucketsNr;
            var backgroundColor=Array(n).fill('hsl(198, 65%, 40%)');
            
            chart.data.labels=this.chartLabels;
            var chartData={
                label: "Punkteverteilung:",
                data: this.scoreClasses,
                backgroundColor: backgroundColor
            };
            chart.data.datasets[0]=chartData;
            return chart;
        },
        warnLevel: function () {
            switch(this.gaps.length) {
                case 0: {
                    return "warn_0";
                }
                default: {return "warn_1";}
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
            // const n=this.bucketsNr;
            //eslint-disable-next-line
            console.log(this.scoreClasses);
            var snr=sum(this.scoreClasses,0,gap);
            const weakStudents=this.ScoredSorted.slice(Math.max(0,snr-10),snr);
            const goodStudents=this.ScoredSorted.slice(snr,Math.min(snr+10,this.ScoredSorted.length));
            const weakStudentsScores=weakStudents.map(x => x.scores);
            const goodStudentsScores=goodStudents.map(x => x.scores)
            var lgood=goodStudents.length;
            const lweak=weakStudents.length;
            var weakStudentsQ=weakStudentsScores[0];
            for (var i=1; i<lweak; i++) {
                for (var name in weakStudentsScores[i] ) {
                    weakStudentsQ[name] += weakStudentsScores[i][name];
                }
            }
            var goodStudentsQ = {};
            if (lgood == 0) {
                for (var qi=0; qi < this.Questions.length; qi++) {
                    var q=this.Questions[qi];
                    goodStudentsQ[q['name']] = q['maxScore'];
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
            return "Sehen Sie sich insbesondere die Antworten der Studierenden mit "+this.chartLabels[gap]+" Punkten auf die Frage "+maxDiffName + " an.";
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

