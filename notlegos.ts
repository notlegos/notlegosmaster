// NotLegos Blocks
//% block="Not LEGOs" color=#0031AF weight=1000 icon="\uf3a5"
//% groups='["MP3","Sensors"]'
namespace notLegos {


/// BEGIN NEOPIXEL ///
    export enum hues { red = 0, orange = 15, yellow = 40, lime = 85, green = 110, cyan = 170, blue = 240, purple = 260, pink = 310 }
    export enum vfxEffect { parade = 0, fire = 1, indicate = 2, idle = 3, glow = 4, mine = 5, off = 6 }
    let NeoSock: Strip = null; let NeoScore: Strip = null; let NeoWheel: Strip = null; let NeoKong: Strip = null; let NeoStrip: Strip = null; let NeoBrick: Strip = null
    let vfx_mine_tog: number[] = []; let vfx_mine_hue: number[] = []; let vfx_mine_sat: number[] = []; let vfx_mine_lum: number[] = []
    let vfx_fire_tog: number[] = []; let vfx_fire_hue: number[] = []; let vfx_fire_sat: number[] = []; let vfx_fire_lum: number[] = []; let vfx_fire_colors: number[] = []
    let vfx_indicate_tog: number[] = []; let vfx_indicate_hue: number[] = []; let vfx_indicate_sat: number[] = []; let vfx_indicate_lum: number[] = [];
    let vfx_idle_tog: number[] = []; let vfx_idle_hue: number[] = []; let vfx_idle_sat: number[] = []; let vfx_idle_lum: number[] = []
    let vfx_glow_tog: number[] = []; let vfx_glow_hue: number[] = []; let vfx_glow_sat: number[] = []; let vfx_glow_lum: number[] = []
    let vfx_parade_tog: number[] = []; let vfx_parade_hue: number[] = []; let vfx_parade_sat: number[] = []; let vfx_parade_lum: number[] = []; let vfx_parade_colors: number[] = [];
    let vfx_last_tog: number[] = []; let vfx_last_hue: number[] = []; let vfx_last_sat: number[] = []; let vfx_last_lum: number[] = []
    let vfx_master_tog: number[] = []; let vfx_master_hue: number[] = []; let vfx_master_sat: number[] = []; let vfx_master_lum: number[] = []; let vfx_master_effect: number[] = [];
    let vfx_light_count = 0

    //% shim=sendBufferAsm
    function sendBuffer(buf: Buffer, pin: DigitalPin) { }

    export class Strip {
        buf: Buffer;
        pin: DigitalPin;
        start: number; // start offset in LED strip
        _length: number; // number of LEDs

        setPixelHSLPrecise(pixeloffset: number, h: number, s: number, l: number): void {
            if (pixeloffset < 0 || pixeloffset >= this._length)
                return;
            pixeloffset = (pixeloffset + this.start) * 3
            h = Math.clamp(0,1,h/360)
            s = Math.clamp(0,1,s/100)
            l = Math.clamp(0,1,l/100)
            let r, g, b;
            if (s === 0) {
                r = g = b = l; // achromatic
            } else {
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = this.hueToRgb(p, q, h + 1 / 3);
                g = this.hueToRgb(p, q, h);
                b = this.hueToRgb(p, q, h - 1 / 3);
            }
            this.buf[pixeloffset + 0] = Math.round(g * 255);
            this.buf[pixeloffset + 1] = Math.round(r * 255);
            this.buf[pixeloffset + 2] = Math.round(b * 255);
        }

        hueToRgb(p:number, q:number, t:number) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        show() { sendBuffer(this.buf, this.pin); }  //Send all the changes to the strip.

        length() { return this._length; }   //Gets the number of pixels declared on the strip

        shift(offset: number = 1): void { this.buf.shift(-offset * 3, this.start * 3, this._length * 3) }   //Shift LEDs forward and clear with zeros.

        rotate(offset: number = 1): void { this.buf.rotate(-offset * 3, this.start * 3, this._length * 3) } //Rotate LEDs forward

        setPin(pin: DigitalPin): void {
            this.pin = pin;
            pins.digitalWritePin(this.pin, 0);  // don't yield to avoid races on initialization
        }
    }

    function create(thePin: DigitalPin, numleds: number): Strip {
        let strip = new Strip();
        strip.buf = pins.createBuffer(numleds * 3);
        strip.start = 0;
        strip._length = numleds;
        strip.setPin(thePin)
        return strip;
    }

    //% blockId=NL_PIXEL_CastleSay
    //% subcategory="Neopixel" Group="Neopixel"
    //% block="Sock Circle:%sockPin  Wheel Strip/Circle:%wheelPin  Score Circle:%scorePin "
    //% weight=100
    export function castleSayLights(sockPin: DigitalPin, wheelPin: DigitalPin, scorePin: DigitalPin): void {
        NeoScore = create(scorePin, 8)
        NeoSock = create(sockPin, 8)
        NeoWheel = create(wheelPin, 18)
        vfx_light_count = 8 + 8 + 18
        vfxInit()
        vfx_indicate_hue[30]=hues.green
        vfx_indicate_hue[31] = hues.yellow
        vfx_indicate_hue[32] = hues.orange
        vfx_indicate_hue[33] = hues.red
        vfx_indicate_hue[26] = hues.red
        vfx_indicate_hue[27] = hues.red
        vfx_indicate_hue[28] = hues.red
        vfx_indicate_hue[29] = hues.red

        // setEffect(vfxRegion.CastleSayAll, vfxEffect.parade)
    }

