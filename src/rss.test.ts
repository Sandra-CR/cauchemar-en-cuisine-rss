import assert from 'node:assert/strict';
import test from 'node:test';
import { createEpisodeArticleId, parseEpisodeArticles } from './rss';

function createRssFeed(items: string): string {
	return `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
	<channel>
		<title>Test feed</title>
		${items}
	</channel>
</rss>`;
}

test('parseEpisodeArticles returns unseen Cauchemar en cuisine articles', () => {
	const rss = createRssFeed(`
		<item>
			<title><![CDATA[Inédit de "Cauchemar en cuisine" à Agde sur M6]]></title>
			<link>https://example.test/article-1</link>
			<guid isPermaLink="true">https://example.test/article-1</guid>
			<description><![CDATA[Un numéro inédit de “Cauchemar en cuisine”.]]></description>
			<pubDate>Wed, 09 Sep 2026 15:03:53 +0200</pubDate>
			<category>Divertissements</category>
		</item>
	`);

	assert.deepEqual(parseEpisodeArticles(rss), [
		{
			id: 'coulisses-tv:https://example.test/article-1',
			title: 'Inédit de "Cauchemar en cuisine" à Agde sur M6',
			link: 'https://example.test/article-1',
			guid: 'https://example.test/article-1',
			description: 'Un numéro inédit de “Cauchemar en cuisine”.',
			pubDate: 'Wed, 09 Sep 2026 15:03:53 +0200',
			category: 'Divertissements',
		},
	]);
});

test('parseEpisodeArticles ignores unrelated articles', () => {
	const rss = createRssFeed(`
		<item>
			<title><![CDATA[La France a un incroyable talent revient sur M6]]></title>
			<link>https://example.test/article-2</link>
			<guid isPermaLink="true">https://example.test/article-2</guid>
			<description><![CDATA[Une émission inédite.]]></description>
		</item>
	`);

	assert.deepEqual(parseEpisodeArticles(rss), []);
});

test('parseEpisodeArticles ignores non-unseen Cauchemar en cuisine articles', () => {
	const rss = createRssFeed(`
		<item>
			<title><![CDATA["Cauchemar en cuisine" à Roquebrune-sur-Argens sur M6 (vidéo)]]></title>
			<link>https://example.test/article-3</link>
			<guid isPermaLink="true">https://example.test/article-3</guid>
			<description><![CDATA[Un extrait vidéo de Cauchemar en cuisine.]]></description>
		</item>
	`);

	assert.deepEqual(parseEpisodeArticles(rss), []);
});

test('parseEpisodeArticles ignores incomplete articles', () => {
	const rss = createRssFeed(`
		<item>
			<title><![CDATA[Inédit de "Cauchemar en cuisine" sur M6]]></title>
			<description><![CDATA[Un numéro inédit de Cauchemar en cuisine.]]></description>
		</item>
	`);

	assert.deepEqual(parseEpisodeArticles(rss), []);
});

test('createEpisodeArticleId prefers guid over link', () => {
	assert.equal(
		createEpisodeArticleId({
			guid: 'https://example.test/guid',
			link: 'https://example.test/link',
		}),
		'coulisses-tv:https://example.test/guid',
	);
});

test('createEpisodeArticleId falls back to link', () => {
	assert.equal(
		createEpisodeArticleId({
			guid: '',
			link: 'https://example.test/link',
		}),
		'coulisses-tv:https://example.test/link',
	);
});
