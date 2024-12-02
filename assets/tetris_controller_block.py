def get_face_direction(detections):
    try:
        # Check if we have valid detections
        if not hasattr(detections, 'xyxy') or len(detections.xyxy) == 0:
            return "unknown-1", {}  # No valid detections
            
        # Get all arrays we need
        boxes = detections.xyxy  # [x1, y1, x2, y2]
        confidences = detections.confidence
        class_ids = detections.class_id
        
        if confidences is None or class_ids is None:
            return "unknown-2", {}  # Missing required attributes

        # Initialize arrays to store features
        eyes = []
        mouth = None
        nose = None
        # Filter and categorize detections
        MIN_CONFIDENCE = 0.3
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
                    return "looking_right", {}  # Only left eye visible
                else:
                    return "looking_left", {}   # Only right eye visible
            else:
                # No mouth but one eye - can infer from eye position relative to image center
                image_width = detections.metadata.get('width', 1686)  # Default from example
                image_center = image_width / 2
                if eyes[0]["x"] < image_center:
                    return "looking_right", {}  # Left eye visible
                else:
                    return "looking_left", {}   # Right eye visible
                
        if not mouth and not nose:
            # No mouth or nose - can infer from eye position relative to image center
            image_width = detections.metadata.get('width', 1686)  # Default from example
            image_center = image_width / 2
            if eyes[0]["x"] < image_center:
                return "looking_right", {}  # Left eye visible
            else:
                return "looking_left", {}   # Right eye visible

        # Sort eyes from left to right
        eyes.sort(key=lambda x: x["x"])
        left_eye, right_eye = eyes[:2]

        # Calculate eye midpoints
        eye_midpoint_x = (left_eye["x"] + right_eye["x"]) / 2
        eye_midpoint_y = (left_eye["y"] + right_eye["y"]) / 2
        
        # Calculate eye distance as our reference unit
        eye_distance = abs(right_eye["x"] - left_eye["x"])
        
        # Constants for detection
        EYE_RATIO_THRESHOLD = 1.3  # Keep the original threshold that worked well
        
        # Create debug info dictionary
        debug_info = {
            "eye_width_ratio": None,
            "vertical_ratio": None,
            "eye_to_nose": None,
            "nose_to_mouth": None,
            "total_face_height": None,
            "nose_ratio": None,
            "mouth_ratio": None,
            "features_found": {
                "eyes": len(eyes),
                "nose": nose is not None,
                "mouth": mouth is not None
            }
        }

        # First check left/right based on eye width ratio
        eye_width_ratio = right_eye["width"] / left_eye["width"]
        debug_info["eye_width_ratio"] = eye_width_ratio

        if eye_width_ratio > EYE_RATIO_THRESHOLD:
            return "looking_right", debug_info
        elif eye_width_ratio < 1/EYE_RATIO_THRESHOLD:
            return "looking_left", debug_info

        # If we have both nose and mouth, use their relative positions
        if nose and mouth:
            eye_to_nose = abs(nose["y"] - eye_midpoint_y)
            nose_to_mouth = abs(mouth["y"] - nose["y"])
            total_face_height = abs(mouth["y"] - eye_midpoint_y)
            vertical_ratio = eye_to_nose / nose_to_mouth

            debug_info.update({
                "vertical_ratio": vertical_ratio,
                "eye_to_nose": eye_to_nose,
                "nose_to_mouth": nose_to_mouth,
                "total_face_height": total_face_height
            })

            # Adjusted thresholds based on real data
            if vertical_ratio < 0.25:  # Looking up threshold is good
                return "looking_up", debug_info
            elif vertical_ratio > 0.4:  # Lowered from 0.6 to catch the 0.44 case
                return "looking_down", debug_info
            elif 0.3 < vertical_ratio < 0.4:  # Adjusted center range
                return "center", debug_info

        elif nose:
            nose_ratio = (nose["y"] - eye_midpoint_y) / eye_distance
            debug_info["nose_ratio"] = nose_ratio

            if nose_ratio < 0.25:
                return "looking_up", debug_info
            elif nose_ratio > 0.45:  # Adjusted to match main threshold
                return "looking_down", debug_info
            elif 0.3 < nose_ratio < 0.4:
                return "center", debug_info

        elif mouth:
            mouth_ratio = (mouth["y"] - eye_midpoint_y) / eye_distance
            debug_info["mouth_ratio"] = mouth_ratio

            if mouth_ratio < 0.7:
                return "looking_up", debug_info
            elif mouth_ratio > 1.0:  # Lowered from 1.2
                return "looking_down", debug_info
            elif 0.7 < mouth_ratio < 0.9:
                return "center", debug_info

        return "center", debug_info

    except Exception as e:
        print(f"Error in get_face_direction: {str(e)}")
        return f"unknown-9: {str(e)}", {"error": str(e)}

def run(self, predictions) -> BlockResult:
    action, debug_info = get_face_direction(predictions)
    return {
        'action': action,
        'debug_info': debug_info
    }
