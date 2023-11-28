sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/Label",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, Dialog, Button, Input, Label, MessageToast, Fragment, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("com.sap.northwind.controller.View2", {
        onInit: function () {

        },

        onAdd: function () {

            if (!this._oCreateProductDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "com.sap.northwind.view.fragment.Order",
                    controller: this
                }).then(oDialog => {
                    this._oCreateProductDialog = oDialog
                    this.getView().addDependent(oDialog)
                    oDialog.open()
                })
            } else {
                this._oCreateProductDialog.open()
            }


        },
        confirmOrder: function () {
            let oModel = this.getOwnerComponent().getModel();
            let oOrderID = this.getView().byId("OrderID").getValue();
            let oProductID = this.getView().byId("ProductID").getValue();
            let oUnitPrice = this.getView().byId("UnitPrice").getValue();
            let oQuantity = this.getView().byId("Quantity").getValue();
            let oDiscount = this.getView().byId("Discount").getValue();

            let myData = {
                OrderID: oOrderID,
                ProductID: oProductID,
                UnitPrice: oUnitPrice,
                Quantity: oQuantity,
                Discount: oDiscount,
            }

            oModel.create("/Order_Details", myData, {
                success: function (res) {
                    MessageToast.show("Data added successfully");

                    // Clear the entered form data in the dialog
                    this.getView().byId("OrderID").setValue("");
                    this.getView().byId("ProductID").setValue("");
                    this.getView().byId("UnitPrice").setValue("");
                    this.getView().byId("Quantity").setValue("");
                    this.getView().byId("Discount").setValue("");

                    // Close the dialog
                    this._oCreateProductDialog.close();
                }.bind(this),
                error: function (err) {
                    console.error(err);
                    // You can show an error message if needed
                    MessageToast.show("Error occurred while saving data");
                }
            });
        },
        onDelete: function () {
            // Get the selected items from the table
            var oTable = this.getView().byId("idProductsTable");
            var aSelectedItems = oTable.getSelectedItems();

            // Check if any items are selected
            if (aSelectedItems.length === 0) {
                MessageToast.show("No items selected for deletion");
                return;
            }

            var that = this;
            sap.m.MessageBox.confirm("Are you sure you want to delete the selected items?", {
                title: "Confirm Deletion",
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.OK) {
                        that.performDelete(aSelectedItems);
                    }
                }
            });
        },

        performDelete: function (aSelectedItems) {
            var oModel = this.getOwnerComponent().getModel();
            aSelectedItems.forEach(function (oSelectedItem) {
                var sPath = oSelectedItem.getBindingContext().getPath();
                oModel.remove(sPath, {
                    success: function (res) {
                        console.log("Item deleted successfully");
                        MessageToast.show("Item Deleted Successfully")
                    },
                    error: function (err) {
                        console.error("Error deleting item:", err);
                    }
                });
            });

            // Optionally, you can refresh the table or update bindings
            // this.getView().byId("idProductsTable").getBinding("items").refresh();
        },


        onCancelOrder: function () {
            // Clear the entered form data in the dialog
            this.getView().byId("OrderID").setValue("");
            this.getView().byId("ProductID").setValue("");
            this.getView().byId("UnitPrice").setValue("");
            this.getView().byId("Quantity").setValue("");
            this.getView().byId("Discount").setValue("");

            // Close the dialog
            this._oCreateProductDialog.close();
        },
        onFilter: function (oEvent) {
            // Get the search value
            var sSearchValue = oEvent.getParameter("newValue").toLowerCase();

            // Get the binding for the table
            var oBinding = this.getView().byId("idProductsTable").getBinding("items");

            // Apply the filter to the binding
            if (sSearchValue) {
                var aFilters = [
                    new sap.ui.model.Filter("OrderID", sap.ui.model.FilterOperator.Contains, sSearchValue),
                    new sap.ui.model.Filter("ProductID", sap.ui.model.FilterOperator.Contains, sSearchValue),
                    new sap.ui.model.Filter("UnitPrice", sap.ui.model.FilterOperator.Contains, sSearchValue),
                    new sap.ui.model.Filter("Quantity", sap.ui.model.FilterOperator.Contains, sSearchValue),
                    new sap.ui.model.Filter("Discount", sap.ui.model.FilterOperator.Contains, sSearchValue)
                ];

                oBinding.filter(aFilters);
            } else {
                // If search value is empty, remove the filter
                oBinding.filter([]);
            }
        },


        onSearch: function (oEvent) {
            var aFilter = [];
            var sQuery = oEvent.getParameter("query");
            if (sQuery) {
                // Convert the search query to an integer
                var iQuery = parseInt(sQuery);
                if (!isNaN(iQuery)) {
                    aFilter.push(new Filter("OrderID", FilterOperator.EQ, iQuery));
                }
            }
        
            // filter binding
            var oTable = this.getView().byId("idProductsTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter(aFilter);
        }
        
    });
});