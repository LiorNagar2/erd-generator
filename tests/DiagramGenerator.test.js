const DiagramGenerator = require('../src/diagram/DiagramGenerator');
const fs = require('fs');

jest.mock('fs');
jest.mock('child_process', () => ({
    exec: jest.fn((command, callback) => callback(null, "stdout", "stderr")),
}));

describe("DiagramGenerator", () => {
    const models = [
        {
            name: "User",
            schema: { id: "INTEGER", name: "STRING", email: "STRING" },
            relationships: [
                { source: "User", target: "Post", type: "hasMany" },
            ],
        },
        {
            name: "Post",
            schema: { id: "INTEGER", title: "STRING", userId: "INTEGER" },
            relationships: [
                { source: "Post", target: "User", type: "belongsTo" },
            ],
        },
    ];

    const outputFile = "output/ERD.md";

    beforeEach(() => {
        fs.existsSync.mockReturnValue(true);
        fs.writeFileSync.mockClear();
    });

    it("should generate mermaid syntax correctly", () => {
        const generator = new DiagramGenerator(outputFile);
        const mermaidSyntax = generator.generateMermaidSyntax(models);

        expect(mermaidSyntax).toContain("erDiagram");
        expect(mermaidSyntax).toContain("User {");
        expect(mermaidSyntax).toContain("Post {");
        expect(mermaidSyntax).toContain("User ||--o{ Post");
    });

    it("should write markdown output correctly", () => {
        const generator = new DiagramGenerator(outputFile);
        generator.generateMarkdown(models);

        expect(fs.writeFileSync).toHaveBeenCalledWith(
            outputFile,
            expect.stringContaining("```mermaid"),
            "utf8"
        );
    });

    it("should handle diagram generation", () => {
        const generator = new DiagramGenerator(outputFile);
        generator.generateDiagram(models, "svg");

        expect(fs.writeFileSync).toHaveBeenCalled();
        expect(fs.unlinkSync).toHaveBeenCalled();
    });

    it("should throw an error if models are empty", () => {
        const generator = new DiagramGenerator(outputFile);

        expect(() => generator.generateMermaidSyntax([])).toThrow(
            "No models were provided. Ensure the database is populated and properly configured."
        );
    });
});