    //% blockId=NL_PIXEL_CastleDo
    //% subcategory="Neopixel" Group="Neopixel"
    //% block="Strips:%spotPin  Bricks:%brickPin Kong Lights:%kongPin"
    //% weight=100
    export function castleDoLights(stripPin: DigitalPin, brickPin: DigitalPin, kongPin: DigitalPin): void {
        NeoStrip = create(stripPin, 20)
        NeoBrick = create(brickPin, 8)
        NeoKong = create(kongPin, 4)
        vfx_light_count = 20 + 8 + 4
        vfxInit()
        vfx_indicate_hue[0]=hues.cyan; vfx_indicate_hue[1]=hues.cyan   //spot h
        vfx_indicate_hue[2] = hues.pink; vfx_indicate_hue[3] = hues.pink //spot f
        vfx_indicate_hue[26] = hues.pink   //shell brick
        vfx_indicate_hue[4] = hues.orange; vfx_indicate_hue[5] = hues.orange   //spot d
        vfx_indicate_hue[21] = hues.orange   //cannon brick
        vfx_indicate_hue[25] = hues.orange   //bomb brick
        vfx_indicate_hue[6] = hues.yellow; vfx_indicate_hue[7] = hues.yellow   //spot b
        vfx_indicate_hue[8] = hues.red; vfx_indicate_hue[9] = hues.red; vfx_indicate_hue[10] = hues.red; vfx_indicate_hue[11] = hues.red  //spot a
        vfx_indicate_hue[20] = hues.red; vfx_indicate_hue[27] = hues.red  //wheel bricks
        vfx_indicate_hue[12] = hues.blue; vfx_indicate_hue[13] = hues.blue    //spot c
        vfx_indicate_hue[14] = hues.cyan; vfx_indicate_hue[15] = hues.cyan    //spot e
        vfx_indicate_hue[16] = hues.purple; vfx_indicate_hue[17] = hues.purple  //spot g
        vfx_indicate_hue[24] = hues.purple  //ghost brick
        vfx_indicate_hue[18] = hues.green; vfx_indicate_hue[19] = hues.green   //spot i
        vfx_indicate_hue[28] = hues.green; vfx_indicate_hue[29] = hues.green; vfx_indicate_hue[30] = hues.green; vfx_indicate_hue[31] = hues.green   //kong
        vfx_indicate_hue[22] = hues.yellow; vfx_indicate_hue[23] = hues.yellow  //dragon brick
        vfx_indicate_tog[0] = 1; vfx_indicate_tog[1] = 1 //spot h
        vfx_indicate_tog[2] = 1; vfx_indicate_tog[3] = 1 //spot f
        vfx_indicate_tog[4] = 1; vfx_indicate_tog[5] = 1 //spot d
        vfx_indicate_tog[6] = 1; vfx_indicate_tog[7] = 1 //spot b
        vfx_indicate_tog[8] = 1; vfx_indicate_tog[9] = 1 //spot a
        vfx_indicate_tog[22] = 1; vfx_indicate_tog[27] = 1    //wheel bricks
        vfx_indicate_tog[21] = 1    //cannon brick
        vfx_indicate_tog[25] = 1    //bomb brick
        vfx_indicate_tog[26] = 1    //shell brick
        vfx_indicate_tog[31] = 1; vfx_indicate_tog[30] = 1    //kong
        
        // setEffect(vfxRegion.CastleDoAll, vfxEffect.indicate)
    }

    function vfxInit(): void{
        vfx_parade_colors = [hues.red, hues.orange, hues.yellow, hues.cyan, hues.blue, hues.purple]
        vfx_fire_colors = [hues.red, hues.red, hues.red, hues.red, hues.orange, hues.orange, hues.orange, hues.orange, hues.orange, hues.yellow]
        for (let index = 0; index < vfx_light_count; index++) {
             
            vfx_indicate_tog.push(0)
            vfx_indicate_lum.push(50)
            vfx_indicate_hue.push(50)
            vfx_indicate_sat.push(100)

            vfx_mine_tog.push(0)
            vfx_mine_hue.push(hues.red)
            vfx_mine_sat.push(100)
            vfx_mine_lum.push(50)

            vfx_fire_tog.push(randint(0, 1))
            vfx_fire_hue.push(vfx_fire_colors[randint(0, vfx_fire_colors.length - 1)])
            vfx_fire_sat.push(100)
            vfx_fire_lum.push(randint(30, 80))

            vfx_idle_tog.push(1)
            if (index % 2 == 0) { vfx_idle_tog[index] = 0; }
            vfx_idle_hue.push(265)
            if (index % 2 == 0) { vfx_idle_hue[index] = 2; }
            vfx_idle_sat.push(100)
            vfx_idle_lum.push(50)

            vfx_glow_tog.push(0)
            vfx_glow_hue.push(50)
            vfx_glow_sat.push(0)
            vfx_glow_lum.push(0)

            vfx_parade_tog.push(randint(0, 1))
            vfx_parade_hue.push(vfx_parade_colors[randint(0, vfx_parade_colors.length-1)])
            vfx_parade_sat.push(100)
            vfx_parade_lum.push(randint(10, 65))

            vfx_last_tog.push(0)
            vfx_last_hue.push(50)
            vfx_last_sat.push(100)
            vfx_last_lum.push(50)

            vfx_master_tog.push(0)
            vfx_master_hue.push(0)
            vfx_master_sat.push(100)
            vfx_master_lum.push(50)
            vfx_master_effect.push(vfxEffect.off)    //leave this be!
        }
    }

    //% blockId=NL_PIXEL_ResetVFX
    //% subcategory="Neopixel" Group="Neopixel"
    //% block="Reset VFX %effect"
    //% weight=100
    export function vfxReset(effect:vfxEffect):void{
        if (effect == vfxEffect.idle){
            for (let index = 0; index < vfx_light_count; index++) {
                vfx_idle_tog[index]=1
                if (index % 2 == 0) { vfx_idle_tog[index] = 0; }
                vfx_idle_hue[index]=265
                if (index % 2 == 0) { vfx_idle_hue[index] = 2; }
                vfx_idle_sat[index]=100
                vfx_idle_lum[index]=50
            }
        } else if (effect == vfxEffect.glow) {
            for (let index = 0; index < vfx_light_count; index++) {
                vfx_glow_tog[index] = 0
                vfx_glow_hue[index] = 50
                // vfx_glow_sat[index] = 100
                vfx_glow_lum[index] = 0
            }
        } else if (effect == vfxEffect.mine) {
            for (let index = 0; index < vfx_light_count; index++) {
                vfx_mine_tog[index] = 0
                vfx_mine_hue[index] = hues.red
                vfx_mine_sat[index] = 100
                vfx_mine_lum[index] = 50
            }
        } else if (effect == vfxEffect.indicate) {
            for (let index = 0; index < vfx_light_count; index++) {
                vfx_indicate_tog[index] = 0
                vfx_indicate_sat[index] = 100
                vfx_indicate_lum[index] = 50
            }
        }
    }

    //% blockId=NL_PIXEL_CastleSayTick
    //% subcategory="Neopixel" Group="Neopixel"
    //% block="Advance Castle Say lights"
    //% weight=100
    export function castleSayTick(): void {
        paradeTick()
        fireTick()
        glowTick()
        castleSayWrite()
        indicateTick()
        idleTick()
        mineTick()
    }

    //% blockId=NL_PIXEL_CastleDoTick
    //% subcategory="Neopixel" Group="Neopixel"
    //% block="Advance Castle Do lights"
    //% weight=100
    export function castleDoTick(): void {
        paradeTick()
        fireTick()
        glowTick()
        castleDoWrite()
        indicateTick()
        idleTick()
        mineTick()
    }

