// pages/reduceauction/auctionsuccess/auctionsuccess.js
const app = getApp();
const util = require('../../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        loadComplete: false,
        activityStatus: 1,
        copyright: {}
    },
    time:null,
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
        const that = this,
            orderId = options.orderId;
        that.setData({ orderId })
        if (wx.getStorageSync('isLogin')) {
            that.initData();
        } else {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                that.initData();
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
        const that = this;
        app.request({
            url: '/ActivityIndex/ActivityList',
            requestDomain: 'ymf_domain',
            data: {
                activityStatus: 1,
                activityType: 0,
                activityName: ''
            },
            success: function (res) {
                if (res.Code == 0) {
                    var data = JSON.parse(res.Data);
                    data.ActivityList.forEach(function (item) {
                        item.ProductOldPrice = item.ProductOldPrice.toFixed(2);
                        item.SalePrice = item.SalePrice.toFixed(2);
                        item.activityStatus = 1;
                    })
                    that.data.copyright.position = data.ActivityList > 1 ? '' : 'copyright-fixed';
                    that.setData({
                        activityList: data.ActivityList,
                        copyright: that.data.copyright
                    })
                    that.time=setInterval(function () {
                        that.data.activityList.forEach(function (item) {
                            item.endDate = util.timeDifference(item.ActivityEnd);
                        })
                        that.setData({
                            activityList: that.data.activityList
                        })
                    }, 1000)
                }
            },
            complete() {
                that.setData({ loadComplete: true })
            }
        })
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    onShow:function (){
        app.buttomCopyrightSetData(this,false,'close');
    }
})