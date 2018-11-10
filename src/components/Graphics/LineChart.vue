<script>
// See vue-charts documentation
import { Line, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins;
export default {
  extends: Line,
  mixins: [reactiveProp],
  //props: ['type'],
  mounted () {
    // Overwriting base render method with actual data.
    this.renderChart(this.chartData,{
        responsive: true,
        scales: {
            xAxes: [{
                ticks: {
                    autoSkip: false,
                    maxRotation: 90,
                    //minRotation: 90
                }
            }],
            yAxes: [{
                ticks: {
                    display: true,
                    beginAtZero: true,
                    //min: 0
                }
            }]
        }
    });
  }
}
</script>
