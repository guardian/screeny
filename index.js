const takeScreenshot = require('take-screenshots');
const mergeImg = require('merge-img');
const fetch = require("node-fetch");

const ophanAPI = 'https://api.ophan.co.uk/api/mostread/keywordtag/tone%2Fnews?count=50';

function delay(t, v) {
    return new Promise(function(resolve) { 
        setTimeout(resolve.bind(null, v), t)
    });
 }

(async () => {

    const urls = await fetch(ophanAPI).then(resp => resp.json())

    

    let queue = Promise.resolve(); // in ES6 or BB, just Promise.resolve();

    urls.forEach(function(urlObj){
        queue = queue.then(function(res){
            console.log("Calling async func for", urlObj.url);
            return takeScreens(urlObj.url)
        });
    });

    queue.then(function(){
        console.log("Done!");
    });
    
})();

const takeScreens = async (url) => {
    let img = await takeScreenshot(url, { viewport: { width: 1400, height: 800 }, screenshot: { fullPage: true } });
    await delay(1000);
    let img2 = await takeScreenshot(`${url}?guui`, {viewport: {width: 1400, height: 800}, screenshot: { fullPage: true } });
    await delay(1000);
    await mergeImg([img, img2])
        .then((img) => {
            console.log(img)
            // Save image as file
            img.write(`screenshots/${Math.random()}.png`, () => console.log(`${url} done`));
        });
 
    await takeScreenshot.closeBrowser();
    return true;
    };
