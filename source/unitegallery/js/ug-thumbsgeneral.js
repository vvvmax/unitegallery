
function UGThumbsGeneral(){
	
	var t = this, g_objThis = jQuery(t);
	
	var g_gallery = new UniteGalleryMain(), g_objGallery, g_objects, g_objWrapper; 
	var g_arrItems, g_objStrip, g_objParent;
	var g_functions = new UGFunctions();
	var g_strip;
	var outer_options;
	
	this.type = {
			GET_THUMBS_ALL: "all",
			GET_THUMBS_RATIO: "ratio",
			GET_THUMBS_NO_RATIO: "no_ratio",
			GET_THUMBS_NEW:"new"
	};
	
	this.events = {		
		SETOVERSTYLE: "thumbmouseover",
		SETNORMALSTYLE: "thumbmouseout",
		SETSELECTEDSTYLE: "thumbsetselected",
		
		PLACEIMAGE: "thumbplaceimage",
		AFTERPLACEIMAGE: "thumb_after_place_image",
		IMAGELOADERROR: "thumbimageloaderror",
		THUMB_IMAGE_LOADED: "thumb_image_loaded"
	};
	
	var g_options = {
			thumb_width:88,								//thumb width
			thumb_height:50,							//thumb height
			thumb_fixed_size: true,						//true,false - fixed/dynamic thumbnail width
			thumb_resize_by: "height",					//set resize by width or height of the image in case of non fixed size, 
			
			thumb_border_effect:true,					//true, false - specify if the thumb has border
			thumb_border_width: 0,						//thumb border width
			thumb_border_color: "#000000",				//thumb border color
			thumb_over_border_width: 0,					//thumb border width in mouseover state
			thumb_over_border_color: "#d9d9d9",			//thumb border color in mouseover state
			thumb_selected_border_width: 1,				//thumb width in selected state
			thumb_selected_border_color: "#d9d9d9",		//thumb border color in selected state
			
			thumb_round_corners_radius:0,				//thumb border radius
			
			thumb_color_overlay_effect: true,			//true,false - thumb color overlay effect, release the overlay on mouseover and selected states
			thumb_overlay_color: "#000000",				//thumb overlay color
			thumb_overlay_opacity: 0.4,					//thumb overlay color opacity
			thumb_overlay_reverse:false,				//true,false - reverse the overlay, will be shown on selected state only
			
			thumb_image_overlay_effect: false,			//true,false - images orverlay effect on normal state only
			thumb_image_overlay_type: "bw",				//bw , blur, sepia - the type of image effect overlay, black and white, sepia and blur.
			
			thumb_transition_duration: 200,				//thumb effect transition duration
			thumb_transition_easing: "easeOutQuad",		//thumb effect transition easing
			
			thumb_show_loader: true,					//show thumb loader while loading the thumb
			thumb_loader_type: "dark",					//dark, light - thumb loader type
			
			thumb_wrapper_as_link: false,				//set thumb as link
			thumb_link_newpage: false					//set the link to open newpage
		}
	
		var g_temp = {
			touchEnabled: false,
			num_thumbs_checking:0,
			customThumbs:false,
			funcSetCustomThumbHtml:null,
			isEffectBorder: false,
			isEffectOverlay: false,
			isEffectImage: false,
			colorOverlayOpacity: 1,
			thumbInnerReduce: 0,
			allowOnResize: true,		//allow onresize event
			classNewThumb: "ug-new-thumb"
		};
		
	
		var g_serviceParams = {			//service variables	
			timeout_thumb_check:100,
			thumb_max_check_times:600,	//60 seconds
			eventSizeChange: "thumb_size_change"
		};

		/**
		 * init the thumbs object
		 */
		this.init = function(gallery, customOptions){
			g_objects = gallery.getObjects();
			g_gallery = gallery;
			g_objGallery = jQuery(gallery);
			g_objWrapper = g_objects.g_objWrapper;
			g_arrItems = g_objects.g_arrItems;

			g_options = jQuery.extend(g_options, customOptions);

			//set effects vars:
			g_temp.isEffectBorder = g_options.thumb_border_effect;
			g_temp.isEffectOverlay = g_options.thumb_color_overlay_effect;
			g_temp.isEffectImage = g_options.thumb_image_overlay_effect;
		
		}
		
		this._____________EXTERNAL_SETTERS__________ = function(){};
		
		
		/**
		 * append html from item
		 */
		function appendHtmlThumbFromItem(itemIndex, imageEffectClass){
			
			var objItem = g_arrItems[itemIndex];
			 
			 var classAddition = "";
			 if(g_temp.customThumbs == false)
				 classAddition = " ug-thumb-generated";
			
			var zIndex = objItem.index + 1;
			var thumbStyle = "style='z-index:"+zIndex+";'";
			
		 	var htmlThumb = "<div class='ug-thumb-wrapper"+classAddition+"' " + thumbStyle + "></div>";

			 if(g_options.thumb_wrapper_as_link == true){
				 var urlLink = objItem.link;
				 if(objItem.link == "")
					 urlLink = "javascript:void(0)";
				
				 var linkTarget = "";
					if(g_options.thumb_link_newpage == true && objItem.link)
						linkTarget = " target='_blank'";
				 
				 var htmlThumb = "<a href='" + urlLink + "'"+linkTarget+" class='ug-thumb-wrapper"+classAddition+"'></a>";
			 }
			 
			 var objThumbWrapper = jQuery(htmlThumb);
			 
			 var objImage = objItem.objThumbImage;
			
			 if(g_temp.customThumbs == false){
				 
				 if(g_options.thumb_show_loader == true && objImage){
					 
					 var loaderClass = "ug-thumb-loader-dark";
					 if(g_options.thumb_loader_type == "bright")
						 loaderClass = "ug-thumb-loader-bright";
					 
					 objThumbWrapper.append("<div class='ug-thumb-loader " + loaderClass + "'></div>");
					 objThumbWrapper.append("<div class='ug-thumb-error' style='display:none'></div>");
				 }
				 					 
				 if(objImage){
					 objImage.addClass("ug-thumb-image");
					 
					 //if image overlay effects active, clone the image, and set the effects class on it
					 if(g_options.thumb_image_overlay_effect == true){
						var objImageOverlay = objImage.clone().appendTo(objThumbWrapper);
						
						objImageOverlay.addClass("ug-thumb-image-overlay " + imageEffectClass).removeClass("ug-thumb-image");
						objImageOverlay.fadeTo(0,0);
						objItem.objImageOverlay = objImageOverlay;
					 }
							 
					 objThumbWrapper.append(objImage);
				 }
				 
			 }//end if not custom thumb
			 
			 if(g_temp.isEffectBorder)
				 objThumbWrapper.append("<div class='ug-thumb-border-overlay'></div>");
			 
			 if(g_temp.isEffectOverlay)
				 objThumbWrapper.append("<div class='ug-thumb-overlay'></div>");
			 
			 g_objParent.append(objThumbWrapper);

			 //only custom thumbs function
			 if(g_temp.customThumbs){
				 
				 g_temp.funcSetCustomThumbHtml(objThumbWrapper, objItem);
				 
			 }
			 
			 //add thumb wrapper object to items array
			 g_arrItems[itemIndex].objThumbWrapper = objThumbWrapper;
			
			 return(objThumbWrapper);
		}
		
		
		/**
		 * append the thumbs html to some parent
		 */
		this.setHtmlThumbs = function(objParent, isAppend){
			
			g_objParent = objParent;
			
			//set image effect class
			if(g_temp.isEffectImage == true){
				var imageEffectClass = getImageEffectsClass();
			}
			
			if(isAppend !== true){		//set all thumbs
				var numItems = g_gallery.getNumItems();
				
				 //append thumbs to strip
				 for(var i=0;i<numItems;i++){
					 appendHtmlThumbFromItem(i, imageEffectClass);
				 }
				
			}else{		//append only new items, mark only new added thumbs as new thumbs
				
				var objThumbs = t.getThumbs();
				
				objThumbs.removeClass(g_temp.classNewThumb);
				
				var arrNewIndexes = g_gallery.getNewAddedItemsIndexes();
				
				 jQuery.each(arrNewIndexes,function(i,itemIndex){
					 
					 var objThumbWrapper = appendHtmlThumbFromItem(itemIndex, imageEffectClass);
					 objThumbWrapper.addClass(g_temp.classNewThumb);
					 
				 });
				 					
			}
			
			 
		}

		
		function _______________SETTERS______________(){};

		
		/**
		 * set thumb size with all the inside components (without the image).
		 * else, set to all the thumbs
		 */
		function setThumbSize(width, height, objThumb, innerOnly){
			
			var objCss = {
				width: width+"px",
				height: height+"px"
			};
			
			var objCssInner = {
					width: width-g_temp.thumbInnerReduce+"px",
					height: height-g_temp.thumbInnerReduce+"px"
				};
			
			var selectorsString = ".ug-thumb-loader, .ug-thumb-error, .ug-thumb-border-overlay, .ug-thumb-overlay";
			
			//set thumb size
			if(objThumb){
				if(innerOnly !== true)
					objThumb.css(objCss);
				
				objThumb.find(selectorsString).css(objCssInner);
			}
			else{	//set to all items
				g_objParent.children(".ug-thumb-wrapper").css(objCss);
				g_objParent.find(selectorsString).css(objCssInner);
			}
			
		}

		
		/**
		 * set thumb border effect
		 */
		function setThumbBorderEffect(objThumb, borderWidth, borderColor, noAnimation){
						
			if(!noAnimation)
				var noAnimation = false;
			
			if(g_gallery.isFakeFullscreen())
				noAnimation = true;
			
			var objBorderOverlay = objThumb.children(".ug-thumb-border-overlay");
			
			//set the border to thumb and not to overlay if no border size transition
			/*
			if(g_options.thumb_border_width == g_options.thumb_over_border_width
				&& g_options.thumb_border_width == g_options.thumb_selected_border_width)
				objBorderOverlay = objThumb;
			*/
			
			var objCss = {};
			
			objCss["border-width"] = borderWidth + "px";
			
			if(borderWidth != 0)
				objCss["border-color"] = borderColor;
			
			if(noAnimation && noAnimation === true){
				objBorderOverlay.css(objCss);
				
				if(borderWidth == 0)
					objBorderOverlay.hide();
				else
					objBorderOverlay.show();
			}
			else{
				
				if(borderWidth == 0)
					objBorderOverlay.stop().fadeOut(g_options.thumb_transition_duration);
				else
					objBorderOverlay.show().stop().fadeIn(g_options.thumb_transition_duration);
				
				animateThumb(objBorderOverlay, objCss);
			}
		
		}
		
		
		/**
		 * set thumb border effect
		 */
		function setThumbColorOverlayEffect(objThumb, isActive, noAnimation){
			
			var objOverlay = objThumb.children(".ug-thumb-overlay");
			
			var animationDuration = g_options.thumb_transition_duration;
			if(noAnimation && noAnimation === true)
				animationDuration = 0;
			
			if(isActive){
				objOverlay.stop(true).fadeTo(animationDuration, g_temp.colorOverlayOpacity);
			}else{
				objOverlay.stop(true).fadeTo(animationDuration, 0);
			}
			
		}
		
		
		/**
		 * set thumbnail bw effect
		 */
		function setThumbImageOverlayEffect(objThumb, isActive, noAnimation){
			
			var objImage = objThumb.children("img.ug-thumb-image");
			var objImageOverlay = objThumb.children("img.ug-thumb-image-overlay");
					
			var animationDuration = g_options.thumb_transition_duration;
			if(noAnimation && noAnimation === true)
				animationDuration = 0;
						
			if(isActive){
				objImageOverlay.stop(true).fadeTo(animationDuration,1);
			}else{
				//show the image, hide the overlay
				objImage.fadeTo(0,1);
				objImageOverlay.stop(true).fadeTo(animationDuration,0);
			}
			
		}
		
		
		/**
		 * on thumb mouse out - return the thumb style to original
		 */
		this.setThumbNormalStyle = function(objThumb, noAnimation, fromWhere){
			
			if(g_temp.customThumbs == true){
				objThumb.removeClass("ug-thumb-over");
			}
			
			if(g_temp.isEffectBorder)
			  setThumbBorderEffect(objThumb, g_options.thumb_border_width, g_options.thumb_border_color, noAnimation);
			
			if(g_temp.isEffectOverlay){
				var isSet = (g_options.thumb_overlay_reverse == true)?false:true;
				setThumbColorOverlayEffect(objThumb, isSet, noAnimation);
			}
						
			if(g_temp.isEffectImage){
				setThumbImageOverlayEffect(objThumb, true, noAnimation);
			}
			
			g_objThis.trigger(t.events.SETNORMALSTYLE, objThumb);
		}
		
		
		/**
		 * on thumb mouse over - turn thumb style to over position
		 */
		this.setThumbOverStyle = function(objThumb){
			
			if(g_temp.customThumbs == true){
				objThumb.addClass("ug-thumb-over");
			}
			
			//border effect
			if(g_temp.isEffectBorder)
				setThumbBorderEffect(objThumb, g_options.thumb_over_border_width, g_options.thumb_over_border_color);
			
			//color overlay effect 
			if(g_temp.isEffectOverlay){
				var isSet = (g_options.thumb_overlay_reverse == true)?true:false;
				setThumbColorOverlayEffect(objThumb, isSet);
			}
			
			//image overlay effect
			if(g_temp.isEffectImage == true){
				setThumbImageOverlayEffect(objThumb, false);
			}
			
			//trigger event for parent classes
			g_objThis.trigger(t.events.SETOVERSTYLE, objThumb);
		}
		
		
		/**
		 * set thumb selected style
		 */
		function setThumbSelectedStyle(objThumb, noAnimation){
						
			if(g_temp.isEffectBorder)			
				setThumbBorderEffect(objThumb, g_options.thumb_selected_border_width, g_options.thumb_selected_border_color, noAnimation);
			
			if(g_temp.isEffectOverlay){
				var isSet = (g_options.thumb_overlay_reverse == true)?true:false;
				setThumbColorOverlayEffect(objThumb, isSet, noAnimation);
			}
			
			//image overlay effect
			if(g_temp.isEffectImage)
				setThumbImageOverlayEffect(objThumb, false, noAnimation);

			
			g_objThis.trigger(t.events.SETSELECTEDSTYLE, objThumb);

		}
		
		
		/**
		 * set loading error of the thumb
		 */
		function setItemThumbLoadedError(objThumb){
			
			var objItem = t.getItemByThumb(objThumb);
			
			objItem.isLoaded = true;
			objItem.isThumbImageLoaded = false;		
			
			if(g_temp.customThumbs == true){
				
				g_objThis.trigger(t.events.IMAGELOADERROR, objThumb);
				return(true);
			
			}
			
			objThumb.children(".ug-thumb-loader").hide();
			objThumb.children(".ug-thumb-error").show();		
		}
		
		
		/**
		 * set border radius of all the thmbs
		 */
		function setThumbsBorderRadius(objThumbs){
						
			if(g_options.thumb_round_corners_radius <= 0)
				return(false);
			
			//set radius:
			var objCss = {
				"border-radius":g_options.thumb_round_corners_radius + "px"
			};
			
			if(objThumbs){
				objThumbs.css(objCss);
				objThumbs.find(".ug-thumb-border-overlay").css(objCss);
			}else{
				g_objParent.find(".ug-thumb-wrapper, .ug-thumb-wrapper .ug-thumb-border-overlay").css(objCss);
			}
			
		}
		
		
		/**
		 * animate thumb transitions
		 */
		function animateThumb(objThumb, objThumbCss){
			
			objThumb.stop(true).animate(objThumbCss ,{
				duration: g_options.thumb_transition_duration,
				easing: g_options.thumb_transition_easing,
				queue: false
			});
					
		}
		
		
		/**
		 * redraw the thumb style according the state
		 */
		function redrawThumbStyle(objThumb){

			if(isThumbSelected(objThumb) == true)
				setThumbSelectedStyle(objThumb, true, "redraw");
			else
				t.setThumbNormalStyle(objThumb, true, "redraw");
		}
		
		
		
		
		/**
		 * place thumb image
		 * retrun - false, if already loaded
		 * return true - if was set on this function
		 * isForce - set the image anyway
		 */
		function placeThumbImage(objThumb, objImage, objItem){
			
			//scale the image
			if(g_options.thumb_fixed_size == true){
				g_functions.scaleImageCoverParent(objImage, objThumb);
			}
			else{
				
				//variant size
				
				if(g_options.thumb_resize_by == "height")	//horizontal strip
					g_functions.scaleImageByHeight(objImage, g_options.thumb_height);
				else		//vertical strip
					g_functions.scaleImageByWidth(objImage, g_options.thumb_width);
				
				var imageSize = g_functions.getElementSize(objImage);
				g_functions.placeElement(objImage, 0, 0);
				setThumbSize(imageSize.width, imageSize.height, objThumb);
				
			}
			
			//hide loader
			objThumb.children(".ug-thumb-loader").hide();
			
			//show image
			objImage.show();
			
			//if overlay effect exists
			if(g_options.thumb_image_overlay_effect == false){
				objImage.fadeTo(0,1);
			}
			else{

				//place bw image also if exists
				if(g_options.thumb_image_overlay_effect == true){
					copyPositionToThumbOverlayImage(objImage);
				}

				//hide the original image (avoid blinking at start)
				objImage.fadeTo(0,0);

				//redraw the style, because this function can overwrite it
				redrawThumbStyle(objThumb);
			}
			
			g_objThis.trigger(t.events.AFTERPLACEIMAGE, objThumb);
			
		}


		
		/**
		 * copy image position to bw image (if exists)
		 */
		function copyPositionToThumbOverlayImage(objImage){
						
			var objImageBW = objImage.siblings(".ug-thumb-image-overlay");
			if(objImageBW.length == 0)
				return(false);
			
			var objSize = g_functions.getElementSize(objImage);
				
			var objCss = {
					"width":objSize.width+"px",
					"height":objSize.height+"px",
					"left":objSize.left+"px",
					"top":objSize.top+"px"
				}
				
			objImageBW.css(objCss);
			
			//show the image
			if(g_temp.customThumbs == false)
				objImageBW.fadeTo(0,1);
			
		}
		
		
		
		
		function _______________GETTERS______________(){};
		
		
		/**
		 * get the image effects class from the options
		 */
		function getImageEffectsClass(){
			
			var imageEffectClass = "";
			var arrEffects = g_options.thumb_image_overlay_type.split(",");
			
			for(var index in arrEffects){
				var effect = arrEffects[index];
				
				switch(effect){
					case "bw":
						imageEffectClass += " ug-bw-effect";
					break;
					case "blur":
						imageEffectClass += " ug-blur-effect";
					break; 
					case "sepia":
						imageEffectClass += " ug-sepia-effect";
					break;
				}
			}
					
			return(imageEffectClass);
		}

		/**
		 * get if the thumb is selected
		 */
		function isThumbSelected(objThumbWrapper){
			
			if(objThumbWrapper.hasClass("ug-thumb-selected"))
				return(true);
			
			return(false);
		}

		
		function _______________EVENTS______________(){};
		
		/**
		 * on thumb size change - triggered by parent on custom thumbs type
		 */
		function onThumbSizeChange(temp, objThumb){
			
			objThumb = jQuery(objThumb);
			var objItem = t.getItemByThumb(objThumb);
			
			var objSize = g_functions.getElementSize(objThumb);
			
			setThumbSize(objSize.width, objSize.height, objThumb, true);
			
			redrawThumbStyle(objThumb);
		}
		
		
		/**
		 * on thumb mouse over
		 */
		function onMouseOver(objThumb){
			
			
			//if touch enabled unbind event
			if(g_temp.touchEnabled == true){
				objThumbs.off("mouseenter").off("mouseleave");
				return(true);
			}
			
			if(isThumbSelected(objThumb) == false)
				t.setThumbOverStyle(objThumb);
			
		}
		
		
		/**
		 * on thumb mouse out
		 */
		function onMouseOut(objThumb){
			
			if(g_temp.touchEnabled == true)
				return(true);
							
			if(isThumbSelected(objThumb) == false)
				t.setThumbNormalStyle(objThumb, false);
		}
		
		
		/**
		 * on image loaded event
		 */
		function onImageLoaded(image, isForce){

			if(!isForce)
				var isForce = false;
			
			var objImage = jQuery(image);
			var objThumb = objImage.parents(".ug-thumb-wrapper");
			
			if(objThumb.parent().length == 0)		//don't treat detached thumbs
				return(false);
						
			objItem = t.getItemByThumb(objThumb);
			
			if(objItem.isLoaded == true && isForce === false)
				return(false);
			
			t.triggerImageLoadedEvent(objThumb, objImage);
			
			if(g_temp.customThumbs == true){
				
				g_objThis.trigger(t.events.PLACEIMAGE, [objThumb, objImage]);
			
			}else{
				
				placeThumbImage(objThumb, objImage, objItem);
				
			}
			
		}
		
		
		/**
		 * on image loaded - set appropriete item vars
		 */
		function onThumbImageLoaded(data, objThumb, objImage){
						
			objItem = t.getItemByThumb(objThumb);
						
			objItem.isLoaded = true;
			objItem.isThumbImageLoaded = true;
			
			var objSize = g_functions.getImageOriginalSize(objImage);
						
			objItem.thumbWidth = objSize.width;
			objItem.thumbHeight = objSize.height;
			objItem.thumbRatioByWidth = objSize.width / objSize.height;
			objItem.thumbRatioByHeight = objSize.height / objSize.width;
			
			objThumb.addClass("ug-thumb-ratio-set");
			
		}

		
		/**
		 * set thumbnails html properties
		 */
		this.setHtmlProperties = function(objThumbs){
			
			if(!objThumbs)
				var objThumbs = t.getThumbs();
			
			//set thumb params
			if(g_temp.customThumbs == false){
				var objThumbCss = {};
			
				//set thumb fixed size
				if(g_options.thumb_fixed_size == true)
					setThumbSize(g_options.thumb_width, g_options.thumb_height, objThumbs);
				
				 setThumbsBorderRadius(objThumbs);
			}
			 
			 //set normal style to all the thumbs
			objThumbs.each(function(){
				 var objThumb = jQuery(this);
				 redrawThumbStyle(objThumb);
			 });
			

			//set color. if empty set from css
			if(g_temp.isEffectOverlay){
				
				if(g_options.thumb_overlay_color){
										
					var objCss = {};
					if(g_functions.isRgbaSupported()){
						var colorRGB = g_functions.convertHexToRGB(g_options.thumb_overlay_color, g_options.thumb_overlay_opacity);
						objCss["background-color"] = colorRGB;										
					}else{
						objCss["background-color"] = g_options.thumb_overlay_color;
						g_temp.colorOverlayOpacity = g_options.thumb_overlay_opacity;
					}
					
					objThumbs.find(".ug-thumb-overlay").css(objCss);
				}
				
			}
			
		}

				
		/**
		 * set the thumb on selected state
		 */
		this.setThumbSelected = function(objThumbWrapper){
			
			if(g_temp.customThumbs == true)
				objThumbWrapper.removeClass("ug-thumb-over");
			
			if(isThumbSelected(objThumbWrapper) == true)
				return(true);
			
			objThumbWrapper.addClass("ug-thumb-selected");
			
			//set thumb selected style
			setThumbSelectedStyle(objThumbWrapper);
		}
		
		/**
		 * set the thumb unselected state
		 */
		this.setThumbUnselected = function(objThumbWrapper){
			
			//remove the selected class
			objThumbWrapper.removeClass("ug-thumb-selected");
			
			t.setThumbNormalStyle(objThumbWrapper, false, "set unselected");
		}
		
		
		/**
		 * set the options of the strip
		 */
		this.setOptions = function(objOptions){
			
			g_options = jQuery.extend(g_options, objOptions);
			
		}
		
		
		/**
		 * set thumb inner reduce - reduce this number when resizing thumb inner
		 */
		this.setThumbInnerReduce = function(innerReduce){
			
			g_temp.thumbInnerReduce = innerReduce;
			
		}
		
		/**
		 * set custom thumbs
		 * allowedEffects - border, overlay, image
		 */
		this.setCustomThumbs = function(funcSetHtml, arrAlowedEffects, customOptions){
			
			g_temp.customThumbs = true;
						
			if(typeof funcSetHtml != "function")
				throw new Error("The argument should be function");
			
			
			g_temp.funcSetCustomThumbHtml = funcSetHtml;
			
			//enable effects:
			if(jQuery.inArray("overlay", arrAlowedEffects) == -1)
				g_temp.isEffectOverlay = false;				
			
			if(jQuery.inArray("border", arrAlowedEffects) == -1)
				g_temp.isEffectBorder = false;
			
			g_temp.isEffectImage = false;		//for custom effects the image is always off

			//check for dissalow onresize
			if(customOptions && customOptions.allow_onresize === false){
				g_temp.allowOnResize = false;
			}
		
		}
		
		
		
		
		
		
		this._____________EXTERNAL_GETTERS__________ = function(){};

		/**
		 * get the options object
		 */
		this.getOptions = function(){
			
			return(g_options);
		}
		
		
		/**
		 * get num thumbs
		 */
		this.getNumThumbs = function(){
			var numThumbs = g_arrItems.length;
			return(numThumbs);
		}

		
		/**
		 * get thumb image
		 */
		this.getThumbImage = function(objThumb){
			
			var objImage = objThumb.find(".ug-thumb-image");
			return(objImage);
		}
		
		
		/**
		 * get thumbs by index
		 */
		this.getThumbByIndex = function(index){
			var objThumbs = t.getThumbs();
			
			if(index >= objThumbs.length || index < 0)
				throw new Error("Wrong thumb index");
			
			var objThumb = jQuery(objThumbs[index]);
			
			return(objThumb);
		}
		
		
		/**
		 * get all thumbs jquery object
		 */
		this.getThumbs = function(mode){
			
			var thumbClass = ".ug-thumb-wrapper";
			var classRatio = ".ug-thumb-ratio-set";
			
			switch(mode){
				default:
				case t.type.GET_THUMBS_ALL:
					var objThumbs = g_objParent.children(thumbClass)
				break;
				case t.type.GET_THUMBS_NO_RATIO:
					var objThumbs = g_objParent.children(thumbClass).not(classRatio);
				break;
				case t.type.GET_THUMBS_RATIO:
					var objThumbs = g_objParent.children(thumbClass + classRatio);
				break;
				case t.type.GET_THUMBS_NEW:
					var objThumbs = g_objParent.children("."+g_temp.classNewThumb);
				break;
			}
			
			return(objThumbs);
		}
		
		
		/**
		 * get item by thumb object
		 */
		this.getItemByThumb = function(objThumb){
			
			var index = objThumb.data("index");
			
			if(index === undefined)
				index = objThumb.index();
			
			var arrItem = g_arrItems[index];
			return(arrItem);
		}
		
		
		/**
		 * is thumb loaded
		 */
		this.isThumbLoaded = function(objThumb){
			
			var objItem = t.getItemByThumb(objThumb);
			
			return(objItem.isLoaded);			
		}
		
		
		/**
		 * get global thumb size
		 */
		this.getGlobalThumbSize = function(){
			
			var objSize = {
				width:g_options.thumb_width,
				height: g_options.thumb_height
			};
			
			return(objSize);
		}
		
		
		this._____________EXTERNAL_OTHERS__________ = function(){};


		/**
		 * init events
		 */
		this.initEvents = function(){
			
			var selectorThumb = ".ug-thumb-wrapper";
			
			//one time event
			if(g_temp.allowOnResize == true)
				g_objWrapper.on(g_serviceParams.eventSizeChange, onThumbSizeChange);
			
			//on image loaded event - for setting the image sizes
			g_objThis.on(t.events.THUMB_IMAGE_LOADED, onThumbImageLoaded);
									
			//thumbs events						
			g_objParent.on("touchstart",selectorThumb,function(){
				g_temp.touchEnabled = true;
				g_objParent.off("mouseenter").off("mouseleave");
			});
			
			g_objParent.on("mouseenter",selectorThumb,function(event){				
				var objThumb = jQuery(this);
				onMouseOver(objThumb);
			});

			g_objParent.on("mouseleave",selectorThumb,function(event){
				var objThumb = jQuery(this);
				onMouseOut(objThumb);
			});
			
			
		}
		
		
		/**
		 * destroy the thumb element
		 */
		this.destroy = function(){
			
			var selectorThumb = ".ug-thumb-wrapper";
			
			g_objParent.off("touchstart",selectorThumb);
			g_objWrapper.off(g_serviceParams.eventSizeChange);
			g_objParent.off("mouseenter",selectorThumb);
			g_objParent.off("mouseleave",selectorThumb);
			g_objThis.off(t.events.THUMB_IMAGE_LOADED);
		}
		
		
		/**
		 * preload thumbs images and put them into the thumbnails
		 */
		this.loadThumbsImages = function(){

			var objImages = g_objParent.find(".ug-thumb-image");
			g_functions.checkImagesLoaded(objImages, null, function(objImage,isError){
				
				if(isError == false){
					onImageLoaded(objImage, true);
				}
				else{
					var objItem = jQuery(objImage).parent();
					setItemThumbLoadedError(objItem);										
				}
			});
		}
		
		
		/**
		 * trigger image loaded event
		 */
		this.triggerImageLoadedEvent = function(objThumb, objImage){

			g_objThis.trigger(t.events.THUMB_IMAGE_LOADED, [objThumb, objImage]);
			
		}
		
		
		/**
		 * hide thumbs
		 */
		this.hideThumbs = function(){
			
			g_objParent.find(".ug-thumb-wrapper").hide();
			
		}
		
}