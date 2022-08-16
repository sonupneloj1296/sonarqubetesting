import {IInputs, IOutputs} from "./generated/ManifestTypes";
import * as d3 from 'd3';
import {max} from "d3";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export class PCFBarGraph implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _xAxisValues: string[] = [];
    private _yAxisValues: string[] = [];
    private _ComparisonsValues: string[] = [];

    private _mainContainer: HTMLDivElement;
    private _svgNamespace:any;
    private _svgElement: any;
    private _svgWidth:any;
    private _svgHeight:any;

    // New parameters 

    private _axisColor:any;
    private _axisTextColor:any;
    private _backgroundRadius:number;

    private _graphPaddingRight:any;
    private _graphPaddingLeft:any;
    private _graphPaddingTop:any;
    private _graphPaddingBottom:any;

    private _graphBackground:any;
    private _graphBarColorSet:any;
    private _graphBackgroundColor:any;
    private _showYAxis:any;
    private _hideYAxis:any;
    private _showYAxisGrid:any;

    private _showBarLabels:any;

    private _graphBarFontWeigth:number;
    private _graphBarFontSize:any;
    private _graphBarFontFamily:any;

    private YMaxAuto:any;
    private NumTicks:number;
    private _inPercentage:any;
    private _graphMaxYValue:number;
    private _barWidth:any;

    private _referenceYLineColor:any;

    private _xAxisLabelFontSize:number;
    private _xAxisLabelFontFamily:any;
    private _xAxisLabelFontWeight:any;

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
    {
        let columnsOnView = this.getSortedColumnsOnView(context);
        this.createTableBody(columnsOnView, context.parameters.Data_set,context);

        context.mode.trackContainerResize(true);

        this._svgNamespace = "http://www.w3.org/2000/svg";
        this._axisTextColor = context.parameters.graphAxisTextColor.raw!;
        this._graphBackground = context.parameters.graphBackground.raw!;
        this._graphBarColorSet = context.parameters.graphBarColorSet.raw!;
        this._graphBackgroundColor = context.parameters.graphBarBackgroundColor.raw!;
        this._showYAxis = context.parameters.showYaxis.raw!;
        this._hideYAxis = context.parameters.hideYaxis.raw!;
        this._showBarLabels = context.parameters.showBarLabels.raw!;

        this._showYAxisGrid = context.parameters.showYaxisGrid.raw!;
        this._barWidth = context.parameters.graphBarWidth.raw!;

        this._xAxisLabelFontSize = context.parameters.xAxisLabelFontSize.raw!;
        if(this._xAxisLabelFontSize==0){
          this._xAxisLabelFontSize = 12;
        }

        this._xAxisLabelFontFamily = context.parameters.xAxisLabelFontFamily.raw!;
        this._xAxisLabelFontWeight = context.parameters.xAxisLabelFontWeight.raw!;
        
        
        
        this.YMaxAuto = context.parameters.autoGenerateYMax.raw!;
        this.YMaxAuto = JSON.parse(this.YMaxAuto);

        this.NumTicks = context.parameters.graphNumYTicks.raw!;
        this._referenceYLineColor = context.parameters.referenceYLineColor.raw!;

        this._inPercentage = context.parameters.inPercentage.raw!;
        if(this._inPercentage!="true" && this._inPercentage!="false")
          this._inPercentage="false";
        this._inPercentage = JSON.parse(this._inPercentage);

        this._axisColor = context.parameters.graphAxisColor.raw!;
        this._mainContainer = document.createElement("div");
        this._mainContainer.setAttribute("class", "main_div");
    
        this._svgElement = document.createElementNS(this._svgNamespace,"svg");
        this._svgElement.setAttribute("class", "svg_1");
       
        this._svgElement.style.background = this._graphBackground;

        this._mainContainer.appendChild(this._svgElement);
        container.appendChild(this._mainContainer);

    }

  
    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void
    { 

      while (this._svgElement.firstChild) {
        this._svgElement.removeChild(this._svgElement.lastChild);
      }
      
      const columnsOnView = this.getSortedColumnsOnView(context);
      this.createTableBody(columnsOnView, context.parameters.Data_set,context);
    
      this._svgWidth = context.mode.allocatedWidth;
      this._svgHeight = context.mode.allocatedHeight;
      
      this._backgroundRadius = context.parameters.BackgroundborderRadius.raw!;

      this._svgElement.style.borderRadius = this._backgroundRadius+"px";
      this._svgElement.setAttribute("width",this._svgWidth);
      this._svgElement.setAttribute("height",this._svgHeight);
      this._svgElement.setAttribute("viewBox","0 0 "+this._svgWidth+" "+this._svgHeight);

      this._graphPaddingRight = context.parameters.graphPaddingRight.raw!;
      this._graphPaddingLeft = context.parameters.graphPaddingLeft.raw!;
      this._graphPaddingTop = context.parameters.graphPaddingTop.raw!;
      this._graphPaddingBottom = context.parameters.graphPaddingBottom.raw!;

      this._graphBarFontSize = context.parameters.graphLabelFontSize.raw!;
      this._graphBarFontWeigth = context.parameters.graphLabelFontWeight.raw!;
      this._graphBarFontFamily = context.parameters.graphLabelFontFamily.raw!;


      let json_arr:any =[];
      
      let array_main = [this._xAxisValues,this._yAxisValues,this._ComparisonsValues];

      
      let yAxisNumbers = this._yAxisValues.map(Number);
      
      const max_val = yAxisNumbers.reduce(function(a, b) {
        return Math.max(a, b);
      }, -Infinity);

      let max_value = max(this._yAxisValues);

      for(let i=0;i<this._xAxisValues.length;i++){
        json_arr.push({
          XAxis:array_main[0][i],
          YAxis:array_main[1][i],
          CmpRevenue:array_main[2][i]
        })
      }  
      
      let data = json_arr;
      
      /*
      data = 
        [
          {"XAxis":"2020","YAxis":65332,"CmpRevenue":21000},
          {"XAxis":"2021","YAxis":15164,"CmpRevenue":5000},
          {"XAxis":"2022","YAxis":62342,"CmpRevenue":45999},
          {"XAxis":"2023","YAxis":24562,"CmpRevenue":12242},
          {"XAxis":"2024","YAxis":34622,"CmpRevenue":34622}
        ];
      */
        data = 
        [
          {"XAxis":"Stramlining the purchasing tunnel (conversion rate)","YAxis":100,"CmpRevenue":62},
          {"XAxis":"Improving the efficency of the search engine (Conversion rate)","YAxis":100,"CmpRevenue":70.1},
          {"XAxis":"Improving the efficency of the search engine (Conversion rate) 1","YAxis":100,"CmpRevenue":62.0143},
          {"XAxis":"Improving the efficency of the search engine (Conversion rate) 2","YAxis":100,"CmpRevenue":45.01},
          {"XAxis":"Improving the efficency of the search engine (Conversion rate) 3","YAxis":100,"CmpRevenue":22.01}
          
        ];
        
        
      

      this._graphBarColorSet = JSON.parse(context.parameters.graphBarColorSet.raw!);
      let graphColors = this._graphBarColorSet;
      let graphBg = this._graphBackgroundColor;
      
      let showYaxis = this._showYAxis;
      showYaxis = JSON.parse(showYaxis);

      let showYaxisGrid = this._showYAxisGrid;
      try{
        showYaxisGrid = JSON.parse(showYaxisGrid);
      }
      catch{
        showYaxisGrid = true;
      }
      
      let hideYaxis = this._hideYAxis;
      try{
        hideYaxis = JSON.parse(hideYaxis);
      }
      catch{
        hideYaxis = false;
      }

      let showbarLabels = this._showBarLabels;
      try{
        showbarLabels = JSON.parse(showbarLabels);
      }
      catch{
        showbarLabels = true;
      }
        
      let j=0;
      let numTicks:Number;
      
      let bar_width;
      if(isNaN(parseFloat(this._barWidth))===true)
        bar_width = 0.5
      else
        bar_width = parseFloat(this._barWidth);
      let width = this._svgWidth

      // Setting number of ticks on ther Y axis

      if(this.NumTicks==0)
        numTicks = 5;
      else
        numTicks = this.NumTicks;

      // setting the bottom padding of the graph
      
      let height = this._svgHeight - this._graphPaddingBottom -16*4;
    
    // calculating the max value of Y axis if set to auto 

    if(this.YMaxAuto === true) {
      
        max_value = max_val.toString();
        
        let digits = max_value!.length;
        let first_digit = max_value!.charAt(0);
        if(first_digit!="9"){
            this._graphMaxYValue = (Number(max_value!.charAt(0))*Math.pow(10, (Number(digits)-1))) + (Number(max_value!.charAt(1))+1)*Math.pow(10, (Number(digits)-2)) 
        }
        else {
          this._graphMaxYValue = Math.pow(10, (Number(digits)));
       
        } 
    }
    else
        this._graphMaxYValue = context.parameters.graphYMax.raw!;
    
    
      //--------------------------
      
      let maxYValue = this._graphMaxYValue;
      let inPercent = this._inPercentage;
      let textlabellength = 0;
      let maxwidth= 0;
      let left_padding:number=0;
      let xscale:any;
      


      let svg = d3.select(".svg_1");
      
      // Set y scale and the top padding of the graph containter
      let yscale = d3.scaleLinear().range([height, Number(this._graphPaddingTop)+Number(8)]);
      yscale.domain([0, maxYValue]); 

      // Set left padding of the graph containter
      let g = svg.append("g");
      
      // Adding y axis

      if(showYaxis === true)
      {
        //const yAxisGrid = d3.axisLeft(yscale).tickSize(-width+left_padding).ticks(numTicks);
        
        g.append("g")
        .call(d3.axisLeft(yscale).ticks(numTicks).tickSizeOuter(0))
        .attr("transform", "translate("+left_padding+",0)")
        .attr('class', 'y axis-grid')
        .selectAll("text")
        .attr("font-size",this._xAxisLabelFontSize+"px")
        .attr("font-weight",this._xAxisLabelFontWeight)
        .attr("font-family","")
        .text(function(d:any)     
        {
          
          if(maxYValue>=1000000)
            return (d/1000000).toFixed(2) +"M"
          else if(maxYValue<=1000000 && maxYValue>=1000)
            return (d/1000).toFixed(2) +"K"
          else if(inPercent===true) {
            return d+" %";
          }
          else
            return d;
        })
        .each(function(d,i) 
        {
          let node: SVGTextElement = <SVGTextElement>this; 
          let labelWidth = node.getComputedTextLength();
          if(labelWidth>maxwidth) maxwidth=labelWidth;
        });

        left_padding = Number(Number(this._graphPaddingLeft) + Number(maxwidth));
        left_padding +=Number(8);
        g.attr("transform", "translate(" + (left_padding) + "," + 0 + ")");

        // Setting Y axis grid lines
        let yreferenceOffset=0;

        if(showYaxisGrid===true){
          yreferenceOffset = width-left_padding-this._graphPaddingRight;
          g.selectAll(".tick:first-of-type line").remove();
        }
        else {
          yreferenceOffset = 0;
        }

        d3.selectAll(".tick line").attr("x2",yreferenceOffset);

      }
      else{ 
        left_padding = Number(Number(this._graphPaddingLeft));
        g.attr("transform", "translate(" + (left_padding) + "," + 0 + ")"); 
      }

      d3.selectAll(".axis-grid line").style("stroke",this._referenceYLineColor);
      
      // Set x scale and the right padding of the graph containter

      xscale = d3.scaleBand().range([0, width-Number(this._graphPaddingRight)-Number(left_padding)]).padding(bar_width); 
      xscale.domain(data.map(function (d:any) { return d.XAxis;})); 

      let bar_spacing = (((width-Number(this._graphPaddingRight)-Number(left_padding))/data.length)-(xscale.bandwidth()));
      
      // Adding x axis

      g.append("g") 
      .call(d3.axisBottom(xscale))
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height) + ")") 
      .call(d3.axisBottom(xscale).tickSizeOuter(0))
      .selectAll(".tick text")
      .attr("font-size",this._xAxisLabelFontSize+"px")
      .attr("font-weight",this._xAxisLabelFontWeight)
      .attr("font-family","")
      .call(function(t) {                
        t.each(function(d){ // for each one

          let width = xscale.bandwidth()+(bar_spacing/2)-10;
          let word;
          let self = d3.select(this);
          let lineHeight = 1.2;
          let y = self.attr("y");
          let dy = parseFloat(self.attr("dy"));
          let line:any =[];
          let s = self.text().split(' ').reverse();  // get the text and split it
          let tspan = self.text("").append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
          
          while (word = s.pop()) 
          {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node()!.getComputedTextLength() > width) {
                
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = self.append("tspan").attr("x", 0).attr("dy", lineHeight + "em").text(word);   
            }
          }
        })
        
      });

      

      // Setting axis colours 
      svg.selectAll(".domain").style("stroke", this._axisColor);
      // Showing or hiding 
      if(hideYaxis ===true)
        svg.selectAll(".y .domain").style("stroke-width",0);
      // Remove all tick marks from the dom
      d3.select('.svg_1').selectAll('.tick').selectAll('.x.axis line').remove();
      // Setting axis text 
      d3.select('.svg_1').selectAll('.tick').style("color", this._axisTextColor).style("font-weight","bold");
        
      width = xscale.bandwidth();
      
      // Drawing the first bar set

      g.selectAll(".bar") 
      .data(data) 
      .enter() 
      .append("rect") 
      .attr("class", "bar") 
      .attr("x", function (d:any) {
        return (xscale(d.XAxis)!); 
      }) 
      .attr("y", function (d:any) { 
        return yscale(d.YAxis)!; 
      })
      .attr("width", width) 
      .attr("height", function (d:any) { 
        return height - yscale(d.YAxis); 
      })
      .attr("fill",function (d) { 
        return graphBg;
      }); 

      // Second bar overlap

      g.selectAll(".bar_overlap") 
      .data(data) 
      .enter() 
      .append("rect") 
      .attr("class", "bar") 
      .attr("x", function (d:any) { 
      return (xscale(d.XAxis)!); 
      }) 
      .attr("y", function (d:any) { 
        if(Number(d.CmpRevenue)>Number(d.YAxis))
          return yscale(d.YAxis)!; 
        else
          return yscale(d.CmpRevenue)!; 
      })
      .attr("width", width) 
      .attr("height", function (d:any) { 
        
        if(Number(d.CmpRevenue)>Number(d.YAxis))
          return height - yscale(d.YAxis);
        else
          return height - yscale(d.CmpRevenue); 
      })
      .each(function(d,i) {
        j= i % graphColors.length;
        this.setAttribute("fill",graphColors[j]);
      });

      // enter text labels for comparison

      if(showbarLabels===true)
      {
        g.selectAll(".bar_overlap") 
        .data(data) 
        .enter() 
        .append("text")
        .style("font-size", this._graphBarFontSize+"px")
        .style("font-weight", "Bold")
        .style("fill", "#ffffff")
        .attr("font-family","")
        .attr("class","barstext")
        .attr("y",function(d:any) 
        { 
          let label_padding:number=0;
          if(d.CmpRevenue<=0 || d.YAxis <=0){
            label_padding=-20
          }
          else label_padding = 20;
  
          if(Number(d.CmpRevenue)>Number(d.YAxis))
            return yscale(d.YAxis)!+label_padding; 
          else
            return yscale(d.CmpRevenue)!+label_padding; 
        })  // change d.YAxis & d.CmpRevenue to show the bar value on either graphs and add padding
        .text(function(d:any)
        {
            if(d.CmpRevenue>=1000000)
              return (d.CmpRevenue/1000000).toFixed(2) +"M"
            else if(d.CmpRevenue<=1000000 && d.CmpRevenue>=1000)
              return (d.CmpRevenue/1000).toFixed(2) +"K"
            else if(inPercent===true) 
            {
              return d.CmpRevenue+" %";
            }
            else
              return d.CmpRevenue;
        })
        .each(function(d,i) {
          let thisWidth = this.getComputedTextLength();
          if(thisWidth>textlabellength)
            textlabellength=thisWidth;
            d3.select(this).attr("x", function(d:any) { return xscale(d.XAxis)!+(xscale.bandwidth()-thisWidth)/2; });          
        })
      }     
    }

  
      
    public getColor(){ 
        return "hsl(" + 260 * Math.random() + ',' +
                    (45 + 80 * Math.random()) + '%,' + 
                    (78 + 10 * Math.random()) + '%)'
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs
    {
        return {};
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void
    {
      d3.select("svg").remove();
        // Add code to cleanup control if necessary
    }


    private createTableBody(columnsOnView: DataSetInterfaces.Column[], gridParam: DataSet,context: ComponentFramework.Context<IInputs>) {
      // this.div1.innerHTML=""
      this._xAxisValues=[];
      this._yAxisValues=[];
      this._ComparisonsValues=[];

      if (gridParam.sortedRecordIds.length > 0) {
          for (const currentRecordId of gridParam.sortedRecordIds) {

              columnsOnView.forEach((columnItem, index) => {
                  if (index == 0) {
                      this._xAxisValues.push(gridParam.records[currentRecordId].getFormattedValue(columnItem.name));
                  }
                  else if (index == 1) {
                    this._yAxisValues.push(gridParam.records[currentRecordId].getFormattedValue(columnItem.name));
                  }
                  else if (index == 2) {
                    this._ComparisonsValues.push(gridParam.records[currentRecordId].getFormattedValue(columnItem.name));
                  }  
              });

          }
      }
    }

    private getSortedColumnsOnView(context: ComponentFramework.Context<IInputs>): DataSetInterfaces.Column[] {
      if (!context.parameters.Data_set.columns) {
          return [];
      }
      const columns = context.parameters.Data_set.columns;
      return columns;
    }
}