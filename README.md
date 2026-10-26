# TP NestJS : API e-commerce (MySQL + Docker + Swagger)

Réalisé par : Farah Heni

## Description

Dans ce TP, j'ai réalisé une API REST pour une boutique en ligne avec NestJS,
TypeORM et MySQL. L'API gère les catégories, les produits, les clients et les
commandes. Elle est documentée avec Swagger et tourne dans Docker.

## Technologies utilisées

- NestJS
- TypeORM
- MySQL 8.4
- Swagger
- Docker et Docker Compose
- Vitest (tests)

## Les entités

- Une catégorie contient plusieurs produits
- Un client peut passer plusieurs commandes
- Une commande contient plusieurs lignes de commande (order_items)
- Chaque ligne de commande concerne un produit

La table `order_items` garde la quantité et le prix du produit au moment de la
commande.

## Lancer le projet avec Docker

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f api
```

Ensuite :
- Swagger : http://localhost:3000/api
- JSON OpenAPI : http://localhost:3000/api-json

Pour arrêter :
```bash
docker compose down        # garde les données
docker compose down -v     # supprime aussi les données


## Lancer le projet en local

1. Lancer MySQL :
```bash
docker compose up -d db
```

2. Créer un fichier `.env` à la racine :
```
DB_HOST=localhost
DB_PORT=3307
DB_USERNAME=shopuser
DB_PASSWORD=shoppass
DB_DATABASE=shop_db
PORT=3000
```

3. Installer et démarrer :
```bash
npm install
npm run start:dev
```

## Lancer les tests

```bash
npm test
```

## Les endpoints

| Ressource | Routes |
|---|---|
| Categories | POST, GET, GET /:id, PATCH /:id, DELETE /:id |
| Products | POST, GET (avec ?categoryId, page, limit), GET /:id, PATCH /:id, DELETE /:id |
| Clients | POST, GET, GET /:id, GET /:id/orders |
| Orders | POST, GET, PATCH /:id/cancel |

## Ce qui est géré dans l'API

- Quand on crée une commande, tout se fait dans une transaction : si le stock
  est insuffisant, rien n'est enregistré.
- Le stock est diminué à la création de la commande.
- Si on annule une commande, le stock est remis.
- On ne peut pas supprimer un produit déjà commandé ni une catégorie qui a des
  produits (erreur 409).

## Scénario de test

1. POST /categories : Informatique
2. POST /products : Clavier (100.50, stock 8)
3. POST /products : Souris (40, stock 12)
4. POST /clients : Amira Ben Ali
5. POST /orders : 2 claviers et 3 souris

Résultat attendu : total de 321.00, stock clavier = 6, stock souris = 9.

Tests d'erreurs : catégorie ou client inexistant (404), stock insuffisant (400),
produit en double (400), prix négatif (400), liste d'items vide (400).

## Remarque

Les mots de passe dans `compose.yaml` sont seulement pour le TP. Pour un vrai
projet, il faudrait utiliser des migrations, cacher les mots de passe et ne pas
exposer MySQL.