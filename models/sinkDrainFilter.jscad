/**
 * Sink Drain Filter
 * @author https://github.com/eduter
 */

const filterColor = [0.5, 0.5, 0.5, 0.5];
const pinColor = filterColor;

function getParameterDefinitions () {
  return [
    {name: 'outerRadius', type: 'number', initial: 38.5, caption: 'Outer Radius'},
    {name: 'centerHoleRadius', type: 'number', initial: 4.5, caption: 'Center Hole Radius'},
    {name: 'borderWidth', type: 'number', initial: 3, caption: 'Border Width'},
    {name: 'thickness', type: 'number', initial: 2, caption: 'Thickness'},
    {name: 'filterHoleRadius', type: 'number', initial: 1, caption: 'Filter Hole Radius'},
    {name: 'gap', type: 'number', initial: 1, caption: 'Gap Between Holes'},

    {name: 'shaftHeightTop', type: 'number', initial: 12, caption: 'Shaft Height Top'},
    {name: 'shaftHeightBottom', type: 'number', initial: 20, caption: 'Shaft Height Bottom'},

    {name: 'renderFilterHoles', type: 'checkbox', checked: false, caption: 'Render Filter Holes (very slow - only check when done customizing)'},
    {name: 'preview', type: 'checkbox', checked: false, caption: 'Preview mode'}
  ];
}

function main({ outerRadius,
                centerHoleRadius,
                borderWidth,
                thickness,
                filterHoleRadius,
                gap,
                shaftHeightTop,
                shaftHeightBottom,
                renderFilterHoles,
                preview }) {
  const sh = shaft(centerHoleRadius, shaftHeightBottom + thickness, shaftHeightTop);

  return [
    preview ? sh.translate([0, 0, thickness]) : sh.rotateX(180).translate([outerRadius * 1.5, 0, shaftHeightTop]),
    filter(outerRadius, centerHoleRadius, borderWidth, thickness, filterHoleRadius, gap, renderFilterHoles)
  ];
}

function shaft(centerHoleRadius, heightBottom, heightTop) {
  return union(
    chamferedCylinder(centerHoleRadius + 1, heightTop, Math.ceil(20 * centerHoleRadius), 0, 1),
    mirror([0, 0, 1], chamferedCylinder(centerHoleRadius, heightBottom, 6, 0, 1))
  ).setColor(...pinColor);
}

function chamferedCylinder(radius, height, fn, chamferStart = 0, chamferEnd = 0) {
  const h = [0, chamferStart, height - chamferEnd, height];
  const parts = [];

  if (chamferStart > 0) {
    parts.push(cylinder({start: [0, 0, h[0]], end: [0, 0, h[1]], r1: radius - chamferStart, r2: radius, fn}));
  }
  parts.push(cylinder({start: [0, 0, h[1]], end: [0, 0, h[2]], r: radius, fn}));
  if (chamferEnd > 0) {
    parts.push(cylinder({start: [0, 0, h[2]], end: [0, 0, h[3]], r1: radius, r2: radius - chamferEnd, fn}));
  }
  return union(...parts);
}

function filter(outerRadius, centerHoleRadius, borderWidth, thickness, holeRadius, gap, renderFilterHoles) {
  const disc = difference(
    cylinder({r: outerRadius, center: true, h: thickness, fn: 360}).setColor(...filterColor),
    cylinder({r: centerHoleRadius, center: true, h: thickness})
  ).translate([0, 0, thickness / 2]);

  return renderFilterHoles
    ? makeHoles(disc, {
        holeRadius,
        gap,
        rings: Math.ceil(hexagonWidth(outerRadius) / (holeRadius + gap)),
        filter: (_, [x, y]) => {
          const d = distanceToCenter(x, y);
          return d > centerHoleRadius + holeRadius + gap && d < outerRadius - borderWidth - holeRadius;
        }
      })
    : disc;
}

function makeHoles(object, {holeRadius, gap, rings, filter = () => true, height = 1000}) {
  const hole = linear_extrude({height, center: true}, hexagon(holeRadius));
  let result = object;

  for (let i = 1 - rings; i < rings; i++) {
    for (let j = 1 - rings; j < rings; j++) {
      const k = -(i + j);

      if (Math.abs(k) < rings) {
        const tile = [i, j, k];
        const position = cubeCoordinateToCartesian(...tile, holeRadius + gap / 2);

        if (filter(tile, position)) {
          result = difference(result, hole.translate(position));
        }
      }
    }
  }
  return result;
}

function cubeCoordinateToCartesian(x, y, z, scale) {
  const col = x + (z - (z & 1)) / 2;
  const row = z;

  return [
    (col * 2 + (row & 1)) * hexagonWidth(scale),
    row * 3 / 2 * scale
  ];
}

function hexagon(size = 1) {
  const w = hexagonWidth(1);
  const poly = polygon([[0, 1], [w, 0.5], [w, -0.5], [0, -1], [-w, -0.5], [-w, 0.5]]);
  return scale(size, poly);
}

function hexagonWidth(height) {
  return height * sqrt(3) / 2;
}

function distanceToCenter(x, y) {
  return Math.sqrt(x * x + y * y);
}
