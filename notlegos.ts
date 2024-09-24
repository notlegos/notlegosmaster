// NotLegos Blocks

//% block="Not LEGOs" color=#0031AF weight=1000 icon="\uf3a5"
//% groups='["MP3","Sensors"]'
namespace notLegos {

/// BEGIN TRIMPOT ///

    let isPot = false
    let potPin = AnalogPin.P0
    let masterVolume = 25
    let lastVolume = 0

    //% blockId=NL_SENSOR_TrimpotSet
    //% subcategory="Sensors" Group="Sensors"
    //% block="set volume control pot at %aPin"
    //% blockSetVariable=
    //% weight=103
    export function potSet(aPin: AnalogPin): void {
        potPin = aPin
        isPot = true
        masterVolume = potRead()
    }

    function potRead() {
        if (isPot) {
            return Math.round(pins.map(pins.analogReadPin(potPin), 0, 1023, 0, 30))
        } else {
            return 5
        }
    }

/// END TRIMPOT ///

/// BEGIN NEOPIXEL ///

    let sockLights: Strip = null
    let scoreLights: Strip = null
    let wheelLights: Strip = null
    let kongLights: Strip = null
    let spaceLights: Strip = null
    let brickLights: Strip = null

    export enum NeoPixelColors {
        //% block=red
        Red = 0xFF0000,
        //% block=orange
        Orange = 0xFFA500,
        //% block=yellow
        Yellow = 0xFFFF00,
        //% block=green
        Green = 0x00FF00,
        //% block=blue
        Blue = 0x0000FF,
        //% block=indigo
        Indigo = 0x4b0082,
        //% block=violet
        Violet = 0x8a2be2,
        //% block=purple
        Purple = 0xFF00FF,
        //% block=white
        White = 0xFFFFFF,
        //% block=black
        Black = 0x000000
    }

    /**
     * Different modes for RGB or RGB+W NeoPixel strips
     */
    export enum NeoPixelMode {
        //% block="RGB (GRB format)"
        RGB = 0,
        //% block="RGB+W"
        RGBW = 1,
        //% block="RGB (RGB format)"
        RGB_RGB = 2
    }

    //% shim=sendBufferAsm
    function sendBuffer(buf: Buffer, pin: DigitalPin) {
    }
    export class Strip {
        buf: Buffer;
        pin: DigitalPin;
        // TODO: encode as bytes instead of 32bit
        brightness: number;
        start: number; // start offset in LED strip
        _length: number; // number of LEDs
        _mode: NeoPixelMode;
        _matrixWidth: number; // number of leds in a matrix - if any

        /**
         * Set LED to a given color (range 0-255 for r, g, b).
         * You need to call ``show`` to make the changes visible.
         * @param pixeloffset position of the NeoPixel in the strip
         * @param rgb RGB color of the LED
         */
        //% blockId="neopixel_set_pixel_color" block="%strip|set pixel color at %pixeloffset|to %rgb=neopixel_colors"
        //% weight=80 color=#EA5532
        //% parts="neopixel" subcategory=Neopixel
        setPixelColor(pixeloffset: number, rgb: number): void {
            this.setPixelRGB(pixeloffset >> 0, rgb >> 0);
        }

        private setPixelRGB(pixeloffset: number, rgb: number): void {
            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;

            let stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            pixeloffset = (pixeloffset + this.start) * stride;

            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            let br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            this.setBufferRGB(pixeloffset, red, green, blue)
        }

        private setBufferRGB(offset: number, red: number, green: number, blue: number): void {
            if (this._mode === NeoPixelMode.RGB_RGB) {
                this.buf[offset + 0] = red;
                this.buf[offset + 1] = green;
            } else {
                this.buf[offset + 0] = green;
                this.buf[offset + 1] = red;
            }
            this.buf[offset + 2] = blue;
        }

        /**
         * Shows all LEDs to a given color (range 0-255 for r, g, b).
         * @param rgb RGB color of the LED
         */
        //% blockId="neopixel_set_strip_color" block="%strip|show color %rgb=neopixel_colors"
        //% weight=85 color=#EA5532
        //% parts="neopixel" subcategory=Neopixel
        showColor(rgb: number) {
            rgb = rgb >> 0;
            this.setAllRGB(rgb);
            this.show();
        }

