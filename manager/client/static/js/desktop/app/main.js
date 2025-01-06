import { Navigation } from "../vanilla/http/navigation";

const urlpatterns = {
  "^login/": {"GET": "Login"},
}

export class MainView{
    constructor() {
		  new Navigation(urlpatterns);
    }
}