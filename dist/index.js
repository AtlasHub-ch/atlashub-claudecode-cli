#!/usr/bin/env node

// src/index.ts
import { Command as Command6 } from "commander";
import chalk6 from "chalk";

// src/commands/install.ts
import { Command } from "commander";
import chalk2 from "chalk";

// src/lib/logger.ts
import chalk from "chalk";
import ora from "ora";
var logger = {
  info: (message) => console.log(chalk.blue("\u2139"), message),
  success: (message) => console.log(chalk.green("\u2713"), message),
  warning: (message) => console.log(chalk.yellow("\u26A0"), message),
  error: (message) => console.log(chalk.red("\u2717"), message),
  header: (title) => {
    console.log();
    console.log(chalk.cyan("\u2550".repeat(60)));
    console.log(chalk.cyan.bold(`  ${title}`));
    console.log(chalk.cyan("\u2550".repeat(60)));
    console.log();
  },
  step: (current, total, message) => {
    console.log(chalk.gray(`[${current}/${total}]`), message);
  },
  spinner: (text) => {
    return ora({ text, color: "cyan" }).start();
  },
  box: (content, type = "info") => {
    const colors = {
      info: chalk.cyan,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red
    };
    const color = colors[type];
    const maxLen = Math.max(...content.map((l) => l.length));
    const border = color("\u2500".repeat(maxLen + 4));
    console.log();
    console.log(border);
    content.forEach((line) => {
      console.log(color("\u2502"), line.padEnd(maxLen), color("\u2502"));
    });
    console.log(border);
    console.log();
  }
};

// src/lib/license.ts
import { createHash } from "crypto";
import { homedir } from "os";
import { join } from "path";
import fs from "fs-extra";
import fetch from "node-fetch";
import { hostname, userInfo, platform } from "os";

// src/types/license.ts
import { z } from "zod";
var LicenseKeySchema = z.string().regex(
  /^CGFW-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/,
  "Invalid license key format. Expected: CGFW-XXXX-XXXX-XXXX"
);
var LicensePlanSchema = z.enum(["trial", "pro", "team", "enterprise"]);
var LicenseResponseSchema = z.object({
  valid: z.boolean(),
  plan: LicensePlanSchema.optional(),
  expiresAt: z.string().optional(),
  features: z.array(z.string()).optional(),
  error: z.string().optional()
});
var StoredLicenseSchema = z.object({
  key: z.string(),
  plan: LicensePlanSchema,
  expiresAt: z.string(),
  validatedAt: z.string(),
  machineId: z.string()
});

