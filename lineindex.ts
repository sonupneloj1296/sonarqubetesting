// Last working file sent


import {IInputs, IOutputs} from "./generated/ManifestTypes";
import {Chart} from 'chart.js';
import * as d3 from 'd3';

import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
type DataSet = ComponentFramework.PropertyTypes.DataSet;


export class PCFLineGraph implements ComponentFramework.StandardControl<IInputs, IOutputs> {


    private _xAxisValues: string[] = [];
    private _yAxisValues: string[] = [];

    private _notifyOutputChanged: () => void;
    private labelElement: HTMLLabelElement;
    private inputElement: HTMLInputElement;
    private canvasElement: HTMLCanvasElement;
    private _canvasBgDiv: HTMLDivElement;
    private _container: HTMLDivElement;
    private _context: ComponentFramework.Context<IInputs>;
    private _refreshData: EventListenerOrEventListenerObject;
    private graphData:any;
    private graphLabels:any;
    private XAxisLabelSkipCount:number;

    private axisLabelColor:any;

    private _graphHeight:any;
    private _graphWidth:any; 

    private _NumYunits:number;

    private _graphMaxYValue:number;
    private borderRadius:any;

    private YMaxAuto:any;

    private _showYaxisLine:any;
    private _showXaxisLine:any;


   
    
    /**
     * Empty constructor.
     */
    constructor()
    {

    }

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
        var columnsOnView = this.getSortedColumnsOnView(context);
        this.createTableBody(columnsOnView, context.parameters.Data_set,context);

        context.mode.trackContainerResize(true);
        
        // Add control initialization code
        this._context = context;

        this.borderRadius = context.parameters.graphBackgroundBorderRadius.raw!;
        this._NumYunits = context.parameters.unitsForYAxis.raw!;
        this.axisLabelColor = context.parameters.AxisLabelColur.raw!;

        if(this._NumYunits == 0){
            this._NumYunits = 10
        }

        this._container = document.createElement("div");
        this._container.setAttribute("class", "main_div");
        this._canvasBgDiv = document.createElement("div");
        this._canvasBgDiv.style.minWidth = context.parameters.graphWidth.raw!+"px";
        this._canvasBgDiv.style.minHeight = context.parameters.graphHeight.raw!+"px";
        this._canvasBgDiv.style.padding = "8spx";
        this._canvasBgDiv.style.borderRadius = this.borderRadius+"px";
        this._canvasBgDiv.style.background = context.parameters.graphBackground.raw!;
        this._canvasBgDiv.setAttribute("class", "canvasbg");
        
        this._notifyOutputChanged = notifyOutputChanged;
        this._refreshData = this.refreshData.bind(this);

        // Get the data for input into the graph
        
        this._graphHeight = context.parameters.graphHeight.raw!;
        this._graphWidth = context.parameters.graphWidth.raw!;
        
        /*
        if(context.parameters.graphData.raw){
            this.graphData = context.parameters.graphData.raw;
        };
        */

        this.XAxisLabelSkipCount = context.parameters.graphXAxisSkipCount.raw!;
        this.YMaxAuto = context.parameters.autoGenerateYMax.raw!;
        this.YMaxAuto = JSON.parse(this.YMaxAuto);


        this._showYaxisLine = context.parameters.showYaxisLine.raw!;
        try{ this._showYaxisLine = JSON.parse(this._showYaxisLine);}
        catch {this._showYaxisLine = true;}

        this._showXaxisLine = context.parameters.showXaxisLine.raw!;
        try{ this._showXaxisLine = JSON.parse(this._showXaxisLine);}
        catch {this._showXaxisLine = true;}
       

        //console.log("Boolean : "+bool_YMaxAuto);
        
        
        
