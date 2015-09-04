/* ECMAScript 6 */
;(function($, window, document, undefined) {
	"use strict";

	var dropdown = {},
		hidden = {},
		settings = {},
		keycodes = [];

	keycodes['ESC'] = 27;

	/**
	 * ACTION FUNCTIONS:
	 */

	dropdown.callback = function(event, callback, elem) {
		if(callback == undefined) {
			return;
		}

		if(callback instanceof Function) {
			event.preventDefault();
			callback(elem);
		}
	};

	dropdown.changeDropdown = function(elem) {
		var value = $(elem).data('value'),
			text = $(elem).text(),
			group = $(elem).parent().data('group');

		hidden.val(value);
		$('#dropdown-hidden-select').empty().append(hidden);
		$('.dropdown-select').parent().append(hidden);
		$('.dropdown-select')
			.attr('data-value', value)
			.attr('data-group', group)
			.val(text);

		dropdown.hideAllGroups();
		dropdown.expandGroup($('.group[data-group=' + group + ']'));

		dropdown.deselectAllOptions('selected');
		dropdown.selectOption(value, 'selected');

		dropdown.hideList();
	};

	dropdown.expandGroup = function(group) {
		group.addClass('group-expanded').removeClass('group-collapsed');
		$('.items[data-group=' + group.data('group') + ']').slideDown();
		$('.dropdown-icon', group).html(settings.expandedIcon);
	};

	dropdown.collapseGroup = function(group) {
		group.addClass('group-collapsed').removeClass('group-expanded');
		$('.items[data-group=' + group.data('group') + ']').slideUp();
		$('.dropdown-icon', group).html(settings.collapsedIcon);
	};

	dropdown.hideAllGroups = function() {
		$('.group').each(function() {
			$(this).addClass('group-collapsed').removeClass('group-expanded');
			$('.items[data-group=' + $(this).data('group') + ']').hide();
			$('.dropdown-icon').html(settings.collapsedIcon);
		});
	};

	dropdown.toggleGroup = function() {
		var group = $(this);
		if(group.hasClass('group-collapsed')) {
			dropdown.expandGroup(group);
		} else {
			dropdown.collapseGroup(group);
		}
	};

	dropdown.selectOption = function(value, addClass) {
		$('.dropdown-option[data-value=' + value + ']')
		.addClass(addClass)
		.css({
			background: settings.selectedBackground,
			color: settings.selectedForeground,
		});
	};

	dropdown.deselectOption = function(value, removeClass) {
		$('.dropdown-option[data-value=' + value + ']')
		.removeClass(removeClass)
		.css({
			background: settings.background,
			color: settings.optionsColor,
		});
	};

	dropdown.deselectAllOptions = function(removeClass) {
		$('.dropdown-option')
		.removeClass(removeClass)
		.css({
			background: settings.background,
			color: settings.optionsColor,
		});
	};

	dropdown.hideList = function() {
		$('.dropdown-list').addClass('objHide').removeClass('objShow').hide();
	};

	dropdown.toggleList = function() {
		var list = $('.dropdown-list');
		if(list.hasClass('objHide')) {
			list.addClass('objShow').removeClass('objHide').show();
		} else {
			dropdown.hideList();
		}
	};

	/**
	 * BUILDER FUNCTIONS:
	 */

	dropdown.getOption = function(option, parentOption) {
		var classes = $(option).attr('class') || '',
			html = $('<p class="dropdown-option focusable" data-value="' + $(option).val() + '" >' + $(option).text() + '</p>')
				.addClass(classes)
				.addClass(parentOption ? 'group group-collapsed' : '')
				.css({
					cursor: 'pointer',
					'margin-top': '2%',
					'margin-bottom': '2%',
				});

		return html[0].outerHTML;
	};

	dropdown.getGroup = function(index, title, options, classes) {
		var items = '', group = '';
		$(options).each(function() {
			items = items + dropdown.getOption(this, false);
		});

		title = '<h3 class="focusable"><span class="dropdown-icon focusable">' + settings.collapsedIcon + '</span> ' + title + '</h3>';
		items = $('<div><div class="items focusable" data-group="' + index + '">' + items + '</div></div>');
		group = $('<div><div class="group focusable" data-group="' + index + '">' + title + '</div></div>');

		items.children()
			.hide()
			.css({
				color: settings.optionsColor,
				font: settings.optionsFont,
				'text-indent': '15px'
			});

		group.children()
			.addClass('group-collapsed')
			.addClass(classes)
			.css({
				cursor: 'pointer',
				color: settings.groupColor,
				font: settings.groupFont,
			});

		return '<div>' + group.html() + items.html() + '</div>';
	};

	dropdown.getSelect = function(old_dropdown) {
		var i = 0, html = '';

		$(old_dropdown).children().each(function() {
			if($(this).is('optgroup')) {
				html = html + dropdown.getGroup(i++, $(this).attr('label'), $(this).children(), $(this).attr('class'));
			} else {
				html = html + dropdown.getOption($(this), true);
			}
		});

		var input = $('<input class="dropdown-select focusable" type="text" />');
		input.css({
			width: settings.width,
			height: settings.height,
			color: settings.color,
			font: settings.font,
			background: settings.background
		});

		var arrow = $('<span class="dropdown-arrow focusable">' + settings.dropdownIcon + '</span>');
		arrow.css({
			font: settings.font,
			color: settings.color,
			position: 'relative',
			cursor: 'pointer',
			left: '-15px',
		});

		var select = $('<span>' + input[0].outerHTML + arrow[0].outerHTML + '</span>')[0].outerHTML;

		html = $('<div><span>' + select + '</span><div class="dropdown-list focusable">' + html + '</div></div>');
		$('.dropdown-list', html)
			.hide()
			.addClass('objHide')
			.css({
				position: 'absolute',
				color: settings.color,
				width: settings.width,
				height: settings.height,
				background: settings.background,
				border: settings.border
			});

		return html;
	};

	/**
	 * EVENT FUNCTIONS:
	 */

	dropdown.bindEvents = function() {
		$(this).on('click', '.group-expanded', dropdown.toggleGroup);
		$(this).on('click', '.group-collapsed', dropdown.toggleGroup);

		$('body').on('click', '.dropdown-select', dropdown.toggleList);
		$('body').on('click', '.dropdown-arrow', dropdown.toggleList);

		$(document)
			.keyup(function(e) {
				if(e.keyCode == keycodes['ESC']) {
					dropdown.hideList();
				}
			})
			.click(function(event) {
				if(!$(event.target).hasClass('focusable')) {
					dropdown.hideList();
				}
			});

		$('body')
			.on('click', '.dropdown-option', function(e) {
				var oldValue = String($('.dropdown-select').val().trim());

				dropdown.changeDropdown(this);
				dropdown.callback(e, settings.onClick, this);

				var newValue = String($(this).text().trim());
				if(oldValue.localeCompare(newValue) != 0) {
					dropdown.callback(e, settings.onChange, this);
				}
			});

		$('.dropdown-option')
			.mouseenter(function() {
				dropdown.selectOption($(this).data('value'), 'hovered');
			})
			.mouseleave(function() {
				if(!$(this).hasClass('selected')) {
					dropdown.deselectOption($(this).data('value'), 'hovered');
				}
			});

		if(settings.collapseOnHover) {
			$('.group').mouseenter(function() {
				dropdown.expandGroup($(this));
				$('.group[data-group!=' + $(this).data('group') + ']').each(function() {
					dropdown.collapseGroup($(this));
				});
			});
			// $('.group').mouseleave(function() {
			// 	$('.group[data-group!=' + $(this).data('group') + ']').each(function() {
			// 		dropdown.collapseGroup($(this));
			// 	});
			// });
		}
		
		var selected = $(':selected', hidden).val().trim();
		$('.dropdown-option[data-value=' + selected + ']').each(function() {
			dropdown.changeDropdown(this);
		});
	};

	/**
	 * BIND PLUGIN:
	 */

	$.fn.dropd = function(options) {
		settings = $.extend({
			color: '#556bf2',
			width: '100%',
			height: 'auto',
			background: 'white',
			border: this.css("border"),
			font: this.css("font"),
			groupColor: this.css("color"),
			groupFont: this.css("font"),
			optionsColor: this.css("color"),
			optionsFont: this.css("font"),
			selectedBackground: 'rgb(77, 144, 254)', //'#c0ffff',  //'yellow',
			selectedForeground: 'white',
			dropdownIcon: '&#x25BE;', //'<i class="fa fa-caret-down"></i>',
			expandedIcon: '&#x25BE;', //'<i class="fa fa-caret-down"></i>',
			collapsedIcon: '&#x25B8;', //'<i class="fa fa-caret-right"></i>',
			collapseOnHover: true,
			onClick: undefined,
			onChange: undefined,
		}, options || {});

		hidden = this.clone().hide();
		$(document).ready(dropdown.bindEvents); // Depends on 'hidden' object...
		this.parent().append('<div id="dropdown-hidden-select"></div>').append(hidden);

		var html = dropdown.getSelect(this);
		this.replaceWith(html.html());

		return this;
	};
})(window.jQuery, window, window.document);
