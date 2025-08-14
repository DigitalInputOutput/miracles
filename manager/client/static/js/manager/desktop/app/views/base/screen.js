import { Menu } from "./menu.js";
import { Navigation } from "/static/js/vanilla-js/http/navigation.js";
import { storage } from "/static/js/vanilla-js/ui/const.js";
import { Dom } from "/static/js/vanilla-js/ui/dom.js";
import { View } from "/static/js/vanilla-js/http/view.js";

export class BaseScreen {
    container = "main";

    constructor(context) {
        this.context = context;
        this.deleteButton = Dom.query("#delete");

        document.ready(() => {
            this.setupGlobalListeners();
            this.initializeMenu();
            this.setupBurgerMenu();
            this.setupLangButton();
        });

        this.setupContextSpecificListeners();
    }

    setupLangButton(){
        Dom.query('#lang-button').on('click',(e)=>{
            Dom.query('#lang').active();
            e.stopPropagation();
            return false;
        });
    }

    // Setup global listeners
    setupGlobalListeners() {
        Dom.query("a").on("click", Navigation.click);
    }

    // Initialize the menu
    initializeMenu() {
        this.menu = new Menu({
            container: Dom.query("#menu"),
            titleText: "#menu-title-text",
            prev: "#prev",
            delay: 0,
            toggleButton: Dom.query("#toggleMenu"),
            left: 0,
            choice: this.handleMenuChoice.bind(this),
        });
    }

    // Handle menu choice
    handleMenuChoice(e) {
        const target = Dom.query(e.target);

        if (e.target.tagName === "SPAN") {
            target.parent().click();
            return;
        }

        location.href = target.get("href");
        Dom.query("#search-text").set("model", target.get("model"));

        e.stopPropagation();
        e.preventDefault();

        return false;
    }

    // Setup burger menu functionality
    setupBurgerMenu() {
        Dom.query(".burger").on("click", (e) => {
            Dom.query("menu").active();
            Dom.query("#right").toggleClass("full");
            e.stopPropagation();
            return false;
        });
    }

    // Setup context-specific listeners
    setupContextSpecificListeners() {
        if (!this.context) return;

        Dom.query(`${View.block} a`).on("click", Navigation.click);
        document.title = this.context.title;

        try {
            this.AdminModel = this.context.AdminModel || "";
        } catch (e) {
            console.error("Error initializing Model:", e);
        }
    }
}

export class Screen extends BaseScreen {
    constructor(context) {
        super(context);
        this.initializeTheme();
        this.setupThemeListeners();
        document.ready(() => {
            this.setupGlobalBodyClickHandler();
        });
    }

    // Initialize theme
    initializeTheme() {
        storage.theme = storage.theme || "black";
        storage.LANG_ORDER = storage.LANG_ORDER || "[]";

        Dom.query("header").set("class", storage.theme);
    }

    // Setup theme change listeners
    setupThemeListeners() {
        Dom.query("#theme .color").on("click", (event) => {
            this.changeTheme(event.target.get("color"));
        });
    }

    // Change theme
    changeTheme(color) {
        storage.theme = color;
        Dom.query("header").set("class", color);
    }

    // Setup global body click handler
    setupGlobalBodyClickHandler() {
        Dom.query("#nav, #nav *").on("click", (e) => {
            e.stopPropagation();
            return false;
        });

        Dom.query("body").on("click", () => {
            this.resetActiveStates();
        });
    }

    // Reset active states across various elements
    resetActiveStates() {
        Dom.query("#panel-menu").removeClass("active");
        Dom.query("#panel #filter").removeClass("active");
        Dom.query("#panel #edit").removeClass("active");
        Dom.query("#left #nav.active").removeClass("active");
        Dom.query("#product-info").removeClass("active");
        Dom.query("#right").removeClass("full");
        Dom.query("#filters").removeClass("active");
        Dom.query("#lang").removeClass("active");
        Dom.query("#bigPhoto").hide();
        Dom.query("#bg").hide();
    }

    // Get class name as string
    toString() {
        return this.constructor.name;
    }
}