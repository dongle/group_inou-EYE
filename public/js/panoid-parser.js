var $autosearch, $status, API_KEY, FPS, SUFFIX, VERSION, bLinkUpdate, clear, cntMarker, exportJson, list, load, map, onChangePanoId, onLinksChanged, onPositionChanged, prevId, restoreSettings, settings, storage, svp, undo, updateSettings, updateStatus, urlReg;

API_KEY = "AIzaSyBQ2dzDfyF8Y0Dwe-Q6Jzx4_G62ANrTotQ";

VERSION = '0.1';

SUFFIX = 'pip';

FPS = 24.0;

storage = localStorage;

settings = {};

map = null;

svp = null;

urlReg = /!1s(.*)!2e/;

list = [];

$status = null;

$autosearch = null;

prevId = '';

cntMarker = null;

bLinkUpdate = false;

restoreSettings = function() {
  var $elm;
  $elm = $('nav');
  $('[name=url]').val(storage['pip-url']);
  return $('[name=autosearch').val(storage['pip-autosearch']);
};

updateSettings = function() {
  var $elm, key, results, val;
  $elm = $('#nav');
  $autosearch = $('[name=autosearch');
  settings.url = $('[name=url]').val();
  settings.autosearch = $('[name=autosearch]').prop('checked');
  results = [];
  for (key in settings) {
    val = settings[key];
    results.push(storage[SUFFIX + "-" + key] = val);
  }
  return results;
};

$(function() {
  var options;
  $status = $('#status');
  $('#laod').on('click', load);
  $('#clear').on('click', clear);
  $('#export').on('click', exportJson);
  $('#undo').on('click', undo);
  $('input, textarea').on('change', updateSettings);
  restoreSettings();
  options = {
    zoom: 16,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map($('#map')[0], options);
  options = {
    enableCloseButton: false
  };
  svp = new google.maps.StreetViewPanorama($('#svp')[0], options);
  cntMarker = new google.maps.Marker({
    map: map,
    icon: 'http://www.googlemapsmarkers.com/v1/009900'
  });
  google.maps.event.addListener(svp, 'pano_changed', onChangePanoId);
  google.maps.event.addListener(svp, 'position_changed', onPositionChanged);
  return google.maps.event.addListener(svp, 'links_changed', onLinksChanged);
});

clear = function() {
  list = [];
  prevId = '';
  return updateStatus();
};

exportJson = function() {
  var json;
  json = JSON.stringify(list);
  return $('#json').html(json);
};

load = function() {
  var panoId, result;
  updateSettings();
  result = urlReg.exec(settings.url);
  panoId = result[1];
  return svp.setPano(panoId);
};

undo = function() {
  return null;
};

updateStatus = function() {
  return $status.html("count: " + list.length + "<br>duration: " + ((list.length / FPS).toPrecision(2)));
};

onChangePanoId = function() {
  return null;
};

onPositionChanged = function() {
  return null;
};

onLinksChanged = function() {
  var id, l, links, marker, nextId, pos;
  links = svp.getLinks();
  if (!bLinkUpdate) {
    links = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = links.length; i < len; i++) {
        l = links[i];
        if (l.pano !== prevId) {
          results.push(l);
        }
      }
      return results;
    })();
    bLinkUpdate = true;
    svp.setLinks(links);
    return;
  }
  bLinkUpdate = false;
  pos = svp.getPosition();
  id = svp.getPano();
  list.push(id);
  marker = new google.maps.Marker({
    position: pos,
    map: map,
    title: "" + (list.length - 1)
  });
  map.setCenter(pos);
  cntMarker.setPosition(pos);
  updateStatus();
  nextId = void 0;
  if ($autosearch.prop('checked')) {
    if (links.length === 1) {
      nextId = links[0].pano;
    }
  }
  prevId = svp.getPano();
  if (nextId != null) {
    return svp.setPano(nextId);
  }
};

