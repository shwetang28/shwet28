/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/sap/line/shwet28/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});