    function paradeTick(): void{
        for (let index=0; index < vfx_light_count; index++){
            let thisLum = vfx_parade_lum[index]
            let thisHue = vfx_parade_hue[index]
            let thisTog = vfx_parade_tog[index]
            let nextHue = thisHue
            if (thisTog == 0){
                if (thisLum < 65){
                    vfx_parade_lum[index] = thisLum + 12
                } else if (thisLum >= 65){
                    vfx_parade_tog[index] = 1
                }
            } else if (thisTog == 1){
                if (thisLum>10){
                    vfx_parade_lum[index] = thisLum - 4
                } else if (thisLum <= 10){
                    vfx_parade_tog[index] = 0
                    while (nextHue == thisHue){
                        nextHue = vfx_parade_colors[randint(0, vfx_parade_colors.length - 1)]
                    }
                    vfx_parade_hue[index] = nextHue
                    vfx_parade_lum[index] = thisLum - randint(0,10)
                }
            }
        }
    }

    function mineTick(): void {
        for (let index = 0; index < vfx_light_count; index++) {
            let thisLum = vfx_mine_lum[index]
            let thisHue = vfx_mine_hue[index]
            let thisTog = vfx_mine_tog[index]
            let nextHue = thisHue
            if (thisTog == 0) {
                if (thisLum < 200) {
                    vfx_mine_lum[index] = thisLum + 30
                } else if (thisLum >= 200) {
                    vfx_mine_tog[index] = 1
                }
            } else if (thisTog == 1) {
                if (thisLum > 0) {
                    vfx_mine_lum[index] = thisLum - 30
                } else if (thisLum <= 0) {
                    vfx_mine_tog[index] = 0
                }
            }
        }
    }

    function idleTick(): void {
        for (let index = 0; index < vfx_light_count; index++) {
            let thisLum = vfx_idle_lum[index]
            let thisHue = vfx_idle_hue[index]
            let thisTog = vfx_idle_tog[index]
            let nextHue = thisHue
            if (thisTog == 0) {
                if (thisHue < 265) {
                    vfx_idle_hue[index] = thisHue + 1
                } else if (thisHue >= 265) {
                    vfx_idle_tog[index] = 1
                }
            } else if (thisTog == 1) {
                if (thisHue > 2) {
                    vfx_idle_hue[index] = thisHue - 1
                } else if (thisHue <= 2) {
                    vfx_idle_tog[index] = 0
                }
            }
        }
    }

    function indicateTick(): void {
        for (let index = 0; index < vfx_light_count; index++) {
            let thisLum = vfx_indicate_lum[index]
            let thisHue = vfx_indicate_hue[index]
            let thisTog = vfx_indicate_tog[index]
            let nextHue = thisHue
            if (thisTog == 0) {
                if (thisLum < 80) {
                    vfx_indicate_lum[index] = thisLum + 12
                } else if (thisLum >= 80) {
                    vfx_indicate_tog[index] = 1
                }
            } else if (thisTog == 1) {
                if (thisLum > 25) {
                    vfx_indicate_lum[index] = thisLum - 4
                } else if (thisLum <= 25) {
                    vfx_indicate_tog[index] = 0
                }
            }
        }
    }

    function fireTick(): void {
        for (let index = 0; index < vfx_light_count; index++) {
            let thisLum = vfx_fire_lum[index]
            let thisHue = vfx_fire_hue[index]
            let thisTog = vfx_fire_tog[index]
            let nextHue = thisHue
            if (thisTog == 0) {
                if (thisLum < 80) {
                    vfx_fire_lum[index] = thisLum + 15
                } else if (thisLum >= 80) {
                    vfx_fire_tog[index] = 1
                }
            } else if (thisTog == 1) {
                if (thisLum > 30) {
                    vfx_fire_lum[index] = thisLum - 5
                } else if (thisLum <= 30) {
                    vfx_fire_tog[index] = 0
                    while (nextHue == thisHue) {
                        nextHue = vfx_fire_colors[randint(0, vfx_fire_colors.length - 1)]
                    }
                    vfx_fire_hue[index] = nextHue
                    vfx_fire_lum[index] = thisLum - randint(0, 30)
                }
            }
        }
    }

    function glowTick(): void {
        for (let index = 0; index < vfx_light_count; index++) {
            let thisLum = vfx_glow_lum[index]
            if (thisLum < 4){
                vfx_glow_lum[index] = thisLum+.2
            } else if (thisLum < 5) {
                vfx_glow_lum[index] = thisLum+ + .3
            } else if (thisLum < 10) {
                vfx_glow_lum[index] = thisLum + .5
            } else if (thisLum < 15) {
                vfx_glow_lum[index] = thisLum + 1
            }else if (thisLum < 30) {
                vfx_glow_lum[index] = thisLum + 1.5
            } else if (thisLum < 100) {
                vfx_glow_lum[index] = thisLum + 4
            } else{
                vfx_glow_lum[index] = 0
            }
        }
    }

    function vfxPrepareMaster(): void{
        for (let index = 0; index < vfx_light_count; index++) {
            let thisEffect = vfx_master_effect[index]
            if (thisEffect == vfxEffect.parade) {
                vfx_master_hue[index] = vfx_parade_hue[index]
                vfx_master_sat[index] = vfx_parade_sat[index]
                vfx_master_lum[index] = Math.max(0,Math.min(50,vfx_parade_lum[index]))
            } else if (thisEffect == vfxEffect.fire) {
                vfx_master_hue[index] = vfx_fire_hue[index]
                vfx_master_sat[index] = vfx_fire_sat[index]
                vfx_master_lum[index] = Math.max(0, Math.min(50, vfx_fire_lum[index]))
            } else if (thisEffect == vfxEffect.indicate) {
                vfx_master_hue[index] = vfx_indicate_hue[index]
                vfx_master_sat[index] = vfx_indicate_sat[index]
                vfx_master_lum[index] = Math.max(0, Math.min(50, vfx_indicate_lum[index]))
            } else if (thisEffect == vfxEffect.idle) {
                vfx_master_hue[index] = vfx_idle_hue[index]
                vfx_master_sat[index] = vfx_idle_sat[index]
                vfx_master_lum[index] = Math.max(0, Math.min(50, vfx_idle_lum[index]))
            } else if (thisEffect == vfxEffect.glow) {
                vfx_master_hue[index] = vfx_glow_hue[index]
                vfx_master_sat[index] = vfx_glow_sat[index]
                vfx_master_lum[index] = Math.min(100,vfx_glow_lum[index])
            } else if (thisEffect == vfxEffect.mine) {
                vfx_master_hue[index] = vfx_mine_hue[index]
                vfx_master_sat[index] = vfx_mine_sat[index]
                vfx_master_lum[index] = Math.max(0, Math.min(50, vfx_mine_lum[index]))
            } else if (thisEffect == vfxEffect.off) {
                vfx_master_hue[index] = vfx_mine_hue[index]
                vfx_master_sat[index] = vfx_mine_sat[index]
                vfx_master_lum[index] = 0
            }
        }
    }
    function castleSayWrite(): void{
        vfxPrepareMaster()
        let masterIndex = 0
        for (let index = 0; index < NeoSock.length(); index++){
            NeoSock.setPixelHSLPrecise(index, vfx_master_hue[masterIndex], vfx_master_sat[masterIndex], vfx_master_lum[masterIndex])
            masterIndex++
        }
        for (let index = 0; index < NeoWheel.length(); index++) {
            NeoWheel.setPixelHSLPrecise(index, vfx_master_hue[masterIndex], vfx_master_sat[masterIndex], vfx_master_lum[masterIndex])
            masterIndex++
        }
        for (let index = 0; index < NeoScore.length(); index++) {
            NeoScore.setPixelHSLPrecise(index, vfx_master_hue[masterIndex], vfx_master_sat[masterIndex], vfx_master_lum[masterIndex])
            masterIndex++
        }
        NeoSock.show()
        NeoWheel.show()
        NeoScore.show()
    }

