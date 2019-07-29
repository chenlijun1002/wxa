//余额管理
var app = getApp();
var util = require("../../utils/util");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        balance: 0,
        isEnableApplyAmount: false,
        isEnableRechargeState: false,
        count: 0,
        loadComplete: true, //页面功能完成后去掉
        copyright: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        const that = this;
        app.buttomCopyrightSetData(this, 'fixed');
        if (wx.getStorageSync('isLogin')) {
            this.setData({
                showAuthorization: false
            })
            this.initData(this);
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
    getuserinfo: function() {
        this.initData(this);
        this.setData({
            showAuthorization: false
        })
    },
    initData() {
        var that = this;
        app.request({
            url: '/Member/GetMemberBalance',
            data: {},
            success(res) {
                if (res.Code == 0) {
                    var Count = that.data.count;
                    that.setData({
                        balance: res.Data.Balance.toFixed(2),
                        isEnableApplyAmount: res.Data.IsEnableApplyAmount,
                        isEnableRechargeState: res.Data.IsEnableRechargeState,
                        count: Count++
                    });
                }
            },
            complete() {
                that.setData({
                    loadComplete: true
                });
            }
        });
    },
    goDeposit() {
        if (!this.data.isEnableApplyAmount) return false;
        app.navigateTo('../depositrequest/depositrequest', 'navigateTo');
    },
    sendFormId: function(e) {
        app.sendFormId(e.detail.formId, 0);
    },
    goRecharge() {
        if (!this.data.isEnableRechargeState) return false;
        app.navigateTo('../balancerecharge/balancerecharge', 'navigateTo');
    },
    navigateTo(e) {
        app.navigateTo(e.currentTarget.dataset.url, 'navigateTo');
    }
})