        // Create a HTML canvas for creating a graph
        let ratio = window.devicePixelRatio;
        this.canvasElement = document.createElement('canvas');
        this.canvasElement.width = Number(context.parameters.graphWidth.raw!)*ratio;
        this.canvasElement.height = Number(context.parameters.graphHeight.raw!)*ratio;
        this.canvasElement.style.width = context.parameters.graphWidth.raw!+"px";
        this.canvasElement.style.height = context.parameters.graphHeight.raw!+"px";

        //this.canvasElement.getContext("2d")!.scale(ratio, ratio);

        //this.canvasElement.setAttribute("width",context.parameters.graphWidth.raw!);
        //this.canvasElement.setAttribute("height",context.parameters.graphHeight.raw!);
        this.canvasElement.setAttribute("class", "myCanvas");
        this.canvasElement.setAttribute("id", "myCanvas");
        
        // creating HTML elements for the input type range and binding it to the function which refreshes the control data
        
        this.inputElement = document.createElement("input");
        this.inputElement.setAttribute("type", "range");
        this.inputElement.addEventListener("input", this._refreshData);

        //setting the max and min values for the control.
        this.inputElement.setAttribute("min", "1");
        this.inputElement.setAttribute("max", "1000");
        this.inputElement.setAttribute("class", "linearsliderx`");
        this.inputElement.setAttribute("id", "linearrangeinput");

        // creating a HTML label element that shows the value that is set on the linear range control
        this.labelElement = document.createElement("label");
        this.labelElement.setAttribute("class", "LinearRangeLabel");
        this.labelElement.setAttribute("id", "lrclabel");
        
        // retrieving the latest value from the control and setting it to the HTMl elements.

        this.inputElement.setAttribute("value", context.parameters.graphHeight.formatted ? context.parameters.graphHeight.formatted : "0");
        this.labelElement.innerHTML = context.parameters.graphHeight.formatted ? context.parameters.graphHeight.formatted : "0";

        // appending the HTML elements to the control's HTML container element.

        this._container.appendChild(this._canvasBgDiv);
        this._container.appendChild(this.canvasElement);
        
