/**
 * grid panel class addon to grid gallery
 */
function UGStripPanel() {

	var t = this, g_objThis = jQuery(this);
	var g_gallery = new UniteGalleryMain(), g_objGallery, g_objWrapper, g_objPanel;
	var g_functions = new UGFunctions(), g_objStrip = new UGThumbsStrip(), g_panelBase = new UGPanelsBase();
	var g_objButtonNext, g_objButtonPrev;

	this.events = {
		FINISH_MOVE : "gridpanel_move_finish", // called after close or open panel (slide finish).
		OPEN_PANEL : "open_panel", 			   // called before opening the panel.
		CLOSE_PANEL : "close_panel" 		   // called before closing the panel.
	};

	var g_options = {

		strippanel_vertical_type : false, // true, false - specify if the panel is vertical or horizonatal type

		strippanel_padding_top : 8,       // space from top of the panel
		strippanel_padding_bottom : 8,    // space from bottom of the panel

		strippanel_padding_left : 0,      // space from left of the panel
		strippanel_padding_right : 0,     // space from right of the panel

		strippanel_enable_buttons : true, // enable buttons from the sides of the panel
		strippanel_buttons_skin : "",     // skin of the buttons, if empty inherit from gallery skin
										  
		strippanel_padding_buttons : 2,   // padding between the buttons and the panel

		strippanel_buttons_role : "scroll_strip",   // scroll_strip, advance_item - the role of the side buttons
		
		strippanel_enable_handle : true,  // enable grid handle
		strippanel_handle_align : "top",  // top, middle, bottom , left, right, center - close handle tip align on the handle bar according panel orientation
		strippanel_handle_offset : 0, 	  // offset of handle bar according the valign
										
		strippanel_handle_skin : "", 	  // skin of the handle, if empty inherit  from gallery skin

		strippanel_background_color : ""  // background color of the strip wrapper, if not set, it will be taken from the css
		
	};

	var g_defaults_vertical = {
		strip_vertical_type : true,
		strippanel_padding_left : 8,
		strippanel_padding_right : 8,
		strippanel_padding_top : 0,
		strippanel_padding_bottom : 0
	};

	var g_defaults_no_buttons = {
		strippanel_padding_left : 8,
		strippanel_padding_right : 8,
		strippanel_padding_top : 8,
		strippanel_padding_bottom : 8
	};

	var g_temp = {
		panelType: "strip",
		panelWidth : 0,
		panelHeight : 0,
		isEventsInited : false,
		isClosed : false,
		orientation : null,
		originalPos : null,
		isFirstRun : true
	};

	/**
	 * init the panel
	 */
	function initPanel(gallery, customOptions) {
		g_gallery = gallery;

		g_objGallery = jQuery(g_gallery);

		g_options = jQuery.extend(g_options, customOptions);

		var repeatCustomOptions = false;

		if (g_options.strippanel_vertical_type == true) {
			g_options = jQuery.extend(g_options, g_defaults_vertical);
			repeatCustomOptions = true;
		}

		if (g_options.strippanel_enable_buttons == false) {
			g_options = jQuery.extend(g_options, g_defaults_no_buttons);
			repeatCustomOptions = true;
		}

		if (repeatCustomOptions == true)
			g_options = jQuery.extend(g_options, customOptions); // do the
		
		
		// set arrows skin:
		var galleryOptions = g_gallery.getOptions();
		var globalSkin = galleryOptions.gallery_skin;
		if (g_options.strippanel_buttons_skin == "")
			g_options.strippanel_buttons_skin = globalSkin;

		g_objWrapper = g_gallery.getElement();
		
		//init the base panel object:
		g_panelBase.init(g_gallery, g_temp, t, g_options, g_objThis);
		
		//init thumbs strip
		g_objStrip = new UGThumbsStrip();
		g_objStrip.init(g_gallery, g_options);
		
	}

	
	/**
	 * validate panel before run
	 */
	function validatePanelBeforeRun() {
				
		if (g_options.strippanel_vertical_type == false) { // horizontal
															// validate
			if (g_temp.panelWidth == 0) {
				throw new Error(
						"Strip panel error: The width not set, please set width");
				return (false);
			}

		} else { // vertical validate

			if (g_temp.panelHeight == 0) {
				throw new Error(
						"Strip panel error: The height not set, please set height");
				return (false);
			}

		}

		// validate orientation
		if (g_temp.orientation == null) {
			throw new Error(
					"Wrong orientation, please set panel orientation before run");
			return (false);
		}

		return (true);
	}

	/**
	 * run the panel
	 */
	function runPanel() {

		// validation
		if (g_temp.isFirstRun == true && validatePanelBeforeRun() == false)
			return (false);

		g_objStrip.run();
		
		setElementsSize();
		placeElements();
				
		initEvents();

		g_temp.isFirstRun = false;

		checkSideButtons();
	}

	/**
	 * set panel html
	 */
	function setPanelHtml(parentContainer) {
		
		if (!parentContainer)
			var parentContainer = g_objWrapper;

		// add panel wrapper
		parentContainer.append("<div class='ug-strip-panel'></div>");

		g_objPanel = parentContainer.children('.ug-strip-panel');

		// add arrows:
		if (g_options.strippanel_enable_buttons == true) {

			var arrowPrevClass = "ug-strip-arrow-left";
			var arrowNextClass = "ug-strip-arrow-right";
			if (g_options.strippanel_vertical_type == true) {
				arrowPrevClass = "ug-strip-arrow-up";
				arrowNextClass = "ug-strip-arrow-down";
			}

			g_objPanel.append("<div class='ug-strip-arrow " + arrowPrevClass
					+ " ug-skin-" + g_options.strippanel_buttons_skin
					+ "'><div class='ug-strip-arrow-tip'></div></div>");
			g_objPanel.append("<div class='ug-strip-arrow " + arrowNextClass
					+ " ug-skin-" + g_options.strippanel_buttons_skin
					+ "'><div class='ug-strip-arrow-tip'></div></div>");

		}
		
		g_panelBase.setHtml(g_objPanel);
		
		g_objStrip.setHtml(g_objPanel);
		
		if (g_options.strippanel_enable_buttons == true) {
			g_objButtonPrev = g_objPanel.children("." + arrowPrevClass);
			g_objButtonNext = g_objPanel.children("." + arrowNextClass);
		}

		setHtmlProperties();
	}

	/**
	 * set html properties according the options
	 */
	function setHtmlProperties() {

		// set panel background color
		if (g_options.strippanel_background_color != "")
			g_objPanel.css("background-color",
					g_options.strippanel_background_color);

	}

	/**
	 * set elements size horizontal type
	 */
	function setElementsSize_hor() {
		
		// get strip height
		var stripHeight = g_objStrip.getHeight();
		var panelWidth = g_temp.panelWidth;

		// set buttons height
		if (g_objButtonNext) {
			g_objButtonPrev.height(stripHeight);
			g_objButtonNext.height(stripHeight);

			// arrange buttons tip
			var prevTip = g_objButtonPrev.children(".ug-strip-arrow-tip");
			g_functions.placeElement(prevTip, "center", "middle");

			var nextTip = g_objButtonNext.children(".ug-strip-arrow-tip");
			g_functions.placeElement(nextTip, "center", "middle");
		}

		// set panel height
		var panelHeight = stripHeight + g_options.strippanel_padding_top
				+ g_options.strippanel_padding_bottom;

		// set panel size
		g_objPanel.width(panelWidth);
		g_objPanel.height(panelHeight);

		g_temp.panelHeight = panelHeight;

		// set strip size
		var stripWidth = panelWidth - g_options.strippanel_padding_left	- g_options.strippanel_padding_right;

		if (g_objButtonNext) {
			var buttonWidth = g_objButtonNext.outerWidth();
			stripWidth = stripWidth - buttonWidth * 2 - g_options.strippanel_padding_buttons * 2;
		}

		g_objStrip.resize(stripWidth);
	}

	/**
	 * set elements size vertical type
	 */
	function setElementsSize_vert() {
				
		// get strip width
		var stripWidth = g_objStrip.getWidth();
		var panelHeight = g_temp.panelHeight;
		
		// set buttons height
		if (g_objButtonNext) {
			g_objButtonPrev.width(stripWidth);
			g_objButtonNext.width(stripWidth);

			// arrange buttons tip
			var prevTip = g_objButtonPrev.children(".ug-strip-arrow-tip");
			g_functions.placeElement(prevTip, "center", "middle");

			var nextTip = g_objButtonNext.children(".ug-strip-arrow-tip");
			g_functions.placeElement(nextTip, "center", "middle");
		}

		// set panel width
		var panelWidth = stripWidth + g_options.strippanel_padding_left
				+ g_options.strippanel_padding_right;

		// set panel size
		g_objPanel.width(panelWidth);
		g_objPanel.height(panelHeight);

		g_temp.panelWidth = panelWidth;

		// set strip size
		var stripHeight = panelHeight - g_options.strippanel_padding_top
				- g_options.strippanel_padding_bottom;

		if (g_objButtonNext) {
			var buttonHeight = g_objButtonNext.outerHeight();
			stripHeight = stripHeight - buttonHeight * 2
					- g_options.strippanel_padding_buttons * 2;
		}

		g_objStrip.resize(stripHeight);
	}

	/**
	 * set elements size and place the elements
	 */
	function setElementsSize() {

		if (g_options.strippanel_vertical_type == false)
			setElementsSize_hor();
		else
			setElementsSize_vert();
	}

	/**
	 * place elements horizontally
	 */
	function placeElements_hor() {

		// place buttons
		if (g_objButtonNext) {
			g_functions.placeElement(g_objButtonPrev, "left", "top",
					g_options.strippanel_padding_left,
					g_options.strippanel_padding_top);
			g_functions.placeElement(g_objButtonNext, "right", "top",
					g_options.strippanel_padding_right,
					g_options.strippanel_padding_top);
		}

		var stripX = g_options.strippanel_padding_left;
		if (g_objButtonNext)
			stripX += g_objButtonNext.outerWidth()
					+ g_options.strippanel_padding_buttons;

		g_objStrip.setPosition(stripX, g_options.strippanel_padding_top);

	}

	/**
	 * place elements vertically
	 */
	function placeElements_vert() {

		// place buttons
		if (g_objButtonNext) {
			g_functions.placeElement(g_objButtonPrev, "left", "top",
					g_options.strippanel_padding_left,
					g_options.strippanel_padding_top);
			g_functions.placeElement(g_objButtonNext, "left", "bottom",
					g_options.strippanel_padding_left,
					g_options.strippanel_padding_bottom);
		}

		var stripY = g_options.strippanel_padding_top;
		if (g_objButtonNext)
			stripY += g_objButtonNext.outerHeight()
					+ g_options.strippanel_padding_buttons;

		g_objStrip.setPosition(g_options.strippanel_padding_left, stripY);
	}

	/**
	 * place elements
	 */
	function placeElements() {

		if (g_options.strippanel_vertical_type == false)
			placeElements_hor();
		else
			placeElements_vert();

		g_panelBase.placeElements();

	}



	function __________EVENTS___________() {
	}
	;

	/**
	 * on next button click
	 */
	function onNextButtonClick(objButton) {

		if (g_functions.isButtonDisabled(objButton))
			return (true);

		if (g_options.strippanel_buttons_role == "advance_item")
			g_gallery.nextItem();
		else
			g_objStrip.scrollForeward();
	}

	/**
	 * on previous button click
	 */
	function onPrevButtonClick(objButton) {

		if (g_functions.isButtonDisabled(objButton))
			return (true);

		if (g_options.strippanel_buttons_role == "advance_item")
			g_gallery.prevItem();
		else
			g_objStrip.scrollBack();
	}

	/**
	 * check buttons if they need to be disabled or not
	 */
	function checkSideButtons() {
				
		if (!g_objButtonNext)
			return (true);

		// if the strip not movable - disable both buttons
		if (g_objStrip.isMoveEnabled() == false) {
			g_functions.disableButton(g_objButtonPrev);
			g_functions.disableButton(g_objButtonNext);
			return (true);
		}
		
		// check the limits
		var limits = g_objStrip.getInnerStripLimits();
		var pos = g_objStrip.getInnerStripPos();
		
		if (pos >= limits.maxPos) {
			g_functions.disableButton(g_objButtonPrev);
		} else {
			g_functions.enableButton(g_objButtonPrev);
		}

		if (pos <= limits.minPos)
			g_functions.disableButton(g_objButtonNext);
		else
			g_functions.enableButton(g_objButtonNext);

	}

	/**
	 * on strip move event
	 */
	function onStripMove() {
		checkSideButtons();
	}

	/**
	 * on item change event, disable or enable buttons according the images
	 * position
	 */
	function onItemChange() {

		if (g_gallery.isLastItem())
			g_functions.disableButton(g_objButtonNext);
		else
			g_functions.enableButton(g_objButtonNext);

		if (g_gallery.isFirstItem())
			g_functions.disableButton(g_objButtonPrev);
		else
			g_functions.enableButton(g_objButtonPrev);

	}


	/**
	 * init panel events
	 */
	function initEvents() {

		if (g_temp.isEventsInited == true)
			return (false);
		
		g_temp.isEventsInited = true;
		
		// buttons events
		if (g_objButtonNext) {

			// add hove class
			g_functions.addClassOnHover(g_objButtonNext, "ug-button-hover");
			g_functions.addClassOnHover(g_objButtonPrev, "ug-button-hover");

			// add click events
			g_functions.setButtonOnClick(g_objButtonPrev, onPrevButtonClick);
			g_functions.setButtonOnClick(g_objButtonNext, onNextButtonClick);

			// add disable / enable buttons on strip move event
			if (g_options.strippanel_buttons_role != "advance_item") {
				
				jQuery(g_objStrip).on(g_objStrip.events.STRIP_MOVE, onStripMove);
				
				jQuery(g_objStrip).on(g_objStrip.events.INNER_SIZE_CHANGE, checkSideButtons);
				
				g_objGallery.on(g_gallery.events.SIZE_CHANGE, checkSideButtons);
				
			} else {
				var galleryOptions = g_gallery.getOptions();
				if (galleryOptions.gallery_carousel == false)
					jQuery(g_gallery).on(g_gallery.events.ITEM_CHANGE, onItemChange);
			}

		}

		g_panelBase.initEvents();
	}
	
	/**
	 * destroy the strip panel events
	 */
	this.destroy = function(){
		
		if(g_objButtonNext){
			g_functions.destroyButton(g_objButtonNext);
			g_functions.destroyButton(g_objButtonPrev);
			jQuery(g_objStrip).off(g_objStrip.events.STRIP_MOVE);
			jQuery(g_gallery).off(g_gallery.events.ITEM_CHANGE);
			jQuery(g_gallery).off(g_gallery.events.SIZE_CHANGE);
		}
		
		g_panelBase.destroy();
		g_objStrip.destroy();
	}
	
	
	/**
	 * get panel orientation
	 */
	this.getOrientation = function() {

		return (g_temp.orientation);
	}

	/**
	 * set panel orientation (left, right, top, bottom)
	 */
	this.setOrientation = function(orientation) {

		g_temp.orientation = orientation;
	}

	
	/**
	 * init the panel
	 */
	this.init = function(gallery, customOptions) {
		initPanel(gallery, customOptions);
	}

	/**
	 * run the panel
	 */
	this.run = function() {
		runPanel();
	}

	/**
	 * place panel html
	 */
	this.setHtml = function(parentContainer) {
		setPanelHtml(parentContainer);
	}

	/**
	 * get the panel element
	 */
	this.getElement = function() {
		return (g_objPanel);
	}

	/**
	 * get panel size object
	 */
	this.getSize = function() {

		var objSize = g_functions.getElementSize(g_objPanel);

		return (objSize);
	}

	/**
	 * set panel width (for horizonal type)
	 */
	this.setWidth = function(width) {

		g_temp.panelWidth = width;

	}

	/**
	 * set panel height (for vertical type)
	 */
	this.setHeight = function(height) {

		g_temp.panelHeight = height;

	}

	/**
	 * resize the panel
	 */
	this.resize = function(newWidth) {
		t.setWidth(newWidth);
		setElementsSize();
		placeElements();
	}
	
	this.__________Functions_From_Base_____ = function() {}
	
	/**
	 * tells if the panel is closed
	 */
	this.isPanelClosed = function() {		
		return (g_panelBase.isPanelClosed());
	}

	/**
	 * get closed panel destanation
	 */
	this.getClosedPanelDest = function() {
		return g_panelBase.getClosedPanelDest();
	}	
		
	/**
	 * open the panel
	 */	
	this.openPanel = function(noAnimation) {
		g_panelBase.openPanel(noAnimation);
	}
	
	
	/**
	 * close the panel (slide in)
	 */
	this.closePanel = function(noAnimation) {
		g_panelBase.closePanel(noAnimation);		
	}	
	
	/**
	 * set the panel opened state
	 */
	this.setOpenedState = function(originalPos) {
		g_panelBase.setOpenedState(originalPos);
	}

	/**
	 * set the panel that it's in closed state, and set original pos for opening later
	 */
	this.setClosedState = function(originalPos) {
		g_panelBase.setClosedState(originalPos);	
	}
	
	/**
	 * set custom thumbs of the strip
	 */
	this.setCustomThumbs = function(funcSetHtml){
		
		g_objStrip.setCustomThumbs(funcSetHtml);
	
	}
	
	/**
	 * set panel disabled at start
	 */
	this.setDisabledAtStart = function(timeout){
		
		g_panelBase.setDisabledAtStart(timeout);
		
	}
	
}

