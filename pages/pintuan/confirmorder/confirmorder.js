// pages/pintuan/confirmorder/confirmorder.js
var app = getApp();
var filter = app;
var util = require('../../../utils/util.js');
Page({
    /**
     * 页面的初始数据
     */
    data: {
        loadComplete: false,
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
        SpellGroupData: {},
        freight: 0,
        AmountPayable: 0,
        Balance: 0,
        interfaceOkCount: 0,
        btnText: "确认支付",
        ActuallyPaidAmount: 0,
        paymentMethod: 'weChat',
        payPopup: '',
        payMethod: 'wxPay',
        copyright: {},
        CanUseBalance:false
    },
    spellGroupRecordId: 0,
    showPayPopup() {
        this.setData({ payPopup: 'show' })
    },
    closePayPopup() {
        this.setData({ payPopup: '' })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        this.spellGroupRecordId = options.spellGroupRecordId;
        if (options.shippingId == undefined) return;
        var that = this;
        var nums = options.selectedCount;
        var activityId = options.activityId;
        var a = 5;
        app.request({
            url: '/SpellGroup/SpellGroupDetails',
            requestDomain: 'ymf_domain',
            data: {
                activityId: activityId
            },
            success: function (res) {
                if (res.Code == 0) {
                    that.data.interfaceOkCount += 1;
                    var data = JSON.parse(res.Data);
                    var GroupPrice, size, color, skus = [];
                    var SpellGroupData = data.SpellGroupData;
                    var ProductName = data.SpellGroupData.ProductName;
                    var ProductImg = data.SpellGroupData.ProductImg;
                    data.SpellGroupData.SpellGroupSku.forEach(function (value) {
                        if (options.skuId == value.SkuId) {
                            GroupPrice = value.GroupPrice.toFixed(2);
                        }
                    });
                    var total = (nums * GroupPrice).toFixed(2);
                    data.ProductData.ProductSKUs.forEach(function (value) {
                        if (options.skuId == value.SkuId) {
                            value.ProductSKU_Propertys.forEach(function (sku) {
                                skus.push(sku.PName + "：" + sku.VName);
                            });
                        };
                    });
                    var AmountPayable = ((nums * GroupPrice) + Number(that.data.freight)).toFixed(2);
                    var templateId = data.SpellGroupData.FreightTemplateId;
                    that.setData({
                        SpellGroupData: {
                            GroupPrice: GroupPrice,
                            skus: skus,
                            ProductName: ProductName,
                            ProductImg: ProductImg,
                            ProductNum: nums,
                            total: total
                        },
                        freight: Number(that.data.freight).toFixed(2),
                        activityId: activityId,
                        skuId: options.skuId,
                        ProductId: data.SpellGroupData.ProductId,
                        hasDistribution: templateId > 0,
                        shipText: templateId > 0 ? '请选择配送方式' : '包邮',
                        templateId: templateId,
                        AmountPayable: AmountPayable
                    });
                    // util.contentShow(that, that.data.interfaceOkCount, 2);
                    //获取账户余额
                    app.request({
                        url: '/Member/GetMemberInfo',
                        requestDomain: 'ymf_domain',
                        data: {},
                        success: function (data) {
                            if (data.Code == 0) {
                                that.data.interfaceOkCount += 1;
                                // 检查是否可以余额支付
                                var balance = Number(data.Data.AvailableAmount);
                                var amountPayable = Number(that.data.AmountPayable);
                                var isBalance = (balance >= amountPayable);
                                that.setData({
                                    isBalance: isBalance,
                                    Balance: balance.toFixed(2)
                                })
                                // util.contentShow(that, that.data.interfaceOkCount, 2);
                            }
                        },
                        complete: function () {
                            that.setData({ loadComplete: true });
                        }
                    })
                };
            }
        })
      app.request({
        url: '/Member/CanUseBalance',
        requestDomain: 'ymf_domain',
        success: function (data) {
          if (data.Code == 0) {
            //data = JSON.parse(data.Data);
            if(data.Data){
              that.setData({
                CanUseBalance:true
              })
            }
          } else {
            util.showToast(that, {
              text: data.Msg,
              duration: 2000
            });
          }
        },
        fail: function () {
          util.showToast(that, {
            text: '请求数据失败',
            duration: 2000
          });
        }
      })
    },
    /*添加收货地址*/
    addNewAddress: function () {
        var that = this;
        wx.showModal({
            title: '提示',
            content: '是否使用微信收货地址？',
            confirmText: '是',
            cancelText: '否',
            success: function (res) {
                if (res.confirm) {//使用微信地址
                    that.chooseAddress();
                } else if (res.cancel) {//使用销客多地址
                    // wx.navigateTo({
                    //     url: '../../address/address?addressId=0'//&type=' + that.data.pageType + '&productId=' + that.data.productId + '&skuId=' + that.data.skuId + '&selectedCount=' + that.data.selectedCount + '&selectIds=' + that.data.selectIds
                    // });
                    app.navigateTo('../../address/address?addressId=0', 'navigateTo');
                }
            }
        });
    },
    closePopup: function () {
        this.setData({
            isPopupShow: 'hide'
        })
    },
    /*选择配送方式*/
    cartDeliveryMode: function (e) {
        var that = this;
        var templateId = that.data.templateId;
        if (templateId == 0) return;
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
            success: function (res) {
                var deliveryList = res.Data;
                that.setData({
                    deliveryList: deliveryList,
                    isPopupShow: 'show'
                });
            },
            complete: function (res) {
                wx.hideLoading();
            }
        });
    },
    selectDeliveryMode: function (e) {
        var index = e.currentTarget.dataset.index;
        var value = e.currentTarget.dataset.value;
        var key = e.currentTarget.dataset.key;
        this.data.deliveryList.map(function (item) {
            item.isChecked = '';
        });
        this.data.deliveryList[index].isChecked = 'checked';
        if (value == -2) {
            this.setData({
                templateId: 0
            });
        }
        this.setData({
            deliveryList: this.data.deliveryList,
            shipText: key,
            shipValue: value,
            isPopupShow: 'hide'
        });
        //todo:要去计算运费！！！！！
        var templateId = this.data.templateId;
        var productNum = this.data.SpellGroupData.ProductNum;
        var sumPrice = this.data.SpellGroupData.total;
        this.getFreight(templateId, value, '', productNum, sumPrice);
    },
    chooseAddress: function () {
        var that = this;
        wx.chooseAddress({
            success: function (successData) {
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
            fail: function (failData) {

            }
        });
    },
    addAddress: function () {
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
            success: function (res) {
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
    /*选择收货地址*/
    goAddressList: function () {
        // wx.navigateTo({
        //     url: '../../addresslist/addresslist'//?type=' + that.data.pageType + '&productId=' + that.data.productId + '&skuId=' + that.data.skuId + '&selectedCount=' + that.data.selectedCount + '&selectIds=' + that.data.selectIds
        // });
        app.navigateTo('../../addresslist/addresslist', 'navigateTo');
    },
    remarkinput: function (e) {
        var val = e.detail.value;
        this.data.reMark = val;
    },
    selectPayMethod: function (e) {
        this.setData({
            payMethod: e.target.dataset.paymethod
        })
    },
    // 余额支付
    balancePay: function () {
        this.showPayPopup();
        var that = this;
        var templateId = that.data.templateId;
        var shipModelId = that.data.shipValue ? that.data.shipValue : 0;
        var shipId = that.data.regionInfo.id;
        if (shipId == 0) {
            util.showToast(that, {
                text: '请先添加收货地址',
                duration: 2000
            });
            return;
        }
        if (templateId > 0 && shipModelId <= 0) {
            util.showToast(that, {
                text: '还没有选择配送方式',
                duration: 2000
            });
            return;
        }
        wx.showLoading({
            title: '发起支付中..',
        })
        that.setData({
            btnIsLoading: true
        });
        app.request({
            url: '/SpellGroup/GetOrderId',
            requestDomain: 'ymf_domain',
            data: {},
            success: function (data) {
                if (data.Code == 0) {
                    var payOrderId = data.Data;
                    app.request({
                        url: '/SpellGroup/BalancePay',
                        requestDomain: 'ymf_domain',
                        data: {
                            spellGroupRecordId: that.spellGroupRecordId,
                            activityId: that.data.activityId,
                            skuId: that.data.skuId,
                            quantity: that.data.SpellGroupData.ProductNum,
                            shippingRegion: shipId,
                            shipModelId: shipModelId,
                            reMark: that.data.reMark ? that.data.reMark : '',
                            payOrderId: payOrderId
                        },
                        success: function (data) {
                            if (data.Code == 0) {
                                // wx.redirectTo({
                                //     url: '/pages/pintuan/paymentok/paymentok?orderId=' + payOrderId
                                // })
                                app.navigateTo('/pages/pintuan/paymentok/paymentok?orderId=' + payOrderId, 'redirectTo');
                            } else {
                                util.showToast(that, {
                                    text: data.Msg,
                                    duration: 2000
                                });
                            }
                        },
                        fail: function () {
                            util.showToast(that, {
                                text: '支付失败！',
                                duration: 2000
                            });
                        },
                        complete: function () {
                            wx.hideLoading();
                            that.setData({
                                btnIsLoading: false
                            });
                        }
                    })
                } else {
                    wx.hideLoading();
                    that.setData({
                        btnIsLoading: false
                    });
                    util.showToast(that, {
                        text: data.Msg,
                        duration: 2000
                    });
                }
            },
            fail: function () {
                wx.hideLoading();
                util.showToast(that, {
                    text: '获取订单号失败',
                    duration: 2000
                });
                that.setData({
                    btnIsLoading: false
                });
            }
        })

    },
    /*微信支付*/
    wxPay: function () {
        this.showPayPopup();
        var that = this;
        var templateId = that.data.templateId;
        var shipModelId = that.data.shipValue ? that.data.shipValue : 0;
        var shipId = that.data.regionInfo.id;
        if (shipId == 0) {
            util.showToast(that, {
                text: '请先添加收货地址',
                duration: 2000
            });
            return;
        }
        if (templateId > 0 && shipModelId <= 0) {
            util.showToast(that, {
                text: '还没有选择配送方式',
                duration: 2000
            });
            return;
        }
        wx.showLoading({
            title: '发起支付中..',
        })
        that.setData({
            btnIsLoading: true
        });
        app.request({
            url: '/SpellGroup/GetOrderId',
            requestDomain: 'ymf_domain',
            data: {},
            success: function (data) {
                if (data.Code == 0) {
                    var payOrderId = data.Data;
                    filter.request({//获取支付参数接口
                        url: '/SpellGroup/JoinSpellGroup',
                        requestDomain: 'ymf_domain',
                        data: {
                            spellGroupRecordId: that.spellGroupRecordId,
                            activityId: that.data.activityId,
                            skuId: that.data.skuId,
                            quantity: that.data.SpellGroupData.ProductNum,
                            shippingRegion: shipId,
                            shipModelId: shipModelId,
                            canBalacePay: false,
                            reMark: that.data.reMark ? that.data.reMark : '',
                            payOrderId: payOrderId
                        },
                        success: function (res) {
                            var payArgs = res;
                            if (payArgs.Success) {
                                wx.requestPayment({
                                    timeStamp: payArgs.TimeStamp,
                                    nonceStr: payArgs.NonceStr,
                                    package: payArgs.Package,
                                    signType: payArgs.SignType,
                                    paySign: payArgs.PaySign,
                                    success: function (payRes) {
                                        that.isPay = true;
                                        // 支付成功
                                        // wx.redirectTo({
                                        //     url: '/pages/pintuan/paymentok/paymentok?orderId=' + payOrderId
                                        // })
                                        app.navigateTo('/pages/pintuan/paymentok/paymentok?orderId=' + payOrderId, 'redirectTo');
                                    },
                                    fail: function (failRes) {
                                        util.showToast(that, {
                                            text: '取消支付',
                                            duration: 2000
                                        });
                                    },
                                    complete: function () {
                                        wx.hideLoading();
                                        that.setData({
                                            btnIsLoading: false
                                        });
                                    }
                                });
                            } else {
                                that.setData({
                                    btnIsLoading: false
                                });
                                wx.hideLoading();
                                util.showToast(that, {
                                    text: '获取支付配置失败',
                                    duration: 2000
                                });
                            }
                        },
                        fail: function (res) {
                            wx.hideLoading();
                            util.showToast(that, {
                                text: '获取支付配置失败',
                                duration: 2000
                            });
                            that.setData({
                                btnIsLoading: false
                            });
                        }
                    });
                } else {
                    wx.hideLoading();
                    that.setData({
                        btnIsLoading: false
                    });
                    util.showToast(that, {
                        text: data.Msg,
                        duration: 2000
                    });
                }
            },
            fail: function () {
                wx.hideLoading();
                that.setData({
                    btnIsLoading: false
                });
                util.showToast(that, {
                    text: '获取订单号失败',
                    duration: 2000
                });
            }
        })
    },
    selectPay: function () {
        this.showPayPopup();
    },
    onShow: function () {
        app.buttomCopyrightSetData(this, false, 'close');
        this.setData({
            isProbationShop: wx.getStorageSync("storeType")
        })
        var that = this;
        filter.request({
            url: '/MemberAddress/GetDefaultAddress',
            data: {},
            success: function (res) {
                if (res.Code == 0 && res.Data != null) {
                    that.setData({
                        isSelectedAddress: true,
                        isAuthAddress: true,
                        regionInfo: {
                            regionProvince: res.Data.Province,
                            regionCity: res.Data.City,
                            regionCounty: res.Data.County,
                            regionStreet: res.Data.StreetName,
                            regionAddress: res.Data.Address,
                            regionId: res.Data.RegionId,
                            regionMemberName: res.Data.ShipTo,
                            regionCellPhone: res.Data.CellPhone,
                            id: res.Data.Id
                        }
                    })
                    that.options.shippingId = res.Data.Id;
                } else {
                    that.options.shippingId = 0;
                }
                that.onLoad(that.options);
            }
        })
    },
    /*获取运费*/
    getFreight: function (templateId, shipModelId, cartIds, productNum, sumPrice, currentOrderIndex) {
        var that = this;
        var productId = that.data.ProductId ? that.data.ProductId : '';
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
            success: function (res) {
                if (res.Code == 0) {
                    var totalFreight = parseFloat(res.Data);
                    var productTotal = parseFloat(that.data.SpellGroupData.total);
                    var totalPrice = productTotal + totalFreight;
                    that.setData({//更新运费,合计
                        freight: totalFreight.toFixed(2),
                        AmountPayable: totalPrice.toFixed(2)
                    });
                }
            }
        });
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    }
})