import { fetchRssSource, parseEpisodeArticles } from './rss';

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
