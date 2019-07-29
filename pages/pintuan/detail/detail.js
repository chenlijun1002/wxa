// pages/pintuan/detail/detail.js
var app = getApp();
var util = require('../../../utils/util.js');
var WxParse = require('../../../wxparse/wxParse.js');
var richText = require('../../../utils/richText.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        productInfo: {},
        addressInfo: {},
        selectedSku: {
            selectedSkuImg: '',
            selectedSkuName: [],
            selectedSkuPrice: 0
        },
        productSku: {

        },
        selectedCount: 1,
        selectedSkuId: '',
        selectedSkuStock: 0,
        otherSpellGroup: {},
        submitText:'去开团',
        nodes:[],
        copyright: {}
    },
    SpellGroupSku:null,
    activityId:'',
    spellGroupRecordId:0,
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        var activityId = options.activityId;
        that.activityId = activityId;
        that.spellGroupRecordId = options.spellGroupRecordId ? options.spellGroupRecordId:0;
        // app.judgeLoginState(function () {
        //   that.initData(that, that.activityId);
        // })
    },
    onShow: function () {
        let that=this;
        if (wx.getStorageSync("requestStoreInfoSuccess")) {//判断店铺信息是否请求完成
            app.buttomCopyrightSetData(that, false, 'close');
            that.setData({
                isProbationShop: wx.getStorageSync("storeType")
            })
        } else {
            setTimeout(function () {
                app.buttomCopyrightSetData(that, false, 'close');
                that.setData({
                    isProbationShop: wx.getStorageSync("storeType")
                })
            }, 2000)
        }
        if (!wx.getStorageSync('isLogin')) {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                this.initData(this, this.activityId);
            })
        } else {
          this.initData(this, this.activityId);
        }
    },
    getuserinfo: function () {
      this.initData(this, this.activityId);
      this.setData({
        showAuthorization: false
      })
    },
    initData:function (that){
        if (that.spellGroupRecordId > 0) {
            that.setData({
                submitText: '立即参团'
            })
            app.request({
                url: '/SpellGroup/GetShareDetail',
                requestDomain: 'ymf_domain',
                data: {
                    id: that.spellGroupRecordId
                },
                success: function (data) {
                    if (data.Code == 0) {
                        data = JSON.parse(data.Data);
                        that.orderId = data.orderId;
                        data.savePrice = (data.ProductOldPrice - data.GroupPrice).toFixed(2);
                        data.GroupPrice = data.GroupPrice.toFixed(2);
                        var dateTime = util.timeDifference(data.EndTime).split(':');
                        var moreUser = data.GroupNumber > 10;
                        var participantList = [];
                        var len = data.userInfo.length;
                        data.userInfo.forEach(function (item) {
                            item.CreateDate = item.CreateDate.replace('T', ' ')
                        })
                        if (data.GroupNumber == 10 || moreUser) {
                            if (len < 9) {
                                data.userInfo.forEach(function (item) {
                                    participantList.push(item.userHead);
                                })
                                for (var i = 0; i < 9 - len; i++) {
                                    participantList.push('http://file.xiaokeduo.com/system/xkdxcx/system/images/default-user-img.png');
                                }
                            } else {
                                if (data.GroupNumber == 10) {
                                    data.userInfo.slice(0, 9).forEach(function (item) {
                                        participantList.push(item.userHead);
                                    })
                                } else {
                                    data.userInfo.slice(0, 8).forEach(function (item) {
                                        participantList.push(item.userHead);
                                    })
                                }
                            }
                        } else {
                            data.userInfo.forEach(function (item) {
                                participantList.push(item.userHead);
                            })
                            if (data.GroupNumber != len + 1) {
                                var num = data.GroupNumber - (len + 1);
                                for (var i = 0; i < num; i++) {
                                    participantList.push('http://file.xiaokeduo.com/system/xkdxcx/system/images/default-user-img.png');
                                }
                            }
                        }
                        data.Freight = data.Freight.toFixed(2);
                        data.SuccessDate = data.SuccessDate.replace('T', ' ');
                        that.setData({
                            spellGroupInfo: data,
                            activityId: data.ActivityId,
                            moreUser: moreUser,
                            isMember: len > 0,
                            participantList: participantList,
                            createSpellGroupDate: data.CreateSpellGroupDate.replace('T', ' '),
                            dateTimeObj: {
                                hour: dateTime[0],
                                minute: dateTime[1],
                                second: dateTime[2]
                            },
                            loadComplete: true
                        })
                        if (that.data.spellGroupInfo.spellGroupStatu != 1) {
                            setInterval(function () {
                                var dateTime = util.timeDifference(data.EndTime).split(':');
                                that.setData({
                                    dateTimeObj: {
                                        hour: dateTime[0],
                                        minute: dateTime[1],
                                        second: dateTime[2]
                                    }
                                })
                            }, 1000)
                        }
                    }
                }
            })
        }
        app.request({
            url: '/SpellGroup/SpellGroupDetails',
            requestDomain: 'ymf_domain',
            data: {
                activityId: that.activityId,
                spellGroupRecordId: that.spellGroupRecordId
            },
            success: function (data) {
                if (data.Code == 0) {
                    data = JSON.parse(data.Data);
                    var arr = [data.ProductData.ImageUrl1, data.ProductData.ImageUrl2, data.ProductData.ImageUrl3, data.ProductData.ImageUrl4, data.ProductData.ImageUrl5];
                    var newArr = [];
                    for (var i = 0; i < 5; i++) {
                        if (arr[i]) {
                            newArr.push(arr[i])
                        }
                    }
                    that.SpellGroupSku = data.SpellGroupData.SpellGroupSku;
                    var skuSetData = getSkuData(data.ProductData.ProductSKUs);
                    var productSku = data.ProductData.ProductSKUs;
                    var productId = data.SpellGroupData.ProductId;
                    var skuName = [];
                    if (skuSetData.skuData.length > 0) {
                        skuName.push('请选择规格');
                    }
                    var article = "";
                    if (data.ProductData.Description) {
                      var article = richText.go(filterSource(data.ProductData.Description));
                      var a = filterVideo(article);
                      var b = splitArr(a, article); 
                    }
                   // WxParse.wxParse('article', 'html', article, that, 5);
                    wx.setNavigationBarTitle({//重置标题
                        title: data.SpellGroupData.ActivityTag,
                    });
                    that.setData({
                        nodes:b,
                        productInfo: {
                            ImageUrls: newArr,
                            MarketPrice: that.SpellGroupSku[0].ProductOldPrice.toFixed(2),
                            Price: that.SpellGroupSku[0].GroupPrice.toFixed(2),
                            GroupNumber: data.SpellGroupData.GroupNumber,
                            ActivityTag: data.SpellGroupData.ActivityTag,
                            ProductName: data.SpellGroupData.ProductName,
                            ProductSKU: skuSetData,
                            productSku: productSku,
                            ProductId: productId,
                            VideoUrl: data.ProductData.VideoUrl ? data.ProductData.VideoUrl:'',
                            VideoImgUrl: data.ProductData.VideoImgUrl ? data.ProductData.VideoImgUrl:''
                        },
                        ShareDetail: data.SpellGroupData.ShareDetail || '',
                        AllowJoin: data.AllowJoin,
                        IsJoin: data.IsJoin,
                        spellGroupRecordId: that.spellGroupRecordId,
                        AmountLimit: data.SpellGroupData.AmountLimit,
                        BuyNum: data.BuyNum.Data,
                        ActivityStart: util.timeDifference(data.SpellGroupData.ActivityStart),
                        ActivityEnd: util.timeDifference(data.SpellGroupData.ActivityEnd),
                        loadComplete: true,
                        selectedSku: {
                            selectedSkuPrice: that.SpellGroupSku[0].GroupPrice.toFixed(2),
                            selectedSkuImg: newArr[0],
                            selectedSkuName: skuName
                        },
                        productSku: productSku,
                        defaultSkuId: that.SpellGroupSku[0].SkuId,
                        selectedSkuId: skuSetData.skuData.length > 0 ? '' : data.ProductId,
                        selectedSkuStock: data.SpellGroupData.SpellGroupSku[0].Stock
                    });
                    setInterval(function () {
                      if (that.data.AllowJoin==2){
                        var now = new Date().getTime();
                        var date = data.SpellGroupData.ActivityStart.replace(/[T]/g,' ');
                        if (now > new Date(date).getTime()){
                          that.setData({
                            AllowJoin:0
                          })
                        }
                      }
                      if (that.data.AllowJoin == 0) {
                        var now = new Date().getTime();
                        var date = data.SpellGroupData.ActivityEnd.replace(/[T]/g, ' ');
                        if (now > new Date(date).getTime()) {
                          that.setData({
                            AllowJoin: 1
                          })
                        }
                      }
                        that.setData({
                            ActivityEnd: util.timeDifference(data.SpellGroupData.ActivityEnd),
                            ActivityStart: util.timeDifference(data.SpellGroupData.ActivityStart)
                        })
                    }, 1000)
                    //别人开团的数据请求
                    app.request({
                        url: '/SpellGroup/OthersSpellGroup',
                        requestDomain: 'ymf_domain',
                        data: {
                            //projectId:28
                            activityId: that.activityId,
                            size: 10
                        },
                        success: function (res) {
                            if (res.Code == 0) {
                                var allOtherSpellGroup = JSON.parse(res.Data);
                                if (allOtherSpellGroup) {
                                    allOtherSpellGroup.forEach(function (item) {
                                        item.endDataTime = util.timeDifference(item.EndTime)
                                    })
                                    let therSpellGroupThree = allOtherSpellGroup.length <= 3 ? allOtherSpellGroup:[...allOtherSpellGroup].splice(0,3);
                                    that.setData({
                                        allOtherSpellGroup: allOtherSpellGroup,
                                        therSpellGroupThree: therSpellGroupThree
                                    })
                                    setInterval(function () {
                                        therSpellGroupThree.forEach(function (item) {
                                            item.endDataTime = util.timeDifference(item.EndTime)
                                        })
                                        that.setData({
                                            therSpellGroupThree: therSpellGroupThree
                                        })
                                        if (allOtherSpellGroup.length>3){
                                            allOtherSpellGroup.forEach(function (item) {
                                                item.endDataTime = util.timeDifference(item.EndTime)
                                            })
                                            that.setData({
                                                allOtherSpellGroup: allOtherSpellGroup
                                            })
                                        }
                                    }, 1000)
                                }

                            }
                        }
                    })
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
    buyNow: function () {//    
        if (app.globalData.refuseAuthFlag) {//判断是否拒绝了授权，未授权则拉起再次授权
            //app.pullAuthAgain(getCurrentPages(), 'no', null);
            util.showToast(this, {
                text: '未授权登录的用户',
                duration: 2000
            });
            return;
        } else {
            if (!wx.getStorageSync('isLogin')) {
                util.showToast(this, {
                    text: '未授权登录的用户',
                    duration: 2000
                });
                // wx.redirectTo({
                //     url: '/pages/pintuan/index/index'
                // })
                app.navigateTo('/pages/pintuan/index/index', 'redirectTo');
              return;
            }
            if (this.data.productInfo.ProductSKU.skuData.length > 0 && this.data.selectedSkuId == '') {//有规格且没有选择规格则弹出提示
                util.showToast(this, {
                    text: '请选择商品规格！',
                    duration: 2000
                });
                return;
            }
            if (this.data.productInfo.ProductSKU.skuData.length == 0 && !this.data.selectedSkuId){
                this.data.selectedSkuId = this.data.defaultSkuId;
            }
            if (!this.data.selectedCount) {
                util.showToast(this, {
                    text: '请选择购买数量！',
                    duration: 2000
                });
                return;
            }
            if (Number(this.data.selectedCount) > Number(this.data.selectedSkuStock)) {
                util.showToast(this, {
                    text: '该商品库存不足！',
                    duration: 2000
                });
                return;
            }
            if (Number(this.data.selectedCount) + Number(this.data.BuyNum) > Number(this.data.AmountLimit)) {
                util.showToast(this, {
                    text: '该活动商品最多购买' + this.data.AmountLimit + '件,（已购买' + this.data.BuyNum+'件）',
                    duration: 2000
                });
                return;
            }
            // wx.redirectTo({
            //     url: '../confirmorder/confirmorder?type=submitbuy&activityId=' + this.activityId + '&skuId=' + this.data.selectedSkuId + '&selectedCount=' + this.data.selectedCount + '&spellGroupRecordId=' + this.spellGroupRecordId
            // })
            app.navigateTo('../confirmorder/confirmorder?type=submitbuy&activityId=' + this.activityId + '&skuId=' + this.data.selectedSkuId + '&selectedCount=' + this.data.selectedCount + '&spellGroupRecordId=' + this.spellGroupRecordId, 'redirectTo');
        }
    },
    minusStock: function (e) {
        var count = parseInt(this.data.selectedCount) - 1;
        if (count == 0) {
            count = 1;
        }
        this.setData({
            selectedCount: count
        });
    },
    addStock: function (e) {
        var count = parseInt(this.data.selectedCount) + 1;
        //判断库存
        if (count > this.data.AmountLimit) {
            count--;
        }
        this.setData({
            selectedCount: count
        });
    },
    validateCount: function (e) {
        var count = parseInt(e.detail.value);
        if (count == 0) {
            count = 1;
        }
        if (count > this.data.AmountLimit) {
            count = this.data.AmountLimit;
        }
        this.setData({
            selectedCount: count
        });
    },
    blurValidateCount:function (e){
        if (!e.detail.value) e.detail.value = 1;
        var count = parseInt(e.detail.value);
        this.setData({
            selectedCount: count
        });
    },
    selectSpecifications: function () {
        this.setData({
            specifications: 'show',
        })
    },
    closePopup: function () {
        this.setData({
            specifications: 'hide'
        })
    },
    selectedSp: function (e) {
        var that=this;
        var parentIndex = e.target.dataset.parentindex;
        var currentIndex = e.target.dataset.currentindex;
        this.data.productInfo.ProductSKU.skuData[parentIndex].values.map(function (item) {
            item.selected = "";
        })
        this.data.productInfo.ProductSKU.skuData[parentIndex].values[currentIndex].selected = 'select';
        this.data.selectedSku.selectedSkuName[parentIndex] = this.data.productInfo.ProductSKU.skuData[parentIndex].values[currentIndex].vname;

        var thisData = this.data;
        this.data.productSku.forEach(function (item, index) {
            var attrInnerData = [];
            item.ProductSKU_Propertys.forEach(function (item1, index1) {
                attrInnerData.push(item1.VName);
            })
            if (attrInnerData.toString() == thisData.selectedSku.selectedSkuName.toString()) {
                //thisData.selectedSku.selectedSkuImg = item.SkuImgUrl;
                thisData.selectedSkuId = item.SkuId;
                that.SpellGroupSku.forEach(function (groupSku){
                    if (groupSku.SkuId == item.SkuId){
                        thisData.selectedSku.selectedSkuPrice = groupSku.GroupPrice.toFixed(2);
                        thisData.selectedSkuStock = groupSku.Stock;
                    }
                })
            }
        });
        var productInfo = this.data.productInfo;
        var selectedSku = this.data.selectedSku;
        this.setData({
            productInfo: productInfo,
            selectedSku: selectedSku,
            selectedSkuStock: thisData.selectedSkuStock
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        var that = this;
        var siteName = "【" + that.data.productInfo.ActivityTag + '】' + that.data.productInfo.ProductName;
        var shopId = wx.getStorageSync('shopId');
        return {
            title: siteName,
            path: '/pages/pintuan/detail/detail?activityId=' + that.activityId + '&shopId=' + shopId + '&spellGroupRecordId=' + that.spellGroupRecordId,
            success: function (res) {
                console.log('转发成功，shopId:' + shopId);
                // 转发成功
            },
            fail: function (res) {
                console.log('转发失败，shopId:' + shopId)
                // 转发失败
            }
        }
    },
    goIndex: function () {
      var linkUrl = '/pages/pintuan/index/index';
			var permissionsList = app.getPermissions();
      if (permissionsList.indexOf('xkd_wxaapp') < 0) {
        app.navigateTo(linkUrl, 'switchTab');
      } else {
        app.navigateTo(linkUrl, 'redirectTo');
      }
    },
    goMember: function () {
        app.navigateTo('/pages/membercenter/membercenter', 'switchTab');
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    //查看全部其它团
    lookThserGroup(){
        this.setData({
            thserGroup:'show'
        })
    },
    closeThserGroup(){
        this.setData({
            thserGroup: 'hide'
        })
    }
})
//处理规格
function getSkuData(sku) {
    var priceList = [];
    var skuData = [];
    var skuImgUrl = [];
    var sku=sku||[];
    sku.forEach(function (item) {
        //不存储重复价格
        //if (priceList.indexOf(item.SalePrice) == -1){
        priceList.push(item.SalePrice.toFixed(2));
        skuImgUrl.push(item.SkuImgUrl);
        //}
        item.ProductSKU_Propertys.forEach(function (sub) {
            // var data = { pid: sub.PId, pname: sub.PName, VName: sub.VName };
            var status = true;
            skuData.forEach(function (list, index) {
                if (list.pid == sub.PId) {
                    var tempStatus = true;
                    skuData[index].values.forEach(function (vlist) {
                        if (vlist.vid == sub.VId) {
                            tempStatus = false;
                        }
                    });
                    if (tempStatus) {
                        skuData[index].values.push({ vid: sub.VId, vname: sub.VName });
                    }
                    status = false;
                }
            });
            if (status) {
                skuData.push({ pid: sub.PId, pname: sub.PName, values: [{ vid: sub.VId, vname: sub.VName }] });
            }
        });
    });
    var skuInfo = {
        priceList: priceList,
        skuImgUrl: skuImgUrl,
        skuData: skuData
    };
    return skuInfo;
}

function splitArr(arr1, arr2) {
  setFlag(arr1, arr2);
  var newArr = cloneObj(arr2);
  var newArr2 = cloneObj(arr2);
  //var indexArr=[];
  arr1.forEach(function (item, index) {
    //var obj = { name: "video", children: newArr[item.parentIdx].children[item.Index] };
    var obj = { name: "video", children: item };
    var index = findArrIndex(item.parentIdx, item.Index, arr2);
    var length = arr2[index].children.length;
    arr2[index].children.splice(item.Index, length);
    var newChildren = newArr2[item.parentIdx].children.slice(item.Index + 1);
    arr2.splice(item.Index + index, 0, obj);
    //indexArr.push(index);
    if (newChildren.length > 0) {
      var len = newArr2[item.parentIdx].children.length;
      var newParentObj = cloneObj(newArr2[item.parentIdx]);
      newParentObj.children.splice(0, len);
      newParentObj.children = newChildren;
      var insertIndex = caclIndex(arr1, arr2, newArr2);
      insertIndex.forEach(function (item, index) {
        if (item.videoId === newParentObj.videoId) {
          arr2.splice(item.index + item.count + 1, 0, newParentObj);
        }
      })
    }
  });
  return arr2;
}
function cloneObj(obj) {
  var str, newobj = obj.constructor === Array ? [] : {};
  if (typeof obj !== 'object') {
    return;
  } else if (window) {
    str = JSON.stringify(obj), //系列化对象
      newobj = JSON.parse(str); //还原
  } else {
    for (var i in obj) {
      newobj[i] = typeof obj[i] === 'object' ?
        cloneObj(obj[i]) : obj[i];
    }
  }
  return newobj;
};
function filterVideo(arr) {
  var videoArr = [];
  var videoObj = {};
  arr.forEach(function (item, index) {
    item.children.forEach(function (v, i) {
      if (v.name && v.name === "video") {
        videoObj = cloneObj(v.attrs);
        videoObj.parentIdx = index;
        videoObj.Index = i;
        videoArr.push(videoObj);
      }
    })
  })
  return videoArr;
}
function caclIndex(arr1, arr2, newArr2) {
  let arr = [];
  for (var i = 0; i < arr2.length; i++) {
    if (arr2[i].videoId) {
      let count = 0, index = i, videoId = arr2[i].videoId;
      for (var j = 0; j < newArr2.length; j++) {
        if (arr2[i].videoId && newArr2[j].videoId && arr2[i].videoId === newArr2[j].videoId) {
          for (var k = 0; k < arr2.length; k++) {
            if (k > i && arr2[k].name === "video" && arr2[k].children.parentIdx == j) {
              count++;
            }
          }
        }
      }
      arr.push({ count: count, index: index, videoId: videoId });
    }
  }
  return arr;
}
function findArrIndex(parentIdx, Index, arr2) {
  var indx;
  for (var i = 0; i < arr2.length; i++) {
    if (arr2[i].videoId && arr2[i].videoId === "" + parentIdx + Index) {
      return i;
    }
  }
  return indx;
}
function setFlag(arr1, arr2) {
  arr1.forEach(function (item, index) {
    arr2[item.parentIdx].videoId = "" + item.parentIdx + item.Index;
  })
}
function filterSource(str) {
  str = str || '';
  var reg = /<source.*?\/>/g;
  str = str.replace(reg, '');
  return str;
}