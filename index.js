(function() {
	qyGrid({
		el: 'grid'
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
			rulerHeight: 25
		};

		/**
		 * 保存全局变量
		 */
		var _obj;

		/**
		 * 保存数据
		 */
		var _data = {};


		_init();

		draw();

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


			_obj.ctx.save();
			_obj.ctx.translate(_data.originX, _data.originY);

			for (var r = 0; r < _data.rows.length; r++) {
				drawLine(-_data.originX, _data.rows[r], -_data.originX + _option.rulerWidth, _data.rows[r], '#dadada', 1);
				drawLine(0, _data.rows[r], _data.cols[_data.cols.length - 1], _data.rows[r], _option.lineColor, 1);
			}
			for (var c = 0; c < _data.cols.length; c++) {
				drawLine(_data.cols[c], -_data.originY, _data.cols[c], -_data.originY + _option.rulerHeight, 'red', 1);
				drawLine(_data.cols[c], 0, _data.cols[c], _data.rows[_data.rows.length - 1], _option.lineColor, 1);
			}
			_obj.ctx.restore();

			drawRulerBackGround();

			function drawRulerBackGround() {
				_obj.ctx.save();
				_obj.ctx.fillStyle = '#fafafa';
				_obj.ctx.fillRect(0, 0, _obj.canvas.width, _option.rulerHeight);
				_obj.ctx.fillRect(0, 0, _option.rulerWidth, _obj.canvas.height);
				_obj.ctx.restore();
				

				_obj.ctx.save();
				_obj.ctx.translate(_data.originX, _data.originY);
				for (var r = 0; r < _data.rows.length; r++) {
					drawLine(-_data.originX, _data.rows[r], -_data.originX + _option.rulerWidth, _data.rows[r], '#dadada', 1);
					if (r != _data.rows.length - 1) {
						drawRulerText(-_data.originX + _option.rulerWidth / 2, (_data.rows[r] + _data.rows[r + 1]) / 2, 'R' + r);
					}
				}
				for (var c = 0; c < _data.cols.length; c++) {
					drawLine(_data.cols[c], -_data.originY, _data.cols[c], -_data.originY + _option.rulerHeight, '#dadada', 1);
					if (c != _data.cols.length - 1) {
						drawRulerText((_data.cols[c] + _data.cols[c + 1]) / 2, -_data.originY + _option.rulerHeight / 2, 'C' + c);
					}
				}
				_obj.ctx.restore();
			}

			function drawRulerText(x, y, txt) {
				_obj.ctx.save();
				_obj.ctx.fillStyle = '#5f7489';
				_obj.ctx.textAlign = 'center';
				_obj.ctx.textBaseline = 'middle';
				_obj.ctx.font = '12px';
				_obj.ctx.fillText(txt, x, y);
				_obj.ctx.restore();
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


	}
})();
