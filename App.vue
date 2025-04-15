<script>
export default {
  onLaunch: function () {
    console.log("App Launch");
    // #ifdef APP-PLUS
    plus.screen.lockOrientation("portrait-primary");
    if (process.env.NODE_ENV === "production") {
      //生产环境 禁用log
      console.log = function () {};
    }
    // #endif
  },
  onShow: function () {
    console.log("App Show");
  },
  onHide: function () {
    console.log("App Hide");
  },
};
</script>

<style lang="scss">
/*每个页面公共css */
@import "@/uni_modules/nutui-uni/components/nutui-uni/styles/index.scss";
.nut-button {
  border: none !important;
}
</style>
