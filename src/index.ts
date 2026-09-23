import { XMLParser } from 'fast-xml-parser';

const RSS_SOURCE_URL = 'https://www.coulisses-tv.fr/index.php/component/k2/itemlist/category/14-divertissements?format=feed&type=rss';
const EPISODE_ID_SOURCE_PREFIX = 'coulisses-tv';
const SHOW_TITLE = 'cauchemar en cuisine';
const UNSEEN_EPISODE_KEYWORD = 'inédit';

type RssGuid = string | { '#text'?: unknown; '@_isPermaLink'?: unknown };
type UnknownRecord = Record<string, unknown>;

type RssItem = {
	title?: unknown;
	link?: unknown;
	guid?: RssGuid;
	description?: unknown;
	pubDate?: unknown;
	category?: unknown;
};

type EpisodeArticle = {
	id: string;
	title: string;
	link: string;
	guid: string;
	description: string;
	pubDate: string;
	category: string;
};

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

function normalizeRssItems(value: unknown): RssItem[] {
	if (!value) {
		return [];
	}

	return Array.isArray(value) ? value.filter(isRssItem) : isRssItem(value) ? [value] : [];
}

function isRssItem(value: unknown): value is RssItem {
	return typeof value === 'object' && value !== null;
}

function isRecord(value: unknown): value is UnknownRecord {
	return typeof value === 'object' && value !== null;
}

function toStringValue(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

function extractGuid(guid: RssGuid | undefined): string {
	if (typeof guid === 'string') {
		return guid.trim();
	}

	return toStringValue(guid?.['#text']);
}

function normalizeIdentifierPart(value: string): string {
	return value.trim();
}

function createEpisodeArticleId(article: Pick<EpisodeArticle, 'guid' | 'link'>): string {
	const sourceIdentifier = normalizeIdentifierPart(article.guid || article.link);

	return `${EPISODE_ID_SOURCE_PREFIX}:${sourceIdentifier}`;
}

function includesNormalized(value: string, search: string): boolean {
	return value.toLocaleLowerCase('fr-FR').includes(search);
}

function isCauchemarEnCuisineArticle(item: EpisodeArticle): boolean {
	const searchableText = `${item.title} ${item.description}`;

	return includesNormalized(searchableText, SHOW_TITLE) && includesNormalized(searchableText, UNSEEN_EPISODE_KEYWORD);
}

function toEpisodeArticle(item: RssItem): EpisodeArticle | null {
	const title = toStringValue(item.title);
	const link = toStringValue(item.link);
	const guid = extractGuid(item.guid);

	if (!title || !link || !guid) {
		return null;
	}

	return {
		id: createEpisodeArticleId({ guid, link }),
		title,
		link,
		guid,
		description: toStringValue(item.description),
		pubDate: toStringValue(item.pubDate),
		category: toStringValue(item.category),
	};
}

function parseEpisodeArticles(rss: string): EpisodeArticle[] {
	const parser = new XMLParser();
	const feed = parser.parse(rss) as unknown;
	const rssNode = isRecord(feed) ? feed.rss : null;
	const channel = isRecord(rssNode) && isRecord(rssNode.channel) ? rssNode.channel : null;
	const items = normalizeRssItems(channel?.item);

	return items.map(toEpisodeArticle).filter((item): item is EpisodeArticle => item !== null).filter(isCauchemarEnCuisineArticle);
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
		const articles = parseEpisodeArticles(rss);

		console.log(`Found ${articles.length} Cauchemar en cuisine candidate article(s)`);

		for (const article of articles) {
			console.log(article);
		}
	},
} satisfies ExportedHandler<Env>;
