/*!
    PlotBox.js
    Copyright (c) 2019 Joey Litalien <joey.litalien@mail.mcgill.ca>
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
*/

/*!
    PlotBox.js  (with scale selector)
*/

const plotBoxSettings = {width: 1152};

// For log axes: replace non-positive values with a tiny positive
function _safeLog(arr, epsilon) {
    if (!arr) return [];
    const e = epsilon || 1e-12;
    const out = new Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
        let v = arr[i];
        v = (typeof v === "string") ? Number(v) : v;
        out[i] = (v > 0 && isFinite(v)) ? v : e;
    }
    return out;
}

// Coerce array to numbers (for linear scale)
function _toNumeric(arr) {
    if (!arr) return [];
    const out = new Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
        let v = arr[i];
        out[i] = (typeof v === "string") ? Number(v) : v;
    }
    return out;
}

// Generate a unique DOM id for each PlotBox instance
function _uniqueId(prefix) {
    return (prefix || "metric-plot-") + Math.random().toString(36).slice(2, 9);
}

// PlotBox class
const PlotBox = function (parent, title, stats) {
    /**
     * @param {HTMLElement} parent - parent element to contain the plot box
     * @param {string} title - title of the plot box
     * @param {Array} stats - array of stats objects (see README for format)
     */

        // Unique plot target
    const plotId = _uniqueId();

    // Header
    const h1 = document.createElement("h1");
    h1.className = "title";
    h1.appendChild(document.createTextNode(title));

    // === Scale selector (Linear / Log) ===
    const scaleGroup = document.createElement("div");
    scaleGroup.className = "selector-group";
    this.scaleSelectors = [];
    this.scale = "linear"; // default
    const scales = ["linear", "log"];
    for (let i = 0; i < scales.length; i++) {
        const lab = scales[i][0].toUpperCase() + scales[i].slice(1);
        const sel = document.createElement("div");
        sel.className = "selector selector-secondary";
        if (i === 0) sel.classList.add("active");
        sel.appendChild(document.createTextNode(lab));
        sel.addEventListener("click", function (kind, ev) {
            this.setScale(kind);
        }.bind(this, scales[i]));
        this.scaleSelectors.push(sel);
        scaleGroup.appendChild(sel);
    }

    // Metric selector tabs
    const selectorGroup = document.createElement("div");
    selectorGroup.className = "selector-group";
    this.selectors = [];

    for (let i = 0; i < (stats[0]?.series?.length || 0); i++) {
        const selector = document.createElement("div");
        selector.className = "selector selector-primary";
        if (i === 0) selector.classList.add("active");
        selector.appendChild(document.createTextNode(stats[0].series[i].label));

        selector.addEventListener("click", function (idx, event) {
            this.selectPlot(idx);
        }.bind(this, i));

        this.selectors.push(selector);
        selectorGroup.appendChild(selector);
    }

    // Plot canvas
    const box = document.createElement("div");
    box.className = "plot-box";
    box.style.width = plotBoxSettings.width + "px";

    // Plot target
    const plot = document.createElement("div");
    plot.setAttribute("id", plotId);

    // Add to canvas (order: title, scale selector, metric selector, plot)
    box.appendChild(h1);
    box.appendChild(scaleGroup);
    box.appendChild(selectorGroup);
    box.appendChild(plot);
    parent.append(box);

    // Read data (robust to missing track + use trackLabels if present)
    const legendLabels = (stats[0].trackLabels && Array.isArray(stats[0].trackLabels))
        ? stats[0].trackLabels
        : (stats[0].labels || []);

    // Build both linear and log traces so switching is instant
    this.plotsLinear = [];
    this.plotsLog = [];

    for (let si = 0; si < (stats[0].series?.length || 0); si++) {
        const series = stats[0].series[si] || {};
        const track = series.track || {};
        const Xs = track.x || [];   // array of arrays (per experiment)
        const Ys = track.y || [];   // array of arrays (per experiment)

        const tracesLinear = [];
        const tracesLog = [];

        for (let j = 0; j < Ys.length; j++) {
            const xLin = _toNumeric(Xs[j]);
            const yLin = _toNumeric(Ys[j]);

            const xLog = _safeLog(Xs[j], 1e-6);   // epochs/times > 0
            const yLog = _safeLog(Ys[j], 1e-12);  // metric values > 0

            const name = legendLabels[j] || ("exp " + (j + 1));

            tracesLinear.push({
                x: xLin, y: yLin,
                type: "scatter", mode: "lines+markers", name
            });
            tracesLog.push({
                x: xLog, y: yLog,
                type: "scatter", mode: "lines+markers", name
            });
        }

        this.plotsLinear.push(tracesLinear);
        this.plotsLog.push(tracesLog);
    }

    // Styling (initially linear)
    const options = {
        xaxis: {title: "Epoch", titlefont: {size: 14, color: "#aaa"}, type: "linear", autorange: true},
        yaxis: {title: "Metric", titlefont: {size: 14, color: "#aaa"}, type: "linear", autorange: true},
        margin: {l: 100, r: 100, b: 64, t: 64, pad: 12},
        font: {family: 'Roboto', size: 14, color: '#555'},
        width: plotBoxSettings.width - 2
    };

    // Track selected metric index
    this.currentIndex = 0;

    // Plot selection toggle
    PlotBox.prototype.selectPlot = function (idx) {
        this.currentIndex = idx;
        for (let k = 0; k < this.selectors.length; k++) {
            if (k === idx) this.selectors[k].classList.add("active");
            else this.selectors[k].classList.remove("active");
        }
        const traces = (this.scale === "log")
            ? this.plotsLog[idx]
            : this.plotsLinear[idx];
        Plotly.react(plotId, traces, options, {displayModeBar: false});
    };

    // Scale setter that updates axes + re-renders current metric
    PlotBox.prototype.setScale = function (kind) {
        if (kind !== "linear" && kind !== "log") return;
        this.scale = kind;

        // toggle UI
        for (let i = 0; i < this.scaleSelectors.length; i++) {
            const want = (scales[i] === kind);
            if (want) this.scaleSelectors[i].classList.add("active");
            else this.scaleSelectors[i].classList.remove("active");
        }

        // update axes
        options.xaxis.type = "linear";
        options.yaxis.type = kind;

        // redraw current metric
        this.selectPlot(this.currentIndex);
    };

    // Initial draw (guard empty)
    if (this.plotsLinear.length && this.plotsLinear[0].length) {
        Plotly.newPlot(plotId, this.plotsLinear[0], options, {displayModeBar: false});
    } else {
        Plotly.newPlot(plotId, [], options, {displayModeBar: false});
    }
};
