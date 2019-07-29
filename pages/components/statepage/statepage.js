// pages/components/statePage/statepage.js
Component({
    externalClasses: ['state-class'],
    properties: {
        stateTitle: { // 属性名
            type: String
        },
        stateTips:{
            type: String
        },
        btnContent:{
            type:String
        }
    },
  methods: {
      btnClick:function (){
          this.triggerEvent('statePageBtnClick');
      }
  }
})
