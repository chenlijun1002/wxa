// pages/laddergroupon/confirmorder/confirmorder.js
var app = getApp();
var filter = app;
var util = require('../../../utils/util.js');
Page({
    data: {
        isLogo: wx.getStorageSync("IsOpenCopyRight"),
        logoSrc: wx.getStorageSync("copyRightLogo"),
        loadComplete: false,
        isSelectedAddress: false,
        isAuthAddress: false,
        isPopupShow: '',
        showPayPopup: '',
        payType: -1,
        payEndTime: '',
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
        freight: 0,
        shipText: '请选择',
        shipValue: 0,
        Remark: '',
        copyright: {},
      CanUseBalance:false
    },
    onLoad: function (options) {
        const that = this;
        if (options.shippingId == undefined) return;
        const orderId = options.orderId;
        app.request({
            url: '/StairGroup/OrderInfo',
            requestDomain: 'ymf_domain',
            data: {
                orderId
            },
            success: function (res) {
                if (res.Code == 0) {
                    let data = JSON.parse(res.Data);
                    let AmountPayable = data.OrderData.SalePrice * data.OrderData.Quantity + Number(data.OrderData.Freight);
                    that.setData({
                        stairGroupInfo: {
                            SalePrice: Number(data.OrderData.SalePrice).toFixed(2),
                            Quantity: data.OrderData.Quantity,
                            SkuName: data.SkuName,
                            SkuId: data.OrderData.SkuId,
                            ProductName: data.OrderData.StairGroup.ProductName,
                            ProductId: data.OrderData.StairGroup.ProductId,
                            ProductImg: data.OrderData.StairGroup.ProductImg,
                            ProductNum: data.OrderData.Quantity,
                            CreateDateTime: data.OrderData.CreateDateTime,
                            ActivityTag: data.OrderData.StairGroup.ActivityTag,
                        },
                        orderId,
                        templateId: data.OrderData.StairGroup.FreightTemplateId,
                        AmountPayable: AmountPayable.toFixed(2),
                        freight: Number(data.OrderData.Freight).toFixed(2)
                    })
                    if (that.data.templateId == 0) {
                        that.setData({
                            shipText: '包邮'
                        })
                    }
                    var time = new Date(that.data.stairGroupInfo.CreateDateTime.replace(/T/, ' ').replace(/\-/g, '/')).getTime();                    
                    // var payTime = new Date(time + 30 * 60 * 1000).toLocaleString('chinese', {
                    //     hour12: false
                    // });   
                    var payTime = new Date(time + 30 * 60 * 1000);
                    let timer = setInterval(() => {
                      var tTime = payTime.getFullYear() + '/' + (payTime.getMonth() + 1) + '/' + payTime.getDate() + ' ' + payTime.getHours() + ':' + payTime.getMinutes() + ':' + payTime.getSeconds();

                      console.log("tTime", tTime)   
                      var payEndTime = util.timeDifference(tTime);                       
                        if (payEndTime.toString() == '00:00:00') {
                            clearInterval(timer);
                        }
                        that.setData({
                            payEndTime
                        });
                    }, 1000);
                }
            },
            complete() {
                that.setData({
                    loadComplete: true
                })
            }
        })
        app.request({
          url: '/Member/CanUseBalance',
          requestDomain: 'ymf_domain',
          success: function (data) {
            if (data.Code == 0) {
              //data = JSON.parse(data.Data);
              if (data.Data) {
                that.setData({
                  CanUseBalance: true
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
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    onShow: function () {
        app.buttomCopyrightSetData(this, false, 'close');
        this.setData({
            isProbationShop: wx.getStorageSync("storeType")
        })
        const that = this;
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
                            id: res.Data.Id,
                            Address: res.Data.Province + res.Data.City + res.Data.County + res.Data.StreetName + res.Data.Address
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
    //获取运费方式列表
    selectDeliveryType() {
        const that = this;
        const templateId = that.data.templateId;
        var shipId = that.data.regionInfo.id;
        if (templateId == 0) {
            return;
        }
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
        app.request({
            url: '/OrderSubmit/GetFreeShipping',
            data: {
                cityName: that.data.regionInfo.regionCity,
                templateid: templateId,
                ShippingRegion: shipId,
                SupplyShip: false,
                ProxyUserID: 0
            },
            success: function (res) {
                const deliveryList = res.Data;
                that.setData({
                    deliveryList,
                    isPopupShow: 'show'
                });
            },
            complete: function (res) {
                wx.hideLoading();
            }
        });
    },
    //选择运费方式
    selectDeliveryMode: function (e) {
        const index = e.currentTarget.dataset.index;
        const value = e.currentTarget.dataset.value;
        const key = e.currentTarget.dataset.key;
        this.data.deliveryList.map(function (item) {
            item.isChecked = '';
        });
        this.data.deliveryList[index].isChecked = 'checked';
        if (value == 0) {
            this.setData({
                templateId: 0
            });
        }
        this.setData({
            deliveryList: this.data.deliveryList,
            shipText: key,
            shipValue: value,
            isPopupShow: ''
        });
        //计算运费
        const templateId = this.data.templateId;
        const productNum = this.data.stairGroupInfo.ProductNum;
        const sumPrice = this.data.AmountPayable;
        this.getFreight(templateId, value, '', productNum, sumPrice);
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
                if (res.confirm) { //使用微信地址
                    that.chooseAddress();
                } else if (res.cancel) { //使用销客多地址
                    // wx.navigateTo({
                    //     url: '../../address/address?addressId=0'
                    // });
                    app.navigateTo('../../address/address?addressId=0', 'navigateTo');
                }
            }
        });
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
        //     url: '../../addresslist/addresslist'
        // });
        app.navigateTo('../../addresslist/addresslist', 'navigateTo');
    },
    /*计算运费*/
    getFreight: function (templateId, shipModelId, cartIds, productNum, sumPrice, currentOrderIndex) {
        const that = this;
        const productId = that.data.stairGroupInfo.ProductId ? that.data.stairGroupInfo.ProductId : '';
        const regionId = that.data.regionInfo.regionId;
        const cityName = that.data.regionInfo.regionCity;
        const regionName = that.data.regionInfo.regionCounty;
        const SkuId = that.data.stairGroupInfo.SkuId ? that.data.stairGroupInfo.SkuId : '';
        filter.request({
            url: '/Product/CountFreight',
            requestDomain: 'default_domain',
            data: {
                ProductId: productId,
                CityName: cityName,
                Regionid: regionName,
                TemplateId: templateId,
                ShipModelId: shipModelId,
                CartIds: cartIds,
                SkuId,
                ProductNum: productNum,
                SumPrice: sumPrice
            },
            success: function (res) {
                if (res.Code == 0) {
                    let totalFreight = parseFloat(res.Data);
                    let AmountPayable = (parseFloat(that.data.stairGroupInfo.SalePrice) * that.data.stairGroupInfo.Quantity + res.Data).toFixed(2);
                    that.setData({ //更新运费,合计
                        freight: totalFreight.toFixed(2),
                        AmountPayable
                    })
                } else {
                    util.showToast(that, {
                        text: '接口访问失败' + res.Msg,
                        duration: 2000
                    });
                }
            }
        });
    },
    // 留言
    remarkinput: function (e) {
        const Remark = e.detail.value;
        this.setData({
            Remark
        })
    },
    selectPayType(e) {
        const payType = e.currentTarget.dataset.paytype;
        if (payType == this.data.payType) return;
        if (!this.data.isBalance && payType == 0) {
            util.showToast(this, {
                text: '余额不足',
                duration: 2000
            });
            return;
        }
        this.setData({
            payType
        })
    },
    closePopup() {
        this.setData({
            isPopupShow: ''
        })
    },
    closePayPopup() {
        this.setData({
            showPayPopup: ''
        })
    },
    //提交
    submit(e) {
        const that = this;
        const templateId = that.data.templateId,
            shipModelId = that.data.shipValue,
            shipId = that.data.regionInfo.id;
        if (shipId == 0) {
            util.showToast(that, {
                text: '请先添加收货地址',
                duration: 2000
            });
            return;
        }
        if (templateId > 0 && shipModelId <= 0) {
            util.showToast(that, {
                text: '请选择配送方式',
                duration: 2000
            });
            return;
        }
        //获取账户余额
        app.request({
            url: '/Member/GetMemberInfo',
            requestDomain: 'ymf_domain',
            data: {},
            success: function (data) {
                if (data.Code == 0) {
                    // 检查是否可以余额支付
                    let balance = Number(data.Data.AvailableAmount);
                    let amountPayable = Number(that.data.AmountPayable);
                    let isBalance = (balance >= amountPayable);
                    that.setData({
                        isBalance: isBalance,
                        Balance: balance.toFixed(2),
                        payType: isBalance ? 0 : 1
                    })
                } else {
                    util.showToast(that, {
                        text: '余额接口访问失败',
                        duration: 1000
                    });
                    that.setData({
                        isBalance: false,
                        Balance: '0.00'
                    })
                }
            },
            complete() {
                that.setData({
                    showPayPopup: 'show'
                });
            }
        })
    },
    requestPay() {
        const that = this;
        const payType = that.data.payType,
            mark = that.data.Remark,
            orderId = that.data.orderId,
            shipModelId = that.data.shipValue,
            shippingRegion = that.data.regionInfo.id;
        wx.showLoading({
            title: '正在支付'
        })
        if (payType == 0) {
            app.request({
                url: '/StairGroup/GetBalancePayArgs',
                requestDomain: 'ymf_domain',
                data: {
                    mark,
                    orderId,
                    shipModelId,
                    shippingRegion
                },
                success(res) {
                    wx.hideLoading();
                    if (res.Code == 0) {
                        util.showToast(that, {
                            text: '支付成功',
                            successIcon: true,
                            duration: 1000,
                            callBack() {
                                // wx.redirectTo({
                                //     url: `/pages/stairgroup/groupsuccess/groupsuccess?orderId=${orderId}`
                                // })
                                app.navigateTo(`/pages/stairgroup/groupsuccess/groupsuccess?orderId=${orderId}`, 'redirectTo');
                            }
                        });
                    } else if (res.Msg == 101) { //库存不足
                        // wx.redirectTo({
                        //     url: '/pages/stairgroup/groupfail/groupfail?pageStatus=1'
                        // })
                        app.navigateTo('/pages/stairgroup/groupfail/groupfail?pageStatus=3', 'redirectTo');
                    } else if (res.Msg == 102) { //订单过期
                        // wx.redirectTo({
                        //     url: '/pages/stairgroup/groupfail/groupfail?pageStatus=2'
                        // })
                        app.navigateTo('/pages/stairgroup/groupfail/groupfail?pageStatus=2', 'redirectTo');
                    } else if (res.Msg == 103) { //活动结束
                        // wx.redirectTo({
                        //     url: '/pages/stairgroup/groupfail/groupfail?pageStatus=4',
                        // })
                        app.navigateTo('/pages/stairgroup/groupfail/groupfail?pageStatus=4', 'redirectTo');
                    }
                },
                complete() {
                    that.setData({
                        showPayPopup: ''
                    })
                }
            })
        } else if (payType == 1) {
            app.request({
                url: '/StairGroup/GetWxPayArgs',
                requestDomain: 'ymf_domain',
                data: {
                    mark,
                    orderId,
                    shipModelId,
                    shippingRegion
                },
                success(res) {
                    wx.hideLoading();
                    if (res.Success) {
                        wx.requestPayment({
                            timeStamp: res.TimeStamp,
                            nonceStr: res.NonceStr,
                            package: res.Package,
                            signType: res.SignType,
                            paySign: res.PaySign,
                            success: function (payRes) {
                                app.request({
                                    url: '/StairGroup/OrderPayResult',
                                    requestDomain: 'ymf_domain',
                                    data: {
                                        orderId
                                    },
                                    success(res) {
                                        wx.hideLoading();
                                        res.Data = JSON.parse(res.Data)
                                        console.log(res.Data)
                                        if (res.Data.OrderStatus == 2) {
                                            app.navigateTo(`/pages/stairgroup/groupsuccess/groupsuccess?orderId=${orderId}`, 'redirectTo');
                                        } else if (res.Data.OrderStatus == 4) {
                                            if (res.Data.CloseMark == 101) { //库存不足
                                                app.navigateTo('/pages/stairgroup/groupfail/groupfail?pageStatus=3', 'redirectTo');
                                            } else if (res.Data.CloseMark == 102) { //订单过期
                                                app.navigateTo('/pages/stairgroup/groupfail/groupfail?pageStatus=2', 'redirectTo');
                                            } else if (res.Data.CloseMark == 103) { //货款原路返回
                                                app.navigateTo('/pages/stairgroup/groupfail/groupfail?pageStatus=3', 'redirectTo');
                                            }
                                        }
                                    }
                                })
                            },
                            fail: function (failRes) {
                                wx.hideLoading();
                                util.showToast(that, {
                                    text: '取消支付',
                                    duration: 2000
                                });
                            }
                        });
                    } else if (res.Msg == 101) { //库存不足
                        // wx.redirectTo({
                        //     url: '/pages/stairgroup/groupfail/groupfail?pageStatus=1',
                        // })
                        app.navigateTo('/pages/stairgroup/groupfail/groupfail?pageStatus=3', 'redirectTo');
                    } else if (res.Msg == 102) { //订单过期
                        // wx.redirectTo({
                        //     url: '/pages/stairgroup/groupfail/groupfail?pageStatus=2',
                        // })
                        app.navigateTo('/pages/stairgroup/groupfail/groupfail?pageStatus=2', 'redirectTo');
                    } else if (res.Msg == 103) { //活动结束
                        // wx.redirectTo({
                        //     url: '/pages/stairgroup/groupfail/groupfail?pageStatus=4',
                        // })
                        app.navigateTo('/pages/stairgroup/groupfail/groupfail?pageStatus=4', 'redirectTo');
                    }
                },
                complete() {
                    that.setData({
                        showPayPopup: ''
                    })
                }
            })
        }
    }
})