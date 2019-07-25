const takeScreenshot = require('take-screenshots');
const mergeImg = require('merge-img');
const fetch = require("node-fetch");
const { Cluster } = require('puppeteer-cluster');


// Config
const ophanAPI = 'https://api.ophan.co.uk/api/mostread/keywordtag/tone%2Fnews?count=50';
const formatOphanUrl = url => url;
// const formatOphanUrl = url => url.replace('https://www.theguardian.com/', `http://localhost:3030/AmpArticle?url=https://www.theguardian.com/`);
const addSuffix = '?guui';
// const addSuffix = '';
const clusterAmount = 10;
const pupeteerScreenshotSettings = { fullPage: true };

// Tracking
let numOfUrl = 0;
let numCompleted = 0;

 // Go
(async () => {

        const urls = await fetch(ophanAPI).then(resp => resp.json())

        numOfUrl = urls.length;
        console.log(`${numOfUrl} URLs`)

        const cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: clusterAmount
          });
        
    await cluster.task(async ({ page, data }) => {
      
        
        let [img, img2] = await Promise.all([
             (async () => {console.log("Taking a screenshot of ", data.url); await page.goto(data.url); return await page.screenshot(pupeteerScreenshotSettings) })(),
             (async () => { await page.goto(data.url2); return await page.screenshot(pupeteerScreenshotSettings) })(),
        ]);
              
        await mergeImg([img, img2])
            .then((img) => {
                // Save image as file
                img.write(`screenshots/${Math.random()}.png`, () => console.log(`${data.url} done`));
                console.log(`Completed ${numCompleted = numCompleted + 1} of ${numOfUrl}`)
        });
    });
        
    urls.forEach(function (urlObj) {
        const url = formatOphanUrl(urlObj.url);
        cluster.queue({ url, url2: `${url}${addSuffix}` });
    });
        
    await cluster.idle();
    await cluster.close();
})();
