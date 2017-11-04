var Features = {

    evaluateFeatures: function (sketch) {

        // get corners
        // ndde
        // dcr
        //triangle detection

        var corners = this.displayCornerFindingShortStraw(sketch);
        var corners2 = this.displayCornerFindingIStraw(sketch);
        console.log(corners);
        console.log(corners2);
        DrawSketch.drawPoints(corners2, "#0000ff");
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
        var isPolyline = true;
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
        console.log(isPolyline);
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
            console.log(dist / totalLen);
            isStr = isStr && (dist / totalLen >= 0.95);
        }
        return isStr;
    },

    printDist: function (corners) {
        for (var i = 0; i < corners.length; i++) {
            for (var j = i + 1; j < corners.length; j++) {
                var d = Math.sqrt(Math.pow(corners[i].x - corners[j].x, 2) + Math.pow(corners[i].y - corners[j].y, 2));
                console.log(d);
                if (d < 30)
                    corners.splice(j--, 1);
            }
        }
        return corners;
    },
    triangle: function (sketch) {

    }



}
