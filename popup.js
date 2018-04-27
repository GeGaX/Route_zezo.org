/**
 * Used to build the GPX output
 */
const builder = require('xmlbuilder');

var background = chrome.extension.getBackgroundPage();
var twaList = [];
var btwList = [];
var ttwLast = "T+ 0:00";
var twaLast = undefined;
var btwLast = undefined;

function createCell(value, row) {
    var cell = document.createElement("td");
    cell.innerHTML = value;
    row.appendChild(cell);
}

function ttwStyling(value, cell) {
    cell.align = "left";
    cell.innerHTML = value;
}

function dtwStyling(value, cell) {
    cell.align = "left";
    cell.innerHTML = value;
}

function dtgStyling(value, cell) {
    cell.align = "left";
    cell.innerHTML = value;
}

function twsStyling(value1, value2, cell) {
    var tws_foil = value1.replace(" kt", "");
    var twa_bd = value2.replace("\u00B0", "");
    if (tws_foil >= 11.1 && tws_foil <= 39.9 && Math.abs(twa_bd) >= 71 && Math.abs(twa_bd) <= 169) {
        cell.style.backgroundColor = "black";
        cell.style.color = "white";
    } else {
        cell.style.backgroundColor = "white";
        cell.style.color = "black";
    }
    cell.innerHTML = tws_foil + " kt";
}

function twaStyling(value, cell) {
    var twa_bd = value.replace("\u00B0", "");
    if (twa_bd >= 0) {
        cell.style.color = "green";
    } else {
        cell.style.color = "red";
    }
    cell.innerHTML = Math.abs(twa_bd) + "\u00B0";
}

function btwStyling(value, cell) {
    cell.style.color = "blue";
    cell.innerHTML = value;
}

function sailStyling(value, cell) {
    switch (value.trim()) {
    // Upwind sail
    case "Jib":
        cell.style.backgroundColor = "#FFD479";
        break;
    case "LJ":
        cell.style.backgroundColor = "#FFFC79";
        break;
    case "Stay":
        cell.style.backgroundColor = "#D4FB79";
        break;
    // Downwind sail
    case "Spi":
        cell.style.backgroundColor = "#76D6FF";
        break;
    case "LG":
        cell.style.backgroundColor = "#7A81FF";
        break;
    case "HG":
        cell.style.backgroundColor = "#D783FF";
        break;
    // Reaching sail
    case "C0":
        cell.style.backgroundColor = "#FF7E79";
        break;
    }
    cell.innerHTML = value;
}

function atwaStyling(value, cell) {
    if (value >= 0) {
        cell.style.color = "green";
    } else {
        cell.style.color = "red";
    }
    if (value !== "-") {
        cell.innerHTML = Math.abs(value) + "\u00B0";
    } else {
        cell.style.color = "black";
        cell.innerHTML = value;
    }
}

function abtwStyling(value, cell) {
    cell.style.color = "blue";
    if (value !== "-") {
        cell.innerHTML = value + "\u00B0";
    } else {
        cell.style.color = "black";
        cell.innerHTML = value;
    }
}

function createCellWithCustomStyling(value, row, customStyling) {
    var cell = document.createElement("td");
    customStyling(value, cell);
    row.appendChild(cell);
}

function createCellWithCustomStyling2(value1, value2, row, customStyling) {
    var cell = document.createElement("td");
    customStyling(value1, value2, cell);
    row.appendChild(cell);
}

function atwaCalc(twaList) {
    const
    twaData = twaList;
    Math.radians = function (degrees) {
        return degrees * Math.PI / 180.0;
    },
    Math.degrees = function (radians) {
        return radians * 180.0 / Math.PI;
    };
 
    let
    arX = [],
    arY = [],
    somX = 0.0,
    somY = 0.0,
    avgX = 0.0,
    avgY = 0.0,
    atwa = 0.0;
    
    for (const [i, angle] of twaData.entries()) {
        arX[i] = Math.cos(Math.radians(angle));
        arY[i] = Math.sin(Math.radians(angle));
    }
 
    for (const value of arX) {
	   somX += value;
    }
    avgX = somX / arX.length;
 
    for (const value of arY) {
	   somY += value;
    }
    avgY = somY / arY.length;
    
    atwa = Math.round(Math.degrees(Math.atan2(avgY, avgX)));
    if (isNaN (atwa)) {
        atwa = "-";
    }
    return atwa ;
}

