// pages/reduceauction/auctionfail/auctionfail.js
const app = getApp();
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
  onLoad: function (options) {
      
    const { pageStatus, state = -1, orderId } = options;
    let [imgSrc, toastText] = ['', '']
    if (pageStatus == 0) {
      imgSrc = 'http://file.xiaokeduo.com/system/xkdxcx/system/images/empty-data-9.png';
      toastText = '竞价商品同一个账号及用户只能竞价一次';
    } else if (pageStatus == 1 && state == 0) {
      imgSrc = 'http://file.xiaokeduo.com/system/xkdxcx/system/images/empty-data-11.png';
      toastText = '您来晚了一步，当前活动已结束~';
    } else if (pageStatus == 1 && state == 1) {
      imgSrc = 'http://file.xiaokeduo.com/system/xkdxcx/system/images/empty-data-12.png';
      toastText = '您晚了一步，由于库存不足，订单已取消~';
    } else if (pageStatus == 1 && state == 2) {
      imgSrc = 'http://file.xiaokeduo.com/system/xkdxcx/system/images/empty-data-12.png';
      toastText = '您晚了一步，由于库存不足，货款已原路返回~';
    } else if (pageStatus == 2) {
      imgSrc = 'http://file.xiaokeduo.com/system/xkdxcx/system/images/empty-data-10.png';
      toastText = '支付超时啦！订单已关闭~';
    }
    this.setData({
      orderId,
      pageStatus,
      emptyData: { imgSrc, toastText }
    })
    if (wx.getStorageSync('isLogin')) {
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
  onShow:function (){
      app.buttomCopyrightSetData(this, 'fixed','close');
  },
  sendFormId: function (e) {
      app.sendFormId(e.detail.formId, 0);
  }
})