var FILE;

FILE = FILE || {};

FILE.phpDirectory = './file';

FILE.Status = {
  OK: 'OK'
};

FILE.exists = function(path, callback) {
  var data;
  data = {
    path: path
  };
  return $.getJSON(FILE.phpDirectory + "/exists.php", data, function(res) {
    if (res.status === FILE.Status.OK) {
      return callback(res.result);
    } else {
      return callback(null);
    }
  });
};

FILE.saveText = function(text, path, callback) {
  $.ajax({
    type: 'POST',
    url: FILE.phpDirectory + "/saveText.php",
    data: {
      path: path,
      text: text
    },
    success: function(json) {
      var res;
      res = $.parseJSON(json);
      if (res.status === FILE.Status.OK) {
        return callback(res.result);
      } else {
        return callback(null);
      }
    },
    error: function(xmlHttpReq, textStatus, errorThrown) {
      return callback(null);
    }
  });
};

FILE.saveFrame = function(canvas, filename, index, callback) {
  var ext, split, type;
  split = filename.split('.');
  ext = split[split.length - 1].toLowerCase();
  type = "";
  if (ext === "png") {
    type = "image/png";
  } else if (ext === "jpg" || ext === "jpeg") {
    type = "image/jpeg";
  } else {
    callback(null);
    return;
  }
  $.ajax({
    type: 'POST',
    url: FILE.phpDirectory + "/saveFrame.php",
    data: {
      name: name,
      directory: directory,
      index: index,
      image: canvas.toDataURL(type)
    },
    success: function(json) {
      var res;
      res = $.parseJSON(json);
      if (res.status === FILE.Status.OK) {
        return callback(res.result);
      } else {
        return callback(null);
      }
    },
    error: function(xmlHttpReq, textStatus, errorThrown) {
      return callback(null);
    }
  });
};

