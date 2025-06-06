"use strict";
// Functions to export map to image or data files

async function exportToSvg() {
  TIME && console.time("exportToSvg");
  const url = await getMapURL("svg", {fullMap: true});
  const link = document.createElement("a");
  link.download = getFileName() + ".svg";
  link.href = url;
  link.click();

  const message = `${link.download} is saved. Open 'Downloads' screen (ctrl + J) to check`;
  tip(message, true, "success", 5000);
  TIME && console.timeEnd("exportToSvg");
}

async function exportToPng() {
  TIME && console.time("exportToPng");
  const url = await getMapURL("png");

  const link = document.createElement("a");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = svgWidth * pngResolutionInput.value;
  canvas.height = svgHeight * pngResolutionInput.value;
  const img = new Image();
  img.src = url;

  img.onload = function () {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    link.download = getFileName() + ".png";
    canvas.toBlob(function (blob) {
      link.href = window.URL.createObjectURL(blob);
      link.click();
      window.setTimeout(function () {
        canvas.remove();
        window.URL.revokeObjectURL(link.href);

        const message = `${link.download} is saved. Open 'Downloads' screen (ctrl + J) to check. You can set image scale in options`;
        tip(message, true, "success", 5000);
      }, 1000);
    });
  };

  TIME && console.timeEnd("exportToPng");
}

async function exportToJpeg() {
  TIME && console.time("exportToJpeg");
  const url = await getMapURL("png");

  const canvas = document.createElement("canvas");
  canvas.width = svgWidth * pngResolutionInput.value;
  canvas.height = svgHeight * pngResolutionInput.value;
  const img = new Image();
  img.src = url;

  img.onload = async function () {
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    const quality = Math.min(rn(1 - pngResolutionInput.value / 20, 2), 0.92);
    const URL = await canvas.toDataURL("image/jpeg", quality);
    const link = document.createElement("a");
    link.download = getFileName() + ".jpeg";
    link.href = URL;
    link.click();
    tip(`${link.download} is saved. Open "Downloads" screen (CTRL + J) to check`, true, "success", 7000);
    window.setTimeout(() => window.URL.revokeObjectURL(URL), 5000);
  };

  TIME && console.timeEnd("exportToJpeg");
}

async function exportToPngTiles() {
  const status = byId("tileStatus");
  status.innerHTML = "Preparing files...";

  const urlSchema = await getMapURL("tiles", {debug: true, fullMap: true});
  await import("../../libs/jszip.min.js");
  const zip = new window.JSZip();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = graphWidth;
  canvas.height = graphHeight;

  const imgSchema = new Image();
  imgSchema.src = urlSchema;
  await loadImage(imgSchema);

  status.innerHTML = "Rendering schema...";
  ctx.drawImage(imgSchema, 0, 0, canvas.width, canvas.height);
  const blob = await canvasToBlob(canvas, "image/png");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  zip.file("schema.png", blob);

  // download tiles
  const url = await getMapURL("tiles", {fullMap: true});
  const tilesX = +byId("tileColsOutput").value || 2;
  const tilesY = +byId("tileRowsOutput").value || 2;
  const scale = +byId("tileScaleOutput").value || 1;
  const tolesTotal = tilesX * tilesY;

  const tileW = (graphWidth / tilesX) | 0;
  const tileH = (graphHeight / tilesY) | 0;

  const width = graphWidth * scale;
  const height = width * (tileH / tileW);
  canvas.width = width;
  canvas.height = height;

  const img = new Image();
  img.src = url;
  await loadImage(img);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  function getRowLabel(row) {
    const first = row >= alphabet.length ? alphabet[Math.floor(row / alphabet.length) - 1] : "";
    const last = alphabet[row % alphabet.length];
    return first + last;
  }

  for (let y = 0, row = 0, id = 1; y + tileH <= graphHeight; y += tileH, row++) {
    const rowName = getRowLabel(row);

    for (let x = 0, cell = 1; x + tileW <= graphWidth; x += tileW, cell++, id++) {
      status.innerHTML = `Rendering tile ${rowName}${cell} (${id} of ${tolesTotal})...`;
      ctx.drawImage(img, x, y, tileW, tileH, 0, 0, width, height);
      const blob = await canvasToBlob(canvas, "image/png");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      zip.file(`${rowName}${cell}.png`, blob);
    }
  }

  status.innerHTML = "Zipping files...";
  zip.generateAsync({type: "blob"}).then(blob => {
    status.innerHTML = "Downloading the archive...";
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = getFileName() + ".zip";
    link.click();
    link.remove();

    status.innerHTML = 'Done. Check .zip file in "Downloads" (crtl + J)';
    setTimeout(() => URL.revokeObjectURL(link.href), 5000);
  });

  // promisified img.onload
  function loadImage(img) {
    return new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = err => reject(err);
    });
  }

  // promisified canvas.toBlob
  function canvasToBlob(canvas, mimeType, qualityArgument = 1) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas toBlob() error"));
        },
        mimeType,
        qualityArgument
      );
    });
  }
}

