const origin = "^(?<origin>(http(s)?)://[a-zа-я0-9.-]+)?/"

export const default_urlpatterns = {
    "^\\?(?<filters>[\\s\\S]*)$": {"GET": "ReloadList", "POST": "ReloadList"},
    [`${origin}(?<AdminModel>[A-Z][a-z]+)/(?<id>[0-9]+)?(?:#(?<anchor>[a-z]+))?`]: {"GET": "Edit"},
    [`${origin}(?<AdminModel>[A-Z][a-z]+)(\\?(?<filters>[\s\S]*))?`]: {"GET": "List", "POST": "ReloadList"},
    [`${origin}$`]: {"GET": "Settings"},
};