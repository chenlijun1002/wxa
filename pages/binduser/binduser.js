// pages/binduser/binduser.js
//绑定手机号
var util = require('../../utils/util.js');
var app = getApp();
var filter = app;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    haveUser: 'hide',
    newUser: 'show',
    isDisabled: false,
    second: '获取验证码',
    tel: '',
    code: '',
    password: '',
    toPassword: '',
    isShowToast: false,
    toastText: {}
  },
  seckillBind: false,
  reduceBind: false,
  activityId: '',
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    if (options.activityId) {
      this.seckillBind = true;
    }
    if (options.reduceActivityId) {
      this.reduceBind = true;
    }
  },
  onShow:function (){
      this.setData({
          isClose: wx.getStorageSync("isClose")
      })
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
  sendFormId: function (e) {
      app.sendFormId(e.detail.formId, 0);
  },
  bindImmediately: function () {
    let that = this;
    let code = that.data.code;
    let cellPhone = that.data.tel;
    let password = that.data.password;
    let toPassword = that.data.toPassword;
    if (!/^\d{4}$/.test(code)) {
      util.showToast(this, {
        text: '请输入正确的验证码！',
        duration: 2000
      })
      return;
    }
    wx.showLoading({
      title: '请稍后',
    });
    filter.request({
      url: '/Member/BindCellPhone',
      data: {
        cellPhone: cellPhone,
        msgCode: code,
        //password: password
      },
      success: (res) => {
        if (res.Code == 0) {
          wx.showToast({
            title: '绑定成功！',
            success: () => {
              //绑定成功逻辑，跳转什么的  
              //更新token和shopId
              wx.setStorageSync('memberToken', res.Data.memberToken);
              wx.setStorageSync('shopId', res.Data.shopId);
              wx.setStorageSync('forcebind', false);//绑定成功设置forceBind为false
              //绑定成功，跳转到秒杀页面
              if (that.seckillBind) {
                that.seckillBind = false;
                app.navigateTo('../seckilling/seckillingDetail/seckillingDetail?activityId=' + that.activityId, 'navigateTo');
              }
              if (that.reduceBind) {//降价团过来的
                that.reduceBind = false;
                wx.navigateBack({
                  delta: 1
                });
                return;
              }
              app.navigateTo('/pages/membercenter/membercenter', 'switchTab');
            }
          });
        } else {
          util.showToast(that, {
            text: '绑定失败，' + res.Msg,
            duration: 2000
          });
        }
      },
      complete: (res) => {
        wx.hideLoading();
      }
    });
  },
  telVerification: function () {
    var that = this;
    var cellPhone = that.data.tel;
    if (!/^1[2-9][0-9]{9}$/.test(cellPhone)) {
      util.showToast(that, {
        text: '请输入正确的手机号！',
        duration: 2000
      })
      return;
    }
    wx.showLoading({
      title: '请稍后',
    });
    filter.request({
      url: '/Member/IsCellPhoneUnbind',
      data: {
        cellPhone: cellPhone
      },
      success: (res) => {
        if (res.Code == 0) {
          if (res.Data) {
            that.setData({
              haveUser: 'show',
              newUser: 'hide'
            });
            that.getcode();//直接去获取验证码
          } else {
            util.showToast(that, {
              text: '该手机号已被绑定，请换其他手机号进行绑定！',
              duration: 2000
            })
          }
        }
      },
      complete: (res) => {
        wx.hideLoading();
      }
    });
  },
  code: function (e) {
    var codeVale = e.detail.value;
    this.setData({
      code: codeVale
    });
  },
  password: function (e) {
    var passwordVale = e.detail.value;
    this.setData({
      password: passwordVale
    });
  },
  toPassword: function (e) {
    var toPasswordVale = e.detail.value;
    this.setData({
      toPassword: toPasswordVale
    });
  },
  tel: function (e) {
    var telVale = e.detail.value;
    this.setData({
      tel: telVale
    });
  },
  getcode: function () {
    var that = this;
    var cellPhone = that.data.tel;
    wx.showLoading({
      title: '请稍后',
    });
    filter.request({
      url: '/Member/SendMsgCode',
      data: {
        cellPhone: cellPhone
      },
      success: (res) => {
        if (res.Code == 0) {
          var time = 120;
          var timer = null;
          that.setData({
            isDisabled: true,
            second: time + '秒'
          });
          timer = setInterval(function () {
            time--;
            if (time <= 0) {
              clearInterval(timer);
              that.setData({
                isDisabled: false,
                second: '获取验证码'
              });
            } else {
              that.setData({
                second: time + '秒'
              });
            }
          }, 1000);
        }
        if (res.Code == 100002) {
          util.showToast(that, {
            text: '商家短信已欠费',
            duration: 2000
          })
        }
      },
      complete: (res) => {
        wx.hideLoading();
      }
    });
  }
})