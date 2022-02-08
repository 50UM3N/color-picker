// hex to rgb
const hexToRgb = (hex) => {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);

    return "rgb(" + r + " ," + g + " ," + b + ")";
};
const hexToHSL = (hex) => {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);
    r /= 255;
    g /= 255;
    b /= 255;
    let cMax = Math.max(r, g, b);
    let cMin = Math.min(r, g, b);
    let del = cMax - cMin;
    let h = 0,
        s = 0,
        l = (cMax + cMin) / 2;
    if (del === 0) {
        h = 0;
    } else if (cMax === r) {
        h = 60 * (((g - b) / del) % 6);
    } else if (cMax === g) {
        h = 60 * ((b - r) / del + 2);
    } else if (cMax === b) {
        h = 60 * ((r - g) / del + 4);
    }
    if (del === 0) {
        s = 0;
    } else {
        s = del / (1 - Math.abs(2 * l - 1));
    }
    if (h < 0) h = 360 + h;
    h = Math.round(h);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return ["hsl(" + h + " ," + s + "% ," + l + "%)", [h, s, l]];
};
const hslToHex = (h, s, l) => {
    s = s / 100;
    l = l / 100;
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    let m = l - c / 2;
    let r, g, b;
    if (h >= 0 && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (h >= 60 && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (h >= 180 && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (h >= 240 && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (h >= 300 && h < 360) {
        r = c;
        g = 0;
        b = x;
    }
    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);
    r = r.length === 1 ? `0${r}` : r;
    g = g.length === 1 ? `0${g}` : g;
    b = b.length === 1 ? `0${b}` : b;
    return "#" + r + g + b;
};
const checkTextColor = (hex) => {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);
    let intensity = Math.round((r + g + b) / 3);
    if (intensity > 140) return true;
    else return false;
};

export { hexToRgb, hexToHSL, hslToHex, checkTextColor };
