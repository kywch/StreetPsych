'use strict';

var Shuffle = window.Shuffle;

var question = {};
question["walkability"] = 'Select 4 streets you would most want to walk down.';
question["preference"] = 'Select 4 street that you like.';
question["imageability"] = 'Select the 4 streets that have the most character (i.e., that capture your attention).';
question["complexity"] = 'Select 4 streets with the most visual richness and diversity of activities.';
question["enclosure"] = 'Select 4 streets that feel enclosed and room-like, rather than wide open.';
question["humanscale"] = 'Select 4 streets with the most human scale (e.g., small buildings and narrow streets).';
question["transparency"] = "Select 4 streets where you can see or perceive what's going on inside of the buildings.";
question["disorder"] = 'Select the 4 streets that seem the most disorderly.';

var Demo = function (element, rating_data, image_source, task) {
    this.element = element;
    this.initShuffle();
    this.initPictures(rating_data, image_source);
    this.addSorting();
    // default sorting -- by walkability

    var options = {
        reverse: true,
        by: function (element) {
            return element.getAttribute('data-' + task);
        },
    };
    this.shuffle.sort(options);
    document.getElementById("one-line-question").textContent = question[task];
};

// Column width and gutter width options can be functions
Demo.prototype.initShuffle = function () {
    this.shuffle = new Shuffle(this.element, {
        itemSelector: '.picture-item',
        speed: 250,
        easing: 'ease',
        columnWidth: function (containerWidth) {
            // .box's have a width of 18%
            return 0.01 * containerWidth;
        },

        gutterWidth: function (containerWidth) {
            // .box's have a margin-left of 2.5%
            return 0.01 * containerWidth;
        },
    });
};

Demo.prototype.addSorting = function () {
    document.querySelector('.sort-options').addEventListener('change', this._handleSortChange.bind(this));
};

/* THIS FUNCTION NEEDS TO BE MODIFIED 
    <option value="walk_dsc">Walkability ▼</option>
    <option value="walk_asc">Walkability ▲</option>
    <option value="pref_dsc">Preference ▼</option>
    <option value="pref_asc">Preference ▲</option>
    <option value="imag_dsc">Imageability ▼</option>
    <option value="imag_asc">Imageability ▲</option>
    <option value="comp_dsc">Complexity ▼</option>
    <option value="comp_asc">Complexity ▲</option>
    <option value="encl_dsc">Enclosure ▼</option>
    <option value="encl_asc">Enclosure ▲</option>
    <option value="hmsc_dsc">Human scale ▼</option>
    <option value="hmsc_asc">Human scale ▲</option>
    <option value="trsp_dsc">Transparency ▼</option>
    <option value="trsp_asc">Transparency ▲</option>
    <option value="ordr_dsc">Order ▼</option>
    <option value="ordr_asc">Order ▲</option>
*/
Demo.prototype._handleSortChange = function (evt) {
    console.log(evt);
    var value = evt.target.value;
    var options;
    var task = '';

    switch (value) {
        case 'walk_dsc':
            task = 'walkability';
            options = {
                reverse: true,
                by: function (element) {
                    return element.getAttribute('data-' + task);
                },
            };
            break;
        case 'walk_asc':
            task = 'walkability';
            options = {
                by: function (element) {
                    return element.getAttribute('data-' + task);
                },
            };
            break;
        case 'pref_dsc':
            task = 'preference';
            options = {
                reverse: true,
                by: function (element) {
                    return element.getAttribute('data-' + task);
                },
            };
            break;
        case 'pref_asc':
            task = 'preference';
            options = {
                by: function (element) {
                    return element.getAttribute('data-' + task);
                },
            };
            break;
        case 'imag_dsc':
            task = 'imageability';
            options = {
                reverse: true,
                by: function (element) {
                    return element.getAttribute('data-' + task);
                },
            };
            break;
        case 'imag_asc':
            task = 'imageability';
            options = {
                by: function (element) {
                    return element.getAttribute('data-' + task);
                },
            };
            break;
        case 'comp_dsc':
            task = 'complexity';
            options = {
                reverse: true,
                by: function (element) {
                    return element.getAttribute('data-' + task);
                },
            };
            break;
        case 'comp_asc':
            task = 'complexity';
            options = {
                by: function (element) {
                    return element.getAttribute('data-' + task);
                },
            };
            break;
        case 'encl_dsc':
            task = 'enclosure';
            options = {
                reverse: true,
                by: function (element) {
                    return element.getAttribute('data-' + task);
                },
            };
            break;
        case 'encl_asc':
            task = 'enclosure';
            options = {
                by: function (element) {
                    return element.getAttribute('data-' + task);
                },
            };
            break;
        case 'hmsc_dsc':
            task = 'humanscale';
            options = {
                reverse: true,
                by: function (element) {
                    return element.getAttribute('data-' + task);
                },
            };
            break;
        case 'hmsc_asc':
            task = 'humanscale';
            options = {
                by: function (element) {
                    return element.getAttribute('data-' + task);
                },
            };
            break;
        case 'trsp_dsc':
            task = 'transparency';
            options = {
                reverse: true,
                by: function (element) {
                    return element.getAttribute('data-' + task);
                },
            };
            break;
        case 'trsp_asc':
            task = 'transparency';
            options = {
                by: function (element) {
                    return element.getAttribute('data-' + task);
                },
            };
            break;
        case 'dsod_dsc':
            task = 'disorder';
            options = {
                reverse: true,
                by: function (element) {
                    return element.getAttribute('data-' + task);
                },
            };
            break;
        case 'dsod_asc':
            task = 'disorder';
            options = {
                by: function (element) {
                    return element.getAttribute('data-' + task);
                },
            };
            break;
        default:
            options = {};
    }

    this.shuffle.sort(options);
    document.getElementById("one-line-question").textContent = question[task];

};

