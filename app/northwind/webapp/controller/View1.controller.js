sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
], function (Controller, History) {
    "use strict";
 
    return Controller.extend("com.sap.northwind.controller.View1", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteView1").attachPatternMatched(this._onRouteMatched, this);
        },
 
        _onRouteMatched: function (oEvent) {
            var oArgs, oView;
            oArgs = oEvent.getParameter("arguments");
            oView = this.getView();
 
            // Check if "key" parameter is set, and navigate to the corresponding tab
            if (oArgs.key) {
                var oIconTabBar = oView.byId("iconTabBar");
                oIconTabBar.setSelectedKey(oArgs.key);
            }
        },
 
        onIconTabBarSelect: function (oEvent) {
            var oRouter = this.getOwnerComponent().getRouter();
            var oSelectedKey = oEvent.getParameter("key");
       
            // Navigate to the corresponding route based on the selected key
            if (oSelectedKey === "Order_Details") {
                oRouter.navTo("RouteView2", { key: oSelectedKey });
            } else if (oSelectedKey === "Attachments") {
                oRouter.navTo("RouteView3", { key: oSelectedKey });
            }
        } 
    });
});
