FROM oven/bun:slim AS build

WORKDIR /app
COPY package.json bun.lockb cat.ts client.ts deploy.ts index.ts ./
RUN bun install --frozen-lockfile
RUN bun build index.ts --target bun --outfile ./build/catbot.js

FROM oven/bun:slim AS base
COPY --from=build /app/build .

ENTRYPOINT [ "bun", "catbot.js" ]
