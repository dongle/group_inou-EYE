var $console, $progPano, $progSeq, $statPano, $statSeq, basename, decode, destDir, fileList, gsvh, gsvp, load, log, onComplete, sisyphus, srcDir, ss, startTime;

$console = null;

$progPano = null;

$statPano = null;

$progSeq = null;

$statSeq = null;

srcDir = "";

destDir = "";

fileList = null;

gsvh = null;

basename = null;

sisyphus = null;

gsvp = null;

startTime = null;

ss = new google.maps.StreetViewService();

log = function(str) {
  $console.append(str + "\n");
  return $console.scrollTop = $console.scrollHeight;
};

$(function() {
  $console = $('#console');
  $progPano = $('#prog-pano');
  $progSeq = $('#prog-seq');
  $statPano = $('#stat-pano');
  $statSeq = $('#stat-seq');
  sisyphus = $('#replace-proxy').sisyphus();
  $('#decode').on('click', decode);
  $('[name=file]').on('change', function() {
    $('[name=source]').val($('[name=file]').val());
    return sisyphus.saveAllData();
  });
  gsvp = new GSVPANO.PanoLoader({
    zoom: parseInt($('[name=zoom]').val())
  });
  return gsvp.onProgress = function(p) {
    $statPano.html(p + "%");
    return $progPano.val(p);
  };
});

decode = function() {
  var f, files;
  srcDir = $('[name=source]').val();
  if (srcDir === "") {
    alert("please select source directory");
    return;
  }
  files = fs.readdirSync(srcDir);
  fileList = (function() {
    var j, len, results;
    results = [];
    for (j = 0, len = files.length; j < len; j++) {
      f = files[j];
      if (/\.png$/.test(f)) {
        results.push(f);
      }
    }
    return results;
  })();
  basename = path.basename(srcDir);
  return load();
};

load = function() {
  var err, filename, idx, img, loadImg, onLoadImg, outCanvas, outCtx, savePano, srcCanvas, srcCtx;
  startTime = new Date();
  destDir = (path.dirname(srcDir)) + "/" + basename + ".HQ";
  try {
    mkdirp.sync(destDir);
  } catch (_error) {
    err = _error;
    alert("Destination directory already exists. Please delete '" + destDir + "' to continue.");
  }
  img = new Image();
  srcCanvas = $('#src')[0];
  outCanvas = $('#out')[0];
  srcCtx = srcCanvas.getContext('2d');
  outCtx = outCanvas.getContext('2d');
  idx = 0;
  filename = "";
  loadImg = function() {
    var elapsed;
    elapsed = ((new Date()) - startTime) / 1000 / 60;
    $statSeq.html("(" + (idx + 1) + "/" + fileList.length + ") " + (elapsed.toPrecision(2)) + "min elapsed");
    $progSeq.val((idx + 1) / fileList.length * 100);
    filename = fileList[idx];
    return img.src = "file:///" + srcDir + "/" + filename;
  };
  onLoadImg = function() {
    var headingOffset, height, i, j, pano, pixel, ref, width, x;
    width = img.width;
    height = img.height;
    srcCanvas.width = img.width;
    srcCanvas.height = img.height;
    srcCtx.drawImage(img, 0, 0);
    headingOffset = 0;
    x = 0;
    for (i = j = 0, ref = srcCanvas.width - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      pixel = srcCtx.getImageData(i, 836, 1, 1).data;
      if (pixel[0] >= 128) {
        x = i;
        headingOffset = (x / srcCanvas.width) * 360;
        break;
      }
    }
    srcCtx.drawImage(img, 0, height - TAG_HEIGHT, width, TAG_HEIGHT, -x, height - TAG_HEIGHT, width, TAG_HEIGHT);
    srcCtx.drawImage(img, 0, height - TAG_HEIGHT, width, TAG_HEIGHT, -x + width, height - TAG_HEIGHT, width, TAG_HEIGHT);
    pano = CanvasMatrixCode.decode(srcCanvas, 0, srcCanvas.height - TAG_HEIGHT + 10, 1664, TAG_HEIGHT - 10);
    console.log(pano);
    return ss.getPanoramaById(pano.id, function(data, status) {
      var lat, latLng, lng, result;
      if (status === google.maps.StreetViewStatus.OK) {
        return gsvp.composePanorama(pano.id, pano.heading + headingOffset);
      } else {
        console.log("invalid pano id: " + pano.id);
        result = /([\-0-9.]+), ([\-0-9.]+)/.exec(pano.latLng);
        console.log(result);
        lat = result[1];
        lng = result[2];
        latLng = new google.maps.LatLng(lat, lng);
        console.log(latLng);
        return ss.getPanoramaByLocation(latLng, 10, function(data, status) {
          var id;
          if (status === google.maps.StreetViewStatus.OK) {
            id = data.location.pano;
            return gsvp.composePanorama(id, pano.heading + headingOffset);
          } else {
            return alert("muri");
          }
        });
      }
    });
  };
  savePano = function() {
    var dest;
    console.log("save pano");
    outCanvas.width = gsvp.width;
    outCanvas.height = (img.height / img.width) * gsvp.width;
    outCtx.fillStyle = '#000000';
    outCtx.fillRect(0, 0, outCanvas.width, outCanvas.height);
    outCtx.drawImage(gsvp.canvas, 0, 0);
    outCtx.save();
    outCtx.translate(0, gsvp.canvas.height * 2);
    outCtx.scale(1, -1);
    outCtx.drawImage(gsvp.canvas, 0, 0);
    outCtx.restore();
    outCtx.drawImage(img, 0, img.height - TAG_HEIGHT, img.width, TAG_HEIGHT, 0, outCanvas.height - TAG_HEIGHT, img.width, TAG_HEIGHT);
    dest = destDir + "/" + filename;
    saveCanvas(outCanvas, dest);
    if (++idx < fileList.length) {
      return loadImg();
    } else {
      return onComplete();
    }
  };
  img.onload = onLoadImg;
  gsvp.onPanoramaLoad = savePano;
  return loadImg();
};

