// pages/stairgroup/activitydetail/activitydetail.js
const app = getApp();
const util = require('../../../utils/util.js');
const WxParse = require('../../../wxparse/wxParse.js');
var richText = require('../../../utils/richText.js');
Page({
  data: {
    loadComplete: false,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    selectedCount: 1,
    nodes:[],
    copyright: {}
  },
  activityId: '',
  timer: null,
  onLoad: function (options) {
    this.activityId = options.activityId;
  },
  onShow: function () {
      let that = this;
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
              this.initPage();
          })
      } else {
        this.initPage();
      }
  },
  getuserinfo: function () {
    this.initPage();
    this.setData({
      showAuthorization: false
    })
  },
  sendFormId: function (e) {
      app.sendFormId(e.detail.formId, 0);
  },
  initPage() {
    const that = this;
    app.request({
      url: '/StairGroup/GetActivityInfo',
      requestDomain: 'ymf_domain',
      data: {
        activityId: that.activityId
      },
      success(res) {
        if (res.Code == 0) {
          res.Data = JSON.parse(res.Data);
          console.log(res.Data)
          const productInfo = res.Data.ProductInfoDto,
            StairGroupInfo = res.Data.ReduceAuctionDto,
            productSku = productInfo.ProductSKUs,
            SaleNum = res.Data.ReduceAuctionDto.SaleNum;
          const swiperImg = [productInfo.ImageUrl1, productInfo.ImageUrl2, productInfo.ImageUrl3, productInfo.ImageUrl4, productInfo.ImageUrl5].filter(v => {
              if (v) return v
            }),
            skuSetData = that.getSkuData(productSku);
          let skuName = [];
          if (skuSetData.skuData.length > 0) {
            skuName.push('请选择规格');
          }
          //处理阶梯价格
          let arr = [],
            finalBackMoney = 0,
            currentBackMoney = 0,
            StairGroupPriceList = res.Data.ReduceAuctionDto.StairGroupPriceList,
            length = res.Data.ReduceAuctionDto.StairGroupPriceList.length;
          StairGroupPriceList.forEach(v => {
            finalBackMoney += v.ReturnMoney;
            arr.push({
              SaleNum: v.SaleNum,
              Id: v.Id,
              ReturnMoney: v.ReturnMoney
            });
            v.ReturnMoney = v.ReturnMoney.toFixed(2);
            v.FinalMoney = v.FinalMoney.toFixed(2);
          })
          let priceIds = [],
            priceId = 0;
          priceIds = arr.filter(val => SaleNum < val.SaleNum);
          priceId = priceIds.length ? priceIds[0].Id : StairGroupPriceList[length - 1].Id;
          currentBackMoney = priceIds.length ? priceIds[0].ReturnMoney.toFixed(2) : finalBackMoney.toFixed(2);
           //let article = productInfo.Description || "";
          // WxParse.wxParse('article', 'html', article, that, 5);
          if (productInfo.Description){
            var article = richText.go(filterSource(productInfo.Description));
            var a = filterVideo(article);
            var b = splitArr(a, article); 
          }                      
          that.setData({
            nodes:b,
            productInfo: {
              ImageUrls: swiperImg,
              ProductSKU: skuSetData,
              VideoUrl: productInfo.VideoUrl ? productInfo.VideoUrl:'',
              VideoImgUrl: productInfo.VideoImgUrl ? productInfo.VideoImgUrl:''
            },
            StairGroupInfo: {
              ProductId: StairGroupInfo.ProductId,
              AuctionPrice: StairGroupInfo.AuctionPrice.toFixed(2),
              ProductOldPrice: StairGroupInfo.ProductOldPrice.toFixed(2),
              ActivityTag: StairGroupInfo.ActivityTag,
              ProductName: StairGroupInfo.ProductName,
              ProductImg: StairGroupInfo.ProductImg,
              AmountLimit: StairGroupInfo.AmountLimit,
              SaleNum: StairGroupInfo.SaleNum,
              Stock: StairGroupInfo.Stock,
              finalBackMoney: finalBackMoney.toFixed(2),
              currentBackMoney: currentBackMoney,
              FreightTemplateId: StairGroupInfo.FreightTemplateId,
              StartTime: StairGroupInfo.ActivityStart.replace('T', ' '),
              EndTime: StairGroupInfo.ActivityEnd,
              Regulation: StairGroupInfo.Regulation ? StairGroupInfo.Regulation : '',
              StairGroupPriceInfo: res.Data.ReduceAuctionDto.StairGroupPriceList,
              StairGroupSkuInfo: res.Data.ReduceAuctionDto.StairGroupSkuList
            },
            ActivityStart: util.timeDifference(StairGroupInfo.ActivityStart, 'day'),
            ActivityEnd: util.timeDifference(StairGroupInfo.ActivityEnd, 'day'),
            selectedSku: {
              selectedSkuImg: productInfo.ImageUrl1,
              selectedSkuName: skuName
            },
            productSku: productSku,
            selectedSkuId: skuSetData.skuData.length > 0 ? '' : StairGroupInfo.ProductId,
            indicatorDots: swiperImg.length > 1,
            priceId,
            Stock: StairGroupInfo.Stock
          });
          that.timer = setInterval(function () {
            that.showTime();
            if (that.data.activityStatus == 1) {
              var now = new Date().getTime();
              var date = that.data.StairGroupInfo.EndTime.replace(/[T]/g, ' ');
              if (now > new Date(date).getTime()) {
                that.setData({
                  activityStatus: 2
                })
              }
            }
            if (that.data.activityStatus == 0) {
              var now = new Date().getTime();
              var date = that.data.StairGroupInfo.StartTime.replace(/[T]/g, ' ');
              if (now > new Date(date).getTime()) {
                that.setData({
                  activityStatus: 1
                })
              }
            }
          }, 1000);
        } else {
          util.showToast(that, {
            text: '获取返现团活动详情接口异常' + res.Msg,
            duration: 2000
          });
        }
      }
    })
  },
  confirmBuy() {
    if (this.data.productInfo.ProductSKU.skuData.length > 0 && this.data.selectedSkuId == '') {
      util.showToast(this, {
        text: '请选择商品规格！',
        duration: 2000
      });
      return;
    }
    if (this.data.Stock == 0) {
      util.showToast(this, {
        text: "该商品规格库存不足",
        duration: 2000
      });
      return;
    }
    if (this.data.selectedCount > this.data.Stock) {
      util.showToast(this, {
        text: "选择购买的商品数量超过库存了",
        duration: 2000
      });
      return;
    }
    const that = this;
    app.request({
      url: '/StairGroup/JoinStairGroup',
      requestDomain: 'ymf_domain',
      data: {
        activityId: that.activityId,
        quantity: that.data.selectedCount,
        productId: that.data.StairGroupInfo.ProductId,
        skuId: that.data.selectedSkuId
      },
      success(res) {
        if (res.Code == 0) {
          // wx.redirectTo({
          //   url: `/pages/stairgroup/confirmorder/confirmorder?orderId=${res.Data}`,
          // })
          app.navigateTo(`/pages/stairgroup/confirmorder/confirmorder?orderId=${res.Data}`, 'redirectTo');
        } else if (res.Msg == 104) {
          //超过限购数量
          // wx.redirectTo({
          //   url: `/pages/stairgroup/groupfail/groupfail?pageStatus=0&orderId=${res.Data}`,
          // })
          app.navigateTo(`/pages/stairgroup/groupfail/groupfail?pageStatus=0&orderId=${res.Data}`, 'redirectTo');
        } else if (res.Msg == 101) {
          //库存不足
          // wx.redirectTo({
          //   url: `/pages/stairgroup/groupfail/groupfail?pageStatus=1`,
          // })
          app.navigateTo(`/pages/stairgroup/groupfail/groupfail?pageStatus=1`, 'redirectTo');
        } else {
          util.showToast(that, {
            text: '接口出错' + res.Msg,
            duration: 2000
          });
        }
      }
    })
  },
  /**
   * 处理规格数据方法
   */
  getSkuData(sku) {
    const priceList = [],
      skuData = [],
      skuImgUrl = [];
     var sku=sku||[];
    sku.forEach(function (item) {
      //不存储重复价格
      priceList.push(item.SalePrice.toFixed(2));
      skuImgUrl.push(item.SkuImgUrl);
      item.ProductSKU_Propertys.forEach(function (sub) {
        let status = true;
        skuData.forEach(function (list, index) {
          if (list.pid == sub.PId) {
            let tempStatus = true;
            skuData[index].values.forEach(function (vlist) {
              if (vlist.vid == sub.VId) {
                tempStatus = false;
              }
            });
            if (tempStatus) {
              skuData[index].values.push({
                id: sub.Id,
                vid: sub.VId,
                vname: sub.VName
              });
            }
            status = false;
            skuData[index].values.sort(sortId);
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
    const skuInfo = {
      priceList: priceList,
      skuImgUrl: skuImgUrl,
      skuData: skuData
    };
    return skuInfo;
  },
  showTime() {
    const that = this;
    let startTime = new Date(that.data.StairGroupInfo.StartTime.replace('T', ' ').replace(/\-/g, '/')).getTime();
    let endTime = new Date(that.data.StairGroupInfo.EndTime.replace('T', ' ').replace(/\-/g, '/')).getTime();
    let nowTime = new Date().getTime();
    let activityStatus = 0;
    if (nowTime < startTime) { //尚未开始
      activityStatus = 0;
    } else if (nowTime > endTime) { //结束
      activityStatus = 2;
      that.setData({
        priceId: -1
      });
    } else { //活动进行中
      activityStatus = 1;
    }
    that.setData({
      loadComplete: true,
      activityStatus,
      ActivityEnd: util.timeDifference(that.data.StairGroupInfo.EndTime, 'day')
    });
  },
  validateCount(e) {
    let selectedCount = e.detail.value >= 0 ? e.detail.value : 0,
      AmountLimit = this.data.StairGroupInfo.AmountLimit;
    selectedCount = selectedCount > AmountLimit ? '' + AmountLimit : selectedCount;
    this.setData({
      selectedCount
    })
  },
  addStock() {
    let selectedCount = this.data.selectedCount;
    if (selectedCount++ >= this.data.StairGroupInfo.AmountLimit) return;
    this.setData({
      selectedCount
    })
  },
  minusStock() {
    let selectedCount = this.data.selectedCount;
    if (selectedCount-- <= 1) return;
    this.setData({
      selectedCount
    })
  },
  /**
   * 选择规格
   */
  selectedSp: function (e) {
    var that = this;
    var parentIndex = e.target.dataset.parentindex;
    var currentIndex = e.target.dataset.currentindex;
    this.data.productInfo.ProductSKU.skuData[parentIndex].values.map(function (item) {
      item.selected = "";
    })
    this.data.productInfo.ProductSKU.skuData[parentIndex].values[currentIndex].selected = 'select';
    this.data.selectedSku.selectedSkuName[parentIndex] = this.data.productInfo.ProductSKU.skuData[parentIndex].values[currentIndex].vname;

    var thisData = this.data;
    let skuItem = {};
    this.data.productSku.forEach(function (item, index) {
      var attrInnerData = [];
      item.ProductSKU_Propertys.forEach(function (item1, index1) {
        attrInnerData.push(item1.VName);
      })
      if (attrInnerData.toString() == thisData.selectedSku.selectedSkuName.toString()) {
        thisData.selectedSku.selectedSkuImg = item.SkuImgUrl ? item.SkuImgUrl : that.data.StairGroupInfo.ProductImg;
        thisData.selectedSkuId = item.SkuId;
        skuItem = thisData.StairGroupInfo.StairGroupSkuInfo.find((v) => v.SkuId == item.SkuId)
      }
    });
    var productInfo = this.data.productInfo;
    var selectedSku = this.data.selectedSku;
    this.setData({
      productInfo: productInfo,
      selectedSku: selectedSku,
      skuItem,
      Stock: skuItem ? skuItem.Stock : 0 //规格库存
    })
  },
  buyNow() {
    this.setData({
      isConfirm: true
    });
    this.selectSpecifications();
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
  goIndex: function () {
    var linkUrl = '/pages/pintuan/index/index';
		var permissionsList = app.getPermissions();
    if (permissionsList.indexOf('xkd_wxaapp') < 0) {
      // wx.switchTab({
      //   url: linkUrl,
      // })
      app.navigateTo(linkUrl, 'switchTab');
    } else {
      // wx.redirectTo({
      //   url: linkUrl,
      // })
      app.navigateTo(linkUrl, 'redirectTo');
    }
  },
  goMember: function () {
    app.navigateTo('/pages/membercenter/membercenter', 'switchTab');
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const that = this;
    const siteName = `【${that.data.StairGroupInfo.ActivityTag}】${that.data.StairGroupInfo.ProductName}`,
      shopId = wx.getStorageSync('shopId');
    return {
      title: siteName,
      path: `/pages/stairgroup/activitydetail/activitydetail?activityId=${that.activityId}&shopId=${shopId}`,
      success: function (res) {
        // 转发成功
        console.log(111)
      },
      fail: function (res) {
        // 转发失败
        console.log(`转发失败，shopId:${shopId}`)
      }
    }
  },
  handleDetailClick(e) {
    const { ele } = e.currentTarget.dataset;
    const childEle = ele.children[0];
    if (childEle.name === 'img') {
      const imgSrc = childEle.attrs.src;
      wx.previewImage({
        current: imgSrc, // 当前显示图片的http链接
        urls: [imgSrc] // 需要预览的图片http链接列表
      })
    }
  },
  onHide() {
    clearInterval(this.timer);
  },
  onUnload() {
    clearInterval(this.timer);
  }
})

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
  str=str||'';
  var reg = /<source.*?\/>/g;
  str = str.replace(reg, '');
  return str;
}
//对象排序的方法
function sortId(a, b) {
  return a.id - b.id
}