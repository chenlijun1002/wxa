// pages/components/launchLogin/launchLogin.js
var app = getApp();
Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        bindgetuserinfo: function (e) {
            let _this = this;
            let userDetail = e.detail;
            let { iv, rawData, signature, encryptedData, userInfo } = userDetail;
            if (iv && rawData && signature && encryptedData && userInfo) {
                wx.showLoading({
                    title: '登录中···',
                })
                wx.login({//获取凭证
                    success: function (loginRes) {
                        app.requestLogin({
                            code: loginRes.code,
                            signature,
                            rawData,
                            encryptedData,
                            iv,
                            userInfo
                        },function (){
                            _this.triggerEvent('getuserinfo')
                        })
                    }
                })
            } else {
                wx.showToast({
                    title: '授权失败！',
                    image: '/pages/images/prompt-icon.png',
                    duration: 2000
                });
            }
        }
    }
})
