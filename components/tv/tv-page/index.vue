<template>
  <scroll-view scroll-y="true" :style="{height:windowHeight+'px'}" ref="page" :scroll-top="scrollTop" @scroll="scroll">
    <view @click="whole.onClick" id="onClick"></view>
    <slot></slot>
  </scroll-view>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    keyCodeClick(keyCode) {
      //   this.key = keyCode;
      //   uni.$emit("keyDown", keyCode);
      console.log(keyCode, "123");
      this.$emit("keyCodeClick", keyCode);
      switch (keyCode) {
        case "KeyUp":
          //   this.evtArrow("up");
          break;
        case "KeyDown":
          //   this.evtArrow("down");
          break;
        case "KeyLeft":
          //   this.evtArrow("left");
          break;
        case "KeyRight":
          //   this.evtArrow("right");
          break;
        case "KeyEnter":
          //   this.evtEnter();
          break;
        case "KeyBack":
          //   this.evtBack();
          break;
      }
    },
  },
};
</script>
<script module="whole" lang="renderjs">
	let code=null;
	let KeyName = {
		19: 'KeyUp',
		38: 'KeyUp', //Keyboard
		20: 'KeyDown',
		40: 'KeyDown', //Keyboard
		21: 'KeyLeft',
		37: 'KeyLeft', //Keyboard
		22: 'KeyRight',
		39: 'KeyRight', //Keyboard
		23: 'KeyEnter',
		13: 'KeyEnter', //Keyboard
		4: 'KeyBack',
		18: 'KeyBack', //Keyboard Alt键
		27: 'KeyBack', //Keyboard ESC
		24: 'KeyBack', //Keyboard ESC
		66: 'KeyEnter',
		111: 'KeyBack'
	};
	export default {
		mounted() {
			//全局监听按键输入
			window.document.onkeydown = function(evt) {
				evt = evt || window.event;
				var KeyCode = evt.which || evt.keyCode;
				code = KeyName[KeyCode];				
				evt.preventDefault();
				if (code != undefined) {
					document.getElementById("onClick").click();
				}
			}

		},
		methods: {
			onClick(event, ownerInstance) {
				event.preventDefault();
				console.log(ownerInstance,'ownerInstance');
				
				ownerInstance.callMethod('keyCodeClick', code);
			}
		}
	}
</script>
<style scoped lang="scss">
.log-key-view {
  position: fixed;
  right: 0;
  color: #ffffff;
  font-size: 20rpx;
  background: #007aff;
  top: 0;
  z-index: 999;
}
</style>