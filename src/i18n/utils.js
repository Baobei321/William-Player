/**
 * 替换字符串中的命名占位符
 * @param template 模板字符串，如 "你好 {name}"
 * @param values 要替换的值对象，如 { name: '小明' }
 * @returns 替换后的字符串
 */
export function interpolateTemplate(template, values) {
  if (!values || typeof values !== 'object') return template
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '')
}