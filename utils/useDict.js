import { getDicts, getUntokenDicts } from '../network/api';

let res1 = {}
export const useDict = () => {
  const getDict = async (...args) => {
    await Promise.all(args.map(async dictType => {
      res1[dictType] = [];
      const dicts = uni.getStorageSync('dict')[dictType];
      if (dicts) {
        res1[dictType] = dicts;
      } else {
        await getDicts(dictType).then(resp => {
          res1[dictType] = resp?.data?.map(p => ({ label: p.dictLabel, value: p.dictValue, elTagType: p.listClass, elTagClass: p.cssClass }))
          let dictObj = uni.getStorageSync('dict') || {}
          dictObj[dictType] = res1[dictType]
          uni.setStorageSync('dict', dictObj)
        })
      }
    }))
    return res1
  }

  let res2 = {}
  const getUntokenDict = async (...args) => {
    await Promise.all(args.map(async dictType => {
      res2[dictType] = [];
      const dicts = uni.getStorageSync('dict')[dictType];
      if (dicts) {
        res2[dictType] = dicts;
      } else {
        await getUntokenDicts(dictType).then(resp => {
          res2[dictType] = resp.data.map(p => ({ label: p.dictLabel, value: p.dictValue, elTagType: p.listClass, elTagClass: p.cssClass }))
          let dictObj = uni.getStorageSync('dict') || {}
          dictObj[dictType] = res2[dictType]
          uni.setStorageSync('dict', dictObj)
        })
      }
    }))
    return res2
  }
  return { getDict, getUntokenDict };
};
