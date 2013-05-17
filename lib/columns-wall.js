(function () {
       var none = {
           position: function () {
               return {left: 0, top: 0};
           },
           outerWidth: function () {
               return 0;
           },
           outerHeight: function () {
               return 0;
           },
           hasClass: function () {
               return true;
           },
           css: function () {
               return "";
           }
       };

       var me = wall = {
           timeout: 5000,
           columns: -1,
           last: [],
           defaultImage: '',
           defaultImageSize: [0, 0],
           period:100,
           lowest: function (index) {
               var last = me.last;
               var len = last.length;
               if (len < me.columns)
                   return len;
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
               me.thumbs = me.allThumbs.not('._measured').not('._processing').hide();
               me.thumbs.addClass('_processing');
               me.columns = parseInt(me.owner.width() / me.thumbs.outerWidth());
           },
           updateLayout: function () {
               me.init();
               me.doLayout(0);
           },
           doLayout: function (index) {
               if (index >= me.thumbs.length) {
                   return;
               }
               var previous = me.allThumbs.length-me.thumbs.length+index-1;

               if (previous>=0&&!me.allThumbs.eq(previous).hasClass('_measured')) {
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
                   li.css({left: x, top: y}).addClass('_measured').removeClass('_processing');
                   li.show();
                   me.doLayout(index + 1);
               });
           },
           layout: function (image, callback) {
               var measured = new Image();
               measured.src = image.attr('src');
               var done = false;
               var handle = function (timeout) {
                   var size;
                   if (timeout == 'timeout') {
                       measured.src = me.defaultImage;
                       measured.onload = undefined;
                       size = me.defaultImageSize;
                   } else {
                       done = true;
                       size = [measured.width, measured.height];
                   }
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


   })();