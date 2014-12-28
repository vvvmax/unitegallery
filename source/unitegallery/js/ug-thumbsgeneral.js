
function UGThumbsGeneral(){
	
	var t = this;
	
	var g_gallery = new UniteGalleryMain(), g_objGallery, g_objects, g_objWrapper; 
	var g_arrItems, g_objStrip, g_objParent;
	var g_functions = new UGFunctions();

	
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
			
			thumb_transition_duration: 200,				//thumb effect transition duration
			thumb_transition_easing: "easeOutQuad",		//thumb effect transition easing
			
			thumb_show_loader:true,						//show thumb loader while loading the thumb
			thumb_loader_type:"dark"					//dark, light - thumb loader type
		}
	
		var g_temp = {
			touchEnabled: false,
			num_thumbs_checking:0,
			customThumbs:false,
			funcSetCustomThumbHtml:null
		};
		
		var g_serviceParams = {			//service variables	
			timeout_thumb_check:100,
			thumb_max_check_times:600	//60 seconds
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
			
		}
		
		
		/**
		 * append the thumbs html to some parent
		 */
		this.setHtmlThumbs = function(objParent){
						
			g_objParent = objParent;
			
			var numItems = g_gallery.getNumItems();

			//set image effect class
			if(g_options.thumb_image_overlay_effect == true){
				var imageEffectClass = getImageEffectsClass();
			}
					
			 //append thumbs to strip
			 for(var i=0;i<numItems;i++){
				 var objThumbWrapper = jQuery("<div class='ug-thumb-wrapper'></div>");
				 var objItem = g_arrItems[i];
				 
				 if(g_temp.customThumbs == true){
					 
					 g_temp.funcSetCustomThumbHtml(objThumbWrapper, objItem);
					 
				 }else{
					 var objImage =  objItem.objThumbImage;
	 				 
					 if(g_options.thumb_show_loader == true && objImage){
						 
						 var loaderClass = "ug-thumb-loader-dark";
						 if(g_options.thumb_loader_type == "bright")
							 loaderClass = "ug-thumb-loader-bright";
						 
						 objThumbWrapper.append("<div class='ug-thumb-loader " + loaderClass + "'></div>");
						 objThumbWrapper.append("<div class='ug-thumb-error' style='display:none'></div>");
					 }
					 
					 objThumbWrapper.append("<div class='ug-thumb-border-overlay'></div>");
					 objThumbWrapper.append("<div class='ug-thumb-overlay'></div>");
					 
					 if(objImage){
						 objImage.addClass("ug-thumb-image");
						 
						 //if image overlay effects active, clone the image, and set the effects class on it
						 if(g_options.thumb_image_overlay_effect == true){
							var objImageBW = objImage.clone().appendTo(objThumbWrapper);
							
							objImageBW.addClass(imageEffectClass).removeClass("ug-thumb-image");
							objImageBW.fadeTo(0,0);
						 }
								 
						 objThumbWrapper.append(objImage);
					 }else{
						 
						 objThumbWrapper.append("<div class='ug-thumb-text1'>" + objItem.title + "</div>");
					 }
					 
				 }//end if not custom thumb
				 
				 
				 g_objParent.append(objThumbWrapper);
				 
				 //add thumb wrapper object to items array
				 g_arrItems[i].objThumbWrapper = objThumbWrapper;
			 }
		}
		
		
		/**
		 * set thumbnails html properties
		 */
		this.setHtmlProperties = function(){
			
			 //set thumb params
			 var objThumbCss = {};
			 objThumbCss["width"] = g_options.thumb_width+"px";
			 objThumbCss["height"] = g_options.thumb_height+"px";
			 		 
			 g_objParent.children(".ug-thumb-wrapper").css(objThumbCss);
			 
			 setThumbsBorderRadius();		 
			 
			 //set normal style to all the thumbs
			 g_objParent.children(".ug-thumb-wrapper").each(function(){
				 var objThumb = jQuery(this);
				 setThumbNormalStyle(objThumb, true);
			 });
			 
			 //set thumbs loader and error params
			 var objThumbsLoaderCss = {};
			 objThumbsLoaderCss["width"] = g_options.thumb_width+"px";
			 objThumbsLoaderCss["height"] = g_options.thumb_height+"px";			 
			 g_objParent.find(".ug-thumb-loader, .ug-thumb-error, .ug-thumb-border-overlay, .ug-thumb-overlay").css(objThumbsLoaderCss);
			 
		}
		
		
		/**
		 * get the image effects class from the options
		 */
		function getImageEffectsClass(){
			
			var imageEffectClass = "ug-thumb-image-overlay";
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
			
			var objCss = {};
			objCss["background-color"] = g_options.thumb_overlay_color;
			objOverlay.css(objCss);
			
			var animationDuration = g_options.thumb_transition_duration;
			if(noAnimation && noAnimation === true)
				animationDuration = 0;
			
			if(isActive){
				objOverlay.stop(true).fadeTo(animationDuration,g_options.thumb_overlay_opacity);
			}else{
				objOverlay.stop(true).fadeTo(animationDuration,0);
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
		function setThumbNormalStyle(objThumb, noAnimation){
			
			if(g_temp.customThumbs == true){
				objThumb.removeClass("ug-thumb-over");
				return(true);
			}			
			
			if(g_options.thumb_border_effect == true)
				setThumbBorderEffect(objThumb, g_options.thumb_border_width, g_options.thumb_border_color, noAnimation);
			
			if(g_options.thumb_color_overlay_effect == true){
				var isSet = (g_options.thumb_overlay_reverse == true)?false:true;
				setThumbColorOverlayEffect(objThumb, isSet, noAnimation);
			}
			
			if(g_options.thumb_image_overlay_effect == true){
				setThumbImageOverlayEffect(objThumb, true, noAnimation);
			}
			
		}
		
		
		/**
		 * on thumb mouse over - turn thumb style to over position
		 */
		function setThumbOverStyle(objThumb){
			
			if(g_temp.customThumbs == true){
				objThumb.addClass("ug-thumb-over");
				return(true);
			}
			
			//border effect
			if(g_options.thumb_border_effect == true)
				setThumbBorderEffect(objThumb, g_options.thumb_over_border_width, g_options.thumb_over_border_color);
			
			//color overlay effect 
			if(g_options.thumb_color_overlay_effect == true){
				var isSet = (g_options.thumb_overlay_reverse == true)?true:false;
				setThumbColorOverlayEffect(objThumb, isSet);
			}
			
			//image overlay effect
			if(g_options.thumb_image_overlay_effect == true){
				setThumbImageOverlayEffect(objThumb, false);
			}
			
		}
		
		
		/**
		 * set thumb selected style
		 */
		function setThumbSelectedStyle(objThumb, noAnimation){
			
			if(g_temp.customThumbs == true)
				return(true);
			
			if(g_options.thumb_border_effect == true)			
				setThumbBorderEffect(objThumb, g_options.thumb_selected_border_width, g_options.thumb_selected_border_color, noAnimation);
			
			if(g_options.thumb_color_overlay_effect == true){
				var isSet = (g_options.thumb_overlay_reverse == true)?true:false;
				setThumbColorOverlayEffect(objThumb, isSet, noAnimation);
			}
			
			//image overlay effect
			if(g_options.thumb_image_overlay_effect == true){
				setThumbImageOverlayEffect(objThumb, false, noAnimation);
			}
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
			var index = objThumb.index();
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
				setThumbNormalStyle(objThumb, true);
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
		 * init events
		 */
		this.initEvents = function(){
			
			
			var objThumbs = g_objParent.find(".ug-thumb-wrapper");
			
			objThumbs.on("touchstart",function(){
				g_temp.touchEnabled = true;
				objThumbs.off("mouseenter").off("mouseleave");				
			});
			
			objThumbs.hover(function(event){		//on mouse enter
				
				//if touch enabled unbind event
				if(g_temp.touchEnabled == true){
					objThumbs.off("mouseenter").off("mouseleave");
					return(true);
				}
				
				var objThumb = jQuery(this);
				
				if(isThumbSelected(objThumb) == false)
					setThumbOverStyle(objThumb);
					
			}, function(event){		//on mouse leave
								
				 if(g_temp.touchEnabled == true)
					return(true);
								
				var objThumb = jQuery(this);
				
				if(isThumbSelected(objThumb) == false){
					setThumbNormalStyle(objThumb);
				}
				
			});
			
		}
		
		
		/**
		 * set the thumb unselected state
		 */
		this.setThumbUnselected = function(objThumbWrapper){
			
			//remove the selected class
			objThumbWrapper.removeClass("ug-thumb-selected");
			
			setThumbNormalStyle(objThumbWrapper);
		}
		
		
		/**
		 * preload thumbs images and put them into the thumbnails
		 */
		this.loadThumbsImages = function(){
			
			jQuery(g_arrItems).each(function(){
				
				var objImage = this.objThumbImage;
				
				if(!objImage)
					return(false);
				
				var htmlImage = objImage.get(0);
				
				//set image load event (not that reliable)
				objImage.on("load",function(){
					placeThumbImage(this, true);
				});
				
				//set load error event
				objImage.on( "error", function(){
					var objItem = objImage.parent();
					setItemThumbLoadedError(objItem);
				});			
				
				objImage.show();
			});
			
			//set timeout to check if the images are loaded
			setTimeout(checkThumbsLoaded, g_serviceParams.timeout_thumb_check);
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
			
			var thumbIndex = objThumb.index();
			var objItem = g_arrItems[thumbIndex];
			
			if(objItem.isLoaded == true && isForce === false)
				return(false);
			
			var wasLoaded = objItem.isLoaded;
			
			objItem.isLoaded = true;
			objItem.isThumbImageLoaded = true;
			
			g_functions.scaleImageCoverParent(objImage, objThumb);
			
			if(wasLoaded == false){
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
					
			return(true);
		}
		/**
		 * copy image position to bw image (if exists)
		 */
		function copyPositionToThumbOverlayImage(objImage){
			
			var objImageBW = objImage.siblings("img.ug-thumb-image-overlay");
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
			objImageBW.fadeTo(0,1);
		}
		
		
		/**
		 * set loading error of the thumb
		 */
		function setItemThumbLoadedError(objThumb){
			
			objThumb.children(".ug-thumb-loader").hide();
			objThumb.children(".ug-thumb-error").show();
			
			var objItem = t.getItemByThumb(objThumb);
			
			objItem.isLoaded = true;
			objItem.isThumbImageLoaded = false;		
		}
		
		
		/**
		 * check if images are loaded, if not, place the image.
		 * recure the function over again if not all the images are loaded
		 */
		function checkThumbsLoaded(){
			
			var isAllLoaded = true;
			var arrNotLoadedItems = [];
			
			g_temp.num_thumbs_checking++;
			var isTimeToStopChecking = (g_temp.num_thumbs_checking > g_serviceParams.thumb_max_check_times);
			
			for(var i=0;i<g_arrItems.length;i++){
				var objItem = g_arrItems[i];
				 if(objItem.isLoaded == true)
					 continue;
				
				 var objThumbImage = objItem.objThumbImage;
				 if(!objThumbImage)
					 continue;
				 
				 isAllLoaded = false;
				
				var imageWidth = objThumbImage.width();
				var originalWidth = g_functions.getImageOriginalSize(objThumbImage).width;
							
				if(imageWidth != 0 && originalWidth == undefined || originalWidth > 0){				
					placeThumbImage(objThumbImage);
								
				}else{
					
					if(isTimeToStopChecking == true)
						arrNotLoadedItems.push(objItem.objThumbWrapper);
					
				}
			}
			
			if(isAllLoaded == false){
				
				//timeout run out			
				//set error loading for all not loaded thumbs			
				if(isTimeToStopChecking == true){
									
					jQuery(arrNotLoadedItems).each(function(){
						var objItem = this;
						setItemThumbLoadedError(objItem);
						
					});
									
				}
				else{
					setTimeout(checkThumbsLoaded, g_serviceParams.timeout_thumb_check);
				}					
			}
			
		}
		
		
		/**
		 * set the options of the strip
		 */
		this.setOptions = function(objOptions){
			
			g_options = jQuery.extend(g_options, objOptions);
			
		}
		
		
		/**
		 * set custom thumbs
		 */
		this.setCustomThumbs = function(funcSetHtml){
			g_temp.customThumbs = true;
			
			if(typeof funcSetHtml != "function")
				throw new Error("The argument should be function");
				
			g_temp.funcSetCustomThumbHtml = funcSetHtml;
			
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
}