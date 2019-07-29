// pages/coupon/coupon.js
var config = require("../../utils/config.js");
var app = getApp();

Page({
  data: {
  },
  viewTap: function () {
    this.setData({
      text: 'Set some data for updating view.'
    })
  },
  customData: {
    hi: 'MINA'
  }
})