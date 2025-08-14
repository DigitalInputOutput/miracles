import { Dom } from '../../vanilla/ui/dom.js';

export class Menu {
    constructor({ container, titleText, prev, delay = 0, toggleButton, left = 0, choice }) {
        if (!container || Array.isArray(container)) return;

        this.container = container;
        this.title = Dom.query(titleText);
        this.prevButton = Dom.query(prev);
        this.left = left;
        this.root = this.container;
        this.choiceCallback = choice;
        this.delay = delay;
        this.activeMenuElement = null;

        this.bindEvents(toggleButton);
        this.initializeActiveMenuElement();
    }

    // Bind initial events to the menu
    bindEvents(toggleButton) {
        toggleButton.on('click touch', this.show.bind(this));
        this.container.find('div.branch').on('click touch', this.next.bind(this));
        this.prevButton.on('click touch', this.previous.bind(this));
        this.container.find('.parent.load').on('click', this.choiceCallback.bind(this));
    }

    // Initialize the active menu element based on the current location or model
    initializeActiveMenuElement() {
        this.activeMenuElement = NaN; /* Dom.query(`a.load[href="${location.pathname}"],a.load[model="${model}"]`); */

        if (this.activeMenuElement && this.activeMenuElement.length) {
            this.activeMenuElement.addClass('active');

            for (const item of this.activeMenuElement) {
                const parentActiveMenuElement = item.parent().parent();
                if (parentActiveMenuElement.hasClass('parent')) {
                    this.next({ target: parentActiveMenuElement });
                }
            }
        }
    }

    // Show the menu with animation
    show() {
        if (this.active) {
            this.active.removeClass('open');
        }
        this.active = this.container.find('ul')[0].addClass('open');
        this.container.css('left', `-${this.container.outerWidth() + this.left}px`);
        this.container.show();

        setTimeout(() => {
            this.container.css('left', `${this.left}px`);
        }, this.delay);
    }

    // Navigate to the next menu level
    next(event) {
        const target = event.target;
        if (target.tagName === 'SPAN') {
            target.parent().click();
            return;
        }

        this.active = target.find('.sub')[0];
        setTimeout(() => {
            this.active.addClass('open');
            this.title.text(target.find('span').text());
        }, this.delay);

        this.prevButton.show('grid');
        event.stopPropagation();
        event.preventDefault();
        return false;
    }

    // Navigate to the previous menu level
    previous(event) {
        if (this.active === this.root) return;

        this.active.removeClass('open');
        this.active = this.active.parent().parent();
        this.title.text(this.active.parent().find('span').text());

        setTimeout(() => {
            this.active.addClass('open');
        }, this.delay);

        if (this.active === this.root) {
            this.prevButton.hide();
            this.title.text('');
        }

        event.stopPropagation();
        event.preventDefault();
        return false;
    }

    // Close the menu
    close() {
        this.container.hide();
    }
}