define(["jquery","qlik", "./d3.v3.min", "css!./AnimatedLine.css"],function ($, qlik) {

	return {
    initialProperties: {
        version: 1.0,
        qHyperCubeDef: {
            qDimensions: [],
            qMeasures: [],
                qInitialDataFetch: [{
                    qWidth: 3,
                    qHeight: 3333
                }]
            }
        },
        definition: {
            type: "items",
            component: "accordion",
            items: {
                dimensions: {
                    uses: "dimensions",
                    min: 2,
                    max: 2
                },
                measures: {
                  uses: "measures",
                  min: 1,
                  max: 1
              },
              sorting: {
                  uses: "sorting"
              },

			  	settings : {
					uses : "settings",
					items : {												 
						colors: {
							ref: "ColorSchema",
							type: "string",
							component: "dropdown",
							label: "Color",
							show: true,
							options: 
							[ {
										value: "#fee391, #fec44f, #fe9929, #ec7014, #cc4c02, #993404, #662506",
										label: "Sequential"
									}, {
										value: "#662506, #993404, #cc4c02, #ec7014, #fe9929, #fec44f, #fee391",
										label: "Sequential (Reverse)"
									}, {
										value: "#d73027, #f46d43, #fee090, #abd9e9, #74add1, #4575b4",
										label: "Diverging RdYlBu"
									}, {
										value: "#4575b4, #74add1, #abd9e9, #fee090, #f46d43, #d73027",
										label: "Diverging BuYlRd (Reverse)"
									}, {
										value: "#deebf7, #c6dbef, #9ecae1, #6baed6, #4292c6, #2171b5, #08519c, #08306b",
										label: "Blues"
									}, {
										value: "#fee0d2, #fcbba1, #fc9272, #fb6a4a, #ef3b2c, #cb181d, #a50f15, #67000d",
										label: "Reds"
									}, {
										value: "#edf8b1, #c7e9b4, #7fcdbb, #41b6c4, #1d91c0, #225ea8, #253494, #081d58",
										label: "YlGnBu"
									}
								],
									defaultValue: "#fee391, #fec44f, #fe9929, #ec7014, #cc4c02, #993404, #662506"
								},
						speed:{
							ref: "speed",
							type: "integer",
							label: "Speed (10 = Slow, 1 = Fast)",
							defaultValue: 5,
							expression: "optional"
						}
					}
				}
          }
      },
      snapshot: {
			canTakeSnapshot: true
		},
	
	
		paint: function ($element, layout) {
		
		// Create button to animate data
		var html='<div width="10" position="relative" z-index="-10">';
		var i = 0;
		var idbutnom='Animate';		
		html=html+"<button class='qirby-button' width='auto' id='button1'>" + idbutnom + "</button>"    
		html=html+"</div>";
		$element.html(html);
   
		// Set up the button click event
        $element.find("#button1").on("qv-activate", function() {
					
			var app = qlik.currApp();
			
			var matchday = 1;
			// Set up the transitions
			var transition = d3.transition()
				.duration(speed)
				.each("start", function start() {

				// Transition the label to the correct location
				  label.transition()
					.duration(speed)
					.ease('linear')
					.attr("transform", function(d) { return "translate(" + x(d.values[matchday].matchday) + "," + (y(d.values[matchday].position) + y.rangeBand()/2) + ")"; })
					.text(function(d) { return "#"+ d.values[matchday].position + " " + d.key; });
					
				// Transition the end circle
				  circleEnd.transition()
					.duration(speed)
					.ease('linear')
					.attr("cx", function(d) { return x(d.values[matchday].matchday); })
					.attr("cy", function(d) { return y(d.values[matchday].position) + y.rangeBand()/2; });

				// Transition the animation and clip path
				  clip.transition()
					.duration(speed)
					.ease('linear')
					.attr("width", x(matchday+1))
					.attr("height", height);
				  
				  matchday+=1;

				// Check to see if all transitions are complete
				  if (matchday !== nestedData[0].values.length) transition = transition.transition().each("start", start);
				 
				});
					
		  });

			// Set margins
			var margin = {top: 30, right: 150, bottom: 20, left: 50};
	
			// Chart object width
			var width = $element.width()- margin.right - margin.left;
			// Chart object height
			var height = $element.height() - margin.bottom - margin.top;
			// Chart object id
			var id = "container_" + layout.qInfo.qId;
		    		 
			// Check to see if the chart element has already been created
			if (document.getElementById(id)) {
				// if it has been created, empty it's contents so we can redraw it
				$("#" + id).empty();
			}
			else {
				// if it hasn't been created, create it with the appropriate id and size
				$element.append($('<div />').attr({ "id": id, "class": "qv-object-AnimatedLine" }).css({ height: height, width: width }))
			}
			// Create the svg element			   
           var svg = d3.select("#" + id).append("svg")  
                .attr("width", width + margin.right + margin.left)
				.attr("height", height + margin.bottom + margin.top)
				.on("click", function (d) { club.style("opacity",1); })
			.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
				;				

			//create matrix variable
			var qMatrix = layout.qHyperCube.qDataPages[0].qMatrix;
		
			// create a new array that contains the measure labels
			var dimLabels = layout.qHyperCube.qDimensionInfo.map(function(d) {
				return d.qFallbackTitle;
			});
			
			// create a new array that contains the dim labels
			var measureLabels = layout.qHyperCube.qMeasureInfo.map(function(d) {
				return d.qFallbackTitle;
			});
			
			
			// Create a new array for our extension with a row for each row in the qMatrix
			// Filter dimesnion Null value 
			var data2 = qMatrix;

			// Get the selected counts for the 2 dimensions, which will be used later for custom selection logic
			var selections = {
				dim1_count: layout.qHyperCube.qDimensionInfo[0].qStateCounts.qSelected,
				dim2_count: layout.qHyperCube.qDimensionInfo[1].qStateCounts.qSelected
			};
	
	
			// get key elements in Qlik Sense order
			var listKey = [],
				dateKey = [],
				dateVal = 0;
			$.each(data2, function( index, row ) {
				if ($.inArray(row[0].qText, listKey) === -1) {
					listKey.push(row[0].qText);
				}
				dateVal = row[1].qNum;
				if ($.inArray(dateVal, dateKey) === -1) {
					dateKey.push(dateVal);
				}
			});

			// Create the base data set
			var nestedData = data2.map(function(row){
							return {"rank" : row[0].qText, "matchday" : row[1].qNum, "matchdaydate" :  convertToUnixTime(row[1].qNum), "position" : row[2].qNum};
						});

			// Transform data set
			nestedData = d3.nest()
						.key(function(d) { return d.rank; })
						.entries(nestedData)
			;

			// Set the speed and colour palette
			var speed = layout.speed * 100,
				colorpalette = layout.ColorSchema.split(", ")
				;
				
			// Grab the max week number and position
			var maxLength = d3.max(nestedData, function (d) { return d.values.length; }) - 1;
			var domainLength = d3.max(nestedData, function (d) { return d.values[0].position; });
			var maxWeekNumber = d3.max(nestedData, function (d) { return d.values[0].matchday; });
			var minWeekNumber = d3.min(nestedData, function (d) { return d.values[0].matchday; });
			
			// Set the colour scale based on the colorpalette
			var colorScale = d3.scale.ordinal()
							.domain([0, domainLength])
							.range(colorpalette);
			
			var x = d3.scale.linear()
				.range([0, width]);

			var y = d3.scale.ordinal()
				.rangeRoundBands([height, 0], .1);

			var xAxis = d3.svg.axis()
				.scale(x)
				.tickSize(1)
				.orient("top")
				;

			var yAxis = d3.svg.axis()
				.scale(y)
				.tickSize(-width)
				.tickPadding(10)
				.orient("left");

			var line = d3.svg.line()
				.x(function(d) { return x(d.matchday); })
				.y(function(d) { return y(d.position) + y.rangeBand()/2; });


			var clip = svg.append("clipPath")
				.attr("id", "clip")
			  .append("rect")
				.attr("width", width)
				.attr("height", height);
		  
			// Set up the domains and tick values
			y.domain(d3.range(1,d3.max(nestedData, function(club) { return d3.max(club.values, function(d) { return d.position; }); }) + 1 ).reverse());
			xAxis.tickValues(nestedData[0].values.map(function(d) { return d.matchday; }));
			x.domain(d3.extent(nestedData[0].values.map(function(d) { return d.matchday; })));
				
			// Create the y-axis label
			svg.append("g")
				.attr("class", "y axis")
				.call(yAxis)
				.style("font-size","10px")
				.append("text")
					  .attr("class", "label")
					  .attr("transform", "rotate(-90)")
					  .attr("x", 0)
					  .attr("y", -30)		  
					  .attr("dy", ".71em")
					  .style("text-anchor", "end")
					  .text(measureLabels[0]);
			
			// Create the x-axis label 
			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + 5 + ")")
				.call(xAxis)

			// Transform the text along the x axis to read diagonally
			.selectAll("text")
				.attr("transform"," translate(10,-10) rotate(-65)") // To rotate the texts on x axis. Translate y position a little bit to prevent overlapping on axis line.
				.style("font-size","10px")
		  
			// Set the label for the x -axis
			.append("text")
				  .attr("class", "label")
				  //.attr("x", width - 200)
				  //.attr("y", height - 200)
				  //.style("text-anchor", "end")
				  .text(dimLabels[1])
			;

			// Set up the club class to attach data
			var club = svg.selectAll(".club")
				.data(nestedData)
				.enter().append("g")
				.attr("class", "club");
				
			// Define the line style
			var path = club.append("path")
			  .attr("class", "line")
			  .style("stroke", function(d,i) { return colorScale(i); }) // Use the input Sense colour scales
			  .style("stroke-width", 2)
			  .style("fill","none")
			  .attr("clip-path", "url( " + document.URL + "#clip)") // fixes AngularJS problem because of: <base href="/">
			  .attr("d", function(d) { return line(d.values); })
			  ;
			  
			// Draw the circle at the start of each line
			var circleStart = club.append("circle")
			  .attr("cx", function(d) { return x(d.values[0].matchday); })
			  .attr("cy", function(d) { return y(d.values[0].position) + y.rangeBand()/2; })
			  .style("fill", function(d,i) { return colorScale(i); })
			  .attr("r", 4)

			// Draw the circle at the end of each line
			var circleEnd = club.append("circle")
			  .attr("cx", function(d) { return x(d.values[maxLength].matchday); })
			  .attr("cy", function(d) { return y(d.values[maxLength].position) + y.rangeBand()/2; })
			  .style("fill", function(d,i) { return colorScale(i); })
			  .attr("r", 4)
			
			// Create the floating text per line
			var label = club.append("text")
			  .attr("transform", function(d) { return "translate(" + x(d.values[maxLength].matchday) + "," + (y(d.values[maxLength].position) + y.rangeBand()/2) + ")"; })
			  .attr("x", 8)
			  .attr("dy", ".31em")
			  .style("font-size","11px")
			  .on("mouseover", function (d) {
				club.style("opacity",0.1);
				club.filter(function(path) {return path.key === d.key; }).style("opacity",1);
			  })
			  .style("cursor","pointer")
			  .style("fill", function(d,i) { return colorScale(i); })
			  .style("font-weight", "bold")
			  .text(function(d) { return "#"+ d.values[maxLength].position + " " + d.key; })
			  ;
		}
	};
});

function dateFromQlikNumber(n) {
	var d = new Date((n - 25569)*86400*1000);
	// since date was created in UTC shift it to the local timezone
	d.setTime( d.getTime() + d.getTimezoneOffset()*60*1000 );
	return d;
}

function convertToUnixTime(_qNum) {
	//console.log(_qNum);
	return dateFromQlikNumber(_qNum).getTime();
}