// parse map svg to object url
async function getMapURL(type, options) {
  const {
    debug = false,
    noLabels = false,
    noWater = false,
    noScaleBar = false,
    noIce = false,
    noVignette = false,
    fullMap = false
  } = options || {};

  const cloneEl = byId("map").cloneNode(true); // clone svg
  cloneEl.id = "fantasyMap";
  document.body.appendChild(cloneEl);
  const clone = d3.select(cloneEl);
  if (!debug) clone.select("#debug")?.remove();

  const cloneDefs = cloneEl.getElementsByTagName("defs")[0];
  const svgDefs = byId("defElements");

  const isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
  if (isFirefox && type === "mesh") clone.select("#oceanPattern")?.remove();
  if (noLabels) {
    clone.select("#labels #states")?.remove();
    clone.select("#labels #burgLabels")?.remove();
    clone.select("#icons #burgIcons")?.remove();
  }
  if (noWater) {
    clone.select("#oceanBase").attr("opacity", 0);
    clone.select("#oceanPattern").attr("opacity", 0);
  }
  if (noIce) clone.select("#ice")?.remove();
  if (noVignette) clone.select("#vignette")?.remove();
  if (fullMap) {
    // reset transform to show the whole map
    clone.attr("width", graphWidth).attr("height", graphHeight);
    clone.select("#viewbox").attr("transform", null);

    if (!noScaleBar) {
      drawScaleBar(clone.select("#scaleBar"), 1);
      fitScaleBar(clone.select("#scaleBar"), graphWidth, graphHeight);
    }
  }
  if (noScaleBar) clone.select("#scaleBar")?.remove();

  if (type === "svg") removeUnusedElements(clone);
  if (customization && type === "mesh") updateMeshCells(clone);
  inlineStyle(clone);

  // remove unused filters
  const filters = cloneEl.querySelectorAll("filter");
  for (let i = 0; i < filters.length; i++) {
    const id = filters[i].id;
    if (cloneEl.querySelector("[filter='url(#" + id + ")']")) continue;
    if (cloneEl.getAttribute("filter") === "url(#" + id + ")") continue;
    filters[i].remove();
  }

  // remove unused patterns
  const patterns = cloneEl.querySelectorAll("pattern");
  for (let i = 0; i < patterns.length; i++) {
    const id = patterns[i].id;
    if (cloneEl.querySelector("[fill='url(#" + id + ")']")) continue;
    patterns[i].remove();
  }

  // remove unused symbols
  const symbols = cloneEl.querySelectorAll("symbol");
  for (let i = 0; i < symbols.length; i++) {
    const id = symbols[i].id;
    if (cloneEl.querySelector("use[*|href='#" + id + "']")) continue;
    symbols[i].remove();
  }

  // add displayed emblems
  if (layerIsOn("toggleEmblems") && emblems.selectAll("use").size()) {
    cloneEl
      .getElementById("emblems")
      ?.querySelectorAll("use")
      .forEach(el => {
        const href = el.getAttribute("href") || el.getAttribute("xlink:href");
        if (!href) return;
        const emblem = byId(href.slice(1));
        if (emblem) cloneDefs.append(emblem.cloneNode(true));
      });
  } else {
    cloneDefs.querySelector("#defs-emblems")?.remove();
  }

  {
    // replace ocean pattern href to base64
    const image = cloneEl.getElementById("oceanicPattern");
    const href = image?.getAttribute("href");
    if (href) {
      await new Promise(resolve => {
        getBase64(href, base64 => {
          image.setAttribute("href", base64);
          resolve();
        });
      });
    }
  }

  {
    // replace texture href to base64
    const image = cloneEl.querySelector("#texture > image");
    const href = image?.getAttribute("href");
    if (href) {
      await new Promise(resolve => {
        getBase64(href, base64 => {
          image.setAttribute("href", base64);
          resolve();
        });
      });
    }
  }

  // add relief icons
  if (cloneEl.getElementById("terrain")) {
    const uniqueElements = new Set();
    const terrainNodes = cloneEl.getElementById("terrain").childNodes;
    for (let i = 0; i < terrainNodes.length; i++) {
      const href = terrainNodes[i].getAttribute("href") || terrainNodes[i].getAttribute("xlink:href");
      uniqueElements.add(href);
    }

    const defsRelief = svgDefs.getElementById("defs-relief");
    for (const terrain of [...uniqueElements]) {
      const element = defsRelief.querySelector(terrain);
      if (element) cloneDefs.appendChild(element.cloneNode(true));
    }
  }

  // add wind rose
  if (cloneEl.getElementById("compass")) {
    const rose = svgDefs.getElementById("defs-compass-rose");
    if (rose) cloneDefs.appendChild(rose.cloneNode(true));
  }

  // add port icon
  if (cloneEl.getElementById("anchors")) {
    const anchor = svgDefs.getElementById("icon-anchor");
    if (anchor) cloneDefs.appendChild(anchor.cloneNode(true));
  }

  // add grid pattern
  if (cloneEl.getElementById("gridOverlay")?.hasChildNodes()) {
    const type = cloneEl.getElementById("gridOverlay").getAttribute("type");
    const pattern = svgDefs.getElementById("pattern_" + type);
    if (pattern) cloneDefs.appendChild(pattern.cloneNode(true));
  }

  if (!cloneEl.getElementById("fogging-cont")) cloneEl.getElementById("fog")?.remove(); // remove unused fog
  if (!cloneEl.getElementById("regions")) cloneEl.getElementById("statePaths")?.remove(); // removed unused statePaths
  if (!cloneEl.getElementById("labels")) cloneEl.getElementById("textPaths")?.remove(); // removed unused textPaths

  // add armies style
  if (cloneEl.getElementById("armies")) {
    cloneEl.insertAdjacentHTML(
      "afterbegin",
      "<style>#armies text {stroke: none; fill: #fff; text-shadow: 0 0 4px #000; dominant-baseline: central; text-anchor: middle; font-family: Helvetica; fill-opacity: 1;}#armies text.regimentIcon {font-size: .8em;}</style>"
    );
  }

  // add xlink: for href to support svg 1.1
  if (type === "svg") {
    cloneEl.querySelectorAll("[href]").forEach(el => {
      const href = el.getAttribute("href");
      el.removeAttribute("href");
      el.setAttribute("xlink:href", href);
    });
  }

  // add hatchings
  const hatchingUsers = cloneEl.querySelectorAll(`[fill^='url(#hatch']`);
  const hatchingFills = unique(Array.from(hatchingUsers).map(el => el.getAttribute("fill")));
  const hatchingIds = hatchingFills.map(fill => fill.slice(5, -1));
  for (const hatchingId of hatchingIds) {
    const hatching = svgDefs.getElementById(hatchingId);
    if (hatching) cloneDefs.appendChild(hatching.cloneNode(true));
  }

  // load fonts
  const usedFonts = getUsedFonts(cloneEl);
  const fontsToLoad = usedFonts.filter(font => font.src);
  if (fontsToLoad.length) {
    const dataURLfonts = await loadFontsAsDataURI(fontsToLoad);

    const fontFaces = dataURLfonts
      .map(({family, src, unicodeRange = "", variant = "normal"}) => {
        return `@font-face {font-family: "${family}"; src: ${src}; unicode-range: ${unicodeRange}; font-variant: ${variant};}`;
      })
      .join("\n");

    const style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.innerHTML = fontFaces;
    cloneEl.querySelector("defs").appendChild(style);
  }

  clone.remove();

  const serialized =
    `<?xml version="1.0" encoding="UTF-8" standalone="no"?>` + new XMLSerializer().serializeToString(cloneEl);
  const blob = new Blob([serialized], {type: "image/svg+xml;charset=utf-8"});
  const url = window.URL.createObjectURL(blob);
  window.setTimeout(() => window.URL.revokeObjectURL(url), 5000);
  return url;
}

// remove hidden g elements and g elements without children to make downloaded svg smaller in size
function removeUnusedElements(clone) {
  if (!terrain.selectAll("use").size()) clone.select("#defs-relief")?.remove();

  for (let empty = 1; empty; ) {
    empty = 0;
    clone.selectAll("g").each(function () {
      if (!this.hasChildNodes() || this.style.display === "none" || this.classList.contains("hidden")) {
        empty++;
        this.remove();
      }
      if (this.hasAttribute("display") && this.style.display === "inline") this.removeAttribute("display");
    });
  }
}

function updateMeshCells(clone) {
  const data = renderOcean.checked ? grid.cells.i : grid.cells.i.filter(i => grid.cells.h[i] >= 20);
  const scheme = getColorScheme(terrs.select("#landHeights").attr("scheme"));
  clone.select("#heights").attr("filter", "url(#blur1)");
  clone
    .select("#heights")
    .selectAll("polygon")
    .data(data)
    .join("polygon")
    .attr("points", d => getGridPolygon(d))
    .attr("id", d => "cell" + d)
    .attr("stroke", d => getColor(grid.cells.h[d], scheme));
}

