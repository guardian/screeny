const { Command } = require('commander');
const mergeImg = require('merge-img');

const { fetchImg, getFileName } = require('./lib/helpers')
const { getUrlsByTag, getUrlsForAllTags } = require('./lib/ophanHelper');
const { getUrlsFromSpreadsheet } = require('./lib/spreadsheetHelper');

require('dotenv').config()

const program = new Command()

const addSuffix1 = "?dcr";
const addSuffix2 = "?dcr=false";

// Tracking
let numOfUrl = 0;
let numCompleted = 0;

// Go
async function main() {
  program
    .option('--get-by-tag <tag>')
    .option('--get-for-all-tags')
    .option('--import-from-google-sheets <sheetUrl>');

  // set restriction so only 1 can be provided at a time?
  // validate screenshots dir exists?
  // option to get top 10 of every tag?

  program.parse(process.argv);
  console.log(program.opts())

  const options = program.opts();
  let urls = [];

  if (options.getByTag) {
    urls = await getUrlsByTag(options.getByTag);
  }

  if (options.getForAllTags) {
    urls = await getUrlsForAllTags(options.getByTag);
  }

  if (options.importFromGoogleSheets) {
    urls = await getUrlsFromSpreadsheet(options.importFromGoogleSheets);
  }

  console.log('urls', urls)
  numOfUrl = urls.length * 2;
  console.log(`${numOfUrl} URLs`);

  const makeScreenshot = async (url, mobileString) => {
    const urlDcr = `${url}${addSuffix1}`;
    const urlFrontend = `${url}${addSuffix2}`;
    let skip = false;

    console.log(`Fetching ${urlDcr} and ${urlFrontend}`);

    const [img1, img2] = await Promise.all([fetchImg(urlDcr), fetchImg(urlFrontend)]).catch((e) => {
      console.log('error', e);
      skip = true;
    });

    console.log(`Skip ${skip}`);
    if (!skip) {
      try {
        console.log('merging images')
        await mergeImg([img1, img2]).then(img => {
          img.write(getFileName(url), () => console.log(
            `Completed ${(numCompleted = numCompleted + 2)} of ${numOfUrl}`)
          )
        });
      } catch (e) {
        console.log(e);
      }
    }
  };

  let timeout = 1000;
  for (const url of urls) {
    setTimeout(function () {
      makeScreenshot(url);
    }, (timeout += 500));

    // can add in as an option later?
    // setTimeout(function () {
    //   makeScreenshot(urlObj, "&user_agent=mobile&width=320");
    // }, (timeout += 1000));
  }
};

main().catch(e => {
  console.log(`ERR: ${e.message}, ${e.stack}`);
  process.exit(1);
})