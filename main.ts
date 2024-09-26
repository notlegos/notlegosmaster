function pushPrint (lineNo: number, textLine: string) {
    if (lineNo == 1) {
        if (textLine != pushPrint1) {
            pushPrint1 = textLine
            Connected.showUserText(lineNo, textLine)
        }
    } else if (lineNo == 2) {
        if (textLine != pushPrint2) {
            pushPrint2 = textLine
            Connected.showUserText(lineNo, textLine)
        }
    }
}
function isNearly (reference: number, reading: number, tolerance: number) {
    if (reading >= reference - tolerance && reading <= reference + tolerance) {
        return true
    } else {
        return false
    }
}
function padLimit (numberIn: number, digits: number) {
    limitNines = 0
    textIn = convertToText(Math.round(Math.max(Math.min(numberIn, 10 ** digits - 1), 0)))
    while (textIn.length < digits) {
        textIn = " " + textIn
    }
    return textIn
}
function buttonPress (button: string) {
    Connected.showUserText(6, "button: " + button)
}
function printSay () {
    if (isCastleSay) {
        pushPrint(1, "R" + lastLaserR + " C" + lastLaserC + " L" + lastLaserL)
        pushPrint(2, notLegos.getVolumes())
    }
}
radio.onReceivedValue(function (name, value) {
    if (name.substr(0, btToken.length) == btToken) {
        theName = name.substr(btToken.length, name.length - btToken.length)
        if (isCastleSay) {
            if (theName == "ready") {
                notLegos.setEffect(notLegos.vfxRegion.CastleSayAll, notLegos.vfxEffect.idle)
                notLegos.vfxReset(notLegos.vfxEffect.idle)
                notLegos.mp3musicPlay(notLegos.musicGenre.awaiting)
                Connected.showUserText(7, "bt: " + theName + "=" + value)
            }
        } else {
            if (theName == "ready") {
                notLegos.setEffect(notLegos.vfxRegion.CastleDoAll, notLegos.vfxEffect.idle)
                notLegos.vfxReset(notLegos.vfxEffect.idle)
                radio.sendValue("" + btToken + "ready", 1)
                Connected.showUserText(7, "bt: " + theName + "=" + value)
            }
        }
    }
})
input.onLogoEvent(TouchButtonEvent.Touched, function () {
    if (isCastleSay) {
        notLegos.mp3musicPlay(notLegos.musicGenre.awaiting)
    }
})
let iBegan = 0
let theName = ""
let textIn = ""
let limitNines = 0
let pushPrint2 = ""
let pushPrint1 = ""
let buttonRow = 0
let trackNo = 0
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
if (notLegos.SonarFirstRead(DigitalPin.P8, DigitalPin.P9) > 0) {
    isCastleSay = true
}
radio.setGroup(171)
Connected.showUserText(8, "SAY: " + convertToText(isCastleSay))
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
    notLegos.mp3setPorts(notLegos.mp3type.music, SerialPin.P15)
    basic.pause(20)
    notLegos.setVolume(notLegos.mp3type.music, 84)
    trackNo = 1
    basic.pause(20)
    notLegos.updateVolumeGlobal()
    notLegos.castleSayLights(DigitalPin.P11, DigitalPin.P12, DigitalPin.P13)
    radio.sendValue("" + btToken + "ready", 0)
} else {
    pins.digitalWritePin(DigitalPin.P2, 1)
    pins.digitalWritePin(DigitalPin.P8, 1)
    pins.digitalWritePin(DigitalPin.P12, 1)
    pins.digitalWritePin(DigitalPin.P13, 1)
    buttonRow = 0
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
}
pushPrint1 = ""
pushPrint2 = ""
let isReady = true
let iTook = input.runningTimeMicros()
loops.everyInterval(500, function () {
    if (isCastleSay) {
        notLegos.updateVolumeGlobal()
    }
})
loops.everyInterval(40, function () {
    iBegan = input.runningTime()
    if (isReady) {
        if (isCastleSay) {
            notLegos.castleSayTick()
            lastSonarRead = notLegos.SonarNextRead()
            lastLaserR = Math.round(pins.analogReadPin(AnalogReadWritePin.P1) / 80)
            lastLaserC = Math.round(pins.analogReadPin(AnalogReadWritePin.P2) / 80)
            lastLaserL = Math.round(pins.analogReadPin(AnalogReadWritePin.P3) / 80)
            lastGesture = Connected.getGesture()
            lastHue = Connected.readColor()
            printSay()
        } else {
            notLegos.castleDoTick()
            buttonRow = pins.analogReadPin(AnalogReadWritePin.P1)
            if (buttonRow < 10) {
                buttonPress("A")
            } else if (buttonRow < 60) {
                buttonPress("B")
            } else if (buttonRow < 110) {
                buttonPress("C")
            } else if (buttonRow < 200) {
                buttonPress("D")
            } else if (buttonRow < 700) {
                buttonPress("E")
            }
        }
    }
    iTook = input.runningTime() - iBegan
})
loops.everyInterval(3000, function () {
    Connected.showUserNumber(5, iTook)
})
