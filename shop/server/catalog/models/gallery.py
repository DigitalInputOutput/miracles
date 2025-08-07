# -*- coding: utf-8 -*-
import logging
from django.db import models
from .product import Product
from django.utils import timezone
from PIL import Image, ImageEnhance, UnidentifiedImageError
from system.settings import CACHE_FOLDER,NO_IMAGE_PLACEHOLDER,WATERMARK,HOME_DIR
import os
from django.utils.translation import gettext_lazy as _
import subprocess

try:
    from settings import WOTERMARK_SIZE, WOTERMARK_OPACITY
except:
    WOTERMARK_SIZE = None
    WOTERMARK_OPACITY = 0.3

logger = logging.getLogger(__name__)

class AbstractGallery(models.Model): 
    product = models.ForeignKey(Product, related_name = 'gallery', on_delete=models.CASCADE)
    image = models.ImageField(max_length=255,upload_to='products/%Y/%m/%d', blank=True,verbose_name=_('Image'))
    position = models.PositiveIntegerField(default=0,verbose_name=_('Ordering number'),blank=True)
    last_modified = models.DateTimeField(auto_now_add=True)

    size = {
        'list_thumb':260,
        'mobile_list_thumb':180,
        'admin_thumb':120,
        'cart_thumb':100,
        'mini_thumb':85,
        'large_thumb':800,
        'preview_thumb':288,
        'home_thumb':400,
        'checkout_thumb':50,
        'big_thumb':800,
        'gallery_thumb':300,
        'hd_thumb':1280
    }

    def __getattr__(self, name):
        if name in self.size:
            return self.get_thumb(name)
        return super().__getattribute__(name)

    def get_thumb(self, size_name):
        size_px = self.size.get(size_name)

        if not size_px:
            return NO_IMAGE_PLACEHOLDER

        try:
            thumb = self.thumb.get(size=size_px)
            full_path = os.path.join(CACHE_FOLDER, thumb.url.lstrip('/'))
            if os.path.isfile(full_path):
                return thumb.url
            else:
                return self.generate_thumb(size_px, path=thumb.url)
        except self.thumb.model.DoesNotExist:
            return self.generate_thumb(size_px)
        except Exception as e:
            logger.warning(f"Failed to load or generate thumbnail {size_name}: {e}")
            return NO_IMAGE_PLACEHOLDER

    def generate_thumb(self, size, path=None):
        try:
            image = Image.open(self.image)
        except UnidentifiedImageError:
            image_path = str(HOME_DIR / self.image.url.lstrip('/'))
            subprocess.run(['magick', image_path, '-strip', '-interlace', 'Plane' ,'-quality', '85', image_path])
            logger.warning(f'File was fixed: {image_path}')
            image = Image.open(image_path)
        except FileNotFoundError as e:
            logger.error(f"File not found: {e}")
            return NO_IMAGE_PLACEHOLDER

        if image.mode in ('RGBA', 'LA'):
            bg = Image.new('RGB', image.size, (255, 255, 255))
            bg.paste(image, mask=image.split()[-1])
            image = bg
        else:
            image = image.convert('RGB')

        if size > 270:
            image = self.apply_watermark(image)

        image.thumbnail((size, size))
        path = path or self.get_thumb_path(size)
        full_path = os.path.join(CACHE_FOLDER, path.lstrip('/'))

        os.makedirs(os.path.dirname(full_path), exist_ok=True)

        try:
            image.save(full_path, 'JPEG', quality=80)
        except Exception as e:
            logger.error(f"Thumbnail saving failed: {e}")
            return NO_IMAGE_PLACEHOLDER

        self.thumb.create(url=path, size=size)
        return path

    def get_thumb_path(self, size):
        name = f'{self.product.url}-{size}x{size}'
        if self.position and self.position > 1:
            name += f'-{self.position}'
        path = f'/images/{name[0]}/{name[1]}/{name}.jpg'

        return path
    
    def apply_watermark(self, image):
        try:
            watermark = Image.open(WATERMARK).convert('RGBA')
            if WOTERMARK_SIZE:
                watermark.thumbnail((WOTERMARK_SIZE, WOTERMARK_SIZE))

            alpha = watermark.split()[3]
            alpha = ImageEnhance.Brightness(alpha).enhance(WOTERMARK_OPACITY)
            watermark.putalpha(alpha)

            square = Image.new('RGBA', image.size, (0, 0, 0, 0))
            pos = WOTERMARK_SIZE if WOTERMARK_SIZE else int((image.size[0] - watermark.size[0]) / 2)
            square.paste(watermark, (pos, pos))

            return Image.alpha_composite(image.convert('RGBA'), square).convert('RGB')
        except Exception as e:
            logger.warning(f"Watermark failed: {e}")
            return image

    def save(self, *args, **kwargs):
        self.last_modified = timezone.now()
        if not self.position:
            self.set_next_position()
        super().save(*args, **kwargs)

    def set_next_position(self):
        existing = self.product.gallery.exclude(position=None).order_by('-position').first()
        self.position = existing.position + 1 if existing else 1

    def url(self):
        return self.image.url

    def __str__(self):
        return self.preview_thumb or ''

    class Meta:
        abstract = True

class Gallery(AbstractGallery): 
    class Meta:
        verbose_name = _('Image')
        verbose_name_plural = _('Image')
        ordering = ['position']

class Thumb(models.Model): 
    url = models.CharField(max_length=255)
    image = models.ForeignKey(Gallery,related_name='thumb', on_delete=models.CASCADE)
    size = models.PositiveIntegerField()

    def __str__(self):
        return self.url