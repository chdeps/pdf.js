// All the possible operations for an operator list.
export const OPS = {
  // Intentionally start from 1 so it is easy to spot bad operators that will be
  // 0's.
  // PLEASE NOTE: We purposely keep any removed operators commented out, since
  //              re-numbering the list would risk breaking third-party users.
  dependency: 1,
  setLineWidth: 2,
  setLineCap: 3,
  setLineJoin: 4,
  setMiterLimit: 5,
  setDash: 6,
  setRenderingIntent: 7,
  setFlatness: 8,
  setGState: 9,
  save: 10,
  restore: 11,
  transform: 12,
  moveTo: 13,
  lineTo: 14,
  curveTo: 15,
  curveTo2: 16,
  curveTo3: 17,
  closePath: 18,
  rectangle: 19,
  stroke: 20,
  closeStroke: 21,
  fill: 22,
  eoFill: 23,
  fillStroke: 24,
  eoFillStroke: 25,
  closeFillStroke: 26,
  closeEOFillStroke: 27,
  endPath: 28,
  clip: 29,
  eoClip: 30,
  beginText: 31,
  endText: 32,
  setCharSpacing: 33,
  setWordSpacing: 34,
  setHScale: 35,
  setLeading: 36,
  setFont: 37,
  setTextRenderingMode: 38,
  setTextRise: 39,
  moveText: 40,
  setLeadingMoveText: 41,
  setTextMatrix: 42,
  nextLine: 43,
  showText: 44,
  showSpacedText: 45,
  nextLineShowText: 46,
  nextLineSetSpacingShowText: 47,
  setCharWidth: 48,
  setCharWidthAndBounds: 49,
  setStrokeColorSpace: 50,
  setFillColorSpace: 51,
  setStrokeColor: 52,
  setStrokeColorN: 53,
  setFillColor: 54,
  setFillColorN: 55,
  setStrokeGray: 56,
  setFillGray: 57,
  setStrokeRGBColor: 58,
  setFillRGBColor: 59,
  setStrokeCMYKColor: 60,
  setFillCMYKColor: 61,
  shadingFill: 62,
  beginInlineImage: 63,
  beginImageData: 64,
  endInlineImage: 65,
  paintXObject: 66,
  markPoint: 67,
  markPointProps: 68,
  beginMarkedContent: 69,
  beginMarkedContentProps: 70,
  endMarkedContent: 71,
  beginCompat: 72,
  endCompat: 73,
  paintFormXObjectBegin: 74,
  paintFormXObjectEnd: 75,
  beginGroup: 76,
  endGroup: 77,
  // beginAnnotations: 78,
  // endAnnotations: 79,
  beginAnnotation: 80,
  endAnnotation: 81,
  // paintJpegXObject: 82,
  paintImageMaskXObject: 83,
  paintImageMaskXObjectGroup: 84,
  paintImageXObject: 85,
  paintInlineImageXObject: 86,
  paintInlineImageXObjectGroup: 87,
  paintImageXObjectRepeat: 88,
  paintImageMaskXObjectRepeat: 89,
  paintSolidColorImageMask: 90,
  constructPath: 91,
  group: 92
};


const hexNumbers = [...Array(256).keys()].map(n =>
  n.toString(16).padStart(2, "0")
);

export class Util {
  static makeHexColor(r, g, b) {
    return `#${hexNumbers[r]}${hexNumbers[g]}${hexNumbers[b]}`;
  }

  // Apply a scaling matrix to some min/max values.
  // If a scaling factor is negative then min and max must be
  // swaped.
  static scaleMinMax(transform, minMax) {
    let temp;
    if (transform[0]) {
      if (transform[0] < 0) {
        temp = minMax[0];
        minMax[0] = minMax[1];
        minMax[1] = temp;
      }
      minMax[0] *= transform[0];
      minMax[1] *= transform[0];

      if (transform[3] < 0) {
        temp = minMax[2];
        minMax[2] = minMax[3];
        minMax[3] = temp;
      }
      minMax[2] *= transform[3];
      minMax[3] *= transform[3];
    } else {
      temp = minMax[0];
      minMax[0] = minMax[2];
      minMax[2] = temp;
      temp = minMax[1];
      minMax[1] = minMax[3];
      minMax[3] = temp;

      if (transform[1] < 0) {
        temp = minMax[2];
        minMax[2] = minMax[3];
        minMax[3] = temp;
      }
      minMax[2] *= transform[1];
      minMax[3] *= transform[1];

      if (transform[2] < 0) {
        temp = minMax[0];
        minMax[0] = minMax[1];
        minMax[1] = temp;
      }
      minMax[0] *= transform[2];
      minMax[1] *= transform[2];
    }
    minMax[0] += transform[4];
    minMax[1] += transform[4];
    minMax[2] += transform[5];
    minMax[3] += transform[5];
  }