        /**
         * Shows a rainbow pattern on all LEDs.
         * @param startHue the start hue value for the rainbow, eg: 1
         * @param endHue the end hue value for the rainbow, eg: 360
         */
        //% blockId="neopixel_set_strip_rainbow" block="%strip|show rainbow from %startHue|to %endHue"
        //% weight=85 color=#EA5532
        //% parts="neopixel" subcategory=Neopixel
        showRainbow(startHue: number = 1, endHue: number = 360) {
            if (this._length <= 0) return;

            startHue = startHue >> 0;
            endHue = endHue >> 0;
            const saturation = 100;
            const luminance = 50;
            const steps = this._length;
            const direction = HueInterpolationDirection.Clockwise;

            //hue
            const h1 = startHue;
            const h2 = endHue;
            const hDistCW = ((h2 + 360) - h1) % 360;
            const hStepCW = Math.idiv((hDistCW * 100), steps);
            const hDistCCW = ((h1 + 360) - h2) % 360;
            const hStepCCW = Math.idiv(-(hDistCCW * 100), steps);
            let hStep: number;
            if (direction === HueInterpolationDirection.Clockwise) {
                hStep = hStepCW;
            } else if (direction === HueInterpolationDirection.CounterClockwise) {
                hStep = hStepCCW;
            } else {
                hStep = hDistCW < hDistCCW ? hStepCW : hStepCCW;
            }
            const h1_100 = h1 * 100; //we multiply by 100 so we keep more accurate results while doing interpolation

            //sat
            const s1 = saturation;
            const s2 = saturation;
            const sDist = s2 - s1;
            const sStep = Math.idiv(sDist, steps);
            const s1_100 = s1 * 100;

            //lum
            const l1 = luminance;
            const l2 = luminance;
            const lDist = l2 - l1;
            const lStep = Math.idiv(lDist, steps);
            const l1_100 = l1 * 100

            //interpolate
            if (steps === 1) {
                this.setPixelColor(0, hsl(h1 + hStep, s1 + sStep, l1 + lStep))
            } else {
                this.setPixelColor(0, hsl(startHue, saturation, luminance));
                for (let i = 1; i < steps - 1; i++) {
                    const h = Math.idiv((h1_100 + i * hStep), 100) + 360;
                    const s = Math.idiv((s1_100 + i * sStep), 100);
                    const l = Math.idiv((l1_100 + i * lStep), 100);
                    this.setPixelColor(i, hsl(h, s, l));
                }
                this.setPixelColor(steps - 1, hsl(endHue, saturation, luminance));
            }
            this.show();
        }

        /**
         * Send all the changes to the strip.
         */
        //% blockId="neopixel_show" block="%strip|show" 
        //% weight=79
        //% parts="neopixel" subcategory=Neopixel
        show() {
            sendBuffer(this.buf, this.pin);
        }

        /**
         * Turn off all LEDs.
         * You need to call ``show`` to make the changes visible.
         */
        //% blockId="neopixel_clear" block="%strip|clear"
        //% weight=76 color=#EA5532
        //% parts="neopixel" subcategory=Neopixel
        clear(): void {
            const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            this.buf.fill(0, this.start * stride, this._length * stride);
        }

        /**
         * Set the brightness of the strip. This flag only applies to future operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 255
         */
        //% blockId="neopixel_set_brightness" block="%strip|set brightness %brightness" 
        //% weight=59 color=#EA5532
        //% parts="neopixel" subcategory=Neopixel
        setBrightness(brightness: number): void {
            this.brightness = brightness & 0xff;
        }
        /**
         * Gets the number of pixels declared on the strip
         */
        //% blockId="neopixel_length" block="%strip|length" blockGap=8
        //% subcategory="Neopixel"
        //% weight=60 advanced=true
        length() {
            return this._length;
        }
        /**
         * Create a range of LEDs.
         * @param start offset in the LED strip to start the range
         * @param length number of LEDs in the range. eg: 4
         */
        //% weight=89 color=#EA5532
        //% blockId="neopixel_range" block="%strip|range from %start|with %length|leds"
        //% parts="neopixel"
        //% blockSetVariable=range subcategory=Neopixel
        range(start: number, length: number): Strip {
            start = start >> 0;
            length = length >> 0;
            let strip = new Strip();
            strip.buf = this.buf;
            strip.pin = this.pin;
            strip.brightness = this.brightness;
            strip.start = this.start + Math.clamp(0, this._length - 1, start);
            strip._length = Math.clamp(0, this._length - (strip.start - this.start), length);
            strip._matrixWidth = 0;
            strip._mode = this._mode;
            return strip;
        }

