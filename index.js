const takeScreenshot = require("take-screenshots");
const mergeImg = require("merge-img");
const fetch = require("node-fetch");
const { Cluster } = require("puppeteer-cluster");

const autoScroll = async page => {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      let distance = 200;
      window.scrollTo(0, 0);
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 300);
    });
  });
};

// Config
//https://api.ophan.co.uk/api/mostread/keywordtag/tone%2Fnews
//https://api.ophan.co.uk/api/mostread/keywordtag/tone%2Fcomment
//https://api.ophan.co.uk/api/mostread/keywordtag/tone%2Ffeatures
//https://api.ophan.co.uk/api/mostread/keywordtag/sport%2Fsport
//https://api.ophan.co.uk/api/mostread/keywordtag/tone%2Finterview
//https://api.ophan.co.uk/api/mostread/keywordtag/tone%2Frecipes
const ophanAPI =
  "https://api.ophan.co.uk/api/mostread/keywordtag/tone%2Fmatchreports?count=50";
const formatOphanUrl = url => url;
// const formatOphanUrl = url =>
//   url.replace(
//     "https://www.theguardian.com/",
//     `http://localhost:3030/article?url=https://www.theguardian.com/`
//   );
const addSuffix1 = "?dcr";
const addSuffix2 = "?dcr=false";
const cookieToSetIn1 = {
  domain: "www.theguardian.com",
  expirationDate: 1577118107,
  hostOnly: true,
  httpOnly: true,
  name: "X-GU-Experiment-1perc-A",
  path: "/",
  sameSite: "unspecified",
  secure: false,
  session: false,
  storeId: "0",
  value: "true",
  id: 31
};
const clusterAmount = 4;
const pupeteerScreenshotSettings = {
  fullPage: true,
  defaultViewport: { width: 414 }
};

// Tracking
let numOfUrl = 0;
let numCompleted = 0;

// Go
(async () => {
  const urls = await fetch(ophanAPI).then(resp => resp.json());

  numOfUrl = urls.length;
  console.log(`${numOfUrl} URLs`);

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_BROWSER,
    maxConcurrency: clusterAmount,
    monitor: true,
    workerCreationDelay: 100
  });

  await cluster.task(async ({ page, data }) => {
    await page.setCookie(cookieToSetIn1);
    await page.setViewport({width: pupeteerScreenshotSettings.defaultViewport.width, height: 2000});
    await page.goto(data.url, { waitUntil: ["load", "networkidle2"] });
    console.log("Page 1: On page");
    await autoScroll(page, "Page 1:");
    console.log("Page 1: Scrolled");
    await page.waitFor(1000);
    const img = await page.screenshot(pupeteerScreenshotSettings);
    console.log(`Page 1: screenshot taken of ${data.url}`);
    console.log("Page 2: Going to " + data.url2);
    await page.goto(data.url2, { waitUntil: ["load", "networkidle2"] });
    console.log("Page 2: On page " + data.url2);
    await page.waitFor(2000);
    await autoScroll(page, "Page 2:");
    console.log("Page 2: Scrolled");
    await page.waitFor(2000);
    console.log("Page 2: Waited, ready for screenshot");
    const img2 = await page.screenshot(pupeteerScreenshotSettings);
    console.log(`Page 2: screenshot taken of ${data.url2}`);

    await mergeImg([img, img2]).then(img => {
      // Save image as file

      img.write(`screenshots/${Math.random()}.png`, () => {
        console.log(`${data.url} done`);
        console.log(
          `Completed ${(numCompleted = numCompleted + 1)} of ${numOfUrl}`
        );
      });
    });
  });

  urls.forEach(function(urlObj) {
    const url = urlObj.url;
    cluster.queue({
      url: `${formatOphanUrl(url)}${addSuffix1}`,
      url2: `${url}${addSuffix2}`
    });
  });

  await cluster.idle();
  await cluster.close();
})();
