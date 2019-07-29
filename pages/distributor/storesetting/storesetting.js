// pages/distributor/storesetting/storesetting.js
//店铺信息编辑
const app = getApp();
const util = require('../../../utils/util');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        loadComplete: true,
        editType: 0,
        storeInfo: '',
        storeVal: '',
        isShowToast: false,
        toastText: {},
        copyright: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
        //console.log(options)
        this.setData({
            editType: options.type,
            storeInfo: decodeURIComponent(options.storeInfo)
        });
        if (!wx.getStorageSync('isLogin')) {
            this.setData({
                showAuthorization: true
            })
        }
    },
    getuserinfo: function () {
        this.setData({
            showAuthorization: false
        })
    },
    editStoreInfo(e) {
        this.setData({ storeVal: e.detail.value });
    },
    saveInfo(e) {
        const storeVal = this.data.storeVal,
            that = this;
        wx.showLoading({
            title: '正在保存',
        })
        // 输入为空
        if (!storeVal) {
            wx.hideLoading();
            util.showToast(that, {
                text: '输入的信息不能为空',
                duration: 2000
            })
            return;
        }
        app.request({
            url: '/Distributor/EditStoreInfo',
            data: {
                CellPhone: '',
                StoreLogo: '',
                StoreDescription: that.data.editType == 0 ? '' : storeVal,
                StoreName: that.data.editType == 0 ? storeVal : '',
                requestDomain: 'fxs_domain'
            },
            success(res) {
                wx.hideLoading();
                if (that.data.editType == 0 && res.Code == 0) {
                    var shopInfo = wx.getStorageSync('shopInfo');
                    shopInfo.SiteName = storeVal;
                    wx.setStorageSync('shopInfo', shopInfo);
                }
                let text = res.Code === 0 ? ('保存' + (res.Data ? '成功' : '失败')) : ('接口访问失败' + res.Msg);
                util.showToast(that, {
                    text,
                    duration: 2000,
                    callBack() {
                        wx.navigateBack({
                            delta: 1
                        })
                    }
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.buttomCopyrightSetData(this, 'fixed', 'close');
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    }
})