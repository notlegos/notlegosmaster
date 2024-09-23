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
input.onLogoEvent(TouchButtonEvent.Touched, function () {
    notLegos.mp3musicPlay(notLegos.musicGenre.awaiting)
})
let lastHue = 0
let lastGesture = 0
let lastSonarRead = 0
let iBegan = 0
let textIn = ""
let limitNines = 0
let pushPrint2 = ""
let pushPrint1 = ""
let trackNo = 0
let lastLaserC = 0
let lastLaserL = 0
let lastLaserR = 0
let scoreCircle: Connected.Strip = null
let wheelLights: Connected.Strip = null
let sockLights: Connected.Strip = null
let digits: Connected.TM1637LEDs = null
let isCastleSay = false
let lastVolumeRead = 0
pins.setAudioPinEnabled(false)
led.enable(false)
if (notLegos.SonarFirstRead(DigitalPin.P8, DigitalPin.P9) > 0) {
    isCastleSay = true
}
Connected.showUserText(8, "SAY: " + convertToText(isCastleSay))
if (isCastleSay) {
    pins.digitalWritePin(DigitalPin.P5, 1)
    notLegos.potSet(AnalogPin.P10)
    digits = Connected.tm1637Create(
    DigitalPin.P7,
    DigitalPin.P6
    )
    sockLights = Connected.create(Connected.DigitalRJPin.P11, 8, Connected.NeoPixelMode.RGB)
    sockLights.showRainbow(120, 240)
    sockLights.show()
    wheelLights = Connected.create(Connected.DigitalRJPin.P12, 18, Connected.NeoPixelMode.RGB)
    wheelLights.showRainbow(1, 360)
    wheelLights.show()
    scoreCircle = Connected.create(Connected.DigitalRJPin.P13, 8, Connected.NeoPixelMode.RGB)
    scoreCircle.showRainbow(1, 360)
    scoreCircle.show()
    lastLaserR = 0
    lastLaserL = 0
    lastLaserC = 0
    notLegos.mp3setPorts(notLegos.mp3type.music, SerialPin.P15)
    basic.pause(20)
    notLegos.setVolume(notLegos.mp3type.music, 84)
    trackNo = 1
    basic.pause(20)
    notLegos.updateVolumeGlobal()
} else {
	
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
            sockLights.rotate(1)
            wheelLights.rotate(1)
            scoreCircle.rotate(1)
            sockLights.show()
            wheelLights.show()
            scoreCircle.show()
            lastSonarRead = notLegos.SonarNextRead()
            lastLaserR = Math.round(pins.analogReadPin(AnalogReadWritePin.P1) / 80)
            lastLaserC = Math.round(pins.analogReadPin(AnalogReadWritePin.P2) / 80)
            lastLaserL = Math.round(pins.analogReadPin(AnalogReadWritePin.P3) / 80)
            lastGesture = Connected.getGesture()
            lastHue = Connected.readColor()
            printSay()
        } else {
        	
        }
    }
    iTook = input.runningTime() - iBegan
})
loops.everyInterval(3000, function () {
    Connected.showUserNumber(5, iTook)
})
