// pages/distributor/distributorcenter/distributorcenter.js
//独立的分销中心页面
var app = getApp();
var filter = app;
var util = require('../../../utils/util.js');
Page({
    data: {
        interfaceOkCount: 0,
        pageNav: 1,
        isDistributor: false,
        isOpenDistributor: false,
        isShowToast: false,
        userData: {
            GradeName: '普通会员',
            Points: 0,
            CoupnCount: 0,
            AvailableAmount: 0
        },
        toastText: {},
        copyright: {}
    },
    onLoad: function () {
        
    },
    onShow: function () {
        app.buttomCopyrightSetData(this, false, 'close');
        var that = this;
        that.setData({
            interfaceOkCount: 0,
            hasPintuan: app.hasPermissions('ymf_pintuan'),
            hasSeckill: app.hasPermissions('ymf_seckill'),
            hasReduceauction: app.hasPermissions('ymf_reduceauction'),
            hasStairGroup: app.hasPermissions('ymf_stairgroup'),
            navigationBarBackgroundColor: wx.getExtConfigSync().navigationBarBackgroundColor
        });
        if (wx.getStorageSync('isLogin')) {
            if (this.data.showAuthorization) {
                this.setData({
                    showAuthorization: false
                })
            }
            that.initData(that);
        } else {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                that.initData(that);
            })
        }
    },
    getuserinfo: function () {
        this.initData(this);
        this.setData({
            showAuthorization: false
        })
    },
    initData:function (that){
        var forceBind = wx.getStorageSync('forceBind');
        if (forceBind) {
            // wx.redirectTo({
            //     url: '/pages/binduser/binduser'
            // });
            app.navigateTo('/pages/binduser/binduser', 'redirectTo');
            return;
        }
        filter.request({
            url: '/Distributor/IsMemberDistributor',
            data: {},
            success: (pRes) => {
                if (pRes.Code == 0) {
                    if (pRes.Data.IsDistributor) {//是分销商
                        //显示标签
                        if (pRes.Data.IsAgent) {//如果是代理商跳转至错误提示页，且无法返回
                            that.setData({
                                pageNav: 0,
                                isDistributor: false
                            });
                            // wx.redirectTo({
                            //     url: '/pages/emptypage/emptypage'
                            // });
                            app.navigateTo('/pages/emptypage/emptypage', 'redirectTo');
                        } else {
                            that.setData({
                                isDistributor: true
                            });
                            if (pRes.Data.IsFreeze) {
                                util.showToast(that, {
                                    text: '您的分销商已被冻结！',
                                    duration: 2000
                                });
                                // wx.switchTab({
                                //     url: '/pages/membercenter/membercenter'
                                // });
                                app.navigateTo('/pages/membercenter/membercenter', 'switchTab');
                            }
                        }
                    } else {//不是分销商就去申请分销商页面
                        if (that.data.pageNav == 1) {
                            // wx.redirectTo({
                            //     url: '/pages/distributor/distributorexplain/distributorexplain'
                            // });
                            app.navigateTo('/pages/distributor/distributorexplain/distributorexplain', 'redirectTo');
                        }
                        that.setData({
                            pageNav: 0,
                            isDistributor: false
                        });
                    }
                    that.setData({
                        isOpenDistributor: pRes.Data.IsOpenDistributor
                    });
                    //判断pageNav
                    let nav = that.data.pageNav;
                    if (nav == 0) {//会员中心页
                        var userInfo = wx.getStorageSync('userInfo');
                        filter.request({
                            url: '/MemberCenter/GetMemberOrderNavNumber',
                            data: {},
                            success: function (res) {
                                if (res.Code == 0) {

                                    that.setData({
                                        navNumber: res.Data,
                                        userInfo: userInfo
                                    });
                                    //util.contentShow(that, that.data.interfaceOkCount, 1);

                                }
                            },
                            complete() {
                                var interfaceCount = that.data.interfaceOkCount;
                                that.setData({
                                    interfaceOkCount: interfaceCount + 1
                                });
                                util.contentShow(that, that.data.interfaceOkCount, 2);
                            }
                        });
                        filter.request({
                            url: '/Member/GetMemberIndex',
                            data: {},
                            success: (res) => {
                                if (res.Code == 0) {
                                    that.setData({
                                        userData: res.Data
                                    });
                                }
                            },
                            complete() {
                                var interfaceCount = that.data.interfaceOkCount;
                                that.setData({
                                    interfaceOkCount: interfaceCount + 1
                                });
                                util.contentShow(that, that.data.interfaceOkCount, 2);
                            }
                        });
                    } else {//分销中心页
                        filter.request({
                            url: '/Distributor/GetDistributorIndex',
                            data: {},
                            success: (res) => {
                                if (res.Code == 0) {
                                    var interfaceCount = that.data.interfaceOkCount;
                                    that.setData({
                                        interfaceOkCount: interfaceCount + 1,
                                        distributorInfo: res.Data
                                    });
                                    // util.contentShow(that, that.data.interfaceOkCount, 1);
                                } else {
                                    util.showToast(that, {
                                        text: '接口异常',
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
                            complete: function () {
                                that.setData({ loadComplete: true });
                            }
                        });
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
            }
        });
    },
    /**
     * 跳转链接通用方法
     */
    navigateUrl(e) {
        let url = e.currentTarget.dataset.url;
        // wx.navigateTo({
        //     url: url
        // });
        app.navigateTo(url, 'navigateTo');
    },
    /**
     * 切换页签
     */
    changeNav(e) {
        let oldNav = this.data.pageNav;
        let nav = parseInt(e.currentTarget.dataset.pagenav);
        if (nav == oldNav) return;//点击现有的标签直接不处理
        this.setData({
            pageNav: nav
        });
        this.onShow();
    },
    /**
     * 跳转至订单列表 
     */
    navToOrder: function (e) {
        var status = e.currentTarget.dataset.navStatus;
        // wx.navigateTo({
        //     url: '/pages/order/orderlist?status=' + status,
        // })
        app.navigateTo('/pages/order/orderlist?status=' + status, 'navigateTo');
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    }
});