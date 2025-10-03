sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/ColumnListItem",
    "sap/m/Input"
], (Controller, MessageToast, ColumnListItem, Input) => {
    "use strict";

    return Controller.extend("salesui.controller.Sales", {
        onInit() {

            this._oTable = this.byId("table0");
            this._createReadOnlyTemplates();
            this.rebindTable(this.oReadOnlyTemplate, "Navigation");
            this.oEditableTemplate = new ColumnListItem({
                cells: [
                    new Input({
                        value: "{mainModel>soNumber}",
                        change: [this.onInputChange, this]
                    }), new Input({
                        value: "{mainModel>customerName}",
                        change: [this.onInputChange, this]
                    }), new Input({
                        value: "{mainModel>customerNumber}",
                        change: [this.onInputChange, this]
                    }), new Input({
                        value: "{mainModel>PoNumber}",
                        change: [this.onInputChange, this]
                    }), new Input({
                        value: "{mainModel>inquiryNumber}",
                        change: [this.onInputChange, this]
                    })
                ]
            });
        },
        onOpenAddDialog: function () {
            this.getView().byId("OpenDialog").open();
        },
        onCancelDialog: function (oEvent) {
            oEvent.getSource().getParent().close();
        },

        onCreate: function () {
            var oSo = this.getView().byId("idSo").getValue();
            if (oSo !== "") {
                const oList = this._oTable;
                const oBinding = oList.getBinding("items");
                const oContext = oBinding.create({
                    "soNumber": this.byId("idSo").getValue(),
                    "customerName": this.byId("idCustName").getValue(),
                    "customerNumber": this.byId("idCustomer").getValue(),
                    "PoNumber": this.byId("idPo").getValue(),
                    "inquiryNumber": this.byId("idInqNumber").getValue()
                });
                oContext.created()
                    .then(() => {
                        // that._focusItem(oList, oContext);
                        this.getView().byId("OpenDialog").close();
                    });

            } else {
                MessageToast.show("So cannot be blank");
            }

        },

        onEditMode: function () {
            this.byId("editModeButton").setVisible(false);
            this.byId("saveButton").setVisible(true);
            this.byId("deleteButton").setVisible(true);
            this.rebindTable(this.oEditableTemplate, "Edit");
        },
        onDelete: function () {

            var oSelected = this.byId("table0").getSelectedItem();
            if (oSelected) {
                var oSalesOrder = oSelected.getBindingContext("mainModel").getObject().soNumber;

                oSelected.getBindingContext("mainModel").delete().then(function () {
                    MessageToast.show(oSalesOrder + " SuccessFully Deleted");
                }.bind(this), function (oError) {
                    MessageToast.show("Deletion Error: ", oError);
                });
            } else {
                MessageToast.show("Please Select a Row to Delete");
            }

        },

        rebindTable: function (oTemplate, sKeyboardMode) {
            this._oTable.bindItems({
                path: "mainModel>/SalesOrder",
                template: oTemplate,
                templateShareable: true
            }).setKeyboardMode(sKeyboardMode);
        },

        onInputChange: function () {
            this.refreshModel("mainModel");

        },

        refreshModel: function (sModelName, sGroup) {
            return new Promise((resolve, reject) => {
                this.makeChangesAndSubmit.call(this, resolve, reject,
                    sModelName, sGroup);
            });

        },

        makeChangesAndSubmit: function (resolve, reject, sModelName,sGroup){
                const that = this;
                sModelName = "mainModel";
                sGroup = "$auto";
                if (that.getView().getModel(sModelName).hasPendingChanges(sGroup)) {
                    that.getView().getModel(sModelName).submitBatch(sGroup).then(oSuccess =>{
                       // that.makeChangesAndSubmit(resolve,reject, sModelName,sGroup);
                        MessageToast.show("Record updated Successfully");
                    },reject)
                    .catch(function errorHandler(err) {
                        MessageToast.show("Something Went Wrong ",err.message); // 'Oops!'
                      });
                } else {
                    that.getView().getModel(sModelName).refresh(sGroup);
                    resolve();
                }


            },
            onSave: function(){
                this.getView().byId("editModeButton").setVisible(true);
                this.getView().byId("saveButton").setVisible(false);
                this._oTable.setMode(sap.m.ListMode.None);
                this.rebindTable(this.oReadOnlyTemplate, "Navigation");
                this.refreshModel("mainModel");
                
            },
            _createReadOnlyTemplates: function () {
                this.oReadOnlyTemplate = new sap.m.ColumnListItem({
				cells: [
					new sap.m.Text({
						text: "{mainModel>soNumber}"
					}),
					new sap.m.Text({
						text: "{mainModel>customerName}"
					}),
                    new sap.m.Text({
						text: "{mainModel>customerNumber}"
					}),
					new sap.m.Text({
						text: "{mainModel>PoNumber}"
					}),
                    new sap.m.Text({
						text: "{mainModel>inquiryNumber}"
					})
				]
			});
        },

        // start of actions and functions

          /* ================================================================== */
    /* ACTION FUNCTIONS USING execute() - DEPRECATED SINCE UI5 1.123+    */
    /* ================================================================== */

    /* ------------------------------------------------------------------ */
    /* 1.  BOUND action – NO parameters (execute)                        */
    /* ------------------------------------------------------------------ */
    async executePromoteBook() {
      
    //      var oModel = this.getOwnerComponent().getModel("mainModel");
    //   var oActionODataContextBinding = oModel.bindContext("/submitOrder(...)");
    //   oActionODataContextBinding.execute().then(function() {
    //         var oActionContext = oActionODataContextBinding.getBoundContext();
    //         console.log(oActionContext.getObject()); // Access the action's return value
    //         sap.m.MessageToast.show("Book promoted successfully!");
    //     }).catch(function(oError) {
    //         sap.m.MessageToast.show("Error promoting book: " + oError.message);
    //     });

     var oSelected = this.byId("table0").getSelectedItem();
         oSelected.getBindingContext("mainModel").getObject()

      const odataModel = this.getView().getModel("mainModel");
    //  const bookContext = this.getView().getBindingContext();
       const bookContext =  oSelected.getBindingContext("mainModel").getObject();

    //   if (!bookContext) {
    //     MessageToast.show("No book context available")
    //    // return
    //   }

      const actionPath = "/submitOrder(...)"
     //   const actionPath = "BookshopService.submitOrder(...)"
        const actionBinding = odataModel.bindContext(actionPath,bookContext)

      await actionBinding.execute()
      MessageToast.show("Book promoted (Execute)")



    },

    /* ------------------------------------------------------------------ */
    /* 2.  BOUND action – WITH parameters (execute)                      */
    /* ------------------------------------------------------------------ */
    async executeSetDiscount() {
      const odataModel = this.getView().getModel()
      // const bookContext = this.getView().getBindingContext()

      // if (!bookContext) {
      //   MessageToast.show("No book context available")
      //   return
      // }

      const actionPath = "/setDiscount(...)"
      const discountParameters = {
        percentage: 15,
        reason: "HOLIDAY_SALE"
      }

      const actionBinding = odataModel.bindContext(actionPath)

      // Set parameters for the action
      Object.entries(discountParameters).forEach(
        ([parameterName, parameterValue]) => {
          actionBinding.setParameter(parameterName, parameterValue)
        }
      )

      await actionBinding.execute()
      MessageToast.show("Discount applied: 15% (Execute)")
    }






        //end of methods
    });
});