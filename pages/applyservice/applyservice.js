//申请售后
var app = getApp();
var filter = app;
var util = require('../../utils/util.js');
const Event = util.Event;
const renderPicList = new Event;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestMoney: 0,
        requestRemark: '',
        isShowToast: false,
        refundPopup: '',
        toastText: {},
        servicetypeText: '',
        refundtypeText: '',
        picList: [],
        bankCard: '',
        copyright: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.servicetype = options.refundType || '0';
        this.refundtype = '0';
        this.orderId = options.orderId;
        this.orderItemId = options.orderItemId;
        this.paymentTypeId = options.paymentTypeId;
        let refundMax = options.refundMax;
        let isShowBank = (this.paymentTypeId != "Hishop.PluginImpl.Payment.WeiXinPay" && this.paymentTypeId != "Hishop.PluginImpl.Payment.AlipayWap" && this.paymentTypeId != "hishop.plugins.payment.balancepayrequest" && this.paymentTypeId != "Hishop.PluginImpl.Payment.WxMiniAppPay");
        this.setData({
            isShowBank: isShowBank,
            refundMax: refundMax,
            serviceType: this.servicetype,
            refundType: this.refundtype,
            pageType: this.servicetype,
            servicetypeText: this.servicetype == '0' ? '仅退款' : '退货退款',
            refundtypeText: this.refundtype == '0' ? '指定银行卡' : '退回账户余额'
        });

        //新流程，进入申请页后调接口获取最大可退金额
        if (wx.getStorageSync('isLogin')) {
            if (this.data.showAuthorization) {
                this.setData({
                    showAuthorization: false
                })
            }
            this.getMaxRefund();
        } else {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                this.getMaxRefund();
            })
        }
    },
    getuserinfo: function () {
        this.getMaxRefund();
        this.setData({
            showAuthorization: false
        })
    },
    onShow:function (){
        app.buttomCopyrightSetData(this, 'fixed', 'close');
    },
    /**
     * 获取最大可退金额
     */
    sendFormId:function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    getMaxRefund() {
        let that = this;
        app.request({
            url: '/Refund/GetMaxRefundMoney',
            data: {
                orderId: this.orderId,
                orderItemId: this.orderItemId
            },
            success(res) {
                if (res.Code == 0) {
                    let refundMax = res.Data.toFixed(2);
                    that.setData({
                        refundMax: refundMax
                    });
                } else {
                    util.showToast(that, {
                        text: '获取最大可退金额接口异常' + res.Msg,
                        duration: 2000
                    });
                }
            }
        });
    },
    changeRefundMoney: function (e) {
        let refundMoney = e.detail.value;
        this.setData({
            requestMoney: refundMoney
        });
    },
    changeBankCard(e) {
        this.setData({
            bankCard: e.detail.value
        });
    },
    changeRemark: function (e) {
        let remark = e.detail.value;
        this.setData({
            requestRemark: remark
        });
    },
    serviceType: function (e) {
        if (this.servicetype == '0') return false;
        this.setData({
            popupIsShow: 'show'
        })
    },
    closePopup: function () {
        this.setData({
            popupIsShow: ''
        })
    },
    refundType: function (e) {
        if (this.refundType == '0') return false;
        this.setData({
            refundPopup: 'show'
        })
    },
    closeRefundPopup: function () {
        this.setData({
            refundPopup: ''
        })
    },
    selectService: function (e) {
        var serviceType = e.target.dataset.servicetype;
        var typeText = '';
        if (serviceType == '0') {
            typeText = '仅退款';
        } else if (serviceType == '1') {
            typeText = '退货退款';
        }
        this.setData({
            serviceType: serviceType,
            servicetypeText: typeText,
            popupIsShow: ''
        })
    },
    selectRefundType: function (e) {
        var refundType = e.target.dataset.refundtype;
        var refundText = '';
        if (refundType == '0') {
            refundText = '指定银行卡';
        } else if (refundType == '1') {
            refundText = '退回账户余额';
        }
        this.setData({
            refundType: refundType,
            refundtypeText: refundText,
            refundPopup: ''
        })
    },
    uploadRefundPic() {
        const that = this;
        let count = 8 - that.data.picList.length;
        wx.chooseImage({
            count: count,
            success: function (res) {
                const tempFilePaths = res.tempFilePaths;
                let i = 0,
                    length = tempFilePaths.length;
                wx.showLoading({
                    title: '正在上传中...'
                })
                that.uploadPic(tempFilePaths, i, length)
            }
        })
    },
    uploadPic(filePaths, i, length) {
        const that = this;
        let picList = that.data.picList;
        if (i >= length) {
            wx.hideLoading();
            return;
        }
        app.request({
            url: '/Refund/UploadRefundPic',
            contentType: 'multipart/form-data',
            requestType: 'upload',
            filePath: filePaths[i],
            fileName: 'refund_pic',
            success(res) {
                let resObj = JSON.parse(res);
                if (resObj.Code == 0) {
                    picList.push(resObj.Data);
                    that.setData({
                        picList: picList
                    });
                    //全部请求完成再渲染列表
                    if (i == length - 1) {
                        util.showToast(that, {
                            text: '上传成功',
                            successIcon: true,
                            duration: 2000
                        });
                    }

                } else {
                    util.showToast(that, {
                        text: '上传失败' + resObj.Msg,
                        duration: 2000
                    })
                }
            },
            fail(res) {
                util.showToast(that, {
                    text: '上传失败！',
                    duration: 2000
                })
            },
            complete() {
                //wx.hideLoading();
                i++;
                that.uploadPic(filePaths, i, length); //递归上传图片
            }
        })
    },
    deletePic(e) {
        let index = parseInt(e.currentTarget.dataset.id);
        let picList = this.data.picList;
        picList.splice(index, 1);
        this.setData({ picList });
    },
    requestSubmit: function () {
        let refundMax = parseFloat(this.data.refundMax);
        let requestMoney = parseFloat(this.data.requestMoney);
        let refundType = this.data.refundType;
        let bankCard = this.data.bankCard;
        if (!this.data.isShowBank) {//线上支付的给成-1以便后台处理
            refundType = -1;
        }
        if (requestMoney <= 0) {
            util.showToast(this, {
                text: '请输入退款金额！',
                duration: 2000
            });
            return;
        }
        if (requestMoney > refundMax) {
            util.showToast(this, {
                text: '退款金额超过最大可退金额！',
                duration: 2000
            });
            return;
        }
        if (refundType == 0 && !bankCard) {
            util.showToast(this, {
                text: '请输入指定银行卡账号',
                duration: 2000
            });
            return;
        }
        let requestType = this.data.serviceType;

        let requestRemark = this.data.requestRemark;
        let orderId = this.orderId;
        let orderItemId = this.orderItemId;
        let returnPicUrls = this.data.picList.join(',');
        let paymentTypeId = this.paymentTypeId;
        wx.showLoading({
            title: '请稍后',
        })
        filter.request({
            url: '/Refund/RefundRequest',
            data: {
                orderId: orderId,
                orderItemId: orderItemId,
                requestMoney: requestMoney,
                requestRemark: requestRemark,
                choiceBank: refundType,
                refundType: requestType,
                Account: bankCard,
                returnPicUrls: returnPicUrls,
                paymentTypeId: paymentTypeId
            },
            success: (res) => {
                if (res.Code == 0) {
                    if (res.Data) {
                        util.showToast(this, {
                            text: '申请成功！',
                            successIcon: true,
                            duration: 2000,
                            callBack() {
                                wx.navigateBack({
                                    delta: 1
                                });
                            }
                        });
                    } else {
                        util.showToast(this, {
                            text: '提交申请失败' + res.Msg,
                            duration: 2000
                        });
                    }
                } else {
                    util.showToast(this, {
                        text: '接口返回异常，' + res.Msg,
                        duration: 2000
                    });
                }
            },
            complete: (res) => {
                wx.hideLoading();
            }
        });
    },
    servicetype: '',
    refundtype: '0',
    orderId: '',
    orderItemId: '',
    paymentTypeId: ''
})