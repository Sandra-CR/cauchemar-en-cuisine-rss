# Cauchemar en cuisine RSS

Worker Cloudflare personnel pour détecter les nouveaux épisodes inédits de « Cauchemar en cuisine » et, à terme, envoyer une notification push via ntfy.

## État actuel

Le Worker récupère le flux RSS Coulisses TV, parse le XML avec `fast-xml-parser`, puis log les articles dont le titre contient `Cauchemar en cuisine`.

La détection n’est pas encore considérée comme fiable : le flux RSS semble limité aux articles les plus récents. Il faudra valider la source avant d’ajouter KV et ntfy.

## Développement local

Depuis PowerShell, se placer dans le dossier du projet :

```powershell
cd C:\Users\sandr\Documents\Projets\rss-cauchemar-en-cuisine\cauchemar-en-cuisine
```

Installer les dépendances si nécessaire :

```powershell
npm.cmd install
```

Lancer Wrangler avec le support du gestionnaire `scheduled` :

```powershell
npm.cmd run dev
```

Déclencher manuellement le gestionnaire `scheduled` :

```powershell
curl "http://localhost:8787/__scheduled?cron=0+9+*+*+*"
```

## Vérification

Lancer le typecheck TypeScript :

```powershell
npm.cmd run check
```

## Note Windows / PowerShell

Sur cette machine, PowerShell peut bloquer `npm.ps1` et `npx.ps1` selon l’Execution Policy. Utiliser les shims `.cmd` évite ce problème :

```powershell
npm.cmd run dev
npx.cmd wrangler dev --test-scheduled
```

Le dossier parent `rss-cauchemar-en-cuisine` n’est pas la racine du projet Node. Les commandes npm et Wrangler doivent être lancées depuis le sous-dossier `cauchemar-en-cuisine`.
