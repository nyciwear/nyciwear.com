/* **************************************************************

   Copyright 2013 Zoovy, Inc.

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





var store_acct_create = function(_app) {
	var theseTemplates = new Array('');
	var r = {
	
////////////////////////////////////   CALLS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	
	calls : {
	
		appBuyerCreate : {
			init : function(obj,_tag)	{
				this.dispatch(obj,_tag);
				return 1;
			},
			dispatch : function(obj,_tag){
				obj._tag = _tag || {};
				obj._cmd = "appBuyerCreate";
				_app.model.addDispatchToQ(obj,'immutable');
			}
		}, //appBuyerCreate
		
	}, //calls


////////////////////////////////////   CALLBACKS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\



	callbacks : {
//executed when extension is loaded. should include any validation that needs to occur.
		init : {
			onSuccess : function()	{
				var r = false; //return false if extension won't load for some reason (account config, dependencies, etc).

				//if there is any functionality required for this extension to load, put it here. such as a check for async google, the FB object, etc. return false if dependencies are not present. don't check for other extensions.

				_app.rq.push(["templateFunction","customerTemplate","onCompletes",function(infoObj){
					var $context = $(_app.u.jqSelector('#',infoObj.parentID));
					var $sideline = $('.customerSideline', $context);
					var $customerMainCol = $('.customerMainCol', $context);
					if(infoObj.show == "createaccount"){
						$sideline.hide();
						$customerMainCol.css('width','100%')
					}
					else {
						$sideline.show();
						$customerMainCol.css('width','75%');
					}
				}]);

				r = true;

				return r;
				},
			onError : function()	{
//errors will get reported for this callback as part of the extensions loading.  This is here for extra error handling purposes.
//you may or may not need it.
				_app.u.dump('BEGIN store_acct_create.callbacks.init.onError');
				}
			},
			
			
			startExtension : {
				onSuccess : function() {
					_app.templates.customerTemplate.on('complete.store_accountcreate',function(event,$context,infoObj) {
						var $sideline = $('.customerSideline', $context);
						var $customerMainCol = $('.customerMainCol', $context);
						if(infoObj.show == "createaccount"){
							$sideline.hide();
							$customerMainCol.css('width','100%')
						}
						else {
							$sideline.show();
							$customerMainCol.css('width','75%');
						}
					});
				},
				onError : function() {
					_app.u.dump('START store_acct_create.callbacks.startExtension.onError');
				}
			},
			
		}, //callbacks



////////////////////////////////////   ACTION    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//actions are functions triggered by a user interaction, such as a click/tap.
//these are going the way of the do do, in favor of _app events. new extensions should have few (if any) actions.
		a : {
		
			togglerecover : function($tag) {
				dump('Retrieve password toggled');
				$("[data-slide='toggle']",$tag.parent()).slideToggle();
			}

		}, //Actions

////////////////////////////////////   RENDERFORMATS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//renderFormats are what is used to actually output data.
//on a data-bind, format: is equal to a renderformat. extension: tells the rendering engine where to look for the renderFormat.
//that way, two render formats named the same (but in different extensions) don't overwrite each other.
		renderFormats : {

			}, //renderFormats
////////////////////////////////////   UTIL [u]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//utilities are typically functions that are exected by an event or action.
//any functions that are recycled should be here.
		u : {
		
			handleAppLoginCreate : function($form)	{
				if($form)	{
					var formObj = $form.serializeJSON();
		//			_app.u.dump('--> Form Object'); _app.u.dump(formObj); 			
					if(formObj.pass !== formObj.pass2) {
						_app.u.throwMessage('Sorry, your passwords do not match! Please re-enter your password');
						return;
					}
					
					var tagObj = {
						'callback':function(rd) {
							if(_app.model.responseHasErrors(rd)) {
								$form.anymessage({'message':rd});
							}
							else {
								showContent('customer',{'show':'myaccount'});
								_app.u.throwMessage(_app.u.successMsgObject("Your account has been created! You may now log-in"));
							}
						}
					}
					
					formObj._vendor = "nyciwear";
					_app.ext.store_acct_create.calls.appBuyerCreate.init(formObj,tagObj,'immutable');				
					_app.model.dispatchThis('immutable');
				}
				else {
					$('#globalMessaging').anymessage({'message':'$form not passed into store_acct_create.u.handleAppLoginCreate','gMessage':true});
				}
			},
		
		}, //u [utilities]

//app-events are added to an element through data-app-event="extensionName|functionName"
//right now, these are not fully supported, but they will be going forward. 
//they're used heavily in the admin.html file.
//while no naming convention is stricly forced, 
//when adding an event, be sure to do off('click.appEventName') and then on('click.appEventName') to ensure the same event is not double-added if app events were to get run again over the same template.
		e : {
		
			//showContent at end was necessary to show login success container on second login form, all else is same as form in quickstart.
			accountLoginSubmit : function($ele,p)	{
				p.preventDefault();
				if(_app.u.validateForm($ele))	{
					var sfo = $ele.serializeJSON();
					_app.ext.cco.calls.cartSet.init({"bill/email":sfo.login,"_cartid":_app.model.fetchCartID()}) //whether the login succeeds or not, set bill/email in the cart.
					sfo._cmd = "appBuyerLogin";
					sfo.method = 'unsecure';
					sfo._tag = {"datapointer":"appBuyerLogin",'callback':'authenticateBuyer','extension':'quickstart'}
					_app.model.addDispatchToQ(sfo,"immutable");
					_app.calls.refreshCart.init({},'immutable'); //cart needs to be updated as part of authentication process.
					_app.model.dispatchThis('immutable');
					showContent('customer',{'show':'myaccount'})
				}
				else	{} //validateForm will handle the error display.
			}
			
			} //e [app Events]
		} //r object.
	return r;
	}