// for each g element get inline style
function inlineStyle(clone) {
  const emptyG = clone.append("g").node();
  const defaultStyles = window.getComputedStyle(emptyG);

  clone.selectAll("g, #ruler *, #scaleBar > text").each(function () {
    const compStyle = window.getComputedStyle(this);
    let style = "";

    for (let i = 0; i < compStyle.length; i++) {
      const key = compStyle[i];
      const value = compStyle.getPropertyValue(key);

      if (key === "cursor") continue; // cursor should be default
      if (this.hasAttribute(key)) continue; // don't add style if there is the same attribute
      if (value === defaultStyles.getPropertyValue(key)) continue;
      style += key + ":" + value + ";";
    }

    for (const key in compStyle) {
      const value = compStyle.getPropertyValue(key);

      if (key === "cursor") continue; // cursor should be default
      if (this.hasAttribute(key)) continue; // don't add style if there is the same attribute
      if (value === defaultStyles.getPropertyValue(key)) continue;
      style += key + ":" + value + ";";
    }

    if (style != "") this.setAttribute("style", style);
  });

  emptyG.remove();
}

function saveGeoJsonCells() {
  const {cells, vertices} = pack;
  const json = {type: "FeatureCollection", features: []};

  const getPopulation = i => {
    const [r, u] = getCellPopulation(i);
    return rn(r + u);
  };

  const getHeight = i => parseInt(getFriendlyHeight([...cells.p[i]]));

  function getCellCoordinates(cellVertices) {
    const coordinates = cellVertices.map(vertex => {
      const [x, y] = vertices.p[vertex];
      return getCoordinates(x, y, 4);
    });
    return [[...coordinates, coordinates[0]]];
  }

  cells.i.forEach(i => {
    const coordinates = getCellCoordinates(cells.v[i]);
    const height = getHeight(i);
    const biome = cells.biome[i];
    const type = pack.features[cells.f[i]].type;
    const population = getPopulation(i);
    const state = cells.state[i];
    const province = cells.province[i];
    const culture = cells.culture[i];
    const religion = cells.religion[i];
    const neighbors = cells.c[i];

    const properties = {id: i, height, biome, type, population, state, province, culture, religion, neighbors};
    const feature = {type: "Feature", geometry: {type: "Polygon", coordinates}, properties};
    json.features.push(feature);
  });

  const fileName = getFileName("Cells") + ".geojson";
  downloadFile(JSON.stringify(json), fileName, "application/json");
}


function ck3DrawHeightmap() {
  TIME && console.time("drawHeightmap");

  const land = document.getElementById("landHeights").cloneNode(true);
  land.setAttribute("scheme", "monochrome");
  land.setAttribute("opacity", "1");
  land.setAttribute("terracing", "0");
  land.setAttribute("shape-rendering", "optimizeSpeed");
  land.setAttribute("skip", "0");
  

  const paths = new Array(101);

  // land cells
  {
    const {cells, vertices} = pack;
    const used = new Uint8Array(cells.i.length);

    const skip = +land.getAttribute("skip") + 1 || 1;
    const relax = +land.getAttribute("relax") || 0;
    lineGen.curve(d3[land.getAttribute("curve") || "curveBasisClosed"]);

    let currentLayer = 20;
    const heights = Array.from(cells.i).sort((a, b) => cells.h[a] - cells.h[b]);
    for (const i of heights) {
      const h = cells.h[i];
      if (h > currentLayer) currentLayer += skip;
      if (h < currentLayer) continue;
      if (currentLayer > 100) break; // no layers possible with height > 100
      if (used[i]) continue; // already marked
      const onborder = cells.c[i].some(n => cells.h[n] < h);
      if (!onborder) continue;
      const vertex = cells.v[i].find(v => vertices.c[v].some(i => cells.h[i] < h));
      const chain = connectVertices(cells, vertices, vertex, h, used);
      if (chain.length < 3) continue;
      const points = simplifyLine(chain, relax).map(v => vertices.p[v]);
      if (!paths[h]) paths[h] = "";
      paths[h] += round(lineGen(points));
    }
  }

  // render paths
  for (const height of d3.range(0, 101)) {
    const group = land;
    const scheme = getColorScheme(group.getAttribute("scheme"));

    if (height === 20) {
      // draw base land layer
      const e = document.createElement("rect");
      e.setAttribute("x", 0);
      e.setAttribute("y", 0);
      e.setAttribute("width", graphWidth);
      e.setAttribute("height", graphHeight);
      e.setAttribute("fill", scheme(0.8));
      group.appendChild(e);
    }

    if (paths[height] && paths[height].length >= 10) {
      const color = getColor(height, scheme);
      const e = document.createElement("path");
      e.setAttribute("d", paths[height]);
      e.setAttribute("fill", color);
      e.setAttribute("data-height", height);
      group.appendChild(e);
    }
  }

  // connect vertices to chain
  function connectVertices(cells, vertices, start, h, used) {
    const n = cells.i.length;
    const chain = []; // vertices chain to form a path
    for (let i = 0, current = start; i === 0 || (current !== start && i < 20000); i++) {
      const prev = chain[chain.length - 1]; // previous vertex in chain
      chain.push(current); // add current vertex to sequence
      const c = vertices.c[current]; // cells adjacent to vertex
      c.filter(c => cells.h[c] === h).forEach(c => (used[c] = 1));
      const c0 = c[0] >= n || cells.h[c[0]] < h;
      const c1 = c[1] >= n || cells.h[c[1]] < h;
      const c2 = c[2] >= n || cells.h[c[2]] < h;
      const v = vertices.v[current]; // neighboring vertices
      if (v[0] !== prev && c0 !== c1) current = v[0];
      else if (v[1] !== prev && c1 !== c2) current = v[1];
      else if (v[2] !== prev && c0 !== c2) current = v[2];
      if (current === chain[chain.length - 1]) {
        ERROR && console.error("Next vertex is not found");
        break;
      }
    }
    return chain;
  }

  function simplifyLine(chain, simplification) {
    if (!simplification) return chain;
    const n = simplification + 1; // filter each nth element
    return chain.filter((d, i) => i % n === 0);
  }

  // lakes have to be the last element for them to be rendered on top of land
  const lakes = document.getElementById("lakes").cloneNode(true);
  lakes.setAttribute("fill", "rgb(0,0,0)");
  for (const c of lakes.children) {
    c.setAttribute("fill", "rgb(0,0,0)");
    c.setAttribute("opacity", 1);
    c.setAttribute("stroke-width", 0);
  }
  land.appendChild(lakes);

  TIME && console.timeEnd("drawHeightmap");

  return wrapInSvg(land, "svgland", getFileName("land"), {includeDefs: true});
}

