export interface ChartResponse {
	candles: {
		open: number;
		high: number;
		low: number;
		close: number;
		time: number;
		volume: number;
	}[];
}
