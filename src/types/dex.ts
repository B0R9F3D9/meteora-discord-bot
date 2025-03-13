interface Token {
	address: string;
	name: string;
	symbol: string;
}

interface TransactionData {
	buys: number;
	sells: number;
}

interface TimeBasedValues {
	m5: number;
	h1: number;
	h6: number;
	h24: number;
}

export interface DexPair {
	chainId: string;
	dexId: string;
	url: string;
	pairAddress: string;
	priceNative: string;
	priceUsd: string;
	fdv: number;
	marketCap: number;
	pairCreatedAt: number;
	labels: string[];
	volume: TimeBasedValues;
	priceChange: TimeBasedValues;
	baseToken: Token;
	quoteToken: Token;
	liquidity: {
		usd: number;
		base: number;
		quote: number;
	};
	boosts: {
		active: number;
	};
	txns: Record<string, TransactionData>;
	info: {
		imageUrl: string;
		websites: { url: string }[];
		socials: { platform: string; handle: string }[];
	};
}
