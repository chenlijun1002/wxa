// pages/userset/userset.js
//用户设置
var app = getApp();
var util = require('../../utils/util.js');
var filter = app;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    memberInfo: {},
    isShowToast: false,
    toastText: {},
    copyright: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      
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
      app.buttomCopyrightSetData(this, 'fixed');
    this.getMember();
  },
  sendFormId: function (e) {
      app.sendFormId(e.detail.formId, 0);
  },
  getMember: function () {
    let that = this;
    wx.showLoading({
      title: '请稍后',
    });
    filter.request({
      url: '/Member/GetMemberInfo',
      data: {},
      success: (res) => {
        if (res.Code == 0) {
          that.setData({
            memberInfo: res.Data
          });
        } else {
          util.showToast(this, {
            text: '获取用户信息失败,' + res.Msg,
            duration: 2000
          });
        }
      },
      complete: (res) => {
        wx.hideLoading();
      }
    });
  },
  /*去绑定手机号*/
  bindCellPhone: function () {
    let cellPhone = this.data.memberInfo.CellPhone;
    if (!cellPhone) {
      // wx.navigateTo({
      //   url: '../binduser/binduser',
      // });
      app.navigateTo('../binduser/binduser', 'navigateTo');
    }
  },
  /*编辑某项设置*/
  editDetail: function (e) {
    let editType = e.currentTarget.dataset.type;
    let editValue = e.currentTarget.dataset.editvalue;
    // wx.navigateTo({
    //   url: `/pages/setdetail/setdetail?editType=${editType}&editValue=${editValue}`
    // });
    app.navigateTo(`/pages/setdetail/setdetail?editType=${editType}&editValue=${editValue}`, 'navigateTo');
  },
  /**
   * 编辑头像
   */
  editHeadImg(e) {
    let that = this;
    wx.chooseImage({
      count: 1,
      success: function (res) {
        const headSrc = res.tempFilePaths[0];
        wx.showLoading({
          title: '上传中'
        });
        app.request({
          url: '/Member/UploadHeadImg',
          contentType: 'multipart/form-data',
          requestType: 'upload',
          filePath: headSrc,
          fileName: '用户头像',
          success(pRes) {
            let resObj = JSON.parse(pRes);
            //console.log(res);
            if (resObj.Code === 0) {
              app.request({
                url: '/Member/EditMember',
                data: {
                  Address: '',
                  CardID: '',
                  QQ: '',
                  RealName: '',
                  UserBindName: '',
                  UserHead: resObj.Data
                },
                success(tRes) {
                  if (tRes.Code == 0 && tRes.Data) {
                    util.showToast(that, {
                      text: '修改成功！',
                      successIcon: true,
                      duration: 2000,
                      callBack(){
                        let memberInfo = that.data.memberInfo;
                        memberInfo.UserHead = resObj.Data;
                        that.setData({
                          memberInfo: memberInfo
                        });
                      }
                    });
                  } else {
                    util.showToast(that, {
                      text: '修改失败！' + tRes.Msg,
                      duration: 2000
                    });
                  }
                }
              });
            } else {
              util.showToast(that, {
                text: '上传失败' + res.Msg,
                duration: 2000
              })
            }
          },
          complete(pRes) {
            wx.hideLoading();
          }
        })
      }
    })
  },
  /*退出登录*/
  // exit: function () {
  //   wx.showModal({
  //     title: '提示',
  //     content: '是否退出当前账号的登录状态',
  //     success: (res)=> {
  //       if (res.confirm) {
  //         app.memberQuit();
  //         wx.switchTab({
  //           url: '../index/index',
  //         });
  //       } else if (res.cancel) {

  //       }
  //     }
  //   });
  // },
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