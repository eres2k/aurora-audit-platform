10:24:54 PM: build-image version: 71a98eb82b055b934e7d58946f59957e90f5a76f (noble)
10:24:54 PM: buildbot version: 72ba091da8478e084b7407a21cd8435e7ecab808
10:24:54 PM: Fetching cached dependencies
10:24:54 PM: Failed to fetch cache, continuing with build
10:24:54 PM: Starting to prepare the repo for build
10:24:54 PM: No cached dependencies found. Cloning fresh repo
10:24:54 PM: git clone --filter=blob:none https://github.com/eres2k/aurora-audit-platform
10:24:55 PM: Preparing Git Reference refs/heads/master
10:24:57 PM: Starting to install dependencies
10:24:58 PM: Downloading and installing node v18.20.8...
10:24:58 PM: Downloading https://nodejs.org/dist/v18.20.8/node-v18.20.8-linux-x64.tar.xz...
10:24:58 PM: Computing checksum with sha256sum
10:24:58 PM: Checksums matched!
10:25:00 PM: Now using node v18.20.8 (npm v10.8.2)
10:25:00 PM: Enabling Node.js Corepack
10:25:00 PM: Started restoring cached build plugins
10:25:00 PM: Finished restoring cached build plugins
10:25:00 PM: WARNING: The environment variable 'NODE_ENV' is set to 'production'. Any 'devDependencies' in package.json will not be installed
10:25:00 PM: Started restoring cached corepack dependencies
10:25:00 PM: Finished restoring cached corepack dependencies
10:25:00 PM: No npm workspaces detected
10:25:00 PM: Started restoring cached node modules
10:25:00 PM: Finished restoring cached node modules
10:25:00 PM: Found npm version (10.8.2) that doesn't match expected (9)
Installing npm version 9
10:25:03 PM: removed 13 packages, and changed 86 packages in 2s
10:25:03 PM: 27 packages are looking for funding
10:25:03 PM:   run `npm fund` for details
10:25:03 PM: npm installed successfully
10:25:03 PM: Installing npm packages using npm version 9.9.4
10:25:05 PM: npm WARN ERESOLVE overriding peer dependency
10:25:05 PM: npm WARN ERESOLVE overriding peer dependency
10:25:05 PM: npm WARN ERESOLVE overriding peer dependency
10:25:12 PM: npm WARN deprecated w3c-hr-time@1.0.2: Use your platform's native performance.now() and performance.timeOrigin.
npm WARN deprecated stable@0.1.8: Modern JS already guarantees Array#sort() is a stable sort, so this library is deprecated. See the compatibility table on MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#browser_compatibility
10:25:12 PM: npm WARN deprecated sourcemap-codec@1.4.8: Please use @jridgewell/sourcemap-codec instead
10:25:12 PM: npm WARN deprecated workbox-cacheable-response@6.6.0: workbox-background-sync@6.6.0
10:25:12 PM: npm WARN deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
10:25:12 PM: npm WARN deprecated rollup-plugin-terser@7.0.2: This package has been deprecated and is no longer maintained. Please use @rollup/plugin-terser
10:25:12 PM: npm WARN deprecated workbox-google-analytics@6.6.0: It is not compatible with newer versions of GA starting with v4, as long as you are using GAv3 it should be ok, but the package is not longer being maintained
10:25:12 PM: npm WARN deprecated q@1.5.1: You or someone you depend on is using Q, the JavaScript Promise library that gave JavaScript developers strong feelings about promises. They can almost certainly migrate to the native JavaScript promise now. Thank you literally everyone for joining me in this bet against the odds. Be excellent to each other.
10:25:12 PM: npm WARN deprecated
10:25:12 PM: npm WARN deprecated (For a CapTP with native promises, see @endo/eventual-send and @endo/captp)
10:25:13 PM: npm WARN deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
10:25:13 PM: npm WARN deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
10:25:15 PM: npm WARN deprecated domexception@2.0.1: Use your platform's native DOMException instead
npm WARN deprecated abab@2.0.6: Use your platform's native atob() and btoa() methods instead
npm WARN deprecated svgo@1.3.2: This SVGO version is no longer supported. Upgrade to v2.x.x.
10:25:15 PM: npm WARN deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
10:25:15 PM: npm WARN deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
10:25:15 PM: npm WARN deprecated @babel/plugin-proposal-private-methods@7.18.6: This proposal has been merged to the ECMAScript standard and thus this plugin is no longer maintained. Please use @babel/plugin-transform-private-methods instead.
10:25:15 PM: npm WARN deprecated @babel/plugin-proposal-optional-chaining@7.21.0: This proposal has been merged to the ECMAScript standard and thus this plugin is no longer maintained. Please use @babel/plugin-transform-optional-chaining instead.
10:25:15 PM: npm WARN deprecated @babel/plugin-proposal-numeric-separator@7.18.6: This proposal has been merged to the ECMAScript standard and thus this plugin is no longer maintained. Please use @babel/plugin-transform-numeric-separator instead.
10:25:15 PM: npm WARN deprecated @babel/plugin-proposal-class-properties@7.18.6: This proposal has been merged to the ECMAScript standard and thus this plugin is no longer maintained. Please use @babel/plugin-transform-class-properties instead.
10:25:15 PM: npm WARN deprecated @babel/plugin-proposal-nullish-coalescing-operator@7.18.6: This proposal has been merged to the ECMAScript standard and thus this plugin is no longer maintained. Please use @babel/plugin-transform-nullish-coalescing-operator instead.
10:25:16 PM: npm WARN deprecated @babel/plugin-proposal-private-property-in-object@7.21.11: This proposal has been merged to the ECMAScript standard and thus this plugin is no longer maintained. Please use @babel/plugin-transform-private-property-in-object instead.
10:25:21 PM: npm WARN deprecated source-map@0.8.0-beta.0: The work that was done in this beta branch won't be included in future versions
npm WARN deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.
10:25:22 PM: npm WARN deprecated @mui/base@5.0.0-beta.70: This package has been replaced by @base-ui-components/react
10:25:39 PM: added 1505 packages in 36s
10:25:39 PM: npm packages installed
10:25:39 PM: Successfully installed dependencies
10:25:39 PM: Starting build script
10:25:40 PM: Detected 1 framework(s)
10:25:40 PM: "create-react-app" at version "5.0.1"
10:25:40 PM: Section completed: initializing
10:25:41 PM: ​
10:25:41 PM: Netlify Build                                                 
10:25:41 PM: ────────────────────────────────────────────────────────────────
10:25:41 PM: ​
10:25:41 PM: ❯ Version
10:25:41 PM:   @netlify/build 35.0.5
10:25:41 PM: ​
10:25:41 PM: ❯ Flags
10:25:41 PM:   accountId: 684ddce1837047caa3eda00a
10:25:41 PM:   baseRelDir: true
10:25:41 PM:   buildId: 689a519583bc3a0009830570
10:25:41 PM:   deployId: 689a519583bc3a0009830572
10:25:41 PM: ​
10:25:41 PM: ❯ Current directory
10:25:41 PM:   /opt/build/repo
10:25:41 PM: ​
10:25:41 PM: ❯ Config file
10:25:41 PM:   /opt/build/repo/netlify.toml
10:25:41 PM: ​
10:25:41 PM: ❯ Context
10:25:41 PM:   production
10:25:41 PM: ​
10:25:41 PM: ❯ Installing plugins
10:25:41 PM:    - @netlify/plugin-lighthouse@6.0.1
10:25:51 PM: ​
10:25:51 PM: ❯ Installing extensions
10:25:51 PM:    - neon
10:26:11 PM: ​
10:26:11 PM: ❯ Loading plugins
10:26:11 PM:    - @netlify/plugin-lighthouse@6.0.1 from netlify.toml
10:26:11 PM: ​
10:26:11 PM: ❯ Loading extensions
10:26:11 PM:    - neon
10:26:13 PM: ​
10:26:13 PM: build.command from netlify.toml                               
10:26:13 PM: ────────────────────────────────────────────────────────────────
10:26:13 PM: ​
10:26:13 PM: $ npm run build
10:26:13 PM: > aurora-audit-platform@1.0.0 build
10:26:13 PM: > CI=false react-scripts build
10:26:14 PM: Creating an optimized production build...
10:26:16 PM: Failed to compile.
10:26:16 PM: 
10:26:16 PM: Module not found: Error: Can't resolve 'web-vitals' in '/opt/build/repo/src'
10:26:16 PM: ​
10:26:16 PM: "build.command" failed                                        
10:26:16 PM: ────────────────────────────────────────────────────────────────
10:26:16 PM: ​
10:26:16 PM:   Error message
10:26:16 PM:   Command failed with exit code 1: npm run build (https://ntl.fyi/exit-code-1)
10:26:16 PM: ​
10:26:16 PM:   Error location
10:26:16 PM:   In build.command from netlify.toml:
10:26:16 PM:   npm run build
10:26:16 PM: ​
10:26:16 PM:   Resolved config
10:26:16 PM:   build:
10:26:16 PM:     command: npm run build
10:26:16 PM:     commandOrigin: config
10:26:16 PM:     environment:
10:26:16 PM:       - NODE_VERSION
10:26:16 PM:       - NPM_VERSION
10:26:16 PM:       - NODE_ENV
10:26:16 PM:     publish: /opt/build/repo/build
10:26:16 PM:     publishOrigin: config
10:26:16 PM:   functions:
10:26:16 PM:     "*":
10:26:16 PM:       node_bundler: esbuild
10:26:16 PM:   functionsDirectory: /opt/build/repo/netlify/functions
10:26:16 PM:   headers:
10:26:17 PM: Failed during stage 'building site': Build script returned non-zero exit code: 2 (https://ntl.fyi/exit-code-2)
10:26:17 PM:     - for: /*
      values:
        Content-Security-Policy: "default-src 'self'; script-src 'self' 'unsafe-inline'
          'unsafe-eval' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com;
          style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src
          'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:;
          connect-src 'self' https://*.supabase.co https://*.netlify.app
          https://api.github.com"
        Permissions-Policy: camera=(), microphone=(), geolocation=()
        Referrer-Policy: strict-origin-when-cross-origin
        X-Content-Type-Options: nosniff
        X-Frame-Options: DENY
        X-XSS-Protection: 1; mode=block
    - for: /static/*
      values:
        Cache-Control: public, max-age=31536000, immutable
    - for: /*.js
      values:
        Cache-Control: public, max-age=31536000, immutable
    - for: /*.css
      values:
        Cache-Control: public, max-age=31536000, immutable
    - for: /manifest.json
      values:
        Cache-Control: public, max-age=0, must-revalidate
    - for: /service-worker.js
      values:
        Cache-Control: public, max-age=0, must-revalidate
  headersOrigin: config
  plugins:
    - inputs: {}
      origin: config
      package: "@netlify/plugin-lighthouse"
  redirects:
    - from: /*
      status: 200
      to: /index.html
    - force: true
      from: /api/*
      status: 200
      to: https://your-api-domain.com/api/:splat
  redirectsOrigin: config
10:26:17 PM: Build failed due to a user error: Build script returned non-zero exit code: 2
10:26:17 PM: Failing build: Failed to build site
10:26:20 PM: Finished processing build request in 1m23.313s