function ck3DrawRelief() {
  
  function getBiomeIcon(i, b) {
    let type = b[Math.floor(Math.random() * b.length)];
    const temp = grid.cells.temp[pack.cells.g[i]];
    if (type === "conifer" && temp < 0) type = "coniferSnow";
    return getIcon(type);
  }

  function getVariant(type) {
    switch (type) {
      case "mount":
        return rand(2, 7);
      case "mountSnow":
        return rand(1, 6);
      case "hill":
        return rand(2, 5);
      case "conifer":
        return 2;
      case "coniferSnow":
        return 1;
      case "swamp":
        return rand(2, 3);
      case "cactus":
        return rand(1, 3);
      case "deadTree":
        return rand(1, 2);
      default:
        return 2;
    }
  }

  function getOldIcon(type) {
    switch (type) {
      case "mountSnow":
        return "mount";
      case "vulcan":
        return "mount";
      case "coniferSnow":
        return "conifer";
      case "cactus":
        return "dune";
      case "deadTree":
        return "dune";
      default:
        return type;
    }
  }

  function getIcon(type) {
    const set = terrain.getAttribute("set") || "simple";
    if (set === "simple") return "#relief-" + getOldIcon(type) + "-1";
    if (set === "colored") return "#relief-" + type + "-" + getVariant(type);
    if (set === "gray") return "#relief-" + type + "-" + getVariant(type) + "-bw";
    return "#relief-" + getOldIcon(type) + "-1"; // simple
  }

  TIME && console.time("drawRelief");

  const terrain = document.getElementById("terrain").cloneNode();

  // const coastLine = document.getElementById("coastline").cloneNode(true);
  // coastLine.setAttribute("fill", "#eef6fb")
  // terrain.appendChild(coastLine);

  const cells = pack.cells;
  const density = terrain.getAttribute("density") || 0.4;
  const size = 2 * (terrain.getAttribute("size") || 1);
  const mod = 0.2 * size; // size modifier
  const relief = [];

  for (const i of cells.i) {
    const height = cells.h[i];
    if (height < 20) continue; // no icons on water
    if (cells.r[i]) continue; // no icons on rivers
    const biome = cells.biome[i];
    if (height < 50 && biomesData.iconsDensity[biome] === 0) continue; // no icons for this biome

    const polygon = getPackPolygon(i);
    const [minX, maxX] = d3.extent(polygon, p => p[0]);
    const [minY, maxY] = d3.extent(polygon, p => p[1]);

    if (height < 50) placeBiomeIcons(i, biome);
    else placeReliefIcons(i);

    function placeBiomeIcons() {
      const iconsDensity = biomesData.iconsDensity[biome] / 100;
      const radius = 2 / iconsDensity / density;
      if (Math.random() > iconsDensity * 10) return;

      try{
        for (const [cx, cy] of poissonDiscSampler(minX, minY, maxX, maxY, radius)) {
          if (!d3.polygonContains(polygon, [cx, cy])) continue;
          let h = (4 + Math.random()) * size;
          const icon = getBiomeIcon(i, biomesData.icons[biome]);
          if (icon === "#relief-grass-1") h *= 1.2;
          relief.push({i: icon, x: rn(cx - h, 2), y: rn(cy - h, 2), s: rn(h * 2, 2)});
        }
      } catch {
        // do nothing
      }
    }

    function placeReliefIcons(i) {
      const radius = 2 / density;
      const [icon, h] = getReliefIcon(i, height);

      for (const [cx, cy] of poissonDiscSampler(minX, minY, maxX, maxY, radius)) {
        if (!d3.polygonContains(polygon, [cx, cy])) continue;
        relief.push({i: icon, x: rn(cx - h, 2), y: rn(cy - h, 2), s: rn(h * 2, 2)});
      }
    }

    function getReliefIcon(i, h) {
      const temp = grid.cells.temp[pack.cells.g[i]];
      const type = h > 70 && temp < 0 ? "mountSnow" : h > 70 ? "mount" : "hill";
      const size = h > 70 ? (h - 45) * mod : minmax((h - 40) * mod, 3, 6);
      return [getIcon(type), size];
    }
  }

  // sort relief icons by y+size
  relief.sort((a, b) => a.y + a.s - (b.y + b.s));

  
  const coastLine = document.getElementById("coastline").cloneNode();
  coastLine.setAttribute("fill", "#eef6fb")
  
  const sea_island = document.getElementById("sea_island").cloneNode(true);
  sea_island.setAttribute("opacity", 1);
  sea_island.removeAttribute("filter");
  coastLine.appendChild(sea_island);

  const lake_island = document.getElementById("lake_island").cloneNode(true);
  lake_island.setAttribute("opacity", 1);
  lake_island.removeAttribute("filter");
  coastLine.appendChild(lake_island);

  let reliefHTML = coastLine.outerHTML;
  for (const r of relief) {
    reliefHTML += `<use href="${r.i}" x="${r.x}" y="${r.y}" width="${r.s}" height="${r.s}"/>`;
  }
  terrain.innerHTML = reliefHTML;

  TIME && console.timeEnd("drawRelief");
  

  return terrain;
  // return wrapInSvg(terrain, "svgterrain", getFileName("terrain"), {includeDefsRelief:true});
}

function ck3DrawOceanLayers() {
  let cells, vertices, pointsN, used;
  
  function randomizeOutline() {
    const limits = [];
    let odd = 0.2;
    for (let l = -9; l < 0; l++) {
      if (P(odd)) {
        odd = 0.2;
        limits.push(l);
      } else {
        odd *= 2;
      }
    }
    return limits;
  }

  // connect vertices to chain
  function connectVertices(start, t) {
    const chain = []; // vertices chain to form a path
    for (let i = 0, current = start; i === 0 || (current !== start && i < 10000); i++) {
      const prev = chain[chain.length - 1]; // previous vertex in chain
      chain.push(current); // add current vertex to sequence
      const c = vertices.c[current]; // cells adjacent to vertex
      c.filter(c => cells.t[c] === t).forEach(c => (used[c] = 1));
      const v = vertices.v[current]; // neighboring vertices
      const c0 = !cells.t[c[0]] || cells.t[c[0]] === t - 1;
      const c1 = !cells.t[c[1]] || cells.t[c[1]] === t - 1;
      const c2 = !cells.t[c[2]] || cells.t[c[2]] === t - 1;
      if (v[0] !== undefined && v[0] !== prev && c0 !== c1) current = v[0];
      else if (v[1] !== undefined && v[1] !== prev && c1 !== c2) current = v[1];
      else if (v[2] !== undefined && v[2] !== prev && c0 !== c2) current = v[2];
      if (current === chain[chain.length - 1]) {
        ERROR && console.error("Next vertex is not found");
        break;
      }
    }
    chain.push(chain[0]); // push first vertex as the last one
    return chain;
  }

  const oceanLayers = document.createElement("g");
  oceanLayers.setAttribute("layers", "-6, -3, -1");
  // oceanLayers.setAttribute("filter", "url(#filter-sepia)");
  oceanLayers.innerHTML = `<rect x="0" y="0" width="100%" height="100%" fill="#466eab"/>`;

  const outline = oceanLayers.getAttribute("layers");


  if (outline === "none") return;
  TIME && console.time("drawOceanLayers");

  lineGen.curve(d3.curveBasisClosed);
  (cells = grid.cells), (pointsN = grid.cells.i.length), (vertices = grid.vertices);
  const limits = outline === "random" ? randomizeOutline() : outline.split(",").map(s => +s);

  const chains = [];
  const opacity = rn(0.4 / limits.length, 2);
  used = new Uint8Array(pointsN); // to detect already passed cells

  for (const i of cells.i) {
    const t = cells.t[i];
    if (t > 0) continue;
    if (used[i] || !limits.includes(t)) continue;
    const start = findStart(i, t);
    if (!start) continue;
    used[i] = 1;
    const chain = connectVertices(start, t); // vertices chain to form a path
    if (chain.length < 4) continue;
    const relax = 1 + t * -2; // select only n-th point
    const relaxed = chain.filter((v, i) => !(i % relax) || vertices.c[v].some(c => c >= pointsN));
    if (relaxed.length < 4) continue;
    const points = clipPoly(
      relaxed.map(v => vertices.p[v]),
      1
    );
    chains.push([t, points]);
  }

  for (const t of limits) {
    const layer = chains.filter(c => c[0] === t);
    let path = layer.map(c => round(lineGen(c[1]))).join("");
    if (path) {
      const p = document.createElement("path");
      p.setAttribute("d", path);
      p.setAttribute("fill", "#ecf2f9");
      p.setAttribute("fill-opacity", opacity);
      oceanLayers.appendChild(p);
    }
  }

  // find eligible cell vertex to start path detection
  function findStart(i, t) {
    if (cells.b[i]) return cells.v[i].find(v => vertices.c[v].some(c => c >= pointsN)); // map border cell
    return cells.v[i][cells.c[i].findIndex(c => cells.t[c] < t || !cells.t[c])];
  }

  TIME && console.timeEnd("drawOceanLayers");

  return oceanLayers;
  // return wrapInSvg(oceanLayers, "svgOceanLayers", getFileName("svgOceanLayers"), {includeDefs:true})
};

