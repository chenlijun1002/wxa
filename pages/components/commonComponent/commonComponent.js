// pages/components/commonComponent/commonComponent.js
Component({
    /**
     * 组件的属性列表
     */
    options: {
        multipleSlots: true
    },
    properties: {
        demoComponent:{
            type:Boolean,
            value:false,
            observer:function (newVal,oldVal){}
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

    }
})
