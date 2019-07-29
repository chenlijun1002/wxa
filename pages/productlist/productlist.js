// pages/productlist/productlist.js
//搜索商品列表
var app = getApp();
var filter = app;
var util = require('../../utils/util.js');
Page({

    /**
     * 页面的初始数据  
     */
    data: {
        searchValue: '',//搜索框值
        navList: [{
            active: 'active',
            name: '综合',
            arrow: ''
        }, {
            active: '',
            name: '销量',
            arrow: ''
        }, {
            active: '',
            name: '价格',
            arrow: ''
        }],//排序选项卡
        scrollTop: 0,
        isShowLoading: false,//是否显示加载更多
        pullLoading: false,//转圈的图片
        loadingText: '上拉显示更多',
        productList: [],
        loadComplete: false,
        scrollViewTop: 238,
        searchIsShow: 'show',
        copyright: {}
    },
    pageArgs: {
        isDesc: true,
        pageStatus: 0,
        pageIndex: 1,
        pageSize: 10
    },
    secondId: 0,
    firstId: 0,
    appointId: '',
    isPullLoading: false,
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options.categoryName) {
            wx.setNavigationBarTitle({
                title: options.categoryName,
            })
        }
        var that = this;
        that.setData({
            isClose: wx.getStorageSync("isClose")
        })
        var that = this;
        if (options.shopId) {//处理锁粉逻辑
            if (wx.getStorageSync('shopId') == '') {
                wx.setStorageSync('shopId', options.shopId);
            }
        }
        that.secondId = options.secondId ? Number(options.secondId) : 0;
        that.firstId = options.firstId ? Number(options.firstId) : 0;
        that.appointId = options.appointId ? options.appointId : '';
        /*跨页面搜索模板参数导入 */
        var searchValue = options.searchValue;
        if (searchValue) {
            that.setData({
                searchValue: searchValue
            })
        }
        if (wx.getStorageSync('isLogin')) {
            if (this.data.showAuthorization) {
                this.setData({
                    showAuthorization: false
                })
            }
            this.bindData(that.pageArgs.pageStatus);
        } else {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                this.bindData(that.pageArgs.pageStatus);
            })
        }
    },
    getuserinfo: function () {
        this.bindData(this.pageArgs.pageStatus);
        this.setData({
            showAuthorization: false
        })
    },
    onShow: function () {
        var that = this;
        if (wx.getStorageSync("copyRightLogo")) {
            app.buttomCopyrightSetData(this);
        } else {
            setTimeout(function () {
                app.buttomCopyrightSetData(that);
            }, 2000)
        }
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    changeNav: function (e) {//选项卡点击
        var that = this;
        that.data.navList.forEach(function (item, index) {
            if (item.active == "active") that.pageArgs.pageStatus = index;
            item.active = "";
        });
        var clickNavIndex = e.target.dataset.index;
        if (that.pageArgs.pageStatus == clickNavIndex) {//如果是点击的是当前的
            if (clickNavIndex == 0) {
                return false;
            } else {//升降序切换
                var arrowStatus = that.data.navList[clickNavIndex].arrow;
                if (arrowStatus == '' || arrowStatus == 'up') {
                    that.data.navList[clickNavIndex].arrow = 'down';
                    that.pageArgs.isDesc = true;
                } else {
                    that.data.navList[clickNavIndex].arrow = 'up';
                    that.pageArgs.isDesc = false;
                }
            }
        } else {//如果点击不是当前的
            if (clickNavIndex == 0) {
                that.data.navList[that.pageArgs.pageStatus].arrow = '';//清空原来的箭头状态
            } else {
                that.data.navList[that.pageArgs.pageStatus].arrow = '';//清空原来的箭头状态
                that.data.navList[clickNavIndex].arrow = 'down';//增加新的箭头状态
            }
            that.pageArgs.isDesc = true;//设置成倒序
            that.pageArgs.pageStatus = clickNavIndex;//查询字段设置成点击的项
        }
        that.setData({
            loadComplete: false,
            isShowLoading: false,
            scrollTop: 0,
        });
        that.data.pullLoading = true;
        that.data.navList[clickNavIndex].active = "active";
        that.setData({
            navList: that.data.navList,
            loadingText: ''
        })
        that.pageArgs.pageIndex = 1;//重置到第一页
        that.bindData(that.pageArgs.pageStatus);//重新加载数据
    },
    pullLoadingData: function () {
        var that = this;
        that.pageArgs.pageSize = 10;
        if (that.data.pullLoading && !that.isPullLoading) {//是否还有数据
            that.isPullLoading = true;
            that.pageArgs.pageIndex++;
            that.setData({
                loadingText: '正在加载更多商品~'
            });
            setTimeout(function () {
                if (that.appointId == '') {//只有不是查指定商品的时候下拉才加载
                    that.bindData(that.pageArgs.pageStatus, 'pull');
                } else {

                }
            }, 1000)
        }
    },
    doSearch: function () {
        console.log(11)
        var that = this;
        that.firstId = 0;
        that.secondId = 0;
        that.pageArgs.pageIndex = 1;//重置到第一页
        that.setData({
            scrollTop: 0
        });
        that.bindData(that.pageArgs.pageStatus);
    },
    bindData: function (navIndex, pull) {//请求绑定数据
        var that = this;
        that.pageArgs.pageStatus = navIndex;
        /*正式数据勿删 */
        filter.request({
            url: '/ProductList/GetProductList',
            data: {
                isDesc: that.pageArgs.isDesc,
                pageIndex: that.pageArgs.pageIndex,
                pageSize: that.pageArgs.pageSize,
                sortField: that.pageArgs.pageStatus ? that.pageArgs.pageStatus : 0,
                productName: that.data.searchValue,
                firstId: that.firstId,
                secondId: that.secondId,
                productIds: that.appointId
            },
            success: function (res) {
                if (res.Code == 0) {
                    if (pull) {//上拉的
                        that.data.productList = that.data.productList.concat(res.Data.Data);
                        that.setData({
                            productList: that.data.productList
                        });
                    } else {//切换页签或首次加载的
                        that.setData({
                            productList: res.Data.Data
                        })
                    }
                    if (res.Data.Total <= that.data.productList.length) {//处理显示加载更多
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
                    that.data.copyright.position = that.data.productList.length > 3 ? '' : 'copyright-fixed';
                    that.setData({
                        loadComplete: true,
                        copyright: that.data.copyright
                    })
                    that.isPullLoading = false;
                }
            },
            fail: function (res) {
            }
        });
    },
    changeSearchValue: function (e) {
        var inputValue = e.detail.value;
        this.appointId = '';
        this.setData({
            searchValue: inputValue
        });
    },
    onShareAppMessage: function () {//分类分享
        var that = this;
        var shopInfo = wx.getStorageSync('shopInfo');
        var siteName = shopInfo ? shopInfo.SiteName : '';
        var shopId = wx.getStorageSync('shopId');
        return {
            title: siteName,
            path: '/pages/productlist/productlist?shopId=' + shopId,
            success: function (res) {
            },
            fail: function (res) {
            }
        }
    }
})