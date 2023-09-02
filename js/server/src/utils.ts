// cspell:ignore readdirSync
import { globby } from "globby";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { safeParse, type ObjectSchema } from "valibot";
import type winston from "winston";
import { ENV } from "../../env";

/** Takes a string and wraps it inside a markdown
 * codeblock using file extension as language
 *
 * @example
 * ```
 * textToMarkdown({text, fileExt: "ts"});
 * ```
 */
export function textToMarkdown({
    text,
    fileExt,
}: {
    /** some def */
    text: string;
    fileExt: string;
}) {
    return fileExt === ".md" ? text : "```" + fileExt + `\n${text}`;
}

export function getRepoName(root: string): string {
    const gitConfig = readFileSync(resolve(root, ".git/config")).toString();
    const lines = gitConfig.split("\n");
    let repoName = "no-repo-name";

    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        if (line === '[remote "origin"]') {
            // nextLine = git@github.com:gualcasas/github-preview.nvim.git
            const nextLine = lines[i + 1];
            const repo = nextLine?.split(":")[1]?.slice(0, -4);
            if (repo) repoName = repo;
        }
    }
    return repoName;
}

// TODO This seems convoluted
export async function getEntries(currentAbsPath: string): Promise<string[]> {
    const currentDir = currentAbsPath.endsWith("/") ? currentAbsPath : dirname(currentAbsPath);
    const paths = await globby("*", {
        cwd: currentDir,
        dot: true,
        absolute: true,
        gitignore: true,
        onlyFiles: false,
        objectMode: true,
        markDirectories: true,
    });

    const dirs: string[] = [];
    const files: string[] = [];

    for (const path of paths) {
        if (path.dirent.isDirectory()) {
            if (path.name !== ".git") dirs.push(path.name);
        } else files.push(path.name);
    }

    dirs.sort();
    files.sort();

    return dirs.concat(files);
}

// eslint-disable-next-line
export function devSafeParse(logger: typeof winston, schema: ObjectSchema<any>, data: unknown) {
    // we validate payloads only in dev to avoid affecting performance in prod
    if (!ENV.IS_DEV) return;
    const parsed = safeParse(schema, data);
    if (!parsed.success) logger.error("PARSE ERROR", parsed);
}
