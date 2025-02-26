import tensorflow as tf
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# Load the TFLite model and allocate tensors
interpreter = tf.lite.Interpreter(model_path="model.tflite")
interpreter.allocate_tensors()

# Get input and output tensor details
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Function to preprocess images
def preprocess_image(image_path, input_shape):
    image = Image.open(image_path).resize((input_shape[1], input_shape[2]))
    image = np.array(image, dtype=np.uint8)  # Ensure the data type is UINT8
    image = np.expand_dims(image, axis=0)  # Add batch dimension
    return image

# Load and preprocess the new image
image_path = "training/IMG_20240526_150923.jpg"
input_data = preprocess_image(image_path, input_details[0]['shape'])

# Run inference
interpreter.set_tensor(input_details[0]['index'], input_data)
interpreter.invoke()

# Get the output data
output_data = interpreter.get_tensor(output_details[0]['index'])

# Debugging: Print the shape and values of the output data
print(f"Output data shape: {output_data.shape}")
print(f"Output data: {output_data}")

# Assuming the output is a confidence score for 25 classes
# Find the class with the highest confidence
predicted_class = np.argmax(output_data[0])
confidence_score = output_data[0][predicted_class]

print(f"Predicted class: {predicted_class}, Confidence score: {confidence_score}")

# Load the original image
original_image = Image.open(image_path)

# Draw the prediction on the image
draw = ImageDraw.Draw(original_image)
font = ImageFont.load_default()
text = f"Class: {predicted_class}, Confidence: {confidence_score:.2f}"
text_size = draw.textsize(text, font=font)
text_location = (10, 10)

# Draw text background rectangle
draw.rectangle([text_location, (text_location[0] + text_size[0], text_location[1] + text_size[1])], fill="black")
# Draw text
draw.text(text_location, text, fill="white", font=font)

# Save and show the image with prediction
result_image_path = "result_image.png"
original_image.save(result_image_path)
print(f"Result image saved to {result_image_path}")

# Display the image
original_image.show()