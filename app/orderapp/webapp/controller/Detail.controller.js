sap.ui.define([
    "orderapp/controller/BaseController",	
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Item"
], function (Controller, Filter, FilterOperator, MessageToast, MessageBox, JSONModel, Item) {
    "use strict";

    return Controller.extend("orderapp.controller.Detail", {
        onInit: function () {
            this._mode = undefined; //1: create 2: edit 3: display
            this.getRouter().getRoute("Detail").attachMatched(this._onRouteMatched, this);

            var oModel = new JSONModel({
                savingStatus: "",
                isStatusVisible: false,
                deleteEnabled: false,
                editable: false,
                busy: false
            });
            this.setModel(oModel, "viewModel");
        },

        onEdit: function () {
            //create draft
            this.setProperty("viewModel", "busy", true);
            this._createDraft()
            .then(oCreateContext => {
                this._attachPatchEvents();
                //set to edit mode
                this._mode = 2;
                this._setEditable(true);   
                this.setProperty("viewModel", "busy", false);             
            })
            .catch(error => {
                MessageBox.error(error.message, {});
                this.setProperty("viewModel", "busy", false);
            });         
        },

        onDelete: function () {
            this.onCancel();
        },

        onAddItem: function () {
            var oListBinding = this.byId("itemTable").getBinding("items");
            oListBinding.create({});
        },

        onDeleteItem: function (oEvent) {
            oEvent.getParameter("listItem").getBindingContext().delete("$auto")
            .then(()=> {             
                this._requestTotalAmount();
            })
            .catch(error => {
                /*workaround
                If you add a new item and delete an existing item before saving,
                the following error can occur.
                */
                if(error.message === "Cannot read property '@$ui5._' of undefined") {
                    MessageBox.information("The item could not be deleted. Please save first and retry  ", );
                } else {
                    MessageBox.error(error.message, {});
                }                
            })
        },

        onSave: function () {
            var hasError = this._doCheck();
            if (hasError) {
                return;
            }

            var oContext = this.getView().getBindingContext();
            var oModel = this.getModel();
            var oOperation = oModel.bindContext("OrderService.draftActivate(...)", oContext);
            oOperation.execute()
            .then(() => {
                MessageToast.show("Data has been saved", {
                    closeOnBrowserNavigation: false
                });
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("List");
            })                      
            .catch(error => {               
                MessageBox.error(error.message, {});
            });
        },

        onChange: function (oEvent) {
            this._clearErrorState(oEvent.getSource().getId());
        },

        onCancel: function () {
            const { confirmMessage, buttonText } = this._getDeleteMessage();
            MessageBox.confirm(confirmMessage, {
				actions: [buttonText, MessageBox.Action.CLOSE],
				emphasizedAction: buttonText,                
                onClose: this._discardDraft.bind(this)
            });
        },     

        onValidate: function (oEvent) {
            var filedGroupId = oEvent.getSource().getFieldGroupIds()[0];
            if (filedGroupId === "amount") {
                this._requestTotalAmount();
            }            
        },

        _requestTotalAmount: function () {
            this.getView().getObjectBinding().getBoundContext().requestSideEffects([{
                $PropertyPath: "totalAmount"
            }], "$auto");
        },

        _doCheck: function () {
            //Check mandatory fields
            var hasError = false;
            var aMandatoryFiledLabels = this.getView().getControlsByFieldGroupId("mandatory");
            aMandatoryFiledLabels.forEach(oLabel => {
                let mandatoryFiledId = oLabel.getLabelFor();
                if (this._isBlank(mandatoryFiledId)) {
                    this._setErrorState(mandatoryFiledId);
                    hasError = true;
                }
            });
            return hasError;
        },

        _isBlank: function (id) {
            var value = this.byId(id).getValue();
            return value === "" ? true : false
        },

        _setErrorState: function (id) {
            var oControl = this.byId(id);
            oControl.setValueState("Error");
            oControl.setValueStateText("Filed is mandatory");
        },

        _clearErrorState: function (id) {
            var oControl = this.byId(id);
            oControl.setValueState("None");
            oControl.setValueStateText("");
        },

        _onRouteMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var id = oArgs.id;
            //create
            if (id === undefined) {
                this._handleCreate();
            //edit or display
            } else {
                this._handleEditDisplay(id);
            }                 
        },        

        _discardDraft: function (oAction) {
            if (oAction === MessageBox.Action.CLOSE) { 
                return
            }

            var oContext = this.getView().getBindingContext();
            oContext.delete("$auto")
            .then(()=> {
                var deleteMessage = this._getDeleteMessage().deleteMessage;
                MessageToast.show(deleteMessage, {
                    closeOnBrowserNavigation: false
                });
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("List");                
            });
        },

        _handleCreate: function () {
            var oListBinding = this.getModel().bindList("/Orders");
            var oContext = oListBinding.create();
            oContext.created()
            .then(() => {
                this.getView().bindObject(oContext.getPath());
                this._attachPatchEvents();
                this._mode = 1;                
                this._setEditable(true);
            })
            .catch(error => {
                MessageBox.error(error.message, {});
            });
        },

        _handleEditDisplay: function (id) {
            var oModel = this.getModel();
            var oContextBinding = oModel.bindContext(`/Orders(ID=${id},IsActiveEntity=true)`);
            var oContext = oContextBinding.getBoundContext();
            oContext.requestProperty("HasDraftEntity")
            .then(hasDraft => {
                //bind context to the view
                this._bindContext(hasDraft, id, oContext);
                this._attachPatchEvents();
                this._getOrderId();

                if (hasDraft) {
                    //open in edit mode
                    this._mode = 2;
                    this._setEditable(true);
                } else {
                    //open in display mode
                    this._mode = 3;
                    this._setEditable(false);
                }
            })
            .catch(error => {
                console.log(error);
            });              
        },

        _getOrderId: function () {
            this.getView().getBindingContext().requestProperty("orderId")
            .then(orderId => {
                this._orderId = orderId;
            })
            .catch(error => {
                console.log(error);
            });
        },

        _setEditable(bEditable) {
            this.setProperty("viewModel", "editable", bEditable);
        },

        _attachPatchEvents: function () {
            this.getView().getObjectBinding().attachPatchSent(this._patchSent, this);
            this.getView().getObjectBinding().attachPatchCompleted(this._patchCompleted, this);
        },

        _patchSent: function (oEvent) {
            this.setProperty("viewModel", "savingStatus", "Saving draft …");
            this.setProperty("viewModel", "isStatusVisible", true);
        },

        _patchCompleted: function () {
            this.setProperty("viewModel", "savingStatus", "Draft saved");
            this.setProperty("viewModel", "isStatusVisible", true);

            //clear draft saving message after 1.5 seconds
            setTimeout(()=> {
                this.setProperty("viewModel", "savingStatus", "");
                this.setProperty("viewModel", "isStatusVisible", false);                
            }, 1500)
        },

        _bindContext: function (hasDraft, id, oContext) {
            //if draft exists, bind the draft version
            //else bind the active version
            var isActive = !hasDraft;
            this.getView().bindObject(`/Orders(ID=${id},IsActiveEntity=${isActive})`);
        },

        _createDraft: function () {
            return new Promise((resolve, reject) => {
                var oContext = this.getView().getObjectBinding().getBoundContext();
                var oModel = this.getModel();
                var oOperation = oModel.bindContext("OrderService.draftEdit(...)", oContext);
                oOperation.execute()
                .then(oUpdatedContext => {
                    this.getView().bindObject(oUpdatedContext.getPath());
                    resolve();
                })                      
                .catch(error => {
                    reject(error);
                }); 
            });
        },

        _getDeleteMessage: function (aContexts) {
            var oMessage = {
                confirmMessage: "",
                deleteMessage: "",
                buttonText: ""
            };
            switch (this._mode) {
                case 1: //create
                    oMessage.confirmMessage = `Discard this draft?`;
                    oMessage.deleteMessage = `Draft discarded`; 
                    oMessage.buttonText = `Discard`               
                    break;
                case 2: //edit
                    oMessage.confirmMessage = `Discard all changes?`;
                    oMessage.deleteMessage = `Changes discarded`;     
                    oMessage.buttonText = `Discard`           
                    break;

                case 3: //dispaly
                    oMessage.confirmMessage = `Delete order ${this._orderId}?`;
                    oMessage.deleteMessage = `Order ${this._orderId} has been deleted`;
                    oMessage.buttonText = `Delete`              
                    break;
            }
            return oMessage;
        } ,  

         // adding attachment code

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

			onRemovePressed: function (oEvent) {
				oEvent.preventDefault();
				oEvent.getParameter("item").getBindingContext().delete();	
				MessageToast.show("Selected file has been deleted");
			},

			onOpenPressed: function (oEvent) {
				oEvent.preventDefault();
				var item = oEvent.getSource();
				this._fileName = item.getFileName();
				var that = this;
				this._download(item)
					.then((blob) => {
						var url = window.URL.createObjectURL(blob);
//						window.open(url);	
						var link = document.createElement('a');
						link.href = url;
						link.setAttribute('download', that._fileName);
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);						
					})
					.catch((err)=> {
						console.log(err);
					});					
			},

			_download: function (item) {
				var settings = {
					url: item.getUrl(),
					method: "GET",
					headers: {
						"Content-type": "application/octet-stream"
					},
					xhrFields:{
						responseType: 'blob'
					}
				}	

				return new Promise((resolve, reject) => {
					$.ajax(settings)
					.done((result) => {
						resolve(result)
					})
					.fail((err) => {
						reject(err)
					})
				});						
			},

			_createEntity: function (item) {
					var data = {
						mediaType: item.getMediaType(),
						fileName: item.getFileName(),
						size: item.getFileObject().size
					};
	
					var settings = {
						url: "/odata/v4/order/Files",
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
				var url = `/odata/v4/order/Files(${id})/content`
				item.setUploadUrl(url);	
				var oUploadSet = this.byId("uploadSet");
				oUploadSet.setHttpRequestMethod("PUT")
				oUploadSet.uploadItem(item);
			},	
			
			//formatters
			formatThumbnailUrl: function (mediaType) {
				var iconUrl;
				switch (mediaType) {
					case "image/png":
						iconUrl = "sap-icon://card";
						break;
					case "text/plain":
						iconUrl = "sap-icon://document-text";
						break;
					case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
						iconUrl = "sap-icon://excel-attachment";
						break;
					case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
						iconUrl = "sap-icon://doc-attachment";
						break;
					case "application/pdf":
						iconUrl = "sap-icon://pdf-attachment";
						break;
					default:
						iconUrl = "sap-icon://attachment";
				}
				return iconUrl;
			}





         //emd of attach code








      //end of methods
    });
});
