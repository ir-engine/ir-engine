import "./chunk-TFWDKVI3.js";

// ../../node_modules/ts-matches/esm/src/parsers/utils.js
var isObject = (x) => typeof x === "object" && x != null;
var isFunctionTest = (x) => typeof x === "function";
var isNumber = (x) => typeof x === "number";
var isString = (x) => typeof x === "string";
var booleanOnParse = {
  parsed(_) {
    return true;
  },
  invalid(_) {
    return false;
  }
};

// ../../node_modules/ts-matches/esm/src/parsers/guard-parser.js
var GuardParser = class {
  constructor(checkIsA, typeName, description = {
    name: "Guard",
    children: [],
    extras: [typeName]
  }) {
    Object.defineProperty(this, "checkIsA", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: checkIsA
    });
    Object.defineProperty(this, "typeName", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: typeName
    });
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
  }
  parse(a, onParse) {
    if (this.checkIsA(a)) {
      return onParse.parsed(a);
    }
    return onParse.invalid({
      value: a,
      keys: [],
      parser: this
    });
  }
};

// ../../node_modules/ts-matches/esm/src/utils.js
function saferStringify(x) {
  try {
    return JSON.stringify(x);
  } catch (e) {
    return "" + x;
  }
}

// ../../node_modules/ts-matches/esm/src/parsers/any-parser.js
var AnyParser = class {
  constructor(description = {
    name: "Any",
    children: [],
    extras: []
  }) {
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
  }
  parse(a, onParse) {
    return onParse.parsed(a);
  }
};

// ../../node_modules/ts-matches/esm/src/parsers/array-parser.js
var ArrayParser = class {
  constructor(description = {
    name: "Array",
    children: [],
    extras: []
  }) {
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
  }
  parse(a, onParse) {
    if (Array.isArray(a))
      return onParse.parsed(a);
    return onParse.invalid({
      value: a,
      keys: [],
      parser: this
    });
  }
};

// ../../node_modules/ts-matches/esm/src/parsers/bool-parser.js
var BoolParser = class {
  constructor(description = {
    name: "Boolean",
    children: [],
    extras: []
  }) {
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
  }
  parse(a, onParse) {
    if (a === true || a === false)
      return onParse.parsed(a);
    return onParse.invalid({
      value: a,
      keys: [],
      parser: this
    });
  }
};

// ../../node_modules/ts-matches/esm/src/parsers/concat-parser.js
var ConcatParsers = class {
  constructor(parent, otherParser, description = {
    name: "Concat",
    children: [parent, otherParser],
    extras: []
  }) {
    Object.defineProperty(this, "parent", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: parent
    });
    Object.defineProperty(this, "otherParser", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: otherParser
    });
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
  }
  static of(parent, otherParser) {
    if (parent.unwrappedParser().description.name === "Any") {
      return otherParser;
    }
    if (otherParser.unwrappedParser().description.name === "Any") {
      return parent;
    }
    return new ConcatParsers(parent, otherParser);
  }
  parse(a, onParse) {
    const parent = this.parent.enumParsed(a);
    if ("error" in parent) {
      return onParse.invalid(parent.error);
    }
    const other = this.otherParser.enumParsed(parent.value);
    if ("error" in other) {
      return onParse.invalid(other.error);
    }
    return onParse.parsed(other.value);
  }
};

// ../../node_modules/ts-matches/esm/src/parsers/default-parser.js
var DefaultParser = class {
  constructor(parent, defaultValue, description = {
    name: "Default",
    children: [parent],
    extras: [defaultValue]
  }) {
    Object.defineProperty(this, "parent", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: parent
    });
    Object.defineProperty(this, "defaultValue", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: defaultValue
    });
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
  }
  parse(a, onParse) {
    const parser = this;
    const defaultValue = this.defaultValue;
    if (a == null) {
      return onParse.parsed(defaultValue);
    }
    const parentCheck = this.parent.enumParsed(a);
    if ("error" in parentCheck) {
      parentCheck.error.parser = parser;
      return onParse.invalid(parentCheck.error);
    }
    return onParse.parsed(parentCheck.value);
  }
};