        /**
         * Shift LEDs forward and clear with zeros.
         * You need to call ``show`` to make the changes visible.
         * @param offset number of pixels to shift forward, eg: 1
         */
        //% blockId="neopixel_shift" block="%strip|shift pixels by %offset" 
        //% weight=40 color=#EA5532
        //% parts="neopixel" subcategory=Neopixel
        shift(offset: number = 1): void {
            offset = offset >> 0;
            const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            this.buf.shift(-offset * stride, this.start * stride, this._length * stride)
        }

        /**
         * Rotate LEDs forward.
         * You need to call ``show`` to make the changes visible.
         * @param offset number of pixels to rotate forward, eg: 1
         */
        //% blockId="neopixel_rotate" block="%strip|rotate pixels by %offset" 
        //% weight=39 color=#EA5532
        //% parts="neopixel" subcategory=Neopixel
        rotate(offset: number = 1): void {
            offset = offset >> 0;
            const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            this.buf.rotate(-offset * stride, this.start * stride, this._length * stride)
        }


        setPin(pin: DigitalPin): void {
            this.pin = pin;
            pins.digitalWritePin(this.pin, 0);  // don't yield to avoid races on initialization
        }

        private setAllRGB(rgb: number) {
            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            const br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            const end = this.start + this._length;
            const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            for (let i = this.start; i < end; ++i) {
                this.setBufferRGB(i * stride, red, green, blue)
            }
        }
    }

    function unpackR(rgb: number): number {
        let r = (rgb >> 16) & 0xFF;
        return r;
    }
    function unpackG(rgb: number): number {
        let g = (rgb >> 8) & 0xFF;
        return g;
    }
    function unpackB(rgb: number): number {
        let b = (rgb) & 0xFF;
        return b;
    }

    /**
     * Converts red, green, blue channels into a RGB color
     * @param red value of the red channel between 0 and 255. eg: 255
     * @param green value of the green channel between 0 and 255. eg: 255
     * @param blue value of the blue channel between 0 and 255. eg: 255
     */
    //% weight=1 subcategory=Neopixel color=#EA5532
    //% blockId="neopixel_rgb" block="red %red|green %green|blue %blue"
    export function rgb(red: number, green: number, blue: number): number {
        return packRGB(red, green, blue);
    }

    /**
     * Gets the RGB value of a known color
    */
    //% weight=2 subcategory=Neopixel color=#EA5532
    //% blockId="neopixel_colors" block="%color"
    export function colors(color: NeoPixelColors): number {
        return color;
    }

    function packRGB(a: number, b: number, c: number): number {
        return ((a & 0xFF) << 16) | ((b & 0xFF) << 8) | (c & 0xFF);
    }
    

