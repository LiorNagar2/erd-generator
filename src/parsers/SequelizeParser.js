const { Sequelize, DataTypes } = require("sequelize");
const BaseParser = require("./BaseParser");

class SequelizeParser extends BaseParser {
    constructor(config) {
        super(config);
        this.sequelize = new Sequelize(
            config.dbName,
            config.dbUser || '',
            config.dbPassword || '',
            {
                host: config.dbHost,
                dialect: config.dialect,
                logging: false,
            }
        );
    }

    async parse() {
        const models = await this.loadModels();
        const modelData = [];

        for (const modelName in models) {
            const model = models[modelName];
            const columns = await this.sequelize.getQueryInterface().describeTable(model.tableName);

            const schema = {};
            Object.keys(columns).forEach((colName) => {
                schema[colName] = columns[colName].type.toString();
            });

            // Extract relationships
            const relationships = this.getModelRelationships(model);

            modelData.push({
                name: modelName,
                schema,
                relationships,
            });
        }

        return modelData;
    }

    async loadModels() {
        const models = this.sequelize.models;
        // Syncing models can be useful to ensure they are loaded
        await this.sequelize.sync();
        return models;
    }

    getModelRelationships(model) {
        const relationships = [];

        // Check for associations like belongsTo, hasMany, etc.
        for (const associationName in model.associations) {
            const association = model.associations[associationName];

            let relationType = false;
            switch (association.associationType) {
                case "HasMany":
                    relationType = 'hasMany';
                    break;
                case "BelongsTo":
                    relationType = 'belongsTo';
                    break;
                case "HasOne":
                    relationType = 'hasOne';
                    break;
                case "BelongsToMany":
                    relationType = 'belongsToMany';
                    break;
            }

            if(relationType){
                relationships.push({
                    type: relationType,
                    source: model.name,
                    target: association.target.name,
                    key: association.foreignKey,
                });
            }
        }

        return relationships;
    }
}

module.exports = SequelizeParser;
