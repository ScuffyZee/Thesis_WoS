import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\AuthController::attempt
 * @see app/Http/Controllers/AuthController.php:30
 * @route '/login'
 */
export const attempt = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: attempt.url(options),
    method: 'post',
})

attempt.definition = {
    methods: ["post"],
    url: '/login',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AuthController::attempt
 * @see app/Http/Controllers/AuthController.php:30
 * @route '/login'
 */
attempt.url = (options?: RouteQueryOptions) => {
    return attempt.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AuthController::attempt
 * @see app/Http/Controllers/AuthController.php:30
 * @route '/login'
 */
attempt.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: attempt.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AuthController::attempt
 * @see app/Http/Controllers/AuthController.php:30
 * @route '/login'
 */
    const attemptForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: attempt.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AuthController::attempt
 * @see app/Http/Controllers/AuthController.php:30
 * @route '/login'
 */
        attemptForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: attempt.url(options),
            method: 'post',
        })
    
    attempt.form = attemptForm
const login = {
    attempt: Object.assign(attempt, attempt),
}

export default login