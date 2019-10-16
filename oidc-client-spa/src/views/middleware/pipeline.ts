async function middlewarePipeline (context, middleware, index) {
    const nextMiddleware = middleware[index]

    if(!nextMiddleware){
        return context.next 
    }

    return async () => {
        const nextPipeline = middlewarePipeline(
            context, middleware, index + 1
        )

        await nextMiddleware({ ...context, next: await nextPipeline })

    }
}

export default middlewarePipeline