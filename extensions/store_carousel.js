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





var store_carousel = function(_app) {
	var theseTemplates = new Array('');
	var r = {


////////////////////////////////////   CALLBACKS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\



	callbacks : {
//executed when extension is loaded. should include any validation that needs to occur.
		init : {
			onSuccess : function()	{
				var r = false; //return false if extension won't load for some reason (account config, dependencies, etc).
				
				//if there is any functionality required for this extension to load, put it here. such as a check for async google, the FB object, etc. return false if dependencies are not present. don't check for other extensions.
				r = true;

				return r;
				},
			onError : function()	{
//errors will get reported for this callback as part of the extensions loading.  This is here for extra error handling purposes.
//you may or may not need it.
				_app.u.dump('BEGIN admin_orders.callbacks.init.onError');
				}
			},
			
			startExtension : {
				onSuccess : function() {
					_app.u.dump('_app.ext.store_carousel.callbacks.startExtension started');
										
					_app.templates.homepageTemplate.on('complete.store_nyci',function(event,$context,infoObj) {
						_app.ext.store_carousel.u.runHomeBannerCarousel($context);
						_app.ext.store_carousel.u.runSideBannerCarousel($context);
						_app.ext.store_carousel.u.runHomeBestSellerCarousel($context);
					});
					
					_app.templates.productTemplate.on('complete.store_nyci',function(event,$context,infoObj) {
						_app.ext.store_carousel.u.runProdPageRelatedCarCarousel($context);
					});
				},
				onError : function (){
					_app.u.dump('BEGIN _app.ext.store_recently_viewed.callbacks.startExtension.onError');
				}
			}
		}, //callbacks



////////////////////////////////////   ACTION    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//actions are functions triggered by a user interaction, such as a click/tap.
//these are going the way of the do do, in favor of app events. new extensions should have few (if any) actions.
		a : {

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
			
			runHomeBannerCarousel : function($context) {
				var $target = $('.mainBanner',$context);
				if($target.data('isCarousel')) {} //only make it a carousel once.
				else {
					$target.data('isCarousel',true);
					//for whatever reason, caroufredsel needs to be executed after a moment.
					setTimeout(function(){
						$target.carouFredSel({
							width		: '99%',
							height		: 'variable',
							responsive	: true,
							items		: 
							{
								width	: 691,
								height	: '100%',
								minimum : 1,
								visible	: 1
							},
							auto		: 
							{
								pauseOnHover	: 'immediate'
							},
							prev		: '.caroPrev1',
							next		: '.caroNext1',
							pagination	: '.mainBannerPagination',
							swipe: {
								onMouse	: true,
								onTouch	: true
							}
						});
					},2000);
				}
			},
			
			runSideBannerCarousel : function($context) {
				var $target = $('.sideBanner',$context);
				if($target.data('isCarousel')) {} //only make it a carousel once.
				else {
					$target.data('isCarousel',true);
					//for whatever reason, caroufredsel needs to be executed after a moment.
					setTimeout(function(){
						$target.carouFredSel({
							width		: '99%',
							height		: '550px',
							responsive	: true,
							scroll		: 
							{
								fx		: 'fade',
								easing	: 'quadratic',
								duration: 2000
							},
							items		: 
							{
								minimum : 1,
								visible	: 1
							},
							auto		: //false,
							{
								pauseOnHover	: 'immediate'
							},
							prev		: '.sideBannerPrev',
							next		: '.sideBannerNext',
							swipe: {
								onMouse	: true,
								onTouch	: true
							}
						});
					},2000);
				}
			},
			
			runHomeBestSellerCarousel : function($context) {
				var $target = $('.bestSellerCar',$context);
				if($target.data('isCarousel')) {} //only make it a carousel once.
				else {
					$target.data('isCarousel',true);
					//for whatever reason, caroufredsel needs to be executed after a moment.
					setTimeout(function(){
						$target.carouFredSel({
							width		: '99%',
					//		height		: 'auto',
					//		responsive	: true,
					//		items		: 
					//		{
					//			width	: 150,
					//			minimum : 1
						//		visible	: 5
					//		},
							auto		: false,
						//	{
						//		pauseOnHover	: 'immediate'
						//	},
							prev		: '.bestPrev',
							next		: '.bestNext',
							pagination	: '.bestBannerPagination',
							swipe: {
								onMouse	: true,
								onTouch	: true
							}
						});
					},2000);
				}
			},
			
			runProdPageRelatedCarCarousel : function($context) {
				var $target = $('.prodPageRelatedCar',$context);
				if($target.data('isCarousel')) {} //only make it a carousel once.
				else {
					$target.data('isCarousel',true);
					//for whatever reason, caroufredsel needs to be executed after a moment.
					setTimeout(function(){
						$target.carouFredSel({
							width		: '99%',
					//		responsive	: true,
					//		items		: 
					//		{
					//			minimum : 1,
					//			visible	: 5
					//		},
							auto		: 
							{
								pauseOnHover	: 'immediate'
							},
							prev		: '.prodlistRelatedPrev',
							next		: '.prodlistRelatedNext',
							pagination	: '.prodlistRelatedPagination',
							swipe: {
								onMouse	: true,
								onTouch	: true
							}
						});
					},2000);
				}
			},
		
		}, //u [utilities]

//app-events are added to an element through data-app-event="extensionName|functionName"
//right now, these are not fully supported, but they will be going forward. 
//they're used heavily in the admin.html file.
//while no naming convention is stricly forced, 
//when adding an event, be sure to do off('click.appEventName') and then on('click.appEventName') to ensure the same event is not double-added if app events were to get run again over the same template.
		e : {
			} //e [app Events]
		} //r object.
	return r;
	}