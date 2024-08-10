FROM oven/bun:alpine AS build

COPY package.json bun.lockb *.ts ./
RUN bun install --frozen-lockfile
RUN bun build index.ts --compile --minify --outfile catbot

FROM alpine AS base
COPY --from=build catbot ./

CMD [ "./catbot" ]
