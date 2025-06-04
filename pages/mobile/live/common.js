//处理iptv的m3u文件
const parseM3UToArray = (m3uContent) => {
    const lines = m3uContent.split('\n');
    const result = [];
    let currentEntry = {};

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue; // 跳过空行

        // 解析 #EXTINF 元数据行
        if (trimmedLine.startsWith('#EXTINF')) {
            // 提取 tvg-name、tvg-logo、group-title
            const metaMatch = trimmedLine.match(
                /tvg-name="([^"]+)".*tvg-logo="([^"]+)".*group-title="([^"]+)"/
            );

            currentEntry = {
                name: metaMatch ? metaMatch[1] : 'Unknown',
                logo: metaMatch ? metaMatch[2] : '',
                groupTitle: metaMatch ? metaMatch[3] : '',
                url: ''
            };

            // 如果正则匹配失败，尝试兼容性解析（例如字段顺序不同）
            if (!metaMatch) {
                currentEntry.name = trimmedLine.split(/,(.+)/)[1] || 'Unknown'; // 获取逗号后的频道名
                currentEntry.logo = (trimmedLine.match(/tvg-logo="([^"]+)"/) || [])[1] || '';
                currentEntry.groupTitle = (trimmedLine.match(/group-title="([^"]+)"/) || [])[1] || '';
            }
        }
        // 解析播放链接行（非注释行）
        else if (!trimmedLine.startsWith('#')) {
            currentEntry.url = trimmedLine;
            result.push(currentEntry);
            currentEntry = {}; // 重置当前条目
        }
    }
    return result;
}

//对iptv数组进行分类
const groupByGroupTitle = (arr, level='2') => {
    let arr1 = arr.reduce((groups, item) => {
        // 处理可能的 undefined/null/空字符串
        const key = item.name || '未命名';
        let obj = groups.find(v => v.name == key)
        if (!obj) {
            groups.push({ name: key, groupTitle: item.groupTitle, logo: item.logo, childList: [] });
            obj = groups.find(v => v.name == key)
        }
        if (level == '3') {
            obj.childList.push(item);
        }
        return groups;
    }, []);
    return arr1.reduce((groups, item) => {
        // 处理可能的 undefined/null/空字符串
        const key = item.groupTitle || '未分组';
        let obj = groups.find(v => v.name == key)
        if (!obj) {
            groups.push({ name: key, childList: [] });
            obj = groups.find(v => v.name == key)
        }
        obj.childList.push(item);
        return groups;
    }, []);
}

export { parseM3UToArray, groupByGroupTitle };
