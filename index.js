(function() {
	qyGrid({
		el: 'grid',
		rowNum: 50,
		colNum: 10
	});


	function qyGrid(option) {
		/**
		 * 配置参数
		 */
		var _option = {
			el: option.el,
			rowNum: option.rowNum || 40,
			colNum: option.colNum || 20,
			rowHeight: 24,
			colWidth: 120,
			lineColor: '#c3c3c3',
			rulerWidth: 45,
			rulerHeight: 25,
			scrollWidth: 12
		};

		/**
		 * 保存全局变量
		 */
		var _obj;

		/**
		 * 保存数据
		 */
		var _data = {};

		var _eventStatus = {};


		_init();

		draw();
		console.log(_data);

		bindEvent();

		/**
		 * 初始化，只执行一次
		 */
		function _init() {
			initObj();
			initData();

			function initObj() {
				var $el = $('#' + _option.el);
				var $canvasContainer = $('<div class="grid-container"></div>');
				var $canvas = $('<canvas class="grid-main-canvas"></canvas>');
				$canvasContainer.append($canvas);
				$el.append($canvasContainer);

				var canvas = $canvas[0];
				canvas.width = $canvasContainer.innerWidth();
				canvas.height = $canvasContainer.innerHeight();
				var ctx = canvas.getContext('2d');
				
				_obj = {
					$el: $el,
					$canvasContainer: $canvasContainer,
					$canvas: $canvas,
					canvas: canvas,
					ctx: ctx,
				};
			}

			function initData() {
				// 表格中竖线对应的x坐标值
				_data.rows = [];
				// 表格中横线对应的y坐标值
				_data.cols = [];
				// 所有单元格信息
				_data.cells = [];

				_data.originX = _option.rulerWidth;
				_data.originY = _option.rulerHeight;

				for (var r = 0; r <= _option.rowNum; r++) {
					_data.rows.push(r * _option.rowHeight);
				}
				for (var c = 0; c <= _option.colNum; c++) {
					_data.cols.push(c * _option.colWidth);
				}

				for (var r = 0; r < _option.rowNum; r++) {
					var row = [];
					for (var c = 0; c < _option.colNum; c++) {
						row.push({
							id: 'R' + r + 'C' + c,
							minX: c * _option.colWidth,
							maxX: (c + 1) * _option.colWidth,
							minY: r * _option.rowHeight,
							maxY: (r + 1) * _option.rowHeight
						});
					}
					_data.cells.push(row);
				}
				console.log(_data);
			}
		}

		function draw() {
			_obj.ctx.clearRect(0, 0, _obj.canvas.width, _obj.canvas.height);

			// 绘制表格直线
			drawGridLine();

			// 绘制左侧和顶部的标尺背景色
			drawRulerBackGroundAndText();

			drawScroll();


			/**
			 * 绘制表格直线
			 */
			function drawGridLine() {
				_obj.ctx.save();
				_obj.ctx.translate(_data.originX, _data.originY);

				// 绘制横线
				for (var r = 0; r < _data.rows.length; r++) {
					// 标尺上的横线
					drawLine(-_data.originX, _data.rows[r], -_data.originX + _option.rulerWidth, _data.rows[r], '#dadada', 1);
					// 内容区横线
					drawLine(0, _data.rows[r], _data.cols[_data.cols.length - 1], _data.rows[r], _option.lineColor, 1);
				}
				// 绘制竖线
				for (var c = 0; c < _data.cols.length; c++) {
					// 标尺上的竖线
					drawLine(_data.cols[c], -_data.originY, _data.cols[c], -_data.originY + _option.rulerHeight, 'red', 1);
					// 内容区竖线
					drawLine(_data.cols[c], 0, _data.cols[c], _data.rows[_data.rows.length - 1], _option.lineColor, 1);
				}
				_obj.ctx.restore();
			}

			/**
			 * 绘制左侧和顶部的标尺背景色和文字
			 */
			function drawRulerBackGroundAndText() {
				// 背景色
				_obj.ctx.save();
				_obj.ctx.fillStyle = '#fafafa';
				_obj.ctx.fillRect(0, 0, _obj.canvas.width, _option.rulerHeight);
				_obj.ctx.fillRect(0, 0, _option.rulerWidth, _obj.canvas.height);
				_obj.ctx.restore();
				
				// 标尺文字
				_obj.ctx.save();
				_obj.ctx.translate(_data.originX, _data.originY);
				// 纵向标尺文字
				for (var r = 0; r < _data.rows.length; r++) {
					drawLine(-_data.originX, _data.rows[r], -_data.originX + _option.rulerWidth, _data.rows[r], '#dadada', 1);
					if (r != _data.rows.length - 1) {
						drawRulerText(-_data.originX + _option.rulerWidth / 2, (_data.rows[r] + _data.rows[r + 1]) / 2, 'R' + r);
					}
				}
				// 横向标尺文字
				for (var c = 0; c < _data.cols.length; c++) {
					drawLine(_data.cols[c], -_data.originY, _data.cols[c], -_data.originY + _option.rulerHeight, '#dadada', 1);
					if (c != _data.cols.length - 1) {
						drawRulerText((_data.cols[c] + _data.cols[c + 1]) / 2, -_data.originY + _option.rulerHeight / 2, 'C' + c);
					}
				}
				_obj.ctx.restore();

				/**
				 * 绘制标尺文字
				 */
				function drawRulerText(x, y, txt) {
					_obj.ctx.save();
					_obj.ctx.fillStyle = '#5f7489';
					_obj.ctx.textAlign = 'center';
					_obj.ctx.textBaseline = 'middle';
					_obj.ctx.font = '12px';
					_obj.ctx.fillText(txt, x, y);
					_obj.ctx.restore();
				}
			}

			function drawScroll() {
				// 纵向滚动条
				if (_obj.canvas.height < _option.rulerHeight + _data.rows[_data.rows.length - 1]) {
					// 整个表格的高度 
					var gridHeight = _data.rows[_data.rows.length - 1];
					// 可是区高度
					var winHeight = _obj.canvas.height - _option.rulerHeight;
					if (_obj.canvas.width < _option.rulerWidth +  _data.cols[_data.cols.length - 1]) {
						winHeight = winHeight - _option.scrollWidth;
					}
					// 计算滚动条长度
					// 整个表格的高度 / 可视区高度 = 可视区高度 / 滚动条高度
					var scrollHeight = winHeight * winHeight / gridHeight;
					

					// 滚动条背景色
					_obj.ctx.save();
					_obj.ctx.fillStyle = '#f1f1f1';
					_obj.ctx.fillRect(_obj.canvas.width - _option.scrollWidth, _option.rulerHeight, _option.scrollWidth, winHeight);
					_obj.ctx.restore();

					// 计算滚动条位置, 并绘制滚动条
					var gridHeightDiff = _option.rulerHeight - _data.originY;
					var scrollTop = scrollHeight * gridHeightDiff / winHeight;
					// scrollTop * winHeight = scrollHeight * gridHeightDiff
					// scrollTop / gridHeightDiff = scrollHeight / winHeight
					_obj.ctx.save();
					_obj.ctx.fillStyle = '#444';
					_obj.ctx.fillRect(_obj.canvas.width - _option.scrollWidth, _option.rulerHeight + scrollTop, _option.scrollWidth, scrollHeight);
					_obj.ctx.restore();
					_data.scrollY = {
						sx: _obj.canvas.width - _option.scrollWidth,
						sy: _option.rulerHeight + scrollTop,
						ex: _obj.canvas.width,
						ey: _option.rulerHeight + scrollTop + scrollHeight
					};
				} else {
					_data.scrollY = false;
				}

				if (_obj.canvas.width < _option.rulerWidth +  _data.cols[_data.cols.length - 1]) {
					var gridWidth = _data.cols[_data.cols.length - 1];
					var winWidth = _obj.canvas.width - _option.rulerWidth;
					if (_obj.canvas.height < _option.rulerHeight + _data.rows[_data.rows.length - 1]) {
						winWidth = winWidth - _option.scrollWidth;
					}

					var scrollWidth = winWidth * winWidth / gridWidth;

					_obj.ctx.save();
					_obj.ctx.fillStyle = '#f1f1f1';
					_obj.ctx.fillRect(_option.rulerWidth, _obj.canvas.height - _option.scrollWidth, winWidth, _option.scrollWidth);
					_obj.ctx.restore();

					var gridWidthDiff = _option.rulerWidth - _data.originX;
					var scrollLeft = scrollWidth * gridWidthDiff / winWidth;
					_obj.ctx.save();
					_obj.ctx.fillStyle = '#444';
					_obj.ctx.fillRect(_option.rulerWidth + scrollLeft, _obj.canvas.height - _option.scrollWidth, scrollWidth, _option.scrollWidth);
					_obj.ctx.restore();
					_data.scrollX = {
						sx: _option.rulerWidth + scrollLeft,
						sy: _obj.canvas.height - _option.scrollWidth,
						ex: _option.rulerWidth + scrollLeft + scrollWidth,
						ey: _obj.canvas.height
					};
				} else {
					_data.scrollX = false;
				}

				if (_obj.canvas.height < _option.rulerHeight + _data.rows[_data.rows.length - 1]
					&& _obj.canvas.width < _option.rulerWidth +  _data.cols[_data.cols.length - 1]
				) {
					_obj.ctx.save();
					_obj.ctx.fillStyle = '#f1f1f1';
					_obj.ctx.fillRect(_obj.canvas.width - _option.scrollWidth, _obj.canvas.height - _option.scrollWidth, _option.scrollWidth, _option.scrollWidth);
					_obj.ctx.strokeStyle = '#fff';
					drawLine(_obj.canvas.width - _option.scrollWidth, _obj.canvas.height - _option.scrollWidth,
					_obj.canvas.width, _obj.canvas.height - _option.scrollWidth, '#ddd', 1);
					drawLine(_obj.canvas.width - _option.scrollWidth, _obj.canvas.height - _option.scrollWidth,
					_obj.canvas.width - _option.scrollWidth, _obj.canvas.height, '#ddd', 1);
					_obj.ctx.restore();
				}

			}


			/**
			 * 绘制直线
			 * sx 起点x坐标
			 * sy 起点y坐标
			 * ex 终点x坐标
			 * ey 终点y坐标
			 * color 线条颜色
			 * 线条宽度
			 */
			function drawLine(sx, sy, ex, ey, color, width) {
				_obj.ctx.save();
				_obj.ctx.lineWidth = width;
				_obj.ctx.strokeStyle = color;
				_obj.ctx.beginPath();
				_obj.ctx.moveTo(sx, sy);
				_obj.ctx.lineTo(ex, ey);
				_obj.ctx.stroke();
				_obj.ctx.restore();
			}
		}

		function bindEvent() {

			_obj.$canvas.mousedown(function(e) {
				var xy = getMouseXY(e);
				var type = getAreaType(e);
				if (type === 'scrollX') {
					_eventStatus.isDown = true;
					_eventStatus.currentType = type;
					_eventStatus.lastPoint = {
						x: xy.x,
						y: xy.y
					};
				}
				if (type == 'scrollY') {
					_eventStatus.isDown = true;
					_eventStatus.currentType = type;
					_eventStatus.lastPoint = {
						x: xy.x,
						y: xy.y
					};
				}
			});

			_obj.$canvas.mousemove(function(e) {
				var xy = getMouseXY(e);
				var type = getAreaType(e);
				if (_eventStatus.isDown && _eventStatus.currentType == 'scrollX') {
					var diff = _eventStatus.lastPoint.x - xy.x;
					changeScroll('x', diff);
					_eventStatus.lastPoint = {
						x: xy.x,
						y: xy.y
					};
				}
				if (_eventStatus.isDown && _eventStatus.currentType == 'scrollY') {
					var diff = _eventStatus.lastPoint.y - xy.y;
					changeScroll('y', diff);
				}
			});

			_obj.$canvas.mouseup(function(e) {
				_eventStatus.isDown = false;
				_eventStatus.currentType = false;
				_eventStatus.lastPoint = false;
			});

			_obj.$canvas.mouseout(function(e) {
				_eventStatus.isDown = false;
				_eventStatus.currentType = false;
				_eventStatus.lastPoint = false;
			});


			function changeScroll(type, diff) {
				console.log('type: ', type, ' diff: ', diff);
				if (type == 'x') {
					var winWidth = _obj.canvas.width - _option.rulerWidth;
					if (_data.scrollY) {
						winWidth = winWidth - _option.scrollWidth;
					}

					var scrollWidth = _data.scrollX.ex - _data.scrollX.sx;
					var gridDiff = diff * winWidth / scrollWidth;
					_data.originX += gridDiff;
					draw();
				}

				if (type == 'y') {
					var winHeight = _obj.canvas.height - _option.rulerHeight;
					if (_data.scrollX) {
						winHeight = winHeight - _option.scrollWidth;
					}

					var scrollHeight = _data.scrollY.ey - _data.scrollY.sy;
					var gridDiff = diff * winHeight / scrollHeight;
					_data.originY += gridDiff;
					draw();
				}
			}
		}

		function getAreaType(e) {
			var point = getMouseXY(e);
			var x = point.x;
			var y = point.y;
			if (x > _option.rulerWidth && x < _obj.canvas.width && y > 0 && y < _option.rulerHeight) {
				return "top-ruler";
			}
			if (x > 0 && x < _option.rulerWidth && y > _option.rulerHeight && y < _obj.canvas.height) {
				return 'left-ruler';
			}
			var winEx = _obj.canvas.width;
			var winEy = _obj.canvas.height;
			if (_data.scrollY) {
				winEx = _obj.canvas.width - _option.scrollWidth;
			}
			if (_data.scrollX) {
				winEy = _obj.canvas.height - _option.scrollWidth;
			}
			if (x > _option.rulerWidth && x < winEx && y > _option.rulerHeight && y < winEy) {
				return 'content';
			}
			if (_data.scrollX) {
				if (x > _option.rulerWidth && x < winEx && y > _obj.canvas.height - _option.scrollWidth && y < _obj.canvas.height) {
					return 'scrollX';
				}
			}
			if (_data.scrollY) {
				if (x > _obj.canvas.width - _option.scrollWidth && x < _obj.canvas.width && y > _option.rulerHeight && y < winEy) {
					return 'scrollY';
				}
			}
		}

		function getMouseXY(e) {
			return mouseXY(e.clientX, e.clientY);
		}

		function mouseXY(ex, ey) {
			var box = _obj.canvas.getBoundingClientRect();
			return {
				x: ex - box['left'],
				y: ey - box['top']
			};
		}


	}
})();
