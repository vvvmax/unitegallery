/** -------------- TextPanel class ---------------------*/

function UGTextPanel(){
	
	var t = this;
	var g_objPanel, g_objParent, g_objTitle, g_objDesc;
	var g_objBG, g_objTextWrapper, g_gallery;
	var g_functions = new UGFunctions(), g_optionsPrefix = "";
	
	var g_options = {
			textpanel_align:"bottom",					//(top , bottom), textpanel align according the parent
			textpanel_margin:0,							//margin from the textpanel position according the textpanel_align
			textpanel_text_valign:"middle",				//middle, top, bottom - text vertical align
			textpanel_padding_top:10,					//textpanel padding top 
			textpanel_padding_bottom:10,				//textpanel padding bottom
			textpanel_height: null,						//textpanel height. if null it will be set dynamically
			textpanel_padding_title_description: 5,		//the space between the title and the description
			textpanel_padding_right: 11,				//cut some space for text from right
			textpanel_padding_left: 11,					//cut some space for text from left
			textpanel_fade_duration: 200,				//the fade duration of textpanel appear
			textpanel_enable_title: true,				//enable the title text
			textpanel_enable_description: true,			//enable the description text
			textpanel_enable_bg: true,					//enable the textpanel background
			textpanel_bg_color:"#000000",				//textpanel background color
			textpanel_bg_opacity: 0.4,					//textpanel background opacity
			
			textpanel_title_color:null,					//textpanel title color. if null - take from css
			textpanel_title_font_family:null,			//textpanel title font family. if null - take from css
			textpanel_title_text_align:null,			//textpanel title text align. if null - take from css
			textpanel_title_font_size:null,				//textpanel title font size. if null - take from css
			textpanel_title_bold:null,					//textpanel title bold. if null - take from css
			textpanel_css_title:{},						//textpanel additional css of the title

			textpanel_desc_color:null,					//textpanel description font family. if null - take from css
			textpanel_desc_font_family:null,			//textpanel description font family. if null - take from css
			textpanel_desc_text_align:null,				//textpanel description text align. if null - take from css
			textpanel_desc_font_size:null,				//textpanel description font size. if null - take from css
			textpanel_desc_bold:null,					//textpanel description bold. if null - take from css
			textpanel_css_description:{},				//textpanel additional css of the description
			
			textpanel_desc_style_as_title: false,		//set that the description style will be as title
			
			textpanel_bg_css:{}							//textpanel background css
	};
	
	var g_temp = {
			isFirstTime: true,
			setInternalHeight: true		//flag if set internal height or not
	};
	
	
	/**
	 * position elements from top
	 */
	function positionElementsTop(animateHeight, startY){
		
		if(!startY)
			var startY = g_options.textpanel_padding_top;
		
		//place title
		var maxy = startY;
		
		//place title
		if(g_objTitle){
			var titleY = maxy;
			g_functions.placeElement(g_objTitle, 0, titleY);
			
			var objTitleSize = g_functions.getElementSize(g_objTitle);		
						
			var maxy = objTitleSize.bottom;			
		}
		
		//place description
		var textDesc = "";
		if(g_objDesc)
			textDesc = jQuery.trim(g_objDesc.text());
		
		if(textDesc != ""){
			
			var descY = maxy;
						
			if(g_objTitle)
				descY += g_options.textpanel_padding_title_description;
			
			g_functions.placeElement(g_objDesc, 0, descY);
			var objDescSize = g_functions.getElementSize(g_objDesc);		
			maxy = objDescSize.bottom;
		}
		
		//change panel height
		if(!g_options.textpanel_height && g_temp.setInternalHeight == true){
			
			var panelHeight = maxy + g_options.textpanel_padding_bottom;		
			
			setHeight(panelHeight, animateHeight);
		}
		
	}
	
	/**
	 * get total text and description height
	 */
	function getTotalTextHeight(){
		var totalHeight = 0;
		
		if(g_objTitle)
			totalHeight += g_objTitle.outerHeight();
		
		if(g_objDesc){
			var textDesc = "";
			if(g_objDesc)
				textDesc = jQuery.trim(g_objDesc.text());
			
			if(textDesc != ""){
				if(g_objTitle)
					totalHeight += g_options.textpanel_padding_title_description;
				
				totalHeight += g_objDesc.outerHeight();
			}
		
		}
		
		
		return(totalHeight);
	}
	
	
	/**
	 * position elements to center
	 */
	function positionElementsMiddle(){
		
		var totalTextHeight = getTotalTextHeight();
		var startY = (g_objTextWrapper.height() - totalTextHeight) / 2;
		
		positionElementsTop(false, startY);
	}
	
	
	/**
	 * position elements to bottom
	 */
	function positionElementBottom(){
		
		var totalTextHeight = getTotalTextHeight();
		var startY = g_objTextWrapper.height() - totalTextHeight - g_options.textpanel_padding_bottom;
		
		positionElementsTop(false, startY);
	}
	
	
	/**
	 * position elements inside the panel
	 */
	this.positionElements = function(animateHeight){

		//if(g_objPanel.is(":visible") == false)
			//trace("the text panel is hidden. can't position elements")
		
		//if height not set, position only top
		if(!g_options.textpanel_height || g_options.textpanel_text_valign == "top"){
			positionElementsTop(animateHeight);
			return(false);
		}
		
		switch(g_options.textpanel_text_valign){
			default:
			case "top":
				positionElementsTop(false);		//no animation in this case
			break;
			case "bottom":
				positionElementBottom();
			break;
			case "center":
			case "middle":
				positionElementsMiddle();
			break;
		}
		
	}
	
	
	/**
	 * set new panel height
	 */
	function setHeight(height, animateHeight){
		
		if(!animateHeight)
			var animateHeight = false;
		
		if(animateHeight == true){
			
			if(g_objBG){
				
				//avoid background jumps
				var currentHeight = g_objBG.height();
				if(height > currentHeight)
					g_objBG.height(height);				
			}
			
			var objCss = {height: height+"px"};
			g_objPanel.add(g_objTextWrapper).animate(objCss, g_options.textpanel_fade_duration);
			
		}else{
			
			if(g_objBG)
				g_objBG.height(height);		
			
			g_objPanel.add(g_objTextWrapper).height(height);
		}
		
	}
	
	
	
	
	/**
	 * init the panel
	 */
	this.init = function(objGallery, customOptions, optionsPrefix){
				
		g_gallery = objGallery;
		
		//change options by prefix
		if(optionsPrefix){
			g_optionsPrefix = optionsPrefix;
			customOptions = g_functions.convertCustomPrefixOptions(customOptions,g_optionsPrefix,"textpanel");			
			
		}
		
		if(customOptions)
			g_options = jQuery.extend(g_options, customOptions);
		
		//validation:
		if(g_options.textpanel_enable_title == false && g_options.textpanel_enable_description == false)
			throw new Error("Textpanel Error: The title or description must be enabled");
		
		if(g_options.textpanel_height && g_options.textpanel_height < 0)
			g_options.textpanel_height = null;
		
		//copy desc style from title
		if(g_options.textpanel_desc_style_as_title == true){
			if(!g_options.textpanel_desc_color)
				g_options.textpanel_desc_color = g_options.textpanel_title_color;
			
			if(!g_options.textpanel_desc_bold)
				g_options.textpanel_desc_bold = g_options.textpanel_title_bold;
			
			if(!g_options.textpanel_desc_font_family)
				g_options.textpanel_desc_font_family = g_options.textpanel_title_font_family;
			
			if(!g_options.textpanel_desc_font_size)
				g_options.textpanel_desc_font_size = g_options.textpanel_title_font_size;
			
			if(!g_options.textpanel_desc_text_align)
				g_options.textpanel_desc_text_align = g_options.textpanel_title_text_align;
		}
		
	}
	
	
	/**
	 * append the bullets html to some parent
	 */
	this.appendHTML = function(objParent, addClass){
		g_objParent = objParent;
		
		if(addClass){
			addClass = " "+addClass;
		}else
			addClass = "";
		
		var html = "<div class='ug-textpanel"+addClass+"'>";
		
		if(g_options.textpanel_enable_bg == true)
			html += "<div class='ug-textpanel-bg"+addClass+"'></div>";
		
		html += "<div class='ug-textpanel-textwrapper"+addClass+"'>";
		
		if(g_options.textpanel_enable_title == true)
			html += "<div class='ug-textpanel-title"+addClass+"'></div>";
		
		if(g_options.textpanel_enable_description == true)
			html += "<div class='ug-textpanel-description"+addClass+"'></div>";
		
		html += "</div></div>";
		
		objParent.append(html);
		
		g_objPanel = objParent.children(".ug-textpanel");
		g_objTextWrapper = g_objPanel.children(".ug-textpanel-textwrapper");
		
		setCss();
		
	}
	
	
	/**
	 * set panel css according the options
	 */
	function setCss(){
				
		//set background css		
		if(g_options.textpanel_enable_bg == true){
			g_objBG = g_objPanel.children(".ug-textpanel-bg");
			g_objBG.fadeTo(0,g_options.textpanel_bg_opacity);
			
			var objCssBG = {"background-color":g_options.textpanel_bg_color};
			objCssBG = jQuery.extend(objCssBG, g_options.textpanel_bg_css);
			
			g_objBG.css(objCssBG);
		}
		
		
		//set title css from options
		if(g_options.textpanel_enable_title == true){
			g_objTitle = g_objTextWrapper.children(".ug-textpanel-title");
			var objCssTitle = {};
			
			if(g_options.textpanel_title_color !== null)
				objCssTitle["color"] = g_options.textpanel_title_color;
			
			if(g_options.textpanel_title_font_family !== null)
				objCssTitle["font-family"] = g_options.textpanel_title_font_family;
			
			if(g_options.textpanel_title_text_align !== null)
				objCssTitle["text-align"] = g_options.textpanel_title_text_align;
			
			if(g_options.textpanel_title_font_size !== null)
				objCssTitle["font-size"] = g_options.textpanel_title_font_size+"px";
			
			if(g_options.textpanel_title_bold !== null){
				
				if(g_options.textpanel_title_bold === true)
					objCssTitle["font-weight"] = "bold";
				else
					objCssTitle["font-weight"] = "normal";
			
			}
			
			//set additional css
			if(g_options.textpanel_css_title)
				objCssTitle = jQuery.extend(objCssTitle, g_options.textpanel_css_title);
			
			g_objTitle.css(objCssTitle);
		}
		
		//set description css
		if(g_options.textpanel_enable_description == true){
			g_objDesc = g_objTextWrapper.children(".ug-textpanel-description");
			
			var objCssDesc = {};
			
			if(g_options.textpanel_desc_color !== null)
				objCssDesc["color"] = g_options.textpanel_desc_color;
			
			if(g_options.textpanel_desc_font_family !== null)
				objCssDesc["font-family"] = g_options.textpanel_desc_font_family;
			
			if(g_options.textpanel_desc_text_align !== null)
				objCssDesc["text-align"] = g_options.textpanel_desc_text_align;
			
			if(g_options.textpanel_desc_font_size !== null)
				objCssDesc["font-size"] = g_options.textpanel_desc_font_size+"px";
			
			if(g_options.textpanel_desc_bold !== null){
				
				if(g_options.textpanel_desc_bold === true)
					objCssDesc["font-weight"] = "bold";
				else
					objCssDesc["font-weight"] = "normal";
			
			}
			
			//set additional css
			if(g_options.textpanel_css_title)
				objCssDesc = jQuery.extend(objCssDesc, g_options.textpanel_css_description);
				
			g_objDesc.css(objCssDesc);
		}
		
	}
	
	/**
	 * on item change, set the text
	 */
	function onItemChange(){
		var objItem = g_gallery.getSelectedItem();
		t.setText(objItem.title, objItem.description);
	}
	
	
	/**
	 * init events
	 */
	function initEvents(){
		
		//on item change, set the text in the slider.
		jQuery(g_gallery).on(g_gallery.events.ITEM_CHANGE, onItemChange);
	}
	
	
	/**
	 * destroy the events
	 */
	this.destroy = function(){
		jQuery(g_gallery).off(g_gallery.events.ITEM_CHANGE);
	}
	
	/**
	 * run the text panel
	 */
	this.run = function(){
		
		t.setSizeByParent();
		
		initEvents();
	}
	
	/**
	 * set panel size
	 */
	this.setPanelSize = function(panelWidth, panelHeight){
		
		g_temp.setInternalHeight = true;
		
		if(!panelHeight)
			var panelHeight = 80;		//some default number
		else
			g_temp.setInternalHeight = false;
		
		if(g_options.textpanel_height)	
			panelHeight = g_options.textpanel_height;
		
		g_objPanel.width(panelWidth);
		g_objPanel.height(panelHeight);
		
		//set background size
		if(g_objBG){
			g_objBG.width(panelWidth);
			g_objBG.height(panelHeight);
		}
		
		//set textwrapper size and position
		var textWrapperWidth = panelWidth - g_options.textpanel_padding_left - g_options.textpanel_padding_right;
		var textWrapperLeft = g_options.textpanel_padding_left;
		
		g_functions.setElementSizeAndPosition(g_objTextWrapper, textWrapperLeft, 0, textWrapperWidth, panelHeight);
		
		//set text width
		if(g_objTitle)
			g_objTitle.width(textWrapperWidth);
		
		//set description height
		if(g_objDesc)
			g_objDesc.width(textWrapperWidth);
		
		if(g_temp.isFirstTime == false)
			t.positionElements(false);
	}
	
	
	/**
	 * set size by parent. the height is set to default meanwhile
	 */
	this.setSizeByParent = function(){
				
		var objSize = g_functions.getElementSize(g_objParent);
		t.setPanelSize(objSize.width);
	}
	
	/**
	 * set plain sext without other manipulations
	 */
	this.setTextPlain = function(title, description){

		if(g_objTitle)
			g_objTitle.html(title);
		
		if(g_objDesc)
			g_objDesc.html(description);
		
	}
	
	
	/**
	 * set html text
	 */
	this.setText = function(title, description){
		
		if(g_temp.isFirstTime == true){
			
			t.setTextPlain(title, description);
			
			g_temp.isFirstTime = false;
			
			t.positionElements(false);
		
		}else{		//width animation
			
			g_objTextWrapper.stop().fadeTo(g_options.textpanel_fade_duration,0,function(){
				
				t.setTextPlain(title, description);
				
				t.positionElements(true);
				
				jQuery(this).fadeTo(g_options.textpanel_fade_duration,1);
			});
			
		}
		
	}
	
	
		
	
	/**
	 * position the panel
	 */
	this.positionPanel = function(customTop, customLeft){
		
		var objCss = {};
		
		if(customTop !== undefined && customTop !== null){
			objCss.top = customTop;
			objCss.bottom = "auto";
		}else{
			
			switch(g_options.textpanel_align){
				case "top":
					objCss.top = g_options.textpanel_margin + "px";
				break;
				case "bottom":
					objCss.top = "auto";
					objCss.bottom = g_options.textpanel_margin + "px";
				break;
				case "middle":
					objCss.top = g_functions.getElementRelativePos(g_objPanel, "middle", g_options.textpanel_margin);
				break;
			}
			
		}
		
		if(customLeft !== undefined && customLeft !== null)
			objCss.left = customLeft;
			
		g_objPanel.css(objCss);
	}
	
	
	/**
	 * set custom options
	 */
	this.setOptions = function(objOptions){
		
		if(g_optionsPrefix)
			objOptions = g_functions.convertCustomPrefixOptions(objOptions, g_optionsPrefix, "textpanel");
		
		g_options = jQuery.extend(g_options, objOptions);
				
	}
	
	
	/**
	 * get html element
	 */
	this.getElement = function(){
		
		return(g_objPanel);
	}
	
	/**
	 * get element size
	 */
	this.getSize = function(){
		
		var objSize = g_functions.getElementSize(g_objPanel);
		return(objSize);
	}
	
	
	/**
	 * refresh panel size, position and contents
	 */
	this.refresh = function(toShow, noPosition, panelWidth, panelHeight){
		
		setCss();
		
		if(!panelWidth)
			t.setSizeByParent();
		else
			t.setPanelSize(panelWidth, panelHeight);
		
		t.positionElements(false);
		
		if(noPosition !== true)
			t.positionPanel();
		
		if(toShow === true)
			t.show();		
	}
	
	
	/**
	 * hide the panel
	 */
	this.hide = function(){
		
		g_objPanel.hide();
	}
	
	/**
	 * show the panel
	 */
	this.show = function(){
		g_objPanel.show();
	}
	
	/**
	 * get options
	 */
	this.getOptions = function(){
		return(g_options);
	}
	
	/**
	 * get text panel option
	 */
	this.getOption = function(optionName){
		
		if(g_options.hasOwnProperty(optionName) == false)
			return(null);
		
		return(g_options[optionName]);
	}
	
	
}

