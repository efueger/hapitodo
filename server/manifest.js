'use strict';

const Confidence = require('confidence');

const defaultCriteria = exports.defaults = {
    db: process.env.DB,
    // $lab:coverage:off$
    port: process.env.PORT || 8888,
    connectionString: process.env.POSTGRES || 'postgres://hapitodo:hapitodo@localhost/hapitodo'
    // $lab:coverage:on$
};

const errorhOptions = exports.errorhOptions = {
    errorFiles: {
        404: '404.html',
        default: '50x.html'
    },
    staticRoute: {
        path: '/{path*}',
        method: '*',
        handler: {
            directory: {
                path: './',
                index: true,
                redirectToSlash: true
            }
        },
        config: { plugins: { blankie: false } }
    }
};

const store = new Confidence.Store({
    connections: [{ port: defaultCriteria.port }],
    server: {
        debug: false,
        connections: {
            routes: { files: { relativeTo: `${process.cwd()}/static` } },
            router: {
                isCaseSensitive: false,
                stripTrailingSlash: true
            }
        }
    },
    registrations: [
        { plugin: 'inert' },
        { plugin: 'scooter' },
        { plugin: 'blankie' },
        {
            plugin: {
                register: 'errorh',
                options: errorhOptions
            }
        },
        {
            plugin: {
                register: 'crumb',
                options: { restful: true }
            }
        },
        {
            plugin: {
                register: 'acquaint',
                options: {
                    routes: [{ includes: ['server/route/**/*.js'] }],
                    handlers: [{ includes: ['server/handler/**/*.js'] }],
                    methods: [{
                        $filter: 'db',
                        $default: {
                            includes: ['server/method/json/*Model.js'],
                            options: { bind: { todosDB: {} } } // This is for demo purpose only.
                        },
                        postgres: {
                            includes: ['server/method/postgres/*Model.js'],
                            options: { bind: { connectionString: defaultCriteria.connectionString } }
                        }
                    }]
                }
            }
        },
        {
            plugin: {
                register: 'good',
                options: {
                    ops: { interval: 3600 * 1000 },
                    reporters: {
                        console: [
                            {
                                module: 'good-squeeze',
                                name: 'Squeeze',
                                args: [{ ops: '*', log: '*', error: '*', response: '*' }]
                            },
                            { module: 'good-console' },
                            'stdout'
                        ]
                    }
                }
            }
        }
    ]
});


exports.get = (key, criteria) => {

    return store.get(key, criteria || defaultCriteria);
};
