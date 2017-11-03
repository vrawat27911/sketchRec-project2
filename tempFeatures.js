// calculate the distance between tow points
function distance(p1, p2){
    var a = p1.x - p2.x;
    var b = p1.y - p2.y;
    var c = Math.sqrt(a * a + b * b);
    // console.log("Distance between is: " + c);
    return c;
}

// rotation change helper function
function rotChangeHelper(sketch, stroke, j) {
    if (typeof sketch.pointsObj[stroke[j + 1]] === "undefined" ||
        typeof sketch.pointsObj[stroke[j]] === "undefined" ||
        typeof sketch.pointsObj[stroke[j - 1]] === undefined){
            return NaN;
    }
    var xDelta = sketch.pointsObj[stroke[j + 1]]["x"] - sketch.pointsObj[stroke[j]]["x"],
        yDelta = sketch.pointsObj[stroke[j + 1]]["y"] - sketch.pointsObj[stroke[j]]["y"],
        xDeltaPrev = sketch.pointsObj[stroke[j]]["x"] - sketch.pointsObj[stroke[j - 1]]["x"],
        yDeltaPrev = sketch.pointsObj[stroke[j]]["y"] - sketch.pointsObj[stroke[j - 1]]["y"];
    var subSum = angleBetweenLines(xDelta, yDelta, xDeltaPrev, yDeltaPrev);
    return subSum;
}

// angle between lines
function angleBetweenLines(dx, dy, dxPrev, dyPrev){
        var numer = dx * dyPrev - dxPrev * dy;
        var denom = dx * dxPrev + dy * dyPrev;
        var theta = Math.atan(numer / denom);
        return theta;
}

// max curvature count
function maxCurveandCounter(sketch) {
    var max = Number.MIN_VALUE;
    var counter = 0;
    for (var i = 0; i < sketch["strokes"].length; i++){
        var stroke = sketch["strokes"][i]["points"];
        for (var j = 1; j < stroke.length - 1; j++){
            var change = rotChangeHelper(sketch, stroke, j);
            if (isNaN(change)) {
                continue;
            }
            max = Math.max(max, Math.abs(change));
            counter++;
        }
    }
    return {max: max, counter: counter};
}

/* Rubine feature: Bounding Box Diagonal Length */
function maxPoint(points){
    var xMax = Number.MIN_VALUE;
    var yMax = Number.MIN_VALUE;
    for (var i = 0; i < points.length; i++){
        if (points[i]["x"] > xMax){
            xMax = points[i]["x"];
        }
        if (points[i]["y"] > yMax){
            yMax = points[i]["y"];
        }
    }
    return {x:xMax, y:yMax};
}

function minPoint(points){
    var xMin = Number.MAX_VALUE;
    var yMin = Number.MAX_VALUE;
    for (var i = 0; i < points.length; i++){
        if (points[i]["x"] < xMin){
            xMin = points[i]["x"];
        }
        if (points[i]["y"] < yMin){
            yMin = points[i]["y"];
        }
    }
    return {x:xMin, y:yMin};
}

function bbDiagLen(sketch){
    var pMax = maxPoint(sketch["points"]);
    var pMin = minPoint(sketch["points"]);
    return distance(pMax, pMin);
}

/* Rubine feature: Rotstion Change */
function rotChange(sketch){
    var angleSum = 0;
    for (var i = 0; i < sketch["strokes"].length; i++){
        var stroke = sketch["strokes"][i]["points"];
        for (var j = 1; j < stroke.length - 1; j++){
            var subSum = rotChangeHelper(sketch, stroke, j);
            angleSum += isNaN(subSum) ? 0 : subSum;
        }
    }
    // console.log("dx dy dx-1 dy-1: " + xDelta + " " + yDelta +  " " + xDeltaPrev + " " + yDeltaPrev);
    // console.log("rotational change is: " + angleSum);
    return angleSum;
}

/* Rubine feature: Absolute Rotation Change */
function absRotChange(sketch){
        var absSum = 0;
        for (var i = 0; i < sketch["strokes"].length; i++){
            var stroke = sketch["strokes"][i]["points"];
            for (var j = 1; j < stroke.length - 1; j++){
                var subSum = rotChangeHelper(sketch, stroke, j);
                absSum += isNaN(subSum) ? 0 : Math.abs(subSum);
            }
        }
        // console.log("abs Rot change is: " + absSum);
        return absSum;
}

/*Feature 8 -- Stroke Length */
function eachStrokeLen(sketch, points) {
    var sum = 0;
    for (var i = 1; i < points.length; i++) {
        var id1 = points[i - 1];
        var id2 = points[i];
        // console.log(id1);
        // console.log(sketch.pointsObj[id1]);
        var dis = distance(sketch.pointsObj[id1], sketch.pointsObj[id2]);
        sum += dis;
    }
    // console.log("each stroke length is " + sum);
    return sum;
}

