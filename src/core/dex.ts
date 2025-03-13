import axios from 'axios';

import type { DexPair } from '@/types/dex';

export async function getDexPairs(
	token: string,
): Promise<DexPair[] | undefined> {
	const response = await axios.get<DexPair[]>(
		`https://api.dexscreener.com/token-pairs/v1/solana/${token}`,
	);
	return response.data;
}
