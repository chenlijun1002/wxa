// pages/shopcart/shopcart.js
//购物车
var app = getApp();
var filter = app;
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    interfaceOkCount: 0,
    totalCheckLength: 0,
    shopcartOrderList: [],
    isShowToast: false,
    loadComplete: false,
    toastText: {}
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
          isClose: wx.getStorageSync("isClose")
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {//逻辑写在此处
    var that = this;
    that.setData({
      //loadComplete: false,
      interfaceOkCount: 0
    })
    if (wx.getStorageSync('isLogin')) {
        if (this.data.showAuthorization){
            this.setData({
                showAuthorization: false
            })
        }
        that.initData(that);
    } else {
        app.getUserInfo(() => {
            this.setData({
                showAuthorization: true
            })
        }, () => {
            that.initData(that);
        })
    }
  },
  getuserinfo: function () {
      this.initData(this);
      this.setData({
          showAuthorization: false
      })
  },
  initData: function (that){
      filter.request({
          url: '/ShopCart/GetShoppingCartList',
          data: {
              selectIds: ''
          },
          success: function (res) {
              if (res.Code == 0) {
                  var interfaceCount = that.data.interfaceOkCount;
                  var shopcartOrderList = res.Data;
                  var totalCheckLength = 0;
                  var totalMoney = 0;
                  //给数据加上页面效果所需要的状态
                  var indexArr = [];//需要删除的数组索引集
                  var cartIndexArr = [];
                  shopcartOrderList.forEach(function (item, index) {
                      item.checked = '';
                      item.ShoppingCarts.forEach(function (sitem, sindex) {
                          sitem.checked = '';
                          sitem.moveLeft = 0;
                          if (sitem.Product.ProductSKUs.length > 0) {
                              sitem.Product.ProductSKUs.forEach(function (pitem, pindex) {
                                  if (pitem.SkuId == sitem.SkuId) {
                                      //sitem.skuImgUrl = item.SkuImgUrl;//规格图片
                                      sitem.skuPrice = pitem.SalePrice.toFixed(2);
                                      sitem.skuContent = '';
                                      if (pitem.Stock > 0) {
                                          sitem.stock = pitem.Stock;
                                      } else {
                                          indexArr.push(sindex);
                                          //item.ShoppingCarts.splice(sindex,1);
                                      }
                                      pitem.ProductSKU_Propertys.forEach(function (item1) {
                                          sitem.skuContent += item1.PName + '：' + item1.VName + '，'
                                      });
                                      sitem.skuContent = sitem.skuContent.substring(0, sitem.skuContent.length - 1);
                                  }
                              });
                          }
                      });
                      for (var i = indexArr.length - 1; i >= 0; i--) {
                          item.ShoppingCarts.splice(indexArr[i], 1);
                      }
                      if (item.ShoppingCarts.length <= 0) {
                          cartIndexArr.push(index);
                          //shopcartOrderList.splice(index, 1);
                      }
                  });
                  for (var i = cartIndexArr.length - 1; i >= 0; i--) {
                      shopcartOrderList.splice(cartIndexArr[i], 1);
                  }
                  that.setData({
                      interfaceOkCount: interfaceCount + 1,
                      allChecked: '',//全选状态
                      totalMoney: totalMoney.toFixed(2),
                      totalCheckLength: totalCheckLength,
                      shopcartOrderList: shopcartOrderList
                  });
                  // util.contentShow(that, that.data.interfaceOkCount, 1);
              } else {
                  util.showToast(that, {
                      text: '购物车数据加载失败！',
                      duration: 2000
                  });
              }
          },
          complete: function () {
              that.setData({ loadComplete: true });
          }
      });
  },
  /*订单前面的选中按钮*/
  shopOrderCheck: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var shopcartOrderList = that.data.shopcartOrderList;
    var oldCheck = shopcartOrderList[index].checked;
    if (oldCheck == 'checked') {//选中改不选
      shopcartOrderList[index].checked = '';
      //更改子集状态为不选
      shopcartOrderList[index].ShoppingCarts.forEach(function (sitem, sindex) {
        sitem.checked = '';
      });
    } else {//不选改选中
      shopcartOrderList[index].checked = 'checked';
      //更改子集状态为选中
      shopcartOrderList[index].ShoppingCarts.forEach(function (sitem, sindex) {
        sitem.checked = 'checked';
      });
    }
    that.setData({
      shopcartOrderList: shopcartOrderList
    });
    that.checkAll();
  },
  /*购物车项前面的选中按钮*/
  shopItemCheck: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var pindex = e.currentTarget.dataset.pindex;
    var shopcartOrderList = that.data.shopcartOrderList;
    var oldCheck = shopcartOrderList[pindex].ShoppingCarts[index].checked;
    if (oldCheck == 'checked') {//选中改不选
      shopcartOrderList[pindex].ShoppingCarts[index].checked = '';
    } else {//不选改选中
      shopcartOrderList[pindex].ShoppingCarts[index].checked = 'checked';
    }
    that.setData({
      shopcartOrderList: shopcartOrderList
    });
    that.checkAll();
  },
  /*全选按钮*/
  allCheck: function () {
    var that = this;
    var shopcartOrderList = that.data.shopcartOrderList;
    var oldCheck = that.data.allChecked;
    var newCheck = that.data.allChecked;
    if (oldCheck == 'checked') {//选中改不选
      newCheck = '';
      shopcartOrderList.forEach(function (item, index) {
        item.checked = '';
        item.ShoppingCarts.forEach(function (sitem, sindex) {
          sitem.checked = '';
        });
      });
    } else {//不选改选中
      newCheck = 'checked';
      shopcartOrderList.forEach(function (item, index) {
        item.checked = 'checked';
        item.ShoppingCarts.forEach(function (sitem, sindex) {
          sitem.checked = 'checked';
        });
      });
    }
    that.setData({
      allChecked: newCheck,
      shopcartOrderList: shopcartOrderList
    });
    that.checkAll();
  },
  /*每次选中按钮点击后在setData之后调用，判断订单是否全选以及是否全选，并计算合计金额*/
  checkAll: function () {
    var that = this;
    var shopcartOrderList = that.data.shopcartOrderList;
    var orderCheckLength = 0;
    var newCheck = that.data.allChecked;
    var totalCheckLength = 0;
    var totalMoney = 0;
    shopcartOrderList.forEach(function (item, index) {
      var itemCheckLength = 0;
      item.ShoppingCarts.forEach(function (sitem, sindex) {
        if (sitem.checked == 'checked') {
          itemCheckLength++;
          totalCheckLength++;
          //计算合计金额
          totalMoney += parseFloat(sitem.skuPrice) * sitem.Quantity;
        }
      });
      if (item.ShoppingCarts.length == itemCheckLength) {
        item.checked = 'checked';
      } else {
        item.checked = '';
      }
      if (item.checked == 'checked') {
        orderCheckLength++;
      }
    });
    if (shopcartOrderList.length == orderCheckLength) {
      newCheck = 'checked';
    } else {
      newCheck = '';
    }
    that.setData({
      allChecked: newCheck,
      totalMoney: totalMoney.toFixed(2),
      totalCheckLength: totalCheckLength,
      shopcartOrderList: shopcartOrderList
    });
  },
  addNum: function (e) {
    var that = this;
    var shopcartId = e.currentTarget.dataset.shopcartid;
    var index = e.currentTarget.dataset.index;
    var pindex = e.currentTarget.dataset.pindex;
    var shopcartOrderList = that.data.shopcartOrderList;
    var oldNum = parseInt(shopcartOrderList[pindex].ShoppingCarts[index].Quantity);
    var newNum = oldNum + 1;
    wx.showLoading({
      title: '提交中',
    });
    filter.request({
      url: '/ShopCart/ChageCartProductQuantity',
      data: {
        id: shopcartId,
        number: newNum
      },
      success: function (res) {
        if (res.Code == 0) {
          shopcartOrderList[pindex].ShoppingCarts[index].Quantity = newNum;
          shopcartOrderList[pindex].ShoppingCarts[index].stock = res.Data;
          that.setData({
            shopcartOrderList: shopcartOrderList
          });
          that.checkAll();
        }
      },
      complete: function (res) {
        wx.hideLoading();
      }
    });
  },
  minusNum: function (e) {
    var that = this;
    var shopcartId = e.currentTarget.dataset.shopcartid;
    var index = e.currentTarget.dataset.index;
    var pindex = e.currentTarget.dataset.pindex;
    var shopcartOrderList = that.data.shopcartOrderList;
    var oldNum = parseInt(shopcartOrderList[pindex].ShoppingCarts[index].Quantity);
    var newNum = oldNum - 1;
    if (newNum == 0) {
      newNum = 1;
    }
    wx.showLoading({
      title: '提交中',
    });
    filter.request({
      url: '/ShopCart/ChageCartProductQuantity',
      data: {
        id: shopcartId,
        number: newNum
      },
      success: function (res) {
        if (res.Code == 0) {
          shopcartOrderList[pindex].ShoppingCarts[index].Quantity = newNum;
          shopcartOrderList[pindex].ShoppingCarts[index].stock = res.Data;
          that.setData({
            shopcartOrderList: shopcartOrderList
          });
          that.checkAll();
        }
      },
      complete: function (res) {
        wx.hideLoading();
      }
    });
  },
  changeCount: function (e) {
    var that = this;
    var shopcartId = e.currentTarget.dataset.shopcartid;
    var index = e.currentTarget.dataset.index;
    var pindex = e.currentTarget.dataset.pindex;
    var shopcartOrderList = that.data.shopcartOrderList;
    var oldNum = parseInt(shopcartOrderList[pindex].ShoppingCarts[index].Quantity);
    var newNum = parseInt(e.detail.value);
    if (newNum <= 0) {
      newNum = 1;
    }
    wx.showLoading({
      title: '提交中',
    });
    filter.request({
      url: '/ShopCart/ChageCartProductQuantity',
      data: {
        id: shopcartId,
        number: newNum
      },
      success: function (res) {
        if (res.Code == 0) {
          shopcartOrderList[pindex].ShoppingCarts[index].Quantity = newNum;
          shopcartOrderList[pindex].ShoppingCarts[index].stock = res.Data;
          that.setData({
            shopcartOrderList: shopcartOrderList
          });
          that.checkAll();
        }
      },
      complete: function (res) {
        wx.hideLoading();
      }
    });
  },
  deleteCart: function (e) {//删除购物车的项 
    var that = this;
    var shopcartId = e.currentTarget.dataset.shopcartid;
    var index = e.currentTarget.dataset.index;
    var pindex = e.currentTarget.dataset.pindex;
    var shopcartOrderList = that.data.shopcartOrderList;
    wx.showModal({
      title: '提示',
      content: '是否确认删除此商品',
      success: function (res) {
        if (res.confirm) {
          filter.request({
            url: '/ShopCart/DeleteCartProduct',
            data: {
              id: shopcartId
            },
            success: function (delRes) {
              if (delRes.Code == 0) {
                //删除成功的操作从数组中删除然后setData
                shopcartOrderList[pindex].ShoppingCarts.splice(index, 1);
                if (shopcartOrderList[pindex].ShoppingCarts.length == 0) {
                  shopcartOrderList.splice(pindex, 1);
                }
                that.setData({
                  shopcartOrderList: shopcartOrderList
                });
                that.checkAll();
              }
            }
          });
        } else if (res.cancel) {

        }
      }
    })
  },
  balanceCart: function () {
    var that = this;
    if (that.data.totalCheckLength <= 0) {//没有选中的时候点结算不处理
      return;
    }
    var shopcartOrderList = that.data.shopcartOrderList;
    var selectIds = '';
    shopcartOrderList.forEach(function (item, index) {
      item.ShoppingCarts.forEach(function (sitem, sindex) {
        if (sitem.Quantity > sitem.stock) {
          //sitem.Quantity = sitem.stock;
          util.showToast(that, {
            text: sitem.Product.ProductName + '库存不足！',
            duration: 2000
          });
          return;
        }
        if (sitem.checked == 'checked') {
          selectIds += sitem.Id + ','
        }
      });
    });
    if (selectIds.length > 0) {
      selectIds = selectIds.substring(0, selectIds.length - 1);
    }
    // wx.navigateTo({
    //   url: '../confirmorder/confirmorder?type=shopcart&selectIds=' + selectIds,
    // })
    app.navigateTo('../confirmorder/confirmorder?type=shopcart&selectIds=' + selectIds, 'navigateTo');
  },
  touchstart: function (e) {
    this.touchCoordinate.moveX = 0;
    this.touchCoordinate.startX = e.touches[0].pageX;
  },
  touchmove: function (e) {
    this.touchCoordinate.moveX = e.touches[0].pageX;
  },
  touchend: function (e) {
    var index = e.currentTarget.dataset.index;
    var pindex = e.currentTarget.dataset.pindex;
    var moveX = this.touchCoordinate.moveX - this.touchCoordinate.startX;
    if (Math.abs(moveX) > 20 && Math.abs(this.touchCoordinate.moveX) > 20) {
      var moveLeft = 0;
      moveLeft = moveX < 0 ? -120 : moveLeft;
      var shopcartOrderList = this.data.shopcartOrderList;
      shopcartOrderList[pindex].ShoppingCarts[index].moveLeft = moveLeft;
      this.setData({
        shopcartOrderList: shopcartOrderList
      })
    }
  },
  touchCoordinate: {
    startX: 0,
    moveX: 0,
    startTime: 0
  }
})