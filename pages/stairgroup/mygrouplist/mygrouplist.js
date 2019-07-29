
const app = getApp();
const util = require('../../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        loadComplete: false,
        status: 0,
        pageIndex: 1,
        pageSize: 5,
        myGroupList: [],
        isShowLoading: false,
        pullLoading: false,
        loadingText: '上拉显示更多...',
        scrollTop: 0,
        emptyData: {
            imgSrc: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/empty-data-14.png',
            toastText: '亲~您还没有该类型团购活动哦~'
        },
        copyright: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getMyStairGroup(0)
    },
    onShow:function (){
        app.buttomCopyrightSetData(this);
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    changeStatus(e) {
        const status = Number(e.currentTarget.dataset.status);
        if (status == this.data.status) return;
        this.setData({
            status,
            pageIndex: 1,
            pageSize: 5,
            scrollTop: 0,
            isShowLoading: false,
            pullLoading: false,
            loadingText: '上拉显示更多...',
            loadComplete: false
        });
        this.getMyStairGroup(status);
    },
    isPullLoading: false,
    getMyStairGroup(status, pull) {
        const that = this,
            pageIndex = this.data.pageIndex,
            pageSize = this.data.pageSize;
        app.request({
            url: '/StairGroup/GetMyStairAuction',
            requestDomain: 'ymf_domain',
            data: {
                pageIndex,
                pageSize,
                status
            },
            success(res) {
                if (res.Code == 0) {
                    res.Data = JSON.parse(res.Data);
                    console.log(res.Data)
                    res.Data.orderData.forEach(v => {
                        v.total = (v.SalePrice * v.Quantity + v.Freight).toFixed(2);
                        v.SalePrice = v.SalePrice.toFixed(2);
                        v.Freight = v.Freight.toFixed(2);
                        v.CreateDateTime = v.CreateDateTime.replace('T', ' ');
                    })
                    if (pull) {
                        that.setData({ myGroupList: that.data.myGroupList.concat(res.Data.orderData) })
                    } else {
                        that.setData({ myGroupList: res.Data.orderData })
                    }
                    if (res.Data.Total <= that.data.myGroupList.length) {
                        that.setData({
                            pullLoading: false,
                            loadingText: '没有更多数据了'
                        })
                    } else {
                        that.setData({
                            isShowLoading: true,
                            pullLoading: true
                        })
                    }
                    that.data.copyright.position = that.data.myGroupList.length > 2 ? '' : 'copyright-fixed';
                    that.setData({
                        copyright: that.data.copyright
                    })
                    that.isPullLoading = false;
                } else {
                    that.data.copyright.position = 'copyright-fixed';
                    that.setData({
                        copyright: that.data.copyright
                    })
                    util.showToast(that, {
                        text: '接口异常' + res.Msg,
                        duration: 2000
                    });
                }
            },
            complete() {
                that.setData({ loadComplete: true })
            }
        })
    },
    pullLoadingData() {
        const that = this,
            status = this.data.status;
        if (that.data.pullLoading && !that.isPullLoading) {
            that.isPullLoading = true;
            that.setData({
                pageIndex: ++that.data.pageIndex,
                loadingText: '正在加载...'
            })
            setTimeout(function () {
                that.getMyStairGroup(status, true);
            }, 1000)
        }
    }
})