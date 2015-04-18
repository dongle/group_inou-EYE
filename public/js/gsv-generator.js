var API_KEY, DIST_BETWEEN_PTS, MAX_PTS, canvas, create, dirService, loader, onMessage, onPanoramaLoad, panoIds, rawPts, res, settings, tasks, totalDist, updateSettings;

MAX_PTS = 100;

DIST_BETWEEN_PTS = 5;

API_KEY = "AIzaSyBQ2dzDfyF8Y0Dwe-Q6Jzx4_G62ANrTotQ";

loader = null;

dirService = new google.maps.DirectionsService({});

res = null;

rawPts = [];

panoIds = [];

totalDist = 0;

canvas = null;

tasks = [];

settings = {};

updateSettings = function() {
  settings.name = $('#name').val();
  settings.dir = $('#dir').val();
  settings.url = $('#url').val();
  settings.travelMode = $('input[name=travel]:checked').val();
  settings.lookat = $('#lookat').val();
  settings.step = $('#step').val();
  settings.heading = $('input[name=heading]:checked').val();
  settings.lookat = $('#lookat').val();
  return settings.quality = $('#flg-proxy').prop('checked') ? 2 : 3;
};

$(function() {
  canvas = $('#panorama')[0];
  $('#create').on('click', create);
  GSVHyperlapse.onMessage = onMessage;
  return GSVHyperlapse.onPanoramaLoad = onPanoramaLoad;
});

create = function() {
  var hyperlapse, index;
  updateSettings();
  index = tasks.length;
  $('.tasks').append("<li id='task-" + index + "'> <h1>" + settings.name + "</h1> <button class='action' data-index='" + index + "'>Cancel</button> <p>requesting route..<br></p> <progress max='1' value='0'>ダウンロード中</progress> <div id='map-" + index + "' style='width: 48%; height: 0; padding-top: 26%; background:gray; display: inline-block;'></div> </li>");
  hyperlapse = new GSVHyperlapse(settings);
  hyperlapse.setMap($("#map-" + index)[0]);
  hyperlapse.create();
  $("#task-" + index + " button").on('click', function() {
    var $elm;
    $elm = $(this);
    index = $elm.attr('data-index');
    tasks[index].bCancel = true;
    return $elm.next().append('canceled');
  });
  return tasks.push(hyperlapse);
};

onMessage = function(message) {
  var $elm, index;
  index = tasks.indexOf(this);
  $elm = $("#task-" + index);
  return $elm.children('p').append(message + "<br>");
};

