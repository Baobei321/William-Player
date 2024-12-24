import process from 'node:process';

const processShim = typeof process !== "undefined" ? process : {};
const envShim = processShim.env || {};
const platform = envShim.UNI_PLATFORM;
const isH5 = platform === "h5";
function NutResolver() {
  return {
    type: "component",
    resolve: (name) => {
      if (name.match(/^(Nut[A-Z]|nut-[a-z])/)) {
        const cName = name.slice(3).replace(/([a-z])/, "$1").toLowerCase();
        const component = `uniapp-nutui/components/${cName}/${cName}.vue`;
        const style = `uniapp-nutui/components/${cName}/index.scss`;
        return {
          name,
          from: component,
          sideEffects: isH5 ? style : ""
        };
      }
    }
  };
}

export { NutResolver };
