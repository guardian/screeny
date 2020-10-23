const takeScreenshot = require("take-screenshots");
const mergeImg = require("merge-img");
const fetch = require("node-fetch");
const api = require("./concurrentAxios");

// Config
const tags = [
  "tone/news",
  "tone/blogposts",
  "tone/interviews",
  "tone/obituaries",
  "tone/analysis",
  "tone/letters",
  "tone/reviews",
  "tone/albumreview",
  "tone/livereview",
  "tone/explainers",
  "tone/performances",
  "tone/polls",
  "tone/profiles",
  "tone/timelines",
  "world/series/this-is-europe",
  "tone/comment",
  "tone/callout",
  "tone/competitions",
  "tone/extract",
  "tone/features",
  "tone/help",
  "tone/interview",
  "tone/matchreports",
  "tone/polls",
  "tone/quizzes",
  "tone/recipes",
];
const amountPerTag = 10;
const ophanAPIUrls = tags.map(
  (tag) =>
    `https://api.ophan.co.uk/api/mostread/keywordtag/${encodeURIComponent(
      tag
    )}?count=${amountPerTag}`
);

const ophanApi = Promise.all(
  ophanAPIUrls.map((val) => fetch(val).then((res) => res.json()))
)
  .then((data) => {
    console.log(data);
    return data;
  })
  .then((res) => res.reduce((prev, current) => prev.concat(current)));

async function getBase64(url) {
  return api
    .get(url, {
      responseType: "arraybuffer",
    })
    .then((response) => Buffer.from(response.data, "binary"));
}

const formatUrl = (url) => {
  const myUrl = new URL(url);
  return myUrl.pathname.replace(/\//gi, "-").replace(/\./gi, "dot");
};

const formatOphanUrl = (url) => url;
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

// Go
(async () => {
  const urls = await ophanApi;
  numOfUrl = urls.length * 2;
  console.log(`${numOfUrl} URLs`);

  const makeScreenshot = async (urlObj, mobileString) => {
    const url = urlObj.url;
    const url1 = `${formatOphanUrl(url)}${addSuffix1}`;
    const url2 = `${url}${addSuffix2}`;
    let skip = false;

    const apiReq = (url) =>
      `https://api.urlbox.io/v1/${
        process.env.URL_BOX_KEY
      }/png?full_page=true&url=${encodeURIComponent(
        url
      )}&scroll_increment=100&click_accept=true&click=.css-16q7h4-button-defaultSize-iconDefault-iconLeft&hide_selector=%23cmp${
        (mobileString && mobileString) || "&width=1900"
      }`;

    console.log(`Fetch ${formatUrl(url1)}`);

    const fetch1 = getBase64(apiReq(url1)).catch((e) => {
      console.log(e);
      skip = true;
    });

    console.log(`Fetch ${formatUrl(url2)}`);

    const fetch2 = getBase64(apiReq(url2)).catch((e) => {
      console.log("error", e);
      skip = true;
    });

    const [img1, img2] = await Promise.all([fetch1, fetch2]).catch((e) => {
      console.log("error", e);
      skip = true;
    });

    console.log(`Skip ${skip}`);
    if (!skip) {
      console.log("Merge images");
      try {
        await mergeImg([img1, img2]).then((img) => {
          // Save image as file

          img.write(
            `screenshots/${formatUrl(url)}${
              (mobileString && "-mobile") || ""
            }.png`,
            () => {
              console.log(`${url1} done`);
              console.log(
                `Completed ${(numCompleted = numCompleted + 1)} of ${numOfUrl}`
              );
            }
          );
        });
      } catch (e) {
        console.log(e);
      }
    }
  };

  let timeout = 1000;
  for (const urlObj of urls) {
    setTimeout(function () {
      makeScreenshot(urlObj);
    }, (timeout += 500));

    setTimeout(function () {
      makeScreenshot(urlObj, "&user_agent=mobile&width=320");
    }, (timeout += 1000));
  }
})();
