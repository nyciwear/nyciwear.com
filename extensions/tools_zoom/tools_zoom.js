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



//	Intended as a free, open source alternative to 3rd party plugins like Magic Zoom Plus.
//	Utilizes the jQuery Zoom jQuery plugin: http://jacklmoore.com/zoom/
//	Utilizes the Lightbox 2 jQuery plugin: http://lokeshdhakar.com/projects/lightbox2/

var tools_zoom = function(_app) {
	var theseTemplates = new Array('');
	var r = {

////////////////////////////////////   CALLBACKS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	callbacks : {
		init : {
			onSuccess : function()	{
				var r = false; 

				_app.u.loadResourceFile(['script',0,'extensions/tools_zoom/zoom/js/jquery.zoom.min.js']);
				
				_app.u.loadResourceFile(['script',0,'extensions/tools_lightbox/lightbox/js/lightbox-2.6.min.js']);
				_app.u.loadResourceFile(['css',0,'extensions/tools_lightbox/lightbox/css/lightbox.css','css-lightbox']);
				
				r = true;

				return r;
				},
			onError : function()	{
				_app.u.dump('BEGIN tools_zoom.callbacks.init.onError');
				}
			}
		}, //callbacks 

////////////////////////////////////   ACTION    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

		a : {
			}, //Actions
////////////////////////////////////   RENDERFORMATS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

		renderFormats : {
		
/****************************************

A renderformat for creating a magnified image of a product, and the ability to switch an image out 
with thumbnails of up to 6 of it's alternate images. The images will be based on the product container
which renderformat element resides.

This renderformat is intended to be on a stand-alone element such as a div.
ex: 
<div data-bind="useParentData:true; format:imageZoom; extension:tools_zoom; isthumbs:1;" data-thumbclass='thumbCarousel' height='296' width='296' zheight='800' zwidth='800' theight='50' twidth='50'>

Do not specify a var, ALWAYS set useParentData to true.

bindData params:
required:
	none
optional:
	isthumbs - An indicator that thumbnail images should be created. 1 = true.
	bgcolor - A background color to be passed to the _app.u.makeImage call for all images.
	isElastic - An indicator that the renderformat will be run on elastic results. 1 = true.

data attributes:
required:
		none
optional:
	data-thumbclass - A class that will be added to the container that holds the thumbnails.
	data-zoomclass - Indicates that the zoomed image should be created in a separate container. 
					 It's value is added as a class to that container.
	data-zoomheader - A zoovy: attrib that can be used to put a header above the zoomed images	
					  if the zoomclass is used for a separate zoom container (usually prod_name).
	height - A height to be passed to the _app.u.makeImage call for the main, standard size image.
	width -	A width to be passed to the _app.u.makeImage call for the main, standard size image.
	theight - A height to be passed to the _app.u.makeImage call for the thumbnail image(s).
	twidth - A width to be passed to the _app.u.makeImage call for the thumbnail image(s).
	zheight - A height to be passed to the _app.u.makeImage call for the larger, zoom size image.
	zwidth - TA width to be passed to the _app.u.makeImage call for the larger, zoom size image.
	
!!This extension loads lightbox.js, but works independently of the lightbox extension. Lightbox can be used 
here, but if the lightbox extension is turned on for other uses, be sure to only load lightbox.js in one of
these extensions.
					 
****************************************/
		
			imagezoom : function($tag, data) {
//				_app.u.dump('data.value:'); _app.u.dump(data.value); _app.u.dump('thumbclass'); _app.u.dump($tag.data('thumbclass'));
				var pid = _app.u.makeSafeHTMLId(data.value.pid);
				
					//create containers & classes for images
				var $mainImageCont = $('<div class="mainImageCont_'+data.value.pid+'"></div>');
				
					//if the zoom will not be in the original image container, different properties are needed
				if($tag.data('zoomclass')) {
					var $zoomImageCont = $('<div class="displayNone '+$tag.data('zoomclass')+' '+$tag.data('zoomclass')+'_'+data.value.pid+'"></div>');
					var zoomImageClass = '.'+$tag.data('zoomclass')+'_'+data.value.pid;
					var seperateZoomIn = function() {$(zoomImageClass).show();};
					var seperateZoomOut = function() {$(zoomImageClass).hide();};
					$tag.append($mainImageCont).append($zoomImageCont);
					
						//check if there needs to be a header on the main image and add if sort
					if($tag.data('zoomheader')) {
						var header = data.bindData.isElastic ? data.value.$tag.data('zoomHeader') : data.value['%attribs']['zoovy:'+$tag.data('zoomheader')];
						var $zoomHeader = $('<span class="zoomHeader zoomHeader_'+pid+'">'+header+'</span>');
						$zoomImageCont.append($zoomHeader);
					}
				}
				else {
					var zoomImageClass = '.mainImageCont_'+data.value.pid;
					$tag.append($mainImageCont)
				}
				
				
				$mainImageCont = $('.mainImageCont_'+data.value.pid,$tag);
								
				
					//get bgcolor and image path, create main product image
				var bgcolor = data.bindData.bgcolor ? data.bindData.bgcolor : 'ffffff'
//				_app.u.dump('data.bindData'); _app.u.dump(data.bindData);
				var image = data.bindData.isElastic ? data.value.images[0] : data.value['%attribs']['zoovy:prod_image1'];
				var imageURL = _app.u.makeImage({
					"name" 	: image,
					"w" 	: $tag.attr('width'),
					"h" 	: $tag.attr('height'),
					"b" 	: bgcolor
				}); 
				
		//if image isn't found, hide it or there will be an empty element with a border. 
		//There may be a better was to do this (like stopping the rest of the function here so unecessary processing isn't done).
				if(imageURL.indexOf('imagenotfound') != -1) {$tag.hide();}
		
				$mainImageCont.append('<img src="'+imageURL+'" />');
					//if lightbox is being used at href to main image (main images based on thumbs are done later)
				if(data.bindData.hrefattr) {
					$tag.attr({'href':_app.u.makeImage({'name':image,'w':data.bindData.w,'h':data.bindData.h,'b':data.bindData.b}),'rel':'lightbox[prodPageMain_'+pid+']'})
				}
				
					//create zoom image
				var zoomURL = _app.u.makeImage({
					"name" 	: image,
					"w" 	: $tag.attr('zwidth'),
					"h" 	: $tag.attr('zheight'),
					"b"		: bgcolor
				});
				
				
					//enable zoom on main image, 
					//if a separate container is used for the zoom it is the target, 
					//and must be shown and hidden on mouseenter & mouseleave
				if($tag.data('zoomclass')) {
					$mainImageCont.zoom(
						{
							url			: zoomURL,
							on			: 'mouseover',
							duration	: 500,
							target		: zoomImageClass,
							onZoomIn	: seperateZoomIn,
							onZoomOut	: seperateZoomOut
						}
					);
				}
					//no separate container, no target or show/hide needed
				else {
					$mainImageCont.zoom(
						{
							url			: zoomURL,
							on			: 'mouseover',
							duration	: 500
						}
					);
				}
				
					//if isthumbs is set then add thumbnails, if not... don't.
					//if no prod_image2, likely there are no thumbnails, don't create the container
					//and fill it w/ a redundant image (may need a better check form the same image later).
				if(data.bindData.isthumbs == 1 && data.value['%attribs']['zoovy:prod_image2']) {
				
					var $thumbImageCont = ('<div class="thumbImageCont '+$tag.data('thumbclass')+'"></div>');
					$tag.after($thumbImageCont)
					$thumbImageCont = $('.thumbImageCont','#productTemplate_'+pid);
					
						//get product images, up to 6, and create thumbnails.
					var thumbName; //recycled in loop
					var tImages = ''; 
					for (var i = 1; i < 7; i +=1) {
						thumbName = data.value['%attribs']['zoovy:prod_image'+i];
						
						if(_app.u.isSet(thumbName)) {
//							_app.u.dump(" -> "+i+": "+thumbName);
								//make thumb and assign path as attr for use in swaping later
							if(!data.bindData.hrefattr) {	//if lightbox isn't being used make thumb container an empty div
								$thumbImageCont.append('<div><img src="'+_app.u.makeImage({'tag':0,'name':thumbName,'w':$tag.attr('twidth'),'h':$tag.attr('theight'),'b':bgcolor})+'" data-imgsrc="'+thumbName+'"/></div>');
							}
							else { //if lightbox is being used, make thumb container a anchor w/ lightbox attributes
								var thumbImgObj = {
									name : thumbName
									};
								if(data.bindData.w){ thumbImgObj.w = data.bindData.w; }
								if(data.bindData.h){ thumbImgObj.h = data.bindData.h; }
								if(data.bindData.b){ thumbImgObj.b = data.bindData.b; }
								
								var thumbHREF = _app.u.makeImage(thumbImgObj);
								$thumbImageCont.append('<a href="'+thumbHREF+'" rel="lightbox[prodPageThumb_'+pid+']"><img src="'+_app.u.makeImage({'tag':0,'name':thumbName,'w':$tag.attr('twidth'),'h':$tag.attr('theight'),'b':bgcolor})+'" data-imgsrc="'+thumbName+'"/></a>');
							}
						}
					}
					if(data.bindData.hrefattr) {
						var mainName = '';
						for(i=2;i<6;i++) {
							mainName = data.value['%attribs']['zoovy:prod_image'+i];
							if(_app.u.isSet(mainName)){
//								_app.u.dump("main name -> "+i+": "+mainName);
								var mainImgObj = {
								name : mainName
								};
								if(data.bindData.w){ mainImgObj.w = data.bindData.w; }
								if(data.bindData.h){ mainImgObj.h = data.bindData.h; }
								if(data.bindData.b){ mainImgObj.b = data.bindData.b; }
								
								var mainHREF = _app.u.makeImage(mainImgObj);
								$tag.append('<a class=displayNone href="'+mainHREF+'" rel="lightbox[prodPageMain_'+pid+']"><img src="'+mainHREF+'" /></a>');
							}
						}
					}
					
					
						//add mouseenter to each thumb to show it in the main image area
					$('img',$thumbImageCont).each(function() {
						$(this).on('mouseenter', function() {
							$mainImageCont.trigger('zoom.destroy');		//kill zoom on main image
							var newImage = $(this).attr('data-imgsrc');	//get path for thumb image
//							_app.u.dump('newImage');	_app.u.dump(newImage);			
								//change image source for main image
							 var newHREF = _app.u.makeImage({
								"name" 	: newImage,
								"w" 	: $tag.attr('width'),
								"h" 	: $tag.attr('height'),
								"b" 	: bgcolor
							});
							
							$('img:first-child',$mainImageCont).attr('src', newHREF);
						//	$tag.attr({'href':newHREF,'rel':'lightbox[prodPage_'+pid+']'});
								
								//make new zoom image
							var newImageURL = _app.u.makeImage({
								"name" 	: newImage,
								"w" 	: $tag.attr('zwidth'),
								"h" 	: $tag.attr('zheight'),
								"b" 	: bgcolor
							});
							
								//start zoom on main image again
							$mainImageCont.zoom(
								{
									url			: newImageURL,
									on			: 'mouseover',
									duration	: 500
								}
							);
						}); //mouseenter
					}); //thumbnails
				}

			} //imageZoom
		
		}, //renderFormats
////////////////////////////////////   UTIL [u]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

		u : {
			}, //u [utilities]			
////////////////////////////////////   APP EVENT [e]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\			

		e : {
			} //e [app Events]
		} //r object.
	return r;
	}