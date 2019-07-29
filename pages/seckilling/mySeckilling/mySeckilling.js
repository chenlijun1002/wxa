// mySeckilling.js
var app = getApp();
Page({
    data: {
        isLogo: wx.getStorageSync("IsOpenCopyRight"),
        logoSrc: wx.getStorageSync("copyRightLogo"),
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
        var that = this;
        if (wx.getStorageSync('isLogin')) {
            that.requestData(-1);
        } else {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                that.requestData(-1);
            })
        }
    },
    getuserinfo: function () {
        this.requestData(-1);
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
        //console.log(that.parameter)
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
    requestData: function (status, pull) {
        var that = this;
        that.parameter.status = status;
        app.request({
            //url: '/Member/GetSpellGroupRecordList',
            url: '/Order/GetOrderListByUser',
            requestDomain: 'seckilling_domain',
            data: that.parameter,
            success: function (data) {
                if (data.Status == 1) {
                    data.Data.Items.forEach(function (item) {
                        item.Price = item.OrderItems[0].Price.toFixed(2);
                    })
                    var sepllGroupList = data.Data.Items;
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
                    that.data.copyright.position = that.data.sepllGroupList.length > 1 ? '' : 'copyright-fixed';
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