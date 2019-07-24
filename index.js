const takeScreenshot = require('take-screenshots');
const mergeImg = require('merge-img');
const fetch = require("node-fetch");

// Config
const ophanAPI = 'https://api.ophan.co.uk/api/mostread/keywordtag/tone%2Fnews?count=50';
// const formatOphanUrl = url => url;
const formatOphanUrl = url => url.replace('https://www.theguardian.com/', `http://localhost:3030/AmpArticle?url=https://www.theguardian.com/`);
// const addSuffix = '?guui';
const addSuffix = '';

// Tracking
let numOfUrl = 0;
let numCompleted = 0;

// Helper
function delay(t, v) {
    return new Promise(function(resolve) { 
        setTimeout(resolve.bind(null, v), t)
    });
 }


 // Go
(async () => {

    const urls = await fetch(ophanAPI).then(resp => resp.json())

    numOfUrl = urls.length;

    let queue = Promise.resolve(); 

    urls.forEach(function (urlObj) {
        queue = queue.then(function (res) {
            const url = formatOphanUrl(urlObj.url);
            console.log("Taking a screenshot of ", url);
            return takeScreens(url)
        });
    });

    queue.then(function(){
        console.log("Done!");
    });
    
})();

const takeScreens = async (url) => {
    try {
        let [img, img2] = await Promise.all([
            takeScreenshot(url, { viewport: { width: 1400, height: 800 }, screenshot: { fullPage: true } }),
            takeScreenshot(url + addSuffix, { viewport: { width: 1400, height: 800 }, screenshot: { fullPage: true } })
        ]);
        await takeScreenshot.closeBrowser();
        await mergeImg([img, img2])
            .then((img) => {
                // Save image as file
                img.write(`screenshots/${Math.random()}.png`, () => console.log(`${url} done`));
                console.log(`Completed ${numCompleted = numCompleted + 1} of ${numOfUrl}`)
            });
     
        
        return true;
    } catch {
        return true;
    }
    
    };
