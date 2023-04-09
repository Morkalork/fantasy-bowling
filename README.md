# fantasy bowling

## How to run development

Start only the database:

```
docker compose up mongodb
```

Then start the server:

```
npm run dev-server
```

(Whenever you want to rebuild it, run `npm run build-server`)

Then start the client:

```
npm run dev
```

## How to reset the database

Begin by making sure it isn't running:

```
docker compose down
```

Then delete the `mongo/` directory inside the repo. Then start it up again:

```
docker compose up
```