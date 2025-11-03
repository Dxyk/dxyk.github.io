/*!
    ImageBox.js
    Copyright (c) 2016 Jan Novak <novakj4@gmail.com> and Benedikt Bitterli <benedikt.bitterli@gmail.com>
    Released under the MIT license

    Permission is hereby granted, free of charge, to any person obtaining a copy of this
    software and associated documentation files (the "Software"), to deal in the Software
    without restriction, including without limitation the rights to use, copy, modify,
    merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to the following
    conditions:

    The above copyright notice and this permission notice shall be included in all copies
    or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
    INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
    PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

    The wheelzoom class is based on code written by Jack Moore.
    The original source code is released under the MIT license
    and can be found at http://www.jacklmoore.com/wheelzoom.
*/

const imageBoxSettings = {
    zoom: 0.1,
    width: 1152,
    height: 720
};

window.wheelzoom = (function () {

    const canvas = document.createElement('canvas');

    const main = function (img, settings) {
        if (!img || !img.nodeName || img.nodeName !== 'IMG') {
            return;
        }

        let previousEvent;
        let cachedDataUrl;

        function setSrcToBackground(img) {
            img.style.backgroundImage = 'url("' + img.src + '")';
            img.style.backgroundRepeat = 'no-repeat';
            canvas.width = settings.width;
            canvas.height = Math.min(imageBoxSettings.height, canvas.width * (img.imHeight / img.imWidth));
            img.bgOffsetX = (canvas.width - img.naturalWidth) / 2;
            img.bgOffsetY = (canvas.height - img.naturalHeight) / 2;
            cachedDataUrl = canvas.toDataURL();
            img.src = cachedDataUrl;

            reset();
        }

        function updateBgStyle() {

            const minX = -img.bgOffsetX;
            const maxX = img.imWidth - img.bgWidth + img.bgOffsetX;
            if (img.bgWidth - img.bgOffsetX * 2 >= img.imWidth) {
                img.bgPosX = Math.max(Math.min(img.bgPosX, minX), maxX);
            } else {
                img.bgPosX = Math.min(Math.max(img.bgPosX, minX), maxX);
            }

            const minY = -img.bgOffsetY;
            const maxY = img.imHeight - img.bgHeight + img.bgOffsetY;
            if (img.bgHeight - img.bgOffsetY * 2 >= img.imHeight) {
                img.bgPosY = Math.max(Math.min(img.bgPosY, minY), maxY);
            } else {
                img.bgPosY = Math.min(Math.max(img.bgPosY, minY), maxY);
            }

            img.style.backgroundSize = img.bgWidth + 'px ' + img.bgHeight + 'px';
            img.style.backgroundPosition = (img.bgOffsetX + img.bgPosX) + 'px ' + (img.bgOffsetY + img.bgPosY) + 'px';

            // // Apply anti-aliasing when not zoomed in too much, and when not viewing at a power of 2.
            // var globalZoomFactor = img.bgWidth / img.imWidth;
            // if (globalZoomFactor > 4 || (globalZoomFactor >= 1 && Math.log2(globalZoomFactor) % 1 < 0.001)) {
            //     img.className = "image-display pixelated";
            // } else {
            //     img.className = "image-display";
            // }
        }

        let raf = null;

        function scheduleUpdate() {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = null;
                updateBgStyle();
            });
        }

        function reset() {

            let zoomFactor;
            if (canvas) {
                zoomFactor = Math.min(canvas.width / img.imWidth, canvas.height / img.imHeight);
            } else {
                zoomFactor = 1;
            }

            img.bgWidth = img.imWidth * zoomFactor;
            img.bgHeight = img.imHeight * zoomFactor;
            img.bgPosX = (img.imWidth - img.bgWidth) / 2;
            img.bgPosY = (img.imHeight - img.bgHeight) / 2;
            scheduleUpdate();
        }

        function onwheel(e) {
            e.preventDefault();

            const deltaY = (e.deltaY) ? -e.deltaY : (e.wheelDelta || 0);

            // As far as I know, there is no good cross-browser way to get the cursor position relative to the event target.
            // We have to calculate the target element's position relative to the document, and subtrack that from the
            // cursor's position relative to the document.
            const rect = img.getBoundingClientRect();
            const offsetX = e.clientX - rect.left - img.bgOffsetX;
            const offsetY = e.clientY - rect.top - img.bgOffsetY;

            // Record the offset between the bg edge and cursor:
            const bgCursorX = offsetX - img.bgPosX;
            const bgCursorY = offsetY - img.bgPosY;

            // Use the previous offset to get the percent offset between the bg edge and cursor:
            const bgRatioX = bgCursorX / img.bgWidth;
            const bgRatioY = bgCursorY / img.bgHeight;

            let zoomFactor = 1 + settings.zoom;
            if (deltaY < 0) {
                zoomFactor = 1 / zoomFactor;
            }

            img.bgWidth *= zoomFactor;
            img.bgHeight *= zoomFactor;

            // Take the percent offset and apply it to the new size:
            img.bgPosX = offsetX - (img.bgWidth * bgRatioX);
            img.bgPosY = offsetY - (img.bgHeight * bgRatioY);

            scheduleUpdate();
        }

        function drag(e) {
            e.preventDefault();
            // img.bgPosX += (e.pageX - previousEvent.pageX);
            // img.bgPosY += (e.pageY - previousEvent.pageY);
            img.bgPosX += e.clientX - previousEvent.clientX;
            img.bgPosY += e.clientY - previousEvent.clientY;
            previousEvent = e;
            scheduleUpdate();
        }

        function removeDrag() {
            document.removeEventListener('mouseup', removeDrag);
            document.removeEventListener('mousemove', drag);
        }

        // Make the background draggable
        function draggable(e) {
            e.preventDefault();
            previousEvent = e;
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', removeDrag);
        }

        function load() {
            if (img.src === cachedDataUrl) return;

            img.imWidth = img.naturalWidth;
            img.imHeight = img.naturalHeight;

            img.bgWidth = img.imWidth;
            img.bgHeight = img.imHeight;
            img.bgPosX = 0;
            img.bgPosY = 0;

            img.style.backgroundSize = img.bgWidth + 'px ' + img.bgHeight + 'px';
            img.style.backgroundPosition = img.bgPosX + ' ' + img.bgPosY;

            setSrcToBackground(img);

            img.addEventListener('wheelzoom.reset', reset);
            img.addEventListener('wheel', onwheel, {passive: false});
            img.addEventListener('mousedown', draggable);
        }

        const destroy = function (originalProperties) {
            img.removeEventListener('wheelzoom.destroy', destroy);
            img.removeEventListener('wheelzoom.reset', reset);
            img.removeEventListener('load', load);
            img.removeEventListener('mouseup', removeDrag);
            img.removeEventListener('mousemove', drag);
            img.removeEventListener('mousedown', draggable);
            img.removeEventListener('wheel', onwheel);

            img.style.backgroundImage = originalProperties.backgroundImage;
            img.style.backgroundRepeat = originalProperties.backgroundRepeat;
            img.src = originalProperties.src;
        }.bind(null, {
            backgroundImage: img.style.backgroundImage,
            backgroundRepeat: img.style.backgroundRepeat,
            src: img.src
        });

        img.addEventListener('wheelzoom.destroy', destroy);

        if (img.complete) {
            load();
        }

        img.addEventListener('load', load);
    };

    // Do nothing in IE8
    if (typeof window.getComputedStyle !== 'function') {
        return function (elements) {
            return elements;
        };
    } else {
        return function (elements, settings) {
            if (elements && elements.length) {
                Array.prototype.forEach.call(elements, main, settings);
            } else if (elements && elements.nodeName) {
                main(elements, settings);
            }
            return elements;
        };
    }
}());


