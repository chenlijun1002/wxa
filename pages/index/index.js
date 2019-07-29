//index.js
//首页
//获取应用实例
var app = getApp();
var util = require('../../utils/util.js');
var richText = require('../../utils/richText.js');
var richTextVideo = require('../../utils/richTextVideo.js');
Page({
    data: {
        searchValue: '',
        navigationBarBackgroundColor: '#00a699',
        imgInfo: [],
        themeProductInfo: {
            themeName: '',
            productInfoList: []
        },
        canIUse: wx.canIUse('button.open-type.contact'),
        recommendProductList: [],
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        interfaceOkCount: 0,
        TopicData: null,
        RequestUrl: '',
        loadComplete: false,
        copyright: {},
        isShowCouponModal: false,
        couponData: {
            CouponValue: 0,
            CouponName: "",
            ConditionValue: 0,
            BeginDate: "",
            EndDate: "",
            IsAllProduct: false
        }
    },
    goLogin() {
        wx.getUserInfo({
            success: function (e) {
            }
        })
    },
    // setPageState(){
    //     this.setData({
    //         showPageState:true
    //     })
    // },
    // btnClick(){
    //     this.setData({
    //         showPageState: false
    //     })
    // },
    onLoad: function (options) {
        var that = this;
        //未授权销客多跳转到云魔方首页 
        //处理临时的二维码扫码跳转页面功能（蒯伟）
        var sscene = decodeURIComponent(options.scene);//"vw_p_coupon-12";// 
        if (sscene.startsWith('vw_p_pd-')) {
            var topage = "/pages/detail/detail?productId=" + sscene.substring(8);
            app.navigateTo(topage, 'redirectTo');
        } else if (sscene.startsWith('vw_p_coupon-')) {
            var topage = "/pages/mycoupon/mycoupon?t=" + sscene.substring(12);
            app.navigateTo(topage, 'redirectTo');
        }
			 
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
    onPullDownRefresh() {
        this.initData(this);
    },
    onShow: function () {
        var that = this;
        this.setData({
            isClose: wx.getStorageSync("isClose")
        })
        if (wx.getStorageSync("requestStoreInfoSuccess")) {
            app.buttomCopyrightSetData(this);
        } else {
            setTimeout(function () {
                app.buttomCopyrightSetData(that);
            }, 2000)
        }
        that.setData({
            navigationBarBackgroundColor: wx.getExtConfigSync().navigationBarBackgroundColor
        })
    },
    getuserinfo: function () {
			var permissionsList = app.getPermissions();
        if (permissionsList.indexOf('xkd_wxaapp') < 0) {
            app.navigateTo('/pages/pintuan/index/index', 'switchTab');
            return;
        }
        this.initData(this);
        this.setData({
            showAuthorization: false
        })
    },
    initData: function (that) {
        var shopInfo = wx.getStorageSync('shopInfo');
        if (shopInfo) {
            wx.setNavigationBarTitle({
                title: shopInfo.SiteName,
            });
        }
        var forceBind = wx.getStorageSync('forcebind');
        if (forceBind) {
            app.navigateTo('../binduser/binduser', 'redirectTo');
            return;
        }
        //以下为新的可视化首页请求
        app.request({
            url: '/index/GetIndexPage',
            data: {},
            success: (res) => {
                if (res.Code == 0) {
                    //逻辑处理
                    let pageData = JSON.parse(res.Data);
                    pageData.LModules.forEach(function (item) {
                        if (item.content.fulltext && item.type == 1) {
                            item.content.fulltext = richTextVideo.richTextVideo(transformHtml(item.content.fulltext));
                        }
                    })
                    for (let i = 0; i < pageData.LModules.length; i++) {
                        if (pageData.LModules[i].type != 9 || pageData.LModules[i].content.showType != 2) continue;//排除不是图片广告和不是平铺的状态
                        //平铺的图片广告url地址加上随机
                        let randomNum = new Date().getTime();
                        for (let k = 0; k < pageData.LModules[i].content.dataset.length; k++) {
                            pageData.LModules[i].content.dataset[k].pic = pageData.LModules[i].content.dataset[k].pic + '?' + randomNum;
                        }
                    }
                    for (let i = 0; i < pageData.LModules.length;i++){
                      if (pageData.LModules[i].type==5){
                          pageData.LModules[i].content.goodslist.forEach(function(nextItem){
                          nextItem.descr = util.removeSpace(nextItem.descr);
                        })
                      }
                    }
                    that.setData({
                        loadComplete: true,
                        TopicData: pageData.LModules
                    });
                    app.hasShowGetCouponModal(that)
                }
            },
            complete() {
                wx.stopPullDownRefresh();
            }
        });
    },
    ClickSwiper: function (e) {
        var that = this;
        var urllink = e.currentTarget.dataset.link;
        var showtype = e.currentTarget.dataset.showtype;
        that.JumpUrlByType(showtype, urllink);
    },
    JumpUrlByType: function (typeId, urls) {
        switch (typeId) {
            case 27:
                var urlArr = urls.split(',');
                var url = urlArr[0];
                var appId = urlArr[1];

                var selfAppId = wx.getExtConfigSync().wx_appid;
                if (appId == selfAppId) {
                    if (url.charAt(0) != '/') {
                        url = '/' + url;
                    }
                    app.navigateTo(url, 'navigateTo');
                } else {
                    if (url.charAt(0) == '/') {
                        url = url.substr(1)
                    }
                    wx.navigateToMiniProgram({
                        appId: appId,
                        path: url,
                        extraData: {},
                        envVersion: 'trial'
                    });
                }
                break;
            case 24:
                app.navigateTo(urls, 'navigateTo')
                break;
            case 23:
                wx.makePhoneCall({
                    phoneNumber: urls //仅为示例，并非真实的电话号码
                });
                break;
            case 7:
                app.navigateTo(urls, 'switchTab');
                break;
            //分销中心的要额外加一个
            case 16:
						    var permissionsList = app.getPermissions();
                if (permissionsList.indexOf('xkd_fenxiao') > 0) {
                    app.navigateTo(urls, 'switchTab');
                } else {
                    app.navigateTo(urls, 'navigateTo');
                }
                break;
            //购物车
            case 9:
                app.navigateTo(urls, 'switchTab');
                break;
            //商品分类
            case 12:
                app.navigateTo(urls, 'switchTab');
                break;
            //活动专题
            case 22:
                app.navigateTo(urls, 'navigateTo');
                break;
            default:
                app.navigateTo(urls, 'navigateTo');
                break;
        };
    },
    searchFocus: function () {
        app.navigateTo('/pages/productlist/productlist', 'navigateTo');
    },
    onShareAppMessage: function () {
        var that = this;
        var shopInfo = wx.getStorageSync('shopInfo');
        var siteName = shopInfo ? shopInfo.SiteName : '';
        var shopId = wx.getStorageSync('shopId');
        return {
            title: siteName,
            path: '/pages/index/index?shopId=' + shopId,
            success: function (res) {
            },
            fail: function (res) {
            }
        }
    },
    /*搜索取值 */
    SearchValue: function (e) {
        var inputValue = e.detail.value;
        this.setData({
            searchValue: inputValue
        });
    },
    onSearch: function () {
        wx.reLaunch({
            url: '/pages/productlist/productlist?searchValue=' + this.data.searchValue,
        })
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    loadImgSuccess(e) {
        const that = this;
        let modeIndex = e.target.dataset.modeidx;
        let currentMode = that.data.TopicData[modeIndex];
        let index = e.target.dataset.index;
        wx.getSystemInfo({
            success: function (res) {
                that.data.TopicData[modeIndex].content.dataset[index].setHeight = res.windowWidth / e.detail.width * e.detail.height;
                that.setData({
                    TopicData: that.data.TopicData
                })
            }
        })
    },
    closeGetCouponModal: function () {
        this.setData({
            isShowCouponModal: false
        })
    }
})

function transformHtml(str) {
    var reg1 = /&lt;/g;
    var reg2 = /&gt;/g;
    var reg3 = /&nbsp;/g;
    var reg4 = /&quot;/g;
    str = str.replace(reg1, "<").replace(reg2, ">").replace(reg3, " ").replace(reg4, '"');
    str = richText.go(richTextVideo.filterSource(str));
    return str;
}
