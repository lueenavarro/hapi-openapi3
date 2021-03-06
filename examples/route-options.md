## Route Options Examples

Defining schema in response.schema and adding examples in plugins

```javascript
...
options: {
    validate: {
        headers: Joi.object({
            authorization: Joi.string()
        })
    },
    response: {
        schema: Joi.object({
            createdAt: Joi.date().iso()
            updatedAt: Joi.date().iso()
        })
    },
    plugins: {
        "hapi-openapi3": {
            response: {
                schema: {
                    examples: {
                        "Create At": {
                            createdAt: "2021-07-16T19:20+01:00"
                        },
                        "Updated At": {
                            updatedAt: "2021-07-16T19:20+01:00"
                        }
                    }
                }
            }
        }
    }
}
```

Defining schema in response.status and adding examples in plugins

```javascript
...
options: {
    validate: {
        headers: Joi.object({
            authorization: Joi.string()
        })
    },
    response: {
        status: {
            200: Joi.object({
                    createdAt: Joi.date().iso()
                    updatedAt: Joi.date().iso()
                })
        }
    },
    plugins: {
        "hapi-openapi3": {
            response: {
                status: {
                    200: {
                        examples: {
                            "Create At": {
                                createdAt: "2021-07-16T19:20+01:00"
                            },
                            "Updated At": {
                                updatedAt: "2021-07-16T19:20+01:00"
                            }
                        }
                    }
                }
            }
        }
    }
}
```

Defining payload schema and adding examples in plugins response.schema. This will prevent hapi from validating your response

```javascript
...
options: {
    validate: {
        headers: Joi.object({
            authorization: Joi.string()
        })
    },
    plugins: {
        "hapi-openapi3": {
            response: {
                schema: {
                    payload: Joi.object({
                        createdAt: Joi.date().iso()
                        updatedAt: Joi.date().iso()
                    }),
                    examples: {
                        "Create At": {
                            createdAt: "2021-07-16T19:20+01:00"
                        },
                        "Updated At": {
                            updatedAt: "2021-07-16T19:20+01:00"
                        }
                    }
                }
            }
        }
    }
}
```

Defining payload schema and adding examples in plugins response.status. This will prevent hapi from validating your response

```javascript
...
options: {
    validate: {
        headers: Joi.object({
            authorization: Joi.string()
        })
    },
    plugins: {
        "hapi-openapi3": {
            response: {
                status: {
                    200: {
                        payload: Joi.object({
                            createdAt: Joi.date().iso()
                            updatedAt: Joi.date().iso()
                        }),
                        examples: {
                            "Create At": {
                                createdAt: "2021-07-16T19:20+01:00"
                            },
                            "Updated At": {
                                updatedAt: "2021-07-16T19:20+01:00"
                            }
                        }
                    }
                }
            }
        }
    }
}
```