// src/lib/license.ts
var API_URL = process.env.LICENSE_API_URL || "https://api.atlashub.ch/api/licenses";
var LICENSE_FILE = join(homedir(), ".claude-gitflow-license.json");
var SECRET_SALT = "atlashub-cgf-2024";
function getMachineId() {
  const data = `${hostname()}-${userInfo().username}-${platform()}`;
  return createHash("sha256").update(data).digest("hex").substring(0, 16);
}
function validateKeyFormat(key) {
  const result = LicenseKeySchema.safeParse(key);
  if (!result.success) return false;
  const parts = key.split("-");
  const expectedChecksum = generateChecksum(parts[1] + parts[2]);
  return parts[3] === expectedChecksum;
}
function generateChecksum(input) {
  return createHash("sha256").update(input + SECRET_SALT).digest("base64").replace(/[+/=]/g, "").substring(0, 4).toUpperCase();
}
async function validateLicenseOnline(licenseKey) {
  try {
    const response = await fetch(`${API_URL}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        licenseKey,
        machineId: getMachineId()
      })
    });
    const data = await response.json();
    return LicenseResponseSchema.parse(data);
  } catch (error) {
    return {
      valid: false,
      error: `Connection error: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
}
async function saveLicense(key, plan, expiresAt) {
  const license = {
    key,
    plan,
    expiresAt,
    validatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    machineId: getMachineId()
  };
  await fs.writeJson(LICENSE_FILE, license, { spaces: 2 });
}
async function loadLicense() {
  try {
    if (!await fs.pathExists(LICENSE_FILE)) {
      return null;
    }
    const data = await fs.readJson(LICENSE_FILE);
    return StoredLicenseSchema.parse(data);
  } catch {
    return null;
  }
}
async function deleteLicense() {
  if (await fs.pathExists(LICENSE_FILE)) {
    await fs.remove(LICENSE_FILE);
  }
}
async function checkLicense() {
  const local = await loadLicense();
  if (!local) {
    return { valid: false, error: "No license found" };
  }
  if (new Date(local.expiresAt) < /* @__PURE__ */ new Date()) {
    return { valid: false, error: "License expired" };
  }
  if (local.machineId !== getMachineId()) {
    return { valid: false, error: "License registered to a different machine" };
  }
  const validatedAt = new Date(local.validatedAt);
  const daysSinceValidation = (Date.now() - validatedAt.getTime()) / (1e3 * 60 * 60 * 24);
  if (daysSinceValidation > 7) {
    try {
      const result = await validateLicenseOnline(local.key);
      if (result.valid && result.plan && result.expiresAt) {
        await saveLicense(local.key, result.plan, result.expiresAt);
        return { valid: true, plan: result.plan };
      }
      return { valid: false, error: result.error };
    } catch {
      logger.warning("Could not validate online, using cached license");
      return { valid: true, plan: local.plan, offline: true };
    }
  }
  return { valid: true, plan: local.plan };
}

// src/lib/installer.ts
import { join as join2, dirname } from "path";
import { fileURLToPath } from "url";
import { homedir as homedir2 } from "os";
import fs2 from "fs-extra";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var PACKAGE_ROOT = join2(__dirname, "..", "..");
var TEMPLATES_DIR = join2(PACKAGE_ROOT, "templates");
var INSTALL_DIRS = ["commands", "agents", "hooks"];
function getClaudeDir(global) {
  if (global) {
    return join2(homedir2(), ".claude");
  } else {
    return join2(process.cwd(), ".claude");
  }
}
async function getTemplateFiles(dir, baseDir = "") {
  const files = [];
  const entries = await fs2.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const relativePath = baseDir ? join2(baseDir, entry.name) : entry.name;
    if (entry.isDirectory()) {
      const subFiles = await getTemplateFiles(join2(dir, entry.name), relativePath);
      files.push(...subFiles);
    } else if (entry.isFile() && !entry.name.startsWith(".")) {
      files.push(relativePath);
    }
  }
  return files;
}
async function installCommands(options = {}) {
  const global = options.global ?? true;
  const claudeDir = getClaudeDir(global);
  const components = options.components ?? ["all"];
  const installAll = components.includes("all");
  const result = {
    installed: 0,
    skipped: 0,
    errors: []
  };
  logger.info(`Installing to: ${claudeDir}`);
  const dirsToInstall = installAll ? INSTALL_DIRS : INSTALL_DIRS.filter((d) => components.includes(d));
  for (const dir of dirsToInstall) {
    const sourceDir = join2(TEMPLATES_DIR, dir);
    const targetDir = join2(claudeDir, dir);
    if (!await fs2.pathExists(sourceDir)) {
      logger.warning(`Source directory not found: ${dir}`);
      continue;
    }
    const files = await getTemplateFiles(sourceDir);
    for (const file of files) {
      const src = join2(sourceDir, file);
      const dest = join2(targetDir, file);
      try {
        const exists = await fs2.pathExists(dest);
        if (exists && !options.force) {
          result.skipped++;
          continue;
        }
        await fs2.ensureDir(dirname(dest));
        await fs2.copy(src, dest, { overwrite: options.force });
        result.installed++;
        if (file.endsWith(".md") && !file.includes("/")) {
          logger.success(`Installed ${dir}/${file}`);
        }
      } catch (error) {
        const msg = `Failed to install ${file}: ${error}`;
        result.errors.push(msg);
        logger.error(msg);
      }
    }
    const dirFiles = files.length;
    logger.success(`Installed ${dir}/ (${dirFiles} files)`);
  }
  if (installAll || components.includes("commands")) {
    const gitflowDir = join2(claudeDir, "gitflow");
    await fs2.ensureDir(join2(gitflowDir, "plans"));
    await fs2.ensureDir(join2(gitflowDir, "logs"));
    await fs2.ensureDir(join2(gitflowDir, "migrations"));
    if (!options.skipConfig) {
      const configSrc = join2(PACKAGE_ROOT, "config", "default-config.json");
      const configDest = join2(gitflowDir, "config.json");
      if (!await fs2.pathExists(configDest) || options.force) {
        if (await fs2.pathExists(configSrc)) {
          await fs2.copy(configSrc, configDest);
          logger.success("Created gitflow/config.json");
        }
      }
    }
  }
  return result;
}
async function uninstallCommands(options = {}) {
  const global = options.global ?? true;
  const claudeDir = getClaudeDir(global);
  const components = options.components ?? ["all"];
  const removeAll = components.includes("all");
  const result = {
    removed: 0,
    errors: []
  };
  const dirsToRemove = removeAll ? INSTALL_DIRS : INSTALL_DIRS.filter((d) => components.includes(d));
  for (const dir of dirsToRemove) {
    const targetDir = join2(claudeDir, dir);
    if (await fs2.pathExists(targetDir)) {
      try {
        if (dir === "commands") {
          const ourDirs = ["gitflow", "gitflow.md", "apex", "apex.md", "ef-migrations", "git", "prompts", "epct.md", "debug.md", "explore.md", "explain.md", "oneshot.md", "quick-search.md", "review.md"];
          for (const item of ourDirs) {
            const itemPath = join2(targetDir, item);
            if (await fs2.pathExists(itemPath)) {
              await fs2.remove(itemPath);
              result.removed++;
            }
          }
          logger.success(`Removed commands (our files only)`);
        } else {
          await fs2.remove(targetDir);
          result.removed++;
          logger.success(`Removed ${dir}/`);
        }
      } catch (error) {
        const msg = `Failed to remove ${dir}: ${error}`;
        result.errors.push(msg);
        logger.error(msg);
      }
    }
  }
  if (!options.keepConfig && (removeAll || components.includes("commands"))) {
    const gitflowDir = join2(claudeDir, "gitflow");
    if (await fs2.pathExists(gitflowDir)) {
      await fs2.remove(gitflowDir);
      logger.success("Removed gitflow/");
      result.removed++;
    }
  }
  return result;
}
async function updateCommands(options = {}) {
  await installCommands({
    force: true,
    skipConfig: true,
    global: options.global ?? true
  });
}
async function checkInstallation(options = {}) {
  const global = options.global ?? true;
  const claudeDir = getClaudeDir(global);
  const result = {
    location: claudeDir,
    installed: false,
    components: {
      commands: { installed: false, count: 0 },
      agents: { installed: false, count: 0 },
      hooks: { installed: false, count: 0 }
    },
    gitflow: {
      configExists: false,
      plansCount: 0
    }
  };
  const commandsDir = join2(claudeDir, "commands");
  if (await fs2.pathExists(commandsDir)) {
    const gitflowExists = await fs2.pathExists(join2(commandsDir, "gitflow.md"));
    const apexExists = await fs2.pathExists(join2(commandsDir, "apex.md"));
    result.components.commands.installed = gitflowExists || apexExists;
    const files = await getTemplateFiles(commandsDir);
    result.components.commands.count = files.filter((f) => f.endsWith(".md")).length;
  }
  const agentsDir = join2(claudeDir, "agents");
  if (await fs2.pathExists(agentsDir)) {
    const files = await fs2.readdir(agentsDir);
    result.components.agents.count = files.filter((f) => f.endsWith(".md")).length;
    result.components.agents.installed = result.components.agents.count > 0;
  }
  const hooksDir = join2(claudeDir, "hooks");
  if (await fs2.pathExists(hooksDir)) {
    result.components.hooks.installed = await fs2.pathExists(join2(hooksDir, "hooks.json"));
    result.components.hooks.count = result.components.hooks.installed ? 1 : 0;
  }
  const gitflowDir = join2(claudeDir, "gitflow");
  result.gitflow.configExists = await fs2.pathExists(join2(gitflowDir, "config.json"));
  const plansDir = join2(gitflowDir, "plans");
  if (await fs2.pathExists(plansDir)) {
    const plans = await fs2.readdir(plansDir);
    result.gitflow.plansCount = plans.filter((f) => f.endsWith(".md")).length;
  }
  result.installed = result.components.commands.installed || result.components.agents.installed || result.components.hooks.installed;
  return result;
}
async function listInstalledCommands(options = {}) {
  const global = options.global ?? true;
  const claudeDir = getClaudeDir(global);
  const commandsDir = join2(claudeDir, "commands");
  if (!await fs2.pathExists(commandsDir)) {
    return [];
  }
  const files = await getTemplateFiles(commandsDir);
  return files.filter((f) => f.endsWith(".md")).map((f) => f.replace(".md", ""));
}

// src/lib/detector.ts
import { join as join3 } from "path";
import fs3 from "fs-extra";
import { execSync } from "child_process";
async function detectProject(cwd = process.cwd()) {
  const info = {
    isGitRepo: false,
    currentBranch: null,
    hasDotNet: false,
    hasEfCore: false,
    csprojFiles: [],
    dbContextName: null
  };
  info.isGitRepo = await fs3.pathExists(join3(cwd, ".git"));
  if (info.isGitRepo) {
    try {
      info.currentBranch = execSync("git branch --show-current", {
        cwd,
        encoding: "utf-8"
      }).trim();
    } catch {
      info.currentBranch = null;
    }
  }
  const files = await findFiles(cwd, ".csproj");
  info.csprojFiles = files;
  info.hasDotNet = files.length > 0;
  for (const csproj of files) {
    const content = await fs3.readFile(csproj, "utf-8");
    if (content.includes("Microsoft.EntityFrameworkCore")) {
      info.hasEfCore = true;
      const match = content.match(/Include="([^"]*DbContext[^"]*)"/);
      if (match) {
        info.dbContextName = match[1];
      }
      break;
    }
  }
  return info;
}
async function findFiles(dir, extension, depth = 3) {
  const results = [];
  async function search(currentDir, currentDepth) {
    if (currentDepth > depth) return;
    try {
      const entries = await fs3.readdir(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join3(currentDir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
          await search(fullPath, currentDepth + 1);
        } else if (entry.isFile() && entry.name.endsWith(extension)) {
          results.push(fullPath);
        }
      }
    } catch {
    }
  }
  await search(dir, 0);
  return results;
}

// src/commands/install.ts
var installCommand = new Command("install").alias("i").description("Install GitFlow commands, agents, and hooks").option("-f, --force", "Overwrite existing files").option("-g, --global", "Install to user directory ~/.claude (default)", true).option("-l, --local", "Install to project directory ./.claude").option("--commands-only", "Install only commands").option("--agents-only", "Install only agents").option("--hooks-only", "Install only hooks").option("--no-config", "Skip config file creation").option("--skip-license", "Skip license check (for testing)").action(async (options) => {
  logger.header("Installing Claude GitFlow");
  const isGlobal = !options.local;
  if (!options.skipLicense) {
    const license = await checkLicense();
    if (!license.valid) {
      logger.box(
        [
          "No valid license found.",
          "",
          "To activate your license:",
          `  ${chalk2.cyan("claude-gitflow activate <YOUR-KEY>")}`,
          "",
          "To purchase a license:",
          `  ${chalk2.cyan("https://atlashub.ch/claude-gitflow")}`,
          "",
          chalk2.dim("Use --skip-license to test without a license")
        ],
        "warning"
      );
      return;
    }
    logger.success(`License valid (${license.plan})`);
  } else {
    logger.warning("License check skipped");
  }
  const spinner = logger.spinner("Analyzing environment...");
  const project = await detectProject();
  spinner.stop();
  console.log();
  logger.info(`Install location: ${isGlobal ? chalk2.cyan("~/.claude (global)") : chalk2.yellow("./.claude (local)")}`);
  logger.info(`Git repository: ${project.isGitRepo ? chalk2.green("Yes") : chalk2.gray("No")}`);
  logger.info(`.NET project: ${project.hasDotNet ? chalk2.green("Yes") : chalk2.gray("No")}`);
  logger.info(`EF Core: ${project.hasEfCore ? chalk2.green("Yes") : chalk2.gray("No")}`);
  console.log();
  const components = [];
  if (options.commandsOnly) components.push("commands");
  else if (options.agentsOnly) components.push("agents");
  else if (options.hooksOnly) components.push("hooks");
  else components.push("all");
  try {
    const result = await installCommands({
      force: options.force,
      global: isGlobal,
      skipConfig: !options.config,
      components
    });
    console.log();
    if (result.errors.length > 0) {
      logger.warning(`Completed with ${result.errors.length} error(s)`);
    }
    const summary = [
      chalk2.green.bold("Installation complete!"),
      "",
      `Files installed: ${chalk2.cyan(result.installed)}`,
      `Files skipped: ${chalk2.yellow(result.skipped)} (use --force to overwrite)`,
      "",
      "Available commands in Claude Code:",
      "",
      chalk2.bold("GitFlow:"),
      `  ${chalk2.cyan("/gitflow")}        - Full GitFlow workflow`,
      `  ${chalk2.cyan("/gitflow:1-init")} - Initialize GitFlow`,
      `  ${chalk2.cyan("/gitflow:2-status")} - Show status`,
      `  ${chalk2.cyan("/gitflow:3-commit")} - Smart commit`,
      `  ${chalk2.cyan("/gitflow:4-plan")} - Create plan`,
      `  ${chalk2.cyan("/gitflow:5-exec")} - Execute plan`,
      `  ${chalk2.cyan("/gitflow:6-abort")} - Rollback`,
      "",
      chalk2.bold("Development:"),
      `  ${chalk2.cyan("/apex")}           - APEX methodology`,
      `  ${chalk2.cyan("/epct")}           - Explore-Plan-Code-Test`,
      `  ${chalk2.cyan("/debug")}          - Systematic debugging`,
      "",
      chalk2.bold("EF Core:"),
      `  ${chalk2.cyan("/db-migration")}   - Migration management`,
      `  ${chalk2.cyan("/ef-migration-sync")} - Sync migrations`
    ];
    logger.box(summary, "success");
  } catch (error) {
    logger.error(error instanceof Error ? error.message : "Installation failed");
    process.exit(1);
  }
});

// src/commands/uninstall.ts
import { Command as Command2 } from "commander";
import inquirer from "inquirer";
import chalk3 from "chalk";
var uninstallCommand = new Command2("uninstall").alias("u").description("Remove GitFlow commands, agents, and hooks").option("-g, --global", "Uninstall from user directory ~/.claude (default)", true).option("-l, --local", "Uninstall from project directory ./.claude").option("--commands-only", "Remove only commands").option("--agents-only", "Remove only agents").option("--hooks-only", "Remove only hooks").option("--keep-config", "Keep configuration file").option("-y, --yes", "Skip confirmation").action(async (options) => {
  logger.header("Uninstalling Claude GitFlow");
  const isGlobal = !options.local;
  const location = isGlobal ? "~/.claude" : "./.claude";
  logger.info(`Location: ${chalk3.cyan(location)}`);
  console.log();
  if (!options.yes) {
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Are you sure you want to uninstall from ${location}?`,
        default: false
      }
    ]);
    if (!confirm) {
      logger.info("Cancelled.");
      return;
    }
  }
  const components = [];
  if (options.commandsOnly) components.push("commands");
  else if (options.agentsOnly) components.push("agents");
  else if (options.hooksOnly) components.push("hooks");
  else components.push("all");
  try {
    const result = await uninstallCommands({
      global: isGlobal,
      keepConfig: options.keepConfig,
      components
    });
    console.log();
    if (result.errors.length > 0) {
      logger.warning(`Completed with ${result.errors.length} error(s)`);
    } else {
      logger.success(`Uninstalled ${result.removed} item(s) successfully.`);
    }
  } catch (error) {
    logger.error(error instanceof Error ? error.message : "Uninstallation failed");
    process.exit(1);
  }
});

// src/commands/activate.ts
import { Command as Command3 } from "commander";
import inquirer2 from "inquirer";
import chalk4 from "chalk";
var activateCommand = new Command3("activate").description("Activate your license").argument("[key]", "License key (CGFW-XXXX-XXXX-XXXX)").option("--deactivate", "Remove current license").action(async (key, options) => {
  logger.header("License Activation");
  if (options.deactivate) {
    await deleteLicense();
    logger.success("License deactivated.");
    return;
  }
  if (!key) {
    const answer = await inquirer2.prompt([
      {
        type: "input",
        name: "licenseKey",
        message: "Enter your license key:",
        validate: (input) => {
          if (validateKeyFormat(input)) {
            return true;
          }
          return "Invalid format. Expected: CGFW-XXXX-XXXX-XXXX";
        }
      }
    ]);
    key = answer.licenseKey;
  }
  if (!validateKeyFormat(key)) {
    logger.error("Invalid license key format.");
    logger.info("Expected format: CGFW-XXXX-XXXX-XXXX");
    return;
  }
  const spinner = logger.spinner("Validating license...");
  try {
    const result = await validateLicenseOnline(key);
    spinner.stop();
    if (result.valid && result.plan && result.expiresAt) {
      await saveLicense(key, result.plan, result.expiresAt);
      console.log();
      logger.box(
        [
          chalk4.green.bold("License activated successfully!"),
          "",
          `Plan:    ${chalk4.cyan(result.plan)}`,
          `Expires: ${chalk4.cyan(new Date(result.expiresAt).toLocaleDateString())}`
        ],
        "success"
      );
    } else {
      console.log();
      logger.error(result.error || "License validation failed.");
      logger.info(`Purchase at: ${chalk4.cyan("https://atlashub.ch/claude-gitflow")}`);
    }
  } catch (error) {
    spinner.stop();
    logger.error(`Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
});

// src/commands/status.ts
import { Command as Command4 } from "commander";
import chalk5 from "chalk";
import Table from "cli-table3";
var statusCommand = new Command4("status").alias("s").description("Show installation and license status").option("-g, --global", "Check user directory ~/.claude (default)", true).option("-l, --local", "Check project directory ./.claude").option("-v, --verbose", "Show detailed command list").action(async (options) => {
  logger.header("Claude Tools Status");
  const isGlobal = !options.local;
  const license = await loadLicense();
  const licenseCheck = await checkLicense();
  const licenseTable = new Table({
    head: [chalk5.cyan("License")],
    style: { head: [], border: [] }
  });
  if (license && licenseCheck.valid) {
    licenseTable.push(
      [`Status: ${chalk5.green("Active")}`],
      [`Plan: ${chalk5.cyan(license.plan)}`],
      [`Expires: ${new Date(license.expiresAt).toLocaleDateString()}`],
      [`Machine: ${license.machineId.substring(0, 8)}...`]
    );
  } else {
    licenseTable.push(
      [`Status: ${chalk5.yellow("Not activated")}`],
      [`Run: ${chalk5.cyan("claude-tools activate <KEY>")}`]
    );
  }
  console.log(licenseTable.toString());
  console.log();
  const installation = await checkInstallation({ global: isGlobal });
  const installTable = new Table({
    head: [chalk5.cyan("Installation"), chalk5.cyan("Status")],
    style: { head: [], border: [] }
  });
  installTable.push(
    ["Location", chalk5.cyan(installation.location)],
    [""],
    [
      "Commands",
      installation.components.commands.installed ? chalk5.green(`\u2713 ${installation.components.commands.count} files`) : chalk5.gray("Not installed")
    ],
    [
      "Agents",
      installation.components.agents.installed ? chalk5.green(`\u2713 ${installation.components.agents.count} files`) : chalk5.gray("Not installed")
    ],
    [
      "Hooks",
      installation.components.hooks.installed ? chalk5.green(`\u2713 Configured`) : chalk5.gray("Not installed")
    ],
    [""],
    [
      "GitFlow Config",
      installation.gitflow.configExists ? chalk5.green("\u2713 Configured") : chalk5.gray("Not configured")
    ],
    [
      "Active Plans",
      installation.gitflow.plansCount > 0 ? chalk5.yellow(installation.gitflow.plansCount.toString()) : chalk5.gray("0")
    ]
  );
  console.log(installTable.toString());
  console.log();
  if (options.verbose && installation.components.commands.installed) {
    const commands = await listInstalledCommands({ global: isGlobal });
    const cmdTable = new Table({
      head: [chalk5.cyan("Installed Commands")],
      style: { head: [], border: [] }
    });
    const groups = {};
    for (const cmd of commands) {
      const parts = cmd.split("/");
      const group = parts.length > 1 ? parts[0] : "root";
      if (!groups[group]) groups[group] = [];
      groups[group].push("/" + cmd);
    }
    for (const [group, cmds] of Object.entries(groups)) {
      if (group !== "root") {
        cmdTable.push([chalk5.bold(group)]);
      }
      for (const cmd of cmds.slice(0, 10)) {
        cmdTable.push([`  ${chalk5.cyan(cmd)}`]);
      }
      if (cmds.length > 10) {
        cmdTable.push([chalk5.gray(`  ... and ${cmds.length - 10} more`)]);
      }
    }
    console.log(cmdTable.toString());
    console.log();
  }
  const project = await detectProject();
  const projectTable = new Table({
    head: [chalk5.cyan("Current Project")],
    style: { head: [], border: [] }
  });
  projectTable.push(
    [`Git: ${project.isGitRepo ? chalk5.green("Yes") : chalk5.yellow("No")}`],
    [`Branch: ${project.currentBranch || chalk5.gray("N/A")}`],
    [`.NET: ${project.hasDotNet ? chalk5.green("Yes") : chalk5.gray("No")}`],
    [`EF Core: ${project.hasEfCore ? chalk5.green("Yes") : chalk5.gray("No")}`]
  );
  console.log(projectTable.toString());
  if (!installation.installed) {
    console.log();
    logger.info(`Run ${chalk5.cyan("claude-tools install")} to install commands`);
  }
});

// src/commands/update.ts
import { Command as Command5 } from "commander";
var updateCommand = new Command5("update").description("Update commands to the latest version").action(async () => {
  logger.header("Updating Claude GitFlow Commands");
  const installation = await checkInstallation();
  if (!installation.installed) {
    logger.warning("GitFlow commands are not installed.");
    logger.info("Run: claude-gitflow install");
    return;
  }
  const spinner = logger.spinner("Updating commands...");
  try {
    await updateCommands();
    spinner.succeed("Commands updated successfully!");
  } catch (error) {
    spinner.fail("Update failed");
    logger.error(error instanceof Error ? error.message : "Unknown error");
    process.exit(1);
  }
});

// src/index.ts
import { readFileSync } from "fs";
import { fileURLToPath as fileURLToPath2 } from "url";
import { dirname as dirname2, join as join4 } from "path";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var pkg = JSON.parse(readFileSync(join4(__dirname2, "..", "package.json"), "utf-8"));
var program = new Command6();
program.name("claude-tools").description(chalk6.cyan("Claude Code automation toolkit by Atlashub")).version(pkg.version, "-v, --version");
program.addCommand(installCommand);
program.addCommand(uninstallCommand);
program.addCommand(activateCommand);
program.addCommand(statusCommand);
program.addCommand(updateCommand);
program.action(() => {
  console.log(chalk6.cyan(`
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551                                                           \u2551
\u2551   ${chalk6.bold("Claude Tools")} by Atlashub - v${pkg.version}                  \u2551
\u2551   GitFlow, APEX, EF Core, Prompts & more                  \u2551
\u2551                                                           \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D
`));
  program.outputHelp();
});
program.parse();
//# sourceMappingURL=index.js.map