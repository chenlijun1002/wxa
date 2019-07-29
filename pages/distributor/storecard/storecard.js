// pages/storecard/storecard.js
//掌柜名片
const app = getApp();
const util = require('../../../utils/util');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        posterUrl: '',
        loadComplete: false,
        isShowToast: false,
        toastText: {},
        emptyData: {
            imgSrc: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/empty-data-5.png',
            toastText: '暂未设置掌柜名片~'
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (wx.getStorageSync('isLogin')) {
            this.loadCard();
        } else {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                this.loadCard();
            })
        }
    },
    getuserinfo: function () {
        this.loadCard();
        this.setData({
            showAuthorization: false
        })
    },
    /**
     * 加载名片
     */
    loadCard() {
        let that = this;
        if (that.data.posterUrl) {
            wx.showLoading({
                title: '重新生成中',
            })
        }
        app.request({
            url: '/Distributor/GetStoreCard',
            data: {
                requestDomain: 'fxs_domain'
            },
            success: (res) => {
                if (res.Code == 0) {
                    that.setData({
                        posterUrl: res.Data
                    });
                } else {
                    util.showToast(that, {
                        text: '接口出错，' + res.Msg,
                        duration: 2000
                    });
                }
            },
            complete: (res) => {
                wx.hideLoading()
                that.setData({
                    loadComplete: true
                });
            }
        });
  },
  /**
   * 复制推广链接
   */
  loadCopy() {
    let that = this;
    wx.setClipboardData({
      data: "/pages/index/go?shopId=" + wx.getStorageSync('shopId'),
      success: function (res) {
        //wx.getClipboardData({
        // success: function (res) {
        //  }
        //})
      }
    });
  },
  /**
   * 保存到相册
   */
  saveToAlbum() {
    let that = this;
    wx.downloadFile({
      url: that.data.posterUrl, 
      success: function (res) {
        if (res.statusCode === 200) {
          let img = res.tempFilePath;
          wx.saveImageToPhotosAlbum({
            filePath: img,
            success(res) {
              util.showToast(that, {
                text: '保存成功',
                duration: 2000
              });
            },
            fail:function(err) {
              if (err.errMsg === "saveImageToPhotosAlbum:fail:auth denied" || err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
                // 这边微信做过调整，必须要在按钮中触发，因此需要在弹框回调中进行调用
                wx.showModal({
                  title: '提示',
                  content: '需要您授权保存相册',
                  showCancel: false,
                  success: modalSuccess => {
                    wx.openSetting({
                      success(settingdata) {
                        console.log("settingdata", settingdata)
                        if (settingdata.authSetting['scope.writePhotosAlbum']) {
                          wx.showModal({
                            title: '提示',
                            content: '获取权限成功,再次点击图片即可保存',
                            showCancel: false,
                          })
                        } else {
                          wx.showModal({
                            title: '提示',
                            content: '获取权限失败，将无法保存到相册哦~',
                            showCancel: false,
                          })
                        }
                      },
                      fail(failData) {
                        console.log("failData", failData)
                      },
                      complete(finishData) {
                        console.log("finishData", finishData)
                      }
                    })
                  }
                })
              }
            }
          });
        }
      }
    });
  },
    /**
     * 预览图片
     */
    preView() {
        let urls = [];
        urls.push(this.data.posterUrl);
        wx.previewImage({
            urls: urls
        });
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.setData({
            isClose: wx.getStorageSync("isClose")
        })
    },
  sendFormId: function (e) {
      app.sendFormId(e.detail.formId, 0);
  }
})