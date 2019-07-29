// pages/stairgroup/mygroupdetail/mygroupdetail.js
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

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const that = this;
        const {
      orderId
    } = options;
        app.request({
            url: '/StairGroup/OrderInfo',
            requestDomain: 'ymf_domain',
            data: {
                orderId
            },
            success(res) {
                if (res.Code == 0) {
                    let data = JSON.parse(res.Data);
                    console.log(data)
                    let AmountPayable = (data.OrderData.SalePrice * data.OrderData.Quantity + data.OrderData.Freight).toFixed(2);
                    that.setData({
                        stairGroupInfo: {
                            CloseMark: data.OrderData.CloseMark,
                            SalePrice: Number(data.OrderData.SalePrice).toFixed(2),
                            SkuName: data.SkuName,
                            SkuId: data.OrderData.SkuId,
                            ActivityId: data.OrderData.ActivityId,
                            ProductName: data.OrderData.StairGroup.ProductName,
                            ProductId: data.OrderData.StairGroup.ProductId,
                            ProductImg: data.OrderData.StairGroup.ProductImg,
                            CreateDateTime: data.OrderData.CreateDateTime.replace('T', ' '),
                            ActivityTag: data.OrderData.StairGroup.ActivityTag,
                            Quantity: data.OrderData.Quantity,
                            total: (data.OrderData.SalePrice * data.OrderData.Quantity).toFixed(2),
                            Remark: data.OrderData.ReMark,
                            PayMoney: data.OrderData.PayMoney.toFixed(2),
                            PaymentType: data.OrderData.PaymentType ? data.OrderData.PaymentType : '',
                            shipModelId: data.OrderData.ShippingModeId,
                            ShippingMode: data.ShippingMode,
                            RegionId: data.OrderData.ShippingRegion
                        },
                        OrderStatus: data.OrderData.OrderStatus,
                        IsJobOverduePayment: data.OrderData.IsJobOverduePayment,
                        orderId,
                        AmountPayable,
                        templateId: data.OrderData.StairGroup.FreightTemplateId,
                        freight: Number(data.OrderData.Freight).toFixed(2)
                    })
                    if (that.data.OrderStatus == 1) {
                        let time = new Date(that.data.stairGroupInfo.CreateDateTime.replace(/\-/g, '/')).getTime();
                        let payTime = new Date(time + 30 * 60 * 1000).toLocaleString('chinese', {
                            hour12: false
                        });
                        let timer = setInterval(() => {
                            let payEndTime = util.timeDifference(payTime);
                            if (payEndTime.toString() == '00:00:00') {
                                clearInterval(timer);
                            }
                            that.setData({
                                payEndTime
                            });
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
                that.setData({
                    loadComplete: true
                })
            }
        })

    },
    onShow: function () {
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
        this.setData({
            payType
        })
    },
    closePayPopup() {
        this.setData({
            showPayPopup: ''
        })
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
                        Balance: balance.toFixed(2),
                        payType: isBalance ? 0 : 1
                    })
                } else {
                    util.showToast(that, {
                        text: '余额接口访问失败',
                        duration: 1000
                    });
                    that.setData({
                        isBalance: false,
                        Balance: '0.00'
                    })
                }
            },
            complete() {
                that.setData({
                    showPayPopup: 'show'
                });
            }
        })
    },
    requestPay() {
        const that = this;
        const payType = that.data.payType,
            mark = that.data.stairGroupInfo.Remark,
            orderId = that.data.orderId,
            shipModelId = that.data.stairGroupInfo.shipModelId,
            shippingRegion = that.data.stairGroupInfo.RegionId;
        wx.showLoading({
            title: '正在支付'
        })
        if (payType == 0) {
            app.request({
                url: '/StairGroup/GetBalancePayArgs',
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
                                app.navigateTo(`/pages/stairgroup/groupsuccess/groupsuccess?orderId=${orderId}`, 'redirectTo');
                            }
                        });
                    } else if (res.Msg == 101) { //库存不足
                        app.navigateTo('/pages/stairgroup/groupfail/groupfail?pageStatus=1', 'redirectTo');
                    } else if (res.Msg == 102) { //订单过期
                        app.navigateTo('/pages/stairgroup/groupfail/groupfail?pageStatus=2', 'redirectTo');
                    } else if (res.Msg == 103) { //活动结束
                        app.navigateTo('/pages/stairgroup/groupfail/groupfail?pageStatus=4', 'redirectTo');
                    } else {
                        util.showToast(that, {
                            text: res.Msg,
                            duration: 2000
                        });
                    }
                },
                complete() {
                    that.setData({
                        showPayPopup: ''
                    })
                }
            })
        } else if (payType == 1) {
            app.request({
                url: '/StairGroup/GetWxPayArgs',
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
                                    url: '/StairGroup/OrderPayResult',
                                    requestDomain: 'ymf_domain',
                                    data: {
                                        orderId
                                    },
                                    success(res) {
                                        wx.hideLoading();
                                        res.Data = JSON.parse(res.Data)
                                        console.log(res.Data)
                                        if (res.Data.OrderStatus == 2) {
                                            app.navigateTo(`/pages/stairgroup/groupsuccess/groupsuccess?orderId=${orderId}`, 'redirectTo');
                                        } else if (res.Data.OrderStatus == 4) {
                                            if (res.Data.CloseMark == 101) { //库存不足
                                                app.navigateTo('/pages/stairgroup/groupfail/groupfail?pageStatus=1', 'redirectTo');
                                            } else if (res.Data.CloseMark == 102) { //订单过期
                                                app.navigateTo('/pages/stairgroup/groupfail/groupfail?pageStatus=2', 'redirectTo');
                                            } else if (res.Data.CloseMark == 103) { //货款原路返回
                                                app.navigateTo('/pages/stairgroup/groupfail/groupfail?pageStatus=3', 'redirectTo');
                                            }
                                        }
                                    }
                                })
                            },
                            fail: function (failRes) {
                                wx.hideLoading();
                                util.showToast(that, {
                                    text: '取消支付',
                                    duration: 2000
                                });
                            }
                        });
                    } else if (res.Msg == 101) { //库存不足
                        app.navigateTo('/pages/stairgroup/groupfail/groupfail?pageStatus=1', 'redirectTo');
                    } else if (res.Msg == 102) { //订单过期
                        app.navigateTo('/pages/stairgroup/groupfail/groupfail?pageStatus=2', 'redirectTo');
                    } else if (res.Msg == 103) { //活动结束
                        app.navigateTo('/pages/stairgroup/groupfail/groupfail?pageStatus=4', 'redirectTo');
                    } else {
                        util.showToast(that, {
                            text: res.Msg,
                            duration: 2000
                        });
                    }
                },
                complete() {
                    that.setData({
                        showPayPopup: ''
                    })
                }
            })
        }
    },
    goDetail() {
        const orderId = this.data.orderId;
        app.navigateTo(`/pages/orderdetail/orderdetail?orderId=${orderId}`, 'redirectTo');
    }
})