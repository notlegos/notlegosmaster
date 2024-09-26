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
                Connected.showUserText(7, "bt: " + theName + "=" + value)
                notLegos.mp3musicPlay(notLegos.musicGenre.awaiting)
            }
        } else {
            if (theName == "ready") {
                Connected.showUserText(1, "bt: " + theName + "=" + value)
                radio.sendValue("" + btToken + "ready", 1)
            }
        }
    }
})
input.onLogoEvent(TouchButtonEvent.Touched, function () {
    notLegos.mp3musicPlay(notLegos.musicGenre.awaiting)
})
let lastHue = 0
let lastGesture = 0
let lastSonarRead = 0
let iBegan = 0
let theName = ""
let textIn = ""
let limitNines = 0
let pushPrint2 = ""
let pushPrint1 = ""
let trackNo = 0
let lastLaserC = 0
let lastLaserL = 0
let lastLaserR = 0
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
    notLegos.castleDoLights(DigitalPin.P14, DigitalPin.P15, DigitalPin.P16)
}
pushPrint1 = ""
pushPrint2 = ""
let isReady = true
let iTook = input.runningTimeMicros()
loops.everyInterval(500, function () {
    notLegos.updateVolumeGlobal()
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
        }
    }
    iTook = input.runningTime() - iBegan
})
loops.everyInterval(3000, function () {
    Connected.showUserNumber(5, iTook)
})
