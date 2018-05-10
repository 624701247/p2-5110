var factor: number = 50;

class Main extends eui.UILayer {

    protected createChildren(): void {
        super.createChildren();

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin
        })
        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        }
        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        }

        //inject the custom material parser
        //注入自定义的素材解析器
        let assetAdapter = new AssetAdapter();
        egret.registerImplementation("eui.IAssetAdapter", assetAdapter);
        egret.registerImplementation("eui.IThemeAdapter", new ThemeAdapter());

        this.runGame().catch(e => {
            console.log(e);
        })
    }

    private async runGame() {
        await this.loadResource()
        this.createGameScene();
    }

    private async loadResource() {
        try {
            const loadingView = new LoadingUI();
            this.stage.addChild(loadingView);
            await RES.loadConfig("resource/default.res.json", "resource/");
            await this.loadTheme();
            await RES.loadGroup("preload", 0, loadingView);
            this.stage.removeChild(loadingView);
        }
        catch (e) {
            console.error(e);
        }
    }

    private loadTheme() {
        return new Promise((resolve, reject) => {
            // load skin theme configuration file, you can manually modify the file. And replace the default skin.
            //加载皮肤主题配置文件,可以手动修改这个文件。替换默认皮肤。
            let theme = new eui.Theme("resource/default.thm.json", this.stage);
            theme.addEventListener(eui.UIEvent.COMPLETE, () => {
                resolve();
            }, this);

        })
    }

    /**
     * 创建场景界面
     * Create scene interface
     */
    private world:p2.World
    private createGameScene(): void {
        var stageHeight: number = egret.MainContext.instance.stage.stageHeight;


        //创建world
        var world: p2.World = new p2.World({
            gravity:[0, -50], //kone point: 重力设置，[x正数向右, y正数向下]。 取值区间：[-100, 100]
            islandSplit: true // ??
        });
        world.sleepMode = p2.World.BODY_SLEEPING;
        this.world = world


        //创建地面 plane
        let pos = this.posEgret2pw([0, stageHeight - 50])
        var planeShape: p2.Plane = new p2.Plane({});
        var planeBody: p2.Body = new p2.Body({
            position: pos,
            type: p2.Body.STATIC
        });
        planeBody.addShape(planeShape);
        var img = this.createBitmapByName('floor_jpg')
        planeBody.displays = [img];
        world.addBody(planeBody);

        egret.Ticker.getInstance().register((dt) => { //dt: 上一帧和这帧的间隔时间
            // console.log('dt', dt)
            if (dt < 10) {
                return;
            }
            if (dt > 1000) {
                return;
            }
            world.step(dt / 1000);
            for (var idx: number = 0; idx < world.bodies.length; idx++) {
                var boxBody: p2.Body = world.bodies[idx];
                var box: egret.DisplayObject = boxBody.displays[0];
                if (box) { //同步p2世界状态到egret显示
                    let pos = this.posPw2egret(boxBody.position)
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
        }, this);

        //鼠标点击添加刚体
        this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.addOneBox, this);
    } 


    private posPw2egret(pwPos:number[]): [number, number] {
        var stageHeight: number = egret.MainContext.instance.stage.stageHeight;
        let x = pwPos[0] * factor;
        let y = stageHeight - pwPos[1] * factor;
        return [x, y]
    }
    private posEgret2pw(egretPos:[number, number]): [number, number] {
        var stageHeight: number = egret.MainContext.instance.stage.stageHeight;
        let x = egretPos[0] / factor
        let y = (stageHeight - egretPos[1]) / factor
        return [x, y]
    }
    private sizeEgret2pw(size:[number, number]): [number, number] {
        return [size[0] / 50, size[1] / 50]
    }

    private addOneBox(e: egret.TouchEvent): void {
        let pos = this.posEgret2pw([e.stageX, e.stageY])
        pos[0] =  Math.floor(pos[0])
        pos[1] =  Math.floor(pos[1])
        var display: egret.DisplayObject
        if (Math.random() > 0.5) {
            display = this.addBodyShape(pos[0], pos[1])
        }
        else {
            display = this.addBodyCircle(pos[0], pos[1])
        }

        display.anchorOffsetX = display.width / 2;
        display.anchorOffsetY = display.height / 2;
        this.addChild(display);
    }

    //添加方形刚体
    private addBodyShape(positionX, positionY) {
        var display: egret.DisplayObject;
        var size = this.sizeEgret2pw([110, 110])

        var boxShape: p2.Shape = new p2.Box({
            width: size[0], 
            height: size[1]
        });
        var boxBody: p2.Body = new p2.Body({ 
            mass: 1000,  //重量
            position: [positionX, positionY], // 物理世界中的坐标
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
        return display
    }

    //添加圆形刚体
    private addBodyCircle(positionX, positionY) {
        var display: egret.DisplayObject;
        var boxShape: p2.Shape = new p2.Circle({ radius: 1 });
        var boxBody: p2.Body = new p2.Body({ 
            mass: 1, 
            position: [positionX, positionY] 
        });
        boxBody.addShape(boxShape);
        this.world.addBody(boxBody);

        display = this.createBitmapByName("circle_png");
        display.width = (<p2.Circle>boxShape).radius * 2 * factor;
        display.height = (<p2.Circle>boxShape).radius * 2 * factor;

        boxBody.displays = [display];
        return display
    }

    // 
    private createBitmapByName(name: string): egret.Bitmap {
        let result = new egret.Bitmap();
        let texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }



}
