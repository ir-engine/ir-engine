import "./chunk-TFWDKVI3.js";

// ../../node_modules/potpack/index.js
function potpack(boxes) {
  let area = 0;
  let maxWidth = 0;
  for (const box of boxes) {
    area += box.w * box.h;
    maxWidth = Math.max(maxWidth, box.w);
  }
  boxes.sort((a, b) => b.h - a.h);
  const startWidth = Math.max(Math.ceil(Math.sqrt(area / 0.95)), maxWidth);
  const spaces = [{ x: 0, y: 0, w: startWidth, h: Infinity }];
  let width = 0;
  let height = 0;
  for (const box of boxes) {
    for (let i = spaces.length - 1; i >= 0; i--) {
      const space = spaces[i];
      if (box.w > space.w || box.h > space.h)
        continue;
      box.x = space.x;
      box.y = space.y;
      height = Math.max(height, box.y + box.h);
      width = Math.max(width, box.x + box.w);
      if (box.w === space.w && box.h === space.h) {
        const last = spaces.pop();
        if (i < spaces.length)
          spaces[i] = last;
      } else if (box.h === space.h) {
        space.x += box.w;
        space.w -= box.w;
      } else if (box.w === space.w) {
        space.y += box.h;
        space.h -= box.h;
      } else {
        spaces.push({
          x: space.x + box.w,
          y: space.y,
          w: space.w - box.w,
          h: box.h
        });
        space.y += box.h;
        space.h -= box.h;
      }
      break;
    }
  }
  return {
    w: width,
    // container width
    h: height,
    // container height
    fill: area / (width * height) || 0
    // space utilization
  };
}
export {
  potpack as default
};
//# sourceMappingURL=potpack.js.map
