import axios from 'axios';
import type { CacheType, ChatInputCommandInteraction } from 'discord.js';

export default async function solana(
	interaction: ChatInputCommandInteraction<CacheType>,
) {
	const response = await axios.get<{ price: string }>(
		'https://api.binance.com/api/v3/ticker/price',
		{
			params: {
				symbol: 'SOLUSDT',
			},
		},
	);
	const price = parseFloat(response.data.price);
	await interaction.reply(
		[
			'мама: ти хуйня',
			'училка: ти нихуя не добешся',
			'папа: ти чмо',
			`sol: $${price.toFixed(2)}`,
		].join('\n'),
	);
}
