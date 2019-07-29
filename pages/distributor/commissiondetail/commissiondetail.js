// pages/commissiondetail/commissiondetail.js
//佣金明细
var app = getApp();
var util = require('../../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        loadComplete: false,
        amountList: [],
        pageIndex: 1,
        pageSize: 10,
        pullLoading: false,
        loadingText: '上拉显示更多',
        isShowLoading: false,
        pageType: 0,
        scrollTop: 0,
        isShowToast: false,
        toastText: {},
        emptyData: {
            imgSrc: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/empty-data-4.png',
            toastText: '暂无明细~'
        },
        copyright: {}
    },
    isPullLoading: false,
    getAmountList(pull, initial) {
        let that = this;
        app.request({
            url: '/Distributor/GetCommissionDetail',
            data: {
                requestDomain: 'fxs_domain',
                pageIndex: that.data.pageIndex,
                pageSize: that.data.pageSize,
                type: that.data.pageType
            },
            success(res) {
                if (res.Code === 0) {
                    let list = res.Data.Data;
                    //数据处理写在此处
                    //
                    list.forEach(function (item, index) {
                        if (item.FromDistributor.StoreName != null) {
                            item.FromStore = "成交店铺：" + item.FromDistributor.StoreName;
                        } else {
                            item.FromStore = "系统奖励";
                        }
                        if (item.CommTotal > 0) {
                            item.Sign = '+';
                            item.ShowClass = 'color-main';
                        } else {
                            item.Sign = '-';
                            item.ShowClass = '';
                        }
                        item.CommTotalStr = Math.abs(item.CommTotal).toFixed(2);
                        item.TradeTimeStr = util.formatDateTime(item.TradeTime);
                    });
                    if (pull) {
                        that.setData({
                            amountList: that.data.amountList.concat(list)
                        });
                    } else {
                        that.setData({
                            amountList: list
                        })
                    }
                    if (res.Data.Total <= that.data.amountList.length) {
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
                    that.data.copyright.position = that.data.amountList.length > 5 ? '' : 'copyright-fixed';
                    that.setData({
                        loadComplete: true,
                        copyright: that.data.copyright
                    })
                    that.isPullLoading = false;
                } else {
                    util.showToast(that, {
                        text: '接口错误' + res.Msg
                    })
                }
            },
            complete() {
                that.setData({
                    loadComplete: true
                })
            }
        })
    },
    tabRequest(e) {
        let pageType = e.currentTarget.dataset.type;
        let oldType = this.data.pageType;
        if (oldType == pageType) {
            return;
        }
        this.setData({
            pageType: pageType,
            pageIndex: 1,
            pageSize: 10,
            amountList: [],
            loadComplete: false,
            isShowLoading: false,
            loadingText: '',
            scrollTop: 0
        });
        this.data.pullLoading = true;
        this.getAmountList()
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
                that.getAmountList('pull');
            }, 1000)
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
        
    },
    getuserinfo: function () {
        this.getAmountList();
        this.setData({
            showAuthorization: false
        })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        //this.getAmountList();
        if (wx.getStorageSync('isLogin')) {
            if (this.data.showAuthorization) {
                this.setData({
                    showAuthorization: false
                })
            }
            this.getAmountList();
        } else {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                this.getAmountList();
            })
        }
        app.buttomCopyrightSetData(this, false, 'close');
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    }
})