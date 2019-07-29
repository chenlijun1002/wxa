// pages/mycoupon/mycoupon.js
//优惠券
const app = getApp();
const util = require("../../utils/util");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        pageType: 0,
        loadComplete: false,
        couponList: [],
        pageIndex: 1,
        pageSize: 10,
        orderEmptyData: {
            imgSrc: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/empty-data-6.png',
            toastText: '暂无此优惠券~'
        },
        pullLoading: false,
        loadingText: '上拉显示更多',
        isShowLoading: false,
        isShowToast: false,
        toastText: {},
        scrollTop: 0,
        copyright: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
        //this.getCouponList();
        if (wx.getStorageSync('isLogin')) {
            this.getCouponList();
        } else {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                this.getCouponList();
            })
        }
    },
    getuserinfo: function () {
        this.getCouponList();
        this.setData({
            showAuthorization: false
        })
    },
    isPullLoading: false,
    getCouponList(pull) {
        const that = this;
        app.request({
            url: '/Member/GetMyCoupon',
            data: {
                pageIndex: that.data.pageIndex,
                pageSize: that.data.pageSize,
                status: that.data.pageType
            },
            success(res) {
                if (res.Code === 0) {
                    let list = res.Data.Data;
                    //数据处理写在此处
                    //
                    list.forEach(function (item, index) {
                        if (item.ConditionValue * 1 == 0) {
                            item.Couponsm = '无消费限制';
                        } else {
                            item.Couponsm = "满 " + item.ConditionValue + " 元使用";
                        }
                        item.BeginDateStr = util.formatDateTime(item.BeginDate);
                        item.EndDateStr = util.formatDateTime(item.EndDate);
                    });
                    if (pull) {
                        that.setData({
                            couponList: that.data.couponList.concat(list)
                        });
                    } else {
                        that.setData({
                            couponList: list
                        })
                    }
                    if (res.Data.Total <= that.data.couponList.length) {
                        that.setData({
                            pullLoading: false,
                            loadingText: '没有更多数据了'
                        })
                    } else {
                        that.setData({
                            loadingText: '上拉显示更多',
                            pullLoading: true,
                            isShowLoading: true
                        })
                    }
                    that.data.copyright.position = that.data.couponList.length > 3 ? '' : 'copyright-fixed';
                    that.setData({
                        loadComplete: true,
                        copyright: that.data.copyright
                    })
                    that.isPullLoading = false;
                } else {
                    util.showToast(that, {
                        text: '接口错误' + res.Msg,
                        duration: 2000
                    })
                }
            }
        })
    },
    tabRequest(e) {
        const pageType = parseInt(e.currentTarget.dataset.type);
        if (pageType == this.data.pageType) return;
        this.setData({
            loadComplete: true,
            pageIndex: 1,
            pageSize: 5,
            scrollTop: 0,
            couponList: [],
            loadComplete: false,
            isShowLoading: false,
            loadingText: '',
            pageType: pageType
        });
        this.data.pullLoading = true;
        this.getCouponList();
    },
    pullLoadingData() {
        var that = this;
        if (that.data.pullLoading && !that.isPullLoading) {//是否还有数据
            //this.data.pullLoading=false;
            that.isPullLoading = true;
            that.data.pageIndex++;
            that.setData({
                pageIndex: that.data.pageIndex,
                loadingText: '正在加载更多数据~'
            });
            setTimeout(function () {
                that.getCouponList('pull');
            }, 1000)
        }
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.buttomCopyrightSetData(this, 'fixed');
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    }
})