function createCollapsibleHelp() {
    const helpContainer = document.createElement('div');
    helpContainer.className = "help-collapsible";

    const helpHeader = document.createElement('div');
    helpHeader.className = "help-header";
    helpHeader.innerHTML = "&#9654; help";

    const helpContent = document.createElement('div');
    helpContent.className = "help-content";
    helpContent.style.display = "none";
    helpContent.innerHTML =
        "Use mouse wheel to zoom in/out, click and drag to pan.<br>" +
        "Press keys [1], [2], ... to select individual images.<br>" +
        "Press [<] and [>] to switch to the previous/next image, if available.<br>" +
        "Press [R] to reset the view to the first image.<br>" +
        "Press [M] and [Shift+M] to cycle through metrics, if available.<br>" +
        "Press [F] and [Shift+F] to cycle through frames, if available.<br>" +
        "Press [C] and [Shift+C] to cycle through clips, if available.<br>" +
        "Press [Q] and [Shift+Q] to cycle through quality levels, if available.<br>";

    helpHeader.addEventListener('click', function () {
        if (helpContent.style.display === "none") {
            helpContent.style.display = "block";
            helpHeader.innerHTML = "&#9660; help"; // ▼
        } else {
            helpContent.style.display = "none";
            helpHeader.innerHTML = "&#9654; help"; // ▶
        }
    });

    helpContainer.appendChild(helpHeader);
    helpContainer.appendChild(helpContent);
    return helpContainer;
}

