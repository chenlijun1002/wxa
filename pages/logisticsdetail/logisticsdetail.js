// pages/logisticsdetail/logisticsdetail.js
//物流详情
var app = getApp();
var filter = app;
var util = require('../../utils/util.js');
Page({
    /**
     * 页面的初始数据
     */
    data: {
        loadComplete: false,
        logisticsInfo: {},
        isShowToast: false,
        toastText: {},
        copyright: {}
    },
    orderId:'',
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.orderId = options.orderId;
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
    initData(){
        var that = this;
        filter.request({
            url: '/logistics/getLogisticsDetail',
            data: { orderId: that.orderId },
            success: function (res) {
                if (res.Code == 0) {
                    that.setData({
                        loadComplete: true,
                        logisticsInfo: {
                            logisticsState: res.Data.logisticsState,
                            logisticsCompany: res.Data.logisticsCompany,
                            orderNumber: res.Data.orderNumber,
                            orderImg: res.Data.orderImg,
                            logisticsData: res.Data.logisticsData
                        }
                    })
                } else {
                    util.showToast(that, {
                        text: res.Message,
                        duration: 2000
                    });
                }
            }
        });
    },
    onShow:function (){
        app.buttomCopyrightSetData(this, false, 'close');
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    }
})