    function castleDoWrite(): void {
        vfxPrepareMaster()
        let masterIndex = 0
        for (let index = 0; index < NeoStrip.length(); index++) {
            NeoStrip.setPixelHSLPrecise(index, vfx_master_hue[masterIndex], vfx_master_sat[masterIndex], vfx_master_lum[masterIndex])
            masterIndex++
        }
        for (let index = 0; index < NeoBrick.length(); index++) {
            NeoBrick.setPixelHSLPrecise(index, vfx_master_hue[masterIndex], vfx_master_sat[masterIndex], vfx_master_lum[masterIndex])
            masterIndex++
        }
        for (let index = 0; index < NeoKong.length(); index++) {
            NeoKong.setPixelHSLPrecise(index, vfx_master_hue[masterIndex], vfx_master_sat[masterIndex], vfx_master_lum[masterIndex])
            masterIndex++
        }
        NeoStrip.show()
        NeoBrick.show()
        NeoKong.show()
    }

    //% blockId=NL_PIXEL_SetEffect
    //% subcategory="Neopixel" Group="Neopixel"
    //% block="Set %region VFX to %effect"
    //% weight=100
    export function setEffect(region:vfxRegion, effect:vfxEffect){
        if (region == vfxRegion.Score1){
            vfx_master_effect[30] = effect
        } else if (region == vfxRegion.Score2) {
            vfx_master_effect[31] = effect
        } else if (region == vfxRegion.Score3) {
            vfx_master_effect[32] = effect
        } else if (region == vfxRegion.Score4) {
            vfx_master_effect[33] = effect
        } else if (region == vfxRegion.Score5) {
            vfx_master_effect[26] = effect
        } else if (region == vfxRegion.Score6) {
            vfx_master_effect[27] = effect
        } else if (region == vfxRegion.Score7) {
            vfx_master_effect[28] = effect
        } else if (region == vfxRegion.Score8) {
            vfx_master_effect[29] = effect
        } else if (region == vfxRegion.ScoreAll) {
            for (let i = 26; i <= 33; i++) { vfx_master_effect[i] = effect };
        } else if (region == vfxRegion.SockAll) {
            for (let i = 0; i <= 7; i++) { vfx_master_effect[i] = effect };
        } else if (region == vfxRegion.WheelInner) {
            for (let i = 18; i <= 25; i++) { vfx_master_effect[i] = effect };
        } else if (region == vfxRegion.WheelOuter) {
            for (let i = 8; i <= 17; i++) { vfx_master_effect[i] = effect };
        } else if (region == vfxRegion.WheelAll) {
            for (let i=8; i <= 25; i++){ vfx_master_effect[i] = effect };
        } else if (region == vfxRegion.CastleSayAll) {
            for (let i = 0; i <= 33; i++) { vfx_master_effect[i] = effect };
        } else if (region == vfxRegion.SpotA) {
            for (let i = 8; i <= 11; i++) { vfx_master_effect[i] = effect };
        } else if (region == vfxRegion.SpotB) {
            for (let i = 6; i <= 7; i++) { vfx_master_effect[i] = effect };
        } else if (region == vfxRegion.SpotC) {
            for (let i = 12; i <= 13; i++) { vfx_master_effect[i] = effect };
        } else if (region == vfxRegion.SpotD) {
            for (let i = 4; i <= 5; i++) { vfx_master_effect[i] = effect };
        } else if (region == vfxRegion.SpotE) {
            for (let i = 14; i <= 15; i++) { vfx_master_effect[i] = effect };
        } else if (region == vfxRegion.SpotF) {
            for (let i = 2; i <= 3; i++) { vfx_master_effect[i] = effect };
        } else if (region == vfxRegion.SpotG) {
            for (let i = 16; i <= 17; i++) { vfx_master_effect[i] = effect };
        } else if (region == vfxRegion.SpotH) {
            for (let i = 0; i <= 1; i++) { vfx_master_effect[i] = effect };
        } else if (region == vfxRegion.SpotI) {
            for (let i = 18; i <= 19; i++) { vfx_master_effect[i] = effect };
        } else if (region == vfxRegion.SpotAll) {
            for (let i = 0; i <= 19; i++) { vfx_master_effect[i] = effect };
        } else if (region == vfxRegion.BrickWheel) {
            vfx_master_effect[20] = effect
            vfx_master_effect[27] = effect
        } else if (region == vfxRegion.BrickBomb) {
            vfx_master_effect[25] = effect
        } else if (region == vfxRegion.BrickShell) {
            vfx_master_effect[26] = effect
        } else if (region == vfxRegion.BrickGhost) {
            vfx_master_effect[24] = effect
        } else if (region == vfxRegion.BrickDragon) {
            for (let i = 22; i <= 23; i++) { vfx_master_effect[i] = effect };
        } else if (region == vfxRegion.BrickCannon) {
            vfx_master_effect[21] = effect
        } else if (region == vfxRegion.BrickAll) {
            for (let i = 20; i <= 27; i++) { vfx_master_effect[i] = effect };
        } else if (region == vfxRegion.KongFront) {
            for (let i = 28; i <= 29; i++) { vfx_master_effect[i] = effect };
        } else if (region == vfxRegion.KongBack) {
            for (let i = 30; i <= 31; i++) { vfx_master_effect[i] = effect };
        } else if (region == vfxRegion.KongAll) {
            for (let i = 28; i <=31; i++) { vfx_master_effect[i] = effect };
        } else if (region == vfxRegion.CastleDoAll) {
            for (let i = 0; i < vfx_light_count; i++) { vfx_master_effect[i] = effect };
        } 
    }

    export enum vfxRegion{
        Score1, Score2, Score3, Score4, Score5, Score6, Score7, Score8, ScoreAll,
        SockAll,
        WheelInner, WheelOuter, WheelAll,
        KongFront, KongBack, KongAll,
        BrickWheel, BrickBomb, BrickShell, BrickGhost, BrickDragon, BrickCannon, BrickAll,
        SpotA, SpotB, SpotC, SpotD, SpotE, SpotF, SpotG, SpotH, SpotI, SpotAll,
        CastleSayAll,
        CastleDoAll
    }

/// END NEOPIXEL ///


/// BEGIN SONAR ///

