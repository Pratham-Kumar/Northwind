sap.ui.define([
  "sap/m/library",
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/Item",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel",
  "sap/m/upload/Uploader"
], function (MobileLibrary, Controller, Item, JSONModel, MessageToast, MessageBox, Uploader) {
  "use strict";

  return Controller.extend("com.sap.northwind.controller.View3", {
    onInit: function () {

    },

    onAfterItemAdded: function (oEvent) {
      var item = oEvent.getParameter("item")
      this._createEntity(item)
        .then((id) => {
          this._uploadContent(item, id);
        })
        .catch((err) => {
          console.log(err);
        })
    },

    onUploadCompleted: function (oEvent) {
      var oUploadSet = this.byId("uploadSet");
      oUploadSet.removeAllIncompleteItems();
      oUploadSet.getBinding("items").refresh();
    },

    onOpenPressed: function (oEvent) {
      // to be implemented      
    },

    _createEntity: function (item) {
      var data = {
        mediaType: item.getMediaType(),
        fileName: item.getFileName(),
        size: item.getFileObject().size
      };

      var settings = {
        url: "/v2/odata/v4/catalog/Files",
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        data: JSON.stringify(data)
      }

      return new Promise((resolve, reject) => {
        $.ajax(settings)
          .done((results, textStatus, request) => {
            resolve(results.ID);
          })
          .fail((err) => {
            reject(err);
          })
      })
    },

    _uploadContent: function (item, id) {
      var url = `/v2/odata/v4/catalog/Files(${id})/content`
      item.setUploadUrl(url);
      var oUploadSet = this.byId("uploadSet");
      oUploadSet.setHttpRequestMethod("PUT")
      oUploadSet.uploadItem(item);
    },
    onDelete: function () {
      // Get the selected items from the table
      var oUploadSet = this.getView().byId("uploadSet");
      var aSelectedItems = oUploadSet.getSelectedItems();

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
    onExport: function () {
      // Get the selected items from the UploadSet
      var oUploadSet = this.getView().byId("uploadSet");
      var aSelectedItems = oUploadSet.getSelectedItems();
    
      // Check if any items are selected
      if (aSelectedItems.length === 0) {
        MessageToast.show("No items selected for export");
        return;
      }
    
      // Perform the export logic
      aSelectedItems.forEach(function (oSelectedItem) {
        var sUrl = oSelectedItem.getBindingContext().getProperty("url");
        var sFileName = oSelectedItem.getBindingContext().getProperty("fileName");
    
        // Fetch the file content from the server
        fetch(sUrl)
          .then((response) => response.blob())
          .then((blob) => {
            // Create a download link for the blob
            var link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = sFileName;
            link.target = "_blank"; // Open the link in a new tab
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          })
          .catch((error) => {
            console.error("Error fetching file:", error);
            MessageToast.show("Error exporting file");
          });
      });
    },
    
    
  });
});