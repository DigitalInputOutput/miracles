import { View } from "../vanilla/http/view.js";

import { Login } from "./views/login.js";
import { ProductList } from "./views/list/product.js";
import { ProductEdit } from "./views/edit/product.js";
import { OrderList } from "./views/list/order.js";
import { OrderEdit } from "./views/edit/order.js";
import { Settings } from "./views/list/settings.js";

/* Register views using their class names */
[
    ProductList,
    ProductEdit,
    OrderList,
    OrderEdit,
    Login,
    Settings
].forEach(viewClass => View.register(viewClass));
