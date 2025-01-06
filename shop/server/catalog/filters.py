from ast import literal_eval

def clean_filters(request,category_id,model=None):
    """check filter values by parameters"""

    data = request.GET.copy()

    parameters = {
        'filters':(
            {'name':'brand__id__in','type':list,'validate':int},
            {'name':'category__in','type':list,'validate':int},
            {'name':'brand','type':int,'validate':int},
            {'name':'description__new__text__icontains','type':str},
            {'name':'description__new__name__icontains','type':str},
            {'name':'model__icontains','type':str},
            {'name':'retail_price__gte','type':int},
            {'name':'retail_price__lte','type':int}
        ),
        'and_filters':(
            {'name':'attributes__id','type':list,'validate':int},
        ),
        'exclude':(
            {'name':'storage__in','type':list,'validate':int},
        )
    }

    page = int(data.get('page') or 1)
    ordering = data.get('ordering')
    ordering = ordering if ordering in ('retail_price','-retail_price') else None

    for key in parameters.keys():
        globals()[key] = {}

        for i in parameters[key]:
            item = data.get(i['name'])
            if item:
                item = literal_eval(item)
                if i['type'] is list:
                    item = [i['validate'](j) for j in item]

                globals()[key][i['name']] = item


    filters.update({
        'category__id':category_id,
        'is_available':True
    })

    if request.user.is_opt:
        filters['storage'] = 1

    return filters,and_filters,exclude,ordering,page