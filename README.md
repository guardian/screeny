# screeny

This tool generates side-by-side screenshots of pages rendered via DCR compared to Frontend. It can read from a Google sheet or get URLs by tag from Ophan.

Screenshots will be in png format and will stored in `./screenshots`.


## Getting started
Get a key from https://urlbox.io/ and store in `./.env` file: `URL_BOX_KEY=yourkey`.

If reading URLs from Google sheets, you'll need to get credentials to authorise the application. Credentials should live in `./credentials.json`.


Then:

```
yarn
node --max-old-space-size=25000 index.js
```

get coffee.
