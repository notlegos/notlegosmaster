function isNearly (reference: number, reading: number, tolerance: number) {
    if (reading >= reference - tolerance && reading <= reference + tolerance) {
        return true
    } else {
        return false
    }
}
pins.setAudioPinEnabled(false)
led.enable(false)
let isCastleSay = false
let lastSonarRead = notLegos.SonarFirstRead(DigitalPin.P8, DigitalPin.P9)
if (lastSonarRead > 0) {
    isCastleSay = true
}
Connected.oledClear()
Connected.showUserText(1, "SAY: " + convertToText(isCastleSay))
let isReady = true
loops.everyInterval(1000, function () {
    Connected.showUserNumber(3, lastSonarRead)
})
control.inBackground(function () {
    while (isReady) {
        lastSonarRead = notLegos.SonarNextRead()
        basic.pause(40)
    }
})
