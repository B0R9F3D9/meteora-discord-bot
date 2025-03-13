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
	generatePoolString,
	generateTokenString,
	sortMeteoraPools,
} from '@/utils';

export default async function topPools(
	interaction:
		| ChatInputCommandInteraction<CacheType>
		| ButtonInteraction<CacheType>,
) {
	const sortBy = interaction.isChatInputCommand()
		? interaction.options.getString('sort-by') || 'tvl'
		: interaction.customId.split(':')[1] || 'tvl';
	const sortOrder = interaction.isChatInputCommand()
		? interaction.options.getString('sort-order') || 'desc'
		: interaction.customId.split(':')[2] || 'desc';
	const sortTimeframe = interaction.isChatInputCommand()
		? interaction.options.getString('sort-timeframe') || '30m'
		: interaction.customId.split(':')[3] || '30m';
	const page = interaction.isChatInputCommand()
		? 0
		: parseInt(interaction.customId.split(':')[4] || '0');

	if (!interaction.replied && !interaction.deferred)
		await interaction.deferReply();

	const meteoraPools = await searchMeteoraPairs(
		sortBy as SortByType,
		sortOrder as SortOrderType,
		sortTimeframe as SortTimeframeType,
	);
	if (meteoraPools.length === 0)
		return await interaction.editReply('No pools found for provided token');
	sortMeteoraPools(
		meteoraPools,
		sortBy as SortByType,
		sortOrder as SortOrderType,
		sortTimeframe as SortTimeframeKeyType,
	);
	const dexPairs = await getDexPairs(meteoraPools[0].mint_x);
	const rugData = await getRugData(meteoraPools[0].mint_x);

	const pageSize = 3;
	const totalPages = Math.ceil(meteoraPools.length / pageSize);
	const startIndex = page * pageSize;
	const endIndex = startIndex + pageSize;
	const paginatedPools = meteoraPools.slice(startIndex, endIndex);

	const embed = new EmbedBuilder()
		.setColor(0x7f3de3)
		.setTimestamp()
		.setTitle('Top pools overview')
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
			...paginatedPools.map((pool, i) => ({
				name: `Token #${startIndex + i + 1} | ${pool.name}`,
				value: generateTokenString(pool.mint_x, dexPairs || [], rugData),
				inline: true,
			})),
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
					`top-pools:${sortBy}:${sortOrder}:${sortTimeframe}:0:${pageSize}:first`,
				)
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('⏪')
				.setDisabled(page === 0),
			new ButtonBuilder()
				.setLabel('Previous')
				.setCustomId(
					`top-pools:${sortBy}:${sortOrder}:${sortTimeframe}:${page - 1}`,
				)
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('⬅️')
				.setDisabled(page === 0),
			new ButtonBuilder()
				.setLabel('Refresh')
				.setCustomId(
					`top-pools:${sortBy}:${sortOrder}:${sortTimeframe}:${page}`,
				)
				.setStyle(ButtonStyle.Primary)
				.setEmoji('🔄'),
			new ButtonBuilder()
				.setLabel('Next')
				.setCustomId(
					`top-pools:${sortBy}:${sortOrder}:${sortTimeframe}:${page + 1}`,
				)
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('➡️')
				.setDisabled(page === totalPages - 1),
			new ButtonBuilder()
				.setLabel('Last')
				.setCustomId(
					`top-pools:${sortBy}:${sortOrder}:${sortTimeframe}:${totalPages - 1}:last`,
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
