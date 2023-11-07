import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

function GraphBars({ Labels, TotalScrappedList, TotalSentList }) {
    const [labels, setLabels] = React.useState(Labels);
    const [totalScrappedList, setTotalScrappedList] = React.useState(TotalScrappedList);
    const [totalSentList, setTotalSentList] = React.useState(TotalSentList);

    React.useEffect(() => {
        setLabels(Labels);
        setTotalScrappedList(TotalScrappedList);
        setTotalSentList(TotalSentList);
    }, [Labels, TotalScrappedList, TotalSentList])

    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend
    );

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
            position: 'top',
            },
            title: {
            display: false,
            text: 'Chart.js Line Chart',
            },
        },
    };

    const data = {
        labels,
        datasets: [
            {
            label: 'Total Scrapped',
            data: totalScrappedList,
            borderColor: 'rgb(248, 113, 113)',
            backgroundColor: 'rgba(248, 113, 113, 0.5)',
            },
            {
            label: 'Total Sent',
            data: totalSentList,
            borderColor: 'rgba(134, 239, 172, 0.8)',
            backgroundColor: 'rgba(134, 239, 172, 0.4)',
            },
        ],
    };
    return (
        <div className="w-full max-w-full h-72 p-4 bg-neutral-800/50 border border-white/10 drop-shadow rounded-xl">
            <Line options={options} data={data} className='w-full max-w-full h-72' />
        </div>
    )
}

export default GraphBars;
