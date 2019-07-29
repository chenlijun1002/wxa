//余额明细
var app = getApp();
var util = require('../../utils/util.js');
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
    sendFormId:function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    getAmountList(pull, initial) {
        let that = this;
        app.request({
            url: '/Member/GetAmountList',
            data: {
                pageIndex: that.data.pageIndex,
                pageSize: that.data.pageSize,
                type: that.data.pageType
            },
            success(res) {
                if (res.Code === 0) {
                    let list = res.Data.Data;
                    list.forEach(function (item, index) {
                        switch (item.TradeType) {
                            case 0:
                                item.TypeName = "提现";
                                break;
                            case 1:
                                item.TypeName = "充值";
                                break;
                            case 2:
                                item.TypeName = "佣金转入";
                                break;
                            case 3:
                                item.TypeName = "在线支付";
                                break;
                            case 4:
                                item.TypeName = "售后退款";
                                break;
                            case 5:
                                item.TypeName = "订单关闭";
                                break;
                            case 6:
                                item.TypeName = "提现驳回";
                                break;
                            case 7:
                                item.TypeName = "商铺调整";
                                break;
                            case 8:
                                item.TypeName = "订单货款结算";
                                break;
                            case 9:
                                item.TypeName = "分销佣金结算";
                                break;
                            default:
                                item.TypeName = "其他";
                                break;
                        }
                        if (item.TradeAmount > 0) {
                            item.Sign = '+';
                            item.ShowClass = 'color-main';
                        } else {
                            item.Sign = '-';
                            item.ShowClass = '';
                        }
                        item.TradeAmountStr = Math.abs(item.TradeAmount).toFixed(2);
                        item.AvailableAmountStr = item.AvailableAmount.toFixed(2);
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
                    util.showToast({
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
        app.buttomCopyrightSetData(this);
    }
})