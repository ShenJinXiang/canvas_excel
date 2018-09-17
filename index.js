(function() {
	qyGrid({
		el: 'grid',
		rowNum: 100,
		colNum: 50
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
			minRowHeight: 15,
			minColWidth: 20,
			lineColor: '#c3c3c3',
			currentLineColor: '#198764',
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
				$el.addClass('qyGrid');

				// 添加操作栏
				var $btnContainer = $('<div class="btn-container"></div>');
				var $mergeBtn = $('<button class="btn defalut">合并</button>');
				var $splitBtn = $('<button class="btn defalut">拆分</button>');
				$btnContainer.append($mergeBtn);
				$btnContainer.append($splitBtn);


				// 添加canvas
				var $canvasContainer = $('<div class="grid-container"></div>');
				var $canvas = $('<canvas class="grid-main-canvas"></canvas>');
				$canvasContainer.append($canvas);
				$el.append($btnContainer);
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
					$mergeBtn: $mergeBtn,
					$splitBtn: $splitBtn
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
							minC: c,
							maxC: c + 1,
							minR: r,
							maxR: r + 1
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

			// 当前选择的区域
			drawCurrentArea();

			// 绘制左侧和顶部的标尺背景色
			drawRulerBackGroundAndText();

			// 滚动条
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
				// 标尺背景色
				_obj.ctx.save();
				_obj.ctx.fillStyle = '#fafafa';
				_obj.ctx.fillRect(0, 0, _obj.canvas.width, _option.rulerHeight);
				_obj.ctx.fillRect(0, 0, _option.rulerWidth, _obj.canvas.height);
				_obj.ctx.restore();

				// 标尺顶部标尺的底边和左侧标尺的右边
				drawLine(0, _option.rulerHeight, _obj.canvas.width, _option.rulerHeight, '#c3c3c3', 1);
				drawLine(_option.rulerWidth, 0, _option.rulerWidth, _obj.canvas.height, '#c3c3c3', 1);
				// 当前选择的单元格 在标尺上显示
				if (_data.currentArea) {
					drawLine(_data.originX + _data.cols[_data.currentArea.minC], _option.rulerHeight, _data.originX + _data.cols[_data.currentArea.maxC], _option.rulerHeight, _option.currentLineColor, 1);
					drawLine(_option.rulerWidth, _data.originY + _data.rows[_data.currentArea.minR], _option.rulerWidth, _data.originY + _data.rows[_data.currentArea.maxR], _option.currentLineColor, 1);
				}
				
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

				// 绘制左标尺左上角区域，以及此区域边框
				_obj.ctx.save();
				_obj.ctx.fillStyle = '#fafafa';
				_obj.ctx.fillRect(0, 0, _option.rulerWidth, _option.rulerHeight);
				_obj.ctx.restore();
				drawLine(0, _option.rulerHeight, _option.rulerWidth, _option.rulerHeight, '#c3c3c3', 1);
				drawLine(_option.rulerWidth, 0, _option.rulerWidth, _option.rulerHeight, '#c3c3c3', 1);


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

			function drawCurrentArea() {
				if (_data.currentArea) {
					_obj.ctx.save();
					_obj.ctx.translate(_data.originX, _data.originY);
					drawLine(_data.cols[_data.currentArea.minC], _data.rows[_data.currentArea.minR], _data.cols[_data.currentArea.maxC], _data.rows[_data.currentArea.minR], _option.currentLineColor, 1);
					drawLine(_data.cols[_data.currentArea.minC], _data.rows[_data.currentArea.minR], _data.cols[_data.currentArea.minC], _data.rows[_data.currentArea.maxR], _option.currentLineColor, 1);
					drawLine(_data.cols[_data.currentArea.minC], _data.rows[_data.currentArea.maxR], _data.cols[_data.currentArea.maxC], _data.rows[_data.currentArea.maxR], _option.currentLineColor, 1);
					drawLine(_data.cols[_data.currentArea.maxC], _data.rows[_data.currentArea.minR], _data.cols[_data.currentArea.maxC], _data.rows[_data.currentArea.maxR], _option.currentLineColor, 1);
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
				var type = getAreaType(e);
				_eventStatus.currentType = type;
				if (type === 'scrollX') {
					(function() {
						_eventStatus.isDown = true;
						_eventStatus.lastPoint = {
							x: e.clientX,
							y: e.clinetY
						};
					})();
				}
				if (type == 'scrollY') {
					(function() {
						_eventStatus.isDown = true;
						_eventStatus.lastPoint = {
							x: e.clientX,
							y: e.clientY
						};
					})();
				}
				if (type == 'content' && !e.shiftKey) {
					(function() {
						var cell = getCellByEvent(e);
						_eventStatus.isDown = true;
						_data.currentCells = [];
						if (cell.isMerge) {
							_data.currentCells.push(cell.keyCell);
							_data.currentArea = {
								minC: cell.keyCell.minC,
								maxC: cell.keyCell.maxC,
								minR: cell.keyCell.minR,
								maxR: cell.keyCell.maxR
							};
						} else {
							_data.currentCells.push(cell);
							_data.currentArea = {
								minC: cell.minC,
								maxC: cell.maxC,
								minR: cell.minR,
								maxR: cell.maxR
							};
						}
						draw();
					})();
				}

				if (type === 'top-ruler' && _eventStatus.colResize || type === 'left-ruler' && _eventStatus.rowResize) {
					(function() {
						_eventStatus.isDown = true;
						_eventStatus.lastPoint = {
							x: e.clientX,
							y: e.clientY
						};
					})();
				}

			});

			$("body").mousemove(function(e) {
				if (_eventStatus.isDown && _eventStatus.currentType == 'scrollX') {
					(function() {
						var diff = e.clientX - _eventStatus.lastPoint.x;
						changeScroll('x', diff);
						_eventStatus.lastPoint = {
							x: e.clientX,
							y: e.clientY
						};
					})();
				}
				if (_eventStatus.isDown && _eventStatus.currentType == 'scrollY') {
					(function() {
						var diff = e.clientY - _eventStatus.lastPoint.y;
						changeScroll('y', diff);
						_eventStatus.lastPoint = {
							x: e.clientX,
							y: e.clientY
						};
					})();
				}

				if (_eventStatus.colResize && _eventStatus.isDown && _eventStatus.currentType == 'top-ruler') {
					(function() {
						var diff = e.clientX - _eventStatus.lastPoint.x;
						changeColWidth(diff);
						_eventStatus.lastPoint = {
							x: e.clientX,
							y: e.clientY
						};
					})();
				} 

				if (_eventStatus.rowResize && _eventStatus.isDown && _eventStatus.currentType == 'left-ruler') {
					(function() {
						var diff = e.clientY - _eventStatus.lastPoint.y;
						changeRowHeight(diff);
						_eventStatus.lastPoint = {
							x: e.clientX,
							y: e.clientY
						};
					})();
				}


			});

			_obj.$canvas.mousemove(function(e) {
				var type = getAreaType(e);
				if (_eventStatus.isDown && _eventStatus.currentType == 'content') {
					(function(){
						var cell = getCellByEvent(e);
						if (!cell) {
							return;
						}
						if (cell.isMerge) {
							cell = cell.keyCell;
						}
						if (_data.currentCells && _data.currentCells[0]) {
							var firstMinC = _data.currentCells[0].isMerge ? _data.currentCells[0].mergeMinC : _data.currentCells[0].minC;
							var firstMaxC = _data.currentCells[0].isMerge ? _data.currentCells[0].mergeMaxC : _data.currentCells[0].maxC;
							var firstMinR = _data.currentCells[0].isMerge ? _data.currentCells[0].mergeMinR : _data.currentCells[0].minR;
							var firstMaxR = _data.currentCells[0].isMerge ? _data.currentCells[0].mergeMaxR : _data.currentCells[0].maxR;
							var lastMinC = cell.isMerge ? cell.mergeMinC : cell.minC;
							var lastMaxC = cell.isMerge ? cell.mergeMaxC : cell.maxC;
							var lastMinR = cell.isMerge ? cell.mergeMinR : cell.minR;
							var lastMaxR = cell.isMerge ? cell.mergeMaxR : cell.maxR;
							_data.currentArea = {
								minC: firstMinC < lastMinC ? firstMinC : lastMinC,
								maxC: firstMaxC > lastMaxC ? firstMaxC : lastMaxC,
								minR: firstMinR < lastMinR ? firstMinR : lastMinR,
								maxR: firstMaxR > lastMaxR ? firstMaxR : lastMaxR
							};
						}

						draw();
					})();
				}

				/**
				 * 顶部标尺区，判断鼠标是否移动至竖线上，设置鼠标图标
				 */
				if (type == 'top-ruler' && !_eventStatus.isDown) {
					(function() {
						var exy = getMouseXY(e);
						var currentCol;
						for (var c = 1; c < _data.cols.length; c++) {
							if (Math.abs(exy.x - _data.originX - _data.cols[c]) <= 2) {
								currentCol = c;
								break;
							}
						}
						if (typeof currentCol !== 'undefined') {
							_obj.$canvas.css('cursor', 'col-resize');
							_eventStatus.colResize = currentCol;
						} else {
							_obj.$canvas.css('cursor', 'default');
							delete _eventStatus.colResize;
						}
					})();
				}

				/**
				 * 顶部标尺区，判断鼠标是否移动至横线上，设置鼠标图标
				 */
				if (type == 'left-ruler' && !_eventStatus.isDown) {
					(function() {
						var exy = getMouseXY(e);
						var currentRow;
						for (var r = 1; r < _data.rows.length; r++) {
							if (Math.abs(exy.y - _data.originY - _data.rows[r]) <= 3) {
								currentRow = r;
								break;
							}
						}
						if (typeof currentRow !== 'undefined') {
							_obj.$canvas.css('cursor', 'row-resize');
							_eventStatus.rowResize = currentRow;
						} else {
							_obj.$canvas.css('cursor', 'default');
							delete _eventStatus.rowResize;
						}
					})();
				}

				/**
				 * 不在标尺区域，且鼠标没按下，鼠标图标恢复默认
				 */
				if (type !== 'top-ruler' && type !== 'left-ruler' && !_eventStatus.isDown) {
						_obj.$canvas.css('cursor', 'default');
						delete _eventStatus.colResize;
						delete _eventStatus.rowResize;
				}
			});

			$("body").mouseup(function(e) {
				_eventStatus.isDown = false;
				_eventStatus.currentType = false;
				_eventStatus.lastPoint = false;

				_obj.$canvas.css('cursor', 'default');
				delete _eventStatus.colResize;
				delete _eventStatus.rowResize;
			});

			$("body").mouseout(function(e) {
			});

			_obj.$canvas.click(function(e) {
				var type = getAreaType(e);
				// 点击滚动条区域，移动滚动条
				if (type == 'scrollX') {
					(function() {
						var exy = getMouseXY(e);
						if (exy.x > _data.scrollX.ex || exy.x < _data.scrollX.sx) {
							changeScroll('x', exy.x - (_data.scrollX.sx + _data.scrollX.ex) / 2);
						}
					})();
				}
				if (type == 'scrollY') {
					(function() {
						var exy = getMouseXY(e);
						if (exy.y > _data.scrollY.ey || exy.y < _data.scrollY.sy) {
							changeScroll('y', exy.y - (_data.scrollY.sy + _data.scrollY.ey) / 2);
						}
					})();
				}
				// 按住shift区域选择单元格
				if (type == 'content' && e.shiftKey && _data.currentArea) {
					(function() {
						var cell = getCellByEvent(e);
						var minC = cell.isMerge ? cell.keyCell.mergeMinC : cell.minC;
						var maxC = cell.isMerge ? cell.keyCell.mergeMaxC : cell.maxC;
						var minR = cell.isMerge ? cell.keyCell.mergeMinR : cell.minR;
						var maxR = cell.isMerge ? cell.keyCell.mergeMaxR : cell.maxR;
						_data.currentArea.minC = (minC < _data.currentArea.minC) ? minC : _data.currentArea.minC;
						_data.currentArea.maxC = (maxC > _data.currentArea.maxC) ? maxC : _data.currentArea.maxC;
						_data.currentArea.minR = (minR < _data.currentArea.minR) ? minR : _data.currentArea.minR;
						_data.currentArea.maxR = (maxR > _data.currentArea.maxR) ? maxR : _data.currentArea.maxR;
						draw();
					})();
				}
			});
		
			function changeScroll(type, diff) {
				var winEXY = getWinEXY();
				if (type == 'x') {
					(function() {
						var winWidth = _obj.canvas.width - _option.rulerWidth;
						if (_data.scrollY) {
							winWidth = winWidth - _option.scrollWidth;
						}

						var scrollWidth = _data.scrollX.ex - _data.scrollX.sx;
						var gridDiff = diff * winWidth / scrollWidth;
						_data.originX -= gridDiff;

						// 边界校验 
						if (_data.originX <= winEXY.x - _data.cols[_data.cols.length - 1]) {
							_data.originX = winEXY.x - _data.cols[_data.cols.length - 1];
						}
						if (_data.originX >= _option.rulerWidth) {
							_data.originX = _option.rulerWidth;
						}

						draw();
					})();
				}

				if (type == 'y') {
					(function() {
						var winHeight = _obj.canvas.height - _option.rulerHeight;
						if (_data.scrollX) {
							winHeight = winHeight - _option.scrollWidth;
						}

						var scrollHeight = _data.scrollY.ey - _data.scrollY.sy;
						var gridDiff = diff * winHeight / scrollHeight;
						_data.originY -= gridDiff;

						// 边界校验 
						if (_data.originY <= winEXY.y - _data.rows[_data.rows.length - 1]) {
							_data.originY = winEXY.y - _data.rows[_data.rows.length - 1];
						}
						if (_data.originY >= _option.rulerHeight) {
							_data.originY = _option.rulerHeight;
						}

						draw();
					})();
				}
			}

			/**
			 * 改变列宽
			 */
			function changeColWidth(diff) {
				if (_eventStatus.colResize) {
					if (_data.cols[_eventStatus.colResize - 1] + _option.minColWidth < _data.cols[_eventStatus.colResize] + diff) {
						for(var c = 0; c < _data.cols.length; c++) {
							if (c >= _eventStatus.colResize) {
								_data.cols[c] += diff;
							}
						}
					}
					draw();
				}
			}

			/**
			 * 改变行高
			 */
			function changeRowHeight(diff) {
				if (_eventStatus.rowResize) {
					if (_data.rows[_eventStatus.rowResize - 1] + _option.minRowHeight < _data.rows[_eventStatus.rowResize] + diff) {
						for (var r = 0; r < _data.rows.length; r++) {
							if (r >= _eventStatus.rowResize) {
								_data.rows[r] += diff;
							}
						}
					}
					draw();
				}
			}

		}

		// ----------------------------------------------------------
		function checkCellSelect(cell) {
			for (var i = 0; i < _data.currentCells.length; i++) {
				if (_data.currentCells[i].id === cell.id) {
					return true;
				}
			}
			return false;
		}
		// ----------------------------------------------------------

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
			var winEXY = getWinEXY();
			var winEx = winEXY.x;
			var winEy = winEXY.y;
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

		function getWinEXY() {
			var winEx = _obj.canvas.width;
			var winEy = _obj.canvas.height;
			if (_data.scrollY) {
				winEx = _obj.canvas.width - _option.scrollWidth;
			}
			if (_data.scrollX) {
				winEy = _obj.canvas.height - _option.scrollWidth;
			}
			return {
				x: winEx,
				y: winEy
			};
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


		/**
		 * canvas坐标转换成文档坐标
		 */
		function canvasToDom(x, y) {
			var _x = x - _data.originX;
			var _y = y - _data.originY;
			return {
				x: _x,
				y: _y
			};
		}

		function getCellByDomXY(x, y) {
			var _r, _c;
			for (var r = 0; r < _data.rows.length - 1; r++) {
				if (y >= _data.rows[r] && y < _data.rows[r + 1]) {
					_r = r;
					break;
				}
			}
			for (var c = 0; c < _data.cols.length - 1; c++) {
				if (x >= _data.cols[c] && x < _data.cols[c + 1]) {
					_c = c;
					break;
				}
			}
			return _data.cells[_r][_c];
		}

		function getCellByEvent(e) {
			var xy = getMouseXY(e);
			var type = getAreaType(e);
			if (type == 'content') {
				var dxy = canvasToDom(xy.x, xy.y);
				var cell = getCellByDomXY(dxy.x, dxy.y);
				return cell;
			}
			return;
		}

	}
})();
