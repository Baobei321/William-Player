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
  if (!params) return
  return Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
}

export { toParse, toStringfy }
