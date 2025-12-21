npm warn config production Use `--omit=dev` instead.
> manager@0.1.0 build
> next build
Attention: Next.js now collects completely anonymous telemetry regarding usage.
This information is used to shape Next.js' roadmap and prioritize features.
You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
https://nextjs.org/telemetry
▲ Next.js 16.1.0 (Turbopack)
- Environments: .env
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
  Creating an optimized production build ...
✓ Compiled successfully in 8.5s
  Running TypeScript ...
  Collecting page data using 47 workers ...
  Generating static pages using 47 workers (0/19) ...
⚠ metadataBase property in metadata export is not set for resolving social open graph or twitter images, using "http://localhost:3000". See https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase
Error occurred prerendering page "/blog". Read more: https://nextjs.org/docs/messages/prerender-error
Error: Failed query: select "blog_posts"."id", "blog_posts"."slug", "blog_posts"."title", "blog_posts"."excerpt", "blog_posts"."featured_image", "blog_posts"."tags", "blog_posts"."published_at", "users"."name" from "blog_posts" left join "users" on "blog_posts"."author_id" = "users"."id" where "blog_posts"."status" = $1 order by "blog_posts"."published_at" desc

params: published
    at e2.queryWithCache (.next/server/chunks/ssr/src_db_index_ts_0d9caece._.js:28:37214)
    at async (.next/server/chunks/ssr/src_db_index_ts_0d9caece._.js:28:39623)
    at async g (.next/server/chunks/ssr/[root-of-the-server]__39b81a59._.js:2:405)
    at async j (.next/server/chunks/ssr/[root-of-the-server]__76bf0f68._.js:1:15022) {
  query: 'select "blog_posts"."id", "blog_posts"."slug", "blog_posts"."title", "blog_posts"."excerpt", "blog_posts"."featured_image", "blog_posts"."tags", "blog_posts"."published_at", "users"."name" from "blog_posts" left join "users" on "blog_posts"."author_id" = "users"."id" where "blog_posts"."status" = $1 order by "blog_posts"."published_at" desc',
  params: [Array],
  digest: '1362639239',
  [cause]: Error: getaddrinfo ENOTFOUND ...
      at ignore-listed frames {
    errno: -3008,
    code: 'ENOTFOUND',
    syscall: 'getaddrinfo',
    hostname: '...'
  }
}
Export encountered an error on /(marketing)/blog/page: /blog, exiting the build.
⨯ Next.js build worker exited with code: 1 and signal: null
Dockerfile:24
-------------------
22 |     # build phase
23 |     COPY . /app/.
24 | >>> RUN --mount=type=cache,id=s/d75351e2-85e1-4a2b-baa2-706efbbc16f8-next/cache,target=/app/.next/cache --mount=type=cache,id=s/d75351e2-85e1-4a2b-baa2-706efbbc16f8-node_modules/cache,target=/app/node_modules/.cache npm run build
25 |
26 |
-------------------
ERROR: failed to build: failed to solve: process "/bin/bash -ol pipefail -c npm run build" did not complete successfully: exit code: 1
Error: Docker build failed