/** -------------- UGZoomButtonsPanel class ---------------------*/

/**
 * zoom buttons panel class
 */
function UGZoomButtonsPanel(){
	
	var t = this;
	var g_objPanel, g_objParent, g_objButtonPlus, g_objButtonMinus, g_objButtonReturn;
	var g_slider = new UGSlider;
	var g_functions = new UGFunctions();
	
	var g_options = {
		slider_zoompanel_skin: ""		//skin of the zoom panel, if empty inherit from gallery skin
	};
	
	var g_temp = {
		
	};
	
	
	/**
	 * init the panel
	 */
	this.init = function(objSlider, customOptions){
		
		g_slider = objSlider;
		
		if(customOptions)
			g_options = jQuery.extend(g_options, customOptions);		
	}
	
	
	/**
	 * append the bullets html to some parent
	 */
	this.appendHTML = function(objParent){
		g_objParent = objParent;
		
		var html = "<div class='ug-slider-control ug-zoompanel ug-skin-"+g_options.slider_zoompanel_skin+"'>";
		
			html += "<div class='ug-zoompanel-button ug-zoompanel-plus'></div>";
			html += "<div class='ug-zoompanel-button ug-zoompanel-minus ug-zoompanel-button-disabled'></div>";
			html += "<div class='ug-zoompanel-button ug-zoompanel-return ug-zoompanel-button-disabled'></div>";
		
		html += "</div>";
		
		objParent.append(html);
		
		g_objPanel = objParent.children(".ug-zoompanel");
		g_objButtonPlus = g_objPanel.children(".ug-zoompanel-plus");
		g_objButtonMinus = g_objPanel.children(".ug-zoompanel-minus");
		g_objButtonReturn = g_objPanel.children(".ug-zoompanel-return");
		
	}
	
	
	/**
	 * set objects - use it instead insert html
	 */
	this.setObjects = function(objButtonPlus, objButtonMinus, objButtonReturn){
		
		g_objButtonPlus = objButtonPlus;
		g_objButtonMinus = objButtonMinus;
		g_objButtonReturn = objButtonReturn;
		
		if(g_objButtonMinus)
			g_objButtonMinus.addClass("ug-zoompanel-button-disabled");
		
		if(g_objButtonReturn)
			g_objButtonReturn.addClass("ug-zoompanel-button-disabled");
			
	}
	
	
	/**
	 * get buttons element
	*/
	this.getElement = function(){
		
		return(g_objPanel);
	}
	
	
	/**
	 * check if the button disabled
	 */
	function isButtonDisabled(objButton){
		
		if(!objButton)
			return(true);
		
		if(objButton.hasClass("ug-zoompanel-button-disabled"))
			return(true);
		
		return(false);
	}
	
	
	/**
	 * disable some button
	 */
	function disableButton(objButton){
		
		if(objButton)
			objButton.addClass("ug-zoompanel-button-disabled");
	}
	
	/**
	 * enable some button
	 */
	function enableButton(objButton){
		
		if(objButton)
			objButton.removeClass("ug-zoompanel-button-disabled");		
	}
	
	
	/**
	 * on zoom change
	 */
	function onZoomChange(){
		
		//skip not image types
		if(g_slider.isCurrentSlideType("image") == false)
			return(true);
		
		var isFit = g_slider.isCurrentSlideImageFit();
		
		if(isFit == true){		//if fit, disable buttons
			
			if(isButtonDisabled(g_objButtonMinus) == false){			
				disableButton(g_objButtonMinus);
				disableButton(g_objButtonReturn);
			}
			
		}else{	//if not fit, enable minus buttons
			
			if(isButtonDisabled(g_objButtonMinus) == true){
				enableButton(g_objButtonMinus);
				enableButton(g_objButtonReturn);				
			}
			
		}
			
	}
	
	/**
	 * init zoompanel events
	 */
	t.initEvents = function(){
		
		//add hover class on buttons
		g_functions.addClassOnHover(g_objButtonPlus, "ug-button-hover");
		g_functions.addClassOnHover(g_objButtonMinus, "ug-button-hover");
		g_functions.addClassOnHover(g_objButtonReturn, "ug-button-hover");
		
		//set buttons click events
		
		g_functions.setButtonOnClick(g_objButtonPlus, function(){
			
			if(isButtonDisabled(g_objButtonPlus) == true)
				return(true);
			
			g_slider.zoomIn();
		});
		
		g_functions.setButtonOnClick(g_objButtonMinus, function(){
			
			if(isButtonDisabled(g_objButtonMinus) == true)
				return(true);
			
			g_slider.zoomOut();
		});
		
		g_functions.setButtonOnClick(g_objButtonReturn, function(){
			
			if(isButtonDisabled(g_objButtonReturn) == true)
				return(true);
			
			g_slider.zoomBack();
		});
				
		//on zoom change event
		jQuery(g_slider).on(g_slider.events.ZOOM_CHANGE,onZoomChange);
		jQuery(g_slider).on(g_slider.events.ITEM_CHANGED,onZoomChange);
	
	}
	
	
}


