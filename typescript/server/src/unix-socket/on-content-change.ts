import { type Socket } from "bun";
import { ContentChangeSchema, ENV, type ContentChange, type WsServerMessage } from "gpshared";
import { parse } from "valibot";
import { logger } from "../logger";
import { getEntries } from "../utils";
import { EDITOR_EVENTS_TOPIC } from "../web-server";
import { type UnixSocketMetadata } from "./types";

export async function onContentChange(
    unixSocket: Socket<UnixSocketMetadata>,
    contentChange: ContentChange,
) {
    ENV.IS_DEV && parse(ContentChangeSchema, contentChange);
    const browserState = unixSocket.data?.browserState;
    if (!browserState) return;

    browserState.content = contentChange.content;

    const message: WsServerMessage = {
        currentPath: contentChange.abs_path,
        content: contentChange.content,
    };

    const currentPathChanged = browserState.currentPath !== contentChange.abs_path;

    if (currentPathChanged) {
        browserState.currentPath = contentChange.abs_path;
        browserState.entries = await getEntries({
            root: browserState.root,
            currentPath: contentChange.abs_path,
        });

        message.entries = browserState.entries;
    }

    logger.verbose("content-change", message);
    unixSocket.data?.webServer?.publish(EDITOR_EVENTS_TOPIC, JSON.stringify(message));
}