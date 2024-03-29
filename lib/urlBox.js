import api from './concurrentAxios.js'

const getReqUrl = url => {
    const urlBoxBaseUrl = `https://api.urlbox.io/v1/${process.env.URL_BOX_KEY}/png?`;
    const searchParams = new URLSearchParams({
        'click_accept': true,
        'click_all': 'gu-close-btn',
        'full_page': true,
        'hide_cookie_banners': true,
        'hide_selector': '#sp_message_container_514493',
        url,
        width: '1900'
    }).toString();

    return `${urlBoxBaseUrl}${searchParams}`;
}
  
const getBase64 = (url) => {
    return api
    .get(url, { responseType: 'arraybuffer' })
    .then(res => {
        console.log('response received'); 
        return Buffer.from(res.data, 'binary') 
    });
}
    
export const fetchImg = url => getBase64(getReqUrl(url)).catch((e) => {
    console.log(e);
});
