import axios from 'axios';

import type {
	MeteoraPair,
	MeteoraSearch,
	SortByType,
	SortOrderType,
	SortTimeframeType,
} from '@/types/meteora';

export async function getMeteoraPair(
	pair: string,
): Promise<MeteoraPair | null> {
	const response = await axios.get<MeteoraPair>(
		`https://app.meteora.ag/clmm-api/pair/${pair}`,
	);
	return response.data;
}

export async function searchMeteoraPairs(
	sortBy: SortByType,
	sortOrder: SortOrderType,
	sortTimeframe: SortTimeframeType,
	search?: string,
): Promise<MeteoraPair[]> {
	const response = await axios.get<MeteoraSearch>(
		'https://app.meteora.ag/clmm-api/pair/all_by_groups',
		{
			params: {
				page: 0,
				limit: 100,
				unknown: true,
				sort_key:
					sortBy +
					(sortBy !== 'tvl'
						? sortTimeframe !== '24h'
							? sortTimeframe
							: ''
						: ''),
				order_by: sortOrder,
				...(search && { search_term: search }),
			},
		},
	);
	return response.data.groups.flatMap(group => group.pairs) || [];
}