/** -------------- UgBullets class ---------------------*/

function UGBullets(){
	
	var t = this, g_numBullets = 0, g_gallery = new UniteGalleryMain();
	var g_objBullets, g_objParent, g_activeIndex = -1, g_bulletWidth;
	var g_functions = new UGFunctions();
	
	var g_temp = {
		isInited:false
	};
	
	var g_options = {
		bullets_skin: "",					//bullets_skin: ""		//skin of the bullets, if empty inherit from gallery skin
		bullets_addclass: "",					//bullets object class addition
		bullets_space_between:-1			//set the space between bullets. If -1 then will be set default space from the skins
	}
	
	
	/**
	 * the events
	 */
	this.events = {
		BULLET_CLICK : "bullet_click"
	};
	
	/**
	 * init the bullets
	 */
	this.init = function(gallery, customOptions, numBullets){
		g_gallery = gallery;
		
		if(numBullets)
			g_numBullets = numBullets;
		else	
			g_numBullets = g_gallery.getNumItems();
		
		g_temp.isInited = true;
		g_options = jQuery.extend(g_options, customOptions);
		
		if(g_options.bullets_skin == "")
			g_options.bullets_skin = g_options.gallery_skin;
		
	}
	
	/**
	 * add bullets to the html
	 */
	function setHtmlBullets(){
		var html = "";
		
		var addHtml = "";
		if(g_options.bullets_space_between != -1)
			addHtml = " style='margin-left:" + g_options.bullets_space_between + "px'";
		
		for(var i=0; i< g_numBullets; i++){
			if(i == 0)
				html += "<div class='ug-bullet'></div>";
			else
				html += "<div class='ug-bullet'"+addHtml+"></div>";
		}
		
		g_objBullets.html(html);
		
		//set bullet width value
		if(!g_bulletWidth){
			var objBullet = g_objBullets.find(".ug-bullet:first-child");
			if(objBullet.length)
				g_bulletWidth = objBullet.width();
		}
	}

	/**
	 * get total bullets width
	 */
	this.getBulletsWidth = function(){
		if(g_numBullets == 0)
			return(0);
		
		if(!g_bulletWidth)
			return(0);
		
		var totalWidth = g_numBullets*g_bulletWidth+(g_numBullets-1)*g_options.bullets_space_between;
		return(totalWidth);
	}
	
	
	/**
	 * append the bullets html to some parent
	 */
	this.appendHTML = function(objParent){
		g_objParent = objParent;
		
		validateInited();
		var addClass = "";
		if(g_options.bullets_addclass != "")
			addClass = " " + g_options.bullets_addclass;
			
		var html = "<div class='ug-slider-control ug-bullets ug-skin-"+g_options.bullets_skin + addClass+"'>";
		
		html += "</div>";
		
		g_objBullets = jQuery(html);
		
		objParent.append(g_objBullets);
		
		setHtmlBullets();
		
		initEvents();
	}	
	
	
	/**
	 * update number of bullets
	 */
	this.updateNumBullets = function(numBullets){
		
		g_numBullets = numBullets;
		setHtmlBullets();
		initEvents();
	}
	
	
	/**
	 * 
	 * on bullet click
	 */
	function onBulletClick(objBullet){
				
		//filter not active only
		if(t.isActive(objBullet) == true)
			return(true);
		
		var index = objBullet.index();
			
		jQuery(t).trigger(t.events.BULLET_CLICK, index);
	}
	
	
	/**
	 * init the bullets events
	 * trigger bullet click event
	 */
	function initEvents(){
		
		var objBullets = g_objBullets.children(".ug-bullet");
		
		g_functions.setButtonOnClick(objBullets, onBulletClick);
		
		objBullets.on("mousedown mouseup",function(event){
			//event.preventDefault();
			return(false);
		});
		
	}
	
	
	/**
	 * get the bullets element
	 */
	this.getElement = function(){
		return g_objBullets;
	}
	
	
	/**
	 * set some item active
	 */
	this.setActive = function(index){
		validateInited();
		validateIndex(index);
		
		var children = g_objBullets.children(".ug-bullet");
		children.removeClass("ug-bullet-active");
		
		var bullet = jQuery(children[index]);
		bullet.addClass("ug-bullet-active");
		
		g_activeIndex = index;
	}

	
	/**
	 * check if the bullet is active
	 */
	this.isActive = function(index){
		validateIndex(index);
		
		if(typeof index != "number")
			var objBullet = index;
		else{
			var objBullet = g_objBullets.children(".ug-bullet")[index];			
		}
		
		if(objBullet.hasClass("ug-bullet-active"))
				return(true);
		
		return(false);
	}
	
	
	/**
	 * get bullets number
	 */
	this.getNumBullets = function(){
		return(g_numBullets);
	}
	
	/**
	 * validate bullets index
	 */
	function validateIndex(index){
		if(index < 0 || index >= g_numBullets)
			throw new Error("wrong bullet index: " + index);
	}
	
	
	/**
	 * validate that the bullets are inited
	 */
	function validateInited(){
		
		if(g_temp.isInited == true)
			return(true);
		
		throw new Error("The bullets are not inited!");
	}
	
	
	
}

