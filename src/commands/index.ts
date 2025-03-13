import {
	ButtonInteraction,
	type CacheType,
	ChatInputCommandInteraction,
	type Interaction,
	MessageFlags,
	SlashCommandBuilder,
} from 'discord.js';

import checkPool from '@/commands/check-pool';
import solana from '@/commands/solana';
import tokenPools from '@/commands/token-pools';
import topPools from '@/commands/top-pools';
import {
	METEORA_SORT_BY_KEYS,
	METEORA_SORT_ORDER_KEYS,
	METEORA_SORT_TIMEFRAME_KEYS,
} from '@/types/meteora';

export const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Checks bot status'),
	new SlashCommandBuilder()
		.setName('solana')
		.setDescription('Get the current price of Solana'),
	new SlashCommandBuilder()
		.setName('check-pool')
		.setDescription('Checks provided Meteora pool')
		.addStringOption(option =>
			option
				.setName('pool')
				.setDescription('Pool address or link to Meteora')
				.setRequired(true),
		),
	new SlashCommandBuilder()
		.setName('top-pools')
		.setDescription('Lists top Meteora pools')
		// TODO: Add filters
		// .addBooleanOption(option =>
		// 	option
		// 		.setName('apply-filters')
		// 		.setDescription('Apply filters (default: true)')
		// 		.setRequired(false),
		// )
		.addStringOption(option =>
			option
				.setName('sort-by')
				.setDescription('Sort by (default: TVL)')
				.setRequired(false)
				.setChoices(...METEORA_SORT_BY_KEYS),
		)
		.addStringOption(option =>
			option
				.setName('sort-order')
				.setDescription('Sort order (default: Descending)')
				.setRequired(false)
				.setChoices(...METEORA_SORT_ORDER_KEYS),
		)
		.addStringOption(option =>
			option
				.setName('sort-timeframe')
				.setDescription(
					'Sort timeframe (default: 30m) !Not working with sort-by=TVL!',
				)
				.setRequired(false)
				.setChoices(...METEORA_SORT_TIMEFRAME_KEYS),
		),
	new SlashCommandBuilder()
		.setName('token-pools')
		.setDescription('Lists Meteora pools for provided token to Solana')
		// TODO: Add filters
		// .addBooleanOption(option =>
		// 	option
		// 		.setName('apply-filters')
		// 		.setDescription('Apply filters (default: true)')
		// 		.setRequired(false),
		// )
		.addStringOption(option =>
			option
				.setName('token')
				.setDescription('Token address, symbol or pair')
				.setRequired(true),
		)
		.addStringOption(option =>
			option
				.setName('sort-by')
				.setDescription('Sort by (default: TVL)')
				.setRequired(false)
				.setChoices(...METEORA_SORT_BY_KEYS),
		)
		.addStringOption(option =>
			option
				.setName('sort-order')
				.setDescription('Sort order (default: Descending)')
				.setRequired(false)
				.setChoices(...METEORA_SORT_ORDER_KEYS),
		)
		.addStringOption(option =>
			option
				.setName('sort-timeframe')
				.setDescription(
					'Sort timeframe (default: 30m) !Not working with sort-by=TVL!',
				)
				.setRequired(false)
				.setChoices(...METEORA_SORT_TIMEFRAME_KEYS),
		)
		.addIntegerOption(option =>
			option
				.setName('page-size')
				.setMinValue(1)
				.setMaxValue(6)
				.setDescription('Pools per page (min: 1, max: 6, default: 6)')
				.setRequired(false),
		),
].map(command => command.toJSON());

export async function onInteractionCreate(interaction: Interaction<CacheType>) {
	if (interaction.isChatInputCommand()) await handleCommand(interaction);
	else if (interaction.isButton()) await handleButton(interaction);
}

async function handleCommand(
	interaction: ChatInputCommandInteraction<CacheType>,
) {
	try {
		if (interaction.commandName === 'ping') await interaction.reply('Pong!');
		else if (interaction.commandName === 'solana') await solana(interaction);
		else if (interaction.commandName === 'check-pool')
			await checkPool(interaction);
		else if (interaction.commandName === 'top-pools')
			await topPools(interaction);
		else if (interaction.commandName === 'token-pools')
			await tokenPools(interaction);
		else await safeReply(interaction, 'Unknown command');
	} catch (error) {
		console.error(error);
		await safeReply(interaction, 'Something went wrong');
	}
}

async function handleButton(interaction: ButtonInteraction<CacheType>) {
	try {
		await interaction.deferUpdate();
		await interaction.followUp({
			content: 'Refreshing message...',
			flags: MessageFlags.Ephemeral,
		});
		if (interaction.customId.startsWith('check-pool'))
			await checkPool(interaction);
		else if (interaction.customId.startsWith('top-pools'))
			await topPools(interaction);
		else if (interaction.customId.startsWith('token-pools'))
			await tokenPools(interaction);
		await interaction.followUp({
			content: `Message ${interaction.message.url} refreshed`,
			flags: MessageFlags.Ephemeral,
		});
	} catch (error) {
		console.error(error);
		await safeReply(interaction, 'Something went wrong');
	}
}

async function safeReply(
	interaction:
		| ChatInputCommandInteraction<CacheType>
		| ButtonInteraction<CacheType>,
	content: string,
) {
	if (interaction.replied || interaction.deferred)
		await interaction.editReply(content);
	else await interaction.reply(content);
}