// ../../node_modules/ts-matches/esm/src/parsers/function-parser.js
var FunctionParser = class {
  constructor(description = {
    name: "Function",
    children: [],
    extras: []
  }) {
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
  }
  parse(a, onParse) {
    if (isFunctionTest(a))
      return onParse.parsed(a);
    return onParse.invalid({
      value: a,
      keys: [],
      parser: this
    });
  }
};

// ../../node_modules/ts-matches/esm/src/parsers/mapped-parser.js
var MappedAParser = class {
  constructor(parent, map, mappingName = map.name, description = {
    name: "Mapped",
    children: [parent],
    extras: [mappingName]
  }) {
    Object.defineProperty(this, "parent", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: parent
    });
    Object.defineProperty(this, "map", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: map
    });
    Object.defineProperty(this, "mappingName", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: mappingName
    });
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
  }
  parse(a, onParse) {
    const map = this.map;
    const result = this.parent.enumParsed(a);
    if ("error" in result) {
      return onParse.invalid(result.error);
    }
    return onParse.parsed(map(result.value));
  }
};

// ../../node_modules/ts-matches/esm/src/parsers/maybe-parser.js
var MaybeParser = class {
  constructor(parent, description = {
    name: "Maybe",
    children: [parent],
    extras: []
  }) {
    Object.defineProperty(this, "parent", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: parent
    });
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
  }
  parse(a, onParse) {
    if (a == null) {
      return onParse.parsed(null);
    }
    const parser = this;
    const parentState = this.parent.enumParsed(a);
    if ("error" in parentState) {
      const { error } = parentState;
      error.parser = parser;
      return onParse.invalid(error);
    }
    return onParse.parsed(parentState.value);
  }
};

// ../../node_modules/ts-matches/esm/src/parsers/named.js
var NamedParser = class {
  constructor(parent, name, description = {
    name: "Named",
    children: [parent],
    extras: [name]
  }) {
    Object.defineProperty(this, "parent", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: parent
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: name
    });
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
  }
  parse(a, onParse) {
    const parser = this;
    const parent = this.parent.enumParsed(a);
    if ("error" in parent) {
      const { error } = parent;
      error.parser = parser;
      return onParse.invalid(error);
    }
    return onParse.parsed(parent.value);
  }
};
function parserName(name, parent) {
  return new Parser(new NamedParser(parent, name));
}

// ../../node_modules/ts-matches/esm/src/parsers/nill-parser.js
var NilParser = class {
  constructor(description = {
    name: "Null",
    children: [],
    extras: []
  }) {
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
  }
  parse(a, onParse) {
    if (a === null || a === void 0)
      return onParse.parsed(a);
    return onParse.invalid({
      value: a,
      keys: [],
      parser: this
    });
  }
};

// ../../node_modules/ts-matches/esm/src/parsers/number-parser.js
var NumberParser = class {
  constructor(description = {
    name: "Number",
    children: [],
    extras: []
  }) {
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
  }
  parse(a, onParse) {
    if (isNumber(a))
      return onParse.parsed(a);
    return onParse.invalid({
      value: a,
      keys: [],
      parser: this
    });
  }
};

// ../../node_modules/ts-matches/esm/src/parsers/object-parser.js
var ObjectParser = class {
  constructor(description = {
    name: "Object",
    children: [],
    extras: []
  }) {
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
  }
  parse(a, onParse) {
    if (isObject(a))
      return onParse.parsed(a);
    return onParse.invalid({
      value: a,
      keys: [],
      parser: this
    });
  }
};

// ../../node_modules/ts-matches/esm/src/parsers/or-parser.js
var OrParsers = class {
  constructor(parent, otherParser, description = {
    name: "Or",
    children: [parent, otherParser],
    extras: []
  }) {
    Object.defineProperty(this, "parent", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: parent
    });
    Object.defineProperty(this, "otherParser", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: otherParser
    });
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
  }
  parse(a, onParse) {
    const parser = this;
    const parent = this.parent.enumParsed(a);
    if ("value" in parent) {
      return onParse.parsed(parent.value);
    }
    const other = this.otherParser.enumParsed(a);
    if ("error" in other) {
      const { error } = other;
      error.parser = parser;
      return onParse.invalid(error);
    }
    return onParse.parsed(other.value);
  }
};

