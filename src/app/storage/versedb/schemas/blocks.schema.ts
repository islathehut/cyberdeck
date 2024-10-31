import { Schema, SchemaTypes } from 'verse.db'
import { DB } from '../cyberdeck.versedb.js'
import { FieldConfig } from 'verse.db/dist/core/functions/schema.js';
import { DateTime } from 'luxon';

export const BLOCKS_DATANAME = 'blocks'
 
const blocksSchemaFields: {
  [key: string]: FieldConfig
} = {
  uuid: { type: SchemaTypes.String, required: true, unique: true, minlength: 36, maxlength: 36 },
  installed: { type: SchemaTypes.Boolean, required: true },
  createdAt: { type: SchemaTypes.Number, required: true, default: DateTime.utc().toMillis() },
  installedAt: { type: SchemaTypes.Mix, mix: [SchemaTypes.Number, SchemaTypes.Null] },
  modifiedAt: { type: SchemaTypes.Number, required: true, default: DateTime.utc().toMillis() },
  installOrder: {
    type: SchemaTypes.Array,
    required: true
  }
}
 
const BlocksSchema = new Schema(blocksSchemaFields)
const Blocks = DB.db.model(BLOCKS_DATANAME, BlocksSchema)
export default Blocks