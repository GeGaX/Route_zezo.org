"use strict";

function table_thead_fixed() {
    let tableDivWraps = document.querySelectorAll(".table-thead-fixed");
    tableDivWraps.forEach(function (tableDivWrap) {
        let tableRef = tableDivWrap.children[0],
            tableBodyScroll = document.createElement("div");
        tableBodyScroll.className += "tbody-scroll";
        tableDivWrap.insertBefore(tableBodyScroll, tableRef);
        tableBodyScroll.appendChild(tableRef);
        let tableHeadFixed = document.createElement("div");
        tableHeadFixed.className += "theader-fixed";
        tableHeadFixed.appendChild(tableRef.cloneNode(true));
        tableDivWrap.prepend(tableHeadFixed);
        document.querySelector(".theader-fixed #pointsTable").id = "pointsTable2";
    });
    table_thead_fixed_resize();
}

function table_thead_fixed_resize() {
    let tableDivWraps = document.querySelectorAll(".table-thead-fixed");
    tableDivWraps.forEach(function (tableDivWrap) {
        let nbLigne = tableDivWrap.dataset.nbreligne !== undefined ? tableDivWrap.dataset.nbreligne : 22,
            tableHeadFixed = tableDivWrap.children[0],
            tableBodyScroll = tableDivWrap.children[1],
            tableRef = tableBodyScroll.children[0],
            hScrollBar = tableBodyScroll.offsetHeight - tableBodyScroll.clientHeight,
            nbLigneToShow = Math.min(nbLigne, tableRef.rows.length) + 1,
            rect1 = tableRef.rows[0].getBoundingClientRect(),
            rect2 = tableRef.rows[nbLigneToShow].getBoundingClientRect();
        tableBodyScroll.style.height = rect2.top - rect1.top + hScrollBar + "px";
        let hEntete = tableRef.tHead.offsetHeight,
            wScrollBar = tableBodyScroll.offsetWidth - tableBodyScroll.clientWidth;
        tableHeadFixed.style.height = hEntete + "px";
        tableHeadFixed.style.width = "calc(100% - " + wScrollBar + "px)";
        tableBodyScroll.onscroll = function () {
            tableHeadFixed.style.marginLeft = -this.scrollLeft + "px";
        };
    });
}

window.onload = function () {
    table_thead_fixed();
}

window.onresize = function () {
    table_thead_fixed_resize();
}
