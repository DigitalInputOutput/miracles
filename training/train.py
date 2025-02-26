import numpy as np
import tensorflow as tf
from tflite_model_maker import model_spec
from tflite_model_maker import object_detector
from tflite_model_maker.config import QuantizationConfig
from tflite_model_maker.config import ExportFormat


# Load the dataset
train_data = object_detector.DataLoader.from_pascal_voc(
    'images',
    'annotations',
    label_map = {1: 'rechnung'}
)

# Specify the model
spec = model_spec.get('efficientdet_lite0')

# Train the model
model = object_detector.create(train_data, model_spec=spec, epochs=50, batch_size=1)

# # Evaluate the model
# val_data = object_detector.DataLoader.from_pascal_voc(
#     'images/val',
#     'path/to/val/annotations',
#     label_map={'white_paper': 1}
# )
# model.evaluate(val_data)

# Export the model
model.export(export_dir='.')