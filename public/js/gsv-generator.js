var API_KEY, DIST_BETWEEN_PTS, MAX_PTS, VERSION, canvas, create, dirService, loader, onAnalyzeComplete, onCancel, onComposeComplete, onMessage, onPanoramaLoad, onProgress, panoIds, rawPts, res, restoreSettings, settings, storage, tasks, totalDist, updateSettings;

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
  GSVHyperlapse.onComposeComplete = onComposeComplete;
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

onComposeComplete = function() {
  var $elm, index, path;
  index = tasks.indexOf(this);
  $elm = $("#task-" + index);
  path = settings.dir + "/" + this.name + "/_report.txt";
  return FILE.saveText(this.report, path, (function(_this) {
    return function(res) {
      $elm.children('p').append('<br>report saved');
      return console.log(res);
    };
  })(this));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdzdi1nZW5lcmF0b3IuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLElBQUEsa1FBQUE7O0FBQUEsT0FBQSxHQUFVLEdBQVYsQ0FBQTs7QUFBQSxnQkFDQSxHQUFtQixDQURuQixDQUFBOztBQUFBLE9BR0EsR0FBVSx5Q0FIVixDQUFBOztBQUFBLE9BSUEsR0FBVSxLQUpWLENBQUE7O0FBQUEsTUFRQSxHQUFTLElBUlQsQ0FBQTs7QUFBQSxVQVNBLEdBQWlCLElBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBWixDQUE4QixFQUE5QixDQVRqQixDQUFBOztBQUFBLEdBWUEsR0FBTSxJQVpOLENBQUE7O0FBQUEsTUFjQSxHQUFTLEVBZFQsQ0FBQTs7QUFBQSxPQWVBLEdBQVUsRUFmVixDQUFBOztBQUFBLFNBZ0JBLEdBQVksQ0FoQlosQ0FBQTs7QUFBQSxNQWtCQSxHQUFTLElBbEJULENBQUE7O0FBQUEsS0FvQkEsR0FBUSxFQXBCUixDQUFBOztBQUFBLFFBc0JBLEdBQVcsRUF0QlgsQ0FBQTs7QUFBQSxPQXdCQSxHQUFVLFlBeEJWLENBQUE7O0FBQUEsZUErQkEsR0FBa0IsU0FBQSxHQUFBO0FBQ2pCLE1BQUEsSUFBQTtBQUFBLEVBQUEsSUFBQSxHQUFPLENBQUEsQ0FBRSxLQUFGLENBQVAsQ0FBQTtBQUVBLEVBQUEsSUFBRyxPQUFPLENBQUMsT0FBUixLQUFtQixPQUF0QjtBQUVDLElBQUEsQ0FBQSxDQUFFLE9BQUYsQ0FBVSxDQUFDLEdBQVgsQ0FBZ0IsT0FBTyxDQUFDLElBQXhCLENBQUEsQ0FBQTtBQUFBLElBQ0EsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEdBQVYsQ0FBZSxPQUFPLENBQUMsR0FBdkIsQ0FEQSxDQUFBO0FBQUEsSUFFQSxDQUFBLENBQUUsY0FBQSxHQUFlLE9BQU8sQ0FBQyxNQUF2QixHQUE4QixHQUFoQyxDQUFtQyxDQUFDLElBQXBDLENBQXlDLFNBQXpDLEVBQW9ELElBQXBELENBRkEsQ0FBQTtBQUFBLElBR0EsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEdBQVYsQ0FBZSxPQUFPLENBQUMsR0FBdkIsQ0FIQSxDQUFBO0FBQUEsSUFJQSxDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsR0FBYixDQUFrQixPQUFPLENBQUMsTUFBMUIsQ0FKQSxDQUFBO0FBQUEsSUFLQSxDQUFBLENBQUUsY0FBQSxHQUFlLE9BQU8sQ0FBQyxVQUF2QixHQUFrQyxHQUFwQyxDQUF1QyxDQUFDLElBQXhDLENBQTZDLFNBQTdDLEVBQXdELElBQXhELENBTEEsQ0FBQTtBQUFBLElBTUEsQ0FBQSxDQUFFLGNBQUEsR0FBZSxPQUFPLENBQUMsT0FBdkIsR0FBK0IsR0FBakMsQ0FBb0MsQ0FBQyxJQUFyQyxDQUEwQyxTQUExQyxFQUFxRCxJQUFyRCxDQU5BLENBQUE7QUFBQSxJQU9BLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxHQUFiLENBQWtCLE9BQU8sQ0FBQyxNQUExQixDQVBBLENBQUE7QUFBQSxJQVFBLENBQUEsQ0FBRSxPQUFGLENBQVUsQ0FBQyxHQUFYLENBQWdCLE9BQU8sQ0FBQyxJQUF4QixDQVJBLENBQUE7QUFBQSxJQVNBLENBQUEsQ0FBRSxPQUFGLENBQVUsQ0FBQyxHQUFYLENBQWdCLE9BQU8sQ0FBQyxJQUF4QixDQVRBLENBQUE7QUFBQSxJQVVBLENBQUEsQ0FBRSxnQkFBRixDQUFtQixDQUFDLEdBQXBCLENBQXlCLE9BQU8sQ0FBQyxZQUFqQyxDQVZBLENBRkQ7R0FGQTtTQWdCQSxJQUFJLENBQUMsSUFBTCxDQUFVLGVBQVYsQ0FBMEIsQ0FBQyxJQUEzQixDQUFnQyxTQUFBLEdBQUE7QUFFL0IsUUFBQSxvQkFBQTtBQUFBLElBQUEsS0FBQSxHQUFRLENBQUEsQ0FBRSxJQUFGLENBQVIsQ0FBQTtBQUFBLElBQ0EsT0FBQSxHQUFVLENBQUEsQ0FBRyxLQUFLLENBQUMsSUFBTixDQUFXLGFBQVgsQ0FBSCxDQURWLENBQUE7QUFBQSxJQUVBLElBQUEsR0FBTyxPQUFPLENBQUMsSUFBUixDQUFhLE1BQWIsQ0FGUCxDQUFBO1dBSUEsQ0FBQSxDQUFFLFFBQUEsR0FBUyxJQUFYLENBQWtCLENBQUMsRUFBbkIsQ0FBc0IsUUFBdEIsRUFBZ0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtlQUMvQixDQUFBLENBQUUsS0FBRixDQUFJLENBQUMsTUFBTCxDQUFhLE9BQU8sQ0FBQyxJQUFSLENBQWEsU0FBYixDQUFiLEVBRCtCO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEMsQ0FFQSxDQUFDLE9BRkQsQ0FFUyxRQUZULEVBTitCO0VBQUEsQ0FBaEMsRUFqQmlCO0FBQUEsQ0EvQmxCLENBQUE7O0FBQUEsY0E4REEsR0FBaUIsU0FBQSxHQUFBO0FBQ2hCLEVBQUEsUUFBUSxDQUFDLElBQVQsR0FBeUIsQ0FBQSxDQUFFLE9BQUYsQ0FBVSxDQUFDLEdBQVgsQ0FBQSxDQUF6QixDQUFBO0FBQUEsRUFDQSxRQUFRLENBQUMsR0FBVCxHQUF3QixDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsR0FBVixDQUFBLENBRHhCLENBQUE7QUFBQSxFQUVBLFFBQVEsQ0FBQyxNQUFULEdBQW9CLENBQUEsQ0FBRSw0QkFBRixDQUErQixDQUFDLEdBQWhDLENBQUEsQ0FGcEIsQ0FBQTtBQUFBLEVBR0EsUUFBUSxDQUFDLEdBQVQsR0FBd0IsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEdBQVYsQ0FBQSxDQUh4QixDQUFBO0FBQUEsRUFJQSxRQUFRLENBQUMsTUFBVCxHQUFvQixDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsR0FBYixDQUFBLENBSnBCLENBQUE7QUFBQSxFQUtBLFFBQVEsQ0FBQyxVQUFULEdBQTBCLENBQUEsQ0FBRSw0QkFBRixDQUErQixDQUFDLEdBQWhDLENBQUEsQ0FMMUIsQ0FBQTtBQUFBLEVBTUEsUUFBUSxDQUFDLE9BQVQsR0FBMEIsQ0FBQSxDQUFFLDZCQUFGLENBQWdDLENBQUMsR0FBakMsQ0FBQSxDQU4xQixDQUFBO0FBQUEsRUFPQSxRQUFRLENBQUMsTUFBVCxHQUEwQixDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsR0FBYixDQUFBLENBUDFCLENBQUE7QUFBQSxFQVFBLFFBQVEsQ0FBQyxJQUFULEdBQXdCLENBQUEsQ0FBRSxPQUFGLENBQVUsQ0FBQyxHQUFYLENBQUEsQ0FSeEIsQ0FBQTtBQUFBLEVBU0EsUUFBUSxDQUFDLElBQVQsR0FBd0IsQ0FBQSxDQUFFLE9BQUYsQ0FBVSxDQUFDLEdBQVgsQ0FBQSxDQVR4QixDQUFBO0FBQUEsRUFVQSxRQUFRLENBQUMsWUFBVCxHQUF3QixDQUFBLENBQUUsZ0JBQUYsQ0FBbUIsQ0FBQyxHQUFwQixDQUFBLENBVnhCLENBQUE7QUFBQSxFQVdBLFFBQVEsQ0FBQyxPQUFULEdBQXFCLE9BWHJCLENBQUE7U0FjQSxDQUFDLENBQUMsTUFBRixDQUFTLE9BQVQsRUFBa0IsUUFBbEIsRUFmZ0I7QUFBQSxDQTlEakIsQ0FBQTs7QUFBQSxDQWtGQSxDQUFFLFNBQUEsR0FBQTtBQUVELEVBQUEsTUFBQSxHQUFTLENBQUEsQ0FBRSxXQUFGLENBQWUsQ0FBQSxDQUFBLENBQXhCLENBQUE7QUFBQSxFQUVBLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxFQUFiLENBQWdCLE9BQWhCLEVBQXlCLE1BQXpCLENBRkEsQ0FBQTtBQUFBLEVBSUEsYUFBYSxDQUFDLFNBQWQsR0FBMEIsU0FKMUIsQ0FBQTtBQUFBLEVBS0EsYUFBYSxDQUFDLGNBQWQsR0FBK0IsY0FML0IsQ0FBQTtBQUFBLEVBTUEsYUFBYSxDQUFDLFVBQWQsR0FBMkIsVUFOM0IsQ0FBQTtBQUFBLEVBT0EsYUFBYSxDQUFDLGlCQUFkLEdBQWtDLGlCQVBsQyxDQUFBO0FBQUEsRUFRQSxhQUFhLENBQUMsaUJBQWQsR0FBa0MsaUJBUmxDLENBQUE7QUFBQSxFQVNBLGFBQWEsQ0FBQyxRQUFkLEdBQXlCLFFBVHpCLENBQUE7QUFBQSxFQVdBLGVBQUEsQ0FBQSxDQVhBLENBQUE7U0FhQSxDQUFBLENBQUUsT0FBRixDQUFVLENBQUMsRUFBWCxDQUFjLFFBQWQsRUFBd0IsY0FBeEIsRUFmQztBQUFBLENBQUYsQ0FsRkEsQ0FBQTs7QUFBQSxNQW9HQSxHQUFTLFNBQUEsR0FBQTtBQUVSLE1BQUEsdUJBQUE7QUFBQSxFQUFBLGNBQUEsQ0FBQSxDQUFBLENBQUE7QUFBQSxFQU9BLEtBQUEsR0FBUSxLQUFLLENBQUMsTUFQZCxDQUFBO0FBQUEsRUFTQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsTUFBWixDQUFtQixlQUFBLEdBQ0gsS0FERyxHQUNHLCtDQURILEdBRTJCLFFBQVEsQ0FBQyxJQUZwQyxHQUV5QyxvREFGekMsR0FHMkIsS0FIM0IsR0FHaUMsNkJBSGpDLEdBSU4sUUFBUSxDQUFDLE1BSkgsR0FJVSx3QkFKVixHQUtGLEtBTEUsR0FLSSx5R0FMdkIsQ0FUQSxDQUFBO0FBQUEsRUFrQkEsVUFBQSxHQUFpQixJQUFBLGFBQUEsQ0FBYyxRQUFRLENBQUMsSUFBdkIsRUFBNkIsQ0FBQSxDQUFFLE9BQUEsR0FBUSxLQUFWLENBQW1CLENBQUEsQ0FBQSxDQUFoRCxDQWxCakIsQ0FBQTtBQW9CQSxFQUFBLElBQUcsUUFBUSxDQUFDLE1BQVQsS0FBbUIsV0FBdEI7QUFDQyxJQUFBLFVBQVUsQ0FBQyxtQkFBWCxDQUErQixRQUFRLENBQUMsR0FBeEMsRUFBNkMsUUFBN0MsQ0FBQSxDQUREO0dBQUEsTUFHSyxJQUFHLFFBQVEsQ0FBQyxNQUFULEtBQW1CLFFBQXRCO0FBQ0osSUFBQSxJQUFBLEdBQU8sQ0FBQyxDQUFDLFNBQUYsQ0FBYSxDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsR0FBYixDQUFBLENBQWIsQ0FBUCxDQUFBO0FBQUEsSUFDQSxVQUFVLENBQUMsZ0JBQVgsQ0FBNEIsSUFBNUIsQ0FEQSxDQURJO0dBdkJMO0FBQUEsRUEyQkEsQ0FBQSxDQUFFLFFBQUEsR0FBUyxLQUFULEdBQWUsVUFBakIsQ0FBMkIsQ0FBQyxFQUE1QixDQUErQixPQUEvQixFQUF3QyxTQUFBLEdBQUE7QUFDdkMsSUFBQSxLQUFBLEdBQVEsQ0FBQSxDQUFFLElBQUYsQ0FBSSxDQUFDLElBQUwsQ0FBVSxZQUFWLENBQVIsQ0FBQTtXQUNBLEtBQU0sQ0FBQSxLQUFBLENBQU0sQ0FBQyxNQUFiLENBQUEsRUFGdUM7RUFBQSxDQUF4QyxDQTNCQSxDQUFBO1NBZ0NBLEtBQUssQ0FBQyxJQUFOLENBQVksVUFBWixFQWxDUTtBQUFBLENBcEdULENBQUE7O0FBQUEsUUF5SUEsR0FBVyxTQUFBLEdBQUE7QUFDVixNQUFBLGlCQUFBO0FBQUEsRUFBQSxLQUFBLEdBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBZSxJQUFmLENBQVIsQ0FBQTtBQUFBLEVBQ0EsSUFBQSxHQUFPLENBQUEsQ0FBRSxRQUFBLEdBQVMsS0FBWCxDQURQLENBQUE7QUFBQSxFQUdBLElBQUEsR0FBTyxDQUFBLENBQUUsNkJBQUYsQ0FIUCxDQUFBO0FBQUEsRUFLQSxJQUFJLENBQUMsRUFBTCxDQUFRLE9BQVIsRUFBaUIsU0FBQSxHQUFBO1dBQ2hCLElBQUksQ0FBQyxNQUFMLENBQUEsRUFEZ0I7RUFBQSxDQUFqQixDQUxBLENBQUE7U0FRQSxJQUFJLENBQUMsUUFBTCxDQUFjLEdBQWQsQ0FDQyxDQUFDLE1BREYsQ0FDUyxjQURULENBRUMsQ0FBQyxNQUZGLENBRVUsSUFGVixFQVRVO0FBQUEsQ0F6SVgsQ0FBQTs7QUFBQSxpQkF1SkEsR0FBb0IsU0FBQSxHQUFBO0FBQ25CLE1BQUEsb0JBQUE7QUFBQSxFQUFBLEtBQUEsR0FBUSxLQUFLLENBQUMsT0FBTixDQUFlLElBQWYsQ0FBUixDQUFBO0FBQUEsRUFDQSxJQUFBLEdBQU8sQ0FBQSxDQUFFLFFBQUEsR0FBUyxLQUFYLENBRFAsQ0FBQTtBQUFBLEVBR0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxJQUFJLENBQUMsUUFBTCxDQUFjLEdBQWQsQ0FBWixDQUhBLENBQUE7QUFBQSxFQUtBLE9BQUEsR0FBVSxDQUFBLENBQUUsMENBQUYsQ0FMVixDQUFBO0FBQUEsRUFPQSxJQUFJLENBQUMsUUFBTCxDQUFjLEdBQWQsQ0FBa0IsQ0FBQyxNQUFuQixDQUEyQixPQUEzQixDQVBBLENBQUE7U0FTQSxPQUFPLENBQUMsRUFBUixDQUFXLE9BQVgsRUFBb0IsU0FBQSxHQUFBO0FBQ25CLElBQUEsSUFBSSxDQUFDLFFBQUwsQ0FBYyxVQUFkLENBQXlCLENBQUMsTUFBMUIsQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBSSxDQUFDLElBQUwsQ0FBVSxhQUFWLENBQXdCLENBQUMsSUFBekIsQ0FBOEIsVUFBOUIsRUFBMEMsSUFBMUMsQ0FBK0MsQ0FBQyxHQUFoRCxDQUFBLENBRlIsQ0FBQTtBQUFBLElBSUEsS0FBTSxDQUFBLEtBQUEsQ0FBTSxDQUFDLE9BQWIsQ0FBcUIsUUFBUSxDQUFDLElBQTlCLENBSkEsQ0FBQTtXQU1BLElBQUksQ0FBQyxRQUFMLENBQWMsR0FBZCxDQUFrQixDQUFDLE1BQW5CLENBQTJCLE9BQTNCLEVBUG1CO0VBQUEsQ0FBcEIsRUFWbUI7QUFBQSxDQXZKcEIsQ0FBQTs7QUFBQSxpQkEyS0EsR0FBb0IsU0FBQSxHQUFBO0FBQ25CLE1BQUEsaUJBQUE7QUFBQSxFQUFBLEtBQUEsR0FBUSxLQUFLLENBQUMsT0FBTixDQUFlLElBQWYsQ0FBUixDQUFBO0FBQUEsRUFDQSxJQUFBLEdBQU8sQ0FBQSxDQUFFLFFBQUEsR0FBUyxLQUFYLENBRFAsQ0FBQTtBQUFBLEVBR0EsSUFBQSxHQUFVLFFBQVEsQ0FBQyxHQUFWLEdBQWMsR0FBZCxHQUFpQixJQUFDLENBQUEsSUFBbEIsR0FBdUIsY0FIaEMsQ0FBQTtTQUtBLElBQUksQ0FBQyxRQUFMLENBQWMsSUFBQyxDQUFBLE1BQWYsRUFBdUIsSUFBdkIsRUFBNkIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUMsR0FBRCxHQUFBO0FBQzVCLE1BQUEsSUFBSSxDQUFDLFFBQUwsQ0FBYyxHQUFkLENBQWtCLENBQUMsTUFBbkIsQ0FBMEIsa0JBQTFCLENBQUEsQ0FBQTthQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksR0FBWixFQUY0QjtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdCLEVBTm1CO0FBQUEsQ0EzS3BCLENBQUE7O0FBQUEsVUFzTEEsR0FBYSxTQUFDLE1BQUQsRUFBUyxLQUFULEdBQUE7QUFDWixNQUFBLFdBQUE7QUFBQSxFQUFBLEtBQUEsR0FBUSxLQUFLLENBQUMsT0FBTixDQUFlLElBQWYsQ0FBUixDQUFBO0FBQUEsRUFDQSxJQUFBLEdBQU8sQ0FBQSxDQUFFLFFBQUEsR0FBUyxLQUFYLENBRFAsQ0FBQTtBQUdBLEVBQUEsSUFBRyxNQUFBLEdBQVMsQ0FBWjtBQUNDLElBQUEsSUFBSSxDQUFDLFFBQUwsQ0FBYyxHQUFkLENBQWtCLENBQUMsTUFBbkIsQ0FBMkIsQ0FBQSxDQUFFLHVCQUFGLENBQTNCLENBQUEsQ0FERDtHQUhBO1NBTUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxVQUFWLENBQXFCLENBQUMsSUFBdEIsQ0FBQSxDQUNDLENBQUMsSUFERixDQUVFO0FBQUEsSUFBQSxLQUFBLEVBQU8sTUFBUDtBQUFBLElBQ0EsR0FBQSxFQUFLLEtBREw7QUFBQSxJQUVBLFlBQUEsRUFBZSxHQUFBLEdBQUksTUFBSixHQUFXLEdBQVgsR0FBYyxLQUFkLEdBQW9CLEdBRm5DO0dBRkYsRUFQWTtBQUFBLENBdExiLENBQUE7O0FBQUEsU0FvTUEsR0FBWSxTQUFDLE9BQUQsR0FBQTtBQUNYLE1BQUEsV0FBQTtBQUFBLEVBQUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWUsSUFBZixDQUFSLENBQUE7QUFBQSxFQUNBLElBQUEsR0FBTyxDQUFBLENBQUUsUUFBQSxHQUFTLEtBQVgsQ0FEUCxDQUFBO1NBR0EsSUFBSSxDQUFDLFFBQUwsQ0FBYyxHQUFkLENBQWtCLENBQUMsTUFBbkIsQ0FBMkIsT0FBQSxHQUFVLE1BQXJDLEVBSlc7QUFBQSxDQXBNWixDQUFBOztBQUFBLGNBMk1BLEdBQWlCLFNBQUMsR0FBRCxFQUFNLE1BQU4sR0FBQTtBQUNoQixNQUFBLG1CQUFBO0FBQUEsRUFBQSxLQUFBLEdBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBZSxJQUFmLENBQVIsQ0FBQTtBQUFBLEVBQ0EsSUFBQSxHQUFPLENBQUEsQ0FBRSxRQUFBLEdBQVMsS0FBWCxDQURQLENBQUE7QUFBQSxFQUdBLElBQUksQ0FBQyxNQUFMLENBQWEsTUFBYixDQUhBLENBQUE7QUFBQSxFQVNBLE1BQUEsR0FDQztBQUFBLElBQUEsSUFBQSxFQUFNLElBQUMsQ0FBQSxJQUFQO0FBQUEsSUFDQSxTQUFBLEVBQVcsUUFBUSxDQUFDLEdBRHBCO0FBQUEsSUFFQSxNQUFBLEVBQVEsR0FGUjtBQUFBLElBR0EsS0FBQSxFQUFPLE1BQU0sQ0FBQyxTQUFQLENBQWlCLFdBQWpCLENBSFA7R0FWRCxDQUFBO1NBZUEsQ0FBQyxDQUFDLElBQUYsQ0FDQztBQUFBLElBQUEsSUFBQSxFQUFNLE1BQU47QUFBQSxJQUNBLEdBQUEsRUFBSyxZQURMO0FBQUEsSUFFQSxJQUFBLEVBQU0sTUFGTjtBQUFBLElBR0EsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLElBQUQsR0FBQTtBQUNSLFlBQUEsTUFBQTtBQUFBLFFBQUEsTUFBQSxHQUFTLENBQUMsQ0FBQyxTQUFGLENBQWEsSUFBYixDQUFULENBQUE7QUFDQSxRQUFBLElBQUcsTUFBTSxDQUFDLE1BQVAsS0FBaUIsU0FBcEI7QUFDQyxVQUFBLEtBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBO2lCQUNBLElBQUksQ0FBQyxRQUFMLENBQWMsR0FBZCxDQUFrQixDQUFDLE1BQW5CLENBQTBCLGtCQUFBLEdBQXFCLE1BQS9DLEVBRkQ7U0FGUTtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSFQ7R0FERCxFQWhCZ0I7QUFBQSxDQTNNakIsQ0FBQSIsImZpbGUiOiJnc3YtZ2VuZXJhdG9yLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBjb25zdGFudHNcbk1BWF9QVFMgPSAxMDBcbkRJU1RfQkVUV0VFTl9QVFMgPSA1XG5cbkFQSV9LRVkgPSBcIkFJemFTeUJRMmR6RGZ5RjhZMER3ZS1RNkp6eDRfRzYyQU5yVG90UVwiXG5WRVJTSU9OID0gJzAuMydcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyB2YXJpYWJsZXNcbmxvYWRlciA9IG51bGxcbmRpclNlcnZpY2UgPSBuZXcgZ29vZ2xlLm1hcHMuRGlyZWN0aW9uc1NlcnZpY2Uoe30pXG5cbiMgZWFjaCByZXNcbnJlcyA9IG51bGxcblxucmF3UHRzID0gW11cbnBhbm9JZHMgPSBbXVxudG90YWxEaXN0ID0gMFxuXG5jYW52YXMgPSBudWxsXG5cbnRhc2tzID0gW11cblxuc2V0dGluZ3MgPSB7fVxuXG5zdG9yYWdlID0gbG9jYWxTdG9yYWdlXG5cblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIGluaXRcblxucmVzdG9yZVNldHRpbmdzID0gLT5cblx0JGVsbSA9ICQoJ25hdicpXG5cblx0aWYgc3RvcmFnZS52ZXJzaW9uID09IFZFUlNJT05cblx0XHQjIHJlc3RvcmUgYWxsIHNldHRpbmdzXG5cdFx0JCgnI25hbWUnKS52YWwoIHN0b3JhZ2UubmFtZSApXG5cdFx0JCgnI2RpcicpLnZhbCggc3RvcmFnZS5kaXIgKVxuXHRcdCQoXCJpbnB1dFt2YWx1ZT0je3N0b3JhZ2UubWV0aG9kfV1cIikucHJvcCgnY2hlY2tlZCcsIHRydWUpXG5cdFx0JCgnI3VybCcpLnZhbCggc3RvcmFnZS51cmwgKVxuXHRcdCQoJyNwYW5vaWQnKS52YWwoIHN0b3JhZ2UucGFub2lkIClcblx0XHQkKFwiaW5wdXRbdmFsdWU9I3tzdG9yYWdlLnRyYXZlbE1vZGV9XVwiKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSlcblx0XHQkKFwiaW5wdXRbdmFsdWU9I3tzdG9yYWdlLmhlYWRpbmd9XVwiKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSlcblx0XHQkKCcjbG9va2F0JykudmFsKCBzdG9yYWdlLmxvb2thdCApXG5cdFx0JCgnI3pvb20nKS52YWwoIHN0b3JhZ2Uuem9vbSApXG5cdFx0JCgnI3N0ZXAnKS52YWwoIHN0b3JhZ2Uuc3RlcCApXG5cdFx0JCgnI3NlYXJjaC1yYWRpdXMnKS52YWwoIHN0b3JhZ2Uuc2VhcmNoUmFkaXVzIClcblxuXHQkZWxtLmZpbmQoJ1tkYXRhLXBhcmVudF0nKS5lYWNoIC0+XG5cblx0XHQkdGhpcyA9ICQoQClcblx0XHQkcGFyZW50ID0gJCggJHRoaXMuYXR0cignZGF0YS1wYXJlbnQnKSApXG5cdFx0bmFtZSA9ICRwYXJlbnQuYXR0cignbmFtZScpXG5cblx0XHQkKFwiW25hbWU9I3tuYW1lfVwiKS5vbiAnY2hhbmdlJywgPT5cblx0XHRcdCQoQCkudG9nZ2xlKCAkcGFyZW50LnByb3AoJ2NoZWNrZWQnKSApXG5cdFx0LnRyaWdnZXIoJ2NoYW5nZScpXG5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBmdW5jdGlvbnNcblxudXBkYXRlU2V0dGluZ3MgPSAtPlxuXHRzZXR0aW5ncy5uYW1lIFx0ICAgICAgICA9ICQoJyNuYW1lJykudmFsKClcblx0c2V0dGluZ3MuZGlyIFx0ICAgICAgICA9ICQoJyNkaXInKS52YWwoKVxuXHRzZXR0aW5ncy5tZXRob2RcdFx0XHQ9ICQoJ2lucHV0W25hbWU9bWV0aG9kXTpjaGVja2VkJykudmFsKClcblx0c2V0dGluZ3MudXJsIFx0ICAgICAgICA9ICQoJyN1cmwnKS52YWwoKVxuXHRzZXR0aW5ncy5wYW5vaWQgXHRcdD0gJCgnI3Bhbm9pZCcpLnZhbCgpXG5cdHNldHRpbmdzLnRyYXZlbE1vZGUgICAgID0gJCgnaW5wdXRbbmFtZT10cmF2ZWxdOmNoZWNrZWQnKS52YWwoKVxuXHRzZXR0aW5ncy5oZWFkaW5nICAgICAgICA9ICQoJ2lucHV0W25hbWU9aGVhZGluZ106Y2hlY2tlZCcpLnZhbCgpXG5cdHNldHRpbmdzLmxvb2thdCAgICAgICAgID0gJCgnI2xvb2thdCcpLnZhbCgpXG5cdHNldHRpbmdzLnpvb21cdCAgICAgICAgPSAkKCcjem9vbScpLnZhbCgpXG5cdHNldHRpbmdzLnN0ZXBcdCAgICAgICAgPSAkKCcjc3RlcCcpLnZhbCgpXG5cdHNldHRpbmdzLnNlYXJjaFJhZGl1c1x0PSAkKCcjc2VhcmNoLXJhZGl1cycpLnZhbCgpXG5cdHNldHRpbmdzLnZlcnNpb24gXHRcdD0gVkVSU0lPTlxuXG5cdCMgc2F2ZSB0byB3ZWIgc3RvcmFnZVxuXHQkLmV4dGVuZChzdG9yYWdlLCBzZXR0aW5ncylcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBvbiBsb2FkXG5cbiQgLT5cblxuXHRjYW52YXMgPSAkKCcjcGFub3JhbWEnKVswXVxuXG5cdCQoJyNjcmVhdGUnKS5vbiAnY2xpY2snLCBjcmVhdGVcblxuXHRHU1ZIeXBlcmxhcHNlLm9uTWVzc2FnZSA9IG9uTWVzc2FnZVxuXHRHU1ZIeXBlcmxhcHNlLm9uUGFub3JhbWFMb2FkID0gb25QYW5vcmFtYUxvYWRcblx0R1NWSHlwZXJsYXBzZS5vblByb2dyZXNzID0gb25Qcm9ncmVzc1xuXHRHU1ZIeXBlcmxhcHNlLm9uQW5hbHl6ZUNvbXBsZXRlID0gb25BbmFseXplQ29tcGxldGVcblx0R1NWSHlwZXJsYXBzZS5vbkNvbXBvc2VDb21wbGV0ZSA9IG9uQ29tcG9zZUNvbXBsZXRlXG5cdEdTVkh5cGVybGFwc2Uub25DYW5jZWwgPSBvbkNhbmNlbFxuXG5cdHJlc3RvcmVTZXR0aW5ncygpXG5cblx0JCgnaW5wdXQnKS5vbiAnY2hhbmdlJywgdXBkYXRlU2V0dGluZ3NcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY3JlYXRlID0gLT5cblxuXHR1cGRhdGVTZXR0aW5ncygpXG5cblx0IyBGSUxFLmV4aXN0cyBcIiN7c2V0dGluZ3MuZGlyfS8je3NldHRpbmdzLm5hbWV9XCIsIChmbGcpIC0+XG5cdCMgXHRhbGVydCBmbGdcblxuXHQjcmV0dXJuXG5cblx0aW5kZXggPSB0YXNrcy5sZW5ndGhcblxuXHQkKCcudGFza3MnKS5hcHBlbmQoXCJcblx0XHQ8bGkgaWQ9J3Rhc2stI3tpbmRleH0nPlxuXHRcdFx0PGgxPjxpbnB1dCB0eXBlPSd0ZXh0JyBuYW1lPSduYW1lJyB2YWx1ZT0nI3tzZXR0aW5ncy5uYW1lfSc+PC9oMT5cblx0XHRcdDxidXR0b24gY2xhc3M9J2NhbmNlbCBhY3Rpb24nIGRhdGEtaW5kZXg9JyN7aW5kZXh9Jz5DYW5jZWw8L2J1dHRvbj5cblx0XHRcdDxwPm1vZGU6ICN7c2V0dGluZ3MubWV0aG9kfTxicj48L3A+XG5cdFx0XHQ8ZGl2IGlkPSdtYXAtI3tpbmRleH0nIHN0eWxlPSd3aWR0aDogNDglOyBoZWlnaHQ6IDA7IHBhZGRpbmctdG9wOiAyNiU7IGJhY2tncm91bmQ6Z3JheTsgZGlzcGxheTogaW5saW5lLWJsb2NrOyc+PC9kaXY+XG5cdFx0PC9saT5cblx0XCIpXG5cblx0aHlwZXJsYXBzZSA9IG5ldyBHU1ZIeXBlcmxhcHNlKHNldHRpbmdzLm5hbWUsICQoXCIjbWFwLSN7aW5kZXh9XCIpWzBdKVxuXG5cdGlmIHNldHRpbmdzLm1ldGhvZCA9PSAnZGlyZWN0aW9uJ1xuXHRcdGh5cGVybGFwc2UuY3JlYXRlRnJvbURpcmVjdGlvbihzZXR0aW5ncy51cmwsIHNldHRpbmdzKVxuXG5cdGVsc2UgaWYgc2V0dGluZ3MubWV0aG9kID09ICdwYW5vaWQnXG5cdFx0bGlzdCA9ICQucGFyc2VKU09OKCAkKCcjcGFub2lkJykudmFsKCkgKVxuXHRcdGh5cGVybGFwc2UuY3JlYXRlRnJvbVBhbm9JZChsaXN0KVxuXG5cdCQoXCIjdGFzay0je2luZGV4fSAuY2FuY2VsXCIpLm9uICdjbGljaycsIC0+XG5cdFx0aW5kZXggPSAkKEApLmF0dHIoJ2RhdGEtaW5kZXgnKVxuXHRcdHRhc2tzW2luZGV4XS5jYW5jZWwoKVxuXG5cblx0dGFza3MucHVzaCggaHlwZXJsYXBzZSApXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbm9uQ2FuY2VsID0gLT5cblx0aW5kZXggPSB0YXNrcy5pbmRleE9mKCBAIClcblx0JGVsbSA9ICQoXCIjdGFzay0je2luZGV4fVwiKVxuXG5cdCRidG4gPSAkKCc8YnV0dG9uPmRlbGV0ZTwvYnV0dG9uPjxicj4nKTtcblxuXHQkYnRuLm9uICdjbGljaycsIC0+XG5cdFx0JGVsbS5yZW1vdmUoKTtcblxuXHQkZWxtLmNoaWxkcmVuKCdwJylcblx0XHQuYXBwZW5kKCdjYW5jZWxlZDxicj4nKVxuXHRcdC5hcHBlbmQoICRidG4gKTtcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxub25BbmFseXplQ29tcGxldGUgPSAtPlxuXHRpbmRleCA9IHRhc2tzLmluZGV4T2YoIEAgKVxuXHQkZWxtID0gJChcIiN0YXNrLSN7aW5kZXh9XCIpXG5cblx0Y29uc29sZS5sb2cgJGVsbS5jaGlsZHJlbihcInBcIilcblxuXHQkYnRuR2VuID0gJCgnPGJ1dHRvbj5nZW5lcmF0ZSBoeXBlcmxhcHNlPC9idXR0b24+PGJyPicpO1xuXG5cdCRlbG0uY2hpbGRyZW4oJ3AnKS5hcHBlbmQoICRidG5HZW4gKVxuXG5cdCRidG5HZW4ub24gJ2NsaWNrJywgLT5cblx0XHQkZWxtLmNoaWxkcmVuKCcuY29udHJvbCcpLnJlbW92ZSgpXG5cblx0XHRAbmFtZSA9ICRlbG0uZmluZCgnW25hbWU9bmFtZV0nKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpLnZhbCgpXG5cblx0XHR0YXNrc1tpbmRleF0uY29tcG9zZShzZXR0aW5ncy56b29tKVxuXG5cdFx0JGVsbS5jaGlsZHJlbigncCcpLmFwcGVuZCggJGJ0bkdlbiApO1xuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5vbkNvbXBvc2VDb21wbGV0ZSA9IC0+XG5cdGluZGV4ID0gdGFza3MuaW5kZXhPZiggQCApXG5cdCRlbG0gPSAkKFwiI3Rhc2stI3tpbmRleH1cIilcblxuXHRwYXRoID0gXCIje3NldHRpbmdzLmRpcn0vI3tAbmFtZX0vX3JlcG9ydC50eHRcIlxuXG5cdEZJTEUuc2F2ZVRleHQgQHJlcG9ydCwgcGF0aCwgKHJlcykgPT5cblx0XHQkZWxtLmNoaWxkcmVuKCdwJykuYXBwZW5kKCc8YnI+cmVwb3J0IHNhdmVkJylcblx0XHRjb25zb2xlLmxvZyByZXNcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxub25Qcm9ncmVzcyA9IChsb2FkZWQsIHRvdGFsKSAtPlxuXHRpbmRleCA9IHRhc2tzLmluZGV4T2YoIEAgKVxuXHQkZWxtID0gJChcIiN0YXNrLSN7aW5kZXh9XCIpXG5cblx0aWYgbG9hZGVkIDwgMVxuXHRcdCRlbG0uY2hpbGRyZW4oJ3AnKS5hcHBlbmQoICQoJzxwcm9ncmVzcz48L3Byb2dyZXNzPicpKVxuXG5cdCRlbG0uZmluZChcInByb2dyZXNzXCIpLmxhc3QoKVxuXHRcdC5hdHRyXG5cdFx0XHR2YWx1ZTogbG9hZGVkXG5cdFx0XHRtYXg6IHRvdGFsXG5cdFx0XHQnZGF0YS1sYWJlbCc6ICBcIlsje2xvYWRlZH0vI3t0b3RhbH1dXCJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxub25NZXNzYWdlID0gKG1lc3NhZ2UpIC0+XG5cdGluZGV4ID0gdGFza3MuaW5kZXhPZiggQCApXG5cdCRlbG0gPSAkKFwiI3Rhc2stI3tpbmRleH1cIilcblxuXHQkZWxtLmNoaWxkcmVuKCdwJykuYXBwZW5kKCBtZXNzYWdlICsgXCI8YnI+XCIgKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5vblBhbm9yYW1hTG9hZCA9IChpZHgsIGNhbnZhcykgLT5cblx0aW5kZXggPSB0YXNrcy5pbmRleE9mKCBAIClcblx0JGVsbSA9ICQoXCIjdGFzay0je2luZGV4fVwiKVxuXG5cdCRlbG0uYXBwZW5kKCBjYW52YXMgKVxuXG5cdCNGSUxFLnNhdmVGcmFtZSBjYW52YXMsIFwiI3tzZXR0aW5ncy5kaXJ9LyN7QG5hbWV9LyN7QG5hbWV9XyMjIyMucG5nXCIsIC0+XG5cdFx0XG5cblx0IyBzYXZlIGltYWdlXG5cdHBhcmFtcyA9XG5cdFx0bmFtZTogQG5hbWVcblx0XHRkaXJlY3Rvcnk6IHNldHRpbmdzLmRpclxuXHRcdG51bWJlcjogaWR4XG5cdFx0aW1hZ2U6IGNhbnZhcy50b0RhdGFVUkwoJ2ltYWdlL3BuZycpXG5cblx0JC5hamF4IFxuXHRcdHR5cGU6IFwiUE9TVFwiXG5cdFx0dXJsOiAnLi9zYXZlLnBocCdcblx0XHRkYXRhOiBwYXJhbXNcblx0XHRzdWNjZXNzOiAoanNvbikgPT5cblx0XHRcdHJlc3VsdCA9ICQucGFyc2VKU09OKCBqc29uIClcblx0XHRcdGlmIHJlc3VsdC5zdGF0dXMgIT0gXCJzdWNjZXNzXCJcblx0XHRcdFx0QGNhbmNlbCgpXG5cdFx0XHRcdCRlbG0uY2hpbGRyZW4oJ3AnKS5hcHBlbmQoXCJhbiBlcnJvciBvY2N1cmVkXCIgKyBcIjxicj5cIilcbiJdfQ==