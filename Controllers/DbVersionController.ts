import Services from '../Services/index.js'
import dbUpdates from '../Other/DbUpdates.js'
import type Hapi from '@hapi/hapi'
import type { runDbUpdateRequest } from '../Routes/DbUpdateRoute.js'

const runUpdate = async (req: Hapi.Request & runDbUpdateRequest) => {
    const version = Number(req.params.version)

    let versionDoc = await Services.DbVersionService.getOne({})
    if (!versionDoc) {
        versionDoc = await Services.DbVersionService.create({ currentVersion: 0, history: [] })
    }

    const currentVersion = versionDoc.currentVersion

    if (version !== currentVersion + 1) {
        throw {
            statusCode: 400,
            message: `Invalid version. Current DB version is ${currentVersion}. Next valid version is ${currentVersion + 1}.`
        }
    }

    const migration = dbUpdates[version]
    if (!migration) {
        throw {
            statusCode: 400,
            message: `No migration defined for version ${version}.`
        }
    }

    await migration()

    await Services.DbVersionService.updateOne(
        { _id: versionDoc._id },
        {
            $set: { currentVersion: version },
            $push: { history: { version, appliedAt: new Date() } }
        }
    )

    return { previousVersion: currentVersion, currentVersion: version }
}

const getVersion = async (_req: Hapi.Request) => {
    let versionDoc = await Services.DbVersionService.getOne({})
    if (!versionDoc) {
        versionDoc = await Services.DbVersionService.create({ currentVersion: 0, history: [] })
    }
    return { currentVersion: versionDoc.currentVersion, history: versionDoc.history }
}

export default {
    runUpdate,
    getVersion
}