// ../../node_modules/ts-matches/esm/src/parsers/shape-parser.js
var ShapeParser = class {
  constructor(parserMap, isPartial2, parserKeys = Object.keys(parserMap), description = {
    name: isPartial2 ? "Partial" : "Shape",
    children: parserKeys.map((key) => parserMap[key]),
    extras: parserKeys
  }) {
    Object.defineProperty(this, "parserMap", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: parserMap
    });
    Object.defineProperty(this, "isPartial", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: isPartial2
    });
    Object.defineProperty(this, "parserKeys", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: parserKeys
    });
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
  }
  parse(a, onParse) {
    const parser = this;
    if (!object.test(a)) {
      return onParse.invalid({
        value: a,
        keys: [],
        parser
      });
    }
    const { parserMap, isPartial: isPartial2 } = this;
    const value = { ...a };
    if (Array.isArray(a)) {
      value.length = a.length;
    }
    for (const key in parserMap) {
      if (key in value) {
        const parser2 = parserMap[key];
        const state = parser2.enumParsed(a[key]);
        if ("error" in state) {
          const { error } = state;
          error.keys.push(saferStringify(key));
          return onParse.invalid(error);
        }
        const smallValue = state.value;
        value[key] = smallValue;
      } else if (!isPartial2) {
        return onParse.invalid({
          value: "missingProperty",
          parser,
          keys: [saferStringify(key)]
        });
      }
    }
    return onParse.parsed(value);
  }
};
var isPartial = (testShape) => {
  return new Parser(new ShapeParser(testShape, true));
};
var partial = isPartial;
var isShape = (testShape) => {
  return new Parser(new ShapeParser(testShape, false));
};
function shape(testShape, optionals, optionalAndDefaults) {
  if (optionals) {
    const defaults = optionalAndDefaults || {};
    const entries = Object.entries(testShape);
    const optionalSet = new Set(Array.from(optionals));
    return every(partial(Object.fromEntries(entries.filter(([key, _]) => optionalSet.has(key)).map(([key, parser]) => [key, parser.optional()]))), isShape(Object.fromEntries(entries.filter(([key, _]) => !optionalSet.has(key))))).map((ret) => {
      for (const key of optionalSet) {
        const keyAny = key;
        if (!(keyAny in ret) && keyAny in defaults) {
          ret[keyAny] = defaults[keyAny];
        }
      }
      return ret;
    });
  }
  return isShape(testShape);
}

// ../../node_modules/ts-matches/esm/src/parsers/string-parser.js
var StringParser = class {
  constructor(description = {
    name: "String",
    children: [],
    extras: []
  }) {
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
  }
  parse(a, onParse) {
    if (isString(a))
      return onParse.parsed(a);
    return onParse.invalid({
      value: a,
      keys: [],
      parser: this
    });
  }
};

