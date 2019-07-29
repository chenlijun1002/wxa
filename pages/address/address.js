//新增和编辑收货地址
var app = getApp();
var filter = app;
var util = require('../../utils/util.js');
Page({
    /**
     * 页面的初始数据
     */
    data: {
        id: 0,
        interfaceOkCount: 0,
        provinceArray: [],
        provinceObjArray: [],
        cityArray: [],
        cityObjArray: [],
        countryArray: [],
        countryObjArray: [],
        streetArray: [],
        streetObjArray: [],
        province: '--请选择--',
        cellPhone: '',
        city: '',
        country: '',
        street: '',
        provinceId: '',
        cityId: '',
        countryId: '',
        streetId: '',
        shipTo: '',
        cellPhone: '',
        address: '',
        isDefault: false,
        isShowToast: false,
        toastText: {}
    },
    onLoad: function (options) {
        var id = options.addressId;
        var that = this;
        that.setData({
            id: id
        });
        if (wx.getStorageSync('isLogin')) {
            if (this.data.showAuthorization) {
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
    initData() {
        const that = this;
        let id = this.data.id;
        wx.showLoading({
            title: '省会加载中！',
        });
        filter.request({
            url: '/MemberAddress/GetRegionInfo',
            data: {
                parentRegionId: 0
            },
            success: function (res) {
                res.Data.forEach(function (provinceItem) {
                    that.data.provinceArray.push(provinceItem.RegionName);
                })
                that.setData({
                    provinceObjArray: res.Data,
                    provinceArray: that.data.provinceArray
                });
                if (id > 0) {//编辑的
                    wx.setNavigationBarTitle({
                        title: '编辑收货地址'
                    });
                    wx.showLoading({
                        title: '加载中！',
                    });
                    filter.request({
                        url: '/MemberAddress/GetAddress',
                        data: {
                            id: id
                        },
                        success: function (addRes) {
                            if (addRes.Code == 0) {
                                //拿到省市区id，名字，setData
                                that.setData({
                                    shipTo: addRes.Data.ShipTo,
                                    cellPhone: addRes.Data.CellPhone,
                                    address: addRes.Data.Address,
                                    isDefault: addRes.Data.IsDefault
                                });
                                wx.showLoading({
                                    title: '加载中！',
                                });
                                filter.request({
                                    url: '/MemberAddress/GetRegionInfo',
                                    data: {
                                        parentRegionId: addRes.Data.ProvinceId
                                    },
                                    success: function (res) {
                                        res.Data.forEach(function (cityItem) {
                                            that.data.cityArray.push(cityItem.RegionName);
                                        });
                                        that.setData({
                                            cityObjArray: res.Data,
                                            cityArray: that.data.cityArray,
                                            province: addRes.Data.ProvinceName == '' ? '--请选择--' : addRes.Data.ProvinceName,
                                            provinceId: addRes.Data.ProvinceId
                                        });
                                    },
                                    complete: function (res) {
                                        wx.hideLoading();
                                    }
                                });
                                //cityId
                                wx.showLoading({
                                    title: '加载中！',
                                });
                                filter.request({
                                    url: '/MemberAddress/GetRegionInfo',
                                    data: {
                                        parentRegionId: addRes.Data.CityId
                                    },
                                    success: function (res) {
                                        res.Data.forEach(function (cityItem) {
                                            that.data.countryArray.push(cityItem.RegionName);
                                        });
                                        that.setData({
                                            countryObjArray: res.Data,
                                            countryArray: that.data.countryArray,
                                            city: addRes.Data.CityName == '' ? '--请选择--' : addRes.Data.CityName,
                                            cityId: addRes.Data.CityId
                                        });
                                    },
                                    complete: function (res) {
                                        wx.hideLoading();
                                    }
                                });
                                //countryId
                                wx.showLoading({
                                    title: '加载中！',
                                });
                                filter.request({
                                    url: '/MemberAddress/GetRegionInfo',
                                    data: {
                                        parentRegionId: addRes.Data.RegionId
                                    },
                                    success: function (res) {
                                        res.Data.forEach(function (cityItem) {
                                            that.data.streetArray.push(cityItem.RegionName);
                                        });
                                        that.setData({
                                            streetObjArray: res.Data,
                                            streetArray: that.data.streetArray,
                                            country: addRes.Data.CountyName,
                                            countryId: addRes.Data.RegionId,
                                            street: addRes.Data.StreetName == '' ? addRes.Data.CountyName == '' ? addRes.Data.StreetName : res.Data.length <= 0 ? addRes.Data.StreetName : '--请选择--' : addRes.Data.StreetName,
                                            streetId: addRes.Data.StreetId
                                        });
                                    },
                                    complete: function (res) {
                                        wx.hideLoading();
                                    }
                                });
                            }
                        },
                        complete: function (res) {
                            //wx.hideLoading();
                        }
                    });
                } else {
                    wx.hideLoading();
                }
            }
        });
    },
    switchChange: function (e) {
        this.setData({
            isDefault: e.detail.value
        });
    },
    usernameinput: function (e) {
        var val = e.detail.value;
        this.data.shipTo = val;
    },
    telinput: function (e) {
        var val = e.detail.value;
        this.data.cellPhone = val;
    },
    detailedinput: function (e) {
        var val = e.detail.value;
        this.data.address = val;
    },
    bindProvinceChange: function (e) {
        var that = this;
        var clickId = e.target.id;
        var index = e.detail.value;
        var province = that.data.provinceArray[index];
        var provinceId = that.data.provinceObjArray[index].RegionId;
        that.setData({
            province: province,
            city: '--请选择--',
            cityId: '',
            countryId: '',
            streetId: '',
            country: '',
            street: '',
            cityArray: [],
            countryArray: [],
            streetArray: [],
            provinceId: provinceId
        });
        wx.showLoading({
            title: '市加载中！',
        })
        filter.request({
            url: '/MemberAddress/GetRegionInfo',
            data: {
                parentRegionId: provinceId
            },
            success: function (res) {
                res.Data.forEach(function (cityItem) {
                    that.data.cityArray.push(cityItem.RegionName);
                })
                that.setData({
                    cityObjArray: res.Data,
                    cityArray: that.data.cityArray
                })
                wx.hideLoading();
            }
        });
    },
    bindCityChange: function (e) {
        var that = this;
        var clickId = e.target.id;
        var index = e.detail.value;
        var city = that.data.cityArray[index];
        var cityId = that.data.cityObjArray[index].RegionId;
        that.setData({
            city: city,
            countryId: '',
            streetId: '',
            country: '--请选择--',
            street: '',
            countryArray: [],
            streetArray: [],
            cityId: cityId
        });
        wx.showLoading({
            title: '区加载中！',
        })
        filter.request({
            url: '/MemberAddress/GetRegionInfo',
            data: {
                parentRegionId: cityId
            },
            success: function (res) {
                res.Data.forEach(function (cityItem) {
                    that.data.countryArray.push(cityItem.RegionName);
                })
                that.setData({
                    countryObjArray: res.Data,
                    countryArray: that.data.countryArray
                })
                if (res.Data.length <= 0) {
                    that.setData({ countryId: 0, country: '' })
                }
                wx.hideLoading();
            }
        });
    },
    bindCountryChange: function (e) {
        var that = this;
        var clickId = e.target.id;
        var index = e.detail.value;
        var country = that.data.countryArray[index];
        var countryId = that.data.countryObjArray[index].RegionId;
        that.setData({
            country: country,
            streetId: '',
            street: '--请选择--',
            streetArray: [],
            countryId: countryId
        });
        wx.showLoading({
            title: '街道加载中！',
        })
        filter.request({
            url: '/MemberAddress/GetRegionInfo',
            data: {
                parentRegionId: countryId
            },
            success: function (res) {
                res.Data.forEach(function (cityItem) {
                    that.data.streetArray.push(cityItem.RegionName);
                })
                that.setData({
                    streetObjArray: res.Data,
                    streetArray: that.data.streetArray
                })
                if (res.Data.length <= 0) {
                    that.setData({ streetId: 0, street: '' })
                }
                wx.hideLoading();
            }
        });
    },
    bindStreetChange: function (e) {
        var that = this;
        var clickId = e.target.id;
        var index = e.detail.value;
        var street = that.data.streetArray[index];
        var streetId = 0;
        if (that.data.streetObjArray[index]) {
            streetId = that.data.streetObjArray[index].RegionId;
        }
        that.setData({
            street: street,
            streetId: streetId
        });
    },
    savedAddress: function () {
        var that = this;
        if (!/^(([\u4E00-\u9FA5]{2,4})|[a-zA-Z]{3,20})$/.test(that.data.shipTo.trim())) {
            util.showToast(this, {
                text: '请填写正确的姓名！',
                duration: 2000
            })
            return false;
        }
      //if (!/^1[2-9][0-9]{9}$/.test(that.data.cellPhone)) {
      //      util.showToast(this, {
      //          text: '请填写正确的手机号！',
      //          duration: 2000
      //      })
      //      return false;
      //}
      if (!/^[\+]?[0-9]{11}$/.test(that.data.cellPhone)) {
        util.showToast(this, {
          text: '请填写正确的手机号！',
          duration: 2000
        })
        return false;
      }
        if (!that.data.provinceId) {
            util.showToast(this, {
                text: '请选择省',
                duration: 2000
            })
            return false;
        }
        if (!that.data.cityId) {
            util.showToast(this, {
                text: '请选择市',
                duration: 2000
            })
            return false;
        }
        if (that.data.countryArray.length > 0) {
            if (!that.data.countryId) {
                util.showToast(this, {
                    text: '请选择区/县',
                    duration: 2000
                })
                return false;
            }
        }
        if (!that.data.address) {
            util.showToast(this, {
                text: '请填写您的详细地址',
                duration: 2000
            })
            return false;
        }
        wx.showLoading({
            title: '添加收货地址中！',
        });
        var id = that.data.id;
        if (id == 0) {//添加           
            filter.request({
                url: '/MemberAddress/AddAddress',
                data: {
                    shipTo: that.data.shipTo,
                    cellPhone: that.data.cellPhone,
                    provinceId: that.data.provinceId,
                    cityId: that.data.cityId,
                    countyId: that.data.countryId,
                    streetId: that.data.streetId,
                    address: that.data.address,
                    isDefault: that.data.isDefault
                },
                success: function (res) {
                    //成功后跳转逻辑
                    if (res.Code == 0) {
                        that.goBack();
                    }
                },
                complete: function (res) {
                    wx.hideLoading();
                }
            });
        } else {//编辑     
            filter.request({
                url: '/MemberAddress/EditAddress',
                data: {
                    id: id,
                    shipTo: that.data.shipTo,
                    cellPhone: that.data.cellPhone,
                    provinceId: that.data.provinceId,
                    cityId: that.data.cityId,
                    countyId: that.data.countryId,
                    streetId: that.data.streetId,
                    address: that.data.address,
                    isDefault: that.data.isDefault
                },
                success: function (res) {
                    //成功后跳转逻辑
                    if (res.Code == 0) {
                        that.goBack();
                    }
                },
                complete: function (res) {
                    wx.hideLoading();
                }
            });
        }

    },
    deleteAddress: function () {
        var that = this;
        var id = that.data.id;
        wx.showModal({
            title: '提示',
            content: '是否删除此收货地址？',
            confirmText: '是',
            cancelText: '否',
            success: function (res) {
                if (res.confirm) {//删除
                    wx.showLoading({
                        title: '请求中'
                    });
                    filter.request({
                        url: '/MemberAddress/DeleteAddress',
                        data: {
                            id: id
                        },
                        success: function (res) {
                            that.goBack();
                        },
                        complete: function (res) {
                            wx.hideLoading();
                        }
                    });
                }
            }
        });
    },
    goBack: function () {
        var pages = getCurrentPages();
        var delta = 0;
        var current = 0;
        var target = 0;
        var navigate = '';
        pages.forEach(function (item, index) {
            if (item.route == 'pages/myaddress/myaddress') {
                navigate = item.route;
            }
            if (item.route == 'pages/addresslist/addresslist' || item.route == 'pages/pintuan/confirmorder/confirmorder' || item.route == 'pages/seckilling/submitorder/submitorder' || item.route == 'pages/reduceauction/confirmorder/confirmorder' || item.route == 'pages/stairgroup/confirmorder/confirmorder') {
                navigate = item.route;
            }
        });
        if (navigate == '') {
            pages.forEach(function (item, index) {
                if (item.route == 'pages/address/address') {
                    current = index;
                }
                if (item.route == 'pages/confirmorder/confirmorder') {
                    target = index;
                }
            });
            delta = current - target;
            wx.navigateBack({
                delta: delta
            });
        } else {
            pages.forEach(function (item, index) {
                if (item.route == 'pages/address/address') {
                    current = index;
                }
                if (item.route == navigate) {
                    target = index;
                }
            });
            delta = current - target;
            wx.navigateBack({
                delta: delta
            });
        }
    }
    ,
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    }
})