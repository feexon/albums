$(function () {
    wall = {};
    var dirs = ['Left', 'Right', 'Top', 'Bottom'];
    var props = ['margin', 'padding'];
    var columns;
    var owner;
    var thumbs;
    for (var x = dirs.length; --x >= 0;) {
        for (var y = props.length; --y >= 0;) {
            var name = props[y] + dirs[x];
            eval('function $name(target){var pixels=target.css("$name");return !pixels?0:parseInt(pixels.substring(0,pixels.length-2));}'.replace(/\$name/g, name));
        }
    }

    var none = {
        offset: function () {
            return owner.offset();
        },
        width: function () {
            return 0;
        },
        height: function () {
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
            var x = prev.offset().left + prev.width() - none.offset().left + marginLeft(prev) + paddingLeft(prev) + marginRight(prev) + paddingRight(prev);
            var y = top.offset().top + top.height() - none.offset().top + marginTop(top) + paddingTop(top) + marginBottom(top) + paddingBottom(top);
            thumb.css({zIndex: pos, left: x, top: y}).css('opacity',1);
            ++pos < thumbs.length && doLayout(pos);
        }
    }


    wall.updateLayout = function () {
        owner = $('.wall').css('position', 'relative');
        thumbs = $('li', owner).css('position', 'absolute');
        var updated = thumbs.not('.' + MEASURED).css('opacity',0);
        var offset = thumbs.length - updated.length;

        columns = parseInt(owner.width() / (thumbs.width() + marginLeft(thumbs) + paddingLeft(thumbs) + marginRight(thumbs) + paddingRight(thumbs)));

        $('img', updated).css('opacity', 0).width(thumbs.width()).load(function () {
            var shown = $(this);
            var thumb = shown.parent();
            var height = 0;
            thumb.children().each(function () {
                var context = $(this);
                if (context.css('position') != 'absolute') {
                    height += context.height() + paddingTop(context) + marginTop(context) + paddingBottom(context) + marginBottom(context);
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