    let sonarPinT = DigitalPin.P0
    let sonarPinE = DigitalPin.P0

    //% blockId=NL_SENSOR_SonarFirstRead
    //% subcategory="Sensors" Group="Sensors"
    //% block="first distance from sonar at %pin1|%pin2"
    //% weight=101
    export function SonarFirstRead(pin1: DigitalPin, pin2: DigitalPin): number {
        sonarPinT = pin1
        sonarPinE = pin2
        pins.setPull(sonarPinT, PinPullMode.PullNone)
        return SonarNextRead()
    }

    //% blockId=NL_SENSOR_SonarNextRead
    //% subcategory="Sensors" Group="Sensors"
    //% block="next sonar distance"
    //% weight=100
    export function SonarNextRead(): number {
        pins.digitalWritePin(sonarPinT, 0)
        control.waitMicros(2)
        pins.digitalWritePin(sonarPinT, 1)
        control.waitMicros(10)
        pins.digitalWritePin(sonarPinT, 0)
        return Math.floor(pins.pulseIn(sonarPinE, PulseValue.High, 25000) * 34 / 2000)
    }

/// END SONAR ///


/// BEGIN MP3 ///

    export enum playType { Play = 0x0D, Stop = 0x16, PlayNext = 0x01, PlayPrevious = 0x02, Pause = 0x0E }
    let Start_Byte = 0x7E
    let Version_Byte = 0xFF
    let Command_Length = 0x06
    let End_Byte = 0xEF
    let Acknowledge = 0x00
    let CMD = 0x00
    let para1 = 0x00
    let para2 = 0x00
    let highByte = 0x00
    let lowByte = 0x00
    let dataArr: number[] = [Start_Byte, Version_Byte, Command_Length, CMD, Acknowledge, para1, para2, highByte, lowByte, End_Byte]
    let mp3musicPin: SerialPin
    let mp3music = false
    let mp3player = false
    let mp3sfxPin: SerialPin
    let mp3sfx = false
    let mp3musicVol = 0
    let mp3playerPin: SerialPin
    let mp3playerVol = 0
    let mp3sfxVol = 0
    let isPot = false
    let potPin = AnalogPin.P0
    let masterVolume = 25

    //% blockId=NL_SENSOR_TrimpotSet
    //% subcategory="Sensors" Group="Sensors"
    //% block="set volume control pot at %aPin"
    export function potSet(aPin: AnalogPin): void {
        potPin = aPin
        isPot = true
        masterVolume = potRead()
    }

    function potRead() {
        if (isPot) { return Math.round(pins.map(pins.analogReadPin(potPin), 0, 1023, 0, 30)) }
        else { return 5 }
    }

    function mp3_checkSum(): void {
        let total = 0;
        for (let i = 1; i < 7; i++) { total += dataArr[i] }
        total = 65536 - total
        lowByte = total & 0xFF;
        highByte = total >> 8;
        dataArr[7] = highByte
        dataArr[8] = lowByte
    }

    function mp3_sendData(): void {
        let myBuff = pins.createBuffer(10);
        for (let i = 0; i < 10; i++) { myBuff.setNumber(NumberFormat.UInt8BE, i, dataArr[i]) }
        serial.writeBuffer(myBuff)
        basic.pause(20) // Was 100; problematic at 10
    }

    function mp3_sendDataFast(): void {
        let myBuff = pins.createBuffer(10);
        for (let i = 0; i < 10; i++) { myBuff.setNumber(NumberFormat.UInt8BE, i, dataArr[i]) }
        serial.writeBuffer(myBuff)
    }

    //% blockId=NL_MP3_InitiateAs
    //% subcategory="MP3" group="MP3"
    //% block="Ready MP3bit for %type at %sPin"
    //% dPin.fieldEditor="gridpicker"
    export function mp3setPorts(mp3bit: mp3type, sPin: SerialPin): void {
        if (mp3bit == mp3type.music) {
            mp3musicPin = sPin
            mp3music = true
            mp3musicVol = 60
            setVolume(mp3type.music, mp3musicVol)
        } else if (mp3bit == mp3type.player) {
            mp3playerPin = sPin
            mp3player = true
            mp3playerVol = 100
            setVolume(mp3type.player, mp3playerVol)
        } else if (mp3bit == mp3type.sfxvoice) {
            mp3sfxPin = sPin
            mp3sfx = true
            mp3sfxVol = 80
            setVolume(mp3type.sfxvoice, mp3sfxVol)
        }   
    }

    //% blockId="nl_playfilefolder" 
    //% block="Play folder %folderNum file %fileNum on %sPin"
    //% subcategory=MP3 group="MP3"
    export function sendMP3fileFolder(folderNum: string, fileNum: string, sPin: SerialPin): void {
        serial.redirect(sPin, SerialPin.USB_RX, BaudRate.BaudRate9600)
        CMD = 15
        para1 = parseInt(folderNum)
        para2 = parseInt(fileNum)
        dataArr[3] = CMD
        dataArr[5] = para1
        dataArr[6] = para2
        mp3_checkSum()
        mp3_sendDataFast()
    }

    //% blockId="NL_MP3_SendNumbers" 
    //% block="Send numbers for folder %folderNum file %fileNum on %sPin"
    //% subcategory=MP3 group="MP3"
    export function sendMP3numbers(folderNum: number, fileNum: number, sPin: SerialPin): void {
        serial.redirect(sPin, SerialPin.USB_RX, BaudRate.BaudRate9600)
        dataArr[3] = 15
        dataArr[5] = folderNum
        dataArr[6] = fileNum
        mp3_checkSum()
        mp3_sendDataFast()
    }


    //% blockId=NL_MP3_PlayerSay
    //% subcategory="MP3" group="MP3"
    //% block="Say %saying as player"
    export function mp3sayPlay(saying: playerSaying): void {

    }

    //% blockId=NL_MP3_VoicePlay
    //% subcategory="MP3" group="MP3"
    //% block="Say %voice as voice"
    export function mp3voicePlay(voice: voiceSaying): void {

    }

    //% blockId=NL_MP3_MagicianSay
    //% subcategory="MP3" group="MP3"
    //% block="Magician says on the %side difficulty %difficulty"
    export function mp3magician(side: magicianSaysSide, difficulty: magicianDifficulty): void {

    }

    //% blockId=NL_MP3_SfxPlay
    //% subcategory="MP3" group="MP3"
    //% block="Play %sfx sound effect"
    export function mp3sfxPlay(sfx: sfxType): void {

    }

