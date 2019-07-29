// pages/setdetail/setdetail.js
//编辑用户信息
var app = getApp();
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowToast: false,
    toastText: {},
    copyright: {}
  },
  editType: null,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let editType = options.editType;
    this.editType = editType;
    this.setEditPage(editType);
    let editValue = options.editValue;
    this.setData({
      editValue: editValue
    });
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
  setEditPage(e) {
    switch (e) {
      case 'nickname':
        this.setData({
          editTitle: '昵称',
          editPlaceholder: '请输入昵称'
        });
        break;
      case 'realname':
        this.setData({
          editTitle: '真实姓名',
          editPlaceholder: '请输入真实姓名'
        });
        break;
      case 'qq':
        this.setData({
          editTitle: 'QQ号',
          editPlaceholder: '请输入QQ号'
        });
        break;
      case 'idcard':
        this.setData({
          editTitle: '身份证号码',
          editPlaceholder: '请输入身份证号码'
        });
        break;
      case 'address':
        this.setData({
          editTitle: '现住地址',
          editPlaceholder: '请输入现住地址'
        });
        break;
    }
  },
  /**
   * 输入
   */
  editInput(e) {
    this.setData({
      editValue: e.detail.value
    });
  },
  /**
   * 保存
   */
  editSave() {
    let Address = '';
    let CardID = '';
    let QQ = '';
    let RealName = '';
    let UserBindName = '';
    if (this.editType == null) {
      util.showToast(this, {
        text: '未知的修改类型！',
        duration: 2000
      });
      return;
    }
    if (this.editType == 'nickname') {
      UserBindName = this.data.editValue;
    }
    if (this.editType == 'realname') {
      RealName = this.data.editValue;
    }
    if (this.editType == 'qq') {
      QQ = this.data.editValue;
    }
    if (this.editType == 'idcard') {
      CardID = this.data.editValue;
    }
    if (this.editType == 'address') {
      Address = this.data.editValue;
    }
    let that = this;
    wx.showLoading({
      title: '请稍后...',
    });
    app.request({
      url: '/Member/EditMember',
      data: {
        Address,
        CardID,
        QQ,
        RealName,
        UserBindName
      },
      success(res) {
        if (res.Code == 0 && res.Data) {
          util.showToast(that, {
            text: '修改成功！',
            successIcon: true,
            duration: 2000,
            callBack() {
              wx.navigateBack({
                delta: 1
              });
              /* app.getUserInfo(function(){
                
              }); */
            }
          });
        } else {
          util.showToast(that, {
            text: '修改失败！' + res.Msg,
            duration: 2000
          });
        }
      },
      complete(res) {
        wx.hideLoading();
      }
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      app.buttomCopyrightSetData(this, 'fixed', 'close');
  }
})