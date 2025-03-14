import Joi from 'joi';
import joiObjectId from 'joi-objectid';
// Add object id type globally to Joi
(Joi as any).objectId = joiObjectId(Joi);

interface JoiExtended extends Joi.Root {
    objectId: any
}

export default Joi as JoiExtended;