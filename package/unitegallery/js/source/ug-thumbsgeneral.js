
function UGThumbsGeneral(){
	
	var t = this, g_objThis = jQuery(t);
	
	var g_gallery = new UniteGalleryMain(), g_objGallery, g_objects, g_objWrapper; 
	var g_arrItems, g_objStrip, g_objParent;
	var g_functions = new UGFunctions();

	this.events = {		
		SETOVERSTYLE: "thumbmouseover",
		SETNORMALSTYLE: "thumbmouseout",
		PLACEIMAGE: "thumbplaceimage",
		IMAGELOADERROR: "thumbimageloaderror",
	};
	
	var g_options = {
			thumb_width:88,								//thumb width
			thumb_height:50,							//thumb height

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
			
			thumb_image_overlay_effect: false,			//true,false - images overlay effect on normal state only
			thumb_image_overlay_type: "bw",				//bw , blur, sepia - the type of image effect overlay, black and white, sepia and blur.
			
			thumb_text_overlay: false,					//turn on text overlay
			
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
			isEffectImage: false
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
		
		
		/**
		 * append the thumbs html to some parent
		 */
		this.setHtmlThumbs = function(objParent){
					
			g_objParent = objParent;
			
			var numItems = g_gallery.getNumItems();

			//set image effect class
			if(g_temp.isEffectImage == true){
				var imageEffectClass = getImageEffectsClass();
			}
			
			 //append thumbs to strip
			 for(var i=0;i<numItems;i++){
				 
				 var objItem = g_arrItems[i];
				 
				 var classAddition = "";
				 if(g_temp.customThumbs == false)
					 classAddition = " ug-thumb-generated";
				 
				 var htmlThumb = "<div class='ug-thumb-wrapper"+classAddition+"'></div>";
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
				 g_arrItems[i].objThumbWrapper = objThumbWrapper;
				 
			 }
		}
		
		
		/**
		 * set thumbnails html properties
		 */
		this.setHtmlProperties = function(){
			 			
			 //set thumb params
			if(g_temp.customThumbs == false){
				var objThumbCss = {};
				 objThumbCss["width"] = g_options.thumb_width+"px";
				 objThumbCss["height"] = g_options.thumb_height+"px";
				 		 
				 g_objParent.children(".ug-thumb-wrapper").css(objThumbCss);
				 
				 setThumbsBorderRadius();		 				
			} 
			 
			 //set normal style to all the thumbs
			 g_objParent.children(".ug-thumb-wrapper").each(function(){
				 var objThumb = jQuery(this);
				 t.setThumbNormalStyle(objThumb, true);
			 });
			
			 
			//set thumbs loader and error params
			if(g_temp.customThumbs == false){
				 var objThumbsLoaderCss = {};
				 objThumbsLoaderCss["width"] = g_options.thumb_width+"px";
				 objThumbsLoaderCss["height"] = g_options.thumb_height+"px";			 
				 g_objParent.find(".ug-thumb-loader, .ug-thumb-error, .ug-thumb-border-overlay, .ug-thumb-overlay").css(objThumbsLoaderCss);
			}
			
			//set color. if empty set from css
			if(g_temp.isEffectOverlay){
				
				if(g_options.thumb_overlay_color){
										
					var objCss = {};
					var colorRGB = g_functions.convertHexToRGB(g_options.thumb_overlay_color, g_options.thumb_overlay_opacity);
					
					objCss["background-color"] = colorRGB;										
					g_objParent.find(".ug-thumb-wrapper .ug-thumb-overlay").css(objCss);
				}
				
			}
			
		}
		
		
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
				objOverlay.stop(true).fadeTo(animationDuration, 1);
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
		this.setThumbNormalStyle = function(objThumb, noAnimation){
			
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
			
		}
		
		/**
		 * get if the thumb is selected
		 */
		function isThumbSelected(objThumbWrapper){
			
			if(objThumbWrapper.hasClass("ug-thumb-selected"))
				return(true);
			
			return(false);
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
		 * redraw the thumb style according the state
		 */
		function redrawThumbStyle(objThumb){
			
			if(isThumbSelected(objThumb) == true)
				setThumbSelectedStyle(objThumb, true);
			else
				t.setThumbNormalStyle(objThumb, true);
		}
		
		
		/**
		 * set border radius of all the thmbs
		 */
		function setThumbsBorderRadius(){
			
			if(g_options.thumb_round_corners_radius <= 0)
				return(false);
			
			//set radius:
			var objCss = {
				"border-radius":g_options.thumb_round_corners_radius + "px"
			};
			
			g_objParent.find(".ug-thumb-wrapper, .ug-thumb-wrapper .ug-thumb-border-overlay").css(objCss);
			
		}
		
		
		/**
		 * on thumb size change - triggered by parent on custom thumbs type
		 */
		function onThumbSizeChange(temp, objThumb){
						
			objThumb = jQuery(objThumb);
			var objItem = t.getItemByThumb(objThumb);
			
			//if(objThumb.index() != 0) return(true);
			
			var objSize = g_functions.getElementSize(objThumb);
			
			var objSizeCss = {
					width: objSize.width+"px",
					height: objSize.height+"px"
			};
			
			
			//set inner objects properties
			if(g_temp.isEffectBorder == true)
				objThumb.children(".ug-thumb-border-overlay").css(objSizeCss);
			
			if(g_temp.isEffectOverlay == true)
				objThumb.children(".ug-thumb-overlay").css(objSizeCss);
			
			t.setThumbNormalStyle(objThumb, true);
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
				t.setThumbNormalStyle(objThumb);
		}
		
		
		/**
		 * init events
		 */
		this.initEvents = function(){
			
			var objThumbs = g_objParent.find(".ug-thumb-wrapper");
			
			objThumbs.on("touchstart",function(){
				g_temp.touchEnabled = true;
				objThumbs.off("mouseenter").off("mouseleave");
			});
			
			g_objWrapper.on(g_serviceParams.eventSizeChange, onThumbSizeChange);
			
			
			objThumbs.hover(function(event){		//on mouse enter
				var objThumb = jQuery(this);
				onMouseOver(objThumb);
			}, function(event){		//on mouse leave
				var objThumb = jQuery(this);
				onMouseOut(objThumb);
			});
				
		}
		
		/**
		 * destroy the thumb element
		 */
		this.destroy = function(){
			var objThumbs = g_objParent.find(".ug-thumb-wrapper");
			objThumbs.off("touchstart");
			g_objWrapper.off(g_serviceParams.eventSizeChange);
			objThumbs.off("mouseenter");
			objThumbs.off("mouseleave");
			
		}
		
		
		/**
		 * set the thumb unselected state
		 */
		this.setThumbUnselected = function(objThumbWrapper){
			
			//remove the selected class
			objThumbWrapper.removeClass("ug-thumb-selected");
			
			t.setThumbNormalStyle(objThumbWrapper);
		}
		
		
		/**
		 * preload thumbs images and put them into the thumbnails
		 */
		this.loadThumbsImages = function(){
			
			var objImages = g_objParent.find(".ug-thumb-image");
			g_functions.checkImagesLoaded(objImages, null, function(objImage,isError){
				
				if(isError == false)
					placeThumbImage(objImage, true);
				else{
					var objItem = jQuery(objImage).parent();
					setItemThumbLoadedError(objItem);										
				}
					
			});

		}
		
		
		/**
		 * place thumb image
		 * retrun - false, if already loaded
		 * return true - if was set on this function
		 * isForce - set the image anyway
		 */
		function placeThumbImage(image, isForce){
			if(!isForce)
				var isForce = false;
						
			var objImage = jQuery(image);
			var objThumb = objImage.parent();
			
			if(objThumb.parent().length == 0)		//don't treat detached thumbs
				return(false);
						
			objItem = t.getItemByThumb(objThumb);
			
			if(objItem.isLoaded == true && isForce === false)
				return(false);
						
			objItem.isLoaded = true;
			objItem.isThumbImageLoaded = true;
			
			if(g_temp.customThumbs == true){
				g_objThis.trigger(t.events.PLACEIMAGE, [objThumb, objImage]);
				return(true);
			}
			
			g_functions.scaleImageCoverParent(objImage, objThumb);
			
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
				
				var objThumb = objImage.parent();
				
				//redraw the style, because this function can overwrite it
				redrawThumbStyle(objThumb);
			}
				
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
		 * set the options of the strip
		 */
		this.setOptions = function(objOptions){
			
			g_options = jQuery.extend(g_options, objOptions);
			
		}
		
		
		/**
		 * set custom thumbs
		 * allowedEffects - border, overlay, image
		 */
		this.setCustomThumbs = function(funcSetHtml, arrAlowedEffects){
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
			
		}
		
		
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
		 * get all thumbs jquery object
		 */
		this.getThumbs = function(){
			return(g_objParent.children(".ug-thumb-wrapper"));
		}
}