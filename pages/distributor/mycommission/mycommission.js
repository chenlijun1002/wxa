// pages/mycommission/mycommission.js
//我的佣金
var app = getApp();
var util = require('../../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        loadComplete: false,
        ReferralBlance: '0.00',
        RequestBlance: '0,00',
        HistoryBlance: '0.00',
        isDrawAvalible: false,
        isShowToast: false,
        toastText: {},
        copyright: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 跳转通用方法
     */
    navigateUrl(e) {
        let url = e.currentTarget.dataset.url;
        if (url == '/pages/distributor/commissionwithdraw/commissionwithdraw') {
            if (!this.data.isDrawAvalible) {
                util.showToast(this, {
                    text: '商家未开启佣金提现或有未完成的提现申请正在处理！',
                    duration: 2000
                });
                return;
            }
            app.navigateTo(url, 'redirectTo');
        } else {
            app.navigateTo(url, 'navigateTo');
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        const that=this;
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
        app.buttomCopyrightSetData(this, 'fixed', 'close');
        var that = this;
        app.request({
            url: '/Distributor/GetCommissionInfo',
            data: {
                requestDomain: 'fxs_domain'
            },
            success: (res) => {
                if (res.Code == 0) {
                    that.setData({
                        ReferralBlance: res.Data.ReferralBlance.toFixed(2),
                        RequestBlance: res.Data.RequestBlance.toFixed(2),
                        HistoryBlance: (res.Data.ReferralBlance + res.Data.RequestBlance).toFixed(2)
                    });
                    app.request({
                        url: '/Distributor/IsExistDrawRequest',
                        data: {},
                        success: (tRes) => {
                            if (tRes.Code == 0) {
                                that.setData({
                                    isDrawAvalible: tRes.Data.IsExist
                                });
                            } else {
                                util.showToast(that, {
                                    text: '接口异常' + tRes.Msg,
                                    duration: 2000
                                });
                            }
                        }
                    });
                } else {
                    util.showToast(that, {
                        text: '接口异常' + res.Msg,
                        duration: 2000
                    });
                }
            },
            complete: (res) => {
                that.setData({ loadComplete: true })
            }
        });
    },
  sendFormId: function (e) {
      app.sendFormId(e.detail.formId, 0);
  }
})