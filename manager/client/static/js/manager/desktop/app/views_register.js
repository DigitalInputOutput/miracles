import { View } from "/static/js/vanilla/http/view.js";

import { Login } from "./views/login.js";
import { Logout } from "./views/logout.js";
import { ProductList } from "./views/list/product.js";
import { CategoryList } from "./views/list/category.js";
import { CategoryEdit } from "./views/edit/category.js";
import { ProductEdit } from "./views/edit/product.js";
import { LanguageEdit } from "./views/edit/language.js";
import { OrderList } from "./views/list/order.js";
import { OrderEdit } from "./views/edit/order.js";
import { Settings } from "./views/list/settings.js";
import { List } from "/static/js/manager/desktop/app/views/base/list.js";
import { Edit } from "/static/js/manager/desktop/app/views/base/edit.js";

/* Register views using their class names */
[
    ProductList,
    ProductEdit,
    CategoryList,
    CategoryEdit,
    OrderList,
    OrderEdit,
    LanguageEdit,
    List,
    Edit,
    Login,
    Logout,
    Settings
].forEach(viewClass => View.register(viewClass));
