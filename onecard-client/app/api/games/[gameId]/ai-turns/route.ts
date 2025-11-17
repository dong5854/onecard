import { NextRequest } from 'next/server';
import { proxyGameServerRequest } from '@/lib/server/gameServerProxy';

interface RouteParams {
	params: {
		gameId: string;
	};
}

export async function POST(
	_request: NextRequest,
	{ params }: RouteParams,
): Promise<Response> {
	return proxyGameServerRequest(`/games/${params.gameId}/ai-turns`, {
		method: 'POST',
	});
}
