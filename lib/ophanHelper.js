
const fetch = require('node-fetch');

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

const amountPerTag = 10; // make configurable option?

const ophanAPIUrl = tag => 
    `https://api.ophan.co.uk/api/mostread/keywordtag/${encodeURIComponent(tag)}?count=${amountPerTag}`

const getUrlsByTag = async tag => {
    const data = await fetch(ophanAPIUrl(tag)).then(res => res.json());
    return data.map(obj => obj.url)
};

const getUrlsForAllTags = async () => {
    const data = await Promise.all(tags.map(tag => getUrlsByTag(tag)))
    return data.flat(1);
}

module.exports = {
    getUrlsByTag,
    getUrlsForAllTags
}