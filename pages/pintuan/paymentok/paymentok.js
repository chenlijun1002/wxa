// pages/pintuan/paymentok/paymentok.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        copyright: {}
    },
    /**
     * 生命周期函数--监听页面加载
     */
    spellGroupId:'',
    orderId:'',
    onLoad: function (options) {
        this.orderId = options.orderId;
        if (!wx.getStorageSync('isLogin')) {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                this.initData();
            })
        } else {
          this.initData();
        }
    },
    onShow:function (){
        app.buttomCopyrightSetData(this,false,'close');
    },
    initData() {
      var that = this;
      app.request({
        url: '/Member/PaySuccess',
        requestDomain: 'ymf_domain',
        data: {
          orderId: that.orderId
        },
        success: function (data) {
          console.log(that.data)
          if (data.Code == 0) {
            data = data.Data;
            var short = data.recordData.GroupNumber - data.recordData.JoinNum;
            var orderState = short > 0 ? '已付款' : '待发货'
            that.spellGroupId = data.recordData.Id;
            that.setData({
              JoinMsg: data.JoinMsg,
              IsPayFail: data.IsPayFail,
              FailMsg: data.FailMsg,
              orderNumber: data.orderData.OrderId,
              orderState: orderState,
              groupId: data.recordData.Id,
              payPrice: data.orderData.PayMoney.toFixed(2),
              short: short
            })
          } else {
            wx.hideShareMenu()
          }
        }
      })
    },
    getuserinfo: function () {
      this.initData();
      this.setData({
        showAuthorization: false
      })
    },
    shareFriends:function (){
      app.navigateTo('/pages/pintuan/spellGroupDetail/spellGroupDetail?spellGroupId=' + this.data.groupId, 'redirectTo');
    },
    lookOrderDetail: function () {
        app.navigateTo('/pages/orderdetail/orderdetail?orderId=' + this.data.orderNumber, 'redirectTo');
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    }
})