function ck3DrawFlatMap(){
  const ocean = ck3DrawOceanLayers();
  const relief = ck3DrawRelief();

  const viewBox = document.createElement("g");
  viewBox.appendChild(ocean);
  viewBox.appendChild(relief);

  return wrapInSvg(viewBox, "svgFlatMap", getFileName("svgFlatMap"), {includeDefs:true, includeDefsRelief:true});
}

function ck3DrawBiomes() {
  const biomes = document.getElementById("biomes").cloneNode();
  biomes.setAttribute("shape-rendering", "optimizeSpeed");

  const cells = pack.cells,
    vertices = pack.vertices,
    n = cells.i.length;
  const used = new Uint8Array(cells.i.length);
  const paths = new Array(biomesData.i.length).fill("");

  for (const i of cells.i) {
    if (!cells.biome[i]) continue; // no need to mark marine biome (liquid water)
    if (used[i]) continue; // already marked
    const b = cells.biome[i];
    const onborder = cells.c[i].some(n => cells.biome[n] !== b);
    if (!onborder) continue;
    const edgeVerticle = cells.v[i].find(v => vertices.c[v].some(i => cells.biome[i] !== b));
    const chain = connectVertices(edgeVerticle, b);
    if (chain.length < 3) continue;
    const points = clipPoly(
      chain.map(v => vertices.p[v]),
      1
    );
    paths[b] += "M" + points.join("L") + "Z";
  }

  paths.forEach(function (d, i) {
    if (d.length < 10) return;
    var e = document.createElement("path");
    e.setAttribute("d", d);
    e.setAttribute("fill", biomesData.color[i]);
    e.setAttribute("stroke", biomesData.color[i]);
    e.setAttribute("id", "biome" + i);
    biomes.appendChild(e);
  });

  // connect vertices to chain
  function connectVertices(start, b) {
    const chain = []; // vertices chain to form a path
    for (let i = 0, current = start; i === 0 || (current !== start && i < 20000); i++) {
      const prev = chain[chain.length - 1]; // previous vertex in chain
      chain.push(current); // add current vertex to sequence
      const c = vertices.c[current]; // cells adjacent to vertex
      c.filter(c => cells.biome[c] === b).forEach(c => (used[c] = 1));
      const c0 = c[0] >= n || cells.biome[c[0]] !== b;
      const c1 = c[1] >= n || cells.biome[c[1]] !== b;
      const c2 = c[2] >= n || cells.biome[c[2]] !== b;
      const v = vertices.v[current]; // neighboring vertices
      if (v[0] !== prev && c0 !== c1) current = v[0];
      else if (v[1] !== prev && c1 !== c2) current = v[1];
      else if (v[2] !== prev && c0 !== c2) current = v[2];
      if (current === chain[chain.length - 1]) {
        ERROR && console.error("Next vertex is not found");
        break;
      }
    }
    return chain;
  }

  return wrapInSvg(biomes, "svgbiomes", getFileName("biomes"));
}

function ck3GeoJsonCells() {
  const json = {type: "FeatureCollection", features: []};

  const getPopulation = i => {
    const [r, u] = getCellPopulation(i);
    return rn(r + u);
  };

  const getHeight = i => parseInt(getFriendlyHeight([...cells.p[i]]));

  function getCellCoordinates(cellVertices) {
    const coordinates = cellVertices.map(vertex => {
      const [x, y] = vertices.p[vertex];
      return getCoordinates(x, y, 4);
    });
    return [[...coordinates, coordinates[0]]];
  }

  cells.i.forEach(i => {
    const coordinates = getCellCoordinates(cells.v[i]);
    const height = getHeight(i);
    const biome = cells.biome[i];
    const type = pack.features[cells.f[i]].type;
    const population = getPopulation(i);
    const state = cells.state[i];
    const province = cells.province[i];
    const culture = cells.culture[i];
    const religion = cells.religion[i];
    const neighbors = cells.c[i];

    const properties = {id: i, height, biome, type, population, state, province, culture, religion, neighbors};
    const feature = {type: "Feature", geometry: {type: "Polygon", coordinates}, properties};
    json.features.push(feature);
  });

  const fileName = getFileName("Cells") + ".geojson";
  downloadFile(JSON.stringify(json), fileName, "application/json");
}


