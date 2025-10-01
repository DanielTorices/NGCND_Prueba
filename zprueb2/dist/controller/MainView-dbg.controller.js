sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/base/Log"
], (Controller, JSONModel, Log) => {
    "use strict";

    return Controller.extend("zprueb2.controller.MainView", {

        onInit: function () {
            const oLocalModel = new JSONModel({
                items: []
            });

            oLocalModel.setSizeLimit(1500000);

            this.getView().setModel(oLocalModel, "localModel");

            this._loadDataFromAPI();
        },

        _loadDataFromAPI: function () {
            const sUrl = "https://api-ngcnd.azurewebsites.net/api/sapdata";
            const oLocalModel = this.getView().getModel("localModel");

            // 🔵 Mostrar busy en la vista
            this.getView().setBusy(true);

            fetch("https://api-ngcnd.azurewebsites.net/api/sapdata")
                .then(response => response.json())
                .then(data => console.log(data))
                .catch(error => {
                    Log.error("Fallo la carga de datos del API", error);
                })
                .finally(() => {
                    // 🔵 Quitar busy siempre (éxito o error)
                    this.getView().setBusy(false);
                });
        },

        _processData: function (data) {
            data.forEach((item) => {
                let type = item.Iva;
                let factor = this._getPercentage(type);

                if (item.SubTotal !== undefined) {
                    let calculatedTotal = (parseFloat(item.SubTotal) * factor).toFixed(2);
                    item.CalculatedTotal = calculatedTotal;
                    item.Match = (parseFloat(calculatedTotal) === parseFloat(item.SubTotal));
                } else {
                    item.CalculatedTotal = "N/A";
                    item.Match = false;
                }
            });
        },

        _getPercentage: function (type) {
            const percentages = {
                "BS3": 1.10,
                "VS1": 1.20,
                "VS2": 1.40
            };
            return percentages[type] || 1;
        }
    });
});
