/*
* jQuery easyShare plugin
* Update on 04 april 2017
* Version 1.2
*
* Licensed under GPL <http://en.wikipedia.org/wiki/GNU_General_Public_License>
* Copyright (c) 2008, St?hane Litou <contact@mushtitude.com>
* All rights reserved.
*
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
    POWERIDE BY MAD

*/

(function($){
$.fn.easyPaginate = function (options) {
    var defaults = {
        paginateElement: 'li',
        hashPage: 'page',
        elementsPerPage: 10,
        effect: 'default',
        slideOffset: 200,
        firstButton: true,
        firstButtonText: '<<',
        lastButton: true,
        lastButtonText: '>>',        
        prevButton: true,
        prevButtonText: '<',        
        nextButton: true,
        nextButtonText: '>',
        paginationNavClass: 'easyPaginateList'
    }
        
    return this.each (function (instance) {        
        var page = 1;
        var first_page_ind = 0, last_page_ind = 0, total_ind = 0;
        var plugin = {};
        plugin.el = $(this);
        plugin.el.addClass("easyPaginateList");
        plugin.settings = {
            pages: 0,
            objElements: Object,
            currentPage: 1
        }
        
        var getNbOfPages = function() {
            return Math.ceil(plugin.settings.objElements.length / plugin.settings.elementsPerPage);         
        };
        
        var displayNav = function() {
            htmlNav = '<div class="'+plugin.settings.paginationNavClass+' margin-top-30">';
            
            if(plugin.settings.firstButton) {
                htmlNav += '<a data-action="pagination-nav" data-href="#'+plugin.settings.hashPage+':1" title="First page" rel="1" class="first">'+plugin.settings.firstButtonText+'</a>';
            }
            
            if(plugin.settings.prevButton) {
                htmlNav += '<a data-action="pagination-nav" data-href="" title="Previous" rel="" class="prev">'+plugin.settings.prevButtonText+'</a>';
            }
            
            for(i = 1;i <= plugin.settings.pages;i++) {
                htmlNav += '<a data-action="pagination-nav" data-href="#'+plugin.settings.hashPage+':'+i+'" title="Page '+i+'" rel="'+i+'" class="page">'+i+'</a>';
            };
            
            if(plugin.settings.nextButton) {
                htmlNav += '<a data-action="pagination-nav" data-href="" title="Next" rel="" class="next">'+plugin.settings.nextButtonText+'</a>';
            }
            
            if(plugin.settings.lastButton) {
                htmlNav += '<a data-action="pagination-nav" data-href="#'+plugin.settings.hashPage+':'+plugin.settings.pages+'" title="Last page" rel="'+plugin.settings.pages+'" class="last">'+plugin.settings.lastButtonText+'</a>';
            }
            htmlNav += '<div class="clearfix"></div>';
            htmlNav += '</div>';
            plugin.htmlNav = htmlNav;
            plugin.nav = $(htmlNav);
            plugin.el.after(plugin.nav);
            var elSelector = '#' + plugin.el.get(0).id + ' + ';
            $(document).on('click', elSelector + ' .'+plugin.settings.paginationNavClass+' a.page,'
                + elSelector + ' .'+plugin.settings.paginationNavClass+' a.first,'
                + elSelector + ' .'+plugin.settings.paginationNavClass+' a.last', function(e) {
                e.preventDefault();
                if (!$(this).hasClass("disabled")){
                    displayPage($(this).attr('rel'));
                    //Affichage du nombre de page en visualisation
                    first_page_ind = (parseInt($(this).attr('rel')) - 1) * elems_in_a_page + 1;
                    last_page_ind = first_page_ind + (plugin.el.find(".grid-offer-col").length - 1);
                    $("span.first-page-ind").html(first_page_ind > 0 ? first_page_ind : 1 );
                    $("span.last-page-ind").html(last_page_ind);
                    $("span.total-ind").html(total_ind);
                }                
            });

            $(document).on('click', elSelector + ' .'+plugin.settings.paginationNavClass+' a.prev', function(e) {
                e.preventDefault();
                if (!$(this).hasClass("disabled")){
                    page = plugin.settings.currentPage > 1 ? parseInt(plugin.settings.currentPage) - 1 : 1;
                    displayPage(page);
                    //Affichage du nombre de page en visualisation
                    first_page_ind = (page - 1) * elems_in_a_page + 1;
                    last_page_ind = first_page_ind + (plugin.el.find(".grid-offer-col").length - 1);
                    $("span.first-page-ind").html(first_page_ind > 0 ? first_page_ind : 1 );
                    $("span.last-page-ind").html(last_page_ind);
                    $("span.total-ind").html(total_ind);
                }
            });

            $(document).on('click', elSelector + ' .'+plugin.settings.paginationNavClass+' a.next', function(e) {
                e.preventDefault();
                //console.log("click !");
                if (!$(this).hasClass("disabled")){
                    page = plugin.settings.currentPage < plugin.settings.pages ? parseInt(plugin.settings.currentPage) + 1 : plugin.settings.pages;               
                    displayPage(page);
                    //Affichage du nombre de page en visualisation
                    first_page_ind = (page - 1) * elems_in_a_page + 1;
                    last_page_ind = first_page_ind + (plugin.el.find(".grid-offer-col").length - 1);
                    $("span.first-page-ind").html(first_page_ind > 0 ? first_page_ind : 1 );
                    $("span.last-page-ind").html(last_page_ind);
                    $("span.total-ind").html(total_ind);
                }
            });
        };
        
        var displayPage = function(page, forceEffect) {
            if(plugin.settings.currentPage != page) {
                plugin.settings.currentPage = parseInt(page);
                offsetStart = (page - 1) * plugin.settings.elementsPerPage;
                offsetEnd = page * plugin.settings.elementsPerPage;
                if(typeof(forceEffect) != 'undefined') {
                    eval("transition_"+forceEffect+"("+offsetStart+", "+offsetEnd+")");
                }else {
                    eval("transition_"+plugin.settings.effect+"("+offsetStart+", "+offsetEnd+")");
                }
                plugin.nav.find('.active').removeClass('active');
                plugin.nav.find('a.page:eq('+(page - 1)+')').addClass('active');
                if (plugin.settings.pages != 1){
                    switch(plugin.settings.currentPage) {
                        case 1:
                            //console.log(plugin.settings.paginationNavClass);
                            $('.'+plugin.settings.paginationNavClass+' a', plugin).removeClass('disabled');
                            $('.'+plugin.settings.paginationNavClass+' a.first, .'+plugin.settings.paginationNavClass+' a.prev', plugin).addClass('disabled');
                            break;
                        case plugin.settings.pages:
                            $('.'+plugin.settings.paginationNavClass+' a', plugin).removeClass('disabled');
                            $('.'+plugin.settings.paginationNavClass+' a.last, .'+plugin.settings.paginationNavClass+' a.next', plugin).addClass('disabled');
                            break;
                        default:
                            $('.'+plugin.settings.paginationNavClass+' a', plugin).removeClass('disabled');
                            break;
                    }
                }else{
                    $('.'+plugin.settings.paginationNavClass+' a').removeClass('disabled');
                    $('.'+plugin.settings.paginationNavClass+' a.first, .'+plugin.settings.paginationNavClass+' a.prev').addClass('disabled');
                    $('.'+plugin.settings.paginationNavClass+' a.last, .'+plugin.settings.paginationNavClass+' a.next').addClass('disabled');
                }
            }
        };
        
        var transition_default = function(offsetStart, offsetEnd) {
            plugin.el.empty();
            //plugin.el.isotope('hideItemElements', plugin.currentElements);
            plugin.currentElements = plugin.settings.objElements.slice(offsetStart, offsetEnd);
            //plugin.el.isotope('revealItemElements', plugin.currentElements);
            //console.log(plugin.currentElements);
            plugin.el.append(plugin.currentElements);
            plugin.el.isotope();
        };
        
        var transition_fade = function(offsetStart, offsetEnd) {
            plugin.currentElements.fadeOut();
            plugin.currentElements = plugin.settings.objElements.slice(offsetStart, offsetEnd);
            plugin.el.html(plugin.currentElements);
            plugin.currentElements.fadeIn();
        };
        
        var transition_slide = function(offsetStart, offsetEnd) {
            plugin.currentElements.animate({
                'margin-left': plugin.settings.slideOffset * -1,
                'opacity': 0
            }, function() {
                $(this).remove();
            });
            //console.log(plugin.settings.objElements);
            plugin.currentElements = plugin.settings.objElements.slice(offsetStart, offsetEnd);
            plugin.currentElements.css({
                'margin-left': plugin.settings.slideOffset,
                'display': 'block',
                'opacity': 0,
                'max-width': plugin.el.width() / 4
            });
            plugin.el.html(plugin.currentElements);
            plugin.currentElements.animate({
                'margin-left': 0,
                'opacity': 1
            });
            plugin.el.isotope();
        };
                
        var transition_climb = function(offsetStart, offsetEnd) {            
            plugin.currentElements.each(function(i) {
                var $objThis = $(this);
                setTimeout(function() {
                    $objThis.animate({
                        'margin-left': plugin.settings.slideOffset * -1,
                        'opacity': 0
                    }, function() {
                        $(this).remove();
                    });
                }, i * 200);
                $objThis.css({
                    'display': 'none'
                });
            });
            plugin.currentElements = plugin.settings.objElements.slice(offsetStart, offsetEnd);
            plugin.currentElements.css({
                'margin-left': plugin.settings.slideOffset,
                'display': 'block',
                'opacity': 0,
                'max-width': plugin.el.width() / 4
            });
           // console.log(plugin.settings.objElements);
            plugin.currentElements.css({
                'display': 'block'
            });
            plugin.el.html(plugin.currentElements);
            plugin.currentElements.each(function(i) {
                var $objThis = $(this);
                setTimeout(function() {
                    $objThis.animate({
                        'margin-left': 0,
                        'opacity': 1
                    });
                }, i * 200);
            });
            plugin.el.isotope();
        };
                
        plugin.settings = $.extend({}, defaults, options);
        plugin.currentElements = $([]);
        plugin.settings.objElements = plugin.el.find(plugin.settings.paginateElement);
        plugin.settings.pages = getNbOfPages();
        plugin.currentElements = plugin.settings.objElements;
        if(plugin.settings.pages > 0) {
            plugin.el.html();
    
            // Here we go
            displayNav();
            
            page = 1;
            if(document.location.hash.indexOf('#'+plugin.settings.hashPage+':') != -1) {
                page = parseInt(document.location.hash.replace('#'+plugin.settings.hashPage+':', ''));
                if(page.length <= 0 || page < 1 || page > plugin.settings.pages) {
                    page = 1;
                }
            }
            total_ind = plugin.el.find(".grid-offer-col").length;
            displayPage(page, 'default');
        }
        //Affichage du nombre de page en visualisation
        if (total_ind > 0){
            first_page_ind = 1;
        }
        last_page_ind += plugin.el.find(".grid-offer-col").length;
        elems_in_a_page = plugin.settings.elementsPerPage;
        $("span.first-page-ind").html(first_page_ind);
        $("span.last-page-ind").html(last_page_ind);
        $("span.total-ind").html(total_ind);
    });
};
})(jQuery);
