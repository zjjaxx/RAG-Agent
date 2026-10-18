# ── base：公共地基（Node slim + pnpm），供后续阶段复用 ──
FROM node:24-bookworm-slim AS base
WORKDIR /usr/src/app
RUN corepack enable

# ── deps：安装全量依赖（含 devDependencies），供编译使用 ──
# 只拷清单文件，改业务代码时这一层更容易命中缓存
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── build：拷源码并编译出 dist/ ──
FROM deps AS build
COPY . .
RUN pnpm run build

# ── prod-deps：只装生产依赖，体积更小、不含编译工具 ──
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# ── runner：最终上线镜像；只收 prod node_modules + dist ──
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY --from=prod-deps --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=build --chown=node:node /usr/src/app/dist ./dist
COPY --chown=node:node package.json ./

# 以非 root 用户运行
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]