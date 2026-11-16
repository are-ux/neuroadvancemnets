# Deploying NeuroAdvancements to AWS Amplify Hosting

Path: local project → GitHub repository → AWS Amplify Hosting.

Nothing in this guide has been run against AWS. It is prepared from the repository and from AWS's published documentation as read on 16 November 2026.

## Read this first: Next.js version

| | |
|---|---|
| Installed | Next.js **16.4.6**, React 19.3.0 |
| AWS states | "Amplify Hosting compute fully manages server-side rendering (SSR) for apps built with Next.js versions 12 through 15." |

**Next.js 16 is not on AWS's supported list.** It may well deploy and run: this site is almost entirely prerendered static pages, and third party reports describe Next.js 16 working on Amplify. But that is unverified here and unsupported by AWS, so treat the first deployment as a test, not a launch.

AWS also lists **Next.js streaming** as unsupported. This project enables `cacheComponents` and `partialPrefetching` in `next.config.ts`. Every page that the site links to is prerendered in full. One path can still stream: the build keeps a partial prerender shell for `/neurobytes/[slug]`, used when someone requests a topic address that does not exist, before the 404 page is returned. Check that case on the staging deployment (step 12 of the post deployment checks).

The decision recorded here: **Next.js 16 is kept.** The project has not been downgraded and has not been converted to a static export.

### Staging deployment approach

Because of the above, the first Amplify deployment is a staging test and never the public launch.

1. Create a branch for the test from `main`, for example `amplify-test`, and push it to GitHub.
2. In Amplify, connect **only that branch**. Leave `main` unconnected, and do not attach a custom domain.
3. Set the environment variables from section 7, with `NEXT_PUBLIC_SITE_URL` set to the address Amplify gives the branch, and booking and signups left off.
4. Deploy, then run every check in section 10 on the Amplify address.
5. If every check passes, connect `main` as the production branch, attach the domain, and repeat the checks there.
6. If the build fails, or a page, the redirect, the headers, or the unknown address case misbehaves, stop. Do not connect `main`. Record what failed and choose between options 2 and 3 below.

The staging branch can be deleted in Amplify afterwards. Nothing on it is public beyond its unlisted Amplify address.

Three ways forward, smallest first:

1. **Try it as it is**, using the staging approach above. No code change. Recommended first step.
2. **Move to Next.js 15** if option 1 fails. This is a framework change: `cacheComponents`, `partialPrefetching`, and the `instant` route option do not exist there, and the code would need a compatibility pass. Needs approval before starting.
3. **Static export.** Tested locally and it does **not** work as the project stands: the redirect and security headers in `next.config.ts` are not applied, `robots.txt` and `sitemap.xml` fail the build, and the signup API route cannot exist. It would need those four things reworked.

## 1. Node.js

- Next.js 16.4.6 requires Node.js **20.9 or later** (`engines` in `package.json`).
- AWS blocks SSR builds on Node.js 14, 16, and 18 and requires 20 or later.
- The build is pinned to **Node.js 22** in `amplify.yml` and `.nvmrc`.
- Local development has been on Node.js 24.

## 2. What the build produces

| Route | Kind |
|---|---|
| `/`, `/privacy`, `/terms`, `/medical-disclaimer`, six `/neurobytes/*` pages, 404 | Prerendered static |
| `/robots.txt`, `/sitemap.xml`, `/icon.png`, `/opengraph-image` | Prerendered static |
| `/api/subscribe` | Server route (always answers 503 until a mailing provider is connected) |
| `/consultations/book` | 307 redirect to `/#book-consultation`, from `next.config.ts` |

- Build output without local caches: about 18 MB, against Amplify's 220 MB limit for SSR apps.
- Largest response: the brain model at 1.2 MB, against Amplify's 5.72 MB response limit.
- Image optimization is used for the logo only. AWS deploys Sharp automatically. `sharp` in `devDependencies` is for the asset scripts.
- No Edge routes, no middleware, no on demand revalidation.
- No dependency needs a native binary at runtime.

## 3. GitHub repository preparation

The code is published to the **public** GitHub repository `are-ux/neuroadvancemnets`, branch `main`, over SSH (`git@github.com:are-ux/neuroadvancemnets.git`).

Because the repository is public, nothing secret may ever be committed. Keys for any future provider belong in Amplify's environment settings only.

Confirmed before the first push, in the working tree and in every commit:
- `.gitignore` excludes `node_modules`, `.next`, `.env*` (except `.env.example`), `*.pem`, local tool settings (`.claude`), and review captures (`docs/review`).
- `.env.local` is not tracked. No credentials, keys, tokens, or patient information are in the code or its history.
- Large tracked files are intentional: the brain model (1.2 MB) and its source data under `scripts/brain-source` (about 2.5 MB), which `npm run build:brain` needs.