  // Concatenates two transformation matrices together and returns the result.
  static transform(m1, m2) {
    return [
      m1[0] * m2[0] + m1[2] * m2[1],
      m1[1] * m2[0] + m1[3] * m2[1],
      m1[0] * m2[2] + m1[2] * m2[3],
      m1[1] * m2[2] + m1[3] * m2[3],
      m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
      m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
    ];
  }

  // For 2d affine transforms
  static applyTransform(p, m) {
    const xt = p[0] * m[0] + p[1] * m[2] + m[4];
    const yt = p[0] * m[1] + p[1] * m[3] + m[5];
    return [xt, yt];
  }

  static applyInverseTransform(p, m) {
    const d = m[0] * m[3] - m[1] * m[2];
    const xt = (p[0] * m[3] - p[1] * m[2] + m[2] * m[5] - m[4] * m[3]) / d;
    const yt = (-p[0] * m[1] + p[1] * m[0] + m[4] * m[1] - m[5] * m[0]) / d;
    return [xt, yt];
  }

  // Applies the transform to the rectangle and finds the minimum axially
  // aligned bounding box.
  static getAxialAlignedBoundingBox(r, m) {
    const p1 = Util.applyTransform(r, m);
    const p2 = Util.applyTransform(r.slice(2, 4), m);
    const p3 = Util.applyTransform([r[0], r[3]], m);
    const p4 = Util.applyTransform([r[2], r[1]], m);
    return [
      Math.min(p1[0], p2[0], p3[0], p4[0]),
      Math.min(p1[1], p2[1], p3[1], p4[1]),
      Math.max(p1[0], p2[0], p3[0], p4[0]),
      Math.max(p1[1], p2[1], p3[1], p4[1]),
    ];
  }

  static inverseTransform(m) {
    const d = m[0] * m[3] - m[1] * m[2];
    return [
      m[3] / d,
      -m[1] / d,
      -m[2] / d,
      m[0] / d,
      (m[2] * m[5] - m[4] * m[3]) / d,
      (m[4] * m[1] - m[5] * m[0]) / d,
    ];
  }

  // This calculation uses Singular Value Decomposition.
  // The SVD can be represented with formula A = USV. We are interested in the
  // matrix S here because it represents the scale values.
  static singularValueDecompose2dScale(m) {
    const transpose = [m[0], m[2], m[1], m[3]];

    // Multiply matrix m with its transpose.
    const a = m[0] * transpose[0] + m[1] * transpose[2];
    const b = m[0] * transpose[1] + m[1] * transpose[3];
    const c = m[2] * transpose[0] + m[3] * transpose[2];
    const d = m[2] * transpose[1] + m[3] * transpose[3];

    // Solve the second degree polynomial to get roots.
    const first = (a + d) / 2;
    const second = Math.sqrt((a + d) ** 2 - 4 * (a * d - c * b)) / 2;
    const sx = first + second || 1;
    const sy = first - second || 1;

    // Scale values are the square roots of the eigenvalues.
    return [Math.sqrt(sx), Math.sqrt(sy)];
  }

  // Normalize rectangle rect=[x1, y1, x2, y2] so that (x1,y1) < (x2,y2)
  // For coordinate systems whose origin lies in the bottom-left, this
  // means normalization to (BL,TR) ordering. For systems with origin in the
  // top-left, this means (TL,BR) ordering.
  static normalizeRect(rect) {
    const r = rect.slice(0); // clone rect
    if (rect[0] > rect[2]) {
      r[0] = rect[2];
      r[2] = rect[0];
    }
    if (rect[1] > rect[3]) {
      r[1] = rect[3];
      r[3] = rect[1];
    }
    return r;
  }

