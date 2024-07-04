drawChart('chart2',morphoindex(),'');
drawChart('chart1',widths(),'(m)');

function drawChart(div,datoingresso,xlabel) {
    nv.addGraph(function() {
        var chart = nv.models.lineChart();
       
        var fitScreen = false;
        var width = 600; //larghezza
        var height = 250;  // altezza

        var zoom = 1.5;


        chart.color(d3.scale.category10().range());
        chart.useInteractiveGuideline(true);
        chart.xAxis
             .axisLabel('Years')
            .tickFormat(d3.format('04d'))
            .showMaxMin(true)
            ;
     
        chart.lines.dispatch.on("elementClick", function(evt) {
            console.log(evt);
        });

        chart.yAxis
            .axisLabel(xlabel)
            .tickFormat(d3.format(',.2f'));

        //~ chart.xDomain([1800,2020]);

        

        d3.select("#" + div + " svg")
            .attr('perserveAspectRatio', 'xMinYMid')
            .attr('width', width)
            .attr('height', height)
            .datum(datoingresso);
            
    
        setChartViewBox();
        resizeChart();

        nv.utils.windowResize(resizeChart);

        function setChartViewBox() {
            var w = width * zoom,
                h = height * zoom;

            chart
                .width(w)
                .height(h);

            d3.select("#" + div + " svg")
                .attr('viewBox', '0 0 ' + w + ' ' + h)
                .transition().duration(5000)
                .call(chart);
        }

        function zoomOut() {
            zoom += .25;
            setChartViewBox();
        }

        function zoomIn() {
            if (zoom <= .5) return;
            zoom -= .25;
            setChartViewBox();
        }

        // This resize simply sets the SVG's dimensions, without a need to recall the chart code
        // Resizing because of the viewbox and perserveAspectRatio settings
        // This scales the interior of the chart unlike the above
        function resizeChart() {
            var container = d3.select('#chart1');
            var svg = container.select('svg');

            if (fitScreen) {
                // resize based on container's width AND HEIGHT
                var windowSize = nv.utils.windowSize();
                svg.attr("width", windowSize.width);
                svg.attr("height", windowSize.height);
            } else {
                // resize based on container's width
                var aspect = chart.width() / chart.height();
                var targetWidth = parseInt(container.style('width'));
                svg.attr("width", targetWidth);
                svg.attr("height", Math.round(targetWidth / aspect));
            }
        }
        return chart;
    });

}

    function morphoindex() {
        var anni = [2013,2012,2008,1999,1977,1954,1823].reverse(),
            anniBI = [2013,2012,2008,1999,1977,1954].reverse(),
            width = [80.3830,59.1,51.4,45.9,97.0,155.1,201.7].reverse(),
            widthAA = [],
            SI = [1.19,1.21,1.21,1.21,1.21,1.19,1.25].reverse(),
            SIAA = [],
            BI = [1.22,1.12,1.12,1.21,1.39,1.56].reverse(),
            BIAA = [];

        for (var i = 0; i < 6; i++) {
            widthAA.push({x: anni[i], y: width[i] });
            SIAA.push({x: anni[i], y: SI[i]});
            BIAA.push({x: anniBI[i], y: BI[i]});
        }

        return [
            {
                values: BIAA,
                key: "Braiding index",
                color: "#ff7f0e"
            }
            //~ ,
            //~ {
                //~ values: SIAA,
                //~ key: "Sinuosity index",
                //~ color: "#2ca02c"
            //~ }
        ];
    }

   function widths() {
        var anni = [2013,2012,2008,1999,1977,1954,1823].reverse(),
            width = [80.3830,59.1,51.4,45.9,97.0,155.1,201.7].reverse(),
            widthAA = []

        for (var i = 0; i < 7; i++) {
            widthAA.push({x: anni[i], y: width[i] });

        }

        return [
            {
                values: widthAA,
                key: "Average Width",
                color: "#0000FF"
            }
        ];
    }
