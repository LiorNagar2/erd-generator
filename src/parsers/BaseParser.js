class BaseParser {
    constructor(config) {
        this.config = config;
    }

    async parse() {
        throw new Error("Parse method must be implemented by subclasses");
    }
}

module.exports = BaseParser;