const ImageBox = function (parent, config) {
    const self = this;

    const box = document.createElement('div');
    box.className = "image-box";

    // const h1 = document.createElement('h1');
    // h1.className = "title";
    // h1.appendChild(document.createTextNode("Images"));
    // box.appendChild(h1);

    // Add collapsible help section
    box.appendChild(createCollapsibleHelp());

    this.tree = [];
    this.selection = [];
    this.buildTreeNode(config, 0, this.tree, box);

    for (let i = 0; i < this.selection.length; ++i) {
        this.selection[i] = 0;
    }
    this.showContent(0, 0);
    parent.appendChild(box);

    document.addEventListener("keydown", function (event) {
        self.keyPressHandler(event);
    });
};

ImageBox.prototype.buildTreeNode = function (config, level, nodeList, parent) {

    const selectorGroup = document.createElement('div');
    selectorGroup.className = "selector-group";

    parent.appendChild(selectorGroup);

    const insets = [];

    for (let i = 0; i < config.length; i++) {
        // Create tab
        const selector = document.createElement('div');
        selector.className = "selector selector-primary";
        // selector.className += (i == 0) ? " active" : "";

        selector.addEventListener("click", function (l, idx) {
            this.showContent(l, idx);
        }.bind(this, level, i));

        // Add to tabs
        selectorGroup.appendChild(selector);

        // Create content
        const contentNode = {};
        contentNode.children = [];
        contentNode.selector = selector;

        let content;
        if (typeof (config[i].elements) !== 'undefined') {
            // Recurse
            content = document.createElement('div');
            this.buildTreeNode(config[i].elements, level + 1, contentNode.children, content);
            selector.appendChild(document.createTextNode(config[i].title));
        } else {
            // Create image
            content = document.createElement('img');
            content.className = "image-display pixelated";
            content.src = config[i].image;
            wheelzoom(content, imageBoxSettings);
            let key = '';
            if (i < 9)
                key = i + 1 + ": ";
            else if (i === 9)
                key = "0: ";

            selector.appendChild(document.createTextNode(key + config[i].title));
            // selector.appendChild(document.createElement('br'));
            // selector.appendChild(document.createTextNode(config[i].version));
            this.selection.length = Math.max(this.selection.length, level + 1);

            // Create inset
            const inset = document.createElement('img');
            inset.className = "inset pixelated";
            inset.style.backgroundImage = `url('${config[i].image}')`;
            inset.style.backgroundRepeat = "no-repeat";
            inset.style.border = "0px solid black";
            inset.style.width = Math.min(256, imageBoxSettings.width / config.length - 4) + "px";
            inset.style.height = Math.min(256, imageBoxSettings.width / config.length - 4) + "px";
            inset.alt = ""; // no text if it ever fails
            if (config[i].version !== '-') {
                inset.id = config[i].title + '_' + config[i].version;
            } else {
                inset.id = config[i].title;
            }
            const canvas = document.createElement("canvas");
            cachedDataUrl = canvas.toDataURL();
            inset.src = cachedDataUrl;
            insets.push(inset);

            content.addEventListener("mousemove", function (content, insets, event) {
                this.mouseMoveHandler(event, content, insets);
            }.bind(this, content, insets));
            content.addEventListener("wheel", function (content, insets, event) {
                this.mouseMoveHandler(event, content, insets);
            }.bind(this, content, insets));

        }
        content.style.display = 'none';
        parent.appendChild(content);
        contentNode.content = content;
        nodeList.push(contentNode);
    }

    if (insets.length > 0) {
        const insetGroup = document.createElement('table');
        insetGroup.className = "insets";
        insetGroup.style.width = imageBoxSettings.width;
        const tr = document.createElement('tr');
        tr.className = "insets";
        insetGroup.appendChild(tr);

        for (let i = 0; i < insets.length; ++i) {
            const auxDiv = document.createElement('td');
            auxDiv.className = "insets";
            auxDiv.style.width = (imageBoxSettings.width / insets.length) + "px";
            const insetTitle = document.createElement('div');
            insetTitle.append(document.createTextNode(insets[i].id));
            auxDiv.appendChild(insetTitle);
            // auxDiv.appendChild(document.createTextNode(insets[i].id));
            auxDiv.appendChild(insets[i]);
            tr.appendChild(auxDiv);
        }
        parent.appendChild(insetGroup);
    }
}