onComplete = function() {
  return setTimeout(function() {
    fs.renameSync(srcDir, srcDir + ".proxy");
    fs.renameSync(destDir, srcDir);
    return notifier.notify({
      title: "Proxy Replacer",
      message: "All done!",
      sound: true
    });
  }, 2000);
};

//# sourceMappingURL=data:application/json;base64,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QUFhLFVBRmpCLEVBRStCLEdBQUcsQ0FBQyxLQUZuQyxFQUUwQyxVQUYxQyxFQUdDLENBSEQsRUFHSSxTQUFTLENBQUMsTUFBVixHQUFtQixVQUh2QixFQUdvQyxHQUFHLENBQUMsS0FIeEMsRUFHK0MsVUFIL0MsQ0FsQkEsQ0FBQTtBQUFBLElBdUJBLElBQUEsR0FBVSxPQUFELEdBQVMsR0FBVCxHQUFZLFFBdkJyQixDQUFBO0FBQUEsSUF3QkEsVUFBQSxDQUFZLFNBQVosRUFBdUIsSUFBdkIsQ0F4QkEsQ0FBQTtBQTJCQSxJQUFBLElBQUcsRUFBQSxHQUFBLEdBQVEsUUFBUSxDQUFDLE1BQXBCO2FBQ0MsT0FBQSxDQUFBLEVBREQ7S0FBQSxNQUFBO2FBR0MsVUFBQSxDQUFBLEVBSEQ7S0E1QlU7RUFBQSxDQTFHWCxDQUFBO0FBQUEsRUE2SUEsR0FBRyxDQUFDLE1BQUosR0FBYSxTQTdJYixDQUFBO0FBQUEsRUE4SUEsSUFBSSxDQUFDLGNBQUwsR0FBc0IsUUE5SXRCLENBQUE7U0FnSkEsT0FBQSxDQUFBLEVBbEpNO0FBQUEsQ0FsRVAsQ0FBQTs7QUFBQSxVQXdOQSxHQUFhLFNBQUEsR0FBQTtTQUVaLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVixJQUFBLEVBQUUsQ0FBQyxVQUFILENBQWMsTUFBZCxFQUF5QixNQUFELEdBQVEsUUFBaEMsQ0FBQSxDQUFBO0FBQUEsSUFDQSxFQUFFLENBQUMsVUFBSCxDQUFjLE9BQWQsRUFBdUIsTUFBdkIsQ0FEQSxDQUFBO1dBR0EsUUFBUSxDQUFDLE1BQVQsQ0FDQztBQUFBLE1BQUEsS0FBQSxFQUFPLGdCQUFQO0FBQUEsTUFDQSxPQUFBLEVBQVMsV0FEVDtBQUFBLE1BRUEsS0FBQSxFQUFPLElBRlA7S0FERCxFQUpVO0VBQUEsQ0FBWCxFQVFFLElBUkYsRUFGWTtBQUFBLENBeE5iLENBQUEiLCJmaWxlIjoicmVwbGFjZS1wcm94eS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIiRjb25zb2xlID0gbnVsbFxuJHByb2dQYW5vID0gbnVsbFxuJHN0YXRQYW5vID0gbnVsbFxuJHByb2dTZXEgPSBudWxsXG4kc3RhdFNlcSA9IG51bGxcblxuc3JjRGlyID0gXCJcIlxuZGVzdERpciA9IFwiXCJcbmZpbGVMaXN0ID0gbnVsbFxuXG5nc3ZoID0gbnVsbFxuXG5iYXNlbmFtZSA9IG51bGxcbnNpc3lwaHVzID0gbnVsbFxuXG5nc3ZwID0gbnVsbFxuXG5zdGFydFRpbWUgPSBudWxsXG5cbnNzID0gbmV3IGdvb2dsZS5tYXBzLlN0cmVldFZpZXdTZXJ2aWNlKClcblxubG9nID0gKHN0cikgLT5cblx0JGNvbnNvbGUuYXBwZW5kKFwiI3tzdHJ9XFxuXCIpXG5cdCRjb25zb2xlLnNjcm9sbFRvcCA9ICRjb25zb2xlLnNjcm9sbEhlaWdodFxuXG4kIC0+XG5cdCRjb25zb2xlID0gJCgnI2NvbnNvbGUnKVxuXHQkcHJvZ1Bhbm8gPSAkKCcjcHJvZy1wYW5vJylcblx0JHByb2dTZXEgPSAkKCcjcHJvZy1zZXEnKVxuXHQkc3RhdFBhbm8gPSAkKCcjc3RhdC1wYW5vJylcblx0JHN0YXRTZXEgPSAkKCcjc3RhdC1zZXEnKVxuXG5cdHNpc3lwaHVzID0gJCgnI3JlcGxhY2UtcHJveHknKS5zaXN5cGh1cygpXG5cblx0JCgnI2RlY29kZScpLm9uICdjbGljaycsIGRlY29kZVxuXG5cdCQoJ1tuYW1lPWZpbGVdJykub24gJ2NoYW5nZScsIC0+XG5cdFx0JCgnW25hbWU9c291cmNlXScpXG5cdFx0XHQudmFsKCAkKCdbbmFtZT1maWxlXScpLnZhbCgpIClcblx0XHRzaXN5cGh1cy5zYXZlQWxsRGF0YSgpXG5cblx0Z3N2cCA9IG5ldyBHU1ZQQU5PLlBhbm9Mb2FkZXJcblx0XHR6b29tOiBwYXJzZUludCggJCgnW25hbWU9em9vbV0nKS52YWwoKSApXG5cblx0Z3N2cC5vblByb2dyZXNzID0gKHApIC0+XG5cdFx0JHN0YXRQYW5vLmh0bWwoXCIje3B9JVwiKVxuXHRcdCRwcm9nUGFuby52YWwoIHAgKVxuXG5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZGVjb2RlID0gLT5cblx0c3JjRGlyID0gJCgnW25hbWU9c291cmNlXScpLnZhbCgpXG5cblx0aWYgc3JjRGlyID09IFwiXCJcblx0XHRhbGVydCBcInBsZWFzZSBzZWxlY3Qgc291cmNlIGRpcmVjdG9yeVwiXG5cdFx0cmV0dXJuXG5cblx0ZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhzcmNEaXIpXG5cblx0ZmlsZUxpc3QgPSAoZiBmb3IgZiBpbiBmaWxlcyB3aGVuIC9cXC5wbmckLy50ZXN0KGYpKVxuXHRiYXNlbmFtZSA9IHBhdGguYmFzZW5hbWUoIHNyY0RpciApXG5cblx0bG9hZCgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmxvYWQgPSAoKSAtPlxuXG5cdHN0YXJ0VGltZSA9IG5ldyBEYXRlKClcblxuXHQjIG1ha2UgbmV3IGRpcmVjdG9yeVxuXHRkZXN0RGlyID0gXCIje3BhdGguZGlybmFtZShzcmNEaXIpfS8je2Jhc2VuYW1lfS5IUVwiXG5cdHRyeVxuXHRcdG1rZGlycC5zeW5jKGRlc3REaXIpXG5cdFx0I2ZzLm1rZGlyU3luYyhkZXN0RGlyKVxuXHRjYXRjaCBlcnJcblx0XHRhbGVydChcIkRlc3RpbmF0aW9uIGRpcmVjdG9yeSBhbHJlYWR5IGV4aXN0cy4gUGxlYXNlIGRlbGV0ZSAnI3tkZXN0RGlyfScgdG8gY29udGludWUuXCIpXG5cblx0aW1nID0gbmV3IEltYWdlKClcblxuXHRzcmNDYW52YXMgPSAkKCcjc3JjJylbMF1cblx0b3V0Q2FudmFzID0gJCgnI291dCcpWzBdXG5cblx0c3JjQ3R4ID0gc3JjQ2FudmFzLmdldENvbnRleHQoJzJkJylcblx0b3V0Q3R4ID0gb3V0Q2FudmFzLmdldENvbnRleHQoJzJkJylcblxuXHRpZHggPSAwXG5cdGZpbGVuYW1lID0gXCJcIlxuXG5cdCMtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQjIDEuIGxvYWQgaW1hZ2Vcblx0bG9hZEltZyA9ICgpIC0+XG5cdFx0ZWxhcHNlZCA9ICgoKG5ldyBEYXRlKCkpIC0gc3RhcnRUaW1lKSAvIDEwMDAgLyA2MClcblx0XHQkc3RhdFNlcS5odG1sKFwiKCN7aWR4KzF9LyN7ZmlsZUxpc3QubGVuZ3RofSkgI3tlbGFwc2VkLnRvUHJlY2lzaW9uKDIpfW1pbiBlbGFwc2VkXCIpXG5cdFx0JHByb2dTZXEudmFsKCAoaWR4KzEpIC8gZmlsZUxpc3QubGVuZ3RoICogMTAwIClcblxuXG5cdFx0ZmlsZW5hbWUgPSBmaWxlTGlzdFtpZHhdXG5cdFx0aW1nLnNyYyA9IFwiZmlsZTovLy8je3NyY0Rpcn0vI3tmaWxlbmFtZX1cIlxuXG5cdCMtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQjIDIuIHJlYWQgbWF0cml4IGNvZGUgYW5kIHNldHVwIGdzdmggYW5kIHJ1biBjb21wb3NlKClcblx0b25Mb2FkSW1nID0gLT5cblxuXHRcdHdpZHRoID0gaW1nLndpZHRoXG5cdFx0aGVpZ2h0ID0gaW1nLmhlaWdodFxuXG5cdFx0c3JjQ2FudmFzLndpZHRoID0gaW1nLndpZHRoXG5cdFx0c3JjQ2FudmFzLmhlaWdodCA9IGltZy5oZWlnaHRcblxuXG5cdFx0c3JjQ3R4LmRyYXdJbWFnZShpbWcsIDAsIDApXG5cblx0XHQjIHJlYWQgaGVhZGluZyBvZmZzZXRcblx0XHRoZWFkaW5nT2Zmc2V0ID0gMFxuXHRcdHggPSAwXG5cdFx0Zm9yIGkgaW4gWzAuLnNyY0NhbnZhcy53aWR0aC0xXVxuXHRcdFx0cGl4ZWwgPSBzcmNDdHguZ2V0SW1hZ2VEYXRhKGksIDgzNiwgMSwgMSkuZGF0YVxuXHRcdFx0aWYgcGl4ZWxbMF0gPj0gMTI4XG5cdFx0XHRcdHggPSBpXG5cdFx0XHRcdGhlYWRpbmdPZmZzZXQgPSAoeCAvIHNyY0NhbnZhcy53aWR0aCkgKiAzNjBcblx0XHRcdFx0YnJlYWtcblxuXHRcdCMgZml4IHRhZyBvZmZzZXRcblx0XHRzcmNDdHguZHJhd0ltYWdlKGltZyxcblx0XHRcdDAsIGhlaWdodCAtIFRBR19IRUlHSFQsIHdpZHRoLCBUQUdfSEVJR0hULFxuXHRcdFx0LXgsIGhlaWdodCAtIFRBR19IRUlHSFQsIHdpZHRoLCBUQUdfSEVJR0hUKVxuXHRcdHNyY0N0eC5kcmF3SW1hZ2UoaW1nLFxuXHRcdFx0MCwgaGVpZ2h0IC0gVEFHX0hFSUdIVCwgd2lkdGgsIFRBR19IRUlHSFQsXG5cdFx0XHQteCArIHdpZHRoLCBoZWlnaHQgLSBUQUdfSEVJR0hULCB3aWR0aCwgVEFHX0hFSUdIVClcblxuXHRcdCMgZGVjb2RlIHBhbm8gbWF0cml4IGNvZGVcblx0XHRwYW5vID0gQ2FudmFzTWF0cml4Q29kZS5kZWNvZGUoXG5cdFx0XHRzcmNDYW52YXMsXG5cdFx0XHQwLFxuXHRcdFx0c3JjQ2FudmFzLmhlaWdodCAtIFRBR19IRUlHSFQgKyAxMCxcblx0XHRcdDE2NjQsIFRBR19IRUlHSFQgLSAxMCkjc3JjQ2FudmFzLndpZHRoLCBUQUdfSEVJR0hUIC0gMTApXG5cblxuXHRcdGNvbnNvbGUubG9nIHBhbm9cblxuXHRcdCMgY2hlY2sgaWYgdGhlIHBhbm8gaWQgaXMgdmFsaWRcblx0XHRzcy5nZXRQYW5vcmFtYUJ5SWQgcGFuby5pZCwgKGRhdGEsIHN0YXR1cykgLT5cblxuXHRcdFx0aWYgc3RhdHVzID09IGdvb2dsZS5tYXBzLlN0cmVldFZpZXdTdGF0dXMuT0tcblx0XHRcdFx0IyBnZW5lcmF0ZSBwYW5vXG5cdFx0XHRcdGdzdnAuY29tcG9zZVBhbm9yYW1hKCBwYW5vLmlkLCBwYW5vLmhlYWRpbmcgKyBoZWFkaW5nT2Zmc2V0IClcblx0XHRcdGVsc2Vcblx0XHRcdFx0Y29uc29sZS5sb2cgXCJpbnZhbGlkIHBhbm8gaWQ6ICN7cGFuby5pZH1cIlxuXG5cdFx0XHRcdHJlc3VsdCA9IC8oW1xcLTAtOS5dKyksIChbXFwtMC05Ll0rKS8uZXhlYyhwYW5vLmxhdExuZylcblxuXHRcdFx0XHRjb25zb2xlLmxvZyByZXN1bHRcblxuXHRcdFx0XHRsYXQgPSByZXN1bHRbMV1cblx0XHRcdFx0bG5nID0gcmVzdWx0WzJdXG5cblx0XHRcdFx0bGF0TG5nID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhsYXQsIGxuZylcblxuXHRcdFx0XHRjb25zb2xlLmxvZyBsYXRMbmdcblxuXHRcdFx0XHRzcy5nZXRQYW5vcmFtYUJ5TG9jYXRpb24gbGF0TG5nLCAxMCwgKGRhdGEsIHN0YXR1cykgLT5cblxuXHRcdFx0XHRcdGlmIHN0YXR1cyA9PSBnb29nbGUubWFwcy5TdHJlZXRWaWV3U3RhdHVzLk9LXG5cblx0XHRcdFx0XHRcdGlkID0gZGF0YS5sb2NhdGlvbi5wYW5vXG5cblx0XHRcdFx0XHRcdGdzdnAuY29tcG9zZVBhbm9yYW1hKCBpZCwgcGFuby5oZWFkaW5nICsgaGVhZGluZ09mZnNldCApXG5cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRhbGVydChcIm11cmlcIilcblxuXHQjLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0IyAzLiBtZXJnZSB3aXRoIG1hdHJpeCBjb2RlIGFuZCBzYXZlXG5cdHNhdmVQYW5vID0gLT5cblx0XHRjb25zb2xlLmxvZyBcInNhdmUgcGFub1wiXG5cblx0XHRvdXRDYW52YXMud2lkdGggPSBnc3ZwLndpZHRoXG5cdFx0b3V0Q2FudmFzLmhlaWdodCA9IChpbWcuaGVpZ2h0IC8gaW1nLndpZHRoKSAqIGdzdnAud2lkdGhcblxuXHRcdCMgZHJhd1xuXHRcdG91dEN0eC5maWxsU3R5bGUgPSAnIzAwMDAwMCdcblx0XHRvdXRDdHguZmlsbFJlY3QoMCwgMCwgb3V0Q2FudmFzLndpZHRoLCBvdXRDYW52YXMuaGVpZ2h0KVxuXHRcdG91dEN0eC5kcmF3SW1hZ2UoZ3N2cC5jYW52YXMsIDAsIDApXG5cblx0XHQjIGZpbHAgXG5cdFx0b3V0Q3R4LnNhdmUoKVxuXHRcdG91dEN0eC50cmFuc2xhdGUoMCwgZ3N2cC5jYW52YXMuaGVpZ2h0ICogMilcblx0XHRvdXRDdHguc2NhbGUoMSwgLTEpXG5cdFx0b3V0Q3R4LmRyYXdJbWFnZShnc3ZwLmNhbnZhcywgMCwgMClcblx0XHRvdXRDdHgucmVzdG9yZSgpXG5cblx0XHQjIGNvZGVcblx0XHRvdXRDdHguZHJhd0ltYWdlKFxuXHRcdFx0aW1nLFxuXHRcdFx0MCwgaW1nLmhlaWdodCAtIFRBR19IRUlHSFQsIFx0XHRpbWcud2lkdGgsIFRBR19IRUlHSFQsXG5cdFx0XHQwLCBvdXRDYW52YXMuaGVpZ2h0IC0gVEFHX0hFSUdIVCwgXHRpbWcud2lkdGgsIFRBR19IRUlHSFQpXG5cblx0XHRkZXN0ID0gXCIje2Rlc3REaXJ9LyN7ZmlsZW5hbWV9XCJcblx0XHRzYXZlQ2FudmFzKCBvdXRDYW52YXMsIGRlc3QgKVxuXG5cdFx0IyBuZXh0XG5cdFx0aWYgKytpZHggPCBmaWxlTGlzdC5sZW5ndGhcblx0XHRcdGxvYWRJbWcoKVxuXHRcdGVsc2Vcblx0XHRcdG9uQ29tcGxldGUoKVxuXG5cdCMtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQjIHRyaWdnZXJcblx0aW1nLm9ubG9hZCA9IG9uTG9hZEltZ1xuXHRnc3ZwLm9uUGFub3JhbWFMb2FkID0gc2F2ZVBhbm9cblxuXHRsb2FkSW1nKClcblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5vbkNvbXBsZXRlID0gLT5cblxuXHRzZXRUaW1lb3V0IC0+XG5cdFx0ZnMucmVuYW1lU3luYyhzcmNEaXIsIFwiI3tzcmNEaXJ9LnByb3h5XCIpXG5cdFx0ZnMucmVuYW1lU3luYyhkZXN0RGlyLCBzcmNEaXIpXG5cblx0XHRub3RpZmllci5ub3RpZnlcblx0XHRcdHRpdGxlOiBcIlByb3h5IFJlcGxhY2VyXCJcblx0XHRcdG1lc3NhZ2U6IFwiQWxsIGRvbmUhXCJcblx0XHRcdHNvdW5kOiB0cnVlXG5cdCwgMjAwMFxuXG5cblx0XG5cblxuIl19