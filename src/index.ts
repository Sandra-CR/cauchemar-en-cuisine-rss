import { XMLParser } from 'fast-xml-parser';

const RSS_SOURCE_URL = 'https://www.coulisses-tv.fr/index.php/flux-rss-tous-les-articles?format=feed&type=rss';

class RssSourceError extends Error {
	constructor(
		message: string,
		readonly status: number,
		readonly statusText: string,
	) {
		super(message);
		this.name = 'RssSourceError';
	}
}

async function fetchRssSource(sourceUrl = RSS_SOURCE_URL): Promise<string> {
	const response = await fetch(sourceUrl);

	if (!response.ok) {
		throw new RssSourceError(`RSS request failed: ${response.status} ${response.statusText}`, response.status, response.statusText);
	}

	return response.text();
}

export default {
	async fetch(req): Promise<Response> {
		const url = new URL(req.url);

		if (url.pathname === '/__scheduled') {
			return new Response('Scheduled Worker endpoint');
		}

		return new Response('Cauchemar en cuisine alert', {
			status: 200,
		});
	},

	async scheduled(event, env, ctx): Promise<void> {
		const rss = await fetchRssSource();

		const parser = new XMLParser();
		const feed = parser.parse(rss);

		const items = feed?.rss?.channel?.item ?? [];

		console.log(`Found ${items.length} RSS items`);

		for (const item of items) {
			const title = item.title ?? '';

			if (!title.toLowerCase().includes('cauchemar en cuisine')) {
				continue;
			}

			console.log({
				title: item.title,
				link: item.link,
				pubDate: item.pubDate,
				description: item.description,
			});
		}
	},
} satisfies ExportedHandler<Env>;