function ck3DrawHeightmap() {
  TIME && console.time("drawHeightmap");

  const land = document.getElementById("landHeights").cloneNode(true);
  land.setAttribute("scheme", "monochrome");
  land.setAttribute("opacity", "1");
  land.setAttribute("terracing", "0");
  land.setAttribute("shape-rendering", "optimizeSpeed");
  land.setAttribute("skip", "0");
  

  const paths = new Array(101);

  // land cells
  {
    const {cells, vertices} = pack;
    const used = new Uint8Array(cells.i.length);

    const skip = +land.getAttribute("skip") + 1 || 1;
    const relax = +land.getAttribute("relax") || 0;
    lineGen.curve(d3[land.getAttribute("curve") || "curveBasisClosed"]);

    let currentLayer = 20;
    const heights = Array.from(cells.i).sort((a, b) => cells.h[a] - cells.h[b]);
    for (const i of heights) {
      const h = cells.h[i];
      if (h > currentLayer) currentLayer += skip;
      if (h < currentLayer) continue;
      if (currentLayer > 100) break; // no layers possible with height > 100
      if (used[i]) continue; // already marked
      const onborder = cells.c[i].some(n => cells.h[n] < h);
      if (!onborder) continue;
      const vertex = cells.v[i].find(v => vertices.c[v].some(i => cells.h[i] < h));
      const chain = connectVertices(cells, vertices, vertex, h, used);
      if (chain.length < 3) continue;
      const points = simplifyLine(chain, relax).map(v => vertices.p[v]);
      if (!paths[h]) paths[h] = "";
      paths[h] += round(lineGen(points));
    }
  }

  // render paths
  for (const height of d3.range(0, 101)) {
    const group = land;
    const scheme = getColorScheme(group.getAttribute("scheme"));

    if (height === 20) {
      // draw base land layer
      const e = document.createElement("rect");
      e.setAttribute("x", 0);
      e.setAttribute("y", 0);
      e.setAttribute("width", graphWidth);
      e.setAttribute("height", graphHeight);
      e.setAttribute("fill", scheme(0.8));
      group.appendChild(e);
    }

    if (paths[height] && paths[height].length >= 10) {
      const color = getColor(height, scheme);
      const e = document.createElement("path");
      e.setAttribute("d", paths[height]);
      e.setAttribute("fill", color);
      e.setAttribute("data-height", height);
      group.appendChild(e);
    }
  }

  // connect vertices to chain
  function connectVertices(cells, vertices, start, h, used) {
    const n = cells.i.length;
    const chain = []; // vertices chain to form a path
    for (let i = 0, current = start; i === 0 || (current !== start && i < 20000); i++) {
      const prev = chain[chain.length - 1]; // previous vertex in chain
      chain.push(current); // add current vertex to sequence
      const c = vertices.c[current]; // cells adjacent to vertex
      c.filter(c => cells.h[c] === h).forEach(c => (used[c] = 1));
      const c0 = c[0] >= n || cells.h[c[0]] < h;
      const c1 = c[1] >= n || cells.h[c[1]] < h;
      const c2 = c[2] >= n || cells.h[c[2]] < h;
      const v = vertices.v[current]; // neighboring vertices
      if (v[0] !== prev && c0 !== c1) current = v[0];
      else if (v[1] !== prev && c1 !== c2) current = v[1];
      else if (v[2] !== prev && c0 !== c2) current = v[2];
      if (current === chain[chain.length - 1]) {
        ERROR && console.error("Next vertex is not found");
        break;
      }
    }
    return chain;
  }

  function simplifyLine(chain, simplification) {
    if (!simplification) return chain;
    const n = simplification + 1; // filter each nth element
    return chain.filter((d, i) => i % n === 0);
  }

  // lakes have to be the last element for them to be rendered on top of land
  const lakes = document.getElementById("lakes").cloneNode(true);
  lakes.setAttribute("fill", "rgb(0,0,0)");
  for (const c of lakes.children) {
    c.setAttribute("fill", "rgb(0,0,0)");
    c.setAttribute("opacity", 1);
    c.setAttribute("stroke-width", 0);
  }
  land.appendChild(lakes);

  TIME && console.timeEnd("drawHeightmap");

  return wrapInSvg(land, "svgland", getFileName("land"), {includeDefs: true});
}

function ck3DrawRelief() {
  
  function getBiomeIcon(i, b) {
    let type = b[Math.floor(Math.random() * b.length)];
    const temp = grid.cells.temp[pack.cells.g[i]];
    if (type === "conifer" && temp < 0) type = "coniferSnow";
    return getIcon(type);
  }

  function getVariant(type) {
    switch (type) {
      case "mount":
        return rand(2, 7);
      case "mountSnow":
        return rand(1, 6);
      case "hill":
        return rand(2, 5);
      case "conifer":
        return 2;
      case "coniferSnow":
        return 1;
      case "swamp":
        return rand(2, 3);
      case "cactus":
        return rand(1, 3);
      case "deadTree":
        return rand(1, 2);
      default:
        return 2;
    }
  }

  function getOldIcon(type) {
    switch (type) {
      case "mountSnow":
        return "mount";
      case "vulcan":
        return "mount";
      case "coniferSnow":
        return "conifer";
      case "cactus":
        return "dune";
      case "deadTree":
        return "dune";
      default:
        return type;
    }
  }

  function getIcon(type) {
    const set = terrain.getAttribute("set") || "simple";
    if (set === "simple") return "#relief-" + getOldIcon(type) + "-1";
    if (set === "colored") return "#relief-" + type + "-" + getVariant(type);
    if (set === "gray") return "#relief-" + type + "-" + getVariant(type) + "-bw";
    return "#relief-" + getOldIcon(type) + "-1"; // simple
  }

  TIME && console.time("drawRelief");

  const terrain = document.getElementById("terrain").cloneNode();

  // const coastLine = document.getElementById("coastline").cloneNode(true);
  // coastLine.setAttribute("fill", "#eef6fb")
  // terrain.appendChild(coastLine);

  const cells = pack.cells;
  const density = terrain.getAttribute("density") || 0.4;
  const size = 2 * (terrain.getAttribute("size") || 1);
  const mod = 0.2 * size; // size modifier
  const relief = [];

  for (const i of cells.i) {
    const height = cells.h[i];
    if (height < 20) continue; // no icons on water
    if (cells.r[i]) continue; // no icons on rivers
    const biome = cells.biome[i];
    if (height < 50 && biomesData.iconsDensity[biome] === 0) continue; // no icons for this biome

    const polygon = getPackPolygon(i);
    const [minX, maxX] = d3.extent(polygon, p => p[0]);
    const [minY, maxY] = d3.extent(polygon, p => p[1]);

    if (height < 50) placeBiomeIcons(i, biome);
    else placeReliefIcons(i);

    function placeBiomeIcons() {
      const iconsDensity = biomesData.iconsDensity[biome] / 100;
      const radius = 2 / iconsDensity / density;
      if (Math.random() > iconsDensity * 10) return;

      try{
        for (const [cx, cy] of poissonDiscSampler(minX, minY, maxX, maxY, radius)) {
          if (!d3.polygonContains(polygon, [cx, cy])) continue;
          let h = (4 + Math.random()) * size;
          const icon = getBiomeIcon(i, biomesData.icons[biome]);
          if (icon === "#relief-grass-1") h *= 1.2;
          relief.push({i: icon, x: rn(cx - h, 2), y: rn(cy - h, 2), s: rn(h * 2, 2)});
        }
      } catch {
        // do nothing
      }
    }

    function placeReliefIcons(i) {
      const radius = 2 / density;
      const [icon, h] = getReliefIcon(i, height);

      for (const [cx, cy] of poissonDiscSampler(minX, minY, maxX, maxY, radius)) {
        if (!d3.polygonContains(polygon, [cx, cy])) continue;
        relief.push({i: icon, x: rn(cx - h, 2), y: rn(cy - h, 2), s: rn(h * 2, 2)});
      }
    }

    function getReliefIcon(i, h) {
      const temp = grid.cells.temp[pack.cells.g[i]];
      const type = h > 70 && temp < 0 ? "mountSnow" : h > 70 ? "mount" : "hill";
      const size = h > 70 ? (h - 45) * mod : minmax((h - 40) * mod, 3, 6);
      return [getIcon(type), size];
    }
  }

  // sort relief icons by y+size
  relief.sort((a, b) => a.y + a.s - (b.y + b.s));

  
  const coastLine = document.getElementById("coastline").cloneNode();
  coastLine.setAttribute("fill", "#eef6fb")
  
  const sea_island = document.getElementById("sea_island").cloneNode(true);
  sea_island.setAttribute("opacity", 1);
  sea_island.removeAttribute("filter");
  coastLine.appendChild(sea_island);

  const lake_island = document.getElementById("lake_island").cloneNode(true);
  lake_island.setAttribute("opacity", 1);
  lake_island.removeAttribute("filter");
  coastLine.appendChild(lake_island);

  let reliefHTML = coastLine.outerHTML;
  for (const r of relief) {
    reliefHTML += `<use href="${r.i}" x="${r.x}" y="${r.y}" width="${r.s}" height="${r.s}"/>`;
  }
  terrain.innerHTML = reliefHTML;

  TIME && console.timeEnd("drawRelief");
  

  return terrain;
  // return wrapInSvg(terrain, "svgterrain", getFileName("terrain"), {includeDefsRelief:true});
}