        container.appendChild(this._container);

    }

    public refreshData(evt: Event): void {

        this._notifyOutputChanged();
    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void
    {

        const columnsOnView = this.getSortedColumnsOnView(context);
        this.createTableBody(columnsOnView, context.parameters.Data_set,context);

        // Add code to update control view
        // storing the latest context from the control.
        this._context = context;
        
        
        var json_arr:any =[];
        var array_main = [this._xAxisValues,this._yAxisValues];

        for(var i=0;i<this._xAxisValues.length;i++){
            json_arr.push({
            label:array_main[0][i],
            y:array_main[1][i],
            })
        };

        var data = json_arr;
        this.graphData = data;
        
        console.log("------- DATA NEW -------");
        console.log(this.graphData);


        this.graphData =     [
            {"label":"Jan-21","y":"724914"},
            {"label":"Feb-21","y":"1123234"},
            {"label":"Mar-21","y":"2881190"},
            {"label":"Apr-21","y":"3270733"},
            {"label":"May-21","y":"2378842"},
            {"label":"Jun-21","y":"1643956"},
            {"label":"Jul-21","y":"1055866"},
            {"label":"Aug-21","y":"801146"},
            {"label":"Sep-21","y":"854771"},
            {"label":"Oct-21","y":"709042"},
            {"label":"Nov-21","y":"1103441"},
            {"label":"Dec-21","y":"895405"},
            {"label":"Jan-22","y":"593292"},
            {"label":"Feb-22","y":"797022"},
            {"label":"Mar-22","y":"1103441"},
            {"label":"Apr-22","y":"895405"},
            {"label":"May-22","y":"593292"},
            {"label":"Jun-22","y":"1123234"},
            {"label":"Jul-22","y":"1055866"},
            {"label":"Aug-22","y":"801146"},
            {"label":"Sep-22","y":"854771"},
            {"label":"Oct-22","y":"709042"},
            {"label":"Nov-22","y":"1103441"},
            
          ];

        //this.graphData = JSON.parse(context.parameters.graphData.raw!);
        //console.log("------- DATA OLD -------");
        //console.log(this.graphData);
        

        
        var max_value = this.graphData.slice().sort( 
            function(a:any,b:any) {
               return b['y'] - a['y'];
            }
          )[0]['y'];

        
        if(this.YMaxAuto === true) {
            this._graphMaxYValue = Math.ceil(max_value);
            var digits = max_value.length;
            var first_digit = max_value.charAt(0);
            if(first_digit!="9"){
                this._graphMaxYValue = (Number(first_digit)+1)*Math.pow(10, (Number(digits)-1));
            }else
                this._graphMaxYValue = Math.pow(10, (Number(digits)));
            
        }
        else
            this._graphMaxYValue = context.parameters.graphYMax.raw!;
        
          

        //--------------------------------------------------

        // ---------- Code for line graph ----------
        
        let myLineChart = new LineChart({
            _showYaxisLine:this._showYaxisLine,
            _showXaxisLine:this._showXaxisLine,
            xlabelSkipCount:this.XAxisLabelSkipCount,
            _axislabelcolor:this.axisLabelColor,
            labels:this.graphLabels,
            graphData:this.graphData,  
            canvasId: "myCanvas",  
            minX: 0,  
            minY: 0,  
            maxX: 140,  
            maxY: this._graphMaxYValue,
            unitsPerTickX: 1,  
            unitsPerTickY: this._NumYunits,
            axisColor : context.parameters.graphAxisBg.raw!  
        },this.canvasElement);

        
        myLineChart.drawLine(this.graphData, context.parameters.graphLineColor.raw!, 3);
            
        var ctx = this.canvasElement.getContext("2d");
        console.log(ctx);

        // ---------- End Code for line graph ----------
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs
    {
        return {
           // controlValue: this._value
        
         };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void
    {
        // Add code to cleanup control if necessary
        //this.inputElement.removeEventListener("input", this._refreshData);
    }

    private createTableBody(columnsOnView: DataSetInterfaces.Column[], gridParam: DataSet,context: ComponentFramework.Context<IInputs>) {
        // this.div1.innerHTML=""
        this._xAxisValues=[];
        this._yAxisValues=[];
  
        if (gridParam.sortedRecordIds.length > 0) {
            for (const currentRecordId of gridParam.sortedRecordIds) {
  
                columnsOnView.forEach((columnItem, index) => {
                    if (index == 0) {
                        this._xAxisValues.push(gridParam.records[currentRecordId].getFormattedValue(columnItem.name));
                    }
                    else if (index == 1) {
                      this._yAxisValues.push(gridParam.records[currentRecordId].getFormattedValue(columnItem.name));
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

class LineChart{

    private minX:number;
    private minY:number;
    private maxX:number;
    private maxY:number;
    private unitsPerTickX:number;
    private unitsPerTickY:number;

    private x:number;
    private y:number;

    private scaleX:number;
    private scaleY:number;
    
    private padding:number;
    private tickSize:number;
    private axisColor:any;
    private pointRadius:number;
    private font:any;
    private fontHeight:number;

    private rangeX:number;
    private rangeY:number;
    private numXTicks:number;
    private numYTicks:number;

    private width:number;
    private height:number;

    private context:any;
    private labels:string[];

    private data:any;

    private xlabelSkipCount:number;
    private axisLabelColor:any;

    private _showYaxisLine:any;
    private _showXaxisLine:any;

    constructor(con:any,canvasElement:any)
    {
        //console.log(con);
        //var params = JSON.parse(con);
        
        this.data = con.graphData;
        this.xlabelSkipCount = con.xlabelSkipCount;
        this.axisLabelColor = con._axislabelcolor;

        this._showYaxisLine = con._showYaxisLine;
        this._showXaxisLine = con._showXaxisLine;


        
        this.context=canvasElement.getContext("2d");
        this.minX = con.minX;  
        this.minY = con.minY;
         
        this.maxX = con.maxX;
        
        this.maxY = this.data.slice().sort( 
            function(a:any,b:any) {
               return b['y'] - a['y'];
            }
          )[0]['y'];
        
        this.maxY = con.maxY;  

        this.axisColor = con.axisColor;

        this.context.imageSmoothingEnabled=true;

        this.labels = con.labels;
        //console.log("Labels :"+this.labels);

        //console.log("maxX :"+this.maxX+" | "+con.maxX); 
        
        this.unitsPerTickX = con.unitsPerTickX;  
        this.unitsPerTickY = con.unitsPerTickY;
        
        // constants  
        this.padding = 10;  
        this.tickSize = 10;  
        //this.axisColor = "#09ACAC";  
        this.pointRadius = 5;  
        this.font = "8pt Calibri";  
    
        this.fontHeight = 12;  
    
        // relationships       
      
        //console.log("Starting : "+this.rangeX+"|"+this.rangeY+"|"+this.numXTicks+"|"+this.numYTicks+"|"+this.x+"|"+this.y+"|"+this.width+"|"+this.height+"|"+this.scaleX+"|"+this.scaleY)
        this.rangeX = this.maxX - this.minX;  
        this.rangeY = this.maxY - this.minY; 
        
        //console.log("label length :"+this.labels.length);
        this.numXTicks = this.data.length;
        this.numYTicks = this.unitsPerTickY;
        //this.numXTicks = Math.round(this.rangeX / this.unitsPerTickX);
        //this.numYTicks = Math.round(this.rangeY / this.unitsPerTickY);

        console.log("numYTicks : "+this.numYTicks) ;
        
        

        this.x = this.getLongestValueWidth() + this.padding * 2;  
        this.y = this.padding * 2;  

        console.log(" x AND y : "+this.x+"|"+this.y);

        console.log(" canvasElement.canvas.width : "+canvasElement.width) ;
       
        this.width = canvasElement.width - this.x - this.padding * 2;  
        this.height = canvasElement.height - this.y - this.padding - this.fontHeight;  

        console.log(" width AND height : "+this.width+"|"+this.height) 

        this.scaleX = this.width / this.rangeX;
        
        console.log("Scale X :"+this.scaleX);
        
        //this.scaleX = this.width / this.rangeX;  
        this.scaleY = this.height / this.rangeY;  

        //console.log(this.rangeX+"|"+this.rangeY+"|"+this.numXTicks+"|"+this.numYTicks+"|"+this.x+"|"+this.y+"|"+this.width+"|"+this.height+"|"+this.scaleX+"|"+this.scaleY)

        // draw x y axis and tick marks  
        this.drawXAxis();  
        this.drawYAxis();  
    }




     public drawLine(data:any, color:any, width:any) {  
        var context = this.context;  
        context.save();  
        this.transformContext();  
        context.lineWidth = width;  
        context.strokeStyle = color;  
        context.fillStyle = color;  
        context.beginPath();  
        context.moveTo(data[0].x * this.scaleX, data[0].y * this.scaleY);  
    

        for (var n = 0; n < data.length; n++) {  
            var point = data[n];  

            var mapped_point = (n + 1) * this.width / this.numXTicks;
            console.log(" n : "+n+" | Mapped point :"+mapped_point);
            
            
            // draw segment  
            if(n!=0){
            context.lineTo(mapped_point, point.y * this.scaleY);  
            context.stroke();  
            context.closePath(); 
            }
            
            // plotting points
            /*
            context.beginPath();  
            //context.arc(mapped_point * this.scaleX, point.y * this.scaleY, this.pointRadius, 0, 2 * Math.PI, false);  
            context.arc(mapped_point, point.y * this.scaleY, this.pointRadius, 0, 2 * Math.PI, false);  
            context.fill();  
            context.closePath();  
            */
            
    
            // position for next segment  
            context.beginPath();  
            //context.moveTo(mapped_point * this.scaleX, point.y * this.scaleY);  
            context.moveTo(mapped_point, point.y * this.scaleY);  
        }  

        context.restore();  
    };  
    
    public transformContext() {  
        var context = this.context;  
    
        // move context to center of canvas  
        this.context.translate(this.x, this.y + this.height);  
    
        // invert the y scale so that that increments  
        // as you move upwards  
        context.scale(1, -1);  
    };

    public drawXAxis() {  

        

        this.context.save();  

        if(this._showXaxisLine){
            this.context.beginPath();  
            this.context.moveTo(this.x, this.y + this.height);  
            this.context.lineTo(this.x + this.width, this.y + this.height);  
            this.context.strokeStyle = this.axisColor;  
            this.context.lineWidth = 2;  
            this.context.stroke();  
        }
        // draw tick marks
        
        for (var n = 0; n < this.numXTicks; n++) {
            
            this.context.beginPath();  
            this.context.moveTo((n + 1) * this.width / this.numXTicks + this.x, this.y + this.height);
            
            console.log("Drawing at :"+(n + 1) * this.width / this.numXTicks + this.x);
            
            this.context.lineTo((n + 1) * this.width / this.numXTicks + this.x, this.y + this.height - this.tickSize);  
            //this.context.stroke();  
        }  
        
    
        // draw labels  
        
        this.context.font = this.font;  
        this.context.fillStyle = this.axisLabelColor;  
        this.context.textAlign = "center";  
        this.context.textBaseline = "middle";
        
        for (var n = 0; n < this.numXTicks; n++) {  
            var label = this.data[n].label;
            //var label = Math.round((n + 1) * this.maxX / this.numXTicks); 
            
            if(n%(this.xlabelSkipCount+1)==0){
                console.log("this.width :"+this.width+" | this.numXTicks :"+this.numXTicks+" | this.x :"+this.x);
            
                this.context.save();  
                this.context.translate((((n + 1) * this.width) / this.numXTicks )+ this.x, this.y + this.height + this.padding);  
                this.context.fillText(label, 0, 0);  
                this.context.restore();  
            }

           
        }  
        
        this.context.restore();  
    };
    
    public getLongestValueWidth() {  
        this.context.font = this.font;  
        var longestValueWidth = 0;  
        for (var n = 0; n <= this.numYTicks; n++) {  
            var value = this.maxY - (n * this.unitsPerTickY);  
            longestValueWidth = Math.max(longestValueWidth, this.context.measureText(value).width);  
        }  
        return longestValueWidth;  
    };  
    

    public convertAndMatch(index:number,label:any){

    }

    
    public drawYAxis() {  
        var context = this.context;  
        context.save();  
        context.save();  
        
        if(this._showYaxisLine) {
            context.beginPath();  
            context.moveTo(this.x, this.y);  
            context.lineTo(this.x, this.y + this.height);  
            context.strokeStyle = this.axisColor;  
            context.lineWidth = 2;  
            context.stroke();  
            context.restore();  
       

        // draw values  
        context.font = this.font;  
        context.fillStyle = this.axisLabelColor;  
        context.textAlign = "right";
        context.textBaseline = "middle";  
    
            for (var n = 0; n < this.numYTicks; n++) {  
                var value = Math.round(this.maxY - n * this.maxY / this.numYTicks);  
                context.save();  
                context.translate(this.x - this.padding, n * this.height / this.numYTicks + this.y);  
                context.fillText(value, 0, 0);  
                context.restore();  
            }  
        }

    
        // draw tick marks
        /*  
        for (var n = 0; n < this.numYTicks; n++) {  
            context.beginPath();  
            context.moveTo(this.x, n * this.height / this.numYTicks + this.y);  
            context.lineTo(this.x + this.tickSize, n * this.height / this.numYTicks + this.y);  
            context.stroke();  
        }  
        */
    

        context.restore();  
    };  
}