  // Returns a rectangle [x1, y1, x2, y2] corresponding to the
  // intersection of rect1 and rect2. If no intersection, returns 'null'
  // The rectangle coordinates of rect1, rect2 should be [x1, y1, x2, y2]
  static intersect(rect1, rect2) {
    const xLow = Math.max(
      Math.min(rect1[0], rect1[2]),
      Math.min(rect2[0], rect2[2])
    );
    const xHigh = Math.min(
      Math.max(rect1[0], rect1[2]),
      Math.max(rect2[0], rect2[2])
    );
    if (xLow > xHigh) {
      return null;
    }
    const yLow = Math.max(
      Math.min(rect1[1], rect1[3]),
      Math.min(rect2[1], rect2[3])
    );
    const yHigh = Math.min(
      Math.max(rect1[1], rect1[3]),
      Math.max(rect2[1], rect2[3])
    );
    if (yLow > yHigh) {
      return null;
    }

    return [xLow, yLow, xHigh, yHigh];
  }

  // From https://github.com/adobe-webplatform/Snap.svg/blob/b365287722a72526000ac4bfcf0ce4cac2faa015/src/path.js#L852
  static bezierBoundingBox(x0, y0, x1, y1, x2, y2, x3, y3) {
    const tvalues = [],
      bounds = [[], []];
    let a, b, c, t, t1, t2, b2ac, sqrtb2ac;
    for (let i = 0; i < 2; ++i) {
      if (i === 0) {
        b = 6 * x0 - 12 * x1 + 6 * x2;
        a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
        c = 3 * x1 - 3 * x0;
      } else {
        b = 6 * y0 - 12 * y1 + 6 * y2;
        a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
        c = 3 * y1 - 3 * y0;
      }
      if (Math.abs(a) < 1e-12) {
        if (Math.abs(b) < 1e-12) {
          continue;
        }
        t = -c / b;
        if (0 < t && t < 1) {
          tvalues.push(t);
        }
        continue;
      }
      b2ac = b * b - 4 * c * a;
      sqrtb2ac = Math.sqrt(b2ac);
      if (b2ac < 0) {
        continue;
      }
      t1 = (-b + sqrtb2ac) / (2 * a);
      if (0 < t1 && t1 < 1) {
        tvalues.push(t1);
      }
      t2 = (-b - sqrtb2ac) / (2 * a);
      if (0 < t2 && t2 < 1) {
        tvalues.push(t2);
      }
    }

    let j = tvalues.length,
      mt;
    const jlen = j;
    while (j--) {
      t = tvalues[j];
      mt = 1 - t;
      bounds[0][j] =
        mt * mt * mt * x0 +
        3 * mt * mt * t * x1 +
        3 * mt * t * t * x2 +
        t * t * t * x3;
      bounds[1][j] =
        mt * mt * mt * y0 +
        3 * mt * mt * t * y1 +
        3 * mt * t * t * y2 +
        t * t * t * y3;
    }

    bounds[0][jlen] = x0;
    bounds[1][jlen] = y0;
    bounds[0][jlen + 1] = x3;
    bounds[1][jlen + 1] = y3;
    bounds[0].length = bounds[1].length = jlen + 2;

    return [
      Math.min(...bounds[0]),
      Math.min(...bounds[1]),
      Math.max(...bounds[0]),
      Math.max(...bounds[1]),
    ];
  }
}

const SVG_NS = "http://www.w3.org/2000/svg";

class BaseSVGFactory {
  constructor() {
    if (this.constructor === BaseSVGFactory) {
      unreachable("Cannot initialize BaseSVGFactory.");
    }
  }

  create(width, height, skipDimensions = false) {
    if (width <= 0 || height <= 0) {
      throw new Error("Invalid SVG dimensions");
    }
    const svg = this._createSVG("svg:svg");
    svg.setAttribute("version", "1.1");

    if (!skipDimensions) {
      svg.setAttribute("width", `${width}px`);
      svg.setAttribute("height", `${height}px`);
    }

    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    return svg;
  }

