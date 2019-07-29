// pages/seckilling/confirmorder/confirmorder.js
const app = getApp();
const util = require('../../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        loadComplete: false,
        showPayPopup: '',
        isBalance: false,
        payType: '-1',
        Balance: 0,
        copyright: {},
      CanUseBalance:false
    },
    timer: 0,
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const that = this,
            orderId = options.orderId;
        app.request({
            url: '/Order/GetOrderById',
            requestDomain: 'seckilling_domain',
            data: {
                orderId
            },
            success(res) {
                if (res.Code == 0) {
                    let PayTime = res.Data.ProductList.PayTime,
                        ProductSkuName = res.Data.ProductSkuName ? res.Data.ProductSkuName.replace(/\;$/g, '') : '';
                    that.setData({
                        orderId,
                        RegionMemberName: res.Data.RegionMemberName,
                        CellPhone: res.Data.CellPhone,
                        Address: res.Data.Address,
                        ProductList: {
                            ProductId: res.Data.ProductList.ProductId,
                            ProductImg: res.Data.ProductList.ProductImgUrl,
                            ProductKillPrice: res.Data.ProductList.Price.toFixed(2),
                            ProductName: res.Data.ProductList.ProductName,
                            ProductNum: res.Data.ProductList.ProductNum
                        },
                        PayTime: util.timeDifference(PayTime),
                        ProductSkuName,
                        ActivityTag: res.Data.ActivityTag,
                        ShipMode: res.Data.ShipMode,
                        Remark: res.Data.Remark || '',
                        Freight: res.Data.Freight.toFixed(2),
                        AmountPayable: res.Data.AmountPayable.toFixed(2)
                    })
                    that.timer = setInterval(() => {
                        let payTime = that.data.PayTime;
                        if (payTime == '00:00:00') {
                            clearInterval(that.timer);
                            util.showToast(that, {
                                text: '支付超时',
                                duration: 1000,
                                callBack() {
                                    // wx.redirectTo({
                                    //   url: `../paystatus/paystatus?status=3&orderId=${orderId}`
                                    // })
                                    app.navigateTo(`../paystatus/paystatus?status=3&orderId=${orderId}`, 'redirectTo');
                                }
                            });
                        }
                        that.setData({
                            PayTime: util.timeDifference(PayTime)
                        })
                    }, 1000)
                } else {
                    util.showToast(that, {
                        text: '接口错误',
                        duration: 2000
                    });
                }
            },
            complete: function () {
                that.setData({
                    loadComplete: true
                })
            }
        })
        app.request({
          url: '/Member/CanUseBalance',
          requestDomain: 'ymf_domain',
          success: function (data) {
            if (data.Code == 0) {
              //data = JSON.parse(data.Data);
              if (data.Data) {
                that.setData({
                  CanUseBalance: true
                })
              }
            } else {
              util.showToast(that, {
                text: data.Msg,
                duration: 2000
              });
            }
          },
          fail: function () {
            util.showToast(that, {
              text: '请求数据失败',
              duration: 2000
            });
          }
        })
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    pullPayPopup() {
        const that = this;
        wx.showLoading({
            title: '请稍后...'
        })
        //获取账户余额
        app.request({
            url: '/Member/GetMemberInfo',
            requestDomain: 'ymf_domain',
            data: {},
            success: function (data) {
                if (data.Code == 0) {
                    // 检查是否可以余额支付
                    let balance = Number(data.Data.AvailableAmount);
                    let amountPayable = Number(that.data.AmountPayable);
                    let isBalance = balance >= amountPayable;
                    that.setData({
                        isBalance: isBalance,
                        Balance: balance.toFixed(2),
                        showPayPopup: 'show'
                    })
                } else {
                    util.showToast(this, {
                        text: '接口错误' + data.Msg,
                        duration: 2000
                    });
                }
            },
            complete() {
                wx.hideLoading();
            }
        })
    },
    selectPayType(e) {
        const payType = e.currentTarget.dataset.paytype;
        if (!this.data.isBalance && payType == 0) {
            util.showToast(this, {
                text: '余额不足',
                duration: 2000
            });
            return;
        }
        this.setData({
            payType
        })
    },
 sendFormId: function (e) {
      app.sendFormId(e.detail.formId, 0);
  },
    closePayPopup() {
        this.setData({
            showPayPopup: ''
        })
    },
    //zhifu
    requestPay: function () {
        const that = this,
            orderId = this.data.orderId,
            payType = this.data.payType;
        if (payType == -1) {
            util.showToast(that, {
                text: '请选择支付方式',
                duration: 2000
            });
            return;
        }
        that.closePayPopup();
        wx.showLoading({
            title: '发起支付中..',
        })
        if (payType == 0) {
            app.request({
                url: '/Order/BalancePayOrderPay',
                requestDomain: 'seckilling_domain',
                data: {
                    orderId
                },
                success: function (res) {
                    if (res.Code == 0) {
                        util.showToast(that, {
                            text: '支付成功',
                            successIcon: true,
                            duration: 1000,
                            callBack() {
                                // wx.redirectTo({
                                //   url: `../paystatus/paystatus?status=1&orderId=${orderId}`
                                // })
                                app.navigateTo(`../paystatus/paystatus?status=1&orderId=${orderId}`, 'redirectTo');
                            }
                        });
                    } else {
                        util.showToast(that, {
                            text: res.Msg,
                            duration: 2000
                        });
                    }
                },
                complete: function () {
                    wx.hideLoading();
                    that.setData({
                        showPayPopup: ''
                    })
                }
            })
        } else if (payType == 1) {
            app.request({
                url: '/Order/Pay',
                requestDomain: 'seckilling_domain',
                data: {
                    orderId
                },
                success: function (res) {
                    if (res.Code == 0) {
                        wx.requestPayment({
                            timeStamp: res.Data.TimeStamp,
                            nonceStr: res.Data.NonceStr,
                            package: res.Data.Package,
                            signType: res.Data.SignType,
                            paySign: res.Data.PaySign,
                            success: function (payRes) {
                                util.showToast(that, {
                                    text: '支付成功',
                                    successIcon: true,
                                    duration: 1000,
                                    callBack() {
                                        // wx.redirectTo({
                                        //   url: `../paystatus/paystatus?status=1&orderId=${orderId}`
                                        // })
                                        app.navigateTo(`../paystatus/paystatus?status=1&orderId=${orderId}`, 'redirectTo');
                                    }
                                });
                            },
                            fail: function (failRes) {
                                util.showToast(that, {
                                    text: '支付失败',
                                    duration: 2000
                                });
                            },
                            complete: function () {
                                wx.hideLoading();
                                that.setData({
                                    showPayPopup: ''
                                })
                            }
                        });

                    } else {
                        util.showToast(that, {
                            text: res.Msg,
                            duration: 2000
                        });
                    }
                },
                fail: function () {
                    util.showToast(that, {
                        text: '支付失败！',
                        duration: 2000
                    });
                },
                complete: function () {
                    wx.hideLoading();
                    that.setData({
                        showPayPopup: ''
                    })
                }
            })
        }




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
        this.setData({
            isProbationShop: wx.getStorageSync("storeType")
        })
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
        clearInterval(this.timer);
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    }
})