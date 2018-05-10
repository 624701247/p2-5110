# p2物理引擎学习项目
##
#### 肖进超 --2018/5/10

##### egret 引擎5.1.0
##### 代码中知识点请搜索 kone point
##### egret教程：<a>http://developer.egret.com/cn/github/egret-docs/extension/p2/p2/index.html</a>
##### p2 api：<a>http://schteppe.github.io/p2.js/docs/</a>


## 知识点
* 对于某一个物体对象，在p2中，宽度高度是在Shape中设定的；位置和旋转却是由绑定该形状的Body设定。

* p2的坐标原点再左下角，并且转化成egret坐标需要乘上 factor = 50

* p2中Body的类型分为三种：
 1. type: p2.Body.STATIC // 地面和墙面不需要移动，并且不会对力和碰撞做出反应,用此类型
 2. type: p2.Body.KINEMATIC  //浮动跳板则均为p2.Body.KINEMATIC，这种类型会根据velocity属性进行运动，也不会对力和碰撞做出反应。  
 3. type: p2.Body.Dynamic  // 刚体会动，响应力和碰撞




