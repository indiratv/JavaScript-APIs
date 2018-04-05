
function optionChanged(newsample){
  console.log("1")
// Metadata Update
    Plotly.d3.json("/metadata/"+newsample,function(error,response){
        if(error) console.warn(error);

        var metadata_Sample= Plotly.d3.select("#sample-metadata");
        console.log("Reached")
// Remove old metadata
        metadata_Sample.selectAll("p").remove();

        for(var key in response){
            if(response.hasOwnProperty(key)){
                metadata_Sample.append("p").text(key + ":   " + response[key]);
            }
        }
    })

    // Plot the updated pie chart
    plotpie(newsample);
    // Plot the updated gauge chart
    plotgauge(newsample);
    plotscatter(newsample);

}
function plotpie(selectedValue){

    var decriptions=[];
    Plotly.d3.json("/otu",function(error,response){
        descriptions= response;
    })
    Plotly.d3.json("/samples/" + selectedValue,function(error,response){
        if(error) console.warn(error);

        var pielabels=[];
        var pievalues=[];
        var piedecription=[];
        for(var i=0;i<10;i++){
            pielabels.push(response[0].otu_ids[i]);
            pievalues.push(response[0].sample_values[i]);
            piedecription.push(descriptions[response[0].otu_ids[i]]);
            }

        var trace1 = { 
            values: pievalues,
            labels: pielabels,
            type:"pie",
            name:"Top 10 Samples",
            textinfo:"percent",
            text: piedecription,
            textposition: "inside",
            hoverinfo: 'label+value+text+percent'
        }
        var data=[trace1];
        var layout={
            height: 450,
            width: 460,
            margin: {
                l: 10,
                r: 10,
                b: 10,
                t: 10,
                pad: 15
              },
        }
        Plotly.newPlot("pie",data,layout);
    })
}

function plotscatter(selectedValue){
    var decriptions=[];
    Plotly.d3.json("/otu",function(error,response){
        descriptions= response;
    })
    Plotly.d3.json("/samples/"+selectedValue,function(error,response){
        if(error) console.warn(error);

        var scatter_description=[];
        for(var i=0;i<response[0].otu_ids.length;i++){
            scatter_description.push(descriptions[response[0].otu_ids[i]]);
        }
        var trace1 = {
            x: response[0].otu_ids,
            y: response[0].sample_values,
            marker: {
                size: response[0].sample_values,
                color: response[0].otu_ids.map(d=>100+d*20),
                colorscale: "Earth"
            },
            type:"scatter",
            mode:"markers",
            text: scatter_description,
            hoverinfo: 'x+y+text',
        };

        var data = [trace1];
        var layout = {
            xaxis:{title:"OTU ID",zeroline:true, hoverformat: '.2r'},
            yaxis:{title: "No: of germs in Sample",zeroline:true, hoverformat: '.2r'},
            height: 500,
            width:1200,
            margin: {
                l: 100,
                r: 10,
                b: 70,
                t: 10,
                pad: 5
              },
            hovermode: 'closest',
        };
        Plotly.newPlot("bubble",data,layout);
        
    })
}

function plotgauge(selectedValue){
    Plotly.d3.json("/wfreq/"+selectedValue,function(error,wfreqresponse){
        if(error) console.warn(error);

        // Enter a speed between 0 and 180
        var level = wfreqresponse;

        // Trig to calc meter point
        // Converting the score to a value of 180 so as to make it in degrees
        var degrees = 180-level*20,
            radius = .5;
        var radians = degrees * Math.PI / 180;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);

        // Path: may have to change to create a better triangle
        var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
            pathX = String(x),
            space = ' ',
            pathY = String(y),
            pathEnd = ' Z';
        var path = mainPath.concat(pathX,space,pathY,pathEnd);

        var data = [{ type: 'scatter',
            x: [0],
            y:[0],
            marker: {size: 28, color:'850000'},
            showlegend: false,
            name: 'Gauge Meter for Washing Frequency',
            text: level,
            hoverinfo: 'text'},
            { values: [90/9, 90/9, 90/9, 90/9, 90/9, 90/9, 90/9, 90/9, 90/9, 90],
            rotation: 90,
            text: ['8-9','7-8','6-7','5-6','4-5','3-4','2-3','1-2','0-1',''],
            textinfo: 'text',
            textposition:'inside',
            marker: {colors:['rgba(34, 116, 73, .5)', 'rgba(56, 129, 91, .5)',
                            'rgba(78, 143, 109, .5)', 'rgba(100, 157, 127, .5)',
                            'rgba(122, 171, 145, .5)', 'rgba(144, 185, 164, .5)',
                            'rgba(166, 199, 182, .5)', 'rgba(188, 213, 200, .5)',
                            'rgba(210, 227, 218, .5)','rgba(255, 255, 255, 0)'
                            ]
                    },

            labels: ['8-9','7-8','6-7','5-6','4-5','3-4','2-3','1-2','0-1',''],
            hoverinfo: 'label',
            hole: .5,
            type: 'pie',
            showlegend: false
        }];

        var layout = {
            shapes:[{
                type: 'path',
                path: path,
                fillcolor: '850000',
                line: {
                    color: '850000'
                    }
            }],

            title: 'Scrubs per Week',
            height: 460,
            width: 480,
            xaxis: {zeroline:false, showticklabels:false,
                        showgrid: false, range: [-1, 1]},
            yaxis: {zeroline:false, showticklabels:false,
                        showgrid: false, range: [-1, 1]}
        };

        Plotly.newPlot('gauge', data, layout);
    })
};

function load_dropdown(){ 
    Plotly.d3.json("/names",function(error,response){
        if(error) console.warn(error);

        var dropdown_options = Plotly.d3.select("#selDataset");

       for(var i=0;i<response.length;i++){
           dropdown_options.append("option").attr("value",response[i]).text(response[i]);
       }
       console.log(0);
       optionChanged(response[0]);
    })   
}

load_dropdown()