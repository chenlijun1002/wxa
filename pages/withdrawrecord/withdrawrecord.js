// pages/withdrawrecord/withdrawrecord.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        recordList:[],
        pullLoading: false,
        loadComplete: false,
        isShowLoading: false,
        isShowToast: false,
        loadingText: '上拉显示更多',
        toastText: {},
        copyright: {},
        witdrawState:'0'
    },
    parameter: {
        PageIndex: 1,
        PageNumber: 10,
        WithdrawType:0,
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.requestWitdrawData();
    },
    changeState(e) {
        let witdrawState = e.currentTarget.dataset.witdrawstate;
        if (witdrawState == this.data.witdrawState) return false;
        this.setData({
            loadComplete: false,
            witdrawState,
            isShowLoading: false,
            scrollTop: 0,
        })
        this.parameter.PageIndex = 1;//重置到第一页
        this.parameter.WithdrawType = Number(witdrawState);//改变状态
        this.requestWitdrawData();
    },
    pullLoadingData() {
        var that = this;
        if (that.data.pullLoading && !that.isPullLoading) {//是否还有数据
            that.isPullLoading = true;
            that.parameter.PageIndex++;
            that.setData({
                loadingText: '正在加载更多数据~'
            });
            this.requestWitdrawData();
        }
    },
    requestWitdrawData(pull) {
        var that = this;
        app.request({
            url: '/Distributor/getWithdrawRecord',
            data: that.parameter,
            success: function (data) {
                if (data.Data.WithdrawRecord == null) data.Data.WithdrawRecord = [];
                if (pull) {
                    that.data.recordList = that.data.recordList.concat(data.Data.WithdrawRecord);
                } else {
                    that.data.recordList = data.Data.WithdrawRecord;
                }
                if (data.Data.Total <= that.data.recordList.length) {
                    that.data.pullLoading = false;
                    that.data.loadingText = '没有更多数据了';
                } else {
                    that.data.pullLoading = true;
                    that.data.isShowLoading = true;
                }
                that.setData({
                    pullLoading: that.data.pullLoading,
                    loadingText: that.data.loadingText,
                    isShowLoading: that.data.isShowLoading,
                    recordList: that.data.recordList,
                    loadComplete: true
                })
                that.isPullLoading = false;
            }
        })
    },
})