/** -------------- UgProgressBar class ---------------------*/

function UGProgressBar(){
	
	var t = this, g_isInited = false;
	var g_percent = 0, g_objBar, g_objInner, g_functions = new UGFunctions();
	
	var g_options = {
		slider_progressbar_color:"#ffffff",			//progress bar color
		slider_progressbar_opacity: 0.6,			//progress bar opacity
		slider_progressbar_line_width: 5			//progress bar line width
	}
	
	
	/**
	 * put progress pie to some wrapper
	 */
	this.put = function(g_objWrapper, userOptions){
		
		if(userOptions)
			g_options = jQuery.extend(g_options, userOptions);
		
		g_objWrapper.append("<div class='ug-progress-bar'><div class='ug-progress-bar-inner'></div></div>");
		g_objBar = g_objWrapper.children(".ug-progress-bar");
		g_objInner = g_objBar.children(".ug-progress-bar-inner");
		
		//init the objects
		g_objInner.css("background-color", g_options.slider_progressbar_color);
		g_objBar.height(g_options.slider_progressbar_line_width);
		g_objInner.height(g_options.slider_progressbar_line_width);
		g_objInner.width("0%");
		
		//set opacity old way (because ie bug)
		var opacity = g_options.slider_progressbar_opacity;
		
		var objInnerHTML = g_objInner[0];
		objInnerHTML.style.opacity = opacity;
		objInnerHTML.style.filter = 'alpha(opacity=' + opacity*100 + ')';
	}
	
	
	/**
	 * put the pie hidden
	 */
	this.putHidden = function(g_objWrapper, userOptions){
		t.put(g_objWrapper, userOptions);
		g_objBar.hide();
	}
	
	/**
	 * get the bar object
	 */
	this.getElement = function(){
		
		return(g_objBar);
	}
	
	/**
	 * set progress bar size
	 */
	this.setSize = function(width){
		
		g_objBar.width(width);
		g_objInner.width(width);
		t.draw();
	}
	
	
	/**
	 * set position
	 */
	this.setPosition = function(left, top, offsetLeft, offsetTop){
		
		g_functions.placeElement(g_objBar, left, top, offsetLeft, offsetTop);
	}
	
	
	/**
	 * draw the progress bar
	 */
	this.draw = function(){
		var innerWidth = g_percent * 100;
		
		g_objInner.width(innerWidth + "%");
	}
	
	
	/**
	 * set and draw the progress
	 */
	this.setProgress = function(percent){
		
		g_percent = g_functions.normalizePercent(percent);
		
		//debugLine(g_percent, true);
		
		t.draw();
	}
	
	/**
	 * get type string
	 */
	this.getType = function(){
		return("bar");
	}
	
}

