// 接口地址（与PHP中一致）
const url = 'https://express.baidu.com/express/api/express';
// 获取token的页面地址
const tokenUrl = 'https://www.baidu.com/baidu?isource=infinity&iname=baidu&itype=web&tn=02003390_42_hao_pg&ie=utf-8&wd=%E5%BF%AB%E9%80%92';
export const getRandomUserAgent = () => {
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15',
        'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/112.0'
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// 获取tokenV2（复刻PHP的getTokenV2方法）
export const getTokenV2 = async () => {
    return new Promise((resolve, reject) => {
        uni.request({
            url: tokenUrl,
            method: 'get',
            headers: {
                'User-Agent': getRandomUserAgent()
            },
            success: response => {
                // 正则提取tokenV2（与PHP正则规则一致）
                const pattern = /tokenV2=(.*?)"/i;
                const match = response.data.match(pattern);
                if (match && match[1]) {
                    // console.log(response, '1111res', match[1]);
                    resolve(match[1]);
                }
            },
            fail: res => {
                reject(res)
            }
        })
    })
}