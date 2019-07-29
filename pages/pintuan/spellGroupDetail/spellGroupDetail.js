// spellGroupDetail.js
var app = getApp();
var util = require('../../../utils/util.js');
Page({
    /**
     * 页面的初始数据
     */
    data: {
        isShowModal: false,//弹框显示
        loadComplete: false,
        spellSuccess: false,//拼团是否成功
        spellSuccessClass: "spellSuccess", //拼团人数未满用的class，拼团成功时，该值为空
        isMember: true,//团里是否有成员
        submission:false,//按钮是否点击请求中
        payMethod: 'wxPay',
        copyright: {}
    },
    /**
     * 生命周期函数--监听页面加载
     */
    spellGroupId:'',
    orderId:'',
    onLoad: function (options) {
        this.spellGroupId = options.spellGroupId;
        if (!wx.getStorageSync('isLogin')) {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                this.initData(this);
            })
        } else {
          this.initData(this);
        }
    },
    onShow:function (){
        app.buttomCopyrightSetData(this,'fixed');
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
    initData:function (that){
        app.request({
            url: '/SpellGroup/GetShareDetail',
            requestDomain: 'ymf_domain',
            data: {
                id: that.spellGroupId
            },
            success: function (data) {
                if (data.Code == 0) {
                    data = JSON.parse(data.Data);
                    that.orderId = data.orderId;
                    data.savePrice = (data.ProductOldPrice - data.GroupPrice).toFixed(2);
                    data.GroupPrice = data.GroupPrice.toFixed(2);
                    var dateTime = util.timeDifference(data.EndTime).split(':');
                    var moreUser = data.GroupNumber > 10;
                    var participantList = [];
                    var len = data.userInfo.length;
                    data.userInfo.forEach(function (item) {
                        item.CreateDate = item.CreateDate.replace('T', ' ')
                    })
                    if (data.GroupNumber == 10 || moreUser) {
                        if (len < 9) {
                            data.userInfo.forEach(function (item) {
                                participantList.push(item.userHead);
                            })
                            for (var i = 0; i < 9 - len; i++) {
                                participantList.push('http://file.xiaokeduo.com/system/xkdxcx/system/images/default-user-img.png');
                            }
                        } else {
                            if (data.GroupNumber == 10) {
                                data.userInfo.slice(0, 9).forEach(function (item) {
                                    participantList.push(item.userHead);
                                })
                            } else {
                                data.userInfo.slice(0, 8).forEach(function (item) {
                                    participantList.push(item.userHead);
                                })
                            }
                        }
                    } else {
                        data.userInfo.forEach(function (item) {
                            participantList.push(item.userHead);
                        })
                        if (data.GroupNumber != len + 1) {
                            var num = data.GroupNumber - (len + 1);
                            for (var i = 0; i < num; i++) {
                                participantList.push('http://file.xiaokeduo.com/system/xkdxcx/system/images/default-user-img.png');
                            }
                        }
                    }
                    data.Freight = data.Freight.toFixed(2);
                    data.SuccessDate = data.SuccessDate.replace('T',' ');
                    that.setData({
                        spellGroupInfo: data,
                        activityId: data.ActivityId,
                        moreUser: moreUser,
                        isMember: len > 0,
                        participantList: participantList,
                        createSpellGroupDate: data.CreateSpellGroupDate.replace('T', ' '),
                        dateTimeObj: {
                            hour: dateTime[0],
                            minute: dateTime[1],
                            second: dateTime[2]
                        },
                        loadComplete: true
                    })
                    if (data.orderStatu == 1 && data.spellGroupStatu == 0){
                        //获取账户余额
                        app.request({
                            url: '/Member/GetMemberInfo',
                            requestDomain: 'ymf_domain',
                            data: {},
                            success: function (data) {
                                if (data.Code == 0) {
                                    // 检查是否可以余额支付
                                    var balance = Number(data.Data.AvailableAmount);
                                    var amountPayable = Number(that.data.spellGroupInfo.GroupPrice);
                                    var isBalance = (balance >= amountPayable);
                                    that.setData({
                                        isBalance: isBalance,
                                        Balance: balance.toFixed(2)
                                    })
                                }
                            }
                        })
                    }
                    if (that.data.spellGroupInfo.spellGroupStatu == 1) {
                        that.setData({
                            spellSuccessClass: ''
                        })
                        that.spellGroupId=0;//如果团满了，分享出去的团id为0，再次开团
                    } else {
                        setInterval(function () {
                            var dateTime = util.timeDifference(data.EndTime).split(':');
                            that.setData({
                                dateTimeObj: {
                                    hour: dateTime[0],
                                    minute: dateTime[1],
                                    second: dateTime[2]
                                }
                            })
                        }, 1000)
                    }
                }
            }
        })
    },
    selectPayMethod: function (e) {
        this.setData({
            payMethod: e.target.dataset.paymethod
        })
    },
    showPayPopup() {
        this.setData({ payPopup: 'show' })
    },
    closePayPopup() {
        this.setData({ payPopup: '' })
    },
    selectPay: function () {
        this.showPayPopup();
    },
    cancelOrder:function (){
        //取消订单
        var that=this;
        var orderId = that.data.spellGroupInfo.orderId;
        that.setData({
            btnIsLoading: true
        })
        wx.showLoading({
            title: '取消订单中~',
        })
        app.request({
            url: '/Member/CloseOrder',
            requestDomain: 'ymf_domain',
            data: {
                orderId: orderId
            },
            success:function (data){
                if(data.Code==0){
                    // wx.redirectTo({
                    //     url: '/pages/pintuan/mySpellGroup/mySepllGroup?groupBack=1',
                    // })
                    app.navigateTo('/pages/pintuan/mySpellGroup/mySepllGroup?groupBack=1', 'redirectTo');
                }else{
                    util.showToast(that, {
                        text: data.Msg,
                        duration: 2000
                    });
                }
            },
            fail:function (){
                util.showToast(that, {
                    text: '取消订单失败',
                    duration: 2000
                });
            },
            complete: function () {
                wx.hideLoading();
                that.setData({
                    btnIsLoading: false
                });
            }
        })
    },
    lookOrderDetail:function (){
        // wx.redirectTo({
        //     url: '/pages/orderdetail/orderdetail?orderId=' + this.data.spellGroupInfo.XkdOrderId,
        // })
        app.navigateTo('/pages/orderdetail/orderdetail?orderId=' + this.data.spellGroupInfo.XkdOrderId, 'redirectTo');
    },
    goIndex:function (){
			var permissionsList = app.getPermissions();
      if (permissionsList.indexOf('xkd_wxaapp') < 0) {
        app.navigateTo('/pages/pintuan/index/index', 'switchTab');
        return;
      }else{
        app.navigateTo('/pages/pintuan/index/index', 'redirectTo');
      }
    },
    offeredGroup:function (){
        // wx.redirectTo({
        //     url: '/pages/pintuan/detail/detail?activityId=' + this.data.activityId + '&spellGroupRecordId=' + this.spellGroupId
        // })
        app.navigateTo('/pages/pintuan/detail/detail?activityId=' + this.data.activityId + '&spellGroupRecordId=' + this.spellGroupId, 'redirectTo');
    },
    openGroup:function (){
        // wx.redirectTo({
        //     url: '/pages/pintuan/detail/detail?activityId=' + this.data.activityId
        // })
        app.navigateTo('/pages/pintuan/detail/detail?activityId=' + this.data.activityId, 'redirectTo');
    },
    showModel:function (){
        this.setData({
            isShowModal:true
        })
    },
    hideModal:function (){
        this.setData({
            isShowModal: false
        })
    },
    balancePay:function (){
        var orderId = this.data.spellGroupInfo.orderId;
        var that = this;
        that.setData({
            btnIsLoading: true
        })
        wx.showLoading({
            title: '发起支付中~',
        })
        app.request({
            url: '/SpellGroup/BalancePayOrderPay',
            requestDomain: 'ymf_domain',
            data: {
                orderId: orderId
            },
            success:function (data){
                if(data.Code==0){
                    // wx.redirectTo({
                    //     url: '/pages/pintuan/paymentok/paymentok?orderId=' + orderId,
                    // })
                    app.navigateTo('/pages/pintuan/paymentok/paymentok?orderId=' + orderId, 'redirectTo');
                }else{
                    util.showToast(that, {
                        text: data.Msg,
                        duration: 2000
                    });
                }
                wx.hideLoading();
                that.setData({
                    btnIsLoading: false
                });
            },
            fail:function (){
                wx.hideLoading();
                that.setData({
                    btnIsLoading: false
                });
            }
        })
    },
    wxPay:function (){
        var orderId = this.data.spellGroupInfo.orderId;
        var that=this;
        that.setData({
            btnIsLoading:true
        })
        wx.showLoading({
            title: '发起支付中~',
        })
        app.request({
            url: '/SpellGroup/OrderPay',
            requestDomain: 'ymf_domain',
            data:{
                orderId: orderId
            },
            success:function (data){
                var payArgs = data;
                if (payArgs.Success) {
                    wx.requestPayment({
                        timeStamp: payArgs.TimeStamp,
                        nonceStr: payArgs.NonceStr,
                        package: payArgs.Package,
                        signType: payArgs.SignType,
                        paySign: payArgs.PaySign,
                        success: function (payRes) {
                            // 支付成功
                            // wx.redirectTo({
                            //     url: '/pages/pintuan/paymentok/paymentok?orderId=' + orderId,
                            // })
                            app.navigateTo('/pages/pintuan/paymentok/paymentok?orderId=' + orderId, 'redirectTo');
                        },
                        fail: function (failRes) {
                            util.showToast(that, {
                                text: '支付失败',
                                duration: 2000
                            });
                        },
                        complete: function () {
                            wx.hideLoading();
                            that.setData({
                                btnIsLoading: false
                            });
                        }
                    });
                } else {
                    wx.hideLoading();
                    that.setData({
                        btnIsLoading: false
                    });
                    util.showToast(that, {
                        text: '无法获取支付配置',
                        duration: 2000
                    });
                }
            }
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        var that = this;
        var siteName = "【" + that.data.spellGroupInfo.ActivityTag + '】' + that.data.spellGroupInfo.ProductName;
        var shopId = wx.getStorageSync('shopId');
        if (that.spellGroupId == 0) {
          var path = '/pages/pintuan/detail/detail?activityId=' + that.data.activityId;
        } else {
          var path = '/pages/pintuan/spellGroupDetail/spellGroupDetail?spellGroupId=' + that.spellGroupId + '&shopId=' + shopId;
        }
        return {
            title: siteName,
            path:path,
            success: function (res) {
                console.log('转发成功，shopId:' + shopId);
                // 转发成功
            },
            fail: function (res) {
                console.log('转发失败，shopId:' + shopId)
                // 转发失败
            }
        }
    }
})