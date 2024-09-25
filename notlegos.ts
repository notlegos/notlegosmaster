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


    //% shim=sendBufferAsm
    function sendBuffer(buf: Buffer, pin: DigitalPin) {
    }

    export class Strip {
        buf: Buffer;
        pin: DigitalPin;
        start: number; // start offset in LED strip
        _length: number; // number of LEDs

        //% blockId="NL_PIXEL_SetHSL" 
        //% block="%strip|set pixel color at %pixeloffset|to h%h s%s l%l"
        //% subcategory="Neopixel" Group="Neopixel"
        setPixelHSL(pixeloffset: number, h: number, s: number, l: number): void {
            if (pixeloffset < 0 || pixeloffset >= this._length)
                return;
            pixeloffset = (pixeloffset + this.start) * 3;
            h = Math.round(h) % 360;
            s = Math.clamp(0, 99, Math.round(s));
            l = Math.clamp(0, 99, Math.round(l));
            let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000); //chroma, [0,255]
            let h1 = Math.idiv(h, 60);//[0,6]
            let h2 = Math.idiv((h - h1 * 60) * 256, 60);//[0,255]
            let x = (c * (256 - (Math.abs((((h1 % 2) << 8) + h2) - 256)))) >> 8;//[0,255], second largest component of this color
            let r$: number;
            let g$: number;
            let b$: number;
            if (h1 == 0) { r$ = c; g$ = x; b$ = 0; }
            else if (h1 == 1) { r$ = x; g$ = c; b$ = 0; }
            else if (h1 == 2) { r$ = 0; g$ = c; b$ = x; }
            else if (h1 == 3) { r$ = 0; g$ = x; b$ = c; }
            else if (h1 == 4) { r$ = x; g$ = 0; b$ = c; }
            else if (h1 == 5) { r$ = c; g$ = 0; b$ = x; }
            let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
            this.buf[pixeloffset + 0] = g$ + m;
            this.buf[pixeloffset + 1] = r$ + m;
            this.buf[pixeloffset + 2] = b$ + m;
        }

        //Send all the changes to the strip.
        show() {
            sendBuffer(this.buf, this.pin);
        }

        //Gets the number of pixels declared on the strip
        length() {
            return this._length;
        }

        //Shift LEDs forward and clear with zeros.
        shift(offset: number = 1): void {
            this.buf.shift(-offset * 3, this.start * 3, this._length * 3)
        }

        //Rotate LEDs forward
        rotate(offset: number = 1): void {
            this.buf.rotate(-offset * 3, this.start * 3, this._length * 3)
        }

        setPin(pin: DigitalPin): void {
            this.pin = pin;
            pins.digitalWritePin(this.pin, 0);  // don't yield to avoid races on initialization
        }
    }

    export function create(thePin: DigitalPin, numleds: number): Strip {
        let strip = new Strip();
        strip.buf = pins.createBuffer(numleds * 3);
        strip.start = 0;
        strip._length = numleds;
        strip.setPin(thePin)
        return strip;
    }

    let NeoSock: Strip = null
    let NeoScore: Strip = null
    let NeoWheel: Strip = null
    let NeoKong: Strip = null
    let NeoStrips: Strip = null
    let NeoBricks: Strip = null

    let vfx_mine_tog: number[] = []
    let vfx_mine_hue: number[] = []
    let vfx_mine_sat: number[] = []
    let vfx_mine_lum: number[] = []
    let vfx_fire_tog: number[] = []
    let vfx_fire_hue: number[] = []
    let vfx_fire_sat: number[] = []
    let vfx_fire_lum: number[] = []
    let vfx_indicate_tog: number[] = []
    let vfx_indicate_hue: number[] = []
    let vfx_indicate_sat: number[] = []
    let vfx_indicate_lum: number[] = []
    let vfx_idle_tog: number[] = []
    let vfx_idle_hue: number[] = []
    let vfx_idle_sat: number[] = []
    let vfx_idle_lum: number[] = []
    let vfx_glow_tog: number[] = []
    let vfx_glow_hue: number[] = []
    let vfx_glow_sat: number[] = []
    let vfx_glow_lum: number[] = []
    let vfx_parade_tog: number[] = []
    let vfx_parade_hue: number[] = []
    let vfx_parade_sat: number[] = []
    let vfx_parade_lum: number[] = []
    let vfx_last_tog: number[] = []
    let vfx_last_hue: number[] = []
    let vfx_last_sat: number[] = []
    let vfx_last_lum: number[] = []
    let vfx_master_tog: number[] = []
    let vfx_master_hue: number[] = []
    let vfx_master_sat: number[] = []
    let vfx_master_lum: number[] = []
    let vfx_master_effect: number[] = []
    let vfx_light_count = 0

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
        setEffect(vfxRegion.ScoreAll,vfxEffect.parade)
    }

    function vfxInit(): void{
        for (let index = 0; index < vfx_light_count; index++) {
            vfx_mine_tog.push(0)
            vfx_mine_hue.push(50)
            vfx_mine_sat.push(100)
            vfx_mine_lum.push(50)
            vfx_fire_tog.push(0)
            vfx_fire_hue.push(50)
            vfx_fire_sat.push(100)
            vfx_fire_lum.push(50)
            vfx_indicate_tog.push(0)
            vfx_indicate_hue.push(50)
            vfx_indicate_sat.push(100)
            vfx_indicate_lum.push(50)
            vfx_idle_tog.push(0)
            vfx_idle_hue.push(50)
            vfx_idle_sat.push(100)
            vfx_idle_lum.push(50)
            vfx_glow_tog.push(0)
            vfx_glow_hue.push(50)
            vfx_glow_sat.push(100)
            vfx_glow_lum.push(50)
            vfx_parade_tog.push(0)
            vfx_parade_hue.push(155)
            vfx_parade_sat.push(100)
            vfx_parade_lum.push(50)
            vfx_last_tog.push(0)
            vfx_last_hue.push(50)
            vfx_last_sat.push(100)
            vfx_last_lum.push(50)
            vfx_master_tog.push(0)
            vfx_master_hue.push(0)
            vfx_master_sat.push(100)
            vfx_master_lum.push(50)
            vfx_master_effect.push(vfxEffect.indicate)
        }
    }


    //% blockId=NL_PIXEL_CastleSayTick
    //% subcategory="Neopixel" Group="Neopixel"
    //% block="Advance Castle Say lights"
    //% weight=100
    export function castleSayTick(): void {
        
        castleSayWrite()
    }

    function vfxPrepareMaster(): void{
        for (let index = 0; index < vfx_light_count; index++) {
            let thisEffect = vfx_master_effect[index]
            if (thisEffect == vfxEffect.parade) {
                vfx_master_hue[index] = vfx_parade_hue[index]
                vfx_master_sat[index] = vfx_parade_sat[index]
                vfx_master_lum[index] = vfx_parade_lum[index]
            } else if (thisEffect == vfxEffect.fire) {
                vfx_master_hue[index] = vfx_fire_hue[index]
                vfx_master_sat[index] = vfx_fire_sat[index]
                vfx_master_lum[index] = vfx_fire_lum[index]
            } else if (thisEffect == vfxEffect.indicate) {
                vfx_master_hue[index] = vfx_indicate_hue[index]
                vfx_master_sat[index] = vfx_indicate_sat[index]
                vfx_master_lum[index] = vfx_indicate_lum[index]
            } else if (thisEffect == vfxEffect.idle) {
                vfx_master_hue[index] = vfx_idle_hue[index]
                vfx_master_sat[index] = vfx_idle_sat[index]
                vfx_master_lum[index] = vfx_idle_lum[index]
            } else if (thisEffect == vfxEffect.glow) {
                vfx_master_hue[index] = vfx_glow_hue[index]
                vfx_master_sat[index] = vfx_glow_sat[index]
                vfx_master_lum[index] = vfx_glow_lum[index]
            } else if (thisEffect == vfxEffect.mine) {
                vfx_master_hue[index] = vfx_mine_hue[index]
                vfx_master_sat[index] = vfx_mine_sat[index]
                vfx_master_lum[index] = vfx_mine_lum[index]
            }
        }
    }
    function castleSayWrite(): void{
        vfxPrepareMaster()
        let masterIndex = 0
        for (let index = 0; index < NeoSock.length(); index++){
            NeoSock.setPixelHSL(index, vfx_master_hue[masterIndex], vfx_master_sat[masterIndex], vfx_master_lum[masterIndex])
            masterIndex++
        }
        for (let index = 0; index < NeoWheel.length(); index++) {
            NeoWheel.setPixelHSL(index, vfx_master_hue[masterIndex], vfx_master_sat[masterIndex], vfx_master_lum[masterIndex])
            masterIndex++
        }
        for (let index = 0; index < NeoScore.length(); index++) {
            NeoScore.setPixelHSL(index, vfx_master_hue[masterIndex], vfx_master_sat[masterIndex], vfx_master_lum[masterIndex])
            masterIndex++
        }
        NeoSock.show()
        NeoWheel.show()
        NeoScore.show()
    }

    function setEffect(region:vfxRegion, effect:vfxEffect){
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
            for (let i = 26; i <= 33; i++) {
                vfx_master_effect[i] = effect
            }
        } else if (region == vfxRegion.SockAll) {
            for (let i = 0; i <= 7; i++) {
                vfx_master_effect[i] = effect
            }
        } else if (region == vfxRegion.WheelInner) {
            for (let i = 18; i <= 25; i++) {
                vfx_master_effect[i] = effect
            }
        } else if (region == vfxRegion.WheelOuter) {
            for (let i = 8; i <= 17; i++) {
                vfx_master_effect[i] = effect
            }
        } else if (region == vfxRegion.WheelAll) {
            for (let i=8; i <= 25; i++){
                vfx_master_effect[i] = effect
            }
        } else if (region == vfxRegion.CastleSayAll) {
            for (let i = 0; i <= 33; i++) {
                vfx_master_effect[i] = effect
            }
        }       
    }

    export enum vfxRegion{
        Score1, Score2, Score3, Score4, Score5, Score6, Score7, Score8, ScoreAll,
        SockAll,
        WheelInner, WheelOuter, WheelAll,
        KongFront, KongBack, KongAll,
        BrickWheel, BrickShark, BrickBomb, BrickShell, BrickGhost, BrickDragon, BrickCannon, BrickAll,
        SpotA, SpotB, SpotC, SpotD, SpotE, SpotF, SpotG, SpotH, SpotI, SpotAll,
        CastleSayAll,
        CastleDoAll
    }

    export enum vfxEffect{
        parade = 0,
        fire = 1,
        indicate = 2,
        idle = 3,
        glow = 4,
        mine = 5
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
    export enum playType { Play = 0x0D,Stop = 0x16,PlayNext = 0x01,PlayPrevious = 0x02,Pause = 0x0E }
}
