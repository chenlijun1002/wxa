// pages/storeorder/storeorder.js
//店铺订单、分销店铺订单
const app = getApp();
const util = require("../../../utils/util");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        loadComplete: false,
        pageIndex: 1,
        pageSize: 5,
        firstOrderList: [],
        secondOrderList: [],
        thirdOrderList: [],
        config: {
            FenxiaoLevel: 1
        },
        pullLoading: false,
        loadingText: '上拉显示更多',
        isShowLoading: false,
        isShowToast: false,
        toastText: {},
        scrollTop: 0,
        navId: '0',
        orderEmptyData: {
            imgSrc: 'http://testfile.xiaokeduo.com/system/xkdxcx/system/images/empty-order.png',
            toastText: '暂无订单~'
        },
        copyright: {},        
        OrderCount:0,
        OrderTotalSales:0
    },
    isPullLoading: false,
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
       
        
        const that = this;
        let navId = options.navId ? options.navId : '0';
        that.setPageTitle(navId);
        that.setData({ navId: navId });
        app.request({
            url: '/Distributor/GetDistributorShopInfo',
            data: {
                requestDomain: 'fxs_domain'
            },
            success: (res) => {
                if (res.Code == 0) {
                    that.setData({
                        config: res.Data
                    });
                }
            }
        });
        that.getOrderList();
        that.getCountData(that.data.navId);
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.buttomCopyrightSetData(this, false, 'close');
    },
    setPageTitle(navId) {
        if (navId == '0') {
            wx.setNavigationBarTitle({
                title: '本店订单'
            });
        } else if (navId == '1') {
            wx.setNavigationBarTitle({
                title: '下级订单'
            });
        } else if (navId == '2') {
            wx.setNavigationBarTitle({
                title: '下级订单'
            });
        }
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    tabRequest(e) {
        const navId = e.currentTarget.dataset.id;
        if (navId == this.data.navId) return;
        this.setPageTitle(navId);
        this.setData({
            pageIndex: 1,
            pageSize: 5,
            scrollTop: 0,
            firstOrderList: [],
            secondOrderList: [],
            thirdOrderList: [],
            loadComplete: false,
            isShowLoading: false,
            loadingText: '',
            navId: navId
        });
        this.data.pullLoading = true;
        this.getOrderList();
        this.getCountData(this.data.navId);
    },
    getCountData: function (level){
        const that = this;
        app.request({
            url:'/Distributor/GetDistributorOrdersStatistics',
            data:{
                level: that.data.navId
            },
            success:function (res){
                if(res.Code==0){
                    that.setData({
                        OrderCount:res.Data.OrderCount,
                        OrderTotalSales:res.Data.OrderTotalSales
                    })
                }
            }
        })
    },
    getOrderList(pull) {
        const that = this;
        app.request({
            url: '/Distributor/GetDistributorOrders',
            data: {
                level: that.data.navId,
                pageIndex: that.data.pageIndex,
                pageSize: that.data.pageSize,
                requestDomain: 'fxs_domain'
            },
            success: (res) => {
                if (res.Code == 0) {
                    let list = res.Data.Data;
                    //如果要处理数据写在此处
                    //
                    list.forEach(function (item, index) {
                        let total = 0;
                        item.OrderItems.forEach(function (oitem, oindex) {
                            oitem.getFristComission = oitem.FristComission.toFixed(2);
                            if (that.data.navId == 0) {
                                total += oitem.FristComission;
                            } else if (that.data.navId == 1) {
                                total += oitem.SecondComission;
                            } else if (that.data.navId == 2) {
                                total += oitem.ThirdComission;
                            }
                        });
                        item.getTotalComission = total.toFixed(2);
                    });
                    if (pull) {
                        if (that.data.navId == '0') {
                            that.setData({
                                firstOrderList: that.data.firstOrderList.concat(list)
                            });
                        } else if (that.data.navId == '1') {
                            that.setData({
                                secondOrderList: that.data.secondOrderList.concat(list)
                            });
                        } else if (that.data.navId == '2') {
                            that.setData({
                                thirdOrderList: that.data.thirdOrderList.concat(list)
                            });
                        }
                    } else {
                        if (that.data.navId == '0') {
                            that.setData({
                                firstOrderList: list
                            });
                        } else if (that.data.navId == '1') {
                            that.setData({
                                secondOrderList: list
                            });
                        } else if (that.data.navId == '2') {
                            that.setData({
                                thirdOrderList: list
                            });
                        }
                    }
                    if (that.data.navId == '0') {
                        if (res.Data.Total <= that.data.firstOrderList.length) {
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
                    } else if (that.data.navId == '1') {
                        if (res.Data.Total <= that.data.secondOrderList.length) {
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
                    } else if (that.data.navId == '2') {
                        if (res.Data.Total <= that.data.thirdOrderList.length) {
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
                    }
                    if (that.data.navId=='0'){
                        that.data.copyright.position = that.data.firstOrderList.length > 1 ? '' : 'copyright-fixed';
                    } else if (that.data.navId == '1'){
                        that.data.copyright.position = that.data.secondOrderList.length > 1 ? '' : 'copyright-fixed';
                    }
                    else if (that.data.navId == '2') {
                        that.data.copyright.position = that.data.thirdOrderList.length > 1 ? '' : 'copyright-fixed';
                    }
                    that.setData({
                        loadComplete: true,
                        copyright: that.data.copyright
                    })
                    that.isPullLoading = false;
                }
            },
            complete() {
                that.setData({
                    loadComplete: true
                })
            }
        });
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
                that.getOrderList('pull');
            }, 1000)
        }
    }
})