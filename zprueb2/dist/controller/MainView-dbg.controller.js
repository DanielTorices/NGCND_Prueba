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
                .then(data => {
                    console.log(data)

                    this._processData(data);
                    oLocalModel.setProperty("/items", data);
                })
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
        },
        onSearch: function (oEvent) {
            const sQuery = oEvent.getParameter("query");
            const oTable = this.getView().byId("reporteTable");
            const oBinding = oTable.getBinding("items");

            if (sQuery) {
                const oFinalFilter = new sap.ui.model.Filter({
                    filters: [
                        // Busca en el nombre de la tabla
                        new sap.ui.model.Filter("TABNAME", sap.ui.model.FilterOperator.Contains, sQuery),
                        // Y también en la descripción
                        new sap.ui.model.Filter("DDTEXT", sap.ui.model.FilterOperator.Contains, sQuery)
                    ],
                    and: false // El resultado aparecerá si CUALQUIERA de los dos filtros coincide
                });
                oBinding.filter(oFinalFilter);
            } else {
                oBinding.filter([]); // Limpia el filtro si la búsqueda está vacía
            }
        }
    });
});
