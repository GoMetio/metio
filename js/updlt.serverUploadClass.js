var stats = "incomplete";
		var frsTrial = 0;
		function move() {
			document.getElementById("myProgress").style.opacity = "1";
			document.getElementById("output").style.opacity = "1";
			var elem = document.getElementById("myBar");   
			var width = 0;
			var id = setInterval(frame, 10);
			function frame() {
				if (width >= 74 && stats == "incomplete") {
					
				} else {
					if (width >= 100) {
						clearInterval(id);
					} else {
						width += 1;
						elem.style.width = width + '%'; 
					}
				}
			}
		}
		$(function() {
			var module;
			$('.btn-group').tooltip();
			var UI = {
				$btnStart: $('[data-measure]'),
				$btnAbort: $('[data-abort]'),
				$output: $('output'),
				start: function() {
					stats = "incomplete";
					rawModule = "upload";
					module = rawModule.charAt(0).toUpperCase() + rawModule.slice(1);
					if( frsTrial == 0 ) {
						UI.$btnStart.prop('disabled', true);
						UI.$btnAbort.prop('disabled', false);
					}
					net[rawModule].start();
					if (rawModule == 'latency') {
						net[rawModule].trigger('start');
					}
					if( frsTrial == 0 ) {
						document.getElementById("mainlabel").innerHTML = "Current Internet Speed";
						document.getElementById("dataportone").style.display = "block";
						move();
					}
				},
				restart: function(size) {
					UI.notice(UI.delimiter('The minimum delay of ' + UI.value(8, 'seconds') + ' has not been reached'));
					UI.notice(UI.delimiter('Switching to ' + UI.value(size / 1024 / 1024, 'MB') + ' of data...'));
				},
				stop: function() {
					UI.notice(UI.delimiter('Done'));
					document.getElementById("initbtn").innerHTML = "Done!<br><span style='font-size: 12px'>Keeping Network Speed...</span><br><span style='font-size: 12px'>Please keep this page opened</span>";
					UI.$btnStart.prop('disabled', false);
					UI.$btnAbort.prop('disabled', true);
					document.getElementById("myProgress").style.opacity = "0";
					document.getElementById("output").style.opacity = "0";
					document.getElementById("myProgress").style.display = "none";
					document.getElementById("output").style.display = "none";
					frsTrial = 1;
					UI.start();
				},
				abort: function() {
					net.upload.abort();
					net.download.abort();
				},
				notice: function(text, newSection) {
					var module = "metio";
					document.getElementById("output").innerHTML = '<span class="yellow">[' + module + ']</span> ' + text;
				},
				value: function(value, unit) {
					if (value != null) {
						return '<span class="blue">' + value.toFixed(3) + ' ' + unit + '</span>';
					} else {
						return '<span class="blue">null</span>';
					}
				},
				delimiter: function(text) {
					return '<span class="green">' + text + '</span>';
				}
			};
			var net = new Network();
			function start(size) {
				UI.notice(UI.delimiter('Starting ' + rawModule + ' measures' + (rawModule != 'latency' ? (' with ' + UI.value(size / 1024 / 1024, 'MB') + ' of data') : '') + '...'), true);
			}
			var score = 0;
			var high = 0;
			var frst = 0;
			var upbarint;
			function progress(avg, instant) {
				var output = 'Acceleration Speed: ' + UI.value(instant / 1024 / 1024, 'MBps');
				score = Math.round(avg / 1024 / 1024 * 1000) / 10;
				if( frst == 0 ) {
					frst = score;
				}
				if(high < Math.round(avg / 1024 / 1024 * 1000) / 10) {
					high = score;
					upbarint = high - frst;
					document.getElementById("upbarint").innerHTML = Math.round(upbarint * 10)/10;
				}
				document.getElementById("mbpsLabel").innerHTML = high;
				UI.notice(output);
			}
			function end(avg) {
				UI.notice('Final average speed: ' + UI.value(avg / 1024 / 1024, 'MBps'));
				stats = "complete";
				UI.stop();
			}
			
			net.upload.on('start', start).on('progress', progress).on('restart', UI.restart).on('end', end);
			net.download.on('start', start).on('progress', progress).on('restart', UI.restart).on('end', end);
			net.latency.on('start', start).on('end', function(avg, all) {
				all = all.map(function(latency) {
					return UI.value(latency, 'ms');
				});
				all = '[ ' + all.join(' , ') + ' ]';
				UI.notice('Instant latencies: ' + all);
				UI.notice('Average latency: ' + UI.value(avg, 'ms'));
				UI.stop();
			});
			UI.$btnStart.on('click', UI.start);
			UI.$btnAbort.on('click', UI.abort);
		});
