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
		 * 保存内部全局变量
		 */
		var _obj;

		/**
		 * 保存数据
		 */
		var _data;


		_init();


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

				_data.originX = _data.rulerWidth;
				_data.originY = _data.rulerHeight;

				for (var r = 0; r <= _option.rowNum; r++) {
				}
			}
		}


	}
})();
