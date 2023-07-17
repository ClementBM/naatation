- [Developer guide: contributing to Docs to Markdown](#developer-guide-contributing-to-docs-to-markdown)
  - [Minimum permissions](#minimum-permissions)
  - [Getting the source to NAATation](#getting-the-source-to-naatation)
  - [Modifying the addon code](#modifying-the-addon-code)
  - [Getting your changes into the main branch of the Docs to Markdown add-on](#getting-your-changes-into-the-main-branch-of-the-docs-to-markdown-add-on)
- [Existing bugs, feature requests](#existing-bugs-feature-requests)

# Developer guide: contributing to Docs to Markdown

NAATation is a free Google Docs add-on that helps annotate climate/environmental litigation summaries written in Google Doc.

## Minimum permissions

Docs to Markdown requires only three permissions:
* permission to access the current document ([to read and convert it](https://www.googleapis.com/auth/documents))
* permission to create a sidebar (https://www.googleapis.com/auth/script.container.ui)
* permission to access spreadsheets (https://www.googleapis.com/auth/spreadsheets)

The goal is to minimize the intrusiveness of the addon.

## Getting the source to NAATation

* The source code to Docs to Markdown is in the `addon/` directory at [https://github.com/ClementBM/naatation](https://github.com/ClementBM/naatation). Fork the `NAATation` project into your own repository.

## Modifying the addon code

There is a [development/verification doc](https://docs.google.com/document/d/1XJuQ3HMVcf3LO-eI7MD0YOVPmB3QeagEaW5Yhhd9rLY) that you can use to develop changes to `NAATation`. Make a copy of the development/verification doc and change the source there :

1. Tools > Script Manager > New
2. Create a new project and copy the add-on files there (keep the same names)
3. Make your changes (and add any necessary test cases to the doc)
4. Run your modified add-on against the doc

## Getting your changes into the main branch of the Docs to Markdown add-on

1. When you’re sure your changes are working well, send me a pull request, detailing the changes you’ve made. In the pull request comment, share a link to your copy of the [development/verification doc](https://docs.google.com/document/d/1XJuQ3HMVcf3LO-eI7MD0YOVPmB3QeagEaW5Yhhd9rLY) with me (with edit permission) so that I can use it to verify any changes
2. I will add your code changes to a development branch and verify that your changes work and are consistent with the spirit of `NAATation`
3. Once I publish a new version, I will acknowledge you as a contributor (unless you prefer to remain anonymous)

# Existing bugs, feature requests

Open issues for Docs to Markdown are at [/ClementBM/naatation/issues](https://github.com/ClementBM/naatation/issues).
