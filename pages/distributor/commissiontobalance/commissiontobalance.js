// pages/commissiontobalance/commissiontobalance.js
//佣金转余额
var util = require('../../../utils/util.js');
const app = getApp()
Page({
    /**
     * 页面的初始数据
     */
    data: {
        isHidden: true,
        isBlur: '',
        toBlanceMoney: 0,
        balance: 0,
        isShowToast: false,
        loadComplete: false,
        toastText: {},
        copyright: {}
    },
    iptFocus() {
        this.setData({
            isHidden: false
        })
    },
    bindKeyInput(e) {
        const toBlanceMoney = parseFloat(e.detail.value);
        this.setData({
            isBlur: 'blur',
            toBlanceMoney
        })
    },
    closeTips(e) {
        this.setData({
            isHidden: true
        })
    },
    toBalance() {
        const amount = this.data.toBlanceMoney;
        if (amount > this.data.balance) {
            util.showToast(this, {
                text: '转出金额不能大于可转佣金',
                duration: 2000
            });
            return;
        }
        wx.showLoading({
            title: '请稍后',
        });
        const that = this;
        app.request({
            url: '/Distributor/TransAmount',
            data: {
                amount,
                requestDomain: 'fxs_domain',
            },
            success(res) {
                if (res.Code === 0) {
                    util.showToast(that, {
                        successIcon: true,
                        text: '转出' + (res.Data ? '成功' : '失败'),
                        duration: 2000,
                        callBack() {
                            wx.navigateBack({
                                delta: 1
                            });
                        }
                    });
                } else {
                    util.showToast(that, {
                        text: res.Msg,
                        duration: 2000
                    });
                }
            },
            complete() {
                wx.hideLoading();
            }
        })
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
        const that = this;
        app.request({
            url: '/Distributor/GetCommissionInfo',
            data: {
                requestDomain: 'fxs_domain'
            },
            success(res) {
                if (res.Code === 0) {
                    that.setData({
                        balance: res.Data.ReferralBlance.toFixed(2),
                        RequestMaxBlance: res.Data.RequestMaxBlance.toFixed(2)
                    })
                } else {
                    util.showToast(that, {
                        text: '接口错误' + res.Msg,
                        duration: 2000
                    });
                }
            },
            complete() {
                that.setData({ loadComplete: true })
            }
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.buttomCopyrightSetData(this, false, 'close');
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

  },
  sendFormId: function (e) {
      app.sendFormId(e.detail.formId, 0);
  }
})