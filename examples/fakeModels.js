export const fakeModels = [
    {
        name: 'User',
        schema: {
            id: 'INTEGER',
            name: 'STRING',
            email: 'STRING',
            createdAt: 'DATE',
            updatedAt: 'DATE',
        },
        relationships: [
            { type: 'hasMany', source: 'User', target: 'Post', key: 'userId' },
            { type: 'hasMany', source: 'User', target: 'Comment', key: 'userId' },
        ],
    },
    {
        name: 'Post',
        schema: {
            id: 'INTEGER',
            title: 'STRING',
            content: 'TEXT',
            createdAt: 'DATE',
            updatedAt: 'DATE',
            userId: 'INTEGER',
        },
        relationships: [
            { type: 'belongsTo', source: 'Post', target: 'User', key: 'userId' },
            { type: 'hasMany', source: 'Post', target: 'Comment', key: 'postId' },
        ],
    },
    {
        name: 'Comment',
        schema: {
            id: 'INTEGER',
            text: 'STRING',
            createdAt: 'DATE',
            updatedAt: 'DATE',
            userId: 'INTEGER',
            postId: 'INTEGER',
        },
        relationships: [
            { type: 'belongsTo', source: 'Comment', target: 'User', key: 'userId' },
            { type: 'belongsTo', source: 'Comment', target: 'Post', key: 'postId' },
        ],
    },
    {
        name: 'Category',
        schema: {
            id: 'INTEGER',
            name: 'STRING',
            description: 'TEXT',
            createdAt: 'DATE',
            updatedAt: 'DATE',
        },
        relationships: [
            { type: 'belongsToMany', source: 'Category', target: 'Post', key: 'categoryId' },
        ],
    },
    {
        name: 'PostCategory',
        schema: {
            postId: 'INTEGER',
            categoryId: 'INTEGER',
        },
        relationships: [
            { type: 'belongsTo', source: 'PostCategory', target: 'Post', key: 'postId' },
            { type: 'belongsTo', source: 'PostCategory', target: 'Category', key: 'categoryId' },
        ],
    },
];