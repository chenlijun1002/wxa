const app = getApp();
const util = require("../../utils/util");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadComplete: false,
    sortType: 'category',
    categoryId: -1,
    midCategoryId: -1,
    leftScrollTop: 0, //一级分类滚动条位置
    rightScrollTop: 0, //商品列表滚动条位置
    rulePopup: '',
    isArrowDown: true,
    isLoading: false,
    isPullUp: false,
    productQuery: {
      id: -1,
      type: 0,
      pageIndex: 1,
      pageSize: 10,
      isDesc:true,
      sortField:0
    },
    addCarQuery: {
      id: 0,
      number: 0,
      skuid: ''
    },
    reduceCarQuery: {
      id: 0,
      number: 0,
      skuid: ''
    },
    defaultAddress: {
      cityId: 643,
      regionId: 644
    },
    isShowChildCategory:true,
    filterConditionType:0,
    isDesc:false
  },
  midCategory:[],
  srollTop:0,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      if (wx.getStorageSync('isLogin')) {
          if (this.data.showAuthorization) {
              this.setData({
                  showAuthorization: false
              })
          }
          this.initData();
      } else {
          app.getUserInfo(() => {
              this.setData({
                  showAuthorization: true
              })
          }, () => {
              this.initData();
          })
      }
  },
  sendFormId: function (e) {
      app.sendFormId(e.detail.formId, 0);
  },
  initData() {
    this.getBatchBuyMenu().then(data => {
      const { productQuery } = this.data;
      this.setData({
        productQuery,
        brandList: data.BatchProductBrand,
        categorys: data.BatchCategories,
        currentTopCategoryName: '全部商品',
        currentTopCategoryId: -1,
        midCategory:  data.BatchCategories[0].midCategory,
        subMidCategory: data.BatchCategories[0].midCategory
      });
      this.getBatchProduct(productQuery).then(data => {
        this.setData({
          loadComplete: true,
          productList: data.Data,
          productTotal: data.Total,
          allProductTotal: data.Total //为了结算时获取到全部商品
        })
      })
    })
    this.getDefaultAddress().then(data => {
      const { defaultAddress } = this.data;
      if (data != null) {
        defaultAddress.cityId = data.CityId;
        defaultAddress.regionId = data.RegionId;
      }
      this.setData({ defaultAddress })
      this.getCartInfo(defaultAddress).then(data => {
        const carInfo = {
          quantity: data.Quantity,
          money: data.Money.toFixed(2),
          freidhtMoney: data.FreidhtMoney.toFixed(2)
        }
        this.setData({ carInfo })
      })
    })
  },
  searchProduct() {
      app.navigateTo('/pages/productlist/productlist', 'navigateTo');
  },
  // 切换分类模式
  changSortType() {
    const { brandList, categorys } = this.data;
    let sortType = this.data.sortType == 'category' ? 'brand' : 'category';
    const productQuery = {
      id: sortType == 'category' ? -1 : brandList[0].BrandId,
      type: sortType == 'category' ? 0 : 1,
      pageIndex: 1,
      pageSize: 10,
      isDesc:true,
      sortField:0
    }
    //切换后重置基础信息
    this.setData({
      sortType,
      productQuery,
      categoryId: sortType == 'category' ? -1 : 0,
      midCategoryId: -1,
      leftScrollTop: 0,
      rightScrollTop: 0,
      isArrowDown: true,
      currentTopCategoryName: sortType == 'category' ? '全部商品' : brandList[0].Name,
      currentTopCategoryId: sortType == 'category' ? -1 : brandList[0].BrandId,
      midCategory: [],
      subMidCategory: [],
      isShowChildCategory:true
    })
    this.scrollTop=0;
    this.midCategory = [];
    this.getBatchProduct(productQuery).then(data => {
      this.setData({
        productList: data.Data,
        productTotal: data.Total
      })
    })
  },
  // 切换一级分类
  toggleCategoryType(e) {
    let key = e.target.dataset.key;
    const info = e.target.dataset.info;
    const { productQuery, sortType } = this.data;
    if (key == this.data.categoryId) return;
    wx.showLoading({
      title: '加载中'
    })
    productQuery.id = sortType == 'category' ? info.Id : info.BrandId;
    productQuery.type = sortType == 'category' ? 0 : 1;
    productQuery.pageIndex = 1;    
    this.setData({
      categoryId: key,
      currentTopCategoryName: info.Name,
      currentTopCategoryId: sortType == 'category' ? info.Id : info.BrandId,
      productQuery,
      midCategoryId: -1,
      isArrowDown: true,
      isShowChildCategory: true,
      midCategory: sortType == 'category' ? info.midCategory : [],
      subMidCategory: sortType == 'category' ? info.midCategory : []
    });
    this.midCategory = sortType == 'category' ? info.midCategory : [];
    this.getBatchProduct(productQuery).then(data => {
      this.setData({
        rightScrollTop: 0,
        productList: data.Data,
        productTotal: data.Total
      })
      this.scrollTop = 0;
      wx.hideLoading();
    })
  },
  // 切换二级分类
  toggleMidCategory(e) {
    const { productQuery, midCategoryId, currentTopCategoryId } = this.data;
    let { key } = e.currentTarget.dataset;
    if (key == midCategoryId) return;
    wx.showLoading({
      title: '加载中'
    });
    if (key > -1) {
      productQuery.id = e.currentTarget.dataset.id  //赋值为二级分类id
    } else {
      productQuery.id = currentTopCategoryId
    }
    productQuery.pageIndex = 1; //重置为第一页
    this.setData({
      productQuery,
      midCategoryId: key
    })
    this.getBatchProduct(productQuery).then(data => {
      this.setData({
        rightScrollTop: 0,
        productList: data.Data,
        productTotal: data.Total
      });
      this.scrollTop = 0;
      wx.hideLoading();
    })
  },
  // 二级菜单伸展
  showMoreMidCategory() {
    const { isArrowDown, midCategory } = this.data;
    this.setData({
      subMidCategory: isArrowDown ? midCategory : midCategory.slice(0, 4),
      isArrowDown: !isArrowDown
    })
  },
  // 监听商品列表滚动到底部事件
  scrollToLower(e) {
    const { productQuery, productTotal, productList, isPullUp } = this.data;
    if (productList.length >= productTotal || isPullUp) {
      this.setData({
        isShowChildCategory: false
      })
      return; //无更多数据或者正在加载数据则阻止
      }
    productQuery.pageIndex++;
    this.setData({
      isPullUp: true
    })
    this.getBatchProduct(productQuery).then(data => {
      this.setData({
        productList: [...productList, ...data.Data],
        isPullUp: false
      })
    })
  },
  // 添加商品至购物车
  addToCar(e) {
    let { Id, ShoppingCartNum, HasMoreSku } = e.currentTarget.dataset.info;
    if (HasMoreSku) {
      this.showPopup(e.currentTarget.dataset.info);
      return;
    }
    const { addCarQuery, isLoading } = this.data;
    if (isLoading) return; //加载数据中防止重复点击
    this.setData({
      isLoading: true
    })
    addCarQuery.id = Id;
    addCarQuery.number = 1; //当前增1
    addCarQuery.skuid = Id;
    this.addProductToCart(addCarQuery).then(data => {
      const { productList } = this.data;
      productList.forEach((item) => {
        if (item.Id === Id) {
          item.ShoppingCartNum = ++ShoppingCartNum;
        }
      })
      this.setData({
        addCarQuery,
        productList,
        isLoading: false
      })
      this.repeatGetCartInfo();
    })
  },
  // 从购物车删除商品
  reduceFromCar(e) {
    let { Id, ShoppingCartNum, HasMoreSku } = e.currentTarget.dataset.info;
    if (HasMoreSku) {
      this.showPopup(e.currentTarget.dataset.info);
      return;
    }
    if (ShoppingCartNum <= 0) return; //如果数量已经为0，不减少
    const { reduceCarQuery, isLoading } = this.data;
    if (isLoading) return; //加载数据中防止重复点击
    this.setData({
      isLoading: true
    })
    reduceCarQuery.id = Id;
    reduceCarQuery.number = 1; //当前减1
    reduceCarQuery.skuid = Id;
    this.reduceProductFromCart(reduceCarQuery).then(data => {
      const { productList } = this.data;
      productList.forEach((item) => {
        if (item.Id === Id) {
          item.ShoppingCartNum = --ShoppingCartNum;
        }
      })
      this.setData({
        reduceCarQuery,
        productList,
        isLoading: false
      })
      this.repeatGetCartInfo();
    })
  },
  // 跳转购物车
  goCar(e) {
      app.navigateTo('/pages/shopcart/shopcart', 'switchTab');
  },
  // 查询全部菜单
  getBatchBuyMenu() {
    return new Promise((resolve, reject) => {
      app.request({
        url: '/Product/GetBatchBuyMenu',
        data: {},
        success(res) {
          if (res.Code == 0) {
            resolve(JSON.parse(res.Data))
          } else {
            reject()
          }          
        }
      })
    })
  },
  // 查询分类产品
  getBatchProduct(params) {
    return new Promise((resolve, reject) => {
      app.request({
        url: '/Product/GetBatchProductBySort',
        data: params,
        success(res) {
          if (res.Code == 0) {
            resolve(JSON.parse(res.Data))
          } else {
            reject()
          }
        }
      })
    })
  },
  //获取商品规格属性
  getProductSkus(productId) {
    return new Promise((resolve, reject) => {
      app.request({
        url: '/Product/GetProductSkus',
        data: {
          id: productId
        },
        success(res) {
          if (res.Code == 0) {
            resolve(JSON.parse(res.Data))
          } else {
            reject()
          }
        },
        fail() {
          reject()
        }
      })
    })
  },
  // 获取默认收货地址
  getDefaultAddress() {
    return new Promise((resolve, reject) => {
      app.request({
        url: '/MemberAddress/GetDefaultAddress',
        data: {},
        success(res) {
          if (res.Code == 0) {
            resolve(res.Data)
          } else {
            reject()
          }
        },
        fail() {
          reject()
        }
      })
    })
  },
  //获取购物车信息
  getCartInfo(params) {
    return new Promise((resolve, reject) => {
      app.request({
        url: '/Product/GetcartInfo',
        data: params,
        success(res) {
          if (res.Code == 0) {
            resolve(JSON.parse(res.Data))
          } else {
            reject()
          }
        },
        fail() {
          reject()
        }
      })
    })
  },
  // 重新获取购物车信息并更新数据
  repeatGetCartInfo() {
    this.getCartInfo(this.data.defaultAddress).then(data => {
      const carInfo = {
        quantity: data.Quantity,
        money: data.Money.toFixed(2),
        freidhtMoney: data.FreidhtMoney.toFixed(2)
      };
      this.setData({ carInfo });
    })
  },
  // 添加购物车
  addProductToCart(params) {
    return new Promise((resolve, reject) => {
      app.request({
        url: '/Product/AddProductToCart',
        data: params,
        success(res) {
          if (res.Code == 0) {
            resolve()
          } else {
            reject()
          }
        }
      })
    })
  },
  // 删除购物车商品
  reduceProductFromCart(params) {
    return new Promise((resolve, reject) => {
      app.request({
        url: '/Product/ReduceProductToCart',
        data: params,
        success(res) {
          if (res.Code == 0) {
            resolve()
          } else {
            reject()
          }
        }
      })
    })
  },
  // 显示多规格popup
  showPopup(currentProductInfo) {
    this.getProductSkus(currentProductInfo.Id).then(data => {
      var selectedSkuName = [];
      var skuSetData = this.getSkuData(data);
      skuSetData.skuData.forEach(function (item) {
        item.values[0].selected = 'select';
        selectedSkuName.push(item.values[0].vname);
      })
      this.setData({
        rulePopup: 'show',
        currentProductInfo,
        productSku: skuSetData,
        skuDataInfo: data,
        selectedSkuId: data[0].ProductSKU.SkuId,
        selectedSku: {
          selectedSkuPrice: skuSetData.priceList[0],
          selectedSkuImg: skuSetData.skuImgUrl[0] ? skuSetData.skuImgUrl[0] : currentProductInfo.ImageUrl1,
          selectedSkuStock: data[0].ProductSKU.Stock,
          selectedSkuName: selectedSkuName,
          selectedSkuNumber: data[0].ShopCarNum
        }
      })
    })
  },
  // 关闭popup
  closePopup() {
    this.setData({
      rulePopup: ''
    })
  },
  // 去结算
  goPurchase() {
    wx.showLoading({
      title: '请稍后'
    })
    this.getShoppingCartList({ selectIds: ''}).then(data => {
      const shoppingCartList = data;
      let selectIds = '';
      wx.hideLoading();
      shoppingCartList.forEach(function (item, index) {
        item.ShoppingCarts.forEach(function (sitem, sindex) {
          if (sitem.Quantity > sitem.stock) {
            util.showToast(that, {
              text: sitem.Product.ProductName + '库存不足！',
              duration: 2000
            });
            return;
          }
          selectIds += sitem.Id + ','
        });
      });
      if (!selectIds) return;
      selectIds = selectIds.substring(0, selectIds.length - 1)
      app.navigateTo('../confirmorder/confirmorder?type=shopcart&selectIds=' + selectIds, 'navigateTo');
    })
  },
  getShoppingCartList(params){
    return new Promise((resolve, reject) => {
      app.request({
        url: '/ShopCart/GetShoppingCartList',
        data: params,
        success(res) {
          if (res.Code == 0) {
            resolve(res.Data)
          } else {
            reject()
          }
        },
        fail() {
          reject()
        }
      })
    })
  },
  // 处理规格选择逻辑
  selectedSp: function (e) {
    var parentIndex = e.target.dataset.parentindex;
    var currentIndex = e.target.dataset.currentindex;
    this.data.productSku.skuData[parentIndex].values.map(function (item) {
      item.selected = "";
    })
    this.data.productSku.skuData[parentIndex].values[currentIndex].selected = 'select';
    this.data.selectedSku.selectedSkuName[parentIndex] = this.data.productSku.skuData[parentIndex].values[currentIndex].vname;
    var thisData = this.data;
    this.data.skuDataInfo.forEach(function (item, index) {
      var attrInnerData = [];
      item.ProductSKU.ProductSKU_Propertys.forEach(function (item1, index1) {
        attrInnerData.push(item1.VName);
      })
      if (attrInnerData.toString() == thisData.selectedSku.selectedSkuName.toString()) {
        thisData.selectedSku.selectedSkuPrice = item.ProductSKU.SalePrice.toFixed(2);
        thisData.selectedSku.selectedSkuImg = item.ProductSKU.SkuImgUrl ? item.ProductSKU.SkuImgUrl : thisData.currentProductInfo.ImageUrl1;
        thisData.selectedSkuId = item.ProductSKU.SkuId;
        thisData.selectedSkuStock = item.ProductSKU.Stock;
        thisData.selectedSku.selectedSkuStock = item.ProductSKU.Stock;
        thisData.selectedSku.selectedSkuNumber = item.ShopCarNum;
      }
    });
    var selectedSku = this.data.selectedSku;
    this.setData({
      productSku: this.data.productSku,
      selectedSku: selectedSku,
      selectedSkuStock: thisData.selectedSkuStock
    });
  },
  // 规格数据加工
  getSkuData: function (sku) {
    var priceList = [];
    var skuData = [];
    var skuImgUrl = [];
    sku.forEach(function (item) {
      //不存储重复价格
      priceList.push(item.ProductSKU.SalePrice.toFixed(2));
      skuImgUrl.push(item.ProductSKU.SkuImgUrl);
      item.ProductSKU.ProductSKU_Propertys.forEach(function (sub) {
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
  },
  //多规格商品购物车逻辑
  hasSkuControllerNumber: function (e) {
    const { isLoading } = this.data;
    if (isLoading) return;
    let stock = Number(e.currentTarget.dataset.num);
    let cartNum = Number(e.currentTarget.dataset.selectnum);
    let controlType = e.currentTarget.dataset.operation;
    let quantity = controlType == 'plus' ? 1 : -1;
    if (controlType == 'plus') {
      if (cartNum >= stock) {
        wx.showToast({
          title: '库存不足',
          icon: 'none'
        });
        return;
      };
      this.setData({
        isLoading: true
      });
      const { addCarQuery, currentProductInfo, selectedSkuId } = this.data;
      addCarQuery.id = currentProductInfo.Id;
      addCarQuery.number = 1; //当前增1
      addCarQuery.skuid = selectedSkuId;
      this.addProductToCart(addCarQuery).then(data => {
        const { productList } = this.data;
        productList.forEach((item) => {
          if (item.Id === currentProductInfo.Id) item.ShoppingCartNum++;
        })
        this.setData({
          addCarQuery,
          productList,
          isLoading: false
        })
        this.repeatGetCartInfo();
      })
    } else if (controlType == 'minus') {
      if (cartNum <= 0) return; //如果数量已经为0，不减少
      this.setData({
        isLoading: true
      });
      const { reduceCarQuery, currentProductInfo, selectedSkuId } = this.data;
      reduceCarQuery.id = currentProductInfo.Id;
      reduceCarQuery.number = 1; //当前减1
      reduceCarQuery.skuid = selectedSkuId;
      this.reduceProductFromCart(reduceCarQuery).then(data => {
        const { productList } = this.data;
        productList.forEach((item) => {
          if (item.Id === currentProductInfo.Id) {
            item.ShoppingCartNum--;
          }
        })
        this.setData({
          reduceCarQuery,
          productList,
          isLoading: false
        })
        this.repeatGetCartInfo();
      })
    }
    this.data.selectedSku.selectedSkuNumber = this.data.selectedSku.selectedSkuNumber * 1 + quantity;
    this.data.skuDataInfo.forEach(item => {
      if (this.data.selectedSkuId == item.ProductSKU.SkuId) {
        item.ShopCarNum = this.data.selectedSku.selectedSkuNumber;
      }
    })
    this.setData({
      selectedSku: this.data.selectedSku,
      skuDataInfo: this.data.skuDataInfo
    })
  },
  //跳转至详情
  goDetail(e){
    let id = e.currentTarget.dataset.id;
    app.navigateTo(`/pages/detail/detail?productId=${id}`, 'navigateTo');
  },
  //点击全部分类展示二级分类
  toggleShowChildCategory(){
    this.setData({
      isShowChildCategory: !this.data.isShowChildCategory
    })
  },
  productSort(e){
    let type = Number(e.currentTarget.dataset.sorttype);
    const { productQuery}=this.data;
    let isDesc = productQuery.isDesc;
    let sortField = this.data.productQuery.sortField;
    productQuery.sortField=type;
    if(type==1||type==2){      
      if (type == sortField){
        productQuery.isDesc = !isDesc;
      }else{
        productQuery.isDesc = true;
      }
              
    }else{
      if (type == sortField) return;
    }  
    wx.showLoading({
      title: '加载中'
    }); 
    this.setData({
      productQuery
    }) 
    this.getBatchProduct(productQuery).then(data => {
      this.setData({        
        productList: data.Data,
        productTotal: data.Total,       
      })
      wx.hideLoading();
    });    
  },
  getTop(e) {
    this.scrollTop = this.data.rightScrollTop;
    this.setData({
      rightScrollTop: e.detail.scrollTop
    })       
  },
  handletouchend: function (event) {
    let srollTop = this.data.rightScrollTop;
    if (this.scrollTop > srollTop) {
      this.setData({
        isShowChildCategory: true
      })
    } else if (this.scrollTop < srollTop) {
      this.setData({
        isShowChildCategory: false
      })
    }
    this.scrollTop = this.data.rightScrollTop;
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {   
    const { productQuery } = this.data;
    productQuery.pageIndex=1;
      this.setData({
        productQuery: productQuery,
          isClose: wx.getStorageSync("isClose")         
      })
  },
  getuserinfo: function () {
      this.initData();
      this.setData({
          showAuthorization: false
      })
  }
})