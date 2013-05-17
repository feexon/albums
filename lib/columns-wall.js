(function () {
    var none = {
        position: function () {
            return {left: 0, top: 0};
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
    var STATE_MEASURED = '_measured';
    var STATE_PROCESSING = '_processing';

    function inState(state) {
        return '.' + state;
    }

    wall = {
        updateLayout: function (config) {
            var me = {
                timeout: 5000,
                columns: -1,
                last: [],
                defaultImage: 'data:image/png;base64,',
                defaultImageSize: [0, 0],
                period: 100,
                lowest: function (index) {
                    var last = me.last;
                    var len = last.length;
                    if (len < me.columns) {
                        if (len == 0) {
                            var offset = me.allThumbs.length - me.thumbs.length;
                            var added = Math.min(offset, me.columns);
                            for (var i = 0; i < added; i++) {
                                last[i] = $('li.__col_' + i + ':last', me.owner);
                            }
                            if (added > 0) {
                                return me.lowest(index);
                            }
                        }
                        return len;
                    }
                    var min = 0;
                    for (var i = 1; i < last.length; i++) {
                        if (last[min].position().top + last[min].outerHeight() > last[i].position().top + last[i].outerHeight()) {
                            min = i;
                        }
                    }
                    return min;
                },
                init: function () {
                    me.owner = $('.wall').css('position', 'relative');
                    me.allThumbs = $('li', me.owner).css('position', 'absolute');
                    me.thumbs = me.allThumbs.not(inState(STATE_MEASURED)).not(inState(STATE_PROCESSING)).css({opacity: 0});
                    me.thumbs.addClass(STATE_PROCESSING);
                    me.columns = parseInt(me.owner.width() / me.allThumbs.outerWidth(true));
                },

                doLayout: function (index) {
                    if (index >= me.thumbs.length) {
                        return;
                    }
                    var previous = me.allThumbs.length - me.thumbs.length + index - 1;

                    if (previous >= 0 && !me.allThumbs.eq(previous).hasClass(STATE_MEASURED)) {
                        setTimeout(function () {
                            me.doLayout(index);
                        }, me.period);
                        return;
                    }
                    var image = $('img', me.thumbs).eq(index);
                    me.layout(image, function (actualWidth, actualHeight) {

                        var li = image.parent();
                        image.width(li.width()).height(Math.round(actualWidth ? actualHeight * li.width() / actualWidth : 0)).attr('src', this.src);
                        var pos = me.lowest(index);
                        var prev = pos == 0 ? none : me.last[pos - 1];
                        var top = me.last[pos];
                        top = top || none;
                        var x = prev.position().left + prev.outerWidth(true);
                        var y = top.position().top + top.outerHeight(true);
                        me.last[pos] = li;
                        li.css({left: x, top: y}).addClass(STATE_MEASURED).removeClass(STATE_PROCESSING).addClass('__col_' + pos).animate({opacity: 1});
                        me.doLayout(index + 1);
                    });
                },
                layout: function (image, callback) {
                    var measured = new Image();
                    measured.src = image.attr('src');
                    var done = false;
                    var handle = function (timeout) {
                        if (done) {
                            return;
                        }
                        var size;
                        if (timeout == 'timeout') {
                            measured.src = me.defaultImage;
                            size = me.defaultImageSize;
                        } else {
                            size = [measured.width, measured.height];
                        }
                        done = true;
                        callback.apply(measured, size);
                    };
                    measured.onload = handle;
                    setTimeout(function () {
                        if (!done) {
                            handle('timeout');
                        }
                    }, me.timeout);
                }
            };
            $.extend(me, config);
            me.init();
            me.doLayout(0);
        }
    };


})();