import { OneToOne } from "./fgk.js";
import { Dom } from "/static/js/vanilla-js/ui/dom.js";
import { t } from "/static/js/manager/desktop/app/i18n.js";

export class Gallery extends OneToOne {
	constructor(context) {
		super(context);

		this.selectors = {
			previewImage: '#bigPhoto img',
			fullSize: '#bigPhoto',
			closeButton: '#bigPhoto .close',
			images: '#gallery-items',
			removeListInput: '#images input[name="remove_images"]',
			imageContainer: '#images',
			bg: '#bg',
			dropZone: '#drop-zone',
		};

		this.initElements();
		this.initListeners();
	}

	initElements() {
		this.previewImage = Dom.query(this.selectors.previewImage)[0];
		this.fullSize = Dom.query(this.selectors.fullSize);
		this.closeButton = Dom.query(this.selectors.closeButton);
		this.images = Dom.query(this.selectors.images);
		this.removeListInput = Dom.query(this.selectors.removeListInput)[0];
		this.removeList = JSON.parse(this.removeListInput?.value || '[]');
		this.dropZone = Dom.query(this.selectors.dropZone);
	}

	initListeners() {
		// Existing images
		Dom.query(`${this.selectors.imageContainer} .remove`).on('click', this.remove.bind(this));
		Dom.query(`${this.selectors.imageContainer} img`).on('click', this.preview.bind(this));

		this.fullSize.on('click', this.next.bind(this));
		this.closeButton.on('click', this.close.bind(this));
		this.dropZone.on('click', this.add.bind(this));

		// Drag & Drop
		this.dropZone.on('dragover', this.handleDragOver.bind(this));
		this.dropZone.on('dragleave', this.handleDragLeave.bind(this));
		this.dropZone.on('drop', this.handleDrop.bind(this));
	}

	handleDragOver(e) {
		e.preventDefault();
		this.dropZone.addClass("dragover");
	}

	handleDragLeave() {
		this.dropZone.removeClass("dragover");
	}

	handleDrop(e) {
		e.preventDefault();
		this.dropZone.removeClass("dragover");

		const files = e.dataTransfer.files;
		if (files.length) {
			const evnt = { target: e.dataTransfer };
			const input = Dom.create('input');
			input.set('type', 'file');
			input.hide();

			this.input = input;
			this.images.append(input);
			this.render(evnt);
		}
	}

	close() {
		this.fullSize.hide();
		Dom.query(this.selectors.bg).hide();
	}

	next() {
		// Optional: Add carousel functionality
	}

	preview(e) {
		const image = e.target;
		this.previewImage.set('src', image.get('original'));
		this.fullSize.css('display', 'flex');
		Dom.query(this.selectors.bg).show();
		e.stopPropagation();
	}

	add() {
		const input = Dom.create('input');
		input.set('type', 'file');
		input.set('data-id', Dom.query('#gallery-items .image').length || 1);
		input.hide();

		this.input = input;
		this.images.append(input);
		input.on('change', this.render.bind(this));
		input.click();
	}

	render(e) {
		const file = e.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => this.appendImage(event.target.result);
		reader.readAsDataURL(file);
	}

	appendImage(dataUrl) {
		const div = Dom.create('div');
		div.set('class', 'image ui-sortable-handle');
		div.set('data-id', Dom.query('#gallery-items .image').length || 1);
		div.html('<div class="remove"><i class="ti ti-x"></i></div>');

		const removeBtn = div.find('.remove')[0];
		removeBtn.on('click', this.remove.bind(this));

		const image = Dom.create('img');
		image.src = dataUrl;
		image.set('original', dataUrl);
		image.on('click', this.preview.bind(this));

		div.append(image);

		this.input.set('name', 'images');
		this.input.set('value', dataUrl);

		this.images.append(div);
	}

	remove(e) {
		const target = e.target;
		const parent = target.tagName === 'I' ? target.parent().parent() : target.parent();

		console.log(parent);
		const id = parent.get('data-id');
		const itemId = target.get('item-id');
		const confirmRemove = confirm(t("delete_image"));

		if (!confirmRemove) return;

		const hiddenInput = Dom.query(`#gallery-items input[data-id="${id}"]`);

		if (itemId) {
			this.removeList.push(itemId);
			this.removeListInput.value = JSON.stringify(this.removeList);
		}

		hiddenInput?.removeFromDom();
		parent.remove();

		e.stopPropagation();
	}

}