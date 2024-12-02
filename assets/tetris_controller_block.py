def get_face_direction(detections):
    try:
        # Check if we have valid detections
        if not hasattr(detections, 'xyxy') or len(detections.xyxy) == 0:
            return "unknown-1"  # No valid detections
            
        # Get all arrays we need
        boxes = detections.xyxy  # [x1, y1, x2, y2]
        confidences = detections.confidence
        class_ids = detections.class_id
        
        if confidences is None or class_ids is None:
            return "unknown-2"  # Missing required attributes

        # Initialize arrays to store features
        eyes = []
        mouth = None
        nose = None
        # Filter and categorize detections
        MIN_CONFIDENCE = 0.4
        for i, (box, conf, class_id) in enumerate(zip(boxes, confidences, class_ids)):
            if conf < MIN_CONFIDENCE:
                continue
                
            x1, y1, x2, y2 = box
            width = x2 - x1
            height = y2 - y1
            center_x = (x1 + x2) / 2
            center_y = (y1 + y2) / 2
            
            feature = {
                "x": center_x,
                "y": center_y,
                "width": width,
                "height": height,
                "confidence": conf
            }
            
            # Assuming class_id 0 is eye and 1 is mouth
            if class_id == 0:  # eye
                eyes.append(feature)
            elif class_id == 1:  # mouth
                mouth = feature
            elif class_id == 2:  # nose
                nose = feature

        if len(eyes) == 1:
            if mouth or nose:
                # Compare eye position with mouth or nose to determine if it's left or right eye
                face_center = mouth["x"] if mouth else nose["x"]
                if eyes[0]["x"] < face_center:
                    return "looking_right"  # Only left eye visible
                else:
                    return "looking_left"   # Only right eye visible
            else:
                # No mouth but one eye - can infer from eye position relative to image center
                image_width = detections.metadata.get('width', 1686)  # Default from example
                image_center = image_width / 2
                if eyes[0]["x"] < image_center:
                    return "looking_right"  # Left eye visible
                else:
                    return "looking_left"   # Right eye visible
                
        if not mouth and not nose:
            # No mouth or nose - can infer from eye position relative to image center
            image_width = detections.metadata.get('width', 1686)  # Default from example
            image_center = image_width / 2
            if eyes[0]["x"] < image_center:
                return "looking_right"  # Left eye visible
            else:
                return "looking_left"   # Right eye visible

        # Sort eyes from left to right
        eyes.sort(key=lambda x: x["x"])
        left_eye, right_eye = eyes[:2]

        # Calculate eye midpoints first!
        eye_midpoint_x = (left_eye["x"] + right_eye["x"]) / 2
        eye_midpoint_y = (left_eye["y"] + right_eye["y"]) / 2

        # Calculate relative positions and ratios
        eye_width_ratio = right_eye["width"] / left_eye["width"]
        
        # Calculate vertical distances relative to eye distance
        eye_distance = abs(right_eye["x"] - left_eye["x"])  # Use this as our base unit
        
        if mouth:
            # Normalize vertical and horizontal offsets by eye distance
            mouth_vertical_ratio = (mouth["y"] - eye_midpoint_y) / eye_distance
            mouth_horizontal_ratio = abs(mouth["x"] - eye_midpoint_x) / eye_distance
        
        if nose:
            nose_vertical_ratio = (nose["y"] - eye_midpoint_y) / eye_distance
            nose_horizontal_ratio = abs(nose["x"] - eye_midpoint_x) / eye_distance

        # Relative thresholds
        EYE_RATIO_THRESHOLD = 1.3  # This is already relative
        HORIZONTAL_RATIO_THRESHOLD = 0.4  # Horizontal offset should be less than 40% of eye distance
        VERTICAL_RATIO_MIN = 0.9  # Increased from 0.8 to make looking_up more sensitive
        VERTICAL_RATIO_MAX = 1.6  # Increased from 1.4 to make looking_down less sensitive
        CENTER_RATIO = 1.2  # Adjusted from 1.1 based on typical face proportions
        CENTER_TOLERANCE = 0.25  # Increased from 0.2 to make center detection more stable

        # Debug prints
        print(f"Debug - Eye distance: {eye_distance}")
        if mouth:
            print(f"Debug - Mouth vertical ratio: {mouth_vertical_ratio}")
            print(f"Debug - Mouth horizontal ratio: {mouth_horizontal_ratio}")
        if nose:
            print(f"Debug - Nose vertical ratio: {nose_vertical_ratio}")
            print(f"Debug - Nose horizontal ratio: {nose_horizontal_ratio}")

        # Determine direction based on relative positions
        if eye_width_ratio > EYE_RATIO_THRESHOLD:
            return "looking_right"
        elif eye_width_ratio < 1/EYE_RATIO_THRESHOLD:
            return "looking_left"
        
        # Check vertical direction using mouth if available
        if mouth:
            if abs(mouth_vertical_ratio - CENTER_RATIO) < CENTER_TOLERANCE:
                return "center"
            if mouth_vertical_ratio < VERTICAL_RATIO_MIN:
                return "looking_up"
            if mouth_vertical_ratio > VERTICAL_RATIO_MAX:
                return "looking_down"
            if mouth_horizontal_ratio > HORIZONTAL_RATIO_THRESHOLD:
                return "looking_left" if mouth["x"] < eye_midpoint_x else "looking_right"
        
        # If no mouth, try using nose
        if nose:
            if abs(nose_vertical_ratio - CENTER_RATIO) < CENTER_TOLERANCE:
                return "center"
            if nose_vertical_ratio < VERTICAL_RATIO_MIN:
                return "looking_up"
            if nose_vertical_ratio > VERTICAL_RATIO_MAX:
                return "looking_down"
            if nose_horizontal_ratio > HORIZONTAL_RATIO_THRESHOLD:
                return "looking_left" if nose["x"] < eye_midpoint_x else "looking_right"

        return "center"

    except Exception as e:
        print(f"Error in get_face_direction: {str(e)}")
        return f"unknown-9: {str(e)}"

# --- Cant change that! This is needed for the workflow to work
# Function definition will be auto-generated based on inputs
# Expected function output: {"action": None}
def run(self, predictions) -> BlockResult:
    # Todo: write your code here
    return { 'action': get_face_direction(predictions) }
