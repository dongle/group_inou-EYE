var API_KEY, DIST_BETWEEN_PTS, MAX_PTS, VERSION, canvas, create, dirService, loader, onAnalyzeComplete, onCancel, onMessage, onPanoramaLoad, onProgress, panoIds, rawPts, res, restoreSettings, settings, storage, tasks, totalDist, updateSettings;

MAX_PTS = 100;

DIST_BETWEEN_PTS = 5;

API_KEY = "AIzaSyBQ2dzDfyF8Y0Dwe-Q6Jzx4_G62ANrTotQ";

VERSION = '0.3';

loader = null;

dirService = new google.maps.DirectionsService({});

res = null;

rawPts = [];

panoIds = [];

totalDist = 0;

canvas = null;

tasks = [];

settings = {};

storage = localStorage;

restoreSettings = function() {
  var $elm;
  $elm = $('nav');
  if (storage.version === VERSION) {
    $('#name').val(storage.name);
    $('#dir').val(storage.dir);
    $("input[value=" + storage.method + "]").prop('checked', true);
    $('#url').val(storage.url);
    $('#panoid').val(storage.panoid);
    $("input[value=" + storage.travelMode + "]").prop('checked', true);
    $("input[value=" + storage.heading + "]").prop('checked', true);
    $('#lookat').val(storage.lookat);
    $('#zoom').val(storage.zoom);
    $('#step').val(storage.step);
    $('#search-radius').val(storage.searchRadius);
  }
  return $elm.find('[data-parent]').each(function() {
    var $parent, $this, name;
    $this = $(this);
    $parent = $($this.attr('data-parent'));
    name = $parent.attr('name');
    return $("[name=" + name).on('change', (function(_this) {
      return function() {
        return $(_this).toggle($parent.prop('checked'));
      };
    })(this)).trigger('change');
  });
};

updateSettings = function() {
  settings.name = $('#name').val();
  settings.dir = $('#dir').val();
  settings.method = $('input[name=method]:checked').val();
  settings.url = $('#url').val();
  settings.panoid = $('#panoid').val();
  settings.travelMode = $('input[name=travel]:checked').val();
  settings.heading = $('input[name=heading]:checked').val();
  settings.lookat = $('#lookat').val();
  settings.zoom = $('#zoom').val();
  settings.step = $('#step').val();
  settings.searchRadius = $('#search-radius').val();
  settings.version = VERSION;
  return $.extend(storage, settings);
};

$(function() {
  canvas = $('#panorama')[0];
  $('#create').on('click', create);
  GSVHyperlapse.onMessage = onMessage;
  GSVHyperlapse.onPanoramaLoad = onPanoramaLoad;
  GSVHyperlapse.onProgress = onProgress;
  GSVHyperlapse.onAnalyzeComplete = onAnalyzeComplete;
  GSVHyperlapse.onCancel = onCancel;
  restoreSettings();
  return $('input').on('change', updateSettings);
});

create = function() {
  var hyperlapse, index, list;
  updateSettings();
  index = tasks.length;
  $('.tasks').append("<li id='task-" + index + "'> <h1><input type='text' name='name' value='" + settings.name + "'></h1> <button class='cancel action' data-index='" + index + "'>Cancel</button> <p>mode: " + settings.method + "<br></p> <div id='map-" + index + "' style='width: 48%; height: 0; padding-top: 26%; background:gray; display: inline-block;'></div> </li>");
  hyperlapse = new GSVHyperlapse(settings.name, $("#map-" + index)[0]);
  if (settings.method === 'direction') {
    hyperlapse.createFromDirection(settings.url, settings);
  } else if (settings.method === 'panoid') {
    list = $.parseJSON($('#panoid').val());
    hyperlapse.createFromPanoId(list);
  }
  $("#task-" + index + " .cancel").on('click', function() {
    index = $(this).attr('data-index');
    return tasks[index].cancel();
  });
  return tasks.push(hyperlapse);
};

onCancel = function() {
  var $btn, $elm, index;
  index = tasks.indexOf(this);
  $elm = $("#task-" + index);
  $btn = $('<button>delete</button><br>');
  $btn.on('click', function() {
    return $elm.remove();
  });
  return $elm.children('p').append('canceled<br>').append($btn);
};