    //% blockId=NL_MP3_UpdateVolume
    //% subcategory="MP3" group="MP3"
    //% block="Update volume for all"
    export function updateVolumeGlobal(): void {
        let nowVol = potRead()
        if (masterVolume != nowVol){
            masterVolume = nowVol
            setVolume(mp3type.music, mp3musicVol)
            //setVolume(mp3type.player, mp3playerVol)
            //setVolume(mp3type.sfxvoice, mp3sfxVol)
        }
    }

    //% blockId=NL_MP3_SetVolume
    //% subcategory="MP3" group="MP3"
    //% block="Set %mp3bit volume to %vol"
    export function setVolume(mp3bit:mp3type, vol:number): void {
        let theVolume = 0
        if (mp3bit == mp3type.music) {
            serial.redirect(mp3musicPin, SerialPin.USB_RX, BaudRate.BaudRate9600)
            mp3musicVol = vol
        } else if (mp3bit == mp3type.player) {
            //serial.redirect(mp3playerPin, SerialPin.USB_RX, BaudRate.BaudRate9600)
            mp3playerVol = vol
        } else if (mp3bit == mp3type.sfxvoice) {
            //serial.redirect(mp3sfxPin, SerialPin.USB_RX, BaudRate.BaudRate9600)
            mp3sfxVol = vol
        }
        theVolume = Math.round(vol/100 * masterVolume)
        CMD = 6
        para1 = 0
        para2 = theVolume
        dataArr[3] = CMD
        dataArr[5] = para1
        dataArr[6] = para2
        mp3_checkSum()
        mp3_sendDataFast()
    }

    //% blockId=NL_MP3_GetVolumes
    //% subcategory="MP3" group="MP3"
    //% block="Get current volumes"
    export function getVolumes() {
        return "m" + mp3musicVol + " p" + mp3playerVol + " s" + mp3sfxVol + " g" + masterVolume
    }

    //% blockId="NL_MP3_StopPlayback" 
    //% block="Stop playback on %mp3bit"
    //% subcategory=MP3 group="MP3"
    export function stopPlayback(mp3bit:mp3type): void {
        if (mp3bit == mp3type.music) {
            serial.redirect(mp3musicPin, SerialPin.USB_RX, BaudRate.BaudRate9600)
        } else if (mp3bit == mp3type.player){
            serial.redirect(mp3playerPin, SerialPin.USB_RX, BaudRate.BaudRate9600)
        } else if (mp3bit == mp3type.sfxvoice) {
            serial.redirect(mp3sfxPin, SerialPin.USB_RX, BaudRate.BaudRate9600)
        }
        CMD = 0x16
        para1 = 0x00
        para2 = 0x00
        dataArr[3] = CMD
        dataArr[5] = para1
        dataArr[6] = para2
        mp3_checkSum()
        mp3_sendData()
    }

/// END MP3 ///

/// BEGIN SOUND BANK ///
    export enum mp3type { music, player, sfxvoice }
    export enum musicGenre { intro, tutorial, awaiting, level, won, lost }
    export enum playerSaying { ready, yay, intro, nay, ouch, success, failure, won, lost, hurry }
    export enum sfxType { correct, incorrect, ghost, fire, explosion, splash, spark, slash }
    export enum voiceSaying { name, begin, retry, next, complete, gameover, welcome, intro, howto1, howto2, howto3, howto4, howto5, howto6, howto7, howto8, howto9 }
    export enum magicianSaysSide { left, right }
    export enum magicianDifficulty { easy, medium, hard }
    export enum spotName { A, B, C, D, E, F, G, H, I }
    export enum playerChar { mario, luigi, peach, daisy, toad, wario }

    let TutorialBank = feedBank("1.1.47|1.2.52|1.3.52|1.4.59|1.5.60|1.6.60|1.7.60|1.8.60|1.9.60|1.10.60|1.11.60|1.12.60|1.13.60|1.14.60|1.15.60|1.16.60|1.17.60|1.18.60|1.19.60|1.20.60|1.21.60")
    let AwaitingBank = feedBank("2.1.64|2.2.120|2.3.120|2.4.120|2.5.120|2.6.113|2.7.120|2.8.103|2.9.120|2.10.120|2.11.120|2.12.120|2.13.118|2.14.1202.15.120")
    let TutorialPlaylist = makePlaylist(TutorialBank)
    let AwaitingPlaylist = makePlaylist(AwaitingBank)

    function takeRotate(PlaylistIn: number[]) {
        let returnTrack = PlaylistIn.shift()
        PlaylistIn.push(returnTrack)
        return returnTrack
    }
    function feedBank(BankString: string) {
        let returnBank: number[][] = []
        let BankSplit = BankString.split("|")
        for (let soundString of BankSplit) {
            returnBank.push([parseFloat(soundString.split(".")[0]), parseFloat(soundString.split(".")[1]), parseFloat(soundString.split(".")[2])])
        }
        return returnBank
    }
    function makePlaylist(SoundBank: any[]) {
        let returnList: number[] = []
        let orderedList: number[] = []
        for (let soundNo = 0; soundNo <= SoundBank.length - 1; soundNo++) {
            orderedList.push(soundNo)
        }
        while (orderedList.length > 0) {
            let randTrack = randint(0, orderedList.length - 1)
            returnList.push(orderedList.removeAt(randTrack))
        }
        return returnList
    }
    function bankPlay(mp3bit:mp3type, SoundBank: number[][], trackIndex: number) {
        if (mp3bit == mp3type.music) {
            serial.redirect(mp3musicPin, SerialPin.USB_RX, BaudRate.BaudRate9600)
        } else if (mp3bit == mp3type.player) {
            serial.redirect(mp3playerPin, SerialPin.USB_RX, BaudRate.BaudRate9600)
        } else if (mp3bit == mp3type.sfxvoice) {
            serial.redirect(mp3sfxPin, SerialPin.USB_RX, BaudRate.BaudRate9600)
        }
        let theSong = SoundBank[trackIndex]
        dataArr[3] = 15
        dataArr[5] = theSong[0]
        dataArr[6] = theSong[1]
        mp3_checkSum()
        mp3_sendDataFast()
    }

