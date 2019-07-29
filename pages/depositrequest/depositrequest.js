// pages/depositrequest/depositrequest.js
//余额提现申请
var app = getApp();
var util = require("../../utils/util");
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
        account: '',
        bank: '',
        applyMoney: '0',
        realName: '',
        remark: '',
        config: {
            EnableOtherDraw: false,
            EnableRedpaperDraw: false,
            EnableWeixinDraw: false
        },
        isShowToast: false,
        toastText: {},
        copyright: {},
        loadComplete: true//页面功能完成后去掉
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
                that.initData();
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
            url: '/Member/IsEnableApplyAmount',
            data: {},
            success: (res) => {
                if (res.Code == 0) {
                    let interfaceCount = that.data.interfaceOkCount;
                    if (!res.Data.IsEnableApplyAmount) {
                        util.showToast(that, {
                            text: '商家未开启余额提现！',
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
        app.buttomCopyrightSetData(this, false, 'close');
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
    changeRealName(e) {
        let realName = e.detail.value;
        this.setData({
            realName: realName
        });
    },
    /**
     * 输入提现账号
     */
    changeAccount(e) {
        let account = e.detail.value;
        this.setData({
            account: account
        });
    },
    /**
     * 输入提现金额
     */
    changeCash(e) {
        let applyMoney = e.detail.value;
        this.setData({
            applyMoney: applyMoney
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
        let realName = this.data.realName;
        let bank = this.data.bank;
        let account = this.data.account;
        let applyMoney = this.data.applyMoney;
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
        if (realName == '') {
            util.showToast(this, {
                text: '请填写收款人真实姓名',
                duration: 2000
            });
            return;
        }
        if (Number(applyMoney) < Number(minCash)) {
            util.showToast(this, {
                text: '提现金额不能小于商家设定的最低提现金额' + minCash,
                duration: 2000
            });
            return;
        }
        if (Number(applyMoney) > Number(maxCash)) {
            util.showToast(this, {
                text: '提现金额不能大于可提现余额',
                duration: 2000
            });
            return;
        }
        if (requestType == 3 && account.length < 6) {
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
        if (requestType == 1 && Number(applyMoney) > 200) {
            util.showToast(this, {
                text: '微信红包提现金额不能大于200元',
                duration: 2000
            });
            return;
        }
        if (requestType == 0 && Number(applyMoney) < 1) {
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
            url: '/Member/DepositRequest',
            data: {
                account: account,
                applyMoney: applyMoney,
                requestType: requestType,
                bankName: bank,
                realName: realName,
                remark: remark
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