onPanoramaLoad = function(canvas, loaded, total) {
  var $elm, index, params, self;
  index = tasks.indexOf(this);
  $elm = $("#task-" + index);
  $elm.children("progress").attr({
    value: loaded,
    max: total,
    'data-label': "[" + loaded + "/" + total + "]"
  });
  $elm.append(canvas);
  params = {
    name: this.name,
    directory: settings.dir,
    number: this.numPanorama,
    image: canvas.toDataURL('image/png')
  };
  console.log(params.image);
  self = this;
  return $.ajax({
    type: "POST",
    url: './save.php',
    data: params,
    success: function(json) {
      var result;
      result = $.parseJSON(json);
      if (result.status !== "success") {
        self.bCancel = true;
        return $elm.children('p').append("an error occured" + "<br>");
      }
    }
  });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdzdi1nZW5lcmF0b3IuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLElBQUEsbUtBQUE7O0FBQUEsT0FBQSxHQUFVLEdBQVYsQ0FBQTs7QUFBQSxnQkFDQSxHQUFtQixDQURuQixDQUFBOztBQUFBLE9BR0EsR0FBVSx5Q0FIVixDQUFBOztBQUFBLE1BUUEsR0FBUyxJQVJULENBQUE7O0FBQUEsVUFTQSxHQUFpQixJQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQVosQ0FBOEIsRUFBOUIsQ0FUakIsQ0FBQTs7QUFBQSxHQVlBLEdBQU0sSUFaTixDQUFBOztBQUFBLE1BY0EsR0FBUyxFQWRULENBQUE7O0FBQUEsT0FlQSxHQUFVLEVBZlYsQ0FBQTs7QUFBQSxTQWdCQSxHQUFZLENBaEJaLENBQUE7O0FBQUEsTUFrQkEsR0FBUyxJQWxCVCxDQUFBOztBQUFBLEtBb0JBLEdBQVEsRUFwQlIsQ0FBQTs7QUFBQSxRQXNCQSxHQUFXLEVBdEJYLENBQUE7O0FBQUEsY0E4QkEsR0FBaUIsU0FBQSxHQUFBO0FBQ2hCLEVBQUEsUUFBUSxDQUFDLElBQVQsR0FBaUIsQ0FBQSxDQUFFLE9BQUYsQ0FBVSxDQUFDLEdBQVgsQ0FBQSxDQUFqQixDQUFBO0FBQUEsRUFDQSxRQUFRLENBQUMsR0FBVCxHQUFnQixDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsR0FBVixDQUFBLENBRGhCLENBQUE7QUFBQSxFQUVBLFFBQVEsQ0FBQyxHQUFULEdBQWdCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxHQUFWLENBQUEsQ0FGaEIsQ0FBQTtBQUFBLEVBR0EsUUFBUSxDQUFDLFVBQVQsR0FBc0IsQ0FBQSxDQUFFLDRCQUFGLENBQStCLENBQUMsR0FBaEMsQ0FBQSxDQUh0QixDQUFBO0FBQUEsRUFJQSxRQUFRLENBQUMsTUFBVCxHQUFrQixDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsR0FBYixDQUFBLENBSmxCLENBQUE7QUFBQSxFQUtBLFFBQVEsQ0FBQyxJQUFULEdB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QUFuQixDQUEwQixrQkFBQSxHQUFxQixNQUEvQyxFQUZEO09BRlE7SUFBQSxDQUhUO0dBREQsRUF2QmdCO0FBQUEsQ0EzRmpCLENBQUEiLCJmaWxlIjoiZ3N2LWdlbmVyYXRvci5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgY29uc3RhbnRzXG5NQVhfUFRTID0gMTAwXG5ESVNUX0JFVFdFRU5fUFRTID0gNVxuXG5BUElfS0VZID0gXCJBSXphU3lCUTJkekRmeUY4WTBEd2UtUTZKeng0X0c2MkFOclRvdFFcIlxuXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgdmFyaWFibGVzXG5sb2FkZXIgPSBudWxsXG5kaXJTZXJ2aWNlID0gbmV3IGdvb2dsZS5tYXBzLkRpcmVjdGlvbnNTZXJ2aWNlKHt9KVxuXG4jIGVhY2ggcmVzXG5yZXMgPSBudWxsXG5cbnJhd1B0cyA9IFtdXG5wYW5vSWRzID0gW11cbnRvdGFsRGlzdCA9IDBcblxuY2FudmFzID0gbnVsbFxuXG50YXNrcyA9IFtdXG5cbnNldHRpbmdzID0ge31cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBpbml0XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgZnVuY3Rpb25zXG5cbnVwZGF0ZVNldHRpbmdzID0gLT5cblx0c2V0dGluZ3MubmFtZSBcdD0gJCgnI25hbWUnKS52YWwoKVxuXHRzZXR0aW5ncy5kaXIgXHQ9ICQoJyNkaXInKS52YWwoKVxuXHRzZXR0aW5ncy51cmwgXHQ9ICQoJyN1cmwnKS52YWwoKVxuXHRzZXR0aW5ncy50cmF2ZWxNb2RlID0gJCgnaW5wdXRbbmFtZT10cmF2ZWxdOmNoZWNrZWQnKS52YWwoKVxuXHRzZXR0aW5ncy5sb29rYXRcdD0gJCgnI2xvb2thdCcpLnZhbCgpXG5cdHNldHRpbmdzLnN0ZXBcdD0gJCgnI3N0ZXAnKS52YWwoKVxuXHRzZXR0aW5ncy5oZWFkaW5nPSAkKCdpbnB1dFtuYW1lPWhlYWRpbmddOmNoZWNrZWQnKS52YWwoKVxuXHRzZXR0aW5ncy5sb29rYXQgPSAkKCcjbG9va2F0JykudmFsKClcblx0c2V0dGluZ3MucXVhbGl0eT0gaWYgJCgnI2ZsZy1wcm94eScpLnByb3AoJ2NoZWNrZWQnKSB0aGVuIDIgZWxzZSAzXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgb24gbG9hZFxuXG4kIC0+XG5cblx0Y2FudmFzID0gJCgnI3Bhbm9yYW1hJylbMF1cblxuXHQkKCcjY3JlYXRlJykub24gJ2NsaWNrJywgY3JlYXRlXG5cblx0R1NWSHlwZXJsYXBzZS5vbk1lc3NhZ2UgPSBvbk1lc3NhZ2Vcblx0R1NWSHlwZXJsYXBzZS5vblBhbm9yYW1hTG9hZCA9IG9uUGFub3JhbWFMb2FkXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNyZWF0ZSA9IC0+XG5cblx0dXBkYXRlU2V0dGluZ3MoKVxuXG5cdGluZGV4ID0gdGFza3MubGVuZ3RoXG5cblx0JCgnLnRhc2tzJykuYXBwZW5kKFwiXG5cdFx0PGxpIGlkPSd0YXNrLSN7aW5kZXh9Jz5cblx0XHRcdDxoMT4je3NldHRpbmdzLm5hbWV9PC9oMT5cblx0XHRcdDxidXR0b24gY2xhc3M9J2FjdGlvbicgZGF0YS1pbmRleD0nI3tpbmRleH0nPkNhbmNlbDwvYnV0dG9uPlxuXHRcdFx0PHA+cmVxdWVzdGluZyByb3V0ZS4uPGJyPjwvcD5cblx0XHRcdDxwcm9ncmVzcyBtYXg9JzEnIHZhbHVlPScwJz7jg4Djgqbjg7Pjg63jg7zjg4nkuK08L3Byb2dyZXNzPlxuXHRcdFx0PGRpdiBpZD0nbWFwLSN7aW5kZXh9JyBzdHlsZT0nd2lkdGg6IDQ4JTsgaGVpZ2h0OiAwOyBwYWRkaW5nLXRvcDogMjYlOyBiYWNrZ3JvdW5kOmdyYXk7IGRpc3BsYXk6IGlubGluZS1ibG9jazsnPjwvZGl2PlxuXHRcdDwvbGk+XG5cdFwiKVxuXG5cdGh5cGVybGFwc2UgPSBuZXcgR1NWSHlwZXJsYXBzZSggc2V0dGluZ3MgKVxuXHRoeXBlcmxhcHNlLnNldE1hcCggJChcIiNtYXAtI3tpbmRleH1cIilbMF0gKVxuXHRoeXBlcmxhcHNlLmNyZWF0ZSgpXG5cblx0JChcIiN0YXNrLSN7aW5kZXh9IGJ1dHRvblwiKS5vbiAnY2xpY2snLCAtPlxuXHRcdCRlbG0gPSAkKEApXG5cdFx0aW5kZXggPSAkZWxtLmF0dHIoJ2RhdGEtaW5kZXgnKVxuXHRcdHRhc2tzW2luZGV4XS5iQ2FuY2VsID0gdHJ1ZVxuXHRcdCRlbG0ubmV4dCgpLmFwcGVuZCgnY2FuY2VsZWQnKVxuXG5cblx0dGFza3MucHVzaCggaHlwZXJsYXBzZSApXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbm9uTWVzc2FnZSA9IChtZXNzYWdlKSAtPlxuXHRpbmRleCA9IHRhc2tzLmluZGV4T2YoIEAgKVxuXHQkZWxtID0gJChcIiN0YXNrLSN7aW5kZXh9XCIpXG5cblx0JGVsbS5jaGlsZHJlbigncCcpLmFwcGVuZCggbWVzc2FnZSArIFwiPGJyPlwiIClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxub25QYW5vcmFtYUxvYWQgPSAoY2FudmFzLCBsb2FkZWQsIHRvdGFsKSAtPlxuXHRpbmRleCA9IHRhc2tzLmluZGV4T2YoIEAgKVxuXHQkZWxtID0gJChcIiN0YXNrLSN7aW5kZXh9XCIpXG5cblx0JGVsbS5jaGlsZHJlbihcInByb2dyZXNzXCIpXG5cdFx0LmF0dHJcblx0XHRcdHZhbHVlOiBsb2FkZWRcblx0XHRcdG1heDogdG90YWxcblx0XHRcdCdkYXRhLWxhYmVsJzogIFwiWyN7bG9hZGVkfS8je3RvdGFsfV1cIlxuXG5cdCRlbG0uYXBwZW5kKCBjYW52YXMgKVxuXG5cdCMgc2F2ZSBpbWFnZVxuXHRwYXJhbXMgPVxuXHRcdG5hbWU6IEBuYW1lXG5cdFx0ZGlyZWN0b3J5OiBzZXR0aW5ncy5kaXJcblx0XHRudW1iZXI6IEBudW1QYW5vcmFtYVxuXHRcdGltYWdlOiBjYW52YXMudG9EYXRhVVJMKCdpbWFnZS9wbmcnKVxuXG5cdGNvbnNvbGUubG9nIHBhcmFtcy5pbWFnZVxuXG5cdHNlbGYgPSBAXG5cblx0JC5hamF4IFxuXHRcdHR5cGU6IFwiUE9TVFwiXG5cdFx0dXJsOiAnLi9zYXZlLnBocCdcblx0XHRkYXRhOiBwYXJhbXNcblx0XHRzdWNjZXNzOiAoanNvbikgLT5cblx0XHRcdHJlc3VsdCA9ICQucGFyc2VKU09OKCBqc29uIClcblx0XHRcdGlmIHJlc3VsdC5zdGF0dXMgIT0gXCJzdWNjZXNzXCJcblx0XHRcdFx0c2VsZi5iQ2FuY2VsID0gdHJ1ZVxuXHRcdFx0XHQkZWxtLmNoaWxkcmVuKCdwJykuYXBwZW5kKFwiYW4gZXJyb3Igb2NjdXJlZFwiICsgXCI8YnI+XCIpXG4iXX0=