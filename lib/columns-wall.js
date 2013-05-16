(function () {
    wall = {};
    var columns;
    var owner;
    var thumbs;


    var none = {
        position: function () {
            return {left: 0, top: 0};
        },
        outerWidth: function (containMargins) {
            return 0;
        },
        outerHeight: function (containMargins) {
            return 0;
        },
        hasClass: function () {
            return true;
        },
        css: function () {
            return "";
        }
    };


    var MEASURED = '_measured';
    var post = {};

    function doLayout(pos) {

        var position = 0;
        for (var k = 0; k < columns; k++) {
            var candidate = $('li.col-' + k + ':last', owner);
            var low = $('li.col-' + position + ':last', owner);
            if (!candidate.length) {
                position = k;
                break;
            } else if (candidate.position().top + candidate.outerHeight(true) < low.position().top + low.outerHeight(true)) {
                position = k;
            }
        }
        var prev = position == 0 ? none : $('li.col-' + (position - 1) + ':last', owner);
        var top = $('li.col-' + position + ':last', owner);
        top = top.length ? top : none;
        var thumb = $(thumbs.get(pos));
        if (prev.hasClass(MEASURED) && top.hasClass(MEASURED)) {
            if (!post[pos]) {
                post[pos] = true;
                var x = prev.position().left + prev.outerWidth(true);
                var y = top.position().top + top.outerHeight(true);
                thumb.css({zIndex: pos, left: x, top: y}).css('opacity', 1).addClass('col-' + position);
            }
            ++pos < thumbs.length && doLayout(pos);
        }
    }


    wall.updateLayout = function () {
        owner = $('.wall').css('position', 'relative');
        thumbs = $('li', owner).css('position', 'absolute');
        var updated = thumbs.not('.' + MEASURED).css('opacity', 0);
        var offset = thumbs.length - updated.length;
        columns = parseInt(owner.width() / thumbs.outerWidth(true));
        $('img', updated).css('opacity', 0).width(thumbs.width()).load(function () {
            var shown = $(this);
            var thumb = shown.parent();
            var height = 0;
            thumb.children().each(function () {
                var it = $(this);
                if (it.css('position') != 'absolute') {
                    height += it.outerHeight(true);
                }
            });
            thumb.height(height).addClass(MEASURED);
            var pos = offset + updated.index(thumb);
            shown.animate({opacity: 1});
            doLayout(pos);
        });
    }



})();