//# sourceMappingURL=data:application/json;base64,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LCJmaWxlIjoicGFub2lkLXBhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIkFQSV9LRVkgPSBcIkFJemFTeUJRMmR6RGZ5RjhZMER3ZS1RNkp6eDRfRzYyQU5yVG90UVwiXG5WRVJTSU9OID0gJzAuMSdcblNVRkZJWCA9ICdwaXAnXG5GUFMgPSAyNC4wXG5cblxuc3RvcmFnZSA9IGxvY2FsU3RvcmFnZVxuXG5zZXR0aW5ncyA9IHt9XG5cbm1hcCA9IG51bGxcbnN2cCA9IG51bGxcblxudXJsUmVnID0gLyExcyguKikhMmUvXG5cbmxpc3QgPSBbXVxuXG4jIGpxXG4kc3RhdHVzID0gbnVsbFxuJGF1dG9zZWFyY2ggPSBudWxsXG5cbnByZXZJZCA9ICcnXG5cbmNudE1hcmtlciA9IG51bGxcblxuIyBiVW5kbyA9IGZhbHNlXG5iTGlua1VwZGF0ZSA9IGZhbHNlXG5cblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIGZ1bmNcblxucmVzdG9yZVNldHRpbmdzID0gLT5cblx0JGVsbSA9ICQoJ25hdicpXG5cblx0JCgnW25hbWU9dXJsXScpLnZhbCBzdG9yYWdlWydwaXAtdXJsJ11cblx0JCgnW25hbWU9YXV0b3NlYXJjaCcpLnZhbCBzdG9yYWdlWydwaXAtYXV0b3NlYXJjaCddXG5cblx0XG5cbnVwZGF0ZVNldHRpbmdzID0gLT5cblx0JGVsbSA9ICQoJyNuYXYnKVxuXHQkYXV0b3NlYXJjaCA9ICQoJ1tuYW1lPWF1dG9zZWFyY2gnKVxuXG5cdHNldHRpbmdzLnVybCA9ICQoJ1tuYW1lPXVybF0nKS52YWwoKVxuXHRzZXR0aW5ncy5hdXRvc2VhcmNoID0gJCgnW25hbWU9YXV0b3NlYXJjaF0nKS5wcm9wKCdjaGVja2VkJylcblxuXHRmb3Iga2V5LCB2YWwgb2Ygc2V0dGluZ3Ncblx0XHRzdG9yYWdlW1wiI3tTVUZGSVh9LSN7a2V5fVwiXSA9IHZhbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIGluaXRcblxuJCAtPlxuXHQkc3RhdHVzID0gJCgnI3N0YXR1cycpXG5cblx0JCgnI2xhb2QnKS5vbiAnY2xpY2snLCBsb2FkXG5cdCQoJyNjbGVhcicpLm9uICdjbGljaycsIGNsZWFyXG5cdCQoJyNleHBvcnQnKS5vbiAnY2xpY2snLCBleHBvcnRKc29uXG5cdCQoJyN1bmRvJykub24gJ2NsaWNrJywgdW5kb1xuXHQkKCdpbnB1dCwgdGV4dGFyZWEnKS5vbiAnY2hhbmdlJywgdXBkYXRlU2V0dGluZ3NcblxuXHRyZXN0b3JlU2V0dGluZ3MoKVxuXG5cdG9wdGlvbnMgPSBcblx0XHR6b29tOiAxNlxuXHRcdG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVBcblxuXHRtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKCAkKCcjbWFwJylbMF0sIG9wdGlvbnMpXG5cblx0b3B0aW9ucyA9XG5cdFx0ZW5hYmxlQ2xvc2VCdXR0b246IGZhbHNlXG5cblx0c3ZwID0gbmV3IGdvb2dsZS5tYXBzLlN0cmVldFZpZXdQYW5vcmFtYSggJCgnI3N2cCcpWzBdLCBvcHRpb25zIClcblxuXHRjbnRNYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyXG5cdFx0bWFwOiBtYXBcblx0XHRpY29uOiAnaHR0cDovL3d3dy5nb29nbGVtYXBzbWFya2Vycy5jb20vdjEvMDA5OTAwJ1xuXG5cdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKHN2cCwgJ3Bhbm9fY2hhbmdlZCcsIG9uQ2hhbmdlUGFub0lkKVxuXHRnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcihzdnAsICdwb3NpdGlvbl9jaGFuZ2VkJywgb25Qb3NpdGlvbkNoYW5nZWQpXG5cdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKHN2cCwgJ2xpbmtzX2NoYW5nZWQnLCBvbkxpbmtzQ2hhbmdlZClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBhY3Rpb25cblxuY2xlYXIgPSAtPlxuXHRsaXN0ID0gW11cblx0cHJldklkID0gJydcblx0dXBkYXRlU3RhdHVzKClcblxuZXhwb3J0SnNvbiA9IC0+XG5cdGpzb24gPSBKU09OLnN0cmluZ2lmeSggbGlzdCApXG5cdCQoJyNqc29uJykuaHRtbCgganNvbiApXG5cblxubG9hZCA9IC0+XG5cdHVwZGF0ZVNldHRpbmdzKClcblxuXHRyZXN1bHQgPSB1cmxSZWcuZXhlYyggc2V0dGluZ3MudXJsIClcblx0cGFub0lkID0gcmVzdWx0WzFdXG5cdFxuXHRzdnAuc2V0UGFubyggcGFub0lkIClcblxuXG51bmRvID0gLT5cblx0bnVsbFxuXHQjIGxpc3QucG9wKClcblx0IyBzdnAuc2V0UGFubyggbGlzdFsgbGlzdC5sZW5ndGggLSAxIF0gKVxuXG5cdCMgaWYgJGF1dG9zZWFyY2gucHJvcCgnY2hlY2tlZCcpXG5cdCMgXHQkYXV0b3NlYXJjaC5wcm9wKCdjaGVja2VkJywgZmFsc2UpXG5cblx0IyB1cGRhdGVTdGF0dXMoKVxuXG5cbnVwZGF0ZVN0YXR1cyA9IC0+XG5cdCRzdGF0dXMuaHRtbChcImNvdW50OiAje2xpc3QubGVuZ3RofTxicj5kdXJhdGlvbjogI3sobGlzdC5sZW5ndGggLyBGUFMpLnRvUHJlY2lzaW9uKDIpfVwiKVxuXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgZXZ0XG5cbm9uQ2hhbmdlUGFub0lkID0gLT5cblx0cmV0dXJuIG51bGxcblxuXG5vblBvc2l0aW9uQ2hhbmdlZCA9IC0+XG5cdHJldHVybiBudWxsXG5cbm9uTGlua3NDaGFuZ2VkID0gLT5cblxuXHRsaW5rcyA9IHN2cC5nZXRMaW5rcygpXG5cblx0IyBzZXQgbGlua3Ncblx0aWYgbm90IGJMaW5rVXBkYXRlXG5cdFx0bGlua3MgPSAobCBmb3IgbCBpbiBsaW5rcyB3aGVuIGwucGFubyAhPSBwcmV2SWQpXG5cdFx0YkxpbmtVcGRhdGUgPSB0cnVlXG5cdFx0c3ZwLnNldExpbmtzKCBsaW5rcyApXG5cdFx0cmV0dXJuXG5cblx0YkxpbmtVcGRhdGUgPSBmYWxzZVxuXG5cdHBvcyA9IHN2cC5nZXRQb3NpdGlvbigpXG5cdGlkID0gc3ZwLmdldFBhbm8oKVxuXHRsaXN0LnB1c2goIGlkIClcblxuXHQjIGFkZCBtYXJrZXJcblx0bWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlclxuXHRcdHBvc2l0aW9uOiBwb3Ncblx0XHRtYXA6IG1hcFxuXHRcdHRpdGxlOiBcIiN7bGlzdC5sZW5ndGggLSAxfVwiXG5cdG1hcC5zZXRDZW50ZXIoIHBvcyApXG5cblx0Y250TWFya2VyLnNldFBvc2l0aW9uKCBwb3MgKVxuXG5cdHVwZGF0ZVN0YXR1cygpXG5cblxuXHQjIGF1dG9zZXJhY2hcblx0bmV4dElkID0gdW5kZWZpbmVkXG5cblx0aWYgJGF1dG9zZWFyY2gucHJvcCgnY2hlY2tlZCcpXG5cdFx0aWYgbGlua3MubGVuZ3RoID09IDFcblx0XHRcdG5leHRJZCA9IGxpbmtzWzBdLnBhbm9cblxuXHRwcmV2SWQgPSBzdnAuZ2V0UGFubygpXG5cdCMgYlVuZG8gPSBmYWxzZVxuXG5cdGlmIG5leHRJZD9cblx0XHRzdnAuc2V0UGFubyggbmV4dElkIClcblxuXG4iXX0=