function ck3DrawOceanLayers() {
  let cells, vertices, pointsN, used;
  
  function randomizeOutline() {
    const limits = [];
    let odd = 0.2;
    for (let l = -9; l < 0; l++) {
      if (P(odd)) {
        odd = 0.2;
        limits.push(l);
      } else {
        odd *= 2;
      }
    }
    return limits;
  }

  // connect vertices to chain
  function connectVertices(start, t) {
    const chain = []; // vertices chain to form a path
    for (let i = 0, current = start; i === 0 || (current !== start && i < 10000); i++) {
      const prev = chain[chain.length - 1]; // previous vertex in chain
      chain.push(current); // add current vertex to sequence
      const c = vertices.c[current]; // cells adjacent to vertex
      c.filter(c => cells.t[c] === t).forEach(c => (used[c] = 1));
      const v = vertices.v[current]; // neighboring vertices
      const c0 = !cells.t[c[0]] || cells.t[c[0]] === t - 1;
      const c1 = !cells.t[c[1]] || cells.t[c[1]] === t - 1;
      const c2 = !cells.t[c[2]] || cells.t[c[2]] === t - 1;
      if (v[0] !== undefined && v[0] !== prev && c0 !== c1) current = v[0];
      else if (v[1] !== undefined && v[1] !== prev && c1 !== c2) current = v[1];
      else if (v[2] !== undefined && v[2] !== prev && c0 !== c2) current = v[2];
      if (current === chain[chain.length - 1]) {
        ERROR && console.error("Next vertex is not found");
        break;
      }
    }
    chain.push(chain[0]); // push first vertex as the last one
    return chain;
  }

  const oceanLayers = document.createElement("g");
  oceanLayers.setAttribute("layers", "-6, -3, -1");
  // oceanLayers.setAttribute("filter", "url(#filter-sepia)");
  oceanLayers.innerHTML = `<rect x="0" y="0" width="100%" height="100%" fill="#466eab"/>`;

  const outline = oceanLayers.getAttribute("layers");


  if (outline === "none") return;
  TIME && console.time("drawOceanLayers");

  lineGen.curve(d3.curveBasisClosed);
  (cells = grid.cells), (pointsN = grid.cells.i.length), (vertices = grid.vertices);
  const limits = outline === "random" ? randomizeOutline() : outline.split(",").map(s => +s);

  const chains = [];
  const opacity = rn(0.4 / limits.length, 2);
  used = new Uint8Array(pointsN); // to detect already passed cells

  for (const i of cells.i) {
    const t = cells.t[i];
    if (t > 0) continue;
    if (used[i] || !limits.includes(t)) continue;
    const start = findStart(i, t);
    if (!start) continue;
    used[i] = 1;
    const chain = connectVertices(start, t); // vertices chain to form a path
    if (chain.length < 4) continue;
    const relax = 1 + t * -2; // select only n-th point
    const relaxed = chain.filter((v, i) => !(i % relax) || vertices.c[v].some(c => c >= pointsN));
    if (relaxed.length < 4) continue;
    const points = clipPoly(
      relaxed.map(v => vertices.p[v]),
      1
    );
    chains.push([t, points]);
  }

  for (const t of limits) {
    const layer = chains.filter(c => c[0] === t);
    let path = layer.map(c => round(lineGen(c[1]))).join("");
    if (path) {
      const p = document.createElement("path");
      p.setAttribute("d", path);
      p.setAttribute("fill", "#ecf2f9");
      p.setAttribute("fill-opacity", opacity);
      oceanLayers.appendChild(p);
    }
  }

  // find eligible cell vertex to start path detection
  function findStart(i, t) {
    if (cells.b[i]) return cells.v[i].find(v => vertices.c[v].some(c => c >= pointsN)); // map border cell
    return cells.v[i][cells.c[i].findIndex(c => cells.t[c] < t || !cells.t[c])];
  }

  TIME && console.timeEnd("drawOceanLayers");

  return oceanLayers;
  // return wrapInSvg(oceanLayers, "svgOceanLayers", getFileName("svgOceanLayers"), {includeDefs:true})
};

function ck3DrawFlatMap(){
  const ocean = ck3DrawOceanLayers();
  const relief = ck3DrawRelief();

  const viewBox = document.createElement("g");
  viewBox.appendChild(ocean);
  viewBox.appendChild(relief);

  return wrapInSvg(viewBox, "svgFlatMap", getFileName("svgFlatMap"), {includeDefs:true, includeDefsRelief:true});
}

function ck3DrawBiomes() {
  const biomes = document.getElementById("biomes").cloneNode();
  biomes.setAttribute("shape-rendering", "optimizeSpeed");

  const cells = pack.cells,
    vertices = pack.vertices,
    n = cells.i.length;
  const used = new Uint8Array(cells.i.length);
  const paths = new Array(biomesData.i.length).fill("");

  for (const i of cells.i) {
    if (!cells.biome[i]) continue; // no need to mark marine biome (liquid water)
    if (used[i]) continue; // already marked
    const b = cells.biome[i];
    const onborder = cells.c[i].some(n => cells.biome[n] !== b);
    if (!onborder) continue;
    const edgeVerticle = cells.v[i].find(v => vertices.c[v].some(i => cells.biome[i] !== b));
    const chain = connectVertices(edgeVerticle, b);
    if (chain.length < 3) continue;
    const points = clipPoly(
      chain.map(v => vertices.p[v]),
      1
    );
    paths[b] += "M" + points.join("L") + "Z";
  }

  paths.forEach(function (d, i) {
    if (d.length < 10) return;
    var e = document.createElement("path");
    e.setAttribute("d", d);
    e.setAttribute("fill", biomesData.color[i]);
    e.setAttribute("stroke", biomesData.color[i]);
    e.setAttribute("id", "biome" + i);
    biomes.appendChild(e);
  });

  // connect vertices to chain
  function connectVertices(start, b) {
    const chain = []; // vertices chain to form a path
    for (let i = 0, current = start; i === 0 || (current !== start && i < 20000); i++) {
      const prev = chain[chain.length - 1]; // previous vertex in chain
      chain.push(current); // add current vertex to sequence
      const c = vertices.c[current]; // cells adjacent to vertex
      c.filter(c => cells.biome[c] === b).forEach(c => (used[c] = 1));
      const c0 = c[0] >= n || cells.biome[c[0]] !== b;
      const c1 = c[1] >= n || cells.biome[c[1]] !== b;
      const c2 = c[2] >= n || cells.biome[c[2]] !== b;
      const v = vertices.v[current]; // neighboring vertices
      if (v[0] !== prev && c0 !== c1) current = v[0];
      else if (v[1] !== prev && c1 !== c2) current = v[1];
      else if (v[2] !== prev && c0 !== c2) current = v[2];
      if (current === chain[chain.length - 1]) {
        ERROR && console.error("Next vertex is not found");
        break;
      }
    }
    return chain;
  }

  return wrapInSvg(biomes, "svgbiomes", getFileName("biomes"));
}

