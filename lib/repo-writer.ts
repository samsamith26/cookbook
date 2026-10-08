import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { Octokit } from "@octokit/rest";
import { RECIPES_FILE } from "@/lib/recipes";
import type { Recipe } from "@/lib/types";

/**
 * All recipe writes go through here.
 *
 * - Production: one atomic commit to GITHUB_REPO@GITHUB_BRANCH via the Git
 *   Data API (blobs -> tree -> commit -> fast-forward the branch ref), which
 *   triggers a Vercel redeploy. Changes go live when that deploy finishes.
 * - Development: writes data/recipes.json and public/images/... directly.
 *
 * The mutation always runs against the *latest* recipes.json on the branch
 * (not the copy bundled into the running deploy), so two saves in quick
 * succession don't clobber each other.
 */

export type FileChange =
  | { path: string; content: Buffer } // repo-relative, e.g. "public/images/recipes/<id>/x.jpg"
  | { path: string; delete: true };

export type Mutation = (recipes: Recipe[]) => { recipes: Recipe[]; files?: FileChange[] };

/** True when saves are committed to GitHub and only appear after a redeploy. */
export function writesAreDeferred(): boolean {
  return process.env.NODE_ENV === "production";
}

export async function commitRecipes(message: string, mutate: Mutation): Promise<void> {
  if (writesAreDeferred()) {
    await commitToGitHub(message, mutate);
  } else {
    await writeLocally(mutate);
  }
}

function serialize(recipes: Recipe[]): string {
  return JSON.stringify(recipes, null, 2) + "\n";
}

async function writeLocally(mutate: Mutation) {
  // Dev-only writes: keep them out of production file tracing.
  const root = /*turbopackIgnore: true*/ process.cwd();
  const file = path.join(/*turbopackIgnore: true*/ root, RECIPES_FILE);
  const current = JSON.parse(await readFile(file, "utf-8")) as Recipe[];
  const { recipes, files = [] } = mutate(current);

  for (const change of files) {
    const dest = path.join(/*turbopackIgnore: true*/ root, change.path);
    if ("delete" in change) {
      await rm(dest, { force: true });
    } else {
      await mkdir(path.dirname(dest), { recursive: true });
      await writeFile(dest, change.content);
    }
  }
  await writeFile(file, serialize(recipes));
}

function githubConfig() {
  const token = process.env.GITHUB_TOKEN;
  const repoFull = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token || !repoFull || !repoFull.includes("/")) {
    throw new Error("GITHUB_TOKEN and GITHUB_REPO (owner/name) must be set to save recipes.");
  }
  const [owner, repo] = repoFull.split("/");
  return { octokit: new Octokit({ auth: token }), owner, repo, branch };
}

const MAX_ATTEMPTS = 3;

async function commitToGitHub(message: string, mutate: Mutation) {
  const { octokit, owner, repo, branch } = githubConfig();
  const ref = `heads/${branch}`;

  for (let attempt = 1; ; attempt++) {
    const { data: refData } = await octokit.rest.git.getRef({ owner, repo, ref });
    const headSha = refData.object.sha;

    const { data: raw } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: RECIPES_FILE,
      ref: headSha,
      mediaType: { format: "raw" },
    });
    const current = JSON.parse(raw as unknown as string) as Recipe[];
    const { recipes, files = [] } = mutate(current);

    const tree = await Promise.all(
      [...files, { path: RECIPES_FILE, content: Buffer.from(serialize(recipes)) }].map(
        async (change) => {
          if ("delete" in change) {
            return { path: change.path, mode: "100644" as const, type: "blob" as const, sha: null };
          }
          const { data: blob } = await octokit.rest.git.createBlob({
            owner,
            repo,
            content: change.content.toString("base64"),
            encoding: "base64",
          });
          return { path: change.path, mode: "100644" as const, type: "blob" as const, sha: blob.sha };
        }
      )
    );

    const { data: headCommit } = await octokit.rest.git.getCommit({ owner, repo, commit_sha: headSha });
    const { data: newTree } = await octokit.rest.git.createTree({
      owner,
      repo,
      base_tree: headCommit.tree.sha,
      tree,
    });
    const { data: commit } = await octokit.rest.git.createCommit({
      owner,
      repo,
      message,
      tree: newTree.sha,
      parents: [headSha],
    });

    try {
      // Non-forced: fails with 422 if the branch moved since we read it.
      await octokit.rest.git.updateRef({ owner, repo, ref, sha: commit.sha, force: false });
      return;
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (status !== 422 || attempt >= MAX_ATTEMPTS) throw err;
      // Someone else committed first — redo the mutation on top of theirs.
    }
  }
}
