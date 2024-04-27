let arrayOfPoints = [];
    let valueOfSlideBar = 0.5;
    let savingID;
    let flagDragingAcceptable = false;
    let draggedPoint = null;

    let showBezier = false; // Added variable for bezier visibility

    const canvas = document.getElementById('bezierCanvas');
    const context = canvas.getContext('2d');

    /**
     * Function to update the slider value
     */
    function updateSlider() {
      valueOfSlideBar = parseFloat(document.getElementById('slider').value);
      cancelAnimationFrame(savingID);
      saveAllChanges();
    }

    /**
     * Function to initialize control points
     */
    function initializeArrayOfPoints() {
      // No initial points
      arrayOfPoints = [];
    }

    /**
     * Function to perform de Casteljau's algorithm for Bézier curve
     * @param {Array} points - Array of control points
     * @param {number} t - Parameter value for subdivision
     * @returns {Array} - Subdivided points
     */
    function calculateSubdivide(points, t) {
      const subdividedPoints = [];

      for (let i = 1; i < points.length; i++) {
        const prevPoint = points[i - 1];
        const currentPoint = points[i];

        const interpolatedPoint = linearInterpolation(prevPoint, currentPoint, t);
        subdividedPoints.push(interpolatedPoint);
      }

      return subdividedPoints;
    }

    /**
     * Linear interpolation function
     * @param {Object} p0 - First point
     * @param {Object} p1 - Second point
     * @param {number} t - Interpolation parameter
     * @returns {Object} - Interpolated point
     */
    function linearInterpolation(p0, p1, t) {
      return {
        x: p0.x + (p1.x - p0.x) * t,
        y: p0.y + (p1.y - p0.y) * t,
      };
    }

    /**
     * Function to draw a Bézier curve on the canvas
     * @param {CanvasRenderingContext2D} context - Canvas rendering context
     * @param {Array} arrayOfPoints - Array of control points
     */
    function drawBezier(context, arrayOfPoints) {
      if (showBezier) {
        const n = arrayOfPoints.length - 1;

        /**
         * Function to calculate the de Casteljau point
         * @param {number} t - Parameter value for subdivision
         * @param {Array} points - Array of control points
         * @returns {Object} - De Casteljau point
         */
        function deCasteljauAlgorithm(t, points) {
          const tempPoints = [...points];
          for (let r = 1; r <= n; r++) {
            for (let i = 0; i <= n - r; i++) {
              tempPoints[i] = {
                x: (1 - t) * tempPoints[i].x + t * tempPoints[i + 1].x,
                y: (1 - t) * tempPoints[i].y + t * tempPoints[i + 1].y
              };
            }
          }
          return tempPoints[0];
        }

        // Draw the control points
        context.fillStyle = "green";
        for (const point of arrayOfPoints) {
          context.beginPath();
          context.arc(point.x, point.y, 5, 0, 2 * Math.PI);
          context.fill();
        }

        // Draw the Bezier curve
        context.beginPath();
        context.strokeStyle = "black";
        context.moveTo(arrayOfPoints[0].x, arrayOfPoints[0].y);

        const step = 0.01;
        for (let t = step; t <= 1; t += step) {
          const curvePoint = deCasteljauAlgorithm(t, arrayOfPoints);
          context.lineTo(curvePoint.x, curvePoint.y);
        }

        context.stroke();
      }
    }

    /**
     * Function to draw control points
     * @param {CanvasRenderingContext2D} context - Canvas rendering context
     * @param {Array} points - Array of control points
     * @param {string} color - Color of control points
     */
    function drawArrayOfPoints(context, points, color) {
      context.fillStyle = color;
      points.forEach(point => {
        context.beginPath();
        context.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        context.fill();
      });
    }

    /**
     * Function to toggle the visibility of the Bezier curve
     */
    function toggleBezierVisibility() {
      showBezier = !showBezier; // Toggle the value
      saveAllChanges(); // Redraw the canvas with updated visibility
    }

    /**
     * Function to delete the last point
     */
    function removeLastPoint() {
      if (arrayOfPoints.length > 0) {
        arrayOfPoints.pop(); // Remove the last point
        cancelAnimationFrame(savingID);
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawBezier(context, arrayOfPoints);
        saveAllChanges();
      }
    }

    /**
 * Function to handle right-click event on the canvas
 * @param {MouseEvent} event - Mouse event
 */
function handleCanvasRightClick(event) {
  event.preventDefault(); // Prevent default right-click behavior

  // Check if there are points to delete
  if (arrayOfPoints.length > 0) {
    arrayOfPoints.pop(); // Remove the last point
    cancelAnimationFrame(savingID);
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBezier(context, arrayOfPoints);
    saveAllChanges();
  }
}

