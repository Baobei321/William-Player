
import { getWeUserByopenId } from "@/network/apis";
import * as CONFIG from '@/utils/config'
const toParse = (queryString) => {
  if (!queryString) return
  const obj = {};
  queryString.slice(1).split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    obj[decodeURIComponent(key)] = decodeURIComponent(value || '');
  });
  return obj;
}

const toStringfy = (params) => {
  if (!params || !Object.keys(params).length) return ''
  return Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
}

const getUserByopenId = async () => {
  let res = await getWeUserByopenId({ openId: uni.getStorageSync(CONFIG.OPEN_ID) });
  uni.setStorageSync(CONFIG.USER_ID, res.data.userId);
  uni.setStorageSync(CONFIG.USER_KEY, { roleKey: res.data.roleKey, avatar: res.data.avatar, ...res.data.wuser });
  uni.setStorageSync("Authorization", res.data.token);
  let settingData = uni.getStorageSync("settingData");
  if (settingData) {
    settingData.tmdbKey = res.data.wuser.tmdbKey;
    uni.setStorageSync("settingData", settingData);
  } else {
    uni.setStorageSync("settingData", { tmdbKey: res.data.wuser.tmdbKey, showProgress: true, playercodec: "exoplayer", showRecommend: true });
  }
};

export { toParse, toStringfy, getUserByopenId }
