// pages/distributor/distributordescription/distributordescription.js
//分销申请说明
const app = getApp();
const util = require('../../../utils/util');
var WxParse = require('../../../wxparse/wxParse.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        loadComplete: false,
        isShowToast: false,
        description: '分销简介，暂无内容',
        toastText: {},
        copyright: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (wx.getStorageSync('isLogin')) {
            this.initData();
        } else {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                this.initData();
            })
        }
    },
    getuserinfo: function () {
        this.initData();
        this.setData({
            showAuthorization: false
        })
    },
    initData() {
        let that = this;
        app.request({
            url: '/Distributor/GetDistributorDescription',
            data: {
                requestDomain: 'fxs_domain'
            },
            success: (res) => {
                if (res.Code == 0) {
                    WxParse.wxParse('article', 'html', res.Data, that, 5);
                    that.setData({
                        loadComplete: true
                    });
                } else {
                    util.showToast(that, {
                        text: '接口出错，' + res.Msg,
                        duration: 2000,
                        callBack: function () {
                            that.setData({
                                loadComplete: true
                            });
                        }
                    });
                }
            }
        });
    },
    goBack() {
        wx.navigateBack({
            delta: 1
        });
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.buttomCopyrightSetData(this, 'fixed', 'close');
    },
    sendFormId(e){
        app.sendFormId(e.detail.formId, 0);
    }
})