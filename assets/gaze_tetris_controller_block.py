# Function definition will be auto-generated based on inputs
# Expected function output: {"action": None}

def safe_get_first_list_value(my_list, default_value):
    if not isinstance(my_list, list):
        return my_list if my_list is not None else default_value
    if len(my_list) == 0:
        return default_value
    return my_list[0]

def run(self, yaw_degrees, pitch_degrees, left_threshold, right_threshold, up_threshold, down_threshold) -> BlockResult:
    # yaw means left and right
    # pitch means up and down
    # yaw and pitch come as arrays, but we only need the first value
    yaw = safe_get_first_list_value(yaw_degrees, 0)
    pitch = safe_get_first_list_value(pitch_degrees, 0) + 10 # need to correct because people often look down to their phones
    
    right_score = 0
    left_score = 0
    up_score = 0
    down_score = 0
    
    if yaw > 0 and yaw > right_threshold:
        right_score += yaw - right_threshold
    elif yaw < 0 and yaw < -left_threshold:
        left_score += abs(left_threshold + yaw)
    elif pitch > 0 and pitch > up_threshold:
        up_score += pitch - up_threshold
    elif pitch < 0 and pitch < -down_threshold:
        down_score += abs(down_threshold - pitch)
        
    if right_score == left_score == up_score == down_score:
        return { "action": "center"}
        
    # returns the action with the highest score
    if right_score > left_score and right_score > up_score and right_score > down_score:
        return { "action":"looking_right"}
    elif left_score > right_score and left_score > up_score and left_score > down_score:
        return { "action":"looking_left"}
    elif up_score > right_score and up_score > left_score and up_score > down_score:
        return { "action":"looking_up"}
    elif down_score > right_score and down_score > left_score and down_score > up_score:
        return { "action":"looking_down"}
    return { "action": "center"}