// ../../node_modules/ts-matches/esm/src/parsers/parser.js
function unwrapParser(a) {
  if (a instanceof Parser)
    return unwrapParser(a.parser);
  return a;
}
var enumParsed = {
  parsed(value) {
    return { value };
  },
  invalid(error) {
    return { error };
  }
};
var Parser = class {
  constructor(parser, description = {
    name: "Wrapper",
    children: [parser],
    extras: []
  }) {
    Object.defineProperty(this, "parser", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: parser
    });
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
    Object.defineProperty(this, "_TYPE", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "test", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: (value) => {
        return this.parse(value, booleanOnParse);
      }
    });
  }
  /**
   * Use this when you want to decide what happens on the succes and failure cases of parsing
   * @param a
   * @param onParse
   * @returns
   */
  parse(a, onParse) {
    return this.parser.parse(a, onParse);
  }
  /**
   * This is a constructor helper that can use a predicate tester in the form of a guard function,
   * and will return a parser that will only parse if the predicate returns true.
   * https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types
   * @param checkIsA
   * @param name
   * @returns
   */
  static isA(checkIsA, name) {
    return new Parser(new GuardParser(checkIsA, name));
  }
  /**
   * Trying to convert the parser into a string representation
   * @param parserComingIn
   * @returns
   */
  static parserAsString(parserComingIn) {
    const parser = unwrapParser(parserComingIn);
    const { description: { name, extras, children } } = parser;
    if (parser instanceof ShapeParser) {
      return `${name}<{${parser.description.children.map((subParser, i) => `${String(parser.description.extras[i]) || "?"}:${Parser.parserAsString(subParser)}`).join(",")}}>`;
    }
    if (parser instanceof OrParsers) {
      const parent = unwrapParser(parser.parent);
      const parentString = Parser.parserAsString(parent);
      if (parent instanceof OrParsers)
        return parentString;
      return `${name}<${parentString},...>`;
    }
    if (parser instanceof GuardParser) {
      return String(extras[0] || name);
    }
    if (parser instanceof StringParser || parser instanceof ObjectParser || parser instanceof NumberParser || parser instanceof BoolParser || parser instanceof AnyParser) {
      return name.toLowerCase();
    }
    if (parser instanceof FunctionParser) {
      return name;
    }
    if (parser instanceof NilParser) {
      return "null";
    }
    if (parser instanceof ArrayParser) {
      return "Array<unknown>";
    }
    const specifiers = [
      ...extras.map(saferStringify),
      ...children.map(Parser.parserAsString)
    ];
    const specifiersString = `<${specifiers.join(",")}>`;
    return `${name}${specifiersString}`;
  }
  /**
   * This is the most useful parser, it assumes the happy path and will throw an error if it fails.
   * @param value
   * @returns
   */
  unsafeCast(value) {
    const state = this.enumParsed(value);
    if ("value" in state)
      return state.value;
    const { error } = state;
    throw new TypeError(`Failed type: ${Parser.validatorErrorAsString(error)} given input ${saferStringify(value)}`);
  }
  /**
   * This is the like the unsafe parser, it assumes the happy path and will throw and return a failed promise during failure.
   * @param value
   * @returns
   */
  castPromise(value) {
    const state = this.enumParsed(value);
    if ("value" in state)
      return Promise.resolve(state.value);
    const { error } = state;
    return Promise.reject(new TypeError(`Failed type: ${Parser.validatorErrorAsString(error)} given input ${saferStringify(value)}`));
  }
  /**
   * When we want to get the error message from the input, to know what is wrong
   * @param input
   * @returns Null if there is no error
   */
  errorMessage(input) {
    const parsed = this.parse(input, enumParsed);
    if ("value" in parsed)
      return;
    return Parser.validatorErrorAsString(parsed.error);
  }
  /**
   * Use this that we want to do transformations after the value is valid and parsed.
   * A use case would be parsing a string, making sure it can be parsed to a number, and then convert to a number
   * @param fn
   * @param mappingName
   * @returns
   */
  map(fn, mappingName) {
    return new Parser(new MappedAParser(this, fn, mappingName));
  }
  /**
   * Use this when you want to combine two parsers into one. This will make sure that both parsers will run against the same value.
   * @param otherParser
   * @returns
   */
  concat(otherParser) {
    return new Parser(ConcatParsers.of(this, new Parser(otherParser)));
  }
  /**
   * Use this to combine parsers into one. This will make sure that one or the other parsers will run against the value.
   * @param otherParser
   * @returns
   */
  orParser(otherParser) {
    return new Parser(new OrParsers(this, new Parser(otherParser)));
  }
  /**
   * When we want to make sure that we handle the null later on in a monoid fashion,
   * and this ensures we deal with the value
   * https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#optional-chaining
   */
  optional(_name) {
    return new Parser(new MaybeParser(this));
  }
  /**
   * There are times that we would like to bring in a value that we know as null or undefined
   * and want it to go to a default value
   */
  defaultTo(defaultValue) {
    return new Parser(new DefaultParser(new Parser(new MaybeParser(this)), defaultValue));
  }
  /**
   * We want to test value with a test eg isEven
   */
  validate(isValid, otherName) {
    return new Parser(ConcatParsers.of(this, new Parser(new GuardParser(isValid, otherName))));
  }
  /**
   * We want to refine to a new type given an original type, like isEven, or casting to a more
   * specific type
   */
  refine(refinementTest, otherName = refinementTest.name) {
    return new Parser(ConcatParsers.of(this, new Parser(new GuardParser(refinementTest, otherName))));
  }
  /**
   * Use this when we want to give the parser a name, and we want to be able to use the name in the error messages.
   * @param nameString
   * @returns
   */
  name(nameString) {
    return parserName(nameString, this);
  }
  /**
   * This is another type of parsing that will return a value that is a discriminated union of the success and failure cases.
   * https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions
   * @param value
   * @returns
   */
  enumParsed(value) {
    return this.parse(value, enumParsed);
  }
  /**
   * Return the unwrapped parser/ IParser
   * @returns
   */
  unwrappedParser() {
    let answer = this;
    while (true) {
      const next = answer.parser;
      if (next instanceof Parser) {
        answer = next;
      } else {
        return next;
      }
    }
  }
};
Object.defineProperty(Parser, "validatorErrorAsString", {
  enumerable: true,
  configurable: true,
  writable: true,
  value: (error) => {
    const { parser, value, keys } = error;
    const keysString = !keys.length ? "" : keys.map((x) => `[${x}]`).reverse().join("");
    return `${keysString}${Parser.parserAsString(parser)}(${saferStringify(value)})`;
  }
});

