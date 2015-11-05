/**
 tabs panel class addon to unite gallery
 */
function UGTabs(){
	
	var t = this, g_objThis = jQuery(this),g_objGallery;
	var g_gallery = new UniteGalleryMain(), g_functions = new UGFunctions();
	var g_objTabs, g_objSelect;
	

	var g_options = {
		tabs_type:"tabs",					//tabs type: tabs, select
		tabs_container: "#ug_tabs",			//tabs container
		tabs_class_selected: "ug-tab-selected"
	};
	
	this.events = {
		
	};
	
	
	/**
	 * init tabs function
	 */
	function initTabs(gallery, customOptions){
		g_gallery = gallery;
		
		g_objGallery = jQuery(g_gallery);
		
		g_options = jQuery.extend(g_options, customOptions);
		
		if(g_options.tabs_type == "select")
			g_objSelect = jQuery(g_options.tabs_container);
		else
			g_objTabs = jQuery(g_options.tabs_container + " .ug-tab");
		
	}
	
	
	
	/**
	 * run the tabs
	 */
	function runTabs(){
				
		initEvents();
	}
	
	
	/**
	 * request new gallery items
	 */
	function requestGalleryItems(catid){
		
		g_gallery.requestNewItems(catid);
		
	}
	
	
	/**
	 * on tab click
	 */
	function onTabClick(){
		
		var classSelected = g_options.tabs_class_selected;
		
		var objTab = jQuery(this);
		if(objTab.hasClass(classSelected))
			return(true);
		
		g_objTabs.not(objTab).removeClass(classSelected);
		objTab.addClass(classSelected);
		
		var catID = objTab.data("catid");
		if(!catID)
			return(true);
		
		requestGalleryItems(catID);
		
	}
	
	
	/**
	 * on select change
	 */
	function onSelectChange(){
		var objSelect = jQuery(this);
		var catID = objSelect.val();
		
		if(!catID)
			return(true);
		
		requestGalleryItems(catID);
	}
	
	
	/**
	 * init tabs events
	 */
	function initEvents(){
		
		if(g_options.tabs_type == "select")
			g_objSelect.change(onSelectChange);
		else
			g_objTabs.click(onTabClick);
	}
	
	/**
	 * destroy
	 */
	this.destroy = function(){
		
		if(g_objSelect)
			g_objSelect.off("change");
		
		if(g_objTabs)
			g_objTabs.off("click");
	}
	
	
	/**
	 * outer init function, move to inner init
	 */
	this.init = function(gallery, customOptions){
		initTabs(gallery, customOptions);
	}
	
	
	/**
	 * run the tabs
	 */
	this.run = function(){
		
		runTabs();
	}
	
	
}