    //% blockId=NL_MP3_MusicPlay
    //% subcategory="MP3" group="MP3"
    //% block="Play %genre music"
    export function mp3musicPlay(genre: musicGenre): void {
        if (genre == musicGenre.tutorial){
            bankPlay(mp3type.music, TutorialBank, takeRotate(TutorialPlaylist))
        } else if (genre == musicGenre.awaiting) {
            bankPlay(mp3type.music, AwaitingBank, takeRotate(AwaitingPlaylist))
        }
    }

/// END SOUND BANK ///

/// BEGIN MOTOR & RELAY ///
    const kong_address = 0x10
    export enum MotorList { M1=1, M2=2 }
    export enum motors{ redrack=16, shark=4, ghost=5, cannon=8, oarrack=7, shell=6, door=3, dragon=9, wheel=1, fan=2 }
    export enum motorState { min, max, mid }
    export enum fogLevels { none = 0, light = 1, medium = 2, heavy = 3 }
    export enum sockState { dancing = 1, still = 0 }
    let motor_wheel_max = 12; let motor_wheel_min = 0
    let servo_redrack_max = 150; let servo_redrack_min = 100
    let servo_cannon_min = 135; let servo_cannon_max = 65
    let servo_shark_min = 20; let servo_shark_max = 85
    let servo_oarrack_min = 65; let servo_oarrack_max = 90
    let servo_ghost_min = 110; let servo_ghost_max = 40
    let servo_shell_min = 170; let servo_shell_max = 100
    let servo_door_min = 50; let servo_door_max = 140
    let motor_fan_min = 0; let motor_fan_mid = 12; let motor_fan_max = 15
    let servo_dragon_min = 90; let servo_dragon_max = 79

    export function servoSet(servo: motors, angle: number): void {
        let buf = pins.createBuffer(4);
        buf[0] = servo;
        buf[1] = angle;
        buf[2] = 0;
        buf[3] = 0;
        pins.i2cWriteBuffer(kong_address, buf);
    }

    export function motorSpeed(motor: MotorList, speed: number): void {
        let buf = pins.createBuffer(4);
        buf[0] = motor
        buf[1] = 1;
        if (speed < 0) {
            buf[1] = 2;
            speed = speed * -1
        }
        buf[2] = speed;
        buf[3] = 0;
        pins.i2cWriteBuffer(kong_address, buf);
    }

    //% blockId=NL_MOTOR_Set 
    //% block="Set %motor to %state"
    //% subcategory="Motor" group="Motor"
    export function motorSet(motor:motors, state:motorState):void{
        if (motor == motors.redrack){
            if (state == motorState.min){ servoSet(motor, servo_redrack_min) } 
            else if (state == motorState.max){ servoSet(motor, servo_redrack_max) }
        } if (motor == motors.shark) {
            if (state == motorState.min) { servoSet(motor, servo_shark_min) }
            else if (state == motorState.max) { servoSet(motor, servo_shark_max) }
        } if (motor == motors.ghost) {
            if (state == motorState.min) { servoSet(motor, servo_ghost_min) }
            else if (state == motorState.max) { servoSet(motor, servo_ghost_max) }
        } if (motor == motors.cannon) {
            if (state == motorState.min) { servoSet(motor, servo_cannon_min) }
            else if (state == motorState.max) { servoSet(motor, servo_cannon_max) }
        } if (motor == motors.oarrack) {
            if (state == motorState.min) { servoSet(motor, servo_oarrack_min) }
            else if (state == motorState.max) { servoSet(motor, servo_oarrack_max) }
        } if (motor == motors.shell) {
            if (state == motorState.min) { servoSet(motor, servo_shell_min) }
            else if (state == motorState.max) { servoSet(motor, servo_shell_max) }
        } if (motor == motors.door) {
            if (state == motorState.min) { servoSet(motor, servo_door_min) }
            else if (state == motorState.max) { servoSet(motor, servo_door_max) }
        } if (motor == motors.dragon) {
            if (state == motorState.min) { servoSet(motor, servo_dragon_min) }
            else if (state == motorState.max) { servoSet(motor, servo_dragon_max) }
        } if (motor == motors.wheel) {
            if (state == motorState.min) { motorSpeed(MotorList.M1, motor_wheel_min) }
            else if (state == motorState.max) { motorSpeed(MotorList.M1, motor_wheel_max) }
        } if (motor == motors.fan) {
            if (state == motorState.min) { motorSpeed(MotorList.M2, motor_fan_min) }
            else if (state == motorState.mid) { motorSpeed(MotorList.M2, motor_fan_mid) }
            else if (state == motorState.max) { motorSpeed(MotorList.M2, motor_fan_max) }
        }
    }

    //% blockId=NL_RELAY_FogSet 
    //% block="set fog level to %level"
    //% subcategory="Motor" group="Motor"
    export function setFog(fog:fogLevels):void{
        if (fog == fogLevels.none){
            pins.digitalWritePin(DigitalPin.P2, 1)
            pins.digitalWritePin(DigitalPin.P8, 1)
            pins.digitalWritePin(DigitalPin.P13, 1)
        } else if (fog == fogLevels.light){
            pins.digitalWritePin(DigitalPin.P2, 1)
            pins.digitalWritePin(DigitalPin.P8, 1)
            pins.digitalWritePin(DigitalPin.P13, 0)
        } else if (fog == fogLevels.medium) {
            pins.digitalWritePin(DigitalPin.P2, 0)
            pins.digitalWritePin(DigitalPin.P8, 1)
            pins.digitalWritePin(DigitalPin.P13, 0)
        } else if (fog == fogLevels.heavy) {
            pins.digitalWritePin(DigitalPin.P2, 0)
            pins.digitalWritePin(DigitalPin.P8, 0)
            pins.digitalWritePin(DigitalPin.P13, 0)
        }
    }

    //% blockId=NL_RELAY_SockSet
    //% block="set dancing sock to %sockState"
    //% subcategory="Motor" group="Motor"
    export function setSock(state: sockState): void {
        if(state==sockState.dancing){ pins.digitalWritePin(DigitalPin.P12, 0) }
        else{ pins.digitalWritePin(DigitalPin.P12, 1) }
    }

/// END MOTOR & RELAY ///

/// BEGIN OLED

