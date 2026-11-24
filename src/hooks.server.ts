import type { Handle } from '@sveltejs/kit';

export const handle: Handle = ({ event, resolve }) =>
	resolve(event, {
		transformPageChunk: ({ html }) =>
			/\/en\/?$/.test(event.url.pathname)
				? html.replace('<html lang="pl">', '<html lang="en">')
				: html
	});
