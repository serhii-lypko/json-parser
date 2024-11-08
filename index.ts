const { log } = console;

type $fixme = any;

/*
  * push down state automata *

  🟡 The very first objective:
  Only strings and nested strings. No numbers, booleans, nulls or arrays.


  ...

  - handle escaping
  - trim whitespaces
*/

// const string = `{"widget":{"debug":"on","text":{"data":"Click Here","size":36}}}`;

// TODO: test cases with broken inputs:
// {"widget:"awesome","element":"hello"}

// const simple = `{"widget":"awesome","element":"hello","right":"yes"}`;
// const simple = `{"widget":"awesome"}`;
const simple = `{"widget":"awesome","amazing":{"element":"hello","yeah":"definitely","newKey":{"yes":"new key"}}}`;
// const str2 = `{"widget":{"debug":"on","logger":"off"}}`;

// NOTE: let's pretend now values can be only string or object
// const str2 = `{"widget":{"debug":"on","is_valid":true,"age":555}}`;

// NOTE: is it correct to call it tokens?
enum Token {
  OPEN_BRACE = '{'.charCodeAt(0),
  CLOSE_BRACE = '}'.charCodeAt(0),
  OPEN_BRACKET = '['.charCodeAt(0),
  CLOSE_BRACKET = '['.charCodeAt(0),
  COLON = ':'.charCodeAt(0),
  COMMA = ','.charCodeAt(0),
  QUOTE = '"'.charCodeAt(0),
}

// { or [ -> create new level
// , -> new entity at same level
// " -> string
// : -> transition from key to value; should appears in arrays

enum LevelKind {
  Record,
  Array,
}

type Level = Record<$fixme, $fixme> | Array<$fixme>;

// type Level = {
//   // kind: LevelKind;
//   bloc: Record<$fixme, $fixme> | Array<$fixme>;
// };

class Parser {
  input: string;
  cursor: number;
  stack: Array<Level>;
  result: object;

  constructor() {
    this.input = '';
    this.cursor = 0;
    this.stack = [];
    this.result = {};
  }

  parse(input: string): Level {
    this.input = input;
    this.result = this.openLevel();

    if (this.stack.length != 0) {
      throw new Error('Parsing error');
    }

    return this.result;
  }

  openLevel(): Level {
    const opening = this.input.charCodeAt(this.cursor);

    switch (opening) {
      case Token.OPEN_BRACE:
        this.stack.push({});
        this.advanceCursor();
        this.parseRecordLevel();

        break;
      case Token.OPEN_BRACKET:
        this.stack.push([]);
        this.advanceCursor();
        this.parseArrayLevel();

        break;
      default:
        throw new Error('Unexpected opening character');
    }

    this.advanceCursor();

    // FIXME
    // @ts-ignore
    return this.stack.pop();
  }

  parseRecordLevel() {
    if (!this.isCurrentSymbolQuote) {
      throw new Error('Unexpected character at the record level opening');
    }

    while (this.currentSymbolCharCode != Token.CLOSE_BRACE) {
      log('iter');
      this.parseKVRecord();

      switch (this.currentSymbolCharCode) {
        case Token.CLOSE_BRACE:
          break;
        case Token.COMMA:
          this.advanceCursor();
          continue;
        default:
          throw new Error(
            `Unexpected character ${this.currentSymbol} between KVs at record level`
          );
      }
    }
  }

  parseKVRecord() {
    const key = this.parseString();

    /// Expecting a :
    if (!this.isCurrentSymbolColon) {
      throw new Error(
        `Unexpected character between KV pair elements ${this.currentSymbol}`
      );
    }
    this.advanceCursor();
    this.stack[this.stack.length - 1][key] = this.parseKVValue();
  }

  parseArrayLevel() {
    //
  }

  parseString() {
    let res = '';

    if (!this.isCurrentSymbolQuote) {
      throw new Error(
        `Unexpected character at parsing string ${this.currentSymbol}`
      );
    }

    this.advanceCursor();

    while (!this.isCurrentSymbolQuote) {
      res += this.currentSymbol;
      this.advanceCursor();
    }

    this.advanceCursor();

    return res;
  }

  parseKVValue() {
    switch (this.currentSymbolCharCode) {
      case Token.OPEN_BRACE:
      case Token.OPEN_BRACKET:
        return this.openLevel();
      case Token.QUOTE:
        return this.parseString();

      // TODO: more options as values: numbers, booleans and nulls
      default:
      //
    }
  }

  advanceCursor() {
    this.cursor++;
  }

  get isCurrentSymbolQuote(): boolean {
    return this.currentSymbolCharCode == Token.QUOTE;
  }

  get isCurrentSymbolColon(): boolean {
    return this.currentSymbolCharCode == Token.COLON;
  }

  get isCurrentSymbolComma(): boolean {
    return this.currentSymbolCharCode == Token.COMMA;
  }

  get isCurrentSymbolCloseBrace(): boolean {
    return this.currentSymbolCharCode == Token.CLOSE_BRACE;
  }

  get currentSymbolCharCode(): number {
    return this.currentSymbol.charCodeAt(0);
  }

  get currentSymbol(): string {
    return this.input[this.cursor];
  }

  _printState() {
    log(this.input[this.cursor]);
    log(this.stack[this.stack.length - 1]);
  }
}

function newMain() {
  const parser = new Parser();
  const res = parser.parse(simple);

  console.log('Super result: ', res);
}

/// isPalindrome implementation using Pushdown automaton
function isPalindrome(input: string) {
  let mid = Math.floor(input.length / 2);

  let stack: any = [];

  let isEven = input.length % 2 == 0;

  for (let i = 0; i < mid; i++) {
    stack.push(input[i]);
  }

  for (let i = isEven ? mid : mid + 1; i < input.length; i++) {
    if (stack[stack.length - 1] == input[i]) {
      stack.pop();
    } else {
      return false;
    }
  }

  return stack.length == 0;
}

function main() {
  // const res = processString(simple);

  newMain();

  // log(isPalindrome('abcba'));
}

main();
