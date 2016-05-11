/**
 * tiles design class
 */
function UGTileDesign(){
	
	var t = this, g_objThis = jQuery(this);	
	var g_gallery = new UniteGalleryMain(), g_objGallery;
	var g_functions = new UGFunctions(), g_objParentWrapper, g_objWrapper;
	var g_thumbs = new UGThumbsGeneral(), g_items;
	
	this.resizemode = {			//modes constants for resize tile
		FULL: "full",
		WRAPPER_ONLY: "wrapper_only",
		VISIBLE_ELEMENTS: "visible_elements"
	};
	
	this.sizeby = {				//sizeby option constants
		GLOBAL_RATIO: "global_ratio",
		TILE_RATIO: "tile_ratio",
		IMAGE_RATIO: "image_ratio",
		CUSTOM: "custom"
	};
	
	this.events = {
			TILE_CLICK: "tile_click"
	};
	
	var g_options = {
						
			tile_width: 250,						//in case of fixed size: tile width
			tile_height: 200,						//in case of fixed size: tile height
			tile_size_by:t.sizeby.IMAGE_RATIO,		//image ratio, tile ratio , global_ratio - decide by what parameter resize the tile
			tile_visible_before_image:false,		//tile visible before image load
			
			tile_enable_background:true,			//enable backgruond of the tile
			tile_background_color: "#F0F0F0",		//tile background color
			
			tile_enable_border:false,				//enable border of the tile
			tile_border_width:3,					//tile border width
			tile_border_color:"#F0F0F0",			//tile border color
			tile_border_radius:0,					//tile border radius (applied to border only, not to outline)
			
			tile_enable_outline: false,				//enable outline of the tile (works only together with the border)
			tile_outline_color: "#8B8B8B",			//tile outline color
			
			tile_enable_shadow:false,				//enable shadow of the tile
			tile_shadow_h:1,						//position of horizontal shadow
			tile_shadow_v:1,						//position of vertical shadow
			tile_shadow_blur:3,						//shadow blur
			tile_shadow_spread:2,					//shadow spread
			tile_shadow_color:"#8B8B8B",			//shadow color
			
			tile_enable_action:	true,				//enable tile action on click like lightbox
			tile_as_link: false,					//act the tile as link, no lightbox will appear
			tile_link_newpage: true,				//open the tile link in new page

			tile_enable_overlay: true,				//enable tile color overlay (on mouseover)
			tile_overlay_opacity: 0.4,				//tile overlay opacity
			tile_overlay_color: "#000000",			//tile overlay color
			
			tile_enable_icons: true,				//enable icons in mouseover mode
			tile_show_link_icon: false,				//show link icon (if the tile has a link). In case of tile_as_link this option not enabled
			tile_videoplay_icon_always_on: 'never',	//'always', 'never', 'mobile_only', 'desktop_only' always show video play icon
			tile_space_between_icons: 26,			//initial space between icons, (on small tiles it may change)
			
			tile_enable_image_effect:false,			//enable tile image effect
			tile_image_effect_type: "bw",			//bw, blur, sepia - tile effect type
			tile_image_effect_reverse: false,		//reverce the image, set only on mouseover state
			
			tile_enable_textpanel: false,			 //enable textpanel
			tile_textpanel_source: "title",			 //title,desc,desc_title,title_and_desc. source of the textpanel. desc_title - if description empty, put title
			tile_textpanel_always_on: false,		 //textpanel always visible - for inside type
			tile_textpanel_appear_type: "slide",	 //slide, fade - appear type of the textpanel on mouseover
			tile_textpanel_position:"inside_bottom", //inside_bottom, inside_top, inside_center, top, bottom the position of the textpanel
			tile_textpanel_offset:0					 //vertical offset of the textpanel
	};
	
	
	var g_defaults = {
			thumb_color_overlay_effect: true,
			thumb_overlay_reverse: true,
			thumb_image_overlay_effect: false,
			tile_textpanel_enable_description: false,
			tile_textpanel_bg_opacity: 0.6,
			tile_textpanel_padding_top:8,
			tile_textpanel_padding_bottom: 8
	};
	
	var g_temp = {
		ratioByHeight:0,
		ratioByWidth:0,
		eventSizeChange: "thumb_size_change",
		funcCustomTileHtml: null,
		funcCustomPositionElements: null,
		funcParentApproveClick: null,
		isSaparateIcons: false,
		tileInnerReduce: 0,		//how much reduce from the tile inner elements from border mostly
		isTextpanelOutside: false,	//is the textpanel is out of tile image border
		hasImageContainer:false,
		isVideoplayIconAlwaysOn:false,
		isTextPanelHidden:false
	};
	
	
	/**
	 * init the tile object
	 */
	function init(gallery, customOptions){
		
		g_gallery = gallery;
		
		g_objGallery = jQuery(gallery);		
		
		var objects = g_gallery.getObjects();
		g_objWrapper = objects.g_objWrapper;
		
		g_items = g_gallery.getArrItems();
				
		g_options = jQuery.extend(g_options, g_defaults);
		
		g_options = jQuery.extend(g_options, customOptions);
				
		modifyOptions();
				
		g_thumbs.init(gallery, g_options);	
		
		var objCustomOptions = {allow_onresize:false};
		
		var customThumbsAdd = ["overlay"];
		
		if(g_temp.funcCustomTileHtml)
			customThumbsAdd = [];
		
		g_thumbs.setCustomThumbs(setHtmlThumb, customThumbsAdd, objCustomOptions);
		
		//get thumb default options too:
		var thumbOptions = g_thumbs.getOptions();
		g_options = jQuery.extend(g_options, thumbOptions);
		
		//set ratios of fixed mode
		g_temp.ratioByWidth = g_options.tile_width / g_options.tile_height;
		g_temp.ratioByHeight = g_options.tile_height / g_options.tile_width;
		
		
		//set if tile has image container
		if(g_options.tile_size_by == t.sizeby.GLOBAL_RATIO && g_temp.isTextpanelOutside)
			g_temp.hasImageContainer = true;
		
	}
	
	
	/**
	 * set thumb and textpanel options according tile options
	 */
	function modifyOptions(){

		//set overlay related options
		if(g_options.tile_enable_overlay == true){
			
			g_options.thumb_overlay_opacity = g_options.tile_overlay_opacity;
			g_options.thumb_overlay_color = g_options.tile_overlay_color;
		
		}else if(g_options.tile_enable_icons == false){		//if nothing on overlay - turn it off
			g_options.thumb_color_overlay_effect = false;		
		}else{											//if icons enabled - make it transparent
			g_options.thumb_overlay_opacity = 0;
		}
		
		//set item as link
		if(g_options.tile_as_link){
			g_options.thumb_wrapper_as_link = true;
			g_options.thumb_link_newpage = g_options.tile_link_newpage;
		}
		
		//outline cannot appear without border
		if(g_options.tile_enable_outline == true && g_options.tile_enable_border == false)
			g_options.tile_enable_outline = false;
		
		//set inner reduce value - in case of the border
		g_temp.tileInnerReduce = 0;
		if(g_options.tile_enable_border){
			g_temp.tileInnerReduce = g_options.tile_border_width * 2;
			g_thumbs.setThumbInnerReduce(g_temp.tileInnerReduce);
		}

		//check if saparate icons
		g_temp.isSaparateIcons = !g_functions.isRgbaSupported();
		
		//set if the textpanel is enabled and outside
		if(g_options.tile_enable_textpanel == true){
			
			//optimize for touch device
			switch(g_options.tile_textpanel_position){
				case "top":
					g_options.tile_textpanel_align = "top";
				case "bottom":
					g_temp.isTextpanelOutside = true;
					g_options.tile_textpanel_always_on = true;
					g_options.tile_textpanel_offset = 0;
				break;
				case "inside_top":
					g_options.tile_textpanel_align = "top";
				break;
				case "middle":
					g_options.tile_textpanel_align = "middle";
					g_options.tile_textpanel_appear_type = "fade";
				break;
			}
			
			//if text panel oppearing with the overlay, icons should be saparated
			if(g_options.tile_textpanel_always_on == false)
				g_temp.isSaparateIcons = true;
			
		}
		
		
		//if the textpanel offset is not from the border, it's always fade.
		if(g_options.tile_textpanel_offset != 0){
			g_options.tile_textpanel_appear_type = "fade";
			g_options.tile_textpanel_margin = g_options.tile_textpanel_offset;
		}
		
		//enable description if needed
		if(g_options.tile_textpanel_source == "title_and_desc"){
			g_options.tile_textpanel_enable_description = true;
			g_options.tile_textpanel_desc_style_as_title = true;
		}
		
	}
	

	/**
	 * set options before render
	 */
	function modifyOptionsBeforeRender(){
		
		var isMobile = g_gallery.isMobileMode();
		
		//set text panel show / hide
		
		g_temp.isTextPanelHidden = false;
		if(isMobile == true && g_options.tile_textpanel_always_on == false)
			g_temp.isTextPanelHidden = true;
		
		
		//set video icon always on true / false
		
		g_temp.isVideoplayIconAlwaysOn = g_options.tile_videoplay_icon_always_on;
		
		switch(g_options.tile_videoplay_icon_always_on){
			case "always":
				g_temp.isVideoplayIconAlwaysOn = true;
			break;
			case "never":
				g_temp.isVideoplayIconAlwaysOn = false;
			break;
			case "mobile_only":
				g_temp.isVideoplayIconAlwaysOn = (isMobile == true)?true:false;
			break;
			case "desktop_only":
				g_temp.isVideoplayIconAlwaysOn = (isMobile == false)?true:false;
			break;
		}
		
		
	}

	
	/**
	 * set thumb html
	 */
	function setHtmlThumb(objThumbWrapper, objItem){
		
		objThumbWrapper.addClass("ug-tile");
		
		if(g_temp.funcCustomTileHtml){
			g_temp.funcCustomTileHtml(objThumbWrapper, objItem);
			return(false);
		}
		
		var html = "";
			
		//add image container
		if(g_temp.hasImageContainer == true){
			html += "<div class='ug-image-container ug-trans-enabled'>";
		}
		
		//add thumb image:
		var classImage = "ug-thumb-image";

		if(g_options.tile_enable_image_effect == false || g_options.tile_image_effect_reverse == true)
			classImage += " ug-trans-enabled";
		
		var imageAlt = g_functions.stripTags(objItem.title);
		imageAlt = g_functions.htmlentitles(imageAlt);
		
		html += "<img src='"+objItem.urlThumb+"' alt='"+imageAlt+"' class='"+classImage+"'>";

		if(g_temp.hasImageContainer == true){
			html += "</div>";
		}	
		
		objThumbWrapper.append(html);
		
		
		if(g_options.tile_size_by == t.sizeby.GLOBAL_RATIO){
			objThumbWrapper.fadeTo(0,0);		//turn on in thumbsGeneral
		}
		
		//---- set thumb styles ---- 
		
		//set border:
		var objCss = {};
		
		if(g_options.tile_enable_background == true){
			objCss["background-color"] = g_options.tile_background_color;
		}
		
		if(g_options.tile_enable_border == true){
			objCss["border-width"] = g_options.tile_border_width+"px";
			objCss["border-style"] = "solid";
			objCss["border-color"] = g_options.tile_border_color;
			
			if(g_options.tile_border_radius)
				objCss["border-radius"] = g_options.tile_border_radius+"px";
		}
		
		//set outline:
		if(g_options.tile_enable_outline == true){
			objCss["outline"] = "1px solid " + g_options.tile_outline_color;
		}
		
		//set shadow
		if(g_options.tile_enable_shadow == true){
			var htmlShadow = g_options.tile_shadow_h+"px ";
			htmlShadow += g_options.tile_shadow_v+"px ";
			htmlShadow += g_options.tile_shadow_blur+"px ";
			htmlShadow += g_options.tile_shadow_spread+"px ";
			htmlShadow += g_options.tile_shadow_color;
			
			objCss["box-shadow"] = htmlShadow;
		}
		
		objThumbWrapper.css(objCss);
		
		
		//----- add icons
		
		var htmlAdd = "";
		
		if(g_options.tile_enable_icons){
			
			//add zoom icon
			if(g_options.tile_as_link == false && g_options.tile_enable_action == true){
				var iconPlayClass = "ug-button-play ug-icon-zoom";
				if(objItem.type != "image")
					iconPlayClass = "ug-button-play ug-icon-play";
				
				htmlAdd += "<div class='ug-tile-icon " + iconPlayClass + "' style='display:none'></div>";
			}
			
			//add link icon
			if(objItem.link && g_options.tile_show_link_icon == true || g_options.tile_as_link == true){
				
				if(g_options.tile_as_link == false){
					var linkTarget = "";
					if(g_options.tile_link_newpage == true)
						linkTarget = " target='_blank'";
					
					htmlAdd += "<a href='"+objItem.link+"'"+linkTarget+" class='ug-tile-icon ug-icon-link'></a>";					
				}else{
					htmlAdd += "<div class='ug-tile-icon ug-icon-link' style='display:none'></div>";					
				}
				
			}
		
		var toSaparateIcon = g_temp.isSaparateIcons;
		if(toSaparateIcon == false && objItem.type != "image" && g_temp.isVideoplayIconAlwaysOn == true)
			toSaparateIcon = true;
		
		if(toSaparateIcon)		//put the icons on the thumb
			var objOverlay = objThumbWrapper;
		else
			var objOverlay = objThumbWrapper.children(".ug-thumb-overlay");
		
		objOverlay.append(htmlAdd);		
		
		var objButtonZoom = objOverlay.children("." + iconPlayClass);
		
		if(objButtonZoom.length == 0)
			objButtonZoom = null;
		else
			objButtonZoom.hide();
		
		var objButtonLink = objOverlay.children(".ug-icon-link");
		
		if(objButtonLink.length == 0)
			objButtonLink = null;
		else
			objButtonLink.hide();
		
		//if only zoom icon, make the tile clickable for lightbox open
		if(!objButtonLink && g_options.tile_enable_action == true)
			objThumbWrapper.addClass("ug-tile-clickable");
		
		}  //if icons enabled
		else{		//if the icons don't enabled, set the tile clickable
			
			if(g_options.tile_enable_action == true)
				objThumbWrapper.addClass("ug-tile-clickable");
		
		}
		
		//add image overlay
		if(g_options.tile_enable_image_effect == true){
			
			var imageEffectClassAdd = "";
			if(g_options.tile_image_effect_reverse == false)
				imageEffectClassAdd = " ug-trans-enabled";
			
			var imageOverlayHtml = "<div class='ug-tile-image-overlay"+imageEffectClassAdd+"' >";
			var imageEffectClass = " ug-"+g_options.tile_image_effect_type+"-effect";
			
			imageOverlayHtml += "<img src='"+objItem.urlThumb+"' alt='"+objItem.title+"' class='"+imageEffectClass + imageEffectClassAdd+"'>";
			imageOverlayHtml += "</div>";
			
			objThumbWrapper.append(imageOverlayHtml);

			//hide the image overlay if reversed
			if(g_options.tile_image_effect_reverse == true){
				objThumbWrapper.children(".ug-tile-image-overlay").fadeTo(0,0);
			}
			
		}
		
		
		//add text panel
		if(g_options.tile_enable_textpanel == true){
			
			var objTextPanel = new UGTextPanel();			 
			objTextPanel.init(g_gallery, g_options, "tile");
			
			//set transition class
			var textpanelAddClass = "";
			if(g_options.tile_textpanel_always_on == true || g_temp.isTextpanelOutside == true)
				textpanelAddClass = "ug-trans-enabled";
			
			objTextPanel.appendHTML(objThumbWrapper, textpanelAddClass);
			
			var panelTitle = objItem.title;
			var panelDesc = "";
			
			switch(g_options.tile_textpanel_source){
				case "desc":
				case "description":
					panelTitle = objItem.description;
				break;
				case "desc_title":
					if(objItem.description != "")
						panelTitle = objItem.description;
				break;
				case "title_and_desc":
					panelTitle = objItem.title;
					panelDesc = objItem.description;
				break;
			}
			
			objTextPanel.setTextPlain(panelTitle, panelDesc);
			
			if(g_options.tile_textpanel_always_on == false)
				objTextPanel.getElement().fadeTo(0,0);
			
			objThumbWrapper.data("objTextPanel", objTextPanel);

			//if textpanel always on, it has to be under the overlay
			if(g_options.tile_textpanel_always_on == true){
				var textPanelElement = getTextPanelElement(objThumbWrapper);
				textPanelElement.css("z-index",2);
			}
			
			//if text panel is outside, clone textpanel
			if(g_temp.isTextpanelOutside == true){
				
				var htmlClone = "<div class='ug-tile-cloneswrapper'></div>";
				objThumbWrapper.append(htmlClone);
				var objCloneWrapper = objThumbWrapper.children(".ug-tile-cloneswrapper");
				
				var objTextPanelClone = new UGTextPanel(); 
				objTextPanelClone.init(g_gallery, g_options, "tile");				
				objTextPanelClone.appendHTML(objCloneWrapper);
				objTextPanelClone.setTextPlain(panelTitle, panelDesc);
				objThumbWrapper.data("objTextPanelClone", objTextPanelClone);
			}
			
		}
		
		//add additional html
		if(objItem.addHtml !== null)
			objThumbWrapper.append(objItem.addHtml);
		
	}
	
	
	/**
	 * load tile image, place the image on load
	 */
	this.loadTileImage = function(objTile){
		
		var objImage = t.getTileImage(objTile);
			
		g_functions.checkImagesLoaded(objImage, null, function(objImage,isError){
			onPlaceImage(null, objTile, jQuery(objImage));
		});
		
	}
	
	function _________________GETTERS________________(){};
	
	
	
	/**
	 * get image overlay
	 */
	function getTileOverlayImage(objTile){
		var objOverlayImage = objTile.children(".ug-tile-image-overlay");
		return(objOverlayImage);
	}
	
	/**
	 * get tile color overlay
	 */
	function getTileOverlay(objTile){
		var objOverlay = objTile.children(".ug-thumb-overlay");
		return(objOverlay);		
	}
	
	
	/**
	 * get image container
	 */
	function getTileImageContainer(objTile){
		if(g_temp.hasImageContainer == false)
			return(null);
		
		var objImageContainer = objTile.children(".ug-image-container");
		
		return(objImageContainer);
	}
	
	
	/**
	 * get image effect
	 */
	function getTileImageEffect(objTile){		
		var objImageEffect = objTile.find(".ug-tile-image-overlay img");			
		return(objImageEffect);
	}
	
	
	/**
	 * get text panel
	 */
	function getTextPanel(objTile){
		var objTextPanel = objTile.data("objTextPanel");
		
		return(objTextPanel);
	}
	
	
	/**
	 * get cloned text panel
	 */
	function getTextPanelClone(objTile){
		var objTextPanelClone = objTile.data("objTextPanelClone");
		
		return(objTextPanelClone);
		
	}
	
	
	/**
	 * get text panel element from the tile
	 */
	function getTextPanelElement(objTile){
		var objTextPanel = objTile.children(".ug-textpanel");
		
		return(objTextPanel);
	}
	
	
	/**
	 * get text panel element cloned
	 */
	function getTextPanelCloneElement(objTile){
		var objTextPanel = objTile.find(".ug-tile-cloneswrapper .ug-textpanel");
		
		if(objTextPanel.length == 0)
			throw new Error("text panel cloned element not found");
		
		return(objTextPanel);
		
	}
	
	
	/**
	 * get text panel height
	 */
	function getTextPanelHeight(objTile){
		
		if(g_temp.isTextpanelOutside == true)
			var objTextPanel = getTextPanelCloneElement(objTile);
		else
			var objTextPanel = getTextPanelElement(objTile);
		
		
		if(!objTextPanel)
			return(0);
		
		var objSize = g_functions.getElementSize(objTextPanel);
		return(objSize.height);
	}
	
	
	/**
	 * get button link
	 */
	function getButtonLink(objTile){
		var objButton = objTile.find(".ug-icon-link");
		if(objButton.length == 0)
			return(null);
		
		return objButton;
	}

	
	/**
	 * get tile ratio
	 */
	function getTileRatio(objTile){
					
		//global ratio
		var ratio = g_temp.ratioByHeight;
		
		switch(g_options.tile_size_by){
			default:		//global ratio
				ratio = g_temp.ratioByHeight
			break;
			case t.sizeby.IMAGE_RATIO:

				if(!objTile)
					throw new Error("tile should be given for tile ratio");
				
				var item = t.getItemByTile(objTile);
								
				if(typeof item.thumbRatioByHeight != "undefined"){
				
					if(item.thumbRatioByHeight == 0){
						trace(item);
						throw new Error("the item ratio not inited yet");
					}
				
					ratio = item.thumbRatioByHeight;
				}
			
			break;
			case t.sizeby.CUSTOM:
				return null;
			break;
		}
				
		return(ratio);
	}
	
	
	/**
	 * get button zoom
	 */
	function getButtonZoom(objTile){
		var objButton = objTile.find(".ug-button-play");
		
		if(objButton.length == 0)
			return(null);
		
		return objButton;
	}
	
	
	/**
	 * tells if the tile is over style
	 */
	function isOverStyle(objTile){
		
		if(objTile.hasClass("ug-thumb-over"))
			return(true);
		
		return(false);
	}
	
	
	/**
	 * check if the tile is clickable
	 */
	function isTileClickable(objTile){
		
		return objTile.hasClass("ug-tile-clickable");
	}
	
	
	/**
	 * return if the items icon always on
	 */
	function isItemIconAlwaysOn(objItem){
		
		if(g_options.tile_enable_icons == true && g_temp.isVideoplayIconAlwaysOn == true && objItem.type != "image")
			return(true);
		
		return(false);
	}

	
	function _________________SETTERS________________(){};
	
	
	/**
	 * position tile images elements
	 * width, height - tile width height
	 */
	function positionElements_images(objTile, width, height, visibleOnly){
		
		var objImageOverlay = getTileOverlayImage(objTile);
		var objThumbImage = t.getTileImage(objTile);
		var objImageEffect = getTileImageEffect(objTile);
		
		//reduce borders
		width -= g_temp.tileInnerReduce;
		height -= g_temp.tileInnerReduce;
		
		var imagePosy = null;
		
		//reduce textpanel height
		if(g_temp.isTextpanelOutside == true){

			var textHeight = getTextPanelHeight(objTile);
			height -= textHeight;

			if(g_options.tile_textpanel_position == "top"){
				imagePosy = textHeight;
			}
			
			/**
			 * if has image container
			 */
			if(g_temp.hasImageContainer == true){
				var objImageContainer = getTileImageContainer(objTile);
				g_functions.setElementSize(objImageContainer, width, height);
				
				if(imagePosy !== null)
					g_functions.placeElement(objImageContainer, 0, imagePosy);
			}
			
		}
		
		//scale image
		if(g_options.tile_enable_image_effect == false){

			g_functions.scaleImageCoverParent(objThumbImage, width, height);
			
			if(g_temp.hasImageContainer == false && imagePosy !== null)
				g_functions.placeElement(objThumbImage, 0, imagePosy);

		}else{	//width the effect
			
			//set what to resize
			var dontResize = "nothing";
			if(visibleOnly === true && g_temp.isTextpanelOutside == false){
				if(g_options.tile_image_effect_reverse == true){
					dontResize = "effect";
				}else{
					dontResize = "image";
				}
			}

			//resize image effect
			if(dontResize != "effect"){
				g_functions.setElementSize(objImageOverlay, width, height);
				
				if(imagePosy !== null)
					g_functions.placeElement(objImageOverlay, 0, imagePosy);
				
				g_functions.scaleImageCoverParent(objImageEffect, width, height);
			}
			

			//resize image
			if(dontResize != "image"){
				
				if(g_temp.hasImageContainer == true){
					g_functions.scaleImageCoverParent(objThumbImage, width, height);
				}else{
					
					//if can't clone, resize
					if(dontResize == "effect"){
						g_functions.scaleImageCoverParent(objThumbImage, width, height);
						if(imagePosy !== null)
							g_functions.placeElement(objThumbImage, 0, imagePosy);
					}
					else
						g_functions.cloneElementSizeAndPos(objImageEffect, objThumbImage, false, null, imagePosy);
					
				}
				
			}

			
			
		}

	}
	
	
	/**
	 * position text panel
	 * panelType - default or clone
	 */
	function positionElements_textpanel(objTile, panelType, tileWidth, tileHeight){
		
		var panelWidth = null;
		if(tileWidth)
			panelWidth = tileWidth - g_temp.tileInnerReduce;

		if(tileHeight)
			tileHeight -= g_temp.tileInnerReduce;
		
		if(panelType == "clone"){
			var objTextPanelClone = getTextPanelClone(objTile);
			objTextPanelClone.refresh(true, true, panelWidth);
			var objItem = t.getItemByTile(objTile);
			objItem.textPanelCloneSizeSet = true;
			
			return(false);
		}
		
		var objTextPanel = getTextPanel(objTile);
		
		if(!objTextPanel)
			return(false);
		
		var panelHeight = null;
				
		//set panel height also
		if(g_temp.isTextpanelOutside == true)
			panelHeight = getTextPanelHeight(objTile);
		
		objTextPanel.refresh(false, true, panelWidth, panelHeight);
		
		var isPosition = (g_options.tile_textpanel_always_on == true || g_options.tile_textpanel_appear_type == "fade");
		
		if(isPosition){
			
			if(g_temp.isTextpanelOutside == true && tileHeight && g_options.tile_textpanel_position == "bottom"){
			
				var posy = tileHeight - panelHeight;
				objTextPanel.positionPanel(posy);
			}else
				objTextPanel.positionPanel();
		}
		
	}
		
	
	/**
	 * position the elements
	 */
	function positionElements(objTile){
		
		var objItem = t.getItemByTile(objTile);
		var objButtonZoom = getButtonZoom(objTile);
		var objButtonLink = getButtonLink(objTile);
		var sizeTile = g_functions.getElementSize(objTile);
				
		positionElements_images(objTile, sizeTile.width, sizeTile.height);
		
		//position text panel:
		if(g_options.tile_enable_textpanel == true)
			positionElements_textpanel(objTile, "regular", sizeTile.width, sizeTile.height);
		
		
		//position overlay:
		var overlayWidth = sizeTile.width - g_temp.tileInnerReduce;
		var overlayHeight = sizeTile.height - g_temp.tileInnerReduce;
		var overlayY = 0;
		if(g_temp.isTextpanelOutside == true){
			var textHeight = getTextPanelHeight(objTile);
			overlayHeight -= textHeight;
			if(g_options.tile_textpanel_position == "top")
				overlayY = textHeight;
		}
		
		var objOverlay = getTileOverlay(objTile);
		g_functions.setElementSizeAndPosition(objOverlay, 0, overlayY, overlayWidth, overlayHeight);
		
		//set vertical gap for icons
		if(objButtonZoom || objButtonLink){

			var gapVert = 0;
			if( g_options.tile_enable_textpanel == true && g_temp.isTextPanelHidden == false && g_temp.isTextpanelOutside == false){
				var objTextPanelElement = getTextPanelElement(objTile);
				var texPanelSize = g_functions.getElementSize(objTextPanelElement);
				if(texPanelSize.height > 0)
					gapVert = Math.floor((texPanelSize.height / 2) * -1);
			}

		}
		
		if(objButtonZoom && objButtonLink){
			var sizeZoom = g_functions.getElementSize(objButtonZoom);
			var sizeLink = g_functions.getElementSize(objButtonLink);
			var spaceBetween = g_options.tile_space_between_icons;
			
			var buttonsWidth = sizeZoom.width + spaceBetween + sizeLink.width;
			var buttonsX = Math.floor((sizeTile.width - buttonsWidth) / 2);
			
			//trace("X: "+buttonsX+" "+"space: " + spaceBetween);
			
			//if space more then padding, calc even space.
			if(buttonsX < spaceBetween){
				spaceBetween = Math.floor((sizeTile.width - sizeZoom.width - sizeLink.width) / 3);
				buttonsWidth = sizeZoom.width + spaceBetween + sizeLink.width;
				buttonsX = Math.floor((sizeTile.width - buttonsWidth) / 2);
			}

			g_functions.placeElement(objButtonZoom, buttonsX, "middle", 0 ,gapVert);
			g_functions.placeElement(objButtonLink, buttonsX + sizeZoom.width + spaceBetween, "middle", 0, gapVert);
						
		}else{
			
			if(objButtonZoom)
				g_functions.placeElement(objButtonZoom, "center", "middle", 0, gapVert);
			
			if(objButtonLink)
				g_functions.placeElement(objButtonLink, "center", "middle", 0, gapVert);
				
		}
		
		if(objButtonZoom)
			objButtonZoom.show();
		
		if(objButtonLink)
			objButtonLink.show();
	}

	
	/**
	 * set tiles htmls
	 */
	this.setHtml = function(objParent){
		g_objParentWrapper = objParent;
		
		modifyOptionsBeforeRender();
		
		g_thumbs.setHtmlThumbs(objParent);
	}
	
	
	/**
	 * set the overlay effect
	 */
	function setImageOverlayEffect(objTile, isActive){
		
		var objItem = t.getItemByTile(objTile);
		var objOverlayImage = getTileOverlayImage(objTile);
		
		var animationDuration = g_options.thumb_transition_duration;
		
		if(g_options.tile_image_effect_reverse == false){
			
			var objThumbImage = t.getTileImage(objTile);
			
			if(isActive){
				objThumbImage.fadeTo(0,1);			
				objOverlayImage.stop(true).fadeTo(animationDuration, 0);
			}
			else
				objOverlayImage.stop(true).fadeTo(animationDuration, 1);
			
		}else{
			
			if(isActive){
				objOverlayImage.stop(true).fadeTo(animationDuration, 1);
			}
			else{
				objOverlayImage.stop(true).fadeTo(animationDuration, 0);
			}
		}

	}
	
	
	/**
	 * set textpanel effect
	 */
	function setTextpanelEffect(objTile, isActive){
		
		var animationDuration = g_options.thumb_transition_duration;
		
		var objTextPanel = getTextPanelElement(objTile);
		if(!objTextPanel)
			return(true);
				
		if(g_options.tile_textpanel_appear_type == "slide"){
			
			var panelSize = g_functions.getElementSize(objTextPanel);
			if(panelSize.width == 0)
				return(false);
			
			var startPos = -panelSize.height;
			var endPos = 0;
			var startClass = {}, endClass = {};
			
			var posName = "bottom";
			if(g_options.tile_textpanel_position == "inside_top")
				posName = "top";
			
			startClass[posName] = startPos+"px";
			endClass[posName] = endPos+"px";
						
			if(isActive == true){
								
				objTextPanel.fadeTo(0,1);
				
				if(objTextPanel.is(":animated") == false)
					objTextPanel.css(startClass);
				
				endClass["opacity"] = 1;
					
				objTextPanel.stop(true).animate(endClass, animationDuration);
				
			}else{
				
				objTextPanel.stop(true).animate(startClass, animationDuration);
				
			}
			
		}else{		//fade effect
			
			if(isActive == true){
				objTextPanel.stop(true).fadeTo(animationDuration, 1);
			}else{
				objTextPanel.stop(true).fadeTo(animationDuration, 0);
			}
			
		}
		
	}
	

	/**
	 * set thumb border effect
	 */
	function setIconsEffect(objTile, isActive, noAnimation){
		
		var animationDuration = g_options.thumb_transition_duration;
		if(noAnimation && noAnimation === true)
			animationDuration = 0;
		
		var g_objIconZoom = getButtonZoom(objTile);
		var g_objIconLink = getButtonLink(objTile);
		var opacity = isActive?1:0;
		
		if(g_objIconZoom)
			g_objIconZoom.stop(true).fadeTo(animationDuration, opacity);
		
		if(g_objIconLink)
			g_objIconLink.stop(true).fadeTo(animationDuration, opacity);
		
	}
	
	
	
	/**
	 * set tile over style
	 */
	function setOverStyle(data, objTile){
		
		objTile = jQuery(objTile);
				
		if(g_options.tile_enable_image_effect)
			setImageOverlayEffect(objTile, true);

		if(g_options.tile_enable_textpanel == true && g_options.tile_textpanel_always_on == false && g_temp.isTextPanelHidden == false)
			setTextpanelEffect(objTile, true);
		
		//show/hide icons - if saparate (if not, they are part of the overlay)
		//if the type is video and icon always on - the icon should stay
		if(g_temp.isSaparateIcons && g_options.tile_enable_icons == true){
			var isSet = (g_options.thumb_overlay_reverse == true);
			
			var objItem = t.getItemByTile(objTile);
			if(isItemIconAlwaysOn(objItem) == false)
				setIconsEffect(objTile, isSet, false);
			
		}
		
	}
	
	
	/**
	 * set normal style
	 */
	function setNormalStyle(data, objTile){
		
		objTile = jQuery(objTile);
		
		if(g_options.tile_enable_image_effect)
			setImageOverlayEffect(objTile, false);
		
		if(g_options.tile_enable_textpanel == true && g_options.tile_textpanel_always_on == false)
			setTextpanelEffect(objTile, false);
		
		//show/hide icons - if saparate (if not, they are part of the overlay)
		if(g_temp.isSaparateIcons == true && g_options.tile_enable_icons == true){
			
			var isSet = (g_options.thumb_overlay_reverse == true)?false:true;
			
			var objItem = t.getItemByTile(objTile);
			if(isItemIconAlwaysOn(objItem) == false)
				setIconsEffect(objTile, isSet, false);
			else{	//make icon always appear
				setIconsEffect(objTile, true, true);
			}
			
		}
		
	}
	
	
	/**
	 * set all tiles normal style
	 */
	function setAllTilesNormalStyle(objTileExcept){
		
		var objTiles = g_thumbs.getThumbs().not(objTileExcept);
		objTiles.each(function(index, objTile){
			g_thumbs.setThumbNormalStyle(jQuery(objTile));
		});
		
	}
	
	
	function _________________EVENTS________________(){};
	
	
	/**
	 * on tile size change, place elements
	 */
	function onSizeChange(data, objTile, forcePosition){

		objTile = jQuery(objTile);
		
		//position elements only if the image loaded (placed)
		if(g_options.tile_visible_before_image == true && objTile.data("image_placed") !== true && forcePosition !== true)
			return(true);

		positionElements(objTile);
		
		g_thumbs.setThumbNormalStyle(objTile);
	}
	
	
	/**
	 * on place image event after images loaded
	 */
	function onPlaceImage(data, objTile, objImage){
		
		positionElements(objTile);
		objImage.fadeTo(0,1);
		
		objTile.data("image_placed", true);
	}
	
	
	/**
	 * on tile click on mobile devices on normal state
	 * set the tile over state
	 */
	function onMobileClick(objTile){

		if(isTileClickable(objTile) == true){
			g_objThis.trigger(t.events.TILE_CLICK, objTile);
			return(true);
		}
		
		if(isOverStyle(objTile) == false){
			setAllTilesNormalStyle(objTile);			
			g_thumbs.setThumbOverStyle(objTile);
		}
		
	}
	
	
	/**
	 * on tile click event
	 */
	function onTileClick(event){
				
		var objTile = jQuery(this);
		
		var tagname = objTile.prop("tagName").toLowerCase();
		var isApproved = true;
		if(g_temp.funcParentApproveClick && g_temp.funcParentApproveClick() == false)
			isApproved = false;
				
		if(tagname == "a"){
			
			if(isApproved == false)
				event.preventDefault();
							
		}else{		//in case of div
			
			if(isOverStyle(objTile) == false){	//mobile click version
				
				if(isApproved == true)
					onMobileClick(objTile);
								
			}else{
				if(isTileClickable(objTile) == false)
					return(true);
				
				if(isApproved == true)
					g_objThis.trigger(t.events.TILE_CLICK, objTile);
			}
			
			
		}
		
	}
	
	
	/**
	 * click on zoom button (as tile click)
	 */
	function onZoomButtonClick(event){
				
		event.stopPropagation();
		
		var objTile = jQuery(this).parents(".ug-tile");
		
		var isApproved = true;
		
		if(g_temp.funcParentApproveClick && g_temp.funcParentApproveClick() == false)
			isApproved = false;
		
		if(isOverStyle(objTile) == false){
			onMobileClick(objTile);
			return(true);
		}
			
		if(isApproved == true){
			g_objThis.trigger(t.events.TILE_CLICK, objTile);
			return(false);
		}
		
	}
	
	
	/**
	 * on link icon click
	 */
	function onLinkButtonClick(event){
		var objTile = jQuery(this).parents(".ug-tile");
				
		if(g_temp.funcParentApproveClick && g_temp.funcParentApproveClick() == false)
			event.preventDefault();
		
		//allow click only from over style
		if(isOverStyle(objTile) == false && g_options.tile_as_link == false){
			event.preventDefault();
			onMobileClick(objTile);
		}
		
	}
	
	
	/**
	 * init events
	 */
	this.initEvents = function(){
				
		g_thumbs.initEvents();
		
		//connect the over and normal style of the regular thumbs
		jQuery(g_thumbs).on(g_thumbs.events.SETOVERSTYLE, setOverStyle);
		jQuery(g_thumbs).on(g_thumbs.events.SETNORMALSTYLE, setNormalStyle);
		jQuery(g_thumbs).on(g_thumbs.events.PLACEIMAGE, onPlaceImage);
		
		g_objWrapper.on(g_temp.eventSizeChange, onSizeChange);
		
		g_objParentWrapper.delegate(".ug-tile .ug-button-play", "click", onZoomButtonClick);
		
		g_objParentWrapper.delegate(".ug-tile", "click", onTileClick);
		
		g_objParentWrapper.delegate(".ug-tile .ug-icon-link", "click", onLinkButtonClick);
	}
	
	
	/**
	 * destroy the element events
	 */
	this.destroy = function(){
				
		jQuery(g_thumbs).off(g_thumbs.events.SETOVERSTYLE);
		jQuery(g_thumbs).off(g_thumbs.events.SETNORMALSTYLE);
		jQuery(g_thumbs).off(g_thumbs.events.PLACEIMAGE);
		g_objWrapper.off(g_temp.eventSizeChange);
		
		if(g_options.tile_enable_textpanel == true){
			var objThumbs = g_thumbs.getThumbs();
			jQuery.each(objThumbs, function(index, thumb){				
				var textPanel = getTextPanel(jQuery(thumb));
				if(textPanel)
					textPanel.destroy();
			});
		}
		
		g_thumbs.destroy();

	}

	
	/**
	 * external init
	 */
	this.init = function(gallery, g_thumbs, customOptions){
		
		init(gallery, g_thumbs, customOptions);
	}
	
	/**
	 * set fixed mode
	 */
	this.setFixedMode = function(){
		
		g_options.tile_size_by = t.sizeby.GLOBAL_RATIO;
		g_options.tile_visible_before_image = true;
	}
	
	
	/**
	 * set parent approve click function
	 */
	this.setApproveClickFunction = function(funcApprove){
		g_temp.funcParentApproveClick = funcApprove;
	}
	
	
	
	/**
	 * resize tile. If no size given, resize to original size
	 * the resize mode taken from resize modes constants, default is full
	 */
	this.resizeTile = function(objTile, newWidth, newHeight, resizeMode){
		
			//if textpanel outside - refresh the textpanel first
			if(g_temp.isTextpanelOutside == true)
				positionElements_textpanel(objTile, "clone", newWidth);
			
			if(!newWidth){
				
				var newWidth = g_options.tile_width;
				var newHeight = g_options.tile_height;
				
			}else{		//only height is missing
				if(!newHeight){
					
					var newHeight = t.getTileHeightByWidth(newWidth, objTile);
				}
			}
						
			g_functions.setElementSize(objTile, newWidth, newHeight);
			
			switch(resizeMode){
				default:
				case t.resizemode.FULL:
					t.triggerSizeChangeEvent(objTile, true);
				break;
				case t.resizemode.WRAPPER_ONLY:
					return(true);
				break;
				case t.resizemode.VISIBLE_ELEMENTS:
					
					if(g_temp.funcCustomTileHtml){
						t.triggerSizeChangeEvent(objTile, true);
						return(true);
					}
					
					//resize images
					positionElements_images(objTile, newWidth, newHeight, true);
					
					//resize text panel, if visible
					if(g_options.tile_enable_textpanel == true && g_options.tile_textpanel_always_on == true && newWidth){
						positionElements_textpanel(objTile, "regular", newWidth, newHeight);
					}
					
				break;
			}
		
	}

	
	/**
	 * resize all tiles 
	 */
	this.resizeAllTiles = function(newWidth, resizeMode){
		
		modifyOptionsBeforeRender();
		
		var newHeight = null;
		
		if(g_options.tile_size_by == t.sizeby.GLOBAL_RATIO)
			newHeight = t.getTileHeightByWidth(newWidth);
						
		var objTiles = g_thumbs.getThumbs();
		objTiles.each(function(index, objTile){
			t.resizeTile(jQuery(objTile), newWidth, newHeight, resizeMode);
		});
		
	}
	
	
	/**
	 * trigger size change events
	 * the force is only for fixed size mode
	 */
	this.triggerSizeChangeEvent = function(objTile, isForce){
		
		if(!objTile)
			return(false);
		
		if(!isForce)
			var isForce = false;
		
		g_objWrapper.trigger(g_temp.eventSizeChange, [objTile, isForce]);
		
	}
	
	
	/**
	 * trigger size change event to all tiles
	 * the force is only for fixed mode
	 */
	this.triggerSizeChangeEventAllTiles = function(isForce){
		
		var objThumbs = g_thumbs.getThumbs();

		objThumbs.each(function(){
			var objTile = jQuery(this);
			
			t.triggerSizeChangeEvent(objTile, isForce);
			
		});
		
	}
	
	
	
	
	
	/**
	 * disable all events
	 */
	this.disableEvents = function(){
		var objThumbs = g_thumbs.getThumbs();
		objThumbs.css("pointer-events", "none");
	}
	
	
	/**
	 * enable all events
	 */
	this.enableEvents = function(){
		var objThumbs = g_thumbs.getThumbs();
		objThumbs.css("pointer-events", "auto");
	}
	
	/**
	 * set new options
	 */
	this.setOptions = function(newOptions){
		g_options = jQuery.extend(g_options, newOptions);
		g_thumbs.setOptions(newOptions);
	}
	
	
	/**
	 * set custom tile html function
	 */
	this.setCustomFunctions = function(funcCustomHtml, funcPositionElements){
		g_temp.funcCustomTileHtml = funcCustomHtml;
		g_temp.funcCustomPositionElements = funcPositionElements;
	}
	
	
	/**
	 * run the tile design
	 */
	this.run = function(){
		
		//resize all tiles
		var objThumbs = g_thumbs.getThumbs();
		
		if(g_options.tile_size_by == t.sizeby.GLOBAL_RATIO){
			t.resizeAllTiles(g_options.tile_width, t.resizemode.WRAPPER_ONLY);
		}
			
		//hide original image if image effect active
		if(g_options.tile_enable_image_effect == true && g_options.tile_image_effect_reverse == false)
			objThumbs.children(".ug-thumb-image").fadeTo(0,0);
		
		g_thumbs.setHtmlProperties();
		
		if(g_options.tile_visible_before_image == true){
			
			//if textpanel outside - refresh the textpanel first			
			objThumbs.children(".ug-thumb-image").fadeTo(0,0);
			g_thumbs.loadThumbsImages();
		}
		
	}

	
	this._____________EXTERNAL_GETTERS____________=function(){};
	
	
	/**
	 * get thumbs general option
	 */
	this.getObjThumbs = function(){
		return g_thumbs;
	}
	
	/**
	 * get options
	 */
	this.getOptions = function(){
		return g_options;
	}

	/**
	 * get tile image
	 */
	this.getTileImage = function(objTile){
		var objImage = objTile.find("img.ug-thumb-image");
		return(objImage);
	}

	
	/**
	 * get item from tile
	 */
	this.getItemByTile = function(objTile){
		return g_thumbs.getItemByThumb(objTile);
	}
	
	
	/**
	 * get tile height by width
	 */
	this.getTileHeightByWidth = function(newWidth, objTile){
		
		var ratio = getTileRatio(objTile);
		
		if(ratio === null)
			return(null);
		
		var height = Math.floor( (newWidth - g_temp.tileInnerReduce) * ratio) + g_temp.tileInnerReduce;
		
		if(objTile && g_temp.isTextpanelOutside == true && g_options.tile_size_by == t.sizeby.IMAGE_RATIO)
			height += getTextPanelHeight(objTile);
		
		return(height);
	}
	
	
	/**
	 * get tile original size
	 */
	this.getTileImageSize = function(objTile){
        var objItem = t.getItemByTile(objTile);
        if(!objItem.thumbWidth || !objItem.thumbHeight)
        	throw new Error("Can't get image size - image not inited.");
        
        var objSize = {
        		width: objItem.thumbWidth,
        		height: objItem.thumbHeight
        };
        
        return(objSize);
	}
	
	
	/**
	 * get tile size
	 */
	this.getGlobalTileSize = function(){
		
		if(g_options.tile_size_by != t.sizeby.GLOBAL_RATIO)
			throw new Error("The size has to be global ratio");
		
		var objSize = {
				width: g_options.tile_width,
				height: g_options.tile_height
		};
	
		return(objSize);
	}
	
	
}