FROM oven/bun:alpine AS build

WORKDIR /app
COPY package.json bun.lockb cat.ts client.ts deploy.ts index.ts ./
RUN bun install --frozen-lockfile
RUN bun build index.ts --compile --outfile catbot

ENTRYPOINT [ "./catbot" ]
