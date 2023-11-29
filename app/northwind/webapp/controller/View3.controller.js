sap.ui.define([
  "sap/m/library",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Item",
	"sap/ui/model/json/JSONModel",
	"sap/m/upload/Uploader"
], function (MobileLibrary, Controller, Item, JSONModel, Uploader) {
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
          url: "/attachments/Files",
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
      var url = `/attachments/Files(${id})/content`
      item.setUploadUrl(url);	
      var oUploadSet = this.byId("uploadSet");
      oUploadSet.setHttpRequestMethod("PUT")
      oUploadSet.uploadItem(item);
    },
    			
  });
});