    let d1 = [0, 0, 0, 20, 36, 35, 54, 0, 28, 65, 8, 8, 160, 8, 96, 32, 62, 0, 98, 34, 24, 39, 60, 1, 54, 6, 0, 0, 8, 20, 65, 2, 50, 126, 127, 62, 127, 127, 127, 62, 127, 65, 32, 127, 127, 127, 127, 62, 127, 62, 127, 38, 1, 63, 31, 63, 99, 3, 97, 127, 2, 65, 4, 128, 1, 32, 127, 56, 56, 56, 8, 24, 127, 0, 128, 127, 65, 124, 124, 56, 252, 24, 0, 72, 4, 60, 28, 60, 68, 28, 68, 8, 0, 65, 2]
    let d2 = [0, 95, 7, 127, 42, 19, 73, 5, 34, 34, 42, 8, 96, 8, 96, 16, 81, 66, 81, 65, 20, 69, 74, 113, 73, 73, 54, 172, 20, 20, 34, 1, 73, 9, 73, 65, 65, 73, 9, 65, 8, 127, 64, 8, 64, 2, 4, 65, 9, 65, 9, 73, 1, 64, 32, 64, 20, 4, 81, 65, 4, 65, 2, 128, 2, 84, 72, 68, 68, 84, 126, 164, 8, 125, 132, 16, 127, 4, 8, 68, 36, 36, 124, 84, 127, 64, 32, 64, 40, 160, 100, 54, 127, 54, 1]
    let d3 = [0, 0, 0, 20, 127, 8, 85, 3, 65, 28, 28, 62, 0, 8, 0, 8, 73, 127, 73, 73, 18, 69, 73, 9, 73, 73, 54, 108, 34, 20, 20, 81, 121, 9, 73, 65, 65, 73, 9, 65, 8, 65, 65, 20, 64, 12, 8, 65, 9, 81, 25, 73, 127, 64, 64, 56, 8, 120, 73, 65, 8, 127, 1, 128, 4, 84, 68, 68, 68, 84, 9, 164, 4, 0, 125, 40, 64, 24, 4, 68, 36, 36, 8, 84, 68, 64, 64, 48, 16, 160, 84, 65, 0, 8, 1]
    let d4 = [0, 0, 7, 127, 42, 100, 34, 0, 0, 0, 42, 8, 0, 8, 0, 4, 69, 64, 73, 73, 127, 69, 73, 5, 73, 41, 0, 0, 65, 20, 8, 9, 65, 9, 73, 65, 34, 73, 9, 81, 8, 0, 63, 34, 64, 2, 16, 65, 9, 33, 41, 73, 1, 64, 32, 64, 20, 4, 69, 0, 16, 0, 2, 128, 0, 84, 68, 40, 72, 84, 2, 164, 4, 0, 0, 68, 0, 4, 124, 56, 24, 252, 4, 36, 0, 124, 32, 64, 40, 124, 76, 0, 0, 0, 2]
    let d5 = [0, 0, 0, 20, 18, 98, 80, 0, 0, 0, 8, 8, 0, 8, 0, 2, 62, 0, 70, 54, 16, 57, 48, 3, 54, 30, 0, 0, 0, 20, 0, 6, 62, 126, 54, 34, 28, 65, 1, 114, 127, 0, 1, 65, 64, 127, 127, 62, 6, 94, 70, 50, 1, 63, 31, 63, 99, 3, 67, 0, 32, 0, 4, 128, 0, 120, 56, 0, 127, 24, 0, 124, 120, 0, 0, 0, 0, 120, 0, 0, 0, 0, 0, 0, 0, 0, 28, 60, 68, 0, 68, 0, 0, 0, 1]

    let display = [" . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split(".")]
    let desired = [" . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split(".")]

    //% blockId=NL_OLED_Update3
    //% block="oled update from buffer"
    //% subcategory="Display" group="Display"
    export function changeThree(): void{
        let updated: string[][] = []
        let count = 0
        for (let row=0; row<8; row++){
            for(let col=0; col<16; col++){
                let refChar = desired[row][col]
                if (refChar != display[row][col]){
                    writeChar(refChar,row,col)
                    display[row][col] = refChar
                    count++
                    if (count >= 3){
                        return;
                    }
                }
            }
        }
    }

    //% blockId=NL_OLED_PrintLine
    //% block="print %text to oled buffer line %line"
    //% subcategory="Display" group="Display"
    export function printLine(text:any, line:number): void{
        let thisText = text + ""
        for (let i = 0; i < 16; i++){
            if (i < thisText.length){
                desired[line][i]=thisText.charAt(i)
            } else{
                desired[line][i]=" "
            }
        }
    }

    function oledcmd(c: number) {
        pins.i2cWriteNumber(0x3c, c, NumberFormat.UInt16BE);
    }

    function setText(row: number, column: number) {
        oledcmd(0xB0 + row);            //set page address
        oledcmd(0x00 + (8 * column & 0x0F));  //set column lower address
        oledcmd(0x10 + ((8 * column >> 4) & 0x0F));   //set column higher address
    }

    //% blockId=NL_OLED_Init 
    //% block="initiate the oled screen"
    //% subcategory="Display" group="Display"
    export function oledinit(): void {
        oledcmd(0xAE);  // Set display OFF
        oledcmd(0xD5);  // Set Display Clock Divide Ratio / OSC Frequency 0xD4
        oledcmd(0x80);  // Display Clock Divide Ratio / OSC Frequency 
        oledcmd(0xA8);  // Set Multiplex Ratio
        oledcmd(0x3F);  // Multiplex Ratio for 128x64 (64-1)
        oledcmd(0xD3);  // Set Display Offset
        oledcmd(0x00);  // Display Offset
        oledcmd(0x40);  // Set Display Start Line
        oledcmd(0x8D);  // Set Charge Pump
        oledcmd(0x14);  // Charge Pump (0x10 External, 0x14 Internal DC/DC)
        oledcmd(0xA1);  // Set Segment Re-Map
        oledcmd(0xC8);  // Set Com Output Scan Direction
        oledcmd(0xDA);  // Set COM Hardware Configuration
        oledcmd(0x12);  // COM Hardware Configuration
        oledcmd(0x81);  // Set Contrast
        oledcmd(0xCF);  // Contrast
        oledcmd(0xD9);  // Set Pre-Charge Period
        oledcmd(0xF1);  // Set Pre-Charge Period (0x22 External, 0xF1 Internal)
        oledcmd(0xDB);  // Set VCOMH Deselect Level
        oledcmd(0x40);  // VCOMH Deselect Level
        oledcmd(0xA4);  // Set all pixels OFF
        oledcmd(0xA6);  // Set display not inverted
        oledcmd(0xAF);  // Set display On
        for (let j = 0; j < 8; j++) {
            setText(j, 0);
            {
                for (let i = 0; i < 16; i++)  //clear all columns
                {
                    writeChar(" ",j,i)
                }
            }
        }
    }

    function writeChar(char: string, row: number, column: number) {
        setText(row, column)
        let i = char.charCodeAt(0) - 32
        pins.i2cWriteNumber(0x3c, 0x4000, NumberFormat.UInt16BE)
        pins.i2cWriteNumber(0x3c, 0x4000 + d1[i], NumberFormat.UInt16BE)
        pins.i2cWriteNumber(0x3c, 0x4000 + d2[i], NumberFormat.UInt16BE)
        pins.i2cWriteNumber(0x3c, 0x4000 + d3[i], NumberFormat.UInt16BE)
        pins.i2cWriteNumber(0x3c, 0x4000 + d4[i], NumberFormat.UInt16BE)
        pins.i2cWriteNumber(0x3c, 0x4000 + d5[i], NumberFormat.UInt16BE)
        pins.i2cWriteNumber(0x3c, 0x4000, NumberFormat.UInt16BE)
        pins.i2cWriteNumber(0x3c, 0x4000, NumberFormat.UInt16BE)
    }

/// END OLED
}


