/*
 * DropD jQuery Dropdown v1.0.2
 * https://github.com/fjcastil/DropD
 *
 * Copyright (c) 2015 Frank Castillo
 * Dual licensed under the MIT and GPL licenses.
 * http://opensource.org/licenses/MIT
 * http://opensource.org/licenses/GPL-3.0
 *
 * Date: 2015-09-03 17:34:21 -0500 (Thu, 03 Aug 2015)
 * Revision: 2
 */
;(function($, window, document, undefined) {
	"use strict";

	var dropd = {},
		current = {},
		settings = {},
		keycodes = [];

	keycodes['ESC'] = 27;

	/**
	 * ACTION FUNCTIONS:
	 */

	dropd.callback = function(event, callback, elem) {
		if(callback == undefined) {
			return;
		}

		if(callback instanceof Function) {
			event.preventDefault();
			callback($(elem).data('value'), elem);
		}
	};

	dropd.changeDropdown = function(elem) {
		var value = $(elem).data('value'),
			text = $(elem).text(),
			group = $(elem).parent().data('group');

		$('.' + dropd.classSelect)
			.attr('data-value', value)
			.attr('data-group', group)
			.val(text);

		dropd.hideAllGroups();
		dropd.expandGroup($('.' + dropd.classGroup + '[data-group=' + group + ']'));

		dropd.deselectAllOptions('selected');
		dropd.selectOption(value, 'selected');

		dropd.hideList();
	};

	dropd.expandGroup = function(group) {
		group.addClass(dropd.classGroupExpanded).removeClass(dropd.classGroupCollapsed);
		$('.' + dropd.classItems + '[data-group=' + group.data('group') + ']').slideDown();
		$('.' + dropd.classIcon, group).html(settings.expandedIcon);
	};

	dropd.collapseGroup = function(group) {
		group.addClass(dropd.classGroupCollapsed).removeClass(dropd.classGroupExpanded);
		$('.' + dropd.classItems + '[data-group=' + group.data('group') + ']').slideUp();
		$('.' + dropd.classIcon, group).html(settings.collapsedIcon);
	};

	dropd.hideAllGroups = function() {
		$('.' + dropd.classGroup).each(function() {
			$(this).addClass(dropd.classGroupCollapsed).removeClass(dropd.classGroupExpanded);
			$('.' + dropd.classItems + '[data-group=' + $(this).data('group') + ']').hide();
			$('.' + dropd.classIcon).html(settings.collapsedIcon);
		});
	};

	dropd.toggleGroup = function() {
		var group = $(this);
		if(group.hasClass(dropd.classGroupCollapsed)) {
			dropd.expandGroup(group);
		} else {
			dropd.collapseGroup(group);
		}
	};

	dropd.selectOption = function(value, classes) {
		$('.' + dropd.classOption + '[data-value=' + value + ']')
		.addClass(classes)
		.css({
			background: settings.selectedBackground,
			color: settings.selectedForeground,
		});
	};

	dropd.deselectOption = function(value, classes) {
		$('.' + dropd.classOption + '[data-value=' + value + ']')
		.removeClass(classes)
		.css({
			background: settings.background,
			color: settings.optionsColor,
		});
	};

	dropd.deselectAllOptions = function(classes) {
		$('.' + dropd.classOption + '')
		.removeClass(classes)
		.css({
			background: settings.background,
			color: settings.optionsColor,
		});
	};

	dropd.hideList = function() {
		$('.' + dropd.classList).addClass('objHide').removeClass('objShow').hide();
	};

	dropd.toggleList = function() {
		var list = $('.' + dropd.classList);
		if(list.hasClass('objHide')) {
			list.addClass('objShow').removeClass('objHide').show();
		} else {
			dropd.hideList();
		}
	};

	/**
	 * BUILDER FUNCTIONS:
	 */

	dropd.getOption = function(option, parentOption) {
		var classes = $(option).attr('class') || '',
			html = $('<p class="focusable" data-value="' + $(option).val() + '" >' + $(option).text() + '</p>')
				.addClass(classes).addClass(dropd.classOption)
				.addClass(parentOption ? dropd.classGroup + ' ' + dropd.classGroupCollapsed : '')
				.css({
					cursor: 'pointer',
					'margin-top': '2%',
					'margin-bottom': '2%',
				});

		return html[0].outerHTML;
	};

	dropd.getGroup = function(index, title, options, classes) {
		var items = '', group = '';
		$(options).each(function() {
			items = items + dropd.getOption(this, false);
		});

		title = '<h3 class="focusable"><span class="' + dropd.classIcon + ' focusable">' + settings.collapsedIcon + '</span> ' + title + '</h3>';
		items = $('<div><div class="focusable" data-group="' + index + '">' + items + '</div></div>');
		group = $('<div><div class="focusable" data-group="' + index + '">' + title + '</div></div>');

		items.children()
			.addClass(dropd.classItems)
			.hide()
			.css({
				color: settings.optionsColor,
				font: settings.optionsFont,
				'text-indent': '15px'
			});

		group.children()
			.addClass(dropd.classGroupCollapsed).addClass(classes).addClass(dropd.classGroup)
			.css({
				cursor: 'pointer',
				color: settings.groupColor,
				font: settings.groupFont,
			});

		return '<div>' + group.html() + items.html() + '</div>';
	};

	dropd.getSelect = function(old_dropdown) {
		var i = 0, html = '';

		$(old_dropdown).children().each(function() {
			if($(this).is('optgroup')) {
				html = html + dropd.getGroup(i++, $(this).attr('label'), $(this).children(), $(this).attr('class'));
			} else {
				html = html + dropd.getOption($(this), true);
			}
		});

		var input = $('<input class="focusable" type="text" />');
		input
		.addClass(dropd.classSelect)
		.css({
			width: settings.width,
			height: settings.height,
			color: settings.color,
			font: settings.font,
			background: settings.background
		});

		var arrow = $('<span class="focusable">' + settings.dropdownIcon + '</span>');
		arrow
		.addClass(dropd.classArrow)
		.css({
			font: settings.font,
			color: settings.color,
			cursor: 'pointer',
			position: 'absolute',
			'z-index': 1,
			right: 5,
		});

		var select = $('<span>' + input[0].outerHTML + arrow[0].outerHTML + '</span>')[0].outerHTML;

		html = $('<div class="DropD"><span style="position:relative;">' + select + '</span><div class="' + dropd.classList + ' focusable">' + html + '</div></div>');
		$('.' + dropd.classList, html)
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

	dropd.bindEvents = function() {
		$('body').on('click', '.' + dropd.classGroupExpanded, dropd.toggleGroup);
		$('body').on('click', '.' + dropd.classGroupCollapsed, dropd.toggleGroup);

		$('body').on('click', '.' + dropd.classSelect, dropd.toggleList);
		$('body').on('click', '.' + dropd.classArrow, dropd.toggleList);

		$(document)
			.keyup(function(e) {
				if(e.keyCode == keycodes['ESC']) {
					dropd.hideList();
				}
			})
			.click(function(event) {
				if(!$(event.target).hasClass('focusable')) {
					dropd.hideList();
				}
			});

		$('body')
			.on('click', '.' + dropd.classOption , function(e) {
				var oldValue = String($('.' + dropd.classSelect).val().trim());

				dropd.changeDropdown(this);
				dropd.callback(e, settings.onClick, this);

				var newValue = String($(this).text().trim());
				if(oldValue.localeCompare(newValue) != 0) {
					dropd.callback(e, settings.onChange, this);
				}
			});

		$('.' + dropd.classOption)
			.mouseenter(function() {
				dropd.selectOption($(this).data('value'), 'hovered');
			})
			.mouseleave(function() {
				if(!$(this).hasClass('selected')) {
					dropd.deselectOption($(this).data('value'), 'hovered');
				}
			});

		if(settings.collapseOnHover) {
			$('.' + dropd.classGroup).mouseenter(function() {
				dropd.expandGroup($(this));
				$('.' + dropd.classGroup + '[data-group!=' + $(this).data('group') + ']').each(function() {
					dropd.collapseGroup($(this));
				});
			});
		}
		
		var selected = $(':selected', current).val().trim();
		$('.' + dropd.classOption + '[data-value=' + selected + ']').each(function() {
			dropd.changeDropdown(this);
		});
	};

	/**
	 * BIND PLUGIN:
	 */

	$.fn.dropd = function(options) {
		if(!this.length) {
			// throw "DropD: " + this.selector + " is not a valid select list";
			console.error("DropD: " + this.selector + " is not a valid select list");
			return;
		}

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
			selectedBackground: 'rgb(77, 144, 254)',
			selectedForeground: 'white',
			dropdownIcon: '&#x25BE;', //'<i class="fa fa-caret-down"></i>',
			expandedIcon: '&#x25BE;', //'<i class="fa fa-caret-down"></i>',
			collapsedIcon: '&#x25B8;', //'<i class="fa fa-caret-right"></i>',
			collapseOnHover: true,
			onClick: undefined,
			onChange: undefined,
		}, options || {});

		dropd.id = this.attr('id');
		dropd.classPrefix = 'dropd-' + dropd.id + '-';
		dropd.classGroupExpanded = dropd.classPrefix + 'group-expanded';
		dropd.classGroupCollapsed = dropd.classPrefix + 'group-collapsed';
		dropd.classSelect = dropd.classPrefix + 'select';
		dropd.classOption = dropd.classPrefix + 'option';
		dropd.classItems = dropd.classPrefix + 'items';
		dropd.classGroup = dropd.classPrefix + 'group';
		dropd.classArrow = dropd.classPrefix + 'arrow';
		dropd.classList = dropd.classPrefix + 'list';
		dropd.classIcon = dropd.classPrefix + 'icon';

		var select = dropd.getSelect(this),
			html = select.attr('id', dropd.id);
		
		current = this;
		this.replaceWith(html[0].outerHTML);
		$(document).ready(dropd.bindEvents);

		return this;
	};
})(window.jQuery, window, window.document);
