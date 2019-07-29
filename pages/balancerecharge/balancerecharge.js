//余额充值
var app = getApp();
var util = require("../../utils/util");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rechargeMoney: '',
    blur: '',
    money: 0,
    isShowToast: false,
    toastText: {},
    copyright: {}
  },
  bindKeyInput(e) {
    const val = e.detail.value;
    this.setData({
      rechargeMoney: val ? '￥' + e.detail.value : '',
      blur: val ? 'blur' : '',
      money: parseFloat(val)
    })
  },
  sendFormId: function (e) {
      app.sendFormId(e.detail.formId, 0);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      app.buttomCopyrightSetData(this, 'fixed', 'close');
      if (!wx.getStorageSync('isLogin')) {
          app.getUserInfo(() => {
              this.setData({
                  showAuthorization: true
              })
          })
      }else{
          if (this.data.showAuthorization) {
              this.setData({
                  showAuthorization: false
              })
          }
      }
  },
  getuserinfo: function () {
      this.setData({
          showAuthorization: false
      })
  },
  /**
   * 充值支付
   */
  doRecharge() {
    let amount = this.data.money;
    if (!/^([1-9][\d]{0,7}|0)(\.[\d]{1,2})?$/.test(amount)){
      util.showToast(this, {
        text: '请输入正确充值金额',
        duration: 2000
      });
      return;
    }
    wx.showLoading({
      title: '请稍后',
    });
    let that = this;
    app.request({
      url: '/Member/BalanceRecharge',
      data: {
        amount: amount
      },
      success: (res) => {
        if (res.Code == 0) {
          let payArgs = res.Data;
          wx.requestPayment({
            timeStamp: payArgs.TimeStamp,
            nonceStr: payArgs.NonceStr,
            package: payArgs.Package,
            signType: payArgs.SignType,
            paySign: payArgs.PaySign,
            success: function (payRes) {
              util.showToast(that, {
                text: '充值成功！',
                successIcon: true,
                duration: 2000,
                callBack: function () {
                  wx.navigateBack({
                    delta: 1
                  })
                }
              })
            },
            fail: function (failRes) {
              util.showToast(that, {
                text: '支付失败',
                duration: 2000
              });
            }
          });
        } else {
          util.showToast(that, {
            text: '无法获取支付配置！',
            duration: 2000
          });
        }
      },
      complete: (res) => {
        wx.hideLoading();
      }
    });
  }
})