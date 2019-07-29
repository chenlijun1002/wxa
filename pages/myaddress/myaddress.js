//我的收获地址列表
var app = getApp();
var filter = app;
var util = require('../../utils/util.js');
Page({
    /**
     * 页面的初始数据
     */
    data: {
        addressList: [],
        isShowToast: false,
        toastText: {},
        copyright: {}
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },
    onShow: function () {
        app.buttomCopyrightSetData(this, 'fixed');
        //this.bindList();
        if (wx.getStorageSync('isLogin')) {
            this.bindList();
        } else {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                this.bindList();
            })
        }
    },
    getuserinfo: function () {
        this.bindList();
        this.setData({
            showAuthorization: false
        })
    },
    bindList: function () {
        var that = this;
        filter.request({
            url: '/MemberAddress/GetAddressList',
            data: {},
            success: function (res) {
                if (res.Code == 0) {
                    that.setData({
                        addressList: res.Data
                    });
                    that.data.copyright.position = that.data.addressList.length > 4 ? '' : 'copyright-fixed';
                    // util.contentShow(that, 1, 1);
                }
            },
            complete: function () {
                that.setData({ loadComplete: true });
            }
        });
    },
    /*新增收货地址*/
    addNewAddress: function () {
        var that = this;
        wx.showModal({
            title: '提示',
            content: '是否使用微信收货地址？',
            confirmText: '是',
            cancelText: '否',
            success: function (res) {
                if (res.confirm) {//使用微信地址
                    wx.chooseAddress({
                        success: function (successData) {
                            //获取对应的regionId
                            filter.request({
                                url: '/MemberAddress/AddAndSetDefault',
                                data: {
                                    address: successData.detailInfo,
                                    cellPhone: successData.telNumber,
                                    city: successData.cityName,
                                    county: successData.countyName,
                                    province: successData.provinceName,
                                    shipTo: successData.userName
                                },
                                success: function (res) {
                                    if (res.Code == 0) {
                                        //刷新当前页面
                                        that.bindList();
                                    }
                                }
                            });
                        },
                        fail: function (failData) { }
                    });
                } else if (res.cancel) {//使用销客多地址
                    // wx.navigateTo({
                    //     url: '../address/address?addressId=0'
                    // });
                    app.navigateTo('../address/address?addressId=0', 'navigateTo');
                }
            }
        });
    },
    /*编辑收货地址*/
    editAddress: function (e) {
        var addressId = e.currentTarget.dataset.addressid;
        // wx.navigateTo({
        //     url: '../address/address?addressId=' + addressId,
        // });
        app.navigateTo('../address/address?addressId=' + addressId, 'navigateTo');
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    }
})