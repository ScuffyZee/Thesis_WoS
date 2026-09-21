import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PublicRequestController::create
 * @see app/Http/Controllers/PublicRequestController.php:17
 * @route '/request'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/request',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PublicRequestController::create
 * @see app/Http/Controllers/PublicRequestController.php:17
 * @route '/request'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PublicRequestController::create
 * @see app/Http/Controllers/PublicRequestController.php:17
 * @route '/request'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PublicRequestController::create
 * @see app/Http/Controllers/PublicRequestController.php:17
 * @route '/request'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PublicRequestController::create
 * @see app/Http/Controllers/PublicRequestController.php:17
 * @route '/request'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PublicRequestController::create
 * @see app/Http/Controllers/PublicRequestController.php:17
 * @route '/request'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PublicRequestController::create
 * @see app/Http/Controllers/PublicRequestController.php:17
 * @route '/request'
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
* @see \App\Http\Controllers\PublicRequestController::store
 * @see app/Http/Controllers/PublicRequestController.php:30
 * @route '/request'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/request',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PublicRequestController::store
 * @see app/Http/Controllers/PublicRequestController.php:30
 * @route '/request'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PublicRequestController::store
 * @see app/Http/Controllers/PublicRequestController.php:30
 * @route '/request'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PublicRequestController::store
 * @see app/Http/Controllers/PublicRequestController.php:30
 * @route '/request'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PublicRequestController::store
 * @see app/Http/Controllers/PublicRequestController.php:30
 * @route '/request'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\PublicRequestController::success
 * @see app/Http/Controllers/PublicRequestController.php:79
 * @route '/request/success'
 */
export const success = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: success.url(options),
    method: 'get',
})

success.definition = {
    methods: ["get","head"],
    url: '/request/success',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PublicRequestController::success
 * @see app/Http/Controllers/PublicRequestController.php:79
 * @route '/request/success'
 */
success.url = (options?: RouteQueryOptions) => {
    return success.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PublicRequestController::success
 * @see app/Http/Controllers/PublicRequestController.php:79
 * @route '/request/success'
 */
success.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: success.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PublicRequestController::success
 * @see app/Http/Controllers/PublicRequestController.php:79
 * @route '/request/success'
 */
success.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: success.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PublicRequestController::success
 * @see app/Http/Controllers/PublicRequestController.php:79
 * @route '/request/success'
 */
    const successForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: success.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PublicRequestController::success
 * @see app/Http/Controllers/PublicRequestController.php:79
 * @route '/request/success'
 */
        successForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: success.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PublicRequestController::success
 * @see app/Http/Controllers/PublicRequestController.php:79
 * @route '/request/success'
 */
        successForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: success.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    success.form = successForm
const PublicRequestController = { create, store, success }

export default PublicRequestController