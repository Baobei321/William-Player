// 引入 request 文件
import request from './request.js'
 
//获取字典
export const getDicts = (data) => {
	return request({
		url: '/system/dict/data/type/'+data,
		method: 'get',
		data: params,
	})
}
//不需要token获取字典
export const getUntokenDicts = (data) => {
	return request({
		url: `/system/dictNoT/data/type/`+data,
		method: 'get',
	})
}