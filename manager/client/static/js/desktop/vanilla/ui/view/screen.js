import { Menu } from "../menu";
import { Navigation } from "../../http/navigation";

export class BaseScreen {
    static block = "main";

    constructor(context) {
        this.context = context;
        this.deleteButton = $("#delete");

        document.ready(() => {
            this.setupGlobalListeners();
            this.initializeMenu();
            this.setupBurgerMenu();
        });

        this.setupContextSpecificListeners();
    }

    // Setup global listeners
    setupGlobalListeners() {
        $("a").on("click", Navigation.click);

        $("#shop").on("click", function () {
            location.href = this.href;
        });

        $("#signout").on("click", function () {
            location.href = this.href;
        });
    }

    // Initialize the menu
    initializeMenu() {
        this.menu = new Menu({
            container: $("#menu"),
            titleText: "#menu-title-text",
            prev: "#prev",
            delay: 0,
            toggleButton: $("#toggleMenu"),
            left: 0,
            choice: this.handleMenuChoice.bind(this),
        });
    }

    // Handle menu choice
    handleMenuChoice(e) {
        const target = $(e.target);

        if (e.target.tagName === "SPAN") {
            target.parent().click();
            return;
        }

        location.href = target.get("href");
        $("#search-text").set("model", target.get("model"));

        e.stopPropagation();
        e.preventDefault();

        return false;
    }

    // Setup burger menu functionality
    setupBurgerMenu() {
        $(".burger").on("click", (e) => {
            $("menu").active();
            $("#right").toggleClass("full");
            e.stopPropagation();
            return false;
        });
    }

    // Setup context-specific listeners
    setupContextSpecificListeners() {
        if (!this.context) return;

        $(`${View.block} a`).on("click", Http.click);
        document.title = this.context.title;

        try {
            this.Model = this.context.Model || this.context.context.Model;
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
        this.setupGlobalBodyClickHandler();
    }

    // Initialize theme
    initializeTheme() {
        storage.theme = storage.theme || "black";
        storage.LANG_ORDER = storage.LANG_ORDER || "[]";

        $("header").set("class", storage.theme);
    }

    // Setup theme change listeners
    setupThemeListeners() {
        $("#theme .color").on("click", (event) => {
            this.changeTheme(event.target.get("color"));
        });
    }

    // Change theme
    changeTheme(color) {
        storage.theme = color;
        $("header").set("class", color);
    }

    // Setup global body click handler
    setupGlobalBodyClickHandler() {
        $("#nav, #nav *").on("click", (e) => {
            e.stopPropagation();
            return false;
        });

        $("body").on("click", () => {
            this.resetActiveStates();
        });
    }

    // Reset active states across various elements
    resetActiveStates() {
        $("#panel-menu").removeClass("active");
        $("#panel #filter").removeClass("active");
        $("#panel #edit").removeClass("active");
        $("#left #nav.active").removeClass("active");
        $("#product-info").removeClass("active");
        $("#right").removeClass("full");
        $("#filters").removeClass("active");
    }

    // Get class name as string
    toString() {
        return this.constructor.name;
    }
}