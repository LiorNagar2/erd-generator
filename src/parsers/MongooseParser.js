const mongoose = require("mongoose");
const BaseParser = require("./BaseParser");

class MongooseParser extends BaseParser {

    constructor(config) {
        super(config);
    }

    createConnectionString() {
        const config = this.config;
        if (config.dbHost.includes("mongodb.net")) {
            // It's an Atlas connection string
            return `mongodb+srv://${config.dbUser}:${config.dbPassword}@${config.dbHost}/${config.dbName}?retryWrites=true&w=majority`;
        } else if (config.dbHost.includes("localhost")){
            return `mongodb://${config.dbHost}/${config.dbName}`;
        }
        else {
            // It's a local MongoDB instance
            return `mongodb://${config.dbUser}:${config.dbPassword}@${config.dbHost}/${config.dbName}`;
        }
    }

    async parse() {
        const connectionString = this.createConnectionString();
        await mongoose.connect(connectionString, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });

        const collections = await mongoose.connection.db.listCollections().toArray();
        const models = [];

        for (const collection of collections) {
            const collectionName = collection.name;

            // Use `findOne` or an equivalent to infer schema-like structure
            const sampleDoc = await mongoose.connection.db
                .collection(collectionName)
                .findOne();

            if (sampleDoc) {
                const schemaFields = Object.keys(sampleDoc).reduce((acc, key) => {
                    acc[key] = typeof sampleDoc[key];
                    return acc;
                }, {});

                // Extract relationships based on schema paths with `ref`
                const schema = mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }));
                const paths = schema.schema.paths;
                const relationships = Object.entries(paths)
                    .filter(([_, value]) => value.options && value.options.ref) // Look for `ref` key
                    .map(([key, value]) => ({
                        source: collectionName,
                        type: value.instance === "Array" ? "hasMany" : "hasOne",
                        target: value.options.ref,
                        key,
                    }));

                models.push({
                    name: collectionName,
                    schema: schemaFields,
                    relationships,
                });
            }
        }

        await mongoose.disconnect();
        return models;
    }
}

module.exports = MongooseParser;
