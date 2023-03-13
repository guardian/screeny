/**
 * 'merge-img' from https://github.com/preco21/merge-img
 * 
 * This project has been copied into this codebase so that it can use the latest versions
 * of 'Jimp' & other deps, removing security vulnerabilities from the codebase.
 * 
 * ---
 * 
 * MIT License
 * 
 * Copyright (c) Plusb Preco <plusb21@gmail.com>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import isPlainObj from 'is-plain-obj';
import Jimp from 'jimp';
import alignImage from './utils/alignImage.js';
import calcMargin from './utils/calcMargin.js';

export default function mergeImg(images, {
  direction = false,
  color = 0x00000000,
  align = 'start',
  offset = 0,
  margin,
} = {}) {
  if (!Array.isArray(images)) {
    throw new TypeError('`images` must be an array that contains images');
  }

  if (images.length < 1) {
    throw new Error('At least `images` must contain more than one image');
  }

  const processImg = (img) => {
    if(img instanceof Jimp) {
      return {img};
    }
    if (isPlainObj(img)) {
      const {src, offsetX, offsetY} = img;

      return Jimp.read(src)
        .then((imgObj) => ({
          img: imgObj,
          offsetX,
          offsetY,
        }));
    }

    return Jimp.read(img).then((imgObj) => ({img: imgObj}));
  };

  return Promise.all(images.map(processImg))
    .then((imgs) => {
      let totalX = 0;
      let totalY = 0;

      const imgData = imgs.reduce((res, {img, offsetX = 0, offsetY = 0}) => {
        const {bitmap: {width, height}} = img;

        res.push({
          img,
          x: totalX + offsetX,
          y: totalY + offsetY,
          offsetX,
          offsetY,
        });

        totalX += width + offsetX;
        totalY += height + offsetY;

        return res;
      }, []);

      const {top, right, bottom, left} = calcMargin(margin);
      const marginTopBottom = top + bottom;
      const marginRightLeft = right + left;

      const totalWidth = direction
        ? Math.max(...imgData.map(({img: {bitmap: {width}}, offsetX}) => width + offsetX))
        : imgData.reduce((res, {img: {bitmap: {width}}, offsetX}, index) => res + width + offsetX + (Number(index > 0) * offset), 0);

      const totalHeight = direction
        ? imgData.reduce((res, {img: {bitmap: {height}}, offsetY}, index) => res + height + offsetY + (Number(index > 0) * offset), 0)
        : Math.max(...imgData.map(({img: {bitmap: {height}}, offsetY}) => height + offsetY));

      const baseImage = new Jimp(totalWidth + marginRightLeft, totalHeight + marginTopBottom, color);

      // Fallback for `Array#entries()`
      const imgDataEntries = imgData.map((data, index) => [index, data]);

      for (const [index, {img, x, y, offsetX, offsetY}] of imgDataEntries) {
        const {bitmap: {width, height}} = img;
        const [px, py] = direction
          ? [alignImage(totalWidth, width, align) + offsetX, y + (index * offset)]
          : [x + (index * offset), alignImage(totalHeight, height, align) + offsetY];

        baseImage.composite(img, px + left, py + top);
      }

      return baseImage;
    });
}