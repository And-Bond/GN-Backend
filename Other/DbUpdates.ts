// Add migration functions here, keyed by version number.
// Each function runs when POST api/util/db/update/{version} is called.
// Version N can only run when currentVersion is N-1.

const updates: Record<number, () => Promise<void>> = {
    1: async () => {
        // Example: version 1 migration placeholder
    }
}

export default updates
