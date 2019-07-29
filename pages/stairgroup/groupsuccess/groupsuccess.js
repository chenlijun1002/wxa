// pages/stairgroup/groupsuccess/groupsuccess.js
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

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const that = this,
            orderId = options.orderId;
        that.setData({ orderId })
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
                    that.setData({ activityList: data.ActivityList })
                    setInterval(function () {
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
    onShow:function (){
        app.buttomCopyrightSetData(this, 'fixed', 'close');
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    }
})