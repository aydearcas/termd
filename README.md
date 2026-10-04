# Termd

English · [Español](README.es.md)

A Markdown editor with visual editing, a code view, and document comments. Version 1.4.0.

## Features

- English by default. Empty startup with Open document, Continue where you left off, and a welcome document in the interface language.
- Configurable bracket auto-closing in Code, independent fullscreen and caret-centered Focus mode, and zoom in both editors.

- Visual and Markdown code editors, with a split view that supports editing in both panes and keeps content synchronized.
- Multiple documents in tabs, a resizable document outline, and contextual table tools.
- Standard Markdown (`.md`) and commented Markdown (`.trmd`) files.
- Printing and PDF output through the browser's print dialog.
- Local document editing without an account or a document server.

## Using Termd

Open the published web app to edit files from your device. Termd does not send your documents to a Termd server. Recovery drafts are stored locally in your browser and depend on the browser and the address you use to access the app. Save your files to keep an independent copy. If you enable remote content, such as external images, your browser will make those requests.

You can also download this repository and open `Termd.html` to use the standalone version. See [LEEME.md](LEEME.md) for additional local usage instructions and [docs/TRMD.md](docs/TRMD.md) for the commented document format. These guides are currently in Spanish.

### File formats

- **`.md`** is standard Markdown for use with other editors.
- **`.trmd`** keeps Markdown and comments together in a single Termd document. You can also save a Markdown copy from a `.trmd` document; comments are not included in that copy.

## Publishing with GitHub Pages

Follow [GUIA_PUBLICACION.md](GUIA_PUBLICACION.md), the step-by-step publishing guide in Spanish. The included `.github/workflows/pages.yml` workflow deploys the prebuilt files in `dist` whenever the `main` branch is updated. You do not need to install Node.js for the initial deployment.

The workflow deploys `dist`; it does not compile the source code. After changing files in `src`, rebuild the application and upload the updated `dist` directory as well.

## Development

With a Node.js version compatible with the project's dependencies, run these commands from the repository directory:

```bash
npm ci
npm run dev
```

To run the core tests and build the application:

```bash
npm test
npm run build
```

The build uses relative asset paths, so the app can be hosted under a subdirectory such as `/termd/`. To regenerate the standalone HTML file after building:

```bash
node scripts/package.cjs
```

Then upload the updated source files, `dist`, and, if regenerated, `Termd.html`. Browser test scripts are available in `tests`. See [docs/VERIFICACION.md](docs/VERIFICACION.md) for this release's verification report in Spanish.

## License

Termd uses the custom **Termd Source-Available License 1.0**. It permits free use, including internal use by businesses, and free redistribution with corresponding source code under the same terms. Selling or directly monetizing Termd or derived versions requires separate written permission. Unconditional voluntary contributions to the original Termd project are permitted. Documents created with Termd are not covered by this software license.

This is source-available software with commercial restrictions, rather than OSI-approved open-source software. See [LICENSE](LICENSE), the Spanish explanation in [docs/LICENCIA.md](docs/LICENCIA.md), and [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt). Third-party components retain their own licenses.

## Support Termd

Termd is free to use. If you find it useful, you can [support its development through PayPal](https://paypal.me/aydearcas). Contributions are voluntary and do not unlock additional features. The **Support Termd** link is available in the app's top bar and opens PayPal in a new tab. See [APOYAR_TERMD.md](APOYAR_TERMD.md) for publishing instructions in Spanish.

For updates to an existing repository, see [ACTUALIZAR_GITHUB.md](ACTUALIZAR_GITHUB.md), the Spanish update guide.
