// mySepllGroup.js
var app = getApp();
Page({
    data: {
        selectIndex: -1,
        pullLoading: false,
        sepllGroupList: [],
        loadingText: '上拉显示更多',
        isShowLoading: false,
        loadComplete: false,
        isShowToast: false,
        copyright: {}
    },
    onLoad: function (options) {
        if (!wx.getStorageSync('isLogin')) {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                this.requestData(-1);
            })
        } else {
            this.requestData(-1);
        }
    },
    onShow: function () {
        app.buttomCopyrightSetData(this);
    },
    getuserinfo: function () {
        this.requestData(-1);
        this.setData({
            showAuthorization: false
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
            //this.data.pullLoading=false;
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
sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    requestData: function (status, pull) {
        var that = this;
        that.parameter.status = status;
        app.request({
            url: '/Member/GetSpellGroupRecordList',
            requestDomain: 'ymf_domain',
            data: that.parameter,
            success: function (data) {
                if (data.Code == 0) {
                    data.Data.PageData.forEach(function (item) {
                        item.SaleMoney = item.SaleMoney.toFixed(2);
                    })
                    var sepllGroupList = data.Data.PageData;
                    if (pull) {
                        that.data.sepllGroupList = that.data.sepllGroupList.concat(sepllGroupList);
                        that.setData({
                            sepllGroupList: that.data.sepllGroupList
                        })
                    } else {
                        that.setData({
                            sepllGroupList: sepllGroupList
                        })
                    }
                    if (data.Data.Total <= that.data.sepllGroupList.length) {
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
                    that.data.copyright.position = that.data.sepllGroupList.length > 2 ? '' : 'copyright-fixed';
                    that.setData({
                        loadComplete: true,
                        copyright: that.data.copyright
                    })
                    that.isPullLoading = false;
                }
            }
        })
    },
    parameter: {
        status: 0,
        pageIndex: 1,
        pageSize: 5
    },
    isPullLoading: false
})