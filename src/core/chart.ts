import { Canvas } from 'canvas';
import { Chart } from 'chart.js/auto';

import type { ChartResponse } from '@/types/chart';

export async function generateChart(pool: string, token: string) {
	const response = await fetch(
		`https://datapi.jup.ag/v1/charts/${pool}?interval=15_SECOND&baseAsset=${token}&from=${Date.now() - 60 * 60 * 1000}&to=${Date.now()}&candles=300&type=price`,
	);
	const data: ChartResponse = await response.json();

	const canvas = new Canvas(2000, 1500);
	const canvasElement = {
		getContext: canvas.getContext.bind(canvas),
		width: canvas.width,
		height: canvas.height,
		style: {},
	} as unknown as HTMLCanvasElement;
	const ctx = canvasElement.getContext('2d');

	const maxVolume = Math.max(...data.candles.map(item => item.volume));
	const targetMaxVolumeHeight = canvas.height / 5;

	const chart = new Chart(canvasElement, {
		type: 'line',
		data: {
			labels: data.candles.map(item =>
				new Date(item.time * 1000).toLocaleTimeString('en-GB'),
			),
			datasets: [
				{
					data: data.candles.map(item => item.close),
					borderColor: 'white',
					borderWidth: 2,
					fill: false,
					yAxisID: 'y',
				},
				{
					data: data.candles.map(item => item.volume),
					backgroundColor: 'rgba(0, 123, 255, 0.5)',
					borderColor: 'blue',
					borderWidth: 1,
					type: 'bar',
					yAxisID: 'y1',
				},
			],
		},
		options: {
			responsive: false,
			maintainAspectRatio: false,
			backgroundColor: 'black',
			plugins: { legend: { display: false } },
			scales: {
				x: {
					ticks: {
						color: 'white',
						font: {
							size: 16,
							family: 'Arial',
						},
					},
					grid: {
						color: 'rgba(255, 255, 255, 0.2)',
						lineWidth: 1,
					},
				},
				y: {
					ticks: {
						color: 'white',
						font: {
							size: 16,
							family: 'Arial',
						},
					},
					position: 'right',
					grid: {
						color: 'rgba(255, 255, 255, 0.2)',
						lineWidth: 1,
					},
				},
				y1: {
					display: false,
					min: 0,
					max: maxVolume * (canvas.height / targetMaxVolumeHeight),
				},
			},
		},
	});

	return canvas.toBuffer('image/jpeg', { quality: 100 });
}