function abtwCalc(btwList) {
    const
    btwData = btwList;
    Math.radians = function (degrees) {
        return degrees * Math.PI / 180.0;
    },
    Math.degrees = function (radians) {
        return radians * 180.0 / Math.PI;
    };
 
    let
    arX = [],
    arY = [],
    somX = 0.0,
    somY = 0.0,
    avgX = 0.0,
    avgY = 0.0,
    abtw = 0.0;
 
    for (const [i, angle] of btwData.entries()) {
        arX[i] = Math.cos(Math.radians(angle));
        arY[i] = Math.sin(Math.radians(angle));
    }
 
    for (const value of arX) {
	   somX += value;
    }
    avgX = somX / arX.length;
 
    for (const value of arY) {
	   somY += value;
    }
    avgY = somY / arY.length;
    
    abtw = Math.round(Math.degrees(Math.atan2(avgY, avgX)));
    if (isNaN (abtw)) {
        abtw = "-";
    } else if (abtw < 0) {
        abtw += 360;
    }
    return abtw;
}

function reinitializeDisplay() {
    document.getElementById("pointsTable").innerHTML = "";
}

function UtcToLocal(date, time) {
    var utcYear = date.split("-")[0];
    var utcMonth = (date.split("-")[1]) - 1;
    var utcDay = date.split("-")[2];
    var utcHour = time.split(":")[0];
    var utcMinutes = time.split(":")[1];
    var dateUtc = Date.UTC(utcYear, utcMonth, utcDay, utcHour, utcMinutes, 0, 0);
    
    var localDate = new Date(dateUtc);
    var year = localDate.getFullYear();
    var month = ("0" + (localDate.getMonth() + 1)).slice(-2);
    var day = ("0" + localDate.getDate()).slice(-2);
    var hours = ("0" + localDate.getHours()).slice(-2);
    var minutes = ("0" + localDate.getMinutes()).slice(-2);

    var offset = -localDate.getTimezoneOffset();
    var absOffset = Math.abs(offset);
    var sign = (offset > 0) ? "+" : "-";
    var hoursOffset = Math.trunc(absOffset) / 60;
    var MinutesHoursOffset = (hoursOffset === 0) ? "\u00b1" + "0" : sign + hoursOffset;
    var minutesOffset = absOffset % 60;
    var HoursMinutesOffset = (minutesOffset === 0) ? MinutesHoursOffset : sign + hoursOffset + ":" + minutesOffset;

    var formattedDate = year + "-" + month + "-" + day;
    var formattedTime = hours + ":" + minutes;
    var formattedTimeZone = "UTC" + HoursMinutesOffset;
    return [formattedDate, formattedTime, formattedTimeZone];
}

function getTimeZone(timezone) {
    if (timezone === "CET") {
        return "UTC+1";
    } else if (timezone === "CEST") {
        return "UTC+2";
    }
}

