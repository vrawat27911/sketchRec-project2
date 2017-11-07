var DrawSketch = {

    drawPoints: function (points) {

        
        for (var property in points) {
            if(points.hasOwnProperty(property)){
                var ctx = document.getElementById('sketchCanvas').getContext("2d");
                ctx.fillStyle = "#ff2626"; // Red color
                ctx.beginPath(); //Start path.
                //console.log(points[property].x+" : "+points[property].y);
                ctx.arc(points[property].x,points[property].y, 3, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
                ctx.fill(); // Close the path and fill.
            }	
            
        }
    }

}