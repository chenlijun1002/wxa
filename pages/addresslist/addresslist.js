//选择默认收获地址
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
    onLoad: function (options) { },
    onShow: function () {
        app.buttomCopyrightSetData(this, false, 'close');
        if (wx.getStorageSync('isLogin')) {
            if (this.data.showAuthorization) {
                this.setData({
                    showAuthorization: false
                })
            }
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
    sendFormId:function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    bindList: function () {
        var that = this;
        filter.request({
            url: '/MemberAddress/GetAddressList',
            data: {},
            success: function (res) {
                var addressList = res.Data;
                addressList.forEach(function (item) {
                    if (item.IsDefault) {
                        item.checked = 'checked';
                    } else {
                        item.checked = '';
                    }
                });
                that.data.copyright.position = addressList.length > 5 ? '' : 'copyright-fixed';
                that.setData({
                    addressList: addressList,
                    copyright: that.data.copyright
                });
                //util.contentShow(that, 1, 1);
            },
            complete: function () {
                that.setData({ loadComplete: true });
            }
        });
    },
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
                    app.navigateTo('../address/address?addressId=0', 'navigateTo');
                }
            }
        });
    },
    /*设为默认地址*/
    setDefault: function (e) {
        var addressId = e.currentTarget.dataset.addressid;
        wx.showLoading({
            title: '请求中……'
        });
        filter.request({
            url: '/MemberAddress/SetDefault',
            data: {
                id: addressId
            },
            success: function (res) {
                if (res.Code == 0) {
                    var pages = getCurrentPages();
                    var delta = 0;
                    var current = 0;
                    var target = 0;
                    pages.forEach(function (item, index) {
                        if (item.route == 'pages/addresslist/addresslist') {
                            current = index;
                        }
                        if (item.route == 'pages/confirmorder/confirmorder' || item.route == 'pages/pintuan/confirmorder/confirmorder' || item.route == 'pages/seckilling/submitorder/submitorder' || item.route == 'pages/reduceauction/confirmorder/confirmorder' || item.route == 'pages/stairgroup/confirmorder/confirmorder') {
                            target = index;
                        }
                    });
                    delta = current - target;
                    wx.navigateBack({
                        delta: delta
                    });
                }
            },
            complete: function (res) {
                wx.hideLoading();
            }
        });
    },
    /*编辑*/
    editAddress: function (e) {
        var addressId = e.currentTarget.dataset.addressid;
        app.navigateTo('../address/address?addressId=' + addressId, 'navigateTo');
    }
})