onAnalyzeComplete = function() {
  var $btnGen, $elm, index;
  index = tasks.indexOf(this);
  $elm = $("#task-" + index);
  console.log($elm.children("p"));
  $btnGen = $('<button>generate hyperlapse</button><br>');
  $elm.children('p').append($btnGen);
  return $btnGen.on('click', function() {
    $elm.children('.control').remove();
    this.name = $elm.find('[name=name]').prop('disabled', true).val();
    tasks[index].compose(settings.zoom);
    return $elm.children('p').append($btnGen);
  });
};

onProgress = function(loaded, total) {
  var $elm, index;
  index = tasks.indexOf(this);
  $elm = $("#task-" + index);
  if (loaded < 1) {
    $elm.children('p').append($('<progress></progress>'));
  }
  return $elm.find("progress").last().attr({
    value: loaded,
    max: total,
    'data-label': "[" + loaded + "/" + total + "]"
  });
};

onMessage = function(message) {
  var $elm, index;
  index = tasks.indexOf(this);
  $elm = $("#task-" + index);
  return $elm.children('p').append(message + "<br>");
};

onPanoramaLoad = function(idx, canvas) {
  var $elm, index, params;
  index = tasks.indexOf(this);
  $elm = $("#task-" + index);
  $elm.append(canvas);
  FILE.saveFrame(canvas, settings.dir + "/" + this.name + "/" + this.name + "_####.png", function() {});
  params = {
    name: this.name,
    directory: settings.dir,
    number: idx,
    image: canvas.toDataURL('image/png')
  };
  return $.ajax({
    type: "POST",
    url: './save.php',
    data: params,
    success: (function(_this) {
      return function(json) {
        var result;
        result = $.parseJSON(json);
        if (result.status !== "success") {
          _this.cancel();
          return $elm.children('p').append("an error occured" + "<br>");
        }
      };
    })(this)
  });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdzdi1nZW5lcmF0b3IuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLElBQUEsK09BQUE7O0FBQUEsT0FBQSxHQUFVLEdBQVYsQ0FBQTs7QUFBQSxnQkFDQSxHQUFtQixDQURuQixDQUFBOztBQUFBLE9BR0EsR0FBVSx5Q0FIVixDQUFBOztBQUFBLE9BSUEsR0FBVSxLQUpWLENBQUE7O0FBQUEsTUFRQSxHQUFTLElBUlQsQ0FBQTs7QUFBQSxVQVNBLEdBQWlCLElBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBWixDQUE4QixFQUE5QixDQVRqQixDQUFBOztBQUFBLEdBWUEsR0FBTSxJQVpOLENBQUE7O0FBQUEsTUFjQSxHQUFTLEVBZFQsQ0FBQTs7QUFBQSxPQWVBLEdBQVUsRUFmVixDQUFBOztBQUFBLFNBZ0JBLEdBQVksQ0FoQlosQ0FBQTs7QUFBQSxNQWtCQSxHQUFTLElBbEJULENBQUE7O0FBQUEsS0FvQkEsR0FBUSxFQXBCUixDQUFBOztBQUFBLFFBc0JBLEdBQVcsRUF0QlgsQ0FBQTs7QUFBQSxPQXdCQSxHQUFVLFlBeEJWLENBQUE7O0FBQUEsZUErQkEsR0FBa0IsU0FBQSxHQUFBO0FBQ2pCLE1BQUEsSUFBQTtBQUFBLEVBQUEsSUFBQSxHQUFPLENBQUEsQ0FBRSxLQUFGLENBQVAsQ0FBQTtBQUVBLEVBQUEsSUFBRyxPQUFPLENBQUMsT0FBUixLQUFtQixPQUF0QjtBQUVDLElBQUEsQ0FBQSxDQUFFLE9BQUYsQ0FBVSxDQUFDLEdBQVgsQ0FBZ0IsT0FBTyxDQUFDLElBQXhCLENBQUEsQ0FBQTtBQUFBLElBQ0EsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEdBQVYsQ0FBZSxPQUFPLENBQUMsR0FBdkIsQ0FEQSxDQUFBO0FBQUEsSUFFQSxDQUFBLENBQUUsY0FBQSxHQUFlLE9BQU8sQ0FBQyxNQUF2QixHQUE4QixHQUFoQyxDQUFtQyxDQUFDLElBQXBDLENBQXlDLFNBQXpDLEVBQW9ELElBQXBELENBRkEsQ0FBQTtBQUFBLElB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QyxJQUFELEdBQUE7QUFDUixZQUFBLE1BQUE7QUFBQSxRQUFBLE1BQUEsR0FBUyxDQUFDLENBQUMsU0FBRixDQUFhLElBQWIsQ0FBVCxDQUFBO0FBQ0EsUUFBQSxJQUFHLE1BQU0sQ0FBQyxNQUFQLEtBQWlCLFNBQXBCO0FBQ0MsVUFBQSxLQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTtpQkFDQSxJQUFJLENBQUMsUUFBTCxDQUFjLEdBQWQsQ0FBa0IsQ0FBQyxNQUFuQixDQUEwQixrQkFBQSxHQUFxQixNQUEvQyxFQUZEO1NBRlE7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhUO0dBREQsRUFoQmdCO0FBQUEsQ0EvTGpCLENBQUEiLCJmaWxlIjoiZ3N2LWdlbmVyYXRvci5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgY29uc3RhbnRzXG5NQVhfUFRTID0gMTAwXG5ESVNUX0JFVFdFRU5fUFRTID0gNVxuXG5BUElfS0VZID0gXCJBSXphU3lCUTJkekRmeUY4WTBEd2UtUTZKeng0X0c2MkFOclRvdFFcIlxuVkVSU0lPTiA9ICcwLjMnXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgdmFyaWFibGVzXG5sb2FkZXIgPSBudWxsXG5kaXJTZXJ2aWNlID0gbmV3IGdvb2dsZS5tYXBzLkRpcmVjdGlvbnNTZXJ2aWNlKHt9KVxuXG4jIGVhY2ggcmVzXG5yZXMgPSBudWxsXG5cbnJhd1B0cyA9IFtdXG5wYW5vSWRzID0gW11cbnRvdGFsRGlzdCA9IDBcblxuY2FudmFzID0gbnVsbFxuXG50YXNrcyA9IFtdXG5cbnNldHRpbmdzID0ge31cblxuc3RvcmFnZSA9IGxvY2FsU3RvcmFnZVxuXG5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBpbml0XG5cbnJlc3RvcmVTZXR0aW5ncyA9IC0+XG5cdCRlbG0gPSAkKCduYXYnKVxuXG5cdGlmIHN0b3JhZ2UudmVyc2lvbiA9PSBWRVJTSU9OXG5cdFx0IyByZXN0b3JlIGFsbCBzZXR0aW5nc1xuXHRcdCQoJyNuYW1lJykudmFsKCBzdG9yYWdlLm5hbWUgKVxuXHRcdCQoJyNkaXInKS52YWwoIHN0b3JhZ2UuZGlyIClcblx0XHQkKFwiaW5wdXRbdmFsdWU9I3tzdG9yYWdlLm1ldGhvZH1dXCIpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKVxuXHRcdCQoJyN1cmwnKS52YWwoIHN0b3JhZ2UudXJsIClcblx0XHQkKCcjcGFub2lkJykudmFsKCBzdG9yYWdlLnBhbm9pZCApXG5cdFx0JChcImlucHV0W3ZhbHVlPSN7c3RvcmFnZS50cmF2ZWxNb2RlfV1cIikucHJvcCgnY2hlY2tlZCcsIHRydWUpXG5cdFx0JChcImlucHV0W3ZhbHVlPSN7c3RvcmFnZS5oZWFkaW5nfV1cIikucHJvcCgnY2hlY2tlZCcsIHRydWUpXG5cdFx0JCgnI2xvb2thdCcpLnZhbCggc3RvcmFnZS5sb29rYXQgKVxuXHRcdCQoJyN6b29tJykudmFsKCBzdG9yYWdlLnpvb20gKVxuXHRcdCQoJyNzdGVwJykudmFsKCBzdG9yYWdlLnN0ZXAgKVxuXHRcdCQoJyNzZWFyY2gtcmFkaXVzJykudmFsKCBzdG9yYWdlLnNlYXJjaFJhZGl1cyApXG5cblx0JGVsbS5maW5kKCdbZGF0YS1wYXJlbnRdJykuZWFjaCAtPlxuXG5cdFx0JHRoaXMgPSAkKEApXG5cdFx0JHBhcmVudCA9ICQoICR0aGlzLmF0dHIoJ2RhdGEtcGFyZW50JykgKVxuXHRcdG5hbWUgPSAkcGFyZW50LmF0dHIoJ25hbWUnKVxuXG5cdFx0JChcIltuYW1lPSN7bmFtZX1cIikub24gJ2NoYW5nZScsID0+XG5cdFx0XHQkKEApLnRvZ2dsZSggJHBhcmVudC5wcm9wKCdjaGVja2VkJykgKVxuXHRcdC50cmlnZ2VyKCdjaGFuZ2UnKVxuXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgZnVuY3Rpb25zXG5cbnVwZGF0ZVNldHRpbmdzID0gLT5cblx0c2V0dGluZ3MubmFtZSBcdCAgICAgICAgPSAkKCcjbmFtZScpLnZhbCgpXG5cdHNldHRpbmdzLmRpciBcdCAgICAgICAgPSAkKCcjZGlyJykudmFsKClcblx0c2V0dGluZ3MubWV0aG9kXHRcdFx0PSAkKCdpbnB1dFtuYW1lPW1ldGhvZF06Y2hlY2tlZCcpLnZhbCgpXG5cdHNldHRpbmdzLnVybCBcdCAgICAgICAgPSAkKCcjdXJsJykudmFsKClcblx0c2V0dGluZ3MucGFub2lkIFx0XHQ9ICQoJyNwYW5vaWQnKS52YWwoKVxuXHRzZXR0aW5ncy50cmF2ZWxNb2RlICAgICA9ICQoJ2lucHV0W25hbWU9dHJhdmVsXTpjaGVja2VkJykudmFsKClcblx0c2V0dGluZ3MuaGVhZGluZyAgICAgICAgPSAkKCdpbnB1dFtuYW1lPWhlYWRpbmddOmNoZWNrZWQnKS52YWwoKVxuXHRzZXR0aW5ncy5sb29rYXQgICAgICAgICA9ICQoJyNsb29rYXQnKS52YWwoKVxuXHRzZXR0aW5ncy56b29tXHQgICAgICAgID0gJCgnI3pvb20nKS52YWwoKVxuXHRzZXR0aW5ncy5zdGVwXHQgICAgICAgID0gJCgnI3N0ZXAnKS52YWwoKVxuXHRzZXR0aW5ncy5zZWFyY2hSYWRpdXNcdD0gJCgnI3NlYXJjaC1yYWRpdXMnKS52YWwoKVxuXHRzZXR0aW5ncy52ZXJzaW9uIFx0XHQ9IFZFUlNJT05cblxuXHQjIHNhdmUgdG8gd2ViIHN0b3JhZ2Vcblx0JC5leHRlbmQoc3RvcmFnZSwgc2V0dGluZ3MpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgb24gbG9hZFxuXG4kIC0+XG5cblx0Y2FudmFzID0gJCgnI3Bhbm9yYW1hJylbMF1cblxuXHQkKCcjY3JlYXRlJykub24gJ2NsaWNrJywgY3JlYXRlXG5cblx0R1NWSHlwZXJsYXBzZS5vbk1lc3NhZ2UgPSBvbk1lc3NhZ2Vcblx0R1NWSHlwZXJsYXBzZS5vblBhbm9yYW1hTG9hZCA9IG9uUGFub3JhbWFMb2FkXG5cdEdTVkh5cGVybGFwc2Uub25Qcm9ncmVzcyA9IG9uUHJvZ3Jlc3Ncblx0R1NWSHlwZXJsYXBzZS5vbkFuYWx5emVDb21wbGV0ZSA9IG9uQW5hbHl6ZUNvbXBsZXRlXG5cdEdTVkh5cGVybGFwc2Uub25DYW5jZWwgPSBvbkNhbmNlbFxuXG5cdHJlc3RvcmVTZXR0aW5ncygpXG5cblx0JCgnaW5wdXQnKS5vbiAnY2hhbmdlJywgdXBkYXRlU2V0dGluZ3NcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY3JlYXRlID0gLT5cblxuXHR1cGRhdGVTZXR0aW5ncygpXG5cblx0IyBGSUxFLmV4aXN0cyBcIiN7c2V0dGluZ3MuZGlyfS8je3NldHRpbmdzLm5hbWV9XCIsIChmbGcpIC0+XG5cdCMgXHRhbGVydCBmbGdcblxuXHQjcmV0dXJuXG5cblx0aW5kZXggPSB0YXNrcy5sZW5ndGhcblxuXHQkKCcudGFza3MnKS5hcHBlbmQoXCJcblx0XHQ8bGkgaWQ9J3Rhc2stI3tpbmRleH0nPlxuXHRcdFx0PGgxPjxpbnB1dCB0eXBlPSd0ZXh0JyBuYW1lPSduYW1lJyB2YWx1ZT0nI3tzZXR0aW5ncy5uYW1lfSc+PC9oMT5cblx0XHRcdDxidXR0b24gY2xhc3M9J2NhbmNlbCBhY3Rpb24nIGRhdGEtaW5kZXg9JyN7aW5kZXh9Jz5DYW5jZWw8L2J1dHRvbj5cblx0XHRcdDxwPm1vZGU6ICN7c2V0dGluZ3MubWV0aG9kfTxicj48L3A+XG5cdFx0XHQ8ZGl2IGlkPSdtYXAtI3tpbmRleH0nIHN0eWxlPSd3aWR0aDogNDglOyBoZWlnaHQ6IDA7IHBhZGRpbmctdG9wOiAyNiU7IGJhY2tncm91bmQ6Z3JheTsgZGlzcGxheTogaW5saW5lLWJsb2NrOyc+PC9kaXY+XG5cdFx0PC9saT5cblx0XCIpXG5cblx0aHlwZXJsYXBzZSA9IG5ldyBHU1ZIeXBlcmxhcHNlKHNldHRpbmdzLm5hbWUsICQoXCIjbWFwLSN7aW5kZXh9XCIpWzBdKVxuXG5cdGlmIHNldHRpbmdzLm1ldGhvZCA9PSAnZGlyZWN0aW9uJ1xuXHRcdGh5cGVybGFwc2UuY3JlYXRlRnJvbURpcmVjdGlvbihzZXR0aW5ncy51cmwsIHNldHRpbmdzKVxuXG5cdGVsc2UgaWYgc2V0dGluZ3MubWV0aG9kID09ICdwYW5vaWQnXG5cdFx0bGlzdCA9ICQucGFyc2VKU09OKCAkKCcjcGFub2lkJykudmFsKCkgKVxuXHRcdGh5cGVybGFwc2UuY3JlYXRlRnJvbVBhbm9JZChsaXN0KVxuXG5cdCQoXCIjdGFzay0je2luZGV4fSAuY2FuY2VsXCIpLm9uICdjbGljaycsIC0+XG5cdFx0aW5kZXggPSAkKEApLmF0dHIoJ2RhdGEtaW5kZXgnKVxuXHRcdHRhc2tzW2luZGV4XS5jYW5jZWwoKVxuXG5cblx0dGFza3MucHVzaCggaHlwZXJsYXBzZSApXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbm9uQ2FuY2VsID0gLT5cblx0aW5kZXggPSB0YXNrcy5pbmRleE9mKCBAIClcblx0JGVsbSA9ICQoXCIjdGFzay0je2luZGV4fVwiKVxuXG5cdCRidG4gPSAkKCc8YnV0dG9uPmRlbGV0ZTwvYnV0dG9uPjxicj4nKTtcblxuXHQkYnRuLm9uICdjbGljaycsIC0+XG5cdFx0JGVsbS5yZW1vdmUoKTtcblxuXHQkZWxtLmNoaWxkcmVuKCdwJylcblx0XHQuYXBwZW5kKCdjYW5jZWxlZDxicj4nKVxuXHRcdC5hcHBlbmQoICRidG4gKTtcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxub25BbmFseXplQ29tcGxldGUgPSAtPlxuXHRpbmRleCA9IHRhc2tzLmluZGV4T2YoIEAgKVxuXHQkZWxtID0gJChcIiN0YXNrLSN7aW5kZXh9XCIpXG5cblx0Y29uc29sZS5sb2cgJGVsbS5jaGlsZHJlbihcInBcIilcblxuXHQkYnRuR2VuID0gJCgnPGJ1dHRvbj5nZW5lcmF0ZSBoeXBlcmxhcHNlPC9idXR0b24+PGJyPicpO1xuXG5cdCRlbG0uY2hpbGRyZW4oJ3AnKS5hcHBlbmQoICRidG5HZW4gKVxuXG5cdCRidG5HZW4ub24gJ2NsaWNrJywgLT5cblx0XHQkZWxtLmNoaWxkcmVuKCcuY29udHJvbCcpLnJlbW92ZSgpXG5cblx0XHRAbmFtZSA9ICRlbG0uZmluZCgnW25hbWU9bmFtZV0nKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpLnZhbCgpXG5cblx0XHR0YXNrc1tpbmRleF0uY29tcG9zZShzZXR0aW5ncy56b29tKVxuXG5cdFx0JGVsbS5jaGlsZHJlbigncCcpLmFwcGVuZCggJGJ0bkdlbiApO1xuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5vblByb2dyZXNzID0gKGxvYWRlZCwgdG90YWwpIC0+XG5cdGluZGV4ID0gdGFza3MuaW5kZXhPZiggQCApXG5cdCRlbG0gPSAkKFwiI3Rhc2stI3tpbmRleH1cIilcblxuXHRpZiBsb2FkZWQgPCAxXG5cdFx0JGVsbS5jaGlsZHJlbigncCcpLmFwcGVuZCggJCgnPHByb2dyZXNzPjwvcHJvZ3Jlc3M+JykpXG5cblx0JGVsbS5maW5kKFwicHJvZ3Jlc3NcIikubGFzdCgpXG5cdFx0LmF0dHJcblx0XHRcdHZhbHVlOiBsb2FkZWRcblx0XHRcdG1heDogdG90YWxcblx0XHRcdCdkYXRhLWxhYmVsJzogIFwiWyN7bG9hZGVkfS8je3RvdGFsfV1cIlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5vbk1lc3NhZ2UgPSAobWVzc2FnZSkgLT5cblx0aW5kZXggPSB0YXNrcy5pbmRleE9mKCBAIClcblx0JGVsbSA9ICQoXCIjdGFzay0je2luZGV4fVwiKVxuXG5cdCRlbG0uY2hpbGRyZW4oJ3AnKS5hcHBlbmQoIG1lc3NhZ2UgKyBcIjxicj5cIiApXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbm9uUGFub3JhbWFMb2FkID0gKGlkeCwgY2FudmFzKSAtPlxuXHRpbmRleCA9IHRhc2tzLmluZGV4T2YoIEAgKVxuXHQkZWxtID0gJChcIiN0YXNrLSN7aW5kZXh9XCIpXG5cblx0JGVsbS5hcHBlbmQoIGNhbnZhcyApXG5cblx0RklMRS5zYXZlRnJhbWUgY2FudmFzLCBcIiN7c2V0dGluZ3MuZGlyfS8je0BuYW1lfS8je0BuYW1lfV8jIyMjLnBuZ1wiLCAtPlxuXHRcdFxuXG5cdCMgc2F2ZSBpbWFnZVxuXHRwYXJhbXMgPVxuXHRcdG5hbWU6IEBuYW1lXG5cdFx0ZGlyZWN0b3J5OiBzZXR0aW5ncy5kaXJcblx0XHRudW1iZXI6IGlkeFxuXHRcdGltYWdlOiBjYW52YXMudG9EYXRhVVJMKCdpbWFnZS9wbmcnKVxuXG5cdCQuYWpheCBcblx0XHR0eXBlOiBcIlBPU1RcIlxuXHRcdHVybDogJy4vc2F2ZS5waHAnXG5cdFx0ZGF0YTogcGFyYW1zXG5cdFx0c3VjY2VzczogKGpzb24pID0+XG5cdFx0XHRyZXN1bHQgPSAkLnBhcnNlSlNPTigganNvbiApXG5cdFx0XHRpZiByZXN1bHQuc3RhdHVzICE9IFwic3VjY2Vzc1wiXG5cdFx0XHRcdEBjYW5jZWwoKVxuXHRcdFx0XHQkZWxtLmNoaWxkcmVuKCdwJykuYXBwZW5kKFwiYW4gZXJyb3Igb2NjdXJlZFwiICsgXCI8YnI+XCIpXG4iXX0=