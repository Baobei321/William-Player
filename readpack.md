# **1.简介**

William Player作为一款接入Alist、Openlist、天翼云盘、夸克网盘的视频播放器，支持各个开发者进行自定义开发。由于前期没有考虑接入天翼、夸克，后期增加导致代码可读性降低，大家也不要忘了给这个项目多提交点pr！！！！我一个人开发有点捉襟见肘。

# **2.打包安卓apk**

### 第一步：使用npm命令将项目跑起来
通过自定义脚本的形式，控制了Mobile、Tv、Pc三端的编译和打包，用于在pages.json中显示不同的页面。由于浏览器方便调试，所有dev调试皆在网页端。

```bash
mobile:npm run dev:mobile
```
```bash
tv:npm run dev:tv
```
```bash
pc:npm run dev:pc
```

<img src="https://i-blog.csdnimg.cn/direct/1e87c0e97071450f9a57fbf583fa5cfb.png" alt="Sponsor" width="100%" style="display:block"/>
此时项目跑起来之后，恭喜你完成了第一步，各位前端不需要我提醒大家npm install安装依赖吧。



### 第二步：如何使视频能够播放
此时，各位开发者同学会发现，怎么刮削出来之后，播放视频跟安卓应用怎么不一样的。
<div style="color:red">因为当前阶段还没有打包为安卓apk，无法使用原生的视频播放器插件。</div>

在开发者开发完自己的功能之后，想要生成安卓apk，安装在安卓手机上，那么此时就需要用到**Android Studio编译器**以及**Android SDK原生代码**，

<div style="color:red">sdk安卓原生代码请在github点了star之后，进群联系群主或者管理员获取</div>
<img src="https://gitee.com/CWLcwl0219/drawing-bed/raw/master/img/qq-group.jpg" alt="Sponsor" width="240"/>

### 第三步：运行Android Studio
因为各个开发的同学肯定都是以前端为主，对于Android Studio运行安卓项目肯定会比较陌生，大家可以去往上找一下如何安装Android Studio以及相应的环境，我这里就不多做介绍了。

接下来我要讲的是如何将uniapp项目离线打包成apk，使其能够在安卓手机上安装。

**1、dcloud创建应用**
大家肯定都已经从github上拉取了我的代码。
首先请大家前往[dcoud开发者中心](https://dev.dcloud.net.cn/pages/app/list)创建应用
<img src="https://i-blog.csdnimg.cn/direct/413d182876ab4ac9ac13878fdac965b6.png" alt="Sponsor" width="100%"/>
创建好应用之后会生成一个Appid，此Appid将会作为唯一标识，标识当前的项目。这个Appid很重要！！！！！！
<div style="color:red">获取到这个Appid之后，vscode全局搜索__UNI__0C3D8A9将其替换掉。</div>


**2、创建证书**
然后从下图红圈处点击进入新建的应用，并且在**Android云端证书**处创建证书，
<div style="color: rgb(0, 224, 0);">此证书用于打包安卓apk使用，没有这个证书的话，是无法在Android Studio打包的。</div>
<img src="https://i-blog.csdnimg.cn/direct/1cdef0842755410595af869ee7a809b9.png" alt="Sponsor" width="100%"/>
<img src="https://i-blog.csdnimg.cn/direct/a067bd75856143a7b337a04574cacf47.png" alt="Sponsor" width="100%"/>

**3、生成安卓离线打包Key**
<img src="https://i-blog.csdnimg.cn/direct/92ca2e8dca424cc1a815995b69644d02.png" alt="Sponsor" width="100%"/>
此时就需要用到第2个步骤中生成的证书，点击查看证书详情，获取SHA1和SHA256填写进去，生成安卓离线打包Key。

做完以上的操作之后，那么将转到安卓原生UniPlugin-Hello-AS代码的修改，也就是帮我点好star进群之后获取到的安卓原生UniPlugin-Hello-AS代码，此代码内置了原生的视频播放器，<div style="color:red">支持4k高码率播放，切换字幕和音轨。</div>
**一、填写离线打包Key**
<img src="https://i-blog.csdnimg.cn/direct/0bebf40370ea4dcfb806da55f1949678.png" alt="Sponsor" width="100%"/>
将生成安卓离线打包Key填写在此处。

**二、填写Appid**
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/2692982b63c045f58f76022fcd4b1d4a.png)
将你在dcloud创建应用生成的appid填写在此处。

**三、项目中引入证书**
众所周知，安卓打包apk是需要证书的，此步骤将告知开发者如何引入证书。
首先将[dcoud开发者中心](https://dev.dcloud.net.cn/pages/app/list)的云端证书下载下来。
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/85ac7b660a6b4ae99300472f94f29270.png)
下载下来之后，将证书重命名为<div style="color: rgb(0, 224, 0);>william-player.keystore</div> ，然后复制到Android SDK原生项目根目录下的app文件夹下，如下图所示
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/30275171db2241168df5db68f0e370c0.png)

然后修改build.gradle
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/d4ab419b2bc141e4b13d4be5b77264b8.png)
storePassword和keyPassword为同一个，请前往[dcoud开发者中心](https://dev.dcloud.net.cn/pages/app/list)Android云端证书中查看证书详情获取密码。keyPassword也就是证书详情中的别名，如下图所示：

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/0a61c37623024ec0b28fb5887b1cdbf7.png)

此时所有修改都已经完成，可以开始构建安装项目了，Ctrl+Shift+O将安卓原生UniPlugin-Hello-AS项目跑起来。

### 第四步：将uniapp项目打包成安卓apk
**1、打包生成资源**
使用vscode将uniapp项目跑起来，使用命令行npm run build:mobile打包生成手机端的资源包，或者使用命令行npm run build:tv打包生成电视端的资源包，具体用哪个命令看你要生成什么app。

打包完成之后你将会看到资源包在哪个目录下：dist/build/app![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/90302ff4f705448fa48c6adf90b25161.png)
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/e9c639cc9c7e406683de459c7ed40fb8.png)

将此文件夹下的内容全部复制到UniPlugin-Hello-AS\app\src\main\assets\apps\此处为你的appid\www下，随后进行打包

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/28c147a1d7e14857abc9f917d47f419c.png)
打包的时候只需填入UniPlugin-Hello-AS\app\build.gradle下刚才配置的别名和密码即可。
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/37d9e415b3a24abc85e51f22719b2d1a.png)

大家肯定会碰到问题，打包之后无法在电视端安装，那是因为手机和电视的架构是不一样的，原生代码中提供了三个选择给大家，默认是手机端的架构，第二个是常用的电视端架构，再不行，就注释掉前两个，放开三个
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/7ab567d52b44455f8fab4834e3c9c1e0.png)
# **3.打包windows软件**
vscode编译命令npm run build:pc，生成打包后的文件，然后大家再去参考[electron-egg](https://www.kaka996.com/pages/909757/)是怎么使用的，我这里就不做过多阐述了。