ImageBox.prototype.showContent = function (level, idx) {
    // Hide
    let bgWidth = 0;
    let bgHeight = 0;
    let bgPosX = 0;
    let bgPosY = 0;
    let bgOffsetX = 0;
    let bgOffsetY = 0;
    let l = 0;
    let node = {};
    node.children = this.tree;
    while (node.children.length > 0 && node.children.length > this.selection[l]) {
        node = node.children[this.selection[l]];
        node.selector.classList.remove('active');
        node.content.style.display = 'none';
        if (l === this.selection.length - 1) {
            bgWidth = node.content.bgWidth;
            bgHeight = node.content.bgHeight;
            bgPosX = node.content.bgPosX;
            bgPosY = node.content.bgPosY;
            bgOffsetX = node.content.bgOffsetX;
            bgOffsetY = node.content.bgOffsetY;
        }
        l += 1;
    }

    this.selection[level] = Math.max(0, idx);

    // Show
    l = 0;
    node = {};
    node.children = this.tree;
    while (node.children.length > 0) {
        if (this.selection[l] >= node.children.length)
            this.selection[l] = node.children.length - 1;
        node = node.children[this.selection[l]];
        node.selector.classList.add('active')
        node.content.style.display = 'block';
        if (l === this.selection.length - 1) {
            node.content.bgWidth = bgWidth;
            node.content.bgHeight = bgHeight;
            node.content.bgPosX = bgPosX;
            node.content.bgPosY = bgPosY;
            node.content.bgOffsetX = bgOffsetX;
            node.content.bgOffsetY = bgOffsetY;
            node.content.style.backgroundSize = bgWidth + 'px ' + bgHeight + 'px';
            node.content.style.backgroundPosition = (bgOffsetX + bgPosX) + 'px ' + (bgOffsetY + bgPosY) + 'px';
        }
        l += 1;
    }
}

ImageBox.prototype.getCurrentNode = function(level) {
    let node = { children: this.tree };
    for (let i = 0; i < level; i++) {
        node = node.children[this.selection[i]];
    }
    return node;
};

