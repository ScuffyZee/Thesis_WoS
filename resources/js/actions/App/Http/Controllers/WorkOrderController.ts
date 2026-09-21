import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\WorkOrderController::index
 * @see app/Http/Controllers/WorkOrderController.php:20
 * @route '/work-orders'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/work-orders',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkOrderController::index
 * @see app/Http/Controllers/WorkOrderController.php:20
 * @route '/work-orders'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkOrderController::index
 * @see app/Http/Controllers/WorkOrderController.php:20
 * @route '/work-orders'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkOrderController::index
 * @see app/Http/Controllers/WorkOrderController.php:20
 * @route '/work-orders'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WorkOrderController::index
 * @see app/Http/Controllers/WorkOrderController.php:20
 * @route '/work-orders'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\WorkOrderController::index
 * @see app/Http/Controllers/WorkOrderController.php:20
 * @route '/work-orders'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\WorkOrderController::index
 * @see app/Http/Controllers/WorkOrderController.php:20
 * @route '/work-orders'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\WorkOrderController::create
 * @see app/Http/Controllers/WorkOrderController.php:83
 * @route '/work-orders/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/work-orders/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkOrderController::create
 * @see app/Http/Controllers/WorkOrderController.php:83
 * @route '/work-orders/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkOrderController::create
 * @see app/Http/Controllers/WorkOrderController.php:83
 * @route '/work-orders/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkOrderController::create
 * @see app/Http/Controllers/WorkOrderController.php:83
 * @route '/work-orders/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WorkOrderController::create
 * @see app/Http/Controllers/WorkOrderController.php:83
 * @route '/work-orders/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\WorkOrderController::create
 * @see app/Http/Controllers/WorkOrderController.php:83
 * @route '/work-orders/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\WorkOrderController::create
 * @see app/Http/Controllers/WorkOrderController.php:83
 * @route '/work-orders/create'
 */
        createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    create.form = createForm
/**
* @see \App\Http\Controllers\WorkOrderController::store
 * @see app/Http/Controllers/WorkOrderController.php:98
 * @route '/work-orders'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/work-orders',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WorkOrderController::store
 * @see app/Http/Controllers/WorkOrderController.php:98
 * @route '/work-orders'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkOrderController::store
 * @see app/Http/Controllers/WorkOrderController.php:98
 * @route '/work-orders'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WorkOrderController::store
 * @see app/Http/Controllers/WorkOrderController.php:98
 * @route '/work-orders'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WorkOrderController::store
 * @see app/Http/Controllers/WorkOrderController.php:98
 * @route '/work-orders'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\WorkOrderController::show
 * @see app/Http/Controllers/WorkOrderController.php:148
 * @route '/work-orders/{workOrder}'
 */
