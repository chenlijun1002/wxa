// pages/reduceauction/myauctionlist/myauctionlist.js
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
        myReduceAuctionList: [],
        isShowLoading: false,
        pullLoading: false,
        loadingText: '上拉显示更多...',
        scrollTop: 0,
        emptyData: {
            imgSrc: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/empty-data-13.png',
            toastText: '亲~您还没有该类型竞拍活动哦~'
        },
        copyright: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
        //this.getMyReduceAuction(0)
        if (wx.getStorageSync('isLogin')) {
            this.getMyReduceAuction(0)
        } else {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                this.getMyReduceAuction(0)
            })
        }
    },
    getuserinfo: function () {
        this.getMyReduceAuction(0)
        this.setData({
            showAuthorization: false
        })
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
        this.getMyReduceAuction(status);
    },
    isPullLoading: false,
    getMyReduceAuction(status, pull) {
        const that = this,
            pageIndex = this.data.pageIndex,
            pageSize = this.data.pageSize;
        app.request({
            url: '/ReduceAuction/GetMyReduceAuction',
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
                    let dataList = [];
                    for (let value of res.Data.PageData) {
                        let data = {
                            OrderId: value.OrderData.OrderId,
                            OrderStatus: value.OrderData.OrderStatus,
                            CreateTime: value.OrderData.CreateDateTime.replace('T', ' '),
                            Freight: value.OrderData.Freight.toFixed(2),
                            SkuName: value.OrderData.SkuName ? value.OrderData.SkuName.replace(/\;$/g, '') : '',
                            ActivityTag: value.AuctionData.ActivityTag,
                            ProductImg: value.AuctionData.ProductImg,
                            ProductName: value.AuctionData.ProductName,
                            SalePrice: value.OrderData.SalePrice,
                            Total: (value.AuctionData.AuctionPrice + value.OrderData.Freight).toFixed(2)
                        }
                        dataList.push(data)
                    }
                    if (pull) {
                        that.setData({ myReduceAuctionList: that.data.myReduceAuctionList.concat(dataList) })
                    } else {
                        that.setData({ myReduceAuctionList: dataList })
                    }
                    if (res.Data.Total <= that.data.myReduceAuctionList.length) {
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
                    that.data.copyright.position = that.data.myReduceAuctionList.length > 2 ? '' : 'copyright-fixed';
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
                that.getMyReduceAuction(status, true);
            }, 1000)
        }
    }
})