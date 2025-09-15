declare module 'joi-objectid' {
    import { Extension, Root } from 'joi';
    function joiObjectId(joi: Root): Extension;
    export = joiObjectId;
}