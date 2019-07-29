// activitylist.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        activityStatus: 1,
        activityType: 0,
        copyright: {}
    },
    requestData: {
        activityStatus: 1,
        activityType: 0,
        activityName: ''
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var activityType = options.activityType;
        var that = this;
        that.requestData.activityType = activityType ? activityType : 0;
        //that.initData(that.requestData);
        
    },
    getuserinfo: function () {
        this.initData(this.requestData);
        this.setData({
            showAuthorization: false
        })
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    initData: function (requestData) {
        var that = this;
        app.request({
            url: '/ActivityIndex/ActivityList',
            requestDomain: 'ymf_domain',
            data: requestData,
            success: function (res) {
                if (res.Code == 0) {
                    var data = JSON.parse(res.Data);
                    data.ActivityList.forEach(function (item) {
                        item.ProductOldPrice = item.ProductOldPrice.toFixed(2);
                        item.SalePrice = item.SalePrice.toFixed(2);
                        switch (item.ActivityType) {
                            case 1:
                                item.labelName = '拼团大甩卖';
                                break;
                            case 2:
                                item.labelName = '限时秒杀';
                                break;
                            default:
                                break;
                        }
                    })
                    that.data.copyright.position = data.ActivityList.length > 1 ? '' : 'copyright-fixed';
                    that.setData({
                        activityList: data.ActivityList,
                        loadComplete: true,
                        copyright: that.data.copyright
                    })
                }
            },
            fail: function () {

            }
        })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        if (wx.getStorageSync('isLogin')) {
            if (this.data.showAuthorization) {
                this.setData({
                    showAuthorization: false
                })
            }
            this.initData(this.requestData);
        } else {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                this.initData(this.requestData);
            })
        }
        app.buttomCopyrightSetData(this, false, 'close');
    },
    openGroup: function (e) {
        var activityId = e.target.dataset.activityid;
        // wx.navigateTo({
        //     url: '/pages/pintuan/detail/detail?activityId=' + activityId,
        // })
        app.navigateTo('/pages/pintuan/detail/detail?activityId=' + activityId, 'navigateTo');
    },
    changeActivityStatus: function (e) {
        var that = this;
        var status = e.target.dataset.status;
        that.requestData.activityStatus = status;
        that.setData({
            activityStatus: status,
            loadComplete: false
        })
        that.initData(that.requestData);
    },
    changeActivityType: function (e) {
        var that = this;
        var activityType = e.target.dataset.type;
        that.requestData.activityType = activityType;
        that.setData({
            activityType: activityType,
            showScreen: '',
            loadComplete: false
        })
        that.initData(that.requestData);
    },
    changeSearchValue: function () {
        var that = this;
        that.requestData.activityName = e.detail.value;
        that.initData(that.requestData);
    },
    screen: function () {
        this.setData({
            showScreen: 'show'
        })
    },
    closePopup: function () {
        this.setData({
            showScreen: ''
        })
    }
})