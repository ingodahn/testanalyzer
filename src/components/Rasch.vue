<template>
    <div id='rasch'>
        <h2>Rasch-Modell</h2>
        <div v-if="Score.length > 0">
            <p>Mit dem <a href="https://de.wikipedia.org/wiki/Rasch-Modell" target="_blank">Rasch-Modell</a> aus der probabilistischen Test-Theorie (Item-Response-Theorie) kann man versuchen, unterschiedliche Tests zu vergleichen, siehe dazu auch die Ausführungen in diesem <a href="https://youtu.be/EgXC46ByFlY?t=3386" target="_blank">Video von Jörn Loviscach</a>. Die Anwendbarkeit des Modells ist im konkreten Fall zu diskutieren. Das folgende Diagramm soll diese Diskussion unterstützen.
            </p>
            <p>
                Dargestellt ist näherungsweise der Logarithmus des Quotienten aus der Wahrscheinlichkeit dass die Frage richtig beantwortet wird zu der Wahrscheinlichkeit dass die Frage nicht richtig beantwortet wird. Ein Wert größer als 0 bedeutet also, dass die Wahrscheinlichkeit größer ist dass die Frage richtig beantwortet wird.    
            </p>
            <div>
            <VueSlideBar  v-model="threshold" :data="slider.data" :range="slider.range" :processStyle="{ backgroundColor: '#d8d8d8' }"          @callbackRange="callbackRange">
            <template slot="tooltip" slot-scope="tooltip">
                <img src="../third_party/rectangle-slider.svg">
            </template>
            </VueSlideBar>
    <p><b>Richtige Antwort ab {{rangeValue.label}} der möglichen Punkte</b></p>
  </div>
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
import VueSlideBar from 'vue-slide-bar';

export default {
    name: 'rasch',
    data () {
        return {
            threshold: 1,
            rangeValue: {},
      slider: {
        value: 1,
        data: [
          0.5,
          0.55,
          0.6,
          0.65,
          0.7,
          0.75,
          0.8,
          0.85,
          0.9,
          0.95,
          1
        ],
        range: [
          {
            label: '50%'
          },
          {
            label: '55%',
            isHide: true
          },
          {
            label: '60%'
          },
          {
            label: '65%',
            isHide: true
          },
          {
            label: '70%'
          },
          {
            label: '75%',
            isHide: true
          },
          {
            label: '80%'
          },
          {
            label: '85%',
            isHide: true
          },
          {
            label: '90%'
          },
          {
            label: '95%',
            isHide: true
          },
          {
            label: '100%'
          }
        ]
      }
        }
    },
    methods: {
    callbackRange (val) {
      this.rangeValue = val
    }
  },
    components: {
        LineChart,
        VueSlideBar
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

