# Development

Photo Sphere Viewer is developped in [TypeScript](https://www.typescriptlang.org/) and [SASS](https://sass-lang.com/).
The repository is a [Turborepo](https://turbo.build/repo) mono-repo containing the core package as well as official adapters and plugins.
The building process is based on [tsup](https://tsup.egoist.dev/) (toolkit based on esbuild) with a bunch of customizations.
The documentation is created with [VitePress](https://vitepress.dev/) and [TypeDoc](https://typedoc.org/).
Files are linted with [ESLint](https://eslint.org/) and [Stylelint](https://stylelint.io/).
Tests are executed with [Mocha](https://mochajs.org/) and [Cypress](https://www.cypress.io/).
You will need [Node.js 24](https://nodejs.org/) and [pnpm](https://pnpm.io/).

## Commands

-   launch the dev server with `pnpm serve`
    -   watch only some packages with `pnpm serve-filter`
-   launch the documentation with `pnpm doc:serve`
-   launch the Cypress runner with `pnpm e2e:open`
-   register all package for npm link with `pnpm npm-link`
-   execute the linters with `pnpm lint`
-   execute the unit tests with `pnpm test`
-   execute the e2e tests with `pnpm e2e:run`
-   build all the packages with `pnpm build`
-   build the documentation with `pnpm doc:build`

## Credits

These are the various photos and videos used across the demos:

- sphere, sphere-tiles, cubemap, cubemap-tiles: [Damien Sorel (me!)](https://galerie.strangeplanet.fr/picture.php?/1802/category/81)
- sphere-tiles-24k, cubemap-tiles-24k: [Greg Zaal](https://polyhaven.com/a/cannon)
- artist-workshop: [Oliksiy Yakovlyev](https://polyhaven.com/a/artist_workshop)
- equirectangular-video: [Mettle Communications](https://www.mettle.com/360vr-master-series-free-360-downloads-page)
- cubemap-video: [The Dalí Museum](https://www.youtube.com/watch?v=zQ2-oJOkTKc)
- tour : Pixexid (dead link)
- dualfisheye: [Jonna Luostari](https://jonnaluostari.com)
