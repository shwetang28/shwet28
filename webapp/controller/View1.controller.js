sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	var intervalHandle;

	return Controller.extend("com.sap.line.shwet28.controller.View1", {
		onInit: function () {

			// this.getView().byId('SOdiv').setVisible(false);

			var self = this;

			var oComboBox = this.getView().byId("Combo1");
			var oModel1 = new sap.ui.model.json.JSONModel();
			var array = [];
			array.push({
				"statement": "Petrol Pump 1",
				"key": "P1"
			}, {
				"statement": "Petrol Pump 2",
				"key": "P2"
			}, {
				"statement": "Petrol Pump 3",
				"key": "P3"
			});
			oModel1.setData(array);
			oComboBox.setModel(oModel1);
			oComboBox.bindItems("/", oComboBox.getItems()[0].clone());

		},

		linefunc: function (oKey) {
			var oModel = new sap.ui.model.odata.ODataModel(
				'/com.sap.iotservices.mms/v1/api/http/app.svc', true);
			var oArray;
			oModel.read("/SYSTEM.T_IOT_E5EA0ACDEC831C5F0D3A", null, ["$orderby=C_TIMESTAMP desc&$top=6&$filter=C_NAME eq '" + oKey + "'"],
				false,
				function (oData, oResponse) {
					oArray = oData.results;
				});

			oArray.reverse();

			var oModel1 = new sap.ui.model.json.JSONModel();
			oModel1.setData({
				data: oArray
			});

			var ointeractive = this.getView().byId("interactiveLineChart");
			// var ointeractive = new sap.suite.ui.microchart.InteractiveLineChart();
			var flag = 0;

			for (var i = 0; i < oArray.length; i++) {
				var oPoint = new sap.suite.ui.microchart.InteractiveLineChartPoint();
				var FC_LEVEL = parseFloat(oArray[i].C_LEVEL);
				if (FC_LEVEL < 36.0) { //Threshold is 3.0
					oPoint.setColor("Critical");
					flag = 1;
				}
				oPoint.setValue(FC_LEVEL);
				oPoint.setLabel(oArray[i].C_TIMESTAMP);
				ointeractive.insertPoint(oPoint, i);
			}

			// var oflex = this.getView().byId("sapUiSmallMargin");
			// oflex.addItem(ointeractive);

			this.getView().byId("btnStart").setVisible();
			this.getView().byId("btnStop").setVisible();
			this.getView().byId("btnStart").setEnabled();

			if (flag) {
				this.getView().byId('btnTrack').setVisible();
				this.getView().byId('trackdiv').setVisible();

			}
		},

		onComboChange: function () {
			var oComboBox = this.getView().byId("Combo1");
			var oKey = oComboBox.getSelectedKey();
			// var olineBoxChart = this.getView().byId("lineBoxChart");
			// olineBoxChart.setEnabled(true);
			if (intervalHandle) {
				clearInterval(intervalHandle);
			}

			var ointeractive = this.getView().byId("interactiveLineChart");
			ointeractive.destroyPoints();

			// var oflex = this.getView().byId("sapUiSmallMargin");
			// oflex.removeAllItems();
			// this.getView().byId('sapUiSmallMargin').setVisible();
			this.getView().byId('btnTrack').setVisible(false);
			this.getView().byId('trackdiv').setVisible(false);
			this.getView().byId('startstopdiv').setVisible();
			this.getView().byId('graphdiv').setVisible();
			this.linefunc(oKey);
		},

		onStart: function () {
			var self = this;
			var oComboBox = this.getView().byId("Combo1");
			var oKey = oComboBox.getSelectedKey();
			intervalHandle = setInterval(function () {
				self.linefunc(oKey);
			}, 10000); //10 seconds
			this.getView().byId("btnStart").setEnabled(false);
			this.getView().byId("btnStop").setEnabled();
		},

		gmapTrack: function (oEvent) {
			var id;
			var c_veh = "VEH1";
			if (c_veh == "VEH1")
				id = "d196f6b4-a5c8-4873-b1b9-ad89b2e6c211";
			else
				id = "3fbe0032-e802-406a-9b9d-552d2f94d3b3";
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RouteView1", {
				ids: id
			});
		},

		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		onSelectionChanged: function (oEvent) {
			var oPoint = oEvent.getParameters().point;
			// window.alert(oPoint.getColor());
			if (oPoint.getColor() === "Critical") {
				this.getView().byId('SOdiv').setVisible();

				var oComboBox = this.getView().byId("Combo1");
				var oKey = oComboBox.getSelectedKey();

				var oModel = new sap.ui.model.odata.ODataModel(
					'/sap/opu/odata/sap/ZSO_IOT_SRV', true);
				var oArray;
				oKey = oKey.substr(0, 1) + "P" + oKey.substr(1, 1);
				oModel.read("/SORDERSet(SENSOR='" + oKey + "')", null, [],
					false,
					function (oData, oResponse) {
						oArray = oData;
					});
				this.getView().byId('sensorId').setValue(oArray.SENSOR);
				this.getView().byId('sdDocument').setValue(oArray.SO);
				this.getView().byId('shipToParty').setValue(oArray.SHIPTO);
				this.getView().byId('unloadingPoint').setValue(oArray.SDATE);

			}

		},

		onExit: function () {
			if (intervalHandle) {
				clearInterval(intervalHandle);
			}
			this.getView().byId("btnStop").setEnabled(false);
			this.getView().byId("btnStart").setEnabled();
		}
	});
});