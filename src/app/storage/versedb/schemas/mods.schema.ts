import { Schema, SchemaTypes } from 'verse.db'
import { DB } from '../cyberdeck.versedb.js'
import { FieldConfig } from 'verse.db/dist/core/functions/schema.js';
import { DateTime } from 'luxon';
import { InstallStatus } from '../../../types.js';

export const MODS_DATANAME = 'mods'
 
const modsSchemaFields: {
  [key: string]: FieldConfig
} = {
  uuid: { type: SchemaTypes.String, required: true, unique: true, minlength: 36, maxlength: 36 },
  status: { type: SchemaTypes.String, required: true, validate: (value: string) => Object.values(InstallStatus).includes(value as any) || `'status' must be of type 'InstallStatus'` },
  createdAt: { type: SchemaTypes.Number, required: true, default: DateTime.utc().toMillis() },
  modifiedAt: { type: SchemaTypes.Number, required: true, default: DateTime.utc().toMillis() },
  installedAt: { type: SchemaTypes.Mix, mix: [SchemaTypes.Number, SchemaTypes.Null] },
  filename: { type: SchemaTypes.String, required: true },
  path: { type: SchemaTypes.String, required: true },
  blockUuid: { type: SchemaTypes.Mix, mix: [SchemaTypes.String, SchemaTypes.Null] },
  checksum: { type: SchemaTypes.String, required: true, unique: true, minlength: 32, maxlength: 32 },
  skip: { type: SchemaTypes.Boolean, default: false },
  copyOverrides: { 
    type: SchemaTypes.Array, 
    default: [], 
    schema: {
      in: { type: SchemaTypes.String, required: true },
      out: { type: SchemaTypes.String, required: true }
    }
  },
  name: { type: SchemaTypes.String, required: true }
}
 
const ModsSchema = new Schema(modsSchemaFields)
const Mods = DB.db.model(MODS_DATANAME, ModsSchema)
export default Mods