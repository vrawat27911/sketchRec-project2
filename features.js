var numberOfCorners;
var isPolyline;
var features_arr =[[]];
var feature_count = 0;
var Features = {
    evaluateFeatures: function (sketch) {

        // get corners
        // ndde
        // dcr
        //triangle detection
        var corners = this.displayCornerFindingIStraw(sketch);
        var bbDiagLen = this.bbDiagLen(sketch);
        var rotation = this.rotChange(sketch);
        var absRotation = this.absRotChange(sketch);
        var smoothness = this.smoothness(sketch);
        var strokeLen = this.strokeLen(sketch);
        var relativeRot = this.relativeRot(sketch);
        var curviness = this.curviness(sketch);
        var distanceBetweenStartAndEnd = this.distanceBetweenStartAndEnd(sketch);
        var openness = this.openness(sketch);
        var dcr = this.DCR(sketch);
        var ndde = this.NDDE(sketch);

        // arr.push(isPolyline);

        features_arr[feature_count] = [];
        features_arr[feature_count++] = [isPolyline, numberOfCorners, bbDiagLen, absRotation, /*smoothness,*/ strokeLen,/* curviness,distanceBetweenStartAndEnd, openness, dcr, */ ndde, sketch.interpretation];
        //arr.push(this.interpretation);
        //DrawSketch.drawPoints(corners, "#0000ff");
        return features_arr;
    },


    displayCornerFindingShortStraw: function (sketch) {
        // get the resampled sketch and its corner indices
        var resampledSketch = SketchRecTools.resampleByDistance(sketch);
        var sketchCornerIndices = ShortStraw.run(resampledSketch);

        // gather the corners from their indices
        var corners = [];
        for (var i = 0; i < resampledSketch.strokes.length; i++) {
            var resampledPoints = resampledSketch.strokes[i].points;
            var strokeCornerIndices = sketchCornerIndices[i];
            for (var j = 0; j < strokeCornerIndices.length; j++) {
                corners.push(resampledPoints[strokeCornerIndices[j]]);
            }
        }
        return corners;
        //previewSketch(sketch, "gray");
        //previewPoints(corners, "red");
    },

    displayCornerFindingIStraw: function (sketch) {
        // get the resampled sketch and its corner indices
        var resampledSketch = SketchRecTools.resampleByDistance(sketch);
        var sketchCornerIndices = IStraw.run(resampledSketch);
        var d;
        // gather the corners from their indices
        var corners = [];
        var strokeStartPoints = [];
        var strokeEndPoints = [];
        isPolyline = true;
        for (var i = 0; i < resampledSketch.strokes.length; i++) {
            if (resampledSketch.strokes[i].points.length > 2) {
                d = Math.sqrt(Math.pow(resampledSketch.strokes[i].points[1].x - resampledSketch.strokes[i].points[0].x, 2) + Math.pow(resampledSketch.strokes[i].points[1].y - resampledSketch.strokes[i].points[0].y, 2));
            }
            var resampledPoints = resampledSketch.strokes[i].points;
            var strokeCornerIndices = sketchCornerIndices[i];
            isPolyline = isPolyline && this.checkForStraightLine(resampledPoints, strokeCornerIndices);
            for (var j = 0; j < strokeCornerIndices.length; j++) {
                var p = resampledPoints[strokeCornerIndices[j]];
                corners.push(p);
                // if (j >= 1) {
                //     console.log(Math.sqrt(Math.pow(p.x - corners[j - 1].x, 2) + Math.pow(p.y - corners[j - 1].y, 2)));
                // }
            }
        }
        //console.log(isPolyline);
        return this.printDist(corners);
        //return corners;
        //previewSketch(sketch, "gray");
        //previewPoints(corners, "red");
    },

    checkForStraightLine: function (points, indices) {
        var totalLen = 0;
        var isStr = true;
        for (var j = 0; j < indices.length-1; j++) {
            totalLen = 0;
            for (var i = indices[j]; i < indices[j + 1] - 1; i++) {
                totalLen += Math.sqrt(Math.pow(points[i].x - points[i + 1].x, 2) + Math.pow(points[i].y - points[i + 1].y, 2));
            }
            var dist = Math.sqrt(Math.pow(points[indices[j]].x - points[indices[j + 1]].x, 2) + Math.pow(points[indices[j]].y - points[i + 1].y, 2));
            //console.log(dist / totalLen);
            isStr = isStr && (dist / totalLen >= 0.95);
        }
        return isStr;
    },

    printDist: function (corners) {
        for (var i = 0; i < corners.length; i++) {
            for (var j = i + 1; j < corners.length; j++) {
                var d = Math.sqrt(Math.pow(corners[i].x - corners[j].x, 2) + Math.pow(corners[i].y - corners[j].y, 2));
                //console.log(d);
                if (d < 30)
                    corners.splice(j--, 1);
            }
        }
        numberOfCorners = corners.length;
        return corners;
    },
    triangle: function (sketch) {

    },

    ///Lingje
    // calculate the distance between tow points
    distance: function(p1, p2)
    {
        var a = p1.x - p2.x;
        var b = p1.y - p2.y;
        var c = Math.sqrt(a * a + b * b);
        // console.log("Distance between is: " + c);
        return c;
    },

    // rotation change helper function
    rotChangeHelper: function(sketch, i, j) 
    {
        var xDelta = sketch.strokes[i].points[j+1].x - sketch.strokes[i].points[j].x;
        var yDelta = sketch.strokes[i].points[j+1].y - sketch.strokes[i].points[j].y;
        var xDeltaPrev = sketch.strokes[i].points[j].x - sketch.strokes[i].points[j-1].x;
        var yDeltaPrev = sketch.strokes[i].points[j].y - sketch.strokes[i].points[j-1].y;

        var subSum = this.angleBetweenLines(xDelta, yDelta, xDeltaPrev, yDeltaPrev);

        return subSum;
    },

    // angle between lines
    angleBetweenLines : function(dx, dy, dxPrev, dyPrev){
        var numer = dx * dyPrev - dxPrev * dy;
        var denom = dx * dxPrev + dy * dyPrev;
        var theta = Math.atan(numer / denom);
        return theta;
    },

    // // max curvature count
    // maxCurveandCounter : function(sketch) 
    // {
    //     var max = Number.MIN_VALUE;
    //     var counter = 0;

    //     for (var i = 0; i < sketch.strokes.length; i++)
    //     {
    //         for (var j = 1; j < stroke.length - 2; j++)
    //         {
    //             var change = this.rotChangeHelper(sketch, i, j);

    //             if (isNaN(change)) {
    //                 continue;
    //             }

    //             max = Math.max(max, Math.abs(change));
    //             counter++;
    //         }
    //     }
    //     return {max: max, counter: counter};
    // },

    /* Rubine feature: Bounding Box Diagonal Length */
    maxNmin : function(sketch)
    {
        var xMax = Number.MIN_VALUE;
        var yMax = Number.MIN_VALUE;
        var xMin = Number.MAX_VALUE;
        var yMin = Number.MAX_VALUE;
        
        for (var i = 0; i < sketch.strokes.length; i++)
        {
            for (var j = 0; j < sketch.strokes[i].points.length; j++)
            {
                point = sketch.strokes[i].points[j];

                xMax = Math.max(xMax, point.x);
                xMin = Math.min(xMin, point.x);
                yMax = Math.max(yMax, point.y);
                yMin = Math.min(yMin, point.y);
            }
        }

        return [{x:xMax,y:yMax},{x:xMin,y:yMin}];
    },

    bbDiagLen: function(sketch)
    {
        var points = this.maxNmin(sketch);
        pMax = points[0];
        pMin = points[1];
        return this.distance(pMax, pMin);
    },

    /* Rubine feature: Rotation Change */
    rotChange: function(sketch)
    {
        var angleSum = 0;

        for (var i = 0; i < sketch.strokes.length; i++)
        {   
            for (var j = 1; j < sketch.strokes[i].points.length - 2; j++)
            {
                var subSum = this.rotChangeHelper(sketch, i, j);
                angleSum += isNaN(subSum) ? 0 : subSum;
            }
        }

        // console.log("dx dy dx-1 dy-1: " + xDelta + " " + yDelta +  " " + xDeltaPrev + " " + yDeltaPrev);
        // console.log("rotational change is: " + angleSum);
        return angleSum;
    },

    /* Rubine feature: Absolute Rotation Change */
    absRotChange: function(sketch)
    {
        var absSum = 0;
        
        for (var i = 0; i < sketch.strokes.length; i++)
        {
            for (var j = 1; j < sketch.strokes[i].points.length - 2; j++)
            {
                var absRot = this.rotChangeHelper(sketch, i, j);
                absSum += isNaN(absRot) ? 0 : Math.abs(absRot);
            }
        }
        
        return absSum;
    },

    /*Feature 8 -- Stroke Length */
    perStrokeLen: function(sketch, points) 
    {
        var sum = 0;

        for (var i = 1; i < points.length; i++) 
        {
            var prev_point = points[i - 1];
            var curr_point = points[i];
            
            var dis = this.distance(prev_point, curr_point);
            sum += dis;
        }

        return sum;
    },

    strokeLen: function(sketch) 
    {
        var strokes = sketch.strokes;
        var sumStrokeLen = 0;

        for (var i = 0; i < strokes.length; i++) 
        {
            var strokeLen = this.perStrokeLen(sketch, strokes[i].points);
            sumStrokeLen += strokeLen;
        }

        return sumStrokeLen;
    },

    /* Rubine feature: Distance Between Start and End Points */
    distanceBetweenStartAndEnd: function(sketch) 
    {
        var endstrokeIndex = sketch.strokes.length - 1;
        var endpointIndex = sketch.strokes[endstrokeIndex].points.length - 1;
        var P0 = sketch.strokes[0].points[0];
        var Pn = sketch.strokes[endstrokeIndex].points[endpointIndex];
        var dis = this.distance(P0, Pn);
        
        return dis;
    },

    /* Rubine feature: Smoothness */
    smoothness: function(sketch)
    {
        var squareSum = 0;

        for (var i = 0; i < sketch.strokes.length; i++)
        {
            for (var j = 1; j < sketch.strokes[i].points.length - 2; j++)
            {
                var sqRot = Math.pow(this.rotChangeHelper(sketch, i, j), 2);
                squareSum += isNaN(sqRot) ? 0 : Math.abs(sqRot);
            }
        }

        return squareSum;
    },

    /* Long feature: Relative Rotation */
    relativeRot: function(sketch)
    {
        return (this.rotChange(sketch) / this.strokeLen(sketch));
    },

    /* Long feature: Openness */
    openness: function(sketch)
    {
        var Rf5 = this.distanceBetweenStartAndEnd(sketch);
        var Rf3 = this.bbDiagLen(sketch);
        var res = Rf5 / Rf3;

        return res;
    },

    /* Long feature: Curviness */
    curviness: function(sketch)
    {
        var curveSum = 0;

        for (var i = 0; i < sketch.strokes.length; i++)
        {
            for (var j = 1; j < sketch.strokes[i].points.length - 2; j++)
            {
                var subSum = Math.abs(this.rotChangeHelper(sketch, i, j));
                curveSum += (isNaN(subSum) || subSum >= (19 * Math.PI / 180)) ? 0 : subSum;
            }
        }

        return curveSum;
    },

    /* DCR */
    // max curvature
    // maxCurve: function(sketch) 
    // {
    //     return this.maxCurveandCounter(sketch).max;
    // },

    // // average curvature
    // averageCurvature: function(sketch) 
    // {
    //     var totalChange = this.absRotChange(sketch);
    //     return totalChange / this.maxCurveandCounter(sketch).counter;
    // },

    // DCR (direction change ratio)
    DCR: function(sketch) 
    {
        var maxAngleChange = Number.MIN_VALUE;
        var averageAngleChange;
        var angleSum = 0;
        var angle;

        var count = 0;

        var previous_angle = this.rotChangeHelper(sketch, 0, 1);

        for (var i = 0; i < sketch.strokes.length; i++)
        {
            for(var j = 1; j < sketch.strokes[i].points.length - 1; j++)
            {
                angle = this.rotChangeHelper(sketch, i, j);
                angleSum += Math.abs(previous_angle - angle);

                if(Math.abs(previous_angle - angle) > maxAngleChange)
                {
                    maxAngleChange = angle;
                }

                count++;

                previous_angle = angle;
            }
        }

        averageAngleChange = count > 0 ? (angleSum/count) : 0;

        if(averageAngleChange == 0) 
            return Number.MAX_VALUE;
        else
            return (maxAngleChange/averageAngleChange);
    },

    strokebtwExtremes : function(sketch, maxAngleStroke, maxAngleStrokePoint, minAngleStroke, minAngleStrokePoint)
    {

        var strokebtwExtremes = 0;

        var startstroke = maxAngleStroke < minAngleStroke ? maxAngleStroke : minAngleStroke;
        var startpoint = maxAngleStroke < minAngleStroke ? maxAngleStrokePoint : minAngleStrokePoint;

        var endstroke = maxAngleStroke > minAngleStroke ? maxAngleStroke : minAngleStroke;
        var endpoint = maxAngleStroke > minAngleStroke ? maxAngleStrokePoint : minAngleStrokePoint;

        for (var i = startstroke; i <= endstroke; i++)
        {
            if(sketch[i] == null) continue;

            for (var j = startpoint; ; j++)
            {
                if (i == endstroke)
                    { if (j > endpoint) break; }
                else if (j > sketch[i].length - 1)
                    break;

                point_j = sketch[i][j];
                point_j_next = sketch[i][j+1];

                if(point_j == null || point_j_next == null)
                    continue;

                strokebtwExtremes += Math.sqrt(Math.pow((point_j_next.x - point_j.x),2) + Math.pow(point_j_next.y - point_j.y,2));              
            }

        }
        return strokebtwExtremes;
    },

    //NDDE
    NDDE: function(sketch)
    {
        var maxAngle = Number.MIN_VALUE;
        var minAngle = Number.MAX_VALUE;

        var strokeWithMinAngle = -1;
        var pointWithMinAngle = -1;
        var strokeWithMaxAngle = -1;
        var pointWithMaxAngle = -1;
        var strokeLenbtwExtremes;
        var strokebtwExtremes;

        for (var i = 0; i < sketch.strokes.length; i++)
        {
            for(var j = 1; j < sketch.strokes[i].points.length - 1; j++)
            {
                angle = this.rotChangeHelper(sketch, i, j);

                if(angle > maxAngle)
                {
                    maxAngle = angle;
                    strokeWithMaxAngle = i;
                    pointWithMaxAngle = j;
                }
    
                if(angle < minAngle)
                {
                    minAngle = angle;
                    strokeWithMinAngle = i;
                    pointWithMinAngle = j;  
                }
            }
        }

        if ((strokeWithMinAngle == strokeWithMaxAngle) && (pointWithMinAngle == pointWithMaxAngle))
        {
            return 0;
        }
        else
            strokeLenbtwExtremes = this.strokebtwExtremes(sketch, strokeWithMinAngle, pointWithMinAngle, strokeWithMaxAngle, pointWithMaxAngle);

        var strokeLen = this.strokeLen(sketch);

        if (strokeLenbtwExtremes == null || strokeLen == null)
            return 0;
        if (strokeLen == 0)
            return Number.MAX_VALUE;

        return (strokeLenbtwExtremes/strokeLen);
    }
}
