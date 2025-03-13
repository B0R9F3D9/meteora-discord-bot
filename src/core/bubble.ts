import axios from 'axios';
import { createCanvas } from 'canvas';

import type { BubbleResponse } from '@/types/bubble';

export async function generateBubbleMap(token: string) {
	const response = await axios.get<BubbleResponse>(
		'https://europe-west1-cryptos-tools.cloudfunctions.net/get-bubble-graph-data',
		{
			params: {
				token,
				chain: 'sol',
				dexscreener: true,
			},
		},
	);
	const data = response.data;

	const width = 1000;
	const height = 800;

	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, width, height);

	const minRadius = 10;
	const maxRadius = 50;

	const nodePositions: { x: number; y: number; r: number }[] = [];

	for (const node of data.nodes) {
		const radius =
			minRadius +
			(maxRadius - minRadius) *
				((node.amount - data.metadata.min_amount) /
					(data.metadata.max_amount - data.metadata.min_amount));
		nodePositions.push({ x: 0, y: 0, r: radius });
	}

	for (let i = 0; i < data.nodes.length; i++) {
		const r = nodePositions[i].r;
		nodePositions[i].x = Math.random() * (width - 2 * r) + r;
		nodePositions[i].y = Math.random() * (height - 2 * r) + r;
	}

	for (let i = 0; i < data.nodes.length; i++) {
		const { x, y, r } = nodePositions[i];
		ctx.beginPath();
		ctx.arc(x, y, r, 0, 2 * Math.PI);
		ctx.fillStyle = `rgba(128, 128, 128, 0.5)`;
		ctx.fill();
		ctx.strokeStyle = 'gray';
		ctx.lineWidth = 2;
		ctx.stroke();
	}

	ctx.strokeStyle = 'purple';
	ctx.lineWidth = 2;
	for (const link of data.links) {
		const sourceNode = nodePositions[link.source];
		const targetNode = nodePositions[link.target];

		if (sourceNode && targetNode) {
			ctx.beginPath();
			ctx.moveTo(sourceNode.x, sourceNode.y);
			ctx.lineTo(targetNode.x, targetNode.y);
			ctx.stroke();
		}
	}

	return canvas.toBuffer('image/jpeg', { quality: 1 });
}
