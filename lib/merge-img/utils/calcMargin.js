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

export default function calcMargin(obj = {}) {
    if (Number.isInteger(obj)) {
      return {
        top: obj,
        right: obj,
        bottom: obj,
        left: obj,
      };
    }
  
    if (typeof obj === 'string') {
      const [top, right = top, bottom = top, left = right] = obj.split(' ');
  
      return {
        top: Number(top),
        right: Number(right),
        bottom: Number(bottom),
        left: Number(left),
      };
    }
  
    const {top = 0, right = 0, bottom = 0, left = 0} = obj;
  
    return {
      top,
      right,
      bottom,
      left,
    };
  }
