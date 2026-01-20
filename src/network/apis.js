// 引入 request 文件
import request from './request.js'

//获取字典
export const getDicts = (data) => {
  return request({
    url: '/system/dict/data/type/' + data,
    method: 'get',
  })
}
//不需要token获取字典
export const getUntokenDicts = (data) => {
  return request({
    url: `/system/dictNoT/data/type/` + data,
    method: 'get',
  })
}
//手机号密码登录
export const loginByPhone = data => {
  return request({
    url: '/phone/login',
    method: 'post',
    data: data,
    header: { 'Content-Type': 'application/json' },
  })
}
//邮箱密码登录
export const loginByEmail = data => {
  return request({
    url: '/email/login',
    method: 'post',
    data: data,
    header: { 'Content-Type': 'application/json' },
  })
}

//注册
export const registerUser = data => {
  return request({
    url: '/william/registerUser',
    method: 'post',
    data: data,
    header: { 'Content-Type': 'application/json' },
  })
}
//openId获取用户信息
export const getWeUserByopenId = data => {
  return request({
    url: '/we/getWuserByopenId',
    method: 'get',
    data: data,
  })
}
//获取报账信息列表
export const getAccountList = data => {
  return request({
    url: `/account/list?pageNum=${data.pageNum}&pageSize=${data.pageSize}`,
    method: 'post',
    data: data,
  })
}
//修改报账
export const updateAccount = data => {
  return request({
    url: `/account/update`,
    method: 'put',
    data: data,
  })
}
//删除报账
export const deleteAccount = data => {
  return request({
    url: `/account/` + data.accountId,
    method: 'delete',
  })
}
//获取报账详情
export const getAccountDetail = data => {
  return request({
    url: `/account/detail`,
    method: 'get',
    data: data
  })
}
//设置tmdbkey
export const setTmdbKey = data => {
  return request({
    url: `/wechat/setTmdbkey`,
    method: 'post',
    data: data
  })
}

//设置shareData
export const setShareData = data => {
  return request({
    url: `/wechat/setShareData`,
    method: 'post',
    data: data
  })
}

//删除shareData
export const deleteShareData = data => {
  return request({
    url: `/wechat/deleteShareData`,
    method: 'post',
    data: data
  })
}

//查询shareData
export const getShareData = data => {
  return request({
    url: `/wechat/getShareData`,
    method: 'get',
    data: data
  })
}

//添加操作日志
export const addOperLog = data => {
  return request({
    url: `/monitor/operlog/add`,
    method: 'post',
    data: data
  })
}

//发送邮箱验证码
export const sendEmail = data => {
  return request({
    url: `/william/send-verification-code`,
    method: 'post',
    data: data
  })
}

//登出
export const doLogout = () => {
  return request({
    url: `/logout`,
    method: 'post',
  })
}

//修改密码
export const editPwd = data => {
  return request({
    url: `/william/editPwd`,
    method: 'post',
    data: data
  })
}
//修改用户信息
export const editUserInfo = data => {
  return request({
    url: `/system/user/profile`,
    method: 'put',
    data: data
  })
}

//修改用户手机号
export const editUserPhone = data => {
  return request({
    url: `/william/editPhone`,
    method: 'post',
    data: data
  })
}

//修改用户邮箱
export const editUserEmail = data => {
  return request({
    url: `/william/editEmail`,
    method: 'post',
    data: data
  })
}
//用户使用支付宝登录
export const loginByAlipay = data => {
  return request({
    url: `/william/alipay/login`,
    method: 'post',
    data: data
  })
}
//用户绑定支付宝
export const bindAlipay = data => {
  return request({
    url: `/william/alipay/bind`,
    method: 'post',
    data: data
  })
}
//用户解绑支付宝
export const unbindAlipay = data => {
  return request({
    url: `/william/alipay/unbind`,
    method: 'post',
    data: data
  })
}