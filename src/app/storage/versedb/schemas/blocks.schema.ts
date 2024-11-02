import { Schema, SchemaTypes } from 'verse.db';
import { db } from '../cyberdeck.versedb.js';
import type { FieldConfig } from 'verse.db/dist/core/functions/schema.js';
import { DateTime } from 'luxon';
import { UUID_LENGTH } from '../../../const.js';

export const BLOCKS_DATANAME = 'blocks';

const blocksSchemaFields: Record<string, FieldConfig> = {
  uuid: {
    type: SchemaTypes.String,
    required: true,
    unique: true,
    minlength: UUID_LENGTH,
    maxlength: UUID_LENGTH,
  },
  installed: { type: SchemaTypes.Boolean, required: true },
  createdAt: { type: SchemaTypes.Number, required: true, default: DateTime.utc().toMillis() },
  installedAt: { type: SchemaTypes.Mix, mix: [SchemaTypes.Number, SchemaTypes.Null] },
  modifiedAt: { type: SchemaTypes.Number, required: true, default: DateTime.utc().toMillis() },
  installOrder: {
    type: SchemaTypes.Array,
    required: true,
  },
};

const BlocksSchema = new Schema(blocksSchemaFields);
const Blocks = db.model(BLOCKS_DATANAME, BlocksSchema);
export default Blocks;
