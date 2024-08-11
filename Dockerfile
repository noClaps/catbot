FROM oven/bun AS build

WORKDIR /app
COPY package.json bun.lockb cat.ts client.ts deploy.ts index.ts ./
RUN bun install --frozen-lockfile
RUN bun build index.ts --compile --outfile ./build/catbot

FROM chainguard/wolfi-base

COPY --from=build /app/build .

CMD [ "./catbot" ]
