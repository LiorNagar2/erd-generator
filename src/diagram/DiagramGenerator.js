const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const mmdcPath = path.resolve(__dirname, "../../node_modules/.bin/mmdc");

class DiagramGenerator {
    constructor(outputFile) {
        this.outputFile = outputFile || "ERD.md";
    }

    generateMermaidSyntax(models) {
        if (!models || models.length === 0) {
            throw new Error("No models were provided. Ensure the database is populated and properly configured.");
        }

        let diagram = "erDiagram\n";

        models.forEach((model) => {
            // Add entities and their fields
            diagram += `  ${model.name} {\n`;
            Object.entries(model.schema).forEach(([field, type]) => {
                diagram += `    ${field} ${type}\n`;
            });
            diagram += "  }\n";

            // Add relationships
            const relationships = model.relationships || [];
            relationships.forEach((relation) => {
                if (relation.source && relation.target && relation.type) {
                    const relationshipType = this.getRelationshipType(relation.type);
                    if (relationshipType) {
                        diagram += `  ${relation.source} ${relationshipType} ${relation.target} : "${relation.type}"\n`;
                    } else {
                        console.warn("Skipping unsupported relationship type:", relation.type);
                    }
                } else {
                    console.warn("Skipping invalid relationship:", relation);
                }
            });
        });

        return diagram;
    }

    getRelationshipType(type) {
        const relationshipTypes = {
            hasMany: "||--o{",
            belongsTo: "}o--||",
            hasOne: "||--||",
            belongsToMany: "}o--o{",
        };
        return relationshipTypes[type] || null;
    }

    generateMarkdown(models) {
        const mermaidSyntax = this.generateMermaidSyntax(models);
        const outputDir = path.dirname(this.outputFile);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(this.outputFile, `\`\`\`mermaid\n${mermaidSyntax}\n\`\`\``, "utf8");
        console.log(`Markdown ERD saved to ${this.outputFile}`);
    }

    generateDiagram(models, format = "svg") {
        const mermaidSyntax = this.generateMermaidSyntax(models);

        // Save the mermaid syntax to a temporary file
        const tempFile = path.resolve("./output/temp.mmd");
        const outputDir = path.dirname(tempFile);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        fs.writeFileSync(tempFile, mermaidSyntax, "utf8");

        const outputFile = this.outputFile.replace(/\.md$/, `.${format}`);
        const command = `${mmdcPath} -i ${tempFile} -o ${outputFile} -t neutral`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error generating diagram: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            } else {
                console.log(`Diagram generated and saved as ${outputFile}`);
            }

            // Clean up temporary file
            try {
                fs.unlinkSync(tempFile);
            } catch (unlinkError) {
                console.error(`Failed to delete temporary file: ${unlinkError.message}`);
            }
        });
    }
}

module.exports = DiagramGenerator;
