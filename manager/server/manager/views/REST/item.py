from rest_framework import viewsets
from rest_framework import permissions
from manager.serializers import ItemSerializer
from checkout.models import Item

class ItemViewSet(viewsets.ModelViewSet): 
    queryset = Item.objects.all()[:10]
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]