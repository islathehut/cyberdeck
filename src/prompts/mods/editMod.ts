import chalk from 'chalk'
import radio from 'inquirer-radio-prompt';
import { input, confirm } from '@inquirer/prompts'

import { CopyOverride, Mod } from "../../app/types.js";
import actionSelect from "../../components/actionSelect.js";
import { DEFAULT_THEME } from "../helpers/theme.js";
import { updateMod } from "../../app/mods/mod.js";

export const setSkip = async (mod: Mod): Promise<Mod> => {
  const answer = await radio({
    message: 'Set value for skip',
    choices: [
      { name: 'true', value: 'true' },
      { name: 'false', value: 'false' }
    ],
    default: `${mod.skip}`,
    required: true,
    theme: DEFAULT_THEME
  })

  return updateMod(
    {
      checksum: mod.checksum
    },
    {
      $set: {
        skip: answer === 'true'
      }
    }
  )
}

export const deleteCopyOverride = async (override: CopyOverride, mod: Mod): Promise<Mod> => {
  return updateMod(
    {
      checksum: mod.checksum,
    },
    {
      $pull: {
        copyOverrides: {
          in: override.in
        }
      }
    }
  )
}

export const updateCopyOverride = async (override: CopyOverride, mod: Mod): Promise<Mod> => {
  const updatedIn = await input({
    message: `What file/directory do you want to reroute?`,
    default: override.in,
    theme: DEFAULT_THEME,
    validate: (value: string) => value.length > 0
  })

  const updatedOut = await input({
    message: `Where would you like the file/directory to be rerouted to when installed?`,
    default: override.out,
    theme: DEFAULT_THEME,
    validate: (value: string) => value.length > 0
  })

  return updateMod(
    {
      checksum: mod.checksum,
    },
    {
      $pull: {
        copyOverrides: {
          in: override.in
        }
      },
      $push: {
        copyOverrides: { in: updatedIn, out: updatedOut }
      }
    }
  )
}

export const addCopyOverride = async (mod: Mod): Promise<Mod> => {
  const newIn = await input({
    message: `What file/directory do you want to reroute?`,
    default: undefined,
    theme: DEFAULT_THEME,
    validate: (value: string) => value.length > 0
  })

  const newOut = await input({
    message: `Where would you like the file/directory to be rerouted to when installed?`,
    default: undefined,
    theme: DEFAULT_THEME,
    validate: (value: string) => value.length > 0
  })

  return updateMod(
    {
      checksum: mod.checksum,
    },
    {
      $push: {
        copyOverrides: { in: newIn, out: newOut }
      }
    }
  )
}

export const manageCopyOverrides = async (mod: Mod): Promise<Mod> => {
  let current = mod
  let exit = false
  while (exit === false) {
    const choices = current.copyOverrides.map(override => {
      return {
        name: override.in,
        value: override,
        description: override.out
      }
    })

    if (choices.length === 0) {
      const createNew = await confirm({
        message: `No copy overrides have been setup, would you like to add one?`,
        default: true,
        theme: DEFAULT_THEME
      })

      if (createNew) {
        current = await addCopyOverride(mod)
      } else {
        exit = true
      }
    } else {
      const answer = await actionSelect(
        {
          message: `Manage Copy Overrides - ${current.name}`,
          choices: [...choices],
          actions: [
            { name: "New", value: "new", key: "n" },
            { name: "Update", value: "update", key: "u" },
            { name: "Delete" , value: "delete", key: "d" },
            { name: "Exit", value: "exit", key: "escape" },
          ],
          theme: DEFAULT_THEME
        },
      )

      switch (answer.action) {
        case "update":
        case undefined: // catches enter/return key
          current = await updateCopyOverride(answer.answer, current)
          break
        case "delete":
          current = await deleteCopyOverride(answer.answer, current)
          break
        case "new":
          current = await addCopyOverride(current)
          break
        case "exit":
          exit = true;
          break
      }
    }
  }

  return current
}

const editMod = async (mod: Mod): Promise<Mod> => {
  let current = mod
  let exit = false
  while (exit === false) {
    const defaultChoices = [
      { name: "Set skip", value: "setSkip", description: "Set 'skip' property on mod" },
      { name: "Manage copy overrides", value: "manageCopyOverrides", description: "Manage 'copyOverrides' property on mod" }
    ]

    const answer = await actionSelect(
      {
        message: `Edit Mod - ${current.name}`,
        choices: [...defaultChoices],
        actions: [
          { name: "Select", value: "select", key: "e" },
          { name: "Exit", value: "exit", key: "escape" },
        ],
        theme: DEFAULT_THEME
      },
    )
    switch (answer.action) {
      case "select":
      case undefined: // catches enter/return key
        switch (answer.answer) {
          case "setSkip":
            current = await setSkip(current)
            break
          case "manageCopyOverrides":
            current = await manageCopyOverrides(current)
            break
        }
        break;
      case "exit":
        exit = true;
        break
    }
  };
  return current
}

export {
  editMod
}