// Add event listener for right-click on canvas
canvas.addEventListener('contextmenu', handleCanvasRightClick);


    /**
     * Function to draw lines connecting points
     * @param {CanvasRenderingContext2D} context - Canvas rendering context
     * @param {Array} points - Array of points
     * @param {string} color - Color of lines
     */
    function drawLines(context, points, color) {
      context.strokeStyle = color;
      context.beginPath();
      context.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        context.lineTo(points[i].x, points[i].y);
      }

      context.stroke();
    }

    /**
     * Function to handle mouse down event on the canvas
     * @param {MouseEvent} event - Mouse event
     */
    function handleMouseDown(event) {
      const mouseX = event.clientX - canvas.getBoundingClientRect().left;
      const mouseY = event.clientY - canvas.getBoundingClientRect().top;

      // Check if the mouse is over a control point
      for (const point of arrayOfPoints) {
        const distance = Math.sqrt((mouseX - point.x) ** 2 + (mouseY - point.y) ** 2);
        if (distance <= 5) {
          flagDragingAcceptable = true;
          draggedPoint = point;
          break;
        }
      }
    }

    /**
     * Function to handle mouse move event on the canvas
     * @param {MouseEvent} event - Mouse event
     */
    function handleMouseMove(event) {
      if (flagDragingAcceptable && draggedPoint) {
        draggedPoint.x = event.clientX - canvas.getBoundingClientRect().left;
        draggedPoint.y = event.clientY - canvas.getBoundingClientRect().top;
        cancelAnimationFrame(savingID);
        saveAllChanges();
      }
    }

    /**
     * Function to handle mouse up event on the canvas
     */
    function handleMouseUp() {
      if (flagDragingAcceptable) {
        flagDragingAcceptable = false;
        draggedPoint = null;
        cancelAnimationFrame(savingID);
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawBezier(context, arrayOfPoints);
        removeLastPoint();
        saveAllChanges();
      }
    }

    /**
     * Function to handle mouse click event on the canvas
     * @param {MouseEvent} event - Mouse event
     */
    function handleCanvasClick(event) {
      const mouseX = event.clientX - canvas.getBoundingClientRect().left;
      const mouseY = event.clientY - canvas.getBoundingClientRect().top;

      // Add a new control point
      arrayOfPoints.push({ x: mouseX, y: mouseY });

      drawBezier(context, arrayOfPoints);

      // Cancel animation and redraw
      cancelAnimationFrame(savingID);
      saveAllChanges();
    }

    /**
     * Function to save the changes
     */
    function saveAllChanges() {
      // Draw control points and lines
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawArrayOfPoints(context, arrayOfPoints, 'green');
      drawLines(context, arrayOfPoints, 'green');

      if (arrayOfPoints.length > 1) {
        // Subdivide the curve and draw the subdivided curves
        const t = valueOfSlideBar;
        let currentPoints = [...arrayOfPoints];

        while (currentPoints.length > 1) {
          currentPoints = calculateSubdivide(currentPoints, t);
          drawBezier(context, arrayOfPoints, 'green');
          drawArrayOfPoints(context, currentPoints, 'orange');
          drawLines(context, currentPoints, 'gray');
        }
        drawArrayOfPoints(context, currentPoints, 'yellow');
      }

      savingID = requestAnimationFrame(saveAllChanges);
    }

    // Add event listeners for canvas interactions
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('click', handleCanvasClick);

    // Initialize control points and run the example when the page is loaded
    initializeArrayOfPoints();
    drawBezier(context, arrayOfPoints);
    saveAllChanges();

    /**
     * Function to reset the canvas by removing all points
     */
    function removeAll() {
      arrayOfPoints = [];
      cancelAnimationFrame(savingID);
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    /**
     * Function to update the instructions text
     */
    function updateInstructions() {
      const instructionsDiv = document.getElementById('instructions');
      instructionsDiv.innerHTML = `
        <p><b>User guide:</b></p>
      <ul>
        <li><b>You can add a control point for the bezier curve by clicking the left mouse button.</b></li>
        <li><b>By moving the slider to the left and right, you can visualize how the subdivision changes based on its value.</b></li>
        <li><b>You can hold the mouse with the left button on the last added point to drag and change its current position.</b></li>
        <li><b>Note that you can change the position of the last added point only!</b></li>
        <li><b>You can delete all the points by clicking the button with the label "Remove All".</b></li>
        </ul>
      `;
    }

    // Call the function to initially set the instructions
    updateInstructions();

    /**
     * Function to update the labels of the slider
     */
    function updateSliderLabels() {
      const slider = document.getElementById('slider');
      const minValueLabel = document.getElementById('minValue');
      const currentValueLabel = document.getElementById('currentValue');
      const maxValueLabel = document.getElementById('maxValue');

      minValueLabel.textContent = `Min Value: ${slider.min}`;
      currentValueLabel.textContent = `Current Value: ${slider.value}`;
      maxValueLabel.textContent = `Max Value: ${slider.max}`;
    }

    /**
     * Function to update the slider value and trigger animation
     */
    function updateSlider() {
      const slider = document.getElementById('slider');
      valueOfSlideBar = parseFloat(slider.value);
      cancelAnimationFrame(savingID);
      saveAllChanges();

      updateSliderLabels();
    }

    // Call the function to initially set the slider value
    updateSlider();