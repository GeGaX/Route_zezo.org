"use strict";

function table_thead_fixed() {
	// we can have several tables
	let tableDivWraps = document.querySelectorAll(".table-thead-fixed");
	tableDivWraps.forEach(function(tableDivWrap) {
        // table with fixed head
		let tableRef = tableDivWrap.children[0]; // table
		// we surround the table with a div
		let tableBodyScroll = document.createElement("div");
		tableBodyScroll.className += "tbody-scroll"; // tbody-scroll
		tableDivWrap.insertBefore(tableBodyScroll, tableRef);
		tableBodyScroll.appendChild(tableRef);
		// fixed header: copy (clone) of the table
		let tableHeadFixed = document.createElement("div"); // theader-fixed
		tableHeadFixed.className += "theader-fixed";
		tableHeadFixed.appendChild(tableRef.cloneNode(true));
		tableDivWrap.prepend(tableHeadFixed);
		// we change the id pointsTable -> pointsTable2
		document.querySelector(".theader-fixed #pointsTable").id = "pointsTable2";
	});
	// fit height clean scroll
	table_thead_fixed_resize();
}

// Resizing the window (horizontal)
function table_thead_fixed_resize() {
	// we can have several tables
	let tableDivWraps = document.querySelectorAll(".table-thead-fixed");
	tableDivWraps.forEach(function(tableDivWrap) {
		let nbLigne = tableDivWrap.dataset.nbreligne !== undefined ? tableDivWrap.dataset.nbreligne : 22;
		let tableHeadFixed = tableDivWrap.children[0];
		let tableBodyScroll = tableDivWrap.children[1];
		let tableRef = tableBodyScroll.children[0];
		// calc height scroll-bar-X
		let hScrollBar = tableBodyScroll.offsetHeight - tableBodyScroll.clientHeight;
		// number of lines to show
		let nbLigneToShow = Math.min(nbLigne, tableRef.rows.length) + 1;
		let rect1 = tableRef.rows[0].getBoundingClientRect();
		let rect2 = tableRef.rows[nbLigneToShow].getBoundingClientRect();
		tableBodyScroll.style.height = rect2.top - rect1.top + hScrollBar + "px";
		// calc for readjustment
		let hEntete = tableRef.tHead.offsetHeight;
		// calc width scroll-bar-Y
		let wScrollBar = tableBodyScroll.offsetWidth - tableBodyScroll.clientWidth;
		// fixed header readjustment
		tableHeadFixed.style.height = hEntete + "px";
		tableHeadFixed.style.width = "calc(100% - " + wScrollBar + "px)";
		// scrolls synchronization
		tableBodyScroll.onscroll = function() {
		tableHeadFixed.style.marginLeft = -this.scrollLeft + "px";
		};
	});
}
 
// Activation
window.onload = function(){
  table_thead_fixed();
}
// Resizing the window
window.onresize = function(){
  table_thead_fixed_resize();
}