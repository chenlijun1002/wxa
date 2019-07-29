// pages/order/orderlist.js
//订单列表
var app = getApp();
var filter = app;
var util = require('../../utils/util.js');
Page({
    data: {
        nav: [{
            "name": "全部",
            "select": "active"
        }, {
            "name": "待付款",
            "select": ""
        }, {
            "name": "待发货",
            "select": ""
        }, {
            "name": "待收货",
            "select": ""
        }, {
            "name": "售后服务",
            "select": ""
        }],
        pullLoading: false,
        scrollTop: 0,
        orderList: [],
        loadingText: '上拉显示更多',
        isShowLoading: false,
        loadComplete: false,
        isShowToast: false,
        toastText: {},
        copyright: {}
    },
    options:'',
    onLoad: function (options) {
        var that=this;
        that.options = options;
        if (wx.getStorageSync('isLogin')) {
            that.initData(that.options);
        } else {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                that.initData(that.options);
            })
        }
    },
    getuserinfo: function () {
        this.initData(this.options);
        this.setData({
            showAuthorization: false
        })
    },
    onShow:function (){
        app.buttomCopyrightSetData(this, 'fixed');
    },
    initData: function (options){
        var status = 0;
        if (options && options.status) {
            status = Number(options.status);
            this.data.nav.map(function (item) {
                item.select = '';
            })
            this.data.nav[status].select = "active";
            this.setData({
                nav: this.data.nav
            })
        }
        this.currentIndex = status;
        this.requestData(status);
    },
    pullLoadingData: function () {
        var that = this;
        if (that.data.pullLoading && !that.isPullLoading) {//是否还有数据
            //this.data.pullLoading=false;
            that.isPullLoading = true;
            that.parameter.pageIndex++;
            that.setData({
                loadingText: '正在加载更多订单~'
            });
            setTimeout(function () {
                that.requestData(that.currentIndex, 'pull');
            }, 1000)
        }
    },
    changeOrder: function (e) {
        var that = this;
        that.data.nav.forEach(function (item, index) {
            if (item.select == "active") that.currentIndex = index;
            item.select = "";
        })
        var clickIndex = e.target.dataset.index;
        if (that.currentIndex == clickIndex) return false;  //如果是点击的是当前的直接不处理
        that.setData({
            loadComplete: false,
            isShowLoading: false,
            scrollTop: 0,
        })
        that.data.pullLoading = true;
        that.data.nav[clickIndex].select = "active";
        that.setData({
            nav: that.data.nav,
            loadingText: ''
        })
        that.currentIndex = clickIndex;
        that.parameter.pageIndex = 1;//重置到第一页
        that.requestData(clickIndex);//重新加载数据
    },
    requestData: function (orderStatus, pull, initial) {
        var that = this;
        that.parameter.orderStatus = orderStatus;
        if (that.parameter.orderStatus == 4) that.parameter.orderStatus = 5;//最后一项改成售后服务订单
        filter.request({
            url: '/OrderList/GetOrderList',
            data: that.parameter,
            success: function (data) {
                if (data.Data.Data == null) data.Data.Data = [];
                if (pull) {
                    that.data.orderList = that.data.orderList.concat(data.Data.Data);
                    that.setData({
                        orderList: that.data.orderList,
                        list: { length: that.data.orderList.length, types: "order" }
                    })
                } else {
                    that.setData({
                        orderList: data.Data.Data,
                        list: { length: data.Data.Data.length, types: "order" }
                    })
                }
                if (data.Data.Total <= that.data.orderList.length) {
                    that.setData({
                        pullLoading: false,
                        loadingText: '没有更多数据了'
                    })
                } else {
                    that.setData({
                        pullLoading: true,
                        isShowLoading: true
                    })
                }
                that.data.copyright.position = that.data.orderList.length > 1 ? '' : 'copyright-fixed';
                if (that.data.orderList.length>0){
                    if (that.data.orderList.length==1){
                        if (that.data.orderList[0].OrderItems.length>=3){
                            that.data.copyright.position = '';
                        }else{
                            that.data.copyright.position = 'copyright-fixed';
                        }
                    }else{
                        that.data.copyright.position = '';
                    }
                }else{
                    that.data.copyright.position ='copyright-fixed';
                }
                that.setData({
                    loadComplete: true,
                    copyright: that.data.copyright
                })
                that.isPullLoading = false;
            }
        })
    },
    lookLogistics: function (e) {
        var orderId = e.target.dataset.orderid;
        // wx.navigateTo({
        //     url: '../logisticsdetail/logisticsdetail?orderId=' + orderId,
        // })
        app.navigateTo('../logisticsdetail/logisticsdetail?orderId=' + orderId, 'navigateTo');
    },
    wxPayment: function (e) {
        var orderId = e.target.dataset.orderid;
        var orderIndex = e.target.dataset.index;
        var that = this;
        wx.showLoading({
            title: '发起支付中...'
        })
        filter.request({//获取支付参数接口
            url: '/OrderSubmit/GetPayRequest',
            data: {
                orderIds: orderId
            },
            success: function (res) {
                var payArgs = res.Data;
                if (payArgs.Success) {
                    wx.requestPayment({
                        timeStamp: payArgs.TimeStamp,
                        nonceStr: payArgs.NonceStr,
                        package: payArgs.Package,
                        signType: payArgs.SignType,
                        paySign: payArgs.PaySign,
                        success: function (payRes) {
                            that.changeStatus(orderIndex, 2);
                        },
                        fail: function (failRes) {
                            util.showToast(that, {
                                text: '支付失败，请重新支付',
                                duration: 2000
                            });
                        }
                    });
                } else {
                    wx.hideLoading();
                    util.showToast(that, {
                        text: '无法获取支付配置',
                        duration: 2000
                    });
                }
            },
            fail: function () {
                util.showToast(that, {
                    text: '获取支付配置失败',
                    duration: 2000
                });
            },
            complete: function () {
                wx.hideLoading();
            }
        });
    },
    confirmReceipt: function (e) {
        var that = this;
        var orderId = e.target.dataset.orderid;
        var orderIndex = e.target.dataset.index;
        wx.showModal({
            title: '确认收货',
            content: '您确认已收到货物？',
            confirmText: '是',
            cancelText: '否',
            success: function (res) {
                if (res.confirm) {
                    wx.showLoading({
                        title: '正在提交中，请稍后！'
                    });
                    filter.request({
                        url: '/OrderList/ConfirmReceipt',
                        data: {
                            orderId: orderId
                        },
                        success: function (res) {
                            if (res.Code == 0) {
                                wx.showToast({
                                    title: '确认收货成功！',
                                    icon: 'success',
                                    duration: 2000,
                                    success: function () {
                                        // that.changeStatus(orderIndex, 4);
                                        that.changeStatus(orderIndex, 5);//5是已完成
                                    }
                                });
                            } else {
                                util.showToast(that, {
                                    text: res.Msg,
                                    duration: 2000
                                });
                            }
                        },
                        complete: function () {
                            wx.hideLoading();
                        }
                    });
                } else if (res.cancel) {

                }
            }
        });
    },
    // 确认提货
    confirmPickup: function (e) {
      var that = this;
      var orderId = e.target.dataset.orderid;
      var orderIndex = e.target.dataset.index;
      wx.showModal({
        title: '确认提货',
        content: '您确认已提到货物？',
        confirmText: '是',
        cancelText: '否',
        success: function (res) {
          if (res.confirm) {
            wx.showLoading({
              title: '正在提交中，请稍后！'
            });
            filter.request({
              url: '/OrderList/ConfirmPickup',
              data: {
                orderId: orderId
              },
              success: function (res) {
                if (res.Code == 0) {
                  wx.showToast({
                    title: '确认提货成功！',
                    icon: 'success',
                    duration: 2000,
                    success: function () {
                      // that.changeStatus(orderIndex, 4);
                      that.changeStatus(orderIndex, 5);//5是已完成
                    }
                  });
                } else {
                  util.showToast(that, {
                    text: res.Msg,
                    duration: 2000
                  });
                }
              },
              complete: function () {
                wx.hideLoading();
              }
            });
          } else if (res.cancel) {

          }
        }
      });
    },
    changeStatus: function (index, status) {
        var statusText = '';
        switch (status) {
            case 1:
                statusText = '待付款';
                break;
            case 2:
                statusText = '待发货';
                break;
            case 3:
                statusText = '待收货';
                break;
            case 5:
                statusText = '已完成';
                break;
            default:
        }
        var list = this.data.orderList;
        list[index].OrderStatusName = statusText;
        list[index].OrderStatus = status;
        this.setData({
            orderList: list,
            list: { length: list.length, types: "order" }
        });
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    parameter: {
        orderStatus: 0,
        pageIndex: 1,
        pageSize: 5
    },
    currentIndex: 0,
    isPullLoading: false
})