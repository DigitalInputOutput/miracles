from PIL import Image
from datetime import datetime
# from system.settings import MINIFIED_OUTPUR_DIR

class SpriteGeneratorService: 

    @staticmethod
    def generate_sprite(images, sprite_path, css_template, sprite_size=64, padding=20):
        # Create a blank image for the sprite
        total_width = (sprite_size + padding) * len(images)
        result_image = Image.new("RGBA", (total_width, sprite_size), (0, 0, 0, 0))

        # Create CSS for the sprite
        result_css = ""
        x_position = 0
        for img_id, img_data in images.items():
            img = img_data['image']
            result_image.paste(img, (x_position, 0))
            result_css += css_template.format(id=img_id, x=-x_position, bgcolor=img_data['bgcolor'])
            x_position += sprite_size + padding

        result_image.save(sprite_path)
        return result_css

    # Modify your method to handle the sprite icon generation
    @staticmethod
    def generate_and_save_sprites():
        images = {1: {'bgcolor': '#fff', 'image': Image.new("RGBA", (64, 64), (255, 0, 0, 0))}}
        sprite_path = f'{MINIFIED_OUTPUR_DIR}/sprite_{datetime.now().strftime("%Y%m%d%H%M%S")}.png'
        css_template = ".sprite-{id} {{background-position: {x}px 0; background-color: {bgcolor};}}"
        css_result = SpriteGeneratorService.generate_sprite(images, sprite_path, css_template)

        with open(f'{MINIFIED_OUTPUR_DIR}/sprite.css', 'w') as f:
            f.write(css_result)