/** -------------- UgProgressPie class ---------------------*/

function UGProgressPie(){
	
	var t = this, g_isInited = false;
	var g_percent, g_objPie, g_functions = new UGFunctions();
	
	var g_options = {
		slider_progresspie_type_fill: false,		//false is stroke, true is fill - the progress pie type, stroke of fill
		slider_progresspie_color1: "#B5B5B5", 		//the first color of the progress pie
		slider_progresspie_color2: "#E5E5E5",		//progress pie second color 
		slider_progresspie_stroke_width: 6,			//progress pie stroke width 
		slider_progresspie_width: 30,				//progess pie width
		slider_progresspie_height:30				//progress pie height
	}
	
	
	/**
	 * put progress pie to some wrapper
	 */
	this.put = function(g_objWrapper, userOptions){
		
		if(userOptions)
			g_options = jQuery.extend(g_options, userOptions);
			
		g_objWrapper.append("<canvas class='ug-canvas-pie' width='"+g_options.slider_progresspie_width+"' height='"+g_options.slider_progresspie_height+"'></canvas>");
		g_objPie = g_objWrapper.children(".ug-canvas-pie");
	}
	
	
	/**
	 * put the pie hidden
	 */
	this.putHidden = function(g_objWrapper, userOptions){
		t.put(g_objWrapper, userOptions);
		draw(0.1);
		g_objPie.hide();
	}
	
	
	/**
	 * get jquery object
	 */
	this.getElement = function(){
		return(g_objPie);
	}
	
	/**
	 * set position
	 */
	this.setPosition = function(left, top){
		
		g_functions.placeElement(g_objPie, left, top);
		
	}
	
	/**
	 * get the height and width of the object
	 */
	this.getSize = function(){
		
		var obj = {
			width: g_options.slider_progresspie_width,
			height: g_options.slider_progresspie_height
		};
		
		return(obj);
	}	
	
	/**
	 * draw the progress pie
	 */
	function draw(percent){
		
		if(!percent)
			var percent = 0;
		
		var radius = Math.min(g_options.slider_progresspie_width, g_options.slider_progresspie_height) / 2;
		
		var ctx = g_objPie[0].getContext('2d');
		
		//init the context
		if(g_isInited == false){
			
			g_isInited = true;
			
			ctx.rotate(Math.PI*(3/2));
			ctx.translate(-2 * radius,0);
		}		
		
		ctx.clearRect(0,0,g_options.slider_progresspie_width, g_options.slider_progresspie_height);
		
		var centerX = g_options.slider_progresspie_width / 2;
		var centerY = g_options.slider_progresspie_height / 2;
	    
		//draw main arc
		var startPoint = 0;
		var endPoint = percent * Math.PI * 2;
				
	    
		if(g_options.slider_progresspie_type_fill == true){		//fill
			
			ctx.beginPath();
				ctx.moveTo(centerX, centerY); 
			    ctx.arc(centerX,centerY,radius,startPoint, endPoint);
			    ctx.lineTo(centerX, centerY); 
			    
			    ctx.fillStyle = g_options.slider_progresspie_color1;
			    ctx.fill();
		    ctx.closePath();
		    
		}else{		//stroke
		    ctx.globalCompositeOperation = "source-over";
			
			ctx.beginPath();
				ctx.moveTo(centerX, centerY); 
			    ctx.arc(centerX,centerY,radius,startPoint, endPoint);
			    ctx.lineTo(centerX, centerY); 
			    
			    ctx.fillStyle = g_options.slider_progresspie_color1;
			    ctx.fill();
			ctx.closePath();
		    
		    ctx.globalCompositeOperation = "destination-out";
			
			var radius2 = radius - g_options.slider_progresspie_stroke_width;
		    
			ctx.beginPath();
								
				ctx.moveTo(centerX, centerY); 
			    ctx.arc(centerX,centerY,radius2,startPoint, endPoint);
			    ctx.lineTo(centerX, centerY); 
			    
			    ctx.fillStyle = g_options.slider_progresspie_color1;
			    ctx.fill();
			    
			ctx.closePath();
		}
	    
	    
		//draw rest arc (only on fill type):
	    if(g_options.slider_progresspie_type_fill == true){
			startPoint = endPoint;
			endPoint = Math.PI * 2;
			ctx.beginPath();
			    ctx.arc(centerX,centerY,radius,startPoint, endPoint);
			    ctx.lineTo(centerX, centerY); 
		    ctx.fillStyle = g_options.slider_progresspie_color2;
		    ctx.fill();
		    ctx.closePath();	    	
	    }
	    
	}
	
	
	/**
	 * set progress (0-1)
	 */
	this.setProgress = function(percent){
		
		percent = g_functions.normalizePercent(percent);
		
		g_percent = percent;
		draw(percent);
	}
	
	/**
	 * get type string
	 */
	this.getType = function(){
		return("pie");
	}
	
}