    /**
     * Converts a hue saturation luminosity value into a RGB color
     * @param h hue from 0 to 360
     * @param s saturation from 0 to 99
     * @param l luminosity from 0 to 99
     */
    //% blockId=neopixelHSL block="hue %h|saturation %s|luminosity %l" subcategory=Neopixel color=#EA5532
    export function hsl(h: number, s: number, l: number): number {
        h = Math.round(h);
        s = Math.round(s);
        l = Math.round(l);

        h = h % 360;
        s = Math.clamp(0, 99, s);
        l = Math.clamp(0, 99, l);
        let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000); //chroma, [0,255]
        let h1 = Math.idiv(h, 60);//[0,6]
        let h2 = Math.idiv((h - h1 * 60) * 256, 60);//[0,255]
        let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
        let x = (c * (256 - (temp))) >> 8;//[0,255], second largest component of this color
        let r$:
            number;
        let g$:
            number;
        let b$:
            number;
        if (h1 == 0) {
            r$ = c;
            g$ = x;
            b$ = 0;
        }
        else if (h1 == 1) {
            r$ = x;
            g$ = c;
            b$ = 0;
        }
        else if (h1 == 2) {
            r$ = 0;
            g$ = c;
            b$ = x;
        }
        else if (h1 == 3) {
            r$ = 0;
            g$ = x;
            b$ = c;
        }
        else if (h1 == 4) {
            r$ = x;
            g$ = 0;
            b$ = c;
        }
        else if (h1 == 5) {
            r$ = c;
            g$ = 0;
            b$ = x;
        }
        let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
        let r = r$ + m;
        let g = g$ + m;
        let b = b$ + m;
        return packRGB(r, g, b);
    }

    export enum HueInterpolationDirection {
        Clockwise,
        CounterClockwise,
        Shortest
    }

    //% blockId=NL_PIXEL_Create
    //% subcategory="Neopixel" Group="Neopixel"
    //% block="NeoPixel at pin %thePin|with %numleds|leds as %mode"
    //% weight=100
    export function create(thePin: DigitalPin, numleds: number, mode: NeoPixelMode): Strip {
        let strip = new Strip();
        let stride = mode === NeoPixelMode.RGBW ? 4 : 3;
        strip.buf = pins.createBuffer(numleds * stride);
        strip.start = 0;
        strip._length = numleds;
        strip._mode = mode;
        strip._matrixWidth = 0;
        strip.setBrightness(255)
        strip.setPin(thePin)
        return strip;
    }

    //% blockId=NL_PIXEL_CastleSay
    //% subcategory="Neopixel" Group="Neopixel"
    //% block="Sock Circle:%sockPin  Wheel Strip/Circle:%wheelPin  Score Circle:%scorePin "
    //% weight=100
    export function castleSayLights(sockPin: DigitalPin, wheelPin: DigitalPin, scorePin: DigitalPin): void{
        scoreLights = create(scorePin,8,NeoPixelMode.RGB)
        scoreLights.showRainbow(1, 360)
        sockLights = create(sockPin, 8, NeoPixelMode.RGB)
        sockLights.showRainbow(1, 360)
        wheelLights = create(wheelPin, 18, NeoPixelMode.RGB)
        wheelLights.showRainbow(1, 360)
    }

    //% blockId=NL_PIXEL_CastleSayTick
    //% subcategory="Neopixel" Group="Neopixel"
    //% block="Rotate Castle Say lights"
    //% weight=100
    export function castleSayRotate(): void {
        scoreLights.rotate(1)
        scoreLights.show()
        sockLights.rotate(1)
        sockLights.show()
        wheelLights.rotate(1)
        wheelLights.show()
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

    function mp3_checkSum(): void {
        let total = 0;
        for (let i = 1; i < 7; i++) {
            total += dataArr[i]
        }
        total = 65536 - total
        lowByte = total & 0xFF;
        highByte = total >> 8;
        dataArr[7] = highByte
        dataArr[8] = lowByte
    }
    function mp3_sendData(): void {
        let myBuff = pins.createBuffer(10);
        for (let i = 0; i < 10; i++) {
            myBuff.setNumber(NumberFormat.UInt8BE, i, dataArr[i])
        }
        serial.writeBuffer(myBuff)
        basic.pause(20) // Was 100; problematic at 10
    }
    function mp3_sendDataFast(): void {
        let myBuff = pins.createBuffer(10);
        for (let i = 0; i < 10; i++) {
            myBuff.setNumber(NumberFormat.UInt8BE, i, dataArr[i])
        }
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





    export enum mp3type { music, player, sfxvoice }

    export enum musicGenre { intro, tutorial, awaiting, level, won, lost }

    export enum playerSaying { ready, yay, intro, nay, ouch, success, failure, won, lost, hurry }

    export enum sfxType { correct, incorrect, ghost, fire, explosion, splash, spark, slash }

    export enum voiceSaying { name, begin, retry, next, complete, gameover, welcome, intro, howto1, howto2, howto3, howto4, howto5, howto6, howto7, howto8, howto9 }

    export enum magicianSaysSide { left, right }

    export enum magicianDifficulty { easy, medium, hard }

    export enum spotName { A, B, C, D, E, F, G, H, I }

    export enum playerChar { mario, luigi, peach, daisy, toad, wario }


    // Enum - To Support MP3
    export enum playType {
        //% block="Play"
        Play = 0x0D,
        //% block="Stop"
        Stop = 0x16,
        //% block="PlayNext"
        PlayNext = 0x01,
        //% block="PlayPrevious"
        PlayPrevious = 0x02,
        //% block="Pause"
        Pause = 0x0E
    }


}
