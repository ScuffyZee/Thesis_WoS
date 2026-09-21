import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\UserController::index
 * @see app/Http/Controllers/UserController.php:16
 * @route '/user-accounts'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/user-accounts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserController::index
 * @see app/Http/Controllers/UserController.php:16
 * @route '/user-accounts'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserController::index
 * @see app/Http/Controllers/UserController.php:16
 * @route '/user-accounts'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\UserController::index
 * @see app/Http/Controllers/UserController.php:16
 * @route '/user-accounts'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\UserController::index
 * @see app/Http/Controllers/UserController.php:16
 * @route '/user-accounts'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\UserController::index
 * @see app/Http/Controllers/UserController.php:16
 * @route '/user-accounts'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\UserController::index
 * @see app/Http/Controllers/UserController.php:16
 * @route '/user-accounts'
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
* @see \App\Http\Controllers\UserController::store
 * @see app/Http/Controllers/UserController.php:45
 * @route '/user-accounts'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/user-accounts',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\UserController::store
 * @see app/Http/Controllers/UserController.php:45
 * @route '/user-accounts'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserController::store
 * @see app/Http/Controllers/UserController.php:45
 * @route '/user-accounts'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\UserController::store
 * @see app/Http/Controllers/UserController.php:45
 * @route '/user-accounts'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\UserController::store
 * @see app/Http/Controllers/UserController.php:45
 * @route '/user-accounts'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\UserController::update
 * @see app/Http/Controllers/UserController.php:64
 * @route '/user-accounts/{userAccount}'
 */
