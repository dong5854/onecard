import { NextRequest } from 'next/server';
import { proxyGameServerRequest } from '@/lib/server/gameServerProxy';

interface RouteParams {
	params: {
		gameId: string;
	};
}

export async function GET(
	_request: NextRequest,
	{ params }: RouteParams,
): Promise<Response> {
	return proxyGameServerRequest(`/games/${params.gameId}`, { method: 'GET' });
}

export async function PATCH(
	req: NextRequest,
	{ params }: RouteParams,
): Promise<Response> {
	const body = await req.text();
	return proxyGameServerRequest(`/games/${params.gameId}`, {
		method: 'PATCH',
		body,
		headers: { 'Content-Type': 'application/json' },
	});
}

export async function DELETE(
	_request: NextRequest,
	{ params }: RouteParams,
): Promise<Response> {
	return proxyGameServerRequest(`/games/${params.gameId}`, {
		method: 'DELETE',
	});
}
