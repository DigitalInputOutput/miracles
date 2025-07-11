"""
Django settings for rocket project.

Generated by 'django-admin startproject' using Django 1.11.4.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.11/ref/settings/
"""
DOMAIN = 'https://m.miracles.site'

ADMIN_BASE_URL = 'http://manager.miracles.site'

import os, pymysql, sys
pymysql.install_as_MySQLdb()

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

BIG_OPT_TOTAL = 5000

GOOGLE_SITE_VERIFICATION = "ec5D0njy3L_Jwfg7O7iCUJWwL6Hq3_6LhwN3UtuRYxw"
GOOGLE_TAG = "GTM-TKRK5TV"
GOOGLE_ANALYTICS = "UA-28630562-1"

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.11/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '7fqe!*lzrarw&hht2f3^*9=mc$h9x_qb&@)2j@8d!!p-z*&y!k'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['m.miracles.site']
BASE_URL = 'm.miracles.site'
PROTOCOL = 'https'

# Application definition

INSTALLED_APPS = [
    'cart',
    'blog',
    'shop',
    'user',
    'catalog',
    'checkout',
    'mptt',
    'redactor',
    'mobile',
    # 'django.contrib.admin',
    # 'django.contrib.auth',
    'django.contrib.contenttypes',
    # 'django.contrib.sessions',
    'django.contrib.messages',
    # 'django.contrib.staticfiles',
]

MIDDLEWARE = [
    'mobile.middleware.session.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'mobile.middleware.auth.AuthenticationMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'mobile.middleware.login.Login'
]

ROOT_URLCONF = 'system.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': (
        ),
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'mobile.context.auth',
            ],
        },
    },
]

WSGI_APPLICATION = 'system.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'HOST': '127.0.0.1',
        'NAME': 'miracles_db',
        'USER': 'miracles_user',
        'PASSWORD': 'S53zpC9zHseSKczw',
        'OPTIONS': {
            'sql_mode': 'STRICT_TRANS_TABLES',
        }
    }
}


# Password validation
# https://docs.djangoproject.com/en/1.11/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/1.11/topics/i18n/

LANGUAGE_CODE = 'ru-RU'

TIME_ZONE = 'Europe/Kiev'

USE_I18N = True

USE_L10N = True

USE_TZ = False

from django.utils.translation import gettext_lazy as _

LANGUAGES = (
    ('en', _('English')),
    ('en-US', _('English')),
    ('ru', _('Русский')),
    ('ru-RU', _('Русский')),
)

#dict of possible language keys
AVAIL_LANGUAGES = {
    'en':'en',
    'en-US':'en',
    'ru':'ru',
    'ru-RU':'ru'
}

LOCALE_PATHS = (
    os.path.join(BASE_DIR, 'locale'),
)
LANGUAGE_SESSION_KEY = 'lang'

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.11/howto/static-files/

STATIC_ROOT = '/home/petrov/miracles.site/static/'
STATIC_URL = '/static/'

MEDIA_ROOT = '/hdd/media/'
MEDIA_URL = '/media/'

AUTH_USER_MODEL = 'mobile.User'
WATERMARK = STATIC_ROOT + 'wotermark1.png'

CACHE_FOLDER = ''
HOME_DIR = ''

NO_IMAGE_PLACEHOLDER = '/media/no_image.jpg'

CSS_BUILD = 42
JS_BUILD = 42

LIQPAY_PUBLIC = "i37448149195"
LIQPAY_PRIVATE = "xXmCQUpT7emK2HywF5grJdbDnHnzFyKjpNUTF3s0"
from django.utils.translation import gettext_lazy as _

OUT_OF_STOCK_MESSAGE = _('Под заказ (1-3 дня)')
OUT_OF_STOCK_MESSAGE_HTML = _('<span class="outstock">Под заказ (1-3 дня)</span>')

SPRITE_CATEGORIES = False

STORAGE_CHOICES = ((1,'Игротека'),(2,'Велис'),(3,'Тигрес'))

OUT_OF_STOCK_MESSAGE = _('Под заказ (1-3 дня)')
OUT_OF_STOCK_MESSAGE_HTML = _('<span class="outstock">Под заказ (1-3 дня)</span>')

PHONES = ["(096) 443-47-58","(066) 176-87-17","(093) 742-90-75","(057) 781-72-90"]

ADDRESS = _("Харьков ул. Тюринская 147")
COMPANY_NAME = _("Игротека")