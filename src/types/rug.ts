export interface RugData {
	creator: string;
	detectedAt: string;
	events: object[];
	fileMeta: {
		description: string;
		image: string;
		name: string;
		symbol: string;
	};
	freezeAuthority: object;
	graphInsiderReport: object;
	graphInsidersDetected: number;
	knownAccounts: {
		[address: string]: {
			name: string;
			type: string;
		};
	}[];
	lockerOwners: object;
	lockers: {
		[address: string]: {
			owner: string;
			programID: string;
			tokenAccount: string;
			type: string;
			unlockDate: number;
			uri: string;
			usdcLocked: number;
		};
	}[];
	markets: object[];
	mint: string;
	mintAuthority: object;
	risks: object[];
	rugged: boolean;
	score: number;
	token: {
		decimals: number;
		freezeAuthority: object;
		isInitialized: boolean;
		mintAuthority: object;
		supply: number;
	};
	tokenMeta: {
		mutable: true;
		name: string;
		symbol: string;
		updateAuthority: string;
		uri: string;
	};
	tokenProgram: string;
	tokenType: string;
	token_extensions: object;
	topHolders: {
		address: string;
		amount: number;
		decimals: number;
		insider: boolean;
		owner: string;
		pct: number;
		uiAmount: number;
		uiAmountString: string;
	}[];
	totalLPProviders: number;
	totalMarketLiquidity: number;
	transferFee: object;
	verification: {
		description: string;
		jup_verified: boolean;
		links: object[];
		mint: string;
		name: string;
		payer: string;
		symbol: string;
	};
}
