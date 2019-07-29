// pages/reduceauction/myauctiondetail/myauctiondetail.js
const app = getApp();
const util = require('../../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        loadComplete: false,
        showPayPopup: '',
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
        const that = this;
        const orderId = that.orderId;
        app.request({
            url: '/ReduceAuction/GetOrderAndAuctionInfo',
            requestDomain: 'ymf_domain',
            data: { orderId },
            success(res) {
                if (res.Code == 0) {
                    let data = JSON.parse(res.Data);
                    let AmountPayable = (data.OrderData.SalePrice + data.OrderData.Freight).toFixed(2);
                    that.setData({
                        reduceauctionInfo: {
                            SalePrice: Number(data.OrderData.SalePrice).toFixed(2),
                            SkuName: data.SkuName,
                            SkuId: data.OrderData.SkuId,
                            ActivityId: data.OrderData.ActivityId,
                            ProductName: data.AuctionData.ProductName,
                            ProductId: data.AuctionData.ProductId,
                            ProductImg: data.AuctionData.ProductImg,
                            CreateDateTime: data.OrderData.CreateDateTime.replace('T', ' '),
                            OrderPayExpireMinute: data.AuctionData.OrderPayExpireMinute,
                            ActivityTag: data.AuctionData.ActivityTag,
                            Remark: data.OrderData.ReMark,
                            failStatus: data.OrderData.CloseMark,
                            PayMoney: data.OrderData.PayMoney.toFixed(2),
                            shipModelId: data.OrderData.ShippingModeId,
                            ShippingMode: data.ShippingMode,
                            RegionId: data.OrderData.ShippingRegion
                        },
                        OrderStatus: data.OrderData.OrderStatus,
                        orderId,
                        AmountPayable,
                        templateId: data.AuctionData.FreightTemplateId,
                        freight: Number(data.OrderData.Freight).toFixed(2)
                    })
                    if (that.data.OrderStatus == 1) {
                        let time = new Date(that.data.reduceauctionInfo.CreateDateTime.replace(/\-/g, '/')).getTime();
                        let payTime = new Date(time + that.data.reduceauctionInfo.OrderPayExpireMinute * 60 * 1000);

                      console.log("payTime6",payTime);
                      let timer = setInterval(() => {
                        var tTime = payTime.getFullYear() + '/' + (payTime.getMonth() + 1) + '/' + payTime.getDate() + ' ' + payTime.getHours() + ':' + payTime.getMinutes() + ':' + payTime.getSeconds();

                        let payEndTime = util.timeDifference(tTime);
                            if (payEndTime.toString() == '00:00:00') {
                                clearInterval(timer);
                                util.showToast(that, {
                                    text: '支付超时',
                                    duration: 1000,
                                    callBack() {
                                        // wx.redirectTo({
                                        //     url: '../auctionfail/auctionfail?pageStatus=2'
                                        // })
                                        app.navigateTo('../auctionfail/auctionfail?pageStatus=2', 'redirectTo');
                                    }
                                });
                                return;
                            }
                            that.setData({ payEndTime });
                        }, 1000);
                    }
                } else {
                    util.showToast(that, {
                        text: res.Msg,
                        duration: 2000
                    });
                }
            },
            complete() {
                that.setData({ loadComplete: true })
            }
        })
    },
    onShow:function (){
        app.buttomCopyrightSetData(this);
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    selectPayType(e) {
        const payType = e.currentTarget.dataset.paytype;
        if (payType == this.data.payType) return;
        if (!this.data.isBalance && payType == 0) {
            util.showToast(this, {
                text: '余额不足',
                duration: 2000
            });
            return;
        }
        this.setData({ payType })
    },
    closePayPopup() {
        this.setData({ showPayPopup: '' })
    },
    buyNow() {
        const that = this;
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
                    let isBalance = (balance >= amountPayable);
                    that.setData({
                        isBalance: isBalance,
                        Balance: balance.toFixed(2)
                    })
                }
            },
            complete() {
                that.setData({ showPayPopup: 'show' });
            }
        })
    },
    requestPay() {
        const that = this;
        const payType = that.data.payType,
            mark = that.data.reduceauctionInfo.Remark,
            orderId = that.data.orderId,
            shipModelId = that.data.reduceauctionInfo.shipModelId,
            shippingRegion = that.data.reduceauctionInfo.RegionId;
        wx.showLoading({
            title: '正在支付'
        })
        if (payType == 0) {
            app.request({
                url: '/ReduceAuction/GetBalancePayArgs',
                requestDomain: 'ymf_domain',
                data: {
                    mark,
                    orderId,
                    shipModelId,
                    shippingRegion
                },
                success(res) {
                    wx.hideLoading();
                    if (res.Code == 0) {
                        util.showToast(that, {
                            text: '支付成功',
                            successIcon: true,
                            duration: 1000,
                            callBack() {
                                // wx.redirectTo({
                                //     url: `/pages/reduceauction/auctionsuccess/auctionsuccess?orderId=${orderId}`
                                // })
                                app.navigateTo(`/pages/reduceauction/auctionsuccess/auctionsuccess?orderId=${orderId}`, 'redirectTo');
                            }
                        });
                    } else if (res.Msg == 101) { //库存不足
                        // wx.redirectTo({
                        //     url: '/pages/reduceauction/auctionfail/auctionfail?pageStatus=1&state=1',
                        // })
                        app.navigateTo('/pages/reduceauction/auctionfail/auctionfail?pageStatus=1&state=1', 'redirectTo');
                    } else if (res.Msg == 102) { //订单过期
                        // wx.redirectTo({
                        //     url: '/pages/reduceauction/auctionfail/auctionfail?pageStatus=2',
                        // })
                        app.navigateTo('/pages/reduceauction/auctionfail/auctionfail?pageStatus=2', 'redirectTo');
                    } else if (res.Msg == 103) {//活动结束
                        // wx.redirectTo({
                        //     url: '/pages/reduceauction/auctionfail/auctionfail?pageStatus=1&state=0',
                        // })
                        app.navigateTo('/pages/reduceauction/auctionfail/auctionfail?pageStatus=1&state=0', 'redirectTo');
                    } else {
                        util.showToast(that, {
                            text: res.Msg,
                            duration: 2000
                        });
                    }
                },
                complete() {
                    that.setData({ showPayPopup: '' })
                }
            })
        } else if (payType == 1) {
            app.request({
                url: '/ReduceAuction/GetWxPayArgs',
                requestDomain: 'ymf_domain',
                data: {
                    mark,
                    orderId,
                    shipModelId,
                    shippingRegion
                },
                success(res) {
                    wx.hideLoading();
                    if (res.Success) {
                        wx.requestPayment({
                            timeStamp: res.TimeStamp,
                            nonceStr: res.NonceStr,
                            package: res.Package,
                            signType: res.SignType,
                            paySign: res.PaySign,
                            success: function (payRes) {
                                app.request({
                                    url: '/ReduceAuction/GetOrderInfo',
                                    requestDomain: 'ymf_domain',
                                    data: { orderId },
                                    success(res) {
                                        wx.hideLoading();
                                        if (res.Data.OrderStatus == 2) {
                                            // wx.redirectTo({
                                            //     url: `/pages/reduceauction/auctionsuccess/auctionsuccess?orderId=${orderId}`
                                            // })
                                            app.navigateTo(`/pages/reduceauction/auctionsuccess/auctionsuccess?orderId=${orderId}`, 'redirectTo');
                                        } else if (res.Data.OrderStatus == 4) {
                                            if (res.Data.ReMark == 101) { //库存不足
                                                // wx.redirectTo({
                                                //     url: '/pages/reduceauction/auctionfail/auctionfail?pageStatus=1&state=2',
                                                // })
                                                app.navigateTo('/pages/reduceauction/auctionfail/auctionfail?pageStatus=1&state=2', 'redirectTo');
                                            } else if (res.Data.ReMark == 102) { //订单过期
                                                // wx.redirectTo({
                                                //     url: '/pages/reduceauction/auctionfail/auctionfail?pageStatus=2',
                                                // })
                                                app.navigateTo('/pages/reduceauction/auctionfail/auctionfail?pageStatus=2', 'redirectTo');
                                            } else if (res.Data.ReMark == 103) {//活动结束
                                                // wx.redirectTo({
                                                //     url: '/pages/reduceauction/auctionfail/auctionfail?pageStatus=1&state=0',
                                                // })
                                              app.navigateTo('/pages/reduceauction/auctionfail/auctionfail?pageStatus=1&state=0', 'redirectTo');
                                            }
                                        }
                                    }
                                })
                            },
                            fail: function (failRes) {
                                wx.hideLoading();
                                util.showToast(that, {
                                    text: '支付失败',
                                    duration: 2000
                                });
                            }
                        });
                    } else if (res.Msg == 101) { //库存不足
                        // wx.redirectTo({
                        //     url: '/pages/reduceauction/auctionfail/auctionfail?pageStatus=1&state=1',
                        // })
                        app.navigateTo('/pages/reduceauction/auctionfail/auctionfail?pageStatus=1&state=1', 'redirectTo');
                    } else if (res.Msg == 102) { //订单过期
                        // wx.redirectTo({
                        //     url: '/pages/reduceauction/auctionfail/auctionfail?pageStatus=2',
                        // })
                        app.navigateTo('/pages/reduceauction/auctionfail/auctionfail?pageStatus=2', 'redirectTo');
                    } else if (res.Msg == 103) {//活动结束
                        // wx.redirectTo({
                        //     url: '/pages/reduceauction/auctionfail/auctionfail?pageStatus=1&state=0',
                        // })
                        app.navigateTo('/pages/reduceauction/auctionfail/auctionfail?pageStatus=1&state=0', 'redirectTo');
                    }
                },
                complete() {
                    that.setData({ showPayPopup: '' })
                }
            })
        }
    },
    goDetail() {
        const orderId = this.data.orderId;
        // wx.redirectTo({
        //     url: `/pages/orderdetail/orderdetail?orderId=${orderId}`
        // })
        app.navigateTo(`/pages/orderdetail/orderdetail?orderId=${orderId}`, 'redirectTo');
    }
})