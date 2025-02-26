import { List } from "/static/js/desktop/vanilla/ui/view/list.js";
import { Select } from "/static/js/desktop/vanilla/ui/form/select.js";
import { Dom } from "/static/js/desktop/vanilla/ui/dom.js";
import { GET } from "/static/js/desktop/vanilla/http/method.js";
// import { Chart } from '/static/js/desktop/modules/chart.js';

export class Settings extends List{
    constructor(context){
        super(context);

        var days = [];
        Object.values(context.users).each((e) => {
            days.push(Object.values(e)[0]);
        });

        var user_values = [];
        Object.values(context.users).each((e) => {
            user_values.push(Object.values(e)[1]);
        });

        var order_values = [];
        Object.values(context.orders).each((e) => {
            order_values.push(Object.values(e)[1]);
        });

        let UsersChart = new Chart(
            Dom.query('#UsersChart').getContext('2d'),
            {
                type: 'line',
                data: {
                    labels: days,
                    datasets: [{
                        label: 'Користувачи за тиждень',
                        backgroundColor: 'rgb(73, 152, 255)',
                        borderColor: 'rgb(73, 152, 255)',
                        data: user_values,
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }
        );

        let OrdersChart = new Chart(
            Dom.query('#OrdersChart').getContext('2d'),
            {
                type: 'line',
                data: {
                    labels: days,
                    datasets: [{
                        label: 'Замовлення за тиждень',
                        backgroundColor: 'rgb(247, 92, 157)',
                        borderColor: 'rgb(247, 92, 157)',
                        data: order_values,
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }
        );

        Select.customize('.custom-select');

        Dom.query('#tasks-select').on('change',this.task.bind(this));

        Dom.query('#panel-shortcuts #cache').on('click',this.drop_cache.bind(this));
    }
    task(e){
        let value = e.target.value;

        if(!value)
            return;

        GET(`/task?id=${value}`,{
            View:(response) => {
                if(response.json && response.json.result)
                    response.alert('Завдання в черзі.');
            }
        });
    }
    drop_cache(e){
        if(!confirm('Впевнені?'))
            return;

        GET('/drop_cache',{
            View:(response) => {
                if(response.json && response.json.result)
                    response.alert('Кеш видалено.');
            }
        });

        e.stopPropagation();
        e.preventDefault();

        return false;
    }
}