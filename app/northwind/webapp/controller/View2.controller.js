sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/Label",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/export/Spreadsheet",
    "sap/m/upload/Uploader"
], function (BaseController, Dialog, Button, Input, Label, MessageToast, Fragment, Filter, FilterOperator, Spreadsheet, Uploader) {
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

        onUpdate: function () {
            // Get the selected item from the table
            var oTable = this.getView().byId("idProductsTable");
            var oSelectedItem = oTable.getSelectedItem();
        
            // Check if any item is selected
            if (!oSelectedItem) {
                MessageToast.show("No item selected for update");
                return;
            }
        
            // Get the selected item's data
            var oContext = oSelectedItem.getBindingContext();
            var oSelectedData = oContext.getObject();
        
            // Open the dialog and populate with selected data
            if (!this._oUpdateProductDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "com.sap.northwind.view.fragment.UpdateOrder",
                    controller: this
                }).then(oDialog => {
                    this._oUpdateProductDialog = oDialog;
                    this.getView().addDependent(oDialog);
        
                    // Populate the dialog with selected data
                    this.getView().byId("UpdateOrderID").setValue(oSelectedData.OrderID);
                    this.getView().byId("UpdateProductID").setValue(oSelectedData.ProductID);
                    this.getView().byId("UpdateUnitPrice").setValue(oSelectedData.UnitPrice);
                    this.getView().byId("UpdateQuantity").setValue(oSelectedData.Quantity);
                    this.getView().byId("UpdateDiscount").setValue(oSelectedData.Discount);
        
                    oDialog.open();
                });
            } else {
                // Populate the dialog with selected data
                this.getView().byId("UpdateOrderID").setValue(oSelectedData.OrderID);
                this.getView().byId("UpdateProductID").setValue(oSelectedData.ProductID);
                this.getView().byId("UpdateUnitPrice").setValue(oSelectedData.UnitPrice);
                this.getView().byId("UpdateQuantity").setValue(oSelectedData.Quantity);
                this.getView().byId("UpdateDiscount").setValue(oSelectedData.Discount);
        
                this._oUpdateProductDialog.open();
            }
        },


        confirmUpdateOrder: function () {
            // Get the values from the dialog input fields
            var oOrderID = this.getView().byId("UpdateOrderID").getValue();
            var oProductID = this.getView().byId("UpdateProductID").getValue();
            var oUnitPrice = this.getView().byId("UpdateUnitPrice").getValue();
            var oQuantity = this.getView().byId("UpdateQuantity").getValue();
            var oDiscount = this.getView().byId("UpdateDiscount").getValue();
        
            // Get the selected items from the table
            var oTable = this.getView().byId("idProductsTable");
            var aSelectedItems = oTable.getSelectedItems();
        
            if (aSelectedItems.length === 0) {
                MessageToast.show("No item selected for update");
                return;
            }
        
            // Assuming you want to update the first selected item, you can modify this based on your logic
            var oSelectedItem = aSelectedItems[0];
            var oContext = oSelectedItem.getBindingContext();
            var sPath = oContext.getPath();
        
            // Extract the key value from the path
            var sKey = sPath.split("(")[1].split(")")[0];
        
            // Create an object with updated values
            var oUpdatedData = {
                OrderID: oOrderID,
                ProductID: oProductID,
                UnitPrice: oUnitPrice,
                Quantity: oQuantity,
                Discount: oDiscount,
            };
        
            // Update the model with new data
            oContext.getModel().update("/Order_Details(" + sKey + ")", oUpdatedData, {
                success: function () {
                    MessageToast.show("Data updated successfully");
                },
                error: function (err) {
                    console.error("Error updating data:", err);
                }
            });
        
            // Close the dialog
            this._oUpdateProductDialog.close();
        },
        
        

        onCancelOrders: function () {
            this._oUpdateProductDialog.close();
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
        },
        createColumnConfig: function() {
            return [
                { label: 'OrederID', property: 'OrderID' },
                { label: 'ProductID', property: 'ProductID' },
                { label: 'UnitPrice', property: 'UnitPrice' },
                { label: 'Quantity', property: 'Quantity' },
                { label: 'Discount', property: 'Discount' },
            ]
        },
        onExport: function() {
            var oTable = this.byId('idProductsTable');
            var oRowBinding = oTable.getBinding('items');
            var aCols = this.createColumnConfig();
       
            var oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: oRowBinding,
                fileName: 'Table_export_sample.xlsx',
                worker: false
            };
       
            var oSheet = new sap.ui.export.Spreadsheet(oSettings);
            oSheet.build().finally(function() {
                oSheet.destroy();
            });
        },
        onFileUploadChange: function (oEvent) {
            var oFileUploader = oEvent.getSource();
            var oFile = oEvent.getParameter("files")[0];
       
            if (!oFile) {
                // No file selected
                console.error("No file selected");
                return;
            }
       
            var reader = new FileReader();
       
            reader.onload = function (e) {
                var csvData = e.target.result;
       
                if (!csvData) {
                    // Empty file
                    console.error("Empty file");
                    return;
                }
       
                var jsonData = this.convertCsvToJson(csvData);
       
                if (jsonData.length > 0) {
                    // send to backend json data via odata call
                    this.sendDataToBackend(jsonData);
                } else {
                    console.error("No valid data to send to the backend");
                }
            }.bind(this);
       
            reader.onerror = function (e) {
                console.error("Error reading file:", e);
            };
       
            reader.readAsText(oFile);
        },
       
        convertCsvToJson: function (csvData) {
            var lines = csvData.split('\n');
            var result = [];
            var headers = lines[0].split(';').map(function (header) {
                return header.trim();
            });            
            for (var i = 1; i < lines.length; i++) {
                var obj = {};
                var currentLine = lines[i].split(';');
       
                // Check if the 'EmployeeID' field is not null or empty
                if (currentLine[headers.indexOf('ProductID')].trim() !== '') {
                    for (var j = 0; j < headers.length; j++) {
                        obj[headers[j]] = currentLine[j];
                    }
       
                    result.push(obj);
                }
            }
       
            return result;
        },
       
       
        sendDataToBackend: function (jsonData) {
            // Perform OData call to send jsonData to the backend
            // Example: Assume there is an OData model named 'oModel'
            var oModel = this.getView().getModel();
       
            for (var i = 0; i < jsonData.length; i++) {
                oModel.create("/Order_Details", jsonData[i], {
                    success: function () {
                        // Handle success
                    },
                    error: function () {
             
                    }
                });
            }
        }
        
    });
});