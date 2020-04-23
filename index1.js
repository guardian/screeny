const takeScreenshot = require("take-screenshots");
const mergeImg = require("merge-img");
const fetch = require("node-fetch");
const fileType = require('file-type');

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

const ophanAPIUrls =['https://api.ophan.co.uk/api/mostread/keywordtag/tone%2Fnews?count=50',
'https://api.ophan.co.uk/api/mostread/keywordtag/tone%2Fcomment?count=50',
'https://api.ophan.co.uk/api/mostread/keywordtag/tone%2Ffeatures?count=50',
'https://api.ophan.co.uk/api/mostread/keywordtag/sport%2Fsport?count=50',
'https://api.ophan.co.uk/api/mostread/keywordtag/tone%2Finterview?count=50',
'https://api.ophan.co.uk/api/mostread/keywordtag/tone%2Frecipes?count=50',
'https://api.ophan.co.uk/api/mostread/keywordtag/tone%2Fmatchreports?count=50']

const ophanApi = Promise.all(
  ophanAPIUrls.map(
    val => fetch(val)
      .then(
        res => res.json()
      )
  )
)
.then(data => {console.log(data); return data})
.then(
    res => res.reduce(
      (prev, current) => prev.concat(current)
    )
  )

    
const formatOphanUrl = url => url;
// const formatOphanUrl = url =>
//   url.replace(
//     "https://www.theguardian.com/",
//     `http://localhost:3030/article?url=https://www.theguardian.com/`
//   );
const addSuffix1 = "?dcr";
const addSuffix2 = "?dcr=false";

// Tracking
let numOfUrl = 0;
let numCompleted = 0;

// Wait
async function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

// Go
(async () => {
  const urls = await ophanApi;
  numOfUrl = urls.length;
  console.log(`${numOfUrl} URLs`);

  const makeScreenshot = async (urlObj, timeout) => {
    const url = urlObj.url;
    const url1 = `${formatOphanUrl(url)}${addSuffix1}`;
    const url2 = `${url}${addSuffix2}`
    let skip = false;

    await wait(timeout);

    console.log(`Fetch ${url1}`)
    
    const fetch1 = fetch('https://screeny.netlify.app/.netlify/functions/take-screenshot', {
      method: 'post',
      body: JSON.stringify({ "pageToScreenshot": url1 })
    })
      .then(res => res.json())
      .then(json => { console.log(typeof json.data === 'string'); return (json.data && typeof json.data === 'string') ? Buffer.from(json.data, 'base64') : skip = true; } )
      .catch(e => { console.log(e); skip = true;})
      
    console.log(`Fetch ${url2}`)
    
    const fetch2 = fetch('https://screeny.netlify.app/.netlify/functions/take-screenshot', {
      method: 'post',
      body: JSON.stringify({ "pageToScreenshot": url2 })
    })
      .then(res => res.json())
      .then(json => { console.log(typeof json.data === 'string'); return (typeof json.data === 'string') ? Buffer.from(json.data, 'base64') : skip = true; } )
      .catch(e => { console.log(e); skip = true; })
    
    
      const [img1, img2] = await Promise.all([
        fetch1,
        fetch2
      ]).catch(e => { console.log(e); skip = true; });
    
    console.log(`Skip ${skip}`);
    if (!skip) {
      console.log('Merge images')
      console.log(img1)
      console.log(img2)
      try {
        await mergeImg([img1, img2]).then(img => {
          // Save image as file
      
            img.write(`screenshots/${Math.random()}.png`, () => {
              console.log(`${url1} done`);
              console.log(
                `Completed ${(numCompleted = numCompleted + 1)} of ${numOfUrl}`
              );
            });
          });
      } catch(e) {console.log(e)}
      
    }
  }
  
  let timeout = 1000;
  for (const urlObj of urls) {
    timeout += Math.min(timeout + parseInt(timeout * 1.2), 2000);
    console.log(timeout)
    makeScreenshot(urlObj, timeout)
  }

  

})();
