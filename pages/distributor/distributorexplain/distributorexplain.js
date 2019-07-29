// pages/distributorexplain/distributorexplain.js
//申请分销商
var app = getApp();
var util = require('../../../utils/util.js');
var WxParse = require('../../../wxparse/wxParse.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        DistributorProducts: '',
        Expenditure: 0,
        IsExist1: false,
        IsExist2: false,
        IsBuyProduct: false,
        IsFinishedOrderMoney: false,
        IsRechargeMoneyToDistributor: false,
        IsOverCondition: false,
        MinimumCash: 0,
        RechargeMoneyToDistributor: 0,
        isShowToast: false,
        toastText: {},
        DistributorApplyDesc: '',
        IsAutoToDistributor: true,
        imgPath: [],
        disDesc: "",
        disName: "",
        loadComplete: false,
        copyright: {}
    },
    isClick: true,
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.buttomCopyrightSetData(this, false, 'close');
        var that = this;
        // app.judgeLoginState(function () {
        //     that.initData();
        // })
        if (wx.getStorageSync('isLogin')) {
            that.initData();
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
    initData: function () {
        var that = this;
        if (!this.isClose) {
            wx.showLoading({
                title: '加载中'
            });
            // 分销商冻结跳转到会员中心
            app.request({
                url: '/Distributor/IsMemberDistributor',
                data: {},
                success: (pRes) => {
                    if (pRes.Code == 0) {
                        if (pRes.Data.IsDistributor) {
                            if (pRes.Data.IsFreeze) {
                                util.showToast(that, {
                                    text: '您的分销商已被冻结！',
                                    duration: 2000
                                });
                                setTimeout(function () {
                                    app.navigateTo('/pages/membercenter/membercenter', 'switchTab');
                                }, 2000)
                            }
                        }
                    } else {
                        util.showToast(that, {
                            text: '接口异常,' + pRes.Msg,
                            duration: 2000
                        });
                    }
                },
                fail: (res) => {
                    util.showToast(that, {
                        text: '接口异常,' + res.Msg,
                        duration: 2000
                    });
                },
                complete: (res) => {
                    wx.hideLoading();
                }
            });
            app.request({
                url: '/Distributor/GetDistributorExplain',
                data: {
                    requestDomain: 'fxs_domain'
                },
                success: (res) => {
                    if (res.Code == 0) {
                        that.setData({//门槛
                            DistributorApplyDesc: res.Data.DistributorApplyDesc,
                            DistributorApplyTitle: res.Data.DistributorApplyTitle,
                            DistributorApplicationCondition: res.Data.DistributorApplicationCondition,
                            DisDesc: res.Data.DisDesc,
                            imgPath: [res.Data.DisLogo],
                            DisName: res.Data.DisName,
                            IsAutoToDistributor: res.Data.IsAutoToDistributor,
                            loadComplete: true
                        });
                        if (res.Data.IsFinishedOrderMoney) {
                            that.setData({
                                IsFinishedOrderMoney: true,
                                MinimumCash: res.Data.MinimumCash.toFixed(2),
                                Expenditure: res.Data.Expenditure.toFixed(2)
                            });
                        }
                        if (res.Data.IsBuyProduct) {
                            that.setData({
                                IsExist1: true,
                                IsBuyProduct: true,
                                DistributorProducts: res.Data.DistributorProducts
                            });
                        }
                        if (res.Data.IsRechargeMoneyToDistributor) {
                            that.setData({
                                IsExist2: true,
                                IsRechargeMoneyToDistributor: true,
                                RechargeMoneyToDistributor: res.Data.RechargeMoneyToDistributor.toFixed(2)
                            });
                        }
                        //设置当前是否满足门槛
                        that.setData({
                            IsOverCondition: res.Data.IsOverCondition
                        });
                        //特权内容          
                        if (res.Data.DistributorApplyContent) {
                            var article = res.Data.DistributorApplyContent;
                            WxParse.wxParse('article', 'html', article, that, 0);
                        }
                    }
                },
                complete: (res) => {
                    wx.hideLoading();
                }
            });
        }
    },
    /**
     * 指定商品按钮
     */
    buyProduct(e) {
        let productIds = e.currentTarget.dataset.productids;
        app.navigateTo('/pages/productlist/productlist?appointId=' + productIds, 'navigateTo');
    },
    /**
     * 充值按钮
     */
    recharge() {
        // wx.navigateTo({
        //     url: '/pages/balancerecharge/balancerecharge'
        // });
        app.navigateTo('/pages/balancerecharge/balancerecharge', 'navigateTo');
    },
    /**
     * 继续逛逛
     */
    goIndex() {
        app.navigateTo('/pages/index/index', 'switchTab');
    },
    goApplyDis() {
        this.setData({
            DistributorApplicationCondition: false
        })
    },
    /**
     * 申请分销商
     */
    goStoreInfo() {
        let that = this;
        if (!this.isClick) {
            return;
        }
        if (!this.data.IsAutoToDistributor && this.data.DistributorApplicationCondition) {
            wx.showLoading({
                title: '请求中'
            });
            that.isClick = false;
            app.request({
                url: '/Distributor/BecomeDistributorRequest',
                data: {
                    requestDomain: 'fxs_domain'
                },
                success: (res) => {
                    if (res.Code == 0) {
                        util.showToast(that, {
                            text: '申请成功！',
                            successIcon: true,
                            duration: 2000,
                            callBack() {
                                //需要重新登录！！！
                                app.getUserInfo(function (){},function (){
                                    app.navigateTo('/pages/distributor/distributorcenter/distributorcenter', 'navigateTo');
                                })
                            }
                        });

                    }
                },
                complete: () => {
                    wx.hideLoading();
                    that.isClick = true;
                }
            });
        } else {
            that.isClick = false;
            if (that.data.disName.length <= 0 || that.data.disName.length > 50) {
                util.showToast(that, {
                    text: '店铺名称字数为1-50个',
                    duration: 2000
                });
                that.isClick = true;
                return;
            }
            if (that.data.disDesc.length <= 0 || that.data.disDesc.length > 200) {
                util.showToast(that, {
                    text: '店铺简介字数为1-200个',
                    duration: 2000
                });
                that.isClick = true;
                return;
            }
            wx.showLoading({
                title: '请求中'
            });
            app.request({
                url: '/Distributor/DisRegister',
                data: {
                    requestDomain: 'fxs_domain',
                    disName: that.data.disName,
                    disDesc: that.data.disDesc,
                    disLogo: that.data.imgPath[0]
                },
                success: (res) => {
                    if (res.Code == 0 && res.Data) {
                        util.showToast(that, {
                            text: '申请成功！',
                            successIcon: true,
                            duration: 2000,
                            callBack() {
                                //需要重新登录！！！
                                app.getUserInfo(function () { }, function () {
                                    app.navigateTo('/pages/distributor/distributorcenter/distributorcenter', 'navigateTo');
                                })
                            }
                        });

                    }
                },
                complete: () => {
                    wx.hideLoading();
                    that.isClick = true;
                }
            });
        }

    },
    upload: function () {
        var that = this;
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                var tempFilePaths = res.tempFilePaths;
                that.setData({
                    imgPath: [tempFilePaths[0]]
                })
            }
        })
    },
    setDisDesc: function (e) {
        this.setData({
            disDesc: e.detail.value
        })
    },
    setDisName: function (e) {
        this.setData({
            disName: e.detail.value
        })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    }
})