// ../../node_modules/ts-matches/esm/src/parsers/unknown-parser.js
var UnknownParser = class {
  constructor(description = {
    name: "Unknown",
    children: [],
    extras: []
  }) {
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
  }
  parse(a, onParse) {
    return onParse.parsed(a);
  }
};

// ../../node_modules/ts-matches/esm/src/parsers/simple-parsers.js
function guard(test, testName) {
  return Parser.isA(test, testName || test.name);
}
var any = new Parser(new AnyParser());
var unknown = new Parser(new UnknownParser());
var number = new Parser(new NumberParser());
var isNill = new Parser(new NilParser());
var natural = number.refine((x) => x >= 0 && x === Math.floor(x));
var isFunction = new Parser(new FunctionParser());
var boolean = new Parser(new BoolParser());
var object = new Parser(new ObjectParser());
var isArray = new Parser(new ArrayParser());
var string = new Parser(new StringParser());
var instanceOf = (classCreator) => guard((x) => x instanceof classCreator, `is${classCreator.name}`);
var regex = (tester) => string.refine(function(x) {
  return tester.test(x);
}, tester.toString());

// ../../node_modules/ts-matches/esm/src/parsers/some-parser.js
function some(...parsers) {
  if (parsers.length <= 0) {
    return any;
  }
  const first = parsers.splice(0, 1)[0];
  return parsers.reduce((left, right) => left.orParser(right), first);
}

// ../../node_modules/ts-matches/esm/src/parsers/every-parser.js
function every(...parsers) {
  const filteredParsers = parsers.filter((x) => x !== any);
  if (filteredParsers.length <= 0) {
    return any;
  }
  const first = filteredParsers.splice(0, 1)[0];
  return filteredParsers.reduce((left, right) => {
    return left.concat(right);
  }, first);
}

// ../../node_modules/ts-matches/esm/src/parsers/dictionary-parser.js
var DictionaryParser = class {
  constructor(parsers, description = {
    name: "Dictionary",
    children: parsers.reduce((acc, [k, v]) => {
      acc.push(k, v);
      return acc;
    }, []),
    extras: []
  }) {
    Object.defineProperty(this, "parsers", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: parsers
    });
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
  }
  parse(a, onParse) {
    const { parsers } = this;
    const parser = this;
    const entries = Object.entries(a);
    for (const entry of entries) {
      const [key, value] = entry;
      const found = findOrError(parsers, key, value, parser);
      if (found == void 0)
        return onParse.parsed(a);
      if ("error" in found)
        return onParse.invalid(found.error);
      entry[0] = found[0].value;
      entry[1] = found[1].value;
    }
    const answer = Object.fromEntries(entries);
    return onParse.parsed(answer);
  }
};
var dictionary = (...parsers) => {
  return object.concat(new DictionaryParser([...parsers]));
};
function findOrError(parsers, key, value, parser) {
  let foundError;
  for (const [keyParser, valueParser] of parsers) {
    const enumState = keyParser.enumParsed(key);
    const valueState = valueParser.enumParsed(value);
    if ("error" in enumState) {
      if (!foundError) {
        const { error } = enumState;
        error.parser = parser;
        error.keys.push("" + key);
        foundError = { error };
      }
      continue;
    }
    const newKey = enumState.value;
    if ("error" in valueState) {
      if (!foundError) {
        const { error } = valueState;
        error.keys.push("" + newKey);
        foundError = { error };
      }
      continue;
    }
    return [enumState, valueState];
  }
  return foundError;
}

