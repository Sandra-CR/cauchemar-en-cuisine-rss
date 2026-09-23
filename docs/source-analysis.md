# Analyse de la source RSS

Date de l’analyse : 23 septembre 2026.

## Objectif

Identifier une source publique suffisamment pertinente pour détecter les annonces de nouveaux épisodes inédits de Cauchemar en cuisine, sans envoyer de doublons et sans dépendre d’une source trop bruitée.

## Sources testées

### Flux général Coulisses TV

URL :

```text
https://www.coulisses-tv.fr/index.php/flux-rss-tous-les-articles?format=feed&type=rss
```

Résultat observé :

- réponse RSS valide ;
- 25 items retournés ;
- aucun item contenant `Cauchemar en cuisine` au moment du test.

Conclusion : ce flux est trop général et trop limité aux articles récents. Il ne doit pas être utilisé comme source principale.

### Flux catégorie « Divertissements »

URL :

```text
https://www.coulisses-tv.fr/index.php/component/k2/itemlist/category/14-divertissements?format=feed&type=rss
```

Résultat observé :

- réponse RSS valide ;
- 25 items retournés par page ;
- pagination possible avec `start=25`, `start=50`, etc. ;
- plusieurs articles Cauchemar en cuisine retrouvés dans les premières pages.

Exemples retrouvés :

- `"Cauchemar en cuisine" à Roquebrune-sur-Argens sur M6 mercredi 23 septembre 2026 avec Philippe Echebest (vidéo)`
- `Inédit de "Cauchemar en cuisine" à Agde sur M6 le 30 septembre 2026 avec Philippe Echebest`
- `Inédit de "Cauchemar en cuisine" à Roquebrune-sur-Argens sur M6 le 23 septembre 2026 avec Philippe Echebest`

Champs disponibles :

- `title`
- `link`
- `guid`
- `description`
- `author`
- `category`
- `pubDate`
- `enclosure`

Observation importante : `guid` est présent et correspond à l’URL de l’article avec `isPermaLink=true`. C’est un bon candidat pour l’identifiant stable, à confirmer lors de l’étape dédiée.

Conclusion : ce flux est meilleur que le flux général pour une première source principale, mais il reste limité à 25 items par page. Pour éviter de manquer une annonce, il faudra probablement récupérer plusieurs pages.

### Flux « Programmes inédits »

URL :

```text
https://www.coulisses-tv.fr/index.php/programme-tv/programmes-in%C3%A9dits?format=feed&type=rss
```

Résultat observé :

- réponse RSS valide ;
- 25 items retournés ;
- un item « Cauchemar en cuisine » retrouvé dans la première page ;
- aucun item supplémentaire retrouvé dans les pages testées avec `start=25`, `start=50`, etc.

Conclusion : le thème est pertinent, mais la pagination observée est moins utile que celle de la catégorie Divertissements. Cette source peut rester une piste secondaire, mais elle n’est pas retenue comme source principale à ce stade.

## Décision

Utiliser le flux RSS de la catégorie Divertissements comme source principale à court terme.

Cette décision ne rend pas encore la détection définitivement fiable. Les prochaines étapes doivent :

- parser proprement les items RSS ;
- détecter uniquement les annonces pertinentes de Cauchemar en cuisine ;
- distinguer les annonces d’inédits des rappels, vidéos ou rediffusions ;
- définir l’identifiant unique à partir des données réellement disponibles ;
- envisager la récupération de plusieurs pages RSS paginées.
