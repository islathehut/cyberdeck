import chalk from "chalk";

import { createSimpleModuleLogger } from "../../../utils/logger.js";
import { ModMetadataResponse } from "../../types/nexusMods/nexusMods.api.types.js";
import { Logger, Mod, NexusModsFileMetadata, NexusModsMetadata, NexusModsModMetadata, NexusModsUser } from "../../types/types.js";
import { NexusModsAPI } from "./nexusMods.api.js";
import { updateMod } from "../mod.js";

export class NexusModsManager {
  private static _manager: NexusModsManager;
  private static _logger: Logger = createSimpleModuleLogger('nexus-mods:manager');

  private _user: NexusModsUser | undefined = undefined;

  private constructor(user: NexusModsUser | undefined) {
    this._user = user;
  }

  public static async init(): Promise<NexusModsManager> {
    const user = await this._fetchUserFromApi();
    this._manager = new NexusModsManager(user);
    
    return this._manager;
  }

  public async updateModWithMetadata(mod: Mod): Promise<Mod> {
    const metadata = await NexusModsManager._fetchModMetadataByChecksum(mod.checksum);
    if (metadata.length === 0) {
      NexusModsManager._logger.log(chalk.yellow(`No Nexus Mods metadata found for checksum ${mod.checksum}, skipping update...`));
      return mod;
    }

    const formatted: NexusModsMetadata | undefined = await this.processModMetadata(mod, metadata);
    let updatedMod: Mod | undefined = undefined;
    if (formatted != null) {
      updatedMod = await updateMod(
        {
          checksum: mod.checksum
        },
        {
          "$set": {
            name: formatted.file.name,
            description: formatted.file.description,
            nexusMetadata: formatted 
          }
        }
      );
    } else {
      updatedMod = await updateMod(
        {
          checksum: mod.checksum
        },
        {
          "$set": {
            nexusMetadata: null,
            description: null 
          }
        }
      );
    }

    return updatedMod;
  }

  private async processModMetadata(mod: Mod, metadata: ModMetadataResponse[]): Promise<NexusModsMetadata | undefined> {
    if (metadata.length === 1) {
      NexusModsManager._logger.log(`Found one metadata record for ${mod.checksum} with mod name ${metadata[0].mod.name}`);
      return this.formatModMetadataForDB(metadata[0]);
    }

    NexusModsManager._logger.log(`Found multiple metadata records for ${mod.checksum}, attempting to pick correct record for this mod...`);
    console.log(chalk.red(`Multi-metadata response handling not implemented!  Skipping metadata processing for ${mod.checksum}`));
    return undefined;
  }

  private formatModMetadataForDB(nexusModsMetadata: ModMetadataResponse): NexusModsMetadata {
    const modMetadata: NexusModsModMetadata = {
      name: nexusModsMetadata.mod.name,
      summary: nexusModsMetadata.mod.summary,
      pictureUrl: nexusModsMetadata.mod.picture_url,
      uid: nexusModsMetadata.mod.uid,
      modId: nexusModsMetadata.mod.mod_id,
      gameId: nexusModsMetadata.mod.game_id,
      version: nexusModsMetadata.mod.version,
      nsfw: nexusModsMetadata.mod.contains_adult_content,
      available: nexusModsMetadata.mod.available,
      author: {
        name: nexusModsMetadata.mod.user.name,
        displayName: nexusModsMetadata.mod.author,
        memberId: nexusModsMetadata.mod.user.member_id,
        memberGroupId: nexusModsMetadata.mod.user.member_group_id
      },
      createdAt: nexusModsMetadata.mod.created_timestamp,
      modifiedAt: nexusModsMetadata.mod.updated_timestamp
    };

    const fileMetadata: NexusModsFileMetadata = {
      id: nexusModsMetadata.file_details.file_id,
      uid: nexusModsMetadata.file_details.uid,
      name: nexusModsMetadata.file_details.name,
      fileName: nexusModsMetadata.file_details.file_name,
      version: nexusModsMetadata.file_details.version,
      isPrimary: nexusModsMetadata.file_details.is_primary,
      description: nexusModsMetadata.file_details.description,
      uploadedAt: nexusModsMetadata.file_details.uploaded_timestamp
    };

    return {
      mod: modMetadata,
      file: fileMetadata
    };
  }
  
  private static async _fetchUserFromApi(): Promise<NexusModsUser | undefined> {
    let user: NexusModsUser | undefined = undefined;
    try {
      const response = await NexusModsAPI.api.getUser();
      user = {
        userId: response.user_id,
        name: response.name,
        key: response.key,
        profileUrl: response.profile_url,
        email: response.email,
        isPremium: response.is_premium,
        isSupporter: response.is_supporter,
      };
    } catch (e) {
      NexusModsManager._logger.error(`Error occurred while getting user from Nexus Mods`, e);
    }

    return user;
  }

  private static async _fetchModMetadataByChecksum(checksum: string): Promise<ModMetadataResponse[]> {
    let modMetadata: ModMetadataResponse[] = [];
    try {
      modMetadata = await NexusModsAPI.api.getModByChecksum(checksum);
    } catch (e) {
      NexusModsManager._logger.error(`Error occurred while getting user from Nexus Mods`, e);
    }

    return modMetadata;
  }

  public static get manager(): NexusModsManager {
    return this._manager;
  }

  public get user(): NexusModsUser | undefined {
    return this._user;
  }
}