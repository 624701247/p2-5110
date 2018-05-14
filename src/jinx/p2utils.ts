// TypeScript file
namespace jinx {

var factor: number = 50;

export class P2mgr {
    public static sInstance:P2mgr = null
    public static inst() {
        if(P2mgr.sInstance == null)  {
            P2mgr.sInstance = new P2mgr()
        }
        return P2mgr.sInstance
    }

    // 
    private world:p2.World
    private egStage
    private constructor() {
    }

    // 
    public init(egStage) {
        this.egStage = egStage

        var world: p2.World = new p2.World({
            gravity:[0, -50], //kone point: 重力设置，[x正数向右, y正数向下]。 取值区间：[-100, 100]
            islandSplit: true // ??
        });
        world.sleepMode = p2.World.BODY_SLEEPING;
        this.world = world

        egret.Ticker.getInstance().register(this.onP2Ticker, this);
        return this
    }

    //@param dt: 上一帧和这帧的间隔时间
    private onP2Ticker(dt) {
        // console.log('dt', dt)
        if (dt < 10) {
            return;
        }
        if (dt > 1000) {
            return;
        }
        this.world.step(dt / 1000);
        for (var idx: number = 0; idx < this.world.bodies.length; idx++) {
            var boxBody: p2.Body = this.world.bodies[idx];
            var box: egret.DisplayObject = boxBody.displays[0];
            if (box) { //同步p2世界状态到egret显示
                let pos = P2mgr.posPw2egret(boxBody.position)
                box.x = pos[0]
                box.y = pos[1]
                box.rotation = 360 - (boxBody.angle + boxBody.shapes[0].angle) * 180 / Math.PI;

                if (boxBody.sleepState == p2.Body.SLEEPING) { //刚体进入睡眠
                    box.alpha = 0.5;
                }
                else {
                    box.alpha = 1;
                }
            }
        }
    }

    // 
    public static posPw2egret(pwPos:number[]): [number, number] {
        var stageHeight: number = egret.MainContext.instance.stage.stageHeight;
        let x = pwPos[0] * factor;
        let y = stageHeight - pwPos[1] * factor;
        return [x, y]
    }
    public static posEgret2pw(egretPos:[number, number]): [number, number] {
        var stageHeight: number = egret.MainContext.instance.stage.stageHeight;
        let x = egretPos[0] / factor
        let y = (stageHeight - egretPos[1]) / factor
        return [x, y]
    }
    public static sizeEgret2pw(size:[number, number]): [number, number] {
        return [size[0] / 50, size[1] / 50]
    } 

    // 创建地面
    public createGround(egretY?:number) {
        var stageHeight: number = egret.MainContext.instance.stage.stageHeight;
        if(egretY == null) {
            egretY = stageHeight - 50
        }

        let pos = P2mgr.posEgret2pw([0, egretY])
        var planeShape: p2.Plane = new p2.Plane({});
        var planeBody: p2.Body = new p2.Body({
            position: pos,
            type: p2.Body.STATIC
        });
        planeBody.addShape(planeShape);
        planeBody.displays = [];
        this.world.addBody(planeBody);
    }

    // 创建围墙
    public createWall() {

    }

    // 

    //添加方形刚体
    public addBodyShape(stageX, stageY) {
        let pos = jinx.P2mgr.posEgret2pw([stageX, stageY])

        var display: egret.DisplayObject;
        var size = P2mgr.sizeEgret2pw([110, 110])

        var boxShape: p2.Shape = new p2.Box({
            width: size[0], 
            height: size[1]
        });
        var boxBody: p2.Body = new p2.Body({ 
            mass: 1000,  //重量
            position: pos, // 物理世界中的坐标
            angularVelocity: 1,  //角速度
            fixedRotation:true   // kone point :  fixed rotation, 即固定角度，不允许角度转动
        });
        boxBody.addShape(boxShape);
        this.world.addBody(boxBody);

        // 
        display = this.createBitmapByName("rect_png");

        display.width = (<p2.Box>boxShape).width * factor;
        display.height = (<p2.Box>boxShape).height * factor;

        boxBody.displays = [display];
        this.egStage.addChild(display)
    }

    //添加圆形刚体
    public addBodyCircle(stageX, stageY) {
        let pos = jinx.P2mgr.posEgret2pw([stageX, stageY])

        var display: egret.DisplayObject;
        var boxShape: p2.Shape = new p2.Circle({ radius: 1 });
        var boxBody: p2.Body = new p2.Body({ 
            mass: 1, 
            position: pos
        });
        boxBody.addShape(boxShape);
        this.world.addBody(boxBody);

        display = this.createBitmapByName("circle_png");
        display.width = (<p2.Circle>boxShape).radius * 2 * factor;
        display.height = (<p2.Circle>boxShape).radius * 2 * factor;

        boxBody.displays = [display];
        this.egStage.addChild(display)
    }

    // 创建 Bitmap 锚点居中
    private createBitmapByName(name: string): egret.Bitmap {
        let result = new egret.Bitmap();
        let texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        result.anchorOffsetX = result.width / 2
        result.anchorOffsetY = result.height / 2
        return result;
    }

}

}	//end of module