export const show = (args: { workOrder: number | { id: number } } | [workOrder: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/work-orders/{workOrder}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkOrderController::show
 * @see app/Http/Controllers/WorkOrderController.php:148
 * @route '/work-orders/{workOrder}'
 */
show.url = (args: { workOrder: number | { id: number } } | [workOrder: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workOrder: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { workOrder: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    workOrder: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workOrder: typeof args.workOrder === 'object'
                ? args.workOrder.id
                : args.workOrder,
                }

    return show.definition.url
            .replace('{workOrder}', parsedArgs.workOrder.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkOrderController::show
 * @see app/Http/Controllers/WorkOrderController.php:148
 * @route '/work-orders/{workOrder}'
 */
show.get = (args: { workOrder: number | { id: number } } | [workOrder: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkOrderController::show
 * @see app/Http/Controllers/WorkOrderController.php:148
 * @route '/work-orders/{workOrder}'
 */
show.head = (args: { workOrder: number | { id: number } } | [workOrder: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WorkOrderController::show
 * @see app/Http/Controllers/WorkOrderController.php:148
 * @route '/work-orders/{workOrder}'
 */
    const showForm = (args: { workOrder: number | { id: number } } | [workOrder: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\WorkOrderController::show
 * @see app/Http/Controllers/WorkOrderController.php:148
 * @route '/work-orders/{workOrder}'
 */
        showForm.get = (args: { workOrder: number | { id: number } } | [workOrder: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\WorkOrderController::show
 * @see app/Http/Controllers/WorkOrderController.php:148
 * @route '/work-orders/{workOrder}'
 */
        showForm.head = (args: { workOrder: number | { id: number } } | [workOrder: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\WorkOrderController::accept
 * @see app/Http/Controllers/WorkOrderController.php:169
 * @route '/work-orders/{workOrder}/accept'
 */
export const accept = (args: { workOrder: number | { id: number } } | [workOrder: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

accept.definition = {
    methods: ["post"],
    url: '/work-orders/{workOrder}/accept',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WorkOrderController::accept
 * @see app/Http/Controllers/WorkOrderController.php:169
 * @route '/work-orders/{workOrder}/accept'
 */
accept.url = (args: { workOrder: number | { id: number } } | [workOrder: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workOrder: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { workOrder: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    workOrder: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workOrder: typeof args.workOrder === 'object'
                ? args.workOrder.id
                : args.workOrder,
                }

    return accept.definition.url
            .replace('{workOrder}', parsedArgs.workOrder.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkOrderController::accept
 * @see app/Http/Controllers/WorkOrderController.php:169
 * @route '/work-orders/{workOrder}/accept'
 */
accept.post = (args: { workOrder: number | { id: number } } | [workOrder: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WorkOrderController::accept
 * @see app/Http/Controllers/WorkOrderController.php:169
 * @route '/work-orders/{workOrder}/accept'
 */
    const acceptForm = (args: { workOrder: number | { id: number } } | [workOrder: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: accept.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WorkOrderController::accept
 * @see app/Http/Controllers/WorkOrderController.php:169
 * @route '/work-orders/{workOrder}/accept'
 */
        acceptForm.post = (args: { workOrder: number | { id: number } } | [workOrder: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: accept.url(args, options),
            method: 'post',
        })
    
    accept.form = acceptForm
/**
* @see \App\Http\Controllers\WorkOrderController::updateStatus
 * @see app/Http/Controllers/WorkOrderController.php:189
 * @route '/work-orders/{workOrder}/status'
 */
export const updateStatus = (args: { workOrder: number | { id: number } } | [workOrder: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateStatus.url(args, options),
    method: 'patch',
})

updateStatus.definition = {
    methods: ["patch"],
    url: '/work-orders/{workOrder}/status',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\WorkOrderController::updateStatus
 * @see app/Http/Controllers/WorkOrderController.php:189
 * @route '/work-orders/{workOrder}/status'
 */
updateStatus.url = (args: { workOrder: number | { id: number } } | [workOrder: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workOrder: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { workOrder: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    workOrder: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workOrder: typeof args.workOrder === 'object'
                ? args.workOrder.id
                : args.workOrder,
                }

    return updateStatus.definition.url
            .replace('{workOrder}', parsedArgs.workOrder.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkOrderController::updateStatus
 * @see app/Http/Controllers/WorkOrderController.php:189
 * @route '/work-orders/{workOrder}/status'
 */
updateStatus.patch = (args: { workOrder: number | { id: number } } | [workOrder: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateStatus.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\WorkOrderController::updateStatus
 * @see app/Http/Controllers/WorkOrderController.php:189
 * @route '/work-orders/{workOrder}/status'
 */
    const updateStatusForm = (args: { workOrder: number | { id: number } } | [workOrder: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateStatus.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WorkOrderController::updateStatus
 * @see app/Http/Controllers/WorkOrderController.php:189
 * @route '/work-orders/{workOrder}/status'
 */
        updateStatusForm.patch = (args: { workOrder: number | { id: number } } | [workOrder: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateStatus.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateStatus.form = updateStatusForm
/**
* @see \App\Http\Controllers\WorkOrderController::destroy
 * @see app/Http/Controllers/WorkOrderController.php:158
 * @route '/work-orders/{workOrder}'
 */
export const destroy = (args: { workOrder: number | { id: number } } | [workOrder: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/work-orders/{workOrder}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\WorkOrderController::destroy
 * @see app/Http/Controllers/WorkOrderController.php:158
 * @route '/work-orders/{workOrder}'
 */
destroy.url = (args: { workOrder: number | { id: number } } | [workOrder: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workOrder: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { workOrder: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    workOrder: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workOrder: typeof args.workOrder === 'object'
                ? args.workOrder.id
                : args.workOrder,
                }

    return destroy.definition.url
            .replace('{workOrder}', parsedArgs.workOrder.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkOrderController::destroy
 * @see app/Http/Controllers/WorkOrderController.php:158
 * @route '/work-orders/{workOrder}'
 */
destroy.delete = (args: { workOrder: number | { id: number } } | [workOrder: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\WorkOrderController::destroy
 * @see app/Http/Controllers/WorkOrderController.php:158
 * @route '/work-orders/{workOrder}'
 */
    const destroyForm = (args: { workOrder: number | { id: number } } | [workOrder: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WorkOrderController::destroy
 * @see app/Http/Controllers/WorkOrderController.php:158
 * @route '/work-orders/{workOrder}'
 */
        destroyForm.delete = (args: { workOrder: number | { id: number } } | [workOrder: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const WorkOrderController = { index, create, store, show, accept, updateStatus, destroy }

export default WorkOrderController