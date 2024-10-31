![The Cross-Platform Cyberpunk 2077 CLI Mod Manager](resources/cyberdeck_header_image.png "The Cross-Platform Cyberpunk 2077 CLI Mod Manager")

<span style="color:red">*This tool is a WIP and should be used with caution!  If you mess up your install don't blame me!*</span>.

# Overview

**_Cyberdeck_** is CLI-based mod manager for Cyberpunk 2077 that works with Windows, MacOS, and Linux.

## Features

- Cross-platform support
- Local mod extraction and installation
- Mod metadata management
- Custom install orders

## Upcoming Features

- CLI-based custom mod unpacking
- Automatic directory structure parsing
- Nexus API integration
- Performance Optimizations
- Custom themes
- Mod uninstallation
- Mod versioning
- More...

# Why Make This?

I've been playing Cyberpunk 2077 on MacOS using Crossover recently and the manual installation of mods has come with the risk of accidentally overwriting existing installation files.  I got tired of having to reinstall mods (or the game!) when I make a mistake so I decided to make a tool that I could use to improve my own modding experience.  I figured someone else out there would get some use from this tool and it would be worth making it publicly available.

# Using the App

![Cyberdeck in action (v0.1.0)](resources/screenshot_of_cyberdeck_in_action__v0_1_0.png "Cyberdeck in action (v0.1.0)")

Your first time running the tool `cyberdeck` will generate the following files and directories:

- ~/.cyberdeck
  * .config
- ~/.cyberdeck/mods
- ~/.cyberdeck/unpacked

The `.config` file contains all of your mod metadata, install history, etc.  To make your mods available to `cyberdeck` move your mod archives into the `~/.cyberdeck/mods` directory.

## Loading Mods To Be Installed

Loading happens automatically when you start `cyberdeck` but can be done manually by selecting the `Load Mod Data` option in the CLI.

## Modifying the Install Order

Once you have mods loaded you need to populate the install order by selecting the `Update Install Order` option in the CLI.  You can auto-generate the install order (this is essentially random) or you can set the install order manually.  If you manually set the install order you can stop manually updating it and auto-populate the install order with the remaining mods.

## Installing the Mods

When you select the `Install Mods` option in the CLI `cyberdeck` will extract all of the uninstalled archives in your `mods` directory to temporary directories in the `unpacked` directory.  Once extracted the mod files will be copied and packed together.  If you are ready to install (and aren't doing a dry run) the packed files will be copied into the install directory.

### Modifying Extraction Behavior

Have a zipped mod that only contains one `.archive` file?  Maybe it has a dozen sub-directories for you to choose from?  Manually modify the record under `uninstalledMods` in the `.config` file to include the file structure to copy over.

I recommend running an install of new mods as a dry run to determine how the files get extracted so you can modify the config prior to a real install.

_I am planning on making this more automatic so most cases can be handled without user intervention._

#### Examples

##### Single File When Extracted

```json
{
  "fileName": "Alternative version thanks to Inn77-11396-2-0-1712784195.rar",
  "filePath": "/Users/isla/.cyberdeck/mods/Alternative version thanks to Inn77-11396-2-0-1712784195.rar",
  "checksum": "4b4f7d847762c69faf515a5a744acc9f",
  "name": "Alternative version thanks to Inn77-11396-2-0-1712784195.rar",
  "copyOverrides": [
    {
      "in": "!E3AD.archive",
      "out": "archive/pc/mod/!E3AD.archive"
    }
  ],
  "status": "UNINSTALLED"
}
```

##### Multiple Choices

```json
{
  "fileName": "Reticle type 1 - Discreet Tech-13089-1-3-1708859888.zip",
  "filePath": "/Users/isla/.cyberdeck/mods/Reticle type 1 - Discreet Tech-13089-1-3-1708859888.zip",
  "checksum": "a6dd824f1f3ca637a830777fd06c98a3",
  "name": "Reticle type 1 - Discreet Tech-13089-1-3-1708859888.zip",
  "copyOverrides": [
    {
      "in": "Kanetsugu Reticle Replacer - Type 1 - Pink/archive",
      "out": "archive"
    }
  ],
  "status": "UNINSTALLED"
}
```

# For Developers

## Prerequisites

This project uses [Volta](https://volta.sh/) to manage `node` versioning (instead of `nvm`) so ensure you install `volta` first and install the pinned versions of `node` and `npm`.

## Initializing the App

```bash
npm i pnpm@9.12.3
npx pnpm i
npm run build
```

## Running the App

```bash
npm run start:interactive
```

### Dry Runs

```bash
npm run start:interactive -- -d
```

This modifies the install flow to only extract and unpack files from your mod archives but won't copy the files into your CP2077 install directory.

### Test Mode

```bash
npm run start:interactive -- -t
```

This performs the install into a fake directory instead of your real CP2077 install directory to test out the behavior without risking modifying your install.