/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea() {
      return width * height;
    },
  };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = Object.create(proto);
  const data = JSON.parse(json);
  Object.assign(obj, data);
  return obj;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class CssSelector {
  constructor() {
    this.selector = '';
    this.repeats = {};
    this.order = [];
    this.orderValue = {
      element: 0,
      id: 1,
      class: 2,
      attr: 3,
      pseudoClass: 4,
      pseudoElement: 5,
    };
  }

  checkOrder(value) {
    let isInOrder = true;
    this.order.forEach((el) => {
      if (this.orderValue[value] < this.orderValue[el]) isInOrder = false;
    });
    return isInOrder;
  }

  element(element) {
    if (this.repeats.element) throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    if (!this.checkOrder('element')) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    this.repeats.element = true;
    this.selector += element;
    this.order.push('element');
    return this;
  }

  id(id) {
    if (this.repeats.id) throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    if (!this.checkOrder('id')) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    this.repeats.id = true;
    this.selector += `#${id}`;
    this.order.push('id');
    return this;
  }

  class(className) {
    if (!this.checkOrder('class')) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    this.selector += `.${className}`;
    this.order.push('class');
    return this;
  }

  attr(value) {
    if (!this.checkOrder('attr')) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    this.selector += `[${value}]`;
    this.order.push('attr');
    return this;
  }

  pseudoClass(value) {
    if (!this.checkOrder('pseudoClass')) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    this.selector += `:${value}`;
    this.order.push('pseudoClass');
    return this;
  }

  pseudoElement(value) {
    if (this.repeats.pseudoElement) throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    if (!this.checkOrder('pseudoElement')) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    this.repeats.pseudoElement = true;
    this.selector += `::${value}`;
    this.order.push('pseudoElement');
    return this;
  }

  combine(selector1, combinator, selector2) {
    this.selector = `${selector1.selector} ${combinator} ${selector2.selector}`;
    return this;
  }

  stringify() {
    return this.selector;
  }
}

const cssSelectorBuilder = {
  element(value) {
    const selector = new CssSelector();
    return selector.element(value);
  },

  id(value) {
    const selector = new CssSelector();
    return selector.id(value);
  },

  class(value) {
    const selector = new CssSelector();
    return selector.class(value);
  },

  attr(value) {
    const selector = new CssSelector();
    return selector.attr(value);
  },

  pseudoClass(value) {
    const selector = new CssSelector();
    return selector.pseudoClass(value);
  },

  pseudoElement(value) {
    const selector = new CssSelector();
    return selector.pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    const selector = new CssSelector();
    return selector.combine(selector1, combinator, selector2);
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