## 4. Branch selection

Connect `main` for production, but only after the staging test described at the top of this guide has passed on a separate branch (for example `amplify-test`). Until then `main` stays unconnected.

## 5. Creating the Amplify app

1. In the Amplify console choose **Create new app**, then GitHub, and authorize access to the one repository.
2. Select the repository and branch.
3. Amplify should detect a Next.js SSR app from the `next build` script. It reads `amplify.yml` from the repository.
4. Let Amplify create a service role, or choose an existing one.
5. Add the environment variables in section 7 **before** the first build.
6. Save and deploy.

## 6. Build settings

`amplify.yml` in the repository root:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm install 22
        - nvm use 22
        - node --version
        - npm ci --cache .npm --prefer-offline
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - .npm/**/*
      - .next/cache/**/*
```

- `npm ci` installs exactly what `package-lock.json` specifies. A dry run of it passes locally.
- `baseDirectory: .next` is what AWS specifies for a Next.js SSR app.
- If a build runs out of memory, AWS's advice is to remove `.next/cache/**/*` from the cache paths.

## 7. Environment variables

All four are read at **build time** and compiled into the pages. Changing one requires a new build.

| Variable | Production value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | The site's final address, with `https://` and no trailing slash | **Required.** Canonical link, social image, `robots.txt`, and `sitemap.xml` are built from it. If unset they point at `http://localhost:3000`. |
| `NEXT_PUBLIC_CALENDLY_EVENT_URL` | `https://calendly.com/neuroadvancements/30min` | Used only when booking is on. |
| `NEXT_PUBLIC_BOOKING_ENABLED` | Leave unset or `false` | Set to `true` only after professional authorization and privacy arrangements are confirmed. While off, the booking section reads "Not yet open" and Calendly is never loaded. |
| `NEXT_PUBLIC_SIGNUPS_ENABLED` | Leave unset or `false` | Email signup forms stay closed until a mailing provider is connected in `app/api/subscribe/route.ts`. |
| `NEXT_PUBLIC_QA_SWITCHES` | Leave unset | Enables `?motion=reduce` and `?webgl=off` for review builds only. |

None of these is a secret. When a mailing provider is added, its key must be a server side variable **without** the `NEXT_PUBLIC_` prefix.

## 8. Custom domain

In the Amplify console: **Hosting → Custom domains → Add domain**. Enter the domain, follow the DNS instructions (automatic for a Route 53 zone, manual records otherwise), and wait for verification. Then set `NEXT_PUBLIC_SITE_URL` to that address and redeploy.

## 9. HTTPS

Amplify issues and renews the certificate. After the domain is active, confirm that the `http://` address redirects to `https://` and that the certificate is valid. The site sends a `Strict-Transport-Security` header, so only attach domains that will stay on HTTPS.

## 10. Post deployment checks

Run these on the Amplify address before attaching a domain.

1. The homepage loads, and the brain image is visible immediately.
2. The live 3D brain takes over within a second or two, with no jump.
3. Scrolling moves through the four anatomy chapters with their labels.
4. `/models/brain.glb` returns 200 with `Content-Type: model/gltf-binary`.
5. `/consultations/book` redirects to `/#book-consultation`.
6. Each "Book Consultation" link lands on the booking section.
7. The booking section shows the state that matches `NEXT_PUBLIC_BOOKING_ENABLED`.
8. Footer email and phone links open the mail and phone apps.
9. `/robots.txt` and `/sitemap.xml` show the real domain, not localhost.
10. View source on the homepage: the canonical link shows the real domain.
11. Response headers include `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, and `Strict-Transport-Security`. If they are missing on static files, add the same headers under **Hosting → Custom headers** in the console.
12. An unknown address shows the branded 404 page. Try both `/nothing-here` and `/neurobytes/nothing-here`: the second one is the only path that can stream.
13. Check on a real phone.

## 11. Rollback

- **Fastest:** in the Amplify console, open the branch's deployment history and choose **Redeploy this version** on the last good build.
- **In git:** revert the offending commit on the connected branch and push. Amplify builds the revert.
- Environment variable changes are not part of a build's history. Note the previous values before changing them.

## 12. Known limitations

- Next.js 16 is outside AWS's documented support (see the top of this guide).
- There is no content security policy. One should be written and tested against Calendly's embed before it is enforced.
- The brain model and stills are cached for one day because their file names are not content hashed.
- The signup forms are closed and no mailing provider is connected.
- The privacy policy and terms pages are placeholders, and the medical disclaimer is a draft.
- There are no automated tests in the repository.
- The brain model and its source data under `scripts/brain-source` come from FreeSurfer's fsaverage template. Its licence terms should be reviewed before commercial launch.
