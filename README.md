# Restful User App

## Overview

RESTful API that allows users to create, retrieve, update, and delete data on a PostgreSQL database

## Requirement

- node >= 18.18.0
- postgres: 16.1

## Starting up project

### By CLI

#### Step 1 (install needed depedencies)

Run the following command in root folder to install needed depedencies

```sh
npm install
```

#### Step 2 (run migration for database)

Remember create `rest_app` database before migrating.

Run the following command for migrating

```sh
npm run migration:run
```

#### Step 3 (startup the server)

Run the following command in root folder to startup the server

```sh
npm run start:dev
```

#### Step 3 (check server is running or not)

Open browser and go to link `http://localhost:3000/swagger` or `http://127.0.0.1:3000/swagger` for swagger UI and begin testing the API

#### Step 4 (test the API)

You can see this demo video (basically it's the operation on the swagger UI to test the API)

<https://drive.google.com/file/d/1XjYMPrwpI8MUrX9i7IvvVlyUweU7LAyY/view>

### By docker

#### Step 1 (startup docker containers)

Run the following command in root folder

```sh
docker compose up -d
```

![Screen Shot 2023-12-17 at 19 52 28](https://github.com/tuananhhedspibk/restful-app/assets/15076665/83ab41ca-73c6-47f9-a30a-477ace4e6be9)

Two containers:

1. restful-app-database-1 listens on 5432 port (for postgres database)
2. restful-app-nest-1 listens on 3000 port (for server code)

Please notice that the containers name maybe different in your local machine, to confirm container name, try to run:

```sh
docker ps
```

and pay attention to the containers those have `restful-app` prefix in name.

#### Step 2 (run migration for database)

Run the following command for migrating

```sh
docker exec restful-app-nest-1 npm run migration:run
```

#### Step 3 (check server is running or not)

Open browser and go to link `http://localhost:3000/swagger` or `http://127.0.0.1:3000/swagger` for swagger UI and begin testing the API

#### Step 4 (test the API)

You can see this demo video (basically it's the operation on the swagger UI to test the API)

<https://drive.google.com/file/d/1XjYMPrwpI8MUrX9i7IvvVlyUweU7LAyY/view>

## Run unit test

### By CLI

#### Step 1 (run migration for test)

Remember create `rest_app_test` database before migrating.

Run the following command for test database migrating

```sh
npm run migration:test:run
```

#### Step 2 (execute the test)

Run the following command for executing test (for all)

```sh
npm run test
```

Run the following command for executing test (for specify file)

```sh
npm run test [file_path]
```

for example:

```sh
npm run test src/users/infrastructure/rdb-repository/user/index.spec.ts
```

### By Docker

After starting up the docker container for both database and server

#### Step 1 (run migration for test)

Run the following command for test database migrating

```sh
docker exec restful-app-nest-1 npm run migration:test:run
```

#### Step 2 (execute the test)

Run the following command for executing test (for all)

```sh
docker exec restful-app-nest-1 npm run test
```

Run the following command for executing test (for specify file)

```sh
docker exec restful-app-nest-1 npm run test [file_path]
```

for example:

```sh
docker exec restful-app-nest-1 npm run test src/users/infrastructure/rdb-repository/user/index.spec.ts
```

## Architecture

### Using DDD and clean architecture here

![Screen Shot 2023-12-17 at 20 20 18](https://github.com/tuananhhedspibk/restful-app/assets/15076665/6a63bc7e-8227-4182-abbf-699c8db23e58)

### Have 4 main layers:

- domain: business domain logic will be here
- application: feature logic will be here
- presentation: API endpoints will be here
- infrastructure: interacts with external system (DB, APIs, ...)

In application layer, I split it into

- command: for updating, creating and deleting data logic.
- query: for getting data logic only.

### Notice about Depedency Inversion principal here

![Screen Shot 2023-12-17 at 20 25 56](https://github.com/tuananhhedspibk/restful-app/assets/15076665/83885e17-766b-4a95-9c4e-b26d52182215)

The inside layer will never be depending on the outside layer, for example:

- domain will never be depending on application
- application will never be depending on presentation

And the outside layer will never be depending on the inside layer, for example:

- application will never be depending on domain
- presentation will never be depending on application

### Each layer will have its own Error Class

- domain will have `DomainError`
- application will have `CommandError` and `QueryError`
- presentation will have `PresentationError`
- infrastructure will have `InfrastructureError`

See `libs/exception` folder for more details.

## Additional

### Migration generate

Run the following command

```sh
npm run migration:generate --name="MigrationName"
```

to create new migration if you want.
