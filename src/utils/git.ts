/**
 * Git utilities
 * @module utils/git
 */

import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

/**
 * Execute a git command
 */
export async function git(
  command: string,
  cwd?: string
): Promise<{ stdout: string; stderr: string }> {
  return execAsync(`git ${command}`, { cwd });
}

/**
 * Get current branch name
 */
export async function getCurrentBranch(cwd?: string): Promise<string> {
  const { stdout } = await git("branch --show-current", cwd);
  return stdout.trim();
}

/**
 * Check if working directory is clean
 */
export async function isClean(cwd?: string): Promise<boolean> {
  const { stdout } = await git("status --porcelain", cwd);
  return stdout.trim() === "";
}

/**
 * Get commit count between branches
 */
export async function getCommitCount(
  from: string,
  to: string,
  cwd?: string
): Promise<{ ahead: number; behind: number }> {
  try {
    const { stdout } = await git(
      `rev-list --left-right --count ${from}...${to}`,
      cwd
    );
    const [behind, ahead] = stdout.trim().split("\t").map(Number);
    return { ahead, behind };
  } catch {
    return { ahead: 0, behind: 0 };
  }
}

/**
 * Get latest tag
 */
export async function getLatestTag(cwd?: string): Promise<string | null> {
  try {
    const { stdout } = await git("describe --tags --abbrev=0", cwd);
    return stdout.trim();
  } catch {
    return null;
  }
}

/**
 * Check if branch exists
 */
export async function branchExists(
  branch: string,
  cwd?: string
): Promise<boolean> {
  try {
    await git(`rev-parse --verify ${branch}`, cwd);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if remote exists
 */
export async function remoteExists(
  remote: string,
  cwd?: string
): Promise<boolean> {
  try {
    const { stdout } = await git("remote", cwd);
    return stdout.split("\n").includes(remote);
  } catch {
    return false;
  }
}

/**
 * Get remote URL
 */
export async function getRemoteUrl(
  remote: string,
  cwd?: string
): Promise<string | null> {
  try {
    const { stdout } = await git(`remote get-url ${remote}`, cwd);
    return stdout.trim();
  } catch {
    return null;
  }
}

/**
 * Check for ongoing git operations
 */
export async function getOngoingOperation(
  cwd?: string
): Promise<string | null> {
  const operations = [
    { file: ".git/rebase-merge", name: "rebase" },
    { file: ".git/MERGE_HEAD", name: "merge" },
    { file: ".git/CHERRY_PICK_HEAD", name: "cherry-pick" },
    { file: ".git/BISECT_LOG", name: "bisect" },
  ];

  for (const op of operations) {
    try {
      await git(`rev-parse --git-path ${op.file}`, cwd);
      return op.name;
    } catch {
      // Continue checking
    }
  }

  return null;
}
