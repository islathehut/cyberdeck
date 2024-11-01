import { Schema, SchemaTypes } from 'verse.db'
import { db } from '../cyberdeck.versedb.js'
import type { FieldConfig } from 'verse.db/dist/core/functions/schema.js';
import { DateTime } from 'luxon';
import { InstallStatus } from '../../../types/types.js';
import { CHECKSUM_LENGTH, UUID_LENGTH } from '../../../const.js';

export const MODS_DATANAME = 'mods'
 
const modsSchemaFields: Record<string, FieldConfig> = {
  uuid: { type: SchemaTypes.String, required: true, unique: true, minlength: UUID_LENGTH, maxlength: UUID_LENGTH },
  status: { type: SchemaTypes.String, required: true, validate: (value: string) => Object.values(InstallStatus).includes(value as InstallStatus) || `'status' must be of type 'InstallStatus'` },
  createdAt: { type: SchemaTypes.Number, required: true, default: DateTime.utc().toMillis() },
  modifiedAt: { type: SchemaTypes.Number, required: true, default: DateTime.utc().toMillis() },
  installedAt: { type: SchemaTypes.Mix, mix: [SchemaTypes.Number, SchemaTypes.Null] },
  filename: { type: SchemaTypes.String, required: true },
  path: { type: SchemaTypes.String, required: true },
  blockUuid: { type: SchemaTypes.Mix, mix: [SchemaTypes.String, SchemaTypes.Null] },
  checksum: { type: SchemaTypes.String, required: true, unique: true, minlength: CHECKSUM_LENGTH, maxlength: CHECKSUM_LENGTH },
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
const Mods = db.model(MODS_DATANAME, ModsSchema)
export default Mods