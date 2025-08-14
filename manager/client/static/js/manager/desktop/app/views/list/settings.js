import { List } from "/static/js/manager/desktop/app/views/base/list.js";
import { Select } from "/static/js/vanilla/ui/select.js";
import { Dom } from "/static/js/vanilla/ui/dom.js";
import { GET } from "/static/js/vanilla/http/navigation.js";
// import { Chart } from '/static/js/modules/chart.js';

export class Settings extends List{
    constructor(context){
        super(context);
        this.context = context;

        google.charts.load('current', { packages: ['corechart'] });
        google.charts.setOnLoadCallback(this.drawUsersChart.bind(this));;

        // var days = [];
        // Object.values(context.users).each((e) => {
        //     days.push(Object.values(e)[0]);
        // });

        // var user_values = [];
        // Object.values(context.users).each((e) => {
        //     user_values.push(Object.values(e)[1]);
        // });

        // var order_values = [];
        // Object.values(context.orders).each((e) => {
        //     order_values.push(Object.values(e)[1]);
        // });

        // let UsersChart = new Chart(
        //     Dom.query('#UsersChart').getContext('2d'),
        //     {
        //         type: 'line',
        //         data: {
        //             labels: days,
        //             datasets: [{
        //                 label: 'Користувачи за тиждень',
        //                 backgroundColor: 'rgb(73, 152, 255)',
        //                 borderColor: 'rgb(73, 152, 255)',
        //                 data: user_values,
        //             }]
        //         },
        //         options: {
        //             scales: {
        //                 y: {
        //                     beginAtZero: true
        //                 }
        //             }
        //         }
        //     }
        // );

        // let OrdersChart = new Chart(
        //     Dom.query('#OrdersChart').getContext('2d'),
        //     {
        //         type: 'line',
        //         data: {
        //             labels: days,
        //             datasets: [{
        //                 label: 'Замовлення за тиждень',
        //                 backgroundColor: 'rgb(247, 92, 157)',
        //                 borderColor: 'rgb(247, 92, 157)',
        //                 data: order_values,
        //             }]
        //         },
        //         options: {
        //             scales: {
        //                 y: {
        //                     beginAtZero: true
        //                 }
        //             }
        //         }
        //     }
        // );

        Select.customize('.custom-select');

        Dom.query('#tasks-select').on('change',this.task.bind(this));

        Dom.query('#panel-shortcuts #cache').on('click',this.drop_cache.bind(this));
    }
    drawUsersChart() {
        let user_values = [];
        let days = [];

        Object.entries(this.context.users).forEach(([day, data]) => {
            days.push(day);
            user_values.push(Object.values(data)[1]);
        });

        let chartData = new google.visualization.DataTable();
        chartData.addColumn('string', 'Day');
        chartData.addColumn('number', 'Users');

        days.forEach((day, index) => {
            chartData.addRow([day, user_values[index]]);
        });

        let options = {
            title: 'Користувачи за тиждень',
            curveType: 'function',
            legend: { position: 'bottom' },
            hAxis: { title: 'Day' },
            vAxis: { title: 'Users', minValue: 0 }
        };

        let chart = new google.visualization.LineChart(document.getElementById('UsersChart'));
        chart.draw(chartData, options);
    }

    task(e){
        let value = e.target.value;

        if(!value)
            return;

        GET(`/task?id=${value}`,{
            View:(response) => {
                if(response && response.result)
                    Alert.popMessage('Завдання в черзі.');
            }
        });
    }
    drop_cache(e){
        if(!confirm('Впевнені?'))
            return;

        GET('/drop_cache',{
            View:(response) => {
                if(response && response.result)
                    Alert.popMessage('Кеш видалено.');
            }
        });

        e.stopPropagation();
        e.preventDefault();

        return false;
    }
}