ImageBox.prototype.keyPressHandler = function (event) {
    // Images, Final level (Level 5)
    if (event.key >= '1' && event.key <= '9') {
        this.showContent(this.selection.length - 1, Number(event.key) - 1);
    } else if (event.key === '0') {
        this.showContent(this.selection.length - 1, 0);
    } else if (event.key.toLowerCase() === 'r') {
        // Reference, Assume first element
        this.showContent(this.selection.length - 1, 0);
    } else if (event.key === ',') {
        // Previous image (assume last level)
        const currentLevel = this.selection.length - 1;
        const currentNode = this.getCurrentNode(currentLevel);
        this.showContent(
            currentLevel,
            (this.selection[currentLevel] - 1 + currentNode.children.length) % currentNode.children.length
        );
    } else if (event.key === '.') {
        // Next image (assume last level)
        const currentLevel = this.selection.length - 1;
        const currentNode = this.getCurrentNode(currentLevel);
        this.showContent(
            currentLevel,
            (this.selection[currentLevel] + 1) % currentNode.children.length
        );

    // Metrics, Level 4 (second last level)
    } else if (event.key === 'm') {
        if (this.selection.length >= 2) {
            // Cycle through metrics (assume second last level)
            const metricLevel = this.selection.length - 2;
            const currentNode = this.getCurrentNode(metricLevel);
            this.showContent(
                metricLevel,
                (this.selection[metricLevel] + 1) % currentNode.children.length
            );
        }
    } else if (event.key === 'M') {
        if (this.selection.length >= 2) {
            // Reverse cycle through metrics (assume second last level)
            const metricLevel = this.selection.length - 2;
            const currentNode = this.getCurrentNode(metricLevel);
            this.showContent(
                metricLevel,
                (this.selection[metricLevel] - 1 + currentNode.children.length) % currentNode.children.length
            );
        }
    } else if (event.key.toLowerCase() === 'n') {
       // Jump to Negative SMAPE
       if (this.selection.length >= 2) {
            // Reverse cycle through metrics (assume second last level)
            const metricLevel = this.selection.length - 2;
            const currentNode = this.getCurrentNode(metricLevel);
            this.showContent(
                metricLevel,
                currentNode.children.length - 1 // last child is always Negative SMAPE
            );
        }

    // Frame, Level 3 (third last level)
    } else if (event.key === 'f') {
        if (this.selection.length >= 3) {
            // Cycle through frames
            const frameLevel = this.selection.length - 3;
            const currentNode = this.getCurrentNode(frameLevel);
            this.showContent(
                frameLevel,
                (this.selection[frameLevel] + 1) % currentNode.children.length
            );
        }
    } else if (event.key === 'F') {
        if (this.selection.length >= 3) {
            // Reverse cycle through frames
            const frameLevel = this.selection.length - 3;
            const currentNode = this.getCurrentNode(frameLevel);
            this.showContent(
                frameLevel,
                (this.selection[frameLevel] - 1 + currentNode.children.length) % currentNode.children.length
            );
        }

    // Clip, Level 2 (fourth last level)
    } else if (event.key === 'c') {
        if (this.selection.length >= 4) {
            // Cycle through clips
            const clipLevel = this.selection.length - 4;
            const currentNode = this.getCurrentNode(clipLevel);
            this.showContent(
                clipLevel,
                (this.selection[clipLevel] + 1) % currentNode.children.length
            );
        }
    } else if (event.key === 'C') {
        if (this.selection.length >= 4) {
            // Reverse cycle through clips
            const clipLevel = this.selection.length - 4;
            const currentNode = this.getCurrentNode(clipLevel);
            this.showContent(
                clipLevel,
                (this.selection[clipLevel] - 1 + currentNode.children.length) % currentNode.children.length
            );
        }

    // Quality, Level 1 (top level)
    } else if (event.key === 'q') {
        // Quality (assume top level)
        if (this.selection.length >= 1) {
            const qualityLevel = this.selection.length - 5;
            const currentNode = this.getCurrentNode(qualityLevel);
            this.showContent(
                qualityLevel,
                (this.selection[qualityLevel] + 1) % currentNode.children.length
            );
        }
    } else if (event.key === 'Q') {
        // Reverse quality (assume top level)
        if (this.selection.length >= 1) {
            const qualityLevel = this.selection.length - 5;
            const currentNode = this.getCurrentNode(qualityLevel);
            this.showContent(
                qualityLevel,
                (this.selection[qualityLevel] - 1 + currentNode.children.length) % currentNode.children.length
            );
        }
    }
}

ImageBox.prototype.mouseMoveHandler = function (event, image, insets) {
    const rect = image.getBoundingClientRect();

    // cursor position in CSS pixels relative to the image’s top-left in the viewport
    const cx = event.clientX - rect.left;
    const cy = event.clientY - rect.top;

    // convert to image pixel coords, accounting for background offsets/zoom
    const xCoord = (cx - image.bgOffsetX - image.bgPosX) / (image.bgWidth / image.imWidth);
    const yCoord = (cy - image.bgOffsetY - image.bgPosY) / (image.bgHeight / image.imHeight);

    const scale = 2;
    for (let i = 0; i < insets.length; ++i) {
        insets[i].style.backgroundSize =
            (image.imWidth * scale) + "px " + (image.imHeight * scale) + "px";
        insets[i].style.backgroundPosition =
            (insets[i].width / 2 - xCoord * scale) + "px " +
            (insets[i].height / 2 - yCoord * scale) + "px";
    }
}
