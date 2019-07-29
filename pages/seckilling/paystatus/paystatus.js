// pages/seckilling/paystatus/paystatus.js
const app = getApp();
const util = require('../../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        loadComplete: false,
        copyright: {}
    },
    orderId: '',
    status: '',
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.orderId = options.orderId;
        this.status = options.status;
        if (wx.getStorageSync('isLogin')) {
            this.initData();
        } else {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                this.initData();
            })
        }
    },
    getuserinfo: function () {
        this.initData();
        this.setData({
            showAuthorization: false
        })
    },
    initData() {
        const that = this,
            orderId = this.orderId,
            status = this.status;
        app.request({
            url: '/Order/GetOrderById',
            requestDomain: 'seckilling_domain',
            data: { orderId },
            success(res) {
                if (res.Code == 0) {
                    let ProductSkuName = res.Data.ProductSkuName ? res.Data.ProductSkuName.replace(/\;$/g, '') : '';
                    that.setData({
                        status,
                        orderId,
                        RegionMemberName: res.Data.RegionMemberName,
                        CellPhone: res.Data.CellPhone,
                        Address: res.Data.Address,
                        ProductList: {
                            ProductId: res.Data.ProductList.ProductId,
                            ProductImg: res.Data.ProductList.ProductImgUrl,
                            ProductKillPrice: res.Data.ProductList.Price.toFixed(2),
                            ProductName: res.Data.ProductList.ProductName,
                            ProductNum: res.Data.ProductList.ProductNum
                        },
                        ProductSkuName,
                        ActivityTag: res.Data.ActivityTag,
                        ShipMode: res.Data.ShipMode,
                        Remark: res.Data.Remark || '',
                        PayTime: res.Data.ProductList.PayTime.replace('T', ' '),
                        Freight: res.Data.Freight.toFixed(2),
                        AmountPayable: res.Data.AmountPayable.toFixed(2)
                    })
                } else {
                    util.showToast(that, {
                        text: '接口错误',
                        duration: 2000
                    });
                }
            },
            complete: function () {
                that.setData({ loadComplete: true })
            }
        })
    },
    goDetail() {
        wx.showLoading({
            title: '请稍后'
        })
        setTimeout(function () {
            wx.hideLoading();
            // wx.redirectTo({
            //   url: '../../pintuan/activitylist/activitylist?activityType=2'
            // })
            app.navigateTo('../../pintuan/activitylist/activitylist?activityType=2', 'redirectTo');
        }, 1000)
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },
  sendFormId: function (e) {
      app.sendFormId(e.detail.formId, 0);
  },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.buttomCopyrightSetData(this, 'fixed', 'close');
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    }
})