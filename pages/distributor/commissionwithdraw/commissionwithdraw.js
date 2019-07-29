// pages/depositrequest/depositrequest.js
//佣金提现
var app = getApp();
var util = require('../../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        popupStatus: '',
        requestType: -1,//0,1,2分别对应微信支付，微信红包，线下
        interfaceOkCount: 0,
        maxCash: '0.00',
        minCash: 0,
        merchantCode: '',
        bank: '',
        amount: '0',
        accountName: '',
        remark: '',
        config: {
            EnableOtherDraw: false,
            EnableRedpaperDraw: false,
            EnableWeixinDraw: false
        },
        isShowToast: false,
        toastText: {},
        loadComplete: false,//页面功能完成后去掉
        copyright: {}
    },
    showPopup() {
        this.setData({
            popupStatus: 'show'
        })
    },
    closePopup() {
        this.setData({
            popupStatus: ''
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
    initData(){
        var that = this;
        app.request({
            url: '/Distributor/IsExistDrawRequest',
            data: {
                requestDomain: 'fxs_domain'
            },
            success: (res) => {
                if (res.Code == 0) {
                    let interfaceCount = that.data.interfaceOkCount;
                    if (!res.Data.IsExist) {
                        util.showToast(that, {
                            text: '商家未开启佣金提现！',
                            duration: 2000
                        });
                        return;
                    }
                    that.setData({
                        interfaceOkCount: interfaceCount + 1,
                        maxCash: res.Data.MaxAmount.toFixed(2),
                        minCash: res.Data.MinAmount,
                        config: res.Data.Config
                    });
                    // util.contentShow(that, that.data.interfaceOkCount, 1);
                } else {
                    util.showToast(that, {
                        text: '接口服务异常！' + res.Msg,
                        duration: 2000
                    });
                }
            },
            complete() {
                that.setData({ loadComplete: true });
            }
        });
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.buttomCopyrightSetData(this, 'fixed', 'close');
    },
    changeBank(e) {
        let bank = e.detail.value;
        this.setData({
            bank: bank
        });
    },
    /**
     * 更换提现方式
     */
    changeRequestType(e) {
        let requestType = e.currentTarget.dataset.requesttype;
        this.setData({
            requestType: requestType
        });
        this.closePopup();
    },
    /**
     * 输入收款人
     */
    changeaccountName(e) {
        let accountName = e.detail.value;
        this.setData({
            accountName: accountName
        });
    },
    /**
     * 输入提现账号
     */
    changeAccount(e) {
        let merchantCode = e.detail.value;
        this.setData({
            merchantCode: merchantCode
        });
    },
    /**
     * 输入提现金额
     */
    changeCash(e) {
        let amount = e.detail.value;
        this.setData({
            amount: amount
        });
    },
    /**
     * 输入备注
     */
    changeRemark(e) {
        let remark = e.detail.value;
        this.setData({
            remark: remark
        });
    },
    /**
     * 确认提现
     */
    doRequest() {
        var that = this;
        let requestType = this.data.requestType;
        let accountName = this.data.accountName;
        let bank = this.data.bank;
        let merchantCode = this.data.merchantCode;
        let amount = this.data.amount;
        let remark = this.data.remark;
        let minCash = this.data.minCash;
        let maxCash = this.data.maxCash;
        if (requestType == -1) {
            util.showToast(this, {
                text: '请选择提现方式',
                duration: 2000
            });
            return;
        }
        if (accountName == '') {
            util.showToast(this, {
                text: '请填写收款人真实姓名',
                duration: 2000
            });
            return;
        }
        if (Number(amount) < Number(minCash)) {
            util.showToast(this, {
                text: '提现金额不能小于商家设定的最低提现金额' + minCash,
                duration: 2000
            });
            return;
        }
        if (Number(amount) > Number(maxCash)) {
            util.showToast(this, {
                text: '提现金额不能大于可提现余额',
                duration: 2000
            });
            return;
        }
        if (requestType == 3 && merchantCode.length < 6) {
            util.showToast(this, {
                text: '请输入正确的收款帐号，否则无法正常发放！',
                duration: 2000
            });
            return;
        }
        if (requestType == 3 && bank.length < 3) {
            util.showToast(this, {
                text: '帐号说明请填写详细！',
                duration: 2000
            });
            return;
        }
        if (requestType == 1 && Number(amount) > 200) {
            util.showToast(this, {
                text: '微信红包提现金额不能大于200元',
                duration: 2000
            });
            return;
        }
        if (requestType == 0 && Number(amount) < 1) {
            util.showToast(this, {
                text: '通过微信提现,金额不能小于1元',
                duration: 2000
            });
            return;
        }
        wx.showLoading({
            title: '请稍后',
        });
        app.request({
            url: '/Distributor/DrawRequest',
            data: {
                merchantCode,
                amount,
                requestType,
                accountName,
                remark,
                bank,
                requestDomain: 'fxs_domain'
            },
            success: (res) => {
                if (res.Code == 0 && res.Data) {
                    util.showToast(that, {
                        text: '提现申请成功!',
                        successIcon: true,
                        duration: 2000,
                        callBack: function () {
                            wx.navigateBack({
                                delta: 1
                            });
                        }
                    });
                } else {
                    util.showToast(that, {
                        text: '接口异常！' + res.Msg,
                        duration: 2000
                    });
                    return;
                }
            },
            complete: (res) => {
                wx.hideLoading();
            }
        });
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    }
})