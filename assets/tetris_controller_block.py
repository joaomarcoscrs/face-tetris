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

        # Calculate relative positions
        eye_midpoint_x = (left_eye["x"] + right_eye["x"]) / 2
        mouth_x = mouth["x"] if mouth else None
        nose_x = nose["x"] if nose else None
        eye_midpoint_y = (left_eye["y"] + right_eye["y"]) / 2
        mouth_y = mouth["y"] if mouth else None
        nose_y = nose["y"] if nose else None
        
        face_center_x = mouth_x if mouth_x else nose_x

        # Calculate ratios and offsets
        eye_width_ratio = right_eye["width"] / left_eye["width"]
        horizontal_offset = abs(face_center_x - eye_midpoint_x)
        mouth_vertical_offset = mouth_y - eye_midpoint_y if mouth_y else None
        nose_vertical_offset = nose_y - eye_midpoint_y if nose_y else None

        # Thresholds
        EYE_RATIO_THRESHOLD = 1.4
        HORIZONTAL_OFFSET_THRESHOLD = 50
        MOUTH_VERTICAL_OFFSET_MIN = 90
        MOUTH_VERTICAL_OFFSET_MAX = 140
        NOSE_VERTICAL_OFFSET_MIN = 90
        NOSE_VERTICAL_OFFSET_MAX = 140

        # Determine direction based on feature positions
        if eye_width_ratio > EYE_RATIO_THRESHOLD:
            return "looking_left"
        elif eye_width_ratio < 1/EYE_RATIO_THRESHOLD:
            return "looking_right"
        elif horizontal_offset > HORIZONTAL_OFFSET_THRESHOLD:
            return "looking_right" if mouth_x < eye_midpoint_x else "looking_left"
        elif mouth_vertical_offset and (mouth_vertical_offset < MOUTH_VERTICAL_OFFSET_MIN or mouth_vertical_offset > MOUTH_VERTICAL_OFFSET_MAX):
            return "looking_up" if mouth_vertical_offset < MOUTH_VERTICAL_OFFSET_MIN else "looking_down"
        elif nose_vertical_offset and (nose_vertical_offset < NOSE_VERTICAL_OFFSET_MIN or nose_vertical_offset > NOSE_VERTICAL_OFFSET_MAX):
            return "looking_up" if nose_vertical_offset < NOSE_VERTICAL_OFFSET_MIN else "looking_down"
        else:
            return "center"

    except Exception as e:
        print(f"Error in get_face_direction: {str(e)}")
        return f"unknown-9: {str(e)}"  # Unexpected error with details

# --- Cant change that! This is needed for the workflow to work
# Function definition will be auto-generated based on inputs
# Expected function output: {"action": None}
def run(self, predictions) -> BlockResult:
    # Todo: write your code here
    return { 'action': get_face_direction(predictions) }
