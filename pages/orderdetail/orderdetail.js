// pages/orderdetail/orderdetail.js
//订单详情
var app = getApp();
var filter = app;
var util = require('../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isLogo: wx.getStorageSync("IsOpenCopyRight"),
        logoSrc: wx.getStorageSync("copyRightLogo"),
        interfaceOkCount: 0,
        orderInfo: {//订单实体

        },
        isShowToast: false,
        toastText: {},
        point: 0,
        copyright:{},
        isIPhone:false
    },
    orderId:'',
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      var that=this;
      wx.getSystemInfo({
        success: function (res) {
          if (res.system.indexOf("iOS") >-1) {
            that.setData({
              isIPhone: true
            })
          }
        }
      })
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
        var orderId = this.orderId;
        var that = this;
        // 请求积分
        filter.request({
            url: '/OrderSubmit/GetOrderSetPoint',
            data: {
                orderId: orderId
            },
            success: function (res) {
                if (res.Code == 0) {
                    that.setData({
                        point: res.Data
                    });
                }
            }
        })
        /*请求订单数据*/
        filter.request({
            //url: '/OrderSubmit/MemberOrderDetails',
            url: '/OrderSubmit/MemberOrderDetailsV2',
            data: {
                orderId: orderId
            },
            success: function (res) {
                if (res.Code == 0) {
                    var interfaceCount = that.data.interfaceOkCount;
                    var items = [];
                    var itemSumPrice = 0;
                    var priceT = 0;
                    var priceY = 0;
                    var priceTag = true;
                    var priceYag = true;
                    res.Data.Order.OrderItems.forEach(function (item) {
                        items.push({
                            ThumbnailsUrl: item.ThumbnailsUrl,
                            ItemDescription: item.ItemDescription,
                            SKUContent: item.SKUContent,
                            ItemAdjustedPrice: item.ItemAdjustedPrice.toFixed(2),
                            OrderItemsStatus: item.OrderItemsStatus,
                            Id: item.Id,
                            ProductId: item.ProductId,
                            Quantity: item.Quantity,
                            DiscountAverage: item.DiscountAverage,
                            ItemAdjustedCommssion: item.ItemAdjustedCommssion,
                            HasProtectionApplying: item.HasProtectionApplying
                        });
                        priceT += item.ItemAdjustedCommssion;//价格调整
                        priceY += item.DiscountAverage;//优惠金额
                        itemSumPrice += item.ItemAdjustedPrice * item.Quantity;
                    });
                    if (priceT < 0) {
                        priceTag = false;
                    }
                    if (priceY < 0) {
                        priceYag = false;
                    }
                    var length = res.Data.Order.ShippingDate.length - 8;
                    var date = new Date(Number(res.Data.Order.ShippingDate.substr(6, length)));
                    var year = date.getFullYear();
                    var month = date.getMonth() + 1;
                    var day = date.getDate();
                    var hour = date.getHours();
                    var minutes = date.getMinutes()
                    var second = date.getSeconds()
                    var time = year + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + second;
                    var orderInfo = {
                      OrderId: res.Data.Order.OrderId,
                        PaymentTypeId: res.Data.Order.PaymentTypeId,
                        PaymentStr: that.getPaymentStr(res.Data.Order.PaymentTypeId),
                        OrderStatusName: res.Data.Order.OrderStatusName,
                        ShipTo: res.Data.Order.ShipTo,
                        CellPhone: res.Data.Order.CellPhone,
                        Address: res.Data.Order.Address ? res.Data.Order.Address : '',
                        priceT: Math.abs(priceT).toFixed(2),
                        priceTag: priceTag,
                        priceY: Math.abs(priceY).toFixed(2),
                        priceYag: priceYag,
                        SkuId: res.Data.Order.SkuId,
                        ExpressCompanyName: res.Data.Order.ExpressCompanyName,
                        ProductSumPrice: (itemSumPrice).toFixed(2),
                        AdjustedFreight: (res.Data.Order.AdjustedFreight).toFixed(2),
                        TotalPrice: (res.Data.Order.TotalPrice).toFixed(2),
                        OrderStatus: res.Data.Order.OrderStatus,
                        OrderItems: items,
                        ShipOrderNumber: res.Data.Order.ShipOrderNumber,
                        ExpressCompanyAbb: res.Data.Order.ExpressCompanyAbb,
                        FinishDate: res.Data.Order.FinishDate,
                        ShippingDate: time,
                        Remark: res.Data.Order.Remark,
                        PickupOrder: res.Data.Order.PickupOrder,
                        SelfLiftingName: res.Data.PickUpName||'',
                        SelfPromotionMan: res.Data.Order.PickupOrder?res.Data.Order.PickupOrder.ShipTo:'',
                        SelfPromotionPhone: res.Data.Order.PickupOrder ? res.Data.Order.PickupOrder.TelPhone:'',
                        SelfPromotionAddress: res.Data.Order.PickupOrder ? res.Data.Order.PickupOrder.Address:'',
                        ServeiceTime: res.Data.Order.PickupOrder ? res.Data.Order.PickupOrder.ServeiceTime:'',
                        shippingModeText: that.getShippingModeText(res.Data.Order.ShippingModeId)
                    };
                    that.setData({
                        interfaceOkCount: interfaceCount + 1,
                        orderInfo: orderInfo
                    });
                    // util.contentShow(that, that.data.interfaceOkCount, 1);
                }
            },
            fail: function (res) {
            },
            complete: function () {
                that.setData({ loadComplete: true });
            }
        });
            /*请求订单数据结束*/
    },
    getShippingModeText(id){
        switch (id){
            case -2:
                return '上门自提';
                break;
            case -8:
                return '同城配送';
                break;
            case 0:
                return '包邮';
                break;
            default:
                return '物流配送';
                break;
        }
    },
    onShow:function (){
        app.buttomCopyrightSetData(this);
    },
    getPaymentStr(paymentTypeId) {
        let str = '';
        if (paymentTypeId) {
            switch (paymentTypeId) {
                case 'hishop.plugins.payment.offlinerequest':
                    str = '线下支付';
                    break;
                case 'hishop.plugins.payment.balancepayrequest':
                    str = '余额支付';
                    break;
                case 'Hishop.PluginImpl.Payment.WeiXinPay':
                    str = '微信支付';
                    break;
                case 'Hishop.PluginImpl.Payment.AlipayWap':
                    str = '支付宝手机端支付';
                    break;
                case 'Hishop.PluginImpl.Payment.WxMiniAppPay':
                    str = '微信支付';
                    break;
                default:
                    str = '余额支付';
                    break;
            }
        } else {
            str = '';
        }
        return str;
    },
    cancelOrder: function () {//取消订单
        var orderId = this.data.orderInfo.OrderId;//订单号
        filter.request({
            url: '/OrderDetail/UserCancelOrder',
            data: {
                orderId: orderId
            },
            success: function (res) {
                if (res.Code == 0 && res.Data) {
                    wx.showToast({
                        title: '取消订单成功！',
                        icon: 'success',
                        duration: 2000,
                        success: function () {
                            // wx.redirectTo({
                            //     url: '../orderdetail/orderdetail?orderId=' + orderId
                            // })
                            app.navigateTo('../orderdetail/orderdetail?orderId=' + orderId, 'redirectTo');
                        }
                    })
                }
            }
        });
    },
    payOrder: function () {//立即支付
        var orderId = this.data.orderInfo.OrderId;//订单号
        var that = this;
        wx.showLoading({
            title: '发起支付中，请稍后！'
        });
        filter.request({//获取支付参数接口
            url: '/OrderSubmit/GetPayRequest',
            data: {
                orderIds: orderId
            },
            success: function (res) {
                var payArgs = res.Data;
                if (payArgs.Success) {
                    wx.requestPayment({
                        timeStamp: payArgs.TimeStamp,
                        nonceStr: payArgs.NonceStr,
                        package: payArgs.Package,
                        signType: payArgs.SignType,
                        paySign: payArgs.PaySign,
                        success: function (payRes) {
                            // wx.redirectTo({
                            //     url: '../order/orderlist',
                            // })
                            app.navigateTo('../order/orderlist', 'redirectTo');
                        },
                        fail: function (failRes) {
                            util.showToast(that, {
                                text: '支付失败，请重新支付',
                                duration: 2000
                            });
                        }
                    });
                } else {
                    util.showToast(that, {
                        text: '无法获取支付配置',
                        duration: 2000
                    });
                }
            },
            fail: function () {
                util.showToast(that, {
                    text: '获取支付配置失败',
                    duration: 2000
                });
            },
            complete: function () {
                wx.hideLoading();
            }
        });
    },
    confirmReceipt: function () {//确认收货
        var that = this;
        var orderId = this.data.orderInfo.OrderId;//订单号
        wx.showModal({
            title: '确认收货',
            content: '您确认已收到货物？',
            confirmText: '是',
            cancelText: '否',
            success: function (res) {
                if (res.confirm) {
                    wx.showLoading({
                        title: '请稍后！'
                    });
                    filter.request({
                        url: '/OrderList/ConfirmReceipt',
                        data: {
                            orderId: orderId
                        },
                        success: function (res) {
                            if (res.Code == 0) {
                                wx.showToast({
                                    title: '确认收货成功！',
                                    icon: 'success',
                                    duration: 2000,
                                    success: function () {
                                        // wx.redirectTo({
                                        //     url: '../orderdetail/orderdetail?orderId=' + orderId
                                        // })
                                        app.navigateTo('../orderdetail/orderdetail?orderId=' + orderId, 'redirectTo');
                                    }
                                })
                            } else {
                                util.showToast(that, {
                                    text: res.Msg,
                                    duration: 2000
                                });
                            }
                        },
                        complete: function () {
                            wx.hideLoading();
                        }
                    });
                } else if (res.cancel) {

                }
            }
        });
    },
    // 确认提货
    confirmPickup: function () {
      var that = this;
      var orderId = this.data.orderInfo.OrderId;//订单号
      wx.showModal({
        title: '确认提货',
        content: '您确认已提到货物？',
        confirmText: '是',
        cancelText: '否',
        success: function (res) {
          if (res.confirm) {
            wx.showLoading({
              title: '请稍后！'
            });
            filter.request({
              url: '/OrderList/ConfirmPickup',
              data: {
                orderId: orderId
              },
              success: function (res) {
                if (res.Code == 0) {
                  wx.showToast({
                    title: '确认提货成功！',
                    icon: 'success',
                    duration: 2000,
                    success: function () {
                      app.navigateTo('../orderdetail/orderdetail?orderId=' + orderId, 'redirectTo');
                    }
                  })
                } else {
                  util.showToast(that, {
                    text: res.Msg,
                    duration: 2000
                  });
                }
              },
              complete: function () {
                wx.hideLoading();
              }
            });
          } else if (res.cancel) {

          }
        }
      });
    },
    /*查看售后单状态*/
    showRefundDetail: function (e) {
        var orderId = e.currentTarget.dataset.orderid;
        var orderItemId = e.currentTarget.dataset.orderitemid;
        // wx.redirectTo({
        //     url: '/pages/servicedetail/servicedetail?orderId=' + orderId + '&orderItemId=' + orderItemId,
        // })
        app.navigateTo('/pages/servicedetail/servicedetail?orderId=' + orderId + '&orderItemId=' + orderItemId, 'redirectTo');
    },
    /*申请售后*/
    requestRefund: function (e) {
        var hasProtectionApplying = e.currentTarget.dataset.hasprotectionapplying;
        if (hasProtectionApplying){
            util.showToast(this, {
                text: '该商品正在申请保价服务，不可同时申请售后服务。',
                duration: 2000
            });
            return false;
        }
        var orderId = e.currentTarget.dataset.orderid;
        var orderItemId = e.currentTarget.dataset.orderitemid;
        var orderStatus = e.currentTarget.dataset.orderstatus;
        var refundMoney = e.currentTarget.dataset.refundmoney;
        var refundNum = e.currentTarget.dataset.refundnum;
        var discountAverage = e.currentTarget.dataset.discountavg;
        var adjCommission = e.currentTarget.dataset.adj;
        var refundType = 0;
        var refundMax = 0;
        if (orderStatus == '2') {
            refundType = 0;
            refundMax = parseFloat(this.data.orderInfo.AdjustedFreight) + parseFloat(refundMoney) * parseInt(refundNum) - parseFloat(discountAverage) - parseFloat(adjCommission);
        } else if (orderStatus == '3') {
            refundType = 1;
            refundMax = parseFloat(refundMoney) * parseInt(refundNum) - parseFloat(discountAverage) - parseFloat(adjCommission);
        }
        //根据不同状态传不同的type仅退款的传0，退货退款传1,最高可退金额TotalPrice
        // wx.redirectTo({
        //     url: '../applyservice/applyservice?orderId=' + orderId + '&orderItemId=' + orderItemId + '&refundType=' + refundType + '&refundMax=' + refundMax.toFixed(2) + '&paymentTypeId=' + this.data.orderInfo.PaymentTypeId,
        // })
        app.navigateTo('../applyservice/applyservice?orderId=' + orderId + '&orderItemId=' + orderItemId + '&refundType=' + refundType + '&refundMax=' + refundMax.toFixed(2) + '&paymentTypeId=' + this.data.orderInfo.PaymentTypeId, 'redirectTo');
    },
    lookLogistics: function (e) {
        var orderId = e.target.dataset.orderid;
        // wx.redirectTo({
        //     url: '../logisticsdetail/logisticsdetail?orderId=' + orderId,
        // })
        app.navigateTo('../logisticsdetail/logisticsdetail?orderId=' + orderId, 'redirectTo');
    },
    callPhone: function () {
        var phoneNum = this.data.orderInfo.ExpressCompanyAbb;
        wx.makePhoneCall({
            phoneNumber: '' + phoneNum,
        })
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    }
})