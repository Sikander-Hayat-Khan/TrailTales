/**
 * Concepts Implemented:
 * 1. ADT (Abstract Data Types): Token, QueryNode classes.
 * 2. Automata: The Lexer acts as a finite automaton to tokenize the input.
 * 3. Grammar: The structure of the query language (Query -> Term Query | epsilon).
 * 4. Parser: Recursive descent parser implementation.
 * 5. Recursion: Used in the parser to process the token stream.
 * 6. Regex: Used in the lexer to identify token patterns.
 * 7. Little Language: A domain-specific language for searching memories.
 */

// --- ADT: Token ---
class Token {
    type: string;
    value: any;
    constructor(type: string, value: any) {
        this.type = type;
        this.value = value;
    }
}

// --- ADT: AST Nodes ---
class QueryNode {
    type: string;
    constructor(type: string) {
        this.type = type;
    }
}

class FilterNode extends QueryNode {
    field: string;
    value: any;
    constructor(field: string, value: any) {
        super('FILTER');
        this.field = field;
        this.value = value;
    }
}

class TextNode extends QueryNode {
    text: string;
    constructor(text: string) {
        super('TEXT');
        this.text = text;
    }
}

class AndNode extends QueryNode {
    left: QueryNode;
    right: QueryNode;
    constructor(left: QueryNode, right: QueryNode) {
        super('AND');
        this.left = left;
        this.right = right;
    }
}

// --- Automata / Regex: Lexer ---
class Lexer {
    input: string;
    pos: number;
    tokens: Token[];

    constructor(input: string) {
        this.input = input;
        this.pos = 0;
        this.tokens = [];
    }

    tokenize() {
        while (this.pos < this.input.length) {
            const char = this.input[this.pos];

            if (/\s/.test(char)) {
                this.pos++;
                continue;
            }

            if (char === ':') {
                this.tokens.push(new Token('COLON', ':'));
                this.pos++;
                continue;
            }

            if (char === '"') {
                this.tokens.push(new Token('STRING', this.readString()));
                continue;
            }

            if (/[a-zA-Z0-9_]/.test(char)) {
                this.tokens.push(new Token('WORD', this.readWord()));
                continue;
            }

            // Unknown character, skip
            this.pos++;
        }
        this.tokens.push(new Token('EOF', null));
        return this.tokens;
    }

    readString() {
        this.pos++; // Skip opening quote
        let str = '';
        while (this.pos < this.input.length && this.input[this.pos] !== '"') {
            str += this.input[this.pos];
            this.pos++;
        }
        this.pos++; // Skip closing quote
        return str;
    }

    readWord() {
        let word = '';
        while (this.pos < this.input.length && /[a-zA-Z0-9_]/.test(this.input[this.pos])) {
            word += this.input[this.pos];
            this.pos++;
        }
        return word;
    }
}

// --- Recursion / Grammar: Parser ---
class Parser {
    tokens: Token[];
    pos: number;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.pos = 0;
    }

    peek() {
        return this.tokens[this.pos];
    }

    consume() {
        return this.tokens[this.pos++];
    }

    // Grammar: Query -> Term Query | epsilon
    parse() {
        const terms: QueryNode[] = [];
        while (this.peek().type !== 'EOF') {
            terms.push(this.parseTerm());
        }
        return terms;
    }

    // Grammar: Term -> Key : Value | Word
    parseTerm() {
        const token = this.peek();

        if (token.type === 'WORD') {
            const nextToken = this.tokens[this.pos + 1];
            if (nextToken && nextToken.type === 'COLON') {
                return this.parseFilter();
            }
        }

        return this.parseText();
    }

    parseFilter() {
        const key = this.consume().value; // Key
        this.consume(); // Colon
        const valueToken = this.consume(); // Value
        return new FilterNode(key, valueToken.value);
    }

    parseText() {
        const token = this.consume();
        return new TextNode(token.value);
    }
}

export const parseSearchQuery = (query: string) => {
    const lexer = new Lexer(query);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    return parser.parse();
};
