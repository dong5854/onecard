'server-only';

import { NextResponse } from 'next/server';
import type { RequestInit } from 'next/dist/server/web/spec-extension/request';

const DEFAULT_BASE_URL = 'http://localhost:3000';

const GAME_SERVER_URL = (() => {
	const raw = process.env.ONECARD_SERVER_URL ?? DEFAULT_BASE_URL;
	return raw.replace(/\/$/, '');
})();

export async function proxyGameServerRequest(
	path: string,
	init?: RequestInit,
): Promise<NextResponse> {
	try {
		const response = await fetch(`${GAME_SERVER_URL}${path}`, {
			...init,
			cache: 'no-store',
			headers: {
				Accept: 'application/json',
				...(init?.headers ?? {}),
			},
		});
		return await toNextResponse(response);
	} catch (error) {
		return NextResponse.json(
			{
				message:
					error instanceof Error
						? error.message
						: 'Failed to reach game server',
			},
			{ status: 502 },
		);
	}
}

async function toNextResponse(response: Response): Promise<NextResponse> {
	const contentType = response.headers.get('content-type');
	const cacheControl = response.headers.get('cache-control');
	const text = await response.text();

	const headers = new Headers();
	if (contentType) {
		headers.set('content-type', contentType);
	}
	if (cacheControl) {
		headers.set('cache-control', cacheControl);
	}

	return new NextResponse(text.length ? text : null, {
		status: response.status,
		headers,
	});
}
