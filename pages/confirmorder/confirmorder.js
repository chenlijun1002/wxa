// pages/confirmorder/confirmorder.js
//确认订单
var app = getApp();
var filter = app;
var util = require('../../utils/util.js');
const Xkd = require('../../template/switch/switch');
Page(Object.assign({}, Xkd, {
  /**
   * 页面的初始数据
   */
  data: {
    itemp:0,
    isDel: 0,
    PointsEnable: true,
    interfaceOkCount: 0,
    regionInfo: {
      regionMemberName: '游客',
      regionProvince: '',
      regionCity: '',
      regionCounty: '',
      regionStreet: '',
      regionAddress: '',
      regionCellPhone: '',
      regionId: 0,
      id: 0
    },
    isSelectedAddress: false,
    isAuthAddress: false,
    isCreateOrder: false,
    btnIsLoading: false,
    isPopupShow: 'hide',
    isDiscountShow: 'hide',
    isShowToast: false,
    showCoupon: true, //显示优惠券
    couponList: [], //优惠券列表,立即购买时的
    totalCouponDiscount: '0.00', //总的优惠券优惠金额
    totalPointDiscount: '0.00', //总的积分抵扣金额
    payPointToCash: 0, //支付时的积分抵扣
    payBalance: 0, //支付时的余额
    orderConfig: { //下单参数
      Balance: 0, //可用的余额
      CanMaxAmount: 0, //最高可抵现金额
      EnableBalance: false, //是否开启余额付款
      IsAgent: false, //是否为代理商
      MaxUsedPoints: 0, //最高可用积分
      PointToCash: 0, //积分兑现金额
      PointsEnable: false, //积分抵现是否可用
      Rate: 0 //兑现比例
    },
    payText: '微信支付',
    toastText: {},
    deliveryList: [],
    discountList: [],
    discountId: 0,
    totalDiscount: (0).toFixed(2),
    pointsSwitch: {
      checked: false
    },
    balanceSwitch: {
      checked: false
    },
    showCouponPopup: '',
    discountPoint: 0,
    returnPoint: 0,
    remarkValue: '',
    remarkList: [],
    copyright: {},
    isDistributionModalShow: 'hide',
    distributionMode: 0, //配送方式 1为物流配送 2为上门自提 3为同城配送
    isSelectedDistribution: false, //是否选择了三种配送方式中的一种
    IsExpress: false,
    PickUp: {
      IsPickup: false,
      EnablePickUp: false
    },
    CityDistribution: {},
    currentPickup: {
      Id: -1
    },
    currentCarOrderTemplateId: -10, //当前操作的购物车订单TemplateId
    currentCarOrderIndex: -10, //当前操作的购物车订单index
    addressInCitydistribution: false, //是否在同城配送范围内
    notStartPrice: false //是否在同城配送范围内
  },
  options: null,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // this.isDel();
    var that = this;
    this.options = options;
    this.setData({
      isCreateOrder: false, //清掉创建订单标识
      // 切换地址后 重置配送方式选择
      distributionMode: 0,
      isSelectedDistribution: false,
      currentPickup: {
        Id: -1
      },
      notStartPrice: false
    });
    
		{
      //判断是否登陆未登录则跳转
      if (!wx.getStorageSync('isLogin')) {
        app.navigateTo('/pages/index/index', 'redirectTo');
        return;
      }
      var that = this;
      /*获取页面参数*/
      var pageType = options.type; //区分立即购买或者购物车下单
      //获取默认收货地址放到onShow里面了
      if (pageType == 'submitbuy') { //立即购买的
        var productId = options.productId;
        var skuId = options.skuId;
        var selectedCount = options.selectedCount;
        var isTimeLimit = options.isTimeLimit; //是否是限时折扣的
        if (options.shippingId == undefined) return;
        filter.request({
          url: '/Detail/GetProductDetail',
          data: {
            productId: productId,
            skuId: skuId,
            shippingId: options.shippingId ? options.shippingId : ''
          },
          success: function(res) {
            if (res.Code == 0) {
              var interfaceCount = that.data.interfaceOkCount;
              var productInfo = res.Data;
              var productImgUrl = productInfo.ImageUrls[0];
              var productSkuInfo = '';
              var productStock = 0;
              var productSalePrice = productInfo.MarketPrice;
              var freight = 0; //正式数据要去请求接口获取哦

              if (productInfo.ProductSKU.length > 0) {
                productInfo.ProductSKU.forEach(function(item) {
                  if (item.SkuId == skuId) {
                    productImgUrl = item.SkuImgUrl;
                    productSalePrice = item.SalePrice.toFixed(2);
                    // productStock = item.Stock;
                    productStock = productInfo.Stock;
                    item.ProductSKU_Propertys.forEach(function(item1) {
                      productSkuInfo += item1.PName + '：' + item1.VName + '，'
                    });
                  }
                });
                productSkuInfo = productSkuInfo.substring(0, productSkuInfo.length - 1);
              }
              //判断如果是限时抢购的商品修改productSalePrice，限时抢购的不能使用优惠券。以下均放在接口回调中处理
              if (isTimeLimit == 1) {
                filter.request({
                  url: '/Detail/GetTimeLimitDiscount',
                  data: {
                    productId: productId
                  },
                  success(limitRes) {
                    if (limitRes.Code == 0) {
                      productSalePrice = limitRes.Data.ActivityPrice
                      that.setData({
                        PointsEnable: limitRes.Data.PointsEnable
                      })                     
                    } else {
                      util.showToast(that, {
                        text: '获取限时折扣信息接口出错！',
                        duration: 2000
                      });
                    }
                  },
                  complete(limitRes) {
                    that.setData({
                      productSalePrice: productSalePrice,
                      showCoupon: true
                    });
                    //获取下单参数
                    that.getOrderConfig(function() {
                      that.getLimitDiscountCoupons(productSalePrice, '', 0, productId, selectedCount, skuId, 0, function() {
                        that.setData({
                          isTimeLimit: isTimeLimit,
                          pageType: pageType,
                          interfaceOkCount: interfaceCount + 1,
                          productId: productId,
                          skuId: skuId,
                          selectedCount: selectedCount,
                          productInfo: productInfo,
                          productStock: productStock,
                          productImgUrl: productImgUrl,
                          productSkuInfo: productSkuInfo,
                          productSalePrice: productSalePrice,
                          productTotal: (parseFloat(productSalePrice) * selectedCount).toFixed(2),
                          freight: freight.toFixed(2),
                          templateId: productInfo.FreightTemplateId,
                          shipText: '请选择配送方式',
                          shipValue: 0,
                          totalPrice: (parseFloat(productSalePrice) * selectedCount + freight).toFixed(2)
                        });
                        that.setData({
                          loadComplete: true
                        });
                        //优惠活动
                        that.getLimitfullMins(selectedCount, productId, that.data.productTotal, 0, 0, function() {
                          //完事后调方法计算总减价金额
                          that.calcDiscount();
                        });
                      });

                    });
                  }
                });
              } else { //非限时抢购
                //获取下单参数
                //获取优惠券信息
                that.getOrderConfig(function() {
                  that.getCoupons(pageType, productSalePrice, '', 0, productId, selectedCount, skuId, 0, function() {
                    that.setData({
                      isTimeLimit: isTimeLimit,
                      pageType: pageType,
                      interfaceOkCount: interfaceCount + 1,
                      productId: productId,
                      skuId: skuId,
                      selectedCount: selectedCount,
                      productInfo: productInfo,
                      productStock: productStock,
                      productImgUrl: productImgUrl,
                      productSkuInfo: productSkuInfo,
                      productSalePrice: productSalePrice,
                      productTotal: (parseFloat(productSalePrice) * selectedCount).toFixed(2),
                      freight: freight.toFixed(2),
                      templateId: productInfo.FreightTemplateId,
                      shipText: '请选择配送方式',
                      shipValue: 0,
                      totalPrice: (parseFloat(productSalePrice) * selectedCount + freight).toFixed(2)
                    });
                    // util.contentShow(that, that.data.interfaceOkCount, 1);
                    that.setData({
                      loadComplete: true
                    });
                    //优惠活动
                    that.getDiscount(selectedCount + '', productId, that.data.productTotal, '', 0, function() {
                      //完事后调方法计算总减价金额
                      that.calcDiscount();
                    });
                  });
                });
              }
            }
          }
        });
      } else { //购物车过来的
        var selectIds = options.selectIds;
        if (options.shippingId == undefined) return;
        filter.request({
          url: '/ShopCart/GetShoppingCartList',
          data: {
            selectIds: selectIds,
            shippingId: options.shippingId ? options.shippingId : ''
          },
          success: function(res) {
            if (res.Code == 0) {
              var interfaceCount = that.data.interfaceOkCount;
              var orderList = res.Data;
              var productTotal = 0;
              var freight = 0;
              var totalPrice = 0;
              orderList.forEach(function(item, index) {
                item.shipText = '请选择配送方式';
                item.shipValue = 0;
                item.discountText = ''; //满减显示的文字
                item.discountInfoList = []; //满减活动列表
                item.discountId = 0;
                item.discountMoney = 0;
                item.freight = 0; //运费
                item.notStartPrice = false //上门自提没有达到起送价
                item.ShoppingCarts.forEach(function(sitem, sindex) {
                  if (sitem.Quantity > sitem.stock) {
                    util.showToast(that, {
                      text: sitem.Product.ProductName + '库存不足！',
                      duration: 2000
                    });
                    return;
                  }
                  if (sitem.Product.ProductSKUs.length > 0) {
                    sitem.Product.ProductSKUs.forEach(function(pitem) {
                      if (pitem.SkuId == sitem.SkuId) {
                        //sitem.skuImgUrl = item.SkuImgUrl;//规格图片
                        sitem.stock = pitem.Stock;
                        sitem.skuPrice = pitem.SalePrice.toFixed(2);
                        productTotal += pitem.SalePrice * sitem.Quantity;
                        item.productTotal = productTotal;
                        sitem.skuContent = '';
                        pitem.ProductSKU_Propertys.forEach(function(item1) {
                          sitem.skuContent += item1.PName + '：' + item1.VName + '，'
                        });
                        sitem.skuContent = sitem.skuContent.substring(0, sitem.skuContent.length - 1);
                      }
                    });
                  }
                });
              });
              that.setData({
                selectIds: selectIds,
                pageType: pageType,
                interfaceOkCount: interfaceCount + 1,
                orderList: orderList,
                productTotal: productTotal.toFixed(2),
                freight: freight.toFixed(2),
                totalPrice: (productTotal + freight).toFixed(2)
              });
              // util.contentShow(that, that.data.interfaceOkCount, 1);
              that.setData({
                orderCountNum: 0
              });
              that.getOrderConfig(function() {
                //优惠活动
                orderList.forEach(function(oitem, oindex) {
                  var nums = '';
                  var pids = '';
                  var prices = '';
                  var preIds = '';
                  var cartIds = '';
                  oitem.ShoppingCarts.forEach(function(sitem, sindex) {
                    pids += sitem.ProductId + ',';
                    nums += sitem.Quantity + ',';
                    prices += sitem.Quantity * parseFloat(sitem.skuPrice) + ',';
                    cartIds += sitem.Id + ',';
                  });
                  pids = pids.substring(0, pids.length - 1);
                  nums = nums.substring(0, nums.length - 1);
                  prices = prices.substring(0, prices.length - 1);
                  cartIds = cartIds.substring(0, cartIds.length - 1);
                  oitem.productTotal = prices;
                  that.getCoupons(pageType, prices, cartIds, 0, pids, 0, '', oindex, function() {
                    that.getDiscount(nums, pids, prices, preIds, oindex, function() {
                      var orderCountNum = that.data.orderCountNum;
                      that.setData({
                        orderCountNum: orderCountNum + 1
                      });
                      if (that.data.orderCountNum == orderList.length) {
                        that.calcDiscount();
                      }
                    });
                  })
                });
              });
            }
          },
          complete() {
            that.setData({
              loadComplete: true
            });
          }
        });

      }
    }
  },
  onShow: function() {
    app.getUserInfo(function () { }, function () {
      that.setData({
        isDel: wx.getStorageSync("isDel")
      })
    })
    app.buttomCopyrightSetData(this, false, 'close');
    this.setData({
      isProbationShop: wx.getStorageSync("storeType"),
      SupplyShip: wx.getStorageSync("SupplyShip")
    })
    var forceBind = wx.getStorageSync('forceBind');
    if (forceBind) {
      app.navigateTo('../binduser/binduser', 'redirectTo');
      return;
    }
    /*获取地址信息*/
    var that = this;
    filter.request({
      url: '/MemberAddress/GetDefaultAddress',
      data: {},
      success: function(res) {
        if (res.Code == 0 && res.Data != null) {
          that.setData({
            isSelectedAddress: true,
            isAuthAddress: true,
            regionInfo: {
              regionProvince: res.Data.Province,
              regionCity: res.Data.City,
              regionCityId: res.Data.CityId,
              regionCounty: res.Data.County,
              regionStreet: res.Data.StreetName,
              regionAddress: res.Data.Address,
              regionId: res.Data.RegionId,
              regionMemberName: res.Data.ShipTo,
              regionCellPhone: res.Data.CellPhone,
              id: res.Data.Id,
              addressLng: res.Data.Lng, //地址经度
              addressLat: res.Data.Lat, //地址纬度
            }
          });
          that.getDistributionConfig()
          var pageType = that.data.pageType;
          if (pageType == 'submitbuy') { //立即购买的
            //立即购买的则修改productInfo里面的templateId和OldTemplateId,把配送方式相关设置成默认状态
            var shippingId = that.data.regionInfo.id;
            var productId = that.data.productId;
            var skuId = that.data.skuId;
            filter.request({
              url: '/OrderSubmit/GeProjectAreaTemplateId',
              data: {
                shippingId: shippingId,
                productId: productId,
                skuId: skuId
              },
              success: function(tRes) {
                if (tRes.Code == 0 && tRes.Data != '') {
                  var templateId = tRes.Data;
                  var freight = that.data.freight;
                  var shipText = that.data.shipText;
                  that.setData({
                    productInfo: {
                      FreightTemplateId: templateId
                    },
                    templateId: templateId,
                    freight: (0).toFixed(2),
                    shipText: '请选择配送方式'
                  });
                } else {
                  that.setData({
                    templateId: that.data.productInfo.FreightTemplateId,
                    shipText: '请选择配送方式',
                    shipValue: 0,
                    freight: (0).toFixed(2)
                  });
                }
              }
            });
            //完事后调方法计算总减价金额
            that.calcDiscount();
            that.options.shippingId = shippingId;
            that.onLoad(that.options);
          } else {
            //购物车来的需要重新请求数据加载onLoad方法
            var shippingId = that.data.regionInfo.id;
            that.options.shippingId = shippingId;
            that.onLoad(that.options);
          }
        } else {
          that.options.shippingId = 0;
          that.onLoad(that.options);
        }
      }
    });
  },
  // 配送配置
  getDistributionConfig() {
    let that = this;
    filter.request({
      url: '/OrderSubmit/GetDistributionConfig',
      data: {
        shippingRegion: this.data.regionInfo.id,
        city: this.data.regionInfo.regionCityId,
        supplyShip: false,
        proxyUserID: 0
      },
      success(res) {
        if (res.Code == 0) {
          that.setData({
            IsExpress: res.Data.IsExpress,
            PickUp: res.Data.PickUp,
            CityDistribution: res.Data.CityDistribution
          });
          // 是否开启了同城配送
          if (res.Data.CityDistribution.IsCityDistribution) {
            let {
              regionInfo
            } = that.data
            if (regionInfo.addressLng && regionInfo.addressLat) {
              //判断收货地址是否在同城配送范围内
              that.checkAddressInCityDistribution(res.Data.CityDistribution.Id, regionInfo.addressLat, regionInfo.addressLng, regionInfo.id);
            } else {
              //调用地址解析
              that.geocoder();
            }
          }
        } else {
          util.showToast(that, {
            text: '获取商家配送接口异常！' + res.Msg,
            duration: 2000
          });
        }
      }
    });
  },
  // 地址解析
  geocoder() {
    let {
      regionInfo,
      CityDistribution
    } = this.data;
    let that = this;
    // 调用接口
    filter.request({
      url: '/OrderSubmit/Geocoder',
      data: {
        address: `${regionInfo.regionProvince}${regionInfo.regionCity}${regionInfo.regionCounty}${regionInfo.regionStreet}${regionInfo.regionAddress}`
      },
      success: function(res) {
        if (res.Code === 0) {
          regionInfo = {
            ...regionInfo,
            addressLat: res.Data.Lat,
            addressLng: res.Data.Lng
          }
          that.setData({
            regionInfo
          })
          that.checkAddressInCityDistribution(CityDistribution.Id, res.Data.Lat, res.Data.Lng, regionInfo.id);
        }
      },
      complete: function(res) {

      }
    });
  },
  // 判断收货地址是否在同城配送范围内
  checkAddressInCityDistribution(id, latitude, longitude,adressId) {
    let that = this;
    filter.request({
      url: '/OrderSubmit/CheckAddressInCitydistributionRangeV2',
      data: {
        id,
        latitude,
        longitude,
        adressId
      },
      success(res) {
        if (res.Code == 0) {
          that.setData({
            addressInCitydistribution: res.Data.CanCitydistribution
          });
        }
      }
    });
  },
  // 自提点列表
  getPickupList(type) {
    let that = this;
    wx.showLoading({
      // title: '配送方式加载中！',
    });
    filter.request({
      url: '/OrderSubmit/GetPickUpForCityNew',
      data: {
        pickAgentid: this.data.PickUp.AgentId || 0,
        city: this.data.regionInfo.regionCityId,
        regionId: that.data.regionInfo.regionId
      },
      success(res) {
        that.setData({ itemp: res.Msg});
        
        if (res.Code == 0) {
          if (that.data.itemp > 0&&type==1) {

            const currentPickup = res.Data.filter(v => v.Id == that.data.itemp)[0]
            let {
              pageType,
            } = that.data
            if (pageType == 'submitbuy') {
              that.setData({
                currentPickup,
                shipText: '上门自提',
                isSelectedDistribution: true
              })
            } else {
              let {
                currentCarOrderIndex,
                orderList
              } = that.data;
              orderList[currentCarOrderIndex].currentPickup = currentPickup;
              orderList[currentCarOrderIndex].shipValue = -2;
              orderList[currentCarOrderIndex].shipText = '上门自提';
              orderList[currentCarOrderIndex].isSelectedDistribution = true;
              that.setData({
                orderList,
              })
            }
            if (type != 1) {
              that.setData({
                pickupPopup: 'show'
              })
            //that.closePickupPopup()
            }
          }else{
            that.setData({
              pickupPopup: 'show'
            })
          }
          that.setData({
            pickupList: res.Data,
          });
        } else {
          util.showToast(that, {
            text: '获取自提点列表接口异常！' + res.Msg,
            duration: 2000
          });
        }
      },
      complete() {
        wx.hideLoading();
      }
    });
  },
  // 选择自提点
  selectPickup(e) {
    let {
      id
    } = e.currentTarget.dataset
    const currentPickup = this.data.pickupList.filter(v => v.Id == id)[0]
    let {
      pageType,
    } = this.data
    if (pageType == 'submitbuy') {
      this.setData({
        currentPickup,
        shipText: '上门自提',
        isSelectedDistribution: true
      })
    } else {
      let {
        currentCarOrderIndex,
        orderList
      } = this.data;
      orderList[currentCarOrderIndex].currentPickup = currentPickup;
      orderList[currentCarOrderIndex].shipValue = -2;
      orderList[currentCarOrderIndex].shipText = '上门自提';
      orderList[currentCarOrderIndex].isSelectedDistribution = true;
      this.setData({
        orderList,
      })
    }
    this.closePickupPopup()
  },
  //选择同城配送
  selectCityDistribution() {
    let {
      pageType,
      CityDistribution,
      regionInfo
    } = this.data;
    if (pageType == 'submitbuy') {
      // 立即购买
      //订单金额达到了起送价
      if (CityDistribution.IsDelivery) {
        let {
          freight,
          totalPrice
        } = this.data
        freight = (parseFloat(freight) + CityDistribution.Freight).toFixed(2)
        this.setData({
          isSelectedDistribution: true,
          shipText: '同城配送',
          shipValue: -8,
          freight,
        })
        this.calcDiscount()
        this.closeDistributionModal()
      }
    } else {
      // 购物车
      let {
        freight,
        totalPrice,
        orderList,
        currentCarOrderIndex
      } = this.data
      //订单金额达到了起送价
      if (orderList[currentCarOrderIndex].CityDistribution.IsDelivery) {
        orderList[currentCarOrderIndex].freight = parseFloat(orderList[currentCarOrderIndex].freight) + orderList[currentCarOrderIndex].CityDistribution.Freight;
        orderList[currentCarOrderIndex].shipText = '同城配送';
        orderList[currentCarOrderIndex].shipValue = -8;
        orderList[currentCarOrderIndex].isSelectedDistribution = true;
        this.setData({
          orderList
        })
        this.calcDiscount()
        this.closeDistributionModal()
      }
    }
  },
  // 获取同城配送运费
  getCitydistributionFreight(amount, id, latitude, longitude) {
    wx.showLoading();
    let that = this;
    let {
      pageType
    } = this.data
    filter.request({
      url: '/OrderSubmit/GetCitydistributionFreight',
      data: {
        amount,
        id,
        latitude,
        longitude,
      },
      success(res) {
        if (res.Code == 0) {
          if (pageType == 'submitbuy') {
            // 立即购买
            let {
              CityDistribution
            } = that.data
            let {
              Freight,
              IsDelivery,
              SpreadMoney
            } = res.Data
            that.setData({
              CityDistribution: {
                ...CityDistribution,
                Freight,
                IsDelivery,
                SpreadMoney,
              },
              notStartPrice: !IsDelivery
            });
          } else {
            // 购物车
            let {
              orderList,
              currentCarOrderIndex,
            } = that.data
            let {
              Freight,
              IsDelivery,
              SpreadMoney
            } = res.Data
            orderList[currentCarOrderIndex].CityDistribution = {
              Freight,
              IsDelivery,
              SpreadMoney,
            }
            orderList[currentCarOrderIndex].notStartPrice = !IsDelivery
            that.setData({
              orderList
            });

          }
        }
      },
      complete() {
        wx.hideLoading();
        that.setData({
          isDistributionModalShow: 'show'
        })
      }
    });
  },
  // 显示配送配置弹窗
  showDistributionMode(e) {
    if (!this.data.isSelectedAddress) {
      return util.showToast(this, {
        text: '请先填写收货地址',
        duration: 2000
      });
    }
    let {
      pageType,
      CityDistribution,
      regionInfo
    } = this.data;
    if (pageType == 'submitbuy') {
      if (CityDistribution.IsCityDistribution) {
        // 立即购买
        let {
          productTotal,
        } = this.data
        this.getCitydistributionFreight(parseFloat(productTotal), CityDistribution.Id, regionInfo.addressLat, regionInfo.addressLng)
      }
    } else {
      // 购物车
      let {
        templateid,
        index
      } = e.currentTarget.dataset;
      this.setData({
        currentCarOrderTemplateId: templateid,
        currentCarOrderIndex: index
      })
      let {
        orderList,
      } = this.data
      let productTotal = 0;
      orderList[index].ShoppingCarts.forEach(v => {
        productTotal += parseFloat(v.skuPrice) * v.Quantity
      })
      this.getCitydistributionFreight(productTotal, CityDistribution.Id, regionInfo.addressLat, regionInfo.addressLng)
    }
    // 开启同城配送则需在接口完成后显示弹窗
    if (!CityDistribution.IsCityDistribution) {
      this.setData({
        isDistributionModalShow: 'show'
      })
    }

  },
  closeDistributionModal() {
    this.setData({
      isDistributionModalShow: 'hide'
    })
  },
  // 选中配送模式
  selectDistributionMode(e) {
    let distributionMode = e.currentTarget.dataset.id
    if (this.data.pageType == 'submitbuy') {
      // 不能选择上门自提
      if (distributionMode == 2 && !this.data.PickUp.EnablePickUp) return
      // 不能选择同城配送
      if (distributionMode == 3 && (!this.data.addressInCitydistribution || this.data.notStartPrice)) return
      // 立即购买
      let {
        freight
      } = this.data
      if (distributionMode != this.data.distributionMode || !this.data.isSelectedDistribution) {
        this.setData({
          isSelectedDistribution: false, //重置 isSelectedDistribution
          shipText: '请选择配送方式',
          deliveryList: []
        })
      }
      this.setData({
        freight: (0).toFixed(2),
        distributionMode,
      })
      if (distributionMode != 3) this.closeDistributionModal()
      this.calcDiscount()
      if (distributionMode != 2) {
        // 切换模式 重置
        this.setData({
          currentPickup: {
            Id: -1
          }
        })
      }
      // 选择物流配送
      if (distributionMode == 1) this.deliveryMode()
      // 选择上门自提
      if (distributionMode == 2) this.showPickupPopup(1)
      // 选择同城配送
      if (distributionMode == 3) this.selectCityDistribution()
    } else {
      // 购物车
      let {
        currentCarOrderTemplateId,
        currentCarOrderIndex,
        orderList,
        freight,
        totalPrice
      } = this.data
      // 不能选择上门自提  供应商的商品不支持上门自提
      if (distributionMode == 2 && (!this.data.PickUp.EnablePickUp || this.data.SupplyShip && orderList[currentCarOrderIndex].SupplyId > 0)) return
      // 不能选择同城配送
      if (distributionMode == 3 && (!this.data.addressInCitydistribution || orderList[currentCarOrderIndex].notStartPrice)) return
      if (distributionMode != 2) {
        // 切换模式 重置
        orderList[currentCarOrderIndex].currentPickup = {
          Id: -1
        }
        this.setData({
          orderList
        })
      }
      let orderFreight = orderList[currentCarOrderIndex].freight;
      orderList[currentCarOrderIndex].freight = 0;

      if (distributionMode != orderList[currentCarOrderIndex].distributionMode || !orderList[currentCarOrderIndex].isSelectedDistribution) {
        orderList[currentCarOrderIndex].shipText = '请选择配送方式';
        orderList[currentCarOrderIndex].isSelectedDistribution = false;
      }
      orderList[currentCarOrderIndex].distributionMode = distributionMode;
      this.setData({
        orderList,
        freight: (parseFloat(freight) - parseFloat(orderFreight)).toFixed(2),
      })
      if (distributionMode != 3) this.closeDistributionModal()
      this.calcDiscount()
      // 选择物流配送
      if (distributionMode == 1) this.cartDeliveryMode()
      // 选择上门自提
      if (distributionMode == 2) this.showPickupPopup(1)
      // 选择同城配送
      if (distributionMode == 3) this.selectCityDistribution()
    }

  },
  // 单个订单备注
  bindRemarkInput(e) {
    this.setData({
      remarkValue: util.filteremoji(e.detail.value)
    });
  },
  // 多个订单分别备注
  bindRemarkInputList(e) {
    var index = e.target.dataset.ids;
    this.data.orderList[index].remarkValue = util.filteremoji(e.detail.value);
  },
  /**
   * 获取下单相关参数
   */
  getOrderConfig(cb) {
    let that = this;
    filter.request({
      url: '/ConfirmOrder/GetOrderConfig',
      data: {},
      success(res) {
        if (res.Code == 0) {
          that.setData({
            orderConfig: res.Data
          });
        } else {
          util.showToast(that, {
            text: '获取下单参数接口异常！' + res.Msg,
            duration: 2000
          });
        }
      },
      complete(res) {
        //执行回调
        if (cb && typeof cb == 'function') cb();
      }
    });
  },

  /**
   * 获取优惠券信息
   */
  getCoupons(pageType, productSalePrice, cartIds, discount, productId, productNum, skuId, orderIndex, cb) {
    let that = this;
    filter.request({
      url: '/ConfirmOrder/GetCoupon',
      data: {
        cartIds,
        discount,
        productId,
        productNum,
        skuId
      },
      success(res) {
        if (res.Code == 0) {
          if (pageType == 'submitbuy') { //立即购买的
            let couponList = [];
            if (res.Data != null) couponList = res.Data;
            //let couponList = [{ "Key": "0.00|10.00", "Value": 26112 }, { "Key": "0.00|20.00", "Value": 26113 }];
            let selectedCouponId = 0;
            let couponSelectedText = '';
            let totalCouponDiscount = 0;
            couponList.forEach(function(item, index) {
              var keyItem = item.Key.split('|');
              if (parseFloat(keyItem[0]) == 0) {
                item.showText = '直减' + keyItem[1];

              } else {
                item.showText = '满' + keyItem[0] + '减' + keyItem[1];
              }
              item.conditionMoney = keyItem[0];
              item.discountMoney = keyItem[1];
              if (index == 0) {
                item.selected = true;
                selectedCouponId = item.Value;
                couponSelectedText = item.showText;
                if (parseFloat(keyItem[0]) == 0) {
                  totalCouponDiscount += parseFloat(keyItem[1]);
                } else {
                  if (parseFloat(productSalePrice) * productNum >= parseFloat(keyItem[0])) {
                    totalCouponDiscount += parseFloat(keyItem[1]);
                  }
                }
              } else {
                item.selected = false;
              }
            });
            that.setData({
              couponList: couponList,
              selectedCouponId: selectedCouponId,
              couponSelectedText: couponSelectedText,
              totalCouponDiscount: totalCouponDiscount.toFixed(2)
            });
            //选中第一个可用优惠券

          } else { //购物车的
            var orderList = that.data.orderList;
            let couponList = [];
            if (res.Data != null) couponList = res.Data;
            //let couponList = [{ "Key": "0.00|10.00", "Value": 26112 }, { "Key": "0.00|20.00", "Value": 26113 }];
            let selectedCouponId = 0;
            let couponSelectedText = '';
            let totalCouponDiscount = 0;
            let couponDiscount = 0;
            var newArr = couponList.filter(function(item) {
              return item.Key === couponList[0].Key;
            });
            couponList.forEach(function(item, index) {
              var keyItem = item.Key.split('|');
              if (parseFloat(keyItem[0]) == 0 || parseFloat(keyItem[0]) <= parseFloat(orderList[orderIndex].productTotal)) {
                if (parseFloat(keyItem[0]) == 0) {
                  item.showText = '直减' + keyItem[1];
                } else {
                  item.showText = '满' + keyItem[0] + '减' + keyItem[1];
                }
              }

              item.conditionMoney = keyItem[0];
              item.discountMoney = keyItem[1];
              if (index == 0) {
                item.selected = true;
                selectedCouponId = item.Value;
                couponSelectedText = item.showText;
                if (parseFloat(keyItem[0]) == 0 || parseFloat(keyItem[0]) <= parseFloat(orderList[orderIndex].productTotal)) {
                  totalCouponDiscount += parseFloat(keyItem[1]);
                  couponDiscount = parseFloat(keyItem[1]);
                }
              } else {
                item.selected = false;
              }
            });
            orderList[orderIndex].couponList = couponList;
            orderList[orderIndex].selectedCouponId = selectedCouponId;
            orderList[orderIndex].couponSelectedText = couponSelectedText;
            orderList[orderIndex].totalCouponDiscount = couponDiscount;
            orderList.forEach(function(v, i) {
              if (i >= newArr.length) {
                v.couponSelectedText = "请选择优惠券";
                v.couponDiscount = 0;
                v.totalCouponDiscount = 0;
                v.selectedCouponId = 0;
                if (v.couponList) {
                  v.couponList.forEach(function(couponV, couponI) {
                    couponV.selected = false;
                  })
                }
              }
            })
            //选中第一个可用优惠券
            that.setData({
              orderList: orderList,
              totalCouponDiscount: totalCouponDiscount,
              couponsNum: newArr.length
            });
          }
        } else {
          util.showToast(that, {
            text: '获取优惠券信息接口异常！' + res.Msg,
            duration: 2000
          });
        }
      },
      complete(res) {
        //执行回调
        if (cb && typeof cb == 'function') cb();
      }
    });
  },
  getLimitDiscountCoupons: function(productSalePrice, cartIds, discount, productId, productNum, skuId, orderIndex, cb) {
    let that = this;
    filter.request({
      url: '/ConfirmOrder/GetPurchaseCouponByLimitedTimeDiscount',
      data: {
        CartIds: cartIds,
        discount: discount,
        ProductIds: productId,
        ProductNum: productNum,
        Skuid: skuId
      },
      success(res) {
        if (res.Code == 0) {
          let couponList = [];
          if (res.Data != null) couponList = res.Data;
          //let couponList = [{ "Key": "0.00|10.00", "Value": 26112 }, { "Key": "0.00|20.00", "Value": 26113 }];
          let selectedCouponId = 0;
          let couponSelectedText = '';
          let totalCouponDiscount = 0;
          couponList.forEach(function(item, index) {
            var keyItem = item.Key.split('|');
            if (parseFloat(keyItem[0]) == 0) {
              item.showText = '直减' + keyItem[1];

            } else {
              item.showText = '满' + keyItem[0] + '减' + keyItem[1];
            }
            item.conditionMoney = keyItem[0];
            item.discountMoney = keyItem[1];
            if (index == 0) {
              item.selected = true;
              selectedCouponId = item.Value;
              couponSelectedText = item.showText;
              if (parseFloat(keyItem[0]) == 0) {
                totalCouponDiscount += parseFloat(keyItem[1]);
              } else {
                if (parseFloat(productSalePrice) * productNum >= parseFloat(keyItem[0])) {
                  totalCouponDiscount += parseFloat(keyItem[1]);
                }
              }
            } else {
              item.selected = false;
            }
          });
          that.setData({
            couponList: couponList,
            selectedCouponId: selectedCouponId,
            couponSelectedText: couponSelectedText,
            totalCouponDiscount: totalCouponDiscount.toFixed(2)
          });
          //选中第一个可用优惠券
        } else {
          util.showToast(that, {
            text: '获取优惠券信息接口异常！' + res.Msg,
            duration: 2000
          });
        }
      },
      complete(res) {
        //执行回调
        if (cb && typeof cb == 'function') cb();
      }
    });
  },
  /**
   * 选择优惠券
   */
  selectCoupon(e) {
    let that = this;
    let couponId = e.currentTarget.dataset.couponid;
    let pageType = this.data.pageType;
    let couponList = this.data.couponList;
    let selectedCouponId = 0;
    let couponSelectedText = '';
    let totalCouponDiscount = parseFloat(that.data.totalCouponDiscount); //优惠券减价显示
    let conditionMoney = parseFloat(e.currentTarget.dataset.conditionmoney); //满减条件
    let discountMoney = parseFloat(e.currentTarget.dataset.discountmoney); //减价金额
    let num = 0;
    if (pageType == 'submitbuy') {
      let productTotal = parseFloat(that.data.productTotal);
      couponList.forEach(function(item, index) {
        item.selected = false;
        if (item.Value == couponId) {
          item.selected = true;
          couponSelectedText = item.showText;
          selectedCouponId = item.Value;
          if (conditionMoney == 0 || (conditionMoney > 0 && conditionMoney <= productTotal)) { //满足条件
            totalCouponDiscount = discountMoney.toFixed(2);
          } else {
            totalCouponDiscount = '0.00';
          }
        }
      });
      that.setData({
        selectedCouponId: selectedCouponId,
        couponSelectedText: couponSelectedText,
        couponList: couponList,
        totalCouponDiscount: totalCouponDiscount
      });

    } else {
      // 判断优惠券张数
      that.data.orderList.forEach(function(item, index) {
        if (item.selectedCouponId == couponId) {
          num++;
        }
      });
      var selectedCouponNum = couponList.filter(function(item) {
        return item.Value === couponId;
      });
      if (num >= selectedCouponNum.length) {
        util.showToast(that, {
          text: '该优惠券已被选择使用',
          duration: 2000
        });
        return;
      }
      let productTotal = parseFloat(that.data.productTotal);
      let orderList = that.data.orderList;
      let currentCouponIndex = that.data.currentCouponIndex;
      let orderCouponList = orderList[currentCouponIndex].couponList;
      let couponDiscount = orderList[currentCouponIndex].totalCouponDiscount; //单个单优惠券金额
      orderCouponList.forEach(function(item, index) {
        item.selected = false;
        if (item.Value == couponId) {
          item.selected = true;
          couponSelectedText = item.showText;
          selectedCouponId = item.Value;
          if (conditionMoney == 0 || (conditionMoney > 0 && conditionMoney <= productTotal)) { //满足条件
            couponDiscount = discountMoney.toFixed(2);
          } else {
            couponDiscount = '0.00';
          }
        }
      });
      orderList[currentCouponIndex].couponList = orderCouponList;
      orderList[currentCouponIndex].selectedCouponId = selectedCouponId;
      orderList[currentCouponIndex].couponSelectedText = couponSelectedText;
      orderList[currentCouponIndex].totalCouponDiscount = couponDiscount;
      that.setData({
        orderList: orderList
      });
    }
    that.closeCouponPopup(); //关闭弹窗
    //计算价格
    that.calcDiscount(1);
  },
  /*获取运费*/
  getFreight: function(templateId, shipModelId, cartIds, productNum, sumPrice, currentOrderIndex) {
    var that = this;
    var productId = that.data.productId ? that.data.productId : '';
    var cityName = that.data.regionInfo.regionCity;
    var regionName = that.data.regionInfo.regionCounty;
    var skuId = that.data.skuId ? that.data.skuId : '';
    filter.request({
      url: '/Product/CountFreight',
      data: {
        ProductId: productId,
        CityName: cityName,
        Regionid: regionName,
        TemplateId: templateId,
        ShipModelId: shipModelId,
        CartIds: cartIds,
        ProductNum: productNum,
        Skuid: skuId,
        SumPrice: sumPrice
      },
      success: function(res) {
        if (res.Code == 0) {
          if (currentOrderIndex != undefined) { //购物车来的
            var orderList = that.data.orderList;
            orderList[currentOrderIndex].freight = parseFloat(res.Data);
            that.setData({ //更新运费
              orderList: orderList
            });
            var totalFreight = 0;
            that.data.orderList.forEach(function(item, index) {
              totalFreight += parseFloat(item.freight);
            });
            var productTotal = parseFloat(that.data.productTotal);
            var discountTotal = parseFloat(that.data.totalDiscount);
            that.setData({
              freight: totalFreight.toFixed(2),
            });
          } else { //立即购买的
            var totalFreight = parseFloat(res.Data);
            var productTotal = parseFloat(that.data.productTotal);
            var discountTotal = parseFloat(that.data.totalDiscount);
            that.setData({ //更新运费,合计
              freight: totalFreight.toFixed(2)
            });
          }
          that.calcDiscount(1);
        }
      }
    });
  },
  /*获取优惠活动*/
  getDiscount: function(nums, pids, prices, preIds, orderIndex, callBack) {
    var that = this;
    wx.showLoading({
      title: '获取中'
    });
    filter.request({
      url: '/OrderSubmit/GetDiscountList',
      data: {
        nums: nums,
        pids: pids,
        prices: prices,
        preIds: preIds
      },
      success: function(res) {
        if (res.Code == 0) {
          var pageType = that.data.pageType;
          if (pageType == 'submitbuy') { //立即购买的
            if (res.Data.length > 0) {
              that.setData({
                isActivityFreeShip: res.Data[0].FreeShip, //满减活动是否包邮
                discountId: res.Data[0].ActivitiesId ? res.Data[0].ActivitiesId : 0,
                discountText: res.Data[0].ActivitiesName ? res.Data[0].ActivitiesName : '',
                discountMoney: res.Data[0].ReductionMoney ? res.Data[0].ReductionMoney : 0,
                discountInfoList: res.Data,
                discountPoint: res.Data[0].Point ? res.Data[0].Point : 0
              });
            } else {
              that.setData({
                discountId: 0,
                discountText: '',
                discountMoney: 0,
                discountInfoList: []
              });
            }
          } else { //购物车的
            var orderList = that.data.orderList;
            if (res.Data.length > 0) {
              var oldTemplateId = orderList[orderIndex].TemplateId;
              if (orderList[orderIndex].OldTemplateId == undefined) {
                orderList[orderIndex].OldTemplateId = oldTemplateId;
              }
              orderList[orderIndex].isActivityFreeShip = res.Data[0].FreeShip; //满减活动是否包邮
              orderList[orderIndex].TemplateId = orderList[orderIndex].OldTemplateId;
              orderList[orderIndex].freight = 0;
              orderList[orderIndex].shipText = '请选择配送方式';
              orderList[orderIndex].shipValue = 0;
              orderList[orderIndex].discountId = res.Data[0].ActivitiesId;
              orderList[orderIndex].discountText = res.Data[0].ActivitiesName;
              orderList[orderIndex].discountMoney = res.Data[0].ReductionMoney;
              orderList[orderIndex].discountInfoList = res.Data;
              orderList[orderIndex].discountPoint = res.Data[0].Point;
            } else {
              orderList[orderIndex].discountId = 0;
              orderList[orderIndex].discountText = '';
              orderList[orderIndex].discountMoney = 0;
              orderList[orderIndex].discountInfoList = [];
              orderList[orderIndex].discountPoint = 0;
            }
            that.setData({
              orderList: orderList
            });
          }
          //执行回调
          if (callBack && typeof callBack == 'function') callBack();
        }
      },
      complete: function(res) {
        wx.hideLoading();
      }
    });
  },
  getLimitfullMins: function(nums, pids, prices, preIds, orderIndex, callBack) {
    var that = this;
    wx.showLoading({
      title: '获取中'
    });
    filter.request({
      url: '/OrderSubmit/GetDiscountListByLimitedTimeDiscount',
      data: {
        nums: nums,
        pids: pids,
        prices: prices,
        preIds: preIds
      },
      success: function(res) {
        if (res.Code == 0) {
          var pageType = that.data.pageType;
          if (pageType == 'submitbuy') { //立即购买的
            if (res.Data.length > 0) {
              that.setData({
                isActivityFreeShip: res.Data[0].FreeShip, //满减活动是否包邮
                discountId: res.Data[0].ActivitiesId ? res.Data[0].ActivitiesId : 0,
                discountText: res.Data[0].ActivitiesName ? res.Data[0].ActivitiesName : '',
                discountMoney: res.Data[0].ReductionMoney ? res.Data[0].ReductionMoney : 0,
                discountInfoList: res.Data,
                templateId: templateId,
                freight: freight,
                shipText: shipText,
                shipValue: 0,
                discountPoint: res.Data[0].Point ? res.Data[0].Point : 0
              });
            } else {
              that.setData({
                discountId: 0,
                discountText: '',
                discountMoney: 0,
                discountInfoList: []
              });
            }
          } else { //购物车的
            var orderList = that.data.orderList;
            if (res.Data.length > 0) {
              var oldTemplateId = orderList[orderIndex].TemplateId;
              if (orderList[orderIndex].OldTemplateId == undefined) {
                orderList[orderIndex].OldTemplateId = oldTemplateId;
              }
              orderList[orderIndex].isActivityFreeShip = res.Data[0].FreeShip, //满减活动是否包邮
                orderList[orderIndex].TemplateId = orderList[orderIndex].OldTemplateId;
              orderList[orderIndex].freight = 0;
              orderList[orderIndex].shipText = '请选择配送方式';
              orderList[orderIndex].shipValue = 0;
              orderList[orderIndex].discountId = res.Data[0].ActivitiesId;
              orderList[orderIndex].discountText = res.Data[0].ActivitiesName;
              orderList[orderIndex].discountMoney = res.Data[0].ReductionMoney;
              orderList[orderIndex].discountInfoList = res.Data;
            } else {
              orderList[orderIndex].discountId = 0;
              orderList[orderIndex].discountText = '';
              orderList[orderIndex].discountMoney = 0;
              orderList[orderIndex].discountInfoList = [];
            }
            that.setData({
              orderList: orderList
            });
          }
          //执行回调
          if (callBack && typeof callBack == 'function') callBack();
        }
      },
      complete: function(res) {
        wx.hideLoading();
      }
    });
  },

  /*添加收货地址*/
  addNewAddress: function() {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '是否使用微信收货地址？',
      confirmText: '是',
      cancelText: '否',
      success: function(res) {
        if (res.confirm) { //使用微信地址
          that.chooseAddress();
        } else if (res.cancel) { //使用销客多地址
          app.navigateTo('../address/address?addressId=0', 'navigateTo');
        }
      }
    });
  },
  /*选择收货地址*/
  goAddressList: function() {
    app.navigateTo('../addresslist/addresslist', 'navigateTo');
  },
  /*立即购买的选择优惠方式*/
  discountMode: function() {
    var that = this;
    var discountInfoList = that.data.discountInfoList;
    var discountId = that.data.discountId;
    var discountList = [];
    discountInfoList.forEach(function(item, index) {
      var isChecked = '';
      if (item.ActivitiesId == discountId) {
        isChecked = 'checked';
      }
      discountList.push({
        ActivitiesId: item.ActivitiesId,
        ActivitiesName: item.ActivitiesName,
        ReductionMoney: item.ReductionMoney,
        FreeShip: item.FreeShip,
        isChecked: isChecked,
        Point: item.Point
      });
    });
    that.setData({
      isDiscountShow: 'show',
      discountList: discountList
    });
  },
  /*购物车过来的选择优惠方式*/
  cartDiscountMode: function(e) {
    var that = this;
    var currentDiscountIndex = e.currentTarget.dataset.index;
    var orderList = that.data.orderList;
    var discountInfoList = orderList[currentDiscountIndex].discountInfoList;
    var discountId = orderList[currentDiscountIndex].discountId;
    var discountList = [];
    discountInfoList.forEach(function(item, index) {
      var isChecked = '';
      if (item.ActivitiesId == discountId) {
        isChecked = 'checked';
      }
      discountList.push({
        ActivitiesId: item.ActivitiesId,
        ActivitiesName: item.ActivitiesName,
        ReductionMoney: item.ReductionMoney,
        FreeShip: item.FreeShip,
        isChecked: isChecked,
        Point: item.Point
      });
    });
    that.setData({
      isDiscountShow: 'show',
      discountList: discountList,
      currentDiscountIndex: currentDiscountIndex
    });
  },
  closeDiscount: function() {
    this.setData({
      isDiscountShow: 'hide'
    })
  },
  /*选择优惠方式时的事件*/
  selectDiscountMode: function(e) {
    var activitiesid = e.currentTarget.dataset.activitiesid;
    var name = e.currentTarget.dataset.name;
    var index = e.currentTarget.dataset.index;
    var discountMoney = parseFloat(e.currentTarget.dataset.discountmoney);
    var freeship = e.currentTarget.dataset.freeship;
    var discountPoint = e.currentTarget.dataset.point;
    var pageType = this.data.pageType;
    this.data.discountList.map(function(item) {
      item.isChecked = '';
    });
    this.data.discountList[index].isChecked = 'checked';
    if (pageType == 'submitbuy') { //立即购买的
      var templateId = this.data.templateId;
      var freight = this.data.freight;
      var shipText = this.data.shipText;
      if (freeship) {
        templateId = 0;
        freight = (0).toFixed(2);
        this.setData({
          isActivityFreeShip: true
        })
      } else {
        //todo:不包邮的逻辑
        templateId = this.data.productInfo.FreightTemplateId;
        freight = (0).toFixed(2);
      }
      shipText = '请选择配送方式';
      this.setData({
        discountList: this.data.discountList,
        discountId: activitiesid,
        discountText: name,
        discountMoney: discountMoney,
        templateId: templateId,
        freight: freight,
        shipText: shipText,
        shipValue: 0,
        isDiscountShow: 'hide',
        discountPoint: discountPoint
      });
    } else { //拆单的某个订单
      var currentDiscountIndex = this.data.currentDiscountIndex;
      var orderList = this.data.orderList;
      var oldTemplateId = orderList[currentDiscountIndex].TemplateId;
      orderList[currentDiscountIndex].discountId = activitiesid;
      orderList[currentDiscountIndex].discountText = name;
      orderList[currentDiscountIndex].discountMoney = discountMoney;
      orderList[currentDiscountIndex].discountPoint = discountPoint;
      if (freeship) {
        if (orderList[currentDiscountIndex].OldTemplateId == undefined) {
          orderList[currentDiscountIndex].OldTemplateId = oldTemplateId;
        }
        orderList[currentDiscountIndex].TemplateId = 0;
        orderList[currentDiscountIndex].freight = 0;
        orderList[currentDiscountIndex].shipValue = 0;
        orderList[currentDiscountIndex].isActivityFreeShip = true;
      } else {
        //todo:不包邮的逻辑
        orderList[currentDiscountIndex].TemplateId = orderList[currentDiscountIndex].OldTemplateId;
        orderList[currentDiscountIndex].freight = 0;
        orderList[currentDiscountIndex].shipValue = 0;
      }
      orderList[currentDiscountIndex].shipText = '请选择配送方式';
      this.setData({
        discountList: this.data.discountList,
        orderList: orderList,
        isDiscountShow: 'hide'
      });
    }
    //完事后调方法计算总减价金额
    this.calcDiscount();
  },
  /*打开配送方式弹窗*/
  deliveryMode: function() { //配送方式
    var that = this;
    let {
      templateId,
      isActivityFreeShip,
      deliveryList
    } = this.data;
    // 满减包邮
    if (isActivityFreeShip) {
      let isChecked = deliveryList.length ? deliveryList[0].isChecked : ''
      this.setData({
        deliveryList: [{
          Key: '满减包邮',
          Value: 0,
          isChecked
        }],
        isPopupShow: 'show'
      });
      return;
    }
    // 普通包邮
    if (templateId == 0) {
      let isChecked = deliveryList.length ? deliveryList[0].isChecked : ''
      this.setData({
        deliveryList: [{
          Key: '包邮',
          Value: 0,
          isChecked
        }],
        isPopupShow: 'show'
      });
      return;
    }
    //这里写请求，加载完成关闭loading  请求成功才设置show显示
    var shipId = that.data.regionInfo.id;
    if (shipId == 0) {
      util.showToast(that, {
        text: '请先添加收货地址',
        duration: 2000
      });
      return;
    }
    wx.showLoading({
      title: '配送方式加载中！',
    });
    filter.request({
      url: '/OrderSubmit/GetFreeShipping',
      data: {
        cityName: that.data.regionInfo.regionCity,
        templateid: templateId,
        ShippingRegion: shipId,
        SupplyShip: false,
        ProxyUserID: 0
      },
      success: function(res) {
        var deliveryList = res.Data;
        var currentShipText = that.data.shipText;
        var currentShipValue = that.data.shipValue;
        deliveryList.map(function(item) {
          if (currentShipText != '' && item.Key == currentShipText) {
            item.isChecked = 'checked';
          } else {
            item.isChecked = '';
          }
        });
        that.setData({
          deliveryList: deliveryList,
          isPopupShow: 'show'
        });
      },
      complete: function(res) {
        wx.hideLoading();
      }
    });
  },
  /*有拆单的时候选择配送方式*/
  cartDeliveryMode: function(e) {
    var that = this;
    var templateId = this.data.currentCarOrderTemplateId;
    var currentDeliveryIndex = this.data.currentCarOrderIndex;
    this.setData({
      currentDeliveryIndex,
    })
    // 满减包邮
    if (this.data.orderList[currentDeliveryIndex].isActivityFreeShip) {
      let isChecked = this.data.orderList[currentDeliveryIndex].shipText == '满减包邮' ? 'checked' : '';
      this.setData({
        deliveryList: [{
          Key: '满减包邮',
          Value: 0,
          isChecked
        }],
        isPopupShow: 'show'
      });
      return;
    }
    // 包邮
    if (templateId == 0) {
      let isChecked = this.data.orderList[currentDeliveryIndex].shipText == '包邮' ? 'checked' : '';
      this.setData({
        deliveryList: [{
          Key: '包邮',
          Value: 0,
          isChecked
        }],
        isPopupShow: 'show'
      });
      return;
    }
    var shipId = that.data.regionInfo.id;
    if (shipId == 0) {
      util.showToast(that, {
        text: '请先添加收货地址',
        duration: 2000
      });
      return;
    }
    wx.showLoading({
      title: '配送方式加载中！',
    });
    filter.request({
      url: '/OrderSubmit/GetFreeShipping',
      data: {
        cityName: that.data.regionInfo.regionCity,
        templateid: templateId,
        ShippingRegion: shipId,
        SupplyShip: false,
        ProxyUserID: 0
      },
      success: function(res) {
        var deliveryList = res.Data;
        var orderList = that.data.orderList;
        var currentShipText = orderList[currentDeliveryIndex].shipText;
        var currentShipValue = orderList[currentDeliveryIndex].shipValue;
        deliveryList.map(function(item) {
          if (item.Value == currentShipValue) {
            item.isChecked = 'checked';
            orderList[currentDeliveryIndex].shipText = item.Key;
          } else {
            item.isChecked = '';
          }
        });
        that.setData({
          deliveryList,
          orderList,
          isPopupShow: 'show'
        });
      },
      complete: function(res) {
        wx.hideLoading();
      }
    });
  },
  closePopup: function() {
    this.setData({
      isPopupShow: 'hide'
    })
  },
  showPickupPopup(type) {
    this.getPickupList(type)
  
    
  },
  closePickupPopup() {
    this.setData({
      pickupPopup: 'hide'
    })
  },
  selectDeliveryMode: function(e) {
    var index = e.currentTarget.dataset.index;
    var value = e.currentTarget.dataset.value;
    var key = e.currentTarget.dataset.key;
    var pageType = this.data.pageType;

    this.data.deliveryList.map(function(item) {
      item.isChecked = '';
    });
    this.data.deliveryList[index].isChecked = 'checked';
    if (pageType == 'submitbuy') { //立即购买的
      this.setData({
        deliveryList: this.data.deliveryList,
        shipText: key,
        shipValue: value,
        isPopupShow: 'hide',
        isSelectedDistribution: true
      });
      // 如果是免邮的 就不用计算运费了
      if (this.data.templateId == 0) return
      //todo:要去计算运费！！！！！
      var templateId = this.data.templateId;
      var productNum = this.data.selectedCount;
      var sumPrice = this.data.productTotal;
      this.getFreight(templateId, value, '', productNum, sumPrice);
    } else { //拆单的某个订单
      var currentDeliveryIndex = this.data.currentDeliveryIndex;
      var orderList = this.data.orderList;
      orderList[currentDeliveryIndex].shipText = key;
      orderList[currentDeliveryIndex].shipValue = value;
      orderList[currentDeliveryIndex].isSelectedDistribution = true;
      this.setData({
        deliveryList: this.data.deliveryList,
        orderList: orderList,
        isPopupShow: 'hide',
      });
      // 如果选中的订单是免邮的 就不用计算运费了
      if (this.data.currentCarOrderTemplateId == 0) return
      //todo:要去计算运费！！！！！
      var cartIds = '';
      var productNum = 0;
      var sumPrice = 0;
      orderList[currentDeliveryIndex].ShoppingCarts.forEach(function(sitem, sindex) {
        cartIds += sitem.Id + ',';
        productNum += sitem.Quantity;
        sumPrice += sitem.Quantity * parseFloat(sitem.skuPrice);
      });
      cartIds = cartIds.substring(0, cartIds.length - 1);
      this.getFreight(orderList[currentDeliveryIndex].TemplateId, value, cartIds, productNum, sumPrice, currentDeliveryIndex);
    }
  },
  chooseAddress: function() {
    var that = this;
    wx.chooseAddress({
      success: function(successData) {
        //获取对应的regionId
        that.setData({
          isSelectedAddress: true,
          regionInfo: {
            regionMemberName: successData.userName,
            regionProvince: successData.provinceName,
            regionCity: successData.cityName,
            regionCounty: successData.countyName,
            regionAddress: successData.detailInfo,
            regionCellPhone: successData.telNumber,
            regionId: 0
          }
        });
        that.addAddress();
      },
      fail: function(failData) {

      }
    });
  },
  addAddress: function() {
    var that = this;
    filter.request({
      url: '/MemberAddress/AddAndSetDefault',
      data: {
        address: that.data.regionInfo.regionAddress,
        cellPhone: that.data.regionInfo.regionCellPhone,
        city: that.data.regionInfo.regionCity,
        county: that.data.regionInfo.regionCounty,
        province: that.data.regionInfo.regionProvince,
        shipTo: that.data.regionInfo.regionMemberName
      },
      success: function(res) {
        //返回值改成id，并写人data.regionInfo里面
        if (res.Code == 0) {
          var regionInfo = that.data.regionInfo;
          regionInfo.id = res.Data;
          that.setData({
            regionInfo: regionInfo
          });
          var shippingId = that.data.regionInfo.id;
          that.options.shippingId = shippingId;
          that.onShow();
        }
      }
    });
  },
  calcDiscount: function(a) {
    var that = this;
    var pageType = this.data.pageType;
    if (pageType == 'submitbuy') {
      var discountMoney = parseFloat(this.data.discountMoney);
      var productTotal = parseFloat(this.data.productTotal);
      var totalCouponDiscount = parseFloat(this.data.totalCouponDiscount);
      var freight = parseFloat(this.data.freight);
      var totalPointDiscount = parseFloat(this.data.totalPointDiscount);
      var totalPrice = productTotal + freight - discountMoney - totalCouponDiscount - totalPointDiscount;
      if (totalPrice < 0) totalPrice = 0;
      this.setPointsAndBalance(totalPrice, freight);
      this.setData({
        totalDiscount: discountMoney.toFixed(2),
        totalCouponDiscount: totalCouponDiscount.toFixed(2),
        totalPrice: totalPrice.toFixed(2)
      });

      filter.request({
        url: '/OrderSubmit/GetPurchaseOrderPoint',
        data: {
          totalPrice: this.data.totalPrice,
          freight: this.data.freight,
          productId: this.data.productId
        },
        success: function(res) {
          //返回值改成id，并写人data.regionInfo里面
          if (res.Code == 0) {
            that.setData({
              returnPoint: parseInt(res.Data) + parseInt(that.data.discountPoint)
            });

          }
        }
      });

    } else {
      var orderList = this.data.orderList;
      var discountPoint = 0;
      var parm = [];
      var discountMoney = 0;
      var freight = 0;
      var productTotal = parseFloat(this.data.productTotal);
      var totalCouponDiscount = 0;
      var totalPointDiscount = parseFloat(this.data.totalPointDiscount);
      orderList.forEach(function(item, index) {
        discountMoney += parseFloat(item.discountMoney);
        freight += parseFloat(item.freight);
        if (a) {
          totalCouponDiscount += parseFloat(item.totalCouponDiscount);
        } else {
          if (index < that.data.couponsNum) {
            totalCouponDiscount += parseFloat(item.totalCouponDiscount);
          }
        }
        discountPoint += parseInt(item.discountPoint);
        var pmsg = [];
        item.ShoppingCarts.forEach(function(n, i) {
          var msg = {
            productId: n.ProductId,
            quantity: n.Quantity,
            skuPrice: n.skuPrice
          }
          pmsg.push(msg);
        })
        var itemParm = {
          itemDiscountMoney: parseFloat(item.discountMoney),
          itemDiscountId: item.discountId,
          itemCouponDiscount: item.totalCouponDiscount,
          itemCouponId: item.selectedCouponId,
          itemPmsg: pmsg
        }
        parm.push(itemParm);

      });
      var totalPrice = productTotal + freight - discountMoney - totalCouponDiscount - totalPointDiscount;
      if (totalPrice < 0) totalPrice = 0;
      this.setPointsAndBalance(totalPrice, freight);
      this.setData({
        totalDiscount: discountMoney.toFixed(2),
        totalCouponDiscount: totalCouponDiscount.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
        freight: freight.toFixed(2)
      });

      filter.request({
        url: '/OrderSubmit/GetCartOrderPoint',
        data: {
          totalPrice: this.data.totalPrice,
          freight: this.data.freight,
          parm: JSON.stringify(parm)
        },
        success: function(res) {
          //返回值改成id，并写人data.regionInfo里面
          if (res.Code == 0) {
            that.setData({
              returnPoint: parseInt(res.Data) + parseInt(discountPoint)
            });
          }
        }
      });

    }
  },
  /**
   * 设置积分抵扣和余额支付的显示内容
   */
  setPointsAndBalance(totalPrice, freight) {
    var orderConfig = this.data.orderConfig;
    var pointsText = '';
    var pointsDiscount = 0;
    var balanceText = '';
    var balanceDiscount = 0;
    //处理积分抵扣和余额支付
    if (orderConfig.PointsEnable) { //积分
      if (this.data.pointsSwitch.checked) {
        pointsText = this.data.pointsText;
        pointsDiscount = this.data.pointsDiscount;
      } else {
        if (orderConfig.CanMaxAmount >= (totalPrice - freight)) {
          //可抵用积分大于等于总金额显示总金额的积分
          var canUsePonitPrice = (Math.abs(Math.floor(totalPrice - freight))).toFixed(2);
          var canUsePoint = Math.floor((canUsePonitPrice * orderConfig.Rate)).toFixed(0);
          var canUseMoney = (canUsePoint / orderConfig.Rate).toFixed(2);
          pointsText = '可用' + canUsePoint + '积分抵￥' + canUseMoney;
          pointsDiscount = Number(canUseMoney);
          // pointsDiscount = Number((totalPrice - freight).toFixed(2));
        } else {
          //可抵用积分小于总金额显示可用积分
          pointsText = '可用' + orderConfig.MaxUsedPoints + '积分抵￥' + orderConfig.CanMaxAmount.toFixed(2);
          pointsDiscount = orderConfig.CanMaxAmount;
        }
      }

    }
    if (orderConfig.EnableBalance) { //余额
      if (orderConfig.Balance >= totalPrice) {
        //可用余额大于等于总金额
        balanceText = '余额支付￥' + totalPrice.toFixed(2) + '(可用￥' + orderConfig.Balance.toFixed(2) + ')';
        balanceDiscount = totalPrice;
        if (this.data.balanceSwitch.checked) { //如果已经勾选则需要设置一下payBalance
          this.setData({
            payBalance: parseFloat(balanceDiscount)
          });
        }
      } else {
        //可用余额小于总金额，暂不支持组合支付
      }
    }
    this.setData({
      pointsText: pointsText,
      pointsDiscount: pointsDiscount,
      balanceText: balanceText,
      balanceDiscount: balanceDiscount
    });
  },
  /*支付*/
  pay: function(orderId) {
    var that = this;
    filter.request({ //获取支付参数接口
      url: '/OrderSubmit/GetPayRequest',
      data: {
        orderIds: orderId
      },
      success: function(res) {
        var payArgs = res.Data;
        if (payArgs.Success) {
          wx.requestPayment({
            timeStamp: payArgs.TimeStamp,
            nonceStr: payArgs.NonceStr,
            package: payArgs.Package,
            signType: payArgs.SignType,
            paySign: payArgs.PaySign,
            success: function(payRes) {
              that.isPay = true;
              that.setData({
                btnIsLoading: false
              });
              wx.hideLoading();
              app.navigateTo('../order/orderlist', 'redirectTo');
            },
            fail: function(failRes) {
              util.showToast(that, {
                text: '支付失败',
                duration: 2000
              });
              that.setData({
                btnIsLoading: false
              });
              app.navigateTo('../order/orderlist', 'redirectTo');
              wx.hideLoading();
            }
          });
        } else {
          that.setData({
            btnIsLoading: false
          });
          wx.hideLoading();
          util.showToast(that, {
            text: '无法获取配置信息，原因是：'+ payArgs.ErrorMsg,
            duration: 2000
          });
        }
      },
      fail: function(res) {
        util.showToast(that, {
          text: '获取支付配置失败',
          duration: 2000
        });
      }
    });
  },
  wxPay: function() {
    var that = this;
    //判断收货地址
    var isSelectedAddress = this.data.isSelectedAddress;
    // 商家配送模式且为选择地址
    if (!isSelectedAddress) {
      util.showToast(that, {
        text: '请先选择收货地址再购买！',
        duration: 2000
      });
      return;
    }
    let {
      pageType,
      distributionMode,
      currentPickup,
    } = that.data;
    //不免邮的判断是否选择配送方式

    if (pageType == 'submitbuy') { //立即购买的
      let {
        isSelectedDistribution
      } = that.data;
      var templateId = that.data.templateId;
      var shipModelId = that.data.shipValue;
      var stockL = that.data.productStock;
      var countL = that.data.selectedCount;
      if (countL > stockL) {
        util.showToast(that, {
          text: '该商品库存不足！',
          duration: 2000
        });
        return;
      }
      // 验证是否选择配送方式
      if (!isSelectedDistribution) {
        util.showToast(that, {
          text: '请选择配送方式',
          duration: 2000
        });
        return;
      }
    } else { //购物车的
      var orderList = that.data.orderList;
      for (var i = 0; i < orderList.length; i++) {
        var templateId = orderList[i].TemplateId;
        var shipModelId = orderList[i].shipValue;
        var isSelectedDistribution = orderList[i].isSelectedDistribution;
        if (!isSelectedDistribution) {
          util.showToast(that, {
            text: '还有订单未选择配送方式',
            duration: 2000
          });
          return;
        }
      }
    }
    that.setData({
      btnIsLoading: true
    });
    wx.showLoading({
      title: '正在发起支付！'
    })
    if (!that.data.isCreateOrder) {
      //调接口创建订单并拿到创建的订单id
      if (pageType == 'submitbuy') {
        var item = [{
          ProductId: that.data.productId,
          SkuId: that.data.skuId ? that.data.skuId : that.data.productId,
          Quantity: that.data.selectedCount,
          ThumbnailsUrl: that.data.productImgUrl,
          ItemCostPrice: that.data.productTotal,
          ItemDescription: that.data.productInfo.ProductName
        }];
        filter.request({
          url: '/OrderSubmit/OrderSubmitPurchase',
          data: {
            ProductId: that.data.productId,
            RegionId: that.data.regionInfo.regionId,
            AdjustedFreight: that.data.freight,
            Templateid: distributionMode != 1 ? 0 : that.data.templateId, //上门自提同城配送templateId为0
            Province: that.data.regionInfo.regionProvince,
            City: that.data.regionInfo.regionCity,
            County: that.data.regionInfo.regionCounty,
            Address: that.data.regionInfo.regionAddress,
            CellPhone: that.data.regionInfo.regionCellPhone,
            ShippingModeId: distributionMode == 2 ? -2 : that.data.shipValue, //上门自提ShippingModeId为-2
            ShippingRegion: that.data.regionInfo.id,
            ShipTo: that.data.regionInfo.regionMemberName,
            Username: '',
            ActivitiesId: that.data.discountId,
            OrderItems: item,
            IsTimeLimitBuy: that.data.isTimeLimit == 1, //是否限时折扣
            PayPointToCash: that.data.payPointToCash, //积分抵扣金额
            PayBalance: that.data.payBalance, //余额支付金额
            CouponId: that.data.selectedCouponId, //优惠券id
            Remark: that.data.remarkValue,
            pickup_addressId: distributionMode == 2 ? currentPickup.Id : 0
          },
          success: function(createOrderRes) {
            if (createOrderRes.Code == 0) {
              //创建成功时设置that.isCreateOrder为true,btnIsLoading为false,
              //调接口获取支付参数
              //唤起支付（支付失败或者取消支付要跳转走）
              var orderId = createOrderRes.Data.OrderIDs; //订单号createOrderRes.Data
              that.setData({
                isCreateOrder: true,
                createOrderId: orderId
              });
              if (that.data.balanceSwitch.checked || (that.data.pointsSwitch.checked && parseFloat(that.data.totalPrice) == 0) || (parseFloat(that.data.totalPrice) == 0)) { //余额的或积分抵扣至付款金额为0的
                app.navigateTo('/pages/order/orderlist', 'redirectTo');
              } else {
                that.pay(orderId);
              }
            } else {
              wx.hideLoading();
              util.showToast(that, {
                text: '创建订单失败,' + createOrderRes.Msg,
                duration: 2000
              });
            }
          },
          fail: function(fRes) {
            that.setData({
              btnIsLoading: false
            });
            wx.hideLoading();
          }
        });
      } else {
        var requestOrderList = [];
        var orderList = that.data.orderList;
        orderList.forEach(function(item, index) {
          var orderItemList = [];
          var productIds = '';
          var ids = '';
          item.ShoppingCarts.forEach(function(sitem, sindex) {
            productIds += sitem.ProductId + ',';
            ids += sitem.Id + ',';
            orderItemList.push({
              ProductId: sitem.ProductId,
              SkuId: sitem.SkuId,
              Quantity: sitem.Quantity,
              ThumbnailsUrl: sitem.Product.ImageUrl1,
              ItemCostPrice: parseFloat(sitem.skuPrice),
              ItemDescription: sitem.Product.ProductName
            });
          });
          productIds = productIds.substring(0, productIds.length - 1);
          ids = ids.substring(0, ids.length - 1);
          requestOrderList.push({
            ProductIds: productIds,
            RegionId: that.data.regionInfo.regionId,
            AdjustedFreight: item.freight,
            Templateid: item.distributionMode != 1 ? 0 : item.TemplateId,
            ShoppingCartIds: ids,
            Address: that.data.regionInfo.regionAddress,
            ShipTo: that.data.regionInfo.regionMemberName,
            CellPhone: that.data.regionInfo.regionCellPhone,
            ShippingRegion: that.data.regionInfo.id,
            ShippingModeId: item.distributionMode == 2 ? -2 : item.shipValue,
            Username: '',
            OrderItems: orderItemList,
            //ActivitiesName: item.discountText,
            ActivitiesId: item.discountId,
            CouponCode: item.selectedCouponId, //优惠券id
            PointToCash: that.data.payPointToCash, //积分抵扣金额
            BalancePayMoneyTotal: that.data.payBalance, //余额支付金额
            Remark: item.remarkValue,
            // pickup_addressId: item.distributionMode == 2 ? item.currentPickup.Id : 0
            PickUpID: item.distributionMode == 2 ? item.currentPickup.Id : 0
          });
          that.setData({
            remarkList: requestOrderList
          })
        });
        filter.request({
          url: '/ShopCart/ShopCartToOrder',
          data: {
            modellist: requestOrderList
          },
          success: function(createOrderRes) {
            if (createOrderRes.Code == 0) {
              var orderId = createOrderRes.Data; //订单号
              that.setData({
                isCreateOrder: true,
                createOrderId: orderId
              });
              if (that.data.balanceSwitch.checked || (that.data.pointsSwitch.checked && parseFloat(that.data.totalPrice) == 0) || (parseFloat(that.data.totalPrice) == 0)) { //余额的或积分抵扣至付款金额为0的
                app.navigateTo('/pages/order/orderlist', 'redirectTo');
              } else {
                that.pay(orderId);
              }
            } else {
              wx.hideLoading();
              util.showToast(that, {
                text: '创建订单失败,' + createOrderRes.Msg,
                duration: 2000
              });
            }
          },
          fail: function(fRes) {
            that.setData({
              btnIsLoading: false
            });
            wx.hideLoading();
          }
        });
      }
    } else {
      var orderId = that.data.createOrderId;
      that.pay(orderId);
    }
  },
  // switch
  handleXkdSwitchChange(e) {
    let componentId = e.componentId;
    let checked = e.checked;
    let switchType = e.switchType;

    if (componentId == 'sync') {
      // 同步开关
      this.setData({
        [`${switchType}.checked`]: checked
      });
      this.switchHandler(switchType);
    } else if (componentId == 'async') {
      // 异步开关
      this.setData({
        [`${switchType}.loading`]: true
      });
      setTimeout(() => {
        this.setData({
          [`${switchType}.loading`]: false,
          [`${switchType}.checked`]: checked
        });
      }, 500);
    }
  },
  switchHandler(switchType) {
    switch (switchType) {
      case 'pointsSwitch':
        if (this.data.pointsSwitch.checked) { //选中积分抵扣
          this.setData({
            payPointToCash: this.data.pointsDiscount,
            totalPointDiscount: this.data.pointsDiscount.toFixed(2)
          });
        } else {
          this.setData({
            payPointToCash: 0,
            totalPointDiscount: '0.00'
          });
        }
        this.calcDiscount();
        break;
      case 'balanceSwitch':
        if (this.data.balanceSwitch.checked) { //选中余额支付
          this.setData({
            payBalance: this.data.balanceDiscount,
            payText: '余额支付'
          });
        } else {
          this.setData({
            payBalance: 0,
            payText: '微信支付'
          });
        }
        break;
    }
  },
  couponMode() {
    this.setData({
      showCouponPopup: 'show'
    });
  },
  cartCouponMode(e) {
    let index = parseInt(e.currentTarget.dataset.couponindex);
    let orderList = this.data.orderList;
    let couponList = orderList[index].couponList;
    this.setData({
      showCouponPopup: 'show',
      currentCouponIndex: index,
      couponList: couponList
    });
  },
  closeCouponPopup() {
    this.setData({
      showCouponPopup: ''
    })
  },
  sendFormId(e) {
    app.sendFormId(e.detail.formId, 0);
  }
}))