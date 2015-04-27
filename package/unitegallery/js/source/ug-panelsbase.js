/** -------------- Panel Base Functions ---------------------*/

function UGPanelsBase(){
	
	var g_temp, g_panel, g_objPanel, g_options, g_objThis;
	var g_gallery = new UniteGalleryMain();
	var t = this, g_objHandle, g_objGallery;
	var g_functions = new UGFunctions();
	
	
	/**
	 * init the base panel
	 */
	this.init = function(gallery, g_tempArg, g_panelArg, options, g_objThisArg){
		g_temp = g_tempArg; 
		g_panel = g_panelArg;
		g_gallery = gallery;
		g_options = options;
		g_objThis = g_objThisArg;
		
		g_objGallery = jQuery(g_gallery);
	}

	/**
	 * set common panels html
	 */
	this.setHtml = function(g_objPanelArg){
		
		g_objPanel = g_objPanelArg;
		
		if(g_temp.panelType == "strip")
			var enable_handle = g_options.strippanel_enable_handle;
		else
			var enable_handle = g_options.gridpanel_enable_handle;
		
		// add handle
		if (enable_handle == true) {
			g_objHandle = new UGPanelHandle();
			g_objHandle.init(g_panel, g_objPanel, g_options, g_temp.panelType, g_gallery);
			g_objHandle.setHtml();
		}
		
		
		//set disabled at start if exists
		if(g_temp.isDisabledAtStart === true){
			var html = "<div class='ug-panel-disabled-overlay'></div>";
			g_objPanel.append(html);
			
			setTimeout(function(){
				g_objPanel.children(".ug-panel-disabled-overlay").hide();
			}, g_temp.disabledAtStartTimeout);
		
		}
		
	}
	
	
	/**
	 * place common elements
	 */
	this.placeElements = function(){
		
		// place handle
		if (g_objHandle)
			g_objHandle.placeHandle();		
	}
	
	
	/**
	 * init common events
	 */
	this.initEvents = function(){
		
		// set handle events
		if (g_objHandle){
			g_objHandle.initEvents();
			
			//set on slider action events
			g_objGallery.on(g_gallery.events.SLIDER_ACTION_START, function(){			
				g_objHandle.hideHandle();
			});
			
			g_objGallery.on(g_gallery.events.SLIDER_ACTION_END, function(){			
				g_objHandle.showHandle();
			});
			
		}
		
	}
	
	/**
	 * destroy the panel events
	 */
	this.destroy = function(){
		
		if(g_objHandle){
			g_objHandle.destroy();
			g_objGallery.off(g_gallery.events.SLIDER_ACTION_START);
			g_objGallery.off(g_gallery.events.SLIDER_ACTION_END);
		}
		
	}
	
	/**
	 * place panel with some animation
	 */
	function placePanelAnimation(panelDest, functionOnComplete) {

		switch (g_temp.orientation) {
		case "right": // vertical
		case "left":
			var objCss = {
				left : panelDest + "px"
			};
			break;
		case "top":
		case "bottom":
			var objCss = {
				top : panelDest + "px"
			};
			break;
		}

		g_objPanel.stop(true).animate(objCss, {
			duration : 300,
			easing : "easeInOutQuad",
			queue : false,
			complete : function() {
				if (functionOnComplete)
					functionOnComplete();
			}
		});

	}
	
	
	/**
	 * place the panel without animation
	 * 
	 * @param panelDest
	 */
	function placePanelNoAnimation(panelDest) {

		switch (g_temp.orientation) {
		case "right": // vertical
		case "left":
			g_functions.placeElement(g_objPanel, panelDest, null);
			break;
		case "top":
		case "bottom":
			g_functions.placeElement(g_objPanel, null, panelDest);
			break;
		}
	}
	
	/**
	 * event on panel slide finish
	 */
	function onPanelSlideFinish() {

		g_objThis.trigger(g_panel.events.FINISH_MOVE);

	}
	
	
	/**
	 * open the panel
	 */
	this.openPanel = function(noAnimation) {

		if (!noAnimation)
			var noAnimation = false;

		if (g_objPanel.is(":animated"))
			return (false);

		if (g_temp.isClosed == false)
			return (false);

		g_temp.isClosed = false;

		g_objThis.trigger(g_panel.events.OPEN_PANEL);

		if (noAnimation === false)
			placePanelAnimation(g_temp.originalPos, onPanelSlideFinish);
		else {

			placePanelNoAnimation(g_temp.originalPos);
			onPanelSlideFinish();
		}

	}

	
	/**
	 * close the panel (slide in)
	 */
	this.closePanel = function(noAnimation) {

		if (!noAnimation)
			var noAnimation = false;

		if (g_objPanel.is(":animated"))
			return (false);

		if (g_temp.isClosed == true)
			return (false);

		var panelDest = t.getClosedPanelDest();

		g_temp.isClosed = true;

		g_objThis.trigger(g_panel.events.CLOSE_PANEL);

		if (noAnimation === false)
			placePanelAnimation(panelDest, onPanelSlideFinish);
		else {
			placePanelNoAnimation(panelDest);
			onPanelSlideFinish();
		}

	}
	
	/**
	 * set the panel that it's in closed state, and set original pos for opening
	 * later
	 */
	this.setClosedState = function(originalPos) {
		
		g_temp.originalPos = originalPos;
		g_objThis.trigger(g_panel.events.CLOSE_PANEL);

		g_temp.isClosed = true;
	}

	/**
	 * set the panel opened state
	 */
	this.setOpenedState = function(originalPos) {
		g_objThis.trigger(g_panel.events.OPEN_PANEL);

		g_temp.isClosed = false;
	}

	/**
	 * get closed panel destanation
	 */
	this.getClosedPanelDest = function() {

		var objPanelSize = g_functions.getElementSize(g_objPanel), panelDest;

		switch (g_temp.orientation) {
		case "left":
			g_temp.originalPos = objPanelSize.left;
			panelDest = -g_temp.panelWidth;
			break;
		case "right":
			g_temp.originalPos = objPanelSize.left;
			var gallerySize = g_gallery.getSize();
			panelDest = gallerySize.width;
			break;
		case "top":
			g_temp.originalPos = objPanelSize.top;
			panelDest = -g_temp.panelHeight;
			break;
		case "bottom":
			g_temp.originalPos = objPanelSize.top;
			var gallerySize = g_gallery.getSize();
			panelDest = gallerySize.height;
			break;
		}

		return (panelDest);
	}


	/**
	 * tells if the panel is closed
	 */
	this.isPanelClosed = function() {

		return (g_temp.isClosed);
	}
	
	
	/**
	 * set the panel disabled at start, called after init before setHtml
	 * it's enabled again after timeout end
	 */
	this.setDisabledAtStart = function(timeout){
		
		if(timeout <= 0)
			return(false);
			
		g_temp.isDisabledAtStart = true;
		g_temp.disabledAtStartTimeout = timeout;
		
	}
	
	
}


