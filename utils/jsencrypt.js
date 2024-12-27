import JSEncrypt from './jsencrypt.min.js'

// 密钥对生成 http://web.chacuo.net/netrsakeypair

const publicKey = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBANeH4He5ceSh9fT+MlxEzD9M9twlRbhq\n' +
  'b5YeMcN4rjDJiTtqnH4qWt39IldzKIR9E5f0NVJQQCmWXzvQuxqixP8CAwEAAQ=='

const privateKey = 'MIIBVgIBADANBgkqhkiG9w0BAQEFAASCAUAwggE8AgEAAkEA14fgd7lx5KH19P4y\n' +
  'XETMP0z23CVFuGpvlh4xw3iuMMmJO2qcfipa3f0iV3MohH0Tl/Q1UlBAKZZfO9C7\n' +
  'GqLE/wIDAQABAkEApSodG+JioyBySVJa6VZXZtLmAgIWEaKO7G0rGW5rnjoLAxbT\n' +
  'u20nNGYwAQLReW4nZBDFWruCD0QNn56hgIzoQQIhAO3thhRj4gWolrfitOUFuCfr\n' +
  'ibV989zao2PEleQrpbQPAiEA5+bYWt4Jj4ZW03dEbyCcz3Fy5xrP849ZRZAQG5Qx\n' +
  'MBECIEo6ViA6YSNey1anFcR1mlRp+VZz6wa190+C3ziGHXYlAiEAoyjaBGTAWUjt\n' +
  'ge8iKQXLDnEFpPBKa1TqPHU1wBGt4eECIQC9fhN/vwoMIhz/c28Zw6SVCgzGEEdG\n' +
  '31RCwYK4D5YMJA=='

// 加密
export function encrypt (txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对数据进行加密
}

// 解密
export function decrypt (txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(privateKey) // 设置私钥
  return encryptor.decrypt(txt) // 对数据进行解密
}

