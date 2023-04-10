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

## How to connect to the database

(I'm putting this here because I'm not super savvy when it comes to MongoDB)

Open up a docker terminal (easiest way to go is to use Docker Desktop, but that's up to you) and connect to the db:

```
mongosh fb -u fbuser -p secret
```

Connect to the fantasy-bowling database

```
use fb
```

Do a query or whatever

```
db.matchinfos.find()
```