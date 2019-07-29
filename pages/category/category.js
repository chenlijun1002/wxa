//商品分类
var app = getApp();
var filter = app;
Page({
    /**
     * 页面的初始数据
     */
    data: {
        loadComplete: true,
        allEmpty: true,
        twoEmpty: true,
        categoryList: [],
        subCategoryList: [],
        currentClassText:'分类',
        currentTopCateId: -1,        
        categoryId: -1,
        subCategoryId: -1,
        leftScrollTop: 0, //一级分类滚动条位置
        rightScrollTop: 0, //商品列表滚动条位置
        rulePopup: '',
        isLoading: false,
        isPullUp: false,
        productQuery: {
          id: -1,
          type: 0,
          pageIndex: 1,
          pageSize: 10,
          isDesc: true,
          sortField: 0
        },
        isShowChildCategory: true,
        isShowChildCategory2:true,
        filterConditionType: 0,
        isDesc: false,
        tempdata:{},
        isBigscreen:false,
        // autoHeight: 0
    },
    categoryId: -1,
    subCategoryId: -1,
    subMidCategory:[],
    scrollTop:0,
    cateId: -1,
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      var that=this;
      wx.getSystemInfo({
        success: function (res) {                     
          if (res.windowHeight>=642) {            
            that.setData({
              isBigscreen:true
            })
          }
          // that.setData({
          //   autoHeight: res.windowHeight - res.windowWidth / 750 * 136
          // })       
        }
      })
      const { productQuery } = that.data;
      productQuery.pageIndex = 1;
      that.setData({
        productQuery: productQuery
      })
      app.request({
        url: '/ProductCategory/GetCurrentCategoryTpl',
        data: {},
        success(res) {
          if (res.Code == 0) {
            that.setData({
              tplId: res.Data.CategoryTplId
            })
            if (res.Data.CategoryTplId == 4) {
              const { productQuery } = that.data;
              productQuery.id = that.data.categoryId;
              that.getCategoryProduct(productQuery).then(data => {
                that.setData({
                  loadComplete: true,
                  productList: data.Data,
                  productTotal: data.Total,
                })
                let tempdata = that.data;
                that.setData({
                  tempdata: { ...tempdata }
                })
              })
            }
          }
        }
      })
    },
    getuserinfo: function () {
        this.initData(this);
        this.setData({
            showAuthorization: false
        })
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    initData: function (that) {
        filter.request({
          url: '/ProductCategory/GetCategories',
            data: {},
            success: function (res) {
                if (res.Data.length > 0) {//是否有一级分类  没有就显示为空状态
                  let selfId = res.Data[0].Id;
                  let selfChildrens = res.Data[0].Childrens;
                  let CName = res.Data[0].CName;
                  let BannerImg = res.Data[0].BannerImg;
                  if (that.cateId > -1) {
                    selfId = that.cateId;
                    for (let i = 0; i < res.Data.length; i++) {
                      if (res.Data[i].Id == that.cateId) {
                        selfChildrens = res.Data[i].Childrens;
                        CName = res.Data[i].CName;
                        BannerImg = res.Data[i].BannerImg;
                      }
                    }
                  }
                    that.setData({
                      categoryList: res.Data,
                      subCategoryList: selfChildrens,
                      currentTopCateId: selfId,
                      currentTopCateBanner: BannerImg,
                      categoryId: that.categoryId > 0 ? that.categoryId : selfId,
                      subCategoryId: that.subCategoryId > 0 ? that.subCategoryId : selfId,
                      currentClassText: CName,
                      subMidCategory: that.subMidCategory.length ? that.subMidCategory : selfChildrens
                    }) 
                  that.subMidCategory = that.subMidCategory.length ? that.subMidCategory : selfChildrens;
                  that.categoryId = that.categoryId > 0 ? that.categoryId : selfId; 
                  that.subCategoryId = that.subCategoryId > 0 ? that.subCategoryId : selfId;              
                } else {
                    that.setData({
                        allEmpty: false
                    })
                }
            },
            fail: function (fail) {
            }
        });
    },
    onShow: function () {        
        var forceBind = wx.getStorageSync('forceBind');
        if (forceBind) {
            app.navigateTo('../binduser/binduser', 'redirectTo');
            return;
        }
        var that = this;
        if (wx.getStorageSync('isLogin')) {
          if (this.data.showAuthorization) {
            this.setData({
              showAuthorization: false
            })
          }
          // const { productQuery}=that.data;
          // productQuery.pageIndex = 1;
          // that.setData({
          //   productQuery: productQuery
          // })
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
        // app.request({
        //   url: '/ProductCategory/GetCurrentCategoryTpl',
        //   data: {},
        //   success(res) {
        //     if (res.Code == 0) {             
        //       that.setData({
        //         tplId: res.Data.CategoryTplId
        //       })
        //       if (res.Data.CategoryTplId == 4) {
        //         const { productQuery } = that.data;
        //         productQuery.id = that.data.categoryId;
        //         that.getCategoryProduct(productQuery).then(data => {
        //           that.setData({
        //             loadComplete: true,
        //             productList: data.Data,
        //             productTotal: data.Total,
        //           })
        //           let tempdata = that.data;
        //           that.setData({
        //             tempdata: { ...tempdata }
        //           })
        //         })
        //       }
        //     }
        //   }
        // })
    },
    // 默认分类模板点击一级分类渲染二级分类
    getSubCategory: function (e) {
      const { categoryList } = this.data;
      let { id, name } = e.currentTarget.dataset;
      const categoryArr = categoryList.filter(v => v.Id == id);
      const subCategoryList = categoryArr.length ? categoryArr[0].Childrens : [];
      this.setData({
        subCategoryList,
        currentTopCateId: id,
        currentTopCateBanner: categoryArr[0].BannerImg,
        currentClassText: name
      })
      this.cateId = id;
    },
    searchProduct: function () {
        app.navigateTo('/pages/productlist/productlist', 'navigateTo');
    },
    lookTopCategory(e){
      let { id, cname } = e.currentTarget.dataset;
      app.navigateTo(`/pages/productlist/productlist?firstId=${id}&categoryName=${cname}`, 'navigateTo');
    },
    onShareAppMessage: function () {//分类分享
        var that = this;
        var siteName = wx.getStorageSync('shopInfo');
        siteName = siteName ? siteName.SiteName : '';
        var shopId = wx.getStorageSync('shopId');
        return {
            title: siteName,
            path: '/pages/category/category?shopId=' + shopId,
            success: function (res) {
            },
            fail: function (res) {
            }
        }
    },
    lookSubCategory(e){
        let { id,sname } = e.currentTarget.dataset;
        app.navigateTo(`/pages/productlist/productlist?secondId=${id}&categoryName=${sname}`, 'navigateTo');
    },
    // 切换一级分类 模板4
    toggleCategoryType(e) {
      let id = e.currentTarget.dataset.key;
      const info = e.currentTarget.dataset.info;
      const { productQuery } = this.data;
      if (id == this.data.categoryId) return;
      wx.showLoading({
        title: '加载中'
      })
      productQuery.id = id;
      productQuery.pageIndex = 1;
      this.categoryId=id;
      this.subCategoryId = id;
      this.setData({
        categoryId: id,
        subCategoryId:id,
        currentTopCategoryName: info.CName,
        currentTopCategoryId: id,
        productQuery,
        isShowChildCategory: false, 
        isShowChildCategory2: true,       
        subMidCategory: info.Childrens
      });
      this.subMidCategory = info.Childrens;
      this.getCategoryProduct(productQuery).then(data => {
        this.setData({
          rightScrollTop: 0,
          productList: data.Data,
          productTotal: data.Total
        })
        this.scrollTop=0;
        let tempdata = this.data;
        this.setData({
          tempdata: { ...tempdata }
        })
        wx.hideLoading();        
      })
    },
    // 切换二级分类
    toggleMidCategory(e) {
      const { productQuery, subCategoryId, currentTopCategoryId } = this.data;
      let { key, id } = e.currentTarget.dataset;
      if (id == subCategoryId) return;
      wx.showLoading({
        title: '加载中'
      });
      if (key > -1) {
        productQuery.id = e.currentTarget.dataset.id  //赋值为二级分类id
      } else {
        productQuery.id = id
      }      
      this.subCategoryId = id;
      productQuery.pageIndex = 1; //重置为第一页
      this.setData({
        productQuery,
        subCategoryId: id
      })
      this.getCategoryProduct(productQuery).then(data => {
        this.setData({
          rightScrollTop: 0,
          productList: data.Data,
          productTotal: data.Total
        });
        this.scrollTop = 0;
        let tempdata = this.data;
        this.setData({
          tempdata: { ...tempdata }
        })
        wx.hideLoading();
      })
    },
    // 监听商品列表滚动到底部事件
    scrollToLower(e) {     
      const { productQuery, productTotal, productList, isPullUp } = this.data;
      if (productList.length >= productTotal || isPullUp) {
        this.setData({
          isShowChildCategory: false
        })
        return;//无更多数据或者正在加载数据则阻止
        } 
      productQuery.pageIndex++;     
      this.setData({
        isPullUp: true       
      })       
      this.getCategoryProduct(productQuery).then(data => {
        this.setData({
          productList: [...productList, ...data.Data],
          isPullUp: false
        })        
        let tempdata = this.data;
        this.setData({
          tempdata: { ...tempdata }
        })        
      })
    },  
    getTop(e) {
      var type=e.currentTarget.dataset.scrolltype;      
      if(type==1){
        this.scrollTop = this.data.rightScrollTop;
        this.setData({
          rightScrollTop: e.detail.scrollTop
        })
      }else{
        this.leftscrollTop = this.data.leftScrollTop;
        this.setData({
          leftScrollTop: e.detail.scrollTop
        })
      }        
    },    
    handletouchend: function (event) {
      let srollTop = this.data.rightScrollTop;
      if (this.scrollTop > srollTop) {
        this.setData({
          isShowChildCategory2: true
        })
      } else if (this.scrollTop < srollTop) {
        this.setData({
          isShowChildCategory2: false
        })
      }     
      this.scrollTop = this.data.rightScrollTop;     
    },
    // 查询全部菜单
    getCategoryMenu() {
      return new Promise((resolve, reject) => {
        app.request({
          url: '/ProductCategory/GetCategories',
          data: {},
          success(res) {
            if (res.Code == 0) {
              resolve(res.Data)
            } else {
              reject()
            }
          }
        })
      })
    },
    // 查询分类产品
    getCategoryProduct(params) {           
      if (this.subCategoryId>0){
        params.id = this.subCategoryId;
      }      
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
    //跳转至详情
    goDetail(e) {
      let id = e.currentTarget.dataset.id;
      app.navigateTo(`/pages/detail/detail?productId=${id}`, 'navigateTo');
    },
    //点击全部分类展示二级分类
    toggleShowChildCategory() {
      this.setData({
        isShowChildCategory2: !this.data.isShowChildCategory2
      })
      let tempdata = this.data;
      this.setData({
        tempdata: { ...tempdata }
      })
    },
    productSort(e) {
      let type = Number(e.currentTarget.dataset.sorttype);
      const { productQuery } = this.data;
      productQuery.pageIndex=1;
      let isDesc = productQuery.isDesc;
      let sortField = this.data.productQuery.sortField;
      productQuery.sortField = type;
      if (type == 1 || type == 2) {
        if (type == sortField) {
          productQuery.isDesc = !isDesc;
        } else {
          productQuery.isDesc = true;
        }

      } else {
        if (type == sortField) return;
      }
      wx.showLoading({
        title: '加载中'
      });     
      this.setData({
        productQuery,
        rightScrollTop:0
      })
      this.getCategoryProduct(productQuery).then(data => {
        this.setData({
          productList: data.Data,
          productTotal: data.Total,
        })
        let tempdata = this.data;
        this.setData({
          tempdata: { ...tempdata }
        })
        wx.hideLoading();
      });
    },
})