export const update = (args: { userAccount: number | { id: number } } | [userAccount: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/user-accounts/{userAccount}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\UserController::update
 * @see app/Http/Controllers/UserController.php:64
 * @route '/user-accounts/{userAccount}'
 */
update.url = (args: { userAccount: number | { id: number } } | [userAccount: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { userAccount: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { userAccount: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    userAccount: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        userAccount: typeof args.userAccount === 'object'
                ? args.userAccount.id
                : args.userAccount,
                }

    return update.definition.url
            .replace('{userAccount}', parsedArgs.userAccount.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserController::update
 * @see app/Http/Controllers/UserController.php:64
 * @route '/user-accounts/{userAccount}'
 */
update.put = (args: { userAccount: number | { id: number } } | [userAccount: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\UserController::update
 * @see app/Http/Controllers/UserController.php:64
 * @route '/user-accounts/{userAccount}'
 */
    const updateForm = (args: { userAccount: number | { id: number } } | [userAccount: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\UserController::update
 * @see app/Http/Controllers/UserController.php:64
 * @route '/user-accounts/{userAccount}'
 */
        updateForm.put = (args: { userAccount: number | { id: number } } | [userAccount: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\UserController::destroy
 * @see app/Http/Controllers/UserController.php:87
 * @route '/user-accounts/{userAccount}'
 */
export const destroy = (args: { userAccount: number | { id: number } } | [userAccount: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/user-accounts/{userAccount}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\UserController::destroy
 * @see app/Http/Controllers/UserController.php:87
 * @route '/user-accounts/{userAccount}'
 */
destroy.url = (args: { userAccount: number | { id: number } } | [userAccount: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { userAccount: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { userAccount: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    userAccount: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        userAccount: typeof args.userAccount === 'object'
                ? args.userAccount.id
                : args.userAccount,
                }

    return destroy.definition.url
            .replace('{userAccount}', parsedArgs.userAccount.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserController::destroy
 * @see app/Http/Controllers/UserController.php:87
 * @route '/user-accounts/{userAccount}'
 */
destroy.delete = (args: { userAccount: number | { id: number } } | [userAccount: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\UserController::destroy
 * @see app/Http/Controllers/UserController.php:87
 * @route '/user-accounts/{userAccount}'
 */
    const destroyForm = (args: { userAccount: number | { id: number } } | [userAccount: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\UserController::destroy
 * @see app/Http/Controllers/UserController.php:87
 * @route '/user-accounts/{userAccount}'
 */
        destroyForm.delete = (args: { userAccount: number | { id: number } } | [userAccount: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
/**
* @see \App\Http\Controllers\UserController::profile
 * @see app/Http/Controllers/UserController.php:97
 * @route '/my-profile'
 */
export const profile = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: profile.url(options),
    method: 'get',
})

profile.definition = {
    methods: ["get","head"],
    url: '/my-profile',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserController::profile
 * @see app/Http/Controllers/UserController.php:97
 * @route '/my-profile'
 */
profile.url = (options?: RouteQueryOptions) => {
    return profile.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserController::profile
 * @see app/Http/Controllers/UserController.php:97
 * @route '/my-profile'
 */
profile.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: profile.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\UserController::profile
 * @see app/Http/Controllers/UserController.php:97
 * @route '/my-profile'
 */
profile.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: profile.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\UserController::profile
 * @see app/Http/Controllers/UserController.php:97
 * @route '/my-profile'
 */
    const profileForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: profile.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\UserController::profile
 * @see app/Http/Controllers/UserController.php:97
 * @route '/my-profile'
 */
        profileForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: profile.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\UserController::profile
 * @see app/Http/Controllers/UserController.php:97
 * @route '/my-profile'
 */
        profileForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: profile.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    profile.form = profileForm
/**
* @see \App\Http\Controllers\UserController::updateProfile
 * @see app/Http/Controllers/UserController.php:104
 * @route '/my-profile'
 */
const updateProfileb53e8092ef1bae2d9e9a636332da2f10 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateProfileb53e8092ef1bae2d9e9a636332da2f10.url(options),
    method: 'post',
})

updateProfileb53e8092ef1bae2d9e9a636332da2f10.definition = {
    methods: ["post"],
    url: '/my-profile',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\UserController::updateProfile
 * @see app/Http/Controllers/UserController.php:104
 * @route '/my-profile'
 */
updateProfileb53e8092ef1bae2d9e9a636332da2f10.url = (options?: RouteQueryOptions) => {
    return updateProfileb53e8092ef1bae2d9e9a636332da2f10.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserController::updateProfile
 * @see app/Http/Controllers/UserController.php:104
 * @route '/my-profile'
 */
updateProfileb53e8092ef1bae2d9e9a636332da2f10.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateProfileb53e8092ef1bae2d9e9a636332da2f10.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\UserController::updateProfile
 * @see app/Http/Controllers/UserController.php:104
 * @route '/my-profile'
 */
    const updateProfileb53e8092ef1bae2d9e9a636332da2f10Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateProfileb53e8092ef1bae2d9e9a636332da2f10.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\UserController::updateProfile
 * @see app/Http/Controllers/UserController.php:104
 * @route '/my-profile'
 */
        updateProfileb53e8092ef1bae2d9e9a636332da2f10Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateProfileb53e8092ef1bae2d9e9a636332da2f10.url(options),
            method: 'post',
        })
    
    updateProfileb53e8092ef1bae2d9e9a636332da2f10.form = updateProfileb53e8092ef1bae2d9e9a636332da2f10Form
    /**
* @see \App\Http\Controllers\UserController::updateProfile
 * @see app/Http/Controllers/UserController.php:104
 * @route '/my-profile'
 */
const updateProfileb53e8092ef1bae2d9e9a636332da2f10 = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateProfileb53e8092ef1bae2d9e9a636332da2f10.url(options),
    method: 'put',
})

updateProfileb53e8092ef1bae2d9e9a636332da2f10.definition = {
    methods: ["put"],
    url: '/my-profile',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\UserController::updateProfile
 * @see app/Http/Controllers/UserController.php:104
 * @route '/my-profile'
 */
updateProfileb53e8092ef1bae2d9e9a636332da2f10.url = (options?: RouteQueryOptions) => {
    return updateProfileb53e8092ef1bae2d9e9a636332da2f10.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserController::updateProfile
 * @see app/Http/Controllers/UserController.php:104
 * @route '/my-profile'
 */
updateProfileb53e8092ef1bae2d9e9a636332da2f10.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateProfileb53e8092ef1bae2d9e9a636332da2f10.url(options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\UserController::updateProfile
 * @see app/Http/Controllers/UserController.php:104
 * @route '/my-profile'
 */
    const updateProfileb53e8092ef1bae2d9e9a636332da2f10Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateProfileb53e8092ef1bae2d9e9a636332da2f10.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\UserController::updateProfile
 * @see app/Http/Controllers/UserController.php:104
 * @route '/my-profile'
 */
        updateProfileb53e8092ef1bae2d9e9a636332da2f10Form.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateProfileb53e8092ef1bae2d9e9a636332da2f10.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateProfileb53e8092ef1bae2d9e9a636332da2f10.form = updateProfileb53e8092ef1bae2d9e9a636332da2f10Form

/**
* Multiple routes resolve to \App\Http\Controllers\UserController::updateProfile, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `updateProfile['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const updateProfile = {
    '/my-profile': updateProfileb53e8092ef1bae2d9e9a636332da2f10,
    '/my-profile': updateProfileb53e8092ef1bae2d9e9a636332da2f10,
}

const UserController = { index, store, update, destroy, profile, updateProfile }

export default UserController