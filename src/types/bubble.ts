export interface BubbleResponse {
	nodes: Node[];
	links: Link[];
	metadata: {
		max_amount: number;
		min_amount: number;
	};
}

interface Node {
	address: string;
	amount: number;
	is_contract: boolean;
	percentage: number;
	token_account: string;
	transaction_count: number;
}

interface Link {
	backward: number;
	forward: number;
	source: number;
	target: number;
}
