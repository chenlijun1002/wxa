// pages/transitionpage/transitionpage.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
          isClose: wx.getStorageSync("isClose")
      })
    var sscene = decodeURIComponent(options.scene);//"vw_p_coupon-12";// 
    if (sscene.startsWith('vw_p_pd-')) {
      var topage = "/pages/detail/detail?productId=" + sscene.substring(8);
      //console.log("页面地址:" + topage);
      // wx.redirectTo({
      //   url: topage
      // });
      app.navigateTo(topage, 'redirectTo');
    } else if (sscene.startsWith('vw_p_coupon-')) {
      var topage = "/pages/mycoupon/mycoupon?t=" + sscene.substring(12);
      //console.log("页面地址:" + topage);
      // wx.redirectTo({
      //   url: topage
      // });
      app.navigateTo(topage, 'redirectTo');
    }   
  },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
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
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  }
})