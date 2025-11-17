import { NextRequest } from 'next/server';
import { proxyGameServerRequest } from '@/lib/server/gameServerProxy';

export async function GET(): Promise<Response> {
	return proxyGameServerRequest('/games', { method: 'GET' });
}

export async function POST(req: NextRequest): Promise<Response> {
	const body = await req.text();
	return proxyGameServerRequest('/games', {
		method: 'POST',
		body,
		headers: { 'Content-Type': 'application/json' },
	});
}
