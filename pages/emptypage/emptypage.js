// pages/emptypage/emptypage.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    emptyData: {
      imgSrc: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/empty-data-8.png',
      toastText: '代理商暂不能进入分销中心~'
    },
    copyright: {}
  },
  backMemberCenter() {
    // wx.switchTab({
    //   url: '/pages/membercenter/membercenter',
    // })
    app.navigateTo('/pages/membercenter/membercenter', 'switchTab');
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      if (!wx.getStorageSync('isLogin')) {
          app.getUserInfo(() => {
              this.setData({
                  showAuthorization: true
              })
          })
      }
  },
  getuserinfo: function () {
      this.setData({
          showAuthorization: false
      })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      app.buttomCopyrightSetData(this, 'fixed');
  },
  sendFormId: function (e) {
      app.sendFormId(e.detail.formId, 0);
  }
})