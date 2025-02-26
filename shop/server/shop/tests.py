from django.test import TestCase
from manager.views import route
from base64 import b64encode
from manager.requests import GET,POST


# with open('/home/dd/iu-73.jpeg','rb') as f:
#     image_data = {'image':b64encode(f.read()).decode('utf-8')}

class RouterTestCase(TestCase): 
    def setUp(self):
        pass

    def setup_databases(self, **kwargs):
        """ Override the database creation defined in parent class """
        pass

    def teardown_databases(self, old_config, **kwargs):
        """ Override the database teardown defined in parent class """
        pass

    def test_animals_can_speak(self):
        """Animals that can speak are correctly identified"""
        
        self.assertEqual(GET('/'),"ok")
        # self.assertEqual(POST('/signin',json=signin_data),"ok")
        # # self.assertEqual(POST('/phone/signin',json=signin_data),"ok")
        # # self.assertEqual(POST('/phone/sms_check',json=sms_data),"ok")
        # # self.assertEqual(POST('/signup',json=signup_data),"ok")
        # # self.assertEqual(POST('/user/update',json=update_data),"ok")
        # # self.assertEqual(POST('/user/update_image',json=image_data),"ok")
        # self.assertEqual(GET('/user/qr'),"ok")
        # # self.assertEqual(GET('/user/'),"ok")
        # # self.assertEqual(POST('/user/feedback',json=feedback),"ok")
        # self.assertEqual(POST('/user/notifications',json={}),"ok")
        # self.assertEqual(POST('/user/notifications/21',json={}),"ok")
        # # self.assertEqual(POST('/user/notification/1',json={}),"ok")
        # # self.assertEqual(POST('/user/notifications',json={'page':10}),"ok")
        # # self.assertEqual(POST('/user/notifications',json={}),"ok")


        # self.assertEqual(GET('/user/signout'),"ok")