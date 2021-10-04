const { Command } = require('commander');
const fs = require('fs');
const mergeImg = require('merge-img');
const path = require('path');

const { readFromSheet } = require('./lib/googleSheets');
const { getUrlsByTag, getUrlsForAllTags } = require('./lib/ophan');
const { fetchImg } = require('./lib/urlBox')

require('dotenv').config()

const program = new Command()

const addSuffix = "?dcr";

// Tracking
let numOfUrl = 0;
let numCompleted = 0;

const parseSheetsInfo = option => {
  const spreadsheetId = option[0]
  const sheetId = option.length > 1 ? option[1] : undefined;
  return { spreadsheetId, sheetId };
}

const formatUrlForSaving = url => {
  const myUrl = new URL(url);
  return myUrl.pathname.replace(/\//gi, "-").replace(/\./gi, "dot");
}

const getFileName = url => {
  return `screenshots/${formatUrlForSaving(url)}.png`;
};

const validateDir = () => {
  const screenshotsDir = `${path.resolve(__dirname)}/screenshots`;
  try {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir);
    }
  } catch (e) {
    throw new Error('Cannot validate screenshots directory')
  }
}

// Go
async function main() {
  // prerequisite
  validateDir();
  
  program
    .description('given a list of URLs this will return a png of each page rendered via DCR vs Frontend')
    .option('--get-by-tag <tag>', 'gets article urls from ophan for provided tag')
    .option('--get-for-all-tags', 'gets 10 article urls from ophan for every tag')
    .option('--import-from-google-sheets <info...>', 'gets article urls from google sheet')
    .option('--compare-to-dcr', 'gets articles via DCR too and outputs images side by side');

  // set appropriate restrictions on options?

  program.parse(process.argv);
  const options = program.opts();
  let urls = [];
  let compareToDcr = false;

  // set default option?
  if (!Object.keys(options).length > 0) throw new Error('Must provide an option')

  if (options.getByTag) {
    urls = await getUrlsByTag(options.getByTag);
  }

  if (options.getForAllTags) {
    urls = await getUrlsForAllTags(options.getByTag);
  }

  if (options.importFromGoogleSheets) {
    const { spreadsheetId, sheetId} = parseSheetsInfo(options.importFromGoogleSheets)
    urls = await readFromSheet(spreadsheetId, sheetId);
  }

  if (options.compareToDcr) {
    compareToDcr = true;
  }
  console.log('urls', urls);
  numOfUrl = compareToDcr ? urls.length * 2 : urls.length;
  console.log(`No. of URLs: ${urls.length}, no. calls to screeny: ${numOfUrl}`);

  const makeScreenshot = async (url, mobileString) => {
    const urlDcr = `${url}${addSuffix}`;
    let skip = false;

    const log = `Fetching: ${url}` + (compareToDcr ? ` and ${urlDcr}` : ''); 
    console.log(log);

    const promises = [fetchImg(url)]
    if (compareToDcr) {
      promises.push(fetchImg(urlDcr));
    }

    const images = await Promise.all(promises).catch((e) => {
      console.log('error', e);
      skip = true;
    });

    console.log(`Skip ${skip}`);
    if (!skip) {
      try {
        console.log('merging images')
        await mergeImg(images).then(img => {
          img.write(getFileName(url), () => {
            numCompleted = numCompleted + (compareToDcr ? 2 : 1);
            console.log(`Completed ${numCompleted} of ${numOfUrl}`);
          });
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