function displayTable(localTime) {
    points.forEach(function (element) {
        var row = document.createElement("tr");
        document.getElementById("pointsTable").appendChild(row);
        if ((localTime && element.timezone === "CET") || (localTime && element.timezone === "CEST")) {
            var ceZ = getTimeZone(element.timezone);
            createCell(element.date, row);
            createCell(element.time, row);
            createCell(ceZ, row);
        } else if (localTime && element.timezone === "UTC") {
            var localDTZ = UtcToLocal(element.date, element.time, element.timezone);
            createCell(localDTZ[0], row);
            createCell(localDTZ[1], row);
            createCell(localDTZ[2], row);
        } else {
            createCell(element.date, row);
            createCell(element.time, row);
            createCell(element.timezone, row);
        }
        createCellWithCustomStyling(element.ttw, row, ttwStyling);
        createCellWithCustomStyling(element.dtw, row, dtwStyling);
        createCellWithCustomStyling(element.dtg, row, dtgStyling);
        createCell(element.twd, row);
        createCellWithCustomStyling2(element.tws, element.twa, row, twsStyling);
        createCellWithCustomStyling(element.twa, row, twaStyling);
        createCellWithCustomStyling(element.btw, row, btwStyling);
        createCellWithCustomStyling(element.sail, row, sailStyling);
        createCell(element.stw, row);
        createCellWithCustomStyling(element.atwa, row, atwaStyling);
        createCellWithCustomStyling(element.abtw, row, abtwStyling);
        var manifest = chrome.runtime.getManifest();
        document.getElementById("version").innerHTML = manifest.version;
    });
}

var displayLocal = function () {
    reinitializeDisplay();
    if (document.getElementById("localtime").checked) {
        chrome.storage.local.set({"localTime" : true});
        displayTable(true);
    } else {
        chrome.storage.local.set({"localTime" : false});
        displayTable(false);
    }
};

document.getElementById("localtime").addEventListener("change", displayLocal);
var exportGpx = function (){
    let xml = builder.create('gpx', {'version': '1.0'});
    xml.ele('name','Route Zezo');
    xml.ele('desc','Generated from route Zezo extension');
    for (point of points) {
        console.log(point);
        if (point.latitude !== undefined && point.longitude !== undefined) {
            xml.ele('wpt', {lat: point.latitude, lon: point.longitude})
        }
    }
    let xmlString = xml.end({pretty: true});
    let gpxOutput = document.getElementById("gpxOutput");
    gpxOutput.innerText = '';
    gpxOutput.innerText = xmlString;
    console.log(xmlString);
};
document.getElementById("gpxExport").addEventListener("click", exportGpx);

chrome.storage.local.get("localTime", function (result) {
    if (result.localTime === true) {
        document.getElementById("localtime").checked = true;
        displayLocal();
    } else {
        document.getElementById("localtime").checked = false;
    }
});
reinitializeDisplay();
var points = background.points[background.currentTab];

function space(value) {
    if (value < 10) {
        value = " " + value;
    }
    return value;
}

function zero(value) {
    if (value < 10) {
        value = "0" + value;
    }
    return value;
}

function genIteNext (ttwCurr) {
    var ttwCurr = ttwCurr.match(/.*?([0-9]{1,3}):([0-9]{2})/);
    var ttwHours = parseInt(ttwCurr[1], 10);
    var ttwMinutes = parseInt(ttwCurr[2], 10);
    var ttwNext = [];
    if (ttwMinutes + 10 < 60) {
        ttwNext = "T+" + space (ttwHours) + ":" + zero (ttwMinutes + 10);
    } else {
        ttwNext = "T+" + space (ttwHours + 1) + ":" + zero (ttwMinutes - 50);
    }
    return ttwNext;
}

for (var i = 0; i < points.length; i++) {
    points[i].atwa = atwaCalc(twaList);
    points[i].abtw = abtwCalc(btwList);
    while (points[i].ttw !== ttwLast) {
        twaList.push(parseInt(twaLast,10));
        btwList.push(parseInt(btwLast,10));
        ttwLast = genIteNext(ttwLast);
    }
    twaLast = parseInt(points[i].twa, 10);
    btwLast = parseInt(points[i].btw, 10);
    if (twaList.length === 0) {
        twaList.push(twaLast);
        btwList.push(btwLast);
    } else if (twaList[0] * twaLast < 0) {
        twaList = [twaLast];
        btwList = [btwLast];
    } else {
        twaList.push(twaLast);
        btwList.push(btwLast);
    }
    ttwLast = genIteNext(ttwLast);
}

displayTable(false);