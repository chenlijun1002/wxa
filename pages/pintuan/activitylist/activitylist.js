// pages/pintuan/activitylist/activitylist.js
var app = getApp();
var util = require('../../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        activityStatus: 1,
        activityType: 0,
        copyright:{}
    },
    requestData: {
        activityStatus: 1,
        activityType: 0,
        activityName: ''
    },
    groupBack: 0,
    KilledOrderNum: 0,
    timer:null,
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
        var activityType = options.activityType;
        var that = this;
        that.groupBack = options.groupBack;
        that.requestData.activityType = activityType ? activityType : 0;
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
                        item.activityStatus = Number(that.requestData.activityStatus);
                    })
                    that.data.copyright.position = data.ActivityList.length > 2 ? '' : 'copyright-fixed';
                    that.setData({
                        activityList: data.ActivityList,
                        copyright: that.data.copyright,
                        loadComplete: true
                    })
                    that.timer=setInterval(function () {
                        that.data.activityList.forEach(function (item) {
                            item.endDate = util.timeDifference(item.ActivityEnd);
                        })
                        that.setData({
                            activityList: that.data.activityList
                        })
                    }, 1000)
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
        app.buttomCopyrightSetData(this, false, 'close');
        if (!wx.getStorageSync('isLogin')) {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                this.initData(this.requestData);
            })
        } else {
            if (this.data.showAuthorization) {
                this.setData({
                    showAuthorization: false
                })
            }
          this.initData(this.requestData);
        }
        this.setData({
            activityType: this.requestData.activityType
        })
        this.changeNavigationBar(Number(this.requestData.activityType))
    },
    onHide() {
        clearInterval(this.timer);
    },
    onUnload() {
        clearInterval(this.timer);
    },
    getuserinfo: function () {
      this.initData(this.requestData);
      this.setData({
        showAuthorization: false
      })
    },
    changeActivityStatus: function (e) {
        var that = this;
        var status = e.target.dataset.status;
        that.requestData.activityStatus = status;
        console.log(status)
        that.setData({
            activityStatus: status,
            loadComplete: false
        })
        that.initData(that.requestData);
        that.changeNavigationBar(Number(that.requestData.activityType))
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
        that.changeNavigationBar(Number(that.requestData.activityType))
    },
    // deleteSearchValue:function (e){
    //     var that=this;
    //     that.requestData.activityName = e.detail.value;
    //     var pos = e.detail.cursor;
    //     that.initData(that.requestData);
    //     that.changeNavigationBar(Number(that.requestData.activityType))
    // },
    searchBtnShow: function () {
        this.setData({
            isResearch: true,
            focus: true
        })
    },
    searchBtnHide: function () {
        // if (this.searchValue){
        this.setData({
            isResearch: false
        })
        // }     
    },
    doSearch: function () {
        var that = this;
        that.requestData.activityName = that.data.searchValue;
        if (that.requestData.activityName != "" && that.requestData.activityName) {
            that.initData(that.requestData);
            that.changeNavigationBar(Number(that.requestData.activityType))
        } else {
            that.requestData.activityName = ""
            that.initData(that.requestData);
            that.changeNavigationBar(Number(that.requestData.activityType))
        }
    },

    changeSearchValue: function (e) {
        var inputValue = e.detail.value;
        this.appointId = '';
        this.setData({
            searchValue: inputValue
        });
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
    },
    changeNavigationBar: function (activityType) {
        var NavigationBarTitle = '';
        switch (activityType) {
            case 0:
                NavigationBarTitle = '活动精选';
                break;
            case 1:
                NavigationBarTitle = '爱拼团';
                break;
            case 2:
                NavigationBarTitle = '限时秒杀';
                break;
            case 2:
                NavigationBarTitle = '降价拍';
                break;
            default:
                break;
        }
        wx.setNavigationBarTitle({
            title: NavigationBarTitle
        })
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    }
})