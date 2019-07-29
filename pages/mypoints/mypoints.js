// pages/mypoints/mypoints.js
//积分
const app = getApp();
const util = require("../../utils/util");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        pointsList: [],
        remainingPoints: 0,
        totalPoints: 0,
        loadComplete: false,
        pageIndex: 1,
        pageSize: 10,
        pullLoading: false,
        loadingText: '上拉显示更多',
        isShowLoading: false,
        isShowToast: false,
        toastText: {},
        scrollTop: 0,
        emptyData: {
            imgSrc: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/empty-data-7.png',
            toastText: '暂无积分明细~'
        },
        copyright: {}
    },
    getPointsStatistics() {
        const that = this;
        app.request({
            url: '/Member/GetPointsStatistics',
            data: {},
            success(res) {
                if (res.Code === 0) {
                    that.setData({
                        remainingPoints: res.Data.RemainingPoints,
                        totalPoints: res.Data.TotalPoints
                    })
                } else {
                    util.showToast(that, {
                        text: '接口错误' + res.Msg,
                        duration: 2000
                    })
                }
            }
        })
    },
    isPullLoading: false,
    getMyIntegrals(pull) {
        const that = this;
        app.request({
            url: '/Member/GetMyIntegrals',
            data: {
                pageIndex: that.data.pageIndex,
                pageSize: that.data.pageSize,
                status: 0
            },
            success(res) {
                if (res.Code === 0) {
                    let list = res.Data.Data;
                    //数据处理写在此处
                    //
                    if (pull) {
                        that.setData({
                            pointsList: that.data.pointsList.concat(list)
                        });
                    } else {
                        that.setData({
                            pointsList: list
                        })
                    }
                    if (res.Data.Total <= that.data.pointsList.length) {
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
                    that.data.copyright.position = that.data.pointsList.length > 4 ? '' : 'copyright-fixed';
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
            }
        })
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
                that.getMyIntegrals('pull');
            }, 1000)
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
        // this.getPointsStatistics();
        // this.getMyIntegrals();
        if (wx.getStorageSync('isLogin')) {
            this.getPointsStatistics();
            this.getMyIntegrals();
        } else {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                this.getPointsStatistics();
                this.getMyIntegrals();
            })
        }
    },
    getuserinfo: function () {
        this.getPointsStatistics();
        this.getMyIntegrals();
        this.setData({
            showAuthorization: false
        })
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