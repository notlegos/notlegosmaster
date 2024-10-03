function radioSay (text5: string, val: number) {
    radio.sendValue("" + btToken + text5, val)
    notLegos.printLine("said: " + text5 + "=" + val, 7)
}
function buttonPress (button: string) {
    notLegos.printLine("button: " + button, 3)
}
function ready_oled () {
    if (isCastleSay) {
        notLegos.printLine("// Castle Say //", 0)
        notLegos.printLine("R" + Math.constrain(lastLaserR, 0, 9) + " C" + Math.constrain(lastLaserC, 0, 9) + " L" + Math.constrain(lastLaserL, 0, 9), 1)
        notLegos.printLine("S" + lastSonarRead + " H" + Math.round(lastHue / 3) + " G" + lastGesture + " N" + lastHunt, 2)
        notLegos.printLine("Mode: " + castleMode, 3)
    } else {
        notLegos.printLine("// Castle Do //", 0)
        notLegos.printLine("M: " + castleMode + " T " + fogToggle, 1)
    }
}
radio.onReceivedValue(function (name, value) {
    if (name.substr(0, btToken.length) == btToken) {
        theName = name.substr(btToken.length, name.length - btToken.length)
        if (isCastleSay) {
            if (theName == "wstar") {
                castleMode = "wait_start"
            } else if (theName == "para") {
                notLegos.setEffect(notLegos.vfxRegion.CastleSayAll, notLegos.vfxEffect.parade)
            } else if (theName == "check") {
                notLegos.setEffect(notLegos.vfxRegion.CastleSayAll, notLegos.vfxEffect.off)
                radioSay("ready", 1)
            } else if (false) {
            	
            }
        } else {
            if (theName == "ready") {
                radioSay("wstar", 1)
                notLegos.setEffect(notLegos.vfxRegion.KongFront, notLegos.vfxEffect.mine)
            } else if (theName == "boot") {
                notLegos.vfxReset(notLegos.vfxEffect.glow)
                notLegos.setEffect(notLegos.vfxRegion.CastleDoAll, notLegos.vfxEffect.glow)
                fogFlood()
            } else {
            	
            }
        }
        notLegos.printLine("heard: " + theName + "=" + value, 6)
    }
})
input.onLogoEvent(TouchButtonEvent.Touched, function () {
    if (isCastleSay) {
        notLegos.mp3sayPlay(notLegos.playerSaying.ready)
    }
})
function fogFlood () {
    if (fogToggle) {
        fogLevel = 3
        basic.pause(10000)
        notLegos.setEffect(notLegos.vfxRegion.CastleDoAll, notLegos.vfxEffect.parade)
        radioSay("para", 1)
        fogLevel = 0
        notLegos.motorSet(notLegos.motors.fan, notLegos.motorState.max)
        notLegos.motorSet(notLegos.motors.door, notLegos.motorState.max)
        basic.pause(1000)
        notLegos.motorSet(notLegos.motors.fan, notLegos.motorState.mid)
        basic.pause(6000)
        notLegos.motorSet(notLegos.motors.fan, notLegos.motorState.min)
        basic.pause(500)
        notLegos.motorSet(notLegos.motors.fan, notLegos.motorState.off)
        notLegos.motorSet(notLegos.motors.door, notLegos.motorState.min)
        fogLevel = 1
        notLegos.setSock(notLegos.sockState.dancing)
        basic.pause(6000)
        notLegos.setSock(notLegos.sockState.still)
        basic.pause(2000)
        notLegos.motorSet(notLegos.motors.wheel, notLegos.motorState.max)
        basic.pause(8000)
        notLegos.motorSet(notLegos.motors.wheel, notLegos.motorState.min)
        basic.pause(2000)
        notLegos.motorSet(notLegos.motors.redrack, notLegos.motorState.max)
        basic.pause(2000)
        notLegos.motorSet(notLegos.motors.redrack, notLegos.motorState.min)
        basic.pause(2000)
        notLegos.motorSet(notLegos.motors.shark, notLegos.motorState.max)
        basic.pause(2000)
        notLegos.motorSet(notLegos.motors.shark, notLegos.motorState.min)
        basic.pause(2000)
        notLegos.motorSet(notLegos.motors.ghost, notLegos.motorState.max)
        basic.pause(2000)
        notLegos.motorSet(notLegos.motors.ghost, notLegos.motorState.min)
        basic.pause(2000)
        notLegos.motorSet(notLegos.motors.cannon, notLegos.motorState.max)
        basic.pause(2000)
        notLegos.motorSet(notLegos.motors.cannon, notLegos.motorState.min)
        basic.pause(2000)
        notLegos.motorSet(notLegos.motors.oarrack, notLegos.motorState.max)
        basic.pause(2000)
        notLegos.motorSet(notLegos.motors.oarrack, notLegos.motorState.min)
        basic.pause(2000)
        notLegos.motorSet(notLegos.motors.shell, notLegos.motorState.max)
        basic.pause(2000)
        notLegos.motorSet(notLegos.motors.shell, notLegos.motorState.min)
        basic.pause(2000)
        notLegos.motorSet(notLegos.motors.dragon, notLegos.motorState.max)
        basic.pause(2000)
        notLegos.motorSet(notLegos.motors.dragon, notLegos.motorState.min)
    }
}
let iTook = 0
let theName = ""
let fogLevel = 0
let fogToggle = false
let buttonRow = 0
let castleMode = ""
let trackNo = 0
let lastHunt = 0
let lastLaserC = 0
let lastLaserL = 0
let lastLaserR = 0
let lastHue = 0
let lastGesture = 0
let lastSonarRead = 0
let digits: Connected.TM1637LEDs = null
let isCastleSay = false
let btToken = ""
let lastVolumeRead = 0
pins.setAudioPinEnabled(false)
led.enable(false)
btToken = "KC$"
isCastleSay = notLegos.SonarFirstRead(DigitalPin.P8, DigitalPin.P9) > 0
radio.setGroup(171)
notLegos.oledinit()
if (isCastleSay) {
    pins.digitalWritePin(DigitalPin.P5, 1)
    notLegos.potSet(AnalogPin.P10)
    digits = Connected.tm1637Create(
    DigitalPin.P7,
    DigitalPin.P6
    )
    lastSonarRead = 0
    lastGesture = 0
    lastHue = 0
    lastLaserR = 0
    lastLaserL = 0
    lastLaserC = 0
    lastHunt = 0
    notLegos.mp3setPorts(notLegos.mp3type.music, SerialPin.P15)
    basic.pause(20)
    notLegos.setVolume(notLegos.mp3type.music, 84)
    trackNo = 1
    basic.pause(20)
    notLegos.updateVolumeGlobal()
    notLegos.castleSayLights(DigitalPin.P11, DigitalPin.P12, DigitalPin.P13)
    castleMode = "init"
} else {
    pins.digitalWritePin(DigitalPin.P2, 1)
    pins.digitalWritePin(DigitalPin.P8, 1)
    pins.digitalWritePin(DigitalPin.P12, 1)
    pins.digitalWritePin(DigitalPin.P13, 1)
    buttonRow = 0
    fogToggle = false
    fogLevel = 0
    notLegos.motorSet(notLegos.motors.redrack, notLegos.motorState.min)
    notLegos.motorSet(notLegos.motors.shark, notLegos.motorState.min)
    notLegos.motorSet(notLegos.motors.ghost, notLegos.motorState.min)
    notLegos.motorSet(notLegos.motors.cannon, notLegos.motorState.min)
    notLegos.motorSet(notLegos.motors.oarrack, notLegos.motorState.min)
    notLegos.motorSet(notLegos.motors.shell, notLegos.motorState.min)
    notLegos.motorSet(notLegos.motors.door, notLegos.motorState.min)
    notLegos.motorSet(notLegos.motors.dragon, notLegos.motorState.min)
    notLegos.motorSet(notLegos.motors.wheel, notLegos.motorState.min)
    notLegos.motorSet(notLegos.motors.fan, notLegos.motorState.min)
    notLegos.castleDoLights(DigitalPin.P14, DigitalPin.P15, DigitalPin.P16)
    radioSay("check", 1)
}
let iBegan = input.runningTimeMicros()
let isReady = true
loops.everyInterval(500, function () {
    if (isCastleSay) {
        notLegos.updateVolumeGlobal()
    } else {
        if (fogToggle && fogLevel != 0) {
            if (fogLevel == 1) {
                notLegos.setFog(notLegos.fogLevels.light)
            } else if (fogLevel == 2) {
                notLegos.setFog(notLegos.fogLevels.medium)
            } else if (fogLevel == 3) {
                notLegos.setFog(notLegos.fogLevels.heavy)
            }
        } else {
            notLegos.setFog(notLegos.fogLevels.none)
        }
    }
})
loops.everyInterval(2000, function () {
    notLegos.printLine("" + iTook + "", 5)
})
loops.everyInterval(40, function () {
    iBegan = input.runningTime()
    if (isReady) {
        if (isCastleSay) {
            notLegos.castleSayTick()
            lastHunt = pins.digitalReadPin(DigitalPin.P4)
            lastGesture = Connected.getGesture()
            lastHue = Connected.readColor()
            lastSonarRead = notLegos.SonarNextRead()
            lastLaserR = Math.round(pins.analogReadPin(AnalogReadWritePin.P1) / 80)
            lastLaserC = Math.round(pins.analogReadPin(AnalogReadWritePin.P2) / 80)
            lastLaserL = Math.round(pins.analogReadPin(AnalogReadWritePin.P3) / 80)
            if (castleMode == "wait_start") {
                if (lastHunt == 1 && pins.digitalReadPin(DigitalPin.P4) == 1) {
                    castleMode = "idle"
                    radioSay("boot", 1)
                    notLegos.vfxReset(notLegos.vfxEffect.glow)
                    notLegos.setEffect(notLegos.vfxRegion.CastleSayAll, notLegos.vfxEffect.glow)
                    notLegos.mp3musicPlay(notLegos.musicGenre.lost)
                }
            } else if (castleMode == "wait_reg") {
            	
            } else if (castleMode == "wait_play") {
            	
            } else if (castleMode == "wait_laser") {
            	
            } else if (castleMode == "init") {
                radioSay("ready", 1)
            }
        } else {
            notLegos.castleDoTick()
            fogToggle = pins.analogReadPin(AnalogReadWritePin.P0) <= 90
            buttonRow = pins.analogReadPin(AnalogReadWritePin.P1)
            if (buttonRow < 10) {
                buttonPress("A")
                notLegos.setEffect(notLegos.vfxRegion.CastleDoAll, notLegos.vfxEffect.parade)
            } else if (buttonRow < 60) {
                buttonPress("B")
                notLegos.setEffect(notLegos.vfxRegion.CastleDoAll, notLegos.vfxEffect.fire)
            } else if (buttonRow < 110) {
                buttonPress("C")
                notLegos.setEffect(notLegos.vfxRegion.CastleDoAll, notLegos.vfxEffect.mine)
            } else if (buttonRow < 200) {
                buttonPress("D")
                notLegos.setEffect(notLegos.vfxRegion.CastleDoAll, notLegos.vfxEffect.glow)
            } else if (buttonRow < 700) {
                buttonPress("E")
                notLegos.setEffect(notLegos.vfxRegion.CastleDoAll, notLegos.vfxEffect.off)
            }
        }
    }
    ready_oled()
    notLegos.changeThree()
    iTook = input.runningTime() - iBegan
})
loops.everyInterval(7000, function () {
    if (!(isCastleSay) && (fogLevel == 1 && fogToggle)) {
        notLegos.motorSet(notLegos.motors.fan, notLegos.motorState.max)
        basic.pause(600)
        notLegos.motorSet(notLegos.motors.fan, notLegos.motorState.mid)
        basic.pause(500)
        notLegos.motorSet(notLegos.motors.fan, notLegos.motorState.min)
        basic.pause(500)
        notLegos.motorSet(notLegos.motors.fan, notLegos.motorState.off)
    }
})
