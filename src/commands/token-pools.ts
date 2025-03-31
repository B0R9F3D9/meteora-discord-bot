import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	type CacheType,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type MessageActionRowComponentBuilder,
} from 'discord.js';

import { getDexPairs } from '@/core/dex';
import { searchMeteoraPairs } from '@/core/meteora';
import { getRugData } from '@/core/rug';
import {
	METEORA_SORT_BY_KEYS,
	METEORA_SORT_ORDER_KEYS,
	METEORA_SORT_TIMEFRAME_KEYS,
	type SortByType,
	type SortOrderType,
	type SortTimeframeKeyType,
	type SortTimeframeType,
} from '@/types/meteora';
import {
	formatNumber,
	formatPrice,
	generatePoolString,
	getTokenLinks,
	sortMeteoraPools,
} from '@/utils';

export default async function tokenPools(
	interaction:
		| ChatInputCommandInteraction<CacheType>
		| ButtonInteraction<CacheType>,
) {
	const token = interaction.isChatInputCommand()
		? interaction.options.getString('token')
		: interaction.message.embeds[0].fields[0].value
				?.match(/```(.*?)```/)
				?.at(1);
	if (!token) return await interaction.reply('No token provided');

	const sortBy = interaction.isChatInputCommand()
		? interaction.options.getString('sort-by') || 'tvl'
		: interaction.customId.split(':')[1] || 'tvl';
	const sortOrder = interaction.isChatInputCommand()
		? interaction.options.getString('sort-order') || 'desc'
		: interaction.customId.split(':')[2] || 'desc';
	const sortTimeframe = interaction.isChatInputCommand()
		? interaction.options.getString('sort-timeframe') || '30m'
		: interaction.customId.split(':')[3] || '30m';
	const pageSize = interaction.isChatInputCommand()
		? interaction.options.getInteger('page-size') || 6
		: parseInt(interaction.customId.split(':')[5] || '6');

	const page = interaction.isChatInputCommand()
		? 0
		: parseInt(interaction.customId.split(':')[4] || '0');

	if (!interaction.replied && !interaction.deferred)
		await interaction.deferReply();

	const meteoraPools = await searchMeteoraPairs(
		sortBy as SortByType,
		sortOrder as SortOrderType,
		sortTimeframe as SortTimeframeType,
		token,
	);
	if (meteoraPools.length === 0) {
		const embed = new EmbedBuilder()
			.setColor(0x7f3de3)
			.setTitle('No pools found')
			.addFields([
				{
					name: 'Token',
					value: `\`\`\`${token}\`\`\``,
					inline: true,
				},
			])
			.setTimestamp();

		const components =
			new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
				new ButtonBuilder()
					.setLabel('Refresh')
					.setCustomId(
						`token-pools:${sortBy}:${sortOrder}:${sortTimeframe}:${page}:${pageSize}`,
					)
					.setStyle(ButtonStyle.Primary)
					.setEmoji('🔄'),
			);

		return await interaction.editReply({
			embeds: [embed],
			components: [components],
		});
	}

	sortMeteoraPools(
		meteoraPools,
		sortBy as SortByType,
		sortOrder as SortOrderType,
		sortTimeframe as SortTimeframeKeyType,
	);
	const dexPairs = await getDexPairs(meteoraPools[0].mint_x);
	const rugData = await getRugData(meteoraPools[0].mint_x);

	const totalPages = Math.ceil(meteoraPools.length / pageSize);
	const startIndex = page * pageSize;
	const endIndex = startIndex + pageSize;
	const paginatedPools = meteoraPools.slice(startIndex, endIndex);

	const embed = new EmbedBuilder()
		.setColor(0x7f3de3)
		.setTimestamp()
		.setTitle(
			`${meteoraPools[0].name} ${formatPrice(meteoraPools[0].current_price)}`,
		)
		.setFooter({
			text: [
				`Page ${page + 1} of ${totalPages}`,
				`Showing ${pageSize} pools per page`,
				`Total pools: ${meteoraPools.length}`,
				'Sorted by: ' +
					METEORA_SORT_BY_KEYS.find(p => p.value === sortBy)!.name,
				'Sort order: ' +
					METEORA_SORT_ORDER_KEYS.find(p => p.value === sortOrder)!.name,
				'Sort timeframe: ' +
					METEORA_SORT_TIMEFRAME_KEYS.find(p => p.value === sortTimeframe)!
						.name,
			].join(' | '),
		})
		.addFields(
			{
				name: 'Token',
				value: [
					`**Mcap:** ${
						dexPairs?.at(0)?.marketCap !== undefined
							? formatNumber(dexPairs?.at(0)?.marketCap || 0)
							: 'Unknown'
					}`,
					`**Created:** ${
						dexPairs?.at(0)?.pairCreatedAt !== undefined
							? `<t:${Math.min(...(dexPairs!.map(p => p.pairCreatedAt || 0) || [])) / 1000}:R>`
							: 'Unknown'
					}`,
					`**Top 10:** ${
						rugData?.topHolders?.length !== undefined
							? rugData.topHolders
									.slice(0, 10)
									.map(data => data.pct)
									.reduce((a, b) => a + b, 0)
									.toFixed(2) + '%'
							: 'Unknown'
					}`,
					`**Rug Score**: ${rugData?.score?.toLocaleString() || 'Unknown'}`,
					`**Address:**\`\`\`${meteoraPools[0].mint_x}\`\`\``,
					getTokenLinks(meteoraPools[0].mint_x),
				].join('\n'),
				inline: false,
			},
			...paginatedPools.map((pool, i) => ({
				name: `Pool #${startIndex + i + 1}`,
				value: generatePoolString(
					pool,
					dexPairs?.find(pair => pair.pairAddress === pool.address),
				),
				inline: true,
			})),
		);

	const components =
		new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
			new ButtonBuilder()
				.setLabel('First')
				.setCustomId(
					`token-pools:${sortBy}:${sortOrder}:${sortTimeframe}:0:${pageSize}:first`,
				)
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('⏪')
				.setDisabled(page === 0),
			new ButtonBuilder()
				.setLabel('Previous')
				.setCustomId(
					`token-pools:${sortBy}:${sortOrder}:${sortTimeframe}:${page - 1}:${pageSize}`,
				)
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('⬅️')
				.setDisabled(page === 0),
			new ButtonBuilder()
				.setLabel('Refresh')
				.setCustomId(
					`token-pools:${sortBy}:${sortOrder}:${sortTimeframe}:${page}:${pageSize}`,
				)
				.setStyle(ButtonStyle.Primary)
				.setEmoji('🔄'),
			new ButtonBuilder()
				.setLabel('Next')
				.setCustomId(
					`token-pools:${sortBy}:${sortOrder}:${sortTimeframe}:${page + 1}:${pageSize}`,
				)
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('➡️')
				.setDisabled(page === totalPages - 1),
			new ButtonBuilder()
				.setLabel('Last')
				.setCustomId(
					`token-pools:${sortBy}:${sortOrder}:${sortTimeframe}:${totalPages - 1}:${pageSize}:last`,
				)
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('⏩')
				.setDisabled(page === totalPages - 1),
		);

	await interaction.editReply({
		embeds: [embed],
		components: [components],
	});
}
