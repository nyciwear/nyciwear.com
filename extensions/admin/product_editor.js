/* **************************************************************

   Copyright 2011 Zoovy, Inc.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

************************************************************** */

/*
An extension for acquiring and displaying 'lists' of categories.
The functions here are designed to work with 'reasonable' size lists of categories.
*/



var admin_prodEdit = function() {
	var theseTemplates = new Array('productEditorTemplate','ProductCreateNewTemplate','productListTemplateTableResults','productListTableListTemplate','productListTemplateEditMe','productEditorPanelTemplate','mpControlSpec','productEditorPanelTemplate_general');
	var r = {

	vars : {
//when a panel is converted to app, add it here and add a template. 
		appPanels : ['general'] //a list of which panels do NOT use compatibility mode. used when loading panels. won't be needed when all app based.
		},



////////////////////////////////////   CALLBACKS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\



	callbacks : {
//executed when extension is loaded. should include any validation that needs to occur.
		init : {
			onSuccess : function()	{
				var r = true; //return false if extension won't load for some reason (account config, dependencies, etc).
				app.rq.push(['css',0,app.vars.baseURL+'extensions/admin/product_editor.css','product_editor_styles']);
				app.model.fetchNLoadTemplates(app.vars.baseURL+'extensions/admin/product_editor.html',theseTemplates);
//				window.savePanel = app.ext.admin.a.saveProductPanel; //for product editor. odd. this function doesn't exist. commented out by JT on 2012-11-27
				window.editProduct = app.ext.admin_prodEdit.a.showPanelsFor;
				return r;
				},
			onError : function()	{
//errors will get reported for this callback as part of the extensions loading.  This is here for extra error handling purposes.
//you may or may not need it.
				app.u.dump('BEGIN admin_orders.callbacks.init.onError');
				}
			},

		showMangementCats : {
			onSuccess : function(_rtag)	{
				$('#manCatsParent').show(); //make sure parent is visible. hidden by default in case there's no mancats
				$results = $(app.u.jqSelector('#',_rtag.targetID));
				var $a; //recycled.
//cats is an array of keys (management category names) used for sorting purposes.
//regular sort won't work because Bob comes before andy because of case. The function normalizes the case for sorting purposes, but the array retains case sensitivity.
				var cats = Object.keys(app.data[_rtag.datapointer]['%CATEGORIES']).sort(function (a, b) {return a.toLowerCase().localeCompare(b.toLowerCase());});
//				app.u.dump(cats);
				for(index in cats)	{
					$a = $("<a \/>").attr('data-management-category',cats[index]).html("<span class='ui-icon ui-icon-folder-collapsed floatLeft'></span> "+(cats[index] || 'uncategorized'));
//In the app framework, it's not real practical to load several hundred product into memory at one time.
//so the list is opened in the main product area in a multipage format.
						$a.click(function(){
							var $ul = $("<ul \/>").attr({'id':'manageCatProdlist','data-management-category':$(this).data('management-category')});
							var $target = $('#productTabMainContent').empty().append($ul);
//convert to array and clean up extra comma's, blanks, etc.
//also, sort alphabetically.
							var csv = app.ext.store_prodlist.u.cleanUpProductList(app.data.adminProductManagementCategoryList['%CATEGORIES'][$(this).data('management-category')]).sort(); 
							app.ext.store_prodlist.u.buildProductList({
								'csv': csv,
								'parentID':'manageCatProdlist',
								'loadsTemplate' : 'productListTableListTemplate',
								'items_per_page' : 100
								},$ul);
							});
					$a.wrap("<li>");
					$results.append($a);
					}
				}
			}, //showManagementCats

//executed after the list of panels for a given product are received (in the product editor).
//Uses local storage to determine which panels to open and retrieve content for.
//panelData is an object with panel ids as keys and value TFU for whether or not so load/show the panel content.
		loadAndShowPanels :	{
			onSuccess : function(_rtag)	{
				app.u.dump("BEGIN admin_prodEdit.callbacks.loadAndShowPanels");
//the device preferences are how panels are open/closed by default.
				var settings = app.ext.admin.u.devicePreferencesGet('admin_prodEdit');
				settings = $.extend(true,settings,{"openPanel":{"general":true}}); //make sure panel object exits. general panel is always open.

				var pid = app.data[_rtag.datapointer].pid;
				var $target = $('#productTabMainContent');
				$target.empty(); //removes loadingBG div and any leftovers.
				var L = app.data[_rtag.datapointer]['@PANELS'].length;
				var panelid; //recycled. shortcut to keep code cleaner.
				
				for(var i = 0; i < L; i += 1)	{
					panelid = app.data[_rtag.datapointer]['@PANELS'][i].id;
//					app.u.dump(" -> panelid: "+panelid);
					if(app.ext.admin_prodEdit.vars.appPanels.indexOf(panelid) > -1)	{
						$target.append(app.ext.admin_prodEdit.u.getPanelContents(pid,panelid));
						} //this/these panels are now all app-based.
					else	{
					//pid is assigned to the panel so a given panel can easily detect (data-pid) what pid to update on save.
						$target.append(app.renderFunctions.transmogrify({'id':'panel_'+panelid,'panelid':panelid,'pid':pid},'productEditorPanelTemplate',app.data[_rtag.datapointer]['@PANELS'][i]));
						}
					if(settings && settings.openPanel[panelid])	{
						$('.panelHeader','#panel_'+panelid).click(); //open panel. This function also adds the dispatch.
						}
					}
				app.ext.admin.u.devicePreferencesSet('admin_prodEdit',settings); //update the localStorage session var.
				}
			}
		}, //callbacks




////////////////////////////////////   ACTION    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	a : {

		showCreateProductDialog : function(){
			var $modal = $('#createProductDialog');
			if($modal.length < 1)	{
				$modal = $("<div>").attr({'id':'createProductDialog','title':'Create a New Product'});
				$modal.appendTo('body');
				$modal.dialog({width:500,height:500,modal:true,autoOpen:false});
				}
			$modal.empty().append(app.renderFunctions.createTemplateInstance('ProductCreateNewTemplate'))
			$modal.dialog('open');
			}, //showCreateProductDialog

//t is 'this' passed in from the h3 that contains the icon and link.
//run when a panel header is clicked. a 'click' may be triggered by the app when the list of panels appears.
		handlePanel : function(t)	{
			app.u.dump("BEGIN admin_prodEdit.a.handlePanel");
			
			var $header = $(t),
			$panel = $('.panelContents',$header.parent()),
			pid = $panel.data('pid'),
			panelid = $header.parent().data('panelid'),
			settings = app.ext.admin.u.devicePreferencesGet('admin_prodEdit');
			
			app.u.dump(" -> panelid: "+panelid);
			
			settings = $.extend(true,settings,{"openPanel":{"general":true}}); //make sure panel object exits. general panel is always open.			
			$panel.toggle(); //will close an already opened panel or open a closed. the visibility state is used to determine what action to take.
			app.u.dump(" -> $panel.is(:visible): "+$panel.is(":visible"));
			if($panel.is(":visible"))	{
				settings.openPanel[panelid] = true;
				$header.addClass('ui-accordion-header-active ui-state-active').removeClass('ui-corner-bottom');
				$('.ui-icon-circle-arrow-e',$header).removeClass('ui-icon-circle-arrow-e').addClass('ui-icon-circle-arrow-s');
//panel contents generated already. just open. form and fieldset generated automatically, so check children of fieldset not the panel itself.
				if($('fieldset',$panel).children().length > 0)	{} 
//default to getting the contents. better to take an API hit then to somehow accidentally load a blank panel.
				else if(app.ext.admin_prodEdit.vars.appPanels.indexOf(panelid) > -1)	{
//panel is app based, do nothing extra.
					}
				else	{
					app.ext.admin.calls.adminUIProductPanelExecute.init({'pid':$('#panel_'+panelid).data('pid'),'sub':'LOAD','panel':panelid},{'callback':'showDataHTML','extension':'admin','targetID':'panelContents_'+app.u.makeSafeHTMLId(panelid)},'mutable');
					app.model.dispatchThis('mutable');
					}
				}
			else	{
				settings.openPanel[panelid] = false;
				$header.removeClass('ui-accordion-header-active ui-state-active').addClass('ui-corner-bottom');
				$('.ui-icon-circle-arrow-s',$header).removeClass('ui-icon-circle-arrow-s').addClass('ui-icon-circle-arrow-e')
				}

			app.ext.admin.u.devicePreferencesSet('admin_prodEdit',settings); //update the localStorage session var.
			},


//t = this, which is the a tag, not the li. don't link the li or the onCLick will get triggered when the children list items are clicked too, which would be bad.
		toggleManagementCat : function(t,manCatID){
			var $parent = $(t).parent(); //used to append the new UL to.
			
			var targetID = 'manCats_'+app.u.makeSafeHTMLId(manCatID);
			var $target = $(app.u.jqSelector('#',targetID));
//if target already exists on the DOM, then this category has been opened previously. The target is the UL containing the product list.
			if($target.length)	{
				$target.toggle();
				}
			else	{
				$target = $("<ul \/>").attr('id',targetID).appendTo($parent);
//for a full list of what vars can/should be set in buildProductList, see store_prodlist.u.setProdlistVars
				app.ext.store_prodlist.u.buildProductList({
					'csv': app.data.adminProductManagementCategoryList['%CATEGORIES'][manCatID],
					'hide_summary': true,
					'parentID':targetID,
					'loadsTemplate' : 'productListTemplateEditMe',
					'items_per_page' : 100
					},$target);
				}
			}, //toggleManagementCat
			
			
//used for saving compatibility mode panels. app panels will have a ui-action
		saveProductPanel : function(t,panelid,SUB){
			var $form = $(t).closest("form");
			var $fieldset = $('fieldset',$form); // a var because its used/modified more than once.
			var formObj = $form.serializeJSON();

			//if pid is set as a input in the original form, use it. Otherwise, look for it in data on the container.
			formObj.pid = formObj.pid || $form.closest('[data-pid]').attr('data-pid');
			
			formObj['sub'] = (SUB) ? SUB : 'SAVE';
			formObj.panel = panelid;

			if(formObj.pid)	{
				// fieldset is where data is going to get added, so it gets the loading class.
				// be sure do this empty AFTER the form serialization occurs.
				$fieldset.empty().addClass('loadingBG');
				app.ext.admin.calls.adminUIProductPanelExecute.init(
					formObj,
					{'callback':'showDataHTML','extension':'admin','targetID':$fieldset.attr('id')}
					,'immutable');
				app.model.dispatchThis('immutable');
				}
			else	{
				app.u.throwMessage("Uh oh. an error occured. could not determine what product to update.");
				}
			}, //saveProductPanel


//call executed to open the editor for a given pid.
//legacy call for panel list is needed (for now). productGet is used for panels as they're upgraded to full-app 
		showPanelsFor : function(pid)	{
			$('#productTabMainContent').empty().append("<div class='loadingBG'></div>");
			var numRequests = 0,
			callback = {'callback':'loadAndShowPanels','extension':'admin_prodEdit','datapointer':'adminUIProductPanelList|'+pid};
//the data for BOTH these requests is needed before the panel list can correctly load.
			app.model.destroy('appProductGet|'+pid); //make sure product data is up to date. once the global timestamp is employed, this won't be necessary. ###
			numRequests += app.calls.appProductGet.init({'pid':pid,'withInventory':true,'withVariations':true},{},'mutable'); //get into memory for app-based panels.
			numRequests += app.ext.admin.calls.adminUIProductPanelList.init(pid,{},'mutable');
			if(numRequests)	{
				app.calls.ping.init(callback);
				app.model.dispatchThis();
				}
			else	{
				app.u.handleCallback(callback);
				}
			
			}
		
		},

////////////////////////////////////   RENDERFORMATS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	renderFormats : {},


////////////////////////////////////   UTIL [u]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


		u : {

//app.ext.admin_prodEdit.u.getPanelContents(pid,panelid)
			getPanelContents : function(pid,panelid)	{
				var r;  //what is returned. Either a jquery object of the panel contents OR false, if not all required params are passed.
				if(pid && panelid)	{
					r = app.renderFunctions.transmogrify({'id':'panel_'+panelid,'panelid':panelid,'pid':pid},'productEditorPanelTemplate_'+panelid,app.data['appProductGet|'+pid]);
					app.ext.admin.u.handleUIActions(r);
					}
				else	{
					r = false;
					app.u.throwGMessage("In admin_prodEdit.a.showAppPanel, no panelid specified.");
					}
				return r;
				}, //getPanelContents


			showProductEditor : function(path,P)	{
			app.u.dump("BEGIN admin_prodEdit.u.showProductEditor ["+path+"]");
//			app.u.dump(" -> P: "); app.u.dump(P);
			
			window.savePanel = app.ext.admin_prodEdit.a.saveProductPanel;  
			//always rewrite savePanel. another 'tab' may change the function.
			//kill any calls in progress so that if setup then product tabs are clicked quickly, setup doesn't get loaded.

			if(!$.isEmptyObject(app.ext.admin.vars.uiRequest))	{
				app.u.dump("request in progress. Aborting.");
				app.ext.admin.vars.uiRequest.abort(); //kill any exists requests. The nature of these calls is one at a time.
				}

//add product page template if not already set.
			if(!$('#productEditorTemplate').length)	{
				$(app.u.jqSelector('#',P.targetID)).empty().append(
					app.renderFunctions.createTemplateInstance('productEditorTemplate')
					);
//get and display the list of product management categories.				
				app.ext.admin.calls.adminProductManagementCategoryList.init(
					{'callback':'showMangementCats','extension':'admin_prodEdit','targetID':'manCats'},
					'mutable');
				app.model.dispatchThis('mutable');


//add click actions to the list of tags. Once clicked, a search result for that tag will get displayed in the main edit area.
				$('.tagFilterList li','#prodLeftCol').each(function(){
					$(this).addClass('lookLikeLink').click(function(){
						app.ext.admin_prodEdit.u.prepContentArea4Results();
						var tag = $(this).text();
						app.ext.store_search.calls.appPublicProductSearch.init({"size":"50","mode":"elastic-native","filter":{"term":{"tags":tag}}},{'datapointer':'appPublicSearch|'+tag,'templateID':'productListTemplateTableResults','callback':'handleElasticResults','extension':'store_search','parentID':'prodEditorResultsTable'});
						app.model.dispatchThis('mutable');
						})
					})

//add click actions to the syndication list items. Once clicked, a search result for that tag will get displayed in the main edit area.
				$('.mktFilterList li','#prodLeftCol').each(function(){
					$(this).addClass('lookLikeLink').click(function(){
						app.ext.admin_prodEdit.u.prepContentArea4Results();
						var mktid = $(this).data('mktid')+'_on';
						app.ext.store_search.calls.appPublicProductSearch.init({"size":"50","mode":"elastic-native","filter":{"term":{"marketplaces":mktid}}},{'datapointer':'appPublicSearch|'+mktid,'templateID':'productListTemplateTableResults','callback':'handleElasticResults','extension':'store_search','parentID':'prodEditorResultsTable'});
						app.model.dispatchThis('mutable');
						})
					})
				}
			else	{
				//product editor is already on the dom. Right now, only one instance of the editor can be created at a time.
				}
			
			if(P.pid)	{app.ext.admin_prodEdit.a.showPanelsFor(P.pid)} //if a pid is specified, immediately show the editor for that pid.
			else if(!path || path == '/biz/product/index.cgi' || path == '/biz/product/edit.cgi?VERB=WELCOME')	{
				//do nothing. product page template has initial load content.
				}
			else	{
				P.targetID = "productTabMainContent";
				$(app.u.jqSelector('#',P.targetID)).empty().showLoading();
				app.model.fetchAdminResource(path,P);
				}
			}, //showProductTab 


		handleCreateNewProduct : function(P)	{
			var pid = P.pid;
			delete P.pid;
//				app.u.dump("Here comes the P ["+pid+"]: "); app.u.dump(P);
			app.ext.admin.calls.adminProductCreate.init(pid,P,{'callback':'showMessaging','message':'Created!','parentID':'prodCreateMessaging'});
			app.model.dispatchThis('immutable');
			},
//clears existing content and creates the table for the search results. Should be used any time an elastic result set is going to be loaded into the product content area WITH a table as parent.
		prepContentArea4Results : function(){
			$("#productTabMainContent").empty().append($("<table>").attr('id','prodEditorResultsTable').addClass('loadingBG'));
			},
		
		
		handleProductKeywordSearch : function(obj)	{
			if(obj && obj.KEYWORDS)	{
				app.ext.admin_prodEdit.u.prepContentArea4Results();
				app.ext.store_search.u.handleElasticSimpleQuery(obj.KEYWORDS,{'callback':'handleElasticResults','extension':'store_search','templateID':'productListTemplateTableResults','parentID':'prodEditorResultsTable'});
				app.model.dispatchThis();
				}
			else	{
				//keywords are required.
				app.u.dump("Oops. no keywords specified.");
				}
			}

		}, //u


		uiActions : {

			"serializeAndAdminProductUpdate" : function($t)	{
//				app.u.dump("BEGIN admin_prodEdit.uiActions.serializeAndAdminProductUpdate");
				$t.button();

				$t.off('click.serializeAndAdminProductUpdate').on('click.serializeAndAdminProductUpdate',function(event){
					event.preventDefault();
					var $btn = $(this),
					pid = $btn.closest("[data-pid]").data('pid'),
					$panel = $btn.closest("[data-panelid]")
					panelid = $panel.data('panelid'),
					formJSON = $btn.parents('form').serializeJSON();
					
//					app.u.dump(" -> pid: "+pid);
//					app.u.dump(" -> panelid: "+panelid);
//					app.u.dump(" -> formJSON: "); app.u.dump(formJSON);
					
					if(pid && panelid && !$.isEmptyObject(formJSON))	{
						$panel.showLoading();
						app.ext.admin.calls.adminProductUpdate.init(pid,formJSON,{});
						app.model.destroy('appProductGet|'+pid);
						app.calls.appProductGet.init({'pid':pid,'withInventory':true,'withVariations':true},{'callback':function(responseData){
							if(app.model.responseHasErrors(responseData)){
								app.u.throwMessage(responseData);
								}
							else	{
								$panel.replaceWith(app.ext.admin_prodEdit.u.getPanelContents(pid,panelid));
								$panel.hideLoading();
								$('.panelHeader',$panel).click();
								}
							}},'immutable');
						app.model.dispatchThis('immutable');
						}
					else	{
						app.u.throwGMessage("In productEdit.u.uiActions, unable to determine pid ["+pid+"] and/or panelid ["+panelid+"] and/or formJSON is empty (see console)");
						app.u.dump(formJSON);
						}
					});
				}
			
			}
		
		} //r object.
	return r;
	}