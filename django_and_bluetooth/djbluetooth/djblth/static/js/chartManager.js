import * as chart from 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.4.0/Chart.min.js';

export class ChartManager{
    constructor(ctx){
        this.chartView = null;
        this.chartXData = [];
        this.chartYData = [];
        this.chartData = {labels: [], datasets: []};
        this.createChartView();
    }
    
    // Метод создания графика
    createChartView(){
        this.chartView = new chart.Chart(ctx, {
            type: 'line',
            options: {
            responsive: true,
            elements: {
                            point:{
                                radius: 0
                            }
                        },
            legend:
            {
            display: false
            },
            scales: {
                xAxes: [{
                    gridLines: {
                    drawBorder: false,
                        display:false
                    }
                }],
                yAxes: [{
                    gridLines: {
                    drawBorder: false,
                        display:false
                    }
                }]
            },
            },
            data: this.chartData,
        });
        var dataset = {
            backgroundColor:'rgb(255, 99, 132)',
            borderColor:'rgb(255, 99, 132)',
            data: [],
        };
        this.chartData.labels = this.chartXData
        dataset.data = this.chartYData;
        this.chartView.data.datasets.push(dataset);
	    this.chartView.update();
    }

    // Добавление занчения на график
    addValue(new_value, new_){        
        try {
           chart.data.datasets[0].data.length;
        }
        catch (e) {
            createChartView();
        }
        
        data.labels.push(new_);
        chart.data.datasets[0].data.push(new_value);
        chart.update();
    }

    // Очистка графика
    clearChart(){
        this.chartView.clear();
    }
}
