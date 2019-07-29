// pages/refundexpress/refundexpress.js
//填写物流信息

var app = getApp();
var util = require('../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        expressPopup: '',
        expressId: '',
        expressNum: '',
        cellPhone: '',
        refundReason: '',
        selectedExpressName: '请选择',
        loadComplete: false,
        refundInfo: {},
        merchantAddressInfo: {
            ProvinceName: '湖南省',
            CityName: '长沙市',
            CountyName: '芙蓉区',
            StreetName: '文艺路街道',
            Address: '湖南文化大厦19楼',
            Id: 0
        },
        merchantExpressList: [{
            Id: 1,
            Name: '顺丰'
        }, {
            Id: 2,
            Name: '申通'
        }, {
            Id: 3,
            Name: '圆通'
        }],
        copyright: {}
    },
    showExpressPopup() {
        this.setData({ expressPopup: 'show' })
    },
    closeExpressPopup() {
        this.setData({ expressPopup: '' })
    },
    selectExpress(e) {
        const expressId = e.currentTarget.dataset.id;
        const selectedExpressName = e.currentTarget.dataset.name;
        const index = parseInt(e.currentTarget.dataset.index);
        let selectedExpressInfo = this.data.merchantExpressList[index];
        this.setData({ expressId, selectedExpressName, selectedExpressInfo })
        this.closeExpressPopup()
    },
    changeExpressNum(e) {
        this.setData({
            expressNum: e.detail.value
        });
    },
    changeCellPhone(e) {
        this.setData({
            cellPhone: e.detail.value
        });
    },
    changeRefundReason(e) {
        this.setData({
            refundReason: e.detail.value
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let orderId = options.orderId;
        let orderItemId = options.orderItemId;
        let that = this;
        that.setData({
            orderId: orderId,
            orderItemId: orderItemId
        });
        if (wx.getStorageSync('isLogin')) {
            //1,请求退货退款单信息
            //2,请求商家收货地址
            //3,请求可选物流公司
            that.requestRefundInfo(function () {
                that.requestMerchantAddress(function () {
                    that.requestMerchantExpress(function () {
                        that.setData({
                            loadComplete: true
                        });
                    });
                });
            });
        } else {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                that.requestRefundInfo(function () {
                    that.requestMerchantAddress(function () {
                        that.requestMerchantExpress(function () {
                            that.setData({
                                loadComplete: true
                            });
                        });
                    });
                });
            })
        }
    },
    getuserinfo: function () {
        let that = this;
        //1,请求退货退款单信息
        //2,请求商家收货地址
        //3,请求可选物流公司
        that.requestRefundInfo(function () {
            that.requestMerchantAddress(function () {
                that.requestMerchantExpress(function () {
                    that.setData({
                        loadComplete: true
                    });
                });
            });
        });
        that.setData({
            showAuthorization: false
        })
    },
    /**
     * 请求退货退款单信息
     */
    requestRefundInfo(cb) {
        let that = this;
        app.request({
            url: '/Refund/GetRefundDetail',
            data: {
                orderId: that.data.orderId,
                orderItemId: that.data.orderItemId
            },
            success(res) {
                if (res.Code == 0) {
                    that.setData({
                        refundInfo: res.Data
                    });
                } else {
                    util.showToast(that, {
                        text: '获取售后详情接口异常，' + res.Msg,
                        duration: 2000
                    });
                }
            },
            complete(res) {
                if (cb && typeof cb == 'function') cb();
            }
        });
    },
    /**
     * 请求商家收货地址
     */
    requestMerchantAddress(cb) {
        let that = this;
        app.request({
            url: '/Refund/GetMerchantAddress',
            data: {
                orderId: that.data.orderId,
                orderItemId: that.data.orderItemId
            },
            success(res) {
                if (res.Code == 0) {
                    that.setData({
                        merchantAddressInfo: res.Data.RExpressAddress
                    });
                } else {
                    util.showToast(that, {
                        text: '获取商家收货地址接口异常，' + res.Msg,
                        duration: 2000
                    });
                }
            },
            complete(res) {
                if (cb && typeof cb == 'function') cb();
            }
        });
    },
    /**
     * 请求可选物流公司
     */
    requestMerchantExpress(cb) {
        let that = this;
        app.request({
            url: '/Refund/GetMerchantExpress',
            data: {},
            success(res) {
                if (res.Code == 0) {
                    that.setData({
                        merchantExpressList: res.Data
                    });
                } else {
                    util.showToast(that, {
                        text: '获取商家物流公司接口异常，' + res.Msg,
                        duration: 2000
                    });
                }
            },
            complete(res) {
                if (cb && typeof cb == 'function') cb();
            }
        });
    },
    /**
     * 取消
     */
    goBack(e) {
        wx.navigateBack({
            delta: 1
        });
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    /**
     * 提交物流信息
     */
    submitExpress(e) {
        let expressId = this.data.expressId;
        let selectedExpressName = this.data.selectedExpressName;
        let expressNum = this.data.expressNum;
        let cellPhone = this.data.cellPhone;
        let refundReason = this.data.refundReason;
        let that = this;
        if (expressId == '') {
            util.showToast(that, {
                text: '请选择物流公司！',
                duration: 2000
            })
            return;
        }
        if (expressNum.trim() == '') {
            util.showToast(that, {
                text: '请填写物流单号！',
                duration: 2000
            })
            return;
        }
      if (expressNum.replace(/\s/ig, '').length >= 20) {        
          util.showToast(that, {
            text: '物流单号最长为20位！',
            duration: 2000
          })
          return;
        }
      if (!/^1[2-9][0-9]{9}$/.test(cellPhone)) {
            util.showToast(that, {
                text: '请输入正确的手机号！',
                duration: 2000
            })
            return;
        }
        wx.showLoading({
            title: '请稍后'
        })
        app.request({
            url: '/Refund/SubmitRefundExpress',
            data: {
                orderId: that.data.orderId,
                orderItemId: that.data.orderItemId,
                expressNum: expressNum,
                cellPhone: cellPhone,
                expressCompanyAbb: expressId,
                expressCompanyName: selectedExpressName,
                refundReason: refundReason
            },
            success(res) {
                if (res.Code == 0 && res.Data) {
                    util.showToast(that, {
                        text: '提交成功！',
                        successIcon: true,
                        duration: 2000,
                        callBack: function () {
                            that.goBack();
                        }
                    })
                } else {
                    util.showToast(that, {
                        text: '提交失败！' + res.Msg,
                        duration: 2000
                    })
                }
            },
            complete(res) {
                wx.hideLoading();
            }
        });
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.buttomCopyrightSetData(this, false, 'close');
    }
})