function ck3GeoJsonCells() {
  const {cells, vertices} = pack;
  const json = {type: "FeatureCollection", features: []};
  
  const getPopulation = i => {
    const [r, u] = getCellPopulation(i);
    return rn(r + u);
  };
  const getHeight = i => parseInt(getFriendlyHeight([cells.p[i][0], cells.p[i][1]]));

  function getCellCoordinates(cellVertices) {
    const coordinates = cellVertices.map(vertex => {
      const [x, y] = vertices.p[vertex];
      return getCoordinates(x, y, 4);
    });
    return [[...coordinates, coordinates[0]]];
  }

  cells.i.forEach(i => {
    const coordinates = getCellCoordinates(cells.v[i]);
    const height = getHeight(i);
    const biome = cells.biome[i];
    const type = pack.features[cells.f[i]].type;
    const population = getPopulation(i);
    const state = cells.state[i];
    const province = cells.province[i];
    const culture = cells.culture[i];
    const religion = cells.religion[i];
    const neighbors = cells.c[i];

    const properties = {id: i, height, biome, type, population, state, province, culture, religion, neighbors};
    const feature = {type: "Feature", geometry: {type: "Polygon", coordinates}, properties};
    json.features.push(feature);
  });

  return wrapInXml(JSON.stringify(json), "geojson", getFileName("Cells"));
}

// function wrapInSvg(element, id, filename) {
//   var svg = document.getElementById("map").cloneNode();
//   svg.setAttribute("id", id);
//   svg.setAttribute("fileName", filename);
//   var defs = document.getElementById("map").getElementsByTagName("defs")[0].cloneNode();
//   var filters = document.getElementById("filters").cloneNode(true);
//   defs.appendChild(filters);

//   var deftemp = document.getElementById("deftemp").cloneNode();
//   var maskLand = document.getElementById("land").cloneNode(true);
//   var maskWater = document.getElementById("water").cloneNode(true);
//   deftemp.appendChild(maskLand)
//   deftemp.appendChild(maskWater);
//   defs.appendChild(deftemp);


//   svg.appendChild(defs);
//   svg.appendChild(element);
//   return svg;
// }


function wrapInSvg(element, id, filename, {includeDefs, includeDefsRelief} = {}) {
  var svg = document.getElementById("map").cloneNode();
  svg.setAttribute("id", id);
  svg.setAttribute("fileName", filename);
  // Use default values if localStorage values are null
  const width = localStorage.getItem('mapWidth') || graphWidth || 960;
  const height = localStorage.getItem('mapHeight') || graphHeight || 600;
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  if (includeDefs && includeDefsRelief) {
    var d1 = document.getElementById("map").getElementsByTagName("defs")[0].cloneNode(true);
    var d2 = document.getElementById("defElements").getElementsByTagName("defs")[0].cloneNode(true);
    const length = d2.children.length;
    for (let index = 0; index < length; index++) {
      d1.appendChild(d2.children[0]);
    }
    svg.appendChild(d1);
  } else if (includeDefs){
    var defs = document.getElementById("map").getElementsByTagName("defs")[0].cloneNode(true);
    svg.appendChild(defs);
  } else if (includeDefsRelief){
    var defs = document.getElementById("defElements").getElementsByTagName("defs")[0].cloneNode(true);
    svg.appendChild(defs);
  }
  svg.appendChild(element);
  return svg;
}

function wrapInXml(element, id, filename) {
  const xml = document.createElement("xml");
  xml.setAttribute("id", id);
  xml.setAttribute("fileName", filename);

  function escape(text) {
    return String(text).replace(/(['"<>&'])(\w+;)?/g, (match, char, escaped) => {
        if(escaped) {
            return match;
        }
        
        switch(char) {
            case '\'': return '&apos;';
            case '"': return '&quot;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
        }
    });
  }

  xml.innerText = escape(element);
  return xml;
}


async function prepareCK3() {
  const xml = document.createElement("xml");
  xml.setAttribute("mapName", getFileName());
  xml.appendChild(ck3DrawHeightmap());
  xml.appendChild(ck3DrawBiomes());
  // xml.appendChild(ck3DrawRelief());
  xml.appendChild(ck3DrawFlatMap());

  xml.appendChild(ck3GeoJsonCells());
  const {getFullDataJson} = await import("../dynamic/export-json.js");
  xml.appendChild(wrapInXml(getFullDataJson(), "json", getFileName('Full')));

  const serializedMap = new XMLSerializer().serializeToString(xml);
  document.serializedMap = serializedMap;
  return serializedMap;
}

async function exportToCK3() {
  const serializedMap = await prepareCK3();
  const filename = getFileName() + ".xml";
  saveToMachine(serializedMap, filename);
}



function saveGeoJsonRoutes() {
  const features = pack.routes.map(({i, points, group, name = null}) => {
    const coordinates = points.map(([x, y]) => getCoordinates(x, y, 4));
    const id = `route${i}`;
    return {
      type: "Feature",
      geometry: {type: "LineString", coordinates},
      properties: {id, group, name}
    };
  });
  const json = {type: "FeatureCollection", features};

  const fileName = getFileName("Routes") + ".geojson";
  downloadFile(JSON.stringify(json), fileName, "application/json");
}

function saveGeoJsonRivers() {
  const features = pack.rivers.map(
    ({i, cells, points, source, mouth, parent, basin, widthFactor, sourceWidth, discharge, name, type}) => {
      if (!cells || cells.length < 2) return;
      const meanderedPoints = Rivers.addMeandering(cells, points);
      const coordinates = meanderedPoints.map(([x, y]) => getCoordinates(x, y, 4));
      const id = `river${i}`;
      return {
        type: "Feature",
        geometry: {type: "LineString", coordinates},
        properties: {id, source, mouth, parent, basin, widthFactor, sourceWidth, discharge, name, type}
      };
    }
  );
  const json = {type: "FeatureCollection", features};

  const fileName = getFileName("Rivers") + ".geojson";
  downloadFile(JSON.stringify(json), fileName, "application/json");
}

function saveGeoJsonMarkers() {
  const features = pack.markers.map(marker => {
    const {i, type, icon, x, y, size, fill, stroke} = marker;
    const coordinates = getCoordinates(x, y, 4);
    const id = `marker${i}`;
    const note = notes.find(note => note.id === id);
    const properties = {id, type, icon, x, y, ...note, size, fill, stroke};
    return {type: "Feature", geometry: {type: "Point", coordinates}, properties};
  });

  const json = {type: "FeatureCollection", features};

  const fileName = getFileName("Markers") + ".geojson";
  downloadFile(JSON.stringify(json), fileName, "application/json");
}
