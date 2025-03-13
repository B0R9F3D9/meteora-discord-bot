import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	type CacheType,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type MessageActionRowComponentBuilder,
} from 'discord.js';

import { generateBubbleMap } from '@/core/bubble';
import { generateChart } from '@/core/chart';
import { getDexPairs } from '@/core/dex';
import { getMeteoraPair } from '@/core/meteora';
import { getRugData } from '@/core/rug';
import {
	formatNumber,
	formatPrice,
	getPoolLinks,
	getTokenLinks,
} from '@/utils';

function extractPoolAddress(str: string) {
	const match = str.match(
		/^https:\/\/(?:edge|app)\.meteora\.ag\/dlmm\/(.*)|(.*)$/,
	);
	return match ? match[1] || match[2] : str;
}

export default async function checkPool(
	interaction:
		| ChatInputCommandInteraction<CacheType>
		| ButtonInteraction<CacheType>,
) {
	const pool = interaction.isChatInputCommand()
		? interaction.options.getString('pool')
		: interaction.message.embeds[0]?.fields[10].value
				.match(/```(.*?)```/)
				?.at(1);
	if (!pool) return await interaction.reply('No pool provided');

	if (!interaction.replied && !interaction.deferred)
		await interaction.deferReply();
	const address = extractPoolAddress(pool);

	const meteoraPair = await getMeteoraPair(address);
	if (!meteoraPair) return await interaction.editReply('Pool not found');
	const dexPairs = await getDexPairs(meteoraPair.mint_x);
	const dexPair = dexPairs?.find(pair => pair.pairAddress === address);
	const rugData = await getRugData(meteoraPair.mint_x);
	const chart = await generateChart(meteoraPair.address, meteoraPair.mint_x);
	const bubbleMap = await generateBubbleMap(meteoraPair.mint_x);

	const embed = new EmbedBuilder()
		.setColor(0x7f3de3)
		.setImage('attachment://chart.jpg')
		.setThumbnail('attachment://bubblemap.jpg')
		.setTitle(`${meteoraPair.name} ${formatPrice(meteoraPair.current_price)}`)
		.setTimestamp()
		.addFields(
			{
				name: 'Bin Step',
				value: meteoraPair.bin_step.toString(),
				inline: true,
			},
			{
				name: 'TVL',
				value:
					(dexPair?.liquidity?.usd
						? formatNumber(dexPair.liquidity.usd) + ' | '
						: '') + formatNumber(parseFloat(meteoraPair.liquidity)),
				inline: true,
			},
			{
				name: 'Fee',
				value: `${parseFloat(meteoraPair.base_fee_percentage).toFixed(
					2,
				)}% | ${parseFloat(meteoraPair.max_fee_percentage).toFixed(2)}%`,
				inline: true,
			},
			{
				name: 'Mcap',
				value:
					dexPair?.marketCap !== undefined
						? formatNumber(dexPair.marketCap)
						: 'Unknown',
				inline: true,
			},
			{
				name: 'Volume(5m)',
				value:
					dexPair?.volume?.m5 !== undefined
						? formatNumber(dexPair.volume.m5)
						: 'Unknown',
				inline: true,
			},
			{
				name: 'Created',
				value:
					dexPair?.pairCreatedAt !== undefined
						? `<t:${dexPair.pairCreatedAt / 1000}:R>`
						: 'Unknown',
				inline: true,
			},
			{
				name: 'Top 10',
				value:
					rugData?.topHolders?.length !== undefined
						? rugData.topHolders
								.slice(0, 10)
								.map(data => data.pct)
								.reduce((a, b) => a + b, 0)
								.toFixed(2) + '%'
						: 'Unknown',
				inline: true,
			},
			{
				name: 'Earn(5m)',
				value:
					dexPair?.volume?.m5 !== undefined
						? (dexPair?.liquidity?.usd
								? (
										(dexPair.volume.m5 / dexPair.liquidity.usd) *
										parseFloat(meteoraPair.max_fee_percentage)
									).toFixed(2) + '% | '
								: '') +
							(
								(dexPair.volume.m5 / parseFloat(meteoraPair.liquidity)) *
								parseFloat(meteoraPair.max_fee_percentage)
							).toFixed(2) +
							'%'
						: 'Unknown',
				inline: true,
			},
			{
				name: 'Rug Score',
				value: rugData?.score?.toLocaleString() || 'Unknown',
				inline: true,
			},
			{
				name: 'Token',
				value:
					`\`\`\`${meteoraPair.mint_x}\`\`\`` +
					getTokenLinks(meteoraPair.mint_x),
				inline: true,
			},
			{
				name: 'Pool',
				value:
					`\`\`\`${meteoraPair.address}\`\`\`` +
					getPoolLinks(meteoraPair.address),
				inline: true,
			},
		);

	await interaction.editReply({
		embeds: [embed],
		components: [
			new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
				new ButtonBuilder()
					.setLabel('Refresh')
					.setCustomId('check-pool')
					.setStyle(ButtonStyle.Primary)
					.setEmoji('🔄'),
			),
		],
		files: [
			new AttachmentBuilder(chart, { name: 'chart.jpg' }),
			new AttachmentBuilder(bubbleMap, { name: 'bubblemap.jpg' }),
		],
	});
}
