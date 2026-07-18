export async function settleAll<T>(tasks: Promise<T>[]): Promise<{
    results: PromiseSettledResult<T>[];
    failureCount: number;
}> {

    const results = await Promise.allSettled(tasks);
    const failureCount = results.filter(result => result.status === "rejected").length;

    return { results, failureCount };
}
