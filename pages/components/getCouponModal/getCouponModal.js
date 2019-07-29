// pages/components/getCouponModal/getCouponModal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    couponData:{
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    closeGetCouponModal: function () {
      this.triggerEvent("action");      
    }
  }
})
