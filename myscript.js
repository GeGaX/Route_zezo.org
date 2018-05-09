"use strict";

const pattern = /updi\(event,'([0-9]{4}-[0-9]{2}-[0-9]{2}) ([0-9]{2}:[0-9]{2}) ([A-Z]{3,4}).*(T[+-]{1}.*?[0-9]{1,}:[0-9]{2}).*<br>Distances:.*?([0-9]{1,}\.[0-9]{1,}nm)\/([0-9]{1,}\.[0-9]{1,}nm)<br><b>Wind:<\/b> ([0-9]*?.*) (.*? kt).*\(<b>TWA(.*?)<\/b>\)<br><b>Heading:<\/b>(.*?)<b>Sail:<\/b>(.*?)<br><b>Boat Speed:<\/b>(.*?)'/g
const points = [];

/**
 * Calculate latitude using the scale of the display and the css left property
 * @param top
 * @param scale
 * @returns {number}
 */
function getLatitude(top, scale) {
    let result = 90 - ((top + 2)/scale);
    console.log('Calcul latitude '+top+' '+scale+' = '+result);
    return result;
}

/**
 * Calculate longitude using the scale of the display and the css top property
 * @param left
 * @param scale
 * @returns {number}
 */
function getLongitude(left,scale){
    let result;
    if(((left +2 / scale) <= 180)){
        result = (left + 2) / scale;
    } else {
        result = ((left  + 2) / scale)-360;
    }
    console.log('Calcul longitude '+left+' '+scale+' = '+result);
    return result;
}

try {
    let textContent = document.getElementsByTagName("script")[1].textContent;
    let scale = /var scale = ([0-9]+)/.exec(textContent)[1];

    let layer = document.getElementById("dot_layer");
    Array.prototype.slice.call(layer.getElementsByTagName("img")).forEach(function (element) {
        let event = element.getAttribute("onmouseover");
        if (event !== null) {

            // Get the two css properties used to calculate both longitude and latitude
            let style = element.getAttribute("style");
            let cssProperties = style.split(";");
            let left = cssProperties[1].split(":")[1].replace("px","");
            let top =  cssProperties[2].split(":")[1].replace("px","");

            let match = pattern.exec(event);

            const date = match[1];
            const time = match[2];
            const timezone = match[3];
            const ttw = match[4];
            const dtw = match[5];
            const dtg = match[6];
            const twd = match[7];
            const tws = match[8];
            const twa = match[9];
            const btw = match[10];
            const sail = match[11];
            const stw = match[12];
		   
            points.push({
                longitude : getLongitude(left,scale),
                latitude : getLatitude(top,scale),
                date : date,
                time : time,
                timezone : timezone,
                ttw : ttw,
                dtw : dtw,
                dtg : dtg,
                twd : twd,
                tws : tws,
                twa : twa,
                btw : btw,
                sail : sail,
                stw : stw
           });
            pattern.lastIndex = 0;
        }
    });

    chrome.runtime.sendMessage(points);
} catch (e) {
    console.error(e);
    chrome.runtime.sendMessage([]);
}