// ../../node_modules/ts-matches/esm/src/parsers/tuple-parser.js
var TupleParser = class {
  constructor(parsers, lengthMatcher = literal(parsers.length), description = {
    name: "Tuple",
    children: parsers,
    extras: []
  }) {
    Object.defineProperty(this, "parsers", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: parsers
    });
    Object.defineProperty(this, "lengthMatcher", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: lengthMatcher
    });
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
  }
  parse(input, onParse) {
    const tupleError = isArray.enumParsed(input);
    if ("error" in tupleError)
      return onParse.invalid(tupleError.error);
    const values = input;
    const stateCheck = this.lengthMatcher.enumParsed(values.length);
    if ("error" in stateCheck) {
      stateCheck.error.keys.push(saferStringify("length"));
      return onParse.invalid(stateCheck.error);
    }
    const answer = new Array(this.parsers.length);
    for (const key in this.parsers) {
      const parser = this.parsers[key];
      const value = values[key];
      const result = parser.enumParsed(value);
      if ("error" in result) {
        const { error } = result;
        error.keys.push(saferStringify(key));
        return onParse.invalid(error);
      }
      answer[key] = result.value;
    }
    return onParse.parsed(answer);
  }
};
function tuple(...parsers) {
  return new Parser(new TupleParser(parsers));
}

// ../../node_modules/ts-matches/esm/src/parsers/array-of-parser.js
var ArrayOfParser = class {
  constructor(parser, description = {
    name: "ArrayOf",
    children: [parser],
    extras: []
  }) {
    Object.defineProperty(this, "parser", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: parser
    });
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
  }
  parse(a, onParse) {
    if (!Array.isArray(a)) {
      return onParse.invalid({
        value: a,
        keys: [],
        parser: this
      });
    }
    const values = [...a];
    for (let index = 0; index < values.length; index++) {
      const result = this.parser.enumParsed(values[index]);
      if ("error" in result) {
        result.error.keys.push("" + index);
        return onParse.invalid(result.error);
      } else {
        values[index] = result.value;
      }
    }
    return onParse.parsed(values);
  }
};
function arrayOf(validator) {
  return new Parser(new ArrayOfParser(validator));
}

// ../../node_modules/ts-matches/esm/src/parsers/literal-parser.js
var LiteralsParser = class {
  constructor(values, description = {
    name: "Literal",
    children: [],
    extras: values
  }) {
    Object.defineProperty(this, "values", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: values
    });
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
  }
  parse(a, onParse) {
    if (this.values.indexOf(a) >= 0) {
      return onParse.parsed(a);
    }
    return onParse.invalid({
      value: a,
      keys: [],
      parser: this
    });
  }
};
function literal(isEqualToValue) {
  return new Parser(new LiteralsParser([isEqualToValue]));
}
function literals(firstValue, ...restValues) {
  return new Parser(new LiteralsParser([firstValue, ...restValues]));
}

// ../../node_modules/ts-matches/esm/src/parsers/recursive-parser.js
var RecursiveParser = class {
  constructor(recursive2, description = {
    name: "Recursive",
    children: [],
    extras: [recursive2]
  }) {
    Object.defineProperty(this, "recursive", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: recursive2
    });
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
    Object.defineProperty(this, "parser", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
  }
  static create(fn) {
    const parser = new RecursiveParser(fn);
    parser.parser = fn(new Parser(parser));
    return parser;
  }
  parse(a, onParse) {
    if (!this.parser) {
      return onParse.invalid({
        value: "Recursive Invalid State",
        keys: [],
        parser: this
      });
    }
    return this.parser.parse(a, onParse);
  }
};
function recursive(fn) {
  const value = fn(any);
  const created = RecursiveParser.create(fn);
  return new Parser(created);
}

