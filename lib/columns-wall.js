$(function () {
    wall = {};
    var columns;
    var owner;
    var thumbs;


    var none = {
        position: function () {
            return {left:0,top:0};
        },
        outerWidth: function (containsMargins) {
            return 0;
        },
        outerHeight: function (containsMargins) {
            return 0;
        },
        hasClass: function () {
            return true;
        },
        css: function () {
            return "";
        }
    };

    function previous(pos) {
        return pos % columns == 0 ? none : $(thumbs.get(pos - 1));
    }

    function above(pos) {
        return pos < columns ? none : $(thumbs.get(pos - columns));
    }

    var MEASURED = '_measured';

    function doLayout(pos) {
        var prev = previous(pos);
        var top = above(pos);
        if (prev.hasClass(MEASURED) && top.hasClass(MEASURED)) {
            var thumb = $(thumbs.get(pos));
            var x = prev.position().left +prev.outerWidth(true);
            var y = top.position().top + top.outerHeight(true);
            thumb.css({zIndex: pos, left: x, top: y}).css('opacity',1);
            ++pos < thumbs.length && doLayout(pos);
        }
    }


    wall.updateLayout = function () {
        owner = $('.wall').css('position', 'relative');
        thumbs = $('li', owner).css('position', 'absolute');
        var updated = thumbs.not('.' + MEASURED).css('opacity',0);
        var offset = thumbs.length - updated.length;

        columns = parseInt(owner.width() / thumbs.outerWidth(true));

        $('img', updated).css('opacity', 0).width(thumbs.width()).load(function () {
            var shown = $(this);
            var thumb = shown.parent();
            var height = 0;
            thumb.children().each(function () {
                var it = $(this);
                if (it.css('position') != 'absolute') {
                    height +=it.outerHeight(true);
                }
            });
            thumb.height(height).addClass(MEASURED);
            var pos = offset + updated.index(thumb);
            shown.animate({opacity: 1});
            doLayout(pos);
        });
    }

    wall.updateLayout();

});