Demo.prototype.initPictures = function (pictureData, srcUrl) {

    var item_list = [];

    for (var ii = 0; ii < pictureData.length; ii++) {

        var imageSrc = document.createElement('img');
        imageSrc.src = srcUrl + pictureData[ii].name;
        imageSrc.title = pictureData[ii].name + ' --> ' +
            'WK: ' + pictureData[ii].walkability.toFixed(2).toString() + '; ' +
            'IM: ' + pictureData[ii].imageability.toFixed(2).toString() + '; ' +
            'CP: ' + pictureData[ii].complexity.toFixed(2).toString() + '; ' +
            'EN: ' + pictureData[ii].enclosure.toFixed(2).toString() + '; ' +
            'HM: ' + pictureData[ii].humanscale.toFixed(2).toString() + '; ' +
            'TR: ' + pictureData[ii].transparency.toFixed(2).toString();

        var imageContainer_inner = document.createElement('div');
        imageContainer_inner.className = "aspect__inner";
        imageContainer_inner.appendChild(imageSrc);

        var imageContainer_outer = document.createElement('div');
        imageContainer_outer.className = "aspect aspect--4x3";
        imageContainer_outer.appendChild(imageContainer_inner);

        /* <figure class="col-3@xs col-4@sm col-3@md picture-item" data-groups='["nature"]'
            data-date-created="2017-04-30" data-title="Lake Walchen"> */
        var item = document.createElement('figure');
        item.className = "picture-item col-2@xs col-2@sm col-2@md";
        item.setAttribute('data-walkability', pictureData[ii].walkability);
        item.setAttribute('data-imageability', pictureData[ii].imageability);
        item.setAttribute('data-complexity', pictureData[ii].complexity);
        item.setAttribute('data-enclosure', pictureData[ii].enclosure);
        item.setAttribute('data-humanscale', pictureData[ii].humanscale);
        item.setAttribute('data-transparency', pictureData[ii].transparency);
        item.appendChild(imageContainer_outer);

        item_list.push(item);
    }

    item_list.forEach(function (element) {
        this.shuffle.element.appendChild(element);
    }, this);

    // Tell shuffle items have been appended.
    // It expects an array of elements as the parameter.
    this.shuffle.add(item_list);

}