// ../../node_modules/ts-matches/esm/src/parsers/deferred-parser.js
var DeferredParser = class {
  constructor(description = {
    name: "Deferred",
    children: [],
    extras: []
  }) {
    Object.defineProperty(this, "description", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: description
    });
    Object.defineProperty(this, "parser", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
  }
  static create() {
    return new DeferredParser();
  }
  setParser(parser) {
    this.parser = new Parser(parser);
    return this;
  }
  parse(a, onParse) {
    if (!this.parser) {
      return onParse.invalid({
        value: "Not Set Up",
        keys: [],
        parser: this
      });
    }
    return this.parser.parse(a, onParse);
  }
};
function deferred() {
  const deferred2 = DeferredParser.create();
  function setParser(parser) {
    deferred2.setParser(parser);
  }
  return [new Parser(deferred2), setParser];
}

// ../../node_modules/ts-matches/esm/src/matches.js
var Matched = class {
  constructor(value) {
    Object.defineProperty(this, "value", {
      enumerable: true,
      configurable: true,
      writable: true,
      value
    });
    Object.defineProperty(this, "when", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: (..._args) => {
        return this;
      }
    });
    Object.defineProperty(this, "unwrap", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: () => {
        return this.value;
      }
    });
  }
  defaultTo(_defaultValue) {
    return this.value;
  }
  defaultToLazy(_getValue) {
    return this.value;
  }
};
var MatchMore = class {
  constructor(a) {
    Object.defineProperty(this, "a", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: a
    });
    Object.defineProperty(this, "when", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: (...args) => {
        const [outcome, ...matchers] = args.reverse();
        const me = this;
        const parser = matches.some(...matchers.map((matcher) => (
          // deno-lint-ignore no-explicit-any
          matcher instanceof Parser ? matcher : literal(matcher)
        )));
        const result = parser.enumParsed(this.a);
        if ("error" in result) {
          return me;
        }
        const { value } = result;
        if (outcome instanceof Function) {
          return new Matched(outcome(value));
        }
        return new Matched(outcome);
      }
    });
    Object.defineProperty(this, "unwrap", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: () => {
        throw new Error("Expecting that value is matched");
      }
    });
  }
  defaultTo(value) {
    return value;
  }
  defaultToLazy(getValue) {
    return getValue();
  }
};
var matches = Object.assign(function matchesFn(value) {
  return new MatchMore(value);
}, {
  array: isArray,
  arrayOf,
  some,
  tuple,
  regex,
  number,
  natural,
  isFunction,
  object,
  string,
  shape,
  partial,
  literal,
  every,
  guard,
  unknown,
  any,
  boolean,
  dictionary,
  literals,
  nill: isNill,
  instanceOf,
  Parse: Parser,
  parserName,
  recursive,
  deferred
});
var array = isArray;
var nill = isNill;
var Parse = Parser;
var oneOf = some;
var anyOf = some;
var allOf = every;
var matches_default = matches;

// ../../node_modules/ts-matches/esm/mod.js
var mod_default = matches_default;
export {
  AnyParser,
  ArrayOfParser,
  ArrayParser,
  BoolParser,
  ConcatParsers,
  FunctionParser,
  GuardParser,
  LiteralsParser,
  MappedAParser,
  NamedParser,
  NilParser,
  NumberParser,
  ObjectParser,
  OrParsers,
  Parse,
  Parser,
  ShapeParser,
  StringParser,
  Parser as Validator,
  allOf,
  any,
  anyOf,
  array,
  arrayOf,
  boolean,
  mod_default as default,
  deferred,
  dictionary,
  every,
  guard,
  instanceOf,
  isFunction,
  literal,
  literals,
  matches,
  natural,
  nill,
  number,
  object,
  oneOf,
  parserName,
  partial,
  recursive,
  regex,
  saferStringify,
  shape,
  some,
  string,
  tuple,
  unknown
};
//# sourceMappingURL=ts-matches.js.map
