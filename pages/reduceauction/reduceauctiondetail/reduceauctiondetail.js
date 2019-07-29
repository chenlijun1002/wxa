// pages/reduceauction/reduceauctiondetail/reduceauctiondetail.js
//降价团活动详情页
const app = getApp();
const util = require('../../../utils/util.js');
const WxParse = require('../../../wxparse/wxParse.js');
var richText = require('../../../utils/richText.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    loadComplete: false,
    isShowRulePopup: '',
    isShowModal: '',
    specifications: '',
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    isShowToast: false,
    toastText: {},
    activityStatus: 0, //0,1,2分别表示活动未开始、进行中、已结束
    isMemberCan: "",
    productInfo: {}, //商品详情
    Remaining: '--',
    reduceAuction: {}, //活动详情
    reducePriceList: [], //活动分时价格集合
    selectedSku: {
      selectedSkuImg: '',
      selectedSkuName: [],
      selectedSkuPrice: 0
    },
    productSku: {

    },
    selectedCount: 1,
    selectedSkuId: '',
    isConfirm: false, //是否是出价后的弹窗，默认为false
    nodes: [],
    copyright: {}
  },
  timer: null,
  activityId: '', //活动id
  /**
   * 页面初始化方法
   * 1.先去加载活动数据，使页面呈现出来
   * 2.调接口获取会员分享绑定手机情况，结合1的数据判断会员是否具有参与资格，更新页面
   */
  initPage() {
    let that = this;
    that.loadActivityData(function() {
      that.memberCertification();
    });
  },
  sendFormId: function(e) {
    app.sendFormId(e.detail.formId, 0);
  },
  /**
   * 1.加载活动数据，使页面呈现出来
   */
  loadActivityData(cb) {
    let that = this;
    app.request({
      url: '/ReduceAuction/GetActivityInfo',
      requestDomain: 'ymf_domain',
      data: {
        activityId: that.activityId
      },
      success(res) {
        res.Data = JSON.parse(res.Data);
        if (res.Code == 0) {
          let productInfo = res.Data.ProductInfoDto;
          let reduceAuction = res.Data.ReduceAuctionDto;
          let reducePriceList = res.Data.ReducePriceList;
          let arr = [productInfo.ImageUrl1, productInfo.ImageUrl2, productInfo.ImageUrl3, productInfo.ImageUrl4, productInfo.ImageUrl5];
          let newArr = [];
          for (let i = 0; i < 5; i++) {
            if (arr[i]) {
              newArr.push(arr[i])
            }
          }
          let skuSetData = that.getSkuData(productInfo.ProductSKUs);
          let skuName = [];
          if (skuSetData.skuData.length > 0) {
            skuName.push('请选择规格');
          }
          let productSku = productInfo.ProductSKUs;
          // let article = productInfo.Description || "";
          // WxParse.wxParse('article', 'html', article, that, 5);
          if (productInfo.Description) {
            var article = richText.go(filterSource(productInfo.Description));
            var a = filterVideo(article);
            var b = splitArr(a, article);
            that.setData({
              nodes: b
            })
          }
          let auctionPrice = that.data.reduceAuction.AuctionPrice;
          if (auctionPrice == undefined) {
            auctionPrice = reduceAuction.AuctionPrice.toFixed(2);
          }
          that.setData({
            AuctionPrice: reduceAuction.AuctionPrice,
            ServerTime: new Date(res.Data.ServerTime).getTime(),
            productInfo: {
              ImageUrls: newArr,
              ProductSKU: skuSetData,
              VideoUrl: productInfo.VideoUrl ? productInfo.VideoUrl:'',
              VideoImgUrl: productInfo.VideoImgUrl ? productInfo.VideoImgUrl:''
            },
            reduceAuction: {
              ProductId: reduceAuction.ProductId,
              AuctionPrice: auctionPrice,
              ProductOldPrice: reduceAuction.ProductOldPrice.toFixed(2),
              ActivityTag: reduceAuction.ActivityTag,
              ProductName: reduceAuction.ProductName,
              AmountLimit: reduceAuction.AmountLimit,
              Stock: reduceAuction.Stock,
              FloorPrice: reduceAuction.FloorPrice,
              ReduceMinute: reduceAuction.ReduceMinute,
              ReduceMoney: reduceAuction.ReduceMoney,
              IsNeedBindPhone: reduceAuction.IsBindPhone,
              IsNeedShare: reduceAuction.IsShare,
              IsExceed: reduceAuction.IsExceed,
              FreightTemplateId: reduceAuction.FreightTemplateId,
              OrderPayExpireMinute: reduceAuction.OrderPayExpireMinute,
              StartTime: reduceAuction.ActivityStart,
              EndTime: reduceAuction.ActivityEnd,
              Regulation: reduceAuction.Regulation
            },
            ActivityStart: util.timeDifference(reduceAuction.ActivityStart, 'day'),
            ActivityEnd: util.timeDifference(reduceAuction.ActivityEnd, 'day'),
            selectedSku: {
              selectedSkuImg: productInfo.ImageUrl1,
              selectedSkuName: skuName
            },
            productSku: productSku,
            selectedSkuId: skuSetData.skuData.length > 0 ? '' : reduceAuction.ProductId,
            loadComplete: true,
          });
          that.timer = setInterval(function() {
            let { StartTime, EndTime } = that.data.reduceAuction
            that.setData({
              ActivityEnd: util.timeDifference(EndTime, 'day'),
              ActivityStart: util.timeDifference(StartTime, 'day')
            });
            let ActivityStart = new Date(StartTime.replace('T', ' ').replace(/\-/g, '/')).getTime();
            let ActivityEnd = new Date(EndTime.replace('T', ' ').replace(/\-/g, '/')).getTime();
            console.log(ActivityStart)
            console.log(ActivityEnd)
            if (that.data.ServerTime < ActivityStart) {
              console.log('未开始', that.data.ServerTime, ActivityStart);
              that.setData({
                activityStatus: 0,
                ServerTime: that.data.ServerTime + 1000
              })
            }
            if (that.data.ServerTime >= ActivityEnd) {
              console.log('已结束', that.data.ServerTime, ActivityEnd);
              that.setData({
                activityStatus: 2,
                ServerTime: that.data.ServerTime + 1000
              })
            }
            if (that.data.ServerTime >= ActivityStart && that.data.ServerTime < ActivityEnd) {
              console.log('进行中', that.data.ServerTime, ActivityStart, ActivityEnd);
              that.setData({
                activityStatus: 1,
              })
              var timePoint = (that.data.ServerTime - ActivityStart) / (that.data.reduceAuction.ReduceMinute * 60 * 1000);
              if (Math.floor(timePoint) !== timePoint) {
                timePoint = Math.floor(timePoint);
              }
              //距下次降价
              var Remaining = ActivityStart + (that.data.reduceAuction.ReduceMinute * 60 * 1000 * (timePoint + 1));
              that.setData({
                Remaining: util.timeDifference(Remaining, 'day', true, that.data.ServerTime),
                reduceAuction: {
                  ...that.data.reduceAuction,
                  AuctionPrice: Math.round((that.data.AuctionPrice - that.data.reduceAuction.ReduceMoney * timePoint) * 100) / 100
                },
                ServerTime: that.data.ServerTime + 1000
              })
              if (that.data.reduceAuction.AuctionPrice <= that.data.reduceAuction.FloorPrice) {
                that.setData({
                  reduceAuction: {
                    ...that.data.reduceAuction,
                    AuctionPrice: that.data.reduceAuction.FloorPrice
                  }
                })
              }
            }

            if (that.data.activityStatus == 0) {
              var now = that.data.ServerTime;
              var date = StartTime.replace('T', ' ').replace(/\-/g, '/');
              if (now > new Date(date).getTime()) {
                that.setData({
                  activityStatus: 1
                })
              }
            }
            if (that.data.activityStatus == 1) {
              var now = that.data.ServerTime;
              var date = EndTime.replace('T', ' ').replace(/\-/g, '/');
              if (now >= new Date(date).getTime()) {
                that.setData({
                  activityStatus: 2
                });
              }
            }
          }, 1000);
        } else {
          util.showToast(that, {
            text: '获取降价拍活动详情接口异常' + res.Msg,
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
   * 2.校验会员参加拍卖资格
   */
  memberCertification(cb) {
    let that = this;
    app.request({
      url: '/ReduceAuction/MemberCertification',
      requestDomain: 'ymf_domain',
      data: {
        activityId: that.activityId
      },
      success(res) {
        if (res.Code == 0) {
          that.setData({
            IsBindPhone: res.Data.IsBindPhone,
            IsShare: res.Data.IsShare
          });
          let isNeedBindPhone = that.data.reduceAuction.IsNeedBindPhone;
          let isNeedShare = that.data.reduceAuction.IsNeedShare;
          if (isNeedBindPhone && !that.data.IsBindPhone) { //需要绑定且没有绑定手机号
            that.setData({
              isMemberCan: false,
              isShowBindPone: true
            });
            that.showBindPhone();
          } else {
            if (isNeedShare && !that.data.IsShare) { //需要且没有分享
              that.setData({
                isMemberCan: false,
                isShowShare: true
              });
            } else { //具备资格
              that.setData({
                isMemberCan: true,
                isShowShare: false,
                isShowBindPone: false
              });
            }
          }
        } else {
          util.showToast(that, {
            text: '当前用户是否具备参与资格接口异常' + res.Msg,
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
  showBindPhone() {
    const that = this;
    wx.showModal({
      title: '提示',
      content: '参与活动需要绑定手机号',
      showCancel: false,
      confirmText: '立即前往',
      success: function(mRes) {
        if (mRes.confirm) {
          // wx.navigateTo({
          //     url: `/pages/binduser/binduser?reduceActivityId=${that.activityId}`
          // })
          app.navigateTo(`/pages/binduser/binduser?reduceActivityId=${that.activityId}`, 'navigateTo');
        }
      }
    })
  },
  /**
   * 处理规格数据方法
   */
  getSkuData(sku) {
    var priceList = [];
    var skuData = [];
    var skuImgUrl = [];
    var sku = sku || [];
    sku.forEach(function(item) {
      //不存储重复价格
      priceList.push(item.SalePrice.toFixed(2));
      skuImgUrl.push(item.SkuImgUrl);
      item.ProductSKU_Propertys.forEach(function(sub) {
        // var data = { pid: sub.PId, pname: sub.PName, VName: sub.VName };
        var status = true;
        skuData.forEach(function(list, index) {
          if (list.pid == sub.PId) {
            var tempStatus = true;
            skuData[index].values.forEach(function(vlist) {
              if (vlist.vid == sub.VId) {
                tempStatus = false;
              }
            });
            if (tempStatus) {
              skuData[index].values.push({
                id:sub.Id,
                vid: sub.VId,
                vname: sub.VName
              });
            }
            skuData[index].values.sort(sortId);
            status = false;
          }
        });
        if (status) {
          skuData.push({
            pid: sub.PId,
            pname: sub.PName,
            values: [{
              id:sub.Id,
              vid: sub.VId,
              vname: sub.VName
            }]
          });
        }
      });
    });
    var skuInfo = {
      priceList: priceList,
      skuImgUrl: skuImgUrl,
      skuData: skuData
    };
    return skuInfo;
  },
  /**
   * 显示下次降价剩余时间并更新活动价
   */
  showTimeRemaining(reducePriceList) {
    let that = this;
    let startTime = new Date(that.data.reduceAuction.StartTime.replace('T', ' ').replace(/\-/g, '/')).getTime();
    let endTime = new Date(that.data.reduceAuction.EndTime.replace('T', ' ').replace(/\-/g, '/')).getTime();
    let nowTime = new Date().getTime();
    let status = 0;
    let remaining = '--';
    let reducePrice = that.data.reduceAuction.AuctionPrice;
    for (let i = 0; i < reducePriceList.length; i++) {
      let timePoint = new Date(reducePriceList[i].TimePoint.replace('T', ' ').replace(/\-/g, '/')).getTime();
      if (nowTime < startTime) { //尚未开始
        status = 0;
        remaining = '--';
        break;
      } else if (nowTime > endTime) { //结束
        status = 2;
        remaining = '--';
        reducePrice = reducePriceList[reducePriceList.length - 1].TimePrice.toFixed(2);
        break;
      } else { //活动进行中
        status = 1;
        if (nowTime <= timePoint) {
          remaining = util.timeDifference(reducePriceList[i].TimePoint);
          reducePrice = reducePriceList[i].TimePrice.toFixed(2);
          break;
        }
      }
    }
    that.data.reduceAuction.AuctionPrice = reducePrice;
    that.setData({
      loadComplete: true,
      activityStatus: status,
      Remaining: remaining,
      reduceAuction: that.data.reduceAuction
    });
  },
  /**
   * 选择规格
   */
  selectedSp: function(e) {
    var that = this;
    var parentIndex = e.target.dataset.parentindex;
    var currentIndex = e.target.dataset.currentindex;
    this.data.productInfo.ProductSKU.skuData[parentIndex].values.map(function(item) {
      item.selected = "";
    })
    this.data.productInfo.ProductSKU.skuData[parentIndex].values[currentIndex].selected = 'select';
    this.data.selectedSku.selectedSkuName[parentIndex] = this.data.productInfo.ProductSKU.skuData[parentIndex].values[currentIndex].vname;

    var thisData = this.data;
    this.data.productSku.forEach(function(item, index) {
      var attrInnerData = [];
      item.ProductSKU_Propertys.forEach(function(item1, index1) {
        attrInnerData.push(item1.VName);
      })
      if (attrInnerData.toString() == thisData.selectedSku.selectedSkuName.toString()) {
        thisData.selectedSku.selectedSkuImg = item.SkuImgUrl ? item.SkuImgUrl : that.data.selectedSku.selectedSkuImg;
        thisData.selectedSkuId = item.SkuId;
      }
    });
    var productInfo = this.data.productInfo;
    var selectedSku = this.data.selectedSku;
    this.setData({
      productInfo: productInfo,
      selectedSku: selectedSku
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    let that = this;
    let activityId = options.activityId;
    that.activityId = activityId;
  },
  selectSpecifications() {
    this.setData({
      specifications: 'show'
    })
  },
  closeSpecificationsPopup() {
    this.setData({
      specifications: '',
      isConfirm: false
    })
  },
  showRulePopup() {
    this.setData({
      isShowRulePopup: 'show'
    })
  },
  closeRulePopup() {
    this.setData({
      isShowRulePopup: ''
    })
  },
  goIndex: function() {
    var linkUrl = '/pages/pintuan/index/index';
		var permissionsList = app.getPermissions();
    if (permissionsList.indexOf('xkd_wxaapp') < 0) {
      app.navigateTo(linkUrl, 'switchTab');
    } else {
      app.navigateTo(linkUrl, 'redirectTo');
    }
  },
  goMember: function() {
    app.navigateTo('/pages/membercenter/membercenter', 'switchTab');
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    if (wx.getStorageSync("requestStoreInfoSuccess")) { //判断店铺信息是否请求完成
      app.buttomCopyrightSetData(that, false, 'close');
      that.setData({
        isProbationShop: wx.getStorageSync("storeType")
      })
    } else {
      setTimeout(function() {
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
        this.initPage();
      })
    } else {
      this.initPage();
    }
  },
  onHide() {
    clearInterval(this.timer);
  },
  onUnload() {
    clearInterval(this.timer);
  },
  getuserinfo: function() {
    this.initPage();
    this.setData({
      showAuthorization: false
    })
  },
  /**
   * 我要出价弹窗
   */
  buyNow() {
    this.setData({
      isConfirm: true
    });
    this.selectSpecifications();
  },
  /**
   * 确认购买
   */
  confirmBuy() {
    if (this.data.productInfo.ProductSKU.skuData.length > 0 && this.data.selectedSkuId == '') {
      util.showToast(this, {
        text: '请选择商品规格！',
        duration: 2000
      });
      return;
    }
    let that = this;
    app.request({
      url: '/ReduceAuction/MemberBid',
      requestDomain: 'ymf_domain',
      data: {
        activityId: that.activityId,
        count: 1,
        productId: that.data.reduceAuction.ProductId,
        skuId: that.data.selectedSkuId
      },
      success(res) {
        //根据状态跳不同页面或同一页面给不同状态
        if (res.Code == 0) {
          app.navigateTo(`/pages/reduceauction/confirmorder/confirmorder?orderId=${res.Data}`, 'redirectTo');
        } else {
          if (res.Msg == 100) { //已有活动订单
            app.navigateTo(`/pages/reduceauction/auctionfail/auctionfail?pageStatus=0&orderId=${res.Data}`, 'redirectTo');
          } else if (res.Msg == 101) { //库存不足
            app.navigateTo('/pages/reduceauction/auctionfail/auctionfail?pageStatus=1&state=1', 'redirectTo');
          } else if (res.Msg == 103) { //活动结束
            app.navigateTo('/pages/reduceauction/auctionfail/auctionfail?pageStatus=1&state=0', 'redirectTo');
          }
        }
      },
      complete(res) {

      }
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    var that = this;
    var siteName = "【" + that.data.reduceAuction.ActivityTag + '】' + that.data.reduceAuction.ProductName;
    var shopId = wx.getStorageSync('shopId');
    return {
      title: siteName,
      path: '/pages/reduceauction/reduceauctiondetail/reduceauctiondetail?activityId=' + that.activityId + '&shopId=' + shopId,
      success: function(res) {
        // 转发成功调接口通知后台已分享
        app.request({
          url: '/ReduceAuction/MemberShareNotify',
          requestDomain: 'ymf_domain',
          data: {
            activityId: that.activityId
          },
          success(sRes) {
            if (sRes.Code == 0 && sRes.Data) {
              //成功不处理
            } else {
              util.showToast(that, {
                text: '分享通知接口异常' + sRes.Msg,
                duration: 2000
              });
            }
          },
          complete(sRes) {
            //重新刷一下页面
            that.onShow();
          }
        });
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  handleDetailClick(e) {
    const {
      ele
    } = e.currentTarget.dataset;
    const childEle = ele.children[0];
    if (childEle.name === 'img') {
      const imgSrc = childEle.attrs.src;
      wx.previewImage({
        current: imgSrc, // 当前显示图片的http链接
        urls: [imgSrc] // 需要预览的图片http链接列表
      })
    }
  },
})

function splitArr(arr1, arr2) {
  setFlag(arr1, arr2);
  var newArr = cloneObj(arr2);
  var newArr2 = cloneObj(arr2);
  //var indexArr=[];
  arr1.forEach(function(item, index) {
    //var obj = { name: "video", children: newArr[item.parentIdx].children[item.Index] };
    var obj = {
      name: "video",
      children: item
    };
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
      insertIndex.forEach(function(item, index) {
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
  arr.forEach(function(item, index) {
    item.children.forEach(function(v, i) {
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
      let count = 0,
        index = i,
        videoId = arr2[i].videoId;
      for (var j = 0; j < newArr2.length; j++) {
        if (arr2[i].videoId && newArr2[j].videoId && arr2[i].videoId === newArr2[j].videoId) {
          for (var k = 0; k < arr2.length; k++) {
            if (k > i && arr2[k].name === "video" && arr2[k].children.parentIdx == j) {
              count++;
            }
          }
        }
      }
      arr.push({
        count: count,
        index: index,
        videoId: videoId
      });
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
  arr1.forEach(function(item, index) {
    arr2[item.parentIdx].videoId = "" + item.parentIdx + item.Index;
  })
}

function filterSource(str) {
  str = str || '';
  var reg = /<source.*?\/>/g;
  str = str.replace(reg, '');
  return str;
}
//对象排序的方法
function sortId(a, b) {
  return a.id - b.id
}