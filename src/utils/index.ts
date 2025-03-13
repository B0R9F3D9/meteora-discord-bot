import type { DexPair } from '@/types/dex';
import type {
	MeteoraPair,
	SortByType,
	SortOrderType,
	SortTimeframeKeyType,
	SortTimeframeType,
} from '@/types/meteora';
import type { RugData } from '@/types/rug';

export function formatNumber(amount: number): string {
	if (amount >= 1_000_000_000) {
		return `$${(amount / 1_000_000_000).toFixed(1)}B`;
	} else if (amount >= 1_000_000) {
		return `$${(amount / 1_000_000).toFixed(1)}M`;
	} else if (amount >= 1_000) {
		return `$${(amount / 1_000).toFixed(1)}K`;
	} else {
		return `$${amount.toFixed(1)}`;
	}
}

export function formatPrice(num: number): string {
	if (!Number.isFinite(num)) return 'NaN';
	if (num === 0) return '0.000';

	const absNum = Math.abs(num);

	if (absNum >= 1) {
		return num.toLocaleString('en-US', {
			minimumFractionDigits: 3,
			maximumFractionDigits: 3,
		});
	}

	const fixedNum = num.toFixed(10);
	const parts = fixedNum.split('.');
	const [integerPart, decimalPart] = parts;

	const leadingZerosMatch = decimalPart.match(/^0+/);
	const leadingZeros = leadingZerosMatch ? leadingZerosMatch[0].length : 0;

	const significantDigits = decimalPart.slice(leadingZeros, leadingZeros + 3);

	if (!significantDigits || significantDigits.length === 0) {
		return num.toExponential(3);
	}

	const subscriptNumbers = '₀₁₂₃₄₅₆₇₈₉';
	const subscript = leadingZeros
		.toString()
		.split('')
		.map(digit => subscriptNumbers[parseInt(digit)])
		.join('');

	const sign = num < 0 ? '-' : '';
	return `${sign}0.0${subscript}${significantDigits}`;
}

export function getTokenLinks(token: string) {
	return [
		`**[<:dexscreener:1340480590918451280>DEX](https://dexscreener.com/solana/${token})**`,
		`**[<:gmgn:1340480796011532338>GMGN](https://gmgn.ai/sol/token/${token})**`,
		`**[<:bubblemaps:1340746804450562218>BUBBLE](https://app.bubblemaps.io/sol/token/${token})**`,
		`**[<:rugchecker:1340747041638191235>RUG](http://rugcheck.xyz/tokens/${token})**`,
		`**[<:jupiter:1340753886574805143>JUP](https://jup.ag/swap/SOL-${token})**`,
	].join(' | ');
}

export function getPoolLinks(pool: string) {
	return [
		`**[<:dexscreener:1340480590918451280>DEX](https://dexscreener.com/solana/${pool})**`,
		`**[<:meteorapp:1340479330869972992>APP.MET](https://app.meteora.ag/dlmm/${pool})**`,
		`**[<:meteoraedge:1340750561959612467>EDGE.MET](https://edge.meteora.ag/dlmm/${pool})**`,
	].join(' | ');
}

export function generateTokenString(
	token: string,
	dexPairs: DexPair[],
	rugData: RugData | null,
) {
	dexPairs.filter(p => p.pairAddress === token);
	return [
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
		`**Address:**\`\`\`${token}\`\`\``,
		getTokenLinks(token),
	].join('\n');
}

export function generatePoolString(
	meteoraPair: MeteoraPair,
	dexPair: DexPair | undefined,
) {
	return [
		`**Bin Step:** ${meteoraPair.bin_step}`,
		'**TVL:** ' +
			(dexPair?.liquidity?.usd !== undefined
				? formatNumber(dexPair!.liquidity.usd) + ' | '
				: '') +
			formatNumber(parseFloat(meteoraPair.liquidity)),
		`**Fee:** ${parseFloat(meteoraPair.base_fee_percentage).toFixed(2)}%` +
			' | ' +
			`${parseFloat(meteoraPair.max_fee_percentage).toFixed(2)}%`,
		`**Fee(30m)/TVL:** ${meteoraPair.fee_tvl_ratio.min_30.toLocaleString()}%`,
		`**Volume(5m)**: ${
			dexPair?.volume?.m5 !== undefined
				? formatNumber(dexPair.volume.m5)
				: 'Unknown'
		}`,
		`**Earn(5m):** ${
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
				: 'Unknown'
		}`,
		`**Created:** ${dexPair?.pairCreatedAt !== undefined ? `<t:${dexPair.pairCreatedAt / 1000}:R>` : 'Unknown'}`,
		`**Address:** \`\`\`${meteoraPair.address}\`\`\``,
		getPoolLinks(meteoraPair.address),
	].join('\n');
}

export function sortMeteoraPools(
	pools: MeteoraPair[],
	sortBy: SortByType,
	sortOrder: SortOrderType,
	sortTimeframe: SortTimeframeKeyType,
) {
	if (sortBy === 'tvl') {
		sortOrder === 'desc'
			? pools.sort((a, b) => parseFloat(b.liquidity) - parseFloat(a.liquidity))
			: pools.sort((a, b) => parseFloat(a.liquidity) - parseFloat(b.liquidity));
	} else if (sortBy === 'volume') {
		sortOrder === 'desc'
			? pools.sort((a, b) => b.volume[sortTimeframe] - a.volume[sortTimeframe])
			: pools.sort((a, b) => a.volume[sortTimeframe] - b.volume[sortTimeframe]);
	} else if (sortBy === 'feetvlratio') {
		sortOrder === 'desc'
			? pools.sort(
					(a, b) =>
						b.fee_tvl_ratio[sortTimeframe] - a.fee_tvl_ratio[sortTimeframe],
				)
			: pools.sort(
					(a, b) =>
						a.fee_tvl_ratio[sortTimeframe] - b.fee_tvl_ratio[sortTimeframe],
				);
	}
}
