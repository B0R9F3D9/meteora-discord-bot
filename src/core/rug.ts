import axios from 'axios';

import type { RugData } from '@/types/rug';

export async function getRugData(token: string) {
	try {
		const response = await axios.get<RugData>(
			`https://api.rugcheck.xyz/v1/tokens/${token}/report`,
		);
		return response.data;
	} catch (error) {
		return null;
	}
}