//# sourceMappingURL=data:application/json;base64,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RUFDQztBQUFBLE1BQUEsSUFBQSxFQUFNLElBQU47QUFBQSxNQUNBLFNBQUEsRUFBVyxTQURYO0FBQUEsTUFFQSxLQUFBLEVBQU8sS0FGUDtBQUFBLE1BR0EsS0FBQSxFQUFPLE1BQU0sQ0FBQyxTQUFQLENBQWlCLElBQWpCLENBSFA7S0FIRDtBQUFBLElBUUEsT0FBQSxFQUFTLFNBQUMsSUFBRCxHQUFBO0FBQ1IsVUFBQSxHQUFBO0FBQUEsTUFBQSxHQUFBLEdBQU0sQ0FBQyxDQUFDLFNBQUYsQ0FBYSxJQUFiLENBQU4sQ0FBQTtBQUNBLE1BQUEsSUFBRyxHQUFHLENBQUMsTUFBSixLQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBN0I7ZUFDQyxRQUFBLENBQVUsR0FBRyxDQUFDLE1BQWQsRUFERDtPQUFBLE1BQUE7ZUFHQyxRQUFBLENBQVUsSUFBVixFQUhEO09BRlE7SUFBQSxDQVJUO0FBQUEsSUFlQSxLQUFBLEVBQU8sU0FBQyxVQUFELEVBQWEsVUFBYixFQUF5QixXQUF6QixHQUFBO2FBQ04sUUFBQSxDQUFVLElBQVYsRUFETTtJQUFBLENBZlA7R0FERCxDQWRBLENBRmdCO0FBQUEsQ0F6Q2pCLENBQUEiLCJmaWxlIjoianF1ZXJ5LmZpbGUuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJGSUxFID0gRklMRSB8fCB7fVxuXG5GSUxFLnBocERpcmVjdG9yeSA9ICcuL2ZpbGUnXG5cbkZJTEUuU3RhdHVzID1cblx0T0s6ICdPSydcblxuRklMRS5leGlzdHMgPSAocGF0aCwgY2FsbGJhY2spIC0+XG5cdGRhdGEgPVxuXHRcdHBhdGg6IHBhdGhcblxuXHQkLmdldEpTT04gXCIje0ZJTEUucGhwRGlyZWN0b3J5fS9leGlzdHMucGhwXCIsIGRhdGEsIChyZXMpLT5cblx0XHRpZiByZXMuc3RhdHVzID09IEZJTEUuU3RhdHVzLk9LXG5cdFx0XHRjYWxsYmFjayggcmVzLnJlc3VsdCApXG5cdFx0ZWxzZVxuXHRcdFx0Y2FsbGJhY2soIG51bGwgKVxuXG5GSUxFLnNhdmVUZXh0ID0gKHRleHQsIHBhdGgsIGNhbGxiYWNrKSAtPlxuXG5cdCQuYWpheFxuXHRcdHR5cGU6ICdQT1NUJ1xuXHRcdHVybDogXCIje0ZJTEUucGhwRGlyZWN0b3J5fS9zYXZlVGV4dC5waHBcIlxuXHRcdGRhdGE6XG5cdFx0XHRwYXRoOiBwYXRoXG5cdFx0XHR0ZXh0OiB0ZXh0XG5cblx0XHRzdWNjZXNzOiAoanNvbikgLT5cblx0XHRcdHJlcyA9ICQucGFyc2VKU09OKGpzb24pXG5cdFx0XHRpZiByZXMuc3RhdHVzID09IEZJTEUuU3RhdHVzLk9LXG5cdFx0XHRcdGNhbGxiYWNrKCByZXMucmVzdWx0IClcblx0XHRcdGVsc2Vcblx0XHRcdFx0Y2FsbGJhY2soIG51bGwgKVxuXG5cdFx0ZXJyb3I6ICh4bWxIdHRwUmVxLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikgLT5cblx0XHRcdGNhbGxiYWNrKCBudWxsIClcblxuXHRyZXR1cm5cblxuXG5cblxuRklMRS5zYXZlRnJhbWUgPSAoY2FudmFzLCBmaWxlbmFtZSwgaW5kZXgsIGNhbGxiYWNrKSAtPlxuXG5cdHNwbGl0ID0gZmlsZW5hbWUuc3BsaXQoJy4nKVxuXHRleHQgPSBzcGxpdFsgc3BsaXQubGVuZ3RoIC0gMSBdLnRvTG93ZXJDYXNlKClcblxuXHR0eXBlID0gXCJcIlxuXG5cdGlmIGV4dCA9PSBcInBuZ1wiXG5cdFx0dHlwZSA9IFwiaW1hZ2UvcG5nXCJcblx0ZWxzZSBpZiBleHQgPT0gXCJqcGdcIiBvciAgZXh0ID09IFwianBlZ1wiXG5cdFx0dHlwZSA9IFwiaW1hZ2UvanBlZ1wiXG5cdGVsc2Vcblx0XHRjYWxsYmFjayhudWxsKVxuXHRcdHJldHVyblxuXG5cblx0JC5hamF4XG5cdFx0dHlwZTogJ1BPU1QnXG5cdFx0dXJsOiBcIiN7RklMRS5waHBEaXJlY3Rvcnl9L3NhdmVGcmFtZS5waHBcIlxuXHRcdGRhdGE6XG5cdFx0XHRuYW1lOiBuYW1lXG5cdFx0XHRkaXJlY3Rvcnk6IGRpcmVjdG9yeVxuXHRcdFx0aW5kZXg6IGluZGV4XG5cdFx0XHRpbWFnZTogY2FudmFzLnRvRGF0YVVSTCh0eXBlKVxuXG5cdFx0c3VjY2VzczogKGpzb24pIC0+XG5cdFx0XHRyZXMgPSAkLnBhcnNlSlNPTigganNvbiApXG5cdFx0XHRpZiByZXMuc3RhdHVzID09IEZJTEUuU3RhdHVzLk9LXG5cdFx0XHRcdGNhbGxiYWNrKCByZXMucmVzdWx0IClcblx0XHRcdGVsc2Vcblx0XHRcdFx0Y2FsbGJhY2soIG51bGwgKVxuXG5cdFx0ZXJyb3I6ICh4bWxIdHRwUmVxLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikgLT5cblx0XHRcdGNhbGxiYWNrKCBudWxsIClcblxuXHRyZXR1cm5cblx0Il19