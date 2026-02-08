import { loginUser } from "@/utils/common";
import { loginEmby, getEmbyInfo } from "@/utils/emby";

//校验webdav
export const validateWebdav = async (title, formData, oldData, routerParams, back = true) => {
    let sourceList = uni.getStorageSync("sourceList");    
    if (title == "添加WebDAV") {
        if (sourceList.find((i) => i.type == "WebDAV").list.find((i) => i.address == formData.address)) {
            uni.showToast({
                title: "存在重复的WebDAV地址，请修改",
                icon: "none",
            });
            return;
        }
        if (sourceList.find((i) => i.type == "WebDAV").list.find((i) => i.name == formData.name)) {
            uni.showToast({
                title: "存在同名的WebDAV，请修改",
                icon: "none",
            });
            return;
        }
        try {
            const res = await loginUser(formData)
            let isHaveData = !sourceList.every((item) => {
                return !item.list.length;
            });
            if (!isHaveData) {
                sourceList.find((i) => i.type == "WebDAV").list.push({ ...formData, token: res.data.token, active: true });
                uni.setStorageSync("isreload", true);
            } else {
                sourceList.find((i) => i.type == "WebDAV").list.push({ ...formData, token: res.data.token });
            }
            uni.setStorageSync("sourceList", sourceList);
            if (back) {
                uni.navigateBack({
                    delta: 2,
                });
                setTimeout(() => {
                    uni.navigateTo({
                        url: '/pages/mobile/media/catelog-setting'
                    })
                }, 300);
            }
            return res
        } catch (error) {
            uni.showToast({
                title: "权限校验失败，请检查",
                icon: "none",
            });
        }
    } else if (title == "修改WebDAV") {
        if (sourceList.find((i) => i.type == "WebDAV").list.find((i) => i.address == formData.address) && oldData.address != formData.address) {
            uni.showToast({
                title: "存在重复的WebDAV地址，请修改",
                icon: "none",
            });
            return;
        }
        if (sourceList.find((i) => i.type == "WebDAV").list.find((i) => i.name == formData.name) && oldData.name != formData.name) {
            uni.showToast({
                title: "存在同名的WebDAV，请修改",
                icon: "none",
            });
            return;
        }

        try {
            const res = await loginUser(formData)
            let historyArr = uni.getStorageSync("historyPlay") || [];
            historyArr = historyArr.filter((v) => v.sourceType != "WebDAV" || v.sourceName != oldData.name);
            uni.setStorageSync("historyPlay", historyArr);
            formData.token = res.data.token;
            let obj = sourceList.find((i) => i.type == "WebDAV").list.find((i) => i.address == routerParams.address);
            Object.keys(formData).forEach((v) => {
                obj[v] = formData[v];
            });
            uni.setStorageSync("sourceList", sourceList);
            if (routerParams.isActive == "1") {
                uni.setStorageSync("isreload", true);
                if (back) {
                    uni.navigateBack({
                        delta: 2,
                    });
                }
                return res;
            }
            back ? uni.navigateBack() : '';
            return res
        } catch (error) {
            uni.showToast({
                title: "权限校验失败，请检查",
                icon: "none",
            });
        }
    }
}

//校验emby
export const validateEmby = async (title, formData, oldData, routerParams) => {
    let sourceList = uni.getStorageSync("sourceList");
    if (!sourceList.find((i) => i.type == "Emby")) {
        sourceList.push({ type: "Emby", list: [], img: "https://gimg3.baidu.com/search/src=https%3A%2F%2Ftiebapic.baidu.com%2Fforum%2Fw%253D120%253Bh%253D120%2Fsign%3D44147d7d4e82b2b7a79f3dc60196a3d2%2Fc9fcc3cec3fdfc03771506c1c33f8794a4c2265e.jpg%3Ftbpicau%3D2025-04-08-05_5fe90c457d4356ee146a73914e8a8871&refer=http%3A%2F%2Fwww.baidu.com&app=2021&size=w240&n=0&g=0n&q=75&fmt=auto?sec=1744045200&t=627b5377de1d3107a8a09cb4f65c9fdc" })
    }
    if (title == "添加Emby") {
        if (sourceList.find((i) => i.type == "Emby").list.find((i) => i.address == formData.address)) {
            uni.showToast({
                title: "存在重复的Emby地址，请修改",
                icon: "none",
            });
            return;
        }
        if (sourceList.find((i) => i.type == "Emby").list.find((i) => i.name == formData.name)) {
            uni.showToast({
                title: "存在同名的Emby，请修改",
                icon: "none",
            });
            return;
        }
        uni.showLoading({
            title: '加载中'
        })
        await loginEmby(formData)
            .then(async (res) => {
                uni.hideLoading()
                let isHaveData = !sourceList.every((item) => {
                    return !item.list.length;
                });
                let obj1 = {}
                if (!isHaveData) {
                    obj1 = { ...formData, userId: res.User.Id, token: res.AccessToken, active: true }
                    let embyInfo = await getEmbyInfo(obj1)
                    obj1.name = embyInfo.ServerName
                    sourceList.find((i) => i.type == "Emby").list.push(obj1);
                    uni.setStorageSync("isreload", true);
                } else {
                    obj1 = { ...formData, userId: res.User.Id, token: res.AccessToken }
                    let embyInfo = await getEmbyInfo(obj1)
                    obj1.name = embyInfo.ServerName
                    sourceList.find((i) => i.type == "Emby").list.push(obj1);
                }
                uni.setStorageSync("sourceList", sourceList);
                uni.navigateBack({
                    delta: 2,
                });
            })
            .catch(() => {
                uni.hideLoading()
                uni.showToast({
                    title: "权限校验失败，请检查",
                    icon: "none",
                });
            });
    } else if (title == "修改Emby") {
        if (sourceList.find((i) => i.type == "Emby").list.find((i) => i.address == formData.address) && oldData.address != formData.address) {
            uni.showToast({
                title: "存在重复的Emby地址，请修改",
                icon: "none",
            });
            return;
        }
        if (sourceList.find((i) => i.type == "Emby").list.find((i) => i.name == formData.name) && oldData.name != formData.name) {
            uni.showToast({
                title: "存在同名的Emby，请修改",
                icon: "none",
            });
            return;
        }
        uni.showLoading({
            title: '加载中'
        })
        await loginEmby(formData)
            .then((res) => {
                uni.hideLoading()
                let historyArr = uni.getStorageSync("historyPlay") || [];
                historyArr = historyArr.filter((v) => v.sourceType != "Emby" || v.sourceName != oldData.name);
                uni.setStorageSync("historyPlay", historyArr);
                formData.token = res.AccessToken;
                formData.userId = res.User.Id;
                let obj = sourceList.find((i) => i.type == "Emby").list.find((i) => i.address == routerParams.address);
                Object.keys(formData).forEach((v) => {
                    obj[v] = formData[v];
                });
                uni.setStorageSync("sourceList", sourceList);
                if (routerParams.isActive == "1") {
                    uni.setStorageSync("isreload", true);
                    uni.navigateBack({
                        delta: 2,
                    });
                    return;
                }
                uni.navigateBack();
            })
            .catch(() => {
                uni.hideLoading()
                uni.showToast({
                    title: "权限校验失败，请检查",
                    icon: "none",
                });
            });
    }
}