function strokeLen(sketch) {
    var strokes = sketch.strokes;
    var sum = 0;
    for (var i = 0; i < strokes.length; i++) {
        var subSum = eachStrokeLen(sketch, strokes[i].points);
        sum += subSum;
    }
    // console.log("stroke length is " + sum);
    return sum;
}

/* Rubine feature: Distance Between Start and End Points */
function distanceBetweenStartAndEnd(sketch) {
    var endIndex = sketch.points.length - 1;
    var P0 = sketch.points[0];
    var Pn = sketch.points[endIndex];
    var dis = distance(P0, Pn);
    // console.log("Distance between start and end " + dis);
    return dis;
}

/* Rubine feature: Smoothness */
function smoothness(sketch){
    var squareSum = 0;
    for (var i = 0; i < sketch["strokes"].length; i++){
        var stroke = sketch["strokes"][i]["points"];
        for (var j = 1; j < stroke.length - 1; j++){
            var subSum = Math.pow(rotChangeHelper(sketch, stroke, j), 2);
            squareSum += isNaN(subSum) ? 0 : Math.abs(subSum);
        }
    }
    // console.log("Smoothness is: " + squareSum);
    return squareSum;
}

/* Long feature: Relative Rotation */
function relativeRot(sketch){
        // console.log("Relative Rot is: " + rotChange(sketch) / strokeLen(sketch));
        return rotChange(sketch) / strokeLen(sketch);
    }
/* Long feature: Openness */
function openness(sketch){
    var Rf5 = distanceBetweenStartAndEnd(sketch);
    var Rf3 = bbDiagLen(sketch);
    var res = Rf5 / Rf3;
    console.log("The openness is: " + res);
    return res;
}

/* Long feature: Curviness */
function curviness(sketch){
    var curveSum = 0;
    for (var i = 0; i < sketch["strokes"].length; i++){
        var stroke = sketch["strokes"][i]["points"];
        for (var j = 1; j < stroke.length - 1; j++){
            var subSum = rotChangeHelper(sketch, stroke, j);
            curveSum += (isNaN(subSum) || subSum >= (19 * Math.PI / 180)) ? 0 : Math.abs(subSum);
        }
    }
    // console.log("Curviness is: " + curveSum);
    return curveSum;
}

/* DCR */
// max curvature
function maxCurve(sketch) {
    return maxCurveandCounter(sketch).max;
}

// average curvature
function averageCurvature(sketch) {
    var totalChange = absRotChange(sketch);
    return totalChange / maxCurveandCounter(sketch).counter;
}

// DCR (direction change ratio)
function DCR(sketch) {
    var max = maxCurve(sketch);
    var averageChange = averageCurvature(sketch);
    var DCR = max / averageChange;
    // console.log("Direction change ratio is " + DCR);
    return DCR;
}

/* Normalized Distance Between Direction Extremes */
function single(sketch, points) {
    var maxDirChange = Number.MIN_VALUE,
        minDirChange = Number.MAX_VALUE;
    var maxID = 0,
        minID = 0;
    for (var i = 1; i < points.length; i++) {
        var id1 = points[i - 1];
        var id2 = points[i];
        var temp = (id1.y - id2.y) / (id1.x - id2.x);
        if (temp > maxDirChange) {
            maxDirChange = temp;
            maxID = i;
        }
        if (temp < minDirChange) {
            minDirChange = temp;
            minID = i;
        }
    }
    var numer = distance(points[maxID] - points[minID]);
    return numer;
}

// function minDir(sketch, points) {
//     var minDirChange = Number.MAX_VALUE;
//     var minID = 0;
//     for (var i = 1; i < points.length; i++) {
//         var id1 = points[i - 1];
//         var id2 = points[i];
//         var temp = (id1.y - id2.y) / (id1.x - id2.x);
//         if (temp < miniDirChange) {
//             miniDirChange = temp;
//             minID = i;
//         }
//     }
//     return minDirChange;
// }

// function strokeLenBetweenExtreme(sketch) {
//     var strokes = sketch.strokes;
//     var maxDir = Math.max(directionChange(sketch, strokes.points));
//     var minDir = Math.min(directionChange(sketch, strokes.points));

// }

function NDDE(sketch) {
    var strokes = sketch.strokes;
    var ndde = [];
    for (var i = 0; i < strokes.length; i++) {
        var numer = single(sketch, strokes[i].points);
        var denom = strokeLen(sketch)
        ndde[i] = numer / denom;
    }
    return ndde;
}
