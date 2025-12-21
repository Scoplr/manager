2025-12-21T08:45:17.000000000Z [inf]  Starting Container
2025-12-21T08:45:18.645287262Z [inf]  
2025-12-21T08:45:18.645294347Z [inf]  > manager@0.1.0 start
2025-12-21T08:45:18.645300571Z [inf]  > next start
2025-12-21T08:45:18.645306495Z [inf]  
2025-12-21T08:45:18.645322257Z [inf]  ▲ Next.js 16.1.0
2025-12-21T08:45:18.645328363Z [inf]  - Local:         http://localhost:8080
2025-12-21T08:45:18.645337833Z [err]  npm warn config production Use `--omit=dev` instead.
2025-12-21T08:45:18.645337968Z [inf]  - Network:       http://10.180.212.166:8080
2025-12-21T08:45:18.645357324Z [inf]  
2025-12-21T08:45:18.645615140Z [inf]  ✓ Starting...
2025-12-21T08:45:18.645628290Z [err]  ⚠ "next start" does not work with "output: standalone" configuration. Use "node .next/standalone/server.js" instead.
2025-12-21T08:45:18.645637023Z [inf]  ✓ Ready in 601ms


--
Build Logs
2025-12-21T08:43:42.958909651Z [inf]  
2025-12-21T08:43:43.442677388Z [inf]  [35m[Region: us-west1][0m
2025-12-21T08:43:43.451660710Z [inf]  [35m==============
2025-12-21T08:43:43.451688833Z [inf]  Using Nixpacks
2025-12-21T08:43:43.451694910Z [inf]  ==============
2025-12-21T08:43:43.451699982Z [inf]  [0m
2025-12-21T08:43:43.451795034Z [inf]  context: vt3n-YHQq
2025-12-21T08:43:43.579211518Z [inf]  ╔════════════ Nixpacks v1.38.0 ════════════╗
2025-12-21T08:43:43.579227267Z [inf]  ║ setup      │ nodejs_22, npm-9_x, openssl ║
2025-12-21T08:43:43.579231945Z [inf]  ║──────────────────────────────────────────║
2025-12-21T08:43:43.579235386Z [inf]  ║ install    │ npm ci                      ║
2025-12-21T08:43:43.579240116Z [inf]  ║──────────────────────────────────────────║
2025-12-21T08:43:43.579243466Z [inf]  ║ build      │ npm run build               ║
2025-12-21T08:43:43.579246813Z [inf]  ║──────────────────────────────────────────║
2025-12-21T08:43:43.579251351Z [inf]  ║ start      │ npm run start               ║
2025-12-21T08:43:43.579254703Z [inf]  ╚══════════════════════════════════════════╝
2025-12-21T08:43:43.801200338Z [inf]  [internal] load build definition from Dockerfile
2025-12-21T08:43:43.801242355Z [inf]  [internal] load build definition from Dockerfile
2025-12-21T08:43:43.801274326Z [inf]  [internal] load build definition from Dockerfile
2025-12-21T08:43:43.801297925Z [inf]  [internal] load build definition from Dockerfile
2025-12-21T08:43:43.810012180Z [inf]  [internal] load build definition from Dockerfile
2025-12-21T08:43:43.811878096Z [inf]  [internal] load metadata for ghcr.io/railwayapp/nixpacks:ubuntu-1745885067
2025-12-21T08:43:44.093422586Z [inf]  [internal] load metadata for ghcr.io/railwayapp/nixpacks:ubuntu-1745885067
2025-12-21T08:43:44.093638473Z [inf]  [internal] load .dockerignore
2025-12-21T08:43:44.093671745Z [inf]  [internal] load .dockerignore
2025-12-21T08:43:44.093985860Z [inf]  [internal] load .dockerignore
2025-12-21T08:43:44.102325622Z [inf]  [internal] load .dockerignore
2025-12-21T08:43:44.108020304Z [inf]  [stage-0 10/10] COPY . /app
2025-12-21T08:43:44.108050728Z [inf]  [stage-0  9/10] RUN printf '\nPATH=/app/node_modules/.bin:$PATH' >> /root/.profile
2025-12-21T08:43:44.108062141Z [inf]  [stage-0  8/10] RUN --mount=type=cache,id=s/d75351e2-85e1-4a2b-baa2-706efbbc16f8-next/cache,target=/app/.next/cache --mount=type=cache,id=s/d75351e2-85e1-4a2b-baa2-706efbbc16f8-node_modules/cache,target=/app/node_modules/.cache npm run build
2025-12-21T08:43:44.108073375Z [inf]  [stage-0  7/10] COPY . /app/.
2025-12-21T08:43:44.108083198Z [inf]  [stage-0  6/10] RUN --mount=type=cache,id=s/d75351e2-85e1-4a2b-baa2-706efbbc16f8-/root/npm,target=/root/.npm npm ci
2025-12-21T08:43:44.108091710Z [inf]  [stage-0  5/10] COPY . /app/.
2025-12-21T08:43:44.108100895Z [inf]  [stage-0  4/10] RUN nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d
2025-12-21T08:43:44.108112092Z [inf]  [stage-0  3/10] COPY .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix
2025-12-21T08:43:44.108121426Z [inf]  [internal] load build context
2025-12-21T08:43:44.108130291Z [inf]  [stage-0  2/10] WORKDIR /app/
2025-12-21T08:43:44.108139004Z [inf]  [stage-0  1/10] FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067@sha256:d45c89d80e13d7ad0fd555b5130f22a866d9dd10e861f589932303ef2314c7de
2025-12-21T08:43:44.108162700Z [inf]  [internal] load build context
2025-12-21T08:43:44.108169262Z [inf]  [stage-0  1/10] FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067@sha256:d45c89d80e13d7ad0fd555b5130f22a866d9dd10e861f589932303ef2314c7de
2025-12-21T08:43:44.108177793Z [inf]  [internal] load build context
2025-12-21T08:43:44.114518027Z [inf]  [stage-0  1/10] FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067@sha256:d45c89d80e13d7ad0fd555b5130f22a866d9dd10e861f589932303ef2314c7de
2025-12-21T08:43:44.161785734Z [inf]  [internal] load build context
2025-12-21T08:43:44.164741621Z [inf]  [stage-0  2/10] WORKDIR /app/
2025-12-21T08:43:44.164766396Z [inf]  [stage-0  3/10] COPY .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix
2025-12-21T08:43:44.164779463Z [inf]  [stage-0  4/10] RUN nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d
2025-12-21T08:43:44.164800378Z [inf]  [stage-0  5/10] COPY . /app/.
2025-12-21T08:43:44.233493620Z [inf]  [stage-0  5/10] COPY . /app/.
2025-12-21T08:43:44.235269633Z [inf]  [stage-0  6/10] RUN --mount=type=cache,id=s/d75351e2-85e1-4a2b-baa2-706efbbc16f8-/root/npm,target=/root/.npm npm ci
2025-12-21T08:43:44.394375529Z [inf]  npm warn config production Use `--omit=dev` instead.

2025-12-21T08:43:52.536584438Z [inf]  npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.

2025-12-21T08:43:52.593866398Z [inf]  npm warn deprecated @esbuild-kit/esm-loader@2.6.5: Merged into tsx: https://tsx.is

2025-12-21T08:43:52.772450567Z [inf]  npm warn deprecated @esbuild-kit/core-utils@3.3.2: Merged into tsx: https://tsx.is

2025-12-21T08:43:52.799565516Z [inf]  npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported

2025-12-21T08:43:52.85147147Z [inf]  npm warn deprecated q@1.5.1: You or someone you depend on is using Q, the JavaScript Promise library that gave JavaScript developers strong feelings about promises. They can almost certainly migrate to the native JavaScript promise now. Thank you literally everyone for joining me in this bet against the odds. Be excellent to each other.
npm warn deprecated
npm warn deprecated (For a CapTP with native promises, see @endo/eventual-send and @endo/captp)

2025-12-21T08:43:58.256197002Z [inf]  
added 1049 packages, and audited 1050 packages in 14s

2025-12-21T08:43:58.256234594Z [inf]  

2025-12-21T08:43:58.256244093Z [inf]  292 packages are looking for funding

2025-12-21T08:43:58.25627107Z [inf]    run `npm fund` for details

2025-12-21T08:43:58.276523293Z [inf]  
4 moderate severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.

2025-12-21T08:43:58.872195928Z [inf]  [stage-0  6/10] RUN --mount=type=cache,id=s/d75351e2-85e1-4a2b-baa2-706efbbc16f8-/root/npm,target=/root/.npm npm ci
2025-12-21T08:43:58.873414767Z [inf]  [stage-0  7/10] COPY . /app/.
2025-12-21T08:43:59.180262520Z [inf]  [stage-0  7/10] COPY . /app/.
2025-12-21T08:43:59.181566556Z [inf]  [stage-0  8/10] RUN --mount=type=cache,id=s/d75351e2-85e1-4a2b-baa2-706efbbc16f8-next/cache,target=/app/.next/cache --mount=type=cache,id=s/d75351e2-85e1-4a2b-baa2-706efbbc16f8-node_modules/cache,target=/app/node_modules/.cache npm run build
2025-12-21T08:43:59.344030953Z [inf]  npm warn config production Use `--omit=dev` instead.

2025-12-21T08:43:59.357956777Z [inf]  
> manager@0.1.0 build
> drizzle-kit push && next build


2025-12-21T08:43:59.491817576Z [inf]  No config path provided, using default 'drizzle.config.ts'

2025-12-21T08:43:59.492119164Z [inf]  Reading config file '/app/drizzle.config.ts'

2025-12-21T08:43:59.552469502Z [inf]  [dotenv@17.2.3] injecting env (0) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild

2025-12-21T08:43:59.914781741Z [inf]  Using 'postgres' driver for database querying

2025-12-21T08:43:59.990906715Z [inf]  [⣷] Pulling schema from database...

2025-12-21T08:43:59.99923141Z [inf]  Error: getaddrinfo ENOTFOUND ...
    at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:120:26) {
  errno: -3008,
  code: 'ENOTFOUND',
  syscall: 'getaddrinfo',
  hostname: '...'
}

2025-12-21T08:44:00.736018421Z [inf]  ▲ Next.js 16.1.0 (Turbopack)

2025-12-21T08:44:00.736154342Z [inf]  - Environments: .env

2025-12-21T08:44:00.736296749Z [inf]  

2025-12-21T08:44:00.738443966Z [inf]  ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy

2025-12-21T08:44:00.797208282Z [inf]    Creating an optimized production build ...

2025-12-21T08:44:09.496685343Z [inf]  ✓ Compiled successfully in 8.2s

2025-12-21T08:44:09.506398341Z [inf]    Running TypeScript ...

2025-12-21T08:44:21.594986981Z [inf]    Collecting page data using 47 workers ...

2025-12-21T08:44:24.191740257Z [inf]    Generating static pages using 47 workers (0/21) ...

2025-12-21T08:44:24.333032562Z [inf]  ⚠ metadataBase property in metadata export is not set for resolving social open graph or twitter images, using "http://localhost:3000". See https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase

2025-12-21T08:44:24.436887196Z [inf]    Generating static pages using 47 workers (5/21) 

2025-12-21T08:44:24.461868341Z [inf]    Generating static pages using 47 workers (10/21) 

2025-12-21T08:44:24.479578796Z [inf]    Generating static pages using 47 workers (15/21) 

2025-12-21T08:44:24.531745285Z [inf]  Authorization error: Error: Dynamic server usage: Route /setup couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
    at m (.next/server/chunks/ssr/_898d38cd._.js:1:18712)
    at <unknown> (.next/server/chunks/ssr/_898d38cd._.js:415:57771)
    at g (.next/server/chunks/ssr/[root-of-the-server]__79871ff6._.js:2:424)
    at h (.next/server/chunks/ssr/[root-of-the-server]__79871ff6._.js:2:1227)
    at i (.next/server/chunks/ssr/[root-of-the-server]__79871ff6._.js:2:1405)
    at i (.next/server/chunks/ssr/_70a9f130._.js:1:835)
    at f (.next/server/chunks/ssr/[root-of-the-server]__097a6195._.js:1:1477) {
  description: "Route /setup couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
  digest: 'DYNAMIC_SERVER_USAGE'
}

2025-12-21T08:44:24.561368238Z [inf]  ✓ Generating static pages using 47 workers (21/21) in 369.7ms

2025-12-21T08:44:24.566236136Z [inf]    Finalizing page optimization ...

2025-12-21T08:44:24.814179113Z [inf]  

2025-12-21T08:44:24.817101074Z [inf]  Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /admin
├ ƒ /admin/tenants
├ ƒ /api/auth/[...nextauth]
├ ƒ /api/calendar
├ ƒ /api/calendar/ical
├ ƒ /api/db-check
├ ƒ /api/leaves/balance
├ ƒ /api/leaves/overlap
├ ƒ /api/seed
├ ƒ /api/team/workload
├ ƒ /api/v1/leaves
├ ƒ /api/v1/tasks
├ ƒ /api/v1/users
├ ƒ /app
├ ƒ /app/activity
├ ƒ /app/analytics
├ ƒ /app/announcements
├ ƒ /app/announcements/new
├ ƒ /app/approvals
├ ƒ /app/assets
├ ƒ /app/blog-admin
├ ƒ /app/calendar
├ ƒ /app/expenses
├ ƒ /app/inbox
├ ƒ /app/knowledge
├ ƒ /app/knowledge/[id]
├ ƒ /app/knowledge/new
├ ƒ /app/leaves
├ ƒ /app/meetings
├ ƒ /app/notifications
├ ƒ /app/offboarding
├ ƒ /app/offboarding/start
├ ƒ /app/onboarding
├ ƒ /app/operations
├ ƒ /app/operations/analytics
├ ƒ /app/operations/assets
├ ƒ /app/operations/payroll
├ ƒ /app/operations/requests
├ ƒ /app/operations/rooms
├ ƒ /app/payroll
├ ƒ /app/payroll/[id]
├ ƒ /app/people
├ ƒ /app/people/manage
├ ƒ /app/people/offboarding
├ ƒ /app/people/onboarding
├ ƒ /app/people/org-chart
├ ƒ /app/projects
├ ƒ /app/projects/[id]/edit
├ ƒ /app/projects/new
├ ƒ /app/reports
├ ƒ /app/requests
├ ƒ /app/rooms
├ ƒ /app/rooms/book
├ ƒ /app/rooms/new
├ ƒ /app/settings
├ ƒ /app/settings/approvals
├ ƒ /app/settings/billing
├ ƒ /app/settings/departments
├ ƒ /app/settings/expense-categories
├ ƒ /app/settings/holidays
├ ƒ /app/settings/integrations
├ ƒ /app/settings/leave-policies
├ ƒ /app/settings/modules
├ ƒ /app/settings/offboarding
├ ƒ /app/settings/offboarding/new
├ ƒ /app/tasks
├ ƒ /app/tasks/[id]
├ ƒ /app/tasks/recurring
├ ƒ /app/team
├ ƒ /app/team/[id]
├ ƒ /app/team/dashboard
├ ƒ /app/team/org-chart
├ ƒ /app/workspace
├ ƒ /app/workspace/activity
├ ƒ /app/workspace/announcements
├ ƒ /app/workspace/docs
├ ƒ /app/workspace/projects
├ ƒ /blog
├ ● /blog/[slug]
├ ○ /home
├ ƒ /invite
├ ○ /login
├ ○ /privacy
├ ○ /register
├ ƒ /setup
└ ○ /terms


ƒ Proxy (Middleware)


2025-12-21T08:44:24.817204829Z [inf]  ○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand


2025-12-21T08:44:25.064967725Z [inf]  [stage-0  8/10] RUN --mount=type=cache,id=s/d75351e2-85e1-4a2b-baa2-706efbbc16f8-next/cache,target=/app/.next/cache --mount=type=cache,id=s/d75351e2-85e1-4a2b-baa2-706efbbc16f8-node_modules/cache,target=/app/node_modules/.cache npm run build
2025-12-21T08:44:25.066568014Z [inf]  [stage-0  9/10] RUN printf '\nPATH=/app/node_modules/.bin:$PATH' >> /root/.profile
2025-12-21T08:44:25.199201410Z [inf]  [stage-0  9/10] RUN printf '\nPATH=/app/node_modules/.bin:$PATH' >> /root/.profile
2025-12-21T08:44:25.201629570Z [inf]  [stage-0 10/10] COPY . /app
2025-12-21T08:44:25.255386873Z [inf]  [stage-0 10/10] COPY . /app
2025-12-21T08:44:25.257918812Z [inf]  exporting to docker image format
2025-12-21T08:44:25.257954102Z [inf]  exporting to image
2025-12-21T08:44:35.598473913Z [inf]  [auth] sharing credentials for production-us-west2.railway-registry.com
2025-12-21T08:44:35.598518392Z [inf]  [auth] sharing credentials for production-us-west2.railway-registry.com
2025-12-21T08:44:37.931884886Z [inf]  importing to docker
2025-12-21T08:44:58.716241615Z [inf]  importing to docker
2025-12-21T08:45:01.864676052Z [inf]  === Successfully Built! ===
2025-12-21T08:45:01.864711330Z [inf]  Run:
2025-12-21T08:45:01.864720267Z [inf]  docker run -it production-us-west2.railway-registry.com/d75351e2-85e1-4a2b-baa2-706efbbc16f8:4217519b-981d-4442-901b-938418c793f0
2025-12-21T08:45:01.873367343Z [inf]  [92mBuild time: 78.42 seconds[0m
2025-12-21T08:45:17.835805236Z [inf]  
2025-12-21T08:45:17.835878197Z [inf]  [35m====================
Starting Healthcheck
====================
[0m
2025-12-21T08:45:17.835880905Z [inf]  [37mPath: /[0m
2025-12-21T08:45:17.835882759Z [inf]  [37mRetry window: 5m0s[0m
2025-12-21T08:45:17.835883869Z [inf]  
2025-12-21T08:45:18.994791387Z [inf]  [92m[1/1] Healthcheck succeeded![0m