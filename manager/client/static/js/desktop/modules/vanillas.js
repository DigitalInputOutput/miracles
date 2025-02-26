
(function() {
    'use strict';

    /**
     * Element Prototype Extensions
     */
    Object.assign(Element.prototype, {
        // Traversal & Manipulation
        isVisible() {
            return !!(this.offsetWidth || this.offsetHeight || this.getClientRects().length);
        },
        offset() {
            const rect = this.getBoundingClientRect();
            return {
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX
            };
        },
        clone(deepClone = true) {
            return this.cloneNode(deepClone);
        },
        detach() {
            return this.parentNode ? this.parentNode.removeChild(this) : this;
        },
        replaceWith(newElem) {
            this.parentNode?.replaceChild(newElem, this);
        },

        // Events & Interaction
        delegate(event, selector, handler) {
            this.addEventListener(event, e => {
                if (e.target.matches(selector)) handler.call(e.target, e);
            });
        },
        once(event, handler) {
            this.addEventListener(event, handler, { once: true });
        },
        hover(enterFunc, leaveFunc) {
            this.addEventListener('mouseenter', enterFunc);
            this.addEventListener('mouseleave', leaveFunc);
        },

        // Class & Attributes Management
        toggleAttr(name, value1, value2) {
            this.setAttribute(name, this.getAttribute(name) === value1 ? value2 : value1);
        },
        swapClasses(class1, class2) {
            if (this.classList.contains(class1)) {
                this.classList.replace(class1, class2);
            } else if (this.classList.contains(class2)) {
                this.classList.replace(class2, class1);
            }
        },

        // Styling & Animations
        fadeIn(duration = 300) {
            this.style.opacity = 0;
            this.style.display = 'block';
            let last = +new Date();
            const tick = () => {
                this.style.opacity = +this.style.opacity + (new Date() - last) / duration;
                last = +new Date();
                if (+this.style.opacity < 1) requestAnimationFrame(tick);
            };
            tick();
        },
        fadeOut(duration = 300) {
            this.style.opacity = 1;
            let last = +new Date();
            const tick = () => {
                this.style.opacity = +this.style.opacity - (new Date() - last) / duration;
                last = +new Date();
                if (+this.style.opacity > 0) requestAnimationFrame(tick);
                else this.style.display = 'none';
            };
            tick();
        },
        slideUp(duration = 300) {
            this.style.transition = `height ${duration}ms ease-in-out`;
            this.style.height = `${this.offsetHeight}px`;
            requestAnimationFrame(() => this.style.height = '0');
        },
        slideDown(duration = 300) {
            this.style.display = 'block';
            let height = this.scrollHeight;
            this.style.height = '0';
            requestAnimationFrame(() => this.style.height = `${height}px`);
        },

        // Utility Methods
        isEmpty() {
            return this.innerHTML.trim() === '';
        },
        scrollToMe() {
            this.scrollIntoView({ behavior: 'smooth' });
        },
        toggleDisabled() {
            this.disabled = !this.disabled;
        },
        load(url, callback) {
            fetch(url).then(res => res.text()).then(html => {
                this.innerHTML = html;
                if (callback) callback();
            });
        }
    });

    /**
     * Array Prototype Extensions
     */
    Object.assign(Array.prototype, {
        unique() {
            return [...new Set(this)];
        },
        last() {
            return this[this.length - 1];
        },
        first() {
            return this[0];
        },
        shuffle() {
            return this.sort(() => Math.random() - 0.5);
        },
        remove(item) {
            let index;
            while ((index = this.indexOf(item)) !== -1) {
                this.splice(index, 1);
            }
            return this;
        }
    });

    /**
     * String Prototype Extensions
     */
    Object.assign(String.prototype, {
        capitalize() {
            return this.charAt(0).toUpperCase() + this.slice(1);
        },
        toSlug() {
            return this.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
        },
        reverse() {
            return [...this].reverse().join('');
        }
    });
})();