/** -------------- Panel Handle object ---------------------*/

function UGPanelHandle(){
	
	var t = this, g_objPanel, g_panel, g_objHandleTip, g_panelOptions = {};
	var g_functions = new UGFunctions();
	
	var g_options = {
			panel_handle_align: "top",		//top, middle, bottom , left, right, center - close handle tip align on the handle bar according panel orientation
			panel_handle_offset: 0,			//offset of handle bar according the valign
			panel_handle_skin: 0			//skin of the handle, if empty inherit from gallery skin
	};
	
	
	/**
	 * init the handle
	 */
	this.init = function(panel, objPanel, panelOptions, panelType, gallery){
		g_panel = panel;
		g_objPanel = objPanel;
		
		//set needed options
		switch(panelType){		
			case "grid":
				g_options.panel_handle_align = panelOptions.gridpanel_handle_align;
				g_options.panel_handle_offset = panelOptions.gridpanel_handle_offset;
				g_options.panel_handle_skin = panelOptions.gridpanel_handle_skin;
			break;
			case "strip":
				g_options.panel_handle_align = panelOptions.strippanel_handle_align;
				g_options.panel_handle_offset = panelOptions.strippanel_handle_offset;
				g_options.panel_handle_skin = panelOptions.strippanel_handle_skin;
			break;
			default:
				throw new Error("Panel handle error: wrong panel type: " + panelType);			
			break;
		}
		
		//set arrows skin:
		var galleryOptions = gallery.getOptions();
		var globalSkin = galleryOptions.gallery_skin;		
		if(g_options.panel_handle_skin == "")
			g_options.panel_handle_skin = globalSkin;
		
		
	}
	
	
	/**
	 * set handle html
	 */
	this.setHtml = function(){
		
		var orientation = g_panel.getOrientation();
				
		var classTip = "ug-panel-handle-tip";
		
		switch(orientation){
			case "right":
				classTip += " ug-handle-tip-left";				
			break;
			case "left":
				classTip += " ug-handle-tip-right";
			break;
			case "bottom":
				classTip += " ug-handle-tip-top";				
			break;
			case "top":
				classTip += " ug-handle-tip-bottom";
			break;
		}
		
		g_objPanel.append("<div class='"+classTip+" ug-skin-" + g_options.panel_handle_skin + "'></div>");
		g_objHandleTip = g_objPanel.children(".ug-panel-handle-tip");
	}
	
	
	/**
	 * remove hover state of the tip
	 */
	function removeHoverState(){
				
		g_objHandleTip.removeClass("ug-button-hover");
	}
	
	/**
	 * add closed state class
	 */
	function setClosedState(){
				
		g_objHandleTip.addClass("ug-button-closed");		
	}
	
	/**
	 * add closed state class
	 */
	function removeClosedState(){
		g_objHandleTip.removeClass("ug-button-closed");		
	}

	/**
	 * on handle click, close or open panel
	 */
	function onHandleClick(event){
		
		event.stopPropagation();
		event.stopImmediatePropagation();
		
		if(g_functions.validateClickTouchstartEvent(event.type) == false)
			return(true);
		
		if(g_panel.isPanelClosed())
			g_panel.openPanel();
		else
			g_panel.closePanel();
	}
	
	/**
	 * init events
	 */
	this.initEvents = function(){
		g_functions.addClassOnHover(g_objHandleTip);
		g_objHandleTip.bind("click touchstart", onHandleClick);
		
		//on panel open
		jQuery(g_panel).on(g_panel.events.OPEN_PANEL, function(){
			removeHoverState();
			removeClosedState();
		});
		
		//one panel close
		jQuery(g_panel).on(g_panel.events.CLOSE_PANEL, function(){
			removeHoverState();
			setClosedState();
		});
		
	}
	
	/**
	 * destroy the handle panel events
	 */
	this.destroy = function(){
		g_functions.destroyButton(g_objHandleTip);
		jQuery(g_panel).off(g_panel.events.OPEN_PANEL);
		jQuery(g_panel).off(g_panel.events.CLOSE_PANEL);
	}
	
	
	
	/**
	 * check and fix align option, set write direction
	 */
	function checkAndFixAlign(){
		var orientation = g_panel.getOrientation();
		
		switch(orientation){
			case "right":
			case "left":
				if(g_options.panel_handle_align != "top" && g_options.panel_handle_align != "bottom")
					g_options.panel_handle_align = "top";
			break;
			case "bottom":
				if(g_options.panel_handle_align != "left" && g_options.panel_handle_align != "right")
					g_options.panel_handle_align = "left";
			break;
			case "top":
				if(g_options.panel_handle_align != "left" && g_options.panel_handle_align != "right")
					g_options.panel_handle_align = "right";				
			break;
		}		
		
	}
	
	
	/**
	 * place the panel
	 */
	this.placeHandle = function(){
		var handleSize = g_functions.getElementSize(g_objHandleTip);
		
		checkAndFixAlign();
				
		var orientation = g_panel.getOrientation();
		
		switch(orientation){
			case "left":
				g_functions.placeElement(g_objHandleTip, "right", g_options.panel_handle_align, -handleSize.width);
			break;
			case "right":
				g_functions.placeElement(g_objHandleTip, -handleSize.width, g_options.panel_handle_align, 0 ,g_options.panel_handle_offset);
			break;
			case "top":
				g_functions.placeElement(g_objHandleTip, g_options.panel_handle_align, "bottom", g_options.panel_handle_offset, -handleSize.height);
			break;
			case "bottom":
				g_functions.placeElement(g_objHandleTip, g_options.panel_handle_align, "top", g_options.panel_handle_offset, -handleSize.height);
			break;
			default:
				throw new Error("Wrong panel orientation: " + orientation);
			break;
		}
		
	}
	
	/**
	 * hide the handle
	 */
	this.hideHandle = function(){
		
		if(g_objHandleTip.is(":visible") == true)
			g_objHandleTip.hide();
	
	}
	
	/**
	 * show the handle
	 */
	this.showHandle = function(){
		
		if(g_objHandleTip.is(":visible") == false)
			g_objHandleTip.show();
		
	}
	
	
}
