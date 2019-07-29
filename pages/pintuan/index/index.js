// pages/pintuan/index/index.js
var app = getApp();
var util = require('../../../utils/util.js');
Page({
    /**
     * 页面的初始数据
     */
    data: {
        imgInfo: [],
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        activityStatus: 1,
        copyright: {}
    },
    requestData: {
        activityStatus: 1,
        activityType: 0,
        activityName: ''
    },
    timer:null,
    isloadingData: false,
    interfaceOkCount: 0,
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
    },
    onHide() {
        clearInterval(this.timer);
    },
    onUnload() {
        clearInterval(this.timer);
    },
    changeActivityStatus: function (e) {
        var that = this;
        var status = e.target.dataset.status;
        that.requestData.activityStatus = status;
        that.setData({
            activityStatus: status
        })
        that.initData(that.requestData);
    },
    initData: function (requestData) {
        var that = this;
        var shopInfo = wx.getStorageSync('shopInfo');
        if (shopInfo && shopInfo.SiteName) {
            wx.setNavigationBarTitle({
                title: shopInfo.SiteName,
            });
        }
        app.request({
            url: '/ActivityIndex/YmfGetApplet',
            requestDomain: 'ymf_domain',
            data: {},
            success: function (data) {
                if (data.Code == 0) {
                    data = JSON.parse(data.Data);
                    that.interfaceOkCount += 1;
                    that.setData({
                        imgInfo: data
                    })
                    that.contentShow(that, that.interfaceOkCount, 2);
                } else {
                    wx.showToast({
                        title: data.Msg,
                        image: '../../images/prompt-icon.png',
                        duration: 2000
                    });
                }
            },
            fail: function () {
                wx.showToast({
                    title: '获取数据失败',
                    image: '../../images/prompt-icon.png',
                    duration: 2000
                });
            }
        })
        app.request({
            url: '/ActivityIndex/ActivityList',
            requestDomain: 'ymf_domain',
            data: requestData,
            success: function (res) {
              that.autoUpdatetimer && clearInterval(that.autoUpdatetimer)
                if (res.Code == 0) {
                    var data = JSON.parse(res.Data);
                    that.interfaceOkCount += 1;
                    data.ActivityList.forEach(function (item) {
                        item.ProductOldPrice = item.ProductOldPrice.toFixed(2);
                        item.SalePrice = item.SalePrice.toFixed(2);
                        item.activityStatus = Number(that.requestData.activityStatus);
                    })
                    that.data.copyright.position = data.ActivityList.length > 1 ? '' : 'copyright-fixed';
                    that.setData({
                        activityList: data.ActivityList,
                        list: {
                            types: 'order',
                            length: data.ActivityList.length
                        },
                        copyright: that.data.copyright
                    });
                    that.contentShow(that, that.interfaceOkCount, 2);
                    that.timer=setInterval(function () {
                        that.data.activityList.forEach(function (item) {
                            //item.endDate = util.timeDifference(item.ActivityEnd);
                            if (that.data.activityStatus == 1) {
                              item.endDate = util.timeDifference(item.ActivityEnd);
                            } else {
                              item.endDate = util.timeDifference(item.ActivityStar);
                            }
                        })
                        that.setData({
                            activityList: that.data.activityList
                        })
                    }, 1000)
                    that.autoUpdatetimer = setInterval(function () {
                      var now = new Date().getTime();
                      that.data.activityList.forEach(function (item, index) {
                        if (that.data.activityStatus == 1) {
                          if (now > new Date(item.ActivityEnd.replace(/T/g, ' ')).getTime()) {
                            data.ActivityList.splice(index, 1);
                          }
                        } else {
                          if (now > new Date(item.ActivityStar.replace(/T/g, ' ')).getTime()) {
                            data.ActivityList.splice(index, 1);
                          }
                        }
                      })
                      that.setData({
                        activityList: that.data.activityList
                      })
                    }, 1000)
                } else {
                    wx.showToast({
                        title: res.Msg,
                        image: '../../images/prompt-icon.png',
                        duration: 2000
                    });
                }
            },
            fail: function () {
                wx.showToast({
                    title: '获取数据失败',
                    image: '../../images/prompt-icon.png',
                    duration: 2000
                });
            }
        })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.buttomCopyrightSetData(this,false,'close');
        var that = this;
        if (!wx.getStorageSync('isLogin')){
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                this.initData(this.requestData);
            })
        }else {
            if (this.data.showAuthorization) {
                this.setData({
                    showAuthorization: false
                })
            }
          this.initData(this.requestData);
        }
    },
    getuserinfo: function () {
      this.initData(this.requestData);
      this.setData({
        showAuthorization: false
      })
    },
    contentShow: function (currentPage, interfaceCount, totalInterfaceCount) {
        if (interfaceCount >= totalInterfaceCount) {
            currentPage.setData({
                loadComplete: true
            });
            currentPage.isloadingData = false;
        }
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    onShareAppMessage: function () {
        var that = this;
        var shopInfo = wx.getStorageSync('shopInfo');
        var siteName = shopInfo ? shopInfo.SiteName : '';
        var shopId = wx.getStorageSync('shopId');
        return {
            title: siteName,
            path: '/pages/pintuan/index/index?shopId=' + shopId,
            success: function (res) {
                console.log('转发成功，shopId:' + shopId);
                // 转发成功
            },
            fail: function (res) {
                console.log('转发失败，shopId:' + shopId)
                // 转发失败
            }
        }
    }
})