  createElement(type) {
    if (typeof type !== "string") {
      throw new Error("Invalid SVG element type");
    }
    return this._createSVG(type);
  }

  /**
   * @ignore
   */
  _createSVG(type) {
    unreachable("Abstract method `_createSVG` called.");
  }
}

export class DOMSVGFactory extends BaseSVGFactory {
  _createSVG(type) {
    return document.createElementNS(SVG_NS, type);
  }
}

export const TextRenderingMode = {
  FILL: 0,
  STROKE: 1,
  FILL_STROKE: 2,
  INVISIBLE: 3,
  FILL_ADD_TO_PATH: 4,
  STROKE_ADD_TO_PATH: 5,
  FILL_STROKE_ADD_TO_PATH: 6,
  ADD_TO_PATH: 7,
  FILL_STROKE_MASK: 3,
  ADD_TO_PATH_FLAG: 4,
};

export const ImageKind = {
  GRAYSCALE_1BPP: 1,
  RGB_24BPP: 2,
  RGBA_32BPP: 3,
};

export const IDENTITY_MATRIX = [1, 0, 0, 1, 0, 0];
export const FONT_IDENTITY_MATRIX = [0.001, 0, 0, 0.001, 0, 0];

export const createObjectURL = function (
  data,
  contentType = "",
  forceDataSchema = false
) {
  if (
    URL.createObjectURL &&
    typeof Blob !== "undefined" &&
    !forceDataSchema
  ) {
    return URL.createObjectURL(new Blob([data], { type: contentType }));
  }
  // Blob/createObjectURL is not available, falling back to data schema.
  const digits =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

  let buffer = `data:${contentType};base64,`;
  for (let i = 0, ii = data.length; i < ii; i += 3) {
    const b1 = data[i] & 0xff;
    const b2 = data[i + 1] & 0xff;
    const b3 = data[i + 2] & 0xff;
    const d1 = b1 >> 2,
      d2 = ((b1 & 3) << 4) | (b2 >> 4);
    const d3 = i + 1 < ii ? ((b2 & 0xf) << 2) | (b3 >> 6) : 64;
    const d4 = i + 2 < ii ? b3 & 0x3f : 64;
    buffer += digits[d1] + digits[d2] + digits[d3] + digits[d4];
  }
  return buffer;
};

/**
 * Format a float number as a string.
 *
 * @param value {number} - The float number to format.
 * @returns {string}
 */
// eslint-disable-next-line no-inner-declarations
export function pf(value) {
  if (Number.isInteger(value)) {
    return value.toString();
  }
  const s = value.toFixed(10);
  let i = s.length - 1;
  if (s[i] !== "0") {
    return s;
  }

  // Remove trailing zeros.
  do {
    i--;
  } while (s[i] === "0");
  return s.substring(0, s[i] === "." ? i : i + 1);
}

/**
 * Format a transform matrix as a string. The standard rotation, scale and
 * translation matrices are replaced by their shorter forms, and for
 * identity matrices an empty string is returned to save memory.
 *
 * @param m {Array} - The transform matrix to format.
 * @returns {string}
 */
// eslint-disable-next-line no-inner-declarations
export function pm(m) {
  if (m[4] === 0 && m[5] === 0) {
    if (m[1] === 0 && m[2] === 0) {
      if (m[0] === 1 && m[3] === 1) {
        return "";
      }
      return `scale(${pf(m[0])} ${pf(m[3])})`;
    }
    if (m[0] === m[3] && m[1] === -m[2]) {
      const a = (Math.acos(m[0]) * 180) / Math.PI;
      return `rotate(${pf(a)})`;
    }
  } else {
    if (m[0] === 1 && m[1] === 0 && m[2] === 0 && m[3] === 1) {
      return `translate(${pf(m[4])} ${pf(m[5])})`;
    }
  }
  return (
    `matrix(${pf(m[0])} ${pf(m[1])} ${pf(m[2])} ${pf(m[3])} ${pf(m[4])} ` +
    `${pf(m[5])})`
  );
}
