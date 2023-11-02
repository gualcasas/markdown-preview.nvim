import { relative } from "node:path";
import { GithubPreview } from "./github-preview.ts";
import { onBeforeExit } from "./nvim/on-before-exit.ts";
import { onContentChange } from "./nvim/on-content-change.ts";
import { onCursorMove } from "./nvim/on-cursor-move.ts";
import { type CustomEvents, type WsServerMessage } from "./types.ts";

const app = await GithubPreview.start();

await onBeforeExit(app, async () => {
    app.wsSend({ type: "goodbye" });
    await app.nvim.call("nvim_del_augroup_by_id", [app.augroupId]);
    // We're handling an RPCRequest, which means neovim remains blocked
    // until we return something
    return true;
});

await onCursorMove(
    app,
    async ([buffer, path, cursorLine]: CustomEvents["notifications"]["CursorMove"]) => {
        if (!path) return;
        const relativePath = relative(app.root, path);
        app.nvim.logger?.verbose({ ON_CURSOR_MOVE: { buffer, path: relativePath, cursorLine } });

        const message: WsServerMessage = {
            type: "cursor-move",
            cursorLine: cursorLine,
            currentPath: relativePath,
        };

        if (app.currentPath !== relativePath) {
            message.lines = await app.nvim.call("nvim_buf_get_lines", [buffer, 0, -1, true]);
            app.lines = message.lines;
        }

        app.cursorLine = message.cursorLine;
        app.currentPath = message.currentPath;

        app.wsSend(message);
    },
);

await onContentChange(app, (lines, path) => {
    if (!path) return;
    const relativePath = relative(app.root, path);
    app.nvim.logger?.verbose({ ON_CONTENT_CHANGE: { lines, path: relativePath } });

    const message: WsServerMessage = {
        type: "content-change",
        currentPath: relativePath,
        lines,
    };

    app.currentPath = message.currentPath;
    app.lines = message.lines;

    app.wsSend(message);
});