// pages/supportvalueservice/supportvalueservice.js
var app = getApp();
var util = require('../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        popup:'hide',
        pullLoading: false,
        loadComplete: false,
        isShowLoading: false,
        isShowToast: false,
        loadingText: '上拉显示更多',
        toastText: {},
        copyright: {},
        dataLen:1,
        dataList:[],
    },
    parameter: {
        PageIndex: 1,
        PageNumber: 10
    },
    requestRule:false,
    isPullLoading: false,
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let applyState = options.applyState ? options.applyState:'0';
        this.setData({
            applyState: applyState
        })
        if (applyState==0){
            this.supportValueApplyDate()
        }else{
            this.requestRecordData();
        }
    },
    showRult(){
        const that=this;
        if (!that.requestRule){
            wx.showLoading({
                title: '加载中...',
            })
            app.request({
                url: '/protection/getProtectPriceRule',
                data: {},
                success(res) {
                    if (res.Code == 0) {
                        that.requestRule=true;
                        that.setData({
                            supportValueRult: res.Data.Rule,
                            popup: 'show'
                        })
                    }
                },
                complete() {
                   setTimeout(function (){
                       wx.hideLoading();
                   },2000)
                }
            })
        }else{
            that.setData({
                popup: 'show'
            })
        }
    },
    closePopup(){
        this.setData({
            popup: 'hide'
        }) 
    },
    sendFormId: function(e) {
        app.sendFormId(e.detail.formId, 0);
    },
    apply(e){
        let that=this;
        let protectState = e.currentTarget.dataset.protectstate;
        if (protectState==1) return false;
        let orderItemId = e.currentTarget.dataset.orderitemid;
        app.request({
            url:'/protection/IsAllowProtection',
            data:{
                OrderItemId: orderItemId
            },
            success(res){
                if(res.Code==0){
                    if (res.Data!=0){
                        util.showToast(that, {
                            text: res.Msg,
                            duration: 2000
                        });
                    }else{
                        app.navigateTo(`/pages/supportvalueapply/supportvalueapply?orderItemId=${orderItemId}`, 'navigateTo');
                    }
                }
            }
        })
    },
    changeState(e){
        let applystate = e.currentTarget.dataset.applystate;
        if (applystate == this.data.applyState) return false;
        this.setData({
            loadComplete:false,
            applyState: applystate,
            isShowLoading: false,
            scrollTop: 0,
        })
        this.parameter.PageIndex = 1;//重置到第一页
        if (applystate==0){
            this.supportValueApplyDate();
        }else{
            this.requestRecordData();
        }
    },
    pullLoadingData(){
        var that = this;
        if (that.data.pullLoading && !that.isPullLoading) {//是否还有数据
            that.isPullLoading = true;
            that.parameter.PageIndex++;
            that.setData({
                loadingText: '正在加载更多数据~'
            });
            if (this.data.applyState == 0) {
                this.supportValueApplyDate('pull');
            } else {
                this.requestRecordData('pull');
            }
        }
    },
    requestRecordData(pull){
        var that = this;
        app.request({
            url: '/protection/GetProtectPriceRecord',
            data: that.parameter,
            success: function (data) {
                if (data.Data.RecordList == null) data.Data.RecordList = [];
                if (pull) {
                    that.data.dataList = that.data.dataList.concat(data.Data.RecordList);
                } else {
                    that.data.dataList = data.Data.RecordList;
                }
                if (data.Data.Total <= that.data.dataList.length) {
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
                    dataList: that.data.dataList,
                    dataLen: that.data.dataList.length,
                    loadComplete: true
                })
                that.isPullLoading = false;
            }
        })
    },
    supportValueApplyDate(pull){
        var that = this;
        app.request({
            url: '/protection/getProtectProduct',
            data: that.parameter,
            success: function (data) {
                if (data.Data.OrderList == null) data.Data.OrderList = [];
                if (pull) {
                    that.data.dataList = that.data.dataList.concat(data.Data.OrderList);
                } else {
                    that.data.dataList = data.Data.OrderList;
                }
                if (data.Data.Total <= that.data.dataList.length) {
                    that.data.pullLoading=false;
                    that.data.loadingText = '没有更多数据了';
                } else {
                    that.data.pullLoading=true;
                    that.data.isShowLoading = true;
                }
                that.setData({
                    pullLoading: that.data.pullLoading,
                    loadingText: that.data.loadingText,
                    isShowLoading: that.data.isShowLoading,
                    dataList: that.data.dataList,
                    dataLen: that.data.dataList.length,
                    loadComplete: true
                })
                that.isPullLoading = false;
            }
        })
    }
})