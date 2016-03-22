$(window).load(function() {
	var appVersion = navigator.appVersion;
	var fakeInputUseFlag = (appVersion.indexOf('MSIE 7.0') >= 0 || appVersion.indexOf('MSIE 8.0') >= 0 || appVersion.indexOf('MSIE 9.0') >= 0) ? true : false;
	//if (fakeInputUseFlag) {
		$(":input[placeholder]").each(function (index) {
			var pos = $(this).offset();
			if (!this.id) this.id = "jQueryVirtual_" + this.name + index;
			if (this.id) {
				var id = $(this).attr('id');

				$(this).parent().addClass('view_fakelabel');
				$(this).after("<label for='" + id + "' id='jQueryVirtual_label_" + id + "' class='fakeInput' style='display:inline'>" + $(this).attr("placeholder") + "</label>");
				if($.trim($(this).val()).length > 0) {
					$("#jQueryVirtual_label_" + id).hide();
				}
			}
		}).focus(function () {
			var $this = jQuery(this);
			$this.addClass("focusbox");
			jQuery("#jQueryVirtual_label_" + $this.attr("id")).hide();
		}).blur(function () {
			var $this = jQuery(this);
			$this.removeClass("focusbox");
			if(!jQuery.trim($this.val())) jQuery("#jQueryVirtual_label_" + $this.attr("id")).show();
			else jQuery("#jQueryVirtual_label_" + $this.attr("id")).hide();
		});
	//}
});
