# screeny

This tool generates screenshots of rendered pages, it uses a 3rd party [urlBox](https://urlbox.io/) to translate a URL into an image of the rendered page. The URLs can be read from a Google sheet or can be retrieved by tag from Ophan.

Screenshots will be in png format and will be stored in `./screenshots`.

## Getting started
Get a key for urlBox and store in `./.env` file: `URL_BOX_KEY=yourkey`. Note - this is the public key for urlBox.

If reading URLs from Google sheets, you'll need to get credentials to authorise the application. Credentials should live in `./credentials.json`. This is a good starting point for generating a credentials.json for Google docs access: https://developers.google.com/workspace/guides/create-credentials

Options:
- `--get-by-tag <tag>`: screeny will retrieve 10 articles from Ophan by the given tag and use these URLs in the requests to urlBox
- `--get-for-all-tags`: screeny will retrieve 10 articles for each tag from Ophan and use these URLs in the requests to urlBox
- `--import-from-google-sheets <spreadsheetId> <sheetId>`: this option requires the user to provide both the spreadsheetId and sheetId (if not the default). Screeny will authenticate and then read all the URLs from the provided Google sheet (assuming URLs are in range A2:A)
- `--compare-to-dcr`: given this option screeny will formulate a second URL from those given (either retrieved from Ophan or Google sheets). By appending `?dcr` to the URL the article will be rendered via DCR. This option doubles the number of requests to urlBox and the output will be side-by-side images comparing articles rendered via DCR compared to Frontend.

Example request to import URLs from Google sheets (e.g. https://docs.google.com/spreadsheets/d/xxxx) and generate side-by-side images comparing the page rendered via frontend to DCR:

```
nvm use
yarn
node --max-old-space-size=25000 index.js --import-from-google-sheets "xxxx" --compare-to-dcr
```
