<script>
// See vue-charts documentation
import { Bar, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins;
export default {
  extends: Bar,
  mixins: [reactiveProp],
  //props: ['type'],
  mounted () {
    // Overwriting base render method with actual data.
    this.renderChart(this.chartData);
  }
}
</script>
