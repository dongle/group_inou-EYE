var $console, $progPano, $progSeq, $statPano, $statSeq, basename, decode, destDir, fileList, gsvh, gsvp, load, log, onComplete, sisyphus, srcDir, startTime;

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
    console.log(headingOffset);
    console.log(x);
    srcCtx.drawImage(img, 0, height - TAG_HEIGHT, width, TAG_HEIGHT, -x, height - TAG_HEIGHT, width, TAG_HEIGHT);
    srcCtx.drawImage(img, 0, height - TAG_HEIGHT, width, TAG_HEIGHT, -x + width, height - TAG_HEIGHT, width, TAG_HEIGHT);
    pano = CanvasMatrixCode.decode(srcCanvas, 0, srcCanvas.height - TAG_HEIGHT + 10, 1664, TAG_HEIGHT - 10);
    return gsvp.composePanorama(pano.id, pano.heading + headingOffset);
  };
  savePano = function() {
    var dest;
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

//# sourceMappingURL=data:application/json;base64,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SHZCLEVBR29DLEdBQUcsQ0FBQyxLQUh4QyxFQUcrQyxVQUgvQyxDQWhCQSxDQUFBO0FBQUEsSUFxQkEsSUFBQSxHQUFVLE9BQUQsR0FBUyxHQUFULEdBQVksUUFyQnJCLENBQUE7QUFBQSxJQXNCQSxVQUFBLENBQVksU0FBWixFQUF1QixJQUF2QixDQXRCQSxDQUFBO0FBeUJBLElBQUEsSUFBRyxFQUFBLEdBQUEsR0FBUSxRQUFRLENBQUMsTUFBcEI7YUFDQyxPQUFBLENBQUEsRUFERDtLQUFBLE1BQUE7YUFHQyxVQUFBLENBQUEsRUFIRDtLQTFCVTtFQUFBLENBakZYLENBQUE7QUFBQSxFQW1IQSxHQUFHLENBQUMsTUFBSixHQUFhLFNBbkhiLENBQUE7QUFBQSxFQW9IQSxJQUFJLENBQUMsY0FBTCxHQUFzQixRQXBIdEIsQ0FBQTtTQXNIQSxPQUFBLENBQUEsRUF4SE07QUFBQSxDQXJGUCxDQUFBOztBQUFBLFVBaU5BLEdBQWEsU0FBQSxHQUFBO1NBRVosVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNWLElBQUEsRUFBRSxDQUFDLFVBQUgsQ0FBYyxNQUFkLEVBQXlCLE1BQUQsR0FBUSxRQUFoQyxDQUFBLENBQUE7QUFBQSxJQUNBLEVBQUUsQ0FBQyxVQUFILENBQWMsT0FBZCxFQUF1QixNQUF2QixDQURBLENBQUE7V0FHQSxRQUFRLENBQUMsTUFBVCxDQUNDO0FBQUEsTUFBQSxLQUFBLEVBQU8sZ0JBQVA7QUFBQSxNQUNBLE9BQUEsRUFBUyxXQURUO0FBQUEsTUFFQSxLQUFBLEVBQU8sSUFGUDtLQURELEVBSlU7RUFBQSxDQUFYLEVBUUUsSUFSRixFQUZZO0FBQUEsQ0FqTmIsQ0FBQSIsImZpbGUiOiJyZXBsYWNlLXByb3h5LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiJGNvbnNvbGUgPSBudWxsXG4kcHJvZ1Bhbm8gPSBudWxsXG4kc3RhdFBhbm8gPSBudWxsXG4kcHJvZ1NlcSA9IG51bGxcbiRzdGF0U2VxID0gbnVsbFxuXG5zcmNEaXIgPSBcIlwiXG5kZXN0RGlyID0gXCJcIlxuZmlsZUxpc3QgPSBudWxsXG5cbmdzdmggPSBudWxsXG5cbmJhc2VuYW1lID0gbnVsbFxuc2lzeXBodXMgPSBudWxsXG5cbmdzdnAgPSBudWxsXG5cbnN0YXJ0VGltZSA9IG51bGxcblxubG9nID0gKHN0cikgLT5cblx0JGNvbnNvbGUuYXBwZW5kKFwiI3tzdHJ9XFxuXCIpXG5cdCRjb25zb2xlLnNjcm9sbFRvcCA9ICRjb25zb2xlLnNjcm9sbEhlaWdodFxuXG4kIC0+XG5cdCRjb25zb2xlID0gJCgnI2NvbnNvbGUnKVxuXHQkcHJvZ1Bhbm8gPSAkKCcjcHJvZy1wYW5vJylcblx0JHByb2dTZXEgPSAkKCcjcHJvZy1zZXEnKVxuXHQkc3RhdFBhbm8gPSAkKCcjc3RhdC1wYW5vJylcblx0JHN0YXRTZXEgPSAkKCcjc3RhdC1zZXEnKVxuXG5cdHNpc3lwaHVzID0gJCgnI3JlcGxhY2UtcHJveHknKS5zaXN5cGh1cygpXG5cblx0JCgnI2RlY29kZScpLm9uICdjbGljaycsIGRlY29kZVxuXG5cdCQoJ1tuYW1lPWZpbGVdJykub24gJ2NoYW5nZScsIC0+XG5cdFx0JCgnW25hbWU9c291cmNlXScpXG5cdFx0XHQudmFsKCAkKCdbbmFtZT1maWxlXScpLnZhbCgpIClcblx0XHRzaXN5cGh1cy5zYXZlQWxsRGF0YSgpXG5cblx0IyAjdGVzdFxuXG5cdCMgcGwgPSBuZXcgR1NWUEFOTy5QYW5vTG9hZGVyXG5cdCMgXHR6b29tOiAyXG5cblx0IyBwbC5vblByb2dyZXNzID0gKHApLT5cblx0IyBcdGNvbnNvbGUubG9nKHApXG5cblx0IyBwbC5vblBhbm9yYW1hTG9hZCA9IC0+XG5cdCMgXHQkKCdib2R5JykuYXBwZW5kKHBsLmNhbnZhcylcblx0IyBcdCQoJ2JvZHknKS5hcHBlbmQocGwuYzIpXG5cblx0IyBcdHNhdmVDYW52YXMoIHBsLmNhbnZhcywgXCIvVXNlcnMvbXVnaS9tb2RfMi5wbmdcIiApXG5cdCMgXHRzYXZlQ2FudmFzKCBwbC5jMiwgXCIvVXNlcnMvbXVnaS9vcmlnaW5hbF9zbG9wZS5wbmdcIiApXG5cblx0IyBkb2dlbiA9IFwiRlpMcU5PMVNVSWgzRlFyY1dUbTh4Z1wiXG5cdCMgc2xvcGUgPSBcIi1QcmNjYTM1NEh2dEVvdlA4aXltUlFcIlxuXHQjIHBsLmNvbXBvc2VQYW5vcmFtYShzbG9wZSwgMClcblxuXHRnc3ZwID0gbmV3IEdTVlBBTk8uUGFub0xvYWRlclxuXHRcdHpvb206IHBhcnNlSW50KCAkKCdbbmFtZT16b29tXScpLnZhbCgpIClcblxuXHRnc3ZwLm9uUHJvZ3Jlc3MgPSAocCkgLT5cblx0XHQkc3RhdFBhbm8uaHRtbChcIiN7cH0lXCIpXG5cdFx0JHByb2dQYW5vLnZhbCggcCApXG5cblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5kZWNvZGUgPSAtPlxuXHRzcmNEaXIgPSAkKCdbbmFtZT1zb3VyY2VdJykudmFsKClcblxuXHRpZiBzcmNEaXIgPT0gXCJcIlxuXHRcdGFsZXJ0IFwicGxlYXNlIHNlbGVjdCBzb3VyY2UgZGlyZWN0b3J5XCJcblx0XHRyZXR1cm5cblxuXHRmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKHNyY0RpcilcblxuXHRmaWxlTGlzdCA9IChmIGZvciBmIGluIGZpbGVzIHdoZW4gL1xcLnBuZyQvLnRlc3QoZikpXG5cdGJhc2VuYW1lID0gcGF0aC5iYXNlbmFtZSggc3JjRGlyIClcblxuXHQjY29uc29sZS5sb2cgZmlsZUxpc3RcblxuXHRsb2FkKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxubG9hZCA9ICgpIC0+XG5cblx0c3RhcnRUaW1lID0gbmV3IERhdGUoKVxuXG5cdCMgbWFrZSBuZXcgZGlyZWN0b3J5XG5cdGRlc3REaXIgPSBcIiN7cGF0aC5kaXJuYW1lKHNyY0Rpcil9LyN7YmFzZW5hbWV9LkhRXCJcblx0dHJ5XG5cdFx0bWtkaXJwLnN5bmMoZGVzdERpcilcblx0XHQjZnMubWtkaXJTeW5jKGRlc3REaXIpXG5cdGNhdGNoIGVyclxuXHRcdGFsZXJ0KFwiRGVzdGluYXRpb24gZGlyZWN0b3J5IGFscmVhZHkgZXhpc3RzLiBQbGVhc2UgZGVsZXRlICcje2Rlc3REaXJ9JyB0byBjb250aW51ZS5cIilcblxuXHRpbWcgPSBuZXcgSW1hZ2UoKVxuXG5cdHNyY0NhbnZhcyA9ICQoJyNzcmMnKVswXVxuXHRvdXRDYW52YXMgPSAkKCcjb3V0JylbMF1cblxuXHRzcmNDdHggPSBzcmNDYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuXHRvdXRDdHggPSBvdXRDYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuXG5cdGlkeCA9IDBcblx0ZmlsZW5hbWUgPSBcIlwiXG5cblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdCMgMS4gbG9hZCBpbWFnZVxuXHRsb2FkSW1nID0gKCkgLT5cblx0XHRlbGFwc2VkID0gKCgobmV3IERhdGUoKSkgLSBzdGFydFRpbWUpIC8gMTAwMCAvIDYwKVxuXHRcdCRzdGF0U2VxLmh0bWwoXCIoI3tpZHgrMX0vI3tmaWxlTGlzdC5sZW5ndGh9KSAje2VsYXBzZWQudG9QcmVjaXNpb24oMil9bWluIGVsYXBzZWRcIilcblx0XHQkcHJvZ1NlcS52YWwoIChpZHgrMSkgLyBmaWxlTGlzdC5sZW5ndGggKiAxMDAgKVxuXG5cblx0XHRmaWxlbmFtZSA9IGZpbGVMaXN0W2lkeF1cblx0XHRpbWcuc3JjID0gXCJmaWxlOi8vLyN7c3JjRGlyfS8je2ZpbGVuYW1lfVwiXG5cblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdCMgMi4gcmVhZCBtYXRyaXggY29kZSBhbmQgc2V0dXAgZ3N2aCBhbmQgcnVuIGNvbXBvc2UoKVxuXHRvbkxvYWRJbWcgPSAtPlxuXG5cdFx0d2lkdGggPSBpbWcud2lkdGhcblx0XHRoZWlnaHQgPSBpbWcuaGVpZ2h0XG5cblx0XHRzcmNDYW52YXMud2lkdGggPSBpbWcud2lkdGhcblx0XHRzcmNDYW52YXMuaGVpZ2h0ID0gaW1nLmhlaWdodFxuXG5cblx0XHRzcmNDdHguZHJhd0ltYWdlKGltZywgMCwgMClcblxuXHRcdCMgcmVhZCBoZWFkaW5nIG9mZnNldFxuXHRcdGhlYWRpbmdPZmZzZXQgPSAwXG5cdFx0eCA9IDBcblx0XHRmb3IgaSBpbiBbMC4uc3JjQ2FudmFzLndpZHRoLTFdXG5cdFx0XHRwaXhlbCA9IHNyY0N0eC5nZXRJbWFnZURhdGEoaSwgODM2LCAxLCAxKS5kYXRhXG5cdFx0XHRpZiBwaXhlbFswXSA+PSAxMjhcblx0XHRcdFx0eCA9IGlcblx0XHRcdFx0aGVhZGluZ09mZnNldCA9ICh4IC8gc3JjQ2FudmFzLndpZHRoKSAqIDM2MFxuXHRcdFx0XHRicmVha1xuXG5cdFx0Y29uc29sZS5sb2cgaGVhZGluZ09mZnNldFxuXG5cdFx0Y29uc29sZS5sb2cgeFxuXG5cdFx0IyBmaXggdGFnIG9mZnNldFxuXHRcdHNyY0N0eC5kcmF3SW1hZ2UoaW1nLFxuXHRcdFx0MCwgaGVpZ2h0IC0gVEFHX0hFSUdIVCwgd2lkdGgsIFRBR19IRUlHSFQsXG5cdFx0XHQteCwgaGVpZ2h0IC0gVEFHX0hFSUdIVCwgd2lkdGgsIFRBR19IRUlHSFQpXG5cdFx0c3JjQ3R4LmRyYXdJbWFnZShpbWcsXG5cdFx0XHQwLCBoZWlnaHQgLSBUQUdfSEVJR0hULCB3aWR0aCwgVEFHX0hFSUdIVCxcblx0XHRcdC14ICsgd2lkdGgsIGhlaWdodCAtIFRBR19IRUlHSFQsIHdpZHRoLCBUQUdfSEVJR0hUKVxuXG5cdFx0IyBkZWNvZGUgcGFubyBtYXRyaXggY29kZVxuXHRcdHBhbm8gPSBDYW52YXNNYXRyaXhDb2RlLmRlY29kZShcblx0XHRcdHNyY0NhbnZhcyxcblx0XHRcdDAsXG5cdFx0XHRzcmNDYW52YXMuaGVpZ2h0IC0gVEFHX0hFSUdIVCArIDEwLFxuXHRcdFx0MTY2NCwgVEFHX0hFSUdIVCAtIDEwKSNzcmNDYW52YXMud2lkdGgsIFRBR19IRUlHSFQgLSAxMClcblxuXHRcdCNjb25zb2xlLmxvZyBwYW5vXG5cblx0XHQjIGdlbmVyYXRlIHBhbm9cblx0XHRnc3ZwLmNvbXBvc2VQYW5vcmFtYSggcGFuby5pZCwgcGFuby5oZWFkaW5nICsgaGVhZGluZ09mZnNldCApXG5cblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdCMgMy4gbWVyZ2Ugd2l0aCBtYXRyaXggY29kZSBhbmQgc2F2ZVxuXHRzYXZlUGFubyA9IC0+XG5cdFx0b3V0Q2FudmFzLndpZHRoID0gZ3N2cC53aWR0aFxuXHRcdG91dENhbnZhcy5oZWlnaHQgPSAoaW1nLmhlaWdodCAvIGltZy53aWR0aCkgKiBnc3ZwLndpZHRoXG5cblx0XHQjIGRyYXdcblx0XHRvdXRDdHguZmlsbFN0eWxlID0gJyMwMDAwMDAnXG5cdFx0b3V0Q3R4LmZpbGxSZWN0KDAsIDAsIG91dENhbnZhcy53aWR0aCwgb3V0Q2FudmFzLmhlaWdodClcblx0XHRvdXRDdHguZHJhd0ltYWdlKGdzdnAuY2FudmFzLCAwLCAwKVxuXG5cdFx0IyBmaWxwIFxuXHRcdG91dEN0eC5zYXZlKClcblx0XHRvdXRDdHgudHJhbnNsYXRlKDAsIGdzdnAuY2FudmFzLmhlaWdodCAqIDIpXG5cdFx0b3V0Q3R4LnNjYWxlKDEsIC0xKVxuXHRcdG91dEN0eC5kcmF3SW1hZ2UoZ3N2cC5jYW52YXMsIDAsIDApXG5cdFx0b3V0Q3R4LnJlc3RvcmUoKVxuXG5cdFx0IyBjb2RlXG5cdFx0b3V0Q3R4LmRyYXdJbWFnZShcblx0XHRcdGltZyxcblx0XHRcdDAsIGltZy5oZWlnaHQgLSBUQUdfSEVJR0hULCBcdFx0aW1nLndpZHRoLCBUQUdfSEVJR0hULFxuXHRcdFx0MCwgb3V0Q2FudmFzLmhlaWdodCAtIFRBR19IRUlHSFQsIFx0aW1nLndpZHRoLCBUQUdfSEVJR0hUKVxuXG5cdFx0ZGVzdCA9IFwiI3tkZXN0RGlyfS8je2ZpbGVuYW1lfVwiXG5cdFx0c2F2ZUNhbnZhcyggb3V0Q2FudmFzLCBkZXN0IClcblxuXHRcdCMgbmV4dFxuXHRcdGlmICsraWR4IDwgZmlsZUxpc3QubGVuZ3RoXG5cdFx0XHRsb2FkSW1nKClcblx0XHRlbHNlXG5cdFx0XHRvbkNvbXBsZXRlKClcblxuXG5cdCMtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQjIHRyaWdnZXJcblx0aW1nLm9ubG9hZCA9IG9uTG9hZEltZ1xuXHRnc3ZwLm9uUGFub3JhbWFMb2FkID0gc2F2ZVBhbm9cblxuXHRsb2FkSW1nKClcblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5vbkNvbXBsZXRlID0gLT5cblxuXHRzZXRUaW1lb3V0IC0+XG5cdFx0ZnMucmVuYW1lU3luYyhzcmNEaXIsIFwiI3tzcmNEaXJ9LnByb3h5XCIpXG5cdFx0ZnMucmVuYW1lU3luYyhkZXN0RGlyLCBzcmNEaXIpXG5cblx0XHRub3RpZmllci5ub3RpZnlcblx0XHRcdHRpdGxlOiBcIlByb3h5IFJlcGxhY2VyXCJcblx0XHRcdG1lc3NhZ2U6IFwiQWxsIGRvbmUhXCJcblx0XHRcdHNvdW5kOiB0cnVlXG5cdCwgMjAwMFxuXG5cblx0XG5cblxuIl19