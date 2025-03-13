export interface MeteoraSearch {
	groups: {
		name: string;
		pairs: MeteoraPair[];
	}[];
	total: number;
}

export interface MeteoraPair {
	address: string;
	name: string;
	mint_x: string;
	mint_y: string;
	reserve_x: string;
	reserve_y: string;
	reserve_x_amount: number;
	reserve_y_amount: number;
	bin_step: number;
	base_fee_percentage: string;
	max_fee_percentage: string;
	protocol_fee_percentage: string;
	liquidity: string;
	reward_mint_x: string;
	reward_mint_y: string;
	fees_24h: number;
	today_fees: number;
	trade_volume_24h: number;
	cumulative_trade_volume: string;
	cumulative_fee_volume: string;
	current_price: number;
	apr: number;
	apy: number;
	farm_apr: number;
	farm_apy: number;
	hide: boolean;
	is_blacklisted: boolean;
	fees: TimeBasedValues;
	fee_tvl_ratio: TimeBasedValues;
	volume: TimeBasedValues;
}

interface TimeBasedValues {
	min_30: number;
	hour_1: number;
	hour_2: number;
	hour_4: number;
	hour_12: number;
	hour_24: number;
}

export const METEORA_SORT_BY_KEYS = [
	{ name: 'TVL', value: 'tvl' },
	{ name: 'Volume', value: 'volume' },
	{ name: 'FeeTvlRatio', value: 'feetvlratio' },
] as const;

export const METEORA_SORT_ORDER_KEYS = [
	{ name: 'Ascending', value: 'asc' },
	{ name: 'Descending', value: 'desc' },
] as const;

export const METEORA_SORT_TIMEFRAME_KEYS = [
	{ name: '30m', value: '30m', key: 'min_30' },
	{ name: '1h', value: '1h', key: 'hour_1' },
	{ name: '2h', value: '2h', key: 'hour_2' },
	{ name: '4h', value: '4h', key: 'hour_4' },
	{ name: '12h', value: '12h', key: 'hour_12' },
	{ name: '24h', value: '24h', key: 'hour_24' },
] as const;

export type SortByType = (typeof METEORA_SORT_BY_KEYS)[number]['value'];

export type SortOrderType = (typeof METEORA_SORT_ORDER_KEYS)[number]['value'];

export type SortTimeframeType =
	(typeof METEORA_SORT_TIMEFRAME_KEYS)[number]['value'];
export type SortTimeframeKeyType =
	(typeof METEORA_SORT_TIMEFRAME_KEYS)[number]['key'];
