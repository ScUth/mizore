# Mizore Project (indev)
## Tech Stacks and Requirement
- NodeJS (Fastify, ESM)
- NextJS (MUI, React)
- Docker
- PostgresSQL
## Installation (Backend)
1. Go to the backend folder
```bash
cd node_fastify
```

2. Create `.env` from `.env.exmaple`

3. Run this command to install all the packages
```bash
npm i
``` 

4. go back to parent folder
```bash
cd ..
```
5. build the container
> [!WARNING]
> The container (now) will contain only backend (NodeJS) and database (PostgresSQL) and used the port 4000 and 5432 as such, if this port can't available on your machine, you can change the port via `.env`
> 
```bash
docker compose build
```
6. start the container
```bash
docker compose up -d
```

## Installation (Frontend)
2. Go to the frontend folder
```bash
cd nextjs
```
2. Run this command to install all the packages
```bash
npm i
``` 

4. Run to start the server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
*[Mizore Yoroizuka](https://tv2nd.anime-eupho.com/character/mizore/)*