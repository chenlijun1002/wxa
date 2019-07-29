// pages/servicedetail/servicedetail.js
//售后详情
var app = getApp();
var filter = app;
var util = require('../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        interfaceOkCount: 0,
        isShowToast: false,
        loadComplete: true,
        toastText: {},
        copyright: {}
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let orderId = options.orderId;
        let orderItemId = options.orderItemId;
        this.setData({
            orderId: orderId,
            orderItemId: orderItemId
        });

    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    getRefundStatusName(refundPayType, sendResult) {
        let statusName = '处理中';
        if (refundPayType == 1) {//退货退款的
            switch (sendResult) {
                case 0:
                    statusName = '等待商家处理';
                    break;
                case 1:
                    statusName = '商家已同意';
                    break;
                case 5:
                    statusName = '待商家收货';
                    break;
                case 3:
                case 4:
                    statusName = '确认收货';
                    break;
                case -1:
                    statusName = '商家拒绝';
                    break;
                case 2:
                    statusName = '退款已经完成';
                    break;
            }
        } else if (refundPayType == 0) {//仅退款的
            switch (sendResult) {
                case 0:
                    statusName = '等待商家处理';
                    break;
                case 1:
                case 3:
                    statusName = '商家已同意';
                    break;
                case -1:
                    statusName = '商家拒绝';
                    break;
                case 2:
                    statusName = '已发放';
                    break;
            }
        }
        return statusName;
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.buttomCopyrightSetData(this, false, 'close');
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
        const that=this;
        let orderId = that.data.orderId;
        let orderItemId = that.data.orderItemId;
        wx.showLoading({
            title: '请稍后'
        });
        filter.request({
            url: '/Refund/GetRefundDetail',
            data: {
                orderId: orderId,
                orderItemId: orderItemId
            },
            success: (res) => {
                if (res.Code == 0) {
                    var interfaceCount = that.data.interfaceOkCount;
                    var refundStatus = res.Data.OrderStatus;
                    //var refundType = res.Data.RefundType == 0 ? '退货退款' : '仅退款';
                    var refundType = res.Data.RefundPayType == 0 ? '仅退款' : '退货退款';
                    var productName = res.Data.OrderItem.ItemDescription;
                    var refundMoney = res.Data.RefundMoney.toFixed(2);
                    var refundReason = res.Data.RefundRemark;
                    var requestTime = res.Data.ApplyForTime;
                    var refundId = res.Data.Id;
                    var refundTime = res.Data.RefundTime;
                    var adminRemark = res.Data.AdminRemark;
                    var refundPayType = res.Data.RefundPayType;
                    var sendResult = res.Data.SendResult;
                    var rExpressTel = res.Data.RExpressTel;
                    var certPicListStr = res.Data.CertPicList;
                    var certPicList = [];
                    if (certPicListStr != null && certPicListStr != '') {
                        var certPicListArr = certPicListStr.split(',');
                        certPicListArr.forEach(function (item, index) {
                            certPicList.push(item);
                        });
                    }
                    var refundStatusName = that.getRefundStatusName(refundPayType, sendResult);
                    var applyForTime = res.Data.ApplyForTime;//提交申请时间
                    var autitDate = res.Data.AutitDate;//审核时间
                    var sendDate = res.Data.SendDate;//发放时间

                    var shippingTime = res.Data.ShippingTime;//寄回时间
                    var takeDeliveryTime = res.Data.TakeDeliveryTime;//商家收到货时间
                    that.setData({
                        interfaceOkCount: interfaceCount + 1,
                        refundInfo: {
                            refundStatus: refundStatus,
                            refundStatusName: refundStatusName,
                            refundType: refundType,
                            productName: productName,
                            refundMoney: refundMoney,
                            refundReason: refundReason,
                            requestTime: requestTime,
                            refundId: refundId,
                            refundTime: refundTime,
                            adminRemark: adminRemark,
                            refundPayType: refundPayType,
                            applyForTime: applyForTime,
                            autitDate: autitDate,
                            sendDate: sendDate,
                            shippingTime: shippingTime,
                            takeDeliveryTime: takeDeliveryTime,
                            sendResult: sendResult,
                            rExpressTel: rExpressTel,
                            certPicList: certPicList
                        }
                    });
                    // util.contentShow(this, this.data.interfaceOkCount, 1);
                } else {
                    util.showToast(that, {
                        text: '接口返回异常，' + res.Msg,
                        duration: 2000
                    });
                }
            },
            complete: (res) => {
                wx.hideLoading();
                that.setData({ loadComplete: true });
            }
        });
    },
    goBack: function () {
        wx.navigateBack({
            delta: 1
        });
    },
    goReturnExpress() {
        // wx.redirectTo({
        //     url: `/pages/refundexpress/refundexpress?orderId=${this.data.orderId}&orderItemId=${this.data.orderItemId}`
        // })
        app.navigateTo(`/pages/refundexpress/refundexpress?orderId=${this.data.orderId}&orderItemId=${this.data.orderItemId}`, 'redirectTo');
    },
    makeCall(e) {
        let phoneNum = e.currentTarget.dataset.number;
        wx.makePhoneCall({
            phoneNumber: phoneNum
        });
    }
})