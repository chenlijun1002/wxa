// pages/error/error.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        copyright: {}
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
        var errorStatus = options.errorStatus;
        this.setData({
            errorStatus: errorStatus
        })
        switch (Number(errorStatus)) {
            case 700:
                this.setData({
                    errorTitle: '亲，您的手机网络不太顺畅哦',
                    errorSecond: '请检查您的网络'
                })
                break;
            case 404:
                this.setData({
                    errorTitle: '您访问的页面出了意外',
                    errorSecond: '建议回到首页重新访问'
                })
                break;
            case 500:
                this.setData({
                    errorTitle: '亲，页面开小差了，紧急修复中~'
                })
                break;
            case 503:
                this.setData({
                    errorTitle: '亲，页面开小差了，紧急修复中~'
                })
                break;
            case 600:
                this.setData({
                    errorTitle: '店铺已打洋~'
                })
                break;
        }
    },
    goIndex: function () {
        if (this.data.errorStatus == 404 || this.data.errorStatus == 503 || this.data.errorStatus == 500) {
					  var permissionsList = app.getPermissions();
            if (permissionsList.indexOf('xkd_wxaapp') > -1) {
                app.navigateTo('/pages/index/index', 'reLaunch');
            } else {
                app.navigateTo('/pages/pintuan/index/index', 'reLaunch');
            }
        }
        if (this.data.errorStatus == 700) {
            wx.navigateBack({
                delta: 1
            })
        }
    },
    onShow:function (){
        app.buttomCopyrightSetData(this, 'fixed');
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    }
})