<script>
export default {
  onLaunch: function () {
    console.log("App Launch");
    // uni.onThemeChange((res) => {
    //   console.log("当前主题模式:", res.theme); // dark | light
    // });
    // #ifdef APP-PLUS
    // plus.screen.lockOrientation("portrait-primary");
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
    uni.removeStorageSync("isreload");
  },
};
</script>

<style lang="scss">
/*每个页面公共css */
@import "@/uni_modules/nutui-uni/components/nutui-uni/styles/index.scss";
.nut-button {
  border: none !important;
}
div {
  box-sizing: border-box;
}
*:focus {
  outline: none;
}

@media (prefers-color-scheme: dark) {
  .nut-popup {
    // background: #272727 !important;
  }
  .nut-picker {
    background: #272727 !important;
    .nut-picker__bar {
      .nut-picker__title {
        color: #fff;
      }
    }
    .nut-picker__column {
      .nut-picker__columnitem {
        .nut-picker__list {
          .nut-picker-roller {
            .nut-picker-roller-item-title {
              color: #fff;
            }
          }
          .nut-picker-roller-mask {
            background-image: linear-gradient(180deg, rgba(27, 27, 27, 0.9), rgba(27, 27, 27, 0.4)), linear-gradient(0deg, rgba(27, 27, 27, 0.9), rgba(27, 27, 27, 0.4));
            background-repeat: no-repeat;
            background-position: top, bottom;
          }
        }
      }
    }
  }
}
</style>
