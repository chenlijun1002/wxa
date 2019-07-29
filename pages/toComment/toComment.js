// toComment.js
var app = getApp();
var util = require('../../utils/util.js');
Page({
    data: {
        isLogo: wx.getStorageSync("IsOpenCopyRight"),
        logoSrc: wx.getStorageSync("copyRightLogo"),
        selectIndex: -1,
        pullLoading: false,
        commentList: [],
        loadingText: '上拉显示更多',
        isShowLoading: false,
        loadComplete: false,
        isShowToast: false,
        orderId: 0,
        productId: 0,
        skuId: 0,
        IsRead: false,
        copyright: {}
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    onLoad: function (options) {
        var that = this;
        if (wx.getStorageSync('isLogin')) {
            that.requestData(-1);
            that.isHasNewComment();
        }else{
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                that.requestData(-1);
                that.isHasNewComment();
            })
        }
    },
    onShow:function (){
        app.buttomCopyrightSetData(this);
    },
    isHasNewComment: function () {
        var that = this;
        app.request({
            url: "/MemberCenter/GetUserHasNewComment",
            success: function (res) {
                if (res.Code == 0) {
                    that.setData({
                        IsRead: res.Data
                    })
                }
            }
        })
    },
    changeState: function (e) {
        var that = this;
        var state = Number(e.target.dataset.index);
        if (that.parameter.status == state) return false;  //如果是点击的是当前的直接不处理
        this.setData({
            selectIndex: state,
            loadComplete: false,
            isShowLoading: false,
            scrollTop: 0,
        })
        that.parameter.pageIndex = 1;//重置到第一页
        that.requestData(state);//重新加载数据
    },
    pullLoadingData: function () {
        var that = this;
        if (that.data.pullLoading && !that.isPullLoading) {//是否还有数据
            that.isPullLoading = true;
            that.parameter.pageIndex++;
            that.setData({
                loadingText: '正在加载更多数据~'
            });
            setTimeout(function () {
                that.requestData(that.parameter.status, 'pull');
            }, 1000)
        }
    },
    requestData: function (status, pull) {
        var that = this;
        that.parameter.status = status;
        var url = "/MemberCenter/WaitingComments";
        if (status == 0) {
            url = "/MemberCenter/AlreadyComments";
        }
        app.request({
            url: url,
            data: {
                pageIndex: that.parameter.pageIndex,
                pageSize: that.parameter.pageSize
            },
            success: function (res) {
                if (res.Code == 0) {
                    var jsonData = JSON.parse(res.Data);
                    var commentList = jsonData.Data.Data;
                    if (pull) {
                        that.data.commentList = that.data.commentList.concat(commentList);
                        that.setData({
                            commentList: that.data.commentList,
                            list: { length: that.data.commentList.length, types: "" }
                        })
                    } else {
                        that.setData({
                            commentList: commentList,
                            list: { length: commentList.length, types: "" }
                        })
                    }
                    if (jsonData.Data.Total <= that.data.commentList.length) {
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
                    that.data.copyright.position = that.data.commentList.length > 3 ? '' : 'copyright-fixed';
                    that.setData({
                        loadComplete: true,
                        copyright: that.data.copyright
                    })
                    that.isPullLoading = false;
                }
            }
        })
    },
    toComment: function (e) {
        var productId = Number(e.target.dataset.productid);
        var skuId = (e.target.dataset.skuid);
        var orderId = (e.target.dataset.orderid);
        app.navigateTo('../evaluation/evaluation?status=2&orderId=' + orderId + '&id=' + productId + '&skuId=' + skuId, 'navigateTo');
    },
    lookComment: function (e) {
        console.log(e)
        var productId = (e.currentTarget.dataset.productid);
        var skuId = (e.currentTarget.dataset.skuid);
        var orderId = (e.currentTarget.dataset.orderid);
        app.navigateTo('../evaluation/evaluation?status=1&orderId=' + orderId + '&id=' + productId + '&skuId=' + skuId, 'navigateTo');
    },
    parameter: {
        status: -1,
        pageIndex: 1,
        pageSize: 5
    },
    isPullLoading: false
})