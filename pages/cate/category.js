//商品分类
var app = getApp();
var filter = app;
Page({
    /**
     * 页面的初始数据
     */
    data: {
        loadComplete: true,
        allEmpty: true,
        twoEmpty: true,
        oneClass: [],
        twoClass: [],
        currentClassText:'分类',
    },
    currentOneClassId:'',
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        if (wx.getStorageSync('isLogin')) {
            if (this.data.showAuthorization) {
                this.setData({
                    showAuthorization: false
                })
            }
            that.initData(that);
        } else {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                that.initData(that);
            })
        }
    },
    getuserinfo: function () {
        this.initData(this);
        this.setData({
            showAuthorization: false
        })
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    initData: function (that) {
        that.data.oneClass = [];
        filter.request({
            url: '/ProductCategory/GetCategoryMenu',
            data: {},
            success: function (res) {
                if (res.Data.length > 0) {//是否有一级分类  没有就显示为空状态
                    res.Data.forEach(function (item, index) {
                        var active = index == 0 ? 'active' : '';
                        that.data.oneClass.push({
                            active: active,
                            id: item.Id,
                            name: item.CName
                        })
                    })
                    that.setData({
                        oneClass: that.data.oneClass
                    })
                    that.currentOneClassId = that.data.oneClass[0].id;
                    filter.request({
                        url: '/ProductCategory/GetCategoryMenu',
                        data: {
                            oneClassId: that.data.oneClass[0].id
                        },
                        success: function (res) {
                            if (res.Data.length > 0) {
                                that.setData({
                                    twoEmpty: true,
                                    twoClass: res.Data,
                                    currentClassText: that.data.oneClass[0].name,
                                })
                            } else {
                                that.setData({
                                    oneClass: that.data.oneClass,
                                    twoEmpty: false,
                                    currentClassText: that.data.oneClass[0].name,
                                })
                            }
                            that.allTwoClass[0] = res.Data;
                        }
                    });
                } else {
                    that.setData({
                        allEmpty: false
                    })
                }
            },
            fail: function (fail) {
            }
        });
    },
    onShow: function () {
        var forceBind = wx.getStorageSync('forceBind');
        if (forceBind) {
            app.navigateTo('../binduser/binduser', 'redirectTo');
            return;
        }
    },
    questTwoClass: function (e) {
        var oneId = e.target.id;
        var index = e.target.dataset.index;
        var that = this;
        var currentTwo = that.allTwoClass[index];
        that.currentOneClassId = that.data.oneClass[index].id;
        that.data.oneClass.map(function (item) {
            item.active = '';
        })
        that.data.oneClass[index].active = 'active';
        if (!currentTwo) {
            wx.showLoading({
                title: '数据加载中！',
            })
            filter.request({
                url: '/ProductCategory/GetCategoryMenu',
                data: {
                    oneClassId: oneId
                },
                success: function (res) {
                    if (res.Data.length > 0) {
                        that.setData({
                            oneClass: that.data.oneClass,
                            twoClass: res.Data,
                            twoEmpty: true
                        })
                    } else {
                        that.setData({
                            oneClass: that.data.oneClass,
                            twoEmpty: false,
                            currentClassText: that.data.oneClass[index].name,
                        })
                    }
                    that.allTwoClass[index] = res.Data;
                },
                complete: function () {
                    wx.hideLoading()
                }
            });
        } else {
            if (currentTwo.length > 0) {
                that.setData({
                    oneClass: that.data.oneClass,
                    twoClass: currentTwo,
                    twoEmpty: true
                })
            }else{
                that.setData({
                    twoEmpty: false,
                    currentClassText: that.data.oneClass[index].name,
                    oneClass: that.data.oneClass,
                })
            }
        }
    },
    searchProduct: function () {
        app.navigateTo('/pages/productlist/productlist', 'navigateTo');
    },
    allTwoClass: [],
    linkProduct(){
      app.navigateTo(`/pages/productlist/productlist?firstId=${this.currentOneClassId}&categoryName=${this.data.currentClassText}`, 'navigateTo');
    },
    onShareAppMessage: function () {//分类分享
        var that = this;
        var siteName = wx.getStorageSync('shopInfo');
        siteName = siteName ? siteName.SiteName : '';
        var shopId = wx.getStorageSync('shopId');
        return {
            title: siteName,
            path: '/pages/category/category?shopId=' + shopId,
            success: function (res) {
            },
            fail: function (res) {
            }
        }
    }
})